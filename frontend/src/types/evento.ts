export interface Evento {
  id: string;
  titulo: string;
  tipo: 'clase_grupal' | 'clase_privada' | 'competencia' | 'salida' | 'evento_social' | 'otro';
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  instructor_id?: string;
  instructor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  capacidad_maxima?: number;
  costo: number;
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  ubicacion?: string;
  es_recurrente: boolean;
  recurrencia_config?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EventoCreate {
  titulo: string;
  tipo: 'clase_grupal' | 'clase_privada' | 'competencia' | 'salida' | 'evento_social' | 'otro';
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  instructor_id?: string;
  capacidad_maxima?: number;
  costo?: number;
  ubicacion?: string;
  es_recurrente?: boolean;
  recurrencia_config?: any;
}

export interface EventoUpdate {
  titulo?: string;
  tipo?: 'clase_grupal' | 'clase_privada' | 'competencia' | 'salida' | 'evento_social' | 'otro';
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  instructor_id?: string;
  capacidad_maxima?: number;
  costo?: number;
  estado?: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  ubicacion?: string;
  es_recurrente?: boolean;
  recurrencia_config?: any;
}

export interface InscripcionEvento {
  id: string;
  evento_id: string;
  cliente_id: string;
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  caballo_id?: string;
  caballo?: {
    id: string;
    nombre: string;
  };
  estado: 'confirmado' | 'en_espera' | 'cancelado';
  asistio?: boolean;
  comentarios?: string;
  created_at: string;
}
