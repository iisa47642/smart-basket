import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { PriceHistory } from '../types'

interface Props {
  data: PriceHistory[]
}

export default function PriceChart({ data }: Props) {
  if (data.length === 0) return <p className="text-gray-500">Нет данных для отображения</p>

  const minPrice = Math.min(...data.map(d => d.price))
  const maxPrice = Math.max(...data.map(d => d.price))
  const avgPrice = data.reduce((s, d) => s + d.price, 0) / data.length

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-5">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => [value.toFixed(2) + ' ₽', 'Цена']} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-sm text-gray-500">Мин. цена</p>
          <p className="text-lg font-bold text-[#10B981]">{minPrice.toFixed(2)} ₽</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-sm text-gray-500">Макс. цена</p>
          <p className="text-lg font-bold text-[#EF4444]">{maxPrice.toFixed(2)} ₽</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-sm text-gray-500">Средняя</p>
          <p className="text-lg font-bold text-[#3B82F6]">{avgPrice.toFixed(2)} ₽</p>
        </div>
      </div>
    </div>
  )
}
