<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSellersStore } from '../../stores/sellers'

const props = defineProps({
  fallbackSellerIds: { type: Array, default: () => [] },
  onSave: { type: Function, required: true }
})

const sellersStore = useSellersStore()
const selected = ref([...props.fallbackSellerIds])  // ['id1', 'id2'] o ['id1', ''] etc.

const saving = ref(false)
const saved = ref(false)
const error = ref('')

onMounted(async () => {
  await sellersStore.fetchSellers()
  // Asegurar slots para 2
  while (selected.value.length < 2) selected.value.push('')
})

// Sellers disponibles para el slot N (excluye el elegido en el otro slot)
const availableFor = (slotIndex) => {
  const otherId = selected.value[slotIndex === 0 ? 1 : 0]
  return sellersStore.sellers.filter(s => s._id !== otherId)
}

const sellerName = (id) => sellersStore.sellers.find(s => s._id === id)?.seller_name || ''

const hasAny = computed(() => selected.value.some(id => id && id !== ''))

const handleSave = async () => {
  saving.value = true
  error.value = ''
  const ids = selected.value.filter(id => id && id !== '')
  const result = await props.onSave(ids)
  if (result?.success) {
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } else {
    error.value = result?.error || 'Error al guardar'
  }
  saving.value = false
}

const handleClear = async () => {
  selected.value = ['', '']
  await handleSave()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Vendedores de Respaldo</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Cuando todos los vendedores alcancen su límite (diario o semanal), los leads nuevos se
        asignarán al respaldo con más capacidad disponible.
      </p>
    </div>

    <!-- Info box -->
    <div class="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
      <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p class="font-medium mb-1">Orden de asignación</p>
        <ol class="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-400">
          <li>Equipo asignado según % configurado</li>
          <li>Cualquier equipo disponible (fallback general)</li>
          <li>Respaldo 1 o 2 → el que tenga más cupo disponible</li>
          <li>Si ambos están al límite → igual se asigna al menos cargado</li>
        </ol>
      </div>
    </div>

    <!-- Selectores -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="(_, i) in 2" :key="i" class="space-y-1.5">
        <label class="label text-sm">Respaldo {{ i + 1 }} <span class="text-gray-400 font-normal">(opcional)</span></label>
        <select v-model="selected[i]" class="input text-sm">
          <option value="">Sin asignar</option>
          <option
            v-for="seller in availableFor(i)"
            :key="seller._id"
            :value="seller._id"
          >
            {{ seller.seller_name }} — {{ seller.team }}
          </option>
        </select>
        <p v-if="selected[i]" class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ sellerName(selected[i]) }}
        </p>
      </div>
    </div>

    <!-- Aviso sin respaldo -->
    <div v-if="!hasAny" class="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Sin respaldo configurado: los leads se perderán cuando todos estén al límite
    </div>

    <!-- Error -->
    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ error }}
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3">
      <button @click="handleSave" :disabled="saving" class="btn btn-primary">
        {{ saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar' }}
      </button>
      <button v-if="hasAny" @click="handleClear" :disabled="saving" class="btn btn-secondary text-sm">
        Quitar respaldos
      </button>
    </div>
  </div>
</template>
