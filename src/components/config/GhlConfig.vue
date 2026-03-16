<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  ghlWebhookUrl: String
})

const emit = defineEmits(['update'])

const localWebhookUrl = ref(props.ghlWebhookUrl || '')
const error = ref('')
const success = ref('')

watch(() => props.ghlWebhookUrl, (val) => {
  localWebhookUrl.value = val || ''
})

const isValidUrl = (string) => {
  if (!string) return true
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const handleSave = async () => {
  if (localWebhookUrl.value && !isValidUrl(localWebhookUrl.value)) {
    error.value = 'La URL ingresada no es valida'
    return
  }

  error.value = ''
  await emit('update', localWebhookUrl.value || null)
  success.value = 'Configuracion GHL actualizada correctamente'
  setTimeout(() => success.value = '', 3000)
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integracion GoHighLevel</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Configura la URL del webhook de GHL para que el sistema notifique automaticamente
      cuando se asigna un vendedor a un lead.
    </p>

    <div class="mb-6">
      <label class="label">URL Webhook GHL (respuesta)</label>
      <input
        v-model="localWebhookUrl"
        type="url"
        class="input"
        placeholder="https://services.leadconnectorhq.com/hooks/..."
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Esta URL recibira un POST con los datos del vendedor asignado cada vez que entre un nuevo lead.
      </p>
    </div>

    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
      <h4 class="font-medium text-blue-900 dark:text-blue-300 mb-2">Datos enviados al webhook:</h4>
      <pre v-pre class="text-xs text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-2 rounded overflow-x-auto">{
  "contact_id": "abc123",
  "seller_user_id": "ghl_user_id_del_vendedor",
  "seller_name": "Nombre del Vendedor",
  "team": "Equipo A"
}</pre>
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
