from fastapi import APIRouter
from app.api.v1.endpoints import reviews, products, returns

api_router = APIRouter()

api_router.include_router(reviews.router, prefix="/reviews", tags=["Yorumlar"])
api_router.include_router(products.router, prefix="/products", tags=["Ürünler"])
api_router.include_router(returns.router, prefix="/returns", tags=["İadeler"])
