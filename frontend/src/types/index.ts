export interface City { id: number; name: string }
export interface Store { id: number; name: string; cityName: string; address?: string }
export interface Category { id: number; name: string }
export interface Product { id: number; name: string; categoryName?: string; unit: string }
export interface CartItem { productId: number; productName: string; quantity: number; unit: string }

export interface CartCompareRequest {
  cityId: number
  items: { productId: number; quantity: number }[]
  strategy: 'single_store' | 'optimal'
}

export interface SingleStoreResult {
  store: Store
  totalPrice: number
  items: CartPriceItem[]
  missingItems: string[]
  savings?: number
}

export interface CartPriceItem {
  productId: number
  productName: string
  quantity: number
  unitPrice?: number
  totalPrice?: number
  available: boolean
}

export interface OptimalResult {
  totalPrice: number
  itemAllocations: ItemAllocation[]
  storesNeeded: number
  savingsVsBestSingle: number
}

export interface ItemAllocation {
  productId: number
  productName: string
  quantity: number
  bestStore: Store
  unitPrice: number
  totalPrice: number
}

export interface PriceHistory {
  date: string
  price: number
}

export interface ProductCompare {
  store: Store
  price: number
  priceDate: string
}

export interface ProductPackage {
  id: number
  name: string
  description: string
  icon: string
  type: string
  items: PackageItem[]
}

export interface PackageItem {
  productId: number
  productName: string
  quantity: number
  unit: string
}

export interface PackageCostResult {
  packageId: number
  packageName: string
  packageIcon: string
  totalOptimalPrice: number
  totalSingleStorePrice: number
  storesNeeded: number
  itemAllocations: ItemAllocation[]
}

export interface StorePromotion {
  id: number
  storeId: number
  storeName: string
  categoryId?: number
  categoryName?: string
  title: string
  description?: string
  discountPercent?: number
  dayOfWeek?: string
  timeFrom?: string
  timeTo?: string
  validFrom: string
  validTo: string
}

export interface CategoryProducts {
  category: Category
  products: Product[]
}
