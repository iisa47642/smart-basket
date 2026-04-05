import { useState, useEffect } from 'react'
import type { Product, Category, CategoryProducts } from '../types'
import { productsApi, categoriesApi } from '../api/client'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'

export default function HomePage() {
  const [grouped, setGrouped] = useState<CategoryProducts[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productsApi.getGrouped(),
      categoriesApi.getAll(),
    ]).then(([groupedRes, catRes]) => {
      setGrouped(groupedRes.data)
      setCategories(catRes.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!search) {
      setSearchResults([])
      return
    }
    productsApi.getAll(search).then(res => setSearchResults(res.data))
  }, [search])

  const isSearching = search.length > 0

  const filteredGroups = activeCategory
    ? grouped.filter(g => g.category.id === activeCategory)
    : grouped

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Каталог товаров</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        />
      </div>

      {/* Category tabs */}
      {!isSearching && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === null
                ? 'bg-[#3B82F6] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Все
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isSearching ? (
        /* Search results - flat grid */
        searchResults.length === 0 ? (
          <EmptyState icon="🔍" title="Товары не найдены" description="Попробуйте изменить поисковый запрос" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )
      ) : filteredGroups.length === 0 ? (
        <EmptyState icon="📭" title="Нет товаров" />
      ) : (
        /* Category sections */
        <div className="space-y-8">
          {filteredGroups.map(group => (
            <section key={group.category.id}>
              <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#3B82F6] rounded-full" />
                {group.category.name}
                <span className="text-sm font-normal text-gray-400">({group.products.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
