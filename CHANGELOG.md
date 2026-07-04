# Changelog

All notable changes to the Enjay Smart HelpDesk AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-04

### Added
- **AI Copilot Frontend**: Integrated AI capabilities natively into the Ticket Details page.
- **AI Draft Editor**: Agents can now use "Draft with AI" to generate AI replies and edit them before sending.
- **AI Summary Card**: Replaced mocked AI insights with dynamic backend connectivity (Summary, Category, Priority, Sentiment, Confidence Score).
- **Duplicate Ticket UI**: Built integration to seamlessly query and view semantically matching tickets via `useSimilarTickets`.

### Added
- **AI Intelligence Layer**: Introduced `ai.service.ts`, `llm.service.ts`, and `embedding.service.ts`.
- **Pluggable LLM Strategy**: Support for multiple AI providers (OpenAI, Gemini, Ollama) controlled via the `AI_PROVIDER` environment variable.
- **Asynchronous Processing**: Background job execution for ticket summarization and classification to ensure zero latency impact on frontend ticket creation.
- **Duplicate Ticket Detection**: Vector generation and Cosine Similarity mapping built to support native `pgvector` operators, with automatic fallback to in-memory processing for local environments.
- **AI Classification**: Auto-prediction of Ticket Category, Priority, and Sentiment with explicit confidence scoring.
- **Suggested Replies**: Added `POST /api/tickets/:id/ai/reply` to draft agent responses.

## [1.1.0] - 2026-07-04

### Added
- **Team Routing Module**: Added `Team`, `TeamMember`, `Queue`, and `TeamSettings` to the PostgreSQL database.
- **Auto-Assignment Engine**: Tickets are now automatically routed to team queues based on `TicketCategory`.
- **Algorithmic Assignment**: Agents can now be auto-assigned tickets based on custom team strategies (`ROUND_ROBIN`, `LEAST_OPEN`, `LEAST_ACTIVE`).
- **Team APIs**: Added endpoints for Team Management (`POST /api/teams`, `POST /api/teams/:id/members`, `POST /api/teams/:id/queues`).
- **Audit Trails**: Routing triggers immutable `TicketActivity` logs.

## [1.0.0] - 2026-07-04

### Added
- **Enterprise Monorepo**: Set up React frontend and Express backend using npm workspaces.
- **Authentication**: JWT, Refresh Token Rotation, Bcrypt hashing, HttpOnly cookies, and strict Role-Based Access Control.
- **Ticket Engine**: Strict State Machine enforcement, sequential numbering, and Optimistic Locking.
- **Frontend UI**: Dashboards, timelines, and ticket creation.