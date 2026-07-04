# Backend Architecture

The backend is built with Node.js, Express, and Prisma, leveraging a robust N-Tier structure designed for high availability and enterprise-grade security.

## Core Modules

- **Controllers**: Handle HTTP requests/responses and extract parameters.
- **Services**: Contain all core business logic (e.g., locking tickets, executing SLA rules, assigning agents).
- **Repositories**: Standardize Prisma database access.
- **Middlewares**: Enforce standard security (`errorHandler.ts`, `auth.middleware.ts`, `rbac.middleware.ts`).

## Ticket Engine

### State Machine
Tickets follow a strict state flow (`NEW` -> `OPEN` -> `PENDING` -> `RESOLVED` -> `CLOSED`). State transitions are strictly validated in the backend, rejecting impossible paths to maintain data integrity.

### Optimistic Locking
To prevent race conditions when multiple agents try to edit the same ticket simultaneously, `version` checking (optimistic concurrency control) is utilized natively through Prisma. Updates verify the expected version before committing transactions.

### Event Sourcing (Timeline)
All mutations—whether status changes, internal notes, or AI processing—produce immutable `TicketActivity` logs, creating a unified chronological timeline for complete accountability.

## Routing & Queues

### Auto-Assignment Module
When a ticket is created and marked as `NEW`, the routing engine analyzes the Category and determines the corresponding Team Queue. It applies dynamic assignment strategies configured per-team:
- **ROUND_ROBIN**: Assigns evenly in rotation.
- **LEAST_ACTIVE**: Assigns to the agent currently active in the system with the fewest closed tickets today.
- **LEAST_OPEN**: Assigns to the agent with the lowest number of actively assigned open tickets.

## Security Controls
- **JWT & Refresh Tokens**: Tokens are generated cryptographically. The backend verifies short-lived JWTs attached to HTTP headers, while long-lived Refresh Tokens are exchanged via secure `HttpOnly` cookies. Refresh tokens are hashed natively via `SHA-256` before persistence.
- **Helmet**: Secures the Express app by setting various HTTP headers.
- **CORS**: Strictly checks Cross-Origin requests. In production, only the defined frontend origin is permitted.

## API Documentation
The API adheres strictly to OpenAPI (Swagger) specifications.
In the development environment, navigate to `http://localhost:4000/api/docs` to view the live Swagger UI console and test endpoints interactively.
