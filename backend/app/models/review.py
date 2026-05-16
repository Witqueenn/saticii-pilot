from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class Sentiment(str, Enum):
    positive = "olumlu"
    neutral = "notr"
    negative = "olumsuz"
    urgent = "acil"


class ReviewBase(BaseModel):
    marketplace: str
    product_id: str
    product_name: str
    rating: int  # 1-5
    comment: str
    customer_name: Optional[str] = None
    reviewed_at: datetime


class Review(ReviewBase):
    id: str
    seller_id: str
    sentiment: Optional[Sentiment] = None
    ai_summary: Optional[str] = None
    suggested_reply: Optional[str] = None
    is_replied: bool = False
    is_urgent: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewAnalysis(BaseModel):
    sentiment: Sentiment
    is_urgent: bool
    summary: str
    suggested_reply: str
    keywords: list[str]
