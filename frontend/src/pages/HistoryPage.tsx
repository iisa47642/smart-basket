import { useState, useEffect } from 'react'
import type { Product, Store, PriceHistory } from '../types'
import { productsApi, storesApi, analyticsApi } from '../api/client'
import { useAppContext } from '../App'
import PriceChart from '../components/PriceChart'
import EmptyState from '../components/EmptyState'

export default function HistoryPage() {
  const { selectedCity } = useAppContext()
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('')
  const [selectedStoreId, setSelectedStoreId] = useState<number | ''>('')
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    productsApi.getAll().then(res => setProducts(res.data))
  }, [])

  useEffect(() => {
    if (selectedCity) {
      storesApi.getAll(selectedCity.id).then(res => {
        setStores(res.data)
        setSelectedStoreId('')
      })
    }
  }, [selectedCity])

  useEffect(() => {
    if (!selectedProductId || !selectedStoreId) {
      setHistory([])
      return
    }
    setLoading(true)
    analyticsApi
      .priceHistory(Number(selectedProductId), Number(selectedStoreId))
      .then(res => setHistory(res.data))
      .finally(() => setLoading(false))
  }, [selectedProductId, selectedStoreId])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">История цен</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={selectedProductId}
          onChange={e => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          <option value="">Выберите товар</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={selectedStoreId}
          onChange={e => setSelectedStoreId(e.target.value ? Number(e.target.value) : '')}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          <option value="">Выберите магазин</option>
          {stores.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.address}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : history.length > 0 ? (
        <PriceChart data={history} />
      ) : selectedProductId && selectedStoreId ? (
        <EmptyState icon="📉" title="Нет истории цен" description="Для выбранной комбинации товара и магазина нет данных" />
      ) : (
        <EmptyState icon="📈" title="Выберите товар и магазин" description="Мы покажем график изменения цен" />
      )}
    </div>
  )
}
