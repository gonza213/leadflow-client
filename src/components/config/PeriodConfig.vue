<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  fechaInicio: String,
  fechaFin: String,
  onSave: {
    type: Function,
    default: null
  }
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

const localFechaInicio = ref(formatDate(props.fechaInicio))
const localFechaFin = ref(formatDate(props.fechaFin))
const error = ref('')
const success = ref('')

watch(() => props.fechaInicio, (val) => {
  localFechaInicio.value = formatDate(val)
}, { immediate: true })

watch(() => props.fechaFin, (val) => {
  localFechaFin.value = formatDate(val)
}, { immediate: true })

const handleSave = async () => {
  if (!localFechaInicio.value || !localFechaFin.value) {
    error.value = 'Ambas fechas son requeridas'
    return
  }

  if (new Date(localFechaInicio.value) > new Date(localFechaFin.value)) {
    error.value = 'La fecha de inicio debe ser anterior a la fecha de fin'
    return
  }

  error.value = ''
  success.value = ''

  try {
    const result = await props.onSave(localFechaInicio.value, localFechaFin.value)
    if (result?.success === false) {
      error.value = result.error || 'Error al actualizar período'
    } else {
      success.value = 'Período actualizado correctamente'
      setTimeout(() => success.value = '', 3000)
    }
  } catch (err) {
    error.value = 'Error al actualizar período'
  }
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración de Período</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Define el período activo para la distribución de leads. Los leads dentro de este período
      se contarán para determinar la distribución por equipos.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label class="label">Fecha de inicio</label>
        <input
          v-model="localFechaInicio"
          type="date"
          class="input"
        />
      </div>
      <div>
        <label class="label">Fecha de fin</label>
        <input
          v-model="localFechaFin"
          type="date"
        class="input"
        />
      </div>
    </div>

    <div v-if="localFechaInicio && localFechaFin" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
      <p class="text-sm text-blue-700 dark:text-blue-400">
        <strong>Período activo:</strong>
        {{ new Date(localFechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }}
        -
        {{ new Date(localFechaFin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }}
      </p>
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
