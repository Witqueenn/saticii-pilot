"""
End-to-end API tests for SatıcıPilot backend.

Run with:
    cd backend && pytest tests/ -v

These tests verify:
1. Health endpoint is reachable
2. All data endpoints require authentication (no query-param seller_id leak)
3. Invalid tokens are rejected with 401
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
    data = response.json()
    assert data["status"] == "ok"


# ── Auth enforcement: missing token → 403 (HTTPBearer rejects) ────────────────

def test_reviews_no_auth():
    response = client.get("/api/v1/reviews/")
    assert response.status_code == 403

def test_returns_no_auth():
    response = client.get("/api/v1/returns/")
    assert response.status_code == 403

def test_products_no_auth():
    response = client.get("/api/v1/products/")
    assert response.status_code == 403

def test_daily_summary_no_auth():
    response = client.get("/api/v1/reviews/daily-summary")
    assert response.status_code == 403


# ── Auth enforcement: bad token → 401 ────────────────────────────────────────

def test_reviews_invalid_token():
    response = client.get("/api/v1/reviews/", headers={"Authorization": FAKE_TOKEN})
    assert response.status_code == 401

def test_returns_invalid_token():
    response = client.get("/api/v1/returns/", headers={"Authorization": FAKE_TOKEN})
    assert response.status_code == 401

def test_products_invalid_token():
    response = client.get("/api/v1/products/", headers={"Authorization": FAKE_TOKEN})
    assert response.status_code == 401

def test_analyze_review_invalid_token():
    response = client.post(
        "/api/v1/reviews/fake-uuid/analyze",
        headers={"Authorization": FAKE_TOKEN},
    )
    assert response.status_code == 401

def test_analyze_product_invalid_token():
    response = client.post(
        "/api/v1/products/fake-uuid/analyze",
        headers={"Authorization": FAKE_TOKEN},
    )
    assert response.status_code == 401


# ── Auth enforcement: old query-param pattern is gone ────────────────────────

def test_reviews_query_param_seller_id_not_accepted():
    """Ensure the old ?seller_id= pattern no longer bypasses auth."""
    response = client.get("/api/v1/reviews/?seller_id=00000000-0000-0000-0000-000000000000")
    # Should still require Authorization header; 403 from HTTPBearer
    assert response.status_code == 403

def test_returns_query_param_seller_id_not_accepted():
    response = client.get("/api/v1/returns/?seller_id=00000000-0000-0000-0000-000000000000")
    assert response.status_code == 403


# ── Mocked valid-auth happy paths ─────────────────────────────────────────────

MOCK_SELLER_ID = "11111111-1111-1111-1111-111111111111"

def _mock_get_current_user():
    """Dependency override that bypasses JWT verification for unit tests."""
    return MOCK_SELLER_ID


@pytest.fixture()
def authed_client():
    """TestClient with auth dependency overridden to return a fixed seller_id."""
    from app.core.security import get_current_user
    app.dependency_overrides[get_current_user] = _mock_get_current_user
    yield client
    app.dependency_overrides.clear()


def test_reviews_with_mocked_auth(authed_client):
    mock_result = MagicMock()
    mock_result.data = []
    with patch("app.api.v1.endpoints.reviews.get_supabase") as mock_db:
        mock_table = MagicMock()
        mock_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.order.return_value = mock_table
        mock_table.limit.return_value = mock_table
        mock_table.execute.return_value = mock_result
        response = authed_client.get("/api/v1/reviews/", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_returns_with_mocked_auth(authed_client):
    mock_result = MagicMock()
    mock_result.data = []
    with patch("app.api.v1.endpoints.returns.get_supabase") as mock_db:
        mock_table = MagicMock()
        mock_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.order.return_value = mock_table
        mock_table.limit.return_value = mock_table
        mock_table.execute.return_value = mock_result
        response = authed_client.get("/api/v1/returns/", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_products_with_mocked_auth(authed_client):
    mock_result = MagicMock()
    mock_result.data = []
    with patch("app.api.v1.endpoints.products.get_supabase") as mock_db:
        mock_table = MagicMock()
        mock_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.order.return_value = mock_table
        mock_table.limit.return_value = mock_table
        mock_table.execute.return_value = mock_result
        response = authed_client.get("/api/v1/products/", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_daily_summary_with_mocked_auth(authed_client):
    mock_result = MagicMock()
    mock_result.data = [
        {"sentiment": "olumlu", "is_urgent": False, "is_replied": True},
        {"sentiment": "olumsuz", "is_urgent": True, "is_replied": False},
    ]
    with patch("app.api.v1.endpoints.reviews.get_supabase") as mock_db:
        mock_table = MagicMock()
        mock_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = mock_result
        response = authed_client.get("/api/v1/reviews/daily-summary", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["urgent"] == 1
    assert data["pending_reply"] == 1
    assert data["sentiment_breakdown"]["olumlu"] == 1
    assert data["sentiment_breakdown"]["olumsuz"] == 1
