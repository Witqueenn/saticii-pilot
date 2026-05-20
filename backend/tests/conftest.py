import os

# Must run before any app module is imported (pydantic-settings validates at
# instantiation time). os.environ takes priority over .env file values.
os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_KEY", "test-anon-key")
os.environ.setdefault("DATABASE_URL", "postgresql://localhost/satici_pilot_test")
# Needed at module level by ai_service (Anthropic client created on import)
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")
