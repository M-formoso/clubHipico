# Skill: Configuración de Docker para el proyecto

## Objetivo
Configurar Docker Compose para desarrollo y producción del Sistema Club Ecuestre.

## Estructura de archivos Docker

```
club-ecuestre/
├── docker-compose.yml          # Desarrollo
├── docker-compose.prod.yml     # Producción
├── frontend/
│   └── Dockerfile
└── backend/
    └── Dockerfile
```

## 1. Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

## 2. Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar build de React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 3. Docker Compose - Desarrollo

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Base de datos PostgreSQL
  db:
    image: postgres:15-alpine
    container_name: club-ecuestre-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: club_ecuestre
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis para Celery
  redis:
    image: redis:7-alpine
    container_name: club-ecuestre-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend FastAPI
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: club-ecuestre-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/club_ecuestre
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY:-dev-secret-key-change-in-production}
      CORS_ORIGINS: http://localhost:5173,http://localhost:3000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Celery Worker
  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: club-ecuestre-celery
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/club_ecuestre
      REDIS_URL: redis://redis:6379/0
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    command: celery -A app.core.celery_app worker --loglevel=info

  # Celery Beat (tareas programadas)
  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: club-ecuestre-celery-beat
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/club_ecuestre
      REDIS_URL: redis://redis:6379/0
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    command: celery -A app.core.celery_app beat --loglevel=info

  # Frontend React
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: builder
    container_name: club-ecuestre-frontend
    environment:
      VITE_API_URL: http://localhost:8000/api/v1
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    depends_on:
      - backend
    command: npm run dev -- --host

volumes:
  postgres_data:
  redis_data:
```

## 4. Docker Compose - Producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: club-ecuestre-db-prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: club-ecuestre-redis-prod
    volumes:
      - redis_data_prod:/data
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: club-ecuestre-backend-prod
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      CORS_ORIGINS: ${FRONTEND_URL}
    depends_on:
      - db
      - redis
    restart: always
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: club-ecuestre-celery-prod
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: always
    command: celery -A app.core.celery_app worker --loglevel=info

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: club-ecuestre-celery-beat-prod
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: always
    command: celery -A app.core.celery_app beat --loglevel=info

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: club-ecuestre-frontend-prod
    restart: always

  nginx:
    image: nginx:alpine
    container_name: club-ecuestre-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: always

volumes:
  postgres_data_prod:
  redis_data_prod:
```

## 5. Nginx Configuration

```nginx
# nginx/nginx.conf
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:80;
}

server {
    listen 80;
    server_name ejemplo.com;

    client_max_body_size 20M;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Documentación API
    location /docs {
        proxy_pass http://backend;
    }

    location /redoc {
        proxy_pass http://backend;
    }
}
```

## 6. Variables de Entorno

```bash
# .env.example
# Database
DB_USER=postgres
DB_PASSWORD=secure-password-here
DB_NAME=club_ecuestre

# Backend
SECRET_KEY=your-super-secret-key-here
CORS_ORIGINS=https://tudominio.com

# Frontend
VITE_API_URL=https://tudominio.com/api/v1

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Comandos Docker útiles

```bash
# Desarrollo
docker-compose up -d                    # Iniciar todos los servicios
docker-compose logs -f backend          # Ver logs del backend
docker-compose exec backend bash        # Entrar al contenedor backend
docker-compose exec db psql -U postgres # Conectar a PostgreSQL
docker-compose down                     # Detener servicios
docker-compose down -v                  # Detener y eliminar volúmenes

# Producción
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f

# Migraciones
docker-compose exec backend alembic upgrade head
docker-compose exec backend alembic revision --autogenerate -m "description"

# Backups
docker-compose exec db pg_dump -U postgres club_ecuestre > backup.sql
docker-compose exec -T db psql -U postgres club_ecuestre < backup.sql
```

## Checklist

- [ ] Dockerfiles creados (backend + frontend)
- [ ] docker-compose.yml configurado
- [ ] docker-compose.prod.yml configurado
- [ ] Nginx configurado
- [ ] Variables de entorno definidas
- [ ] Health checks implementados
- [ ] Volúmenes para persistencia
- [ ] Red entre servicios configurada
- [ ] Scripts de deployment
- [ ] Documentación de comandos
