from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class PlanType(str, Enum):
    temel = "temel"
    profesyonel = "profesyonel"
    kurumsal = "kurumsal"


class MarketplaceType(str, Enum):
    trendyol = "trendyol"
    hepsiburada = "hepsiburada"
    n11 = "n11"


class SellerBase(BaseModel):
    email: EmailStr
    shop_name: str
    plan: PlanType = PlanType.temel


class SellerCreate(SellerBase):
    password: str


class Seller(SellerBase):
    id: str
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class MarketplaceCredential(BaseModel):
    seller_id: str
    marketplace: MarketplaceType
    api_key: str
    api_secret: str
    supplier_id: Optional[str] = None
