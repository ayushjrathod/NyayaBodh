#!/bin/bash

# setup-docker.sh - Setup script for NyayBodh Docker deployment

set -e

echo "🚀 Setting up NyayBodh Docker environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration values!"
    echo "   Required variables:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET_KEY" 
    echo "   - GROQ_API_KEY"
    echo ""
    read -p "Press Enter to continue once you've configured .env file..."
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
source .env

if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "postgresql://username:password@host:port/database" ]; then
    echo "❌ DATABASE_URL is not properly configured in .env file"
    exit 1
fi

if [ -z "$JWT_SECRET_KEY" ] || [ "$JWT_SECRET_KEY" = "your-secret-key-here-generate-a-secure-one" ]; then
    echo "❌ JWT_SECRET_KEY is not properly configured in .env file"
    exit 1
fi

if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" = "your-groq-api-key" ]; then
    echo "❌ GROQ_API_KEY is not properly configured in .env file"
    exit 1
fi

echo "✅ Environment variables validated!"

# Clean up previous builds
echo "🧹 Cleaning up previous Docker images..."
docker-compose down --remove-orphans
docker system prune -f

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo "🏥 Checking service health..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    echo "   Waiting for backend... ($i/30)"
    sleep 5
done

for i in {1..30}; do
    if curl -f http://localhost:7860/health > /dev/null 2>&1; then
        echo "✅ Frontend is healthy!"
        break
    fi
    echo "   Waiting for frontend... ($i/30)"
    sleep 5
done

echo ""
echo "🎉 NyayBodh is now running!"
echo "   Frontend: http://localhost:7860"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
