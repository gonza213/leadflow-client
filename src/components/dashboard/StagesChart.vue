<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'
import apexchart from 'vue3-apexcharts'

const props = defineProps({
  stages: {
    type: Array,
    default: () => []
  }
})

const uiStore = useUiStore()

const COLORS = ['#84cc16', '#38bdf8', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#d946ef', '#14b8a6', '#22c55e', '#f43f5e']

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    fontFamily: 'Inter, system-ui, sans-serif',
    background: 'transparent'
  },
  theme: {
    mode: uiStore.darkMode ? 'dark' : 'light'
  },
  colors: props.stages.map((_, i) => COLORS[i % COLORS.length]),
  labels: props.stages.map(s => s.stage),
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`,
    style: {
      fontSize: '11px',
      fontWeight: 600,
    },
    dropShadow: { enabled: false }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total leads',
            fontSize: '13px',
            fontWeight: 600,
            color: uiStore.darkMode ? '#9ca299' : '#687068',
            formatter: () => props.stages.reduce((acc, s) => acc + s.leads, 0)
          },
          value: {
            fontSize: '22px',
            fontWeight: 800,
            color: uiStore.darkMode ? '#F2F4EF' : '#0E110F',
          }
        }
      }
    }
  },
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontWeight: 500,
    labels: {
      colors: uiStore.darkMode ? '#9ca299' : '#687068'
    },
    markers: { width: 10, height: 10, radius: 3 },
    itemMargin: { horizontal: 6, vertical: 4 }
  },
  tooltip: {
    theme: uiStore.darkMode ? 'dark' : 'light',
    y: {
      formatter: (val, { seriesIndex }) => {
        const stage = props.stages[seriesIndex]
        return `${val} leads (${stage?.porcentaje}%)`
      }
    }
  },
  stroke: {
    width: 2,
    colors: [uiStore.darkMode ? '#1f2320' : '#ffffff']
  }
}))

const chartSeries = computed(() => props.stages.map(s => s.leads))
</script>

<template>
  <div v-if="stages.length > 0">
    <apexchart
      type="donut"
      height="480"
      :options="chartOptions"
      :series="chartSeries"
      :key="uiStore.darkMode"
    />
  </div>
  <div v-else class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
    No hay datos disponibles
  </div>
</template>
