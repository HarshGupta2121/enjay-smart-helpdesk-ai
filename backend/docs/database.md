# Database Design

The database layer utilizes **PostgreSQL 18** managed via **Prisma ORM**. It is strictly typed, relational, and designed with high-performance dashboard indices and soft-delete capabilities.

## Core Domains

### 1. Identity & Access
- **`User`**: Core identity model storing `email`, `passwordHash`, and profile data. Handles relationships for both requested tickets and assigned tickets.
- **`Role`**: Dedicated table defining system-level RBAC (`ADMIN`, `MANAGER`, `ENGINEER`, `CUSTOMER`).
- **`RefreshToken`**: Cryptographically secure tokens stored as SHA-256 hashes to prevent session hijacking during database compromises.
- **`AuditLog`**: Tracks login attempts, logouts, token refreshes, and security anomalies with IP/User-Agent tracking.

### 2. Team & Routing
- **`Team`**: Departments or escalation tiers (e.g., "Billing", "IT Support").
- **`TeamMember`**: Explicit join table connecting Users to Teams. Includes an isolated `TeamRole` enum (`LEAD`, `ENGINEER`, `AGENT`) distinct from system-wide Roles.
- **`TeamSettings`**: Defines specific Service Level Agreement (SLA) timers per team and the algorithmic `AssignmentStrategy`.
- **`Queue`**: Sub-divisions within a team where unassigned tickets reside.

### 3. Ticket Engine
- **`Ticket`**: The aggregate root. Uses soft deletes (`deletedAt`), optimistic locking (`version`), and explicitly tracks SLA deadlines (`firstResponseDueAt`, `resolutionDueAt`).
- **`TicketComment`**: Contextual thread messages. Contains an `isInternal` flag to separate agent notes from customer-facing replies.
- **`TicketActivity`**: The immutable event-sourcing timeline.
- **`Attachment`**: Polymorphic design linking files to either a Ticket or a TicketComment, tracking metadata, `checksum`, and `virusScanned` status.

### 4. AI Readiness (Future-Proofing)
The `Ticket` model includes native fields for `aiSummary`, `aiSentiment`, `aiPriority`, `aiConfidence`, and `duplicateScore`. In future sprints, a native `Unsupported("vector(1536)")` column will be activated for `pgvector` semantic searches.