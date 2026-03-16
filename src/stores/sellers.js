import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sellersApi } from '../services/api'
import { useAuthStore } from './auth'

export const useSellersStore = defineStore('sellers', () => {
  const authStore = useAuthStore()

  const sellers = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchSellers(team = null) {
    if (!authStore.tenantSlug) return

    loading.value = true
    error.value = null

    try {
      const params = team ? { team } : {}
      const response = await sellersApi.getAll(authStore.tenantSlug, params)
      sellers.value = response.data.sellers
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar vendedores'
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(sellerId) {
    const seller = sellers.value.find(s => s._id === sellerId)
    if (!seller) return

    try {
      await sellersApi.update(authStore.tenantSlug, sellerId, {
        active: !seller.active
      })
      seller.active = !seller.active
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar vendedor'
    }
  }

  async function updateSeller(sellerId, data) {
    try {
      const response = await sellersApi.update(authStore.tenantSlug, sellerId, data)
      const index = sellers.value.findIndex(s => s._id === sellerId)
      if (index !== -1) {
        sellers.value[index] = { ...sellers.value[index], ...response.data.seller }
      }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar vendedor'
      return { success: false, error: error.value }
    }
  }

  async function createSeller(data) {
    try {
      const response = await sellersApi.create(authStore.tenantSlug, data)
      sellers.value.push(response.data.seller)
      return { success: true, seller: response.data.seller }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear vendedor'
      return { success: false, error: error.value }
    }
  }

  async function deleteSeller(sellerId) {
    try {
      await sellersApi.delete(authStore.tenantSlug, sellerId)
      sellers.value = sellers.value.filter(s => s._id !== sellerId)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar vendedor'
      return { success: false, error: error.value }
    }
  }

  return {
    sellers,
    loading,
    error,
    fetchSellers,
    toggleActive,
    updateSeller,
    createSeller,
    deleteSeller
  }
})
