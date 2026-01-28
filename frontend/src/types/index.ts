// Re-export all types from individual modules
export * from './caballo';
export * from './cliente';
export * from './empleado';
export * from './usuario';
export * from './evento';
export * from './pago';
export * from './alerta';

// User types (auth - versión simplificada)
export interface User {
  id: string;
  email: string;
  rol: 'super_admin' | 'admin' | 'empleado' | 'cliente';
  activo?: boolean;
  permisos?: import('./usuario').Permisos;
  created_at?: string;
  updated_at?: string;
}

// Common types
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface ApiError {
  detail: string;
}
