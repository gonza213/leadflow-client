<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  fechaInicio: String,
  fechaFin: String,
  weekStartDay: {
    type: Number,
    default: null
  },
  onSave: {
    type: Function,
    default: null
  }
})

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

// Modo: 'manual' o 'auto'
const mode = ref(props.weekStartDay !== null && props.weekStartDay !== undefined ? 'auto' : 'manual')

// Manual
const localFechaInicio = ref(formatDate(props.fechaInicio))
const localFechaFin = ref(formatDate(props.fechaFin))

// Auto
const selectedDay = ref(props.weekStartDay ?? 1)

const error = ref('')
const success = ref('')

watch(() => props.fechaInicio, (val) => { localFechaInicio.value = formatDate(val) }, { immediate: true })
watch(() => props.fechaFin, (val) => { localFechaFin.value = formatDate(val) }, { immediate: true })
watch(() => props.weekStartDay, (val) => {
  if (val !== null && val !== undefined) {
    mode.value = 'auto'
    selectedDay.value = val
  } else {
    mode.value = 'manual'
  }
}, { immediate: true })

// Preview de la semana actual según el día seleccionado
const weekPreview = computed(() => {
  const now = new Date()
  const todayDow = now.getDay()
  const daysDiff = (todayDow - selectedDay.value + 7) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - daysDiff)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const fmt = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
})

const endDayLabel = computed(() => {
  const endDow = (selectedDay.value + 6) % 7
  return DAYS.find(d => d.value === endDow)?.label || ''
})

const handleSave = async () => {
  error.value = ''
  success.value = ''

  let data
  if (mode.value === 'manual') {
    if (!localFechaInicio.value || !localFechaFin.value) {
      error.value = 'Ambas fechas son requeridas'
      return
    }
    if (new Date(localFechaInicio.value) > new Date(localFechaFin.value)) {
      error.value = 'La fecha de inicio debe ser anterior a la fecha de fin'
      return
    }
    data = { fecha_inicio: localFechaInicio.value, fecha_fin: localFechaFin.value, week_start_day: null }
  } else {
    data = { week_start_day: selectedDay.value }
  }

  try {
    const result = await props.onSave(data)
    if (result?.success === false) {
      error.value = result.error || 'Error al actualizar período'
    } else {
      success.value = 'Período actualizado correctamente'
      setTimeout(() => success.value = '', 3000)
    }
  } catch {
    error.value = 'Error al actualizar período'
  }
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Configuración de Período</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Define cómo se cuenta el período activo para la distribución de leads entre equipos.
    </p>

    <!-- Toggle de modo -->
    <div class="flex gap-2 mb-6">
      <button
        @click="mode = 'manual'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors',
          mode === 'manual'
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        Período manual
      </button>
      <button
        @click="mode = 'auto'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors',
          mode === 'auto'
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        Semana automática
      </button>
    </div>

    <!-- Modo Manual -->
    <div v-if="mode === 'manual'">
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Definí un rango de fechas fijo. Los leads dentro de este período se contarán para determinar la distribución por equipos.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="label">Fecha de inicio</label>
          <input v-model="localFechaInicio" type="date" class="input" />
        </div>
        <div>
          <label class="label">Fecha de fin</label>
          <input v-model="localFechaFin" type="date" class="input" />
        </div>
      </div>
      <div v-if="localFechaInicio && localFechaFin" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
        <p class="text-sm text-blue-700 dark:text-blue-400">
          <strong>Período activo:</strong>
          {{ new Date(localFechaInicio + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          –
          {{ new Date(localFechaFin + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }}
        </p>
      </div>
    </div>

    <!-- Modo Automático -->
    <div v-else>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        El período se calcula automáticamente cada semana según el día de inicio que elijas.
      </p>

      <label class="label mb-3">Día de inicio de semana</label>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="day in DAYS"
          :key="day.value"
          @click="selectedDay = day.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors',
            selectedDay === day.value
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500'
          ]"
        >
          {{ day.label }}
        </button>
      </div>

      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
        <p class="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">
          Semana actual: {{ weekPreview }}
        </p>
        <p class="text-xs text-blue-600 dark:text-blue-500">
          Cada {{ DAYS.find(d => d.value === selectedDay)?.label }} a las 00:00 comienza una nueva semana y los contadores se reinician automáticamente.
          El último día de la semana será el {{ endDayLabel }}.
        </p>
      </div>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4">
      {{ error }}
    </div>
    <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm mb-4">
      {{ success }}
    </div>

    <button @click="handleSave" class="btn btn-primary">
      Guardar Cambios
    </button>
  </div>
</template>
