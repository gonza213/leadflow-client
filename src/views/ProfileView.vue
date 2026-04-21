<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { authApi, uploadApi } from '../services/api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const uploading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  name: '',
  password: '',
  confirmPassword: ''
})

const avatarPreview = ref(null)
const avatarFile = ref(null)

onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name
    avatarPreview.value = authStore.user.avatar
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateProfile = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    if (form.value.password && form.value.password !== form.value.confirmPassword) {
      throw new Error(t('profile.errors.passwordsDoNotMatch') || 'Las contraseñas no coinciden')
    }

    let avatarUrl = authStore.user.avatar

    // 1. Upload avatar if changed
    if (avatarFile.value) {
      uploading.value = true
      const formData = new FormData()
      formData.append('image', avatarFile.value)
      formData.append('folder', 'profiles')
      
      const uploadRes = await uploadApi.single(formData)
      avatarUrl = uploadRes.data.url
      uploading.value = false
    }

    // 2. Update profile data
    const updateData = {
      name: form.value.name,
      avatar: avatarUrl
    }
    
    if (form.value.password) {
      updateData.password = form.value.password
    }

    const res = await authApi.updateProfile(updateData)
    
    // 3. Update local store
    authStore.user.name = res.data.user.name
    authStore.user.avatar = res.data.user.avatar
    
    successMessage.value = t('profile.success') || 'Perfil actualizado con éxito'
    form.value.password = ''
    form.value.confirmPassword = ''
    avatarFile.value = null
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message
  } finally {
    loading.value = false
    uploading.value = false
    
    setTimeout(() => {
      successMessage.value = ''
      errorMessage.value = ''
    }, 5000)
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('profile.title') || 'Mi Perfil' }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('profile.subtitle') || 'Gestiona tu información personal y seguridad' }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left column: Avatar -->
      <div class="card p-6 flex flex-col items-center">
        <div class="relative group">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" />
            <svg v-else class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            
            <div v-if="uploading" class="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
          
          <label class="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg group-hover:scale-110">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input type="file" class="hidden" accept="image/*" @change="handleFileChange" />
          </label>
        </div>
        
        <div class="mt-4 text-center">
          <p class="font-semibold text-gray-900 dark:text-white">{{ authStore.user?.name }}</p>
          <p class="text-xs text-gray-500 uppercase tracking-wider">{{ authStore.user?.role }}</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <!-- Right column: Settings -->
      <div class="md:col-span-2 space-y-6">
        <form @submit.prevent="updateProfile" class="card p-6 space-y-6">
          <div v-if="successMessage" class="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ errorMessage }}
          </div>

          <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="label">{{ t('profile.labels.name') || 'Nombre Completo' }}</label>
              <input v-model="form.name" type="text" class="input" required />
            </div>

            <div class="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">{{ t('profile.securityTitle') || 'Cambiar Contraseña' }}</h3>
              <p class="text-xs text-gray-500 mb-4">{{ t('profile.securityDesc') || 'Deja estos campos en blanco si no deseas cambiar tu contraseña' }}</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="label">{{ t('profile.labels.newPassword') || 'Nueva Contraseña' }}</label>
                  <input v-model="form.password" type="password" class="input" autocomplete="new-password" />
                </div>
                <div>
                  <label class="label">{{ t('profile.labels.confirmPassword') || 'Confirmar Contraseña' }}</label>
                  <input v-model="form.confirmPassword" type="password" class="input" autocomplete="new-password" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ t('common.save') || 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
