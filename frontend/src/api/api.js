import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Notification APIs
export const fetchNotifications = () => api.get('/notifications/')
export const markNotificationRead = (id) => api.post(`/notifications/mark-read/${id}`)

export default api
