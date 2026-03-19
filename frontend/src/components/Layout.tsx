import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAppContext } from '../App'
import CitySelector from './CitySelector'

const navLinks = [
  { to: '/', label: 'Каталог' },
  { to: '/cart', label: 'Корзина' },
  { to: '/compare', label: 'Сравнение' },
  { to: '/history', label: 'История цен' },
  { to: '/stores', label: 'Магазины' },
]

export default function Layout() {
  const { cartItems } = useAppContext()
  const location = useLocation()
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-[#1E293B] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tight">
              Smart Basket
            </Link>
            <div className="hidden md:flex gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {link.to === '/cart' && cartCount > 0 && (
                    <span className="ml-1.5 bg-[#3B82F6] text-white text-xs px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          <CitySelector />
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 px-4 pb-3 overflow-x-auto">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                location.pathname === link.to
                  ? 'bg-white/20 text-white'
                  : 'text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
