<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  seller: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-active', 'delete', 'edit'])

const getAvailabilityColor = (available, limit) => {
  if (limit === 0) return 'text-gray-400'
  const ratio = available / limit
  if (ratio > 0.5) return 'text-green-600 dark:text-green-400'
  if (ratio > 0.2) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}
</script>

<template>
  <div
    class="card transition-all duration-200"
    :class="{ 'opacity-60': !seller.active }"
  >
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ seller.seller_name }}</h3>
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 mt-1">
          {{ seller.team }}
        </span>
        <p v-if="seller.ghl_user_id" class="text-xs text-gray-400 mt-1 font-mono truncate" :title="seller.ghl_user_id">
          CRM ID: {{ seller.ghl_user_id }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          :class="seller.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
        ></span>
        <button
          v-if="canEdit"
          @click="emit('toggle-active', seller._id)"
          class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {{ seller.active ? t('common.deactivate') : t('common.activate') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-gray-500 dark:text-gray-400">{{ t('sellers.addModal.leadsToday') }}</p>
        <p class="font-semibold text-lg" :class="getAvailabilityColor(seller.available_today, seller.daily_limit)">
          {{ seller.leads_hoy }} / {{ seller.daily_limit }}
        </p>
      </div>
      <div>
        <p class="text-gray-500 dark:text-gray-400">{{ t('sellers.addModal.leadsWeek') }}</p>
        <p class="font-semibold text-lg" :class="getAvailabilityColor(seller.available, seller.weekly_limit)">
          {{ seller.leads_semana }} / {{ seller.weekly_limit }}
        </p>
      </div>
      <div>
        <p class="text-gray-500 dark:text-gray-400">{{ t('sellers.addModal.availableToday') }}</p>
        <p class="font-semibold" :class="getAvailabilityColor(seller.available_today, seller.daily_limit)">
          {{ seller.available_today }}
        </p>
      </div>
      <div>
        <p class="text-gray-500 dark:text-gray-400">{{ t('sellers.addModal.availableWeek') }}</p>
        <p class="font-semibold" :class="getAvailabilityColor(seller.available, seller.weekly_limit)">
          {{ seller.available }}
        </p>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('sellers.addModal.capacity') }}</p>
          <p class="font-mono text-sm text-gray-900 dark:text-white">
            {{ seller.ratio !== null ? (parseFloat(seller.ratio) * 100).toFixed(0) + '%' : 'N/A' }}
          </p>
        </div>
        <div v-if="canEdit || canDelete" class="flex items-center gap-3">
          <button
            v-if="canEdit"
            @click="emit('edit', seller)"
            class="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {{ t('common.edit') }}
          </button>
          <button
            v-if="canDelete"
            @click="emit('delete', seller._id)"
            class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
