# Railway Deployment Guide (Backend)

Deploying the Enjay Smart HelpDesk backend to Railway is straightforward. Follow this guide to correctly configure your Railway service.

## 1. Commands Setup

In your Railway service settings under the **Settings > Build** and **Settings > Deploy** tabs, configure the following:

- **Root Directory**: `backend` (If you are deploying from a monorepo structure, ensure Railway knows the context is the `backend` folder)
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

*Note: Since we added `"postinstall": "prisma generate"` to the `package.json`, Railway will automatically generate the Prisma Client after installing dependencies, ensuring the build succeeds.*

## 2. Environment Variables

In your Railway service, navigate to the **Variables** tab. Add the following required environment variables:

| Variable | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Sets the app to production mode (enforces secure CORS and logging). |
| `PORT` | `4000` | (Railway automatically injects `PORT`, but setting it explicitly is fine). |
| `DATABASE_URL` | *(Provided by Railway)* | The connection string to your PostgreSQL instance. |
| `JWT_SECRET` | `your-secure-random-string` | Essential for secure authentication. Do not use default/weak secrets. |
| `FRONTEND_URL` | `https://helpdesk.yourdomain.com` | The exact URL of your deployed frontend. Required for CORS and Secure Cookies. |
| `AI_PROVIDER` | `gemini` | Defines which LLM provider to use. |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key required for AI features. |

## 3. Database Migrations

Because Railway builds happen in a CI/CD environment, you need to apply your Prisma migrations to the production database.

**Option A (Recommended): Using Railway CLI / Release Command**
If you have configured a Custom Start Command, you can chain the migration before the server starts:
```bash
npx prisma migrate deploy && npm start
```

**Option B: Manual Execution via Railway Dashboard**
1. Open your backend service in the Railway dashboard.
2. Go to the **Variables** tab or the command palette (CMD/CTRL+K) and open a **Shell/Terminal**.
3. Run the following command to deploy your schema changes to the PostgreSQL database:
```bash
npx prisma migrate deploy
```
*(Do not use `prisma db push` or `prisma migrate dev` in production).*

## 4. Seeding the Database (Optional)

If you need to populate the database with default roles, categories, or the initial Admin user, run the seed command from the Railway terminal:
```bash
npm run db:seed
```