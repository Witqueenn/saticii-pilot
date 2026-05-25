"""
Decrypt marketplace credentials stored by the Next.js frontend.

Encryption format (AES-256-GCM, set in frontend /api/credentials):
  iv_hex:tag_hex:ciphertext_hex

The same CREDENTIAL_ENCRYPTION_KEY must be present in both frontend and backend .env.
"""
import logging
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_key() -> bytes:
    hex_key = settings.credential_encryption_key
    if not hex_key or len(hex_key) != 64:
        raise ValueError(
            "CREDENTIAL_ENCRYPTION_KEY must be a 64-char hex string. "
            "Generate with: openssl rand -hex 32"
        )
    return bytes.fromhex(hex_key)


def decrypt_credential(ciphertext: str) -> str:
    """Decrypt a single AES-256-GCM ciphertext produced by the Node.js frontend."""
    parts = ciphertext.split(":")
    if len(parts) != 3:
        raise ValueError(f"Invalid ciphertext format: expected 3 colon-separated parts, got {len(parts)}")
    iv = bytes.fromhex(parts[0])
    tag = bytes.fromhex(parts[1])
    enc = bytes.fromhex(parts[2])
    aesgcm = AESGCM(_get_key())
    # Python cryptography expects ciphertext+tag concatenated
    return aesgcm.decrypt(iv, enc + tag, None).decode("utf-8")


def get_trendyol_credentials(seller_id: str) -> dict | None:
    """
    Fetch and decrypt a seller's Trendyol credentials from the DB.
    Returns None if no credentials are saved or decryption fails.
    """
    from app.core.database import get_supabase_admin
    db = get_supabase_admin()
    result = (
        db.table("marketplace_credentials")
        .select("api_key, api_secret, supplier_id, store_id")
        .eq("seller_id", seller_id)
        .eq("marketplace", "trendyol")
        .maybe_single()
        .execute()
    )
    if not result.data:
        return None
    row = result.data
    try:
        api_key = decrypt_credential(row["api_key"]) if row.get("api_key") else ""
        api_secret = decrypt_credential(row["api_secret"]) if row.get("api_secret") else ""
        # support both column names (schema versions differ)
        supplier_id = row.get("supplier_id") or row.get("store_id") or ""
        return {"api_key": api_key, "api_secret": api_secret, "supplier_id": supplier_id}
    except Exception:
        logger.exception("Credential decryption failed for seller_id=%s", seller_id)
        return None
