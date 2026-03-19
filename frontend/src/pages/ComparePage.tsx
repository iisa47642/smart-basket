import { useState, useEffect } from 'react'
import type { Product, ProductCompare } from '../types'
import { productsApi, analyticsApi } from '../api/client'
import { useAppContext } from '../App'
import EmptyState from '../components/EmptyState'

function formatPrice(n: number) {
  return n.toFixed(2) + ' ₽'
}

export default function ComparePage() {
  const { selectedCity } = useAppContext()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('')
  const [results, setResults] = useState<ProductCompare[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    productsApi.getAll().then(res => setProducts(res.data))
  }, [])

  useEffect(() => {
    if (!selectedProductId || !selectedCity) {
      setResults([])
      return
    }
    setLoading(true)
    analyticsApi
      .compareProduct(Number(selectedProductId), selectedCity.id)
      .then(res => setResults(res.data))
      .finally(() => setLoading(false))
  }, [selectedProductId, selectedCity])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Сравнение цен на товар</h1>

      <select
        value={selectedProductId}
        onChange={e => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
        className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
      >
        <option value="">Выберите товар</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((r, idx) => (
            <div
              key={r.store.id}
              className={`bg-white rounded-xl shadow-md p-5 flex items-center justify-between border-2 ${
                idx === 0 ? 'border-[#10B981]' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                {idx === 0 && (
                  <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full">
                    Лучшая цена
                  </span>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{r.store.name}</p>
                  {r.store.address && <p className="text-sm text-gray-400">{r.store.address}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${idx === 0 ? 'text-[#10B981]' : 'text-gray-800'}`}>
                  {formatPrice(r.price)}
                </p>
                <p className="text-xs text-gray-400">на {r.priceDate}</p>
              </div>
            </div>
          ))}
        </div>
      ) : selectedProductId ? (
        <EmptyState icon="📋" title="Нет данных о ценах" description="В выбранном городе нет цен на этот товар" />
      ) : (
        <EmptyState icon="🔎" title="Выберите товар" description="Выберите товар из списка, чтобы сравнить цены по магазинам" />
      )}
    </div>
  )
}
