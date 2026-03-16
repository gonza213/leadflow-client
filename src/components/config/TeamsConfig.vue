<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  equipos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update'])

const localEquipos = ref([...props.equipos])
const newTeam = ref({ nombre: '', porcentaje: 0 })
const error = ref('')
const success = ref('')

watch(() => props.equipos, (val) => {
  localEquipos.value = [...val]
}, { deep: true })

const totalPorcentaje = computed(() => {
  return localEquipos.value.reduce((sum, e) => sum + e.porcentaje, 0)
})

const isValid = computed(() => totalPorcentaje.value === 100)

const addTeam = () => {
  if (!newTeam.value.nombre.trim()) {
    error.value = 'El nombre del equipo es requerido'
    return
  }

  if (newTeam.value.porcentaje <= 0) {
    error.value = 'El porcentaje debe ser mayor a 0'
    return
  }

  localEquipos.value.push({ ...newTeam.value })
  newTeam.value = { nombre: '', porcentaje: 0 }
  error.value = ''
}

const removeTeam = (index) => {
  if (localEquipos.value.length > 1) {
    localEquipos.value.splice(index, 1)
  }
}

const handleSave = async () => {
  if (!isValid.value) {
    error.value = `Los porcentajes deben sumar 100% (actual: ${totalPorcentaje.value}%)`
    return
  }

  error.value = ''
  const result = await emit('update', localEquipos.value)
  success.value = 'Configuración guardada correctamente'
  setTimeout(() => success.value = '', 3000)
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración de Equipos</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Define los equipos y sus porcentajes de asignación. Los porcentajes deben sumar 100%.
    </p>

    <!-- Lista de equipos -->
    <div class="space-y-3 mb-6">
      <div
        v-for="(equipo, index) in localEquipos"
        :key="index"
        class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
      >
        <div class="flex-1">
          <input
            v-model="equipo.nombre"
            type="text"
            class="input"
            placeholder="Nombre del equipo"
          />
        </div>
        <div class="w-32">
          <div class="flex items-center">
            <input
              v-model.number="equipo.porcentaje"
              type="number"
              class="input text-center"
              min="0"
              max="100"
            />
            <span class="ml-2 text-gray-500 dark:text-gray-400">%</span>
          </div>
        </div>
        <button
          @click="removeTeam(index)"
          :disabled="localEquipos.length <= 1"
          class="p-2 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Agregar equipo -->
    <div class="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg mb-6">
      <div class="flex-1">
        <input
          v-model="newTeam.nombre"
          type="text"
          class="input"
          placeholder="Nuevo equipo"
        />
      </div>
      <div class="w-32">
        <div class="flex items-center">
          <input
            v-model.number="newTeam.porcentaje"
            type="number"
            class="input text-center"
            min="0"
            max="100"
          />
          <span class="ml-2 text-gray-500 dark:text-gray-400">%</span>
        </div>
      </div>
      <button @click="addTeam" class="btn btn-secondary">
        Agregar
      </button>
    </div>

    <!-- Total y validación -->
    <div class="flex items-center justify-between p-4 rounded-lg mb-6"
      :class="isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'"
    >
      <span class="font-medium" :class="isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
        Total: {{ totalPorcentaje }}%
      </span>
      <span v-if="!isValid" class="text-sm text-red-600 dark:text-red-400">
        Debe sumar exactamente 100%
      </span>
      <span v-else class="text-sm text-green-600 dark:text-green-400">
        Configuración válida
      </span>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4">
      {{ error }}
    </div>
    <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm mb-4">
      {{ success }}
    </div>

    <!-- Guardar -->
    <button
      @click="handleSave"
      :disabled="!isValid"
      class="btn btn-primary"
      :class="{ 'opacity-50 cursor-not-allowed': !isValid }"
    >
      Guardar Cambios
    </button>
  </div>
</template>
