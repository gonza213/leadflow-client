<script setup>
import { ref, onMounted } from 'vue'
import { subscriptionApi } from '../services/api'
import { useAuthStore } from '../stores/auth'

const payments = ref([])
const loading = ref(false)
const authStore = useAuthStore()

const fetchInvoices = async () => {
  loading.value = true
  try {
    const res = await subscriptionApi.getMyInvoices()
    payments.value = res.data.payments
  } catch (e) {
    console.error('Error fetching invoices:', e)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchInvoices()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mi Facturación</h1>
    </div>

    <div v-if="authStore.subscriptionStatus === 'lifetime'" class="grid grid-cols-1 gap-6">
      <div class="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none p-8 md:p-12 text-center shadow-xl">
        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold mb-4">¡Plan Vitalicio Activado!</h2>
        <p class="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
          Tu cuenta tiene acceso permanente a todas las funcionalidades de LeadDistro. 
          Al ser un plan vitalicio, no tenés suscripciones mensuales pendientes ni cargos futuros.
        </p>
        <div class="mt-8">
          <router-link to="/" class="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-full font-bold hover:bg-indigo-50 transition-colors">
            Volver al Dashboard
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6">
      <!-- Info Card -->
      <div class="card bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
        <div class="flex gap-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-blue-900 dark:text-blue-100">Sobre tus recibos</h3>
            <p class="text-sm text-blue-800 dark:text-blue-200 opacity-80">
              Aquí encontrarás los comprobantes de pago de tu suscripción mensual. Los recibos se generan automáticamente al confirmar el pago y se almacenan de forma segura en la nube.
            </p>
          </div>
        </div>
      </div>

      <!-- Tabla de Recibos -->
      <div class="card overflow-hidden">
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="payments.length === 0" class="p-12 text-center">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay recibos disponibles</h3>
          <p class="text-gray-500 dark:text-gray-400">Tus futuros comprobantes aparecerán en esta lista.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Concepto</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="payment in payments" :key="payment._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {{ formatDate(payment.date) }}
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">Suscripción Mensual</div>
                  <div class="text-xs text-gray-500">Plan LeadDistro Estándar</div>
                </td>
                <td class="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                  ${{ payment.amount.toFixed(2) }} USD
                </td>
                <td class="px-6 py-4 text-right">
                  <a 
                    v-if="payment.downloadUrl"
                    :href="payment.downloadUrl" 
                    target="_blank"
                    class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar Recibo
                  </a>
                  <span v-else class="text-xs text-gray-400 italic">Generando...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
