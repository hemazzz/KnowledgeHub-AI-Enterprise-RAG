# KnowledgeHub AI
### Enterprise Retrieval-Augmented Generation (RAG) Platform

KnowledgeHub AI is an enterprise-grade intelligent knowledge platform that enables users to upload documents, websites, and structured data and interact with them through an AI-powered conversational interface.

The platform leverages Retrieval-Augmented Generation (RAG), Vector Search, and Local Large Language Models to provide accurate and context-aware responses from private knowledge sources.

---

# Problem Statement

Organizations store information across multiple formats:

- PDF Documents
- Excel Files
- CSV Files
- Websites
- Internal Knowledge Bases

Finding information manually is time-consuming and inefficient.

KnowledgeHub AI solves this problem by transforming these data sources into an intelligent conversational knowledge assistant.

---

# Key Features

## Knowledge Source Integration
- PDF Upload and Processing
- CSV Upload and Processing
- Excel Upload and Processing
- Website Crawling
- Automatic Knowledge Synchronization

## AI Capabilities
- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Context-Aware Responses
- Streaming Responses
- Local LLM Integration using Ollama

## Enterprise Dashboard
- Knowledge Health Monitoring
- Analytics Dashboard
- Chat History
- Source Management
- Recent Updates Tracking

---

# System Architecture

                     User
                       │
                       ▼
              React Frontend (Vercel)
                       │
                       ▼
                  DuckDNS Domain
                       │
                       ▼
         FastAPI Backend (Docker Container)
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 PostgreSQL        ChromaDB         Ollama
 Metadata DB      Vector Store      Local LLM

---

# RAG Workflow

User Question
      │
      ▼
Generate Embedding
      │
      ▼
ChromaDB Similarity Search
      │
      ▼
Retrieve Relevant Chunks
      │
      ▼
Provide Context to LLM
      │
      ▼
Generate Final Answer

---

# Technology Stack

## Frontend
- React.js
- Vite
- Chart.js
- CSS

## Backend
- FastAPI
- SQLAlchemy
- PostgreSQL

## Artificial Intelligence
- Ollama
- DeepSeek
- Nomic Embeddings
- LangChain
- ChromaDB

## DevOps & Deployment
- Docker
- AWS EC2
- AWS S3
- DuckDNS
- GitHub

---

# Deployment Architecture

## Frontend
- Hosted on Vercel

## Backend
- Dockerized FastAPI application running on AWS EC2.

## Domain
- DuckDNS custom domain.

Example:


https://knowledgehub-ai.duckdns.org

## Storage
- AWS S3 for storing uploaded documents.

## Database
- PostgreSQL for metadata storage.

## Vector Database
- ChromaDB for semantic search and embeddings.

---

# Project Structure


KnowledgeHub-AI
│
├── backend
│
├── frontend
│
├── docs
│   ├── architecture.png
│   └── screenshots
│
├── README.md
├── docker-compose.yml
├── requirements.txt

---

# Installation

## Clone Repository


git clone https://github.com/hemazzz/KnowledgeHub-AI.git


---

# Backend Setup


cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload


---

# Frontend Setup

cd frontend

npm install

npm run dev


---

# Environment Variables

Create a `.env` file.


DATABASE_URL=

OLLAMA_BASE_URL=http://localhost:11434

OLLAMA_CHAT_MODEL=deepseek-r1

OLLAMA_EMBED_MODEL=nomic-embed-text

CHROMA_COLLECTION=knowledgehub

CHUNK_SIZE=512

CHUNK_OVERLAP=64

AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=

AWS_REGION=

S3_BUCKET_NAME=


---

# Docker Deployment

## Build Docker Image


docker build -t knowledgehub-ai .


## Run Container


docker run -p 8000:8000 knowledgehub-ai

---

# API Documentation


http://localhost:8000/docs


---

# Solution Approach

1. Upload knowledge sources.
2. Extract and preprocess content.
3. Generate embeddings.
4. Store embeddings in ChromaDB.
5. Perform semantic retrieval.
6. Generate responses using Ollama.
7. Display contextual answers to the user.

---

# Future Enhancements

- Multi-user Authentication
- Role-Based Access Control
- Kubernetes Deployment
- Real-time Synchronization
- Multi-modal Search
- Fine-tuned Domain Models

---

# Contributors

**Hema Dharshini**

Artificial Intelligence and Data Science

Sri Shakthi Institute of Engineering and Technology

---

