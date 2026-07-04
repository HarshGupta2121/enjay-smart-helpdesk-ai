# Quality Assurance (QA) Checklist - Release Candidate RC-1

This document tracks the explicit manual verification processes executed prior to the v1.0.0 release certification.

### 1. API Endpoint Verification
- [x] Verified `GET /api/health` returns status `200 OK`.
- [x] Verified `POST /api/auth/login` issues valid JWTs and HttpOnly Refresh cookies.
- [x] Verified `GET /api/tickets` respects pagination and filter query parameters.
- [x] Verified `PATCH /api/tickets/:id/status` correctly enforces the state machine.

### 2. Frontend Route Verification
- [x] Verified `/login` handles unauthenticated users and redirects authenticated ones.
- [x] Verified `/dashboard` loads successfully and displays aggregated queue states.
- [x] Verified `/tickets/new` exposes the ticket creation form to authorized roles.
- [x] Verified `/tickets/:id` successfully parses the URL parameter and renders the timeline.
- [x] Verified `*` generic wildcard properly renders the NotFound (`404`) boundary.

### 3. Authentication Flow Verification
- [x] Logged in successfully using valid credentials.
- [x] Simulated expired Access Token; verified Axios interceptors successfully rotate using the Refresh Token.
- [x] Verified "Log Out" gracefully clears cookies and local Zustand states.

### 4. Role Permissions Verification
- [x] Verified `CUSTOMER` roles cannot access the restricted `/users` or `/settings` dashboards.
- [x] Verified `AGENT` / `ENGINEER` roles can view tickets and mutate statuses but cannot modify system `Settings`.
- [x] Verified `ADMIN` role bypasses all RBAC restrictions.

### 5. AI Endpoints & Copilot Verification
- [x] Verified backend AI workers successfully classify priority and sentiment upon ticket creation.
- [x] Clicked "Draft with AI" in TicketDetails. Verified Skeleton loading state appears.
- [x] Verified `POST /api/tickets/:id/ai/reply` successfully returns contextual text.
- [x] Verified the Draft can be cleanly edited, copied, or inserted into the main editor.

### 6. Team Routing Verification
- [x] Verified that submitting a "Hardware" category ticket correctly routes to the IT Support queue.
- [x] Verified `ROUND_ROBIN` assignment successfully alternates between active agents.

### 7. Ticket Lifecycle Verification
- [x] Created `NEW` ticket; verified automatic sequence ID generation (e.g., HD-2026-000001).
- [x] Updated to `OPEN`; verified chronological `TicketActivity` log is rendered in the timeline.
- [x] Updated to `CLOSED`; verified the UI correctly locks the Reply box, preventing further comments.

### 8. Console Errors Check
- [x] Opened Chrome DevTools on all primary routes; verified zero unhandled Promise rejections or Redux/Zustand hydration errors.

### 9. Browser Warnings Check
- [x] Scanned UI for React `key` warnings in maps (specifically within `timeline.map()`). Resolved.
- [x] Verified no DOM nesting warnings (`<p>` inside `<p>`).

### 10. Accessibility (a11y) Check
- [x] Tabbed through the `TicketDetails.tsx` interface; verified Focus rings wrap correctly around inputs and buttons.
- [x] Verified ARIA labels on AI Copilot action buttons (`Regenerate`, `Copy`, `Insert`).

### 11. Responsive Layouts Check
- [x] Shrunk viewport to `< 768px`. Verified the Ticket Details grid collapses from 3 columns down to a unified vertical stack.
- [x] Verified the Sidebar navigational menu collapses into a mobile hamburger menu.

### 12. README Links Verification
- [x] Checked all relative Markdown paths inside `README.md`.
- [x] Ensured `docs/frontend.md` and `docs/ai.md` pointers correctly resolve.

### 13. Swagger Docs Verification
- [x] Navigated to `http://localhost:4000/api/docs`.
- [x] Verified `swagger-ui-express` parses the configuration.

### 14. Environment Variables Verification
- [x] Audited `.env.example` in both repositories. Ensured no hard-coded API Keys or active Database URLs were leaked.

### 15. Docker Deployment Verification
- [x] Validated `docker-compose.yml` mounts Postgres volumes successfully and opens port 5432.

### 16. Production Build Verification
- [x] Ran `npm run build` in the monorepo root.
- [x] Verified Vite compiled the frontend without exceeding the 500kB warning threshold (verified Lazy loading).
- [x] Verified `tsc` emitted the backend to `backend/dist`.
