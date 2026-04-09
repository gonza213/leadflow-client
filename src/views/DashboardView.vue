<script setup>
import { onMounted, watch, computed } from 'vue'
import { useLeadsStore } from '../stores/leads'
import { useConfigStore } from '../stores/config'
import { useSellersStore } from '../stores/sellers'
import { useAuthStore } from '../stores/auth'
import KPICard from '../components/dashboard/KPICard.vue'
import SellersTable from '../components/dashboard/SellersTable.vue'
import SellersChart from '../components/dashboard/SellersChart.vue'
import StagesTable from '../components/dashboard/StagesTable.vue'
import StagesChart from '../components/dashboard/StagesChart.vue'
import StatesChart from '../components/dashboard/StatesChart.vue'
import TeamsChart from '../components/dashboard/TeamsChart.vue'

const leadsStore = useLeadsStore()
const configStore = useConfigStore()
const sellersStore = useSellersStore()
const authStore = useAuthStore()

onMounted(async () => {
  await configStore.fetchConfig()
  // Pre-cargar filtros con el período configurado (automático o manual)
  leadsStore.initPeriodFilters(configStore.config)
  await Promise.all([
    leadsStore.fetchReport(),
    leadsStore.fetchNextAssignment(),
    sellersStore.fetchSellers()
  ])
})

// Sellers filtrados según el equipo seleccionado
const filteredSellers = computed(() => {
  const equipo = leadsStore.filters.equipo
  if (!equipo || equipo === 'Todos') return sellersStore.sellers
  return sellersStore.sellers.filter(s => s.team === equipo)
})

// Al cambiar equipo, resetear el vendedor seleccionado
watch(
  () => leadsStore.filters.equipo,
  () => { leadsStore.filters.usuario = '' }
)

watch(
  () => leadsStore.filters,
  () => leadsStore.fetchReport(),
  { deep: true }
)

const handleApplyFilters = () => {
  leadsStore.fetchReport()
  leadsStore.fetchNextAssignment()
}

const handleResetFilters = () => {
  leadsStore.resetFilters()
  // Reiniciar al período configurado (no a vacío)
  leadsStore.initPeriodFilters(configStore.config)
  leadsStore.fetchNextAssignment()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
    </div>

    <!-- Filtros -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros</h2>
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label class="label text-xs">Fecha inicio</label>
          <input
            v-model="leadsStore.filters.fecha_inicio"
            type="date"
            class="input text-sm"
          />
        </div>
        <div>
          <label class="label text-xs">Fecha fin</label>
          <input
            v-model="leadsStore.filters.fecha_fin"
            type="date"
            class="input text-sm"
          />
        </div>
        <div v-if="!authStore.isSeller">
          <label class="label text-xs">Equipo</label>
          <select v-model="leadsStore.filters.equipo" class="input text-sm">
            <option value="Todos">Todos</option>
            <option
              v-for="equipo in configStore.config?.equipos || []"
              :key="equipo.nombre"
              :value="equipo.nombre"
            >
              {{ equipo.nombre }}
            </option>
          </select>
        </div>
        <div v-if="!authStore.isSeller">
          <label class="label text-xs">Vendedor</label>
          <select v-model="leadsStore.filters.usuario" class="input text-sm">
            <option value="">Todos</option>
            <option
              v-for="seller in filteredSellers"
              :key="seller._id"
              :value="seller._id"
            >
              {{ seller.seller_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="label text-xs">Etapa</label>
          <select v-model="leadsStore.filters.opportunity_stage" class="input text-sm">
            <option value="">Todas</option>
            <option
              v-for="stage in configStore.config?.opportunity_stages || []"
              :key="stage"
              :value="stage"
            >
              {{ stage }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button @click="handleApplyFilters" class="btn btn-primary btn-sm flex-1 lg:flex-none">
          Aplicar
        </button>
        <button @click="handleResetFilters" class="btn btn-secondary btn-sm">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="leadsStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-300">Cargando datos...</p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Leads"
          :value="leadsStore.totalLeads"
          icon="chart"
          color="primary"
        />
        <KPICard
          v-if="!authStore.isSeller"
          title="Vendedores"
          :value="leadsStore.sellers.length"
          icon="users"
          color="green"
        />
        <KPICard
          title="Etapas"
          :value="leadsStore.stages.length"
          icon="layers"
          color="purple"
        />
      </div>

      <!-- Próximo Equipo y Vendedor (solo para managers) -->
      <div v-if="!authStore.isSeller" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Próximo Equipo</p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {{ leadsStore.nextTeam || 'Sin definir' }}
              </p>
            </div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm text-green-600 dark:text-green-400 font-medium">Próximo Vendedor</p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-100">
                {{ leadsStore.nextSeller?.seller_name || 'Sin disponibles' }}
              </p>
              <p v-if="leadsStore.nextSeller" class="text-xs text-green-600 dark:text-green-400 mt-1">
                {{ leadsStore.nextSeller.team }} - Disponible: {{ leadsStore.nextSeller.available }} semanal / {{ leadsStore.nextSeller.availableToday }} hoy
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribución por equipo (solo si hay más de 1 equipo configurado) -->
      <div v-if="!authStore.isSeller && (configStore.config?.equipos?.length ?? 0) > 1" class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Equipo</h2>
        <TeamsChart :teams="leadsStore.teams" :configured-teams="configStore.config?.equipos || []" />
      </div>

      <!-- Gráficos y Tablas -->
      <div v-if="!authStore.isSeller" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads por Vendedor</h2>
          <SellersChart :sellers="leadsStore.sellers" />
        </div>
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tabla de Vendedores</h2>
          <SellersTable :sellers="leadsStore.sellers" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads por Etapa</h2>
          <StagesChart :stages="leadsStore.stages" />
        </div>
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tabla de Etapas</h2>
          <StagesTable :stages="leadsStore.stages" />
        </div>
      </div>

      <!-- Leads por Estado Geográfico -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads por Estado</h2>
        <StatesChart
          :states="leadsStore.states"
          :leads="leadsStore.leads"
          :stages="leadsStore.stages"
        />
      </div>
    </template>
  </div>
</template>
