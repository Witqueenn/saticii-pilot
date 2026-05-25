import sentry_sdk
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.1,
        environment="production" if not settings.debug else "development",
    )

celery_app = Celery(
    "satici_pilot",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.workers.tasks.review_tasks",
        "app.workers.tasks.product_tasks",
        "app.workers.tasks.return_tasks",
        "app.workers.tasks.sync_tasks",
        "app.workers.tasks.alert_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Europe/Istanbul",
    enable_utc=True,
    beat_schedule={
        # Her sabah 08:00'da tüm satıcılar için yorum analizi
        "daily-review-analysis": {
            "task": "app.workers.tasks.review_tasks.analyze_all_sellers_reviews",
            "schedule": crontab(hour=8, minute=0),
        },
        # Her sabah 08:15'te iade raporu
        "daily-return-report": {
            "task": "app.workers.tasks.return_tasks.generate_return_reports",
            "schedule": crontab(hour=8, minute=15),
        },
        # Haftada bir Pazartesi ürün açıklama analizi
        "weekly-product-analysis": {
            "task": "app.workers.tasks.product_tasks.analyze_all_products",
            "schedule": crontab(hour=9, minute=0, day_of_week=1),
        },
        # Her 4 saatte bir Trendyol yorum senkronizasyonu
        "trendyol-review-sync": {
            "task": "app.workers.tasks.sync_tasks.sync_all_sellers_trendyol",
            "schedule": crontab(minute=0, hour="*/4"),
        },
        # Her gün 06:00'da Trendyol ürün senkronizasyonu
        "trendyol-product-sync": {
            "task": "app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_products",
            "schedule": crontab(hour=6, minute=0),
        },
        # Her 6 saatte bir Trendyol iade senkronizasyonu
        "trendyol-returns-sync": {
            "task": "app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_returns",
            "schedule": crontab(minute=30, hour="*/6"),
        },
        # Her 2 saatte bir Trendyol müşteri soru senkronizasyonu
        "trendyol-questions-sync": {
            "task": "app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_questions",
            "schedule": crontab(minute=0, hour="*/2"),
        },
        # Her 3 saatte bir Trendyol sipariş senkronizasyonu
        "trendyol-orders-sync": {
            "task": "app.workers.tasks.sync_tasks.sync_all_sellers_trendyol_orders",
            "schedule": crontab(minute=15, hour="*/3"),
        },
        # Her sabah 09:30'da stok alarm kontrolü
        "daily-low-stock-check": {
            "task": "app.workers.tasks.alert_tasks.check_low_stock",
            "schedule": crontab(hour=9, minute=30),
        },
        # Her sabah 09:45'te yüksek iade oranı alarm kontrolü
        "daily-high-return-rate-check": {
            "task": "app.workers.tasks.alert_tasks.check_high_return_rate",
            "schedule": crontab(hour=9, minute=45),
        },
    },
)
