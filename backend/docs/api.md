# REST API Documentation

Base URL: `http://localhost:4000/api`

## Authentication (`/auth`)
- `POST /register`: Register a new customer.
- `POST /login`: Authenticate and receive an Access Token and an `HttpOnly` Refresh Token cookie.
- `POST /refresh-token`: Rotate tokens automatically via Axios interceptors.
- `POST /logout`: Revoke active tokens and clear browser cookies.
- `GET  /profile`: Fetch currently authenticated user payload.

## Ticket Engine (`/tickets`)
- `GET    /`: Fetch paginated, sortable, and filterable list of tickets.
- `POST   /`: Create a new ticket (Automatically routes to a Team queue and assigns SLAs).
- `GET    /:id`: Fetch a single ticket along with its unified chronological timeline (Comments + Activities).
- `PATCH  /:id/status`: Update the ticket status (Enforces strict State Machine rules and Optimistic Locking version checks).
- `POST   /:id/comments`: Add a public reply or internal note. (Agent replies automatically fulfill the `firstResponseAt` SLA).

## Team Management (`/teams`)
*(Protected by ADMIN / MANAGER roles)*
- `POST   /`: Create a new Team, defining custom SLA metrics and Assignment Strategies (e.g., `LEAST_OPEN`).
- `POST   /:id/members`: Assign a User to a Team Queue.
- `GET    /:id/members`: List all agents currently belonging to a Team.
- `POST   /:id/queues`: Create sub-queues for specific team escalations.