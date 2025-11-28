# Vercel Deployment Setup Guide

## Important: Configure Vercel Project Settings

If you're still getting 404 errors, you need to configure Vercel to use the correct root directory.

### Option 1: Configure in Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Click **Settings** → **General**
3. Under **Root Directory**, set it to: `frontend`
4. Under **Build and Output Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or leave empty, Vercel will auto-detect)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (or leave empty)
5. Click **Save**

### Option 2: Use vercel.json in Frontend Directory

The `frontend/vercel.json` file is already created with the correct configuration.

Make sure Vercel is building from the `frontend` directory:
- In Vercel Dashboard → Settings → General
- Set **Root Directory** to: `frontend`

### Option 3: Deploy Frontend Directory Directly

If you want to deploy just the frontend:

```bash
cd frontend
vercel --prod
```

This will use the `frontend/vercel.json` automatically.

## Verify Configuration

After updating settings, trigger a new deployment:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger auto-deploy

## Environment Variables

Make sure to set in Vercel Dashboard → Settings → Environment Variables:

- `VITE_API_URL` = Your backend API URL (e.g., `https://api.yourapp.com`)

## Testing

After deployment:
1. Visit your Vercel URL
2. Navigate to `/dashboard` or `/upload`
3. Refresh the page - should NOT show 404
4. All routes should work correctly

## Troubleshooting

### Still getting 404?
1. Check Vercel deployment logs for errors
2. Verify Root Directory is set to `frontend`
3. Verify `frontend/vercel.json` exists
4. Check that build completed successfully
5. Hard refresh browser (Cmd+Shift+R)

### Build fails?
1. Check Node.js version (needs 18+)
2. Check build logs in Vercel
3. Verify all dependencies are in package.json

