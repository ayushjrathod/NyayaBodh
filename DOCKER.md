# Docker Setup for NyayBodh

This document explains how to set up and run NyayBodh using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for containers

## Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your actual values:
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `DIRECT_URL`: Direct database connection (usually same as DATABASE_URL)
   - `JWT_SECRET_KEY`: A secure random string for JWT signing
   - `GROQ_API_KEY`: Your Groq API key for AI services

## Building and Running

### Development

1. Build and start all services:

   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:7860
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Production

For production deployment, consider:

1. Using specific image tags instead of building from source
2. Setting up proper logging and monitoring
3. Using a reverse proxy (nginx/traefik) for SSL termination
4. Implementing proper backup strategies for data

## Services

### Frontend (client/)

- **Technology**: React + Vite
- **Base Image**: node:18-alpine (build) + nginx:alpine (runtime)
- **Port**: 80 (mapped to 7860 for HF Spaces compatibility)
- **Health Check**: `curl -f http://localhost/health`

### Backend (api/)

- **Technology**: FastAPI + Python 3.10
- **Base Image**: python:3.10-slim
- **Port**: 8000
- **Health Check**: `curl -f http://localhost:8000/health`

## Docker Features

### Security

- Non-root users in containers where possible
- Minimal base images (alpine/slim)
- .dockerignore files to exclude unnecessary files
- Security headers in nginx configuration

### Performance

- Multi-stage builds for smaller final images
- Gzip compression enabled
- Static asset caching
- Health checks for proper orchestration

### Development

- Volume mounts available for development (uncomment in docker-compose.yml)
- Hot reloading support
- Proper logging configuration

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Ensure DATABASE_URL is correctly formatted
   - Check if database server is accessible
   - Verify credentials

2. **Frontend Not Loading**

   - Check if backend is healthy: `curl http://localhost:8000/health`
   - Verify environment variables are set

3. **Build Failures**
   - Clear Docker cache: `docker system prune -a`
   - Ensure all files are present and .dockerignore is not too restrictive

### Logs

View logs for specific services:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs
docker-compose logs -f backend
```

### Health Checks

Check service health:

```bash
# Frontend
curl http://localhost:7860/health

# Backend
curl http://localhost:8000/health
```

## Development Workflow

1. Make code changes
2. Rebuild specific service:

   ```bash
   docker-compose up --build frontend  # For frontend changes
   docker-compose up --build backend   # For backend changes
   ```

3. For development with hot reloading, you can override the docker-compose configuration:
   ```bash
   # Create docker-compose.override.yml for development
   # Add volume mounts and development-specific settings
   ```

## Monitoring

The Docker setup includes:

- Health checks for both services
- Proper restart policies
- Resource limits can be added as needed
- Networks for service isolation

For production monitoring, consider adding:

- Prometheus metrics endpoints
- Log aggregation (ELK stack, Fluentd)
- Application Performance Monitoring (APM)
