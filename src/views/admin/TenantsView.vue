<script setup>
import { onMounted, ref, computed } from 'vue'
import { useTenantsStore } from '../../stores/tenants'
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

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TenantCard
        v-for="tenant in filteredTenants"
        :key="tenant._id"
        :tenant="tenant"
        @toggle-active="handleToggleActive"
        @delete="handleDelete"
        @subscription-updated="tenantsStore.fetchTenants()"
      />
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
