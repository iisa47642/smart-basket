import type { SingleStoreResult } from '../types'

interface Props {
  results: SingleStoreResult[]
}

function formatPrice(n?: number) {
  if (n == null) return '—'
  return n.toFixed(2) + ' ₽'
}

export default function ComparisonResult({ results }: Props) {
  if (results.length === 0) return <p className="text-gray-500">Нет результатов</p>

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
      {results.map((result, idx) => (
        <div
          key={result.store.id}
          className={`bg-white rounded-xl shadow-md p-5 border-2 transition-all ${
            idx === 0 ? 'border-[#10B981]' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {idx === 0 && (
                <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full">
                  Лучшая цена
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-800">{result.store.name}</h3>
              {result.store.address && (
                <span className="text-sm text-gray-400">{result.store.address}</span>
              )}
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${idx === 0 ? 'text-[#10B981]' : 'text-gray-800'}`}>
                {formatPrice(result.totalPrice)}
              </p>
              {result.savings != null && result.savings > 0 && idx !== results.length - 1 && (
                <p className="text-sm text-[#10B981]">
                  Экономия {formatPrice(result.savings)}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="py-1">Товар</th>
                  <th className="py-1 text-right">Кол-во</th>
                  <th className="py-1 text-right">Цена</th>
                  <th className="py-1 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map(item => (
                  <tr key={item.productId} className={!item.available ? 'text-[#EF4444]' : ''}>
                    <td className="py-1">{item.productName}</td>
                    <td className="py-1 text-right">{item.quantity}</td>
                    <td className="py-1 text-right">
                      {item.available ? formatPrice(item.unitPrice) : 'Нет в наличии'}
                    </td>
                    <td className="py-1 text-right">{formatPrice(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.missingItems.length > 0 && (
            <p className="mt-2 text-sm text-[#EF4444]">
              Нет в наличии: {result.missingItems.join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
