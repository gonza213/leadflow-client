<script setup>
import { ref } from 'vue'

const props = defineProps({
  tenant: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-active', 'delete'])

const showWebhook = ref(false)

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="card" :class="{ 'opacity-60': !tenant.active }">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ tenant.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">/{{ tenant.slug }}</p>
      </div>
      <span
        :class="[
          'px-2 py-1 text-xs font-medium rounded-full',
          tenant.active ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
        ]"
      >
        {{ tenant.active ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
      <div class="flex justify-between">
        <span>Usuarios:</span>
        <span class="font-medium">{{ tenant.userCount }}</span>
      </div>
      <div class="flex justify-between">
        <span>Creado:</span>
        <span>{{ new Date(tenant.createdAt).toLocaleDateString() }}</span>
      </div>
    </div>

    <div class="mb-4">
      <button
        @click="showWebhook = !showWebhook"
        class="text-sm text-primary-600 hover:text-primary-700"
      >
        {{ showWebhook ? 'Ocultar' : 'Ver' }} Webhook URL
      </button>
      <div v-if="showWebhook" class="mt-2 p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-xs break-all">
        {{ tenant.webhookUrl }}
        <button
          @click="copyToClipboard(tenant.webhookUrl)"
          class="ml-2 text-primary-600 hover:text-primary-700"
        >
          Copiar
        </button>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        @click="emit('toggle-active', tenant._id)"
        :class="[
          'btn btn-sm flex-1',
          tenant.active ? 'btn-secondary' : 'btn-primary'
        ]"
      >
        {{ tenant.active ? 'Desactivar' : 'Activar' }}
      </button>
      <router-link
        :to="`/admin/tenants/${tenant._id}`"
        class="btn btn-sm btn-secondary"
      >
        Detalles
      </router-link>
      <button
        @click="emit('delete', tenant._id, tenant.name)"
        class="btn btn-sm btn-danger"
        title="Eliminar tenant"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>
