<script setup>
import { computed } from 'vue'

const props = defineProps({
  teams: { type: Array, default: () => [] },
  configuredTeams: { type: Array, default: () => [] }
})

const COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fill: '#3b82f6', text: 'text-blue-500 dark:text-blue-400' },
  { bg: 'rgba(34,197,94,0.15)',  fill: '#22c55e', text: 'text-green-500 dark:text-green-400' },
  { bg: 'rgba(139,92,246,0.15)', fill: '#8b5cf6', text: 'text-purple-500 dark:text-purple-400' },
  { bg: 'rgba(249,115,22,0.15)', fill: '#f97316', text: 'text-orange-500 dark:text-orange-400' },
  { bg: 'rgba(236,72,153,0.15)', fill: '#ec4899', text: 'text-pink-500 dark:text-pink-400' },
  { bg: 'rgba(6,182,212,0.15)',  fill: '#06b6d4', text: 'text-cyan-500 dark:text-cyan-400' },
]

// Merge configured teams with report data — show 0 for teams with no leads
const teamsWithColor = computed(() => {
  const reportMap = Object.fromEntries(props.teams.map(t => [t.team, t]))
  const base = props.configuredTeams.length
    ? props.configuredTeams.map(e => reportMap[e.nombre] || { team: e.nombre, leads: 0, porcentaje: 0 })
    : props.teams
  return base.map((t, i) => ({ ...t, color: COLORS[i % COLORS.length] }))
})

const total = computed(() => props.teams.reduce((s, t) => s + t.leads, 0))
</script>

<template>
  <div class="space-y-4">
    <!-- Leyenda -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="t in teamsWithColor"
        :key="t.team"
        class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
      >
        <!-- Dot -->
        <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: t.color.fill }"></div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ t.team }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t.leads }} leads</p>
        </div>
        <span class="text-sm font-bold flex-shrink-0" :class="t.color.text">
          {{ t.porcentaje }}%
        </span>
      </div>
    </div>

    <p class="text-xs text-gray-400 dark:text-gray-600 text-right">
      Total del período: {{ total }} leads
    </p>
  </div>
</template>
