<script setup>
import { onMounted, ref, computed } from 'vue'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import { subscriptionApi } from '../services/api'
import TeamsConfig from '../components/config/TeamsConfig.vue'
import PeriodConfig from '../components/config/PeriodConfig.vue'
import StagesConfig from '../components/config/StagesConfig.vue'
import FallbackConfig from '../components/config/FallbackConfig.vue'
import SummaryConfig from '../components/config/SummaryConfig.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { t } = useI18n()
const activeTab = ref('teams')

const tabs = [
  { id: 'teams', name: t('config.tabs.teams'), icon: 'users' },
  { id: 'period', name: t('config.tabs.period'), icon: 'calendar' },
  { id: 'stages', name: t('config.tabs.stages'), icon: 'layers' },
  { id: 'fallback', name: t('config.tabs.fallback'), icon: 'shield' },
  { id: 'summary', name: t('config.tabs.summary'), icon: 'sparkles' },
  { id: 'subscription', name: t('config.tabs.subscription'), icon: 'credit-card' }
]

// Cancelación
const cancelling = ref(false)
const cancelError = ref('')
const cancelSuccess = ref(false)
const showCancelConfirm = ref(false)

const subStatus = computed(() => authStore.user?.tenant?.subscriptionStatus)
const subExpiresAt = computed(() => authStore.user?.tenant?.subscriptionExpiresAt)
const trialEndsAt = computed(() => authStore.user?.tenant?.trialEndsAt)

const statusLabel = computed(() => {
  const map = { trial: t('subscription.status.trial'), active: t('subscription.status.active'), inactive: t('subscription.status.inactive'), lifetime: t('subscription.status.lifetime') }
  return map[subStatus.value] || subStatus.value
})

const handleCancel = async () => {
  cancelling.value = true
  cancelError.value = ''
  try {
    await subscriptionApi.cancel()
    cancelSuccess.value = true
    showCancelConfirm.value = false
    await authStore.fetchUser()
  } catch (e) {
    cancelError.value = e.response?.data?.message || t('subscription.cancel_error')
  } finally {
    cancelling.value = false
  }
}

onMounted(async () => {
  await configStore.fetchConfig()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('config.title') }}</h1>
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
      <p class="text-gray-500 dark:text-gray-400">{{ t('config.no_tenant') }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="configStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="configStore.error" class="card text-center py-12">
      <p class="text-red-500">{{ configStore.error }}</p>
      <button @click="configStore.fetchConfig()" class="btn btn-primary mt-4">{{ t('common.retry') }}</button>
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
        :timezone="configStore.config.timezone"
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

      <!-- Suscripción -->
      <div v-else-if="activeTab === 'subscription'" class="space-y-6">
        <div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">{{ t('subscription.title') }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('subscription.info') }}</p>
        </div>

        <!-- Estado actual -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('subscription.status.label') }}</span>
            <span
              class="text-xs font-semibold px-3 py-1 rounded-full"
              :class="{
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': subStatus === 'trial',
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': subStatus === 'active',
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': subStatus === 'inactive',
                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': subStatus === 'lifetime'
              }"
            >{{ statusLabel }}</span>
          </div>

          <div v-if="subStatus === 'trial' && trialEndsAt" class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('subscription.trial_ends') }}</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ new Date(trialEndsAt).toLocaleDateString() }}</span>
          </div>

          <div v-if="subStatus === 'active' && subExpiresAt" class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('subscription.next_renewal') }}</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ new Date(subExpiresAt).toLocaleDateString() }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('subscription.plan') }}</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ subStatus === 'lifetime' ? t('subscription.lifetime_plan') : t('subscription.monthly_plan') }}</span>
          </div>
        </div>

        <!-- Suscribirse (trial o inactivo) -->
        <div v-if="subStatus === 'trial' || subStatus === 'inactive'" class="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5 space-y-3">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            {{ subStatus === 'trial' ? t('subscription.trial_message') : t('subscription.inactive_message') }}
          </p>
          <a
            :href="'https://checkout.dlocalgo.com/validate/subscription/jlZVHZj9raWC65A7dr64sH9V7m4Yn2fS'"
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {{ t('subscription.subscribe_button') }} →
          </a>
        </div>

        <!-- Cancelar (solo activo) -->
        <div v-if="subStatus === 'active'">
          <div v-if="cancelSuccess" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-800 dark:text-green-300">
            {{ t('subscription.cancel_success') }}
          </div>

          <template v-else>
            <div v-if="!showCancelConfirm">
              <button
                @click="showCancelConfirm = true"
                class="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 underline transition-colors"
              >
                {{ t('subscription.cancel_action') }}
              </button>
            </div>

            <div v-else class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5 space-y-3">
              <p class="text-sm font-semibold text-red-800 dark:text-red-300">{{ t('subscription.confirm_cancel_title') }}</p>
              <p class="text-sm text-red-700 dark:text-red-400">{{ t('subscription.confirm_cancel_text') }}</p>
              <div v-if="cancelError" class="text-sm text-red-600 dark:text-red-400">{{ cancelError }}</div>
              <div class="flex gap-3">
                <button
                  @click="showCancelConfirm = false"
                  class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {{ t('common.back') }}
                </button>
                <button
                  @click="handleCancel"
                  :disabled="cancelling"
                  class="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                >
                  {{ cancelling ? t('common.loading') : t('subscription.confirm_cancel_button') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
