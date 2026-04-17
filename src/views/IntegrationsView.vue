<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'
import GhlConfig from '../components/config/GhlConfig.vue'

const { t } = useI18n()

const authStore = useAuthStore()
const configStore = useConfigStore()

const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':3000')

const webhookUrl = computed(() => `${apiBaseUrl}/api/${authStore.tenantSlug}/webhook/lead`)
const stageWebhookUrl = computed(() => `${apiBaseUrl}/api/${authStore.tenantSlug}/webhook/stage`)

const copied = ref(false)
const copiedStage = ref(false)

const copyWebhook = () => {
  navigator.clipboard.writeText(webhookUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const copyStageWebhook = () => {
  navigator.clipboard.writeText(stageWebhookUrl.value)
  copiedStage.value = true
  setTimeout(() => { copiedStage.value = false }, 2000)
}

const integrations = computed(() => [
  { name: 'GoHighLevel', desc: t('integrations.platforms.ghl'), status: 'optimized', color: '#22c55e', bg: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300' },
  { name: 'Kommo (amoCRM)', desc: t('integrations.platforms.kommo'), status: 'webhook', color: '#3b82f6', bg: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-300' },
  { name: 'monday.com', desc: t('integrations.platforms.monday'), status: 'webhook', color: '#00ca72', bg: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-700 dark:text-emerald-300' },
  { name: 'HubSpot', desc: t('integrations.platforms.hubspot'), status: 'webhook', color: '#f97316', bg: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-300' },
  { name: 'Clientify', desc: t('integrations.platforms.clientify'), status: 'webhook', color: '#e11d48', bg: 'bg-rose-100 dark:bg-rose-900/30', textColor: 'text-rose-700 dark:text-rose-300' },
  { name: 'Make / Zapier', desc: t('integrations.platforms.make'), status: 'webhook', color: '#8b5cf6', bg: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-300' },
])

onMounted(async () => {
  await configStore.fetchConfig()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('integrations.title') }}</h1>
    </div>

    <!-- Plataformas compatibles -->
    <div class="card">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ t('integrations.platforms.title') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
        {{ t('integrations.platforms.info') }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="platform in integrations"
          :key="platform.name"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
        >
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm', platform.bg, platform.textColor]">
            {{ platform.name.slice(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ platform.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ platform.desc }}</p>
          </div>
          <span :class="[
            'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
            platform.status === 'optimized'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          ]">
            {{ platform.status === 'optimized' ? t('integrations.platforms.optimized') : t('integrations.platforms.webhook') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Webhooks -->
    <div v-if="authStore.tenantSlug" class="card">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ t('integrations.webhooks.title') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {{ t('integrations.webhooks.info') }}
      </p>

      <!-- Webhook 1: Entrada -->
      <div class="border rounded-lg p-4 mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-green-600 dark:text-green-400 font-bold text-lg">1.</span>
          <h3 class="font-semibold text-green-800 dark:text-green-300">{{ t('integrations.webhooks.input.title') }}</h3>
          <span class="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded">POST</span>
        </div>
        <p class="text-sm text-green-700 dark:text-green-400 mb-3">
          {{ t('integrations.webhooks.input.desc') }}
        </p>
        <div class="flex items-center gap-2 mb-3">
          <code class="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono break-all border border-green-300 dark:border-green-700 dark:text-green-300">
            {{ webhookUrl }}
          </code>
          <button @click="copyWebhook" class="btn btn-secondary whitespace-nowrap text-sm">
            {{ copied ? t('common.copied') : t('common.copy') }}
          </button>
        </div>
        <details class="text-sm">
          <summary class="cursor-pointer text-green-700 dark:text-green-400 font-medium">{{ t('integrations.webhooks.input.viewJson') }}</summary>
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
      </div>

      <!-- Webhook 2: Respuesta -->
      <div class="border rounded-lg p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-blue-600 dark:text-blue-400 font-bold text-lg">2.</span>
          <h3 class="font-semibold text-blue-800 dark:text-blue-300">{{ t('integrations.webhooks.output.title') }}</h3>
          <span class="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded">POST</span>
        </div>
        <p class="text-sm text-blue-700 dark:text-blue-400 mb-3">
          {{ t('integrations.webhooks.output.desc') }}
        </p>
        <details class="text-sm">
          <summary class="cursor-pointer text-blue-700 dark:text-blue-400 font-medium">{{ t('integrations.webhooks.output.viewJson') }}</summary>
          <pre v-pre class="bg-white dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300 mt-2 border border-blue-200 dark:border-blue-700">{
  "contact_id": "abc123",
  "seller_user_id": "crm_user_id_del_vendedor",
  "seller_name": "Nombre del Vendedor",
  "team": "Equipo A"
}</pre>
        </details>
      </div>

      <!-- Webhook 3: Etapa -->
      <div class="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-purple-600 dark:text-purple-400 font-bold text-lg">3.</span>
          <h3 class="font-semibold text-purple-800 dark:text-purple-300">{{ t('integrations.webhooks.stage.title') }}</h3>
          <span class="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded">POST</span>
        </div>
        <p class="text-sm text-purple-700 dark:text-purple-400 mb-3">
          {{ t('integrations.webhooks.stage.desc') }}
        </p>
        <div class="flex items-center gap-2 mb-3">
          <code class="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono break-all border border-purple-300 dark:border-purple-700 dark:text-purple-300">
            {{ stageWebhookUrl }}
          </code>
          <button @click="copyStageWebhook" class="btn btn-secondary whitespace-nowrap text-sm">
            {{ copiedStage ? t('common.copied') : t('common.copy') }}
          </button>
        </div>
        <details class="text-sm">
          <summary class="cursor-pointer text-purple-700 dark:text-purple-400 font-medium">{{ t('integrations.webhooks.stage.viewJson') }}</summary>
          <pre v-pre class="bg-white dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300 mt-2 border border-purple-200 dark:border-purple-700">{
  "contact_id": "{{contact.id}}",
  "opportunity_stage": "{{opportunity.stage}}",
  "state": "{{contact.state}}"
}</pre>
        </details>
      </div>
    </div>

    <!-- Config CRM (webhook salida + timezone) -->
    <div v-if="configStore.config" class="card">
      <GhlConfig
        :ghl-webhook-url="configStore.config.ghl_webhook_url"
        :timezone="configStore.config.timezone"
        @update="configStore.updateGhlConfig"
      />
    </div>
    <div v-else-if="configStore.loading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  </div>
</template>
