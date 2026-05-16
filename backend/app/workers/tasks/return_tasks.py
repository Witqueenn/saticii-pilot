from collections import Counter
from app.workers.celery_app import celery_app
from app.core.database import get_supabase_admin


RECOMMENDATION_MAP = {
    "beden_uyumsuzlugu": "Ürünün ölçü tablosunu güncelleyin ve beden karşılaştırma rehberi ekleyin.",
    "renk_farki": "Ürün fotoğraflarını gün ışığında yeniden çekin; açıklamada renk nüanslarını belirtin.",
    "kalite_sorunu": "Ürün açıklamasında malzeme ve üretim kalitesini detaylandırın.",
    "yanlis_urun": "Paketleme sürecinizi kontrol edin; barkod doğrulaması ekleyin.",
    "hasarli": "Kargo paketleme yönteminizi iyileştirin; koruyucu malzeme kullanın.",
    "diger": "Müşteri yorumlarını inceleyin ve sık sorulan soruları açıklamaya ekleyin.",
}


@celery_app.task(name="app.workers.tasks.return_tasks.generate_return_reports")
def generate_return_reports():
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()
    for seller in sellers.data:
        generate_seller_return_report.delay(seller["id"])


@celery_app.task(name="app.workers.tasks.return_tasks.generate_seller_return_report")
def generate_seller_return_report(seller_id: str):
    db = get_supabase_admin()

    returns = (
        db.table("returns")
        .select("*")
        .eq("seller_id", seller_id)
        .execute()
    )

    if not returns.data:
        return

    by_product: dict[str, list] = {}
    for r in returns.data:
        pid = r["product_id"]
        by_product.setdefault(pid, []).append(r)

    patterns = []
    for product_id, records in by_product.items():
        reasons = [r["reason"] for r in records]
        counts = Counter(reasons)
        dominant = counts.most_common(1)[0][0]
        urgency = "yuksek" if len(records) >= 5 else "orta" if len(records) >= 2 else "dusuk"

        patterns.append({
            "product_id": product_id,
            "product_name": records[0]["product_name"],
            "total_returns": len(records),
            "dominant_reason": dominant,
            "reason_counts": dict(counts),
            "recommendation": RECOMMENDATION_MAP.get(dominant, RECOMMENDATION_MAP["diger"]),
            "urgency": urgency,
        })

    db.table("return_reports").upsert({
        "seller_id": seller_id,
        "patterns": patterns,
        "total_returns": len(returns.data),
    }).execute()
