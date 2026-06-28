import json
import httpx
from typing import List, AsyncGenerator
from app.core.config import get_settings

settings = get_settings()
OLLAMA = settings.ollama_base_url


async def embed_text(text: str) -> List[float]:
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{OLLAMA}/api/embeddings",
            json={
                "model": settings.ollama_embed_model,
                "prompt": text,
            },
        )
        resp.raise_for_status()
        return resp.json()["embedding"]


async def embed_batch(
    texts: List[str],
) -> List[List[float]]:
    results = []

    for text in texts:
        emb = await embed_text(text)
        results.append(emb)

    return results


async def chat_stream(
    messages: List[dict],
) -> AsyncGenerator[str, None]:
    timeout = httpx.Timeout(
        connect=30,
        read=None,
        write=30,
        pool=30,
    )

    try:
        async with httpx.AsyncClient(
            timeout=timeout
        ) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA}/api/chat",
                json={
                    "model": settings.ollama_chat_model,
                    "messages": messages,
                    "stream": True,
                },
            ) as resp:
                resp.raise_for_status()

                async for line in resp.aiter_lines():
                    if not line:
                        continue

                    try:
                        data = json.loads(line)

                        token = (
                            data.get(
                                "message",
                                {},
                            ).get(
                                "content",
                                ""
                            )
                        )

                        if token:
                            print(
                                "TOKEN:",
                                token
                            )
                            yield token

                        if data.get("done"):
                            print("DONE")
                            break

                    except json.JSONDecodeError:
                        continue

    except Exception as e:
        print(
            "OLLAMA ERROR:",
            str(e),
        )
        yield (
            "Unable to connect to Ollama."
        )

def build_rag_prompt(
    question: str,
    context_chunks: List[str],
) -> List[dict]:

    context = "\n\n".join(context_chunks)

    system = f"""
You are KnowledgeHub AI.

The text below comes from uploaded documents, PDFs, CSV files and Excel files.

Answer the question ONLY from the provided context.

Rules:
1. If the answer exists in the context, answer directly.
2. For tables, treat rows and columns as structured data.
3. If an email, phone number, name or department exists in the context, return it exactly.
4. Do not say "I don't have enough information" unless the answer truly does not exist in the context.
5. Be precise.
Rules:
6. If context contains tabular data, match the person's name exactly.
7. Do not use information from another row.
8. Return only the matching row's data.

CONTEXT:
{context}
"""

    return [
        {
            "role": "system",
            "content": system,
        },
        {
            "role": "user",
            "content": question,
        },
    ]
