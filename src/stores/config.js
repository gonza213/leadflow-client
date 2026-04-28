import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { configApi } from '../services/api'
import { useAuthStore } from './auth'

export const useConfigStore = defineStore('config', () => {
  const authStore = useAuthStore()
  const config = ref(null)
  const loading = ref(false)

  const isPeriodExpired = computed(() => {
    // Si el periodo es automático (week_start_day existe), no se considera "vencido" nunca
    if (config.value?.week_start_day !== null && config.value?.week_start_day !== undefined) {
      return false
    }
    
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

  async function updateConfig(data) {
    if (!authStore.tenantSlug) return
    try {
      await configApi.update(authStore.tenantSlug, data)
      await fetchConfig()
      return { success: true }
    } catch (err) {
      console.error('Error updating config:', err)
      return { success: false, error: err.response?.data?.message || 'Error updating configuration' }
    }
  }

  const updateTeams = (equipos) => updateConfig({ equipos })
  const updatePeriod = (data) => updateConfig(data)
  const updateStages = (opportunity_stages) => updateConfig({ opportunity_stages })
  const updateFallback = (fallback_seller_ids) => updateConfig({ fallback_seller_ids })
  const updateSummaryConfig = (data) => updateConfig(data)
  const updateGhlConfig = (data) => updateConfig(data)

  return {
    config,
    loading,
    isPeriodExpired,
    fetchConfig,
    updateTeams,
    updatePeriod,
    updateStages,
    updateFallback,
    updateSummaryConfig,
    updateGhlConfig
  }
})
