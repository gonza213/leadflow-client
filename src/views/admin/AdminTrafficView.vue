<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '../../services/api'

const PERIODS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 365, label: '12 meses' }
]

const days = ref(30)
const data = ref(null)
const loading = ref(true)
const error = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await adminApi.getTraffic(days.value)
    data.value = res.data
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo cargar el tráfico'
  } finally {
    loading.value = false
  }
}
onMounted(load)
const setDays = (d) => { if (d !== days.value) { days.value = d; load() } }

// --- Etiquetas ---
const SOURCE_LABELS = {
  direct: 'Directo', unknown: 'Desconocido', google: 'Google', bing: 'Bing', duckduckgo: 'DuckDuckGo', yahoo: 'Yahoo',
  yandex: 'Yandex', ecosia: 'Ecosia', brave: 'Brave', facebook: 'Facebook', instagram: 'Instagram', x: 'X (Twitter)',
  linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok', reddit: 'Reddit', whatsapp: 'WhatsApp', telegram: 'Telegram',
  messenger: 'Messenger', audience_network: 'Audience Network',
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini', copilot: 'Copilot'
}
const MEDIUM_META = {
  none: { label: 'Directo', color: '#94A3B8' },
  organic: { label: 'Búsqueda', color: '#60A5FA' },
  social: { label: 'Redes sociales', color: '#F472B6' },
  cpc: { label: 'Anuncio pago', color: '#F59E0B' },
  paid: { label: 'Anuncio pago', color: '#F59E0B' },
  paid_social: { label: 'Anuncio pago', color: '#F59E0B' },
  email: { label: 'Email', color: '#34D399' },
  ai: { label: 'Asistente IA', color: '#A78BFA' },
  referral: { label: 'Otro sitio', color: '#2DD4BF' },
  unknown: { label: 'Desconocido', color: '#CBD5E1' }
}
const sourceLabel = (s) => SOURCE_LABELS[s] || s
const medium = (m) => MEDIUM_META[m] || { label: m, color: '#A3A3A3' }

const regionNames = (() => {
  try { return new Intl.DisplayNames(['es'], { type: 'region' }) } catch { return null }
})()
const countryName = (code) => (regionNames ? regionNames.of(code) : code) || code
const DEVICE_LABELS = { mobile: 'Celular', tablet: 'Tablet', desktop: 'Computadora' }

const fmt = (n) => new Intl.NumberFormat('es-AR').format(n || 0)
const pct = (part, total) => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0)

// --- Derivados ---
const totals = computed(() => data.value?.totals || { visits: 0, signups: 0, conversion: null })
const sources = computed(() => data.value?.sources || [])
const topSource = computed(() => sources.value.find((s) => s.visits > 0) || null)

// Resumen por tipo de medio (barra apilada)
const byMedium = computed(() => {
  const map = new Map()
  for (const s of sources.value) {
    const m = medium(s.medium)
    const cur = map.get(m.label) || { label: m.label, color: m.color, visits: 0 }
    cur.visits += s.visits
    map.set(m.label, cur)
  }
  return [...map.values()].filter((m) => m.visits > 0).sort((a, b) => b.visits - a.visits)
})

const series = computed(() => data.value?.series || [])
const maxDay = computed(() => Math.max(1, ...series.value.map((d) => d.visits)))
const dayLabel = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
// En periodos largos se agrupa por semana para que las barras se lean
const bars = computed(() => {
  const s = series.value
  if (s.length <= 31) return s.map((d) => ({ label: dayLabel(d.date), visits: d.visits, signups: d.signups }))
  const out = []
  for (let i = 0; i < s.length; i += 7) {
    const chunk = s.slice(i, i + 7)
    out.push({
      label: `${dayLabel(chunk[0].date)} – ${dayLabel(chunk[chunk.length - 1].date)}`,
      visits: chunk.reduce((a, d) => a + d.visits, 0),
      signups: chunk.reduce((a, d) => a + d.signups, 0)
    })
  }
  return out
})
const maxBar = computed(() => Math.max(1, ...bars.value.map((b) => b.visits)))
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tráfico del sitio</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">De dónde llegan los visitantes y cuántos terminan registrándose.</p>
      </div>
      <div class="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800/60">
        <button
          v-for="p in PERIODS"
          :key="p.days"
          @click="setDays(p.days)"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="days === p.days ? 'bg-primary-300 text-gray-950' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
        >{{ p.label }}</button>
      </div>
    </div>

    <div v-if="error" class="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">{{ error }}</div>

    <div v-if="loading && !data" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else-if="data">
      <div :class="{ 'opacity-60 transition-opacity': loading }" class="space-y-6">
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
            <div class="text-xs text-gray-500 dark:text-gray-400">Visitas</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ fmt(totals.visits) }}</div>
            <div class="text-xs text-gray-400">una por sesión</div>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
            <div class="text-xs text-gray-500 dark:text-gray-400">Registros</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ fmt(totals.signups) }}</div>
            <div class="text-xs text-gray-400">cuentas nuevas de dueños</div>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
            <div class="text-xs text-gray-500 dark:text-gray-400">Conversión</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ totals.conversion === null ? '—' : totals.conversion + '%' }}</div>
            <div class="text-xs text-gray-400">registros / visitas</div>
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3">
            <div class="text-xs text-gray-500 dark:text-gray-400">Fuente principal</div>
            <div class="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{{ topSource ? sourceLabel(topSource.source) : '—' }}</div>
            <div class="text-xs text-gray-400">{{ topSource ? pct(topSource.visits, totals.visits) + '% de las visitas' : 'Todavía sin visitas' }}</div>
          </div>
        </div>

        <!-- Evolución -->
        <div class="card">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 class="font-semibold text-gray-900 dark:text-white">Visitas por {{ bars.length < series.length ? 'semana' : 'día' }}</h2>
            <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-primary-300"></span>Visitas</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>Registros</span>
            </div>
          </div>
          <div v-if="totals.visits === 0 && totals.signups === 0" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no hay visitas registradas en este período.
          </div>
          <div v-else class="flex items-end gap-[3px] h-44" role="img" :aria-label="`Visitas de los últimos ${days} días`">
            <div v-for="(b, i) in bars" :key="i" class="group relative flex-1 h-full flex flex-col justify-end items-center min-w-0">
              <span v-if="b.signups" class="absolute -top-1 text-[10px] font-bold text-blue-600 dark:text-blue-400" :style="{ bottom: `calc(${(b.visits / maxBar) * 100}% + 4px)`, top: 'auto' }">{{ b.signups }}</span>
              <div class="w-full rounded-t bg-primary-300/90 group-hover:bg-primary-400 transition-colors" :style="{ height: Math.max(b.visits ? 3 : 0, (b.visits / maxBar) * 100) + '%' }"></div>
              <div class="pointer-events-none absolute bottom-full mb-6 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                {{ b.label }} · {{ fmt(b.visits) }} visitas<template v-if="b.signups"> · {{ b.signups }} registro(s)</template>
              </div>
            </div>
          </div>
          <div v-if="bars.length" class="mt-2 flex justify-between text-[11px] text-gray-400">
            <span>{{ bars[0].label }}</span><span>{{ bars[bars.length - 1].label }}</span>
          </div>
        </div>

        <!-- Fuentes -->
        <div class="card">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-1">De dónde llegan</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Por tipo de canal y por sitio. Los clics de Facebook e Instagram se reconocen aunque la app no mande de dónde vienen.
            Para ver cada campaña de Meta, en el anuncio agregá los parámetros de URL
            <code v-pre class="font-mono text-[11px] text-gray-600 dark:text-gray-300 break-all">utm_source={{site_source_name}}&amp;utm_medium=paid_social&amp;utm_campaign={{campaign.name}}</code>.
          </p>

          <div v-if="byMedium.length" class="mb-5">
            <div class="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div v-for="m in byMedium" :key="m.label" :style="{ width: pct(m.visits, totals.visits) + '%', background: m.color }" :title="`${m.label}: ${pct(m.visits, totals.visits)}%`"></div>
            </div>
            <div class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
              <span v-for="m in byMedium" :key="m.label" class="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                <span class="h-2.5 w-2.5 rounded-full" :style="{ background: m.color }"></span>{{ m.label }} <strong>{{ pct(m.visits, totals.visits) }}%</strong>
              </span>
            </div>
          </div>

          <div v-if="sources.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th class="py-2 pr-3 font-medium">Fuente</th>
                  <th class="py-2 pr-3 font-medium">Canal</th>
                  <th class="py-2 pr-3 font-medium text-right">Visitas</th>
                  <th class="py-2 pr-3 font-medium w-40"></th>
                  <th class="py-2 pr-3 font-medium text-right">Registros</th>
                  <th class="py-2 font-medium text-right">Conversión</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sources" :key="s.source + s.medium" class="border-b last:border-b-0 border-gray-100 dark:border-gray-700/60">
                  <td class="py-2.5 pr-3 font-medium text-gray-900 dark:text-white">{{ sourceLabel(s.source) }}</td>
                  <td class="py-2.5 pr-3">
                    <span class="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <span class="h-2 w-2 rounded-full" :style="{ background: medium(s.medium).color }"></span>{{ medium(s.medium).label }}
                    </span>
                  </td>
                  <td class="py-2.5 pr-3 text-right tabular-nums text-gray-800 dark:text-gray-200">{{ fmt(s.visits) }}</td>
                  <td class="py-2.5 pr-3">
                    <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div class="h-1.5 rounded-full" :style="{ width: pct(s.visits, totals.visits) + '%', background: medium(s.medium).color }"></div>
                    </div>
                  </td>
                  <td class="py-2.5 pr-3 text-right tabular-nums" :class="s.signups ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400'">{{ fmt(s.signups) }}</td>
                  <td class="py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{{ s.visits ? pct(s.signups, s.visits) + '%' : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sin datos en este período.</p>
        </div>

        <!-- Páginas, países y dispositivos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="card">
            <h2 class="font-semibold text-gray-900 dark:text-white mb-3">Páginas de entrada</h2>
            <div v-if="data.pages.length" class="space-y-2.5">
              <div v-for="p in data.pages" :key="p.path">
                <div class="flex justify-between gap-2 text-sm">
                  <span class="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">{{ p.path }}</span>
                  <span class="tabular-nums text-gray-500 dark:text-gray-400">{{ fmt(p.visits) }}</span>
                </div>
                <div class="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800"><div class="h-1.5 rounded-full bg-primary-300" :style="{ width: pct(p.visits, data.pages[0].visits) + '%' }"></div></div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sin datos.</p>
          </div>

          <div class="card">
            <h2 class="font-semibold text-gray-900 dark:text-white mb-3">Países</h2>
            <div v-if="data.countries.length" class="space-y-2.5">
              <div v-for="c in data.countries" :key="c.country">
                <div class="flex justify-between gap-2 text-sm">
                  <span class="text-gray-700 dark:text-gray-300 truncate">{{ countryName(c.country) }}</span>
                  <span class="tabular-nums text-gray-500 dark:text-gray-400">{{ fmt(c.visits) }}</span>
                </div>
                <div class="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800"><div class="h-1.5 rounded-full bg-blue-400" :style="{ width: pct(c.visits, data.countries[0].visits) + '%' }"></div></div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sin datos de país. Llega solo cuando la visita pasa por el proxy de Vercel o Cloudflare.</p>
          </div>

          <div class="card">
            <h2 class="font-semibold text-gray-900 dark:text-white mb-3">Dispositivos</h2>
            <div v-if="data.devices.length" class="space-y-2.5">
              <div v-for="d in data.devices" :key="d.device">
                <div class="flex justify-between gap-2 text-sm">
                  <span class="text-gray-700 dark:text-gray-300">{{ DEVICE_LABELS[d.device] || d.device }}</span>
                  <span class="tabular-nums text-gray-500 dark:text-gray-400">{{ pct(d.visits, totals.visits) }}%</span>
                </div>
                <div class="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800"><div class="h-1.5 rounded-full bg-purple-400" :style="{ width: pct(d.visits, totals.visits) + '%' }"></div></div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sin datos.</p>
          </div>
        </div>

        <p class="text-xs text-gray-400">
          Se cuenta una visita por sesión de quien no inició sesión, sin cookies ni IP. Los bots se descartan.
          Los registros anteriores a esta función figuran con fuente "Desconocido".
        </p>
      </div>
    </template>
  </div>
</template>
