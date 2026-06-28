import httpx
from typing import List
from app.core.config import get_settings

settings = get_settings()


async def embed_single(text: str) -> List[float]:
    """Embed one text string via Ollama."""
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{settings.ollama_base_url}/api/embeddings",
            json={"model": settings.ollama_embed_model, "prompt": text},
        )
        resp.raise_for_status()
        return resp.json()["embedding"]


async def embed_many(texts: List[str]) -> List[List[float]]:
    """Embed a list of texts sequentially."""
    results = []
    for text in texts:
        emb = await embed_single(text)
        results.append(emb)
    return results


async def embed_query(question: str) -> List[float]:
    """Embed a user query — same as embed_single, named separately for clarity."""
    return await embed_single(question)


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Manual cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = sum(x ** 2 for x in a) ** 0.5
    mag_b = sum(x ** 2 for x in b) ** 0.5
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)
