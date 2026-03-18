<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'

const props = defineProps({
  states: {
    type: Array,
    default: () => []
  }
})

const uiStore = useUiStore()

// Colors for top states
const colors = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#6366f1', '#14b8a6']

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
  colors: props.states.slice(0, 10).map((_, i) => colors[i % colors.length]),
  dataLabels: {
    enabled: true,
    formatter: (val, opt) => {
      const state = props.states[opt.dataPointIndex]
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
        const state = props.states[opt.dataPointIndex]
        return `${val} leads (${state?.porcentaje}%)`
      }
    }
  }
}))

// Only show top 10 states
const topStates = computed(() => props.states.slice(0, 10))

const chartSeries = computed(() => [{
  name: 'Leads',
  data: topStates.value.map(s => s.leads)
}])

const categories = computed(() => topStates.value.map(s => s.state))
</script>

<template>
  <div v-if="states.length > 0">
    <apexchart
      type="bar"
      :height="Math.max(200, topStates.length * 35)"
      :options="{ ...chartOptions, xaxis: { ...chartOptions.xaxis, categories } }"
      :series="chartSeries"
      :key="uiStore.darkMode"
    />
    <p v-if="states.length > 10" class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
      Mostrando top 10 de {{ states.length }} estados
    </p>
  </div>
  <div v-else class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
    No hay datos disponibles
  </div>
</template>
