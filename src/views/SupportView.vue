<script setup>
import { onMounted, ref, reactive } from 'vue'
import { supportApi } from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const tickets = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const error = ref('')
const successMessage = ref('')

const form = reactive({
  subject: '',
  category: 'otros',
  priority: 'media',
  description: ''
})

const fetchTickets = async () => {
  loading.value = true
  try {
    const res = await supportApi.getTickets(authStore.tenantSlug)
    tickets.value = res.data.data
  } catch (e) {
    console.error('Error fetching tickets:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTickets()
})

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''
  successMessage.value = ''
  try {
    await supportApi.createTicket(authStore.tenantSlug, form)
    successMessage.value = 'Ticket creado con éxito. Te responderemos pronto.'
    form.subject = ''
    form.description = ''
    form.category = 'otros'
    form.priority = 'media'
    showModal.value = false
    await fetchTickets()
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al crear el ticket'
  } finally {
    submitting.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    'abierto': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'en-proceso': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'resuelto': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'cerrado': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getCategoryLabel = (cat) => {
  const labels = {
    bug: 'Error / Bug',
    pregunta: 'Pregunta',
    facturacion: 'Facturación',
    otros: 'Otros'
  }
  return labels[cat] || cat
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Centro de Soporte</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm">¿Tenés algún problema o duda? Estamos para ayudarte.</p>
      </div>
      <button 
        @click="showModal = true"
        class="btn btn-primary flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Ticket
      </button>
    </div>

    <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ successMessage }}
    </div>

    <!-- Tickets List -->
    <div class="card p-0 overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <h2 class="font-semibold text-gray-900 dark:text-white">Tus Tickets</h2>
      </div>

      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="tickets.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400">No tenés tickets creados aún.</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <div 
          v-for="ticket in tickets" 
          :key="ticket._id"
          class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-gray-900 dark:text-white truncate">{{ ticket.subject }}</span>
                <span :class="['text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full', getStatusClass(ticket.status)]">
                  {{ ticket.status }}
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ ticket.description }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01" />
                  </svg>
                  {{ getCategoryLabel(ticket.category) }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDate(ticket.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Ticket Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Nuevo Ticket de Soporte</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
            {{ error }}
          </div>

          <div>
            <label class="label text-sm font-semibold mb-1.5">Asunto</label>
            <input 
              v-model="form.subject" 
              type="text" 
              class="input focus:ring-primary-500" 
              placeholder="Ej: Problema con la integración de GHL"
              required 
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label text-sm font-semibold mb-1.5">Categoría</label>
              <select v-model="form.category" class="input focus:ring-primary-500">
                <option value="bug">Error / Bug</option>
                <option value="pregunta">Pregunta</option>
                <option value="facturacion">Facturación</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label class="label text-sm font-semibold mb-1.5">Prioridad</label>
              <select v-model="form.priority" class="input focus:ring-primary-500">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label class="label text-sm font-semibold mb-1.5">Descripción</label>
            <textarea 
              v-model="form.description" 
              rows="4" 
              class="input focus:ring-primary-500 py-3" 
              placeholder="Describí el problema detalladamente..."
              required
            ></textarea>
          </div>

          <div class="pt-4 flex items-center gap-3">
            <button 
              type="button" 
              @click="showModal = false" 
              class="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="submitting" 
              class="btn btn-primary flex-1 py-3"
            >
              <span v-if="submitting" class="flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Enviando...
              </span>
              <span v-else>Enviar Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
