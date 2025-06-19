# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk --no-cache add curl

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a script to substitute PORT at runtime
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/conf.d/default.conf > /tmp/default.conf' >> /docker-entrypoint.sh && \
    echo 'mv /tmp/default.conf /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE $PORT

# Add health check (use PORT env variable)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["/docker-entrypoint.sh"]
