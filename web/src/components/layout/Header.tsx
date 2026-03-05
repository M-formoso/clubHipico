import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open
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
  const headerBg = isScrolled || !isHome
    ? 'bg-white shadow-lg'
    : 'bg-transparent'
  const textColor = isScrolled || !isHome
    ? 'text-primary'
    : 'text-white'
  const logoColor = isScrolled || !isHome
    ? 'bg-primary text-white'
    : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        headerBg
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300',
                logoColor
              )}>
                <span className="font-bold text-base sm:text-lg">CH</span>
              </div>
              <div className="hidden xs:block">
                <h1 className={cn(
                  'text-lg sm:text-xl font-bold transition-colors duration-300',
                  textColor
                )} style={{ fontFamily: 'var(--font-serif)' }}>
                  Club Hípico
                </h1>
                <p className={cn(
                  'text-[10px] sm:text-xs transition-colors duration-300 -mt-0.5',
                  isScrolled || !isHome ? 'text-gray-500' : 'text-gray-300'
                )}>
                  Desde 1942
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    textColor,
                    location.pathname === item.path
                      ? isScrolled || !isHome
                        ? 'bg-primary/10 text-primary'
                        : 'bg-white/20 text-white'
                      : isScrolled || !isHome
                        ? 'hover:bg-gray-100'
                        : 'hover:bg-white/10'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden lg:block">
              <Button
                asChild
                className={cn(
                  'btn-shine font-semibold transition-all duration-300',
                  isScrolled || !isHome
                    ? 'bg-secondary hover:bg-secondary-light text-primary-dark'
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30'
                )}
              >
                <a href="https://sistema.1942harasclub.com.ar" target="_blank" rel="noopener noreferrer">
                  Acceder al Sistema
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                textColor,
                isScrolled || !isHome ? 'hover:bg-gray-100' : 'hover:bg-white/10'
              )}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menú"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={cn(
        'fixed inset-0 z-40 lg:hidden transition-all duration-300',
        isMenuOpen ? 'visible' : 'invisible'
      )}>
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-300',
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={cn(
          'absolute top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl transition-transform duration-300',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-primary text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                Menú
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                      'animate-slide-left',
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t space-y-4">
              <Button
                asChild
                className="w-full bg-secondary hover:bg-secondary-light text-primary-dark font-semibold py-6"
              >
                <a href="https://sistema.1942harasclub.com.ar" target="_blank" rel="noopener noreferrer">
                  Acceder al Sistema
                </a>
              </Button>
              <p className="text-center text-xs text-gray-500">
                Club Hípico - Desde 1942
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
