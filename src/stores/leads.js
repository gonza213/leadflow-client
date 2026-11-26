import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { leadsApi } from '../services/api'

// Helpers CSV
const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}`
  }
  return str
}

const downloadCsv = (filename, rows) => {
  const csv = rows.map(row => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
import { useAuthStore } from './auth'
import { useConfigStore } from './config'

// Máximo de leads por pedido que acepta el servidor
const PAGE_LIMIT = 200

// Columna del pipeline para los leads cuya etapa no está configurada
export const OTHER_STAGES = '__other_stages__'

export const useLeadsStore = defineStore('leads', () => {
  const authStore = useAuthStore()

  // Report data (dashboard)
  const reportData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    fecha_inicio: '',
    fecha_fin: '',
    equipo: '',
    usuario: '',
    opportunity_stage: ''
  })

  const totalLeads = computed(() => reportData.value?.total_leads || 0)
  const sellers = computed(() => reportData.value?.sellers || [])
  const stages = computed(() => reportData.value?.stages || [])
  const states = computed(() => reportData.value?.states || [])
  const teams = computed(() => reportData.value?.teams || [])
  const leads = computed(() => reportData.value?.leads || [])
  const topSeller = computed(() => reportData.value?.top_seller || null)

  // Next assignment preview
  const nextAssignment = ref(null)
  const nextTeam = computed(() => nextAssignment.value?.nextTeam || null)
  const nextSeller = computed(() => nextAssignment.value?.nextSeller || null)

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
      if (filters.value.equipo) params.equipo = filters.value.equipo
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
      equipo: '',
      usuario: '',
      opportunity_stage: ''
    }
  }

  async function fetchNextAssignment() {
    if (!authStore.tenantSlug) return

    try {
      const response = await leadsApi.getNextAssignment(authStore.tenantSlug)
      nextAssignment.value = response.data.data
    } catch (err) {
      console.error('Error fetching next assignment:', err)
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

  /**
   * Inicializa los filtros del dashboard con el período configurado.
   * Llamar después de fetchConfig() al montar el Dashboard.
   */
  function initPeriodFilters(config) {
    if (!config) return

    let start, end
    const timezone = config.timezone || 'America/Chicago'

    if (config.week_start_day !== null && config.week_start_day !== undefined) {
      // Modo automático: calcular semana actual en la timezone del tenant (no del browser)
      const now = new Date()

      // Obtener la fecha actual en la timezone configurada del tenant
      const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(now) // "2026-04-06"

      // Día de semana en timezone del tenant (noon UTC = mismo día en cualquier timezone US)
      const todayDow = new Date(todayStr + 'T12:00:00Z').getDay()
      const daysDiff = (todayDow - config.week_start_day + 7) % 7

      // Calcular inicio y fin usando UTC para evitar desfase
      const startUtc = new Date(todayStr + 'T12:00:00Z')
      startUtc.setUTCDate(startUtc.getUTCDate() - daysDiff)
      const endUtc = new Date(startUtc)
      endUtc.setUTCDate(startUtc.getUTCDate() + 6)

      start = startUtc.toISOString().split('T')[0]
      end = endUtc.toISOString().split('T')[0]
    } else if (config.fecha_inicio && config.fecha_fin) {
      // Modo manual: extraer la fecha en UTC tal como fue guardada
      start = new Date(config.fecha_inicio).toISOString().split('T')[0]
      end = new Date(config.fecha_fin).toISOString().split('T')[0]
    } else {
      return
    }

    filters.value.fecha_inicio = start
    filters.value.fecha_fin = end
  }

  function resetLeadsFilters() {
    leadsFilters.fecha_inicio = ''
    leadsFilters.fecha_fin = ''
    leadsFilters.equipo = ''
    leadsFilters.seller_id = ''
    leadsFilters.opportunity_stage = ''
  }

  // Trae todos los leads de un filtro, de a páginas
  async function fetchAllLeads(filterParams) {
    const slug = authStore.tenantSlug
    const byId = new Map() // si entran leads nuevos entre páginas, no se duplican
    let page = 1
    let pages = 1
    do {
      const response = await leadsApi.getLeads(slug, { ...filterParams, page, limit: PAGE_LIMIT })
      response.data.data.leads.forEach(l => byId.set(l._id, l))
      pages = response.data.data.pagination.pages
      page++
    } while (page <= pages)
    return [...byId.values()]
  }

  // ===== Pipeline (kanban) =====
  const pipelineLeads = ref({})    // { [etapa]: lead[] }
  const pipelineTotals = ref({})   // total real por etapa (puede superar lo cargado)
  const pipelineLoading = ref(false)
  const pipelineError = ref(false)
  const pendingMoves = ref({})     // { [leadId]: true } mientras se guarda
  const unknownStages = ref([])    // [{ stage, count }] etapas sin configurar (managers)
  let pipelineRequest = 0
  let pipelineSlug = null

  async function fetchPipeline(pipelineFilters = {}) {
    const slug = authStore.tenantSlug
    if (!slug) return

    const configStore = useConfigStore()
    const request = ++pipelineRequest

    // Nunca mostrar leads de otra empresa mientras carga
    if (pipelineSlug !== slug) {
      pipelineLeads.value = {}
      pipelineTotals.value = {}
      unknownStages.value = []
      pipelineSlug = slug
    }

    pipelineLoading.value = true
    pipelineError.value = false

    try {
      const stageNames = configStore.config?.opportunity_stages || []
      const extra = Object.fromEntries(Object.entries(pipelineFilters).filter(([, v]) => v))

      const keys = [...stageNames, OTHER_STAGES]
      const results = await Promise.all(keys.map(key =>
        leadsApi.getLeads(slug, {
          ...extra,
          ...(key === OTHER_STAGES ? { other_stages: true } : { opportunity_stage: key }),
          limit: PAGE_LIMIT
        })
      ))
      if (request !== pipelineRequest) return // llegó una respuesta vieja

      pipelineLeads.value = Object.fromEntries(
        keys.map((key, i) => [key, results[i].data.data.leads])
      )
      pipelineTotals.value = Object.fromEntries(
        keys.map((key, i) => [key, results[i].data.data.pagination.total])
      )
      fetchUnknownStages()
    } catch (err) {
      if (request === pipelineRequest) pipelineError.value = true
    } finally {
      if (request === pipelineRequest) pipelineLoading.value = false
    }
  }

  // Solo informativo: si falla, el tablero sigue funcionando
  async function fetchUnknownStages() {
    const slug = authStore.tenantSlug
    if (!slug || !authStore.isManager) {
      unknownStages.value = []
      return
    }
    try {
      const response = await leadsApi.getUnknownStages(slug)
      if (slug === authStore.tenantSlug) unknownStages.value = response.data.stages
    } catch (err) {
      console.error('Error fetching unknown stages:', err)
    }
  }

  function findPipelineLead(leadId) {
    for (const [stage, list] of Object.entries(pipelineLeads.value)) {
      const lead = list.find(l => l._id === leadId)
      if (lead) return { lead, stage }
    }
    return null
  }

  // stageName: etapa real del lead (difiere de la columna en "Otras etapas")
  function placeLead(lead, fromStage, toStage, stageName = toStage) {
    const from = pipelineLeads.value[fromStage]
    const to = pipelineLeads.value[toStage]
    if (!from || !to) return false
    const index = from.findIndex(l => l._id === lead._id)
    if (index === -1) return false

    from.splice(index, 1)
    lead.opportunity_stage = stageName
    // Mantener el orden por fecha (más nuevos primero)
    const position = to.findIndex(l => new Date(l.date) < new Date(lead.date))
    to.splice(position === -1 ? to.length : position, 0, lead)
    pipelineTotals.value[fromStage]--
    pipelineTotals.value[toStage]++
    return true
  }

  function applyServerLead(leadId, saved) {
    const found = findPipelineLead(leadId)
    if (!found || !saved) return
    found.lead.value = saved.value
    found.lead.ai_score = saved.ai_score
    found.lead.stage_history = saved.stage_history
  }

  // Actualización optimista: primero se mueve en pantalla y si falla se revierte
  async function moveLead(leadId, fromStage, toStage) {
    // "Otras etapas" no es un destino válido
    if (fromStage === toStage || toStage === OTHER_STAGES || pendingMoves.value[leadId]) return { success: true }
    const found = findPipelineLead(leadId)
    const originalStage = found?.lead.opportunity_stage
    if (!found || !placeLead(found.lead, fromStage, toStage)) return { success: true }

    pendingMoves.value[leadId] = true
    const result = await editLead(leadId, { opportunity_stage: toStage })
    delete pendingMoves.value[leadId]

    if (result.success) {
      applyServerLead(leadId, result.lead)
      if (fromStage === OTHER_STAGES) fetchUnknownStages()
    } else {
      const current = findPipelineLead(leadId)
      if (current) placeLead(current.lead, current.stage, fromStage, originalStage)
    }
    return result
  }

  async function updateLeadValue(leadId, value) {
    const result = await editLead(leadId, { value })
    if (result.success) applyServerLead(leadId, result.lead)
    return result
  }

  // ===== Notas =====
  const notes = ref([])
  const notesLoading = ref(false)
  let notesLeadId = null

  async function fetchNotes(leadId) {
    if (!authStore.tenantSlug) return { success: false }
    notesLeadId = leadId
    notes.value = []
    notesLoading.value = true
    try {
      const response = await leadsApi.getNotes(authStore.tenantSlug, leadId)
      if (notesLeadId === leadId) notes.value = response.data.notes
      return { success: true }
    } catch (err) {
      return { success: false }
    } finally {
      if (notesLeadId === leadId) notesLoading.value = false
    }
  }

  async function addNote(leadId, text) {
    try {
      const response = await leadsApi.addNote(authStore.tenantSlug, leadId, text)
      if (notesLeadId === leadId) notes.value.unshift(response.data.note)
      return { success: true }
    } catch (err) {
      return { success: false }
    }
  }

  async function deleteNote(leadId, noteId) {
    try {
      await leadsApi.deleteNote(authStore.tenantSlug, leadId, noteId)
      notes.value = notes.value.filter(n => n._id !== noteId)
      return { success: true }
    } catch (err) {
      return { success: false }
    }
  }

  async function editLead(id, data) {
    if (!authStore.tenantSlug) return { success: false, error: 'No tenant' }

    try {
      const response = await leadsApi.editLead(authStore.tenantSlug, id, data)
      // Update local list
      const index = leadsList.value.findIndex(l => l._id === id)
      if (index !== -1) {
        leadsList.value[index] = { ...leadsList.value[index], ...data }
      }
      return { success: true, lead: response.data.lead }
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

  const exportLoading = ref(false)

  async function exportLeadsToCsv() {
    if (!authStore.tenantSlug) return
    exportLoading.value = true

    try {
      // Mismos filtros que la lista, trayendo todas las páginas
      const params = {}
      if (leadsFilters.fecha_inicio) params.fecha_inicio = leadsFilters.fecha_inicio
      if (leadsFilters.fecha_fin) params.fecha_fin = leadsFilters.fecha_fin
      if (leadsFilters.equipo) params.equipo = leadsFilters.equipo
      if (leadsFilters.seller_id) params.seller_id = leadsFilters.seller_id
      if (leadsFilters.opportunity_stage) params.opportunity_stage = leadsFilters.opportunity_stage

      const leads = await fetchAllLeads(params)

      const headers = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Estado', 'Equipo', 'Vendedor', 'Etapa', 'Source', 'Contact ID']
      const rows = leads.map(lead => [
        lead.date ? new Date(lead.date).toLocaleDateString('es-ES') : '',
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.state || '',
        lead.team || '',
        lead.seller_name || '',
        lead.opportunity_stage || '',
        lead.source || '',
        lead.contact_id || ''
      ])

      const date = new Date().toISOString().slice(0, 10)
      downloadCsv(`leads_${date}.csv`, [headers, ...rows])
    } catch (err) {
      console.error('Error exportando leads:', err)
    } finally {
      exportLoading.value = false
    }
  }

  async function exportLeadsToXlsx() {
    if (!authStore.tenantSlug) return
    exportLoading.value = true

    try {
      // Mismos filtros que la lista, trayendo todas las páginas
      const params = {}
      if (leadsFilters.fecha_inicio) params.fecha_inicio = leadsFilters.fecha_inicio
      if (leadsFilters.fecha_fin) params.fecha_fin = leadsFilters.fecha_fin
      if (leadsFilters.equipo) params.equipo = leadsFilters.equipo
      if (leadsFilters.seller_id) params.seller_id = leadsFilters.seller_id
      if (leadsFilters.opportunity_stage) params.opportunity_stage = leadsFilters.opportunity_stage

      const leads = await fetchAllLeads(params)

      const headers = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Estado', 'Equipo', 'Vendedor', 'Etapa', 'Source', 'Contact ID']
      const rows = leads.map(lead => [
        lead.date ? new Date(lead.date).toLocaleDateString('es-ES') : '',
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.state || '',
        lead.team || '',
        lead.seller_name || '',
        lead.opportunity_stage || '',
        lead.source || '',
        lead.contact_id || ''
      ])

      const { utils, writeFile } = await import('xlsx')
      const worksheet = utils.aoa_to_sheet([headers, ...rows])
      const workbook = utils.book_new()
      utils.book_append_sheet(workbook, worksheet, 'Leads')

      const date = new Date().toISOString().slice(0, 10)
      writeFile(workbook, `leads_${date}.xlsx`)
    } catch (err) {
      console.error('Error exportando leads a XLSX:', err)
    } finally {
      exportLoading.value = false
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
    states,
    teams,
    leads,
    topSeller,
    fetchReport,
    setFilter,
    resetFilters,
    // Next assignment
    nextAssignment,
    nextTeam,
    nextSeller,
    fetchNextAssignment,
    // Leads list
    leadsList,
    leadsLoading,
    leadsError,
    pagination,
    leadsFilters,
    fetchLeads,
    setLeadsFilter,
    resetLeadsFilters,
    initPeriodFilters,
    editLead,
    deleteLead,
    // Pipeline
    pipelineLeads,
    pipelineTotals,
    pipelineLoading,
    pipelineError,
    pendingMoves,
    unknownStages,
    fetchPipeline,
    moveLead,
    updateLeadValue,
    // Notas
    notes,
    notesLoading,
    fetchNotes,
    addNote,
    deleteNote,
    // Export
    exportLoading,
    exportLeadsToCsv,
    exportLeadsToXlsx
  }
})
