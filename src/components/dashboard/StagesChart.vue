<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'

const props = defineProps({
  stages: {
    type: Array,
    default: () => []
  }
})

const uiStore = useUiStore()

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#6366f1', '#14b8a6']

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
      horizontal: false,
      borderRadius: 4,
      columnWidth: '60%',
      distributed: true
    }
  },
  colors: props.stages.map((_, i) => COLORS[i % COLORS.length]),
  dataLabels: {
    enabled: true,
    formatter: (val, opt) => {
      const stage = props.stages[opt.dataPointIndex]
      return stage ? `${stage.porcentaje}%` : ''
    },
    style: {
      fontSize: '11px',
      fontWeight: 500,
      colors: ['#fff']
    }
  },
  legend: { show: false },
  xaxis: {
    categories: props.stages.map(s => s.stage),
    labels: {
      style: {
        colors: uiStore.darkMode ? '#9ca3af' : '#6b7280',
        fontSize: '11px'
      },
      rotate: -45,
      rotateAlways: true
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: uiStore.darkMode ? '#9ca3af' : '#6b7280',
        fontSize: '12px'
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
        const stage = props.stages[opt.dataPointIndex]
        return `${val} leads (${stage?.porcentaje}%)`
      }
    }
  }
}))

const chartSeries = computed(() => [{
  name: 'Leads',
  data: props.stages.map(s => s.leads)
}])
</script>

<template>
  <div v-if="stages.length > 0">
    <apexchart
      type="bar"
      height="300"
      :options="chartOptions"
      :series="chartSeries"
      :key="uiStore.darkMode"
    />
  </div>
  <div v-else class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
    No hay datos disponibles
  </div>
</template>
