// ========== ENUMS ==========

export type SexoCaballo = 'macho' | 'hembra' | 'castrado';
export type EstadoCaballo = 'activo' | 'retirado' | 'en_tratamiento' | 'fallecido';
export type ManejoTipo = 'box' | 'box_piquete' | 'piquete' | 'palenque' | 'cross_tie';
export type CategoriaSanitaria = 'A' | 'B';

export interface TrabajoConfig {
  caminador?: boolean;
  cuerda?: boolean;
  manga?: boolean;
  montado?: boolean;
}

// ========== CABALLO ==========

export interface Caballo {
  id: string;

  // Datos básicos OBLIGATORIOS
  nombre: string;
  numero_chip: string;  // OBLIGATORIO - único

  // Datos básicos opcionales
  id_fomento?: string;
  edad?: number;
  fecha_nacimiento?: string;
  pedigree?: string;
  raza?: string;
  sexo?: SexoCaballo;
  color?: string;
  altura?: number;
  peso?: number;

  // Propietario y ubicación
  propietario_id?: string;
  propietario?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  box_asignado?: string;
  estado: EstadoCaballo;

  // QR Code
  qr_code?: string;

  // Alimentación
  grano_balanceado?: string;
  suplementos?: string;
  cantidad_comidas_dia?: number;
  detalles_alimentacion?: string;

  // Manejo diario
  tipo_manejo?: ManejoTipo;

  // Trabajo diario
  dias_trabajo?: string;
  dias_descanso?: string;
  jinete_asignado?: string;
  tiempo_trabajo_diario?: number;  // en minutos
  trabajo_config?: TrabajoConfig;

  // Otros detalles
  embocadura_1?: string;
  embocadura_2?: string;
  cuidados_especiales?: string;
  caracteristicas?: string;
  otra_info_1?: string;
  otra_info_2?: string;
  foto_principal?: string;

  // Plan sanitario
  categoria_sanitaria?: CategoriaSanitaria;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CaballoCreate {
  // OBLIGATORIO
  nombre: string;
  numero_chip: string;

  // Opcional
  id_fomento?: string;
  edad?: number;
  fecha_nacimiento?: string;
  pedigree?: string;
  raza?: string;
  sexo?: SexoCaballo;
  color?: string;
  altura?: number;
  peso?: number;
  propietario_id?: string;
  box_asignado?: string;

  // Alimentación
  grano_balanceado?: string;
  suplementos?: string;
  cantidad_comidas_dia?: number;
  detalles_alimentacion?: string;

  // Manejo
  tipo_manejo?: ManejoTipo;

  // Trabajo
  dias_trabajo?: string;
  dias_descanso?: string;
  jinete_asignado?: string;
  tiempo_trabajo_diario?: number;
  trabajo_config?: TrabajoConfig;

  // Otros
  embocadura_1?: string;
  embocadura_2?: string;
  cuidados_especiales?: string;
  caracteristicas?: string;
  otra_info_1?: string;
  otra_info_2?: string;
  foto_principal?: string;

  // Plan sanitario
  categoria_sanitaria?: CategoriaSanitaria;
}

export interface CaballoUpdate {
  nombre?: string;
  numero_chip?: string;
  id_fomento?: string;
  edad?: number;
  fecha_nacimiento?: string;
  pedigree?: string;
  raza?: string;
  sexo?: SexoCaballo;
  color?: string;
  altura?: number;
  peso?: number;
  propietario_id?: string;
  box_asignado?: string;
  estado?: EstadoCaballo;

  // Alimentación
  grano_balanceado?: string;
  suplementos?: string;
  cantidad_comidas_dia?: number;
  detalles_alimentacion?: string;

  // Manejo
  tipo_manejo?: ManejoTipo;

  // Trabajo
  dias_trabajo?: string;
  dias_descanso?: string;
  jinete_asignado?: string;
  tiempo_trabajo_diario?: number;
  trabajo_config?: TrabajoConfig;

  // Otros
  embocadura_1?: string;
  embocadura_2?: string;
  cuidados_especiales?: string;
  caracteristicas?: string;
  otra_info_1?: string;
  otra_info_2?: string;
  foto_principal?: string;

  // Plan sanitario
  categoria_sanitaria?: CategoriaSanitaria;
}

// ========== FOTOS ==========

export interface FotoCaballo {
  id: string;
  caballo_id: string;
  url: string;
  descripcion?: string;
  es_principal: boolean;
  created_at: string;
}

export interface FotoCaballoCreate {
  caballo_id: string;
  url: string;
  descripcion?: string;
  es_principal?: boolean;
}

export interface FotoCaballoUpdate {
  descripcion?: string;
  es_principal?: boolean;
}

// ========== VACUNAS ==========

export interface VacunaRegistro {
  id: string;
  caballo_id: string;
  tipo: string;  // anemia, influenza, encefalomielitis, rinoneumonitis, rabia, perfil, etc.
  fecha: string;
  veterinario?: string;
  marca?: string;
  frecuencia_dias?: number;
  proxima_fecha?: string;  // Calculado automáticamente
  observaciones?: string;
  aplicada: boolean;
  created_at: string;
  updated_at: string;
}

export interface VacunaRegistroCreate {
  caballo_id: string;
  tipo: string;
  fecha: string;
  veterinario?: string;
  marca?: string;
  frecuencia_dias?: number;
  proxima_fecha?: string;
  observaciones?: string;
  aplicada?: boolean;
}

export interface VacunaRegistroUpdate {
  tipo?: string;
  fecha?: string;
  veterinario?: string;
  marca?: string;
  frecuencia_dias?: number;
  proxima_fecha?: string;
  observaciones?: string;
  aplicada?: boolean;
}

// ========== REVISIÓN DENTAL ==========

export interface RevisionDental {
  id: string;
  caballo_id: string;
  fecha: string;
  veterinario?: string;
  observaciones?: string;
  proxima_revision?: string;
  created_at: string;
}

export interface RevisionDentalCreate {
  caballo_id: string;
  fecha: string;
  veterinario?: string;
  observaciones?: string;
  proxima_revision?: string;
}

export interface RevisionDentalUpdate {
  fecha?: string;
  veterinario?: string;
  observaciones?: string;
  proxima_revision?: string;
}

// ========== ESTUDIO MÉDICO ==========

export interface EstudioMedico {
  id: string;
  caballo_id: string;
  tipo: string;  // radiografia, ecografia, resonancia, tomografia, endoscopia, otros
  fecha: string;
  veterinario?: string;
  zona_estudiada?: string;
  diagnostico?: string;
  archivo_url?: string;
  observaciones?: string;
  created_at: string;
}

export interface EstudioMedicoCreate {
  caballo_id: string;
  tipo: string;
  fecha: string;
  veterinario?: string;
  zona_estudiada?: string;
  diagnostico?: string;
  archivo_url?: string;
  observaciones?: string;
}

export interface EstudioMedicoUpdate {
  tipo?: string;
  fecha?: string;
  veterinario?: string;
  zona_estudiada?: string;
  diagnostico?: string;
  archivo_url?: string;
  observaciones?: string;
}

// ========== HERRAJE ==========

export interface HerrajeRegistro {
  id: string;
  caballo_id: string;
  fecha: string;
  herrador?: string;
  observaciones?: string;
  proximo_herraje?: string;
  costo?: number;
  created_at: string;
}

export interface HerrajeRegistroCreate {
  caballo_id: string;
  fecha: string;
  herrador?: string;
  observaciones?: string;
  proximo_herraje?: string;
  costo?: number;
}

export interface HerrajeRegistroUpdate {
  fecha?: string;
  herrador?: string;
  observaciones?: string;
  proximo_herraje?: string;
  costo?: number;
}

// ========== ANTIPARASITARIO ==========

export interface AntiparasitarioRegistro {
  id: string;
  caballo_id: string;
  fecha: string;
  marca?: string;
  drogas?: string;
  dosis?: string;
  proxima_aplicacion?: string;
  observaciones?: string;
  created_at: string;
}

export interface AntiparasitarioRegistroCreate {
  caballo_id: string;
  fecha: string;
  marca?: string;
  drogas?: string;
  dosis?: string;
  proxima_aplicacion?: string;
  observaciones?: string;
}

export interface AntiparasitarioRegistroUpdate {
  fecha?: string;
  marca?: string;
  drogas?: string;
  dosis?: string;
  proxima_aplicacion?: string;
  observaciones?: string;
}

// ========== CABALLO COMPLETO ==========

export interface CaballoCompleto extends Caballo {
  fotos: FotoCaballo[];
  vacunas: VacunaRegistro[];
  herrajes: HerrajeRegistro[];
  antiparasitarios: AntiparasitarioRegistro[];
}

// ========== HISTORIAL MÉDICO (legacy - mantener por compatibilidad) ==========

export interface HistorialMedico {
  id: string;
  caballo_id: string;
  tipo: 'vacuna' | 'desparasitacion' | 'tratamiento' | 'cirugia' | 'revision' | 'otro';
  fecha: string;
  veterinario?: string;
  descripcion: string;
  medicamento?: string;
  dosis?: string;
  proxima_aplicacion?: string;
  costo?: number;
  documentos?: string[];
  created_at: string;
  updated_at: string;
}

export interface PlanAlimentacion {
  id: string;
  caballo_id: string;
  tipo_alimento: string;
  cantidad_diaria: string;
  horarios: string[];
  suplementos?: string;
  restricciones?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ========== PLAN SANITARIO 2026 ==========

export interface ActividadPlanSanitario {
  tipo: string; // vacuna, desparasitacion, analisis
  nombre: string;
  descripcion: string;
  realizada: boolean;
  fecha_realizada?: string;
  proxima_fecha?: string;
}

export interface MesPlanSanitario {
  mes: number;
  mes_nombre: string;
  actividades: ActividadPlanSanitario[];
}

export interface PlanSanitarioResponse {
  categoria?: string | null; // 'A', 'B', o null
  nombre_categoria?: string | null;
  descripcion?: string | null;
  costo_mensual?: number | null;
  dosis_anuales?: Record<string, number> | null;
  calendario: MesPlanSanitario[];
  anio: number;
}

export interface ActividadPendiente {
  mes: number;
  mes_nombre: string;
  tipo: string;
  nombre: string;
  descripcion: string;
  dias_vencido?: number | null;
}

export interface EstadisticasPlanSanitario {
  categoria?: string | null;
  tiene_plan: boolean;
  costo_mensual?: number | null;
  costo_anual?: number | null;
  anio: number;
  total_actividades: number;
  actividades_realizadas: number;
  actividades_pendientes: number;
  porcentaje_cumplimiento: number;
  proximas_actividades: ActividadPendiente[];
  actividades_vencidas: ActividadPendiente[];
}
