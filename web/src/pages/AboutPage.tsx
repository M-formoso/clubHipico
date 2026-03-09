import { Award, Heart, Target, Users, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-28 lg:pt-36">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1920&q=80)',
          }}
        />
        <div className="page-hero-overlay" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 lg:py-32">
          <span className="luxury-badge mb-6 inline-flex animate-fade-in-down">
            <Sparkles size={16} />
            Nuestra Historia
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Conoce nuestra historia, misión y el equipo que hace posible la experiencia del Club Hípico.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent" />
      </section>

      {/* History Section */}
      <section className="py-24 lg:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Desde 1942</span>
              <h2 className="text-4xl sm:text-5xl font-bold text-primary mt-4 mb-8">
                Nuestra Historia
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-secondary to-secondary-light mb-8" />

              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  El Club Hípico fue fundado en 1942 por un grupo de apasionados por la equitación
                  que soñaban con crear un espacio donde los amantes de los caballos pudieran
                  reunirse, aprender y competir.
                </p>
                <p>
                  Lo que comenzó como un pequeño establecimiento con apenas unas pocas caballerizas,
                  ha crecido hasta convertirse en uno de los centros hípicos más reconocidos
                  de la región, manteniendo siempre los valores de excelencia y respeto por los
                  animales que nos caracterizaron desde el primer día.
                </p>
                <p>
                  Hoy, más de 80 años después, seguimos comprometidos con la misma pasión que nos
                  vio nacer, adaptándonos a los nuevos tiempos pero sin perder nuestra esencia.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="img-zoom shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80"
                  alt="Historia del Club Hípico"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 border-4 border-secondary rounded-none -z-10 hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 lg:py-32 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Nuestros Pilares</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4 mb-6">
              Misión, Visión y Valores
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-secondary to-secondary-light mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-secondary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Misión</h3>
              <p className="text-gray-300 leading-relaxed">
                Promover la equitación como deporte y estilo de vida, brindando servicios
                de excelencia en el cuidado de caballos y la formación de jinetes,
                en un ambiente seguro y familiar.
              </p>
            </div>

            {/* Vision */}
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-secondary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Visión</h3>
              <p className="text-gray-300 leading-relaxed">
                Ser el centro hípico de referencia en la región, reconocido por la
                calidad de nuestras instalaciones, la profesionalidad de nuestro
                equipo y el bienestar de nuestros caballos.
              </p>
            </div>

            {/* Values */}
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-secondary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Valores</h3>
              <p className="text-gray-300 leading-relaxed">
                Respeto por los animales, excelencia en el servicio, compromiso con la comunidad,
                tradición e innovación, y trabajo en equipo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 lg:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-secondary font-semibold tracking-widest uppercase text-sm">Profesionales</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-primary mt-4 mb-6">
              Nuestro Equipo
            </h2>
            <div className="section-divider" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-8">
              Profesionales apasionados dedicados a brindarte la mejor experiencia hípica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Director General', role: 'Gestión y Administración' },
              { title: 'Instructor Jefe', role: 'Clases y Entrenamiento' },
              { title: 'Veterinario', role: 'Salud y Bienestar Animal' },
              { title: 'Coordinador de Eventos', role: 'Competencias y Actividades' },
            ].map((member) => (
              <div key={member.title} className="elegant-card p-8 text-center group">
                <div className="w-28 h-28 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                  <Users className="text-secondary" size={48} />
                </div>
                <h4 className="font-bold text-xl text-primary mb-2">{member.title}</h4>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-28 bg-primary relative overflow-hidden">
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
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6">
            ¿Quieres ser parte de
            <span className="block gradient-text mt-2">nuestra familia?</span>
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Únete a nuestra comunidad y vive la experiencia que solo 1942 Haras Club puede ofrecer.
          </p>
          <Link to="/contacto" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
            Contáctanos
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  )
}
