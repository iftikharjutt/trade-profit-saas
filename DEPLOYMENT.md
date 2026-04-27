# Trade Profit SaaS - Deployment Guide

## Backend (Railway / Render / VPS)
1. **Environment Variables**:
   - `DATABASE_URL`: Connection string to your PostgreSQL (Supabase/Neon).
   - `JWT_SECRET`: Random secure string for signing tokens.
   - `PORT`: Default is 4000.
   - `NODE_ENV`: Set to `production`.

2. **Build & Run**:
   ```bash
   cd server
   npm install
   npx prisma generate
   npm run build
   npm start
   ```

## Database (Supabase / Neon)
1. Create a new PostgreSQL instance.
2. Run migrations: `npx prisma migrate deploy`.

## Frontend (Vercel / Netlify)
1. Update API Base URL to point to your deployed backend.
2. `npm run build` and deploy.

## Security Notes
- Ensure CORS in `app.ts` is restricted to your frontend domain in production.
- Use HTTPS for all communications.
- Rotate `JWT_SECRET` periodically if needed.
