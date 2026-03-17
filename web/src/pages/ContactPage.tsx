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
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-28 lg:pt-36">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/jinete-caballo.jpg)',
          }}
        />
        <div className="page-hero-overlay" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 lg:py-32">
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

              <div className="space-y-6">
                {[
                  { icon: MapPin, title: 'Dirección', content: 'Calle Pública S/N, Pedanía La Lagunilla, Falda del Carmen, Córdoba', href: null },
                  { icon: Phone, title: 'Teléfono', content: '+54 9 3515 20-5936 (Andrés Minuzzi)', href: 'tel:+5493515205936' },
                  { icon: Mail, title: 'Email', content: '1942harasclub@gmail.com', href: 'mailto:1942harasclub@gmail.com' },
                  { icon: Clock, title: 'Horarios', content: 'Lun-Vie: 8:30-20:30 · Sáb-Dom: 10:00-19:00', href: null },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-6 p-4 rounded-none hover:bg-white hover:shadow-md transition-all duration-300 cursor-default group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-14 h-14 bg-primary rounded-none flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <item.icon className="text-secondary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-primary mb-1 group-hover:text-secondary transition-colors duration-300">{item.title}</h3>
                      {item.href ? (
                        <a href={item.href} className="text-gray-600 text-lg hover:text-secondary transition-colors">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-600 text-lg">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Google Maps */}
              <div className="mt-10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3399.8352759659742!2d-64.459628!3d-31.556135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDMzJzIyLjEiUyA2NMKwMjcnMzQuNyJX!5e0!3m2!1ses-419!2sar!4v1773759082098!5m2!1ses-419!2sar"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-none shadow-lg"
                  title="Ubicación de 1942 Haras Club"
                />
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
                        placeholder="+54 9 3515 20-5936"
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
