"""
Reviews — AI trigger endpoints only.

List/read operations are handled by the dashboard directly via Supabase (RLS).
FastAPI's role here: trigger expensive Claude analysis and enqueue Celery batch jobs.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_supabase, get_supabase_admin
from app.core.security import get_current_user
from app.services.ai_service import analyze_review
from app.models.review import ReviewAnalysis
from app.workers.tasks.review_tasks import analyze_seller_reviews

router = APIRouter()


@router.post("/{review_id}/analyze", response_model=ReviewAnalysis)
def analyze_single_review(
    review_id: str,
    seller_id: str = Depends(get_current_user),
):
    """Run Claude analysis on one review and persist the result."""
    db = get_supabase()
    review = (
        db.table("reviews")
        .select("*")
        .eq("id", review_id)
        .eq("seller_id", seller_id)
        .single()
        .execute()
    )
    if not review.data:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")

    r = review.data
    analysis = analyze_review(
        comment=r["comment"],
        rating=r["rating"],
        product_name=r["product_name"],
    )

    get_supabase_admin().table("reviews").update({
        "sentiment": analysis.sentiment,
        "is_urgent": analysis.is_urgent,
        "ai_summary": analysis.summary,
        "suggested_reply": analysis.suggested_reply,
    }).eq("id", review_id).execute()

    return analysis


@router.post("/batch-analyze")
def enqueue_batch_analysis(seller_id: str = Depends(get_current_user)):
    """Enqueue a Celery task to process all unanalyzed reviews for this seller."""
    analyze_seller_reviews.delay(seller_id)
    return {"status": "queued"}
