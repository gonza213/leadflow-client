import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const isSSR = typeof localStorage === 'undefined'
  const user = ref(isSSR ? null : JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(isSSR ? null : (localStorage.getItem('token') || null))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const tenantSlug = computed(() => user.value?.tenant?.slug || null)
  const userRole = computed(() => user.value?.role || null)
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isManager = computed(() => ['superadmin', 'manager'].includes(user.value?.role))
  const subscriptionStatus = computed(() => user.value?.tenant?.subscriptionStatus || null)
  const trialDaysLeft = computed(() => {
    const endsAt = user.value?.tenant?.trialEndsAt
    if (!endsAt) return null
    const diff = new Date(endsAt) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })
  const isSeller = computed(() => user.value?.role === 'seller')
  const isViewer = computed(() => ['superadmin', 'manager', 'viewer'].includes(user.value?.role))
  // Permisos especificos
  const canCreate = computed(() => ['superadmin', 'manager'].includes(user.value?.role))
  const canDelete = computed(() => ['superadmin', 'manager'].includes(user.value?.role))
  const canEdit = computed(() => ['superadmin', 'manager', 'viewer'].includes(user.value?.role))

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(email, password)
      const { token: newToken, user: userData } = response.data

      token.value = newToken
      user.value = userData

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      return {
        success: false,
        error: error.value,
        subscriptionLink: err.response?.data?.subscriptionLink || null
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const response = await authApi.getMe()
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(response.data.user))
    } catch (err) {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    tenantSlug,
    userRole,
    isSuperAdmin,
    isManager,
    isSeller,
    isViewer,
    subscriptionStatus,
    trialDaysLeft,
    canCreate,
    canDelete,
    canEdit,
    login,
    fetchUser,
    logout
  }
})
