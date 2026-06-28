import uuid, json
import pandas as pd
import tempfile
import os
from app.services.data_service import process_data_source
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.models import (
    Source,
    Document,
    SyncLog,
    SourceType,
    SyncStatus,
)
from app.schemas.schemas import SourceOut, SourceCreate, WebSourceCreate, SyncLogOut
from app.services.s3_service import upload_file_to_s3, delete_from_s3
from app.services.pdf_service import process_pdf_source
from app.services.web_service import process_web_source
from app.services.vector_service import delete_by_source

router = APIRouter(prefix="/sources", tags=["Sources"])


@router.get("/", response_model=list[SourceOut])
async def list_sources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Source).order_by(Source.created_at.desc()))
    return result.scalars().all()


@router.delete("/{source_id}")
async def delete_source(
    source_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Source).where(
            Source.id == source_id
        )
    )

    source = result.scalar_one_or_none()

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Source not found",
        )

    # Delete vectors
    try:
        delete_by_source(source_id)
    except Exception as e:
        print(f"Vector delete error: {e}")

    # Delete related documents
    try:
        docs = await db.execute(
            select(Document).where(
                Document.source_id == source_id
            )
        )

        for doc in docs.scalars().all():
            await db.delete(doc)
    except Exception as e:
        print(f"Document delete error: {e}")

    # Delete sync logs
    logs = await db.execute(
        select(SyncLog).where(
            SyncLog.source_id == source_id
        )
    )

    for log in logs.scalars().all():
        await db.delete(log)

    # Delete source
    await db.delete(source)

    await db.commit()

    return {
        "success": True,
        "message": "Source deleted successfully",
    }
# ─── Upload CSV / Excel ────────────────────────────

@router.post("/upload-data", response_model=SourceOut)
async def upload_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    ext = file.filename.lower().split(".")[-1]

    if ext not in ["csv", "xlsx", "xls"]:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported.",
        )

    tmp = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=f".{ext}"
    )

    contents = await file.read()

    with open(tmp.name, "wb") as f:
        f.write(contents)

    source_id = str(uuid.uuid4())

    source = Source(
        id=source_id,
        name=name or file.filename,
        type=SourceType.data,
        uri=tmp.name,
    )

    db.add(source)

    sync_log_id = str(uuid.uuid4())

    db.add(
        SyncLog(
            id=sync_log_id,
            source_id=source_id,
            status=SyncStatus.running,
        )
    )

    await db.commit()
    await db.refresh(source)

    background_tasks.add_task(
        _run_data_processing,
        source_id,
        tmp.name,
        file.filename,
        sync_log_id,
    )

    return source

# ─── Upload PDF ────────────────────────────────────

@router.post("/upload-pdf", response_model=SourceOut)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    # Upload to S3
    s3_key = await upload_file_to_s3(file, prefix="pdfs")

    source_id = str(uuid.uuid4())
    source = Source(
        id=source_id,
        name=name or file.filename,
        type=SourceType.pdf,
        uri=s3_key,
    )
    db.add(source)

    sync_log_id = str(uuid.uuid4())
    sync_log = SyncLog(
        id=sync_log_id,
        source_id=source_id,
        status=SyncStatus.running,
    )
    db.add(sync_log)
    await db.commit()
    await db.refresh(source)

    # Process in background
    background_tasks.add_task(
        _run_pdf_processing,
        source_id, s3_key, file.filename, sync_log_id
    )

    return source


async def _run_data_processing(
    source_id: str,
    file_path: str,
    file_name: str,
    sync_log_id: str,
):
    print("🔥 RUN DATA PROCESSING CALLED")
    print("FILE:", file_name)
    print("PATH:", file_path)

    from app.db.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(Source).where(
                    Source.id == source_id
                )
            )

            source = result.scalar_one_or_none()

            if not source:
                print("❌ SOURCE NOT FOUND")
                return

            await process_data_source(
                db,
                source,
                file_path,
                file_name,
                sync_log_id,
            )

        except Exception as e:
            import traceback
            print("❌ DATA BACKGROUND TASK FAILED")
            print(e)
            traceback.print_exc()


# ─── Connect Website ───────────────────────────────

@router.post("/connect-web", response_model=SourceOut)
async def connect_web(
    payload: WebSourceCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    source_id = str(uuid.uuid4())
    source = Source(
        id=source_id,
        name=payload.name,
        type=SourceType.web,
        uri=payload.url,
        config=json.dumps({"max_pages": payload.max_pages}),
    )
    db.add(source)

    sync_log_id = str(uuid.uuid4())
    db.add(SyncLog(id=sync_log_id, source_id=source_id, status=SyncStatus.running))
    await db.commit()
    await db.refresh(source)

    background_tasks.add_task(
        _run_web_processing,
        source_id, payload.url, payload.max_pages, sync_log_id
    )
    return source


async def _run_web_processing(source_id: str, url: str, max_pages: int, sync_log_id: str):
    from app.db.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Source).where(Source.id == source_id))
        source = result.scalar_one()
        await process_web_source(db, source, url, max_pages, sync_log_id)

async def _run_data_processing(
    source_id: str,
    file_path: str,
    file_name: str,
    sync_log_id: str,
):
    from app.db.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Source).where(
                Source.id == source_id
            )
        )

        source = result.scalar_one()

        await process_data_source(
            db,
            source,
            file_path,
            file_name,
            sync_log_id,
        )
# ─── Sync logs ─────────────────────────────────────

@router.get("/{source_id}/sync-logs", response_model=list[SyncLogOut])
async def get_sync_logs(source_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SyncLog)
        .where(SyncLog.source_id == source_id)
        .order_by(SyncLog.started_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.post("/{source_id}/re-sync")
async def re_sync_source(
    source_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(404, "Source not found")

    delete_by_source(source_id)

    sync_log_id = str(uuid.uuid4())
    db.add(SyncLog(id=sync_log_id, source_id=source_id, status=SyncStatus.running))
    await db.commit()

    if source.type == SourceType.pdf:
        background_tasks.add_task(
        _run_pdf_processing,
        source_id,
        source.uri,
        source.uri.split("/")[-1],
        sync_log_id
    )

    elif source.type == SourceType.web:
        cfg = json.loads(source.config or "{}")
        background_tasks.add_task(
        _run_web_processing,
        source_id,
        source.uri,
        cfg.get("max_pages", 10),
        sync_log_id,
    )

    elif source.type == SourceType.data:
        background_tasks.add_task(
        _run_data_processing,
        source_id,
        source.uri,
        source.name,
        sync_log_id,
    )

    return {
    "status": "re-sync started",
    "sync_log_id": sync_log_id,
}