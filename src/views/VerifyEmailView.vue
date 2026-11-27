<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { homeRoute } from '../utils/homeRoute'
import ResendVerification from '../components/auth/ResendVerification.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref('verifying') // verifying | invalid | inactive | tooMany | error
const email = ref('')

const verify = async () => {
  status.value = 'verifying'
  const result = await authStore.verifyEmail(route.params.token)
  if (result.success) return router.replace(homeRoute(authStore))
  // Email confirmado, pero la entrada sigue en el login (segundo paso o suscripción)
  if (result.twoFactorRequired) return router.replace('/login')
  if (result.error === 'invalid_or_expired_token') status.value = 'invalid'
  else if (result.error === 'subscription_inactive') status.value = 'inactive'
  else status.value = result.status === 429 ? 'tooMany' : 'error'
}

onMounted(verify)
</script>

<template>
  <div class="auth-shell min-h-screen flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <router-link to="/landing" class="inline-flex items-center justify-center">
          <img src="/logo_leaddistro_light.png" alt="LeadDistro" class="h-20 dark:hidden" /><img src="/logo_leaddistro.png" alt="LeadDistro" class="h-20 hidden dark:block brightness-0 invert" />
        </router-link>
      </div>

      <div class="card auth-card text-center space-y-4">
        <template v-if="status === 'verifying'">
          <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-gray-600 dark:text-gray-400">{{ t('security.verify.verifying') }}</p>
        </template>

        <template v-else-if="status === 'invalid'">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('security.verify.invalidTitle') }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('security.verify.invalidDesc') }}</p>
          <input v-model="email" type="email" class="input" :placeholder="t('auth.email')" autocomplete="email" />
          <ResendVerification :email="email" :label="t('security.verify.resendLink')" />
        </template>

        <template v-else-if="status === 'inactive'">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('security.verify.confirmedTitle') }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('auth.subscriptionInactive') }}</p>
        </template>

        <template v-else>
          <p class="text-sm text-red-600 dark:text-red-400">{{ status === 'tooMany' ? t('security.tooMany') : t('common.error') }}</p>
          <button type="button" class="btn btn-primary w-full" @click="verify">{{ t('security.retry') }}</button>
        </template>

        <router-link v-if="status !== 'verifying'" to="/login" class="auth-link text-sm inline-block">{{ t('security.backToLogin') }}</router-link>
      </div>
    </div>
  </div>
</template>
