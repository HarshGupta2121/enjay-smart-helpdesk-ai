# Enjay Smart HelpDesk AI

A production-ready SaaS application foundation.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS, shadcn/ui, React Query
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Tooling**: ESLint, Prettier, npm workspaces, Docker

## Project Structure
This repository uses npm workspaces for a monorepo setup:
- `/frontend` - React application (Vite)
- `/backend` - Express API server

## Getting Started

### Prerequisites
- Node.js (v20+)
- npm (v10+)
- Docker & Docker Compose

### Environment Setup
1. Copy the environment variables examples in both apps:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`

2. Start the PostgreSQL database:
   ```bash
   docker-compose up -d
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run Prisma database migrations:
   ```bash
   npm run db:push
   ```

### Development
Start the development servers for both frontend and backend concurrently:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:4000`.
