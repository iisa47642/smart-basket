import { useState, useEffect } from 'react'
import type { Product, Category } from '../types'
import { productsApi, categoriesApi } from '../api/client'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.getAll().then(res => setCategories(res.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    productsApi
      .getAll(search || undefined, categoryId)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false))
  }, [search, categoryId])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Каталог товаров</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        />
        <select
          value={categoryId ?? ''}
          onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon="🔍" title="Товары не найдены" description="Попробуйте изменить поисковый запрос или категорию" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
