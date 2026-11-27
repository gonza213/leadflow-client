<script setup>
// "Actualizar tarjeta": solo si la suscripción se cobra con Paddle (abre su portal).
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { subscriptionApi } from '../../services/api'

const { t } = useI18n()
const isPaddle = ref(false)
const opening = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await subscriptionApi.getCheckoutInfo()
    isPaddle.value = data.billingProvider === 'paddle' && !!data.paddleSubscriptionId
  } catch {
    // Sin el dato no se muestra el botón
  }
})

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
  <div v-if="isPaddle" class="flex flex-wrap items-center gap-3">
    <button type="button" class="btn btn-secondary btn-sm" :disabled="opening" @click="open">
      {{ opening ? t('common.loading') : t('checkout.updateCard') }}
    </button>
    <span v-if="error" role="alert" class="text-xs text-red-600 dark:text-red-400">{{ error }}</span>
  </div>
</template>
