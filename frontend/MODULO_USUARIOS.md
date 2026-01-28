# Módulo de Usuarios con Sistema de Permisos Granulares

## Resumen

Se ha transformado completamente el módulo de **Empleados** en **Usuarios**, implementando un sistema avanzado de gestión de permisos granulares por módulo.

## Cambios Realizados

### 1. Tipos y Modelos (`src/types/usuario.ts`)

**Nuevos tipos creados:**
- `Modulo`: Enumera todos los módulos del sistema (dashboard, caballos, clientes, eventos, usuarios, pagos, reportes, alertas, configuracion)
- `AccionPermiso`: Acciones disponibles (ver, crear, editar, eliminar)
- `PermisoModulo`: Permisos específicos de un módulo
- `Permisos`: Conjunto completo de permisos de un usuario
- `Usuario`: Tipo principal que reemplaza a Empleado, incluye permisos
- `UsuarioCreate` y `UsuarioUpdate`: DTOs para crear y actualizar usuarios
- `PERMISOS_POR_ROL`: Configuración predefinida de permisos según el rol

**Roles disponibles:**
- `super_admin`: Acceso total a todo el sistema
- `admin`: Acceso amplio con algunas restricciones
- `empleado`: Acceso limitado según permisos asignados
- `cliente`: Acceso mínimo, principalmente vista

### 2. Servicios API (`src/services/usuarioService.ts`)

Nuevo servicio que reemplaza a `empleadoService`:
- `getAll()`: Obtener todos los usuarios con filtros
- `getById(id)`: Obtener usuario por ID
- `create(usuario)`: Crear nuevo usuario
- `update(id, usuario)`: Actualizar usuario existente
- `delete(id)`: Eliminar usuario
- `updatePermisos(id, permisos)`: Actualizar permisos específicamente
- Funciones de horarios y asistencias (heredadas)

### 3. Hooks Personalizados

#### `src/hooks/useUsuarios.ts`
- `useUsuarios(params)`: Lista de usuarios con filtros
- `useUsuario(id)`: Usuario individual
- `useCreateUsuario()`: Mutación para crear
- `useUpdateUsuario()`: Mutación para actualizar
- `useDeleteUsuario()`: Mutación para eliminar

#### `src/hooks/usePermisos.ts`
Hook para verificar permisos del usuario actual:
```typescript
const { puedeVer, puedeCrear, puedeEditar, puedeEliminar } = usePermisos();

if (puedeCrear('usuarios')) {
  // Mostrar botón de crear
}
```

### 4. Componente de Gestión de Permisos

**`src/components/usuarios/PermisosManager.tsx`**

Componente completo para administrar permisos:
- Tabla interactiva con todos los módulos
- Checkboxes para cada acción (ver, crear, editar, eliminar)
- Botón "Todos" para marcar/desmarcar todos los permisos de un módulo
- Botón para cargar permisos predefinidos según el rol
- Descripción de cada módulo y acción
- Modo de solo lectura para visualización

### 5. Páginas del Módulo

#### `src/pages/usuarios/UsuarioCreatePage.tsx`
Formulario completo con tabs para:
- **Personal**: Datos personales y contacto de emergencia
- **Cuenta y Rol**: Email, contraseña y rol del usuario
- **Laboral**: Función, fecha de ingreso y salario (opcional)
- **Permisos**: Configuración granular de permisos por módulo

#### `src/pages/usuarios/UsuariosListPage.tsx`
- Lista de todos los usuarios
- Búsqueda por nombre, email o DNI
- Filtros y badges de rol/estado
- Navegación rápida a detalle y edición

#### `src/pages/usuarios/UsuarioDetailPage.tsx`
- Vista completa del usuario con tabs
- Información personal y laboral
- Visualización de permisos (solo lectura)
- Acciones: editar y eliminar

#### `src/pages/usuarios/UsuarioEditPage.tsx`
- Similar a la creación pero con datos precargados
- Permite cambiar contraseña (opcional)
- Activar/desactivar usuario
- Modificar permisos

### 6. Componentes UI Agregados

**`src/components/ui/checkbox.tsx`**
- Componente Checkbox de Radix UI estilizado con Tailwind

**`src/components/ui/select.tsx`**
- Componente Select completo de Radix UI
- Incluye trigger, content, item, y scroll buttons

### 7. Actualizaciones del Sistema

#### `src/App.tsx`
- Rutas actualizadas de `/empleados` a `/usuarios`
- Imports actualizados

#### `src/components/layout/Sidebar.tsx`
- Menú "Empleados" → "Usuarios"
- Icono actualizado (Briefcase → UserCog)

#### `src/stores/authStore.ts`
- Agregado campo `permisos` al estado
- Método `updatePermisos()` para actualizar permisos en runtime
- Persistencia de permisos en localStorage

#### `src/types/index.ts`
- Export de tipos de usuario
- Interfaz `User` actualizada con campo `permisos`

## Características del Sistema de Permisos

### Permisos Granulares

Cada usuario puede tener permisos específicos para cada módulo:

```typescript
{
  dashboard: { ver: true, crear: false, editar: false, eliminar: false },
  caballos: { ver: true, crear: true, editar: true, eliminar: false },
  clientes: { ver: true, crear: false, editar: false, eliminar: false },
  // ... otros módulos
}
```

### Permisos por Defecto

El sistema incluye configuraciones predefinidas por rol que pueden ser:
- Aplicadas automáticamente al crear un usuario
- Personalizadas módulo por módulo
- Modificadas en cualquier momento

### Validación en Frontend

Usa el hook `usePermisos()` para:
```typescript
// Verificar acceso a un módulo
if (!tieneAccesoModulo('usuarios')) {
  return <Navigate to="/dashboard" />;
}

// Mostrar/ocultar botones según permisos
{puedeCrear('caballos') && (
  <Button onClick={handleCreate}>Crear Caballo</Button>
)}
```

## Uso del Módulo

### Crear un nuevo usuario

1. Navegar a `/usuarios/nuevo`
2. Completar información personal
3. Asignar email, contraseña y rol
4. Configurar información laboral (opcional)
5. Personalizar permisos por módulo
6. Guardar

### Editar permisos de un usuario existente

1. Navegar a `/usuarios/:id/editar`
2. Ir a la tab "Permisos"
3. Marcar/desmarcar permisos específicos
4. O usar "Cargar permisos por defecto del rol"
5. Guardar cambios

### Verificar permisos en componentes

```typescript
import { usePermisos } from '@/hooks/usePermisos';

function MiComponente() {
  const { puedeVer, puedeEditar } = usePermisos();

  if (!puedeVer('usuarios')) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      {puedeEditar('usuarios') && (
        <Button>Editar</Button>
      )}
    </div>
  );
}
```

## Integración con el Backend

El backend debe implementar los siguientes endpoints:

### Usuarios
- `GET /api/v1/usuarios/` - Listar usuarios
- `GET /api/v1/usuarios/:id` - Obtener usuario
- `POST /api/v1/usuarios/` - Crear usuario
- `PUT /api/v1/usuarios/:id` - Actualizar usuario
- `DELETE /api/v1/usuarios/:id` - Eliminar usuario
- `PUT /api/v1/usuarios/:id/permisos` - Actualizar solo permisos

### Autenticación
El endpoint de login debe retornar el usuario con sus permisos:
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "rol": "admin",
  "permisos": {
    "dashboard": { "ver": true, "crear": false, ... },
    ...
  }
}
```

## Próximos Pasos Recomendados

1. **Backend**: Implementar los endpoints de usuarios con validación de permisos
2. **Middleware de permisos**: Crear HOC o middleware para proteger rutas según permisos
3. **Auditoría**: Agregar log de cambios de permisos
4. **Roles personalizados**: Permitir crear roles custom más allá de los 4 básicos
5. **Permisos a nivel de registro**: Restricciones más granulares (ej: "solo ver sus propios registros")

## Archivos Creados/Modificados

### Nuevos Archivos
- `src/types/usuario.ts`
- `src/services/usuarioService.ts`
- `src/hooks/useUsuarios.ts`
- `src/hooks/usePermisos.ts`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/select.tsx`
- `src/components/usuarios/PermisosManager.tsx`
- `src/pages/usuarios/UsuarioCreatePage.tsx`
- `src/pages/usuarios/UsuariosListPage.tsx`
- `src/pages/usuarios/UsuarioDetailPage.tsx`
- `src/pages/usuarios/UsuarioEditPage.tsx`

### Archivos Modificados
- `src/types/index.ts`
- `src/App.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/stores/authStore.ts`

### Archivos Legacy (mantener por compatibilidad)
- `src/types/empleado.ts`
- `src/services/empleadoService.ts`
- `src/pages/empleados/*`

## Notas Importantes

- Los archivos del módulo de empleados se mantienen para compatibilidad si hay referencias en otras partes del código
- El sistema de permisos es completamente granular y personalizable
- Los super_admin siempre tienen acceso completo sin restricciones
- Los permisos se validan tanto en frontend como deben validarse en backend
- El módulo está listo para producción una vez el backend implemente los endpoints
