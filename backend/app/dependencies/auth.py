from fastapi import Header, HTTPException, Depends
from app.core.config import get_settings

settings = get_settings()


async def verify_api_key(x_api_key: str | None = Header(default=None)) -> str:
    """
    Optional API key guard.
    Set API_KEY in .env to enable. Leave blank to allow all requests (dev mode).
    """
    expected = getattr(settings, "api_key", None)
    if not expected:
        # API key not configured — open access (dev mode)
        return "dev"
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")
    return x_api_key


async def get_current_user(api_key: str = Depends(verify_api_key)) -> dict:
    """
    Placeholder user resolver.
    Extend this when you add real auth (JWT, OAuth, etc.)
    """
    return {"id": "local", "role": "admin", "api_key": api_key}
