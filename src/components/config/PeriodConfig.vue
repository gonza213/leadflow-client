<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const props = defineProps({
  fechaInicio: String,
  fechaFin: String,
  timezone: String,
  weekStartDay: {
    type: Number,
    default: null
  },
  onSave: {
    type: Function,
    default: null
  }
})

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Argentina/Buenos_Aires', 'America/Sao_Paulo', 'America/Bogota', 
  'America/Mexico_City', 'America/Santiago', 'America/Lima', 'America/Guayaquil',
  'America/Montevideo', 'America/Asuncion', 'America/La_Paz', 'America/Costa_Rica', 
  'America/Guatemala', 'America/Panama', 'Asia/Jakarta', 'Asia/Kuala_Lumpur', 
  'Africa/Nairobi', 'Africa/Lagos', 'Europe/Madrid'
]

const DAYS = computed(() => [
  { value: 1, label: t('config.period.days.1') },
  { value: 2, label: t('config.period.days.2') },
  { value: 3, label: t('config.period.days.3') },
  { value: 4, label: t('config.period.days.4') },
  { value: 5, label: t('config.period.days.5') },
  { value: 6, label: t('config.period.days.6') },
  { value: 0, label: t('config.period.days.0') }
])

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

// Modo: 'manual' o 'auto'
const mode = ref(props.weekStartDay !== null && props.weekStartDay !== undefined ? 'auto' : 'manual')

// Configs
const localTimezone = ref(props.timezone || 'America/Chicago')
const localFechaInicio = ref(formatDate(props.fechaInicio))
const localFechaFin = ref(formatDate(props.fechaFin))
const selectedDay = ref(props.weekStartDay ?? 1)

const error = ref('')
const success = ref('')

watch(() => props.timezone, (val) => { if (val) localTimezone.value = val }, { immediate: true })
watch(() => props.fechaInicio, (val) => { localFechaInicio.value = formatDate(val) }, { immediate: true })
watch(() => props.fechaFin, (val) => { localFechaFin.value = formatDate(val) }, { immediate: true })
watch(() => props.weekStartDay, (val) => {
  if (val !== null && val !== undefined) {
    mode.value = 'auto'
    selectedDay.value = val
  } else {
    mode.value = 'manual'
  }
}, { immediate: true })

// Preview de la semana actual según el día seleccionado
const weekPreview = computed(() => {
  const now = new Date()
  const todayDow = now.getDay()
  const daysDiff = (todayDow - selectedDay.value + 7) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - daysDiff)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const fmt = (d) => d.toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
})

const endDayLabel = computed(() => {
  const endDow = (selectedDay.value + 6) % 7
  return DAYS.value.find(d => d.value === endDow)?.label || ''
})

const handleSave = async () => {
  error.value = ''
  success.value = ''

  let data = { timezone: localTimezone.value }
  
  if (mode.value === 'manual') {
    if (!localFechaInicio.value || !localFechaFin.value) {
      error.value = t('config.period.errors.required')
      return
    }
    if (new Date(localFechaInicio.value) > new Date(localFechaFin.value)) {
      error.value = t('config.period.errors.dateOrder')
      return
    }
    data = { ...data, fecha_inicio: localFechaInicio.value, fecha_fin: localFechaFin.value, week_start_day: null }
  } else {
    data = { ...data, week_start_day: selectedDay.value }
  }

  try {
    const result = await props.onSave(data)
    if (result?.success === false) {
      error.value = result.error || t('config.period.errors.update')
    } else {
      success.value = t('config.period.success')
      setTimeout(() => success.value = '', 3000)
    }
  } catch {
    error.value = t('config.period.errors.update')
  }
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ t('config.period.title') }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      {{ t('config.period.info') }}
    </p>

    <!-- Zona Horaria -->
    <div class="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
      <label class="label mb-2 flex items-center gap-2">
        <i class="lucide-globe text-primary-500 w-4 h-4"></i>
        {{ t('config.period.timezone') }}
      </label>
      <select v-model="localTimezone" class="input">
        <option v-for="tz in TIMEZONES" :key="tz" :value="tz">
          {{ t(`config.period.timezones.${tz}`) }}
        </option>
      </select>
      <p class="text-xs text-gray-500 mt-2">
        {{ t('config.period.timezoneInfo') }}
      </p>
    </div>

    <!-- Toggle de modo -->
    <div class="flex gap-2 mb-6">
      <button
        @click="mode = 'manual'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors',
          mode === 'manual'
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        {{ t('config.period.manual') }}
      </button>
      <button
        @click="mode = 'auto'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors',
          mode === 'auto'
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        {{ t('config.period.auto') }}
      </button>
    </div>

    <!-- Modo Manual -->
    <div v-if="mode === 'manual'">
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {{ t('config.period.manualInfo') }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="label">{{ t('config.period.start') }}</label>
          <input v-model="localFechaInicio" type="date" class="input" />
        </div>
        <div>
          <label class="label">{{ t('config.period.end') }}</label>
          <input v-model="localFechaFin" type="date" class="input" />
        </div>
      </div>
      <div v-if="localFechaInicio && localFechaFin" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
        <p class="text-sm text-blue-700 dark:text-blue-400">
          <strong>{{ t('config.period.active') }}</strong>
          {{ new Date(localFechaInicio + 'T12:00:00').toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          –
          {{ new Date(localFechaFin + 'T12:00:00').toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
        </p>
      </div>
    </div>

    <!-- Modo Automático -->
    <div v-else>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {{ t('config.period.autoInfo') }}
      </p>

      <label class="label mb-3">{{ t('config.period.weekStart') }}</label>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="day in DAYS"
          :key="day.value"
          @click="selectedDay = day.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors',
            selectedDay === day.value
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500'
          ]"
        >
          {{ day.label }}
        </button>
      </div>

      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
        <p class="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">
          {{ t('config.period.currentWeek', { range: weekPreview }) }}
        </p>
        <p class="text-xs text-blue-600 dark:text-blue-500">
          {{ t('config.period.autoDescription', {
            day: DAYS.value.find(d => d.value === selectedDay)?.label,
            end: endDayLabel
          }) }}
        </p>
      </div>
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
