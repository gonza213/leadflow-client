<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { authApi, subscriptionApi } from '../services/api'

const { t, locale } = useI18n()

const SUBSCRIBE_URL = 'https://checkout.dlocalgo.com/validate/subscription/jlZVHZj9raWC65A7dr64sH9V7m4Yn2fS'

const billing = ref(null)
const loading = ref(true)
const subStatus = computed(() => billing.value?.subscriptionStatus)

const payments = ref([])
const paymentsLoading = ref(false)

const fetchBilling = async () => {
  loading.value = true
  try {
    const res = await authApi.getAccounts()
    billing.value = res.data.billing
  } catch (e) {
    console.error('Error fetching billing:', e)
  } finally {
    loading.value = false
  }
}

const fetchInvoices = async () => {
  paymentsLoading.value = true
  try {
    const res = await subscriptionApi.getMyInvoices()
    payments.value = res.data.payments
  } catch (e) {
    console.error('Error fetching invoices:', e)
  } finally {
    paymentsLoading.value = false
  }
}

onMounted(() => {
  fetchBilling()
  fetchInvoices()
})

const statusLabel = computed(() => {
  const map = {
    trial: t('subscription.status.trial'),
    active: t('subscription.status.active'),
    inactive: t('subscription.status.inactive'),
    lifetime: t('subscription.status.lifetime')
  }
  return map[subStatus.value] || subStatus.value
})

const statusClass = computed(() => {
  switch (subStatus.value) {
    case 'active':
    case 'lifetime':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'trial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    default:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const verifying = ref(false)
const verifyError = ref('')
const handleVerify = async () => {
  verifying.value = true
  verifyError.value = ''
  try {
    await subscriptionApi.verify()
    await Promise.all([fetchBilling(), fetchInvoices()])
  } catch (e) {
    verifyError.value = e.response?.data?.message || t('trial.banner.error')
  } finally {
    verifying.value = false
  }
}

const cancelling = ref(false)
const cancelError = ref('')
const cancelSuccess = ref(false)
const showCancelConfirm = ref(false)
const handleCancel = async () => {
  cancelling.value = true
  cancelError.value = ''
  try {
    await subscriptionApi.cancel()
    cancelSuccess.value = true
    showCancelConfirm.value = false
    await fetchBilling()
  } catch (e) {
    cancelError.value = e.response?.data?.message || t('subscription.cancel_error')
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('subscription.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ t('subscription.info') }}</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Estado actual (una sola suscripción cubre todas las empresas) -->
      <div class="card space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('subscription.status.label') }}</span>
          <span class="text-xs font-semibold px-3 py-1 rounded-full" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <div v-if="subStatus === 'trial' && billing?.trialEndsAt" class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('subscription.trial_ends') }}</span>
          <span class="text-sm text-gray-900 dark:text-white">{{ new Date(billing.trialEndsAt).toLocaleDateString() }}</span>
        </div>
        <div v-if="subStatus === 'active' && billing?.subscriptionExpiresAt" class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('subscription.next_renewal') }}</span>
          <span class="text-sm text-gray-900 dark:text-white">{{ new Date(billing.subscriptionExpiresAt).toLocaleDateString() }}</span>
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
        <div class="flex flex-wrap items-center gap-3">
          <a :href="SUBSCRIBE_URL" target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            {{ t('subscription.subscribe_button') }} →
          </a>
          <button @click="handleVerify" :disabled="verifying"
            class="text-sm px-3 py-2 rounded-lg font-semibold border border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50">
            {{ verifying ? t('trial.banner.verifying') : t('trial.banner.verifyBtn') }}
          </button>
          <span v-if="verifyError" class="text-xs text-red-600 dark:text-red-400">{{ verifyError }}</span>
        </div>
      </div>

      <!-- Cancelar (solo activo) -->
      <div v-if="subStatus === 'active'">
        <div v-if="cancelSuccess" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-800 dark:text-green-300">
          {{ t('subscription.cancel_success') }}
        </div>
        <template v-else>
          <button v-if="!showCancelConfirm" @click="showCancelConfirm = true"
            class="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 underline transition-colors">
            {{ t('subscription.cancel_action') }}
          </button>
          <div v-else class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5 space-y-3">
            <p class="text-sm font-semibold text-red-800 dark:text-red-300">{{ t('subscription.confirm_cancel_title') }}</p>
            <p class="text-sm text-red-700 dark:text-red-400">{{ t('subscription.confirm_cancel_text') }}</p>
            <div v-if="cancelError" class="text-sm text-red-600 dark:text-red-400">{{ cancelError }}</div>
            <div class="flex gap-3">
              <button @click="showCancelConfirm = false"
                class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {{ t('common.back') }}
              </button>
              <button @click="handleCancel" :disabled="cancelling"
                class="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
                {{ cancelling ? t('common.loading') : t('subscription.confirm_cancel_button') }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Recibos -->
      <div class="card overflow-hidden !p-0">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 class="font-semibold text-gray-900 dark:text-white">{{ t('billing.title') }}</h2>
        </div>

        <div v-if="paymentsLoading" class="p-12 text-center">
          <div class="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="payments.length === 0" class="p-10 text-center">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">{{ t('billing.table.noInvoices') }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ t('billing.table.emptyInfo') }}</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('billing.table.date') }}</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('billing.table.concept') }}</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('billing.table.amount') }}</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{{ t('billing.table.action') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="payment in payments" :key="payment._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(payment.date) }}</td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ t('billing.table.monthlySubscription') }}</div>
                  <div class="text-xs text-gray-500">{{ t('billing.table.planStandard') }}</div>
                </td>
                <td class="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">${{ payment.amount.toFixed(2) }} USD</td>
                <td class="px-6 py-4 text-right">
                  <a v-if="payment.downloadUrl" :href="payment.downloadUrl" target="_blank"
                    class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {{ t('billing.table.download') }}
                  </a>
                  <span v-else class="text-xs text-gray-400 italic">{{ t('billing.table.generating') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
