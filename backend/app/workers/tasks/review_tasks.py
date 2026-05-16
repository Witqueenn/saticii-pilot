from app.workers.celery_app import celery_app
from app.core.database import get_supabase_admin
from app.services.ai_service import analyze_review


@celery_app.task(name="app.workers.tasks.review_tasks.analyze_all_sellers_reviews")
def analyze_all_sellers_reviews():
    """Tüm aktif satıcıların bekleyen yorumlarını toplu analiz et."""
    db = get_supabase_admin()
    sellers = db.table("sellers").select("id").eq("is_active", True).execute()

    for seller in sellers.data:
        analyze_seller_reviews.delay(seller["id"])


@celery_app.task(name="app.workers.tasks.review_tasks.analyze_seller_reviews")
def analyze_seller_reviews(seller_id: str):
    """Tek bir satıcının analiz edilmemiş yorumlarını işle."""
    db = get_supabase_admin()

    reviews = (
        db.table("reviews")
        .select("*")
        .eq("seller_id", seller_id)
        .is_("sentiment", "null")
        .limit(100)
        .execute()
    )

    for review in reviews.data:
        try:
            analysis = analyze_review(
                comment=review["comment"],
                rating=review["rating"],
                product_name=review["product_name"],
            )
            db.table("reviews").update({
                "sentiment": analysis.sentiment,
                "is_urgent": analysis.is_urgent,
                "ai_summary": analysis.summary,
                "suggested_reply": analysis.suggested_reply,
            }).eq("id", review["id"]).execute()
        except Exception:
            pass
