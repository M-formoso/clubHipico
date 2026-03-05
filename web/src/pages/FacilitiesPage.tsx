import { Check } from 'lucide-react'

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
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    features: ['Pista techada 60x30m', 'Pista exterior 80x40m', 'Arena de sílice', 'Sistema de riego'],
  },
  {
    title: 'Paddocks',
    description: 'Amplios paddocks para el esparcimiento de los caballos, con sombra natural y bebederos.',
    image: 'https://images.unsplash.com/photo-1597244263958-0f5af1e8b5a8?auto=format&fit=crop&w=800&q=80',
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
      <section className="relative py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nuestras Instalaciones
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Instalaciones de primer nivel diseñadas para el bienestar de los caballos y la comodidad de nuestros socios.
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {facilities.map((facility, index) => (
              <div
                key={facility.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <h2 className="text-3xl font-bold text-primary mb-4">{facility.title}</h2>
                  <p className="text-gray-600 mb-6 text-lg">{facility.description}</p>
                  <ul className="space-y-3">
                    {facility.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="text-white" size={14} />
                        </span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="rounded-lg shadow-xl w-full h-80 object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Galería de Imágenes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras instalaciones a través de estas imágenes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-2">
              <img
                src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80"
                alt="Club Hípico"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80"
                alt="Caballerizas"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?auto=format&fit=crop&w=300&q=80"
                alt="Pistas"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1508761140435-e84362e87e0e?auto=format&fit=crop&w=300&q=80"
                alt="Equipamiento"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1450052590821-8bf91254a353?auto=format&fit=crop&w=300&q=80"
                alt="Paddocks"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-dark mb-4">
            ¿Te gustaría visitar nuestras instalaciones?
          </h2>
          <p className="text-primary mb-6">
            Agenda una visita guiada y conoce en persona todo lo que tenemos para ofrecerte.
          </p>
          <a
            href="/contacto"
            className="inline-block bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary-light transition-colors"
          >
            Agendar Visita
          </a>
        </div>
      </section>
    </>
  )
}
