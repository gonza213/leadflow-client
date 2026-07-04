<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { authApi, leadsApi } from '../services/api'
import KPICard from '../components/dashboard/KPICard.vue'
import StagesChart from '../components/dashboard/StagesChart.vue'
import StagesTable from '../components/dashboard/StagesTable.vue'

const { t } = useI18n()

const accounts = ref([])
const selectedSlug = ref('') // '' = todas las empresas
const loading = ref(true)
const error = ref('')

// reportes por slug: { [slug]: { total_leads, stages, sellers } }
const reports = ref({})

const fetchAll = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await authApi.getAccounts()
    accounts.value = res.data.accounts

    const targets = selectedSlug.value
      ? accounts.value.filter(a => a.slug === selectedSlug.value)
      : accounts.value

    const results = await Promise.all(
      targets.map(async (account) => {
        try {
          const r = await leadsApi.getReport(account.slug, {})
          return [account.slug, r.data.data]
        } catch {
          // empresa sin config todavía: se muestra en cero
          return [account.slug, { total_leads: 0, stages: [], sellers: [] }]
        }
      })
    )
    reports.value = Object.fromEntries(results)
  } catch (e) {
    error.value = e.response?.data?.message || t('accounts.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)
watch(selectedSlug, fetchAll)

const activeReports = computed(() => Object.values(reports.value))

const totalLeads = computed(() =>
  activeReports.value.reduce((sum, r) => sum + (r.total_leads || 0), 0)
)

const totalSellers = computed(() =>
  activeReports.value.reduce((sum, r) => sum + (r.sellers?.length || 0), 0)
)

// Etapas combinadas de todas las empresas visibles (suma por nombre de etapa)
const mergedStages = computed(() => {
  const map = new Map()
  for (const report of activeReports.value) {
    for (const s of report.stages || []) {
      map.set(s.stage, (map.get(s.stage) || 0) + s.leads)
    }
  }
  const total = totalLeads.value
  return [...map.entries()].map(([stage, leads]) => ({
    stage,
    leads,
    porcentaje: total > 0 ? ((leads / total) * 100).toFixed(2) : 0
  }))
})

// Fila por empresa (solo en vista "todas")
const perCompany = computed(() =>
  accounts.value.map(account => ({
    name: account.name,
    slug: account.slug,
    leads: reports.value[account.slug]?.total_leads || 0
  }))
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('menu.dashboard') }}</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">{{ t('accounts.dashboardSubtitle') }}</p>
      </div>
      <div class="w-full sm:w-64">
        <label class="label text-xs">{{ t('accounts.companyFilter') }}</label>
        <select v-model="selectedSlug" class="input text-sm">
          <option value="">{{ t('accounts.allCompanies') }}</option>
          <option v-for="account in accounts" :key="account.id" :value="account.slug">
            {{ account.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard :title="t('dashboard.kpis.totalLeads')" :value="totalLeads" icon="chart" color="primary" />
        <KPICard :title="t('accounts.companies')" :value="selectedSlug ? 1 : accounts.length" icon="users" color="green" />
        <KPICard :title="t('dashboard.kpis.sellers')" :value="totalSellers" icon="users" color="purple" />
      </div>

      <!-- Leads por empresa (solo vista "todas") -->
      <div v-if="!selectedSlug && accounts.length > 1" class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('accounts.leadsByCompany') }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('accounts.companyFilter') }}</th>
                <th class="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Leads</th>
                <th class="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in perCompany" :key="row.slug"
                class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                @click="selectedSlug = row.slug">
                <td class="py-3 px-2 font-medium text-gray-900 dark:text-white">{{ row.name }}</td>
                <td class="py-3 px-2 text-right text-gray-600 dark:text-gray-300">{{ row.leads }}</td>
                <td class="py-3 px-2 text-right">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                    {{ totalLeads > 0 ? ((row.leads / totalLeads) * 100).toFixed(1) : 0 }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Etapas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('dashboard.charts.leadsByStage') }}</h2>
          <StagesChart :stages="mergedStages" />
        </div>
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('dashboard.charts.stageTable') }}</h2>
          <StagesTable :stages="mergedStages" />
        </div>
      </div>
    </template>
  </div>
</template>
