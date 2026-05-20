"""Unit tests for Celery worker task logic.

Tests pure Python business logic and exception-handling contracts without
hitting Supabase or the Anthropic API.
"""

from unittest.mock import MagicMock, patch

import pytest


# ── helpers ───────────────────────────────────────────────────────────────────

def _make_db_mock(execute_result):
    """Return a mock that makes db.table(...).chain().execute() → execute_result."""
    mock_db = MagicMock()
    mock_table = MagicMock()
    mock_db.return_value.table.return_value = mock_table
    for attr in ("select", "eq", "is_", "limit", "or_", "update", "order"):
        getattr(mock_table, attr).return_value = mock_table
    mock_table.execute.return_value = execute_result
    # upsert chain: upsert(...).execute() uses its own mock
    mock_upsert = MagicMock()
    mock_table.upsert.return_value = mock_upsert
    return mock_db, mock_table


# ── return_tasks: RECOMMENDATION_MAP ─────────────────────────────────────────

class TestRecommendationMap:
    def test_all_values_non_empty(self):
        from app.workers.tasks.return_tasks import RECOMMENDATION_MAP
        for key, rec in RECOMMENDATION_MAP.items():
            assert rec, f"Boş öneri: key={key}"

    def test_diger_fallback_exists(self):
        from app.workers.tasks.return_tasks import RECOMMENDATION_MAP
        assert "diger" in RECOMMENDATION_MAP


# ── return_tasks: pattern aggregation logic ───────────────────────────────────

class TestReturnTaskPatterns:
    def test_empty_returns_exits_early_without_upsert(self):
        from app.workers.tasks.return_tasks import generate_seller_return_report

        mock_result = MagicMock()
        mock_result.data = []
        mock_db, mock_table = _make_db_mock(mock_result)

        with patch("app.workers.tasks.return_tasks.get_supabase_admin", mock_db):
            generate_seller_return_report("seller-1")

        mock_table.upsert.assert_not_called()

    def test_computes_dominant_reason_correctly(self):
        from app.workers.tasks.return_tasks import generate_seller_return_report

        mock_result = MagicMock()
        mock_result.data = [
            {"product_id": "p1", "product_name": "T-Shirt", "reason": "beden_uyumsuzlugu"},
            {"product_id": "p1", "product_name": "T-Shirt", "reason": "beden_uyumsuzlugu"},
            {"product_id": "p1", "product_name": "T-Shirt", "reason": "renk_farki"},
        ]
        mock_db, mock_table = _make_db_mock(mock_result)

        with patch("app.workers.tasks.return_tasks.get_supabase_admin", mock_db):
            generate_seller_return_report("seller-1")

        payload = mock_table.upsert.call_args[0][0]
        assert payload["seller_id"] == "seller-1"
        assert payload["total_returns"] == 3
        pattern = payload["patterns"][0]
        assert pattern["dominant_reason"] == "beden_uyumsuzlugu"
        assert pattern["total_returns"] == 3

    @pytest.mark.parametrize("count,expected_urgency", [
        (1, "dusuk"),
        (2, "orta"),
        (4, "orta"),
        (5, "yuksek"),
        (10, "yuksek"),
    ])
    def test_urgency_thresholds(self, count, expected_urgency):
        from app.workers.tasks.return_tasks import generate_seller_return_report

        mock_result = MagicMock()
        mock_result.data = [
            {"product_id": "p1", "product_name": "Kazak", "reason": "beden_uyumsuzlugu"}
        ] * count
        mock_db, mock_table = _make_db_mock(mock_result)

        with patch("app.workers.tasks.return_tasks.get_supabase_admin", mock_db):
            generate_seller_return_report("seller-1")

        payload = mock_table.upsert.call_args[0][0]
        assert payload["patterns"][0]["urgency"] == expected_urgency

    def test_recommendation_lookup_for_known_reason(self):
        from app.workers.tasks.return_tasks import generate_seller_return_report, RECOMMENDATION_MAP

        mock_result = MagicMock()
        mock_result.data = [
            {"product_id": "p1", "product_name": "Gömlek", "reason": "renk_farki"},
            {"product_id": "p1", "product_name": "Gömlek", "reason": "renk_farki"},
        ]
        mock_db, mock_table = _make_db_mock(mock_result)

        with patch("app.workers.tasks.return_tasks.get_supabase_admin", mock_db):
            generate_seller_return_report("seller-1")

        payload = mock_table.upsert.call_args[0][0]
        assert payload["patterns"][0]["recommendation"] == RECOMMENDATION_MAP["renk_farki"]

    def test_unknown_reason_falls_back_to_diger(self):
        from app.workers.tasks.return_tasks import generate_seller_return_report, RECOMMENDATION_MAP

        mock_result = MagicMock()
        mock_result.data = [
            {"product_id": "p1", "product_name": "Ayakkabı", "reason": "bilinmeyen_neden"},
        ]
        mock_db, mock_table = _make_db_mock(mock_result)

        with patch("app.workers.tasks.return_tasks.get_supabase_admin", mock_db):
            generate_seller_return_report("seller-1")

        payload = mock_table.upsert.call_args[0][0]
        assert payload["patterns"][0]["recommendation"] == RECOMMENDATION_MAP["diger"]

    def test_multiple_products_produce_separate_patterns(self):
        from app.workers.tasks.return_tasks import generate_seller_return_report

        mock_result = MagicMock()
        mock_result.data = [
            {"product_id": "p1", "product_name": "Bluz", "reason": "renk_farki"},
            {"product_id": "p2", "product_name": "Pantolon", "reason": "beden_uyumsuzlugu"},
            {"product_id": "p2", "product_name": "Pantolon", "reason": "beden_uyumsuzlugu"},
        ]
        mock_db, mock_table = _make_db_mock(mock_result)

        with patch("app.workers.tasks.return_tasks.get_supabase_admin", mock_db):
            generate_seller_return_report("seller-1")

        payload = mock_table.upsert.call_args[0][0]
        assert payload["total_returns"] == 3
        assert len(payload["patterns"]) == 2


# ── review_tasks: exception-handling contract ─────────────────────────────────

class TestReviewTaskExceptions:
    def _mock_reviews(self, reviews):
        mock_result = MagicMock()
        mock_result.data = reviews
        return _make_db_mock(mock_result)

    def test_ai_failure_is_logged_not_silently_swallowed(self):
        from app.workers.tasks.review_tasks import analyze_seller_reviews

        mock_db, mock_table = self._mock_reviews([
            {"id": "r1", "comment": "kötü", "rating": 1, "product_name": "T-Shirt"},
        ])

        with (
            patch("app.workers.tasks.review_tasks.get_supabase_admin", mock_db),
            patch("app.workers.tasks.review_tasks.analyze_review", side_effect=RuntimeError("API down")),
            patch("app.workers.tasks.review_tasks.logger") as mock_logger,
            patch("app.workers.tasks.review_tasks.sentry_sdk"),
        ):
            with pytest.raises(RuntimeError, match="analiz edilemedi"):
                analyze_seller_reviews("seller-1")

        mock_logger.exception.assert_called_once()

    def test_sentry_capture_called_on_ai_failure(self):
        from app.workers.tasks.review_tasks import analyze_seller_reviews

        mock_db, _ = self._mock_reviews([
            {"id": "r1", "comment": "kötü", "rating": 1, "product_name": "T-Shirt"},
        ])

        with (
            patch("app.workers.tasks.review_tasks.get_supabase_admin", mock_db),
            patch("app.workers.tasks.review_tasks.analyze_review", side_effect=ValueError("parse error")),
            patch("app.workers.tasks.review_tasks.logger"),
            patch("app.workers.tasks.review_tasks.sentry_sdk") as mock_sentry,
        ):
            with pytest.raises(RuntimeError):
                analyze_seller_reviews("seller-1")

        mock_sentry.capture_exception.assert_called_once()

    def test_partial_failure_processes_remaining_items(self):
        """A single bad review must not block analysis of the rest."""
        from app.workers.tasks.review_tasks import analyze_seller_reviews

        mock_db, mock_table = self._mock_reviews([
            {"id": "r1", "comment": "kötü", "rating": 1, "product_name": "T-Shirt"},
            {"id": "r2", "comment": "güzel", "rating": 5, "product_name": "Kazak"},
        ])

        good = MagicMock(sentiment="olumlu", is_urgent=False, summary="iyi", suggested_reply="teşekkürler")
        side_effects = [RuntimeError("first fails"), good]

        with (
            patch("app.workers.tasks.review_tasks.get_supabase_admin", mock_db),
            patch("app.workers.tasks.review_tasks.analyze_review", side_effect=side_effects),
            patch("app.workers.tasks.review_tasks.logger"),
            patch("app.workers.tasks.review_tasks.sentry_sdk"),
        ):
            with pytest.raises(RuntimeError):
                analyze_seller_reviews("seller-1")

        # Second item must still have triggered a DB update
        mock_table.update.assert_called_once()

    def test_all_success_does_not_raise(self):
        from app.workers.tasks.review_tasks import analyze_seller_reviews

        mock_db, _ = self._mock_reviews([
            {"id": "r1", "comment": "güzel", "rating": 5, "product_name": "Bluz"},
        ])

        good = MagicMock(sentiment="olumlu", is_urgent=False, summary="iyi", suggested_reply="teşekkürler")

        with (
            patch("app.workers.tasks.review_tasks.get_supabase_admin", mock_db),
            patch("app.workers.tasks.review_tasks.analyze_review", return_value=good),
            patch("app.workers.tasks.review_tasks.sentry_sdk"),
        ):
            analyze_seller_reviews("seller-1")  # must not raise


# ── product_tasks: exception-handling contract ────────────────────────────────

class TestProductTaskExceptions:
    def _mock_products(self, products):
        mock_result = MagicMock()
        mock_result.data = products
        return _make_db_mock(mock_result)

    def test_ai_failure_is_logged(self):
        from app.workers.tasks.product_tasks import analyze_seller_products

        mock_db, _ = self._mock_products([
            {"id": "prod1", "name": "T-Shirt", "category": "giyim", "description": ""},
        ])

        with (
            patch("app.workers.tasks.product_tasks.get_supabase_admin", mock_db),
            patch("app.workers.tasks.product_tasks.analyze_product_description", side_effect=RuntimeError("API down")),
            patch("app.workers.tasks.product_tasks.logger") as mock_logger,
            patch("app.workers.tasks.product_tasks.sentry_sdk"),
        ):
            with pytest.raises(RuntimeError, match="analiz edilemedi"):
                analyze_seller_products("seller-1")

        mock_logger.exception.assert_called_once()

    def test_all_success_does_not_raise(self):
        from app.workers.tasks.product_tasks import analyze_seller_products

        mock_db, _ = self._mock_products([
            {"id": "prod1", "name": "Kazak", "category": "giyim", "description": "iyi ürün"},
        ])

        good = MagicMock(description_score=80, seo_score=75, suggestions=[], improved_description="")

        with (
            patch("app.workers.tasks.product_tasks.get_supabase_admin", mock_db),
            patch("app.workers.tasks.product_tasks.analyze_product_description", return_value=good),
            patch("app.workers.tasks.product_tasks.sentry_sdk"),
        ):
            analyze_seller_products("seller-1")  # must not raise
