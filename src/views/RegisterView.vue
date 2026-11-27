<script setup>
import { ref } from 'vue'
import { useUiStore } from '../stores/ui'
import { useI18n } from 'vue-i18n'
import { authApi } from '../services/api'
import ResendVerification from '../components/auth/ResendVerification.vue'

const { t, locale } = useI18n()

const uiStore = useUiStore()


const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const acceptedTerms = ref(false)
const loading = ref(false)
const error = ref('')
// Email al que se envió la verificación: con valor, se muestra "Revisá tu email"
const sentTo = ref('')

const handleSubmit = async () => {
  error.value = ''
  if (!name.value || !email.value || !password.value) {
    error.value = t('auth.requiredFields')
    return
  }
  if (password.value.length < 8) {
    error.value = t('auth.passwordTooShort')
    return
  }
  if (!acceptedTerms.value) {
    error.value = t('auth.acceptTermsError')
    return
  }
  loading.value = true
  try {
    // Crea solo la identidad del dueño; las cuentas (tenants) se crean en /cuentas.
    // No hay sesión hasta confirmar el email
    const res = await authApi.registerOwner({
      name: name.value,
      email: email.value,
      password: password.value,
      locale: locale.value
    })
    sentTo.value = res.data.email
  } catch (e) {
    error.value = e.response?.data?.message || t('auth.registerError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-shell min-h-screen flex items-center justify-center py-12 px-4">
    <!-- Dark mode toggle -->
    <button
      @click="uiStore.toggleDarkMode"
      class="auth-theme-btn fixed top-4 right-4"
    >
      <svg v-if="uiStore.darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>

    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <router-link to="/landing" class="inline-flex items-center justify-center transition-transform hover:scale-105">
          <img src="/logo_leaddistro_light.png" alt="LeadDistro" class="h-20 dark:hidden" /><img src="/logo_leaddistro.png" alt="LeadDistro" class="h-20 hidden dark:block brightness-0 invert" />
        </router-link>
        <p class="auth-tagline mt-3">LeadDistro — {{ t('hero.title') }}</p>
      </div>

      <div v-if="sentTo" class="card auth-card text-center space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('security.verify.checkTitle') }}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('security.verify.sentTo') }} <strong class="break-all text-gray-900 dark:text-white">{{ sentTo }}</strong>
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('security.verify.checkDesc') }}</p>
        <ResendVerification :email="sentTo" just-sent />
        <router-link to="/login" class="auth-link text-sm inline-block">{{ t('security.backToLogin') }}</router-link>
      </div>

      <div v-else class="card auth-card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">{{ t('auth.register') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ t('hero.trust.trial') }}, {{ t('hero.trust.noCard') }}</p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">{{ t('auth.yourName') }}</label>
            <input v-model="name" type="text" class="input" :placeholder="t('auth.namePlaceholder')" autocomplete="name" />
          </div>

          <div>
            <label class="label">{{ t('auth.email') }}</label>
            <input v-model="email" type="email" class="input" placeholder="tu@email.com" autocomplete="email" />
          </div>

          <div>
            <label class="label">{{ t('auth.password') }}</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                :placeholder="t('auth.passwordMin')"
                autocomplete="new-password"
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Términos y condiciones -->
          <div class="flex items-start gap-3">
            <input
              id="terms"
              v-model="acceptedTerms"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-gray-300 auth-check cursor-pointer flex-shrink-0"
            />
            <label for="terms" class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
              {{ t('auth.acceptTerms') }}
              <router-link to="/terms" target="_blank" class="auth-link">{{ t('auth.termsOfService') }}</router-link>
              {{ t('auth.andThe') }}
              <router-link to="/privacy" target="_blank" class="auth-link">{{ t('auth.privacyPolicy') }}</router-link>
            </label>
          </div>

          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading || !acceptedTerms">
            {{ loading ? t('auth.creating') : t('auth.createFreeAccount') }}
          </button>

          <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            {{ t('auth.hasAccount') }}
            <router-link to="/login" class="auth-link">{{ t('auth.login') }}</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
