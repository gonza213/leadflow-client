import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '../services/api'
import { useAuthStore } from './auth'

export const useUsersStore = defineStore('users', () => {
  const authStore = useAuthStore()

  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchUsers() {
    if (!authStore.tenantSlug) return

    loading.value = true
    error.value = null

    try {
      const response = await usersApi.getAll(authStore.tenantSlug)
      users.value = response.data.users
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar usuarios'
    } finally {
      loading.value = false
    }
  }

  async function createUser(data) {
    try {
      const response = await usersApi.create(authStore.tenantSlug, data)
      users.value.push(response.data.user)
      return { success: true, user: response.data.user }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear usuario'
      return { success: false, error: error.value }
    }
  }

  async function updateUser(userId, data) {
    try {
      const response = await usersApi.update(authStore.tenantSlug, userId, data)
      const index = users.value.findIndex(u => u._id === userId)
      if (index !== -1) {
        users.value[index] = response.data.user
      }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar usuario'
      return { success: false, error: error.value }
    }
  }

  async function deleteUser(userId) {
    try {
      await usersApi.delete(authStore.tenantSlug, userId)
      users.value = users.value.filter(u => u._id !== userId)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar usuario'
      return { success: false, error: error.value }
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
})
