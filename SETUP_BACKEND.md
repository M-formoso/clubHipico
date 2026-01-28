# Guía de Configuración del Backend

## 🚀 Inicio Rápido con Docker (Recomendado)

### 1. Configurar variables de entorno

```bash
# En la raíz del proyecto
cp .env.example .env
```

Edita el archivo `.env` y configura tus credenciales (especialmente `SECRET_KEY`, `POSTGRES_PASSWORD`).

### 2. Levantar todos los servicios

```bash
docker-compose up -d
```

Esto levantará:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- Backend FastAPI (puerto 8000)
- Celery Worker
- Celery Beat
- Frontend React (puerto 5173)

### 3. Crear migración inicial y aplicarla

```bash
# Entrar al contenedor del backend
docker-compose exec backend bash

# Crear migración inicial
alembic revision --autogenerate -m "Initial migration"

# Aplicar migración
alembic upgrade head

# Inicializar datos por defecto
python init_db.py

# Salir del contenedor
exit
```

### 4. Verificar que funciona

Abre tu navegador en:
- **API Docs (Swagger):** http://localhost:8000/docs
- **API Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

### 5. Login inicial

Credenciales por defecto:
- **Email:** `admin@clubecuestre.com`
- **Password:** `admin123`

⚠️ **IMPORTANTE:** Cambia estas credenciales en producción.

---

## 🛠️ Desarrollo Local (Sin Docker)

### Requisitos Previos

- Python 3.11+
- PostgreSQL 15+
- Redis

### 1. Crear entorno virtual

```bash
cd backend
python -m venv venv

# En Linux/Mac
source venv/bin/activate

# En Windows
venv\Scripts\activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar base de datos

Crea una base de datos PostgreSQL:

```sql
CREATE DATABASE clubecuestre_db;
CREATE USER clubecuestre WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE clubecuestre_db TO clubecuestre;
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:

```env
DATABASE_URL=postgresql://clubecuestre:tu_password@localhost:5432/clubecuestre_db
SECRET_KEY=tu-secret-key-muy-seguro-de-al-menos-32-caracteres
REDIS_URL=redis://localhost:6379/0
```

### 5. Crear migración y aplicarla

```bash
# Crear migración inicial
alembic revision --autogenerate -m "Initial migration"

# Aplicar migración
alembic upgrade head

# Inicializar datos
python init_db.py
```

### 6. Iniciar servidor de desarrollo

```bash
uvicorn app.main:app --reload
```

El servidor estará disponible en http://localhost:8000

### 7. Iniciar Celery (en otra terminal)

```bash
# Worker
celery -A app.core.celery_app worker --loglevel=info

# Beat (tareas programadas) - en otra terminal
celery -A app.core.celery_app beat --loglevel=info
```

---

## 📝 Comandos Útiles

### Migraciones

```bash
# Crear nueva migración
alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history
```

### Docker

```bash
# Ver logs
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA LA BD)
docker-compose down -v

# Reconstruir imágenes
docker-compose build
```

### Testing

```bash
# Ejecutar todos los tests
pytest

# Con coverage
pytest --cov=app tests/

# Solo un archivo
pytest tests/api/test_auth.py -v
```

---

## 🔧 Solución de Problemas

### Error: "could not connect to server"

PostgreSQL no está corriendo. Verifica:

```bash
docker-compose ps
# o si es local
sudo systemctl status postgresql
```

### Error: "alembic.util.exc.CommandError"

Asegúrate de que:
1. La base de datos existe
2. El `DATABASE_URL` en `.env` es correcto
3. PostgreSQL está corriendo

### Error: "ModuleNotFoundError"

Instala las dependencias:

```bash
pip install -r requirements.txt
```

### La base de datos no tiene tablas

```bash
alembic upgrade head
python init_db.py
```

---

## 🗂️ Estructura del Backend

```
backend/
├── app/
│   ├── api/v1/endpoints/    # Endpoints de la API
│   ├── core/                # Config, seguridad, deps
│   ├── db/                  # Base de datos
│   ├── models/              # Modelos SQLAlchemy
│   ├── schemas/             # Schemas Pydantic
│   ├── services/            # Lógica de negocio
│   ├── tasks/               # Tareas Celery
│   └── main.py              # App FastAPI
├── alembic/                 # Migraciones
├── tests/                   # Tests
├── requirements.txt         # Dependencias
└── init_db.py              # Script de inicialización
```

---

## 🎯 Próximos Pasos

1. ✅ Backend funcionando
2. ⬜ Configurar frontend
3. ⬜ Conectar frontend con backend
4. ⬜ Deploy a producción

---

## 📚 Documentación Adicional

- **FastAPI:** https://fastapi.tiangolo.com/
- **SQLAlchemy:** https://docs.sqlalchemy.org/
- **Alembic:** https://alembic.sqlalchemy.org/
- **Celery:** https://docs.celeryproject.org/
- **Pydantic:** https://docs.pydantic.dev/
