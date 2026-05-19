"""
Products — AI trigger endpoints only.

List/read operations are handled by the dashboard directly via Supabase (RLS).
FastAPI's role here: trigger Claude product-description analysis and enqueue
Celery batch jobs for low-scoring products.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_supabase, get_supabase_admin
from app.core.security import get_current_user
from app.services.ai_service import analyze_product_description
from app.models.product import ProductDescriptionAnalysis
from app.workers.tasks.product_tasks import analyze_seller_products

router = APIRouter()


@router.post("/{product_id}/analyze", response_model=ProductDescriptionAnalysis)
def analyze_product(
    product_id: str,
    seller_id: str = Depends(get_current_user),
):
    """Run Claude analysis on one product description and persist scores + suggestions."""
    db = get_supabase()
    product = (
        db.table("products")
        .select("*")
        .eq("id", product_id)
        .eq("seller_id", seller_id)
        .single()
        .execute()
    )
    if not product.data:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    p = product.data
    analysis = analyze_product_description(
        product_name=p["name"],
        category=p["category"],
        current_description=p.get("description", ""),
    )

    get_supabase_admin().table("products").update({
        "description_score": analysis.description_score,
        "seo_score": analysis.seo_score,
        "ai_suggestions": analysis.suggestions,
        "improved_description": analysis.improved_description,
    }).eq("id", product_id).execute()

    return analysis


@router.post("/batch-analyze")
def enqueue_batch_analysis(seller_id: str = Depends(get_current_user)):
    """Enqueue a Celery task to analyze all low-scoring products for this seller."""
    analyze_seller_products.delay(seller_id)
    return {"status": "queued"}
