FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk --no-cache add curl && \
    npm install -g serve

COPY --from=build /app/dist /app/dist

# Simple health file for uptime checks
RUN echo "healthy" > /app/dist/health

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD sh -c 'curl -f http://localhost:${PORT:-3000}/health || exit 1'

CMD ["sh", "-c", "serve -s /app/dist -l ${PORT:-3000} --single"]
