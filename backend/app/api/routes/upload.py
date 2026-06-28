import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.models import Source, SyncLog, SourceType, SyncStatus
from app.schemas.schemas import SourceOut
from app.services.s3_service import upload_file_to_s3
from app.services.pdf_service import process_pdf_source
from app.utils.helpers import new_id, is_valid_url

router = APIRouter(prefix="/upload", tags=["Upload"])

ALLOWED_TYPES = {"application/pdf"}
ALLOWED_EXTENSIONS = {".pdf"}


def _validate_pdf(file: UploadFile):
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Only PDF is allowed.")
    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Invalid content type '{file.content_type}'.")


@router.post("/pdf", response_model=SourceOut, summary="Upload a PDF and embed it")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF file to upload"),
    name: str = Form(default="", description="Display name for this source"),
    db: AsyncSession = Depends(get_db),
):
    """
    1. Validate the uploaded file is a PDF.
    2. Upload raw file to AWS S3.
    3. Create Source + SyncLog records.
    4. Kick off background task: extract → chunk → embed → store in ChromaDB.
    """
    _validate_pdf(file)

    source_name = name.strip() or file.filename

    # Upload to S3
    s3_key = await upload_file_to_s3(file, prefix="pdfs")

    # Persist source record
    source_id = new_id()
    source = Source(
        id=source_id,
        name=source_name,
        type=SourceType.pdf,
        uri=s3_key,
    )
    db.add(source)

    # Persist sync log
    sync_log_id = new_id()
    sync_log = SyncLog(
        id=sync_log_id,
        source_id=source_id,
        status=SyncStatus.running,
    )
    db.add(sync_log)
    await db.commit()
    await db.refresh(source)

    # Background: extract → chunk → embed → store
    background_tasks.add_task(
        _process_in_background,
        source_id=source_id,
        s3_key=s3_key,
        file_name=file.filename,
        sync_log_id=sync_log_id,
    )

    return source


@router.post("/pdfs/batch", summary="Upload multiple PDFs at once")
async def upload_pdfs_batch(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(..., description="Multiple PDF files"),
    db: AsyncSession = Depends(get_db),
):
    """Upload up to 10 PDFs in one request. Each is processed independently."""
    if len(files) > 10:
        raise HTTPException(400, "Maximum 10 files per batch upload.")

    results = []
    for file in files:
        try:
            _validate_pdf(file)
            s3_key = await upload_file_to_s3(file, prefix="pdfs")

            source_id = new_id()
            source = Source(
                id=source_id,
                name=file.filename,
                type=SourceType.pdf,
                uri=s3_key,
            )
            db.add(source)

            sync_log_id = new_id()
            db.add(SyncLog(id=sync_log_id, source_id=source_id, status=SyncStatus.running))
            await db.flush()

            background_tasks.add_task(
                _process_in_background,
                source_id=source_id,
                s3_key=s3_key,
                file_name=file.filename,
                sync_log_id=sync_log_id,
            )

            results.append({"file": file.filename, "source_id": source_id, "status": "queued"})

        except HTTPException as e:
            results.append({"file": file.filename, "error": e.detail})

    await db.commit()
    return {"uploaded": len([r for r in results if "source_id" in r]), "results": results}


async def _process_in_background(
    source_id: str,
    s3_key: str,
    file_name: str,
    sync_log_id: str,
):
    from app.db.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Source).where(Source.id == source_id))
        source = result.scalar_one()
        await process_pdf_source(db, source, s3_key, file_name, sync_log_id)
