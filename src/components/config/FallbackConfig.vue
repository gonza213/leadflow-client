<script setup>
import { ref, onMounted } from 'vue'
import { useSellersStore } from '../../stores/sellers'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  fallbackSellerId: { type: String, default: null },
  onSave: { type: Function, required: true }
})

const sellersStore = useSellersStore()
const authStore = useAuthStore()

const selectedSellerId = ref(props.fallbackSellerId || '')
const saving = ref(false)
const saved = ref(false)
const error = ref('')

onMounted(async () => {
  await sellersStore.fetchSellers()
})

const handleSave = async () => {
  saving.value = true
  error.value = ''
  const result = await props.onSave(selectedSellerId.value || null)
  if (result?.success) {
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } else {
    error.value = result?.error || 'Error al guardar'
  }
  saving.value = false
}

const handleClear = async () => {
  selectedSellerId.value = ''
  await handleSave()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Vendedor de Respaldo</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Cuando todos los vendedores alcancen su límite diario o semanal, los leads nuevos serán
        asignados a este vendedor automáticamente, sin importar sus límites.
      </p>
    </div>

    <!-- Info box -->
    <div class="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
      <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p class="font-medium mb-1">¿Cómo funciona?</p>
        <ol class="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-400">
          <li>Llega un nuevo lead por webhook</li>
          <li>El sistema intenta asignar al equipo correspondiente según el % configurado</li>
          <li>Si todos están al límite, intenta con cualquier equipo disponible</li>
          <li>Si ninguno tiene disponibilidad → el lead se asigna al <strong>vendedor de respaldo</strong></li>
        </ol>
      </div>
    </div>

    <!-- Selector -->
    <div class="space-y-2">
      <label class="label">Vendedor de respaldo</label>
      <select v-model="selectedSellerId" class="input max-w-sm">
        <option value="">Sin vendedor de respaldo (el lead se pierde)</option>
        <option
          v-for="seller in sellersStore.sellers"
          :key="seller._id"
          :value="seller._id"
        >
          {{ seller.seller_name }} — {{ seller.team }}
        </option>
      </select>

      <p v-if="!selectedSellerId" class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Sin respaldo configurado: los leads se perderán cuando todos estén al límite
      </p>
      <p v-else class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Los leads sin asignar irán a
        <strong>{{ sellersStore.sellers.find(s => s._id === selectedSellerId)?.seller_name }}</strong>
      </p>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ error }}
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3">
      <button
        @click="handleSave"
        :disabled="saving"
        class="btn btn-primary"
      >
        {{ saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar' }}
      </button>
      <button
        v-if="selectedSellerId"
        @click="handleClear"
        :disabled="saving"
        class="btn btn-secondary text-sm"
      >
        Quitar respaldo
      </button>
    </div>
  </div>
</template>
