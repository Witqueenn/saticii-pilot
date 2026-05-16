from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "SatıcıPilot API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_role_key: str = ""

    # Database (direct PostgreSQL for Celery/SQLAlchemy)
    database_url: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # AI
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # Auth
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 gün

    # Trendyol API
    trendyol_api_url: str = "https://api.trendyol.com/sapigw"

    # Sentry
    sentry_dsn: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
