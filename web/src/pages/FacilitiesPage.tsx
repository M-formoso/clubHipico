import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FacilitiesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-28 lg:pt-36">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/caballo.jpg)',
          }}
        />
        <div className="page-hero-overlay" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 lg:py-32">
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

      {/* Gallery Section */}
      <section className="py-24 lg:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Galería</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-primary mt-4 mb-6">
              Conoce Nuestro Espacio
            </h2>
            <div className="section-divider" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="img-zoom shadow-xl">
              <img
                src="/instalaciones.jpg"
                alt="Instalaciones 1942 Haras Club"
                className="w-full h-72 object-cover"
              />
            </div>
            <div className="img-zoom shadow-xl">
              <img
                src="/caballo.jpg"
                alt="Caballo en las instalaciones"
                className="w-full h-72 object-cover"
              />
            </div>
            <div className="img-zoom shadow-xl">
              <img
                src="/alumnas.jpg"
                alt="Alumnas de equitación"
                className="w-full h-72 object-cover"
              />
            </div>
            <div className="img-zoom shadow-xl">
              <img
                src="/jinete-caballo.jpg"
                alt="Jinete con caballo"
                className="w-full h-72 object-cover"
              />
            </div>
            <div className="img-zoom shadow-xl lg:col-span-2">
              <img
                src="/ninos-caballo.jpg"
                alt="Niños cuidando caballos"
                className="w-full h-72 object-cover"
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
