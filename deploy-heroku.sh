#!/bin/bash

# Heroku Deployment Script for NyayBodh (Frontend + Backend)
set -e

echo "🚀 Starting Heroku deployment for NyayBodh..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "curl https://cli-assets.heroku.com/install.sh | sh"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please log in to Heroku first:"
    echo "heroku login"
    exit 1
fi

# App names (you can change these)
BACKEND_APP=${1:-nyaybodh-api}
FRONTEND_APP=${2:-nyaybodh-frontend}

echo "📱 Backend app: $BACKEND_APP"
echo "📱 Frontend app: $FRONTEND_APP"

# Function to create app if it doesn't exist
create_app_if_not_exists() {
    local app_name=$1
    if ! heroku apps:info $app_name &> /dev/null; then
        echo "🆕 Creating new Heroku app: $app_name"
        heroku create $app_name
    else
        echo "✅ App $app_name already exists"
    fi
}

# Create both apps
create_app_if_not_exists $BACKEND_APP
create_app_if_not_exists $FRONTEND_APP

# Set stack to container for both apps
echo "� Setting stack to container..."
heroku stack:set container -a $BACKEND_APP
heroku stack:set container -a $FRONTEND_APP

# Deploy Backend
echo "🔧 Deploying Backend..."

# Set backend environment variables
heroku config:set FASTAPI_ENV=production -a $BACKEND_APP
heroku config:set PYTHONUNBUFFERED=1 -a $BACKEND_APP
heroku config:set TOKENIZERS_PARALLELISM=false -a $BACKEND_APP
heroku config:set LOG_LEVEL=INFO -a $BACKEND_APP
heroku config:set FRONTEND_URL=https://$FRONTEND_APP.herokuapp.com -a $BACKEND_APP
heroku config:set BACKEND_URL=https://$BACKEND_APP.herokuapp.com -a $BACKEND_APP
heroku config:set CORS_ORIGINS='["https://'$FRONTEND_APP'.herokuapp.com"]' -a $BACKEND_APP

# Add PostgreSQL addon to backend
echo "🗄️ Adding PostgreSQL addon to backend..."
heroku addons:create heroku-postgresql:essential-0 -a $BACKEND_APP

# Get the database URL and set it
DATABASE_URL=$(heroku config:get DATABASE_URL -a $BACKEND_APP)
heroku config:set DIRECT_URL="$DATABASE_URL" -a $BACKEND_APP

# Deploy backend with current heroku.yml
echo "🚀 Deploying backend..."
git add .
git commit -m "Deploy backend to Heroku" || echo "No changes to commit"

# Add backend remote and deploy
if ! git remote | grep -q "heroku-backend"; then
    git remote add heroku-backend https://git.heroku.com/$BACKEND_APP.git
fi
git push heroku-backend main

# Deploy Frontend
echo "🎨 Deploying Frontend..."

# Copy frontend heroku.yml temporarily
cp heroku-frontend.yml heroku.yml

# Set frontend environment variables
heroku config:set VITE_API_URL=https://$BACKEND_APP.herokuapp.com -a $FRONTEND_APP

# Deploy frontend
echo "🚀 Deploying frontend..."
git add .
git commit -m "Deploy frontend to Heroku" || echo "No changes to commit"

# Add frontend remote and deploy
if ! git remote | grep -q "heroku-frontend"; then
    git remote add heroku-frontend https://git.heroku.com/$FRONTEND_APP.git
fi
git push heroku-frontend main

# Restore original heroku.yml
git checkout heroku.yml

echo "✅ Deployment complete!"
echo "🌐 Backend API: https://$BACKEND_APP.herokuapp.com"
echo "🌐 Frontend App: https://$FRONTEND_APP.herokuapp.com"
echo ""
echo "📋 Next steps:"
echo "1. Set your environment variables for the backend:"
echo "   heroku config:set JWT_SECRET_KEY='your_secret' -a $BACKEND_APP"
echo "   heroku config:set GROQ_API_KEY='your_key' -a $BACKEND_APP"
echo "   heroku config:set HF_TOKEN='your_token' -a $BACKEND_APP"
echo "   heroku config:set GOOGLE_CLIENT_ID='your_id' -a $BACKEND_APP"
echo "   heroku config:set GOOGLE_CLIENT_SECRET='your_secret' -a $BACKEND_APP"
echo ""
echo "2. Update OAuth redirect URIs to use:"
echo "   https://$BACKEND_APP.herokuapp.com/auth/google/callback"
echo ""
echo "3. Check logs:"
echo "   Backend: heroku logs --tail -a $BACKEND_APP"
echo "   Frontend: heroku logs --tail -a $FRONTEND_APP"
echo ""
echo "4. Open apps:"
echo "   Backend: heroku open -a $BACKEND_APP"
echo "   Frontend: heroku open -a $FRONTEND_APP"
