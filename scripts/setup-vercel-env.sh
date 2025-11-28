#!/bin/bash

# Helper script to set Vercel environment variables
# Usage: ./scripts/setup-vercel-env.sh

echo "🚀 Vercel Environment Variables Setup Helper"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

echo "This script will help you set environment variables for your Vercel projects."
echo ""
echo "You'll need:"
echo "  1. Your backend Vercel project name"
echo "  2. Your frontend Vercel project name"
echo "  3. Database connection string"
echo "  4. S3 credentials (or use AWS S3)"
echo ""
read -p "Press Enter to continue..."

# Generate secrets
echo ""
echo "🔐 Generating secrets..."
JWT_SECRET=$(openssl rand -base64 32)
TOKEN_HMAC_SECRET=$(openssl rand -base64 32)

echo "Generated JWT_SECRET: $JWT_SECRET"
echo "Generated TOKEN_HMAC_SECRET: $TOKEN_HMAC_SECRET"
echo ""

# Get project names
read -p "Enter your FRONTEND Vercel project name: " FRONTEND_PROJECT
read -p "Enter your BACKEND Vercel project name: " BACKEND_PROJECT
read -p "Enter your backend URL (e.g., https://envvault-backend.vercel.app): " BACKEND_URL
read -p "Enter your frontend URL (e.g., https://envvault-three.vercel.app): " FRONTEND_URL
read -p "Enter your DATABASE_URL: " DATABASE_URL
read -p "Enter your S3_ENDPOINT: " S3_ENDPOINT
read -p "Enter your S3_ACCESS_KEY: " S3_ACCESS_KEY
read -p "Enter your S3_SECRET_KEY: " S3_SECRET_KEY

echo ""
echo "📝 Setting Frontend Environment Variables..."
echo "Project: $FRONTEND_PROJECT"

cd frontend
vercel env add VITE_API_URL production <<< "$BACKEND_URL"
vercel env add VITE_API_URL preview <<< "$BACKEND_URL"
vercel env add VITE_API_URL development <<< "$BACKEND_URL"

echo ""
echo "📝 Setting Backend Environment Variables..."
echo "Project: $BACKEND_PROJECT"

cd ../backend
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add JWT_SECRET production <<< "$JWT_SECRET"
vercel env add TOKEN_HMAC_SECRET production <<< "$TOKEN_HMAC_SECRET"
vercel env add CORS_ORIGIN production <<< "$FRONTEND_URL,http://localhost:5173"
vercel env add S3_ENDPOINT production <<< "$S3_ENDPOINT"
vercel env add S3_ACCESS_KEY production <<< "$S3_ACCESS_KEY"
vercel env add S3_SECRET_KEY production <<< "$S3_SECRET_KEY"
vercel env add S3_BUCKET production <<< "envvault"
vercel env add S3_REGION production <<< "us-east-1"
vercel env add NODE_ENV production <<< "production"

echo ""
echo "${GREEN}✅ Environment variables set!${NC}"
echo ""
echo "Next steps:"
echo "1. Redeploy both frontend and backend projects"
echo "2. Run database migrations: cd backend && DATABASE_URL='$DATABASE_URL' npx prisma migrate deploy"

