export interface Cliente {
  id: string;
  usuario_id?: string;
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipo_cliente: 'socio_pleno' | 'pensionista' | 'alumno';
  estado_cuenta: 'al_dia' | 'debe' | 'moroso';
  saldo: number;
  fecha_alta?: string;
  activo: boolean;
  notas?: string;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ClienteCreate {
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipo_cliente: 'socio_pleno' | 'pensionista' | 'alumno';
  notas?: string;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

export interface ClienteUpdate {
  nombre?: string;
  apellido?: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipo_cliente?: 'socio_pleno' | 'pensionista' | 'alumno';
  estado_cuenta?: 'al_dia' | 'debe' | 'moroso';
  saldo?: number;
  activo?: boolean;
  notas?: string;
  contacto_emergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}
