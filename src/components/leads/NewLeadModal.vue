<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { leadsApi } from '../../services/api'

const emit = defineEmits(['close', 'created'])
const { t, te } = useI18n()
const authStore = useAuthStore()

const form = reactive({ name: '', phone: '', email: '', source: '' })
const saving = ref(false)
const error = ref('')

const errorMessage = (data) => {
  if (data?.message === 'duplicate_lead') {
    return data.lead
      ? t('newLead.errors.duplicateOf', { name: data.lead.name, seller: data.lead.seller_name || '-' })
      : t('newLead.errors.duplicate_lead')
  }
  const key = `newLead.errors.${data?.message}`
  return te(key) ? t(key) : t('newLead.errors.unexpected')
}

const submit = async () => {
  saving.value = true
  error.value = ''
  try {
    const response = await leadsApi.createManual(authStore.tenantSlug, { ...form })
    emit('created', response.data.lead)
  } catch (err) {
    error.value = errorMessage(err.response?.data)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 !mt-0 z-[60] flex items-center justify-center p-4 bg-black/50" @click.self="emit('close')">
    <form class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" :aria-label="t('newLead.title')" @submit.prevent="submit">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('newLead.title') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('newLead.info') }}</p>
      </div>
      <div class="p-4 space-y-3">
        <div v-if="error" role="alert" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{{ error }}</div>
        <div>
          <label class="label" for="new-lead-name">{{ t('leads.table.name') }} *</label>
          <input id="new-lead-name" v-model="form.name" class="input" maxlength="200" required />
        </div>
        <div>
          <label class="label" for="new-lead-phone">{{ t('leads.table.phone') }}</label>
          <input id="new-lead-phone" v-model="form.phone" class="input" type="tel" maxlength="40" />
        </div>
        <div>
          <label class="label" for="new-lead-email">{{ t('leads.table.email') }}</label>
          <input id="new-lead-email" v-model="form.email" class="input" type="email" maxlength="200" />
        </div>
        <div>
          <label class="label" for="new-lead-source">{{ t('leads.table.source') }}</label>
          <input id="new-lead-source" v-model="form.source" class="input" maxlength="100" placeholder="Manual" />
        </div>
      </div>
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
        <button type="button" class="btn btn-secondary" @click="emit('close')">{{ t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary" :disabled="saving || !form.name.trim()">
          {{ saving ? t('common.loading') : t('newLead.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>
