# Quick Setup Guide

## Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ installed

## Step-by-Step Setup

### 1. Start Infrastructure Services
```bash
cd envvault
docker-compose up -d postgres minio
```

Wait for services to be healthy (about 10-20 seconds).

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file (or use defaults for local development):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/envvault"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="envvault"
S3_REGION="us-east-1"
PORT=3000
NODE_ENV=development
TOKEN_HMAC_SECRET="your-hmac-secret-change-in-production"
```

Run migrations:
```bash
npx prisma migrate dev
```

Start backend:
```bash
npm run start:dev
```

Backend will be available at http://localhost:3000

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000
```

Start frontend:
```bash
npm run dev
```

Frontend will be available at http://localhost:5173

### 4. Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin`

## First Use

1. Open http://localhost:5173
2. Register a new account
3. Upload a `.env` file
4. Save the encryption key that is shown (it won't be shown again!)
5. Share the link and key with the recipient

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL container is running: `docker ps`
- Check DATABASE_URL in backend/.env

### MinIO connection errors
- Ensure MinIO container is running: `docker ps`
- Check S3_ENDPOINT in backend/.env
- Access MinIO console to verify bucket creation

### Frontend can't connect to backend
- Check VITE_API_URL in frontend/.env
- Ensure backend is running on port 3000
- Check browser console for CORS errors

## Production Deployment

For production:
1. Change all secrets in `.env` files
2. Use real PostgreSQL database
3. Use real S3 (AWS S3, not MinIO)
4. Enable HTTPS
5. Set proper CORS origins
6. Use environment-specific configuration

