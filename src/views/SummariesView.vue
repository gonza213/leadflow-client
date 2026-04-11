<script setup>
import { ref, onMounted } from 'vue'
import { summaryApi } from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const summaries = ref([])
const loading = ref(false)
const error = ref('')
const selectedSummary = ref(null)
const pagination = ref({ page: 1, pages: 1, total: 0 })
const currentPage = ref(1)
const triggering = ref(false)
const triggerError = ref('')
const triggerSuccess = ref('')

const handleTrigger = async () => {
  triggering.value = true
  triggerError.value = ''
  triggerSuccess.value = ''
  try {
    await summaryApi.trigger(authStore.tenantSlug)
    triggerSuccess.value = 'Resumen generado correctamente'
    setTimeout(() => triggerSuccess.value = '', 4000)
    await fetchSummaries(1)
  } catch (e) {
    triggerError.value = e.response?.data?.message || 'Error al generar el resumen'
    setTimeout(() => triggerError.value = '', 4000)
  } finally {
    triggering.value = false
  }
}

const fetchSummaries = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const res = await summaryApi.getAll(authStore.tenantSlug, { page, limit: 10 })
    summaries.value = res.data.summaries
    pagination.value = res.data.pagination
    currentPage.value = page
  } catch (e) {
    error.value = 'Error al cargar los resúmenes'
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchSummaries())

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatDateShort = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const frequencyLabel = (f) => f === 'weekly' ? 'Semanal' : 'Diario'
const frequencyColor = (f) => f === 'weekly'
  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'

const downloadPdf = (summary) => {
  const printWindow = window.open('', '_blank')
  const date = formatDate(summary.createdAt)
  const m = summary.metrics || {}

  const equiposHtml = m.leadsPorEquipo
    ? Object.entries(m.leadsPorEquipo).map(([eq, n]) => `<span class="tag">${eq}: <strong>${n}</strong></span>`).join('')
    : '—'

  const etapasHtml = m.leadsPorEtapa
    ? Object.entries(m.leadsPorEtapa).map(([et, n]) => `<span class="tag">${et}: <strong>${n}</strong></span>`).join('')
    : '—'

  const limiteHtml = m.vendedoresCercaLimite?.length
    ? m.vendedoresCercaLimite.map(v => `<span class="tag alert">${v.nombre} (${v.pct}%)</span>`).join('')
    : '<span class="ok">Ninguno</span>'

  printWindow.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Resumen LeadDistro — ${formatDateShort(summary.createdAt)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #6366f1; }
    .logo { font-size: 22px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
    .logo span { color: #1e293b; }
    .meta { text-align: right; }
    .meta .date { font-size: 13px; color: #64748b; margin-bottom: 4px; }
    .meta .badge { display: inline-block; background: #ede9fe; color: #7c3aed; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 99px; }
    h2 { font-size: 15px; font-weight: 700; color: #374151; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-box { background: #f8fafc; border-left: 4px solid #6366f1; padding: 18px 20px; border-radius: 0 8px 8px 0; margin-bottom: 28px; font-size: 15px; line-height: 1.8; color: #1e293b; }
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
    .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; }
    .metric-card .num { font-size: 28px; font-weight: 800; color: #6366f1; }
    .metric-card .lbl { font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px; }
    .section { margin-bottom: 20px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .tag { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 99px; font-size: 12px; color: #475569; }
    .tag.alert { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
    .ok { color: #16a34a; font-size: 13px; font-weight: 500; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 20px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Lead<span>Distro</span></div>
    <div class="meta">
      <div class="date">${date}</div>
      <span class="badge">${frequencyLabel(summary.frequency)}</span>
    </div>
  </div>

  <h2>Resumen generado por IA</h2>
  <div class="summary-box">${summary.summary}</div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="num">${m.totalHoy ?? '—'}</div>
      <div class="lbl">Leads del período</div>
    </div>
    <div class="metric-card">
      <div class="num">${m.leadsInactivos ?? '—'}</div>
      <div class="lbl">Sin actividad +48hs</div>
    </div>
    <div class="metric-card">
      <div class="num">${m.mejorVendedor?.cantidad ?? '—'}</div>
      <div class="lbl">Mejor vendedor: ${m.mejorVendedor?.nombre ?? '—'}</div>
    </div>
  </div>

  <div class="section">
    <h2>Por equipo</h2>
    <div class="tags">${equiposHtml}</div>
  </div>

  <div class="section">
    <h2>Por etapa</h2>
    <div class="tags">${etapasHtml}</div>
  </div>

  <div class="section">
    <h2>Vendedores cerca del límite (≥80%)</h2>
    <div class="tags">${limiteHtml}</div>
  </div>

  <div class="footer">Generado por LeadDistro · ${date}</div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`)
  printWindow.document.close()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Resúmenes IA</h1>
      <button
        @click="handleTrigger"
        :disabled="triggering"
        class="btn btn-primary flex items-center gap-2 text-sm"
      >
        <svg v-if="!triggering" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
        </svg>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        {{ triggering ? 'Generando...' : 'Generar ahora' }}
      </button>
    </div>

    <!-- Feedback trigger -->
    <div v-if="triggerSuccess" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm">
      ✓ {{ triggerSuccess }}
    </div>
    <div v-if="triggerError" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ triggerError }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card text-center py-12">
      <p class="text-red-500">{{ error }}</p>
      <button @click="fetchSummaries()" class="btn btn-primary mt-4">Reintentar</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!summaries.length" class="card text-center py-16">
      <div class="text-5xl mb-4">🤖</div>
      <p class="text-gray-500 dark:text-gray-400 font-medium mb-1">Todavía no hay resúmenes generados</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">Configurá el resumen automático en <strong>Configuración → Resumen IA</strong></p>
    </div>

    <!-- Lista -->
    <div v-else class="space-y-4">
      <div
        v-for="s in summaries"
        :key="s._id"
        class="card hover:shadow-md transition-shadow cursor-pointer"
        @click="selectedSummary = selectedSummary?._id === s._id ? null : s"
      >
        <!-- Header de la card -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.97 3.97 0 0114 16.96V17a2 2 0 11-4 0v-.04a3.97 3.97 0 01-1.071-2.713l-.347-.347z" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 dark:text-white">{{ formatDateShort(s.createdAt) }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ s.summary.slice(0, 100) }}...</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', frequencyColor(s.frequency)]">
              {{ frequencyLabel(s.frequency) }}
            </span>
            <button
              @click.stop="downloadPdf(s)"
              class="btn btn-secondary text-xs py-1 px-3"
              title="Descargar PDF"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        <!-- Detalle expandido -->
        <div v-if="selectedSummary?._id === s._id" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <!-- Resumen IA -->
          <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-4 border-primary-500">
            <p class="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">Resumen generado por IA</p>
            <p class="text-sm text-primary-900 dark:text-primary-200 leading-relaxed">{{ s.summary }}</p>
          </div>

          <!-- Métricas -->
          <div v-if="s.metrics" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ s.metrics.totalHoy ?? '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Leads del período</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ s.metrics.leadsInactivos ?? '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sin actividad +48hs</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ s.metrics.mejorVendedor?.cantidad ?? '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ s.metrics.mejorVendedor?.nombre ?? 'Mejor vendedor' }}</p>
            </div>
          </div>

          <!-- Por equipo y etapa -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-if="s.metrics?.leadsPorEquipo">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Por equipo</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(n, eq) in s.metrics.leadsPorEquipo" :key="eq"
                  class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                >
                  {{ eq }}: <strong>{{ n }}</strong>
                </span>
              </div>
            </div>
            <div v-if="s.metrics?.leadsPorEtapa">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Por etapa</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(n, et) in s.metrics.leadsPorEtapa" :key="et"
                  class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                >
                  {{ et }}: <strong>{{ n }}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Vendedores cerca del límite -->
          <div v-if="s.metrics?.vendedoresCercaLimite?.length">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Vendedores cerca del límite</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="v in s.metrics.vendedoresCercaLimite" :key="v.nombre"
                class="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full"
              >
                {{ v.nombre }} ({{ v.pct }}%)
              </span>
            </div>
          </div>

          <p class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(s.createdAt) }}</p>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="pagination.pages > 1" class="flex justify-center gap-2 pt-2">
        <button
          @click="fetchSummaries(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
        >&lsaquo;</button>
        <span class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
          {{ currentPage }} / {{ pagination.pages }}
        </span>
        <button
          @click="fetchSummaries(currentPage + 1)"
          :disabled="currentPage === pagination.pages"
          class="px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
        >&rsaquo;</button>
      </div>
    </div>
  </div>
</template>
