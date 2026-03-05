import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">CH</span>
              </div>
              <span className="text-xl font-bold">Club Hípico</span>
            </div>
            <p className="text-gray-300 text-sm">
              Tradición y excelencia ecuestre desde hace más de 50 años. Un lugar donde la pasión por los caballos se convierte en realidad.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/sobre-nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/instalaciones" className="text-gray-300 hover:text-white transition-colors">
                  Instalaciones
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-300">
                <MapPin size={18} className="text-secondary" />
                <span>Ruta 123, Km 45, Uruguay</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Phone size={18} className="text-secondary" />
                <a href="tel:+59899123456" className="hover:text-white transition-colors">
                  +598 99 123 456
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Mail size={18} className="text-secondary" />
                <a href="mailto:info@clubhipico.com" className="hover:text-white transition-colors">
                  info@clubhipico.com
                </a>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-light mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Club Hípico. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
