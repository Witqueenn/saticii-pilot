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
    },
)
