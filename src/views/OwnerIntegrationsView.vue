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
    rowMsg[company.id] = t(successKey)
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
const eligibleWeight = computed(() =>
  overview.value.companies
    .filter(c => c.status === 'eligible')
    .reduce((s, c) => s + c.pool.weight, 0)
)
const share = (c) =>
  c.status === 'eligible' && eligibleWeight.value > 0
    ? Math.round((c.pool.weight / eligibleWeight.value) * 100)
    : null

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
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('ownerIntegrations.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ t('ownerIntegrations.subtitle') }}</p>
    </div>

    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else-if="overview">
      <!-- Cómo conviven las dos formas -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ t('ownerIntegrations.modesTitle') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('ownerIntegrations.modeOwnTitle') }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ t('ownerIntegrations.modeOwnDesc') }}</p>
          </div>
          <div class="rounded-lg border border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10 p-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('ownerIntegrations.modeSharedTitle') }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ t('ownerIntegrations.modeSharedDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- Leads esperando una empresa disponible -->
      <div
        v-if="overview.heldLeads > 0"
        class="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
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

      <!-- Webhook de entrada (campaña única) -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ t('ownerIntegrations.webhookTitle') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ t('ownerIntegrations.webhookInfo') }}</p>

        <div class="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-green-600 dark:text-green-400 font-bold text-lg">1.</span>
            <h3 class="font-semibold text-green-800 dark:text-green-300">{{ t('ownerIntegrations.inputTitle') }}</h3>
            <span class="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded">POST</span>
          </div>
          <p class="text-sm text-green-700 dark:text-green-400 mb-3">{{ t('ownerIntegrations.inputDesc') }}</p>
          <div class="flex items-center gap-2 mb-3">
            <code class="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono break-all border border-green-300 dark:border-green-700 dark:text-green-300">
              {{ webhookUrl }}
            </code>
            <button @click="copy" class="btn btn-secondary whitespace-nowrap text-sm">
              {{ copied ? t('common.copied') : t('common.copy') }}
            </button>
          </div>

          <details class="text-sm">
            <summary class="cursor-pointer text-green-700 dark:text-green-400 font-medium">{{ t('ownerIntegrations.viewJson') }}</summary>
            <pre v-pre class="bg-white dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300 mt-2 border border-green-200 dark:border-green-700">{
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
            <summary class="cursor-pointer text-green-700 dark:text-green-400 font-medium">{{ t('ownerIntegrations.responsesTitle') }}</summary>
            <ul class="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
              <li><code class="font-mono">201</code> — {{ t('ownerIntegrations.res201') }}</li>
              <li><code class="font-mono">200</code> — {{ t('ownerIntegrations.res200') }}</li>
              <li><code class="font-mono">202</code> — {{ t('ownerIntegrations.res202') }}</li>
              <li><code class="font-mono">401</code> — {{ t('ownerIntegrations.res401') }}</li>
              <li><code class="font-mono">403</code> — {{ t('ownerIntegrations.res403') }}</li>
            </ul>
          </details>

          <div class="mt-3 flex items-center gap-3">
            <button @click="regenerate" :disabled="regenerating" class="text-xs text-red-600 dark:text-red-400 hover:underline">
              {{ regenerating ? '…' : t('ownerIntegrations.regenerate') }}
            </button>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('ownerIntegrations.regenerateHint') }}</span>
          </div>
        </div>

        <!-- Pasos -->
        <ol class="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
          <li>{{ t('ownerIntegrations.step1') }}</li>
          <li>{{ t('ownerIntegrations.step2') }}</li>
          <li>{{ t('ownerIntegrations.step3') }}</li>
        </ol>
      </div>

      <!-- Empresas participantes -->
      <div class="card">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('ownerIntegrations.companiesTitle') }}</h2>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('ownerIntegrations.participating', { count: participating }) }}
          </span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ t('ownerIntegrations.companiesInfo') }}</p>

        <p v-if="overview.companies.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('ownerIntegrations.noCompanies') }}
        </p>

        <div class="space-y-3">
          <div
            v-for="c in overview.companies"
            :key="c.id"
            class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-white truncate">{{ c.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t('ownerIntegrations.received', { count: c.received }) }}
                  <template v-if="c.giftCardEnabled"> · {{ t('giftcard.balanceShort', { count: c.leadCredits }) }}</template>
                  <template v-if="share(c) !== null"> · ~{{ share(c) }}%</template>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="statusClass(c.status)">
                  {{ t(`ownerIntegrations.status.${c.status}`) }}
                </span>
                <button
                  @click="toggle(c)"
                  :disabled="busy[c.id]"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50"
                  :class="c.pool.enabled
                    ? 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
                >
                  {{ busy[c.id] ? '…' : (c.pool.enabled ? t('ownerIntegrations.participatesOn') : t('ownerIntegrations.participatesOff')) }}
                </button>
              </div>
            </div>

            <!-- Conexión con la subcuenta de GHL -->
            <form @submit.prevent="saveConnection(c)" class="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div class="sm:col-span-2">
                <label class="label text-xs">{{ t('ownerIntegrations.locationId') }}</label>
                <input v-model="drafts[c.id].locationId" type="text" class="input text-sm font-mono" placeholder="rZKQk3pCDhbwEBZbBr9m" autocomplete="off" />
              </div>
              <div class="sm:col-span-2">
                <label class="label text-xs">
                  {{ c.ghl.configured ? t('ownerIntegrations.replaceToken', { hint: c.ghl.hint }) : t('ownerIntegrations.token') }}
                </label>
                <input v-model="drafts[c.id].token" type="password" class="input text-sm" placeholder="pit-…" autocomplete="off" spellcheck="false" />
              </div>
              <button type="submit" class="btn btn-secondary text-sm" :disabled="busy[c.id] || !drafts[c.id].locationId.trim()">
                {{ t('ownerIntegrations.validateSave') }}
              </button>
            </form>

            <!-- Peso -->
            <div class="flex flex-wrap items-end gap-3">
              <div class="w-32">
                <label class="label text-xs">{{ t('ownerIntegrations.weight') }}</label>
                <input v-model.number="drafts[c.id].weight" type="number" min="1" max="100" class="input text-sm" />
              </div>
              <button @click="saveWeight(c)" :disabled="busy[c.id]" class="btn btn-secondary text-sm">
                {{ t('ownerIntegrations.saveWeight') }}
              </button>
              <p class="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-[12rem]">{{ t('ownerIntegrations.weightHint') }}</p>
            </div>

            <p v-if="rowMsg[c.id]" class="text-sm text-green-600 dark:text-green-400">{{ rowMsg[c.id] }}</p>
            <p v-if="rowErr[c.id]" class="text-sm text-red-600 dark:text-red-400">{{ rowErr[c.id] }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
