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

// Secciones dentro del módulo de caballos
export type SeccionCaballo =
  | 'info_general'
  | 'alimentacion'
  | 'manejo_trabajo'
  | 'historial_clinico'
  | 'vacunas'
  | 'herrajes'
  | 'antiparasitarios'
  | 'fotos'
  | 'qr'
  | 'plan_sanitario';

// Permisos de una sección de caballo
export interface PermisoSeccionCaballo {
  ver: boolean;
  editar: boolean;
}

// Permisos de todas las secciones de caballos
export interface PermisosCaballoSecciones {
  info_general: PermisoSeccionCaballo;
  alimentacion: PermisoSeccionCaballo;
  manejo_trabajo: PermisoSeccionCaballo;
  historial_clinico: PermisoSeccionCaballo;
  vacunas: PermisoSeccionCaballo;
  herrajes: PermisoSeccionCaballo;
  antiparasitarios: PermisoSeccionCaballo;
  fotos: PermisoSeccionCaballo;
  qr: PermisoSeccionCaballo;
  plan_sanitario: PermisoSeccionCaballo;
}

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

// Permisos extendidos del módulo caballos (incluye secciones)
export interface PermisoModuloCaballos extends PermisoModulo {
  secciones?: PermisosCaballoSecciones;
}

// Conjunto completo de permisos de un usuario
export interface Permisos {
  dashboard: PermisoModulo;
  caballos: PermisoModuloCaballos;
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

// Permisos de secciones de caballos por defecto (todas habilitadas)
export const SECCIONES_CABALLO_FULL: PermisosCaballoSecciones = {
  info_general: { ver: true, editar: true },
  alimentacion: { ver: true, editar: true },
  manejo_trabajo: { ver: true, editar: true },
  historial_clinico: { ver: true, editar: true },
  vacunas: { ver: true, editar: true },
  herrajes: { ver: true, editar: true },
  antiparasitarios: { ver: true, editar: true },
  fotos: { ver: true, editar: true },
  qr: { ver: true, editar: true },
  plan_sanitario: { ver: true, editar: true },
};

// Permisos de secciones de caballos solo lectura
export const SECCIONES_CABALLO_READONLY: PermisosCaballoSecciones = {
  info_general: { ver: true, editar: false },
  alimentacion: { ver: true, editar: false },
  manejo_trabajo: { ver: true, editar: false },
  historial_clinico: { ver: true, editar: false },
  vacunas: { ver: true, editar: false },
  herrajes: { ver: true, editar: false },
  antiparasitarios: { ver: true, editar: false },
  fotos: { ver: true, editar: false },
  qr: { ver: true, editar: false },
  plan_sanitario: { ver: true, editar: false },
};

// Permisos de secciones limitados para empleados (no ven plan sanitario ni QR)
export const SECCIONES_CABALLO_EMPLEADO: PermisosCaballoSecciones = {
  info_general: { ver: true, editar: true },
  alimentacion: { ver: true, editar: true },
  manejo_trabajo: { ver: true, editar: true },
  historial_clinico: { ver: true, editar: true },
  vacunas: { ver: true, editar: true },
  herrajes: { ver: true, editar: true },
  antiparasitarios: { ver: true, editar: true },
  fotos: { ver: true, editar: true },
  qr: { ver: false, editar: false },
  plan_sanitario: { ver: false, editar: false },
};

// Permisos de secciones limitados para clientes (solo info básica)
export const SECCIONES_CABALLO_CLIENTE: PermisosCaballoSecciones = {
  info_general: { ver: true, editar: false },
  alimentacion: { ver: true, editar: false },
  manejo_trabajo: { ver: true, editar: false },
  historial_clinico: { ver: true, editar: false },
  vacunas: { ver: true, editar: false },
  herrajes: { ver: true, editar: false },
  antiparasitarios: { ver: true, editar: false },
  fotos: { ver: true, editar: false },
  qr: { ver: false, editar: false },
  plan_sanitario: { ver: false, editar: false },
};

// Información de las secciones para mostrar en la UI
export const SECCIONES_CABALLO_INFO: Record<SeccionCaballo, { nombre: string; descripcion: string }> = {
  info_general: { nombre: 'Información General', descripcion: 'Datos básicos del caballo, raza, color, propietario' },
  alimentacion: { nombre: 'Alimentación', descripcion: 'Plan de alimentación, granos, suplementos' },
  manejo_trabajo: { nombre: 'Manejo y Trabajo', descripcion: 'Tipo de manejo, jinete, días de trabajo' },
  historial_clinico: { nombre: 'Historial Clínico', descripcion: 'Línea de tiempo de eventos médicos' },
  vacunas: { nombre: 'Vacunas y Análisis', descripcion: 'Registro de vacunas, estudios médicos, revisiones dentales' },
  herrajes: { nombre: 'Herrajes', descripcion: 'Registro de herrajes y próximas fechas' },
  antiparasitarios: { nombre: 'Antiparasitarios', descripcion: 'Tratamientos antiparasitarios' },
  fotos: { nombre: 'Galería de Fotos', descripcion: 'Fotos del caballo' },
  qr: { nombre: 'Código QR', descripcion: 'QR para acceso rápido' },
  plan_sanitario: { nombre: 'Plan Sanitario', descripcion: 'Plan sanitario Haras Club 2026' },
};

// Permisos por defecto según el rol
export const PERMISOS_POR_ROL: Record<string, Permisos> = {
  super_admin: {
    dashboard: { modulo: 'dashboard', ver: true, crear: true, editar: true, eliminar: true },
    caballos: { modulo: 'caballos', ver: true, crear: true, editar: true, eliminar: true, secciones: SECCIONES_CABALLO_FULL },
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
    caballos: { modulo: 'caballos', ver: true, crear: true, editar: true, eliminar: true, secciones: SECCIONES_CABALLO_FULL },
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
    caballos: { modulo: 'caballos', ver: true, crear: false, editar: true, eliminar: false, secciones: SECCIONES_CABALLO_EMPLEADO },
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
    caballos: { modulo: 'caballos', ver: true, crear: false, editar: false, eliminar: false, secciones: SECCIONES_CABALLO_CLIENTE },
    clientes: { modulo: 'clientes', ver: false, crear: false, editar: false, eliminar: false },
    eventos: { modulo: 'eventos', ver: true, crear: false, editar: false, eliminar: false },
    usuarios: { modulo: 'usuarios', ver: false, crear: false, editar: false, eliminar: false },
    pagos: { modulo: 'pagos', ver: true, crear: false, editar: false, eliminar: false },
    reportes: { modulo: 'reportes', ver: false, crear: false, editar: false, eliminar: false },
    alertas: { modulo: 'alertas', ver: true, crear: false, editar: false, eliminar: false },
    configuracion: { modulo: 'configuracion', ver: false, crear: false, editar: false, eliminar: false },
  },
};
