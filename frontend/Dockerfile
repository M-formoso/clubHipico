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
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config template
RUN echo 'server { \n\
    listen $PORT; \n\
    server_name _; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf.template

# Script to replace PORT and start nginx
RUN echo '#!/bin/sh\n\
export PORT=${PORT:-3000}\n\
envsubst "\$PORT" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf\n\
cat /etc/nginx/conf.d/default.conf\n\
exec nginx -g "daemon off;"' > /start.sh && \
    chmod +x /start.sh

EXPOSE 3000

CMD ["/start.sh"]
