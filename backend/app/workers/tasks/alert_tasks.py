"""
Stok ve iade oranı alarm görevleri.

Bir ürün eşiğin altına düşünce veya iade oranı %20'yi geçince
Next.js /api/alerts endpoint'ine POST atar → Resend ile satıcıya e-posta.
"""
import logging

import httpx
import sentry_sdk

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import get_supabase_admin

logger = logging.getLogger(__name__)

# Stok eşiği: bu sayının altına düşen ürünler alarm tetikler
LOW_STOCK_THRESHOLD = 5

# İade oranı eşiği (yüzde)
HIGH_RETURN_RATE_THRESHOLD = 20


def _post_alert(payload: dict) -> None:
    """Next.js /api/alerts'e güvenli POST at."""
    if not settings.notify_secret or not settings.app_url:
        logger.warning("notify_secret veya app_url eksik — alert atlanıyor")
        return
    try:
        resp = httpx.post(
            f"{settings.app_url}/api/alerts",
            json=payload,
            headers={"x-webhook-secret": settings.notify_secret},
            timeout=15,
        )
        resp.raise_for_status()
    except Exception:
        logger.exception("Alert POST başarısız: payload=%s", payload)
        sentry_sdk.capture_exception()


@celery_app.task(name="app.workers.tasks.alert_tasks.check_low_stock")
def check_low_stock():
    """notify_low_stock açık satıcıların düşük stok ürünlerini kontrol et."""
    db = get_supabase_admin()

    # notify_low_stock etkin satıcıların ID'lerini al
    sellers_res = (
        db.table("sellers")
        .select("id")
        .eq("is_active", True)
        .eq("notify_low_stock", True)
        .execute()
    )
    seller_ids = [s["id"] for s in sellers_res.data]
    if not seller_ids:
        return {"status": "no_sellers"}

    # Bu satıcılara ait düşük stoklu ürünleri bul
    products_res = (
        db.table("products")
        .select("id, seller_id, name, stock, marketplace_product_id")
        .in_("seller_id", seller_ids)
        .lte("stock", LOW_STOCK_THRESHOLD)
        .gt("stock", 0)
        .execute()
    )

    if not products_res.data:
        return {"status": "ok", "alerts_sent": 0}

    # seller_id → [products] haritası kur
    by_seller: dict[str, list] = {}
    for p in products_res.data:
        by_seller.setdefault(p["seller_id"], []).append(p)

    alerts_sent = 0
    for seller_id, products in by_seller.items():
        _post_alert({
            "type": "low_stock",
            "seller_id": seller_id,
            "products": [
                {"name": p["name"], "stock": p["stock"]}
                for p in products[:10]
            ],
        })
        alerts_sent += len(products)
        logger.info("Stok alarmı gönderildi: seller_id=%s product_count=%d", seller_id, len(products))

    return {"status": "ok", "alerts_sent": alerts_sent}


@celery_app.task(name="app.workers.tasks.alert_tasks.check_high_return_rate")
def check_high_return_rate():
    """İade oranı yüksek ürünleri kontrol et (return_rate > %20)."""
    db = get_supabase_admin()

    # notify_new_returns etkin satıcıları al
    sellers_res = (
        db.table("sellers")
        .select("id")
        .eq("is_active", True)
        .eq("notify_new_returns", True)
        .execute()
    )
    seller_ids = [s["id"] for s in sellers_res.data]
    if not seller_ids:
        return {"status": "no_sellers"}

    products_res = (
        db.table("products")
        .select("id, seller_id, name, return_rate")
        .in_("seller_id", seller_ids)
        .gt("return_rate", HIGH_RETURN_RATE_THRESHOLD)
        .execute()
    )

    if not products_res.data:
        return {"status": "ok", "alerts_sent": 0}

    by_seller: dict[str, list] = {}
    for p in products_res.data:
        by_seller.setdefault(p["seller_id"], []).append(p)

    alerts_sent = 0
    for seller_id, products in by_seller.items():
        _post_alert({
            "type": "high_return_rate",
            "seller_id": seller_id,
            "products": [
                {"name": p["name"], "return_rate": p["return_rate"]}
                for p in products[:10]
            ],
        })
        alerts_sent += len(products)
        logger.info("İade alarmı gönderildi: seller_id=%s product_count=%d", seller_id, len(products))

    return {"status": "ok", "alerts_sent": alerts_sent}
