<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const companyName = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  if (!companyName.value || !name.value || !email.value || !password.value) {
    error.value = 'Todos los campos son requeridos'
    return
  }
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  loading.value = true
  try {
    const res = await api.post('/auth/register-tenant', {
      companyName: companyName.value,
      name: name.value,
      email: email.value,
      password: password.value
    })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    authStore.token = token
    authStore.user = user
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al registrarse'
  } finally {
    loading.value = false
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
        <router-link to="/landing" class="inline-flex items-center justify-center transition-transform hover:scale-105">
          <img src="/logo_leaddistro.png" alt="LeadDistro" class="h-20 dark:brightness-0 dark:invert" />
        </router-link>
        <p class="mt-3 text-gray-600 dark:text-gray-400">Distribución inteligente de leads</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">Crear cuenta</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">7 días gratis, sin tarjeta de crédito</p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Nombre de la empresa</label>
            <input v-model="companyName" type="text" class="input" placeholder="Ej: Mi Agencia" autocomplete="organization" />
          </div>

          <div>
            <label class="label">Tu nombre</label>
            <input v-model="name" type="text" class="input" placeholder="Juan García" autocomplete="name" />
          </div>

          <div>
            <label class="label">Email</label>
            <input v-model="email" type="email" class="input" placeholder="tu@email.com" autocomplete="email" />
          </div>

          <div>
            <label class="label">Contraseña</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                placeholder="Mínimo 6 caracteres"
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

          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta gratis' }}
          </button>

          <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            ¿Ya tenés cuenta?
            <router-link to="/login" class="text-blue-600 dark:text-blue-400 hover:underline">Iniciá sesión</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
