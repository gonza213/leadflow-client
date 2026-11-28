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
// Pagos "manual" (activaciones a mano desde el admin) y últimos pagos con su cliente
const manualStats = ref(null)
const recentPayments = ref([])
const PROVIDER_META = {
  paddle: { label: 'Paddle', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  manual: { label: 'Manual (admin)', cls: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
  dlocalgo: { label: 'dLocalGo (anterior)', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }
}
const providerMeta = (p) => PROVIDER_META[p] || { label: p, cls: 'bg-gray-100 text-gray-700' }
const formatMoney = (amount, currency = 'USD') => {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount) } catch { return `${currency} ${amount}` }
}
const pagination = ref({
  page: 1,
  pages: 1,
  total: 0
})

const fetchStats = async () => {
  try {
    const res = await adminApi.getRevenueStats()
    stats.value = res.data.stats
    manualStats.value = res.data.manual || null
    recentPayments.value = res.data.recentPayments || []
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

// Filas desplegadas (empresas + historial de pagos de la cuenta)
const expanded = ref(new Set())
const toggleRow = (id) => {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}
// Vencimiento que importa según el estado
const expiryOf = (acc) => acc.subscriptionStatus === 'trial' ? acc.trialEndsAt : acc.subscriptionExpiresAt
const isPast = (d) => d && new Date(d).getTime() < Date.now()

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
  return new Date(date).toLocaleDateString(({ en: 'en-US', 'pt-BR': 'pt-BR' }[locale.value] || 'es-AR'), {
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
        <div class="text-xs text-emerald-100">{{ t('admin.subscriptions.stats.thisMonthDesc', { month: new Date().toLocaleDateString(({ en: 'en-US', 'pt-BR': 'pt-BR' }[locale] || 'es-AR'), { month: 'long' }) }) }}</div>
      </div>

      <div class="card bg-gradient-to-br from-gray-800 to-gray-950 text-white border-none shadow-lg">
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

    <p class="text-xs text-gray-500 dark:text-gray-400 -mt-2">
      Los ingresos cuentan solo cobros reales de la pasarela (Paddle).
      <template v-if="manualStats && manualStats.yearlyCount">
        Aparte hay {{ manualStats.yearlyCount }} pago(s) manual(es) este año ({{ formatMoney(manualStats.yearly) }}), generados al activar cuentas a mano desde el admin: no es plata cobrada.
      </template>
    </p>

    <!-- Últimos pagos -->
    <div class="card p-0 overflow-hidden">
      <div class="px-6 pt-5 pb-3">
        <h2 class="font-semibold text-gray-900 dark:text-white">Últimos pagos</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400">Los 20 más recientes, con su cliente y de dónde salió cada uno.</p>
      </div>
      <div v-if="recentPayments.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-800 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-2.5">Fecha</th>
              <th class="px-6 py-2.5">Cliente</th>
              <th class="px-6 py-2.5">Origen</th>
              <th class="px-6 py-2.5 text-right">Monto</th>
              <th class="px-6 py-2.5">ID del cobro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="p in recentPayments" :key="p.id">
              <td class="px-6 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ formatDate(p.date) }}</td>
              <td class="px-6 py-3">
                <template v-if="p.client">
                  <div class="font-medium text-gray-900 dark:text-white">{{ p.client.name }}</div>
                  <div class="text-xs text-gray-500">{{ p.client.type === 'owner' ? p.client.email : p.client.slug }}</div>
                </template>
                <span v-else class="text-gray-400">Sin cliente (borrado)</span>
              </td>
              <td class="px-6 py-3"><span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', providerMeta(p.provider).cls]">{{ providerMeta(p.provider).label }}</span></td>
              <td class="px-6 py-3 text-right font-semibold tabular-nums" :class="p.provider === 'manual' ? 'text-gray-400 line-through decoration-1' : 'text-gray-900 dark:text-white'">{{ formatMoney(p.amount, p.currency) }}</td>
              <td class="px-6 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 break-all">{{ p.externalId || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400">Todavía no hay pagos.</p>
    </div>

    <div v-if="loading" class="card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-3 text-left">Cliente</th>
              <th class="px-6 py-3 text-left">{{ t('admin.subscriptions.table.status') }}</th>
              <th class="px-6 py-3 text-left">{{ t('admin.subscriptions.table.expiry') }}</th>
              <th class="px-6 py-3 text-right">Empresas</th>
              <th class="px-6 py-3 text-right">{{ t('admin.subscriptions.table.users') }}</th>
              <th class="px-6 py-3 text-right">{{ t('admin.subscriptions.table.totalLeads') }}</th>
              <th class="px-6 py-3 text-right">Cobrado</th>
              <th class="px-6 py-3 text-right">{{ t('admin.subscriptions.table.createdAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <template v-for="acc in filteredSubscriptions" :key="acc.id">
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" @click="toggleRow(acc.id)">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <svg class="w-4 h-4 shrink-0 text-gray-400 transition-transform" :class="{ 'rotate-90': expanded.has(acc.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-900 dark:text-white">{{ acc.name }}</span>
                        <span v-if="acc.type === 'tenant'" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">clásica</span>
                      </div>
                      <div class="text-xs text-gray-500">{{ acc.type === 'owner' ? acc.email : acc.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="['px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide', getStatusClass(acc.subscriptionStatus)]">
                    {{ acc.subscriptionStatus }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm" :class="isPast(expiryOf(acc)) && acc.subscriptionStatus !== 'lifetime' ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'">
                  {{ acc.subscriptionStatus === 'lifetime' ? '—' : formatDate(expiryOf(acc)) }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ acc.companies.length }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ acc.userCount }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ acc.leadCount }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold" :class="acc.totalPaid ? 'text-gray-900 dark:text-white' : 'text-gray-400'">{{ formatMoney(acc.totalPaid) }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-500">{{ formatDate(acc.createdAt) }}</td>
              </tr>

              <!-- Detalle: empresas + historial de pagos -->
              <tr v-if="expanded.has(acc.id)" class="bg-gray-50/70 dark:bg-gray-900/40">
                <td colspan="8" class="px-6 py-4">
                  <div class="grid gap-6 lg:grid-cols-2">
                    <div>
                      <p class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Empresas ({{ acc.companies.length }})</p>
                      <div v-if="acc.companies.length" class="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800/40">
                        <div v-for="c in acc.companies" :key="c.id" class="flex items-center gap-3 px-3 py-2.5 text-sm">
                          <span class="w-2 h-2 rounded-full shrink-0" :class="c.active ? 'bg-green-500' : 'bg-gray-400'"></span>
                          <div class="min-w-0 flex-1">
                            <router-link :to="`/admin/tenants/${c.id}`" class="font-medium text-gray-900 dark:text-white hover:underline" @click.stop>{{ c.name }}</router-link>
                            <div class="text-xs text-gray-500 truncate">/{{ c.slug }} · alta {{ formatDate(c.createdAt) }}</div>
                          </div>
                          <div class="text-right text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ c.userCount }} usuarios · {{ c.leadCount }} leads</div>
                        </div>
                      </div>
                      <p v-else class="text-sm text-gray-500 dark:text-gray-400">Todavía no creó ninguna empresa.</p>
                    </div>

                    <div>
                      <p class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Historial de pagos ({{ acc.payments.length }})</p>
                      <div v-if="acc.payments.length" class="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800/40">
                        <div v-for="p in acc.payments" :key="p.id" class="flex items-center gap-3 px-3 py-2.5 text-sm">
                          <span class="text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ formatDate(p.date) }}</span>
                          <span :class="['px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap', providerMeta(p.provider).cls]">{{ providerMeta(p.provider).label }}</span>
                          <span class="flex-1 min-w-0 font-mono text-[11px] text-gray-400 truncate">{{ p.externalId || '' }}</span>
                          <a v-if="p.downloadUrl" :href="p.downloadUrl" target="_blank" rel="noopener" @click.stop class="font-semibold tabular-nums hover:underline" :class="p.provider === 'manual' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'">{{ formatMoney(p.amount, p.currency) }}</a>
                          <span v-else class="font-semibold tabular-nums" :class="p.provider === 'manual' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'">{{ formatMoney(p.amount, p.currency) }}</span>
                        </div>
                      </div>
                      <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sin pagos.</p>
                      <p v-if="acc.paddleSubscriptionId" class="mt-2 text-xs text-gray-500 dark:text-gray-400">Suscripción Paddle: <span class="font-mono">{{ acc.paddleSubscriptionId }}</span></p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
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
