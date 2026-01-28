// Tipos de alertas del sistema
export type TipoAlerta =
  | 'vacuna'
  | 'herraje'
  | 'pago'
  | 'evento'
  | 'cumpleaños'
  | 'contrato'
  | 'stock'
  | 'tarea'
  | 'mantenimiento'
  | 'veterinaria'
  | 'otro';

export type Prioridad = 'baja' | 'media' | 'alta' | 'critica';

export type FrecuenciaAlerta =
  | 'unica'
  | 'diaria'
  | 'semanal'
  | 'mensual'
  | 'cada_x_dias';

// Alerta individual
export interface Alerta {
  id: string;
  tipo_alerta_id?: string; // Referencia al tipo de alerta configurado
  usuario_id?: string;
  tipo: TipoAlerta;
  prioridad: Prioridad;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_evento?: string; // Fecha del evento que genera la alerta
  fecha_vencimiento?: string; // Cuándo expira la alerta
  entidad_relacionada_tipo?: string; // 'caballo', 'cliente', 'pago', etc.
  entidad_relacionada_id?: string;
  acciones_disponibles?: AccionAlerta[]; // Acciones que se pueden realizar desde la alerta
  datos_adicionales?: Record<string, any>; // Metadata adicional
  created_at: string;
  updated_at: string;
}

// Acción que se puede realizar desde una alerta
export interface AccionAlerta {
  tipo: 'ver_detalle' | 'marcar_completada' | 'posponer' | 'ir_a_modulo' | 'custom';
  etiqueta: string;
  url?: string;
  icono?: string;
}

// Configuración de tipo de alerta (plantilla)
export interface TipoAlertaConfig {
  id: string;
  nombre: string;
  tipo: TipoAlerta;
  descripcion?: string;
  activo: boolean;
  prioridad_default: Prioridad;

  // Frecuencia y repetición
  frecuencia: FrecuenciaAlerta;
  dias_anticipacion?: number; // Días antes del evento para enviar la alerta
  intervalo_dias?: number; // Para frecuencia 'cada_x_dias'
  hora_envio?: string; // HH:MM formato 24h

  // Destinatarios
  enviar_a_roles?: string[]; // Roles que reciben esta alerta
  enviar_a_usuarios?: string[]; // IDs de usuarios específicos
  enviar_a_responsables?: boolean; // Si se envía al responsable de la entidad

  // Canales de envío
  canal_sistema: boolean; // Aparece en el sistema (campana)
  canal_email: boolean;
  canal_push?: boolean;

  // Plantilla de mensaje
  plantilla_titulo?: string; // Puede tener variables como {nombre}, {fecha}, etc.
  plantilla_mensaje?: string;

  // Condiciones de activación
  condiciones?: CondicionAlerta[];

  created_at: string;
  updated_at: string;
}

// Condición para activar una alerta
export interface CondicionAlerta {
  campo: string; // Ej: 'dias_hasta_vencimiento', 'monto_pendiente', etc.
  operador: 'igual' | 'mayor' | 'menor' | 'mayor_igual' | 'menor_igual' | 'entre' | 'contiene';
  valor: any;
  valor_maximo?: any; // Para operador 'entre'
}

// Registro de envío de alerta
export interface RegistroAlerta {
  id: string;
  alerta_id: string;
  usuario_id: string;
  canal: 'sistema' | 'email' | 'push';
  estado: 'pendiente' | 'enviado' | 'fallido' | 'leido';
  fecha_envio?: string;
  fecha_lectura?: string;
  error_mensaje?: string;
  created_at: string;
}

// Configuración de alertas del usuario
export interface ConfiguracionAlertas {
  usuario_id: string;
  alertas_sistema: boolean; // Recibir alertas en el sistema
  alertas_email: boolean;
  alertas_push: boolean;

  // Preferencias por tipo
  tipos_alertas: {
    vacuna: boolean;
    herraje: boolean;
    pago: boolean;
    evento: boolean;
    cumpleaños: boolean;
    contrato: boolean;
    stock: boolean;
    tarea: boolean;
    mantenimiento: boolean;
    veterinaria: boolean;
    otro: boolean;
  };

  // Horarios permitidos
  horario_inicio?: string; // HH:MM
  horario_fin?: string; // HH:MM
  dias_semana?: number[]; // 0-6, domingo es 0

  // Agrupación
  agrupar_alertas: boolean; // Enviar resumen en vez de una por una
  intervalo_agrupacion?: number; // Minutos
}

// DTOs para crear/actualizar
export interface TipoAlertaConfigCreate {
  nombre: string;
  tipo: TipoAlerta;
  descripcion?: string;
  prioridad_default: Prioridad;
  frecuencia: FrecuenciaAlerta;
  dias_anticipacion?: number;
  intervalo_dias?: number;
  hora_envio?: string;
  enviar_a_roles?: string[];
  enviar_a_usuarios?: string[];
  enviar_a_responsables?: boolean;
  canal_sistema: boolean;
  canal_email: boolean;
  canal_push?: boolean;
  plantilla_titulo?: string;
  plantilla_mensaje?: string;
  condiciones?: CondicionAlerta[];
}

export interface TipoAlertaConfigUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  prioridad_default?: Prioridad;
  frecuencia?: FrecuenciaAlerta;
  dias_anticipacion?: number;
  intervalo_dias?: number;
  hora_envio?: string;
  enviar_a_roles?: string[];
  enviar_a_usuarios?: string[];
  enviar_a_responsables?: boolean;
  canal_sistema?: boolean;
  canal_email?: boolean;
  canal_push?: boolean;
  plantilla_titulo?: string;
  plantilla_mensaje?: string;
  condiciones?: CondicionAlerta[];
}

export interface AlertaCreate {
  tipo_alerta_id?: string;
  usuario_id?: string;
  tipo: TipoAlerta;
  prioridad: Prioridad;
  titulo: string;
  mensaje: string;
  fecha_evento?: string;
  fecha_vencimiento?: string;
  entidad_relacionada_tipo?: string;
  entidad_relacionada_id?: string;
  acciones_disponibles?: AccionAlerta[];
  datos_adicionales?: Record<string, any>;
}

// Estadísticas de alertas
export interface EstadisticasAlertas {
  total_alertas: number;
  alertas_no_leidas: number;
  alertas_por_prioridad: Record<Prioridad, number>;
  alertas_por_tipo: Record<TipoAlerta, number>;
  alertas_vencidas: number;
  alertas_hoy: number;
  alertas_esta_semana: number;
}

// Filtros para buscar alertas
export interface FiltrosAlertas {
  tipo?: TipoAlerta;
  prioridad?: Prioridad;
  leida?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_id?: string;
  tipo_alerta_id?: string;
}
