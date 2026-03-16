<script setup>
import { onMounted, watch } from 'vue'
import { useLeadsStore } from '../stores/leads'
import { useConfigStore } from '../stores/config'
import KPICard from '../components/dashboard/KPICard.vue'
import SellersTable from '../components/dashboard/SellersTable.vue'
import SellersChart from '../components/dashboard/SellersChart.vue'
import StagesTable from '../components/dashboard/StagesTable.vue'
import StagesChart from '../components/dashboard/StagesChart.vue'

const leadsStore = useLeadsStore()
const configStore = useConfigStore()

onMounted(async () => {
  await configStore.fetchConfig()
  await leadsStore.fetchReport()
})

watch(
  () => leadsStore.filters,
  () => leadsStore.fetchReport(),
  { deep: true }
)

const handleApplyFilters = () => {
  leadsStore.fetchReport()
}

const handleResetFilters = () => {
  leadsStore.resetFilters()
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label class="label">Fecha inicio</label>
          <input
            v-model="leadsStore.filters.fecha_inicio"
            type="date"
            class="input"
          />
        </div>
        <div>
          <label class="label">Fecha fin</label>
          <input
            v-model="leadsStore.filters.fecha_fin"
            type="date"
            class="input"
          />
        </div>
        <div>
          <label class="label">Equipo</label>
          <select v-model="leadsStore.filters.equipo" class="input">
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
        <div>
          <label class="label">Etapa</label>
          <select v-model="leadsStore.filters.opportunity_stage" class="input">
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
        <div class="flex items-end gap-2">
          <button @click="handleApplyFilters" class="btn btn-primary flex-1">
            Aplicar
          </button>
          <button @click="handleResetFilters" class="btn btn-secondary">
            Limpiar
          </button>
        </div>
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

      <!-- Gráficos y Tablas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </template>
  </div>
</template>
