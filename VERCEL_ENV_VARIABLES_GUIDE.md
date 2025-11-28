# How to Add Backend URL to Frontend Vercel Project

## Step-by-Step Guide

### Step 1: Go to Your Frontend Vercel Project

1. Open https://vercel.com/dashboard
2. Find and click on your **frontend** project (likely named `envvault-three` or similar)

### Step 2: Navigate to Environment Variables

1. Click on **Settings** (in the top navigation)
2. Click on **Environment Variables** (in the left sidebar)

### Step 3: Add the Environment Variable

1. Click the **"Add New"** button (or **"Add"** button)
2. Fill in the form:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://envvault-backend.vercel.app`
   - **Environment**: 
     - ✅ Check **Production**
     - ✅ Check **Preview** 
     - ✅ Check **Development**
3. Click **Save**

### Step 4: Redeploy Your Frontend

After adding the environment variable, you need to redeploy:

1. Go to **Deployments** tab (in the top navigation)
2. Find your latest deployment
3. Click the **three dots** (⋯) on the right
4. Click **Redeploy**
5. Make sure **"Use existing Build Cache"** is checked (optional, but faster)
6. Click **Redeploy**

### Step 5: Verify It Works

1. Wait for the deployment to complete (1-3 minutes)
2. Visit your frontend URL (e.g., `https://envvault-three.vercel.app`)
3. Try to register/login
4. Check browser console (F12) - you should see the API URL logged
5. No more CORS errors!

## Visual Guide

```
Vercel Dashboard
  └── Your Frontend Project (envvault-three)
      └── Settings
          └── Environment Variables
              └── Add New
                  Name: VITE_API_URL
                  Value: https://envvault-backend.vercel.app
                  Environment: ✅ Production ✅ Preview ✅ Development
                  └── Save
```

## Important Notes

- **No trailing slash**: Use `https://envvault-backend.vercel.app` (not `https://envvault-backend.vercel.app/`)
- **Must redeploy**: Environment variables only take effect after redeployment
- **All environments**: Make sure to check all three environments (Production, Preview, Development) so it works everywhere

## Troubleshooting

### Still seeing localhost:3000?
- Make sure you redeployed after adding the variable
- Check that the variable name is exactly `VITE_API_URL` (case-sensitive)
- Verify the value doesn't have a trailing slash

### CORS errors?
- Make sure your backend has `CORS_ORIGIN` set to include your frontend URL
- Backend should have: `CORS_ORIGIN=https://envvault-three.vercel.app,http://localhost:5173`

### Variable not showing in build?
- Check the deployment logs in Vercel
- Make sure the variable is added to the correct project (frontend, not backend)
- Verify the variable is saved (refresh the page and check)

