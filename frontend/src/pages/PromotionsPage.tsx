import { useState, useEffect } from 'react'
import type { StorePromotion, Store } from '../types'
import { promotionsApi, storesApi } from '../api/client'
import { useAppContext } from '../App'
import PromotionCard from '../components/PromotionCard'
import EmptyState from '../components/EmptyState'

export default function PromotionsPage() {
  const { selectedCity } = useAppContext()
  const [promotions, setPromotions] = useState<StorePromotion[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [filterStoreId, setFilterStoreId] = useState<number | ''>('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedCity) return
    storesApi.getAll(selectedCity.id).then(res => setStores(res.data))
  }, [selectedCity])

  useEffect(() => {
    if (!selectedCity) return
    setLoading(true)

    const fetchPromos = showActiveOnly
      ? promotionsApi.getActive(selectedCity.id)
      : filterStoreId
        ? promotionsApi.getAll(undefined, Number(filterStoreId))
        : promotionsApi.getAll(selectedCity.id)

    fetchPromos
      .then(res => setPromotions(res.data))
      .finally(() => setLoading(false))
  }, [selectedCity, filterStoreId, showActiveOnly])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Акции и скидки{selectedCity ? ` — ${selectedCity.name}` : ''}
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={filterStoreId}
          onChange={e => {
            setFilterStoreId(e.target.value ? Number(e.target.value) : '')
            setShowActiveOnly(false)
          }}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          <option value="">Все магазины</option>
          {stores.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.address}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setShowActiveOnly(!showActiveOnly)
            setFilterStoreId('')
          }}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            showActiveOnly
              ? 'bg-[#10B981] text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Активные сейчас
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Акций не найдено"
          description={showActiveOnly ? 'Сейчас нет активных акций' : 'В выбранном городе нет акций'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map(promo => (
            <PromotionCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </div>
  )
}
