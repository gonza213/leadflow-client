<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLeadsStore, OTHER_STAGES } from '../stores/leads'
import { useConfigStore } from '../stores/config'
import { useSellersStore } from '../stores/sellers'
import { useAuthStore } from '../stores/auth'

const leadsStore = useLeadsStore()
const configStore = useConfigStore()
const sellersStore = useSellersStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

// El viewer solo mira
const canWork = computed(() =>
  ['superadmin', 'adminclient', 'manager', 'seller'].includes(authStore.userRole)
)

const filters = reactive({ equipo: '', seller_id: '' })
const search = ref('')

const stages = computed(() => configStore.config?.opportunity_stages || [])

// ===== Aviso de error (toast) =====
const toast = ref('')
let toastTimer = null
const showError = (key) => {
  toast.value = t(`pipeline.errors.${key}`)
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 4000)
}

// ===== Columnas =====
const digits = (text) => String(text || '').replace(/\D/g, '')

const matchesSearch = (lead) => {
  const term = search.value.trim().toLowerCase()
  if (!term) return true
  if ((lead.name || '').toLowerCase().includes(term)) return true
  const phoneTerm = digits(term)
  return !!phoneTerm && digits(lead.phone).includes(phoneTerm)
}

const stageName = (name) => name || t('pipeline.noStage')

const buildColumn = (stage) => {
  const all = leadsStore.pipelineLeads[stage] || []
  const leads = all.filter(matchesSearch)
  const total = leadsStore.pipelineTotals[stage] || 0
  const withValue = leads.filter(l => typeof l.value === 'number')
  return {
    stage,
    isOther: stage === OTHER_STAGES,
    title: stage === OTHER_STAGES ? t('pipeline.otherStages') : stage,
    leads,
    count: search.value.trim() ? leads.length : total,
    sum: withValue.length ? withValue.reduce((acc, l) => acc + l.value, 0) : null,
    loaded: all.length,
    total
  }
}

// "Otras etapas" va al final y solo si hay leads sin columna
const columns = computed(() => {
  const list = stages.value.map(buildColumn)
  const other = buildColumn(OTHER_STAGES)
  return other.total > 0 ? [...list, other] : list
})

const isEmpty = computed(() => columns.value.every(c => c.total === 0))

const load = () => leadsStore.fetchPipeline(authStore.isManager ? { ...filters } : {})

// ===== Formatos =====
const intlLocale = computed(() => ({ es: 'es-AR', en: 'en-US' }[locale.value] || locale.value))
const formatNumber = (n) => new Intl.NumberFormat(intlLocale.value, { maximumFractionDigits: 2 }).format(n)

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat(intlLocale.value, {
    timeZone: configStore.config?.timezone || 'America/Chicago',
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}

// "hace 3 días", en el idioma activo
const age = (date) => {
  if (!date) return ''
  const seconds = Math.min(0, (new Date(date) - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(intlLocale.value, { numeric: 'auto' })
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]
  const [unit, size] = units.find(([, s]) => Math.abs(seconds) >= s) || ['minute', 60]
  return formatter.format(Math.trunc(seconds / size), unit)
}

const scoreClass = (score) =>
  score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
    : score >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'

// ===== Arrastrar y soltar (API nativa) =====
const dragging = ref(null) // { id, from }
const dragOver = ref(null)

const onDragStart = (event, lead, stage) => {
  dragging.value = { id: lead._id, from: stage }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', lead._id) // Firefox lo exige
}
const onDragOver = (event, stage) => {
  // Sin preventDefault el navegador no permite soltar
  if (!dragging.value || stage === OTHER_STAGES) {
    dragOver.value = null
    return
  }
  event.preventDefault()
  dragOver.value = stage
}
const onDragEnd = () => {
  dragging.value = null
  dragOver.value = null
}
const onDrop = async (stage) => {
  const drag = dragging.value
  onDragEnd()
  if (drag) await move(drag.id, drag.from, stage)
}

const move = async (leadId, from, to) => {
  const result = await leadsStore.moveLead(leadId, from, to)
  if (!result.success) showError('move')
  return result
}

// ===== Ficha lateral =====
const selectedId = ref(null)
const selected = computed(() => {
  if (!selectedId.value) return null
  for (const [stage, list] of Object.entries(leadsStore.pipelineLeads)) {
    const lead = list.find(l => l._id === selectedId.value)
    if (lead) return { lead, stage }
  }
  return null
})

const valueDraft = ref('')
const savingValue = ref(false)
const noteText = ref('')
const savingNote = ref(false)

const history = computed(() => [...(selected.value?.lead.stage_history || [])].reverse())

const openLead = async (lead) => {
  selectedId.value = lead._id
  valueDraft.value = lead.value ?? ''
  noteText.value = ''
  const result = await leadsStore.fetchNotes(lead._id)
  if (!result.success && selectedId.value === lead._id) showError('notesLoad')
}
const closeLead = () => { selectedId.value = null }

const onStageSelect = async (event) => {
  const { lead, stage } = selected.value
  const result = await move(lead._id, stage, event.target.value)
  if (!result.success) event.target.value = stage
}

const valueChanged = computed(() => {
  const draft = valueDraft.value === '' ? null : Number(valueDraft.value)
  return draft !== (selected.value?.lead.value ?? null)
})

const saveValue = async () => {
  const value = valueDraft.value === '' ? null : Number(valueDraft.value)
  if (value !== null && !(Number.isFinite(value) && value >= 0)) return showError('invalidValue')
  savingValue.value = true
  const result = await leadsStore.updateLeadValue(selectedId.value, value)
  savingValue.value = false
  if (!result.success) showError('value')
}

const addNote = async () => {
  const text = noteText.value.trim()
  if (!text) return
  const leadId = selectedId.value
  savingNote.value = true
  const result = await leadsStore.addNote(leadId, text)
  savingNote.value = false
  if (!result.success) return showError('noteAdd')
  if (selectedId.value === leadId) noteText.value = ''
}

const canDeleteNote = (note) =>
  canWork.value && (authStore.isManager || note.authorId === authStore.user?.id)

const removeNote = async (note) => {
  if (!window.confirm(t('pipeline.notes.confirmDelete'))) return
  const result = await leadsStore.deleteNote(selectedId.value, note._id)
  if (!result.success) showError('noteDelete')
}

// Si los filtros dejan afuera al lead abierto, cerrar la ficha
watch(selected, (value) => { if (!value) selectedId.value = null })

const onKeydown = (event) => { if (event.key === 'Escape') closeLead() }

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  await configStore.fetchConfig()
  if (authStore.isManager) sellersStore.fetchSellers()
  await load()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(toastTimer)
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('pipeline.title') }}</h1>
      <span v-if="!canWork" class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
        {{ t('pipeline.readOnly') }}
      </span>
    </div>

    <!-- Aviso: sin sincronización bidireccional con el CRM -->
    <div
      v-if="configStore.config?.ghl_webhook_url"
      class="px-4 py-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-800 dark:text-yellow-300"
    >
      {{ t('pipeline.crmWarning') }}
    </div>

    <!-- Aviso a managers: etapas de los leads que no están configuradas -->
    <div
      v-if="authStore.isManager && leadsStore.unknownStages.length"
      class="px-4 py-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-800 dark:text-yellow-300"
    >
      <p class="font-semibold">{{ t('pipeline.unknownStages.title') }}</p>
      <ul class="flex flex-wrap gap-2 my-2">
        <li v-for="item in leadsStore.unknownStages" :key="String(item.stage)" class="px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800 text-xs whitespace-pre-wrap">
          {{ stageName(item.stage) }} ({{ item.count }})
        </li>
      </ul>
      <router-link :to="{ path: '/config', query: { tab: 'stages' } }" class="font-semibold underline">
        {{ t('pipeline.unknownStages.link') }}
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="card p-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="col-span-2">
          <input v-model="search" type="search" class="input text-sm" :placeholder="t('pipeline.searchPlaceholder')" :aria-label="t('pipeline.searchPlaceholder')" />
        </div>
        <template v-if="authStore.isManager">
          <select v-model="filters.equipo" class="input text-sm" :aria-label="t('dashboard.filters.team')" @change="load">
            <option value="">{{ t('dashboard.filters.team') }}: {{ t('dashboard.filters.all') }}</option>
            <option v-for="equipo in configStore.config?.equipos || []" :key="equipo.nombre" :value="equipo.nombre">
              {{ equipo.nombre }}
            </option>
          </select>
          <!-- El servidor prioriza el equipo sobre el vendedor: se elige uno u otro -->
          <select v-model="filters.seller_id" class="input text-sm disabled:opacity-50" :disabled="!!filters.equipo" :aria-label="t('dashboard.filters.seller')" @change="load">
            <option value="">{{ t('dashboard.filters.seller') }}: {{ t('dashboard.filters.all') }}</option>
            <option v-for="seller in sellersStore.sellers" :key="seller._id" :value="seller._id">
              {{ seller.seller_name }}
            </option>
          </select>
        </template>
      </div>
    </div>

    <!-- Error -->
    <div v-if="leadsStore.pipelineError" class="card text-center py-12">
      <p class="text-red-500">{{ t('pipeline.errors.load') }}</p>
      <button @click="load" class="btn btn-primary mt-4">{{ t('common.retry') }}</button>
    </div>

    <!-- Loading -->
    <div v-else-if="leadsStore.pipelineLoading || configStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <p v-if="isEmpty" class="text-sm text-gray-500 dark:text-gray-400">{{ t('pipeline.empty') }}</p>

      <!-- Tablero -->
      <div class="flex gap-3 overflow-x-auto pb-3 snap-x sm:snap-none">
        <section
          v-for="column in columns"
          :key="column.stage"
          class="flex flex-col flex-shrink-0 w-[80vw] max-w-xs sm:w-72 snap-start rounded-2xl border bg-gray-100/70 dark:bg-gray-900 transition-colors"
          :class="dragOver === column.stage ? 'border-primary-500 ring-2 ring-primary-300' : 'border-gray-200 dark:border-gray-700'"
          @dragover="onDragOver($event, column.stage)"
          @drop.prevent="onDrop(column.stage)"
        >
          <header class="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white truncate" :title="column.title">{{ column.title }}</h2>
              <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300" :title="t('pipeline.columns.count', { n: column.count })">
                {{ column.count }}
              </span>
            </div>
            <p v-if="column.sum !== null" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('pipeline.columns.total') }}: {{ formatNumber(column.sum) }}
            </p>
            <p v-if="column.total > column.loaded" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('pipeline.columns.truncated', { shown: column.loaded, total: column.total }) }}
            </p>
          </header>

          <div class="flex-1 min-h-[8rem] max-h-[65vh] overflow-y-auto p-2 space-y-2">
            <article
              v-for="lead in column.leads"
              :key="lead._id"
              :draggable="canWork && !leadsStore.pendingMoves[lead._id]"
              tabindex="0"
              role="button"
              class="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              :class="[
                canWork ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                { 'opacity-50': dragging?.id === lead._id || leadsStore.pendingMoves[lead._id] }
              ]"
              @dragstart="onDragStart($event, lead, column.stage)"
              @dragend="onDragEnd"
              @click="openLead(lead)"
              @keydown.enter="openLead(lead)"
              @keydown.space.prevent="openLead(lead)"
            >
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-gray-900 dark:text-white break-words min-w-0">{{ lead.name }}</p>
                <span v-if="lead.ai_score !== null && lead.ai_score !== undefined" :class="['px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap', scoreClass(lead.ai_score)]">
                  AI: {{ lead.ai_score }}
                </span>
              </div>
              <p v-if="lead.phone" class="text-xs text-gray-600 dark:text-gray-300">{{ lead.phone }}</p>
              <p v-if="column.isOther" class="mt-1">
                <span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 break-all">
                  {{ stageName(lead.opportunity_stage) }}
                </span>
              </p>
              <p v-if="authStore.isManager && lead.seller_name" class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ lead.seller_name }}</p>
              <div class="mt-2 flex items-center justify-between gap-2 text-xs text-gray-400">
                <span class="truncate">{{ lead.source }}</span>
                <span class="whitespace-nowrap">{{ age(lead.date) }}</span>
              </div>
            </article>

            <p v-if="column.leads.length === 0" class="py-6 text-center text-xs text-gray-400">{{ t('pipeline.emptyColumn') }}</p>
          </div>
        </section>
      </div>
    </template>

    <!-- Ficha lateral -->
    <div v-if="selected" class="fixed inset-0 !mt-0 z-[60] flex justify-end bg-black/50" @click.self="closeLead">
      <aside class="w-full sm:max-w-md h-full overflow-y-auto bg-white dark:bg-gray-800 shadow-xl" role="dialog" aria-modal="true" :aria-label="t('pipeline.detail.title')">
        <div class="sticky top-0 flex items-center justify-between gap-3 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">{{ selected.lead.name }}</h3>
          <button @click="closeLead" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" :aria-label="t('pipeline.detail.close')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-4 space-y-6">
          <!-- Contacto -->
          <section>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ t('pipeline.detail.contact') }}</h4>
            <dl class="text-sm space-y-1">
              <div v-for="row in [
                [t('leads.table.phone'), selected.lead.phone],
                [t('leads.table.email'), selected.lead.email],
                [t('leads.table.source'), selected.lead.source],
                [t('leads.table.seller'), selected.lead.seller_name],
                [t('pipeline.detail.date'), formatDate(selected.lead.date)]
              ]" :key="row[0]" class="flex justify-between gap-4">
                <dt class="text-gray-500 dark:text-gray-400">{{ row[0] }}</dt>
                <dd class="text-gray-900 dark:text-white text-right break-all">{{ row[1] || '-' }}</dd>
              </div>
            </dl>
            <div v-if="digits(selected.lead.phone)" class="grid grid-cols-2 gap-2 mt-3">
              <a :href="`https://wa.me/${digits(selected.lead.phone)}`" target="_blank" rel="noopener noreferrer" class="btn btn-sm text-center bg-green-600 hover:bg-green-700 text-white">
                {{ t('pipeline.detail.whatsapp') }}
              </a>
              <a :href="`tel:${selected.lead.phone.replace(/[^\d+]/g, '')}`" class="btn btn-secondary btn-sm text-center">
                {{ t('pipeline.detail.call') }}
              </a>
            </div>
          </section>

          <!-- Etapa y valor -->
          <section class="space-y-3">
            <div>
              <label class="label" for="pipeline-stage">{{ t('pipeline.detail.stage') }}</label>
              <select id="pipeline-stage" :value="selected.stage" class="input" :disabled="!canWork || !!leadsStore.pendingMoves[selected.lead._id]" @change="onStageSelect">
                <!-- Etapa sin configurar: se muestra, pero no se puede elegir -->
                <option v-if="selected.stage === OTHER_STAGES" :value="OTHER_STAGES" disabled>
                  {{ stageName(selected.lead.opportunity_stage) }}
                </option>
                <option v-for="stage in stages" :key="stage" :value="stage">{{ stage }}</option>
              </select>
            </div>
            <div>
              <label class="label" for="pipeline-value">{{ t('pipeline.detail.value') }}</label>
              <form class="flex gap-2" @submit.prevent="saveValue">
                <input id="pipeline-value" v-model="valueDraft" type="number" min="0" step="any" class="input" :placeholder="t('pipeline.detail.valuePlaceholder')" :disabled="!canWork" />
                <button v-if="canWork" type="submit" class="btn btn-primary btn-sm" :disabled="savingValue || !valueChanged">
                  {{ t('common.save') }}
                </button>
              </form>
            </div>
          </section>

          <!-- Notas -->
          <section>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ t('pipeline.notes.title') }}</h4>
            <form v-if="canWork" class="mb-3 space-y-2" @submit.prevent="addNote">
              <textarea v-model="noteText" rows="3" maxlength="2000" class="input text-sm" :placeholder="t('pipeline.notes.placeholder')" :aria-label="t('pipeline.notes.placeholder')"></textarea>
              <button type="submit" class="btn btn-primary btn-sm" :disabled="savingNote || !noteText.trim()">{{ t('pipeline.notes.add') }}</button>
            </form>
            <p v-if="leadsStore.notesLoading" class="text-sm text-gray-400">{{ t('common.loading') }}</p>
            <p v-else-if="leadsStore.notes.length === 0" class="text-sm text-gray-400">{{ t('pipeline.notes.empty') }}</p>
            <ul v-else class="space-y-2">
              <li v-for="note in leadsStore.notes" :key="note._id" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words">{{ note.text }}</p>
                <div class="mt-1 flex items-center justify-between gap-2 text-xs text-gray-400">
                  <span>{{ note.authorName }} · {{ formatDate(note.createdAt) }}</span>
                  <button v-if="canDeleteNote(note)" @click="removeNote(note)" class="text-red-600 dark:text-red-400 hover:underline">
                    {{ t('pipeline.notes.delete') }}
                  </button>
                </div>
              </li>
            </ul>
          </section>

          <!-- Historial -->
          <section>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ t('pipeline.history.title') }}</h4>
            <p v-if="history.length === 0" class="text-sm text-gray-400">{{ t('pipeline.history.empty') }}</p>
            <ol v-else class="space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              <li v-for="(entry, index) in history" :key="index">
                <p class="text-sm text-gray-900 dark:text-white">{{ entry.from || '-' }} → {{ entry.to }}</p>
                <p class="text-xs text-gray-400">{{ entry.source === 'crm' ? 'CRM' : entry.by_name }} · {{ formatDate(entry.at) }}</p>
              </li>
            </ol>
          </section>
        </div>
      </aside>
    </div>

    <!-- Toast de error -->
    <div v-if="toast" role="alert" class="fixed bottom-4 right-4 left-4 sm:left-auto z-[70] px-4 py-3 rounded-lg bg-red-600 text-white text-sm shadow-lg">
      {{ toast }}
    </div>
  </div>
</template>
