"""
End-to-end API tests for SatıcıPilot backend.

Run with:
    cd backend && venv/bin/python -m pytest tests/ -v

FastAPI's role: AI triggers and worker-generated insights only.
CRUD list endpoints were intentionally removed — the dashboard reads
Supabase directly via RLS; FastAPI is not a Supabase proxy.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from main import app

client = TestClient(app, raise_server_exceptions=False)

FAKE_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid"


# ── Health ────────────────────────────────────────────────────────────────────

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ── Removed endpoints should 404, not silently serve data ────────────────────

def test_reviews_list_removed():
    """GET /reviews/ was a Supabase pass-through; it no longer exists."""
    response = client.get("/api/v1/reviews/")
    assert response.status_code == 404

def test_returns_list_removed():
    response = client.get("/api/v1/returns/")
    assert response.status_code == 404

def test_products_list_removed():
    response = client.get("/api/v1/products/")
    assert response.status_code == 404


# ── Auth enforcement: missing token → 403 (HTTPBearer rejects) ────────────────

def test_reviews_analyze_no_auth():
    response = client.post("/api/v1/reviews/fake-uuid/analyze")
    assert response.status_code == 403

def test_returns_report_no_auth():
    response = client.get("/api/v1/returns/report")
    assert response.status_code == 403

def test_products_analyze_no_auth():
    response = client.post("/api/v1/products/fake-uuid/analyze")
    assert response.status_code == 403

def test_batch_reviews_no_auth():
    response = client.post("/api/v1/reviews/batch-analyze")
    assert response.status_code == 403

def test_batch_returns_no_auth():
    response = client.post("/api/v1/returns/batch-analyze")
    assert response.status_code == 403

def test_batch_products_no_auth():
    response = client.post("/api/v1/products/batch-analyze")
    assert response.status_code == 403


# ── Auth enforcement: bad token → 401 ────────────────────────────────────────

def test_reviews_analyze_invalid_token():
    response = client.post("/api/v1/reviews/fake-uuid/analyze", headers={"Authorization": FAKE_TOKEN})
    assert response.status_code == 401

def test_returns_report_invalid_token():
    response = client.get("/api/v1/returns/report", headers={"Authorization": FAKE_TOKEN})
    assert response.status_code == 401

def test_products_analyze_invalid_token():
    response = client.post("/api/v1/products/fake-uuid/analyze", headers={"Authorization": FAKE_TOKEN})
    assert response.status_code == 401


# ── Old query-param ?seller_id= pattern must not bypass auth ──────────────────

def test_old_query_param_pattern_rejected_on_report():
    response = client.get("/api/v1/returns/report?seller_id=00000000-0000-0000-0000-000000000000")
    assert response.status_code == 403


# ── Mocked valid-auth happy paths ─────────────────────────────────────────────

MOCK_SELLER_ID = "11111111-1111-1111-1111-111111111111"


def _mock_get_current_user():
    return MOCK_SELLER_ID


@pytest.fixture()
def authed_client():
    from app.core.security import get_current_user
    app.dependency_overrides[get_current_user] = _mock_get_current_user
    yield client
    app.dependency_overrides.clear()


def test_returns_report_no_data(authed_client):
    mock_result = MagicMock()
    mock_result.data = []
    with patch("app.api.v1.endpoints.returns.get_supabase_admin") as mock_db:
        mock_table = MagicMock()
        mock_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.order.return_value = mock_table
        mock_table.limit.return_value = mock_table
        mock_table.execute.return_value = mock_result
        response = authed_client.get("/api/v1/returns/report", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert "message" in response.json()


def test_returns_report_with_data(authed_client):
    mock_result = MagicMock()
    mock_result.data = [{
        "seller_id": MOCK_SELLER_ID,
        "total_returns": 12,
        "patterns": [{"product_id": "p1", "dominant_reason": "beden_uyumsuzlugu", "urgency": "yuksek"}],
    }]
    with patch("app.api.v1.endpoints.returns.get_supabase_admin") as mock_db:
        mock_table = MagicMock()
        mock_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.order.return_value = mock_table
        mock_table.limit.return_value = mock_table
        mock_table.execute.return_value = mock_result
        response = authed_client.get("/api/v1/returns/report", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_returns"] == 12


def test_batch_analyze_reviews_queued(authed_client):
    with patch("app.api.v1.endpoints.reviews.analyze_seller_reviews") as mock_task:
        mock_task.delay = MagicMock()
        response = authed_client.post("/api/v1/reviews/batch-analyze", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert response.json()["status"] == "queued"


def test_batch_analyze_returns_queued(authed_client):
    with patch("app.api.v1.endpoints.returns.generate_seller_return_report") as mock_task:
        mock_task.delay = MagicMock()
        response = authed_client.post("/api/v1/returns/batch-analyze", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert response.json()["status"] == "queued"


def test_batch_analyze_products_queued(authed_client):
    with patch("app.api.v1.endpoints.products.analyze_seller_products") as mock_task:
        mock_task.delay = MagicMock()
        response = authed_client.post("/api/v1/products/batch-analyze", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert response.json()["status"] == "queued"
