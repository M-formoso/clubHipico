import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/authStore';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Caballos
import { CaballosListPage } from '@/pages/caballos/CaballosListPage';
import { CaballoCreatePage } from '@/pages/caballos/CaballoCreatePage';
import { CaballoDetailPage } from '@/pages/caballos/CaballoDetailPage';
import { CaballoEditPage } from '@/pages/caballos/CaballoEditPage';

// Clientes
import { ClientesListPage } from '@/pages/clientes/ClientesListPage';
import { ClienteCreatePage } from '@/pages/clientes/ClienteCreatePage';
import { ClienteDetailPage } from '@/pages/clientes/ClienteDetailPage';
import { ClienteEditPage } from '@/pages/clientes/ClienteEditPage';

// Eventos
import { EventosListPage } from '@/pages/eventos/EventosListPage';
import { EventoCreatePage } from '@/pages/eventos/EventoCreatePage';
import { EventoDetailPage } from '@/pages/eventos/EventoDetailPage';

// Usuarios
import { UsuariosListPage } from '@/pages/usuarios/UsuariosListPage';
import { UsuarioCreatePage } from '@/pages/usuarios/UsuarioCreatePage';
import { UsuarioDetailPage } from '@/pages/usuarios/UsuarioDetailPage';
import { UsuarioEditPage } from '@/pages/usuarios/UsuarioEditPage';

// Pagos
import { PagosListPage } from '@/pages/pagos/PagosListPage';
import { PagoCreatePage } from '@/pages/pagos/PagoCreatePage';
import { PagoDetailPage } from '@/pages/pagos/PagoDetailPage';

// Reportes
import { ReportesPage } from '@/pages/reportes/ReportesPage';

// Alertas
import { AlertasListPage } from '@/pages/alertas/AlertasListPage';
import { AlertaCreatePage } from '@/pages/alertas/AlertaCreatePage';
import { AlertaDetailPage } from '@/pages/alertas/AlertaDetailPage';
import { TiposAlertaPage } from '@/pages/alertas/TiposAlertaPage';

// Protected Route Component
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
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Caballos */}
          <Route path="/caballos" element={<CaballosListPage />} />
          <Route path="/caballos/nuevo" element={<CaballoCreatePage />} />
          <Route path="/caballos/:id" element={<CaballoDetailPage />} />
          <Route path="/caballos/:id/editar" element={<CaballoEditPage />} />

          {/* Clientes */}
          <Route path="/clientes" element={<ClientesListPage />} />
          <Route path="/clientes/nuevo" element={<ClienteCreatePage />} />
          <Route path="/clientes/:id" element={<ClienteDetailPage />} />
          <Route path="/clientes/:id/editar" element={<ClienteEditPage />} />

          {/* Eventos */}
          <Route path="/eventos" element={<EventosListPage />} />
          <Route path="/eventos/nuevo" element={<EventoCreatePage />} />
          <Route path="/eventos/:id" element={<EventoDetailPage />} />

          {/* Usuarios */}
          <Route path="/usuarios" element={<UsuariosListPage />} />
          <Route path="/usuarios/nuevo" element={<UsuarioCreatePage />} />
          <Route path="/usuarios/:id" element={<UsuarioDetailPage />} />
          <Route path="/usuarios/:id/editar" element={<UsuarioEditPage />} />

          {/* Pagos */}
          <Route path="/pagos" element={<PagosListPage />} />
          <Route path="/pagos/nuevo" element={<PagoCreatePage />} />
          <Route path="/pagos/:id" element={<PagoDetailPage />} />

          {/* Reportes */}
          <Route path="/reportes" element={<ReportesPage />} />

          {/* Alertas */}
          <Route path="/alertas" element={<AlertasListPage />} />
          <Route path="/alertas/nueva" element={<AlertaCreatePage />} />
          <Route path="/alertas/tipos" element={<TiposAlertaPage />} />
          <Route path="/alertas/:id" element={<AlertaDetailPage />} />

          {/* Configuración */}
          {/* <Route path="/configuracion" element={<ConfiguracionPage />} /> */}
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
