import type { StorePromotion } from '../types'

interface Props {
  promo: StorePromotion
}

const dayNames: Record<string, string> = {
  MONDAY: 'Понедельник',
  TUESDAY: 'Вторник',
  WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг',
  FRIDAY: 'Пятница',
  SATURDAY: 'Суббота',
  SUNDAY: 'Воскресенье',
}

export default function PromotionCard({ promo }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow border-l-4 border-[#F59E0B]">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-800">{promo.title}</h3>
          <p className="text-sm text-[#3B82F6] font-medium">{promo.storeName}</p>
        </div>
        {promo.discountPercent && (
          <span className="bg-[#EF4444] text-white text-sm font-bold px-2.5 py-1 rounded-full">
            -{promo.discountPercent}%
          </span>
        )}
      </div>
      {promo.description && (
        <p className="text-sm text-gray-500 mb-3">{promo.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {promo.categoryName && (
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
            {promo.categoryName}
          </span>
        )}
        {promo.dayOfWeek && (
          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
            {dayNames[promo.dayOfWeek] || promo.dayOfWeek}
          </span>
        )}
        {promo.timeFrom && promo.timeTo && (
          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
            {promo.timeFrom} — {promo.timeTo}
          </span>
        )}
      </div>
    </div>
  )
}
