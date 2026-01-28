# Skill: Diseño de base de datos PostgreSQL

## Principios

1. **Normalización**: Hasta 3NF mínimo
2. **UUIDs**: Usar UUID v4 para IDs
3. **Timestamps**: created_at y updated_at en todas las tablas
4. **Soft deletes**: Campo `activo` en lugar de DELETE
5. **Foreign keys**: Siempre con ON DELETE y ON UPDATE
6. **Índices**: En columnas frecuentemente consultadas
7. **JSONB**: Para datos semi-estructurados

## Plantilla de tabla

```sql
CREATE TABLE nombre_tabla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Campos específicos de la tabla
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,

    -- Foreign keys (si aplica)
    propietario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_nombre_activo UNIQUE(nombre) WHERE activo = TRUE
);

-- Índices
CREATE INDEX idx_nombre_tabla_propietario ON nombre_tabla(propietario_id);
CREATE INDEX idx_nombre_tabla_activo ON nombre_tabla(activo) WHERE activo = TRUE;
CREATE INDEX idx_nombre_tabla_created ON nombre_tabla(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_nombre_tabla_updated_at
    BEFORE UPDATE ON nombre_tabla
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Tipos de relaciones

### One-to-Many
```sql
-- Un cliente tiene muchos caballos
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE caballos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    propietario_id UUID REFERENCES clientes(id) ON DELETE SET NULL
);
```

### Many-to-Many
```sql
-- Muchos clientes pueden inscribirse en muchos eventos
CREATE TABLE inscripciones_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_inscripcion UNIQUE(cliente_id, evento_id)
);
```

### Self-referencing
```sql
-- Empleados con supervisor
CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    supervisor_id UUID REFERENCES empleados(id) ON DELETE SET NULL
);
```

## ENUMs en PostgreSQL

```sql
CREATE TYPE rol_usuario AS ENUM ('super_admin', 'admin', 'empleado', 'cliente');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'pagado', 'vencido', 'cancelado');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'cliente'
);
```

## JSONB para datos flexibles

```sql
CREATE TABLE configuracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descripcion TEXT
);

-- Ejemplo de insert
INSERT INTO configuracion (clave, valor, descripcion)
VALUES (
    'precios_servicios',
    '{"pension_mensual": 15000, "clase_individual": 3000, "clase_grupal": 2000}'::jsonb,
    'Precios de los servicios del club'
);

-- Query JSONB
SELECT valor->>'pension_mensual' AS pension
FROM configuracion
WHERE clave = 'precios_servicios';
```

## Función para updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Migraciones Alembic

```python
"""Agregar tabla caballos

Revision ID: abc123
Revises: xyz789
Create Date: 2024-01-15 10:30:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'caballos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('raza', sa.String(100)),
        sa.Column('edad', sa.Integer()),
        sa.Column('propietario_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clientes.id', ondelete='SET NULL')),
        sa.Column('activo', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'))
    )

    op.create_index('idx_caballos_propietario', 'caballos', ['propietario_id'])
    op.create_index('idx_caballos_activo', 'caballos', ['activo'], postgresql_where=sa.text('activo = true'))

def downgrade():
    op.drop_index('idx_caballos_activo')
    op.drop_index('idx_caballos_propietario')
    op.drop_table('caballos')
```

## Checklist diseño de BD

- [ ] IDs son UUID v4
- [ ] Timestamps en todas las tablas
- [ ] Campo `activo` para soft deletes
- [ ] Foreign keys con ON DELETE/UPDATE
- [ ] Índices en columnas frecuentes
- [ ] ENUMs para valores fijos
- [ ] JSONB para datos flexibles
- [ ] Constraints de unicidad donde corresponda
- [ ] Trigger para updated_at
- [ ] Migración Alembic creada
