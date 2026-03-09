import { useState } from 'react'
import { Clock, Mail, MapPin, Phone, Send, CheckCircle, Sparkles } from 'lucide-react'

export function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' })
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1920&q=80)',
          }}
        />
        <div className="page-hero-overlay" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <span className="luxury-badge mb-6 inline-flex animate-fade-in-down">
            <Sparkles size={16} />
            Contáctanos
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Contacto
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Estamos aquí para responder tus preguntas. No dudes en contactarnos.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent" />
      </section>

      {/* Contact Section */}
      <section className="py-24 lg:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Contact Info */}
            <div>
              <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Información</span>
              <h2 className="text-4xl sm:text-5xl font-bold text-primary mt-4 mb-8">
                Información de Contacto
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-secondary to-secondary-light mb-10" />

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MapPin className="text-secondary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary mb-1">Dirección</h3>
                    <p className="text-gray-600 text-lg">Ruta 123, Km 45 - Uruguay</p>
                  </div>
                </div>

                {/* Map */}
                <div className="ml-20">
                  <div className="rounded-2xl shadow-lg h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <MapPin className="text-gray-400 mx-auto mb-2" size={32} />
                      <p className="text-gray-500 font-medium text-sm">Mapa de ubicación</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Phone className="text-secondary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary mb-1">Teléfono</h3>
                    <a href="tel:+59899123456" className="text-gray-600 text-lg hover:text-secondary transition-colors">
                      +598 99 123 456
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mail className="text-secondary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary mb-1">Email</h3>
                    <a href="mailto:info@clubhipico.com" className="text-gray-600 text-lg hover:text-secondary transition-colors">
                      info@clubhipico.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Clock className="text-secondary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary mb-1">Horarios</h3>
                    <p className="text-gray-600 text-lg">Lun-Vie: 7:00-20:00 · Sáb: 8:00-18:00 · Dom: 9:00-14:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Formulario</span>
              <h2 className="text-4xl sm:text-5xl font-bold text-primary mt-4 mb-8">
                Envíanos un Mensaje
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-secondary to-secondary-light mb-10" />

              {submitted ? (
                <div className="elegant-card p-12 text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CheckCircle className="text-secondary" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">¡Mensaje Enviado!</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    Gracias por contactarnos. Te responderemos a la brevedad.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-secondary font-semibold hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-3">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        className="elegant-input"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="elegant-input"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-3">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="elegant-input"
                        placeholder="+598 99 123 456"
                      />
                    </div>
                    <div>
                      <label htmlFor="asunto" className="block text-sm font-semibold text-gray-700 mb-3">
                        Asunto *
                      </label>
                      <select
                        id="asunto"
                        name="asunto"
                        required
                        value={formData.asunto}
                        onChange={handleChange}
                        className="elegant-input"
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="informacion">Información general</option>
                        <option value="pensionado">Pensionado de caballos</option>
                        <option value="clases">Clases de equitación</option>
                        <option value="eventos">Eventos y competencias</option>
                        <option value="visita">Agendar visita</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-3">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      required
                      rows={6}
                      value={formData.mensaje}
                      onChange={handleChange}
                      className="elegant-input resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Mensaje
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
