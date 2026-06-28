from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.models import Source, Document, SyncLog, ChatMessage, SourceType, SyncStatus
from app.services.vector_service import collection_count
from app.schemas.schemas import StatsOut, AnalyticsOut


async def get_stats(db: AsyncSession) -> StatsOut:
    # Source counts by type
    total_sources = (await db.execute(select(func.count(Source.id)))).scalar_one()
    pdf_sources = (await db.execute(
        select(func.count(Source.id)).where(Source.type == SourceType.pdf)
    )).scalar_one()
    web_sources = (await db.execute(
        select(func.count(Source.id)).where(Source.type == SourceType.web)
    )).scalar_one()
    db_sources = (await db.execute(
        select(func.count(Source.id)).where(Source.type == SourceType.database)
    )).scalar_one()

    total_docs = (await db.execute(select(func.count(Document.id)))).scalar_one()
    total_chunks = collection_count()

    last_sync_row = await db.execute(
        select(SyncLog.finished_at)
        .where(SyncLog.status == SyncStatus.success)
        .order_by(SyncLog.finished_at.desc())
        .limit(1)
    )
    last_sync = last_sync_row.scalar_one_or_none()

    # Simple health score:
    # - 40 pts if sources > 0
    # - 30 pts if synced within 24h
    # - 30 pts based on chunk density
    health = 0.0
    if total_sources > 0:
        health += 40
    if last_sync and (datetime.utcnow() - last_sync) < timedelta(hours=24):
        health += 30
    if total_chunks > 0:
        health += min(30, (total_chunks / 100) * 30)

    return StatsOut(
        total_sources=total_sources,
        pdf_documents=pdf_sources,
        web_pages=web_sources,
        databases=db_sources,
        total_documents=total_docs,
        total_chunks=total_chunks,
        last_sync=last_sync,
        health_score=round(health, 1),
    )


async def get_analytics(db: AsyncSession) -> AnalyticsOut:
    total_q = (await db.execute(
        select(func.count(ChatMessage.id)).where(ChatMessage.role == "user")
    )).scalar_one()

    active_sessions = (await db.execute(
        select(func.count(ChatMessage.session_id.distinct()))
        .where(ChatMessage.created_at >= datetime.utcnow() - timedelta(days=7))
    )).scalar_one()

    docs_processed = (await db.execute(
        select(func.coalesce(func.sum(SyncLog.docs_processed), 0))
        .where(SyncLog.status == SyncStatus.success)
    )).scalar_one()

    return AnalyticsOut(
        total_questions=total_q,
        active_sessions=active_sessions,
        documents_processed=docs_processed,
        avg_response_time_ms=0.0,
    )
