# Quick Setup - Minimal Steps

## TL;DR - What You Actually Need to Do

### Frontend (2 steps)
1. **Vercel Dashboard** → Frontend Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://envvault-backend.vercel.app`
   - Enable for: Production, Preview, Development
2. **Redeploy** frontend

### Backend (3 steps)
1. **Deploy backend** to Vercel (if not done)
   - Root Directory: `backend`
2. **Set environment variables** in backend Vercel project:
   - `DATABASE_URL` - Your PostgreSQL URL
   - `JWT_SECRET` - Random secret (generate: `openssl rand -base64 32`)
   - `TOKEN_HMAC_SECRET` - Random secret (generate: `openssl rand -base64 32`)
   - `CORS_ORIGIN` - `https://envvault-three.vercel.app,http://localhost:5173`
   - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`
3. **Redeploy** backend

### Database (1 step)
- Create PostgreSQL database (Railway/Supabase/Neon)
- Run migrations: `DATABASE_URL="..." npx prisma migrate deploy`

---

## Automated Helper Script

I've created a helper script that makes this easier:

```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

This script will:
- Generate secrets for you
- Guide you through setting all variables
- Use Vercel CLI to set them automatically

**Requirements:**
- Vercel CLI installed: `npm i -g vercel`
- You need to be logged in: `vercel login`

---

## Why Manual?

Environment variables contain **secrets** (passwords, API keys, database URLs). They:
- ❌ **Cannot** be committed to git (security risk)
- ✅ **Must** be set in Vercel dashboard (or via CLI)
- ✅ Are encrypted and stored securely by Vercel

---

## Fastest Path

1. **Use the helper script** (`./scripts/setup-vercel-env.sh`)
2. Or **copy-paste** from the checklist below

### Frontend Variables (Copy-Paste)
```
VITE_API_URL=https://envvault-backend.vercel.app
```

### Backend Variables (Copy-Paste)
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=<run: openssl rand -base64 32>
TOKEN_HMAC_SECRET=<run: openssl rand -base64 32>
CORS_ORIGIN=https://envvault-three.vercel.app,http://localhost:5173
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=envvault
S3_REGION=us-east-1
NODE_ENV=production
```

---

## That's It!

The helper script automates as much as possible. The rest (database setup, S3 setup) you need to do once, then you're done!

