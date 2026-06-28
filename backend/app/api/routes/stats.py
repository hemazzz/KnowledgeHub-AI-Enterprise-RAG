from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.models.models import (
    Document,
    SyncLog,
    SyncStatus,
)
from app.schemas.schemas import (
    StatsOut,
    AnalyticsOut,
    DocumentOut,
    SyncLogOut,
)

router = APIRouter(
    prefix="/stats",
    tags=["Stats"],
)


@router.get("/", response_model=StatsOut)
async def stats(
    db: AsyncSession = Depends(get_db),
):
    # Total PDFs in DB
    result = await db.execute(
        select(func.count(Document.id))
    )
    total_documents = result.scalar() or 0

    # Latest upload time
    latest = await db.execute(
        select(Document)
        .order_by(Document.created_at.desc())
        .limit(1)
    )

    latest_doc = latest.scalar_one_or_none()

    last_sync = (
        latest_doc.created_at
        if latest_doc
        else None
    )

    health_score = (
        98 if total_documents > 0 else 0
    )

    return {
        "total_sources": total_documents,
        "pdf_documents": total_documents,
        "web_pages": 0,
        "databases": 0,
        "last_sync": last_sync,
        "health_score": health_score,
    }


@router.get(
    "/analytics",
    response_model=AnalyticsOut,
)
async def analytics(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(func.count(Document.id))
    )

    total_documents = (
        result.scalar() or 0
    )

    return {
        "total_questions": 0,
        "documents_processed": total_documents,
        "sources": total_documents,
    }


@router.get(
    "/documents",
    response_model=list[DocumentOut],
)
async def list_documents(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document)
        .order_by(
            Document.created_at.desc()
        )
        .limit(100)
    )

    return result.scalars().all()


@router.get(
    "/sync-logs",
    response_model=list[SyncLogOut],
)
async def recent_sync_logs(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SyncLog)
        .order_by(
            SyncLog.started_at.desc()
        )
        .limit(20)
    )

    return result.scalars().all()