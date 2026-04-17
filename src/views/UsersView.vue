<script setup>
import { onMounted, ref } from 'vue'
import { useUsersStore } from '../stores/users'
import { useAuthStore } from '../stores/auth'
import { useSellersStore } from '../stores/sellers'
import { useI18n } from 'vue-i18n'

const usersStore = useUsersStore()
const authStore = useAuthStore()
const sellersStore = useSellersStore()
const { t, locale } = useI18n()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref(null)

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'viewer',
  sellerId: ''
})

const editForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'viewer',
  sellerId: ''
})

onMounted(async () => {
  await Promise.all([
    usersStore.fetchUsers(),
    sellersStore.fetchSellers()
  ])
})

const handleAddUser = async () => {
  const data = { ...newUser.value }
  if (data.role !== 'seller') {
    delete data.sellerId
  }
  const result = await usersStore.createUser(data)
  if (result.success) {
    showAddModal.value = false
    newUser.value = {
      name: '',
      email: '',
      password: '',
      role: 'viewer',
      sellerId: ''
    }
  }
}

const handleOpenEdit = (user) => {
  editingUser.value = user
  editForm.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    sellerId: user.sellerId?._id || ''
  }
  showEditModal.value = true
}

const handleEditUser = async () => {
  if (!editingUser.value) return

  const data = {
    name: editForm.value.name,
    email: editForm.value.email,
    role: editForm.value.role
  }

  if (editForm.value.role === 'seller') {
    data.sellerId = editForm.value.sellerId
  }

  if (editForm.value.password) {
    data.password = editForm.value.password
  }

  const result = await usersStore.updateUser(editingUser.value._id, data)
  if (result.success) {
    showEditModal.value = false
    editingUser.value = null
  }
}

const handleDeleteUser = async (userId) => {
  if (confirm(t('users.deleteConfirm'))) {
    await usersStore.deleteUser(userId)
  }
}

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'manager':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
    case 'seller':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
    case 'viewer':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'manager':
      return t('users.roles.manager')
    case 'seller':
      return t('users.roles.seller')
    case 'viewer':
      return t('users.roles.viewer')
    default:
      return role
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('users.title') }}</h1>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('users.count', { n: usersStore.users.length }) }}</span>
    </div>

    <!-- Boton agregar -->
    <button
      v-if="authStore.isManager"
      @click="showAddModal = true"
      class="btn btn-primary w-full sm:w-auto"
    >
      {{ t('users.add') }}
    </button>

    <!-- Loading -->
    <div v-if="usersStore.loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="usersStore.error" class="card bg-red-50 text-red-700 p-4">
      {{ usersStore.error }}
    </div>

    <template v-else>
      <!-- Vista Mobile: Cards -->
      <div class="lg:hidden space-y-3">
        <div
          v-for="user in usersStore.users"
          :key="user._id"
          class="card p-4"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
            </div>
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getRoleBadgeClass(user.role)"
            >
              {{ getRoleLabel(user.role) }}
            </span>
            <span v-if="user._id === usersStore.originalManagerId" class="ml-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              {{ t('users.principal') }}
            </span>
          </div>
          <p v-if="user.role === 'seller' && user.sellerId" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {{ t('users.linkedTo', { name: user.sellerId.seller_name }) }}
          </p>

          <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <span class="text-xs text-gray-400">{{ t('users.createdAt', { date: formatDate(user.createdAt) }) }}</span>
            <div v-if="authStore.isManager" class="flex gap-3">
              <button
                @click="handleOpenEdit(user)"
                class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
              >
                {{ t('common.edit') }}
              </button>
              <button
                v-if="user._id !== authStore.user?._id && user._id !== usersStore.originalManagerId"
                @click="handleDeleteUser(user._id)"
                class="text-sm text-red-600 dark:text-red-400 hover:text-red-800"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="usersStore.users.length === 0" class="card text-center py-8 text-gray-500 dark:text-gray-400">
          {{ t('users.noUsers') }}
        </div>
      </div>

      <!-- Vista Desktop: Tabla -->
      <div class="hidden lg:block card overflow-hidden p-0">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('users.form.name') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('users.form.email') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('users.form.role') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('common.date') }}</th>
              <th v-if="authStore.isManager" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in usersStore.users" :key="user._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getRoleBadgeClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
                <span v-if="user._id === usersStore.originalManagerId" class="ml-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {{ t('users.principal') }}
                </span>
                <span v-if="user.role === 'seller' && user.sellerId" class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({{ user.sellerId.seller_name }})
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.createdAt) }}
              </td>
              <td v-if="authStore.isManager" class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  @click="handleOpenEdit(user)"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-800 mr-3"
                >
                  {{ t('common.edit') }}
                </button>
                <button
                  v-if="user._id !== authStore.user?._id && user._id !== usersStore.originalManagerId"
                  @click="handleDeleteUser(user._id)"
                  class="text-red-600 dark:text-red-400 hover:text-red-800"
                >
                  {{ t('common.delete') }}
                </button>
              </td>
            </tr>
            <tr v-if="usersStore.users.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                {{ t('users.noUsers') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Modal agregar usuario -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-semibold mb-4">{{ t('users.add') }}</h2>

        <div class="space-y-4">
          <div>
            <label class="label text-sm">{{ t('users.form.name') }} <span class="text-red-500">*</span></label>
            <input v-model="newUser.name" type="text" class="input" :placeholder="t('users.form.namePlaceholder')" />
          </div>
          <div>
            <label class="label text-sm">{{ t('users.form.email') }} <span class="text-red-500">*</span></label>
            <input v-model="newUser.email" type="email" class="input" :placeholder="t('users.form.emailPlaceholder')" />
          </div>
          <div>
            <label class="label text-sm">{{ t('users.form.password') }} <span class="text-red-500">*</span></label>
            <input v-model="newUser.password" type="password" class="input" :placeholder="t('users.form.passPlaceholder')" />
          </div>
          <div>
            <label class="label text-sm">{{ t('users.form.role') }}</label>
            <select v-model="newUser.role" class="input">
              <option value="manager">{{ t('users.roles.labels.manager') }}</option>
              <option value="seller">{{ t('users.roles.labels.seller') }}</option>
              <option value="viewer">{{ t('users.roles.labels.viewer') }}</option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span v-if="newUser.role === 'seller'">{{ t('users.roles.descriptions.seller') }}</span>
              <span v-else-if="newUser.role === 'viewer'">{{ t('users.roles.descriptions.viewer') }}</span>
              <span v-else>{{ t('users.roles.descriptions.manager') }}</span>
            </p>
          </div>
          <div v-if="newUser.role === 'seller'">
            <label class="label text-sm">{{ t('users.form.linkedSeller') }} <span class="text-red-500">*</span></label>
            <select v-model="newUser.sellerId" class="input">
              <option value="">{{ t('sellers.addModal.selectTeam') }}</option>
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

        <div class="flex gap-3 mt-6">
          <button @click="showAddModal = false" class="btn btn-secondary flex-1">
            {{ t('common.cancel') }}
          </button>
          <button
            @click="handleAddUser"
            class="btn btn-primary flex-1"
            :disabled="!newUser.name || !newUser.email || !newUser.password || (newUser.role === 'seller' && !newUser.sellerId)"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal editar usuario -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-semibold mb-4">{{ t('users.edit') }}</h2>

        <div class="space-y-4">
          <div>
            <label class="label text-sm">{{ t('users.form.name') }} <span class="text-red-500">*</span></label>
            <input v-model="editForm.name" type="text" class="input" :placeholder="t('users.form.namePlaceholder')" />
          </div>
          <div>
            <label class="label text-sm">{{ t('users.form.email') }} <span class="text-red-500">*</span></label>
            <input v-model="editForm.email" type="email" class="input" :placeholder="t('users.form.emailPlaceholder')" />
          </div>
          <div>
            <label class="label text-sm">{{ t('users.form.newPassword') }}</label>
            <input v-model="editForm.password" type="password" class="input" :placeholder="t('users.form.passPlaceholderEdit')" />
          </div>
          <div>
            <label class="label text-sm">{{ t('users.form.role') }}</label>
            <select v-model="editForm.role" class="input">
              <option value="manager">{{ t('users.roles.labels.manager') }}</option>
              <option value="seller">{{ t('users.roles.labels.seller') }}</option>
              <option value="viewer">{{ t('users.roles.labels.viewer') }}</option>
            </select>
          </div>
          <div v-if="editForm.role === 'seller'">
            <label class="label text-sm">{{ t('users.form.linkedSeller') }} <span class="text-red-500">*</span></label>
            <select v-model="editForm.sellerId" class="input">
              <option value="">{{ t('sellers.addModal.selectTeam') }}</option>
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

        <div class="flex gap-3 mt-6">
          <button @click="showEditModal = false" class="btn btn-secondary flex-1">
            {{ t('common.cancel') }}
          </button>
          <button
            @click="handleEditUser"
            class="btn btn-primary flex-1"
            :disabled="!editForm.name || !editForm.email || (editForm.role === 'seller' && !editForm.sellerId)"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
