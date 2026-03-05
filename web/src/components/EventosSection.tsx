import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { publicService } from '@/services/api'
import type { EventoPublico } from '@/services/api'
import { Button } from '@/components/ui/button'

const tipoEventoLabels: Record<string, string> = {
  clase_grupal: 'Clase Grupal',
  clase_privada: 'Clase Privada',
  competencia: 'Competencia',
  salida: 'Salida',
  evento_social: 'Evento Social',
  otro: 'Evento',
}

const tipoEventoColors: Record<string, string> = {
  clase_grupal: 'bg-blue-500',
  clase_privada: 'bg-purple-500',
  competencia: 'bg-red-500',
  salida: 'bg-green-500',
  evento_social: 'bg-amber-500',
  otro: 'bg-gray-500',
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
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </section>
    )
  }

  if (error || eventos.length === 0) {
    return null
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="text-secondary font-semibold tracking-wider uppercase text-sm">Agenda</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mt-3 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Próximos Eventos
          </h2>
          <div className="section-divider mt-4 mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Participa en nuestras actividades y eventos exclusivos. ¡Te esperamos!
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {eventos.slice(0, 6).map((evento, index) => (
            <div
              key={evento.id}
              className="card-hover bg-white rounded-2xl overflow-hidden shadow-lg group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image/Placeholder */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                {evento.imagen_url ? (
                  <img
                    src={evento.imagen_url}
                    alt={evento.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary via-primary-light to-primary flex items-center justify-center">
                    <Calendar className="text-white/30" size={64} />
                  </div>
                )}

                {/* Date badge */}
                <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 shadow-lg text-center min-w-[60px]">
                  <p className="text-2xl font-bold text-primary leading-none">
                    {new Date(evento.fecha_inicio).getDate()}
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    {new Date(evento.fecha_inicio).toLocaleDateString('es-UY', { month: 'short' })}
                  </p>
                </div>

                {/* Type badge */}
                <div className={`absolute top-4 right-4 ${tipoEventoColors[evento.tipo] || tipoEventoColors.otro} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
                  {tipoEventoLabels[evento.tipo] || 'Evento'}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
                  {evento.titulo}
                </h3>

                {evento.descripcion && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {evento.descripcion}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={16} className="text-secondary flex-shrink-0" />
                    <span>
                      {formatTime(evento.fecha_inicio)} - {formatTime(evento.fecha_fin)}
                    </span>
                  </div>

                  {evento.ubicacion && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin size={16} className="text-secondary flex-shrink-0" />
                      <span className="line-clamp-1">{evento.ubicacion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {eventos.length > 6 && (
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
              <Link to="/contacto">
                Ver todos los eventos
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
