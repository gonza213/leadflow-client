<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { subscriptionApi } from './services/api'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

const verifying = ref(false)
const verifyError = ref('')
const verifySuccess = ref(false)

const showLayout = computed(() => {
  return authStore.isAuthenticated && route.name !== 'Login' && route.name !== 'Landing'
})

const handleVerifyPayment = async () => {
  verifying.value = true
  verifyError.value = ''
  try {
    await subscriptionApi.verify()
    verifySuccess.value = true
    // Refrescar datos del usuario para actualizar subscriptionStatus
    await authStore.fetchUser()
  } catch (e) {
    verifyError.value = e.response?.data?.message || t('trial.banner.error')
  } finally {
    verifying.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <template v-if="showLayout">
      <AppHeader />
      <!-- Banner trial -->
      <div
        v-if="authStore.subscriptionStatus === 'trial' && authStore.trialDaysLeft !== null"
        class="fixed top-16 left-0 right-0 z-40 lg:pl-64"
      >
        <div :class="['px-4 py-2 text-sm font-medium', authStore.trialDaysLeft <= 2 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900']">
          <div class="flex flex-wrap items-center justify-center gap-3">
            <span v-if="authStore.trialDaysLeft > 0">
              {{ t('trial.banner.expiresIn') }} <strong>{{ authStore.trialDaysLeft }} {{ authStore.trialDaysLeft === 1 ? t('trial.banner.day') : t('trial.banner.days') }}</strong>.
            </span>
            <span v-else>{{ t('trial.banner.expired') }}</span>
            <a
              href="https://checkout.dlocalgo.com/validate/subscription/jlZVHZj9raWC65A7dr64sH9V7m4Yn2fS"
              target="_blank"
              :class="['underline font-bold', authStore.trialDaysLeft <= 2 ? 'text-white' : 'text-yellow-900']"
            >{{ t('trial.banner.subscribe') }} →</a>
            <button
              v-if="!verifySuccess"
              @click="handleVerifyPayment"
              :disabled="verifying"
              :class="['text-xs px-3 py-1 rounded-full font-semibold border', authStore.trialDaysLeft <= 2 ? 'border-white text-white hover:bg-red-400' : 'border-yellow-800 text-yellow-900 hover:bg-yellow-500']"
            >{{ verifying ? t('trial.banner.verifying') : t('trial.banner.verifyBtn') }}</button>
            <span v-if="verifySuccess" class="text-xs font-semibold">✓ {{ t('trial.banner.success') }}</span>
            <span v-if="verifyError" class="text-xs opacity-90">{{ verifyError }}</span>
          </div>
        </div>
      </div>
      <div class="flex min-w-0">
        <AppSidebar />
        <main :class="['flex-1 w-0 min-w-0 p-4 lg:p-6 lg:ml-64 overflow-x-hidden', authStore.subscriptionStatus === 'trial' ? 'mt-24' : 'mt-16']">
          <router-view />
        </main>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>
