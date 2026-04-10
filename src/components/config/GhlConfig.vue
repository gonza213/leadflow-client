<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  ghlWebhookUrl: String,
  timezone: String
})

const emit = defineEmits(['update'])

const timezones = [
  { value: 'America/New_York', label: 'Eastern (EST/EDT - Nueva York)', offset: 'GMT-5/-4' },
  { value: 'America/Chicago', label: 'Central (CST/CDT - Chicago)', offset: 'GMT-6/-5' },
  { value: 'America/Denver', label: 'Mountain (MST/MDT - Denver)', offset: 'GMT-7/-6' },
  { value: 'America/Los_Angeles', label: 'Pacific (PST/PDT - Los Angeles)', offset: 'GMT-8/-7' }
]

const localWebhookUrl = ref(props.ghlWebhookUrl || '')
const localTimezone = ref(props.timezone || 'America/Chicago')
const error = ref('')
const success = ref('')

watch(() => props.ghlWebhookUrl, (val) => {
  localWebhookUrl.value = val || ''
})

watch(() => props.timezone, (val) => {
  localTimezone.value = val || 'America/Chicago'
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
  emit('update', {
    ghl_webhook_url: localWebhookUrl.value || null,
    timezone: localTimezone.value
  })
  success.value = 'Configuracion actualizada correctamente'
  setTimeout(() => success.value = '', 3000)
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integracion con CRM</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Configura la URL del webhook de notificacion para que el sistema avise automaticamente
      a tu CRM (GoHighLevel, HubSpot, etc.) cuando se asigna un vendedor a un lead.
    </p>

    <!-- Timezone -->
    <div class="mb-6">
      <label class="label">Zona Horaria</label>
      <select v-model="localTimezone" class="input">
        <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
          {{ tz.label }} ({{ tz.offset }})
        </option>
      </select>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        La zona horaria se usa para calcular correctamente los leads de "hoy" y "esta semana".
      </p>
    </div>

    <div class="mb-6">
      <label class="label">URL Webhook de notificacion (opcional)</label>
      <input
        v-model="localWebhookUrl"
        type="url"
        class="input"
        placeholder="https://tu-crm.com/webhook/..."
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        El sistema hara un POST a esta URL cada vez que asigne un vendedor a un lead.
        Compatible con GHL, HubSpot, Make, Zapier, o cualquier servicio que acepte webhooks.
      </p>
    </div>

    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
      <h4 class="font-medium text-blue-900 dark:text-blue-300 mb-2">Datos enviados al webhook:</h4>
      <pre v-pre class="text-xs text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-2 rounded overflow-x-auto">{
  "contact_id": "abc123",
  "seller_user_id": "crm_user_id_del_vendedor",
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
