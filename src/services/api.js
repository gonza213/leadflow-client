import axios from 'axios'

// In development, VITE_API_URL is empty and Vite proxy handles /api
// In production, VITE_API_URL should be the full backend URL (e.g., https://api.leaddistro.app)
const apiUrl = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  // Sin timeout, un server caído deja spinners infinitos; con esto la request
  // falla a los 30s y la UI muestra el error
  timeout: 30000,
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
    // Suscripción vencida/inactiva detectada a mitad de sesión
    if (error.response?.status === 403 && error.response?.data?.message === 'subscription_inactive') {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
      if (storedUser?.role === 'adminclient') {
        // dueño multi-cuenta: solo esa subcuenta está vencida; volver a sus cuentas
        // (dentro del portal /cuentas* cada vista maneja el error localmente)
        if (!window.location.pathname.startsWith('/cuentas')) {
          storedUser.tenant = null
          localStorage.setItem('user', JSON.stringify(storedUser))
          window.location.href = '/cuentas'
        }
      } else {
        // usuario de un solo tenant: volver al login (muestra el banner de renovación)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  registerOwner: (data) => api.post('/auth/register-owner', data),
  getAccounts: () => api.get('/auth/accounts'),
  createAccount: (companyName) => api.post('/auth/accounts', { companyName }),
  enterAccount: (id) => api.post(`/auth/accounts/${id}/enter`),
  updateAccount: (id, data) => api.patch(`/auth/accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/auth/accounts/${id}`),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data)
}

export const leadsApi = {
  getReport: (tenantSlug, params) => api.get(`/${tenantSlug}/report`, { params }),
  getLeads: (tenantSlug, params) => api.get(`/${tenantSlug}/leads`, { params }),
  getNextAssignment: (tenantSlug) => api.get(`/${tenantSlug}/next-assignment`),
  updateLead: (tenantSlug, contactId, data) => api.put(`/${tenantSlug}/lead/${contactId}`, data),
  editLead: (tenantSlug, id, data) => api.patch(`/${tenantSlug}/leads/${id}`, data),
  deleteLead: (tenantSlug, id) => api.delete(`/${tenantSlug}/leads/${id}`),
  redeliverLead: (tenantSlug, id) => api.post(`/${tenantSlug}/leads/${id}/redeliver`)
}

export const sellersApi = {
  getAll: (tenantSlug, params) => api.get(`/${tenantSlug}/sellers`, { params }),
  getPresence: (tenantSlug) => api.get(`/${tenantSlug}/sellers/presence`),
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
  regenerateApiKey: (id) => api.post(`/admin/tenants/${id}/regenerate-api-key`),
  getTenantUsers: (id) => api.get(`/admin/tenants/${id}/users`),
  updateTenantUser: (id, userId, data) => api.patch(`/admin/tenants/${id}/users/${userId}`, data),
  updateSubscription: (id, subscriptionStatus) => api.patch(`/admin/tenants/${id}/subscription`, { subscriptionStatus }),
  updateOwnerSubscription: (id, subscriptionStatus) => api.patch(`/admin/owners/${id}/subscription`, { subscriptionStatus }),
  updateOwner: (id, data) => api.patch(`/admin/owners/${id}`, data),
  deleteOwner: (id) => api.delete(`/admin/owners/${id}`),
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),
  getAdminTickets: (params) => api.get('/admin/tickets', { params }),
  updateAdminTicket: (id, data) => api.patch(`/admin/tickets/${id}`, data),
  getRevenueStats: () => api.get('/admin/revenue-stats'),
  getGoogleDriveStatus: () => api.get('/admin/auth/google/status'),
  getGoogleAuthUrl: () => api.get('/admin/auth/google')
}

// Tenant activo (necesario para adminclient, cuyo tenant no vive en el JWT;
// para managers el backend usa su propio tenant e ignora este valor)
const activeTenantId = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.tenant?.id || undefined
  } catch {
    return undefined
  }
}

export const subscriptionApi = {
  verify: (tenantId) => api.post('/subscription/verify', { tenantId: tenantId || activeTenantId() }),
  cancel: () => api.post('/subscription/cancel', { tenantId: activeTenantId() }),
  getMyInvoices: () => api.get('/subscription/invoices', { params: { tenantId: activeTenantId() } })
}

export const usersApi = {
  getAll: (tenantSlug) => api.get(`/${tenantSlug}/users`),
  create: (tenantSlug, data) => api.post(`/${tenantSlug}/users`, data),
  update: (tenantSlug, id, data) => api.put(`/${tenantSlug}/users/${id}`, data),
  delete: (tenantSlug, id) => api.delete(`/${tenantSlug}/users/${id}`)
}

export const summaryApi = {
  getAll: (tenantSlug, params) => api.get(`/${tenantSlug}/summary`, { params }),
  getOne: (tenantSlug, id) => api.get(`/${tenantSlug}/summary/${id}`),
  trigger: (tenantSlug) => api.post(`/${tenantSlug}/summary/trigger`),
  delete: (tenantSlug, id) => api.delete(`/${tenantSlug}/summary/${id}`)
}

export const supportApi = {
  getTickets: (tenantSlug) => api.get(`/${tenantSlug}/support/tickets`),
  createTicket: (tenantSlug, data) => api.post(`/${tenantSlug}/support/tickets`, data)
}

export const uploadApi = {
  single: (formData) => api.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  multiple: (formData) => api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export default api
