<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useConfigStore } from '../../stores/config'
import { appointmentsApi } from '../../services/api'
import { safeTimeZone, zonedParts, zonedToDate, addDays, formatZoned } from '../../utils/zonedTime'

// Tarjeta del Dashboard: las citas programadas de hoy (las propias o las del equipo)
const { t, locale } = useI18n()
const authStore = useAuthStore()
const configStore = useConfigStore()

const tz = computed(() => safeTimeZone(configStore.config?.timezone))
const intlLocale = computed(() => ({ es: 'es-AR', en: 'en-US', 'pt-BR': 'pt-BR' }[locale.value] || locale.value))
const team = computed(() => authStore.isViewer)
const items = ref([])
const loaded = ref(false)

const load = async () => {
  if (!authStore.tenantSlug) return
  const p = zonedParts(new Date(), tz.value)
  const today = { year: p.year, month: p.month, day: p.day }
  try {
    const { data } = await appointmentsApi.list(authStore.tenantSlug, {
      from: zonedToDate({ ...today, hour: 0 }, tz.value).toISOString(),
      to: zonedToDate({ ...addDays(today, 1), hour: 0 }, tz.value).toISOString()
    })
    items.value = data.appointments.filter(a => a.status === 'scheduled')
  } catch {
    items.value = []
  } finally {
    loaded.value = true
  }
}

const time = (d) => formatZoned(d, tz.value, intlLocale.value, { hour: '2-digit', minute: '2-digit', hour12: false })
const isPast = (a) => new Date(a.endsAt) < new Date()

watch(() => configStore.config?.timezone, load)
onMounted(load)
</script>

<template>
  <div v-if="loaded" class="card">
    <div class="flex items-center justify-between gap-3 mb-3">
      <h2 class="text-base font-bold text-gray-900 dark:text-white">
        {{ team ? t('calendar.dashboard.team') : t('calendar.dashboard.mine') }}
        <span v-if="items.length" class="ml-1 rounded-full bg-primary-300 px-2 py-0.5 text-xs font-bold text-gray-950">{{ items.length }}</span>
      </h2>
      <router-link to="/calendar" class="text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">{{ t('calendar.dashboard.open') }} →</router-link>
    </div>
    <p v-if="items.length === 0" class="text-sm text-gray-500 dark:text-gray-400">{{ t('calendar.dashboard.none') }}</p>
    <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800">
      <li v-for="a in items.slice(0, 5)" :key="a._id" class="flex items-center gap-3 py-2" :class="isPast(a) ? 'opacity-50' : ''">
        <span class="w-12 flex-shrink-0 text-sm font-bold text-gray-900 dark:text-white">{{ time(a.startsAt) }}</span>
        <span class="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300">
          {{ a.title }}<template v-if="team && a.seller"> · <span class="text-gray-500 dark:text-gray-400">{{ a.seller.seller_name }}</span></template>
        </span>
        <a v-if="a.lead?.phone" :href="`https://wa.me/${a.lead.phone.replace(/\D/g, '')}`" target="_blank" rel="noopener noreferrer"
          class="flex-shrink-0 text-xs font-semibold text-green-700 hover:underline dark:text-green-400">WhatsApp</a>
      </li>
    </ul>
    <p v-if="items.length > 5" class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ t('calendar.dashboard.more', { n: items.length - 5 }) }}</p>
  </div>
</template>
