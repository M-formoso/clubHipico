import { Link } from 'react-router-dom'
import { ArrowRight, Award, Calendar, Shield, Users, ChevronDown, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { EventosSection } from '@/components/EventosSection'
import { useState, useRef } from 'react'

export function HomePage() {
  const [videoError, setVideoError] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const scrollToContent = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        {!videoError ? (
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}
            poster="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1920&q=80"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1920&q=80)',
            }}
          />
        )}

        {/* Sound Toggle Button */}
        {!videoError && (
          <button
            onClick={toggleSound}
            className="absolute bottom-24 right-6 z-20 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? (
              <VolumeX size={24} className="group-hover:scale-110 transition-transform" />
            ) : (
              <Volume2 size={24} className="group-hover:scale-110 transition-transform" />
            )}
          </button>
        )}

        {/* Overlay */}
        <div className="hero-overlay" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="animate-fade-in-down">
              <span className="luxury-badge mb-8 inline-flex">
                <Sparkles size={16} />
                Desde 1942
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-fade-in-up">
              Tradición y
              <span className="block gradient-text mt-2">Excelencia Haras Club</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              Más de 80 años formando jinetes y cuidando caballos con pasión,
              dedicación y el más alto nivel de profesionalismo.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link to="/contacto" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                Contáctanos
                <ArrowRight size={20} />
              </Link>
              <Link to="/instalaciones" className="btn-outline inline-flex items-center justify-center gap-2 text-lg">
                Ver Instalaciones
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors cursor-pointer z-10 animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown size={40} strokeWidth={1.5} />
        </button>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fafafa] to-transparent z-10" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Nuestra Esencia</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mt-4 mb-6">
              ¿Por qué elegirnos?
            </h2>
            <div className="section-divider" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-8">
              Ofrecemos una experiencia única con las mejores instalaciones y profesionales del país.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: 'Excelencia',
                desc: 'Más de 80 años de trayectoria nos respaldan como líderes en el ámbito hípico nacional.',
              },
              {
                icon: Users,
                title: 'Profesionales',
                desc: 'Contamos con instructores certificados internacionalmente y veterinarios especializados.',
              },
              {
                icon: Shield,
                title: 'Seguridad',
                desc: 'Instalaciones seguras con protocolos de bienestar animal de primer nivel mundial.',
              },
              {
                icon: Calendar,
                title: 'Eventos',
                desc: 'Organizamos competencias, clínicas y eventos especiales durante todo el año.',
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl px-8 py-12 text-center group flex flex-col items-center shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-md">
                  <item.icon className="text-secondary" size={26} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary group-hover:text-secondary transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
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
      <section className="py-24 lg:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Nuestra Historia</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mt-4 mb-8">
                Una Tradición de Pasión por los Caballos
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-secondary to-secondary-light mb-8" />
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Desde nuestra fundación en 1942, nos hemos dedicado a fomentar el amor por la equitación
                y el cuidado responsable de los caballos. Nuestras instalaciones de primer nivel y
                nuestro equipo de profesionales garantizan una experiencia excepcional.
              </p>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Ya sea que busques pensionado para tu caballo, clases de equitación o simplemente
                disfrutar de un día en el campo, el Club Hípico es tu lugar.
              </p>
              <Link
                to="/sobre-nosotros"
                className="inline-flex items-center gap-2 text-secondary font-semibold text-lg hover:gap-4 transition-all"
              >
                Conoce más sobre nosotros
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 relative overflow-visible">
              <div className="img-zoom shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
                  alt="Caballos en el club"
                  className="w-full h-[400px] lg:h-[600px] object-cover"
                />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute bottom-4 left-4 bg-primary text-white p-6 rounded-2xl shadow-2xl hidden lg:block">
                <p className="stat-number">80+</p>
                <p className="text-gray-300 font-medium mt-2">Años de experiencia</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-2 border-secondary rounded-2xl -z-10 hidden lg:block" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary/20 rounded-full -z-10 hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-28 bg-primary relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { number: '80+', label: 'Años de Experiencia' },
              { number: '100+', label: 'Caballos Alojados' },
              { number: '500+', label: 'Socios Activos' },
              { number: '50+', label: 'Eventos Anuales' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="stat-number">{stat.number}</p>
                <p className="text-gray-300 text-lg mt-3">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 border border-primary rounded-full" />
          <div className="absolute bottom-20 right-20 w-60 h-60 border border-primary rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-primary rounded-full" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6">
            ¿Listo para comenzar tu
            <span className="block gradient-text mt-2">aventura hípica?</span>
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Contáctanos hoy mismo y descubre todo lo que el Club Hípico tiene para ofrecerte a ti y a tu familia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contacto" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
              Solicitar Información
              <ArrowRight size={20} />
            </Link>
            <a
              href="tel:+59899123456"
              className="inline-flex items-center justify-center gap-2 text-lg font-semibold text-primary border-2 border-primary px-8 py-4 rounded-full hover:bg-primary hover:text-white transition-all"
            >
              Llamar Ahora
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
