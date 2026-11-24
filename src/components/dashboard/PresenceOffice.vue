<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSellersStore } from '../../stores/sellers'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import PixelAgent from './PixelAgent.vue'

const sellersStore = useSellersStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

// ---- Polling de presencia (igual que antes) ----
const polling = ref(null)
const startPolling = () => {
  stopPolling()
  sellersStore.fetchPresence()
  polling.value = setInterval(() => sellersStore.fetchPresence(), 15000)
}
const stopPolling = () => {
  if (polling.value) {
    clearInterval(polling.value)
    polling.value = null
  }
}
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') startPolling()
  else stopPolling()
}

// Reloj liviano para el "hace X min" (antes había un requestAnimationFrame por frame)
const now = ref(Date.now())
let clock = null

onMounted(() => {
  startPolling()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  clock = setInterval(() => { now.value = Date.now() }, 30000)
})
onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (clock) clearInterval(clock)
})

// ---- Estados ----
const STATUSES = ['active', 'idle', 'away', 'offline']
const STATUS_ORDER = { active: 0, idle: 1, away: 2, offline: 3 }
const STATUS_COLOR = {
  active: '#84CC16',  // lima de marca
  idle: '#F59E0B',    // ámbar
  away: '#38BDF8',    // celeste
  offline: '#8A918A'  // grafito
}
const statusColor = (s) => STATUS_COLOR[s] || STATUS_COLOR.offline

const statusCounts = computed(() => {
  const c = { active: 0, idle: 0, away: 0, offline: 0 }
  for (const s of sellersStore.presence) c[s.status in c ? s.status : 'offline']++
  return c
})

// Activos primero, después inactivos, ausentes y desconectados
const sortedSellers = computed(() =>
  [...sellersStore.presence].sort((a, b) =>
    (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
    (b.leadsToday || 0) - (a.leadsToday || 0)
  )
)

const recentActivity = computed(() =>
  sellersStore.presence
    .filter(s => s.lastAction)
    .sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0))
    .slice(0, 10)
)

// ---- Identidad visual de cada vendedor ----
const AVATAR_GRADIENTS = [
  ['#C8F23A', '#84CC16'],
  ['#7DD3FC', '#38BDF8'],
  ['#FDBA74', '#F97316'],
  ['#F9A8D4', '#EC4899'],
  ['#C4B5FD', '#8B5CF6'],
  ['#5EEAD4', '#14B8A6'],
  ['#FDE68A', '#F59E0B']
]
const hash = (str = '') => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}
// El color depende del nombre (no de la posición), así no cambia al reordenar
const avatarStyle = (name) => {
  const [a, b] = AVATAR_GRADIENTS[hash(name) % AVATAR_GRADIENTS.length]
  return { background: `linear-gradient(135deg, ${a}, ${b})` }
}
// Remera del muñequito y fondo de su escena, con el color del vendedor
const shirtColor = (name) => AVATAR_GRADIENTS[hash(name) % AVATAR_GRADIENTS.length][1]
const sceneStyle = (seller) => {
  const [a, b] = AVATAR_GRADIENTS[hash(seller.seller_name) % AVATAR_GRADIENTS.length]
  const off = seller.status === 'offline'
  return {
    background: off
      ? 'linear-gradient(160deg, rgba(138,145,138,0.18), rgba(138,145,138,0.06))'
      : `radial-gradient(120% 90% at 50% 0%, ${a}55, transparent 70%), linear-gradient(160deg, ${b}33, ${b}0D)`
  }
}
const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'

// ---- Tiempo relativo ----
const timeAgo = (date) => {
  if (!date) return null
  const diffSec = Math.round((new Date(date).getTime() - now.value) / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  const abs = Math.abs(diffSec)
  if (abs < 60) return rtf.format(Math.round(diffSec), 'second')
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour')
  return rtf.format(Math.round(diffSec / 86400), 'day')
}
const clockTime = (date) =>
  date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
</script>

<template>
  <div class="presence-office h-full flex flex-col overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0C0B] text-gray-900 dark:text-gray-100 shadow-sm">

    <!-- Encabezado -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 sm:px-8 py-5 border-b border-gray-200 dark:border-white/10">
      <div class="flex items-center gap-4 min-w-0">
        <div class="w-11 h-11 rounded-2xl bg-[#C8F23A] text-[#0E110F] flex items-center justify-center shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="po-display text-lg sm:text-xl font-bold leading-tight truncate">{{ t('presence.title') }}</h2>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ t('presence.subtitle') }} · {{ authStore.user?.tenant?.name }}
          </p>
        </div>
      </div>

      <!-- Leyenda con conteos -->
      <div class="flex flex-wrap gap-2">
        <div v-for="st in STATUSES" :key="st"
             class="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
          <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: statusColor(st) }"></span>
          <span class="text-xs font-medium text-gray-600 dark:text-gray-300">{{ t('presence.status.' + st) }}</span>
          <span class="text-xs font-bold tabular-nums">{{ statusCounts[st] }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">

      <!-- Actividad del equipo -->
      <aside class="hidden xl:flex w-80 shrink-0 flex-col border-r border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
        <div class="px-6 pt-6 pb-3 flex items-center gap-2">
          <span class="relative flex w-2 h-2">
            <span class="absolute inline-flex w-full h-full rounded-full bg-[#84CC16] opacity-60 animate-ping"></span>
            <span class="relative inline-flex w-2 h-2 rounded-full bg-[#84CC16]"></span>
          </span>
          <h3 class="text-xs font-semibold text-gray-600 dark:text-gray-300">{{ t('presence.logs') }}</h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-scroll px-4 pb-4">
          <ol v-if="recentActivity.length" class="relative space-y-1">
            <li v-for="seller in recentActivity" :key="'log-' + seller._id"
                class="flex gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-white/[0.04] transition-colors">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-[#0E110F] shrink-0"
                   :style="avatarStyle(seller.seller_name)">{{ initials(seller.seller_name) }}</div>
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="text-sm font-semibold truncate">{{ seller.seller_name }}</span>
                  <span class="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums shrink-0">{{ clockTime(seller.lastActive) }}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ seller.lastAction }}</p>
              </div>
            </li>
          </ol>
          <p v-else class="px-3 py-8 text-sm text-center text-gray-500 dark:text-gray-400">{{ t('presence.noActivity') }}</p>
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('presence.activeNodes') }}</div>
            <div class="po-display text-3xl font-bold tabular-nums">{{ sellersStore.presence.length }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('presence.status.active') }}</div>
            <div class="po-display text-3xl font-bold tabular-nums text-[#4D7C0F] dark:text-[#C8F23A]">{{ statusCounts.active }}</div>
          </div>
        </div>
      </aside>

      <!-- Tarjetas de vendedores -->
      <div class="flex-1 overflow-auto custom-scroll p-4 sm:p-6 lg:p-8">
        <div v-if="!sortedSellers.length" class="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          {{ t('presence.empty') }}
        </div>

        <TransitionGroup v-else name="agent" tag="div" class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
          <article v-for="seller in sortedSellers" :key="seller._id"
                   class="agent-card relative rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
                   :class="[
                     seller.status === 'offline'
                       ? 'border-gray-200 dark:border-white/[0.06] bg-gray-50/70 dark:bg-white/[0.015]'
                       : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:shadow-lg dark:hover:shadow-[0_20px_50px_-25px_rgba(200,242,58,0.25)]',
                     seller.supportNeeded ? '!border-rose-400/70 dark:!border-rose-500/50' : ''
                   ]">

            <!-- Fila superior: avatar + nombre + estado -->
            <div class="flex items-center gap-4">
              <div class="relative shrink-0">
                <div class="agent-scene w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden relative"
                     :class="{ 'is-active': seller.status === 'active' }"
                     :style="sceneStyle(seller)">
                  <PixelAgent :status="seller.status" :color="shirtColor(seller.seller_name)" :id="seller.seller_name" />
                </div>
                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white dark:border-[#141614]"
                      :class="{ 'status-pulse': seller.status === 'active' }"
                      :style="{ backgroundColor: statusColor(seller.status), '--ring': statusColor(seller.status) }"></span>
              </div>

              <div class="min-w-0 flex-1">
                <h4 class="po-display text-base sm:text-lg font-bold leading-snug break-words"
                    :class="{ 'text-gray-500 dark:text-gray-400': seller.status === 'offline' }">
                  {{ seller.seller_name }}
                </h4>
                <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span class="st-pill inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        :style="{ '--c': statusColor(seller.status), backgroundColor: statusColor(seller.status) + '24' }">
                    <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: statusColor(seller.status) }"></span>
                    {{ t('presence.status.' + seller.status) }}
                  </span>
                  <span v-if="seller.team" class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                    {{ seller.team }}
                  </span>
                </div>
              </div>

              <!-- Alerta de soporte -->
              <span v-if="seller.supportNeeded"
                    class="shrink-0 px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wide animate-pulse">
                {{ t('presence.alerts.support') }}
              </span>
            </div>

            <!-- Métricas -->
            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="rounded-2xl px-4 py-3 bg-gray-50 dark:bg-white/[0.04]">
                <div class="text-[11px] font-medium text-gray-500 dark:text-gray-400">{{ t('presence.stats.leadsToday') }}</div>
                <div class="po-display text-2xl font-bold tabular-nums mt-0.5">{{ seller.leadsToday || 0 }}</div>
              </div>
              <div class="rounded-2xl px-4 py-3 bg-gray-50 dark:bg-white/[0.04]">
                <div class="text-[11px] font-medium text-gray-500 dark:text-gray-400">{{ t('presence.stats.salesPeriod') }}</div>
                <div class="po-display text-2xl font-bold tabular-nums mt-0.5">{{ seller.salesPeriod || 0 }}</div>
              </div>
            </div>

            <!-- Última actividad -->
            <div class="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 min-h-[1.25rem]">
              <template v-if="seller.status === 'active'">
                <span class="typing flex gap-0.5" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="font-medium text-[#4D7C0F] dark:text-[#C8F23A]">{{ t('presence.alerts.processing') }}</span>
                <span v-if="seller.lastActive" class="ml-auto tabular-nums shrink-0">{{ timeAgo(seller.lastActive) }}</span>
              </template>
              <template v-else-if="seller.lastActive">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 7v5l3 2"/></svg>
                <span class="truncate">{{ seller.lastAction || t('presence.lastSeen') }}</span>
                <span class="ml-auto tabular-nums shrink-0">{{ timeAgo(seller.lastActive) }}</span>
              </template>
              <template v-else>
                <span>{{ t('presence.noActivity') }}</span>
              </template>
            </div>
          </article>
        </TransitionGroup>
      </div>
    </div>

    <!-- Ticker -->
    <div v-if="sellersStore.presence.length" class="h-10 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex items-center overflow-hidden">
      <div class="animate-marquee whitespace-nowrap flex gap-12 items-center px-8">
        <div v-for="(seller, i) in [...sortedSellers, ...sortedSellers]" :key="'ticker-' + i" class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: statusColor(seller.status) }"></span>
          <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            <b class="font-semibold text-gray-700 dark:text-gray-200">{{ seller.seller_name }}</b>
            · {{ t('presence.status.' + seller.status) }} · {{ seller.leadsToday || 0 }} {{ t('presence.stats.leads') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.po-display { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.02em; }

/* Escena del muñequito */
.agent-scene { box-shadow: inset 0 0 0 1px rgba(127,127,127,0.18); }
.agent-scene.is-active { box-shadow: inset 0 0 0 1px rgba(132,204,22,0.55), 0 10px 30px -12px rgba(132,204,22,0.55); }
.agent-scene :deep(.pixel-agent) { padding: 4px 4px 0; }
.status-pulse { box-shadow: 0 0 0 0 var(--ring); animation: pulse 1.8s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ring) 60%, transparent); } 70% { box-shadow: 0 0 0 8px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }

/* Etiqueta de estado: más oscura en modo claro para que se lea */
.st-pill { color: color-mix(in srgb, var(--c) 55%, #0E110F); }
.dark .st-pill { color: var(--c); }

/* Puntos "procesando" */
.typing i {
  width: 4px; height: 4px; border-radius: 9999px; background: #84CC16; display: block;
  animation: typing 1.2s infinite ease-in-out;
}
.typing i:nth-child(2) { animation-delay: 0.15s; }
.typing i:nth-child(3) { animation-delay: 0.3s; }
@keyframes typing { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }

/* Reordenamiento suave cuando cambia el estado */
.agent-move { transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.agent-enter-active, .agent-leave-active { transition: all 0.35s ease; }
.agent-enter-from, .agent-leave-to { opacity: 0; transform: scale(0.97); }

/* Ticker */
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.animate-marquee { animation: marquee 50s infinite linear; }

.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(127, 127, 127, 0.2); border-radius: 10px; }

@media (prefers-reduced-motion: reduce) {
  .status-pulse, .typing i, .animate-marquee { animation: none; }
}
</style>
