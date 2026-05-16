from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_supabase
from app.services.ai_service import analyze_review
from app.models.review import Review, ReviewAnalysis

router = APIRouter()


@router.get("/", response_model=list[dict])
def list_reviews(
    seller_id: str,
    urgent_only: bool = False,
    limit: int = 50,
):
    db = get_supabase()
    query = db.table("reviews").select("*").eq("seller_id", seller_id)
    if urgent_only:
        query = query.eq("is_urgent", True)
    result = query.order("reviewed_at", desc=True).limit(limit).execute()
    return result.data


@router.post("/{review_id}/analyze", response_model=ReviewAnalysis)
def analyze_single_review(review_id: str):
    db = get_supabase()
    review = db.table("reviews").select("*").eq("id", review_id).single().execute()
    if not review.data:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")

    r = review.data
    analysis = analyze_review(
        comment=r["comment"],
        rating=r["rating"],
        product_name=r["product_name"],
    )

    db.table("reviews").update({
        "sentiment": analysis.sentiment,
        "is_urgent": analysis.is_urgent,
        "ai_summary": analysis.summary,
        "suggested_reply": analysis.suggested_reply,
    }).eq("id", review_id).execute()

    return analysis


@router.patch("/{review_id}/reply")
def mark_as_replied(review_id: str):
    db = get_supabase()
    db.table("reviews").update({"is_replied": True}).eq("id", review_id).execute()
    return {"status": "ok"}


@router.get("/daily-summary")
def daily_summary(seller_id: str):
    db = get_supabase()
    reviews = (
        db.table("reviews")
        .select("sentiment, is_urgent, is_replied")
        .eq("seller_id", seller_id)
        .execute()
    )
    data = reviews.data
    return {
        "total": len(data),
        "urgent": sum(1 for r in data if r["is_urgent"]),
        "pending_reply": sum(1 for r in data if not r["is_replied"]),
        "sentiment_breakdown": {
            "olumlu": sum(1 for r in data if r["sentiment"] == "olumlu"),
            "notr": sum(1 for r in data if r["sentiment"] == "notr"),
            "olumsuz": sum(1 for r in data if r["sentiment"] == "olumsuz"),
            "acil": sum(1 for r in data if r["sentiment"] == "acil"),
        },
    }
