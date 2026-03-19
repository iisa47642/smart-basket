import { useState } from 'react'
import { useAppContext } from '../App'
import { analyticsApi } from '../api/client'
import type { SingleStoreResult, OptimalResult as OptimalResultType } from '../types'
import CartItemCard from '../components/CartItem'
import ComparisonResult from '../components/ComparisonResult'
import OptimalResultView from '../components/OptimalResult'
import EmptyState from '../components/EmptyState'

export default function CartPage() {
  const { cartItems, selectedCity, clearCart } = useAppContext()
  const [strategy, setStrategy] = useState<'single_store' | 'optimal'>('single_store')
  const [singleResults, setSingleResults] = useState<SingleStoreResult[] | null>(null)
  const [optimalResult, setOptimalResult] = useState<OptimalResultType | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (!selectedCity || cartItems.length === 0) return
    setLoading(true)
    setSingleResults(null)
    setOptimalResult(null)

    try {
      const res = await analyticsApi.compareCart({
        cityId: selectedCity.id,
        items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        strategy,
      })

      if (strategy === 'single_store') {
        setSingleResults(res.data as SingleStoreResult[])
      } else {
        setOptimalResult(res.data as OptimalResultType)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Корзина пуста"
        description="Добавьте товары из каталога, чтобы сравнить цены по магазинам"
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Корзина</h1>
        <button
          onClick={clearCart}
          className="text-sm text-[#EF4444] hover:text-red-700 font-medium"
        >
          Очистить корзину
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {cartItems.map(item => (
            <CartItemCard key={item.productId} item={item} />
          ))}

          <div className="bg-white rounded-xl shadow-md p-5 mt-4">
            <p className="font-semibold text-gray-700 mb-3">Стратегия сравнения</p>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="radio"
                name="strategy"
                checked={strategy === 'single_store'}
                onChange={() => setStrategy('single_store')}
                className="accent-[#3B82F6]"
              />
              <span className="text-sm">Один магазин</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="strategy"
                checked={strategy === 'optimal'}
                onChange={() => setStrategy('optimal')}
                className="accent-[#F59E0B]"
              />
              <span className="text-sm">Оптимальная (несколько магазинов)</span>
            </label>

            <button
              onClick={handleCompare}
              disabled={loading}
              className="w-full mt-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              {loading ? 'Сравнение...' : 'Сравнить цены'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && singleResults && <ComparisonResult results={singleResults} />}
          {!loading && optimalResult && <OptimalResultView result={optimalResult} />}
          {!loading && !singleResults && !optimalResult && (
            <EmptyState
              icon="📊"
              title="Выберите стратегию и нажмите «Сравнить цены»"
              description="Мы покажем, где выгоднее купить ваши товары"
            />
          )}
        </div>
      </div>
    </div>
  )
}
