<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { subscriptionApi } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const status = ref('verifying') // verifying | success | error

onMounted(async () => {
  try {
    const tenantId = route.query.external_id || authStore.user?.tenant?.id
    if (!tenantId) {
      status.value = 'error'
      return
    }
    await subscriptionApi.verify(tenantId)
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <img src="/logo_leaddistro.png" alt="LeadDistro" class="h-16 mx-auto dark:brightness-0 dark:invert" />
      </div>

      <div class="card text-center py-8">

        <!-- Verificando -->
        <div v-if="status === 'verifying'">
          <div class="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">{{ t('paymentSuccess.verifying') }}</p>
        </div>

        <!-- Éxito -->
        <div v-else-if="status === 'success'">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('paymentSuccess.success.title') }}</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {{ t('paymentSuccess.success.desc') }}
          </p>
          <button @click="router.push('/login')" class="btn btn-primary w-full">
            {{ t('paymentSuccess.success.btn') }}
          </button>
        </div>

        <!-- Error -->
        <div v-else>
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('paymentSuccess.error.title') }}</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {{ t('paymentSuccess.error.desc') }}
          </p>
          <button @click="router.push('/login')" class="btn btn-secondary w-full">
            {{ t('paymentSuccess.error.btn') }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
