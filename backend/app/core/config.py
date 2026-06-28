from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "KnowledgeHub AI"
    app_env: str = "development"
    secret_key: str = "change-me-in-production"
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Database
    database_url: str = "postgresql+asyncpg://postgres:hema123@localhost:5432/knowledgehub"

    # AWS S3
    aws_access_key_id: str = "AKIA5YLOK2P53YFYWMSR"
    aws_secret_access_key: str = "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"
    aws_region: str = "ap-southeast-2"
    s3_bucket_name: str = "knowledgehub-docs-945661072379-ap-southeast-2-an"

    # ChromaDB
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_collection: str = "knowledgehub"

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_embed_model: str = "nomic-embed-text"
    ollama_chat_model: str = "llama3"

    # Chunking
    chunk_size: int = 512
    chunk_overlap: int = 64

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
