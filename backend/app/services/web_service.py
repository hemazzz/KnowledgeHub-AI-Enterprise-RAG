import uuid
from datetime import datetime
from typing import List
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import get_settings
from app.models.models import (
    Source,
    Document,
    Chunk,
    SyncLog,
    SyncStatus,
)
from app.services.vector_service import upsert_chunks
from app.services.ollama_service import embed_batch
settings = get_settings()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.chunk_size,
    chunk_overlap=settings.chunk_overlap,
)
async def process_web_source(
    db: AsyncSession,
    source: Source,
    start_url: str,
    max_pages: int,
    sync_log_id: str,
):
    try:
        print(f"🌐 Starting crawl: {start_url}")

        urls_to_visit = [start_url]
        visited = set()

        docs_processed = 0
        chunks_total = 0

        async with httpx.AsyncClient(
            timeout=30,
            follow_redirects=True,
        ) as client:

            for url in urls_to_visit[:max_pages]:
                if url in visited:
                    continue

                visited.add(url)

                print(f"📄 Crawling: {url}")

                try:
                    resp = await client.get(
                        url,
                        headers={
                            "User-Agent": "KnowledgeHub-Bot/1.0"
                        },
                    )

                    html = resp.text

                except Exception as e:
                    print("❌ Fetch failed:", e)
                    continue

                if url == start_url:
                    extra = _collect_links(
                        start_url,
                        html,
                        max_pages,
                    )

                    for link in extra:
                        if link not in visited:
                            urls_to_visit.append(link)

                soup = BeautifulSoup(
                    html,
                    "html.parser",
                )

                for tag in soup(
                    [
                        "script",
                        "style",
                        "nav",
                        "footer",
                        "header",
                        "aside",
                    ]
                ):
                    tag.decompose()

                title = (
                    soup.title.string.strip()
                    if soup.title
                    else url
                )

                text = "\n".join(
                    l
                    for l in soup.get_text("\n").splitlines()
                    if l.strip()
                )

                print(
                    f"📝 Extracted chars: {len(text)}"
                )

                if len(text) < 30:
                    print("⚠️ Skipping small page")
                    continue

                chunks_text = splitter.split_text(
                    text
                )

                print(
                    f"📦 Chunks created: {len(chunks_text)}"
                )

                doc_id = str(uuid.uuid4())

                doc = Document(
                    id=doc_id,
                    source_id=source.id,
                    title=title,
                    url=url,
                    total_chunks=len(
                        chunks_text
                    ),
                    total_tokens=sum(
                        len(c.split())
                        for c in chunks_text
                    ),
                )

                db.add(doc)
                await db.flush()

                embeddings = await embed_batch(
                    chunks_text
                )

                chroma_ids = []
                chroma_docs = []
                chroma_embs = []
                chroma_metas = []

                for i, (
                    chunk_text,
                    emb,
                ) in enumerate(
                    zip(
                        chunks_text,
                        embeddings,
                    )
                ):
                    chroma_id = (
                        f"{doc_id}_{i}"
                    )

                    chunk = Chunk(
                        id=str(
                            uuid.uuid4()
                        ),
                        document_id=doc_id,
                        content=chunk_text,
                        chunk_index=i,
                        chroma_id=chroma_id,
                        token_count=len(
                            chunk_text.split()
                        ),
                    )

                    db.add(chunk)

                    chroma_ids.append(
                        chroma_id
                    )
                    chroma_docs.append(
                        chunk_text
                    )
                    chroma_embs.append(
                        emb
                    )
                    chroma_metas.append(
                        {
                            "source_id": source.id,
                            "document_id": doc_id,
                            "chunk_index": i,
                            "url": url,
                            "source_type": "web",
                        }
                    )

                await db.commit()

                print(
                    f"✅ Saved {title}"
                )

                upsert_chunks(
                    chroma_ids,
                    chroma_embs,
                    chroma_docs,
                    chroma_metas,
                )

                docs_processed += 1
                chunks_total += len(
                    chunks_text
                )

        await db.execute(
            update(Source)
            .where(Source.id == source.id)
            .values(
                last_synced_at=datetime.utcnow()
            )
        )

        await db.execute(
            update(SyncLog)
            .where(
                SyncLog.id == sync_log_id
            )
            .values(
                status=SyncStatus.success,
                docs_processed=docs_processed,
                chunks_created=chunks_total,
                finished_at=datetime.utcnow(),
            )
        )

        await db.commit()

        print(
            f"🎉 Finished. Docs={docs_processed}, Chunks={chunks_total}"
        )

    except Exception as e:
        print("❌ WEB ERROR:", e)

        await db.rollback()

        await db.execute(
            update(SyncLog)
            .where(
                SyncLog.id == sync_log_id
            )
            .values(
                status=SyncStatus.failed,
                error_msg=str(e),
                finished_at=datetime.utcnow(),
            )
        )

        await db.commit()
        raise