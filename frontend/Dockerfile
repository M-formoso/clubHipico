# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ci = reproducible, no devDependencies cached)
RUN npm ci

# Copy source
COPY . .

# Railway pasa env vars como build args automáticamente
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build de producción
RUN npm run build

# Stage 2: Serve con nginx
FROM nginx:alpine-slim

ENV PORT=3000

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Script de inicio que genera la config de nginx con el PORT dinámico
RUN cat > /start.sh << 'SCRIPT'
#!/bin/sh
PORT=${PORT:-3000}
cat > /etc/nginx/conf.d/default.conf << NGINX
server {
    listen $PORT;
    server_name localhost;
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
exec nginx -g "daemon off;"
SCRIPT
RUN chmod +x /start.sh

EXPOSE 3000

CMD ["/start.sh"]
