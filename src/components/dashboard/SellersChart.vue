<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'

const props = defineProps({
  sellers: {
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
      colors: [uiStore.darkMode ? '#fff' : '#374151']
    }
  },
  xaxis: {
    categories: props.sellers.map(s => s.seller_name),
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
