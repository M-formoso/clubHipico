export interface Empleado {
  id: string;
  usuario_id?: string;
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  funcion: 'veterinario' | 'instructor' | 'cuidador' | 'admin' | 'mantenimiento';
  fecha_ingreso?: string;
  salario?: number;
  activo: boolean;
  foto_perfil?: string;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  created_at: string;
  updated_at: string;
}

export interface EmpleadoCreate {
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  funcion: 'veterinario' | 'instructor' | 'cuidador' | 'admin' | 'mantenimiento';
  fecha_ingreso?: string;
  salario?: number;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

export interface EmpleadoUpdate {
  nombre?: string;
  apellido?: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  funcion?: 'veterinario' | 'instructor' | 'cuidador' | 'admin' | 'mantenimiento';
  fecha_ingreso?: string;
  salario?: number;
  activo?: boolean;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}
