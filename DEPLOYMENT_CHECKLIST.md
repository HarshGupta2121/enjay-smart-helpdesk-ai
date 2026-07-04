# Deployment Checklist (v1.0.0)

This checklist ensures all production environments are securely configured and provisioned.

## 1. Environment & Secrets
- [ ] Ensure Node.js v20+ is installed on the host machines.
- [ ] Configure PostgreSQL 15+ database (or deploy via `docker-compose up -d db`).
- [ ] Generate secure, random 256-bit keys for `JWT_SECRET` and `JWT_REFRESH_SECRET` in `backend/.env`.
- [ ] Verify `FRONTEND_URL` in `backend/.env` strictly matches the production frontend domain (e.g., `https://helpdesk.enjay.com`) to enforce CORS.
- [ ] Set `NODE_ENV=production` in both `frontend` and `backend` environments.
- [ ] Verify `VITE_API_BASE_URL` in `frontend/.env` points to the production backend (e.g., `https://api.helpdesk.enjay.com/api`).
- [ ] Configure `AI_PROVIDER` and corresponding API Keys (e.g., `OPENAI_API_KEY`) for Copilot features.

## 2. Database Initialization
- [ ] Run Prisma schema migrations against the production database: `npm run db:push --workspace=backend` (or `prisma migrate deploy` for formal migrations).
- [ ] Seed initial database roles and admin accounts: `npm run db:seed --workspace=backend`.
- [ ] If utilizing `pgvector` for Duplicate Detection, ensure the Postgres extension `vector` is enabled on the target database instance.

## 3. Build Processes
- [ ] Run `npm install` cleanly in the monorepo root.
- [ ] Execute `npm run build` from the root.
- [ ] Verify `frontend/dist/` contains the minified UI assets.
- [ ] Verify `backend/dist/` contains the compiled Express server code.

## 4. Execution & Process Management
- [ ] Launch the Backend using a process manager like PM2: `pm2 start dist/server.js --name "enjay-backend"`.
- [ ] Host the Frontend via a performant web server (Nginx/Apache) or managed CDN (Vercel/Netlify), configured to redirect all missing routes to `index.html` (SPA fallback).

## 5. Security Validation
- [ ] Access the backend `GET /api/health` and ensure it responds strictly over HTTPS.
- [ ] Attempt to access the backend from an unauthorized origin domain to verify CORS blocking.
- [ ] Ensure Swagger Docs (`/api/docs`) are disabled or placed behind authorization if internal API structures should not be publicly accessible in production.
