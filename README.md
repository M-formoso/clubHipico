# Sistema de Gestión - Club Ecuestre

Sistema integral de gestión para club ecuestre que administra caballos, clientes, empleados, eventos, pagos y alertas automáticas.

## Stack Tecnológico

### Backend
- FastAPI 0.104+
- Python 3.11+
- PostgreSQL 15+
- SQLAlchemy 2.0
- Celery + Redis
- JWT Authentication

### Frontend
- React 18
- TypeScript 5+
- Vite
- Tailwind CSS
- shadcn/ui
- React Query
- Zustand

## Estructura del Proyecto

```
club-ecuestre/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docs/            # Documentación
├── docker-compose.yml
└── README.md
```

## Instalación y Desarrollo

### Con Docker (Recomendado)

```bash
# Clonar repositorio
git clone <repo-url>
cd club-ecuestre

# Copiar variables de entorno
cp .env.example .env

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Sin Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

Crear archivo `.env` en la raíz del proyecto con:

```env
# Database
POSTGRES_USER=clubecuestre
POSTGRES_PASSWORD=your_password
POSTGRES_DB=clubecuestre_db
DATABASE_URL=postgresql://clubecuestre:your_password@localhost:5432/clubecuestre_db

# Backend
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis
REDIS_URL=redis://localhost:6379/0

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Endpoints Principales

- **Auth:** `/api/v1/auth/*`
- **Caballos:** `/api/v1/caballos/*`
- **Clientes:** `/api/v1/clientes/*`
- **Empleados:** `/api/v1/empleados/*`
- **Eventos:** `/api/v1/eventos/*`
- **Pagos:** `/api/v1/pagos/*`
- **Alertas:** `/api/v1/alertas/*`
- **Reportes:** `/api/v1/reportes/*`

## Documentación API

Una vez iniciado el backend, acceder a:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Backend
cd backend
pytest
pytest --cov=app tests/

# Frontend
cd frontend
npm run test
```

## Deploy a Producción

```bash
# Build
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Licencia

Todos los derechos reservados - Sistema Club Ecuestre
# clubHipico
