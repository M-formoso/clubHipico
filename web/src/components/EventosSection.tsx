import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { publicService } from '@/services/api'
import type { EventoPublico } from '@/services/api'

const tipoEventoLabels: Record<string, string> = {
  clase_grupal: 'Clase Grupal',
  clase_privada: 'Clase Privada',
  competencia: 'Competencia',
  salida: 'Salida',
  evento_social: 'Evento Social',
  otro: 'Evento',
}

const tipoEventoColors: Record<string, string> = {
  clase_grupal: 'bg-blue-100 text-blue-800',
  clase_privada: 'bg-purple-100 text-purple-800',
  competencia: 'bg-red-100 text-red-800',
  salida: 'bg-green-100 text-green-800',
  evento_social: 'bg-yellow-100 text-yellow-800',
  otro: 'bg-gray-100 text-gray-800',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EventosSection() {
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const data = await publicService.getEventosPublicos()
        setEventos(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">Cargando eventos...</p>
        </div>
      </section>
    )
  }

  if (error || eventos.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Próximos Eventos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Participa en nuestras actividades y eventos. ¡Te esperamos!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.slice(0, 6).map((evento) => (
            <div
              key={evento.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {evento.imagen_url ? (
                <img
                  src={evento.imagen_url}
                  alt={evento.titulo}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <Calendar className="text-white/50" size={64} />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${tipoEventoColors[evento.tipo] || tipoEventoColors.otro}`}
                  >
                    {tipoEventoLabels[evento.tipo] || 'Evento'}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-primary mb-2">
                  {evento.titulo}
                </h3>

                {evento.descripcion && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {evento.descripcion}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-secondary" />
                    <span>{formatDate(evento.fecha_inicio)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-secondary" />
                    <span>
                      {formatTime(evento.fecha_inicio)} - {formatTime(evento.fecha_fin)}
                    </span>
                  </div>

                  {evento.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-secondary" />
                      <span>{evento.ubicacion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
