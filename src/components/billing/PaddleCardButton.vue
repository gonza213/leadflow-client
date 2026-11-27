<script setup>
// Portal de Paddle: cambiar la tarjeta y ver las facturas.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { subscriptionApi } from '../../services/api'

const { t } = useI18n()
const opening = ref(false)
const error = ref('')

const open = async () => {
  error.value = ''
  opening.value = true
  // La ventana se abre con el clic; si no, el navegador la bloquea
  const tab = window.open('', '_blank')
  try {
    const { data } = await subscriptionApi.paddlePortal()
    if (tab) {
      tab.opener = null
      tab.location = data.url
    } else {
      window.location.assign(data.url)
    }
  } catch {
    tab?.close()
    error.value = t('checkout.portalError')
  } finally {
    opening.value = false
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button type="button" class="btn btn-secondary btn-sm" :disabled="opening" @click="open">
      {{ opening ? t('common.loading') : t('checkout.manage') }}
    </button>
    <span v-if="error" role="alert" class="text-xs text-red-600 dark:text-red-400">{{ error }}</span>
  </div>
</template>
