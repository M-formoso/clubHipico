export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Club Ecuestre';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EMPLEADO: 'empleado',
  CLIENTE: 'cliente',
} as const;

export const ESTADO_CABALLO = {
  ACTIVO: 'activo',
  RETIRADO: 'retirado',
  EN_TRATAMIENTO: 'en_tratamiento',
  FALLECIDO: 'fallecido',
} as const;

export const SEXO_CABALLO = {
  MACHO: 'macho',
  HEMBRA: 'hembra',
  CASTRADO: 'castrado',
} as const;

export const TIPO_CLIENTE = {
  SOCIO_PLENO: 'socio_pleno',
  PENSIONISTA: 'pensionista',
  ALUMNO: 'alumno',
} as const;

export const ESTADO_CUENTA = {
  AL_DIA: 'al_dia',
  DEBE: 'debe',
  MOROSO: 'moroso',
} as const;

export const TIPO_EVENTO = {
  CLASE_GRUPAL: 'clase_grupal',
  CLASE_PRIVADA: 'clase_privada',
  COMPETENCIA: 'competencia',
  SALIDA: 'salida',
  EVENTO_SOCIAL: 'evento_social',
  OTRO: 'otro',
} as const;

export const ESTADO_EVENTO = {
  PROGRAMADO: 'programado',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
} as const;

export const ESTADO_PAGO = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  VENCIDO: 'vencido',
  CANCELADO: 'cancelado',
} as const;

export const METODO_PAGO = {
  EFECTIVO: 'efectivo',
  TRANSFERENCIA: 'transferencia',
  TARJETA: 'tarjeta',
  CHEQUE: 'cheque',
} as const;
