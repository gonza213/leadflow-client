<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useSellersStore } from '../../stores/sellers'
import { leadsApi } from '../../services/api'

const emit = defineEmits(['close', 'imported'])
const { t, te } = useI18n()
const authStore = useAuthStore()
const sellersStore = useSellersStore()

// Filas por pedido: cada lead se puntúa y se avisa al CRM, así que un archivo
// grande en un solo pedido superaría los tiempos de espera
const BATCH = 25

const file = ref(null)
const sellerId = ref('')
const running = ref(false)
const finished = ref(false)
const total = ref(0)
const rows = ref([])
const error = ref('')
let cancelled = false

const activeSellers = computed(() => sellersStore.sellers.filter(s => s.active))
const processed = computed(() => rows.value.length)
const summary = computed(() => rows.value.reduce(
  (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
  { created: 0, duplicate: 0, held: 0, error: 0 }
))

const reasonText = (code) => {
  const key = `csvImport.reasons.${code}`
  return te(key) ? t(key) : t('csvImport.reasons.unexpected')
}

const onFile = (event) => {
  file.value = event.target.files[0] || null
  error.value = ''
  rows.value = []
  finished.value = false
}

const run = async () => {
  running.value = true
  finished.value = false
  error.value = ''
  rows.value = []
  total.value = 0
  cancelled = false

  try {
    let offset = 0
    do {
      const body = new FormData()
      body.append('file', file.value)
      if (sellerId.value) body.append('seller_id', sellerId.value)
      body.append('offset', offset)
      body.append('limit', BATCH)
      const { data } = await leadsApi.importCsv(authStore.tenantSlug, body)
      total.value = data.total
      rows.value.push(...data.rows)
      offset += data.processed
      if (!data.processed) break
    } while (offset < total.value && !cancelled)
  } catch (err) {
    const code = err.response?.data?.message
    const key = `csvImport.errors.${code}`
    error.value = te(key) ? t(key) : t('csvImport.errors.interrupted')
  } finally {
    running.value = false
    finished.value = rows.value.length > 0
    if (summary.value.created) emit('imported')
  }
}

const downloadTemplate = () => {
  const csv = '﻿name,email,phone,source\nJane Doe,jane@example.com,+1 555 010 0000,Event\n'
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'leads_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const close = () => {
  cancelled = true
  emit('close')
}
onUnmounted(() => { cancelled = true })

const statusClass = {
  created: 'text-green-600 dark:text-green-400',
  duplicate: 'text-yellow-600 dark:text-yellow-400',
  held: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400'
}
</script>

<template>
  <div class="fixed inset-0 !mt-0 z-[60] flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" :aria-label="t('csvImport.title')">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('csvImport.title') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('csvImport.info') }}</p>
      </div>

      <div class="p-4 space-y-4">
        <div v-if="error" role="alert" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{{ error }}</div>

        <div>
          <label class="label" for="csv-file">{{ t('csvImport.file') }}</label>
          <input id="csv-file" type="file" accept=".csv,text/csv" class="input text-sm" :disabled="running" @change="onFile" />
          <button type="button" class="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline" @click="downloadTemplate">{{ t('csvImport.template') }}</button>
        </div>

        <div>
          <label class="label" for="csv-seller">{{ t('csvImport.seller') }}</label>
          <select id="csv-seller" v-model="sellerId" class="input" :disabled="running">
            <option value="">{{ t('csvImport.distribute') }}</option>
            <option v-for="seller in activeSellers" :key="seller._id" :value="seller._id">{{ seller.seller_name }} ({{ seller.team }})</option>
          </select>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ sellerId ? t('csvImport.fixedInfo') : t('csvImport.distributeInfo') }}</p>
          <p v-if="authStore.user?.tenant?.giftCardEnabled" class="mt-1 text-xs text-yellow-700 dark:text-yellow-400">{{ sellerId ? t('csvImport.creditsFixed') : t('csvImport.creditsDistribute') }}</p>
        </div>

        <div v-if="running || finished" class="space-y-2" aria-live="polite">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('csvImport.progress', { done: processed, total: total || '…' }) }}</p>
          <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div class="h-full bg-primary-500 transition-all" :style="{ width: total ? `${(processed / total) * 100}%` : '0%' }"></div>
          </div>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div v-for="(count, status) in summary" :key="status" class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p class="text-lg font-bold" :class="statusClass[status]">{{ count }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ t(`csvImport.status.${status}`) }}</p>
            </div>
          </div>
          <div v-if="rows.length" class="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table class="w-full text-xs">
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="row in rows" :key="row.row">
                  <td class="px-2 py-1 text-gray-400">{{ row.row }}</td>
                  <td class="px-2 py-1 text-gray-900 dark:text-white break-all">{{ row.name || '-' }}</td>
                  <td class="px-2 py-1" :class="statusClass[row.status]">
                    {{ t(`csvImport.status.${row.status}`) }}<template v-if="row.reason">: {{ reasonText(row.reason) }}</template><template v-else-if="row.seller"> → {{ row.seller }}</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
        <button type="button" class="btn btn-secondary" @click="close">{{ running ? t('csvImport.stop') : t('pipeline.detail.close') }}</button>
        <button type="button" class="btn btn-primary" :disabled="!file || running || finished" @click="run">
          {{ running ? t('common.loading') : t('csvImport.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>
