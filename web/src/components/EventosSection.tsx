import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
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
  clase_grupal: 'bg-primary',
  clase_privada: 'bg-primary',
  competencia: 'bg-primary',
  salida: 'bg-primary',
  evento_social: 'bg-primary',
  otro: 'bg-primary',
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
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </section>
    )
  }

  if (error || eventos.length === 0) {
    return null
  }

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Agenda</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mt-4 mb-6">
            Próximos Eventos
          </h2>
          <div className="section-divider" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-8">
            Participa en nuestras actividades y eventos exclusivos. ¡Te esperamos!
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.slice(0, 6).map((evento) => (
            <div
              key={evento.id}
              className="elegant-card group"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                {evento.imagen_url ? (
                  <img
                    src={evento.imagen_url}
                    alt={evento.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                    <Calendar className="text-white/20" size={72} />
                  </div>
                )}

                {/* Date badge */}
                <div className="absolute top-5 left-5 bg-white rounded-none px-4 py-3 shadow-lg text-center min-w-[70px]">
                  <p className="text-3xl font-bold text-primary leading-none">
                    {new Date(evento.fecha_inicio).getDate()}
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-semibold mt-1">
                    {new Date(evento.fecha_inicio).toLocaleDateString('es-UY', { month: 'short' })}
                  </p>
                </div>

                {/* Type badge */}
                <div className={`absolute top-5 right-5 ${tipoEventoColors[evento.tipo] || tipoEventoColors.otro} text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg`}>
                  {tipoEventoLabels[evento.tipo] || 'Evento'}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-3 line-clamp-1 group-hover:text-secondary transition-colors">
                  {evento.titulo}
                </h3>

                {evento.descripcion && (
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
                    {evento.descripcion}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-secondary" />
                    </div>
                    <span className="font-medium">
                      {formatTime(evento.fecha_inicio)} - {formatTime(evento.fecha_fin)}
                    </span>
                  </div>

                  {evento.ubicacion && (
                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                      <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-secondary" />
                      </div>
                      <span className="line-clamp-1 font-medium">{evento.ubicacion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {eventos.length > 6 && (
          <div className="text-center mt-16">
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 text-lg font-semibold text-secondary hover:text-secondary-dark transition-colors"
            >
              Ver todos los eventos
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
