import { useState, useEffect } from 'react'
import type { Store } from '../types'
import { storesApi } from '../api/client'
import { useAppContext } from '../App'
import EmptyState from '../components/EmptyState'

export default function StoresPage() {
  const { selectedCity } = useAppContext()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedCity) return
    setLoading(true)
    storesApi
      .getAll(selectedCity.id)
      .then(res => setStores(res.data))
      .finally(() => setLoading(false))
  }, [selectedCity])

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
          {stores.map(store => (
            <div key={store.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-gray-800 text-lg">{store.name}</h3>
              {store.address && <p className="text-sm text-gray-500 mt-1">{store.address}</p>}
              <p className="text-xs text-gray-400 mt-2">{store.cityName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
