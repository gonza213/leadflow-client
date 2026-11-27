import { defineStore } from 'pinia'
import { ref } from 'vue'
import { appointmentsApi } from '../services/api'
import { useAuthStore } from './auth'

// Citas del calendario (rango visible) y citas de un lead (ficha del pipeline)
export const useAppointmentsStore = defineStore('appointments', () => {
  const authStore = useAuthStore()

  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  let lastRequest = 0

  const sortByStart = (list) => [...list].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))

  async function fetchRange(from, to, filters = {}) {
    if (!authStore.tenantSlug) return { success: false }
    const request = ++lastRequest
    loading.value = true
    error.value = null
    try {
      const params = { from: from.toISOString(), to: to.toISOString() }
      if (filters.seller_id) params.seller_id = filters.seller_id
      const { data } = await appointmentsApi.list(authStore.tenantSlug, params)
      // Si mientras tanto se pidió otro rango u otro vendedor, se descarta esta respuesta
      if (request !== lastRequest) return { success: true }
      items.value = sortByStart(data.appointments)
      return { success: true }
    } catch (err) {
      if (request === lastRequest) error.value = err.response?.data?.message || 'error'
      return { success: false }
    } finally {
      if (request === lastRequest) loading.value = false
    }
  }

  // Citas de un lead (desde ahora hasta 62 días)
  async function fetchForLead(leadId) {
    if (!authStore.tenantSlug) return { success: false, appointments: [] }
    try {
      const from = new Date(Date.now() - 60 * 60 * 1000)
      const to = new Date(from.getTime() + 61 * 24 * 60 * 60 * 1000)
      const { data } = await appointmentsApi.list(authStore.tenantSlug, {
        from: from.toISOString(), to: to.toISOString(), lead_id: leadId
      })
      return { success: true, appointments: sortByStart(data.appointments) }
    } catch {
      return { success: false, appointments: [] }
    }
  }

  const upsertLocal = (appt) => {
    const i = items.value.findIndex(a => a._id === appt._id)
    if (i >= 0) items.value.splice(i, 1, appt)
    else items.value.push(appt)
    items.value = sortByStart(items.value)
  }

  async function create(payload) {
    try {
      const { data } = await appointmentsApi.create(authStore.tenantSlug, payload)
      upsertLocal(data.appointment)
      return { success: true, appointment: data.appointment, overlaps: data.overlaps || [] }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'error' }
    }
  }

  async function update(id, payload) {
    // Optimista: el cambio se ve al instante y se revierte si falla
    const prev = items.value.find(a => a._id === id)
    if (prev) upsertLocal({ ...prev, ...payload })
    try {
      const { data } = await appointmentsApi.update(authStore.tenantSlug, id, payload)
      upsertLocal(data.appointment)
      return { success: true, appointment: data.appointment, overlaps: data.overlaps || [] }
    } catch (err) {
      if (prev) upsertLocal(prev)
      return { success: false, error: err.response?.data?.message || 'error' }
    }
  }

  async function remove(id) {
    const prev = items.value
    items.value = items.value.filter(a => a._id !== id)
    try {
      await appointmentsApi.remove(authStore.tenantSlug, id)
      return { success: true }
    } catch (err) {
      items.value = prev
      return { success: false, error: err.response?.data?.message || 'error' }
    }
  }

  return { items, loading, error, fetchRange, fetchForLead, create, update, remove }
})
