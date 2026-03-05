import { Link } from 'react-router-dom'
import { ArrowRight, Award, Calendar, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventosSection } from '@/components/EventosSection'

export function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Tradición y Excelencia Ecuestre
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Más de 50 años formando jinetes y cuidando caballos con pasión y dedicación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/contacto">
                  Contáctanos
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link to="/instalaciones">
                  Ver Instalaciones
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una experiencia ecuestre completa con las mejores instalaciones y profesionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">Excelencia</h3>
              <p className="text-gray-600">
                Más de 50 años de trayectoria nos respaldan como líderes en el ámbito ecuestre.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">Profesionales</h3>
              <p className="text-gray-600">
                Contamos con instructores certificados y veterinarios especializados.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">Seguridad</h3>
              <p className="text-gray-600">
                Instalaciones seguras y protocolos de bienestar animal de primer nivel.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">Eventos</h3>
              <p className="text-gray-600">
                Organizamos competencias, clínicas y eventos especiales durante todo el año.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos Section */}
      <EventosSection />

      {/* About Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Una Tradición de Pasión por los Caballos
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Desde nuestra fundación, nos hemos dedicado a fomentar el amor por la equitación y el cuidado responsable de los caballos. Nuestras instalaciones de primer nivel y nuestro equipo de profesionales garantizan una experiencia excepcional.
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                Ya sea que busques pensionado para tu caballo, clases de equitación o simplemente disfrutar de un día en el campo, el Club Hípico es tu lugar.
              </p>
              <Button asChild>
                <Link to="/sobre-nosotros">
                  Conoce más sobre nosotros
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
                alt="Caballos en el club"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-secondary text-primary-dark p-6 rounded-lg shadow-lg hidden md:block">
                <p className="text-4xl font-bold">50+</p>
                <p className="text-sm font-medium">Años de experiencia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para comenzar tu experiencia ecuestre?
          </h2>
          <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
            Contáctanos hoy mismo y descubre todo lo que el Club Hípico tiene para ofrecerte.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/contacto">
              Solicitar Información
              <ArrowRight size={20} />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
