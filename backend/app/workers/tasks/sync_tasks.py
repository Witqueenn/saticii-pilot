"""
Trendyol veri senkronizasyonu.

Şema bağımlılıkları:
  migrations/006_review_sync.sql — reviews dedup index
  migrations/008_returns_sync.sql — returns.marketplace_return_id + dedup index
"""
import logging
from datetime import datetime, timedelta, timezone

import sentry_sdk

from app.workers.celery_app import celery_app
from app.core.database import get_supabase_admin
from app.services.credential_service import get_trendyol_credentials
from app.services.trendyol_service import TrendyolClient

logger = logging.getLogger(__name__)

# Sync window: last N days (avoids fetching entire history each run)
SYNC_DAYS = 30

# Trendyol claim reason codes → DB enum
_RETURN_REASON_MAP: dict[str, str] = {
    "SIZE_INCOMPATIBILITY":         "beden_uyumsuzlugu",
    "BEDEN_UYUMSUZLUGU":            "beden_uyumsuzlugu",
    "COLOR_DIFFERENCE":             "renk_farki",
    "RENK_FARKI":                   "renk_farki",
    "DOES_NOT_MATCH_DESCRIPTION":   "renk_farki",
    "QUALITY_ISSUE":                "kalite_sorunu",
    "KALITE_SORUNU":                "kalite_sorunu",
    "WRONG_DELIVERY":               "yanlis_urun",
    "YANLIS_URUN":                  "yanlis_urun",
    "DEFECTIVE":                    "hasarli",
    "DAMAGED":                      "hasarli",
    "HASARLI":                      "hasarli",
}


def _now_ms() -> int:
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def _days_ago_ms(days: int) -> int:
    dt = datetime.now(timezone.utc) - timedelta(days=days)
    return int(dt.timestamp() * 1000)


def _parse_review_date(raw: str | None) -> str:
    """Convert Trendyol date strings to ISO-8601 for Supabase timestamptz."""
    if not raw:
        return datetime.now(timezone.utc).isoformat()
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            continue
    return datetime.now(timezone.utc).isoformat()


@celery_app.task(name="app.workers.tasks.sync_tasks.sync_all_sellers_trendyol")
def sync_all_sellers_trendyol():
    """Tüm aktif satıcılar için Trendyol yorum senkronizasyonunu sıraya al."""
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()
    for seller in sellers.data:
        sync_seller_trendyol_reviews.delay(seller["id"])


@celery_app.task(name="app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_products")
def sync_all_sellers_trendyol_products():
    """Tüm aktif satıcılar için Trendyol ürün senkronizasyonunu sıraya al."""
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()
    for seller in sellers.data:
        sync_seller_trendyol_products.delay(seller["id"])


@celery_app.task(name="app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_returns")
def sync_all_sellers_trendyol_returns():
    """Tüm aktif satıcılar için Trendyol iade senkronizasyonunu sıraya al."""
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()
    for seller in sellers.data:
        sync_seller_trendyol_returns.delay(seller["id"])


@celery_app.task(
    name="app.workers.tasks.sync_tasks.sync_seller_trendyol_reviews",
    max_retries=3,
    default_retry_delay=60,
)
def sync_seller_trendyol_reviews(seller_id: str):
    """Tek satıcı için Trendyol yorumlarını çek ve DB'ye kaydet."""
    creds = get_trendyol_credentials(seller_id)
    if not creds:
        logger.info("Trendyol credentials bulunamadı: seller_id=%s", seller_id)
        return {"status": "no_credentials"}

    if not creds.get("supplier_id"):
        logger.warning("supplier_id eksik: seller_id=%s", seller_id)
        return {"status": "missing_supplier_id"}

    client = TrendyolClient(
        api_key=creds["api_key"],
        api_secret=creds["api_secret"],
        supplier_id=creds["supplier_id"],
    )
    db = get_supabase_admin()

    start_ms = _days_ago_ms(SYNC_DAYS)
    end_ms = _now_ms()
    page = 0
    total_synced = 0

    while True:
        try:
            data = client.get_reviews(page=page, size=100, start_date=start_ms, end_date=end_ms)
        except Exception:
            logger.exception("Trendyol reviews API hatası: seller_id=%s page=%d", seller_id, page)
            sentry_sdk.capture_exception()
            break

        items = data.get("content", [])
        if not items:
            break

        rows = []
        for r in items:
            review_id = str(r.get("id", ""))
            rows.append({
                "seller_id": seller_id,
                "marketplace": "trendyol",
                "marketplace_review_id": review_id,
                "product_id": str(r.get("productId", r.get("productBarcode", ""))),
                "product_name": r.get("productName") or r.get("productModelName") or "",
                "rating": int(r.get("rate", r.get("starCount", 3))),
                "comment": r.get("text") or r.get("comment") or "",
                "customer_name": r.get("sellerName") or r.get("userFullName") or "",
                "is_replied": bool(r.get("sellerComment") or r.get("reply")),
                "reviewed_at": _parse_review_date(r.get("reviewDate") or r.get("creationDate")),
            })

        if rows:
            db.table("reviews").upsert(
                rows,
                on_conflict="seller_id,marketplace,marketplace_review_id",
                ignore_duplicates=False,
            ).execute()
            total_synced += len(rows)

        # Trendyol paginates with totalPages or by empty content
        total_pages = data.get("totalPages", 1)
        page += 1
        if page >= total_pages:
            break

    logger.info("Trendyol sync tamamlandı: seller_id=%s synced=%d", seller_id, total_synced)
    return {"status": "ok", "synced": total_synced}


@celery_app.task(
    name="app.workers.tasks.sync_tasks.sync_seller_trendyol_products",
    max_retries=3,
    default_retry_delay=60,
)
def sync_seller_trendyol_products(seller_id: str):
    """Tek satıcı için Trendyol ürünlerini çek ve DB'ye kaydet."""
    creds = get_trendyol_credentials(seller_id)
    if not creds:
        logger.info("Trendyol credentials bulunamadı: seller_id=%s", seller_id)
        return {"status": "no_credentials"}
    if not creds.get("supplier_id"):
        logger.warning("supplier_id eksik: seller_id=%s", seller_id)
        return {"status": "missing_supplier_id"}

    client = TrendyolClient(
        api_key=creds["api_key"],
        api_secret=creds["api_secret"],
        supplier_id=creds["supplier_id"],
    )
    db = get_supabase_admin()

    page = 0
    total_synced = 0

    while True:
        try:
            data = client.get_products(page=page, size=100)
        except Exception:
            logger.exception("Trendyol products API hatası: seller_id=%s page=%d", seller_id, page)
            sentry_sdk.capture_exception()
            break

        items = data.get("content", [])
        if not items:
            break

        rows = []
        for p in items:
            product_id = str(p.get("id") or p.get("productMainId") or "")
            rows.append({
                "seller_id": seller_id,
                "marketplace": "trendyol",
                "marketplace_product_id": product_id,
                "name": p.get("title") or p.get("name") or "",
                "category": p.get("categoryName") or "",
                "description": p.get("description") or None,
                "price": p.get("salePrice") or p.get("listPrice") or None,
                "stock": int(p.get("quantity") or 0),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })

        if rows:
            db.table("products").upsert(
                rows,
                on_conflict="seller_id,marketplace,marketplace_product_id",
                ignore_duplicates=False,
            ).execute()
            total_synced += len(rows)

        total_pages = data.get("totalPages", 1)
        page += 1
        if page >= total_pages:
            break

    logger.info("Trendyol products sync tamamlandı: seller_id=%s synced=%d", seller_id, total_synced)
    return {"status": "ok", "synced": total_synced}


@celery_app.task(
    name="app.workers.tasks.sync_tasks.sync_seller_trendyol_returns",
    max_retries=3,
    default_retry_delay=60,
)
def sync_seller_trendyol_returns(seller_id: str):
    """Tek satıcı için Trendyol iade taleplerini çek ve DB'ye kaydet."""
    creds = get_trendyol_credentials(seller_id)
    if not creds:
        logger.info("Trendyol credentials bulunamadı: seller_id=%s", seller_id)
        return {"status": "no_credentials"}
    if not creds.get("supplier_id"):
        logger.warning("supplier_id eksik: seller_id=%s", seller_id)
        return {"status": "missing_supplier_id"}

    client = TrendyolClient(
        api_key=creds["api_key"],
        api_secret=creds["api_secret"],
        supplier_id=creds["supplier_id"],
    )
    db = get_supabase_admin()

    page = 0
    total_synced = 0

    while True:
        try:
            data = client.get_returns(page=page, size=100)
        except Exception:
            logger.exception("Trendyol returns API hatası: seller_id=%s page=%d", seller_id, page)
            sentry_sdk.capture_exception()
            break

        items = data.get("content", [])
        if not items:
            break

        rows = []
        for r in items:
            return_id = str(r.get("id") or r.get("claimId") or "")
            raw_reason = str(r.get("claimReason") or r.get("returnReason") or "").upper()
            reason = _RETURN_REASON_MAP.get(raw_reason, "diger")

            # Customer comment: combine name + reason text if available
            reason_text = r.get("claimReasonText") or r.get("reasonText") or ""
            customer_name = (
                (r.get("customerFirstName") or "") + " " + (r.get("customerLastName") or "")
            ).strip()
            comment = reason_text or (customer_name if customer_name else None)

            returned_at = _parse_review_date(r.get("createdDate") or r.get("returnDate"))

            rows.append({
                "seller_id": seller_id,
                "marketplace": "trendyol",
                "marketplace_return_id": return_id,
                "product_id": str(r.get("productId") or r.get("barcode") or ""),
                "product_name": r.get("productName") or r.get("productModelName") or "",
                "reason": reason,
                "customer_comment": comment,
                "returned_at": returned_at,
            })

        if rows:
            db.table("returns").upsert(
                rows,
                on_conflict="seller_id,marketplace,marketplace_return_id",
                ignore_duplicates=False,
            ).execute()
            total_synced += len(rows)

        total_pages = data.get("totalPages", 1)
        page += 1
        if page >= total_pages:
            break

    logger.info("Trendyol returns sync tamamlandı: seller_id=%s synced=%d", seller_id, total_synced)
    return {"status": "ok", "synced": total_synced}


@celery_app.task(name="app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_questions")
def sync_all_sellers_trendyol_questions():
    """Tüm aktif satıcılar için Trendyol soru senkronizasyonunu sıraya al."""
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()
    for seller in sellers.data:
        sync_seller_trendyol_questions.delay(seller["id"])


@celery_app.task(
    name="app.workers.tasks.sync_tasks.sync_seller_trendyol_questions",
    max_retries=3,
    default_retry_delay=60,
)
def sync_seller_trendyol_questions(seller_id: str):
    """Tek satıcı için Trendyol müşteri sorularını çek ve DB'ye kaydet."""
    creds = get_trendyol_credentials(seller_id)
    if not creds:
        logger.info("Trendyol credentials bulunamadı: seller_id=%s", seller_id)
        return {"status": "no_credentials"}
    if not creds.get("supplier_id"):
        logger.warning("supplier_id eksik: seller_id=%s", seller_id)
        return {"status": "missing_supplier_id"}

    client = TrendyolClient(
        api_key=creds["api_key"],
        api_secret=creds["api_secret"],
        supplier_id=creds["supplier_id"],
    )
    db = get_supabase_admin()

    page = 0
    total_synced = 0

    while True:
        try:
            data = client.get_all_questions(page=page, size=100)
        except Exception:
            logger.exception("Trendyol questions API hatası: seller_id=%s page=%d", seller_id, page)
            sentry_sdk.capture_exception()
            break

        items = data.get("content", [])
        if not items:
            break

        rows = []
        for q in items:
            question_id = str(q.get("id") or q.get("questionId") or "")
            question_text = (
                q.get("text") or q.get("questionText") or
                q.get("publicQuestion") or q.get("question") or ""
            )
            status = str(q.get("status") or "").upper()
            is_answered = status == "ANSWERED" or bool(q.get("answers"))

            asked_at = _parse_review_date(q.get("createdDate") or q.get("askDate"))

            rows.append({
                "seller_id": seller_id,
                "marketplace": "trendyol",
                "marketplace_question_id": question_id,
                "product_id": str(q.get("productId") or q.get("productContentId") or ""),
                "product_name": q.get("productName") or q.get("productModelName") or "",
                "question": question_text,
                "is_answered": is_answered,
                "asked_at": asked_at,
            })

        if rows:
            db.table("questions").upsert(
                rows,
                on_conflict="seller_id,marketplace,marketplace_question_id",
                ignore_duplicates=False,
            ).execute()
            total_synced += len(rows)

        total_pages = data.get("totalPages", 1)
        page += 1
        if page >= total_pages:
            break

    logger.info("Trendyol questions sync tamamlandı: seller_id=%s synced=%d", seller_id, total_synced)
    return {"status": "ok", "synced": total_synced}


@celery_app.task(name="app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_orders")
def sync_all_sellers_trendyol_orders():
    """Tüm aktif satıcılar için Trendyol sipariş senkronizasyonunu sıraya al."""
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()
    for seller in sellers.data:
        sync_seller_trendyol_orders.delay(seller["id"])


@celery_app.task(
    name="app.workers.tasks.sync_tasks.sync_seller_trendyol_orders",
    max_retries=3,
    default_retry_delay=60,
)
def sync_seller_trendyol_orders(seller_id: str):
    """Tek satıcı için Trendyol siparişlerini çek ve DB'ye kaydet (son 30 gün)."""
    creds = get_trendyol_credentials(seller_id)
    if not creds:
        logger.info("Trendyol credentials bulunamadı: seller_id=%s", seller_id)
        return {"status": "no_credentials"}
    if not creds.get("supplier_id"):
        logger.warning("supplier_id eksik: seller_id=%s", seller_id)
        return {"status": "missing_supplier_id"}

    client = TrendyolClient(
        api_key=creds["api_key"],
        api_secret=creds["api_secret"],
        supplier_id=creds["supplier_id"],
    )
    db = get_supabase_admin()

    start_ms = _days_ago_ms(SYNC_DAYS)
    end_ms = _now_ms()
    page = 0
    total_synced = 0

    while True:
        try:
            data = client.get_orders(start_date=start_ms, end_date=end_ms, page=page)
        except Exception:
            logger.exception("Trendyol orders API hatası: seller_id=%s page=%d", seller_id, page)
            sentry_sdk.capture_exception()
            break

        items = data.get("content", [])
        if not items:
            break

        rows = []
        for o in items:
            order_id = str(o.get("orderId") or o.get("id") or "")
            if not order_id:
                continue

            lines = o.get("lines") or []
            line_items = [
                {
                    "product_id": str(ln.get("productId") or ""),
                    "product_name": ln.get("productName") or "",
                    "barcode": ln.get("barcode") or "",
                    "quantity": int(ln.get("quantity") or 1),
                    "price": float(ln.get("price") or 0),
                }
                for ln in lines
            ]

            raw_date = o.get("orderDate")
            if raw_date and isinstance(raw_date, (int, float)):
                ordered_at = datetime.fromtimestamp(raw_date / 1000, tz=timezone.utc).isoformat()
            else:
                ordered_at = _parse_review_date(raw_date)

            rows.append({
                "seller_id": seller_id,
                "marketplace": "trendyol",
                "marketplace_order_id": order_id,
                "status": str(o.get("status") or "").lower(),
                "total_price": float(o.get("totalPrice") or o.get("grossAmount") or 0) or None,
                "line_items": line_items,
                "ordered_at": ordered_at,
            })

        if rows:
            db.table("orders").upsert(
                rows,
                on_conflict="seller_id,marketplace,marketplace_order_id",
                ignore_duplicates=False,
            ).execute()
            total_synced += len(rows)

        total_pages = data.get("totalPages", 1)
        page += 1
        if page >= total_pages:
            break

    logger.info("Trendyol orders sync tamamlandı: seller_id=%s synced=%d", seller_id, total_synced)
    return {"status": "ok", "synced": total_synced}
