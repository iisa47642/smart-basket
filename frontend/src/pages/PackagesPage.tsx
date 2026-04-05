import { useState, useEffect } from 'react'
import type { ProductPackage, PackageCostResult } from '../types'
import { packagesApi } from '../api/client'
import { useAppContext } from '../App'
import PackageCard from '../components/PackageCard'
import OptimalResultView from '../components/OptimalResult'
import EmptyState from '../components/EmptyState'

export default function PackagesPage() {
  const { selectedCity, addToCart } = useAppContext()
  const [packages, setPackages] = useState<ProductPackage[]>([])
  const [selectedPkg, setSelectedPkg] = useState<ProductPackage | null>(null)
  const [costResult, setCostResult] = useState<PackageCostResult | null>(null)
  const [compareResults, setCompareResults] = useState<PackageCostResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    packagesApi.getAll().then(res => {
      setPackages(res.data)
      setPageLoading(false)
    })
  }, [])

  const handleSelect = (pkg: ProductPackage) => {
    setSelectedPkg(pkg)
    setCostResult(null)
    setShowCompare(false)
  }

  const handleCalculate = async () => {
    if (!selectedPkg || !selectedCity) return
    setLoading(true)
    try {
      const res = await packagesApi.calculateCost(selectedPkg.id, selectedCity.id)
      setCostResult(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!selectedPkg) return
    selectedPkg.items.forEach(item => {
      addToCart({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
      })
    })
  }

  const handleCompareAll = async () => {
    if (!selectedCity || packages.length === 0) return
    setSelectedPkg(null)
    setCostResult(null)
    setShowCompare(true)
    setLoading(true)
    try {
      const res = await packagesApi.comparePackages(
        packages.map(p => p.id),
        selectedCity.id
      )
      setCompareResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Готовые наборы продуктов</h1>
          <p className="text-sm text-gray-500 mt-1">Выберите набор под ваш бюджет и потребности</p>
        </div>
        <button
          onClick={handleCompareAll}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Сравнить все наборы
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {packages.map(pkg => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onSelect={handleSelect}
            selected={selectedPkg?.id === pkg.id}
          />
        ))}
      </div>

      {showCompare && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Сравнение наборов</h2>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareResults
                .sort((a, b) => a.totalOptimalPrice - b.totalOptimalPrice)
                .map((result, idx) => (
                <div
                  key={result.packageId}
                  className={`bg-white rounded-xl shadow-md p-5 border-2 ${
                    idx === 0 ? 'border-[#10B981]' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{result.packageIcon}</span>
                    <h3 className="font-bold text-gray-800">{result.packageName}</h3>
                    {idx === 0 && (
                      <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                        Выгоднее всего
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Оптимальная цена</span>
                      <span className="font-bold text-[#F59E0B]">{result.totalOptimalPrice.toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">В одном магазине</span>
                      <span className="font-medium text-gray-700">{result.totalSingleStorePrice.toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Магазинов нужно</span>
                      <span className="font-medium text-gray-700">{result.storesNeeded}</span>
                    </div>
                    {result.totalSingleStorePrice - result.totalOptimalPrice > 0 && (
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-sm text-gray-500">Экономия</span>
                        <span className="font-bold text-[#10B981]">
                          {(result.totalSingleStorePrice - result.totalOptimalPrice).toFixed(2)} ₽
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedPkg && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedPkg.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedPkg.name}</h2>
                <p className="text-sm text-gray-500">{selectedPkg.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Добавить в корзину
              </button>
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                {loading ? 'Расчёт...' : 'Рассчитать стоимость'}
              </button>
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 mb-2">Состав набора:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {selectedPkg.items.map(item => (
              <div key={item.productId} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{item.productName}</span>
                <span className="text-gray-400 ml-1">× {item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {costResult && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Оптимальная стоимость набора</h2>
          <OptimalResultView
            result={{
              totalPrice: costResult.totalOptimalPrice,
              itemAllocations: costResult.itemAllocations,
              storesNeeded: costResult.storesNeeded,
              savingsVsBestSingle: costResult.totalSingleStorePrice - costResult.totalOptimalPrice,
            }}
          />
        </div>
      )}

      {!selectedPkg && !showCompare && (
        <EmptyState
          icon="📦"
          title="Выберите набор"
          description="Нажмите на карточку набора, чтобы увидеть состав и рассчитать стоимость"
        />
      )}
    </div>
  )
}
