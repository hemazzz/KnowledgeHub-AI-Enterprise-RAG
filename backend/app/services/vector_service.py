import chromadb
from typing import List, Dict, Any
from app.core.config import get_settings

settings = get_settings()

_client = None


def get_chroma_client():
    global _client

    if _client is None:
        _client = chromadb.PersistentClient(
            path="./chroma_db"
        )

    return _client


def get_collection():
    client = get_chroma_client()

    return client.get_or_create_collection(
        name=settings.chroma_collection,
        metadata={"hnsw:space": "cosine"},
    )


def upsert_chunks(
    chunk_ids: List[str],
    embeddings: List[List[float]],
    documents: List[str],
    metadatas: List[Dict[str, Any]],
):
    collection = get_collection()

    collection.upsert(
        ids=chunk_ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )


def query_similar(
    embedding: List[float],
    top_k: int = 5,
    where: Dict | None = None,
):
    collection = get_collection()

    kwargs = {
        "query_embeddings": [embedding],
        "n_results": top_k,
        "include": [
            "documents",
            "metadatas",
            "distances",
        ],
    }

    if where:
        kwargs["where"] = where

    return collection.query(**kwargs)


def delete_by_source(source_id: str):
    collection = get_collection()

    results = collection.get(
        where={"source_id": source_id}
    )

    ids = results.get("ids", [])

    if ids:
        collection.delete(ids=ids)


def collection_count():
    try:
        return get_collection().count()
    except:
        return 0
