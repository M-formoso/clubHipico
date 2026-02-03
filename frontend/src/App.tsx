import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/authStore';

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

const EmpleadosListPage = lazy(() => import('@/pages/empleados/EmpleadosListPage').then(m => ({ default: m.EmpleadosListPage })));
const EmpleadoCreatePage = lazy(() => import('@/pages/empleados/EmpleadoCreatePage').then(m => ({ default: m.EmpleadoCreatePage })));
const EmpleadoDetailPage = lazy(() => import('@/pages/empleados/EmpleadoDetailPage').then(m => ({ default: m.EmpleadoDetailPage })));
const EmpleadoEditPage = lazy(() => import('@/pages/empleados/EmpleadoEditPage').then(m => ({ default: m.EmpleadoEditPage })));

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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />

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

          {/* Empleados */}
          <Route path="/empleados" element={<Suspense fallback={<PageLoader />}><EmpleadosListPage /></Suspense>} />
          <Route path="/empleados/nuevo" element={<Suspense fallback={<PageLoader />}><EmpleadoCreatePage /></Suspense>} />
          <Route path="/empleados/:id" element={<Suspense fallback={<PageLoader />}><EmpleadoDetailPage /></Suspense>} />
          <Route path="/empleados/:id/editar" element={<Suspense fallback={<PageLoader />}><EmpleadoEditPage /></Suspense>} />

          {/* Eventos */}
          <Route path="/eventos" element={<Suspense fallback={<PageLoader />}><EventosListPage /></Suspense>} />
          <Route path="/eventos/nuevo" element={<Suspense fallback={<PageLoader />}><EventoCreatePage /></Suspense>} />
          <Route path="/eventos/:id" element={<Suspense fallback={<PageLoader />}><EventoDetailPage /></Suspense>} />

          {/* Usuarios */}
          <Route path="/usuarios" element={<Suspense fallback={<PageLoader />}><UsuariosListPage /></Suspense>} />
          <Route path="/usuarios/nuevo" element={<Suspense fallback={<PageLoader />}><UsuarioCreatePage /></Suspense>} />
          <Route path="/usuarios/:id" element={<Suspense fallback={<PageLoader />}><UsuarioDetailPage /></Suspense>} />
          <Route path="/usuarios/:id/editar" element={<Suspense fallback={<PageLoader />}><UsuarioEditPage /></Suspense>} />

          {/* Pagos */}
          <Route path="/pagos" element={<Suspense fallback={<PageLoader />}><PagosListPage /></Suspense>} />
          <Route path="/pagos/nuevo" element={<Suspense fallback={<PageLoader />}><PagoCreatePage /></Suspense>} />
          <Route path="/pagos/:id" element={<Suspense fallback={<PageLoader />}><PagoDetailPage /></Suspense>} />

          {/* Reportes */}
          <Route path="/reportes" element={<Suspense fallback={<PageLoader />}><ReportesPage /></Suspense>} />

          {/* Alertas */}
          <Route path="/alertas" element={<Suspense fallback={<PageLoader />}><AlertasListPage /></Suspense>} />
          <Route path="/alertas/nueva" element={<Suspense fallback={<PageLoader />}><AlertaCreatePage /></Suspense>} />
          <Route path="/alertas/tipos" element={<Suspense fallback={<PageLoader />}><TiposAlertaPage /></Suspense>} />
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
