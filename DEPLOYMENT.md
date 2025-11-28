# Deployment Guide

## Frontend Deployment (SPA Routing Fix)

The 404 error occurs because React Router uses client-side routing. When you navigate directly to routes like `/dashboard` or refresh the page, the server tries to find those files and returns 404.

### Solution: Configure your hosting platform to serve `index.html` for all routes

## Vercel Deployment

1. **Create `vercel.json` in the root** (already created):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. **Deploy:**
```bash
cd frontend
npm run build
vercel --prod
```

Or connect your GitHub repo to Vercel - it will auto-detect the config.

## Netlify Deployment

1. **Create `netlify.toml` in the root** (already created)

2. **Or create `frontend/public/_redirects`** (already created):
```
/*    /index.html   200
```

3. **Deploy:**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

## Other Platforms

### GitHub Pages
Add to `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/envVault/', // Your repo name
  // ... rest of config
})
```

### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Apache (.htaccess)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Environment Variables

Make sure to set these in your hosting platform:

### Frontend
- `VITE_API_URL` - Your backend API URL (e.g., `https://api.yourapp.com`)

### Backend (if deploying separately)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT
- `TOKEN_HMAC_SECRET` - Random secret for token hashing
- `S3_ENDPOINT` - S3 endpoint URL
- `S3_ACCESS_KEY` - S3 access key
- `S3_SECRET_KEY` - S3 secret key
- `S3_BUCKET` - S3 bucket name
- `CORS_ORIGIN` - Your frontend URL (e.g., `https://yourapp.com`)

## Common Issues

### 404 on Refresh
✅ Fixed by adding rewrite rules (vercel.json, netlify.toml, etc.)

### CORS Errors
✅ Set `CORS_ORIGIN` in backend to match your frontend URL

### API Not Found
✅ Make sure `VITE_API_URL` is set correctly in frontend environment variables

### Build Fails
✅ Check Node.js version (needs 18+)
✅ Run `npm install` before building
✅ Check for TypeScript errors: `npm run build`

