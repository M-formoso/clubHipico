import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const facilities = [
  {
    title: 'Caballerizas',
    description: 'Boxes amplios y ventilados con capacidad para más de 100 caballos, equipados con sistemas de alimentación y bebederos automáticos.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    features: ['Boxes de 4x4 metros', 'Ventilación natural', 'Cámaras de seguridad', 'Iluminación LED'],
  },
  {
    title: 'Pistas de Entrenamiento',
    description: 'Contamos con pistas de arena de sílice para todas las disciplinas, mantenidas diariamente para garantizar la seguridad.',
    image: 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&w=800&q=80',
    features: ['Pista techada 60x30m', 'Pista exterior 80x40m', 'Arena de sílice', 'Sistema de riego'],
  },
  {
    title: 'Paddocks',
    description: 'Amplios paddocks para el esparcimiento de los caballos, con sombra natural y bebederos.',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    features: ['10 hectáreas de praderas', 'Cercado seguro', 'Sombra natural', 'Bebederos automáticos'],
  },
  {
    title: 'Club House',
    description: 'Espacio social con cafetería, salón de eventos y terrazas con vista a las pistas de competencia.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    features: ['Cafetería', 'Salón de eventos', 'Terrazas panorámicas', 'Wi-Fi gratuito'],
  },
  {
    title: 'Veterinaria',
    description: 'Clínica veterinaria equipada con tecnología de punta para atención de emergencias y tratamientos especializados.',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    features: ['Atención 24/7', 'Quirófano equipado', 'Rayos X', 'Ecografía'],
  },
  {
    title: 'Guadarnés',
    description: 'Espacios individuales para el almacenamiento de monturas y equipos, con sistemas de seguridad.',
    image: 'https://images.unsplash.com/photo-1508761140435-e84362e87e0e?auto=format&fit=crop&w=800&q=80',
    features: ['Casilleros individuales', 'Control de humedad', 'Sistema de seguridad', 'Limpieza diaria'],
  },
]

export function FacilitiesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80)',
          }}
        />
        <div className="page-hero-overlay" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <span className="luxury-badge mb-6 inline-flex animate-fade-in-down">
            <Sparkles size={16} />
            Instalaciones
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Nuestras Instalaciones
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Instalaciones de primer nivel diseñadas para el bienestar de los caballos y la comodidad de nuestros socios.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent" />
      </section>

      {/* Facilities Grid */}
      <section className="py-24 lg:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {facilities.map((facility, index) => (
              <div
                key={facility.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center`}
              >
                {/* Image */}
                <div className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="img-zoom shadow-2xl">
                    <img
                      src={facility.image}
                      alt={facility.title}
                      className="w-full h-[400px] lg:h-[500px] object-cover"
                    />
                  </div>
                  {/* Decorative element */}
                  <div className={`absolute -bottom-6 ${index % 2 === 1 ? '-left-6' : '-right-6'} w-32 h-32 border-4 border-secondary rounded-none -z-10 hidden lg:block`} />
                </div>

                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <span className="text-secondary font-semibold tracking-widest uppercase text-sm">
                    Instalación {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-bold text-primary mt-4 mb-6">
                    {facility.title}
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-secondary to-secondary-light mb-8" />

                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {facility.description}
                  </p>

                  <ul className="space-y-4">
                    {facility.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-4">
                        <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                          <Check className="text-secondary" size={16} />
                        </span>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Galería</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-primary mt-4 mb-6">
              Galería de Imágenes
            </h2>
            <div className="section-divider" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-8">
              Descubre nuestras instalaciones a través de estas imágenes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="col-span-2 row-span-2">
              <div className="img-zoom h-full shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80"
                  alt="Club Hípico"
                  className="w-full h-full object-cover min-h-[400px]"
                />
              </div>
            </div>
            <div className="img-zoom shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80"
                alt="Caballerizas"
                className="w-full h-48 lg:h-56 object-cover"
              />
            </div>
            <div className="img-zoom shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?auto=format&fit=crop&w=300&q=80"
                alt="Pistas"
                className="w-full h-48 lg:h-56 object-cover"
              />
            </div>
            <div className="img-zoom shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1508761140435-e84362e87e0e?auto=format&fit=crop&w=300&q=80"
                alt="Equipamiento"
                className="w-full h-48 lg:h-56 object-cover"
              />
            </div>
            <div className="img-zoom shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1450052590821-8bf91254a353?auto=format&fit=crop&w=300&q=80"
                alt="Paddocks"
                className="w-full h-48 lg:h-56 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-secondary to-secondary-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6">
            ¿Te gustaría visitar nuestras instalaciones?
          </h2>
          <p className="text-primary/80 text-lg mb-12 max-w-2xl mx-auto">
            Agenda una visita guiada y conoce en persona todo lo que tenemos para ofrecerte.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center justify-center gap-2 text-lg font-semibold bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-light transition-all shadow-lg"
          >
            Agendar Visita
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  )
}
