#!/bin/bash

# entrypoint.sh - Startup script for the NyayBodh API container

set -e

echo "Starting NyayBodh API container..."

# Wait for database to be ready
echo "Waiting for database connection..."
until python -c "
import os
from app.database import prisma
import asyncio

async def check_db():
    try:
        await prisma.connect()
        print('Database connected successfully')
        await prisma.disconnect()
        return True
    except Exception as e:
        print(f'Database connection failed: {e}')
        return False

result = asyncio.run(check_db())
exit(0 if result else 1)
"; do
    echo "Database is unavailable - sleeping"
    sleep 5
done

echo "Database is ready!"

# Apply database migrations
echo "Applying database migrations..."
prisma migrate deploy

# Generate Prisma client (redundant but safe)
echo "Ensuring Prisma client is generated..."
prisma generate

# Start the application
echo "Starting the application..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
