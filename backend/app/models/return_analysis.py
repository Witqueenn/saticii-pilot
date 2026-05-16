from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class ReturnReason(str, Enum):
    size_mismatch = "beden_uyumsuzlugu"
    color_difference = "renk_farki"
    quality_issue = "kalite_sorunu"
    wrong_product = "yanlis_urun"
    damaged = "hasarli"
    other = "diger"


class ReturnRecord(BaseModel):
    id: str
    seller_id: str
    marketplace: str
    product_id: str
    product_name: str
    reason: ReturnReason
    customer_comment: Optional[str] = None
    returned_at: datetime


class ReturnPattern(BaseModel):
    product_id: str
    product_name: str
    total_returns: int
    dominant_reason: ReturnReason
    reason_counts: dict[str, int]
    recommendation: str
    urgency: str  # "yuksek" | "orta" | "dusuk"


class ReturnReport(BaseModel):
    seller_id: str
    period_start: datetime
    period_end: datetime
    total_returns: int
    patterns: list[ReturnPattern]
    top_recommendation: str
    generated_at: datetime
