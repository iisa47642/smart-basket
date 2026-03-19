import type { OptimalResult as OptimalResultType } from '../types'

interface Props {
  result: OptimalResultType
}

function formatPrice(n: number) {
  return n.toFixed(2) + ' ₽'
}

export default function OptimalResultView({ result }: Props) {
  return (
    <div className="animate-[fadeIn_0.3s_ease-in]">
      <div className="bg-white rounded-xl shadow-md p-5 mb-4 border-2 border-[#F59E0B]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Оптимальная сумма</p>
            <p className="text-3xl font-bold text-[#F59E0B]">{formatPrice(result.totalPrice)}</p>
          </div>
          {result.savingsVsBestSingle > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Экономия vs лучший магазин</p>
              <p className="text-xl font-bold text-[#10B981]">
                {formatPrice(result.savingsVsBestSingle)}
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-gray-500">Магазинов нужно</p>
            <p className="text-xl font-bold text-gray-800">{result.storesNeeded}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="font-bold text-gray-800 mb-3">Распределение по магазинам</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-left border-b">
              <th className="py-2">Товар</th>
              <th className="py-2">Магазин</th>
              <th className="py-2 text-right">Кол-во</th>
              <th className="py-2 text-right">Цена за ед.</th>
              <th className="py-2 text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {result.itemAllocations.map(item => (
              <tr key={item.productId} className="border-b last:border-0">
                <td className="py-2 font-medium">{item.productName}</td>
                <td className="py-2">
                  <span className="bg-[#F59E0B]/10 text-[#D97706] text-xs px-2 py-0.5 rounded-full">
                    {item.bestStore.name}
                  </span>
                </td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(item.unitPrice)}</td>
                <td className="py-2 text-right font-medium">{formatPrice(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
