# Setup del Frontend - Club Ecuestre

## Dependencias necesarias

Para que el frontend funcione correctamente, necesitas instalar las siguientes dependencias de Radix UI y otras librerías:

```bash
cd frontend

# Instalar dependencias de Radix UI para shadcn/ui
npm install @radix-ui/react-slot
npm install @radix-ui/react-label
npm install @radix-ui/react-dialog
npm install @radix-ui/react-toast

# Instalar date-fns si no está instalado
npm install date-fns

# Verificar que todas las dependencias estén instaladas
npm install
```

## Estructura del proyecto

El frontend está completamente configurado con:

### ✅ Componentes UI (shadcn/ui)
- Button
- Input
- Card
- Label
- Form
- Badge
- Table
- Dialog
- Toast/Toaster

### ✅ Layout
- Header (con notificaciones y perfil de usuario)
- Sidebar (navegación con control de permisos por rol)
- MainLayout
- AuthLayout

### ✅ Páginas implementadas
- **Auth:** Login, Register
- **Dashboard:** Vista principal
- **Caballos:** List, Create, Detail, Edit
- **Clientes:** List, Create, Detail
- **Eventos:** List, Create
- **Empleados:** List
- **Pagos:** List
- **Reportes:** Dashboard de reportes

### ✅ Servicios API
- authService
- caballoService
- clienteService
- eventoService
- empleadoService
- pagoService
- alertaService
- reporteService

### ✅ Tipos TypeScript
- caballo.ts
- cliente.ts
- empleado.ts
- evento.ts
- pago.ts
- alerta.ts
- index.ts (exporta todos)

### ✅ Hooks personalizados
- useToast (notificaciones)
- useCaballos (CRUD caballos)
- useClientes (CRUD clientes)
- useEventos (CRUD eventos)

### ✅ Stores (Zustand)
- authStore (autenticación y usuario actual)

### ✅ Configuración
- Tailwind CSS con colores beige y gris personalizados
- Axios con interceptors para JWT
- React Router v6
- React Query para data fetching
- React Hook Form + Zod para formularios

## Esquema de colores

Los colores principales están configurados en `tailwind.config.js`:

**Beige:**
- 50: #faf8f5
- 100: #f5f1ea
- 200: #e8dfd0
- 300: #d9c9b0
- 400: #c9b091
- 500: #b89771 (Principal)
- 600: #a07d5d
- 700: #7d6149
- 800: #5a4536
- 900: #372923

**Gris:**
- 50: #f9fafb
- 100: #f3f4f6
- 200: #e5e7eb
- 300: #d1d5db
- 400: #9ca3af
- 500: #6b7280 (Principal)
- 600: #4b5563
- 700: #374151
- 800: #1f2937
- 900: #111827

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Iniciar el proyecto

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Páginas pendientes de implementar

Las siguientes páginas tienen comentadas sus rutas en `App.tsx` y necesitan ser implementadas:

- EventoDetailPage
- EmpleadoCreatePage
- EmpleadoDetailPage
- PagoCreatePage
- PagoDetailPage
- AlertasPage
- ConfiguracionPage

## Próximos pasos

1. **Implementar páginas detail/edit faltantes** para eventos, empleados, pagos
2. **Página de alertas** con centro de notificaciones
3. **Página de configuración** del sistema
4. **Calendario visual** para eventos
5. **Gráficos y charts** en reportes (usar recharts o similar)
6. **Upload de imágenes** para caballos
7. **Sistema de permisos** más granular por componente
8. **Tests unitarios** con Vitest

## Notas importantes

- El header ya muestra el contador de alertas no leídas
- El sidebar filtra las opciones de menú según el rol del usuario
- Todos los servicios incluyen manejo de errores
- Los formularios tienen validación con Zod
- Las tablas son responsive y permiten búsqueda
- Los botones usan los colores beige y gris del diseño
