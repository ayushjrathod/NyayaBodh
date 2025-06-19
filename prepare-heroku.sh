#!/bin/bash

# Copy API files to root for Heroku deployment
echo "Copying API files for Heroku deployment..."

# Copy all files from api directory to root
cp -r api/* .

# Ensure the data directory exists
mkdir -p data/current_context
mkdir -p data/resources

# Copy any existing data if available
if [ -d "api/data" ]; then
    cp -r api/data/* data/
fi

echo "Files copied successfully for Heroku deployment!"
echo "Ready to deploy to Heroku."
