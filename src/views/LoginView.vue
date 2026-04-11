<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

// Forgot password
const showForgot = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotSent = ref(false)
const forgotError = ref('')

const handleSubmit = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Por favor ingresa email y contrasena'
    return
  }

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    if (authStore.isSuperAdmin) {
      router.push('/admin/tenants')
    } else {
      router.push('/')
    }
  } else {
    error.value = result.error
  }
}

const openForgot = () => {
  forgotEmail.value = email.value
  forgotError.value = ''
  forgotSent.value = false
  showForgot.value = true
}

const handleForgot = async () => {
  forgotError.value = ''
  if (!forgotEmail.value) {
    forgotError.value = 'Ingresá tu email'
    return
  }
  forgotLoading.value = true
  try {
    await api.post('/auth/forgot-password', { email: forgotEmail.value })
    forgotSent.value = true
  } catch {
    forgotError.value = 'Ocurrió un error. Intentá de nuevo.'
  } finally {
    forgotLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 py-12 px-4 transition-colors">
    <!-- Dark mode toggle -->
    <button
      @click="uiStore.toggleDarkMode"
      class="fixed top-4 right-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
        <router-link to="/" class="inline-flex items-center justify-center gap-3 transition-transform hover:scale-105">
          <img src="/logo_leaddistro.png" alt="LeadDistro Logo" class="h-20 dark:brightness-0 dark:invert" />
        </router-link>
        <p class="mt-3 text-gray-600 dark:text-gray-400">Distribucion inteligente de leads</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Iniciar sesion</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Email</label>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="tu@email.com"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="label">Contrasena</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                placeholder="********"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
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

          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

          <div class="text-center">
            <button
              type="button"
              @click="openForgot"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal recuperar contraseña -->
    <div v-if="showForgot" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recuperar contraseña</h3>

        <div v-if="forgotSent" class="text-center py-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-gray-700 dark:text-gray-300 text-sm">Si el email está registrado, recibirás un enlace para restablecer tu contraseña.</p>
          <button @click="showForgot = false" class="mt-4 btn btn-primary w-full">Cerrar</button>
        </div>

        <template v-else>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
          <div class="space-y-3">
            <input
              v-model="forgotEmail"
              type="email"
              class="input"
              placeholder="tu@email.com"
              @keyup.enter="handleForgot"
            />
            <div v-if="forgotError" class="text-sm text-red-600 dark:text-red-400">{{ forgotError }}</div>
            <div class="flex gap-2">
              <button type="button" @click="showForgot = false" class="btn btn-secondary flex-1">Cancelar</button>
              <button type="button" @click="handleForgot" :disabled="forgotLoading" class="btn btn-primary flex-1">
                {{ forgotLoading ? 'Enviando...' : 'Enviar enlace' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
