# Enjay Smart HelpDesk AI

A production-ready Enterprise SaaS HelpDesk application built with modern architecture and AI readiness.

## Project Structure
This repository utilizes an npm workspaces monorepo architecture:
- `/frontend` - React application (Vite, TailwindCSS, shadcn/ui, Zustand, React Query)
- `/backend`  - Express API server (Node.js, Prisma, PostgreSQL, Zod, Pino)

## Current Implemented Features

### 1. Enterprise Authentication Engine
- **Users Management**: Fully implemented Users module with paginated directory queries via `GET /api/users`, and active mutators for creating (`POST`) updating (`PATCH`), and securely deleting (`DELETE`) user details directly from the Dashboard.
- **Profile Resolution**: Extends default JWT validation by dynamically hydrating `/api/auth/profile` responses with rich, relational entity data including active avatars and explicit Role labels.
- Highly secure registration and login via standard JWT structure.
- **Refresh Token Rotation**: Automatic token refresh seamlessly handled by Axios interceptors avoiding 401 logouts.
- **Security Context**: Cryptographically generated Refresh Tokens are stored natively as hashed `SHA-256` tokens in PostgreSQL avoiding complete compromise during DB breaches.
- **Role-Based Access Control (RBAC)**: Centralized backend middleware enforcing roles (`ADMIN`, `MANAGER`, `ENGINEER`, `CUSTOMER`) protecting API surfaces.
- **Security Mitigations**: Native `HttpOnly`, `Secure`, and `SameSite` cookies.

### 2. Core Ticket Engine (Backend)
- Robust strict-mode **State Machine** restricting ticket transitions (e.g. `NEW -> RESOLVED`, catching invalid paths like `NEW -> CLOSED`).
- **Concurrency / Optimistic Locking**: A native locking mechanism protecting tickets from being overwritten simultaneously by different agents.
- **Sequential Ticketing**: Atomic database-driven `TicketSequence` generation ensuring collision-free human readable IDs (e.g., `HD-2026-000001`).
- **SLA Generation & Auto-Fulfillment**: Engine dynamically attaches SLA deadlines based on priorities and automatically fulfills `firstResponseTime` upon initial agent replies.
- **Unified Timeline Event Sourcing**: Every comment, attachment, and systemic change strictly emits a chronological `TicketActivity` audit log.

### 3. Team Routing & Auto-Assignment (Backend)
- **Dynamic Queues**: Support for discrete Teams (Billing, IT Support) and unlimited Sub-Queues.
- **Auto-Assignment Strategies**: The Routing Service analyzes incoming categories and automatically assigns the best agent utilizing advanced strategies (`ROUND_ROBIN`, `LEAST_ACTIVE`, `LEAST_OPEN`).
- **Custom SLAs**: Individual teams possess isolated, overriding metrics for First Response and Resolution Service Level Agreements.

### 4. AI Intelligence Layer
- **Pluggable Architecture**: Supports hot-swapping between `OPENAI`, `GEMINI`, and local `OLLAMA` providers via Strategy patterns.
- **Asynchronous Processing**: Background workers generate 1-sentence summaries and classify priority, category, and sentiment dynamically upon ticket creation.
- **Duplicate Ticket Detection**: Natively supports semantic matching via `pgvector` operators to detect duplicate outages across the platform with automatic in-memory fallbacks for local dev environments.
- **Agent Copilot**: Exposes `/ai/reply` to draft immediate, context-aware responses to user queries.

### 5. Frontend Foundation & Dashboards
- Zustand global persistence for active user sessions.
- Comprehensive Dark/Light/System theme toggling integration via Tailwind.
- **Enterprise HelpDesk Overview**: A responsive top-level dashboard with active queue cards (Total, Open, Pending, Urgent) and a functional search and status/priority-filtered Ticket List table rendering skeleton states during data fetches.
- **Ticket Details UI**: A rich Jira-like unified chronological timeline stacking comments against system audit logs securely formatted alongside interactive AI cards and intelligent SLA timers.
- **Interactive Mutators**: Connected React Query endpoints for instant, optimistic status updates, public replies, and internal team notes.
- **AI Copilot Integration**: Agent-facing draft generator and editor directly inside the ticket workspace.

## Screenshots

*(Coming Soon: Add screenshots of the dark mode Dashboard and Ticket Details timeline here)*

## Sprint History
- **Sprint 1**: Project Foundation (Monorepo, ESLint, Prisma schema, Docker initialization).
- **Sprint 2**: Authentication Sprint (JWT, Refresh Tokens, Bcrypt, Role schema, Zod, Security Audit & Hardening).
- **Sprint 3**: Backend Ticket Engine (Optimistic locking, Timeline merge, Event Sourcing, SLAs, Automated End-to-End Tests).
- **Sprint 4**: Frontend Foundation (React Router layout, Axios interceptors, Zustand auth store).
- **Sprint 5**: Enterprise Dashboard Overview (Data Tables, server-side pagination layout, unified filters).
- **Sprint 6**: Ticket Details UI (Unified timeline mapping, AI analysis cards, SLA sidebar, pure front-end mock layout without active mutations).
- **Sprint 7**: Backend Team & Routing Module (Team Queues, Round-Robin Auto-Assignment, `LEAST_OPEN` strategies).
- **Sprint 8**: AI Intelligence Sprint (Pluggable LLM, pgvector Duplicate Detection, Automatic Summarization).
- **Sprint 9**: AI Copilot Frontend (React Query integrations, Editable Drafts, Similar Ticket UI, Semantic layout updates).
- **v1.0 Release**: Production Hardening (Global Error Boundaries, React.lazy Code Splitting, Strict CORS, Helmet Security Headers, Swagger OpenAPI Documentation, Repository Hygiene).
- **Sprint 10**: Frontend Polish & Production UI Completion (Fully implemented My Tickets, All Tickets, Users Directory, and Profile Settings pages with React Query and shadcn/ui).
- **Sprint 11**: Strict Backend RBAC & User Profile Module (Deep ticket visibility scoping for ENGINEER/MANAGER/CUSTOMER roles, Profile mutators, Password rotations).
- **Sprint 12**: AI Prompt Engineering Optimization (Production-grade Markdown formatting, hallucination prevention directives, deterministic resolution tracking).

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL 17/18 (Running locally on port 5432)

### Environment Setup
1. Copy the `.env.example` files to `.env` in both `/frontend` and `/backend`.
2. Install monorepo dependencies:
   ```bash
   npm install
   ```
3. Sync database migrations:
   ```bash
   npm run db:push --workspace=backend
   ```
4. Seed administrative roles:
   ```bash
   npm run db:seed --workspace=backend
   ```

### Development
Start the full stack environment natively concurrently:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:4000`.