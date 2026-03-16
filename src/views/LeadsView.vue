<script setup>
import { onMounted, ref } from 'vue'
import { useLeadsStore } from '../stores/leads'
import { useConfigStore } from '../stores/config'
import { useSellersStore } from '../stores/sellers'
import { useAuthStore } from '../stores/auth'

const leadsStore = useLeadsStore()
const configStore = useConfigStore()
const sellersStore = useSellersStore()
const authStore = useAuthStore()

const showFilters = ref(false)

onMounted(async () => {
  await configStore.fetchConfig()
  if (authStore.isManager) {
    await sellersStore.fetchSellers()
  }
  await leadsStore.fetchLeads(1)
})

const handleFilter = () => {
  leadsStore.fetchLeads(1)
  showFilters.value = false
}

const handleResetFilters = () => {
  leadsStore.resetLeadsFilters()
  leadsStore.fetchLeads(1)
}

const handlePageChange = (page) => {
  leadsStore.fetchLeads(page)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

const getStateClass = (state) => {
  const classes = {
    new: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    contacted: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
    qualified: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    lost: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
  }
  return classes[state] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ leadsStore.pagination.total }} leads</span>
        <button
          @click="showFilters = !showFilters"
          class="lg:hidden btn btn-secondary btn-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filtros - Colapsable en mobile -->
    <div
      class="card"
      :class="{ 'hidden lg:block': !showFilters }"
    >
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label class="label text-xs">Fecha inicio</label>
          <input
            v-model="leadsStore.leadsFilters.fecha_inicio"
            type="date"
            class="input text-sm"
          />
        </div>
        <div>
          <label class="label text-xs">Fecha fin</label>
          <input
            v-model="leadsStore.leadsFilters.fecha_fin"
            type="date"
            class="input text-sm"
          />
        </div>
        <div v-if="authStore.isManager">
          <label class="label text-xs">Equipo</label>
          <select v-model="leadsStore.leadsFilters.equipo" class="input text-sm">
            <option value="">Todos</option>
            <option
              v-for="equipo in configStore.config?.equipos || []"
              :key="equipo.nombre"
              :value="equipo.nombre"
            >
              {{ equipo.nombre }}
            </option>
          </select>
        </div>
        <div v-if="authStore.isManager">
          <label class="label text-xs">Vendedor</label>
          <select v-model="leadsStore.leadsFilters.seller_id" class="input text-sm">
            <option value="">Todos</option>
            <option
              v-for="seller in sellersStore.sellers"
              :key="seller._id"
              :value="seller._id"
            >
              {{ seller.seller_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="label text-xs">Etapa</label>
          <select v-model="leadsStore.leadsFilters.opportunity_stage" class="input text-sm">
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
        <button @click="handleFilter" class="btn btn-primary btn-sm flex-1 lg:flex-none">
          Filtrar
        </button>
        <button @click="handleResetFilters" class="btn btn-secondary btn-sm">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="leadsStore.leadsLoading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Vista Mobile: Cards -->
      <div class="lg:hidden space-y-3">
        <div
          v-for="lead in leadsStore.leadsList"
          :key="lead._id"
          class="card p-3"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ lead.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateShort(lead.date) }}</p>
            </div>
            <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', getStateClass(lead.state)]">
              {{ lead.state }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm">
            <div v-if="lead.phone">
              <p class="text-xs text-gray-400">Telefono</p>
              <p class="text-gray-700 dark:text-gray-200">{{ lead.phone }}</p>
            </div>
            <div v-if="lead.email">
              <p class="text-xs text-gray-400">Email</p>
              <p class="text-gray-700 dark:text-gray-200 truncate">{{ lead.email }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Vendedor</p>
              <p class="text-gray-700 dark:text-gray-200">{{ lead.seller_name || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Equipo</p>
              <p class="text-gray-700 dark:text-gray-200">{{ lead.team || '-' }}</p>
            </div>
          </div>

          <div class="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
              {{ lead.opportunity_stage }}
            </span>
            <span v-if="lead.source" class="text-xs text-gray-400">{{ lead.source }}</span>
          </div>
        </div>

        <div v-if="leadsStore.leadsList.length === 0" class="card text-center py-8 text-gray-500 dark:text-gray-400">
          No se encontraron leads
        </div>
      </div>

      <!-- Vista Desktop: Tabla -->
      <div class="hidden lg:block card overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Telefono</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Equipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendedor</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Etapa</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="lead in leadsStore.leadsList" :key="lead._id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {{ formatDate(lead.date) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {{ lead.name }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ lead.email || '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {{ lead.phone || '-' }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStateClass(lead.state)]">
                    {{ lead.state }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ lead.team || '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {{ lead.seller_name || '-' }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                    {{ lead.opportunity_stage }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ lead.source || '-' }}
                </td>
              </tr>
              <tr v-if="leadsStore.leadsList.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron leads
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginacion -->
      <div v-if="leadsStore.pagination.pages > 1" class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ leadsStore.pagination.page }} / {{ leadsStore.pagination.pages }}
        </div>
        <div class="flex gap-2">
          <button
            @click="handlePageChange(leadsStore.pagination.page - 1)"
            :disabled="leadsStore.pagination.page === 1"
            class="btn btn-secondary btn-sm"
            :class="{ 'opacity-50 cursor-not-allowed': leadsStore.pagination.page === 1 }"
          >
            Anterior
          </button>
          <button
            @click="handlePageChange(leadsStore.pagination.page + 1)"
            :disabled="leadsStore.pagination.page === leadsStore.pagination.pages"
            class="btn btn-secondary btn-sm"
            :class="{ 'opacity-50 cursor-not-allowed': leadsStore.pagination.page === leadsStore.pagination.pages }"
          >
            Siguiente
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
