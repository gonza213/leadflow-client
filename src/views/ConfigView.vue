<script setup>
import { onMounted, ref } from 'vue'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import TeamsConfig from '../components/config/TeamsConfig.vue'
import PeriodConfig from '../components/config/PeriodConfig.vue'
import StagesConfig from '../components/config/StagesConfig.vue'
import FallbackConfig from '../components/config/FallbackConfig.vue'
import SummaryConfig from '../components/config/SummaryConfig.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const activeTab = ref('teams')

const tabs = [
  { id: 'teams', name: 'Equipos', icon: 'users' },
  { id: 'period', name: 'Período', icon: 'calendar' },
  { id: 'stages', name: 'Etapas', icon: 'layers' },
  { id: 'fallback', name: 'Respaldo', icon: 'shield' },
  { id: 'summary', name: 'Resumen IA', icon: 'sparkles' }
]

onMounted(async () => {
  await configStore.fetchConfig()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Configuracion</h1>
    </div>

    <!-- Tabs mobile: grid 2 cols -->
    <div class="grid grid-cols-2 gap-2 sm:hidden">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-center"
        :class="[
          activeTab === tab.id
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Tabs desktop: barra horizontal -->
    <div class="hidden sm:block border-b border-gray-200 dark:border-gray-700">
      <nav class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
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
