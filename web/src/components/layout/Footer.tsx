import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Clock, ArrowRight } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xl">CH</span>
              </div>
              <div>
                <span className="text-2xl font-bold block" style={{ fontFamily: 'var(--font-serif)' }}>
                  Club Hípico
                </span>
                <span className="text-xs text-gray-400">Desde 1942</span>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-8">
              Tradición y excelencia ecuestre. Un lugar donde la pasión por los caballos
              se convierte en realidad y las familias crean recuerdos inolvidables.
            </p>
            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 group"
                aria-label="Facebook"
              >
                <Facebook size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram size={20} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary" />
              Enlaces
            </h4>
            <ul className="space-y-4">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/sobre-nosotros', label: 'Sobre Nosotros' },
                { to: '/instalaciones', label: 'Instalaciones' },
                { to: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-secondary transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary" />
              Contacto
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-secondary" />
                </div>
                <div className="text-gray-400">
                  <span className="block">Ruta 123, Km 45</span>
                  <span>Uruguay</span>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-secondary" />
                </div>
                <a href="tel:+59899123456" className="text-gray-400 hover:text-secondary transition-colors">
                  +598 99 123 456
                </a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-secondary" />
                </div>
                <a href="mailto:info@clubhipico.com" className="text-gray-400 hover:text-secondary transition-colors">
                  info@clubhipico.com
                </a>
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary" />
              Horarios
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-white font-medium">Lun - Vie</p>
                  <p className="text-gray-400">7:00 - 20:00</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-white font-medium">Sábados</p>
                  <p className="text-gray-400">8:00 - 18:00</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-white font-medium">Domingos</p>
                  <p className="text-gray-400">9:00 - 14:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} Club Hípico. Todos los derechos reservados.
            </p>
            <div className="flex gap-8 text-sm">
              <a href="#" className="text-gray-500 hover:text-secondary transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-500 hover:text-secondary transition-colors">
                Términos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
