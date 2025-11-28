# Deploy Backend to Vercel

## Step 1: Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

## Step 2: Deploy Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name: `envvault-backend` (or your choice)
   - Directory: `./` (current directory)
   - Override settings? **No**

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Step 3: Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables

Add these variables:

### Required:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT (generate with: `openssl rand -base64 32`)
- `TOKEN_HMAC_SECRET` - Random secret for token hashing (generate with: `openssl rand -base64 32`)
- `CORS_ORIGIN` - Your frontend URL: `https://envvault-three.vercel.app,http://localhost:5173`

### S3/MinIO:
- `S3_ENDPOINT` - Your S3 endpoint (e.g., AWS S3 URL or MinIO)
- `S3_ACCESS_KEY` - S3 access key
- `S3_SECRET_KEY` - S3 secret key
- `S3_BUCKET` - S3 bucket name (e.g., `envvault`)
- `S3_REGION` - S3 region (e.g., `us-east-1`)

### Optional:
- `PORT` - Leave default (Vercel handles this)
- `NODE_ENV` - Set to `production`

## Step 4: Update Frontend Environment Variable

1. Go to your **frontend** Vercel project
2. Settings → Environment Variables
3. Update `VITE_API_URL` to your backend URL:
   - Value: `https://envvault-backend.vercel.app` (or your backend URL)
4. Redeploy the frontend

## Step 5: Database Setup

You'll need a PostgreSQL database. Options:

### Option A: Railway (Recommended)
1. Go to https://railway.app
2. New → Database → PostgreSQL
3. Copy the connection string
4. Use it as `DATABASE_URL` in Vercel

### Option B: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Get the connection string from Settings → Database
4. Use it as `DATABASE_URL` in Vercel

### Option C: Neon
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Use it as `DATABASE_URL` in Vercel

## Step 6: Run Database Migrations

After setting up the database:

1. **Option A: Use Prisma Studio (local)**
   ```bash
   cd backend
   DATABASE_URL="your-database-url" npx prisma migrate deploy
   ```

2. **Option B: Use Vercel CLI**
   ```bash
   cd backend
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

3. **Option C: Use a migration script**
   Create a one-time script to run migrations on Vercel

## Step 7: S3 Setup

For production, use a real S3 service:

### AWS S3
- Create an S3 bucket
- Create IAM user with S3 access
- Use AWS credentials in environment variables

### Or use MinIO (if you have it deployed)
- Use your MinIO endpoint URL
- Use MinIO credentials

## Troubleshooting

### Build fails
- Check that `api/index.ts` exists
- Verify all dependencies are in `package.json`
- Check Vercel build logs

### CORS errors
- Make sure `CORS_ORIGIN` includes your frontend URL
- Check that frontend `VITE_API_URL` points to backend URL

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check that database allows connections from Vercel IPs
- Run migrations: `npx prisma migrate deploy`

### Function timeout
- Vercel has a 10-second timeout on Hobby plan
- Consider upgrading or optimizing your code

## Notes

- Vercel serverless functions have cold starts
- First request might be slower
- Consider using Vercel Pro for better performance
- Database should be accessible from the internet (not localhost)

