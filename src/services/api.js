import axios from 'axios'

// In development, VITE_API_URL is empty and Vite proxy handles /api
// In production, VITE_API_URL should be the full backend URL (e.g., https://api.leadflow.com)
const apiUrl = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
}

export const leadsApi = {
  getReport: (tenantSlug, params) => api.get(`/${tenantSlug}/report`, { params }),
  getLeads: (tenantSlug, params) => api.get(`/${tenantSlug}/leads`, { params }),
  getNextAssignment: (tenantSlug) => api.get(`/${tenantSlug}/next-assignment`),
  updateLead: (tenantSlug, contactId, data) => api.put(`/${tenantSlug}/lead/${contactId}`, data),
  editLead: (tenantSlug, id, data) => api.patch(`/${tenantSlug}/leads/${id}`, data),
  deleteLead: (tenantSlug, id) => api.delete(`/${tenantSlug}/leads/${id}`)
}

export const sellersApi = {
  getAll: (tenantSlug, params) => api.get(`/${tenantSlug}/sellers`, { params }),
  update: (tenantSlug, id, data) => api.patch(`/${tenantSlug}/sellers/${id}`, data),
  create: (tenantSlug, data) => api.post(`/${tenantSlug}/sellers`, data),
  delete: (tenantSlug, id) => api.delete(`/${tenantSlug}/sellers/${id}`)
}

export const configApi = {
  get: (tenantSlug) => api.get(`/${tenantSlug}/config`),
  update: (tenantSlug, data) => api.post(`/${tenantSlug}/config`, data)
}

export const adminApi = {
  getTenants: () => api.get('/admin/tenants'),
  getTenant: (id) => api.get(`/admin/tenants/${id}`),
  createTenant: (data) => api.post('/admin/tenants', data),
  updateTenant: (id, data) => api.patch(`/admin/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/admin/tenants/${id}`),
  regenerateApiKey: (id) => api.post(`/admin/tenants/${id}/regenerate-api-key`)
}

export const usersApi = {
  getAll: (tenantSlug) => api.get(`/${tenantSlug}/users`),
  create: (tenantSlug, data) => api.post(`/${tenantSlug}/users`, data),
  update: (tenantSlug, id, data) => api.put(`/${tenantSlug}/users/${id}`, data),
  delete: (tenantSlug, id) => api.delete(`/${tenantSlug}/users/${id}`)
}

export default api
