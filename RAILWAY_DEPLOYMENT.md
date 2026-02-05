# Guía de Deployment en Railway - Sistema Club Ecuestre

Esta guía te llevará paso a paso para desplegar el Sistema Club Ecuestre en Railway.

## Arquitectura en Railway

El proyecto se despliega con **6 servicios**:

1. **PostgreSQL** (addon de Railway)
2. **Redis** (addon de Railway)
3. **Backend** (FastAPI + Uvicorn)
4. **Celery Worker** (procesa tareas en background)
5. **Celery Beat** (scheduler de tareas periódicas)
6. **Frontend** (React + Vite, servido con nginx)

---

## Pre-requisitos

1. Cuenta en [Railway.app](https://railway.app)
2. Repositorio GitHub con el código del proyecto
3. SECRET_KEY generado para producción (ver más abajo)

---

## ⚠️ PROBLEMA COMÚN: Error de Railpack

Si ves **"Error al crear un plan de compilación con Railpack"**, NO te preocupes. Esto es normal en monorepos.

**Solución**:
- Los archivos `backend/railway.toml` y `frontend/railway.toml` ya están creados
- Estos archivos le dicen a Railway que use Dockerfile en lugar de auto-detección
- Al crear cada servicio, simplemente **especifica el Root Directory correctamente** en Settings
- Railway entonces usará el Dockerfile y todo funcionará

---

## Paso 1: Generar SECRET_KEY de Producción

El `.env` actual tiene un SECRET_KEY de placeholder. Para producción necesitas uno único y seguro:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Guarda este valor, lo necesitarás para la configuración de Railway.

---

## Paso 2: Crear Proyecto en Railway

1. Ve a [railway.app/dashboard](https://railway.app/dashboard)
2. Clic en **"New Project"**
3. Selecciona **"Empty Project"** (NO "Deploy from GitHub repo" todavía)
4. Nombra tu proyecto: `sistema-club-ecuestre`

**IMPORTANTE**: Creamos un proyecto vacío primero porque es un monorepo. Agregaremos los servicios manualmente en los siguientes pasos.

---

## Paso 3: Agregar PostgreSQL

1. En tu proyecto de Railway, clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la variable `DATABASE_URL`
4. Renombra el servicio a **"postgres"** para claridad (opcional)

---

## Paso 4: Agregar Redis

1. Clic en **"+ New"** nuevamente
2. Selecciona **"Database"** → **"Add Redis"**
3. Railway creará automáticamente la variable `REDIS_URL`
4. Renombra el servicio a **"redis"** para claridad (opcional)

---

## Paso 5: Configurar Backend (FastAPI)

### 5.1 Crear Servicio Backend

1. En tu proyecto, clic en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Si es la primera vez, autoriza Railway a acceder a GitHub
4. Selecciona el repositorio del Sistema Club Ecuestre
5. **IMPORTANTE**: Railway podría mostrar un error "Error al crear un plan de compilación con Railpack"
   - Esto es normal en monorepos
   - Ignora el error por ahora, lo configuraremos manualmente

### 5.2 Configurar Build (CRÍTICO)

1. Una vez creado el servicio, ve a **Settings**
2. En **"Service Name"**, cámbialo a **"backend"**
3. En **"Build"** (puede estar en la sección "Source"):
   - **Root Directory**: `backend` (IMPORTANTE: escribe exactamente `backend`)
   - **Builder**: Debe decir "Dockerfile" (Railway lo detecta automáticamente gracias al `railway.toml`)
4. Guarda los cambios

**Solución al error de Railpack**: El archivo `backend/railway.toml` que acabamos de crear le dice a Railway que use el Dockerfile en lugar de intentar auto-detectar el proyecto.

### 5.3 Variables de Entorno

Ve a **Variables** y agrega las siguientes:

#### Variables Obligatorias:

```bash
DATABASE_URL=${{postgres.DATABASE_URL}}
REDIS_URL=${{redis.REDIS_URL}}
SECRET_KEY=<tu-secret-key-generado-en-paso-1>
BACKEND_CORS_ORIGINS=https://tu-frontend.railway.app
ENVIRONMENT=production
```

#### Variables Opcionales (si usas Cloudinary y Email):

```bash
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>

SMTP_HOST=<smtp.gmail.com>
SMTP_PORT=587
SMTP_USER=<tu-email@gmail.com>
SMTP_PASSWORD=<tu-app-password>
EMAIL_FROM=<tu-email@gmail.com>
EMAIL_FROM_NAME=Club Ecuestre
```

### 5.4 Health Check

1. Ve a **Settings** → **Health Check**
2. Activa el health check
3. **Path**: `/health`
4. **Timeout**: 60 segundos

### 5.5 Deploy

Clic en **"Deploy"**. Railway:
- Construirá la imagen Docker
- Correrá `alembic upgrade head` (migraciones)
- Iniciará uvicorn en el puerto asignado por Railway

**IMPORTANTE**: Guarda la URL pública del backend (ej: `https://backend-production-xxxx.railway.app`). La necesitarás para el frontend.

---

## Paso 6: Configurar Celery Worker

### 6.1 Crear Servicio Celery Worker

1. Clic en **"+ New"** → **"GitHub Repo"** → selecciona tu repo
2. Ignora el error de Railpack (mismo que con backend)

### 6.2 Configurar Build

1. **Settings** → **Service Name**: `celery-worker`
2. **Settings** → **Build**:
   - **Root Directory**: `backend` (mismo código que backend)
   - **Builder**: Dockerfile (auto-detectado)

### 6.3 Override del Comando de Inicio

1. **Settings** → **Deploy**
2. En **"Start Command"**, agrega:
   ```bash
   celery -A app.core.celery_app worker --loglevel=info
   ```

### 6.4 Variables de Entorno

Ve a **Variables** y agrega:

```bash
DATABASE_URL=${{postgres.DATABASE_URL}}
REDIS_URL=${{redis.REDIS_URL}}
SECRET_KEY=${{backend.SECRET_KEY}}
ENVIRONMENT=production
```

### 6.5 Deploy

Clic en **"Deploy"**.

---

## Paso 7: Configurar Celery Beat

### 7.1 Crear Servicio Celery Beat

1. Clic en **"+ New"** → **"GitHub Repo"** → selecciona tu repo
2. Ignora el error de Railpack

### 7.2 Configurar Build

1. **Settings** → **Service Name**: `celery-beat`
2. **Settings** → **Build**:
   - **Root Directory**: `backend` (mismo código que backend y worker)
   - **Builder**: Dockerfile (auto-detectado)

### 7.3 Override del Comando de Inicio

1. **Settings** → **Deploy**
2. En **"Start Command"**, agrega:
   ```bash
   celery -A app.core.celery_app beat --loglevel=info
   ```

### 7.4 Variables de Entorno

Ve a **Variables** y agrega:

```bash
DATABASE_URL=${{postgres.DATABASE_URL}}
REDIS_URL=${{redis.REDIS_URL}}
SECRET_KEY=${{backend.SECRET_KEY}}
ENVIRONMENT=production
```

### 7.5 Deploy

Clic en **"Deploy"**.

---

## Paso 8: Configurar Frontend (React + Vite)

### 8.1 Crear Servicio Frontend

1. Clic en **"+ New"** → **"GitHub Repo"** → selecciona tu repo
2. Ignora el error de Railpack

### 8.2 Configurar Build

1. **Settings** → **Service Name**: `frontend`
2. **Settings** → **Build**:
   - **Root Directory**: `frontend`
   - **Builder**: Dockerfile (auto-detectado gracias a `frontend/railway.toml`)

### 8.3 Variables de Entorno

Ve a **Variables** y agrega:

```bash
VITE_API_URL=https://backend-production-xxxx.railway.app/api/v1
```

**IMPORTANTE**: Reemplaza `backend-production-xxxx.railway.app` con la URL real de tu backend (del Paso 5.5).

### 8.4 Deploy

Clic en **"Deploy"**. Railway:
- Construirá el frontend con la URL del backend embebida
- Generará los assets estáticos optimizados
- Servirá con nginx

**Guarda la URL pública del frontend** (ej: `https://frontend-production-yyyy.railway.app`).

---

## Paso 9: Actualizar CORS en Backend

Ahora que tienes la URL del frontend:

1. Ve al servicio **backend** en Railway
2. Ve a **Variables**
3. Actualiza `BACKEND_CORS_ORIGINS`:
   ```bash
   BACKEND_CORS_ORIGINS=https://frontend-production-yyyy.railway.app
   ```
4. Railway redesplegará automáticamente el backend

---

## Paso 10: Verificación

### 10.1 Verificar Backend

Abre: `https://backend-production-xxxx.railway.app/docs`

Deberías ver la documentación interactiva de FastAPI (Swagger UI).

### 10.2 Verificar Health Check

Abre: `https://backend-production-xxxx.railway.app/health`

Respuesta esperada:
```json
{"status": "healthy"}
```

### 10.3 Verificar Frontend

Abre: `https://frontend-production-yyyy.railway.app`

Deberías ver la página de login del Sistema Club Ecuestre.

### 10.4 Verificar Logs

En Railway, revisa los logs de cada servicio:

- **Backend**: debe mostrar "Application startup complete"
- **Celery Worker**: debe mostrar "celery@xxx ready"
- **Celery Beat**: debe mostrar "Scheduler: Sending due task"

---

## Paso 11: Crear Usuario Administrador Inicial

El backend tiene un script para crear el usuario inicial. Ejecuta esto desde la Railway CLI o usando el servicio backend:

1. Instala Railway CLI: `npm i -g @railway/cli`
2. Autentícate: `railway login`
3. Conéctate al proyecto: `railway link`
4. Ejecuta el script:
   ```bash
   railway run --service backend python -m app.scripts.create_initial_data
   ```

Esto creará un super admin con las credenciales:
- **Email**: `admin@clubecuestre.com`
- **Password**: `admin123`

**IMPORTANTE**: Cambia esta contraseña inmediatamente después del primer login.

---

## Configuración Adicional (Opcional)

### Dominios Personalizados

1. Ve a **Settings** de cada servicio (backend y frontend)
2. En **Networking** → **Custom Domain**
3. Agrega tu dominio (ej: `api.miclub.com` para backend, `app.miclub.com` para frontend)
4. Configura los DNS según las instrucciones de Railway
5. Actualiza `BACKEND_CORS_ORIGINS` y `VITE_API_URL` con los nuevos dominios

### Alertas y Monitoreo

1. Railway tiene alertas de uptime integradas
2. Configura notificaciones en **Project Settings** → **Integrations**
3. Considera agregar Sentry para error tracking

---

## Troubleshooting

### Error: "Database connection failed"

- Verifica que `DATABASE_URL` esté correctamente referenciada: `${{postgres.DATABASE_URL}}`
- Verifica que el servicio postgres esté running

### Error: "CORS blocked"

- Verifica que `BACKEND_CORS_ORIGINS` incluya la URL exacta del frontend (sin trailing slash)
- Redeploya el backend después de cambiar CORS

### Error: "Port already in use"

- Railway asigna el puerto automáticamente vía `$PORT`
- No necesitas configurar nada adicional

### Frontend muestra "Network Error"

- Verifica que `VITE_API_URL` apunte a la URL correcta del backend
- Verifica que el backend esté running y responda en `/health`
- **IMPORTANTE**: Si cambias `VITE_API_URL`, debes redesplegar el frontend (es build-time, no runtime)

### Celery tasks no se ejecutan

- Verifica logs de celery-worker: debe estar conectado a Redis
- Verifica logs de celery-beat: debe estar enviando tareas al schedule
- Verifica que `REDIS_URL` sea idéntica en backend, worker y beat

---

## Costos Estimados

Railway ofrece $5 USD de crédito mensual gratis en el plan Hobby:

- **PostgreSQL**: ~$5/mes
- **Redis**: ~$5/mes
- **Backend**: ~$5/mes
- **Celery Worker**: ~$5/mes
- **Celery Beat**: ~$2/mes
- **Frontend**: ~$2/mes

**Total estimado**: ~$24/mes (los primeros $5 gratis)

Para producción seria, considera el plan Pro de Railway ($20/mes + uso).

---

## Siguiente Pasos

1. ✅ Cambiar contraseña del usuario admin
2. ✅ Configurar backups de PostgreSQL (Railway lo hace automáticamente)
3. ✅ Agregar dominios personalizados
4. ✅ Configurar monitoreo y alertas
5. ✅ Documentar flujos de trabajo para tu equipo
6. ✅ Configurar Cloudinary para manejo de imágenes (fotos de caballos)
7. ✅ Configurar SMTP para notificaciones por email

---

## Comandos Útiles de Railway CLI

```bash
# Ver logs en tiempo real
railway logs --service backend

# Ejecutar comando en el servicio
railway run --service backend <comando>

# Shell interactivo en el servicio
railway shell --service backend

# Ver variables de entorno
railway variables --service backend
```

---

¡Tu Sistema Club Ecuestre está ahora en producción! 🎉
