import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Inicio', path: '/' },
  { name: 'Sobre Nosotros', path: '/sobre-nosotros' },
  { name: 'Instalaciones', path: '/instalaciones' },
  { name: 'Contacto', path: '/contacto' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const isHome = location.pathname === '/'
  const isTransparent = !isScrolled && isHome

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isTransparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md shadow-lg'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28 lg:h-36">
            {/* Logo */}
            <Link to="/" className="group flex-shrink-0">
              <img
                src={isTransparent ? "/logo-light.png" : "/logo.png"}
                alt="1942 Haras Club"
                className="h-24 lg:h-32 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-6 py-3 rounded-full text-base font-semibold transition-all duration-300',
                    isTransparent
                      ? location.pathname === item.path
                        ? 'bg-white/20 text-white backdrop-blur-sm'
                        : 'text-white hover:text-white hover:bg-white/10'
                      : location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden lg:block">
              <a
                href="https://sistema.1942harasclub.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-base transition-all duration-300',
                  isTransparent
                    ? 'bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white hover:text-primary'
                    : 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                )}
              >
                Acceder al Sistema
                <ArrowRight size={18} />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={cn(
                'lg:hidden p-2.5 rounded-full transition-all duration-300',
                isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menú"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-300',
          isMenuOpen ? 'visible' : 'invisible'
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transition-transform duration-300 ease-out',
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <img
                src="/logo.png"
                alt="1942 Haras Club"
                className="h-16 w-auto object-contain"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'block px-5 py-4 rounded-xl text-lg font-medium transition-all duration-300',
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                    )}
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animation: isMenuOpen ? 'fadeInRight 0.3s ease forwards' : 'none',
                      opacity: 0,
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50">
              <a
                href="https://sistema.1942harasclub.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold py-4 rounded-xl shadow-lg"
              >
                Acceder al Sistema
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
