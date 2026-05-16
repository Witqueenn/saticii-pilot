from app.workers.celery_app import celery_app
from app.core.database import get_supabase_admin
from app.services.ai_service import analyze_product_description


@celery_app.task(name="app.workers.tasks.product_tasks.analyze_all_products")
def analyze_all_products():
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()
    for seller in sellers.data:
        analyze_seller_products.delay(seller["id"])


@celery_app.task(name="app.workers.tasks.product_tasks.analyze_seller_products")
def analyze_seller_products(seller_id: str):
    db = get_supabase_admin()

    # Sadece henüz analiz edilmemiş veya puanı düşük ürünleri işle
    products = (
        db.table("products")
        .select("*")
        .eq("seller_id", seller_id)
        .or_("description_score.is.null,description_score.lt.60")
        .limit(20)
        .execute()
    )

    for product in products.data:
        try:
            analysis = analyze_product_description(
                product_name=product["name"],
                category=product["category"],
                current_description=product.get("description", ""),
            )
            db.table("products").update({
                "description_score": analysis.description_score,
                "seo_score": analysis.seo_score,
                "ai_suggestions": analysis.suggestions,
                "improved_description": analysis.improved_description,
            }).eq("id", product["id"]).execute()
        except Exception:
            pass
