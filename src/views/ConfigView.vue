<script setup>
import { onMounted, ref, computed } from 'vue'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import TeamsConfig from '../components/config/TeamsConfig.vue'
import PeriodConfig from '../components/config/PeriodConfig.vue'
import StagesConfig from '../components/config/StagesConfig.vue'
import GhlConfig from '../components/config/GhlConfig.vue'
import FallbackConfig from '../components/config/FallbackConfig.vue'
import SummaryConfig from '../components/config/SummaryConfig.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const activeTab = ref('teams')
const copied = ref(false)

const tabs = [
  { id: 'teams', name: 'Equipos', icon: 'users' },
  { id: 'period', name: 'Período', icon: 'calendar' },
  { id: 'stages', name: 'Etapas', icon: 'layers' },
  { id: 'ghl', name: 'Integracion', icon: 'link' },
  { id: 'fallback', name: 'Respaldo', icon: 'shield' },
  { id: 'summary', name: 'Resumen IA', icon: 'sparkles' }
]

// Use VITE_API_URL for production, fallback to localhost for development
const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':3000')

const webhookUrl = computed(() => {
  return `${apiBaseUrl}/api/${authStore.tenantSlug}/webhook/lead`
})

const stageWebhookUrl = computed(() => {
  return `${apiBaseUrl}/api/${authStore.tenantSlug}/webhook/stage`
})

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

onMounted(async () => {
  await configStore.fetchConfig()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Configuracion</h1>
    </div>

    <!-- Webhooks Section -->
    <div v-if="authStore.tenantSlug" class="card">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Integracion de Webhooks</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Configura estos webhooks en tu CRM (GoHighLevel, HubSpot, Make, Zapier, etc.) para sincronizar leads con el sistema.
      </p>

      <!-- Webhook 1: Entrada de Leads -->
      <div class="border rounded-lg p-4 mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-green-600 dark:text-green-400 font-bold text-lg">1.</span>
          <h3 class="font-semibold text-green-800 dark:text-green-300">CRM envia nuevo lead al Sistema</h3>
          <span class="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded">POST</span>
        </div>
        <p class="text-sm text-green-700 dark:text-green-400 mb-3">
          Cuando se crea un contacto en tu CRM, envia los datos a esta URL. El sistema asigna automaticamente un vendedor.
        </p>
        <div class="flex items-center gap-2 mb-3">
          <code class="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono break-all border border-green-300 dark:border-green-700 dark:text-green-300">
            {{ webhookUrl }}
          </code>
          <button @click="copyWebhook" class="btn btn-secondary whitespace-nowrap text-sm">
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
        <details class="text-sm">
          <summary class="cursor-pointer text-green-700 dark:text-green-400 font-medium">Ver JSON requerido</summary>
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

      <!-- Webhook 2: Sistema responde al CRM -->
      <div class="border rounded-lg p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-blue-600 dark:text-blue-400 font-bold text-lg">2.</span>
          <h3 class="font-semibold text-blue-800 dark:text-blue-300">Sistema notifica asignacion al CRM</h3>
          <span class="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded">POST</span>
        </div>
        <p class="text-sm text-blue-700 dark:text-blue-400 mb-3">
          Cuando el sistema asigna un vendedor, envia los datos a tu CRM para actualizar el contacto.
        </p>
        <p class="text-xs text-blue-600 dark:text-blue-400 mb-2">Configurar en la pestana "Integracion" de abajo.</p>
        <details class="text-sm">
          <summary class="cursor-pointer text-blue-700 dark:text-blue-400 font-medium">Ver JSON enviado por el sistema</summary>
          <pre v-pre class="bg-white dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300 mt-2 border border-blue-200 dark:border-blue-700">{
  "contact_id": "abc123",
  "seller_user_id": "crm_user_id_del_vendedor",
  "seller_name": "Nombre del Vendedor",
  "team": "Equipo A"
}</pre>
        </details>
      </div>

      <!-- Webhook 3: Cambio de etapa -->
      <div class="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-purple-600 dark:text-purple-400 font-bold text-lg">3.</span>
          <h3 class="font-semibold text-purple-800 dark:text-purple-300">CRM notifica cambio de etapa</h3>
          <span class="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded">POST</span>
        </div>
        <p class="text-sm text-purple-700 dark:text-purple-400 mb-3">
          Cuando cambia la etapa de una oportunidad en tu CRM, envia los datos a esta URL para sincronizar el estado del lead.
        </p>
        <div class="flex items-center gap-2 mb-3">
          <code class="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono break-all border border-purple-300 dark:border-purple-700 dark:text-purple-300">
            {{ stageWebhookUrl }}
          </code>
          <button @click="copyStageWebhook" class="btn btn-secondary whitespace-nowrap text-sm">
            {{ copiedStage ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
        <details class="text-sm">
          <summary class="cursor-pointer text-purple-700 dark:text-purple-400 font-medium">Ver JSON requerido</summary>
          <pre v-pre class="bg-white dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300 mt-2 border border-purple-200 dark:border-purple-700">{
  "contact_id": "{{contact.id}}",
  "opportunity_stage": "{{opportunity.stage}}",
  "state": "{{contact.state}}"
}</pre>
        </details>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      <nav class="flex gap-2 sm:gap-4 min-w-max">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="[
            activeTab === tab.id
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- No tenant -->
    <div v-if="!authStore.tenantSlug" class="card text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">No hay tenant asociado a este usuario.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="configStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="configStore.error" class="card text-center py-12">
      <p class="text-red-500">{{ configStore.error }}</p>
      <button @click="configStore.fetchConfig()" class="btn btn-primary mt-4">Reintentar</button>
    </div>

    <!-- Content -->
    <div v-else-if="configStore.config" class="card">
      <TeamsConfig
        v-if="activeTab === 'teams'"
        :equipos="configStore.config.equipos"
        @update="configStore.updateTeams"
      />
      <PeriodConfig
        v-else-if="activeTab === 'period'"
        :fecha-inicio="configStore.config.fecha_inicio"
        :fecha-fin="configStore.config.fecha_fin"
        :week-start-day="configStore.config.week_start_day ?? null"
        :on-save="configStore.updatePeriod"
      />
      <StagesConfig
        v-else-if="activeTab === 'stages'"
        :stages="configStore.config.opportunity_stages"
        :on-save="configStore.updateStages"
      />
      <GhlConfig
        v-else-if="activeTab === 'ghl'"
        :ghl-webhook-url="configStore.config.ghl_webhook_url"
        :timezone="configStore.config.timezone"
        @update="configStore.updateGhlConfig"
      />
      <FallbackConfig
        v-else-if="activeTab === 'fallback'"
        :fallback-seller-ids="configStore.config.fallback_seller_ids || []"
        :on-save="configStore.updateFallback"
      />
      <SummaryConfig
        v-else-if="activeTab === 'summary'"
        :summary-enabled="configStore.config.summary_enabled ?? false"
        :summary-frequency="configStore.config.summary_frequency || 'daily'"
        :summary-time="configStore.config.summary_time || '08:00'"
        :summary-day="configStore.config.summary_day ?? 1"
        :summary-webhook-url="configStore.config.summary_webhook_url || ''"
        :on-save="configStore.updateSummaryConfig"
      />
    </div>
  </div>
</template>
