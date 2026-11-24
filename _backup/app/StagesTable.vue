<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineProps({
  stages: {
    type: Array,
    default: () => []
  }
})

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#6366f1', '#14b8a6']

const getColor = (index) => COLORS[index % COLORS.length]
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <th class="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.filters.stage') }}</th>
          <th class="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Leads</th>
          <th class="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">%</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(stage, i) in stages"
          :key="stage.stage"
          class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <td class="py-3 px-2">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
              :style="{ backgroundColor: getColor(i) }"
            >
              {{ stage.stage }}
            </span>
          </td>
          <td class="py-3 px-2 text-right text-gray-600 dark:text-gray-300">
            {{ stage.leads }}
          </td>
          <td class="py-3 px-2 text-right font-medium text-gray-900 dark:text-white">
            {{ stage.porcentaje }}%
          </td>
        </tr>
        <tr v-if="stages.length === 0">
          <td colspan="3" class="py-8 text-center text-gray-500 dark:text-gray-400">
            {{ t('common.noData') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
