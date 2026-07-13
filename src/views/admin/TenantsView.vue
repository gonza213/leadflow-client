<script setup>
import { onMounted, ref, computed } from 'vue'
import { useTenantsStore } from '../../stores/tenants'
import { adminApi } from '../../services/api'
import { useI18n } from 'vue-i18n'
import TenantCard from '../../components/admin/TenantCard.vue'
import CreateTenantModal from '../../components/admin/CreateTenantModal.vue'
import TenantCredentialsModal from '../../components/admin/TenantCredentialsModal.vue'

const tenantsStore = useTenantsStore()
const { t } = useI18n()

const showCreateModal = ref(false)
const showCredentialsModal = ref(false)
const newTenantCredentials = ref(null)
const filterStatus = ref('all')

onMounted(async () => {
  await tenantsStore.fetchTenants()
})

const filteredTenants = computed(() => {
  if (filterStatus.value === 'all') return tenantsStore.tenants
  return tenantsStore.tenants.filter(t =>
    filterStatus.value === 'active' ? t.active : !t.active
  )
})

// Agrupar por dueño (adminclient); los tenants clásicos sin dueño van en su propia sección
const groupedTenants = computed(() => {
  const groups = new Map()
  const legacy = []

  for (const tenant of filteredTenants.value) {
    if (tenant.ownerId?._id) {
      const key = tenant.ownerId._id
      if (!groups.has(key)) {
        groups.set(key, { owner: tenant.ownerId, tenants: [] })
      }
      groups.get(key).tenants.push(tenant)
    } else {
      legacy.push(tenant)
    }
  }

  const result = [...groups.values()].sort((a, b) => a.owner.name.localeCompare(b.owner.name))
  if (legacy.length > 0) {
    result.push({ owner: null, tenants: legacy })
  }
  return result
})

// --- Acciones a nivel dueño (aplican a todas sus empresas) ---
const ownerBusyId = ref(null)

const handleOwnerLifetime = async (owner) => {
  const newStatus = owner.subscriptionStatus === 'lifetime' ? 'active' : 'lifetime'
  ownerBusyId.value = owner._id
  try {
    await adminApi.updateOwnerSubscription(owner._id, newStatus)
    await tenantsStore.fetchTenants()
  } catch (e) {
    tenantsStore.error = e.response?.data?.message || 'Error al actualizar la suscripción del dueño'
  } finally {
    ownerBusyId.value = null
  }
}

const handleOwnerToggleActive = async (group) => {
  const anyActive = group.tenants.some(t => t.active)
  ownerBusyId.value = group.owner._id
  try {
    await adminApi.updateOwner(group.owner._id, { active: !anyActive })
    await tenantsStore.fetchTenants()
  } catch (e) {
    tenantsStore.error = e.response?.data?.message || 'Error al actualizar las empresas del dueño'
  } finally {
    ownerBusyId.value = null
  }
}

const handleOwnerDelete = async (group) => {
  const msg = `¿Eliminar al dueño "${group.owner.name}" y sus ${group.tenants.length} empresa(s)? ` +
    'Se borrarán TODOS los datos asociados (usuarios, leads, vendedores, configuración) y no se puede deshacer.'
  if (!confirm(msg)) return
  ownerBusyId.value = group.owner._id
  try {
    await adminApi.deleteOwner(group.owner._id)
    await tenantsStore.fetchTenants()
  } catch (e) {
    tenantsStore.error = e.response?.data?.message || 'Error al eliminar el dueño'
  } finally {
    ownerBusyId.value = null
  }
}

const ownerStatusClass = (status) => {
  switch (status) {
    case 'active':
    case 'lifetime':
      return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    case 'trial':
      return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    default:
      return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }
}

const handleCreateTenant = async (data) => {
  const result = await tenantsStore.createTenant(data)
  if (result.success) {
    showCreateModal.value = false
    newTenantCredentials.value = result.data
    showCredentialsModal.value = true
  }
}

const handleToggleActive = async (tenantId) => {
  await tenantsStore.toggleActive(tenantId)
}

const handleDelete = async (tenantId, tenantName) => {
  if (!confirm(t('admin.tenants.deleteConfirm', { name: tenantName }))) {
    return
  }
  await tenantsStore.deleteTenant(tenantId)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('admin.tenants.title') }}</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        {{ t('admin.tenants.add') }}
      </button>
    </div>

    <div class="card">
      <div class="flex items-center gap-4">
        <div class="flex-1 max-w-xs">
          <label class="label">{{ t('admin.tenants.filterStatus') }}</label>
          <select v-model="filterStatus" class="input">
            <option value="all">{{ t('dashboard.filters.all') }}</option>
            <option value="active">{{ t('dashboard.summary.active') }}</option>
            <option value="inactive">{{ t('dashboard.summary.disabled') }}</option>
          </select>
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400 mt-6">
          {{ t('admin.tenants.count', { n: filteredTenants.length }) }}
        </div>
      </div>
    </div>

    <div v-if="tenantsStore.error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
      {{ tenantsStore.error }}
    </div>

    <div v-if="tenantsStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="filteredTenants.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      {{ t('admin.tenants.noTenants') }}
    </div>

    <div v-else class="space-y-8">
      <section v-for="group in groupedTenants" :key="group.owner?._id || 'legacy'">
        <!-- Encabezado del grupo: dueño (con su suscripción) o clientes clásicos -->
        <div class="flex flex-wrap items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <template v-if="group.owner">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            <span class="font-semibold text-gray-900 dark:text-white">{{ group.owner.name }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ group.owner.email }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="ownerStatusClass(group.owner.subscriptionStatus)">
              {{ t(`subscription.status.${group.owner.subscriptionStatus}`) }}
            </span>

            <!-- Controles generales del dueño (aplican a todas sus empresas) -->
            <div class="flex items-center gap-3 ml-2">
              <label class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                Lifetime
                <button
                  @click="handleOwnerLifetime(group.owner)"
                  :disabled="ownerBusyId !== null"
                  :class="[
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50',
                    group.owner.subscriptionStatus === 'lifetime' ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                  ]"
                >
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', group.owner.subscriptionStatus === 'lifetime' ? 'translate-x-4' : 'translate-x-1']" />
                </button>
              </label>

              <button
                @click="handleOwnerToggleActive(group)"
                :disabled="ownerBusyId !== null"
                class="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {{ group.tenants.some(t => t.active) ? 'Desactivar todo' : 'Activar todo' }}
              </button>

              <button
                @click="handleOwnerDelete(group)"
                :disabled="ownerBusyId !== null"
                class="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                title="Eliminar dueño y todas sus empresas"
              >
                <div v-if="ownerBusyId === group.owner._id" class="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </template>
          <template v-else>
            <span class="font-semibold text-gray-500 dark:text-gray-400">{{ t('admin.tenants.legacyGroup') }}</span>
          </template>
          <span class="ml-auto text-xs text-gray-400">{{ t('admin.tenants.count', { n: group.tenants.length }) }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TenantCard
            v-for="tenant in group.tenants"
            :key="tenant._id"
            :tenant="tenant"
            :owned="!!group.owner"
            @toggle-active="handleToggleActive"
            @delete="handleDelete"
            @subscription-updated="tenantsStore.fetchTenants()"
          />
        </div>
      </section>
    </div>

    <CreateTenantModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @submit="handleCreateTenant"
    />

    <TenantCredentialsModal
      v-if="showCredentialsModal"
      :credentials="newTenantCredentials"
      @close="showCredentialsModal = false"
    />
  </div>
</template>
