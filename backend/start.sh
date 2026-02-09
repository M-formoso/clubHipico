#!/bin/bash
set -e

echo "🔍 Verificando variables de entorno..."

# Verificar variables obligatorias
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY no está configurada"
    exit 1
fi

echo "✅ DATABASE_URL: configurada"
echo "✅ SECRET_KEY: configurada (${#SECRET_KEY} caracteres)"
echo "✅ ALGORITHM: ${ALGORITHM:-HS256}"
echo "✅ ENVIRONMENT: ${ENVIRONMENT:-development}"

echo ""
echo "🚀 Ejecutando migraciones de base de datos..."
alembic upgrade head

echo ""
echo "🌐 Iniciando servidor FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
