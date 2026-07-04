<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import { authApi } from '../services/api'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const accounts = ref([])
const loading = ref(true)
const error = ref('')

const showCreate = ref(false)
const companyName = ref('')
const creating = ref(false)
const createError = ref('')

const enteringId = ref(null)
const enterError = ref('')

const fetchAccounts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await authApi.getAccounts()
    accounts.value = res.data.accounts
  } catch (e) {
    error.value = e.response?.data?.message || t('accounts.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAccounts)

const handleCreate = async () => {
  createError.value = ''
  if (!companyName.value.trim()) {
    createError.value = t('auth.requiredFields')
    return
  }
  creating.value = true
  try {
    await authApi.createAccount(companyName.value.trim())
    companyName.value = ''
    showCreate.value = false
    await fetchAccounts()
  } catch (e) {
    createError.value = e.response?.data?.message || t('accounts.createError')
  } finally {
    creating.value = false
  }
}

const handleEnter = async (account) => {
  enterError.value = ''
  enteringId.value = account.id
  try {
    const res = await authApi.enterAccount(account.id)
    authStore.setActiveAccount(res.data.user)
    router.push('/')
  } catch (e) {
    if (e.response?.data?.message === 'subscription_inactive') {
      enterError.value = t('auth.subscriptionInactive')
    } else {
      enterError.value = e.response?.data?.message || t('accounts.enterError')
    }
  } finally {
    enteringId.value = null
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('accounts.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ t('accounts.subtitle') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
        {{ error }}
      </div>

      <div v-if="enterError" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm flex flex-wrap items-center gap-2">
        <span>{{ enterError }}</span>
        <router-link to="/cuentas/suscripcion" class="font-semibold underline">{{ t('accounts.renew') }} →</router-link>
      </div>

      <!-- Empty state -->
      <div v-if="accounts.length === 0" class="card text-center py-10">
        <p class="text-gray-600 dark:text-gray-400">{{ t('accounts.empty') }}</p>
      </div>

      <!-- Account cards -->
      <div class="space-y-3">
        <button
          v-for="account in accounts"
          :key="account.id"
          @click="handleEnter(account)"
          :disabled="enteringId !== null"
          class="card w-full flex items-center justify-between gap-4 text-left hover:border-primary-400 dark:hover:border-primary-500 border border-transparent transition-colors disabled:opacity-60"
        >
          <div class="min-w-0">
            <p class="font-semibold text-gray-900 dark:text-white truncate">{{ account.name }}</p>
          </div>
          <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 flex-shrink-0">
            <div v-if="enteringId === account.id" class="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <span class="text-sm font-medium">{{ t('accounts.enter') }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Create account -->
      <div>
        <button
          v-if="!showCreate"
          @click="showCreate = true"
          class="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
        >
          + {{ t('accounts.create') }}
        </button>

        <div v-else class="card">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-3">{{ t('accounts.createTitle') }}</h2>
          <form @submit.prevent="handleCreate" class="space-y-3">
            <div>
              <label class="label">{{ t('auth.companyName') }}</label>
              <input v-model="companyName" type="text" class="input" :placeholder="t('auth.companyPlaceholder')" autocomplete="organization" />
            </div>
            <div v-if="createError" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {{ createError }}
            </div>
            <div class="flex gap-2">
              <button type="submit" class="btn btn-primary flex-1" :disabled="creating">
                {{ creating ? t('accounts.creating') : t('accounts.create') }}
              </button>
              <button type="button" @click="showCreate = false" class="btn btn-secondary">
                {{ t('common.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
