import axios from 'axios'
import type { CartCompareRequest } from '../types'

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
})

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
