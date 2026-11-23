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

  const [limit, setLimit] = useState<number | undefined>(5)
  const [error, setError] = useState('')
  const [catalogError, setCatalogError] = useState('')
  const [storeError, setStoreError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    productsApi.getAll().then(res => { if (active) setProducts(res.data) })
      .catch(() => { if (active) setCatalogError('Не удалось загрузить товары. Обновите страницу.') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setStores([])
    setSelectedStoreId('')
    setStoreError('')
    if (selectedCity) {
      storesApi.getAll(selectedCity.id).then(res => { if (active) setStores(res.data) })
        .catch(() => { if (active) setStoreError('Не удалось загрузить магазины. Обновите страницу.') })
    }
    return () => { active = false }
  }, [selectedCity])

  useEffect(() => {
    setHistory([])
    setError('')
    setLoading(Boolean(selectedProductId && selectedStoreId))
    if (!selectedProductId || !selectedStoreId) return
    const controller = new AbortController()
    analyticsApi.priceHistory(selectedProductId, selectedStoreId, limit, controller.signal)
      .then(res => { if (!controller.signal.aborted) setHistory(res.data) })
      .catch(() => { if (!controller.signal.aborted) setError('Не удалось загрузить историю цен.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [selectedProductId, selectedStoreId, limit, retry])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">История цен</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          aria-label="Товар"
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
          aria-label="Магазин"
          value={selectedStoreId}
          onChange={e => setSelectedStoreId(e.target.value ? Number(e.target.value) : '')}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          <option value="">Выберите магазин</option>
          {stores.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.address}</option>
          ))}
        </select>
        <select aria-label="Количество записей" value={limit ?? 'all'}
          onChange={e => setLimit(e.target.value === 'all' ? undefined : Number(e.target.value))}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm">
          <option value="5">Последние 5 записей</option>
          <option value="15">Последние 15 записей</option>
          <option value="all">Вся история</option>
        </select>
      </div>

      {(catalogError || storeError) && <p role="alert">{catalogError || storeError}</p>}
      {error ? <div role="alert">{error} <button className="underline" onClick={() => setRetry(n => n + 1)}>Повторить</button></div> : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : history.length > 0 ? (
        <><p className="mb-2 text-sm text-gray-600">Записей на графике: {history.length}</p><PriceChart data={history} /></>
      ) : selectedProductId && selectedStoreId ? (
        <EmptyState icon="📉" title="Нет истории цен" description="Для выбранной комбинации товара и магазина нет данных" />
      ) : (
        <EmptyState icon="📈" title="Выберите товар и магазин" description="Мы покажем график изменения цен" />
      )}
    </div>
  )
}
