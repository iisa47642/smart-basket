import { useState } from 'react'
import type { Product } from '../types'
import { useAppContext } from '../App'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useAppContext()
  const [qty, setQty] = useState(1)
  const [showQty, setShowQty] = useState(false)

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unit: product.unit,
    })
    setShowQty(false)
    setQty(1)
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
      <div>
        <h3 className="font-semibold text-gray-800 text-base">{product.name}</h3>
        {product.categoryName && (
          <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
            {product.categoryName}
          </span>
        )}
        <p className="text-sm text-gray-400 mt-1">Ед.: {product.unit}</p>
      </div>
      <div className="mt-4">
        {showQty ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={e => setQty(Math.max(1, Number(e.target.value)))}
              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center text-sm"
            />
            <button
              onClick={handleAdd}
              className="bg-[#10B981] hover:bg-[#059669] text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Добавить
            </button>
            <button
              onClick={() => setShowQty(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              x
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowQty(true)}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm py-2 rounded-lg transition-colors"
          >
            В корзину
          </button>
        )}
      </div>
    </div>
  )
}
