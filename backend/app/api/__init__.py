from fastapi import APIRouter
from app.api.routes import sources, chat, stats, health, upload

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(sources.router)
api_router.include_router(chat.router)
api_router.include_router(stats.router)
api_router.include_router(upload.router)