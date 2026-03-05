import { useState } from 'react'
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
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">CH</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">Club Hípico</h1>
              <p className="text-xs text-gray-500">Tradición y Excelencia</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-gray-700 hover:text-primary font-medium transition-colors',
                  location.pathname === item.path && 'text-primary border-b-2 border-primary'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button asChild variant="secondary">
              <a href="https://app.clubhipico.com" target="_blank" rel="noopener noreferrer">
                Acceder al Sistema
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'text-gray-700 hover:text-primary font-medium py-2',
                    location.pathname === item.path && 'text-primary'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild variant="secondary" className="mt-2">
                <a href="https://app.clubhipico.com" target="_blank" rel="noopener noreferrer">
                  Acceder al Sistema
                </a>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
