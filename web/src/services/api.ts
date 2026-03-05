import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tipos para datos públicos
export interface EventoPublico {
  id: string
  titulo: string
  tipo: 'clase_grupal' | 'clase_privada' | 'competencia' | 'salida' | 'evento_social' | 'otro'
  descripcion?: string
  fecha_inicio: string
  fecha_fin: string
  ubicacion?: string
  imagen_url?: string
}

export interface ContactoForm {
  nombre: string
  email: string
  telefono?: string
  asunto: string
  mensaje: string
}

// Servicios públicos
export const publicService = {
  // Obtener eventos públicos
  getEventosPublicos: async (): Promise<EventoPublico[]> => {
    const response = await api.get('/public/eventos')
    return response.data
  },

  // Enviar formulario de contacto
  enviarContacto: async (data: ContactoForm): Promise<void> => {
    await api.post('/public/contacto', data)
  },
}
