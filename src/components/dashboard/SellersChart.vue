<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'
import apexchart from 'vue3-apexcharts'

const props = defineProps({
  sellers: {
    type: Array,
    default: () => []
  }
})

const uiStore = useUiStore()

const COLORS = ['#84cc16', '#38bdf8', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#d946ef', '#14b8a6']

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
      barHeight: '60%',
      distributed: true
    }
  },
  legend: { show: false },
  colors: props.sellers.map((_, i) => COLORS[i % COLORS.length]),
  dataLabels: {
    enabled: true,
    formatter: (val) => val,
    style: {
      fontSize: '12px',
      fontWeight: 500,
      colors: [uiStore.darkMode ? '#fff' : '#363b37']
    }
  },
  xaxis: {
    categories: props.sellers.map(s => s.seller_name),
    labels: {
      style: {
        colors: uiStore.darkMode ? '#9ca299' : '#687068',
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: uiStore.darkMode ? '#9ca299' : '#687068',
        fontSize: '12px'
      }
    }
  },
  grid: {
    borderColor: uiStore.darkMode ? '#363b37' : '#dfe2da',
    strokeDashArray: 4
  },
  tooltip: {
    theme: uiStore.darkMode ? 'dark' : 'light',
    y: {
      formatter: (val) => `${val} leads`
    }
  }
}))

const chartSeries = computed(() => [{
  name: 'Leads',
  data: props.sellers.map(s => s.leads)
}])
</script>

<template>
  <div v-if="sellers.length > 0">
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
