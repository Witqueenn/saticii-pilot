import httpx
from typing import Optional
from app.core.config import settings


class TrendyolClient:
    """
    Trendyol Satıcı API istemcisi.
    Dokümantasyon: https://developers.trendyol.com
    Not: Trendyol, Haziran 2026'da Product V2 API'ye geçti; V1 Ağustos 2026'da kapanıyor.
    """

    BASE_URL = "https://api.trendyol.com/sapigw"

    def __init__(self, api_key: str, api_secret: str, supplier_id: str):
        self.supplier_id = supplier_id
        self.auth = (api_key, api_secret)
        self.headers = {
            "User-Agent": f"{supplier_id} - SaticiPilot",
            "Content-Type": "application/json",
        }

    def _get(self, path: str, params: Optional[dict] = None) -> dict:
        url = f"{self.BASE_URL}{path}"
        with httpx.Client(auth=self.auth, headers=self.headers, timeout=30) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    def get_questions(self, page: int = 0, size: int = 50) -> dict:
        """Müşteri sorularını çek."""
        return self._get(
            f"/suppliers/{self.supplier_id}/questions",
            params={"page": page, "size": size, "status": "WaitingForAnswer"},
        )

    def get_products(self, page: int = 0, size: int = 50) -> dict:
        """Ürünleri çek (Product V2 API)."""
        return self._get(
            f"/product/sellers/{self.supplier_id}/products",
            params={"page": page, "size": size},
        )

    def get_orders(self, start_date: int, end_date: int, page: int = 0) -> dict:
        """Siparişleri çek (Unix timestamp ms)."""
        return self._get(
            f"/suppliers/{self.supplier_id}/orders",
            params={
                "startDate": start_date,
                "endDate": end_date,
                "page": page,
                "size": 200,
            },
        )

    def get_returns(self, page: int = 0, size: int = 50) -> dict:
        """İade taleplerini çek."""
        return self._get(
            f"/suppliers/{self.supplier_id}/claims",
            params={"page": page, "size": size},
        )

    def get_reviews(self, page: int = 0, size: int = 100, start_date: Optional[int] = None, end_date: Optional[int] = None) -> dict:
        """Ürün yorumlarını çek (Trendyol Seller API)."""
        params: dict = {"page": page, "size": size, "orderByField": "CreatedDate", "orderByDirection": "DESC"}
        if start_date:
            params["startDate"] = start_date
        if end_date:
            params["endDate"] = end_date
        return self._get(f"/suppliers/{self.supplier_id}/reviews", params=params)

    def get_all_questions(self, page: int = 0, size: int = 100) -> dict:
        """Tüm durumlardan müşteri sorularını çek (WaitingForAnswer + Answered)."""
        return self._get(
            f"/suppliers/{self.supplier_id}/questions",
            params={"page": page, "size": size},
        )
