from pydantic import model_validator
from pydantic_settings import BaseSettings

_INSECURE_SECRET_DEFAULTS = {
    "change-me-in-production",
    "supersecretkey-change-this-in-production",
}


class Settings(BaseSettings):
    app_name: str = "SatıcıPilot API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""  # Settings → API → JWT Secret

    # Database (direct PostgreSQL for Celery/SQLAlchemy)
    database_url: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # AI
    anthropic_api_key: str = ""
    openai_api_key: str = ""  # optional

    # Auth
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 gün

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # Trendyol API
    trendyol_api_url: str = "https://api.trendyol.com/sapigw"

    # Sentry
    sentry_dsn: str = ""  # optional

    @model_validator(mode="after")
    def _check_required_secrets(self) -> "Settings":
        # Always required — app cannot function without these
        always = {
            "SUPABASE_URL": self.supabase_url,
            "SUPABASE_KEY": self.supabase_key,
            "DATABASE_URL": self.database_url,
        }
        # Required in production only (debug=True relaxes these for local dev)
        production = {
            "SUPABASE_SERVICE_ROLE_KEY": self.supabase_service_role_key,
            "SUPABASE_JWT_SECRET": self.supabase_jwt_secret,
            "ANTHROPIC_API_KEY": self.anthropic_api_key,
        }

        missing = [k for k, v in always.items() if not v]

        if not self.debug:
            missing += [k for k, v in production.items() if not v]
            if self.secret_key in _INSECURE_SECRET_DEFAULTS:
                missing.append("SECRET_KEY (insecure default — run: openssl rand -hex 32)")

        if missing:
            raise ValueError(
                "Startup aborted — missing or insecure environment variables:\n  "
                + "\n  ".join(missing)
            )
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
