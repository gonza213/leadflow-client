<script setup>
import { onMounted, ref } from 'vue'
import { useSellersStore } from '../stores/sellers'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import SellerCard from '../components/sellers/SellerCard.vue'

const sellersStore = useSellersStore()
const configStore = useConfigStore()
const authStore = useAuthStore()

const selectedTeam = ref('')
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
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SellerCard
        v-for="seller in sellersStore.sellers"
        :key="seller._id"
        :seller="seller"
        :can-edit="authStore.canEdit"
        :can-delete="authStore.canDelete"
        @toggle-active="handleToggleActive"
        @edit="handleOpenEdit"
        @delete="handleDeleteSeller"
      />
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
            <label class="label">GHL User ID <span class="text-red-500">*</span></label>
            <input v-model="newSeller.ghl_user_id" type="text" class="input" placeholder="ID del usuario en GoHighLevel" required />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Requerido para asignar el lead al vendedor en GHL</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showAddModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button
            @click="handleAddSeller"
            class="btn btn-primary"
            :disabled="!newSeller.seller_name || !newSeller.team || !newSeller.ghl_user_id"
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
            <label class="label">GHL User ID <span class="text-red-500">*</span></label>
            <input v-model="editForm.ghl_user_id" type="text" class="input" placeholder="ID del usuario en GoHighLevel" required />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Requerido para asignar el lead al vendedor en GHL</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showEditModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button
            @click="handleEditSeller"
            class="btn btn-primary"
            :disabled="!editForm.seller_name || !editForm.team || !editForm.ghl_user_id"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
