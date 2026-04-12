<script setup>
import { onMounted, ref, computed } from 'vue'
import { adminApi } from '../../services/api'

const subscriptions = ref([])
const loading = ref(false)
const filterStatus = ref('all')
const pagination = ref({
  page: 1,
  pages: 1,
  total: 0
})

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

onMounted(() => {
  fetchSubscriptions()
})

const filteredSubscriptions = computed(() => {
  // Since we have backend filtration partially, we can filter here or just fetch on filter change
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
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Suscripciones</h1>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500">Filtrar:</label>
        <select 
          v-model="filterStatus" 
          @change="handleFilterChange"
          class="input py-1 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="trial">Trial</option>
          <option value="inactive">Inactivas</option>
          <option value="lifetime">Lifetime</option>
        </select>
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
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tenant</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vencimiento</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Usuarios</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Leads Totales</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Alta</th>
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
        No se encontraron suscripciones con este criterio.
      </div>
    </div>

    <!-- Paginacion -->
    <div v-if="pagination.total > 0" class="flex items-center justify-between">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {{ filteredSubscriptions.length }} de {{ pagination.total }} suscripciones
      </div>
      <div v-if="pagination.pages > 1" class="flex gap-2">
        <button
          @click="handlePageChange(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="btn btn-secondary btn-sm"
          :class="{ 'opacity-50 cursor-not-allowed': pagination.page === 1 }"
        >
          Anterior
        </button>
        <button
          @click="handlePageChange(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="btn btn-secondary btn-sm"
          :class="{ 'opacity-50 cursor-not-allowed': pagination.page === pagination.pages }"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
