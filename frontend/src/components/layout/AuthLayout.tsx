import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-beige-600 mb-2">Club Ecuestre</h1>
          <p className="text-gray-600">Sistema de Gestión Integral</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
