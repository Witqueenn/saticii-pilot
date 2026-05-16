from fastapi import APIRouter, HTTPException
from app.core.database import get_supabase
from app.services.ai_service import analyze_product_description
from app.models.product import ProductDescriptionAnalysis

router = APIRouter()


@router.get("/")
def list_products(seller_id: str, low_score_only: bool = False):
    db = get_supabase()
    query = db.table("products").select("*").eq("seller_id", seller_id)
    if low_score_only:
        query = query.lt("description_score", 60)
    result = query.order("description_score").limit(50).execute()
    return result.data


@router.post("/{product_id}/analyze", response_model=ProductDescriptionAnalysis)
def analyze_product(product_id: str):
    db = get_supabase()
    product = db.table("products").select("*").eq("id", product_id).single().execute()
    if not product.data:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    p = product.data
    analysis = analyze_product_description(
        product_name=p["name"],
        category=p["category"],
        current_description=p.get("description", ""),
    )

    db.table("products").update({
        "description_score": analysis.description_score,
        "seo_score": analysis.seo_score,
        "ai_suggestions": analysis.suggestions,
        "improved_description": analysis.improved_description,
    }).eq("id", product_id).execute()

    return analysis
