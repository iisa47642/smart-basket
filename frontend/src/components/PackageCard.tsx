import type { ProductPackage } from '../types'

interface Props {
  pkg: ProductPackage
  onSelect: (pkg: ProductPackage) => void
  selected?: boolean
}

export default function PackageCard({ pkg, onSelect, selected }: Props) {
  const typeLabels: Record<string, { label: string; color: string }> = {
    BUDGET: { label: 'Эконом', color: 'bg-green-100 text-green-700' },
    MEDIUM: { label: 'Стандарт', color: 'bg-blue-100 text-blue-700' },
    PREMIUM: { label: 'Премиум', color: 'bg-purple-100 text-purple-700' },
    HEALTH: { label: 'Здоровье', color: 'bg-emerald-100 text-emerald-700' },
    MONTHLY: { label: 'На месяц', color: 'bg-orange-100 text-orange-700' },
  }

  const typeInfo = typeLabels[pkg.type] || { label: pkg.type, color: 'bg-gray-100 text-gray-700' }

  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`bg-white rounded-xl shadow-md p-5 cursor-pointer transition-all hover:shadow-lg border-2 ${
        selected ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20' : 'border-transparent'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{pkg.icon}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>
      <h3 className="font-bold text-gray-800 text-lg mb-1">{pkg.name}</h3>
      <p className="text-sm text-gray-500 mb-3">{pkg.description}</p>
      <p className="text-xs text-gray-400">{pkg.items.length} товаров в наборе</p>
    </div>
  )
}
