<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'
import { useSellersStore } from '../stores/sellers'
import { useAppointmentsStore } from '../stores/appointments'
import AppointmentModal from '../components/calendar/AppointmentModal.vue'
import {
  safeTimeZone, zonedParts, zonedToDate, dayKey, addDays, startOfWeek, civilKey, minutesOfDay, formatZoned
} from '../utils/zonedTime'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const configStore = useConfigStore()
const sellersStore = useSellersStore()
const store = useAppointmentsStore()

const tz = computed(() => safeTimeZone(configStore.config?.timezone))
const canWork = computed(() => ['superadmin', 'adminclient', 'manager', 'seller'].includes(authStore.userRole))
// Managers y viewers ven al equipo (el seller, solo lo suyo)
const canSeeTeam = computed(() => authStore.isViewer)
const intlLocale = computed(() => ({ es: 'es-AR', en: 'en-US', 'pt-BR': 'pt-BR' }[locale.value] || locale.value))

// Grilla horaria visible
const START_HOUR = 7
const END_HOUR = 22
const HOUR_PX = 56
const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

// ---- Estado de la vista ----
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768
const view = ref(isMobile() ? 'list' : 'week') // week | day | list
const sellerFilter = ref('')
const now = ref(new Date())
const todayCivil = computed(() => {
  const p = zonedParts(now.value, tz.value)
  return { year: p.year, month: p.month, day: p.day }
})
const anchor = ref(null) // día civil de referencia
const anchorDay = computed(() => anchor.value || todayCivil.value)

const days = computed(() => {
  if (view.value === 'day') return [anchorDay.value]
  const monday = startOfWeek(anchorDay.value)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
})
const LIST_DAYS = 30
const range = computed(() => {
  const first = view.value === 'list' ? anchorDay.value : days.value[0]
  const count = view.value === 'list' ? LIST_DAYS : days.value.length
  return {
    from: zonedToDate({ ...first, hour: 0 }, tz.value),
    to: zonedToDate({ ...addDays(first, count), hour: 0 }, tz.value)
  }
})

const load = () => store.fetchRange(range.value.from, range.value.to, { seller_id: sellerFilter.value })
watch(() => [range.value.from.getTime(), range.value.to.getTime(), sellerFilter.value], load)

const go = (dir) => {
  const step = view.value === 'week' ? 7 : view.value === 'day' ? 1 : LIST_DAYS
  anchor.value = addDays(anchorDay.value, dir * step)
}
const goToday = () => { anchor.value = null }

const fmt = (date, options) => formatZoned(date, tz.value, intlLocale.value, options)
const civilDate = (c) => zonedToDate({ ...c, hour: 12 }, tz.value)
const rangeLabel = computed(() => {
  if (view.value === 'day') return fmt(civilDate(anchorDay.value), { weekday: 'long', day: 'numeric', month: 'long' })
  const first = view.value === 'list' ? anchorDay.value : days.value[0]
  const last = view.value === 'list' ? addDays(first, LIST_DAYS - 1) : days.value[6]
  return `${fmt(civilDate(first), { day: 'numeric', month: 'short' })} – ${fmt(civilDate(last), { day: 'numeric', month: 'short', year: 'numeric' })}`
})
const isToday = (c) => civilKey(c) === civilKey(todayCivil.value)
const time = (date) => fmt(date, { hour: '2-digit', minute: '2-digit', hour12: false })

// ---- Citas por día, con columnas para las superpuestas ----
const byDay = computed(() => {
  const map = {}
  for (const a of store.items) {
    const key = dayKey(a.startsAt, tz.value)
    if (!map[key]) map[key] = []
    map[key].push(a)
  }
  return map
})

const layoutDay = (list) => {
  const items = (list || []).map(a => {
    const start = minutesOfDay(a.startsAt, tz.value)
    const sameDay = dayKey(a.endsAt, tz.value) === dayKey(a.startsAt, tz.value)
    const end = sameDay ? Math.max(minutesOfDay(a.endsAt, tz.value), start + 15) : 24 * 60
    return { a, start, end }
  }).sort((x, y) => x.start - y.start || y.end - x.end)

  // Grupos de citas que se pisan entre sí; dentro de cada grupo, columnas
  const out = []
  let group = []
  let groupEnd = -1
  const flush = () => {
    const cols = []
    for (const it of group) {
      let c = cols.findIndex(endAt => endAt <= it.start)
      if (c === -1) { c = cols.length; cols.push(0) }
      cols[c] = it.end
      it.col = c
    }
    for (const it of group) out.push({ ...it, cols: cols.length })
    group = []
  }
  for (const it of items) {
    if (group.length && it.start >= groupEnd) flush()
    group.push(it)
    groupEnd = Math.max(groupEnd, it.end)
  }
  if (group.length) flush()

  const min = START_HOUR * 60
  const max = END_HOUR * 60
  return out.map(({ a, start, end, col, cols }) => {
    const top = Math.max(start, min)
    const bottom = Math.min(Math.max(end, top + 15), max)
    return {
      a,
      outside: end <= min || start >= max,
      style: {
        top: `${((top - min) / 60) * HOUR_PX}px`,
        height: `${Math.max(((bottom - top) / 60) * HOUR_PX - 2, 22)}px`,
        left: `calc(${(col / cols) * 100}% + 2px)`,
        width: `calc(${100 / cols}% - 4px)`
      }
    }
  })
}

const blocksFor = (c) => layoutDay(byDay.value[civilKey(c)]).filter(b => !b.outside)
const outsideFor = (c) => layoutDay(byDay.value[civilKey(c)]).filter(b => b.outside)

const nowTop = computed(() => {
  const m = minutesOfDay(now.value, tz.value)
  if (m < START_HOUR * 60 || m >= END_HOUR * 60) return null
  return `${((m - START_HOUR * 60) / 60) * HOUR_PX}px`
})

// ---- Lista ----
const listGroups = computed(() => {
  const groups = []
  for (let i = 0; i < LIST_DAYS; i++) {
    const c = addDays(anchorDay.value, i)
    const items = byDay.value[civilKey(c)] || []
    if (items.length) groups.push({ c, items })
  }
  return groups
})

const statusClass = (a) => ({
  scheduled: 'bg-primary-100 border-primary-500 text-primary-950 dark:bg-primary-400/15 dark:border-primary-300 dark:text-primary-50',
  done: 'bg-gray-100 border-gray-400 text-gray-500 line-through dark:bg-gray-800 dark:border-gray-500 dark:text-gray-400',
  canceled: 'bg-gray-50 border-gray-300 text-gray-400 line-through opacity-70 dark:bg-gray-800/50 dark:border-gray-600',
  no_show: 'bg-amber-50 border-amber-400 text-amber-800 opacity-80 dark:bg-amber-400/10 dark:border-amber-400 dark:text-amber-200'
}[a.status] || '')

const who = (a) => {
  const parts = []
  if (a.lead?.name && a.lead.name !== a.title) parts.push(a.lead.name)
  if (canSeeTeam.value && !sellerFilter.value && a.seller?.seller_name) parts.push(a.seller.seller_name)
  return parts.join(' · ')
}

// ---- Modal y avisos ----
const modal = ref(null) // { appointment } | { defaults }
const toast = ref('')
let toastTimer
const showToast = (msg) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 5000)
}

const openNew = (startsAt) => {
  if (!canWork.value) return
  modal.value = { appointment: null, defaults: startsAt ? { startsAt } : {} }
}
const openEdit = (a) => { modal.value = { appointment: a, defaults: {} } }

// Clic en un hueco de la grilla: abre "Nueva cita" en esa media hora
const onSlotClick = (event, c) => {
  if (!canWork.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const minutes = START_HOUR * 60 + Math.floor(((event.clientY - rect.top) / HOUR_PX) * 2) * 30
  openNew(zonedToDate({ ...c, hour: Math.floor(minutes / 60), minute: minutes % 60 }, tz.value))
}

const onSaved = ({ appointment, overlaps, created }) => {
  modal.value = null
  if (overlaps?.length) {
    const o = overlaps[0]
    showToast(t('calendar.overlap', { title: o.title, time: time(o.startsAt) }))
  } else {
    showToast(created ? t('calendar.created') : t('calendar.updated'))
  }
  // Si la cita quedó fuera del rango o del filtro visible, recargar
  if (sellerFilter.value && String(appointment.sellerId) !== sellerFilter.value) load()
}
const onDeleted = () => {
  modal.value = null
  showToast(t('calendar.deleted'))
}

let clock
onMounted(async () => {
  if (!configStore.config) await configStore.fetchConfig()
  if (canSeeTeam.value) sellersStore.fetchSellers()
  load()
  clock = setInterval(() => { now.value = new Date() }, 60000)
})
onUnmounted(() => { clearInterval(clock); clearTimeout(toastTimer) })
</script>

<template>
  <div class="space-y-5">
    <!-- Encabezado -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ t('calendar.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('calendar.subtitle') }}</p>
      </div>
      <button v-if="canWork" type="button" class="btn btn-primary" @click="openNew()">+ {{ t('calendar.new') }}</button>
    </div>

    <!-- Controles -->
    <div class="flex flex-wrap items-center gap-2">
      <button type="button" class="btn btn-secondary btn-sm" @click="goToday">{{ t('calendar.today') }}</button>
      <div class="flex">
        <button type="button" class="btn btn-secondary btn-sm rounded-r-none" :aria-label="t('calendar.prev')" @click="go(-1)">‹</button>
        <button type="button" class="btn btn-secondary btn-sm rounded-l-none border-l-0" :aria-label="t('calendar.next')" @click="go(1)">›</button>
      </div>
      <h2 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white capitalize mr-auto">{{ rangeLabel }}</h2>

      <select v-if="canSeeTeam" v-model="sellerFilter" class="input !w-auto text-sm py-1.5" :aria-label="t('calendar.fields.seller')">
        <option value="">{{ t('calendar.allSellers') }}</option>
        <option v-for="s in sellersStore.sellers" :key="s._id" :value="String(s._id)">{{ s.seller_name }}</option>
      </select>

      <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5" role="tablist">
        <button
          v-for="v in ['week', 'day', 'list']" :key="v" type="button" role="tab" :aria-selected="view === v"
          @click="view = v"
          class="px-3 py-1 text-sm font-semibold rounded-md transition-colors"
          :class="view === v ? 'bg-primary-300 text-gray-950' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
        >{{ t(`calendar.views.${v}`) }}</button>
      </div>
    </div>

    <p v-if="store.error" role="alert" class="text-sm text-red-600 dark:text-red-400">{{ t('calendar.errors.load') }}</p>

    <!-- ===== Semana / Día ===== -->
    <div v-if="view !== 'list'" class="card !p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <div :class="view === 'week' ? 'min-w-[760px]' : ''">
          <!-- Cabecera de días -->
          <div class="grid border-b border-gray-200 dark:border-gray-700" :style="{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }">
            <div></div>
            <div v-for="c in days" :key="civilKey(c)" class="px-2 py-2.5 text-center border-l border-gray-100 dark:border-gray-800">
              <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ fmt(civilDate(c), { weekday: 'short' }) }}</div>
              <div class="mt-0.5 inline-flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-base font-bold"
                :class="isToday(c) ? 'bg-primary-300 text-gray-950' : 'text-gray-900 dark:text-white'">{{ c.day }}</div>
              <button v-if="outsideFor(c).length" type="button" class="mt-1 block w-full truncate text-[11px] text-primary-700 dark:text-primary-300 hover:underline" @click="openEdit(outsideFor(c)[0].a)">
                {{ t('calendar.outsideHours', { n: outsideFor(c).length }) }}
              </button>
            </div>
          </div>

          <!-- Grilla -->
          <div class="relative grid max-h-[68vh] overflow-y-auto" :style="{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }">
            <!-- Horas -->
            <div>
              <div v-for="h in hours" :key="h" class="relative text-right pr-2 text-[11px] text-gray-400" :style="{ height: HOUR_PX + 'px' }">
                <span class="relative -top-2">{{ String(h).padStart(2, '0') }}:00</span>
              </div>
            </div>
            <!-- Columnas de días -->
            <div
              v-for="c in days" :key="civilKey(c)"
              class="relative border-l border-gray-100 dark:border-gray-800"
              :class="[isToday(c) ? 'bg-primary-50/40 dark:bg-primary-400/[0.03]' : '', canWork ? 'cursor-pointer' : '']"
              :style="{ height: hours.length * HOUR_PX + 'px' }"
              @click.self="onSlotClick($event, c)"
            >
              <div v-for="h in hours" :key="h" class="pointer-events-none border-t border-gray-100 dark:border-gray-800" :style="{ height: HOUR_PX + 'px' }"></div>

              <div v-if="isToday(c) && nowTop" class="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-red-500" :style="{ top: nowTop }">
                <span class="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </div>

              <button
                v-for="b in blocksFor(c)" :key="b.a._id" type="button"
                class="absolute z-20 overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-left text-xs shadow-sm hover:shadow-md transition-shadow"
                :class="statusClass(b.a)" :style="b.style"
                @click="openEdit(b.a)"
              >
                <div class="font-semibold leading-tight truncate">{{ time(b.a.startsAt) }} {{ b.a.title }}</div>
                <div v-if="who(b.a)" class="truncate opacity-80">{{ who(b.a) }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!store.loading && store.items.length === 0" class="border-t border-gray-100 dark:border-gray-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {{ canWork ? t('calendar.emptyHint') : t('calendar.empty') }}
      </p>
    </div>

    <!-- ===== Lista ===== -->
    <div v-else class="space-y-4">
      <p v-if="store.loading" class="text-sm text-gray-400">{{ t('common.loading') }}</p>
      <div v-else-if="listGroups.length === 0" class="card text-center py-10">
        <p class="text-gray-500 dark:text-gray-400">{{ t('calendar.emptyList') }}</p>
        <button v-if="canWork" type="button" class="btn btn-primary mt-4" @click="openNew()">+ {{ t('calendar.new') }}</button>
      </div>
      <section v-for="g in listGroups" :key="civilKey(g.c)">
        <h3 class="mb-2 text-sm font-bold capitalize" :class="isToday(g.c) ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'">
          {{ isToday(g.c) ? t('calendar.today') + ' · ' : '' }}{{ fmt(civilDate(g.c), { weekday: 'long', day: 'numeric', month: 'long' }) }}
        </h3>
        <ul class="space-y-2">
          <li v-for="a in g.items" :key="a._id">
            <button type="button" class="card w-full !p-3 flex items-center gap-3 text-left hover:border-primary-300 dark:hover:border-primary-400/40 transition-colors" @click="openEdit(a)">
              <div class="w-16 flex-shrink-0 text-center">
                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ time(a.startsAt) }}</div>
                <div class="text-[11px] text-gray-400">{{ time(a.endsAt) }}</div>
              </div>
              <div class="h-10 w-1 flex-shrink-0 rounded-full" :class="a.status === 'scheduled' ? 'bg-primary-400' : 'bg-gray-300 dark:bg-gray-600'"></div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-gray-900 dark:text-white" :class="a.status === 'done' || a.status === 'canceled' ? 'line-through opacity-60' : ''">{{ a.title }}</p>
                <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                  {{ t(`calendar.types.${a.type}`) }}<template v-if="who(a)"> · {{ who(a) }}</template>
                </p>
              </div>
              <span v-if="a.status !== 'scheduled'" class="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {{ t(`calendar.statuses.${a.status}`) }}
              </span>
            </button>
          </li>
        </ul>
      </section>
    </div>

    <AppointmentModal
      v-if="modal"
      :appointment="modal.appointment"
      :defaults="modal.defaults"
      @close="modal = null"
      @saved="onSaved"
      @deleted="onDeleted"
    />

    <div v-if="toast" role="status" class="fixed bottom-4 right-4 left-4 sm:left-auto z-[90] px-4 py-3 rounded-lg bg-gray-900 text-white text-sm shadow-lg dark:bg-white dark:text-gray-900">
      {{ toast }}
    </div>
  </div>
</template>
