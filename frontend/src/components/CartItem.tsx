import type { CartItem as CartItemType } from '../types'
import { useAppContext } from '../App'

interface Props {
  item: CartItemType
}

export default function CartItemCard({ item }: Props) {
  const { updateQuantity, removeFromCart } = useAppContext()

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-800">{item.productName}</p>
        <p className="text-sm text-gray-400">{item.unit}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
        >
          +
        </button>
        <button
          onClick={() => removeFromCart(item.productId)}
          className="ml-2 text-[#EF4444] hover:text-red-700 text-sm font-medium transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  )
}
