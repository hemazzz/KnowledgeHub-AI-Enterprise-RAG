from fastapi import APIRouter
import httpx
from app.core.config import get_settings
from app.services.vector_service import collection_count

router = APIRouter(prefix="/health", tags=["Health"])
settings = get_settings()


@router.get("/")
async def health():
    return {"status": "ok", "app": settings.app_name}


@router.get("/services")
async def services_health():
    results = {}

    # Ollama
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{settings.ollama_base_url}/api/tags")
            results["ollama"] = "ok" if r.status_code == 200 else "degraded"
    except Exception:
        results["ollama"] = "unreachable"

    # ChromaDB
    try:
        count = collection_count()
        results["chromadb"] = f"ok ({count} chunks)"
    except Exception:
        results["chromadb"] = "unreachable"

    return results
