<script setup>
import { computed, ref } from 'vue'
import { useUiStore } from '../../stores/ui'
import apexchart from 'vue3-apexcharts'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  states: {
    type: Array,
    default: () => []
  },
  leads: {
    type: Array,
    default: () => []
  },
  stages: {
    type: Array,
    default: () => []
  }
})

const uiStore = useUiStore()
const selectedStage = ref('')

// Colors for top states
const colors = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#6366f1', '#14b8a6']

// Filter states by selected stage
const filteredStates = computed(() => {
  if (!selectedStage.value) {
    return props.states
  }

  // Calculate states from leads filtered by stage
  const stateStats = {}
  const filteredLeads = props.leads.filter(lead => lead.opportunity_stage === selectedStage.value)

  filteredLeads.forEach(lead => {
    const state = lead.state || t('dashboard.charts.noState')
    if (!stateStats[state]) {
      stateStats[state] = { state, leads: 0 }
    }
    stateStats[state].leads++
  })

  const totalLeads = filteredLeads.length
  return Object.values(stateStats)
    .map(stat => ({
      ...stat,
      porcentaje: totalLeads > 0 ? ((stat.leads / totalLeads) * 100).toFixed(2) : 0
    }))
    .sort((a, b) => b.leads - a.leads)
})

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, system-ui, sans-serif',
    background: 'transparent'
  },
  theme: {
    mode: uiStore.darkMode ? 'dark' : 'light'
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '70%',
      distributed: true
    }
  },
  colors: filteredStates.value.slice(0, 10).map((_, i) => colors[i % colors.length]),
  dataLabels: {
    enabled: true,
    formatter: (val, opt) => {
      const state = filteredStates.value[opt.dataPointIndex]
      return state ? `${val} (${state.porcentaje}%)` : ''
    },
    style: {
      fontSize: '11px',
      fontWeight: 500,
      colors: ['#fff']
    }
  },
  legend: { show: false },
  xaxis: {
    labels: {
      style: {
        colors: uiStore.darkMode ? '#9ca3af' : '#6b7280',
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: uiStore.darkMode ? '#9ca3af' : '#6b7280',
        fontSize: '12px',
        fontWeight: 600
      }
    }
  },
  grid: {
    borderColor: uiStore.darkMode ? '#374151' : '#e5e7eb',
    strokeDashArray: 4
  },
  tooltip: {
    theme: uiStore.darkMode ? 'dark' : 'light',
    y: {
      formatter: (val, opt) => {
        const state = filteredStates.value[opt.dataPointIndex]
        return `${val} leads (${state?.porcentaje}%)`
      }
    }
  }
}))

// Only show top 10 states
const topStates = computed(() => filteredStates.value.slice(0, 10))

const chartSeries = computed(() => [{
  name: t('leads.title'),
  data: topStates.value.map(s => s.leads)
}])

const categories = computed(() => topStates.value.map(s => s.state))

// Get unique stages from available stages prop
const availableStages = computed(() => {
  return props.stages.map(s => s.stage).filter(s => s && s !== t('dashboard.charts.noState'))
})
</script>

<template>
  <div>
    <!-- Stage Filter -->
    <div class="mb-4">
      <label class="label text-sm">{{ t('dashboard.filters.stage') }}</label>
      <select v-model="selectedStage" class="input text-sm">
        <option value="">{{ t('dashboard.filters.allStages') }}</option>
        <option v-for="stage in availableStages" :key="stage" :value="stage">
          {{ stage }}
        </option>
      </select>
    </div>

    <div v-if="filteredStates.length > 0">
      <apexchart
        type="bar"
        :height="Math.max(200, topStates.length * 35)"
        :options="{ ...chartOptions, xaxis: { ...chartOptions.xaxis, categories } }"
        :series="chartSeries"
        :key="`${uiStore.darkMode}-${selectedStage}`"
      />
      <p v-if="filteredStates.length > 10" class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        {{ t('dashboard.charts.showingTop', { n: 10, total: filteredStates.length }) }}
      </p>
    </div>
    <div v-else class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
      {{ t('dashboard.charts.noData') }}
    </div>
  </div>
</template>
