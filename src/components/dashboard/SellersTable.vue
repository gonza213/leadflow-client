<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineProps({
  sellers: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <th class="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('common.seller') }}</th>
          <th class="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Leads</th>
          <th class="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">%</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="seller in sellers"
          :key="seller.seller_id"
          class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <td class="py-3 px-2">
            <span class="font-medium text-gray-900 dark:text-white">{{ seller.seller_name }}</span>
          </td>
          <td class="py-3 px-2 text-right text-gray-600 dark:text-gray-300">
            {{ seller.leads }}
          </td>
          <td class="py-3 px-2 text-right">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
              {{ seller.porcentaje }}%
            </span>
          </td>
        </tr>
        <tr v-if="sellers.length === 0">
          <td colspan="3" class="py-8 text-center text-gray-500 dark:text-gray-400">
            {{ t('common.noData') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
