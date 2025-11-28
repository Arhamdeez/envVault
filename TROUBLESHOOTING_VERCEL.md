# Troubleshooting Vercel Environment Variables

## Problem: Frontend Still Using localhost:3000

If your frontend is still trying to connect to `localhost:3000` after setting `VITE_API_URL`, follow these steps:

## Step 1: Verify Environment Variable is Set

1. Go to Vercel Dashboard → Your Frontend Project
2. Settings → Environment Variables
3. Check that `VITE_API_URL` exists with value: `https://envvault-backend.vercel.app`
4. Make sure it's enabled for **Production**, **Preview**, and **Development**

## Step 2: Force Redeploy (Clear Cache)

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. **IMPORTANT**: Uncheck **"Use existing Build Cache"** (this forces a fresh build)
5. Click **Redeploy**

## Step 3: Check Build Logs

After redeploying, check the build logs:

1. Click on the deployment
2. Scroll to **Build Logs**
3. Look for: `API URL: https://envvault-backend.vercel.app`
4. If you see `API URL: http://localhost:3000`, the variable isn't being read

## Step 4: Verify Variable Name

The variable name must be **exactly**:
- `VITE_API_URL` (all caps, with `VITE_` prefix)

Vite only reads variables that start with `VITE_`!

## Step 5: Check Preview vs Production

- **Preview deployments** (from git branches) use Preview environment variables
- **Production deployments** (from main branch) use Production environment variables
- Make sure the variable is set for the environment you're using

## Step 6: Manual Verification

After redeploying, open your deployed site and:

1. Open browser console (F12)
2. You should see: `API URL: https://envvault-backend.vercel.app`
3. If you see `API URL: http://localhost:3000`, the variable isn't set correctly

## Common Issues

### Issue 1: Variable Not Set for All Environments
**Solution**: Make sure `VITE_API_URL` is enabled for Production, Preview, AND Development

### Issue 2: Variable Name Wrong
**Solution**: Must be `VITE_API_URL` (not `API_URL` or `REACT_APP_API_URL`)

### Issue 3: Build Cache
**Solution**: Redeploy with "Use existing Build Cache" **unchecked**

### Issue 4: Preview Deployment
**Solution**: If you're on a preview URL, make sure the variable is set for Preview environment

## Quick Fix Checklist

- [ ] Variable name is `VITE_API_URL` (exactly)
- [ ] Value is `https://envvault-backend.vercel.app` (no trailing slash)
- [ ] Enabled for Production, Preview, and Development
- [ ] Redeployed with cache cleared
- [ ] Checked build logs for the API URL
- [ ] Verified in browser console after deployment

## Still Not Working?

1. Delete the environment variable
2. Add it again with the exact name `VITE_API_URL`
3. Redeploy with cache cleared
4. Check the deployment logs

