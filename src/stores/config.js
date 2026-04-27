import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { configApi } from '../services/api'
import { useAuthStore } from './auth'

export const useConfigStore = defineStore('config', () => {
  const authStore = useAuthStore()
  const config = ref(null)
  const loading = ref(false)

  const isPeriodExpired = computed(() => {
    if (!config.value?.fecha_fin) return false
    const now = new Date()
    const endDate = new Date(config.value.fecha_fin)
    // Compare dates ignoring time
    now.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)
    return endDate < now
  })

  async function fetchConfig() {
    if (!authStore.tenantSlug) return
    loading.value = true
    try {
      const response = await configApi.get(authStore.tenantSlug)
      config.value = response.data.config
    } catch (err) {
      console.error('Error fetching config:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    loading,
    isPeriodExpired,
    fetchConfig
  }
})
