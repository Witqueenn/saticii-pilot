from fastapi import APIRouter, Depends
from app.core.database import get_supabase
from app.core.security import get_current_user

router = APIRouter()


@router.get("/report")
def get_return_report(seller_id: str = Depends(get_current_user)):
    db = get_supabase()
    report = (
        db.table("return_reports")
        .select("*")
        .eq("seller_id", seller_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not report.data:
        return {"message": "Henüz rapor yok. İlk analiz yakında oluşturulacak."}
    return report.data[0]


@router.get("/")
def list_returns(
    limit: int = 100,
    seller_id: str = Depends(get_current_user),
):
    db = get_supabase()
    result = (
        db.table("returns")
        .select("*")
        .eq("seller_id", seller_id)
        .order("returned_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data
