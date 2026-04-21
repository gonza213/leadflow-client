<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useLeadsStore } from '../stores/leads'
import { useConfigStore } from '../stores/config'
import { useSellersStore } from '../stores/sellers'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const leadsStore = useLeadsStore()
const configStore = useConfigStore()
const sellersStore = useSellersStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const showFilters = ref(false)

// Edit modal
const showEditModal = ref(false)
const editingLead = ref(null)
const editForm = reactive({
  name: '',
  email: '',
  phone: '',
  source: '',
  opportunity_stage: '',
  seller_user_id: ''
})
const editError = ref('')
const editLoading = ref(false)

// Delete confirmation
const showDeleteConfirm = ref(false)
const deletingLead = ref(null)
const deleteLoading = ref(false)

onMounted(async () => {
  await configStore.fetchConfig()
  if (authStore.isManager) {
    await sellersStore.fetchSellers()
  }
  await leadsStore.fetchLeads(1)
})

const handleFilter = () => {
  leadsStore.fetchLeads(1)
  showFilters.value = false
}

const handleResetFilters = () => {
  leadsStore.resetLeadsFilters()
  leadsStore.fetchLeads(1)
}

const handlePageChange = (page) => {
  leadsStore.fetchLeads(page)
}

// Edit functions
const openEditModal = (lead) => {
  editingLead.value = lead
  editForm.name = lead.name || ''
  editForm.email = lead.email || ''
  editForm.phone = lead.phone || ''
  editForm.source = lead.source || ''
  editForm.opportunity_stage = lead.opportunity_stage || ''
  editForm.seller_user_id = lead.seller_id || ''
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingLead.value = null
  editError.value = ''
}

const handleEdit = async () => {
  editLoading.value = true
  editError.value = ''

  const result = await leadsStore.editLead(editingLead.value._id, editForm)

  if (result.success) {
    closeEditModal()
    await leadsStore.fetchLeads(leadsStore.pagination.page)
  } else {
    editError.value = result.error
  }
  editLoading.value = false
}

// Delete functions
const openDeleteConfirm = (lead) => {
  deletingLead.value = lead
  showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  deletingLead.value = null
}

const handleDelete = async () => {
  deleteLoading.value = true
  const result = await leadsStore.deleteLead(deletingLead.value._id)

  if (result.success) {
    closeDeleteConfirm()
  }
  deleteLoading.value = false
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

const getStateClass = (state) => {
  const classes = {
    new: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    contacted: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
    qualified: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    lost: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
  }
  return classes[state] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('leads.title') }}</h1>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('leads.total', { n: leadsStore.pagination.total }) }}</span>

        <!-- Exportar CSV / XLSX -->
        <div class="flex items-center gap-2">
          <button
            @click="leadsStore.exportLeadsToCsv()"
            :disabled="leadsStore.exportLoading || leadsStore.leadsLoading"
            class="btn btn-secondary btn-sm flex items-center gap-1.5"
            title="CSV"
          >
            <svg v-if="!leadsStore.exportLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="hidden sm:inline">CSV</span>
          </button>
          
          <button
            @click="leadsStore.exportLeadsToXlsx()"
            :disabled="leadsStore.exportLoading || leadsStore.leadsLoading"
            class="btn btn-secondary btn-sm flex items-center gap-1.5"
            title="Excel"
          >
            <svg v-if="!leadsStore.exportLoading" class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <svg v-else class="w-4 h-4 text-green-600 dark:text-green-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="hidden sm:inline">Excel</span>
          </button>
        </div>

        <!-- Filtros mobile -->
        <button
          @click="showFilters = !showFilters"
          class="lg:hidden btn btn-secondary btn-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filtros - Colapsable en mobile -->
    <div
      class="card"
      :class="{ 'hidden lg:block': !showFilters }"
    >
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label class="label text-xs">{{ t('dashboard.filters.startDate') }}</label>
          <input
            v-model="leadsStore.leadsFilters.fecha_inicio"
            type="date"
            class="input text-sm"
          />
        </div>
        <div>
          <label class="label text-xs">{{ t('dashboard.filters.endDate') }}</label>
          <input
            v-model="leadsStore.leadsFilters.fecha_fin"
            type="date"
            class="input text-sm"
          />
        </div>
        <div v-if="authStore.isManager">
          <label class="label text-xs">{{ t('dashboard.filters.team') }}</label>
          <select v-model="leadsStore.leadsFilters.equipo" class="input text-sm">
            <option value="">{{ t('dashboard.filters.all') }}</option>
            <option
              v-for="equipo in configStore.config?.equipos || []"
              :key="equipo.nombre"
              :value="equipo.nombre"
            >
              {{ equipo.nombre }}
            </option>
          </select>
        </div>
        <div v-if="authStore.isManager">
          <label class="label text-xs">{{ t('dashboard.filters.seller') }}</label>
          <select v-model="leadsStore.leadsFilters.seller_id" class="input text-sm">
            <option value="">{{ t('dashboard.filters.all') }}</option>
            <option
              v-for="seller in sellersStore.sellers"
              :key="seller._id"
              :value="seller._id"
            >
              {{ seller.seller_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="label text-xs">{{ t('dashboard.filters.stage') }}</label>
          <select v-model="leadsStore.leadsFilters.opportunity_stage" class="input text-sm">
            <option value="">{{ t('dashboard.filters.allStages') }}</option>
            <option
              v-for="stage in configStore.config?.opportunity_stages || []"
              :key="stage"
              :value="stage"
            >
              {{ stage }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button @click="handleFilter" class="btn btn-primary btn-sm flex-1 lg:flex-none">
          {{ t('dashboard.filters.apply') }}
        </button>
        <button @click="handleResetFilters" class="btn btn-secondary btn-sm">
          {{ t('dashboard.filters.reset') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="leadsStore.leadsLoading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Vista Mobile: Cards -->
      <div class="lg:hidden space-y-3">
        <div
          v-for="lead in leadsStore.leadsList"
          :key="lead._id"
          class="card p-3"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ lead.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateShort(lead.date) }}</p>
            </div>
            <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', getStateClass(lead.state)]">
              {{ lead.state }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm">
            <div v-if="lead.phone">
              <p class="text-xs text-gray-400">{{ t('leads.table.phone') }}</p>
              <p class="text-gray-700 dark:text-gray-200">{{ lead.phone }}</p>
            </div>
            <div v-if="lead.email">
              <p class="text-xs text-gray-400">{{ t('leads.table.email') }}</p>
              <p class="text-gray-700 dark:text-gray-200 truncate">{{ lead.email }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">{{ t('leads.table.seller') }}</p>
              <p class="text-gray-700 dark:text-gray-200">{{ lead.seller_name || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">{{ t('leads.table.team') }}</p>
              <p class="text-gray-700 dark:text-gray-200">{{ lead.team || '-' }}</p>
            </div>
          </div>

          <div class="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
              {{ lead.opportunity_stage }}
            </span>
            <div class="flex items-center gap-3">
              <span v-if="lead.source" class="text-xs text-gray-400">{{ lead.source }}</span>
              <div v-if="authStore.canEdit" class="flex items-center gap-2">
                <button
                  @click="openEditModal(lead)"
                  class="text-blue-600 dark:text-blue-400"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  v-if="authStore.isManager"
                  @click="openDeleteConfirm(lead)"
                  class="text-red-600 dark:text-red-400"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="leadsStore.leadsList.length === 0" class="card text-center py-8 text-gray-500 dark:text-gray-400">
          {{ t('leads.table.noLeads') }}
        </div>
      </div>

      <!-- Vista Desktop: Tabla -->
      <div class="hidden lg:block card overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.date') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.email') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.phone') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.status') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.team') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.seller') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.stage') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.source') }}</th>
                <th v-if="authStore.isManager" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('leads.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="lead in leadsStore.leadsList" :key="lead._id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {{ formatDate(lead.date) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {{ lead.name }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ lead.email || '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {{ lead.phone || '-' }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStateClass(lead.state)]">
                    {{ lead.state }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ lead.team || '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {{ lead.seller_name || '-' }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                    {{ lead.opportunity_stage }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ lead.source || '-' }}
                </td>
                <td v-if="authStore.canEdit" class="px-4 py-3 text-sm">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditModal(lead)"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      :title="t('common.edit')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      v-if="authStore.isManager"
                      @click="openDeleteConfirm(lead)"
                      class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      :title="t('common.delete')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="leadsStore.leadsList.length === 0">
                <td :colspan="authStore.isManager ? 10 : 9" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {{ t('leads.table.noLeads') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginacion -->
      <div v-if="leadsStore.pagination.pages > 1" class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ leadsStore.pagination.page }} / {{ leadsStore.pagination.pages }}
        </div>
        <div class="flex gap-2">
          <button
            @click="handlePageChange(leadsStore.pagination.page - 1)"
            :disabled="leadsStore.pagination.page === 1"
            class="btn btn-secondary btn-sm"
            :class="{ 'opacity-50 cursor-not-allowed': leadsStore.pagination.page === 1 }"
          >
            {{ t('leads.pagination.prev') }}
          </button>
          <button
            @click="handlePageChange(leadsStore.pagination.page + 1)"
            :disabled="leadsStore.pagination.page === leadsStore.pagination.pages"
            class="btn btn-secondary btn-sm"
            :class="{ 'opacity-50 cursor-not-allowed': leadsStore.pagination.page === leadsStore.pagination.pages }"
          >
            {{ t('leads.pagination.next') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('leads.edit.title') }}</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div v-if="editError" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {{ editError }}
          </div>

          <div>
            <label class="label">{{ t('leads.table.name') }}</label>
            <input v-model="editForm.name" type="text" class="input" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">{{ t('leads.table.email') }}</label>
              <input v-model="editForm.email" type="email" class="input" />
            </div>
            <div>
              <label class="label">{{ t('leads.table.phone') }}</label>
              <input v-model="editForm.phone" type="text" class="input" />
            </div>
          </div>

          <div>
            <label class="label">{{ t('leads.table.source') }}</label>
            <input v-model="editForm.source" type="text" class="input" />
          </div>

          <div>
            <label class="label">{{ t('leads.table.stage') }}</label>
            <select v-model="editForm.opportunity_stage" class="input">
              <option
                v-for="stage in configStore.config?.opportunity_stages || []"
                :key="stage"
                :value="stage"
              >
                {{ stage }}
              </option>
            </select>
          </div>

          <div v-if="authStore.isManager">
            <label class="label">{{ t('leads.table.seller') }}</label>
            <select v-model="editForm.seller_user_id" class="input">
              <option value="">{{ t('leads.edit.noChanges') }}</option>
              <option
                v-for="seller in sellersStore.sellers"
                :key="seller._id"
                :value="seller._id"
              >
                {{ seller.seller_name }} ({{ seller.team }})
              </option>
            </select>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button @click="closeEditModal" class="btn btn-secondary">{{ t('common.cancel') }}</button>
          <button @click="handleEdit" :disabled="editLoading" class="btn btn-primary">
            {{ editLoading ? t('leads.edit.loading') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6 text-center">
          <svg class="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('leads.delete.title') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ t('leads.delete.confirm', { name: deletingLead?.name }) }}
          </p>
          <div class="flex justify-center gap-3">
            <button @click="closeDeleteConfirm" class="btn btn-secondary">{{ t('common.cancel') }}</button>
            <button @click="handleDelete" :disabled="deleteLoading" class="btn bg-red-600 hover:bg-red-700 text-white">
              {{ deleteLoading ? t('leads.delete.deleting') : t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
