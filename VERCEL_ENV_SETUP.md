# Vercel Environment Variables Setup

## Problem
Your deployed frontend is trying to connect to `http://localhost:3000`, but it needs to connect to your deployed backend.

## Solution

### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel Dashboard
2. Select your project (`envvault-three`)
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.railway.app` or `https://api.yourapp.com`)
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**

### Step 2: Update Backend CORS

Your backend needs to allow requests from your Vercel frontend.

Update `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'http://localhost:5173', // Local development
    'https://envvault-three.vercel.app', // Your Vercel frontend
    process.env.CORS_ORIGIN || 'http://localhost:5173',
  ],
  credentials: true,
});
```

Or set `CORS_ORIGIN` environment variable in your backend to:
```
CORS_ORIGIN=https://envvault-three.vercel.app
```

### Step 3: Redeploy

After setting the environment variable:
1. Go to **Deployments** in Vercel
2. Click **Redeploy** on the latest deployment
3. The new build will use the `VITE_API_URL` environment variable

## Backend Deployment Options

You need to deploy your backend somewhere. Options:

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your `envvault` repo
4. Set Root Directory to `backend`
5. Add environment variables:
   - `DATABASE_URL` (Railway can provision PostgreSQL)
   - `JWT_SECRET`
   - `TOKEN_HMAC_SECRET`
   - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
   - `CORS_ORIGIN=https://envvault-three.vercel.app`

### Option 2: Render
Similar to Railway, deploy backend as a web service.

### Option 3: Vercel (Backend)
You can also deploy the backend to Vercel, but you'll need to:
- Set up a separate Vercel project for backend
- Configure it properly for NestJS

## Quick Fix for Testing

If you want to test quickly, you can temporarily:
1. Use a service like ngrok to expose your local backend
2. Set `VITE_API_URL` in Vercel to the ngrok URL
3. Update backend CORS to allow the Vercel frontend

But for production, deploy the backend properly.

