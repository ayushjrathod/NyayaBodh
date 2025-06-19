#!/bin/bash

# Deploy only the frontend to Heroku
set -e

FRONTEND_APP=${1:-nyaybodh-frontend}
BACKEND_URL=${2:-https://nyaybodh-api.herokuapp.com}

echo "🚀 Deploying Frontend to Heroku..."

# Backup original heroku.yml and use frontend version
cp heroku.yml heroku.yml.backup
cp heroku-frontend.yml heroku.yml

# Check if app exists
if ! heroku apps:info $FRONTEND_APP &> /dev/null; then
    echo "🆕 Creating new Heroku app: $FRONTEND_APP"
    heroku create $FRONTEND_APP
    heroku stack:set container -a $FRONTEND_APP
fi

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set VITE_API_URL=$BACKEND_URL -a $FRONTEND_APP

# Deploy
echo "🚀 Deploying..."
git add .
git commit -m "Deploy frontend" || echo "No changes to commit"

if ! git remote | grep -q "heroku-frontend"; then
    heroku git:remote -a $FRONTEND_APP -r heroku-frontend
fi

git push heroku-frontend main

# Restore original heroku.yml
mv heroku.yml.backup heroku.yml

echo "✅ Frontend deployed successfully!"
echo "🌐 Frontend URL: https://$FRONTEND_APP.herokuapp.com"
