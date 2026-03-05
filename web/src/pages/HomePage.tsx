import { Link } from 'react-router-dom'
import { ArrowRight, Award, Calendar, Shield, Users, ChevronDown, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventosSection } from '@/components/EventosSection'
import { useState } from 'react'

export function HomePage() {
  const [videoError, setVideoError] = useState(false)

  const scrollToContent = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Hero Section with Video Support */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        {!videoError ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}
            poster="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1920&q=80"
          >
            {/* Add your video sources here */}
            <source src="/videos/hero.mp4" type="video/mp4" />
            <source src="/videos/hero.webm" type="video/webm" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1920&q=80)',
            }}
          />
        )}

        {/* Overlay */}
        <div className="video-overlay" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium tracking-wider text-secondary uppercase bg-white/10 backdrop-blur-sm rounded-full animate-fade-in">
              Desde 1942
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in delay-100" style={{ fontFamily: 'var(--font-serif)' }}>
              Tradición y Excelencia
              <span className="block gradient-text">Ecuestre</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto animate-fade-in delay-200">
              Más de 80 años formando jinetes y cuidando caballos con pasión, dedicación y el más alto nivel de profesionalismo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-300">
              <Button asChild size="lg" className="btn-shine bg-secondary hover:bg-secondary-light text-primary-dark font-semibold text-base px-8 py-6">
                <Link to="/contacto">
                  Contáctanos
                  <ArrowRight size={20} className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-base px-8 py-6 backdrop-blur-sm">
                <Link to="/instalaciones">
                  <Play size={18} className="mr-2" />
                  Ver Instalaciones
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce cursor-pointer z-10"
          aria-label="Scroll down"
        >
          <ChevronDown size={32} />
        </button>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <span className="text-secondary font-semibold tracking-wider uppercase text-sm">Nuestra Esencia</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mt-3 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              ¿Por qué elegirnos?
            </h2>
            <div className="section-divider mt-4 mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Ofrecemos una experiencia ecuestre completa con las mejores instalaciones y profesionales del país.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Award, title: 'Excelencia', desc: 'Más de 80 años de trayectoria nos respaldan como líderes en el ámbito ecuestre nacional.' },
              { icon: Users, title: 'Profesionales', desc: 'Contamos con instructores certificados internacionalmente y veterinarios especializados.' },
              { icon: Shield, title: 'Seguridad', desc: 'Instalaciones seguras con protocolos de bienestar animal de primer nivel mundial.' },
              { icon: Calendar, title: 'Eventos', desc: 'Organizamos competencias, clínicas y eventos especiales durante todo el año.' },
            ].map((item, index) => (
              <div
                key={item.title}
                className="card-hover bg-gray-50 p-6 sm:p-8 rounded-2xl text-center group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <item.icon className="text-primary group-hover:text-white transition-colors" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">{item.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eventos Section */}
      <EventosSection />

      {/* About Preview Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-secondary font-semibold tracking-wider uppercase text-sm">Nuestra Historia</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mt-3 mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Una Tradición de Pasión por los Caballos
              </h2>
              <div className="w-20 h-1 bg-secondary mb-6" />
              <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                Desde nuestra fundación en 1942, nos hemos dedicado a fomentar el amor por la equitación y el cuidado responsable de los caballos. Nuestras instalaciones de primer nivel y nuestro equipo de profesionales garantizan una experiencia excepcional.
              </p>
              <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed">
                Ya sea que busques pensionado para tu caballo, clases de equitación o simplemente disfrutar de un día en el campo, el Club Hípico es tu lugar.
              </p>
              <Button asChild className="bg-primary hover:bg-primary-light text-white">
                <Link to="/sobre-nosotros">
                  Conoce más sobre nosotros
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl img-zoom">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
                  alt="Caballos en el club"
                  className="w-full h-64 sm:h-80 lg:h-[500px] object-cover"
                />
              </div>
              {/* Stats card */}
              <div className="absolute -bottom-6 -left-6 sm:bottom-8 sm:-left-8 bg-secondary text-primary-dark p-4 sm:p-6 rounded-2xl shadow-xl hidden sm:block">
                <p className="text-4xl sm:text-5xl font-bold">80+</p>
                <p className="text-sm font-semibold">Años de experiencia</p>
              </div>
              {/* Decorative element */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full -z-10 hidden lg:block" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/20 rounded-full -z-10 hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { number: '80+', label: 'Años de Experiencia' },
              { number: '100+', label: 'Caballos Alojados' },
              { number: '500+', label: 'Socios Activos' },
              { number: '50+', label: 'Eventos Anuales' },
            ].map((stat) => (
              <div key={stat.label} className="p-4">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-2">{stat.number}</p>
                <p className="text-white/80 text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            ¿Listo para comenzar tu
            <span className="text-secondary"> experiencia ecuestre</span>?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Contáctanos hoy mismo y descubre todo lo que el Club Hípico tiene para ofrecerte a ti y a tu familia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-shine bg-secondary hover:bg-secondary-light text-primary-dark font-semibold px-8 py-6">
              <Link to="/contacto">
                Solicitar Información
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6">
              <a href="tel:+59899123456">
                Llamar Ahora
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
