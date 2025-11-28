#!/bin/bash
# Run database migrations

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Migrations complete!"

