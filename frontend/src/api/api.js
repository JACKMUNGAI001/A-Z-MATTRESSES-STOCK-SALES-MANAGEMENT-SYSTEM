import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

const api = axios.create({
  baseURL: API_BASE,
})

let activeGetRequests = 0
const loadingListeners = new Set()

const notifyLoadingListeners = () => {
  loadingListeners.forEach((listener) => listener(activeGetRequests > 0))
}

const stopGlobalLoading = (config) => {
  if (!config?.__globalLoadingTracked) return
  config.__globalLoadingTracked = false
  activeGetRequests = Math.max(0, activeGetRequests - 1)
  notifyLoadingListeners()
}

export const subscribeToGlobalLoading = (listener) => {
  loadingListeners.add(listener)
  listener(activeGetRequests > 0)
  return () => loadingListeners.delete(listener)
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  if ((config.method || 'get').toLowerCase() === 'get' && config.showGlobalLoading !== false) {
    config.__globalLoadingTracked = true
    activeGetRequests += 1
    notifyLoadingListeners()
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    stopGlobalLoading(response.config)
    return response
  },
  (error) => {
    stopGlobalLoading(error.config)
    // If the low_stock_items endpoint returns 500, return an empty list so UI can continue
    if (error.response && error.response.status === 500 && error.config && error.config.url && error.config.url.includes('low_stock_items')) {
      return Promise.resolve({ data: [] })
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Supplier APIs
export const fetchSuppliers = () => api.get('/suppliers/')
export const createSupplier = (data) => api.post('/suppliers/', data)
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data)
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`)

// Invoice APIs
export const fetchSupplierInvoices = () => api.get('/suppliers/invoices')
export const createSupplierInvoice = (data) => api.post('/suppliers/invoices', data)
export const fetchSupplierInvoiceDetails = (id) => api.get(`/suppliers/invoices/${id}`)
export const updateSupplierInvoiceStatus = (id, status) => api.put(`/suppliers/invoices/${id}/status`, { status })
export const recordSupplierInvoicePayment = (id, data) => api.post(`/suppliers/invoices/${id}/payments`, data)

// Notification APIs
export const fetchNotifications = () => api.get('/notifications/')
export const markNotificationRead = (id) => api.post(`/notifications/mark-read/${id}`)

// Report APIs
export const fetchProductAnalysis = (params) => api.get('/reports/product-analysis', { params })
export const fetchCreditsSummary = (params) => api.get('/reports/credits-summary', { params })
export const fetchCreditSales = (params) => api.get('/reports/credit-sales', { params })

export default api
