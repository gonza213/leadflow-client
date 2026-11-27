<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'
import WebFormConfig from '../components/config/WebFormConfig.vue'
import { configApi } from '../services/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()

const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':3000')

const webhookUrl = computed(() => `${apiBaseUrl}/api/${authStore.tenantSlug}/webhook/lead`)
const stageWebhookUrl = computed(() => `${apiBaseUrl}/api/${authStore.tenantSlug}/webhook/stage`)

// Pestañas: se puede enlazar directo con ?tab=form
const activeTab = ref(route.query.tab === 'form' ? 'form' : 'crm')
const setTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: tab === 'form' ? { tab } : {} })
}

// Copiar URLs
const copiedKey = ref('')
const copy = (key, text) => {
  navigator.clipboard.writeText(text)
  copiedKey.value = key
  setTimeout(() => { if (copiedKey.value === key) copiedKey.value = '' }, 2000)
}

// Paso 2: URL del webhook de tu CRM (antes estaba en una tarjeta aparte, al final)
const crmUrl = ref('')
const crmSaving = ref(false)
const crmError = ref('')
const crmSuccess = ref('')
watch(() => configStore.config?.ghl_webhook_url, (val) => { crmUrl.value = val || '' }, { immediate: true })
const crmConfigured = computed(() => !!configStore.config?.ghl_webhook_url)

const isValidUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const saveCrmUrl = async () => {
  crmError.value = ''
  crmSuccess.value = ''
  const value = crmUrl.value.trim()
  if (value && !isValidUrl(value)) {
    crmError.value = t('integrations.crm.errors.invalidUrl')
    return
  }
  crmSaving.value = true
  const result = await configStore.updateGhlConfig({ ghl_webhook_url: value || null })
  crmSaving.value = false
  if (result?.success) {
    crmSuccess.value = t('integrations.crm.success')
    setTimeout(() => { crmSuccess.value = '' }, 3000)
  } else {
    crmError.value = t('integrations.crm.errors.update')
  }
}

const platforms = computed(() => [
  { name: 'GoHighLevel', optimized: true },
  { name: 'HubSpot' },
  { name: 'Kommo' },
  { name: 'monday.com' },
  { name: 'Clientify' },
  { name: 'Make / Zapier' }
])

// API key opcional del webhook: con ella, solo quien tiene la clave puede mandar leads
const apiKey = ref('')
const apiKeyAvailable = ref(false)
const showApiKey = ref(false)
const apiKeyBusy = ref(false)
const apiKeyMsg = ref('')

const maskedApiKey = computed(() => {
  const k = apiKey.value
  return showApiKey.value || k.length < 10 ? k : `${k.slice(0, 6)}••••••••••••${k.slice(-4)}`
})
const webhookUrlWithKey = computed(() => `${webhookUrl.value}?api_key=${apiKey.value}`)
const webhookUrlWithKeyMasked = computed(() => `${webhookUrl.value}?api_key=${maskedApiKey.value}`)

const loadApiKey = async () => {
  try {
    const { data } = await configApi.getApiKey(authStore.tenantSlug)
    apiKey.value = data.apiKey || ''
    apiKeyAvailable.value = !!apiKey.value
  } catch {
    apiKeyAvailable.value = false // sin permiso (viewer/vendedor) o error: no se muestra la sección
  }
}

const regenerateApiKey = async () => {
  if (!confirm(t('integrations.apiKey.regenerateConfirm'))) return
  apiKeyBusy.value = true
  apiKeyMsg.value = ''
  try {
    const { data } = await configApi.regenerateApiKey(authStore.tenantSlug)
    apiKey.value = data.apiKey
    showApiKey.value = true
    apiKeyMsg.value = t('integrations.apiKey.regenerated')
  } catch {
    apiKeyMsg.value = t('integrations.apiKey.error')
  } finally {
    apiKeyBusy.value = false
  }
}

onMounted(async () => {
  await configStore.fetchConfig()
  if (authStore.tenantSlug) loadApiKey()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('integrations.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('integrations.subtitle') }}</p>
    </div>

    <div v-if="!authStore.tenantSlug" class="card text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">{{ t('config.no_tenant') }}</p>
    </div>

    <template v-else>
      <!-- Pestañas -->
      <div class="flex gap-1 border-b border-gray-200 dark:border-gray-700" role="tablist">
        <button
          v-for="tab in [{ id: 'crm', label: t('integrations.tabs.crm') }, { id: 'form', label: t('integrations.tabs.form') }]"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="setTab(tab.id)"
          class="px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap"
          :class="activeTab === tab.id
            ? 'border-primary-600 text-primary-700 dark:border-primary-300 dark:text-primary-300'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ===== Pestaña: Conectar tu CRM ===== -->
      <div v-if="activeTab === 'crm'" class="space-y-6">

        <!-- Cómo funciona + plataformas -->
        <div class="card">
          <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">{{ t('integrations.how.title') }}</h2>
          <ol class="grid gap-3 sm:grid-cols-3">
            <li v-for="n in 3" :key="n" class="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-white/5 p-3">
              <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                :class="n === 3 ? 'border border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400' : 'bg-primary-300 text-gray-950'">{{ n }}</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ t(`integrations.how.s${n}`) }}</span>
            </li>
          </ol>
          <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span class="font-semibold text-gray-500 dark:text-gray-400">{{ t('integrations.compatible') }}</span>
            <span
              v-for="p in platforms"
              :key="p.name"
              class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium"
              :class="p.optimized
                ? 'border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-400/40 dark:bg-primary-400/10 dark:text-primary-200'
                : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'"
            >
              {{ p.name }}<span v-if="p.optimized" class="font-bold">· {{ t('integrations.platforms.optimized') }}</span>
            </span>
            <span class="text-gray-400 dark:text-gray-500">{{ t('integrations.anyWebhook') }}</span>
          </div>
        </div>

        <!-- Paso 1: entrada de leads -->
        <section class="card">
          <div class="flex items-start gap-3 mb-3">
            <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-300 text-sm font-bold text-gray-950">1</span>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ t('integrations.step1.title') }}</h2>
                <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ t('integrations.required') }}</span>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('integrations.step1.desc') }}</p>
            </div>
          </div>
          <div class="sm:pl-11 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <span class="text-xs font-bold text-primary-700 dark:text-primary-300 sm:w-12">POST</span>
              <code class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm break-all text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">{{ webhookUrl }}</code>
              <button type="button" @click="copy('input', webhookUrl)" class="btn btn-secondary text-sm whitespace-nowrap">
                {{ copiedKey === 'input' ? t('common.copied') : t('common.copy') }}
              </button>
            </div>
            <details class="text-sm">
              <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{{ t('integrations.webhooks.input.viewJson') }}</summary>
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
            <details class="text-sm">
              <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{{ t('integrations.webhooks.responses.title') }}</summary>
              <ul class="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <li><code class="font-mono font-bold text-green-700 dark:text-green-400">201</code> {{ t('integrations.webhooks.responses.c201') }}</li>
                <li><code class="font-mono font-bold text-red-600 dark:text-red-400">400</code> {{ t('integrations.webhooks.responses.c400') }}</li>
                <li><code class="font-mono font-bold text-amber-600 dark:text-amber-400">402</code> {{ t('integrations.webhooks.responses.c402') }}</li>
                <li><code class="font-mono font-bold text-red-600 dark:text-red-400">409</code> {{ t('integrations.webhooks.responses.c409') }}</li>
              </ul>
            </details>

            <!-- API key opcional -->
            <div v-if="apiKeyAvailable" class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white">{{ t('integrations.apiKey.title') }}</h3>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('integrations.apiKey.desc') }}</p>
                </div>
                <button type="button" @click="showApiKey = !showApiKey" class="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  {{ showApiKey ? t('integrations.apiKey.hide') : t('integrations.apiKey.show') }}
                </button>
              </div>

              <div>
                <div class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{{ t('integrations.apiKey.urlWithKey') }}</div>
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs break-all text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">{{ webhookUrlWithKeyMasked }}</code>
                  <button type="button" @click="copy('inputKey', webhookUrlWithKey)" class="btn btn-secondary text-sm whitespace-nowrap">
                    {{ copiedKey === 'inputKey' ? t('common.copied') : t('common.copy') }}
                  </button>
                </div>
              </div>

              <div>
                <div class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{{ t('integrations.apiKey.header') }} <span class="font-mono">X-API-Key</span></div>
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs break-all text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">{{ maskedApiKey }}</code>
                  <button type="button" @click="copy('apiKey', apiKey)" class="btn btn-secondary text-sm whitespace-nowrap">
                    {{ copiedKey === 'apiKey' ? t('common.copied') : t('common.copy') }}
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <button type="button" @click="regenerateApiKey" :disabled="apiKeyBusy" class="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50">
                  {{ apiKeyBusy ? '…' : t('integrations.apiKey.regenerate') }}
                </button>
                <span v-if="apiKeyMsg" class="text-xs text-gray-600 dark:text-gray-300">{{ apiKeyMsg }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Paso 2: aviso de asignación al CRM (URL editable acá mismo) -->
        <section class="card">
          <div class="flex items-start gap-3 mb-3">
            <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-300 text-sm font-bold text-gray-950">2</span>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ t('integrations.step2.title') }}</h2>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="crmConfigured
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-400/15 dark:text-primary-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300'"
                >{{ crmConfigured ? t('integrations.configured') : t('integrations.notConfigured') }}</span>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('integrations.step2.desc') }}</p>
            </div>
          </div>
          <form class="sm:pl-11 space-y-3" @submit.prevent="saveCrmUrl">
            <label class="label" for="crm-webhook-url">{{ t('integrations.crm.webhookLabel') }}</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <input id="crm-webhook-url" v-model="crmUrl" type="url" class="input flex-1" :placeholder="t('integrations.crm.webhookPlaceholder')" />
              <button type="submit" class="btn btn-primary whitespace-nowrap" :disabled="crmSaving">{{ t('common.save') }}</button>
            </div>
            <p v-if="crmError" role="alert" class="text-sm text-red-600 dark:text-red-400">{{ crmError }}</p>
            <p v-if="crmSuccess" role="status" class="text-sm text-green-700 dark:text-green-400">{{ crmSuccess }}</p>
            <details class="text-sm">
              <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{{ t('integrations.webhooks.output.viewJson') }}</summary>
              <pre v-pre class="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs overflow-x-auto text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{
  "contact_id": "abc123",
  "seller_user_id": "crm_user_id_del_vendedor",
  "seller_name": "Nombre del Vendedor",
  "team": "Equipo A",
  "name": "Nombre del lead",
  "email": "lead@email.com",
  "phone": "+5491100000000"
}</pre>
            </details>
          </form>
        </section>

        <!-- Paso 3: cambios de etapa (opcional) -->
        <section class="card">
          <div class="flex items-start gap-3 mb-3">
            <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-500 dark:border-gray-600 dark:text-gray-400">3</span>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ t('integrations.step3.title') }}</h2>
                <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ t('integrations.optional') }}</span>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('integrations.step3.desc') }}</p>
            </div>
          </div>
          <div class="sm:pl-11 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <span class="text-xs font-bold text-primary-700 dark:text-primary-300 sm:w-12">POST</span>
              <code class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm break-all text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">{{ stageWebhookUrl }}</code>
              <button type="button" @click="copy('stage', stageWebhookUrl)" class="btn btn-secondary text-sm whitespace-nowrap">
                {{ copiedKey === 'stage' ? t('common.copied') : t('common.copy') }}
              </button>
            </div>
            <details class="text-sm">
              <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{{ t('integrations.webhooks.stage.viewJson') }}</summary>
              <pre v-pre class="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs overflow-x-auto text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{
  "contact_id": "{{contact.id}}",
  "opportunity_stage": "{{opportunity.stage}}",
  "state": "{{contact.state}}"
}</pre>
            </details>
          </div>
        </section>
      </div>

      <!-- ===== Pestaña: Formulario web ===== -->
      <div v-else>
        <WebFormConfig v-if="authStore.isManager" :api-base-url="apiBaseUrl" />
      </div>
    </template>
  </div>
</template>
