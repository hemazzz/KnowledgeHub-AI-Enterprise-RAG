import uuid
from datetime import datetime
from typing import List
import pdfplumber
import io

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.config import get_settings
from app.models.models import Document, Chunk, Source, SyncLog, SyncStatus
from app.services.s3_service import download_from_s3
from app.services.vector_service import upsert_chunks
from app.services.ollama_service import embed_batch

settings = get_settings()
splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.chunk_size,
    chunk_overlap=settings.chunk_overlap,
)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract full text from a PDF byte stream."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
    return "\n\n".join(text_parts)


async def process_pdf_source(
    db: AsyncSession,
    source: Source,
    s3_key: str,
    file_name: str,
    sync_log_id: str,
):
    """Download PDF from S3, extract, chunk, embed, store in Chroma + DB."""
    try:
        # Download bytes
        pdf_bytes = download_from_s3(s3_key)

        # Extract text
        raw_text = extract_text_from_pdf(pdf_bytes)
        if not raw_text.strip():
            raise ValueError("PDF contains no extractable text.")

        # Chunk
        chunks_text: List[str] = splitter.split_text(raw_text)

        # Create Document record
        doc_id = str(uuid.uuid4())
        doc = Document(
            id=doc_id,
            source_id=source.id,
            title=file_name.rsplit(".", 1)[0],
            file_name=file_name,
            s3_key=s3_key,
            total_chunks=len(chunks_text),
            total_tokens=sum(len(c.split()) for c in chunks_text),
            version=1,
        )
        db.add(doc)
        await db.flush()

        # Embed all chunks
        embeddings = await embed_batch(chunks_text)

        chunk_ids = []
        chroma_ids = []
        chroma_docs = []
        chroma_metas = []
        chroma_embeddings = []

        for i, (text, emb) in enumerate(zip(chunks_text, embeddings)):
            chunk_id = str(uuid.uuid4())
            chroma_id = f"{doc_id}_{i}"

            chunk = Chunk(
                id=chunk_id,
                document_id=doc_id,
                content=text,
                chunk_index=i,
                chroma_id=chroma_id,
                token_count=len(text.split()),
            )
            db.add(chunk)

            chunk_ids.append(chunk_id)
            chroma_ids.append(chroma_id)
            chroma_docs.append(text)
            chroma_embeddings.append(emb)
            chroma_metas.append({
                "source_id": source.id,
                "document_id": doc_id,
                "chunk_index": i,
                "file_name": file_name,
                "source_type": "pdf",
            })

        # Upsert into ChromaDB
        upsert_chunks(chroma_ids, chroma_embeddings, chroma_docs, chroma_metas)

        # Update source last_synced_at
        await db.execute(
            update(Source)
            .where(Source.id == source.id)
            .values(last_synced_at=datetime.utcnow())
        )

        # Update sync log
        await db.execute(
            update(SyncLog)
            .where(SyncLog.id == sync_log_id)
            .values(
                status=SyncStatus.success,
                docs_processed=1,
                chunks_created=len(chunks_text),
                finished_at=datetime.utcnow(),
            )
        )
        await db.commit()
        return doc_id

    except Exception as e:
        await db.execute(
            update(SyncLog)
            .where(SyncLog.id == sync_log_id)
            .values(
                status=SyncStatus.failed,
                error_msg=str(e),
                finished_at=datetime.utcnow(),
            )
        )
        await db.commit()
        raise
