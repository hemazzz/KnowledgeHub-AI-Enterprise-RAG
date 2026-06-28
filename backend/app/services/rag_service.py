
import uuid
import json
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.models import ChatSession, ChatMessage
from app.services.ollama_service import (
    embed_text,
    chat_stream,
    build_rag_prompt,
)
from app.services.vector_service import query_similar


async def get_or_create_session(
    db: AsyncSession,
    session_id: str | None,
    title: str | None = None,
) -> ChatSession:
    if session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == session_id
            )
        )
        session = result.scalar_one_or_none()

        if session:
            return session

    session = ChatSession(
        id=str(uuid.uuid4()),
        title=title or "New conversation",
    )

    db.add(session)
    await db.flush()

    return session


async def rag_chat_stream(
    db: AsyncSession,
    session_id: str | None,
    question: str,
    top_k: int = 5,
) -> AsyncGenerator[str, None]:
    try:
        print("🚀 Starting RAG pipeline")

        # 1. Session
        session = await get_or_create_session(
            db,
            session_id,
            question[:60],
        )

        # 2. Save user message
        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session.id,
            role="user",
            content=question,
        )

        db.add(user_msg)
        await db.flush()

        # Send session id first
        yield f"[SESSION_ID:{session.id}]"

        print("✅ Session:", session.id)

        # 3. Embedding
        print("📌 Creating embedding...")
        question_embedding = await embed_text(
            question
        )

        # 4. Vector search
        print("📌 Searching vector DB...")
        results = query_similar(
            question_embedding,
            top_k=1,
        )

        context_chunks = results.get(
            "documents",
            [[]],
        )[0]

        source_metadatas = results.get(
            "metadatas",
            [[]],
        )[0]

        print(
            "✅ Retrieved chunks:",
            len(context_chunks),
        )

        print(
            "========== CONTEXT =========="
        )

        for i, c in enumerate(
            context_chunks
        ):
            print(
                f"Chunk {i + 1}:"
            )
            print(c[:1000])
            print(
                "-------------------"
            )

        # 5. Build prompt
        messages = build_rag_prompt(
            question,
            context_chunks,
        )

        full_response = ""

        print("📌 Calling Ollama...")

        try:
            async for token in chat_stream(
                messages
            ):
                full_response += token
                yield token

        except Exception as e:
            print(
                "❌ Ollama streaming error:",
                str(e),
            )

            error_msg = (
                "Unable to generate response."
            )

            full_response = error_msg
            yield error_msg

        print(
            "✅ Streaming finished"
        )

        # 6. Save assistant response
        sources_json = json.dumps(
            [
                m.get("document_id")
                for m in source_metadatas
            ]
        )

        assistant_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session.id,
            role="assistant",
            content=full_response,
            sources_used=sources_json,
        )

        db.add(assistant_msg)

        if (
            session.title
            == "New conversation"
        ):
            session.title = question[:60]

        await db.commit()

        print(
            "✅ Assistant message saved"
        )

    except Exception as e:
        print(
            "❌ RAG ERROR:",
            str(e),
        )

        await db.rollback()

        yield (
            "Something went wrong while "
            "processing your request."
        )