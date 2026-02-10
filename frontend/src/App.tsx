import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/authStore';
import { Modulo, AccionPermiso } from '@/types/usuario';

// Layouts (loaded eagerly — always needed)
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth (eager — entry point)
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));

const CaballosListPage = lazy(() => import('@/pages/caballos/CaballosListPage').then(m => ({ default: m.CaballosListPage })));
const CaballoCreatePage = lazy(() => import('@/pages/caballos/CaballoCreatePage').then(m => ({ default: m.CaballoCreatePage })));
const CaballoDetailPage = lazy(() => import('@/pages/caballos/CaballoDetailPage').then(m => ({ default: m.CaballoDetailPage })));
const CaballoEditPage = lazy(() => import('@/pages/caballos/CaballoEditPage').then(m => ({ default: m.CaballoEditPage })));

const ClientesListPage = lazy(() => import('@/pages/clientes/ClientesListPage').then(m => ({ default: m.ClientesListPage })));
const ClienteCreatePage = lazy(() => import('@/pages/clientes/ClienteCreatePage').then(m => ({ default: m.ClienteCreatePage })));
const ClienteDetailPage = lazy(() => import('@/pages/clientes/ClienteDetailPage').then(m => ({ default: m.ClienteDetailPage })));
const ClienteEditPage = lazy(() => import('@/pages/clientes/ClienteEditPage').then(m => ({ default: m.ClienteEditPage })));

const EventosListPage = lazy(() => import('@/pages/eventos/EventosListPage').then(m => ({ default: m.EventosListPage })));
const EventoCreatePage = lazy(() => import('@/pages/eventos/EventoCreatePage').then(m => ({ default: m.EventoCreatePage })));
const EventoDetailPage = lazy(() => import('@/pages/eventos/EventoDetailPage').then(m => ({ default: m.EventoDetailPage })));

const UsuariosListPage = lazy(() => import('@/pages/usuarios/UsuariosListPage').then(m => ({ default: m.UsuariosListPage })));
const UsuarioCreatePage = lazy(() => import('@/pages/usuarios/UsuarioCreatePage').then(m => ({ default: m.UsuarioCreatePage })));
const UsuarioDetailPage = lazy(() => import('@/pages/usuarios/UsuarioDetailPage').then(m => ({ default: m.UsuarioDetailPage })));
const UsuarioEditPage = lazy(() => import('@/pages/usuarios/UsuarioEditPage').then(m => ({ default: m.UsuarioEditPage })));


const PagosListPage = lazy(() => import('@/pages/pagos/PagosListPage').then(m => ({ default: m.PagosListPage })));
const PagoCreatePage = lazy(() => import('@/pages/pagos/PagoCreatePage').then(m => ({ default: m.PagoCreatePage })));
const PagoDetailPage = lazy(() => import('@/pages/pagos/PagoDetailPage').then(m => ({ default: m.PagoDetailPage })));

const ReportesPage = lazy(() => import('@/pages/reportes/ReportesPage').then(m => ({ default: m.ReportesPage })));

const AlertasListPage = lazy(() => import('@/pages/alertas/AlertasListPage').then(m => ({ default: m.AlertasListPage })));
const AlertaCreatePage = lazy(() => import('@/pages/alertas/AlertaCreatePage').then(m => ({ default: m.AlertaCreatePage })));
const AlertaDetailPage = lazy(() => import('@/pages/alertas/AlertaDetailPage').then(m => ({ default: m.AlertaDetailPage })));
const TiposAlertaPage = lazy(() => import('@/pages/alertas/TiposAlertaPage').then(m => ({ default: m.TiposAlertaPage })));

// Fallback para rutas lazy
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Cargando...</div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles: string[]
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.rol)) {
    // Si el usuario no tiene permiso, redirigir según su rol
    if (user.rol === 'cliente') {
      return <Navigate to="/eventos" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { user } = useAuthStore();

  if (user?.rol === 'cliente') {
    return <Navigate to="/eventos" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function PermissionProtectedRoute({
  children,
  modulo,
  accion
}: {
  children: React.ReactNode;
  modulo: Modulo;
  accion: AccionPermiso;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Super admin siempre tiene permisos
  if (user?.rol === 'super_admin') {
    return <>{children}</>;
  }

  // Verificar permiso
  const permisoModulo = user?.permisos?.[modulo];
  const tienePermiso = permisoModulo?.[accion] || false;

  if (!tienePermiso) {
    // Redirigir según el rol
    if (user?.rol === 'cliente') {
      return <Navigate to="/eventos" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route
            path="/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'empleado']}>
                <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
              </RoleProtectedRoute>
            }
          />

          {/* Caballos */}
          <Route path="/caballos" element={<Suspense fallback={<PageLoader />}><CaballosListPage /></Suspense>} />
          <Route path="/caballos/nuevo" element={<Suspense fallback={<PageLoader />}><CaballoCreatePage /></Suspense>} />
          <Route path="/caballos/:id" element={<Suspense fallback={<PageLoader />}><CaballoDetailPage /></Suspense>} />
          <Route path="/caballos/:id/editar" element={<Suspense fallback={<PageLoader />}><CaballoEditPage /></Suspense>} />

          {/* Clientes */}
          <Route path="/clientes" element={<Suspense fallback={<PageLoader />}><ClientesListPage /></Suspense>} />
          <Route path="/clientes/nuevo" element={<Suspense fallback={<PageLoader />}><ClienteCreatePage /></Suspense>} />
          <Route path="/clientes/:id" element={<Suspense fallback={<PageLoader />}><ClienteDetailPage /></Suspense>} />
          <Route path="/clientes/:id/editar" element={<Suspense fallback={<PageLoader />}><ClienteEditPage /></Suspense>} />

          {/* Eventos */}
          <Route path="/eventos" element={<Suspense fallback={<PageLoader />}><EventosListPage /></Suspense>} />
          <Route path="/eventos/nuevo" element={<Suspense fallback={<PageLoader />}><EventoCreatePage /></Suspense>} />
          <Route path="/eventos/:id" element={<Suspense fallback={<PageLoader />}><EventoDetailPage /></Suspense>} />

          {/* Usuarios */}
          <Route
            path="/usuarios"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Suspense fallback={<PageLoader />}><UsuariosListPage /></Suspense>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/usuarios/nuevo"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Suspense fallback={<PageLoader />}><UsuarioCreatePage /></Suspense>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/usuarios/:id"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Suspense fallback={<PageLoader />}><UsuarioDetailPage /></Suspense>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/usuarios/:id/editar"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Suspense fallback={<PageLoader />}><UsuarioEditPage /></Suspense>
              </RoleProtectedRoute>
            }
          />

          {/* Pagos */}
          <Route
            path="/pagos"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'empleado']}>
                <Suspense fallback={<PageLoader />}><PagosListPage /></Suspense>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/pagos/nuevo"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'empleado']}>
                <Suspense fallback={<PageLoader />}><PagoCreatePage /></Suspense>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/pagos/:id"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'empleado']}>
                <Suspense fallback={<PageLoader />}><PagoDetailPage /></Suspense>
              </RoleProtectedRoute>
            }
          />

          {/* Reportes */}
          <Route
            path="/reportes"
            element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Suspense fallback={<PageLoader />}><ReportesPage /></Suspense>
              </RoleProtectedRoute>
            }
          />

          {/* Alertas */}
          <Route path="/alertas" element={<Suspense fallback={<PageLoader />}><AlertasListPage /></Suspense>} />
          <Route
            path="/alertas/nueva"
            element={
              <PermissionProtectedRoute modulo="alertas" accion="crear">
                <Suspense fallback={<PageLoader />}><AlertaCreatePage /></Suspense>
              </PermissionProtectedRoute>
            }
          />
          <Route
            path="/alertas/tipos"
            element={
              <PermissionProtectedRoute modulo="alertas" accion="crear">
                <Suspense fallback={<PageLoader />}><TiposAlertaPage /></Suspense>
              </PermissionProtectedRoute>
            }
          />
          <Route path="/alertas/:id" element={<Suspense fallback={<PageLoader />}><AlertaDetailPage /></Suspense>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
