# 🚀 COMANDOS PARA EJECUTAR EN LA TERMINAL

## ✅ COMPLETADO
La migración de base de datos **YA FUE APLICADA** exitosamente.

Los modelos y schemas **YA ESTÁN CREADOS/ACTUALIZADOS** y la base de datos refleja los cambios.

## ⚠️ IMPORTANTE
NO copies código de `IMPLEMENTACION_BACKEND.md` a la terminal.
Ese archivo es solo una **guía de referencia**.

## 📝 Lo Que Ya Se Hizo

### 1. ✅ Entorno virtual creado e instalado

El entorno virtual está en `/backend/venv/` con todas las dependencias instaladas.

### 2. ✅ Base de datos PostgreSQL funcionando

Docker Compose está corriendo la base de datos en `localhost:5432`

### 3. ✅ Migración creada y aplicada

La migración `c81481935e3e_add_permisos_to_usuarios_and_expand_.py` fue aplicada exitosamente.

### 4. ✅ Cambios aplicados a la base de datos

**Tabla `usuarios`:**
- ✅ Agregada columna `permisos` (JSONB)

**Tabla `alertas`:**
- ✅ Agregado campo `tipo_alerta_id` (FK a tipos_alerta)
- ✅ Agregado campo `fecha_vencimiento` (DateTime)
- ✅ Agregado campo `acciones_disponibles` (JSONB)
- ✅ Agregado campo `datos_adicionales` (JSONB)
- ✅ Modificado `mensaje` de VARCHAR(1000) a TEXT
- ✅ Modificado `fecha_evento` de DATE a DateTime

**Nuevas tablas:**
- ✅ Creada tabla `tipos_alerta`
- ✅ Creada tabla `configuracion_alertas_usuario`

### 5. ✅ Backend corriendo en Docker

El backend ya está corriendo en Docker en `http://localhost:8000`

Para ver los logs del backend:
```bash
docker logs clubecuestre_backend -f
```

Para reiniciar el backend (si hiciste cambios):
```bash
docker-compose restart backend
```

### 6. Verificar que funciona

Abre tu navegador en:
```
http://localhost:8000/docs
```

Deberías ver la documentación automática (Swagger) con todos los endpoints.

---

## ✅ Resumen de lo que YA ESTÁ HECHO

1. ✅ **Modelos actualizados**:
   - `app/models/usuario.py` - con campo `permisos`
   - `app/models/alerta.py` - con 3 modelos completos

2. ✅ **Schemas actualizados**:
   - `app/schemas/usuario.py` - con campo `permisos`
   - `app/schemas/alerta.py` - completo con todos los schemas

---

## 🔧 Si algo falla

### Error: "alembic: command not found"
```bash
pip install alembic
```

### Error: "No module named 'app'"
```bash
# Asegúrate de estar en el directorio backend
pwd  # Debería mostrar: .../Sistema Club Hipico/backend
```

### Error en la migración
```bash
# Revertir la última migración
alembic downgrade -1

# Borrar el archivo de migración creado
rm alembic/versions/XXXX_add_permisos_to_usuarios.py

# Volver a crear
alembic revision --autogenerate -m "add permisos to usuarios and expand alertas system"
```

### Ver estado actual de migraciones
```bash
alembic current
alembic history
```

---

## 📊 Verificar la Base de Datos

Si quieres ver que las tablas se crearon correctamente:

```bash
# Si usas PostgreSQL
psql -d clubecuestre_db -c "\dt"

# Ver estructura de tabla usuarios
psql -d clubecuestre_db -c "\d usuarios"

# Ver estructura de tabla tipos_alerta
psql -d clubecuestre_db -c "\d tipos_alerta"
```

---

## 🎯 Endpoints Disponibles (después de migrar)

Una vez que hagas `alembic upgrade head` y `uvicorn app.main:app --reload`:

### Usuarios
- `GET /api/v1/usuarios/` - Listar usuarios
- `POST /api/v1/usuarios/` - Crear usuario
- `GET /api/v1/usuarios/{id}` - Ver usuario
- `PUT /api/v1/usuarios/{id}` - Actualizar usuario
- `DELETE /api/v1/usuarios/{id}` - Eliminar usuario

### Alertas
- `GET /api/v1/alertas/` - Mis alertas
- `GET /api/v1/alertas/no-leidas` - Alertas no leídas
- `POST /api/v1/alertas/` - Crear alerta
- `PUT /api/v1/alertas/{id}/leer` - Marcar leída
- `DELETE /api/v1/alertas/{id}` - Eliminar

---

## ❓ ¿Tienes dudas?

- **¿Qué es alembic?** - Es la herramienta que gestiona las migraciones de base de datos
- **¿Qué es --autogenerate?** - Genera automáticamente el código de migración comparando modelos vs BD
- **¿Qué es upgrade head?** - Aplica todas las migraciones pendientes
- **¿Qué es --reload?** - Reinicia el servidor automáticamente cuando cambias código

---

## 🔥 RESUMEN: Solo 3 comandos esenciales

```bash
cd backend
alembic revision --autogenerate -m "update models"
alembic upgrade head
uvicorn app.main:app --reload
```

¡Eso es todo! 🎉
