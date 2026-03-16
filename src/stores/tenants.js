import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '../services/api'

export const useTenantsStore = defineStore('tenants', () => {
  const tenants = ref([])
  const currentTenant = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchTenants() {
    loading.value = true
    error.value = null

    try {
      const response = await adminApi.getTenants()
      tenants.value = response.data.tenants
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar tenants'
    } finally {
      loading.value = false
    }
  }

  async function fetchTenant(id) {
    loading.value = true
    error.value = null

    try {
      const response = await adminApi.getTenant(id)
      currentTenant.value = response.data.tenant
      return { success: true, tenant: response.data.tenant }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar tenant'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function createTenant(data) {
    loading.value = true
    error.value = null

    try {
      const response = await adminApi.createTenant(data)
      tenants.value.unshift({
        ...response.data.tenant,
        userCount: 1,
        webhookUrl: response.data.tenant.webhookUrl
      })
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear tenant'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function updateTenant(id, data) {
    try {
      const response = await adminApi.updateTenant(id, data)
      const index = tenants.value.findIndex(t => t._id === id)
      if (index !== -1) {
        tenants.value[index] = { ...tenants.value[index], ...response.data.tenant }
      }
      if (currentTenant.value?._id === id) {
        currentTenant.value = { ...currentTenant.value, ...response.data.tenant }
      }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar tenant'
      return { success: false, error: error.value }
    }
  }

  async function toggleActive(id) {
    const tenant = tenants.value.find(t => t._id === id)
    if (!tenant) return { success: false }

    return updateTenant(id, { active: !tenant.active })
  }

  async function regenerateApiKey(id) {
    try {
      const response = await adminApi.regenerateApiKey(id)
      if (currentTenant.value?._id === id) {
        currentTenant.value.apiKey = response.data.apiKey
      }
      return { success: true, apiKey: response.data.apiKey }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al regenerar API key'
      return { success: false, error: error.value }
    }
  }

  return {
    tenants,
    currentTenant,
    loading,
    error,
    fetchTenants,
    fetchTenant,
    createTenant,
    updateTenant,
    toggleActive,
    regenerateApiKey
  }
})
