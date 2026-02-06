# Quick Start - Railway Deployment

Guía rápida para desplegar en Railway. Para la guía completa, ver `RAILWAY_DEPLOYMENT.md`.

## 1. Preparación (5 min)

```bash
# Generar SECRET_KEY para producción
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Guarda este valor.    Zau50LxBb_lfbL3aoYBJK6DeEIFW6h8ttLQKGR2mq4s
```

## 2. Railway - Crear Proyecto (2 min)

1. [railway.app/new](https://railway.app/new) → **"Empty Project"**
2. Nombra: `sistema-club-ecuestre`

## 3. Agregar Bases de Datos (3 min)

1. **"+ New"** → **"Database"** → **"PostgreSQL"**
2. **"+ New"** → **"Database"** → **"Redis"**

## 4. Backend (10 min)

1. **"+ New"** → **"GitHub Repo"** → selecciona tu repo
2. **Settings** → **Service Name**: `backend`
3. **Settings** → **Build** → **Root Directory**: `backend`
4. **Variables**:
   ```bash
   DATABASE_URL=${{postgres.DATABASE_URL}}
   REDIS_URL=${{redis.REDIS_URL}}
   SECRET_KEY=<tu-secret-key>
   BACKEND_CORS_ORIGINS=https://pendiente.railway.app
   ENVIRONMENT=production
   ```
5. **Settings** → **Health Check**:
   - Path: `/health`
   - Timeout: 60
6. **Deploy** → Guarda la URL: `https://backend-xxx.railway.app`

## 5. Celery Worker (5 min)

1. **"+ New"** → **"GitHub Repo"** → tu repo
2. **Settings** → **Service Name**: `celery-worker`
3. **Settings** → **Build** → **Root Directory**: `backend`
4. **Settings** → **Deploy** → **Start Command**:
   ```bash
   celery -A app.core.celery_app worker --loglevel=info
   ```
5. **Variables**:
   ```bash
   DATABASE_URL=${{postgres.DATABASE_URL}}
   REDIS_URL=${{redis.REDIS_URL}}
   SECRET_KEY=${{backend.SECRET_KEY}}
   ENVIRONMENT=production
   ```
6. **Deploy**

## 6. Celery Beat (5 min)

1. **"+ New"** → **"GitHub Repo"** → tu repo
2. **Settings** → **Service Name**: `celery-beat`
3. **Settings** → **Build** → **Root Directory**: `backend`
4. **Settings** → **Deploy** → **Start Command**:
   ```bash
   celery -A app.core.celery_app beat --loglevel=info
   ```
5. **Variables**: mismas que celery-worker
6. **Deploy**

## 7. Frontend (10 min)

1. **"+ New"** → **"GitHub Repo"** → tu repo
2. **Settings** → **Service Name**: `frontend`
3. **Settings** → **Build** → **Root Directory**: `frontend`
4. **Variables**:
   ```bash
   VITE_API_URL=https://backend-xxx.railway.app/api/v1
   ```
   (Reemplaza con tu URL del backend del paso 4)
5. **Deploy** → Guarda la URL: `https://frontend-yyy.railway.app`

## 8. Actualizar CORS (2 min)

1. Ve al servicio **backend**
2. **Variables** → Edita `BACKEND_CORS_ORIGINS`:
   ```bash
   BACKEND_CORS_ORIGINS=https://frontend-yyy.railway.app
   ```
   (Reemplaza con tu URL del frontend del paso 7)
3. Railway redesplegará automáticamente

## 9. Verificación (2 min)

- ✅ Backend: `https://backend-xxx.railway.app/docs`
- ✅ Health: `https://backend-xxx.railway.app/health`
- ✅ Frontend: `https://frontend-yyy.railway.app`

## 10. Usuario Administrador (3 min)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Crear usuario admin
railway run --service backend python -m app.scripts.create_initial_data
```

**Login**:
- Email: `admin@clubecuestre.com`
- Password: `admin123`

**⚠️ CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE**

---

## Resumen de Tiempo

- Total: ~45 minutos
- Costos: ~$24/mes (primeros $5 gratis)

## ⚠️ Error "Railpack build failed"

Es normal en monorepos. Los archivos `railway.toml` ya están configurados. Simplemente especifica el **Root Directory** correctamente en cada servicio y funcionará.

---

## Siguiente: Configuración Opcional

Ver `RAILWAY_DEPLOYMENT.md` para:
- Dominios personalizados
- Cloudinary (imágenes)
- Email SMTP
- Monitoreo

---

¡Listo! Tu sistema está en producción 🎉
