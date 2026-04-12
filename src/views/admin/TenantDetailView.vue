<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTenantsStore } from '../../stores/tenants'

const route = useRoute()
const router = useRouter()
const tenantsStore = useTenantsStore()

const editing = ref(false)
const editForm = ref({ name: '' })

// User editing
const showEditUserModal = ref(false)
const editingUser = ref(null)
const editUserForm = ref({
  name: '',
  email: '',
  password: ''
})

onMounted(async () => {
  const result = await tenantsStore.fetchTenant(route.params.id)
  if (result.success) {
    editForm.value.name = result.tenant.name
  }
  await tenantsStore.fetchTenantUsers(route.params.id)
})

const handleSave = async () => {
  const result = await tenantsStore.updateTenant(route.params.id, editForm.value)
  if (result.success) {
    editing.value = false
  }
}

const openEditUserModal = (user) => {
  editingUser.value = user
  editUserForm.value = {
    name: user.name,
    email: user.email,
    password: ''
  }
  showEditUserModal.value = true
}

const handleSaveUser = async () => {
  if (!editingUser.value) return

  const data = {
    name: editUserForm.value.name,
    email: editUserForm.value.email
  }

  if (editUserForm.value.password) {
    data.password = editUserForm.value.password
  }

  const result = await tenantsStore.updateTenantUser(route.params.id, editingUser.value._id, data)
  if (result.success) {
    showEditUserModal.value = false
    editingUser.value = null
  } else {
    alert(result.error)
  }
}

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'manager':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
    case 'seller':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
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

const handleUpdateSubscription = async (newStatus) => {
  try {
    const result = await tenantsStore.updateSubscription(route.params.id, newStatus)
    if (result.success) {
      // Recargar datos para ver la fecha de vencimiento actualizada
      await tenantsStore.fetchTenant(route.params.id)
    }
  } catch (e) {
    console.error('Error updating subscription status:', e)
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

      <!-- Estado de Suscripción -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Plan y Suscripción</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400">Estado de Suscripción</label>
            <select 
              :value="tenantsStore.currentTenant.subscriptionStatus"
              @change="(e) => handleUpdateSubscription(e.target.value)"
              class="input mt-1 bg-white dark:bg-gray-800"
            >
              <option value="trial">Prueba (Trial)</option>
              <option value="active">Activo (Pago manual)</option>
              <option value="inactive">Inactivo / Cancelado</option>
              <option value="lifetime">Lifetime (Sin expirar)</option>
            </select>
          </div>
          
          <div v-if="tenantsStore.currentTenant.subscriptionExpiresAt">
            <label class="text-xs text-gray-500 dark:text-gray-400">Vence el</label>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ new Date(tenantsStore.currentTenant.subscriptionExpiresAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) }}
            </p>
          </div>

          <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
            <p class="text-xs text-blue-700 dark:text-blue-300">
              <span class="font-bold">Info:</span> Al cambiar el estado a "Activo", se generará automáticamente un comprobante de pago en Google Drive.
            </p>
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

      <!-- Usuarios del Tenant -->
      <div class="card lg:col-span-2">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Usuarios del Tenant</h3>

        <div v-if="tenantsStore.tenantUsers.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in tenantsStore.tenantUsers" :key="user._id">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ user.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ user.email }}</td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getRoleBadgeClass(user.role)"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    @click="openEditUserModal(user)"
                    class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400">No hay usuarios</p>
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

    <!-- Modal editar usuario -->
    <div v-if="showEditUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editar Usuario</h2>

        <div class="space-y-4">
          <div>
            <label class="label text-sm">Nombre</label>
            <input v-model="editUserForm.name" type="text" class="input" placeholder="Nombre completo" />
          </div>
          <div>
            <label class="label text-sm">Email</label>
            <input v-model="editUserForm.email" type="email" class="input" placeholder="email@ejemplo.com" />
          </div>
          <div>
            <label class="label text-sm">Nueva Contraseña</label>
            <input v-model="editUserForm.password" type="password" class="input" placeholder="Dejar vacío para mantener" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Solo completar si deseas cambiar la contraseña</p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="showEditUserModal = false" class="btn btn-secondary flex-1">
            Cancelar
          </button>
          <button
            @click="handleSaveUser"
            class="btn btn-primary flex-1"
            :disabled="!editUserForm.name || !editUserForm.email"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
