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

const togglingId = ref(null)
const handleToggleActive = async (account) => {
  togglingId.value = account.id
  try {
    await authApi.updateAccount(account.id, { active: !account.active })
    await fetchAccounts()
  } catch (e) {
    error.value = e.response?.data?.message || t('accounts.enterError')
  } finally {
    togglingId.value = null
  }
}

const deletingId = ref(null)
const handleDelete = async (account) => {
  if (!confirm(t('admin.tenants.deleteConfirm', { name: account.name }))) return
  deletingId.value = account.id
  try {
    await authApi.deleteAccount(account.id)
    // Si la empresa eliminada era la seleccionada, limpiar el contexto local
    if (authStore.user?.tenant?.id === account.id) {
      authStore.setActiveAccount({ ...authStore.user, tenant: null })
    }
    await fetchAccounts()
  } catch (e) {
    error.value = e.response?.data?.message || t('accounts.enterError')
  } finally {
    deletingId.value = null
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
        <div
          v-for="account in accounts"
          :key="account.id"
          class="card flex flex-wrap items-center justify-between gap-4"
          :class="{ 'opacity-70': !account.active }"
        >
          <div class="min-w-0">
            <p class="font-semibold text-gray-900 dark:text-white truncate">{{ account.name }}</p>
            <span v-if="!account.active" class="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {{ t('dashboard.summary.disabled') }}
            </span>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Pausar / Activar -->
            <button
              @click="handleToggleActive(account)"
              :disabled="togglingId !== null || deletingId !== null"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {{ togglingId === account.id ? '…' : (account.active ? t('common.deactivate') : t('common.activate')) }}
            </button>

            <!-- Eliminar -->
            <button
              @click="handleDelete(account)"
              :disabled="togglingId !== null || deletingId !== null"
              :title="t('common.delete')"
              class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              <div v-if="deletingId === account.id" class="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <!-- Entrar -->
            <button
              @click="handleEnter(account)"
              :disabled="enteringId !== null || deletingId !== null"
              class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50"
            >
              <div v-if="enteringId === account.id" class="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              {{ t('accounts.enter') }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
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
