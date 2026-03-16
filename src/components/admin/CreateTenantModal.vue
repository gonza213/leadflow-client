<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'submit'])

const form = ref({
  name: '',
  slug: '',
  managerName: '',
  managerEmail: '',
  managerPassword: ''
})

const submitting = ref(false)

const slugFromName = computed(() => {
  return form.value.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
})

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  form.value.managerPassword = Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

const handleSubmit = async () => {
  submitting.value = true
  emit('submit', {
    ...form.value,
    slug: form.value.slug || slugFromName.value
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Crear Nuevo Tenant</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Nombre de empresa</label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              placeholder="Mi Empresa"
              required
            />
          </div>
          <div>
            <label class="label">Slug (URL)</label>
            <input
              v-model="form.slug"
              type="text"
              class="input"
              :placeholder="slugFromName || 'mi-empresa'"
            />
          </div>
        </div>

        <hr class="my-4 border-gray-200 dark:border-gray-700" />
        <h3 class="font-medium text-gray-700 dark:text-gray-300">Usuario Manager</h3>

        <div>
          <label class="label">Nombre del manager</label>
          <input
            v-model="form.managerName"
            type="text"
            class="input"
            placeholder="Juan Perez"
          />
        </div>

        <div>
          <label class="label">Email</label>
          <input
            v-model="form.managerEmail"
            type="email"
            class="input"
            placeholder="manager@empresa.com"
            required
          />
        </div>

        <div>
          <label class="label">Contrasena</label>
          <div class="flex gap-2">
            <input
              v-model="form.managerPassword"
              type="text"
              class="input flex-1"
              required
            />
            <button
              type="button"
              @click="generatePassword"
              class="btn btn-secondary"
            >
              Generar
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="emit('close')"
            class="btn btn-secondary"
            :disabled="submitting"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            {{ submitting ? 'Creando...' : 'Crear Tenant' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
