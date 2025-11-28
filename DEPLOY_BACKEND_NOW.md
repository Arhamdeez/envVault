# Deploy Backend to Vercel - Quick Start

## Your backend is NOT deployed yet!

The error shows: `DEPLOYMENT_NOT_FOUND` - this means the backend hasn't been deployed to Vercel.

## Step-by-Step: Deploy Backend

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click **"Add New Project"** (or **"New"** → **"Project"**)

2. **Import Your Repository**
   - Select your GitHub account
   - Find and select `envVault` repository
   - Click **"Import"**

3. **Configure Project**
   - **Project Name**: `envvault-backend` (or your choice)
   - **Framework Preset**: **Other** (or leave as auto-detect)
   - **Root Directory**: Click **"Edit"** and set to: `backend`
   - **Build Command**: `npm run build && npx prisma generate`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

4. **Add Environment Variables** (Click "Environment Variables")
   
   Add these **required** variables:
   
   ```
   DATABASE_URL=your-postgresql-connection-string
   JWT_SECRET=generate-random-secret-here
   TOKEN_HMAC_SECRET=generate-random-secret-here
   CORS_ORIGIN=https://envvault-three.vercel.app,http://localhost:5173
   S3_ENDPOINT=your-s3-endpoint
   S3_ACCESS_KEY=your-s3-access-key
   S3_SECRET_KEY=your-s3-secret-key
   S3_BUCKET=envvault
   S3_REGION=us-east-1
   NODE_ENV=production
   ```
   
   **Generate secrets:**
   ```bash
   openssl rand -base64 32  # Run twice for JWT_SECRET and TOKEN_HMAC_SECRET
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-5 minutes for build to complete

### Option 2: Deploy via CLI

```bash
cd backend
vercel login
vercel
# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name: envvault-backend
# - Directory: ./
# - Override settings? No

# Then add environment variables in Vercel dashboard
# Then deploy to production:
vercel --prod
```

## After Deployment

1. **Get your backend URL**
   - It will be something like: `https://envvault-backend.vercel.app`
   - Or check Vercel dashboard → Your project → Domains

2. **Update Frontend Environment Variable**
   - Go to your **frontend** Vercel project
   - Settings → Environment Variables
   - Update `VITE_API_URL` to your backend URL
   - Redeploy frontend

3. **Run Database Migrations**
   ```bash
   cd backend
   DATABASE_URL="your-database-url" npx prisma migrate deploy
   ```

## Quick Database Setup (If Needed)

### Railway (Easiest)
1. Go to https://railway.app
2. New → Database → PostgreSQL
3. Copy the connection string
4. Use as `DATABASE_URL` in Vercel

### Supabase (Free)
1. Go to https://supabase.com
2. Create project
3. Settings → Database → Connection string
4. Use as `DATABASE_URL` in Vercel

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Make sure `api/index.ts` exists
- Verify all dependencies in `package.json`

### CORS Still Not Working
- Make sure backend is deployed and running
- Check that `CORS_ORIGIN` includes your frontend URL
- Redeploy backend after setting environment variables

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Make sure database allows external connections
- Run migrations: `npx prisma migrate deploy`

