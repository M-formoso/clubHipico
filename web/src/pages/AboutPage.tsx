import { Award, Heart, Target, Users } from 'lucide-react'

export function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Conoce nuestra historia, misión y el equipo que hace posible la experiencia del Club Hípico.
          </p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">Nuestra Historia</h2>
              <p className="text-gray-600 mb-4">
                El Club Hípico fue fundado en 1970 por un grupo de apasionados por la equitación que soñaban con crear un espacio donde los amantes de los caballos pudieran reunirse, aprender y competir.
              </p>
              <p className="text-gray-600 mb-4">
                Lo que comenzó como un pequeño establecimiento con apenas unas pocas caballerizas, ha crecido hasta convertirse en uno de los centros ecuestres más reconocidos de la región, manteniendo siempre los valores de excelencia y respeto por los animales que nos caracterizaron desde el primer día.
              </p>
              <p className="text-gray-600">
                Hoy, más de 50 años después, seguimos comprometidos con la misma pasión que nos vio nacer, adaptándonos a los nuevos tiempos pero sin perder nuestra esencia.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80"
                alt="Historia del Club Hípico"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-6">
                <Target className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Misión</h3>
              <p className="text-gray-600">
                Promover la equitación como deporte y estilo de vida, brindando servicios de excelencia en el cuidado de caballos y la formación de jinetes, en un ambiente seguro y familiar.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-6">
                <Award className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Visión</h3>
              <p className="text-gray-600">
                Ser el centro ecuestre de referencia en la región, reconocido por la calidad de nuestras instalaciones, la profesionalidad de nuestro equipo y el bienestar de nuestros caballos.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-6">
                <Heart className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Valores</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Respeto por los animales</li>
                <li>• Excelencia en el servicio</li>
                <li>• Compromiso con la comunidad</li>
                <li>• Tradición e innovación</li>
                <li>• Trabajo en equipo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profesionales apasionados dedicados a brindarte la mejor experiencia ecuestre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-gray-500" size={48} />
              </div>
              <h4 className="font-semibold text-lg text-primary">Director General</h4>
              <p className="text-gray-500">Gestión y Administración</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-gray-500" size={48} />
              </div>
              <h4 className="font-semibold text-lg text-primary">Instructor Jefe</h4>
              <p className="text-gray-500">Clases y Entrenamiento</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-gray-500" size={48} />
              </div>
              <h4 className="font-semibold text-lg text-primary">Veterinario</h4>
              <p className="text-gray-500">Salud y Bienestar Animal</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-gray-500" size={48} />
              </div>
              <h4 className="font-semibold text-lg text-primary">Coordinador de Eventos</h4>
              <p className="text-gray-500">Competencias y Actividades</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-secondary mb-2">50+</p>
              <p className="text-white">Años de Experiencia</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-secondary mb-2">100+</p>
              <p className="text-white">Caballos Alojados</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-secondary mb-2">500+</p>
              <p className="text-white">Socios Activos</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-secondary mb-2">50+</p>
              <p className="text-white">Eventos Anuales</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
