<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { summaryApi } from '../../services/api'

const props = defineProps({
  summaryEnabled: Boolean,
  summaryFrequency: String,
  summaryTime: String,
  summaryDay: Number,
  summaryWebhookUrl: String,
  onSave: Function
})

const authStore = useAuthStore()

const enabled = ref(props.summaryEnabled ?? false)
const frequency = ref(props.summaryFrequency || 'daily')
const time = ref(props.summaryTime || '08:00')
const day = ref(props.summaryDay ?? 1)
const webhookUrl = ref(props.summaryWebhookUrl || '')
const saving = ref(false)
const testing = ref(false)
const success = ref('')
const error = ref('')
const testResult = ref('')

const days = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
]

watch(() => props.summaryEnabled, v => { enabled.value = v ?? false })
watch(() => props.summaryFrequency, v => { frequency.value = v || 'daily' })
watch(() => props.summaryTime, v => { time.value = v || '08:00' })
watch(() => props.summaryDay, v => { day.value = v ?? 1 })
watch(() => props.summaryWebhookUrl, v => { webhookUrl.value = v || '' })

const frequencyLabel = computed(() => frequency.value === 'daily' ? 'Todos los días' : 'Una vez por semana')

const handleSave = async () => {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await props.onSave({
      summary_enabled: enabled.value,
      summary_frequency: frequency.value,
      summary_time: time.value,
      summary_day: day.value,
      summary_webhook_url: webhookUrl.value || null
    })
    success.value = 'Configuración guardada correctamente'
    setTimeout(() => success.value = '', 3000)
  } catch (e) {
    error.value = 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const handleTest = async () => {
  testing.value = true
  testResult.value = ''
  error.value = ''
  try {
    const res = await summaryApi.trigger(authStore.tenantSlug)
    testResult.value = res.data.summary
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al generar el resumen'
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Resumen Inteligente con IA</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      El sistema genera automáticamente un resumen de métricas con OpenAI y lo envía al webhook configurado (Make, Zapier, etc.).
    </p>

    <!-- Toggle habilitado -->
    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
      <div>
        <p class="font-medium text-gray-900 dark:text-white">Resumen automático</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ enabled ? 'Activo · ' + frequencyLabel : 'Desactivado' }}</p>
      </div>
      <button
        @click="enabled = !enabled"
        :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors', enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600']"
      >
        <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform', enabled ? 'translate-x-6' : 'translate-x-1']" />
      </button>
    </div>

    <div v-if="enabled" class="space-y-5">
      <!-- Frecuencia -->
      <div>
        <label class="label">Frecuencia</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="frequency = 'daily'"
            :class="['p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left', frequency === 'daily' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300']"
          >
            <span class="block text-base mb-0.5">📅</span>
            Diario
            <span class="block text-xs font-normal opacity-70">Todos los días a la hora configurada</span>
          </button>
          <button
            @click="frequency = 'weekly'"
            :class="['p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left', frequency === 'weekly' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300']"
          >
            <span class="block text-base mb-0.5">📆</span>
            Semanal
            <span class="block text-xs font-normal opacity-70">Un día fijo por semana</span>
          </button>
        </div>
      </div>

      <!-- Día (solo si es semanal) -->
      <div v-if="frequency === 'weekly'">
        <label class="label">Día de envío</label>
        <select v-model="day" class="input">
          <option v-for="d in days" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>

      <!-- Hora -->
      <div>
        <label class="label">Hora de envío</label>
        <select v-model="time" class="input">
          <option v-for="h in 24" :key="h - 1" :value="`${String(h - 1).padStart(2, '0')}:00`">
            {{ String(h - 1).padStart(2, '0') }}:00 hs
          </option>
        </select>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Se usa la zona horaria configurada en Integración.</p>
      </div>

      <!-- Webhook URL -->
      <div>
        <label class="label">URL del Webhook (Make, Zapier, etc.)</label>
        <input v-model="webhookUrl" type="url" class="input" placeholder="https://hook.make.com/..." />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          El sistema hará un POST con el resumen generado por IA y las métricas del período.
        </p>
      </div>

      <!-- Preview del payload -->
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-600 dark:text-gray-400 font-medium">Ver JSON enviado al webhook</summary>
        <pre class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300 mt-2 border border-gray-200 dark:border-gray-700">{
  "type": "daily_summary",
  "date": "9/4/2026",
  "summary": "Hoy entraron 12 leads, un 50% más que ayer...",
  "data": {
    "leads_today": 12,
    "leads_yesterday": 8,
    "sellers_near_limit": ["Christopher Valles"],
    "inactive_leads": 3
  }
}</pre>
      </details>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm mt-4">
      {{ error }}
    </div>
    <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm mt-4">
      {{ success }}
    </div>

    <!-- Resultado del test -->
    <div v-if="testResult" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mt-4">
      <p class="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Resumen generado:</p>
      <p class="text-sm text-blue-900 dark:text-blue-200">{{ testResult }}</p>
    </div>

    <!-- Botones -->
    <div class="flex gap-3 mt-6">
      <button @click="handleSave" :disabled="saving" class="btn btn-primary">
        {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
      <button
        v-if="enabled"
        @click="handleTest"
        :disabled="testing"
        class="btn btn-secondary"
      >
        {{ testing ? 'Generando...' : 'Enviar resumen ahora' }}
      </button>
    </div>
  </div>
</template>
