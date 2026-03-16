<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTenantsStore } from '../../stores/tenants'

const route = useRoute()
const router = useRouter()
const tenantsStore = useTenantsStore()

const editing = ref(false)
const editForm = ref({ name: '' })

onMounted(async () => {
  const result = await tenantsStore.fetchTenant(route.params.id)
  if (result.success) {
    editForm.value.name = result.tenant.name
  }
})

const handleSave = async () => {
  const result = await tenantsStore.updateTenant(route.params.id, editForm.value)
  if (result.success) {
    editing.value = false
  }
}

const handleToggleActive = async () => {
  if (!tenantsStore.currentTenant) return
  await tenantsStore.updateTenant(route.params.id, {
    active: !tenantsStore.currentTenant.active
  })
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

const handleRegenerateApiKey = async () => {
  if (!confirm('Regenerar API key invalidara la anterior. Los escenarios de Make dejaran de funcionar hasta actualizarlos. Continuar?')) {
    return
  }
  const result = await tenantsStore.regenerateApiKey(route.params.id)
  if (result.success) {
    alert('API key regenerada: ' + result.apiKey)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <button @click="router.push('/admin/tenants')" class="btn btn-secondary">
        &larr; Volver
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Detalle del Tenant
      </h1>
    </div>

    <div v-if="tenantsStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="tenantsStore.currentTenant" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Info basica -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Informacion General</h3>

        <div v-if="!editing" class="space-y-4">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Nombre</label>
            <p class="font-medium text-gray-900 dark:text-white">{{ tenantsStore.currentTenant.name }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Slug</label>
            <p class="font-mono text-gray-900 dark:text-white">/{{ tenantsStore.currentTenant.slug }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Estado</label>
            <div class="flex items-center gap-2 mt-1">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  tenantsStore.currentTenant.active ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                ]"
              >
                {{ tenantsStore.currentTenant.active ? 'Activo' : 'Inactivo' }}
              </span>
              <button
                @click="handleToggleActive"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                {{ tenantsStore.currentTenant.active ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Usuarios</label>
            <p class="font-medium text-gray-900 dark:text-white">{{ tenantsStore.currentTenant.userCount }}</p>
          </div>
          <button @click="editing = true" class="btn btn-secondary mt-4">
            Editar Nombre
          </button>
        </div>

        <div v-else class="space-y-4">
          <div>
            <label class="label">Nombre</label>
            <input v-model="editForm.name" type="text" class="input" />
          </div>
          <div class="flex gap-2">
            <button @click="handleSave" class="btn btn-primary">Guardar</button>
            <button @click="editing = false" class="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Integracion Make/GHL -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Integracion Make/GHL</h3>

        <div class="space-y-4">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Webhook URL (crear leads)</label>
            <div class="flex items-center gap-2 mt-1">
              <p class="font-mono text-sm break-all bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded flex-1">
                {{ tenantsStore.currentTenant.webhookUrl }}
              </p>
              <button
                @click="copyToClipboard(tenantsStore.currentTenant.webhookUrl)"
                class="btn btn-sm btn-secondary"
              >
                Copiar
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">API Key (header X-API-Key)</label>
            <div class="flex items-center gap-2 mt-1">
              <p class="font-mono text-sm break-all bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 p-2 rounded flex-1">
                {{ tenantsStore.currentTenant.apiKey }}
              </p>
              <button
                @click="copyToClipboard(tenantsStore.currentTenant.apiKey)"
                class="btn btn-sm btn-secondary"
              >
                Copiar
              </button>
            </div>
          </div>

          <button
            @click="handleRegenerateApiKey"
            class="btn btn-sm btn-secondary text-amber-600"
          >
            Regenerar API Key
          </button>

          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">URL de la App</label>
            <p class="font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded">
              {{ tenantsStore.currentTenant.appUrl }}
            </p>
          </div>
        </div>
      </div>

      <!-- Manager -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Usuario Manager</h3>

        <div v-if="tenantsStore.currentTenant.manager" class="space-y-2">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Nombre</label>
            <p class="font-medium text-gray-900 dark:text-white">{{ tenantsStore.currentTenant.manager.name }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Email</label>
            <p class="font-medium text-gray-900 dark:text-white">{{ tenantsStore.currentTenant.manager.email }}</p>
          </div>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400">Sin manager asignado</p>
      </div>

      <!-- Config -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Configuracion</h3>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'w-3 h-3 rounded-full',
                tenantsStore.currentTenant.hasConfig ? 'bg-green-500' : 'bg-gray-300'
              ]"
            ></span>
            <span class="text-gray-700 dark:text-gray-300">
              {{ tenantsStore.currentTenant.hasConfig ? 'Configuracion creada' : 'Sin configurar' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
      Tenant no encontrado
    </div>
  </div>
</template>
