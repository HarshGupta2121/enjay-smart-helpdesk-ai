# Changelog

All notable changes to the Enjay Smart HelpDesk AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2026-07-04 (AI Prompt Optimization Sprint)

### Added
- **Deterministic AI Prompts**: Replaced single-sentence LLM instructions with robust enterprise system prompts preventing hallucinations and explicitly extracting first-name identities.
- **Markdown Reply Structure**: Enforced a strict 5-part architecture (Greeting, Issue Understanding, Suggested Resolution, Additional Info, Signature) for AI Copilot draft replies.
- **Markdown Summary Structure**: Refactored the background AI ticket analysis to emit structured Markdown indicating Root Causes, Recommended Actions, and Priority alignment.
- **Frontend Markdown Formatting**: Upgraded `TicketDetails.tsx` to leverage `whitespace-pre-wrap` rendering ensuring LLM-generated structural spacing parses correctly in the UI.

## [1.8.0] - 2026-07-04 (RBAC & Profile Management Sprint)

### Added
- **Deep Ticket RBAC**: Refactored `TicketService.getTickets` to deeply inject role-based data visibility constraints. Customers strictly view only requested tickets. Engineers view requested and assigned tickets. Managers view tickets across their managed teams. Admins retain global visibility.
- **My Tickets Compatibility**: Updated backend logic using OR condition arrays to allow frontend overrides (like `requesterId`) to blend safely with role constraints.
- **Profile Module API**: Added `PATCH /api/auth/profile` to securely update standard User entities independently, and `PATCH /api/auth/password` invoking strict BCrypt validations.
- **Profile Frontend**: Converted `Profile.tsx` from a placeholder into a highly interactive UI with discrete mutating forms for Personal Information and Security (password rotation). Connected directly to the global React Query store.

## [1.7.0] - 2026-07-04 (User Deletion & Safety Sprint)

### Added
- **Delete User Endpoint**: Introduced `DELETE /api/users/:id` with strict backend safety checks preventing users from deleting themselves or the last active `ADMIN` in the system.
- **Delete UI & Modal**: Added an explicit delete action button to the Users Management grid alongside a Shadcn confirmation modal.
- **Cache Invalidation**: Linked the deletion mutation to React Query for immediate, seamless cache synchronization and UI removal.

## [1.6.0] - 2026-07-04 (Users Management UI Sprint)

### Added
- **Add New User Workflow**: Fully integrated a native Shadcn Dialog supporting secure `POST /api/users` transactions with strict Zod validation on passwords and emails.
- **Edit User Workflow**: Pre-fills the modal and executes concurrent optimistic `PATCH` updates for `fullName`, `role`, and `isActive` statuses.
- **React Query Persistence**: Connected the UI mutators directly to the global cache, guaranteeing instant data-table refreshes without hard reloads.

## [1.5.0] - 2026-07-04 (Users Management & RBAC Sprint)

### Added
- **Users Management API**: Built the complete backend `UserController`, `UserService`, and `UserRepository` to support `GET /api/users`, enabling the frontend's system directory to function natively.
- **My Tickets RBAC**: Enforced Role-Based Access Control inside `ticket.controller.ts` preventing `CUSTOMER` accounts from fetching global tickets natively at the query level.
- **Enhanced Profile Endpoint**: Upgraded `GET /api/auth/profile` to strictly hydrate full User relational records, preventing "UNKNOWN" role UI states across the app.
- **Dynamic Avatars**: Automatically generated contextual profile avatars into the `prisma/seed.ts` file utilizing Pravatar generation.

## [1.4.0] - 2026-07-04 (Frontend Polish Sprint)

### Added
- **My Tickets Page**: Fully implemented user-specific ticket tracking with React Query, search, status filtering, and pagination.
- **All Tickets Page**: Complete global ticket directory for Admins and Managers with extensive filtering capabilities.
- **Users Directory**: Implemented the Users management dashboard with role-based filtering, semantic search, and robust error handling.
- **System Settings**: Built a comprehensive profile and settings dashboard connected to the backend auth profile, featuring an interactive Theme selection UI.

## [1.3.0] - 2026-07-04 (v1.0 Production Hardening)

### Added
- **Swagger UI / OpenAPI**: Integrated `swagger-ui-express` and `swagger-jsdoc` for interactive backend API documentation at `/api/docs`.
- **Global Error Boundary**: Added `react-error-boundary` to safely catch unhandled React exceptions and prevent blank screens.
- **Security Hardening**: Enforced strict CORS origin checks for production and integrated `helmet` for secure HTTP headers.
- **Route Code Splitting**: Implemented `React.lazy` and `Suspense` across all frontend routes to optimize bundle sizes and reduce initial load chunks.
- **Documentation**: Added comprehensive `docs/backend.md`.
- **Repository Hygiene**: Cleared all `.orig` and `.patch` diff artifacts.

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