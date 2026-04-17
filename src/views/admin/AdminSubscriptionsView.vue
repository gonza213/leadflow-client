<script setup>
import { onMounted, ref, computed } from 'vue'
import { adminApi } from '../../services/api'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const subscriptions = ref([])
const loading = ref(false)
const filterStatus = ref('all')
const stats = ref({
  daily: 0,
  monthly: 0,
  yearly: 0
})
const pagination = ref({
  page: 1,
  pages: 1,
  total: 0
})

const fetchStats = async () => {
  try {
    const res = await adminApi.getRevenueStats()
    stats.value = res.data.stats
  } catch (e) {
    console.error('Error fetching revenue stats:', e)
  }
}

const fetchSubscriptions = async (page = 1) => {
  loading.value = true
  try {
    const res = await adminApi.getSubscriptions({ 
      page, 
      limit: 10,
      status: filterStatus.value !== 'all' ? filterStatus.value : undefined
    })
    subscriptions.value = res.data.data
    pagination.value = res.data.pagination
  } catch (e) {
    console.error('Error fetching subscriptions:', e)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.value.pages) {
    fetchSubscriptions(newPage)
  }
}

const driveLinked = ref(false)
const showSuccess = ref(false)

const fetchDriveStatus = async () => {
  try {
    const res = await adminApi.getGoogleDriveStatus()
    driveLinked.value = res.data.linked
  } catch (e) {
    console.error('Error fetching drive status:', e)
  }
}

const handleLinkDrive = async () => {
  try {
    const res = await adminApi.getGoogleAuthUrl()
    if (res.data.url) {
      window.location.href = res.data.url
    }
  } catch (e) {
    console.error('Error getting auth url:', e)
    alert(t('subscription.cancel_error'))
  }
}

onMounted(() => {
  fetchSubscriptions()
  fetchStats()
  fetchDriveStatus()
  
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('google') === 'linked') {
    showSuccess.value = true
    driveLinked.value = true
  }
})

const filteredSubscriptions = computed(() => {
  return subscriptions.value
})

const handleFilterChange = () => {
  fetchSubscriptions(1)
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    lifetime: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('admin.subscriptions.title') }}</h1>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500">{{ t('admin.subscriptions.filter') }}</label>
        <select 
          v-model="filterStatus" 
          @change="handleFilterChange"
          class="input py-1 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">{{ t('dashboard.filters.all') }}</option>
          <option value="active">{{ t('subscription.status.active') }}</option>
          <option value="trial">{{ t('subscription.status.trial') }}</option>
          <option value="inactive">{{ t('subscription.status.inactive') }}</option>
          <option value="lifetime">{{ t('subscription.status.lifetime') }}</option>
        </select>
      </div>
    </div>

    <!-- Google Drive Linking Banner -->
    <div v-if="showSuccess" class="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span class="font-medium text-sm">{{ t('admin.subscriptions.drive.success') }}</span>
    </div>

    <div v-else-if="!driveLinked" class="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-blue-900 dark:text-blue-100">{{ t('admin.subscriptions.drive.bannerTitle') }}</h3>
            <p class="text-sm text-blue-700 dark:text-blue-300">{{ t('admin.subscriptions.drive.bannerDesc') }}</p>
          </div>
        </div>
        <button @click="handleLinkDrive" class="btn bg-blue-600 hover:bg-blue-700 text-white border-none px-6 shadow-md">
          {{ t('admin.subscriptions.drive.btn') }}
        </button>
      </div>
    </div>
    
    <!-- Cards de Ingresos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-white/10 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 5V14m0 1c-1.11 0-2.08-.402-2.599-1M12 15V14m0 1v1m0-11a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-xs font-bold uppercase opacity-80">{{ t('admin.subscriptions.stats.today') }}</span>
        </div>
        <div class="text-3xl font-bold mb-1">${{ stats.daily }} <span class="text-lg font-normal opacity-80 text-blue-100">USD</span></div>
        <div class="text-xs text-blue-100">{{ t('admin.subscriptions.stats.todayDesc') }}</div>
      </div>

      <div class="card bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-white/10 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-xs font-bold uppercase opacity-80">{{ t('admin.subscriptions.stats.thisMonth') }}</span>
        </div>
        <div class="text-3xl font-bold mb-1">${{ stats.monthly }} <span class="text-lg font-normal opacity-80 text-emerald-100">USD</span></div>
        <div class="text-xs text-emerald-100">{{ t('admin.subscriptions.stats.thisMonthDesc', { month: new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'es-AR', { month: 'long' }) }) }}</div>
      </div>

      <div class="card bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-white/10 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span class="text-xs font-bold uppercase opacity-80">{{ t('admin.subscriptions.stats.thisYear') }}</span>
        </div>
        <div class="text-3xl font-bold mb-1">${{ stats.yearly }} <span class="text-lg font-normal opacity-80 text-indigo-100">USD</span></div>
        <div class="text-xs text-indigo-100">{{ t('admin.subscriptions.stats.thisYearDesc', { year: new Date().getFullYear() }) }}</div>
      </div>
    </div>

    <div v-if="loading" class="card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('admin.subscriptions.table.tenant') }}</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('admin.subscriptions.table.status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('admin.subscriptions.table.expiry') }}</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('admin.subscriptions.table.users') }}</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('admin.subscriptions.table.totalLeads') }}</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('admin.subscriptions.table.createdAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="sub in filteredSubscriptions" :key="sub._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900 dark:text-white">{{ sub.name }}</div>
                <div class="text-xs text-gray-500">{{ sub.slug }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide', getStatusClass(sub.subscriptionStatus)]">
                  {{ sub.subscriptionStatus }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(sub.subscriptionExpiresAt) }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                {{ sub.userCount }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                {{ sub.leadCount }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-gray-500">
                {{ formatDate(sub.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredSubscriptions.length === 0" class="p-12 text-center text-gray-500">
        {{ t('admin.subscriptions.table.empty') }}
      </div>
    </div>

    <!-- Paginacion -->
    <div v-if="pagination.total > 0" class="flex items-center justify-between">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('admin.subscriptions.table.showing', { n: filteredSubscriptions.length, total: pagination.total }) }}
      </div>
      <div v-if="pagination.pages > 1" class="flex gap-2">
        <button
          @click="handlePageChange(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="btn btn-secondary btn-sm"
          :class="{ 'opacity-50 cursor-not-allowed': pagination.page === 1 }"
        >
          {{ t('leads.pagination.prev') }}
        </button>
        <button
          @click="handlePageChange(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="btn btn-secondary btn-sm"
          :class="{ 'opacity-50 cursor-not-allowed': pagination.page === pagination.pages }"
        >
          {{ t('leads.pagination.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
