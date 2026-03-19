import { useState, createContext, useContext, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { City, CartItem } from './types'
import { citiesApi } from './api/client'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import ComparePage from './pages/ComparePage'
import HistoryPage from './pages/HistoryPage'
import StoresPage from './pages/StoresPage'

interface AppContextType {
  cities: City[]
  selectedCity: City | null
  setSelectedCity: (city: City) => void
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

export const AppContext = createContext<AppContextType>({} as AppContextType)
export const useAppContext = () => useContext(AppContext)

export default function App() {
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    citiesApi.getAll().then(res => {
      setCities(res.data)
      if (res.data.length > 0) setSelectedCity(res.data[0])
    })
  }, [])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setCartItems([])

  return (
    <AppContext.Provider
      value={{
        cities,
        selectedCity,
        setSelectedCity,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/stores" element={<StoresPage />} />
        </Route>
      </Routes>
    </AppContext.Provider>
  )
}
