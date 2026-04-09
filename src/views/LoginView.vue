<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const email = ref('')
const password = ref('')
const error = ref('')

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
          <img src="/favicon.svg" alt="LeadFlow Logo" class="w-10 h-10 shadow-lg shadow-blue-500/30 rounded-xl" />
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">LeadFlow</h1>
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
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="********"
              autocomplete="current-password"
            />
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
        </form>
      </div>
    </div>
  </div>
</template>
