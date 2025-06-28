#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# The script will generate unique names for the Heroku apps.
# You can change the base names here if you like.
BACKEND_APP_BASE_NAME="nyaybodh-backend"
FRONTEND_APP_BASE_NAME="nyaybodh-frontend"
# Generate a unique suffix for the app names
UNIQUE_SUFFIX=$(date +%s)
BACKEND_APP_NAME="$BACKEND_APP_BASE_NAME-$UNIQUE_SUFFIX"
FRONTEND_APP_NAME="$FRONTEND_APP_BASE_NAME-$UNIQUE_SUFFIX"

# Function to extract env variable from .env file
get_env_var() {
    local file=$1
    local var=$2
    grep "^${var}=" "$file" 2>/dev/null | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//'
}

# Function to set Heroku config if value exists
set_heroku_config() {
    local app=$1
    local key=$2
    local value=$3
    if [ ! -z "$value" ] && [ "$value" != "your_secure_secret_key" ] && [ "$value" != "your_redis_password" ]; then
        echo "Setting $key for $app"
        heroku config:set "$key=$value" -a "$app"
    fi
}

echo "This script will create the following Heroku apps:"
echo "Backend: $BACKEND_APP_NAME"
echo "Frontend: $FRONTEND_APP_NAME"
echo ""

# Check if .env files exist
if [ ! -f "api/.env" ]; then
    echo "❌ Error: api/.env file not found!"
    echo "Please create api/.env with your environment variables."
    exit 1
fi

if [ ! -f "client/.env" ]; then
    echo "❌ Error: client/.env file not found!"
    echo "Please create client/.env with your environment variables."
    exit 1
fi

echo "✅ Environment files found"
echo ""

read -p "Do you want to continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi


# --- Backend Deployment ---
echo "--- Deploying Backend ---"
cd api

# Create Heroku app
heroku create $BACKEND_APP_NAME

# Set the stack to container for Docker deployments
heroku stack:set container -a $BACKEND_APP_NAME

# Login to Heroku Container Registry
heroku container:login

# Build, push, and release the Docker image
heroku container:push web -a $BACKEND_APP_NAME
heroku container:release web -a $BACKEND_APP_NAME

# Get the backend URL
BACKEND_URL="https://${BACKEND_APP_NAME}.herokuapp.com"

echo "Backend deployed to: $BACKEND_URL"

# --- Backend Environment Variables ---
echo "--- Setting Backend Environment Variables ---"

# Extract variables from api/.env
DATABASE_URL=$(get_env_var "api/.env" "DATABASE_URL")
JWT_SECRET_KEY=$(get_env_var "api/.env" "JWT_SECRET_KEY")
GROQ_API_KEY=$(get_env_var "api/.env" "GROQ_API_KEY")
LLM_MODEL=$(get_env_var "api/.env" "LLM_MODEL")
EMBEDDING_MODEL=$(get_env_var "api/.env" "EMBEDDING_MODEL")
LLM_TEMPERATURE=$(get_env_var "api/.env" "LLM_TEMPERATURE")
LLM_MAX_TOKENS=$(get_env_var "api/.env" "LLM_MAX_TOKENS")
LLM_TOP_P=$(get_env_var "api/.env" "LLM_TOP_P")
MAX_CHUNK_SIZE=$(get_env_var "api/.env" "MAX_CHUNK_SIZE")
TOP_N_CHUNKS=$(get_env_var "api/.env" "TOP_N_CHUNKS")
HF_TOKEN=$(get_env_var "api/.env" "HF_TOKEN")
GOOGLE_CLIENT_ID=$(get_env_var "api/.env" "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=$(get_env_var "api/.env" "GOOGLE_CLIENT_SECRET")
TOKENIZERS_PARALLELISM=$(get_env_var "api/.env" "TOKENIZERS_PARALLELISM")

# Set environment variables for backend
set_heroku_config "$BACKEND_APP_NAME" "DATABASE_URL" "$DATABASE_URL"
set_heroku_config "$BACKEND_APP_NAME" "JWT_SECRET_KEY" "$JWT_SECRET_KEY"
set_heroku_config "$BACKEND_APP_NAME" "GROQ_API_KEY" "$GROQ_API_KEY"
set_heroku_config "$BACKEND_APP_NAME" "LLM_MODEL" "$LLM_MODEL"
set_heroku_config "$BACKEND_APP_NAME" "EMBEDDING_MODEL" "$EMBEDDING_MODEL"
set_heroku_config "$BACKEND_APP_NAME" "LLM_TEMPERATURE" "$LLM_TEMPERATURE"
set_heroku_config "$BACKEND_APP_NAME" "LLM_MAX_TOKENS" "$LLM_MAX_TOKENS"
set_heroku_config "$BACKEND_APP_NAME" "LLM_TOP_P" "$LLM_TOP_P"
set_heroku_config "$BACKEND_APP_NAME" "MAX_CHUNK_SIZE" "$MAX_CHUNK_SIZE"
set_heroku_config "$BACKEND_APP_NAME" "TOP_N_CHUNKS" "$TOP_N_CHUNKS"
set_heroku_config "$BACKEND_APP_NAME" "HF_TOKEN" "$HF_TOKEN"
set_heroku_config "$BACKEND_APP_NAME" "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
set_heroku_config "$BACKEND_APP_NAME" "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET"
set_heroku_config "$BACKEND_APP_NAME" "TOKENIZERS_PARALLELISM" "$TOKENIZERS_PARALLELISM"

# Set dynamic URLs
heroku config:set "CORS_ORIGINS=[\"https://${FRONTEND_APP_NAME}.herokuapp.com\"]" -a $BACKEND_APP_NAME
heroku config:set "GOOGLE_REDIRECT_URI=https://${BACKEND_APP_NAME}.herokuapp.com/auth/google/callback" -a $BACKEND_APP_NAME
heroku config:set "REDIRECT_URI=postmessage" -a $BACKEND_APP_NAME

# --- Frontend Deployment ---
echo "--- Deploying Frontend ---"
cd ../client

# Create Heroku app
heroku create $FRONTEND_APP_NAME

# Set the stack to container for Docker deployments
heroku stack:set container -a $FRONTEND_APP_NAME

# Build, push, and release the Docker image
heroku container:push web -a $FRONTEND_APP_NAME
heroku container:release web -a $FRONTEND_APP_NAME

# Get the frontend URL
FRONTEND_URL="https://${FRONTEND_APP_NAME}.herokuapp.com"

echo "Frontend deployed to: $FRONTEND_URL"

# --- Frontend Environment Variables ---
echo "--- Setting Frontend Environment Variables ---"

# Set BACKEND_URL for the frontend app
heroku config:set BACKEND_URL=${BACKEND_URL} -a $FRONTEND_APP_NAME

# Extract frontend variables from client/.env
FRONTEND_GOOGLE_CLIENT_ID=$(get_env_var "client/.env" "GOOGLE_CLIENT_ID")

# Set frontend environment variables
set_heroku_config "$FRONTEND_APP_NAME" "GOOGLE_CLIENT_ID" "$FRONTEND_GOOGLE_CLIENT_ID"

# --- Cross-Application Configuration ---
echo "--- Configuring Cross-Application Communication ---"

# Set FRONTEND_URL for the backend app for CORS
heroku config:set FRONTEND_URL=$FRONTEND_URL -a $BACKEND_APP_NAME

echo "✅ All environment variables configured successfully."

# --- Manual Steps Reminder ---
echo ""
echo "--- Deployment Summary ---"
echo "✅ Backend deployed: $BACKEND_URL"
echo "✅ Frontend deployed: $FRONTEND_URL"
echo "✅ Environment variables configured"
echo "✅ Cross-application communication setup"
echo ""
echo "--- Optional Manual Steps ---"
echo "If you need Redis for caching, you can add it:"
echo "  heroku addons:create heroku-redis:hobby-dev -a $BACKEND_APP_NAME"
echo ""
echo "To view logs:"
echo "  Backend: heroku logs --tail -a $BACKEND_APP_NAME"
echo "  Frontend: heroku logs --tail -a $FRONTEND_APP_NAME"
echo ""
echo "To update environment variables later:"
echo "  heroku config:set VARIABLE_NAME=value -a $BACKEND_APP_NAME"
echo ""
echo "--- Important Notes ---"
echo "⚠️  Make sure your DATABASE_URL is accessible from Heroku"
echo "⚠️  Your Google OAuth settings should include the new URLs:"
echo "    - Authorized origins: $FRONTEND_URL"
echo "    - Authorized redirect URIs: $BACKEND_URL/auth/google/callback"
echo ""

echo "🎉 Deployment Complete!"
echo "Your application is now live at: $FRONTEND_URL"

cd ..
