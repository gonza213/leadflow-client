<script setup>
import { ref } from 'vue'
import { adminApi } from '../../services/api'

const props = defineProps({
  tenant: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-active', 'delete', 'subscription-updated'])

const showWebhook = ref(false)
const updatingSubscription = ref(false)

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

const subscriptionLabel = {
  trial: 'Trial',
  active: 'Suscripto',
  inactive: 'Inactivo',
  lifetime: 'Lifetime'
}

const subscriptionClass = {
  trial: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  active: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  inactive: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  lifetime: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
}

const trialDaysLeft = (tenant) => {
  if (tenant.subscriptionStatus !== 'trial' || !tenant.trialEndsAt) return null
  const diff = new Date(tenant.trialEndsAt) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const toggleLifetime = async () => {
  const newStatus = props.tenant.subscriptionStatus === 'lifetime' ? 'active' : 'lifetime'
  updatingSubscription.value = true
  try {
    await adminApi.updateSubscription(props.tenant._id, newStatus)
    emit('subscription-updated')
  } finally {
    updatingSubscription.value = false
  }
}
</script>

<template>
  <div class="card" :class="{ 'opacity-60': !tenant.active }">
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ tenant.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">/{{ tenant.slug }}</p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', tenant.active ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300']">
          {{ tenant.active ? 'Activo' : 'Inactivo' }}
        </span>
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', subscriptionClass[tenant.subscriptionStatus] || subscriptionClass.inactive]">
          {{ subscriptionLabel[tenant.subscriptionStatus] || tenant.subscriptionStatus }}
        </span>
      </div>
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
      <div v-if="tenant.subscriptionStatus === 'trial'" class="flex justify-between">
        <span>Trial vence en:</span>
        <span class="font-medium" :class="trialDaysLeft(tenant) <= 2 ? 'text-red-500' : ''">
          {{ trialDaysLeft(tenant) }} días
        </span>
      </div>
      <div v-if="tenant.subscriptionStatus === 'active' && tenant.subscriptionExpiresAt" class="flex justify-between">
        <span>Suscripción vence:</span>
        <span>{{ new Date(tenant.subscriptionExpiresAt).toLocaleDateString() }}</span>
      </div>
    </div>

    <!-- Toggle lifetime -->
    <div class="flex items-center justify-between mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span class="text-xs text-gray-600 dark:text-gray-400">Acceso lifetime (sin pago)</span>
      <button
        @click="toggleLifetime"
        :disabled="updatingSubscription"
        :class="[
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          tenant.subscriptionStatus === 'lifetime' ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
        ]"
      >
        <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', tenant.subscriptionStatus === 'lifetime' ? 'translate-x-4' : 'translate-x-1']" />
      </button>
    </div>

    <div class="mb-4">
      <button @click="showWebhook = !showWebhook" class="text-sm text-primary-600 hover:text-primary-700">
        {{ showWebhook ? 'Ocultar' : 'Ver' }} Webhook URL
      </button>
      <div v-if="showWebhook" class="mt-2 p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-xs break-all">
        {{ tenant.webhookUrl }}
        <button @click="copyToClipboard(tenant.webhookUrl)" class="ml-2 text-primary-600 hover:text-primary-700">Copiar</button>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        @click="emit('toggle-active', tenant._id)"
        :class="['btn btn-sm flex-1', tenant.active ? 'btn-secondary' : 'btn-primary']"
      >
        {{ tenant.active ? 'Desactivar' : 'Activar' }}
      </button>
      <router-link :to="`/admin/tenants/${tenant._id}`" class="btn btn-sm btn-secondary">
        Detalles
      </router-link>
      <button @click="emit('delete', tenant._id, tenant.name)" class="btn btn-sm btn-danger" title="Eliminar tenant">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>
