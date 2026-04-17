<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  stages: {
    type: Array,
    default: () => []
  },
  onSave: {
    type: Function,
    default: null
  }
})

const localStages = ref([...props.stages])
const newStage = ref('')
const error = ref('')
const success = ref('')

watch(() => props.stages, (val) => {
  localStages.value = [...val]
}, { deep: true, immediate: true })

const addStage = () => {
  if (!newStage.value.trim()) {
    error.value = t('config.stages.errors.required')
    return
  }

  if (localStages.value.includes(newStage.value.trim())) {
    error.value = t('config.stages.errors.exists')
    return
  }

  localStages.value.push(newStage.value.trim())
  newStage.value = ''
  error.value = ''
}

const removeStage = (index) => {
  if (localStages.value.length > 1) {
    localStages.value.splice(index, 1)
  }
}

const moveUp = (index) => {
  if (index > 0) {
    const arr = [...localStages.value]
    ;[arr[index], arr[index - 1]] = [arr[index - 1], arr[index]]
    localStages.value = arr
  }
}

const moveDown = (index) => {
  if (index < localStages.value.length - 1) {
    const arr = [...localStages.value]
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    localStages.value = arr
  }
}

const handleSave = async () => {
  if (localStages.value.length === 0) {
    error.value = t('config.stages.errors.minOne')
    return
  }

  error.value = ''
  success.value = ''

  try {
    const result = await props.onSave(localStages.value)
    if (result?.success === false) {
      error.value = result.error || t('config.stages.errors.update')
    } else {
      success.value = t('config.stages.success')
      setTimeout(() => success.value = '', 3000)
    }
  } catch (err) {
    error.value = t('config.stages.errors.update')
  }
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('config.stages.title') }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      {{ t('config.stages.info') }}
    </p>

    <!-- Lista de etapas -->
    <div class="space-y-2 mb-6">
      <div
        v-for="(stage, index) in localStages"
        :key="index"
        class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
      >
        <div class="flex flex-col gap-1">
          <button
            @click="moveUp(index)"
            :disabled="index === 0"
            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            @click="moveDown(index)"
            :disabled="index === localStages.length - 1"
            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <span class="w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
          {{ index + 1 }}
        </span>

        <span class="flex-1 font-medium text-gray-900 dark:text-white">{{ stage }}</span>

        <button
          @click="removeStage(index)"
          :disabled="localStages.length <= 1"
          class="p-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Agregar etapa -->
    <div class="flex items-center gap-3 mb-6">
      <input
        v-model="newStage"
        type="text"
        class="input flex-1"
        :placeholder="t('config.stages.newStagePlaceholder')"
        @keyup.enter="addStage"
      />
      <button @click="addStage" class="btn btn-secondary">
        {{ t('config.stages.addButton') }}
      </button>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4">
      {{ error }}
    </div>
    <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm mb-4">
      {{ success }}
    </div>

    <button @click="handleSave" class="btn btn-primary">
      {{ t('common.saveChanges') }}
    </button>
  </div>
</template>
