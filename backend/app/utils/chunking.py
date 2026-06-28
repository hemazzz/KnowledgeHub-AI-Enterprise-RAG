from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import get_settings

settings = get_settings()


def get_splitter() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""],
    )


def chunk_text(text: str) -> list[str]:
    """Split raw text into chunks."""
    splitter = get_splitter()
    chunks = splitter.split_text(text)
    return [c.strip() for c in chunks if c.strip()]


def chunk_documents(docs: list[str]) -> list[str]:
    """Split multiple documents and flatten."""
    splitter = get_splitter()
    all_chunks = []
    for doc in docs:
        all_chunks.extend(splitter.split_text(doc))
    return [c.strip() for c in all_chunks if c.strip()]


def estimate_tokens(text: str) -> int:
    """Rough token estimate — 1 token ≈ 4 chars."""
    return max(1, len(text) // 4)


def count_tokens_in_chunks(chunks: list[str]) -> int:
    return sum(estimate_tokens(c) for c in chunks)
