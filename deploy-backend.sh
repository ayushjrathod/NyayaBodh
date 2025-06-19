#!/bin/bash

# Deploy only the backend to Heroku
set -e

BACKEND_APP=${1:-nyaybodh-api}

echo "🚀 Deploying Backend to Heroku..."

# Ensure we're using the backend heroku.yml
if [ ! -f "heroku.yml" ]; then
    echo "❌ heroku.yml not found. Make sure you're in the project root."
    exit 1
fi

# Check if app exists
if ! heroku apps:info $BACKEND_APP &> /dev/null; then
    echo "🆕 Creating new Heroku app: $BACKEND_APP"
    heroku create $BACKEND_APP
    heroku stack:set container -a $BACKEND_APP
    heroku addons:create heroku-postgresql:essential-0 -a $BACKEND_APP
fi

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set FASTAPI_ENV=production -a $BACKEND_APP
heroku config:set PYTHONUNBUFFERED=1 -a $BACKEND_APP
heroku config:set TOKENIZERS_PARALLELISM=false -a $BACKEND_APP

# Deploy
echo "🚀 Deploying..."
git add .
git commit -m "Deploy backend" || echo "No changes to commit"

if ! git remote | grep -q "heroku-backend"; then
    heroku git:remote -a $BACKEND_APP -r heroku-backend
fi

git push heroku-backend main

echo "✅ Backend deployed successfully!"
echo "🌐 Backend URL: https://$BACKEND_APP.herokuapp.com"
