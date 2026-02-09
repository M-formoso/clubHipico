# Guía de Despliegue en Railway

## Configuración de 3 servicios en Railway

### 1. PostgreSQL (Base de Datos)
1. En Railway, crea un nuevo servicio de **PostgreSQL**
2. Railway generará automáticamente la variable `DATABASE_URL`
3. Copia esta URL, la necesitarás para el backend

### 2. Backend (FastAPI)
1. Crea un nuevo servicio desde tu repositorio de GitHub
2. Selecciona la carpeta `backend` como Root Directory
3. Configura las siguientes **Variables de Entorno**:

```bash
# OBLIGATORIAS
DATABASE_URL=<copia la URL de tu PostgreSQL de Railway>
SECRET_KEY=CsFIMCa3-xLNMChoHLoLIzIEOByF_FIyjITJdmgJvGI

# CORS - Agrega tu dominio de frontend de Railway
BACKEND_CORS_ORIGINS=["https://tu-frontend.railway.app","http://localhost:5173"]

# OPCIONALES (con valores por defecto)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=production

# Redis (dejar vacío si no lo usas)
REDIS_URL=

# Email (opcional - configurar si necesitas emails)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@clubecuestre.com
EMAIL_FROM_NAME=Club Ecuestre

# Cloudinary (opcional - configurar si necesitas subida de imágenes a la nube)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. **Settings del servicio Backend en Railway:**
   - Build Command: (dejar vacío, usa Dockerfile)
   - Start Command: (dejar vacío, usa Dockerfile)
   - Root Directory: `backend`

### 3. Frontend (React + Vite)
1. Crea un nuevo servicio desde tu repositorio de GitHub
2. Selecciona la carpeta `frontend` como Root Directory
3. Configura las siguientes **Variables de Entorno**:

```bash
# URL de tu backend en Railway
VITE_API_URL=https://tu-backend.railway.app
```

4. **Settings del servicio Frontend en Railway:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` o usa un servidor como nginx

## Pasos para Desplegar

### Paso 1: Configurar PostgreSQL
1. Crea el servicio PostgreSQL en Railway
2. Espera a que esté listo (⚡ Running)
3. Ve a la pestaña "Variables" y copia el valor de `DATABASE_URL`

### Paso 2: Configurar Backend
1. Crea el servicio del Backend
2. Ve a Settings > Variables
3. Agrega TODAS las variables de entorno listadas arriba
4. **IMPORTANTE:** Pega el `DATABASE_URL` de PostgreSQL
5. Railway detectará el Dockerfile y comenzará a construir
6. Espera a que el deployment termine

### Paso 3: Configurar Frontend
1. Crea el servicio del Frontend
2. Ve a Settings > Variables
3. Agrega `VITE_API_URL` con la URL pública de tu backend
4. En Settings, asegúrate de configurar:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

### Paso 4: Actualizar CORS
1. Una vez que tengas la URL pública del frontend (ej: `https://tu-app.railway.app`)
2. Ve al Backend > Variables
3. Actualiza `BACKEND_CORS_ORIGINS` para incluir esa URL:
   ```
   BACKEND_CORS_ORIGINS=["https://tu-app.railway.app"]
   ```

## Verificación

1. **Backend:** Accede a `https://tu-backend.railway.app/docs` - Deberías ver la documentación de la API
2. **Frontend:** Accede a `https://tu-frontend.railway.app` - Debería cargar la aplicación
3. **Base de datos:** Las migraciones se ejecutan automáticamente al iniciar el backend

## Solución de Problemas Comunes

### Error: "Field required [type=missing]"
- **Causa:** Falta una variable de entorno obligatoria
- **Solución:** Verifica que `DATABASE_URL` y `SECRET_KEY` estén configuradas

### Error: "connection refused" o "database does not exist"
- **Causa:** El backend no puede conectarse a PostgreSQL
- **Solución:** Verifica que el `DATABASE_URL` sea correcto y que el servicio PostgreSQL esté corriendo

### Error de CORS en el navegador
- **Causa:** El frontend no está en la lista de orígenes permitidos
- **Solución:** Actualiza `BACKEND_CORS_ORIGINS` con la URL correcta del frontend

### Migraciones no se ejecutan
- **Causa:** Error en las migraciones de Alembic
- **Solución:** Revisa los logs del backend en Railway para ver el error específico

## Notas Importantes

1. **SECRET_KEY:** Es CRÍTICA para la seguridad. He generado una para ti, pero puedes generar una nueva con:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **DATABASE_URL:** Railway genera automáticamente esta variable cuando creas un servicio PostgreSQL. Cópiala exactamente como aparece.

3. **CORS:** Debes agregar la URL de tu frontend de Railway a `BACKEND_CORS_ORIGINS` para que funcione correctamente.

4. **Redis:** Lo dejamos vacío por ahora. Si más adelante necesitas Redis, puedes agregar un servicio Redis en Railway y actualizar la variable.

5. **Puerto:** Railway asigna automáticamente el puerto a través de la variable `PORT`. El Dockerfile ya está configurado para usarla.

## Comandos Útiles para Desarrollo Local

Para probar localmente antes de desplegar:

```bash
# Backend
cd backend
docker-compose up -d  # Levanta PostgreSQL y Redis
alembic upgrade head  # Ejecuta migraciones
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```
