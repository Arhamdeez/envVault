# Production Setup Checklist

## ✅ Frontend Configuration

### 1. Set Environment Variable in Vercel

**Go to:** Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

**Add:**
- **Name**: `VITE_API_URL`
- **Value**: `https://envvault-backend.vercel.app` (your actual backend URL)
- **Environment**: ✅ Production ✅ Preview ✅ Development

**IMPORTANT:** 
- Variable name MUST be `VITE_API_URL` (Vite only reads variables starting with `VITE_`)
- No trailing slash in the URL
- Must redeploy after adding/updating

### 2. Redeploy Frontend

1. Go to **Deployments** tab
2. Click **three dots** (⋯) → **Redeploy**
3. **Uncheck** "Use existing Build Cache" (to ensure fresh build)
4. Click **Redeploy**

### 3. Verify

After deployment, open your site and check browser console (F12):
- Should see: `🔗 API URL: https://envvault-backend.vercel.app`
- Should NOT see: `🔗 API URL: http://localhost:3000`

## ✅ Backend Configuration

### 1. Deploy Backend to Vercel

If not already deployed:
1. Vercel Dashboard → Add New Project
2. Import `envVault` repository
3. Set **Root Directory** to: `backend`
4. Build Command: `npm run build && npx prisma generate`
5. Deploy

### 2. Set Environment Variables in Backend Vercel Project

**Go to:** Backend Vercel Project → Settings → Environment Variables

**Required Variables:**
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=<generate-random-secret>
TOKEN_HMAC_SECRET=<generate-random-secret>
CORS_ORIGIN=https://envvault-three.vercel.app,http://localhost:5173
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=envvault
S3_REGION=us-east-1
NODE_ENV=production
```

**Generate Secrets:**
```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For TOKEN_HMAC_SECRET
```

### 3. Redeploy Backend

After setting environment variables, redeploy the backend.

## ✅ Database Setup

### Option 1: Railway (Recommended)
1. https://railway.app
2. New → Database → PostgreSQL
3. Copy connection string
4. Use as `DATABASE_URL` in backend Vercel

### Option 2: Supabase (Free Tier)
1. https://supabase.com
2. Create project
3. Settings → Database → Connection string
4. Use as `DATABASE_URL` in backend Vercel

### Run Migrations
```bash
cd backend
DATABASE_URL="your-database-url" npx prisma migrate deploy
```

## ✅ S3 Setup

For production, use a real S3 service:

### AWS S3
1. Create S3 bucket
2. Create IAM user with S3 permissions
3. Use credentials in backend environment variables

### Or Use MinIO (if you have it deployed)
- Use your MinIO endpoint URL
- Use MinIO credentials

## 🔍 Troubleshooting

### Frontend Still Using localhost:3000?
1. ✅ Check `VITE_API_URL` is set in Vercel
2. ✅ Check it's enabled for Preview environment (if using preview URL)
3. ✅ Redeploy with cache cleared
4. ✅ Check browser console for API URL

### CORS Errors?
1. ✅ Backend is deployed and running
2. ✅ `CORS_ORIGIN` includes your frontend URL
3. ✅ Backend code has been redeployed with latest CORS fixes
4. ✅ Check backend allows Vercel preview URLs (code already updated)

### Backend Not Responding?
1. ✅ Check backend is deployed
2. ✅ Check environment variables are set
3. ✅ Check deployment logs for errors
4. ✅ Verify database connection

## 📋 Final Checklist

- [ ] Frontend `VITE_API_URL` set in Vercel
- [ ] Frontend redeployed
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Backend redeployed
- [ ] Database created and connected
- [ ] Database migrations run
- [ ] S3 configured
- [ ] Test registration/login works
- [ ] No CORS errors in console

