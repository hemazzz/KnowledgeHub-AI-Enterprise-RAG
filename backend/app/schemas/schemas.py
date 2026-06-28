from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from app.models.models import SourceType, SyncStatus


# ─── Source ────────────────────────────────────────

class SourceCreate(BaseModel):
    name: str
    type: SourceType
    uri: Optional[str] = None
    config: Optional[dict] = None


class SourceOut(BaseModel):
    id: str
    name: str
    type: SourceType
    uri: Optional[str]
    is_active: bool
    last_synced_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Document ──────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    source_id: str
    title: str
    file_name: Optional[str]
    total_chunks: int
    total_tokens: int
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat ──────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    question: str
    top_k: int = 5


class ChatMessageOut(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    sources_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionOut(BaseModel):
    id: str
    title: Optional[str]
    created_at: datetime
    messages: List[ChatMessageOut] = []

    class Config:
        from_attributes = True


# ─── Sync ──────────────────────────────────────────

class SyncLogOut(BaseModel):
    id: str
    source_id: str
    status: SyncStatus
    docs_processed: int
    chunks_created: int
    error_msg: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Stats ─────────────────────────────────────────

class StatsOut(BaseModel):
    total_sources: int
    pdf_documents: int
    web_pages: int
    databases: int
    total_documents: int
    total_chunks: int
    last_sync: Optional[datetime]
    health_score: float


# ─── Analytics ─────────────────────────────────────

class AnalyticsOut(BaseModel):
    total_questions: int
    active_sessions: int
    documents_processed: int
    avg_response_time_ms: float


# ─── Web scrape ────────────────────────────────────

class WebSourceCreate(BaseModel):
    name: str
    url: str
    max_pages: int = 10
