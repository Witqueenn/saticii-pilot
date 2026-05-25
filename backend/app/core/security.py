from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings

bearer = HTTPBearer()

_admin_client: Client | None = None


def _admin() -> Client:
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _admin_client


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    """Verify Supabase JWT via admin API and return the seller's user ID."""
    token = credentials.credentials
    try:
        response = _admin().auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return response.user.id
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )
