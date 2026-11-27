<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { poolApi } from '../services/api'

const { t } = useI18n()

const loading = ref(true)
const error = ref('')
const overview = ref(null)

// Borradores editables por empresa: { [id]: { weight, locationId, token } }
const drafts = reactive({})
const busy = reactive({})
const rowMsg = reactive({})
const rowErr = reactive({})
// Conexión con el CRM desplegada por empresa (abierta por defecto si falta)
const openConn = reactive({})

const copied = ref(false)
const regenerating = ref(false)
const retrying = ref(false)
const retryMsg = ref('')

const syncDrafts = () => {
  for (const c of overview.value.companies) {
    drafts[c.id] = {
      weight: c.pool.weight || 10,
      locationId: c.ghl.locationId || '',
      token: ''
    }
    if (openConn[c.id] === undefined) openConn[c.id] = !c.ghl.configured
  }
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await poolApi.getOverview()
    overview.value = res.data
    syncDrafts()
  } catch (e) {
    error.value = e.response?.data?.message || t('ownerIntegrations.loadError')
  } finally {
    loading.value = false
  }
}
onMounted(load)

const webhookUrl = computed(() => {
  if (!overview.value) return ''
  if (overview.value.webhookUrl) return overview.value.webhookUrl
  // Sin BASE_URL en el server: misma lógica que la página de Integraciones de cada empresa
  const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':3000')
  return `${apiBase}${overview.value.webhookPath}`
})

const copy = async () => {
  try {
    await navigator.clipboard.writeText(webhookUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* sin portapapeles: se puede copiar a mano */ }
}

const regenerate = async () => {
  if (!confirm(t('ownerIntegrations.regenerateConfirm'))) return
  regenerating.value = true
  try {
    const res = await poolApi.regenerateKey()
    overview.value = { ...overview.value, webhookUrl: res.data.webhookUrl, webhookPath: res.data.webhookPath }
  } catch (e) {
    error.value = e.response?.data?.message || t('ownerIntegrations.saveError')
  } finally {
    regenerating.value = false
  }
}

const retryHeld = async () => {
  retrying.value = true
  retryMsg.value = ''
  try {
    const res = await poolApi.retryHeld()
    retryMsg.value = t('ownerIntegrations.retryQueued', { count: res.data.queued })
    setTimeout(load, 4000)
  } catch (e) {
    error.value = e.response?.data?.message || t('ownerIntegrations.saveError')
  } finally {
    retrying.value = false
  }
}

// Guarda un cambio de una empresa y refresca su fila
const saveCompany = async (company, patch, successKey = 'ownerIntegrations.saved') => {
  rowMsg[company.id] = ''
  rowErr[company.id] = ''
  busy[company.id] = true
  try {
    const res = await poolApi.updateCompany(company.id, patch)
    const idx = overview.value.companies.findIndex(c => c.id === company.id)
    overview.value.companies[idx] = res.data.company
    drafts[company.id] = {
      weight: res.data.company.pool.weight || drafts[company.id].weight,
      locationId: res.data.company.ghl.locationId || '',
      token: ''
    }
    if (patch.token && res.data.company.ghl.configured) openConn[company.id] = false
    rowMsg[company.id] = t(successKey)
    setTimeout(() => { if (rowMsg[company.id] === t(successKey)) rowMsg[company.id] = '' }, 3000)
  } catch (e) {
    rowErr[company.id] = e.response?.data?.message || t('ownerIntegrations.saveError')
  } finally {
    busy[company.id] = false
  }
}

const saveConnection = (company) => {
  const d = drafts[company.id]
  const patch = { locationId: d.locationId }
  if (d.token.trim()) patch.token = d.token.trim()
  saveCompany(company, patch, 'ownerIntegrations.connectionSaved')
}
const saveWeight = (company) => saveCompany(company, { weight: Number(drafts[company.id].weight) })
// Al activar se envía también el peso que muestra el campo (si no, el servidor
// vería 0 y rechazaría la activación aunque en pantalla diga 10)
const toggle = (company) => {
  const enabling = !company.pool.enabled
  const patch = { enabled: enabling }
  if (enabling) patch.weight = Number(drafts[company.id].weight)
  saveCompany(company, patch)
}

// Participación estimada de cada empresa (según pesos de las elegibles)
const eligible = computed(() => (overview.value?.companies || []).filter(c => c.status === 'eligible'))
const eligibleWeight = computed(() => eligible.value.reduce((s, c) => s + c.pool.weight, 0))
const share = (c) =>
  c.status === 'eligible' && eligibleWeight.value > 0
    ? Math.round((c.pool.weight / eligibleWeight.value) * 100)
    : null

// Colores del reparto (se repiten si hay más empresas)
const BAR_COLORS = ['#C8F23A', '#60A5FA', '#F59E0B', '#A78BFA', '#34D399', '#F472B6', '#94A3B8']
const distribution = computed(() => eligible.value.map((c, i) => ({
  id: c.id, name: c.name, pct: share(c), color: BAR_COLORS[i % BAR_COLORS.length]
})))

const statusClass = (s) => ({
  eligible: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  off: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  no_balance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  no_token: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  no_weight: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}[s] || 'bg-gray-100 text-gray-600')

const participating = computed(() => overview.value?.companies.filter(c => c.pool.enabled).length || 0)
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('ownerIntegrations.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('ownerIntegrations.subtitle') }}</p>
    </div>

    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else-if="overview">
      <!-- Las dos formas de recibir leads -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" /></svg>
            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ t('ownerIntegrations.modeOwnTitle') }}</p>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{{ t('ownerIntegrations.modeOwnDesc') }}</p>
        </div>
        <div class="rounded-xl border border-primary-300 dark:border-primary-400/40 bg-primary-50/60 dark:bg-primary-400/10 p-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 12h6m0 0l4-6h6M10 12l4 6h6" /></svg>
            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ t('ownerIntegrations.modeSharedTitle') }}</p>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1.5">{{ t('ownerIntegrations.modeSharedDesc') }}</p>
        </div>
      </div>

      <!-- Leads esperando una empresa disponible -->
      <div
        v-if="overview.heldLeads > 0"
        class="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-wrap items-center justify-between gap-3"
      >
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-amber-900 dark:text-amber-200">
            {{ t('ownerIntegrations.heldTitle', { count: overview.heldLeads }) }}
          </p>
          <p class="text-sm text-amber-800 dark:text-amber-300">{{ t('ownerIntegrations.heldDesc') }}</p>
          <p v-if="retryMsg" class="text-sm text-green-700 dark:text-green-400 mt-1">{{ retryMsg }}</p>
        </div>
        <button @click="retryHeld" :disabled="retrying" class="btn btn-primary text-sm">
          {{ retrying ? '…' : t('ownerIntegrations.retry') }}
        </button>
      </div>

      <!-- Pasos -->
      <div class="card">
        <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">{{ t('ownerIntegrations.howTitle') }}</h2>
        <ol class="grid gap-3 sm:grid-cols-3">
          <li v-for="n in 3" :key="n" class="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-white/5 p-3">
            <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-300 text-xs font-bold text-gray-950">{{ n }}</span>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t(`ownerIntegrations.s${n}t`) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ t(`ownerIntegrations.s${n}d`) }}</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Empresas participantes -->
      <div class="card">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ t('ownerIntegrations.companiesTitle') }}</h2>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('ownerIntegrations.participating', { count: participating }) }}
          </span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('ownerIntegrations.companiesInfo') }}</p>

        <!-- Reparto actual -->
        <div class="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{{ t('ownerIntegrations.distTitle') }}</p>
          <template v-if="distribution.length">
            <div class="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div v-for="d in distribution" :key="d.id" :style="{ width: d.pct + '%', background: d.color }" :title="`${d.name}: ${d.pct}%`"></div>
            </div>
            <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              <span v-for="d in distribution" :key="d.id" class="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                <span class="h-2.5 w-2.5 rounded-full" :style="{ background: d.color }"></span>
                {{ d.name }} <strong class="font-semibold">{{ d.pct }}%</strong>
              </span>
            </div>
          </template>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">{{ t('ownerIntegrations.distEmpty') }}</p>
        </div>

        <p v-if="overview.companies.length === 0" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {{ t('ownerIntegrations.noCompanies') }}
        </p>

        <div class="mt-4 space-y-3">
          <div
            v-for="c in overview.companies"
            :key="c.id"
            class="rounded-xl border p-4 space-y-4 transition-colors"
            :class="c.pool.enabled ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200/70 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/30'"
          >
            <!-- Encabezado de la empresa -->
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-gray-900 dark:text-white truncate">{{ c.name }}</p>
                  <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full" :class="statusClass(c.status)">
                    {{ t(`ownerIntegrations.status.${c.status}`) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ t('ownerIntegrations.received', { count: c.received }) }}
                  <template v-if="c.giftCardEnabled"> · {{ t('giftcard.balanceShort', { count: c.leadCredits }) }}</template>
                  <template v-if="share(c) !== null"> · ~{{ share(c) }}%</template>
                </p>
              </div>
              <!-- Interruptor Participa -->
              <button
                type="button"
                role="switch"
                :aria-checked="c.pool.enabled"
                @click="toggle(c)"
                :disabled="busy[c.id]"
                class="inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                :class="c.pool.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
              >
                <span
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="c.pool.enabled ? 'bg-primary-400' : 'bg-gray-300 dark:bg-gray-600'"
                >
                  <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform" :class="c.pool.enabled ? 'translate-x-5' : 'translate-x-0.5'"></span>
                </span>
                {{ busy[c.id] ? '…' : (c.pool.enabled ? t('ownerIntegrations.participatesOn') : t('ownerIntegrations.participatesOff')) }}
              </button>
            </div>

            <!-- Peso -->
            <div class="flex flex-wrap items-end gap-3">
              <div class="w-28">
                <label class="label text-xs" :for="`w-${c.id}`">{{ t('ownerIntegrations.weightTitle') }}</label>
                <input :id="`w-${c.id}`" v-model.number="drafts[c.id].weight" type="number" min="1" max="100" class="input text-sm" />
              </div>
              <button @click="saveWeight(c)" :disabled="busy[c.id]" class="btn btn-secondary text-sm">
                {{ t('ownerIntegrations.saveWeight') }}
              </button>
              <p class="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-[12rem]">{{ t('ownerIntegrations.weightHint') }}</p>
            </div>

            <!-- Conexión con el CRM -->
            <div class="rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                @click="openConn[c.id] = !openConn[c.id]"
                class="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left"
                :aria-expanded="!!openConn[c.id]"
              >
                <span class="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                  <span class="h-2 w-2 rounded-full" :class="c.ghl.configured ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ t('ownerIntegrations.connTitle') }}
                  <span class="text-xs font-normal text-gray-500 dark:text-gray-400">
                    · {{ c.ghl.configured ? t('ownerIntegrations.connOk') : t('ownerIntegrations.connMissing') }}
                  </span>
                </span>
                <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': openConn[c.id] }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <form v-if="openConn[c.id]" @submit.prevent="saveConnection(c)" class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('ownerIntegrations.connHint') }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="label text-xs" :for="`loc-${c.id}`">{{ t('ownerIntegrations.locationId') }}</label>
                    <input :id="`loc-${c.id}`" v-model="drafts[c.id].locationId" type="text" class="input text-sm font-mono" autocomplete="off" />
                  </div>
                  <div>
                    <label class="label text-xs" :for="`tok-${c.id}`">
                      {{ c.ghl.configured ? t('ownerIntegrations.replaceToken', { hint: c.ghl.hint }) : t('ownerIntegrations.token') }}
                    </label>
                    <input :id="`tok-${c.id}`" v-model="drafts[c.id].token" type="password" class="input text-sm" autocomplete="off" spellcheck="false" />
                  </div>
                </div>
                <button type="submit" class="btn btn-secondary text-sm" :disabled="busy[c.id] || !drafts[c.id].locationId.trim()">
                  {{ t('ownerIntegrations.validateSave') }}
                </button>
              </form>
            </div>

            <p v-if="rowMsg[c.id]" class="text-sm text-green-600 dark:text-green-400">{{ rowMsg[c.id] }}</p>
            <p v-if="rowErr[c.id]" class="text-sm text-red-600 dark:text-red-400">{{ rowErr[c.id] }}</p>
          </div>
        </div>
      </div>

      <!-- Webhook de entrada (campaña única) -->
      <div class="card">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ t('ownerIntegrations.webhookTitle') }}</h2>
          <span class="rounded bg-primary-300 px-2 py-0.5 text-xs font-bold text-gray-950">POST</span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ t('ownerIntegrations.webhookInfo') }} {{ t('ownerIntegrations.inputDesc') }}</p>

        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <code class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm break-all text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">{{ webhookUrl }}</code>
          <button @click="copy" class="btn btn-secondary whitespace-nowrap text-sm">
            {{ copied ? t('common.copied') : t('common.copy') }}
          </button>
        </div>

        <details class="text-sm mt-3">
          <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{{ t('ownerIntegrations.viewJson') }}</summary>
          <pre v-pre class="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs overflow-x-auto text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{
  "contact_id": "{{contact.id}}",
  "contact_name": "{{contact.name}}",
  "contact_email": "{{contact.email}}",
  "contact_phone": "{{contact.phone}}",
  "created_at": "{{contact.date_added}}",
  "source": "{{contact.source}}",
  "tags": "{{contact.tags}}",
  "state": "{{contact.state}}"
}</pre>
        </details>

        <details class="text-sm mt-2">
          <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{{ t('ownerIntegrations.responsesTitle') }}</summary>
          <ul class="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <li><code class="font-mono font-bold text-green-700 dark:text-green-400">201</code> {{ t('ownerIntegrations.res201') }}</li>
            <li><code class="font-mono font-bold text-gray-600 dark:text-gray-400">200</code> {{ t('ownerIntegrations.res200') }}</li>
            <li><code class="font-mono font-bold text-amber-600 dark:text-amber-400">202</code> {{ t('ownerIntegrations.res202') }}</li>
            <li><code class="font-mono font-bold text-red-600 dark:text-red-400">401</code> {{ t('ownerIntegrations.res401') }}</li>
            <li><code class="font-mono font-bold text-red-600 dark:text-red-400">403</code> {{ t('ownerIntegrations.res403') }}</li>
          </ul>
        </details>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button @click="regenerate" :disabled="regenerating" class="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50">
            {{ regenerating ? '…' : t('ownerIntegrations.regenerate') }}
          </button>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('ownerIntegrations.regenerateHint') }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
