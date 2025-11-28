# Railway Database Setup for Vercel

## Which Variable to Use?

From your Railway PostgreSQL environment variables, you need:

### ✅ Use This: `DATABASE_URL`

```
postgresql://postgres:ITBmKPIyiuIzfINtzVxPyufsdNreXnTu@${{RAILWAY_PRIVATE_DOMAIN}}:5432/railway
```

**But wait!** Railway uses template variables (`${{...}}`). You need the **actual resolved value**.

## How to Get the Real Value

### Option 1: Railway Dashboard (Easiest)

1. Go to your Railway project
2. Click on your PostgreSQL service
3. Go to **Variables** tab
4. Find `DATABASE_URL`
5. Click the **eye icon** 👁️ to reveal the actual value
6. Copy the **full connection string** (it will look like):
   ```
   postgresql://postgres:ITBmKPIyiuIzfINtzVxPyufsdNreXnTu@containers-us-west-xxx.railway.app:5432/railway
   ```

### Option 2: Use Railway CLI

```bash
railway variables
# Find DATABASE_URL and copy the resolved value
```

### Option 3: Use DATABASE_PUBLIC_URL

If `DATABASE_URL` doesn't work (private domain issue), try:
```
postgresql://postgres:ITBmKPIyiuIzfINtzVxPyufsdNreXnTu@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/railway
```

But you still need to resolve the template variables.

## Quick Setup Steps

1. **Get the actual DATABASE_URL value** from Railway dashboard
2. **Go to Vercel** → Your Backend Project → Settings → Environment Variables
3. **Add:**
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres:ITBmKPIyiuIzfINtzVxPyufsdNreXnTu@containers-us-west-xxx.railway.app:5432/railway`
     (Use the actual resolved value from Railway)
   - Environment: Production, Preview, Development
4. **Save**
5. **Redeploy backend**

## Important Notes

- ✅ Use the **resolved value** (not the template with `${{...}}`)
- ✅ The password is: `ITBmKPIyiuIzfINtzVxPyufsdNreXnTu`
- ✅ The database name is: `railway`
- ✅ The user is: `postgres`
- ✅ Port is: `5432`

## Test Connection

After setting the variable, you can test it:

```bash
cd backend
DATABASE_URL="your-actual-connection-string" npx prisma db pull
```

If it works, the connection string is correct!

## Run Migrations

Once DATABASE_URL is set in Vercel:

```bash
cd backend
# Pull the actual value from Railway first
railway variables
# Then run migrations
DATABASE_URL="postgresql://postgres:ITBmKPIyiuIzfINtzVxPyufsdNreXnTu@containers-us-west-xxx.railway.app:5432/railway" npx prisma migrate deploy
```

Or set it in Vercel and migrations will run automatically on deploy (if configured).

