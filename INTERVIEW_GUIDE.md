# Engineering Interview Guide - Enjay Smart HelpDesk AI

If you are presenting this project in a technical interview, this guide outlines the key architectural decisions, trade-offs, and advanced patterns implemented in the codebase.

## 1. System Architecture
**Talking Point**: "I designed this as a strict N-Tier application using an npm workspaces monorepo."
- **Why?**: Separating the frontend and backend physically but maintaining them logically in one repo ensures synchronized deployments and shared typing potential without the overhead of microservices for a v1.0 product.
- **Backend Layers**: Routes -> Controllers -> Services -> Repositories. This decoupling ensures business logic (Services) is independent of HTTP transports (Controllers).

## 2. Concurrency & Optimistic Locking
**Talking Point**: "I anticipated race conditions where two agents might edit the same ticket simultaneously."
- **How it works**: Prisma is utilized to implement optimistic concurrency control using a `@default(1)` `version` integer. When a mutation occurs, the backend validates `WHERE id = X AND version = Y`. If the version mismatch occurs, the transaction is rejected, preventing data loss.

## 3. Security (Auth & RBAC)
**Talking Point**: "Authentication goes beyond simple JWTs; I implemented Refresh Token Rotation."
- **Details**: Short-lived access tokens (15m) run in memory/headers, while long-lived Refresh tokens (7d) exist as `HttpOnly` secure cookies.
- **Data Breach Mitigation**: Refresh tokens in the database are stored as SHA-256 hashes. If the DB is dumped, attackers cannot hijack active sessions without the raw cookie.

## 4. AI Intelligence Layer (Strategy Pattern)
**Talking Point**: "The AI Copilot was designed to be provider-agnostic to prevent vendor lock-in."
- **Details**: Built an `LLMProvider` abstract class. `OpenAIProvider`, `GeminiProvider`, and `OllamaProvider` extend it. The active provider is injected at runtime via the `AI_PROVIDER` environment variable.

## 5. Duplicate Detection (pgvector)
**Talking Point**: "I implemented semantic search natively in PostgreSQL rather than standing up ElasticSearch."
- **Details**: When a ticket is created, an embedding is generated. We query the database using the `<=>` Cosine Distance operator to find tickets with >80% semantic similarity, allowing agents to instantly spot duplicate outages.

## 6. Frontend Resilience
**Talking Point**: "The React frontend is optimized for enterprise scale and UX."
- **Details**: Features `React.lazy` route splitting, Global Error Boundaries to prevent white-screens, and React Query for optimistic UI mutations (instant feedback before the server responds).
