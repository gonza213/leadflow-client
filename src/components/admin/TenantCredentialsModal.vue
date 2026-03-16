<script setup>
const props = defineProps({
  credentials: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

const copyAll = () => {
  const text = `
=== TENANT: ${props.credentials.tenant.name} ===

SLUG: ${props.credentials.tenant.slug}
URL APP: ${props.credentials.tenant.appUrl}

=== INTEGRACION MAKE/GHL ===
WEBHOOK (crear lead): ${props.credentials.tenant.webhookUrl}
UPDATE LEAD: ${props.credentials.tenant.updateLeadUrl}
API KEY: ${props.credentials.tenant.apiKey}

Header requerido: X-API-Key: ${props.credentials.tenant.apiKey}

=== CREDENCIALES MANAGER ===
EMAIL: ${props.credentials.manager.email}
PASSWORD: ${props.credentials.manager.temporaryPassword}
  `.trim()
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Tenant Creado Exitosamente</h2>
      </div>

      <div class="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Nombre</label>
          <p class="font-medium text-gray-900 dark:text-white">{{ credentials.tenant.name }}</p>
        </div>

        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Slug</label>
          <p class="font-mono text-sm text-gray-900 dark:text-gray-100">/{{ credentials.tenant.slug }}</p>
        </div>

        <hr class="border-gray-200 dark:border-gray-600" />

        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">URL de la App</label>
          <p class="font-mono text-sm text-gray-900 dark:text-gray-100">{{ credentials.tenant.appUrl }}</p>
        </div>

        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Webhook URL (crear leads)</label>
          <p class="font-mono text-sm break-all">{{ credentials.tenant.webhookUrl }}</p>
        </div>

        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Update Lead URL (para Make)</label>
          <p class="font-mono text-sm break-all">{{ credentials.tenant.updateLeadUrl }}</p>
        </div>

        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">API Key (header X-API-Key)</label>
          <p class="font-mono text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 px-2 py-1 rounded break-all">
            {{ credentials.tenant.apiKey }}
          </p>
        </div>

        <hr class="border-gray-200 dark:border-gray-600" />

        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Email del Manager</label>
          <p class="font-medium text-gray-900 dark:text-white">{{ credentials.manager.email }}</p>
        </div>

        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Contrasena Temporal</label>
          <p class="font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 px-2 py-1 rounded inline-block">
            {{ credentials.manager.temporaryPassword }}
          </p>
        </div>
      </div>

      <p class="text-sm text-amber-600 dark:text-amber-400 mt-4">
        Guarda estas credenciales. La contrasena no se podra recuperar.
      </p>

      <div class="flex justify-end gap-3 mt-6">
        <button @click="copyAll" class="btn btn-secondary">
          Copiar Todo
        </button>
        <button @click="emit('close')" class="btn btn-primary">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
