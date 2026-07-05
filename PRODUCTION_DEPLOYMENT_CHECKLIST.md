# Production Deployment Checklist

## 1. Database Preparation
- [ ] Provision a production PostgreSQL database.
- [ ] Set \DATABASE_URL\ in the production environment.
- [ ] Run database migrations (\
px prisma migrate deploy\).
- [ ] Seed the database if necessary (\
pm run db:seed\).

## 2. Backend Environment Variables
Ensure the following variables are set in your production environment:
- [ ] \NODE_ENV=production\
- [ ] \PORT=4000\ (or your host's expected port)
- [ ] \DATABASE_URL\
- [ ] \JWT_SECRET\ (Must be a secure, random string)
- [ ] \FRONTEND_URL\ (e.g., \https://helpdesk.yourdomain.com\)
- [ ] \AI_PROVIDER\ and \GEMINI_API_KEY\ (if AI features are used)
- [ ] \LOG_LEVEL=info\ (or \warn\/\error\ to reduce log noise)

## 3. Frontend Environment Variables
- [ ] Set \VITE_API_URL\ to point to your production backend (e.g., \https://api.yourdomain.com/api\).

## 4. Building the Application
- [ ] **Backend**: Run \
pm run build\ and ensure the \dist/\ folder is generated. Start the app using \
ode dist/server.js\.
- [ ] **Frontend**: Run \
pm run build\. Serve the \dist/\ folder using a static host (Vercel, Netlify, Nginx, S3).

## 5. Security & Networking
- [ ] Ensure the backend is behind a reverse proxy (e.g., Nginx, ALB) that handles HTTPS/SSL termination.
- [ ] Verify CORS settings (backend only allows requests from \FRONTEND_URL\).
- [ ] Ensure cookies (like the Refresh Token) have the \Secure\ flag active (this requires HTTPS).

## 6. Cleanup Verification
- [ ] Ensure no development scripts, tests, or AI agent directories are deployed to the server.
- [ ] Ensure \.env\ files are NOT committed to version control.
