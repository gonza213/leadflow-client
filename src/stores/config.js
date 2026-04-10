import { defineStore } from 'pinia'
import { ref } from 'vue'
import { configApi } from '../services/api'
import { useAuthStore } from './auth'

export const useConfigStore = defineStore('config', () => {
  const authStore = useAuthStore()

  const config = ref(null)
  const loading = ref(false)  // solo para el fetch inicial
  const saving = ref(false)   // para operaciones de guardado (no oculta el componente)
  const error = ref(null)

  async function fetchConfig() {
    if (!authStore.tenantSlug) return

    loading.value = true
    error.value = null

    try {
      const response = await configApi.get(authStore.tenantSlug)
      config.value = response.data.config
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar configuración'
    } finally {
      loading.value = false
    }
  }

  async function updateConfig(data) {
    if (!authStore.tenantSlug) return { success: false, error: 'No tenant' }

    saving.value = true
    error.value = null

    try {
      const response = await configApi.update(authStore.tenantSlug, data)
      config.value = response.data.config
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar configuración'
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  async function updateTeams(equipos) {
    return updateConfig({ equipos })
  }

  async function updatePeriod(data) {
    return updateConfig(data)
  }

  async function updateStages(opportunity_stages) {
    return updateConfig({ opportunity_stages })
  }

  async function updateGhlWebhook(ghl_webhook_url) {
    return updateConfig({ ghl_webhook_url })
  }

  async function updateGhlConfig({ ghl_webhook_url, timezone }) {
    return updateConfig({ ghl_webhook_url, timezone })
  }

  async function updateFallback(fallback_seller_ids) {
    const ids = Array.isArray(fallback_seller_ids)
      ? fallback_seller_ids.filter(id => id && id !== '')
      : []
    return updateConfig({ fallback_seller_ids: ids })
  }

  async function updateSummaryConfig(data) {
    return updateConfig(data)
  }

  return {
    config,
    loading,
    saving,
    error,
    fetchConfig,
    updateConfig,
    updateTeams,
    updatePeriod,
    updateStages,
    updateGhlWebhook,
    updateGhlConfig,
    updateFallback,
    updateSummaryConfig
  }
})
