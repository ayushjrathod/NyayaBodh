# Heroku Container Deployment Guide

This guide explains how to deploy your NyayBodh application (Frontend + Backend) to Heroku using containers.

## Prerequisites

1. Install Heroku CLI:

   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. Login to Heroku:

   ```bash
   heroku login
   ```

3. Make sure you have Docker installed and running

## Deployment Options

### Option 1: Deploy Both Frontend and Backend (Recommended)

```bash
# Make scripts executable
chmod +x deploy-heroku.sh

# Deploy both (will create 2 separate apps)
./deploy-heroku.sh [backend-app-name] [frontend-app-name]

# Example:
./deploy-heroku.sh nyaybodh-api nyaybodh-frontend
```

### Option 2: Deploy Backend Only

```bash
# Make script executable
chmod +x deploy-backend.sh

# Deploy backend
./deploy-backend.sh [backend-app-name]

# Example:
./deploy-backend.sh nyaybodh-api
```

### Option 3: Deploy Frontend Only

```bash
# Make script executable
chmod +x deploy-frontend.sh

# Deploy frontend (provide backend URL)
./deploy-frontend.sh [frontend-app-name] [backend-url]

# Example:
./deploy-frontend.sh nyaybodh-frontend https://nyaybodh-api.herokuapp.com
```

## Post-Deployment Setup

### 1. Set Environment Variables for Backend

```bash
# Required environment variables
heroku config:set JWT_SECRET_KEY='your-secure-secret-key' -a your-backend-app
heroku config:set GROQ_API_KEY='your-groq-api-key' -a your-backend-app
heroku config:set HF_TOKEN='your-huggingface-token' -a your-backend-app
heroku config:set GOOGLE_CLIENT_ID='your-google-client-id' -a your-backend-app
heroku config:set GOOGLE_CLIENT_SECRET='your-google-client-secret' -a your-backend-app
```

### 2. Update OAuth Settings

Update your Google OAuth settings to include:

- Authorized redirect URI: `https://your-backend-app.herokuapp.com/auth/google/callback`

### 3. Monitor Deployment

```bash
# Check backend logs
heroku logs --tail -a your-backend-app

# Check frontend logs
heroku logs --tail -a your-frontend-app

# Open apps
heroku open -a your-backend-app
heroku open -a your-frontend-app
```

## File Structure for Heroku

- `heroku.yml` - Backend container configuration
- `heroku-frontend.yml` - Frontend container configuration
- `api/Dockerfile` - Backend Docker container
- `client/Dockerfile` - Frontend Docker container
- `deploy-heroku.sh` - Complete deployment script
- `deploy-backend.sh` - Backend-only deployment
- `deploy-frontend.sh` - Frontend-only deployment

## Troubleshooting

1. **Build fails**: Check the Dockerfile in api/ and client/ directories
2. **App crashes**: Check logs with `heroku logs --tail -a app-name`
3. **Database issues**: Ensure PostgreSQL addon is added and DATABASE_URL is set
4. **CORS issues**: Update CORS_ORIGINS environment variable with your frontend URL

## Architecture

```
Frontend (React + Nginx) → Backend (FastAPI + PostgreSQL)
     ↓                           ↓
Heroku App 1                Heroku App 2
(Container)                 (Container + DB)
```

The frontend communicates with the backend via API calls, and both are deployed as separate Heroku container apps.
