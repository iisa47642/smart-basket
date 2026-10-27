import axios from 'axios'
import type { CartCompareRequest } from '../types'

const api = axios.create({
  baseURL: '/api/v1',
})

// Obtain a fresh CSRF token before writes, also after login/logout rotate the session.
api.interceptors.request.use(async config => {
  if (!['get', 'head', 'options'].includes(config.method?.toLowerCase() || 'get')) {
    const { data } = await api.get('/auth/csrf')
    config.headers.set(data.headerName, data.token)
  }
  return config
})

export const authApi = {
  me: () => api.get('/auth/me'),
  login: (username: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username, password })),
  logout: () => api.post('/auth/logout'),
}
export interface PriceRecord { id: number; productId: number; storeId: number; price: number; priceDate: string }
export const adminPricesApi = {
  list: (productId: number, storeId: number) => api.get<PriceRecord[]>('/admin/prices', { params: { productId, storeId } }),
  save: (record: Omit<PriceRecord, 'id'>, id?: number) => id
    ? api.put(`/admin/prices/${id}`, record) : api.post('/admin/prices', record),
  remove: (id: number) => api.delete(`/admin/prices/${id}`),
}

export const citiesApi = {
  getAll: () => api.get('/cities'),
}

export const storesApi = {
  getAll: (cityId?: number) => api.get('/stores', { params: { cityId } }),
}

export const productsApi = {
  getAll: (search?: string, categoryId?: number) =>
    api.get('/products', { params: { search, categoryId } }),
  getGrouped: () => api.get('/products/grouped'),
}

export const categoriesApi = {
  getAll: () => api.get('/categories'),
}

export const packagesApi = {
  getAll: () => api.get('/packages'),
  getById: (id: number) => api.get(`/packages/${id}`),
  calculateCost: (id: number, cityId: number) =>
    api.get(`/packages/${id}/cost`, { params: { cityId } }),
  comparePackages: (packageIds: number[], cityId: number) =>
    api.post('/packages/compare', { packageIds }, { params: { cityId } }),
}

export const promotionsApi = {
  getAll: (cityId?: number, storeId?: number) =>
    api.get('/promotions', { params: { cityId, storeId } }),
  getActive: (cityId: number) =>
    api.get('/promotions/active', { params: { cityId } }),
}

export const analyticsApi = {
  compareCart: (data: CartCompareRequest) =>
    api.post('/analytics/cart/compare', data),
  compareProduct: (productId: number, cityId: number) =>
    api.get(`/analytics/products/${productId}/compare`, { params: { cityId } }),
  priceHistory: (productId: number, storeId: number) =>
    api.get(`/analytics/products/${productId}/history`, { params: { storeId } }),
}
