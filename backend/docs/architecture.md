# Architecture Overview

Enjay Smart HelpDesk AI uses a modern, scalable, enterprise-grade architecture designed to handle thousands of concurrent support agents and robust AI integrations.

## System Components

### 1. Monorepo (NPM Workspaces)
The project is strictly divided into two distinct workspaces:
- `/frontend`: A React 18 application built with Vite and SWC.
- `/backend`: A Node.js API server built with Express and TypeScript.

### 2. Backend Layered Architecture
The Express API adheres to strict domain separation to ensure testability and scalability:
- **Controllers** (`src/controllers`): Ultra-thin HTTP handlers. They extract metadata (like IP address and User-Agents), invoke the service layer, and format the response using a standardized `sendSuccess` wrapper. No business logic lives here.
- **Services** (`src/services`): The "brain" of the application. They enforce state machines, calculate SLA timestamps, and coordinate sub-services (like the Auto-Assignment routing engine).
- **Repositories** (`src/repositories`): The sole point of contact with the database. Repositories handle Prisma queries, abstract complex JOINs, and implement Concurrency controls.
- **Middlewares** (`src/middlewares`): Centralized logic for Global Error Handling (Pino), Authentication (JWT parsing), and Zod schema validation.

### 3. Core Enterprise Patterns

#### Optimistic Locking
To prevent the "Lost Update Anomaly" (where two agents edit a ticket simultaneously and overwrite each other), every Ticket contains a `version` integer. When a mutation occurs, the repository uses a compound `WHERE id = ? AND version = ?` query. If the version is stale, the transaction aborts with a `409 Conflict`.

#### Event Sourcing (Audit Trail)
HelpDesks require compliance tracking. Instead of merely updating state, every meaningful action (ticket created, status changed, routed, replied) writes an immutable record to the `TicketActivity` table. The frontend then dynamically merges these logs with `TicketComment` records to render a unified timeline.

#### Sequential Atomic IDs
Tickets utilize human-readable IDs (`HD-2026-000001`). To guarantee safety under extreme concurrency, sequence counters are pushed down directly to PostgreSQL via atomic `increment: 1` updates on a dedicated `TicketSequence` table.

#### Auto-Assignment Engine
The `RoutingService` dynamically maps `TicketCategory` to Team Queues. Depending on the `TeamSettings`, tickets are assigned to specific agents utilizing dynamic strategies like `LEAST_OPEN` tickets or stateless `ROUND_ROBIN` routing.