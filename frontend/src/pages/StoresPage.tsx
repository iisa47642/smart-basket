import { useState, useEffect } from 'react'
import type { Store, StorePromotion } from '../types'
import { storesApi, promotionsApi } from '../api/client'
import { useAppContext } from '../App'
import EmptyState from '../components/EmptyState'

export default function StoresPage() {
  const { selectedCity } = useAppContext()
  const [stores, setStores] = useState<Store[]>([])
  const [promotions, setPromotions] = useState<StorePromotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedCity) return
    setLoading(true)
    Promise.all([
      storesApi.getAll(selectedCity.id),
      promotionsApi.getAll(selectedCity.id),
    ])
      .then(([storesRes, promosRes]) => {
        setStores(storesRes.data)
        setPromotions(promosRes.data)
      })
      .finally(() => setLoading(false))
  }, [selectedCity])

  const getStorePromos = (storeId: number) =>
    promotions.filter(p => p.storeId === storeId)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Магазины{selectedCity ? ` — ${selectedCity.name}` : ''}
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <EmptyState icon="🏪" title="Магазины не найдены" description="В выбранном городе нет магазинов" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(store => {
            const promos = getStorePromos(store.id)
            return (
              <div key={store.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{store.name}</h3>
                  {promos.length > 0 && (
                    <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {promos.length} акций
                    </span>
                  )}
                </div>
                {store.address && <p className="text-sm text-gray-500 mt-1">{store.address}</p>}
                <p className="text-xs text-gray-400 mt-1">{store.cityName}</p>
                {promos.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {promos.map(promo => (
                      <div key={promo.id} className="flex items-center gap-2 text-sm">
                        {promo.discountPercent && (
                          <span className="bg-[#EF4444] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            -{promo.discountPercent}%
                          </span>
                        )}
                        <span className="text-gray-600">{promo.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
