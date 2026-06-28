import traceback
import uuid
from datetime import datetime

import pandas as pd
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

from app.core.config import get_settings
from app.models.models import (
    Document,
    Chunk,
    SyncLog,
    SyncStatus,
    Source,
)
from app.services.ollama_service import embed_batch
from app.services.vector_service import (
    upsert_chunks,
    collection_count,
)

settings = get_settings()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.chunk_size,
    chunk_overlap=settings.chunk_overlap,
)


async def process_data_source(
    db: AsyncSession,
    source: Source,
    file_path: str,
    file_name: str,
    sync_log_id: str,
):
    print("🔥 DATA PROCESS STARTED")

    try:
        print("\n========== DATA PROCESSING STARTED ==========")
        print("FILE:", file_name)
        print("PATH:", file_path)

        ext = file_name.lower().split(".")[-1]

        if ext == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        print("\n========== DATAFRAME ==========")
        print(df.head())
        print("ROWS:", len(df))
        print("COLUMNS:", df.columns.tolist())

        # Remove empty rows
        df = df.fillna("")

        chunks_text = []

        for _, row in df.iterrows():
            row_text = " | ".join(
                str(v).strip()
                for v in row.values
                if str(v).strip()
            )

            if row_text:
                chunks_text.append(row_text)

        print("CHUNKS CREATED:", len(chunks_text))

        if len(chunks_text) == 0:
            raise Exception(
                "No chunks created from uploaded file."
            )

        for i, c in enumerate(chunks_text[:5]):
            print(f"\nChunk {i}:")
            print(c[:300])

        doc_id = str(uuid.uuid4())

        doc = Document(
            id=doc_id,
            source_id=source.id,
            title=file_name,
            file_name=file_name,
            total_chunks=len(chunks_text),
            total_tokens=sum(
                len(c.split())
                for c in chunks_text
            ),
        )

        db.add(doc)
        await db.flush()

        print(
            "\n========== GENERATING EMBEDDINGS =========="
        )

        # TEMP TEST
        chunks_text = chunks_text[:50]

        embeddings = []

        batch_size = 10

        for i in range(
            0,
            len(chunks_text),
            batch_size,
    ):
            batch = chunks_text[i:i + batch_size]

            print(
                f"Embedding batch {i} to {i + len(batch)}"
            )

            batch_embeddings = await embed_batch(
                batch
            )

            embeddings.extend(
                batch_embeddings
            )

            print(
                "EMBEDDINGS GENERATED:",
                len(embeddings),
            )

        if len(embeddings) == 0:
            raise Exception(
                "Embedding generation failed."
            )

        chroma_ids = []
        chroma_docs = []
        chroma_embs = []
        chroma_metas = []

        for i, (
            chunk_text,
            emb,
        ) in enumerate(
            zip(chunks_text, embeddings)
        ):
            chroma_id = f"{doc_id}_{i}"

            db.add(
                Chunk(
                    id=str(uuid.uuid4()),
                    document_id=doc_id,
                    content=chunk_text,
                    chunk_index=i,
                    chroma_id=chroma_id,
                    token_count=len(
                        chunk_text.split()
                    ),
                )
            )

            chroma_ids.append(chroma_id)
            chroma_docs.append(chunk_text)
            chroma_embs.append(emb)

            chroma_metas.append(
                {
                    "source_id": source.id,
                    "document_id": doc_id,
                    "chunk_index": i,
                    "source_type": "data",
                    "file_name": file_name,
                }
            )

        print(
            "\n========== INSERTING INTO CHROMA =========="
        )

        print("Chunk IDs:", len(chroma_ids))
        print("Documents:", len(chroma_docs))
        print("Embeddings:", len(chroma_embs))

        upsert_chunks(
            chroma_ids,
            chroma_embs,
            chroma_docs,
            chroma_metas,
        )

        print(
            "Saved to Chroma successfully"
        )

        count = collection_count()

        print(
            "COLLECTION COUNT AFTER INSERT:",
            count
        )

        if count == 0:
            raise Exception(
                "Chroma insertion failed. Collection still empty."
            )

        await db.execute(
            update(SyncLog)
            .where(
                SyncLog.id == sync_log_id
            )
            .values(
                status=SyncStatus.success,
                docs_processed=1,
                chunks_created=len(
                    chunks_text
                ),
                finished_at=datetime.utcnow(),
            )
        )

        await db.commit()

        print(
            "\n========== DATA PROCESSING SUCCESS =========="
        )

    except Exception as e:
        print(
            "\n❌ DATA SERVICE ERROR ❌"
        )
        print(str(e))
        traceback.print_exc()

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