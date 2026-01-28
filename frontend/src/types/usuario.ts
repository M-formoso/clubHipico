// Módulos disponibles en el sistema
export type Modulo =
  | 'dashboard'
  | 'caballos'
  | 'clientes'
  | 'eventos'
  | 'usuarios'
  | 'pagos'
  | 'reportes'
  | 'alertas'
  | 'configuracion';

// Acciones que se pueden realizar en cada módulo
export type AccionPermiso = 'ver' | 'crear' | 'editar' | 'eliminar';

// Permisos de un módulo específico
export interface PermisoModulo {
  modulo: Modulo;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

// Conjunto completo de permisos de un usuario
export interface Permisos {
  dashboard: PermisoModulo;
  caballos: PermisoModulo;
  clientes: PermisoModulo;
  eventos: PermisoModulo;
  usuarios: PermisoModulo;
  pagos: PermisoModulo;
  reportes: PermisoModulo;
  alertas: PermisoModulo;
  configuracion: PermisoModulo;
}

// Usuario del sistema (antes Empleado)
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  rol: 'super_admin' | 'admin' | 'empleado' | 'cliente';
  funcion?: 'veterinario' | 'instructor' | 'cuidador' | 'admin' | 'mantenimiento';
  fecha_ingreso?: string;
  salario?: number;
  activo: boolean;
  foto_perfil?: string;
  permisos?: Permisos; // Permisos granulares por módulo
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  created_at: string;
  updated_at: string;
}

// Crear nuevo usuario
export interface UsuarioCreate {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  rol: 'super_admin' | 'admin' | 'empleado' | 'cliente';
  funcion?: 'veterinario' | 'instructor' | 'cuidador' | 'admin' | 'mantenimiento';
  fecha_ingreso?: string;
  salario?: number;
  permisos?: Permisos;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

// Actualizar usuario existente
export interface UsuarioUpdate {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  rol?: 'super_admin' | 'admin' | 'empleado' | 'cliente';
  funcion?: 'veterinario' | 'instructor' | 'cuidador' | 'admin' | 'mantenimiento';
  fecha_ingreso?: string;
  salario?: number;
  activo?: boolean;
  permisos?: Permisos;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

// Permisos por defecto según el rol
export const PERMISOS_POR_ROL: Record<string, Permisos> = {
  super_admin: {
    dashboard: { modulo: 'dashboard', ver: true, crear: true, editar: true, eliminar: true },
    caballos: { modulo: 'caballos', ver: true, crear: true, editar: true, eliminar: true },
    clientes: { modulo: 'clientes', ver: true, crear: true, editar: true, eliminar: true },
    eventos: { modulo: 'eventos', ver: true, crear: true, editar: true, eliminar: true },
    usuarios: { modulo: 'usuarios', ver: true, crear: true, editar: true, eliminar: true },
    pagos: { modulo: 'pagos', ver: true, crear: true, editar: true, eliminar: true },
    reportes: { modulo: 'reportes', ver: true, crear: true, editar: true, eliminar: true },
    alertas: { modulo: 'alertas', ver: true, crear: true, editar: true, eliminar: true },
    configuracion: { modulo: 'configuracion', ver: true, crear: true, editar: true, eliminar: true },
  },
  admin: {
    dashboard: { modulo: 'dashboard', ver: true, crear: false, editar: false, eliminar: false },
    caballos: { modulo: 'caballos', ver: true, crear: true, editar: true, eliminar: true },
    clientes: { modulo: 'clientes', ver: true, crear: true, editar: true, eliminar: true },
    eventos: { modulo: 'eventos', ver: true, crear: true, editar: true, eliminar: true },
    usuarios: { modulo: 'usuarios', ver: true, crear: true, editar: true, eliminar: false },
    pagos: { modulo: 'pagos', ver: true, crear: true, editar: true, eliminar: false },
    reportes: { modulo: 'reportes', ver: true, crear: false, editar: false, eliminar: false },
    alertas: { modulo: 'alertas', ver: true, crear: true, editar: true, eliminar: true },
    configuracion: { modulo: 'configuracion', ver: true, crear: false, editar: true, eliminar: false },
  },
  empleado: {
    dashboard: { modulo: 'dashboard', ver: true, crear: false, editar: false, eliminar: false },
    caballos: { modulo: 'caballos', ver: true, crear: false, editar: true, eliminar: false },
    clientes: { modulo: 'clientes', ver: true, crear: false, editar: false, eliminar: false },
    eventos: { modulo: 'eventos', ver: true, crear: false, editar: false, eliminar: false },
    usuarios: { modulo: 'usuarios', ver: false, crear: false, editar: false, eliminar: false },
    pagos: { modulo: 'pagos', ver: true, crear: false, editar: false, eliminar: false },
    reportes: { modulo: 'reportes', ver: false, crear: false, editar: false, eliminar: false },
    alertas: { modulo: 'alertas', ver: true, crear: false, editar: false, eliminar: false },
    configuracion: { modulo: 'configuracion', ver: false, crear: false, editar: false, eliminar: false },
  },
  cliente: {
    dashboard: { modulo: 'dashboard', ver: true, crear: false, editar: false, eliminar: false },
    caballos: { modulo: 'caballos', ver: true, crear: false, editar: false, eliminar: false },
    clientes: { modulo: 'clientes', ver: false, crear: false, editar: false, eliminar: false },
    eventos: { modulo: 'eventos', ver: true, crear: false, editar: false, eliminar: false },
    usuarios: { modulo: 'usuarios', ver: false, crear: false, editar: false, eliminar: false },
    pagos: { modulo: 'pagos', ver: true, crear: false, editar: false, eliminar: false },
    reportes: { modulo: 'reportes', ver: false, crear: false, editar: false, eliminar: false },
    alertas: { modulo: 'alertas', ver: true, crear: false, editar: false, eliminar: false },
    configuracion: { modulo: 'configuracion', ver: false, crear: false, editar: false, eliminar: false },
  },
};
