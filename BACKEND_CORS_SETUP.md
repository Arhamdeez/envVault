# Backend CORS Setup for Vercel

## Problem
Your backend is blocking requests from your Vercel frontend due to CORS policy.

## Solution: Set CORS_ORIGIN in Backend Vercel Project

### Step 1: Go to Backend Vercel Project

1. Go to https://vercel.com/dashboard
2. Find and click on your **backend** project (`envvault-backend`)

### Step 2: Add CORS_ORIGIN Environment Variable

1. Click **Settings** → **Environment Variables**
2. Click **Add New**
3. Fill in:
   - **Name**: `CORS_ORIGIN`
   - **Value**: `https://envvault-three.vercel.app,https://envvault-*.vercel.app,http://localhost:5173`
   
   Or for more specific control:
   ```
   https://envvault-three.vercel.app,https://envvault-3wpfje3mq-arhams-projects-45d226e3.vercel.app,http://localhost:5173
   ```
   
   **Note**: You can use wildcards or list specific URLs separated by commas
   
4. **Environment**: Check all three:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **Save**

### Step 3: Redeploy Backend

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (1-2 minutes)

### Step 4: Test

1. Go back to your frontend
2. Try to register/login again
3. CORS errors should be gone!

## Alternative: Allow All Vercel Domains

If you want to allow all Vercel preview deployments automatically, I've updated the code to accept any URL matching the pattern:
- `https://envvault*.vercel.app`

This way you don't need to add every preview URL manually.

## Current CORS Configuration

The backend now:
- ✅ Allows origins from `CORS_ORIGIN` environment variable
- ✅ Automatically allows any `https://envvault*.vercel.app` URLs
- ✅ Allows `http://localhost:5173` for local development
- ✅ Supports credentials (cookies/auth headers)

## Quick Fix

**Minimum required**: Set `CORS_ORIGIN` in backend Vercel project to:
```
https://envvault-three.vercel.app,http://localhost:5173
```

Then redeploy the backend.

