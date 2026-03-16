import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { leadsApi } from '../services/api'
import { useAuthStore } from './auth'

export const useLeadsStore = defineStore('leads', () => {
  const authStore = useAuthStore()

  // Report data (dashboard)
  const reportData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    fecha_inicio: '',
    fecha_fin: '',
    equipo: 'Todos',
    usuario: '',
    opportunity_stage: ''
  })

  const totalLeads = computed(() => reportData.value?.total_leads || 0)
  const sellers = computed(() => reportData.value?.sellers || [])
  const stages = computed(() => reportData.value?.stages || [])
  const leads = computed(() => reportData.value?.leads || [])

  // Leads list (paginated)
  const leadsList = ref([])
  const leadsLoading = ref(false)
  const leadsError = ref(null)
  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const leadsFilters = reactive({
    fecha_inicio: '',
    fecha_fin: '',
    equipo: '',
    seller_id: '',
    opportunity_stage: ''
  })

  async function fetchReport() {
    if (!authStore.tenantSlug) return

    loading.value = true
    error.value = null

    try {
      const params = {}
      if (filters.value.fecha_inicio) params.fecha_inicio = filters.value.fecha_inicio
      if (filters.value.fecha_fin) params.fecha_fin = filters.value.fecha_fin
      if (filters.value.equipo && filters.value.equipo !== 'Todos') params.equipo = filters.value.equipo
      if (filters.value.usuario) params.usuario = filters.value.usuario
      if (filters.value.opportunity_stage) params.opportunity_stage = filters.value.opportunity_stage

      const response = await leadsApi.getReport(authStore.tenantSlug, params)
      reportData.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar el reporte'
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    filters.value[key] = value
  }

  function resetFilters() {
    filters.value = {
      fecha_inicio: '',
      fecha_fin: '',
      equipo: 'Todos',
      usuario: '',
      opportunity_stage: ''
    }
  }

  // Leads list functions
  async function fetchLeads(page = 1) {
    if (!authStore.tenantSlug) return

    leadsLoading.value = true
    leadsError.value = null

    try {
      const params = {
        page,
        limit: pagination.limit
      }

      if (leadsFilters.fecha_inicio) params.fecha_inicio = leadsFilters.fecha_inicio
      if (leadsFilters.fecha_fin) params.fecha_fin = leadsFilters.fecha_fin
      if (leadsFilters.equipo) params.equipo = leadsFilters.equipo
      if (leadsFilters.seller_id) params.seller_id = leadsFilters.seller_id
      if (leadsFilters.opportunity_stage) params.opportunity_stage = leadsFilters.opportunity_stage

      const response = await leadsApi.getLeads(authStore.tenantSlug, params)
      leadsList.value = response.data.data.leads
      pagination.page = response.data.data.pagination.page
      pagination.total = response.data.data.pagination.total
      pagination.pages = response.data.data.pagination.pages
    } catch (err) {
      leadsError.value = err.response?.data?.message || 'Error al cargar leads'
    } finally {
      leadsLoading.value = false
    }
  }

  function setLeadsFilter(key, value) {
    leadsFilters[key] = value
  }

  function resetLeadsFilters() {
    leadsFilters.fecha_inicio = ''
    leadsFilters.fecha_fin = ''
    leadsFilters.equipo = ''
    leadsFilters.seller_id = ''
    leadsFilters.opportunity_stage = ''
  }

  async function editLead(id, data) {
    if (!authStore.tenantSlug) return { success: false, error: 'No tenant' }

    try {
      await leadsApi.editLead(authStore.tenantSlug, id, data)
      // Update local list
      const index = leadsList.value.findIndex(l => l._id === id)
      if (index !== -1) {
        leadsList.value[index] = { ...leadsList.value[index], ...data }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al editar lead' }
    }
  }

  async function deleteLead(id) {
    if (!authStore.tenantSlug) return { success: false, error: 'No tenant' }

    try {
      await leadsApi.deleteLead(authStore.tenantSlug, id)
      // Remove from local list
      leadsList.value = leadsList.value.filter(l => l._id !== id)
      pagination.total--
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al eliminar lead' }
    }
  }

  return {
    // Report
    reportData,
    loading,
    error,
    filters,
    totalLeads,
    sellers,
    stages,
    leads,
    fetchReport,
    setFilter,
    resetFilters,
    // Leads list
    leadsList,
    leadsLoading,
    leadsError,
    pagination,
    leadsFilters,
    fetchLeads,
    setLeadsFilter,
    resetLeadsFilters,
    editLead,
    deleteLead
  }
})
