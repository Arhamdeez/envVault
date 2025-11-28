# Backend Deployment Verification

## ⚠️ Current Issue

Your backend URL (`https://envvault-backend.vercel.app`) is returning HTML instead of API responses. This means the backend isn't deployed correctly.

## ✅ Verify Backend is Deployed

### Step 1: Check if Backend Project Exists

1. Go to https://vercel.com/dashboard
2. Look for a project named `envvault-backend` (or similar)
3. If it doesn't exist, you need to deploy it (see below)

### Step 2: Test Backend Endpoint

Run this command:
```bash
curl https://envvault-backend.vercel.app/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123"}'
```

**Expected:** JSON response (either success or error message)
**If you get HTML:** Backend is not deployed correctly

## 🚀 Deploy Backend (If Not Deployed)

### Quick Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click **"Add New Project"**

2. **Import Repository**
   - Select `envVault` from GitHub
   - Click **"Import"**

3. **Configure Project**
   - **Project Name**: `envvault-backend`
   - **Root Directory**: Click **"Edit"** → Set to: `backend`
   - **Framework Preset**: **Other** (or leave auto-detect)
   - **Build Command**: `npm run build && npx prisma generate`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

4. **Add Environment Variables** (BEFORE deploying)
   - Click **"Environment Variables"**
   - Add all required variables (see PRODUCTION_SETUP.md)
   - **IMPORTANT**: Add them BEFORE clicking Deploy

5. **Deploy**
   - Click **"Deploy"**
   - Wait 3-5 minutes

### After Deployment

1. **Get Backend URL**
   - Vercel will show: `https://envvault-backend-xxx.vercel.app`
   - Or check: Project → Settings → Domains

2. **Test Backend**
   ```bash
   curl https://envvault-backend.vercel.app
   ```
   Should return: `{"statusCode":404,"message":"Cannot GET /"}` (this is good - means backend is running!)

3. **Update Frontend**
   - Go to Frontend Vercel project
   - Settings → Environment Variables
   - Update `VITE_API_URL` to your backend URL
   - Redeploy frontend

## 🔍 Troubleshooting

### Backend Returns HTML
- ❌ Backend not deployed
- ❌ Wrong root directory (should be `backend`)
- ❌ Frontend deployed to backend project by mistake

### Backend Returns 404
- ✅ This is GOOD! Means backend is running
- ✅ API endpoints should work: `/auth/register`, `/auth/login`, etc.

### Backend Not Responding
- Check deployment logs in Vercel
- Check environment variables are set
- Check database connection

## 📋 Quick Checklist

- [ ] Backend project exists in Vercel
- [ ] Root directory is set to `backend`
- [ ] Environment variables are set
- [ ] Backend is deployed and running
- [ ] Backend URL returns 404 (not HTML)
- [ ] Frontend `VITE_API_URL` points to backend URL
- [ ] Frontend redeployed

