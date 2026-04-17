<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../../services/api'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const tickets = ref([])
const loading = ref(false)
const updating = ref(null)
const pagination = ref({
  page: 1,
  pages: 1,
  total: 0
})

const fetchTickets = async (page = 1) => {
  loading.value = true
  try {
    const res = await adminApi.getAdminTickets({ page, limit: 10 })
    tickets.value = res.data.data
    pagination.value = res.data.pagination
  } catch (e) {
    console.error('Error fetching admin tickets:', e)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.value.pages) {
    fetchTickets(newPage)
  }
}

onMounted(() => {
  fetchTickets()
})

const updateStatus = async (ticketId, status) => {
  updating.value = ticketId
  try {
    await adminApi.updateAdminTicket(ticketId, { status })
    await fetchTickets(pagination.value.page)
  } catch (e) {
    alert(t('common.error'))
  } finally {
    updating.value = null
  }
}

const getStatusClass = (status) => {
  const classes = {
    'abierto': 'bg-blue-100 text-blue-700',
    'en-proceso': 'bg-yellow-100 text-yellow-700',
    'resuelto': 'bg-green-100 text-green-700',
    'cerrado': 'bg-gray-100 text-gray-700'
  }
  return classes[status] || 'bg-gray-100'
}

const getPriorityClass = (priority) => {
  const classes = {
    'alta': 'text-red-600 font-bold',
    'media': 'text-yellow-600 font-semibold',
    'baja': 'text-blue-600'
  }
  return classes[priority] || ''
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('admin.tickets.title') }}</h1>
      <button @click="fetchTickets(pagination.page)" class="btn btn-secondary btn-sm p-2" :title="t('common.retry')">
        <svg :class="{'animate-spin': loading}" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <div v-if="loading && tickets.length === 0" class="card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid gap-4">
      <div v-if="tickets.length === 0" class="card p-12 text-center text-gray-500">
        {{ t('admin.tickets.noTickets') }}
      </div>

      <div 
        v-for="ticket in tickets" 
        :key="ticket._id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-2 flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600">
                Tenant: {{ ticket.tenantId?.name || 'Desconocido' }}
              </span>
              <span :class="['text-[10px] uppercase font-bold px-2 py-0.5 rounded-full', getStatusClass(ticket.status)]">
                {{ ticket.status }}
              </span>
              <span :class="['text-xs uppercase', getPriorityClass(ticket.priority)]">
                Prioridad {{ ticket.priority }}
              </span>
            </div>
            
            <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ ticket.subject }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{{ ticket.description }}</p>
            
            <div class="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 dark:border-gray-800 pt-2 mt-2">
              <span class="font-medium text-gray-700 dark:text-gray-300">De: {{ ticket.userId?.name }} ({{ ticket.userId?.email }})</span>
              <span>•</span>
              <span>{{ formatDate(ticket.createdAt) }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 min-w-[150px]">
            <label class="text-[10px] uppercase font-bold text-gray-400">{{ t('support.modal.status') || 'Status' }}</label>
            <select 
              :value="ticket.status"
              @change="updateStatus(ticket._id, $event.target.value)"
              :disabled="updating === ticket._id"
              class="input text-sm p-1.5 focus:ring-primary-500"
            >
              <option value="abierto">{{ t('support.status.abierto') }}</option>
              <option value="en-proceso">{{ t('support.status.en-proceso') }}</option>
              <option value="resuelto">{{ t('support.status.resuelto') }}</option>
              <option value="cerrado">{{ t('support.status.cerrado') }}</option>
            </select>
            <p v-if="updating === ticket._id" class="text-[10px] text-primary-600 animate-pulse text-center font-bold">{{ t('common.loading') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginacion -->
    <div v-if="pagination.total > 0" class="flex items-center justify-between">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('admin.subscriptions.table.showing', { n: tickets.length, total: pagination.total }) }}
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
