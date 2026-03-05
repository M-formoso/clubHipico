import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Clock } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo y descripción */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">CH</span>
              </div>
              <div>
                <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Club Hípico</span>
                <p className="text-xs text-gray-400">Desde 1942</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Tradición y excelencia ecuestre. Un lugar donde la pasión por los caballos se convierte en realidad y las familias crean recuerdos inolvidables.
            </p>
            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary-dark transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary-dark transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary">Enlaces</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/sobre-nosotros', label: 'Sobre Nosotros' },
                { to: '/instalaciones', label: 'Instalaciones' },
                { to: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <MapPin size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <span>Ruta 123, Km 45<br />Uruguay</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <Phone size={18} className="text-secondary flex-shrink-0" />
                <a href="tel:+59899123456" className="hover:text-white transition-colors">
                  +598 99 123 456
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <Mail size={18} className="text-secondary flex-shrink-0" />
                <a href="mailto:info@clubhipico.com" className="hover:text-white transition-colors">
                  info@clubhipico.com
                </a>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary">Horarios</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Clock size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Lun - Vie</p>
                  <p>7:00 - 20:00</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Clock size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Sábados</p>
                  <p>8:00 - 18:00</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Clock size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Domingos</p>
                  <p>9:00 - 14:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Club Hípico. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Términos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
