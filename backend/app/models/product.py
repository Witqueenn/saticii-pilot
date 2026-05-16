from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    marketplace: str
    marketplace_product_id: str
    name: str
    category: str
    description: Optional[str] = None
    price: float
    stock: int
    return_rate: Optional[float] = None


class Product(ProductBase):
    id: str
    seller_id: str
    description_score: Optional[int] = None     # 0-100
    seo_score: Optional[int] = None             # 0-100
    ai_suggestions: Optional[list[str]] = None
    improved_description: Optional[str] = None
    updated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ProductDescriptionAnalysis(BaseModel):
    description_score: int
    seo_score: int
    missing_fields: list[str]
    suggestions: list[str]
    improved_description: str
