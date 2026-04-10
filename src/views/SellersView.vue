<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useSellersStore } from '../stores/sellers'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import SellerCard from '../components/sellers/SellerCard.vue'

const sellersStore = useSellersStore()
const configStore = useConfigStore()
const authStore = useAuthStore()

const selectedTeam = ref('')
const currentPage = ref(1)
const sellersPerPage = 9

// Pagination computed
const totalPages = computed(() => Math.ceil(sellersStore.sellers.length / sellersPerPage))
const paginatedSellers = computed(() => {
  const start = (currentPage.value - 1) * sellersPerPage
  const end = start + sellersPerPage
  return sellersStore.sellers.slice(start, end)
})

// Reset page when filters change
watch(() => sellersStore.sellers.length, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingSeller = ref(null)
const newSeller = ref({
  seller_name: '',
  team: '',
  weekly_limit: 50,
  daily_limit: 10,
  ghl_user_id: ''
})
const editForm = ref({
  seller_name: '',
  team: '',
  weekly_limit: 50,
  daily_limit: 10,
  ghl_user_id: ''
})

onMounted(async () => {
  await configStore.fetchConfig()
  await sellersStore.fetchSellers()
})

const handleFilterByTeam = () => {
  currentPage.value = 1
  sellersStore.fetchSellers(selectedTeam.value || null)
}

const handleToggleActive = async (sellerId) => {
  await sellersStore.toggleActive(sellerId)
}

const handleAddSeller = async () => {
  const result = await sellersStore.createSeller(newSeller.value)
  if (result.success) {
    showAddModal.value = false
    newSeller.value = {
      seller_name: '',
      team: '',
      weekly_limit: 50,
      daily_limit: 10,
      ghl_user_id: ''
    }
  }
}

const handleDeleteSeller = async (sellerId) => {
  if (confirm('¿Estás seguro de eliminar este vendedor?')) {
    await sellersStore.deleteSeller(sellerId)
  }
}

const handleOpenEdit = (seller) => {
  editingSeller.value = seller
  editForm.value = {
    seller_name: seller.seller_name,
    team: seller.team,
    weekly_limit: seller.weekly_limit,
    daily_limit: seller.daily_limit,
    ghl_user_id: seller.ghl_user_id || ''
  }
  showEditModal.value = true
}

const handleEditSeller = async () => {
  if (!editingSeller.value) return
  const result = await sellersStore.updateSeller(editingSeller.value._id, editForm.value)
  if (result.success) {
    showEditModal.value = false
    editingSeller.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Vendedores</h1>
      <button
        v-if="authStore.canCreate"
        @click="showAddModal = true"
        class="btn btn-primary w-full sm:w-auto"
      >
        + Agregar Vendedor
      </button>
    </div>

    <!-- Filtro por equipo -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="flex-1 max-w-xs">
          <label class="label">Filtrar por equipo</label>
          <select v-model="selectedTeam" @change="handleFilterByTeam" class="input">
            <option value="">Todos los equipos</option>
            <option
              v-for="equipo in configStore.config?.equipos || []"
              :key="equipo.nombre"
              :value="equipo.nombre"
            >
              {{ equipo.nombre }} ({{ equipo.porcentaje }}%)
            </option>
          </select>
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400 mt-6">
          {{ sellersStore.sellers.length }} vendedores
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="sellersStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Grid de vendedores -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SellerCard
          v-for="seller in paginatedSellers"
          :key="seller._id"
          :seller="seller"
          :can-edit="authStore.canEdit"
          :can-delete="authStore.canDelete"
          @toggle-active="handleToggleActive"
          @edit="handleOpenEdit"
          @delete="handleDeleteSeller"
        />
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &laquo;
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &lsaquo;
        </button>

        <template v-for="page in totalPages" :key="page">
          <button
            v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
            @click="currentPage = page"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ page }}
          </button>
          <span
            v-else-if="page === currentPage - 2 || page === currentPage + 2"
            class="px-2 text-gray-500"
          >
            ...
          </span>
        </template>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &rsaquo;
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &raquo;
        </button>
      </div>

      <!-- Info de paginación -->
      <p v-if="totalPages > 1" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        Mostrando {{ (currentPage - 1) * sellersPerPage + 1 }}-{{ Math.min(currentPage * sellersPerPage, sellersStore.sellers.length) }} de {{ sellersStore.sellers.length }} vendedores
      </p>
    </div>

    <!-- Modal agregar vendedor -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Agregar Vendedor</h2>

        <div class="space-y-4">
          <div>
            <label class="label">Nombre</label>
            <input v-model="newSeller.seller_name" type="text" class="input" placeholder="Nombre del vendedor" />
          </div>
          <div>
            <label class="label">Equipo</label>
            <select v-model="newSeller.team" class="input">
              <option value="">Seleccionar equipo</option>
              <option
                v-for="equipo in configStore.config?.equipos || []"
                :key="equipo.nombre"
                :value="equipo.nombre"
              >
                {{ equipo.nombre }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Límite semanal</label>
              <input v-model.number="newSeller.weekly_limit" type="number" class="input" min="0" />
            </div>
            <div>
              <label class="label">Límite diario</label>
              <input v-model.number="newSeller.daily_limit" type="number" class="input" min="0" />
            </div>
          </div>
          <div>
            <label class="label">CRM User ID</label>
            <input v-model="newSeller.ghl_user_id" type="text" class="input" placeholder="ID del usuario en el CRM (GHL, HubSpot, etc.)" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Se usa para notificar al CRM la asignación del lead. Opcional si no usás integración.</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showAddModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button
            @click="handleAddSeller"
            class="btn btn-primary"
            :disabled="!newSeller.seller_name || !newSeller.team"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal editar vendedor -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Editar Vendedor</h2>

        <div class="space-y-4">
          <div>
            <label class="label">Nombre</label>
            <input v-model="editForm.seller_name" type="text" class="input" placeholder="Nombre del vendedor" />
          </div>
          <div>
            <label class="label">Equipo</label>
            <select v-model="editForm.team" class="input">
              <option value="">Seleccionar equipo</option>
              <option
                v-for="equipo in configStore.config?.equipos || []"
                :key="equipo.nombre"
                :value="equipo.nombre"
              >
                {{ equipo.nombre }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Limite semanal</label>
              <input v-model.number="editForm.weekly_limit" type="number" class="input" min="0" />
            </div>
            <div>
              <label class="label">Limite diario</label>
              <input v-model.number="editForm.daily_limit" type="number" class="input" min="0" />
            </div>
          </div>
          <div>
            <label class="label">CRM User ID</label>
            <input v-model="editForm.ghl_user_id" type="text" class="input" placeholder="ID del usuario en el CRM (GHL, HubSpot, etc.)" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Se usa para notificar al CRM la asignación del lead. Opcional si no usás integración.</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showEditModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button
            @click="handleEditSeller"
            class="btn btn-primary"
            :disabled="!editForm.seller_name || !editForm.team"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
