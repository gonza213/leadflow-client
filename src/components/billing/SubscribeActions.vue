<script setup>
// Botón de suscripción: abre el checkout de Paddle.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { startCheckout } from '../../services/checkout'

defineProps({
  // 'button' (pantallas de suscripción) | 'inline' (banner de la prueba)
  variant: { type: String, default: 'button' },
  label: { type: String, default: '' }
})

const { t, locale } = useI18n()

const opening = ref(false)
const error = ref(false)
const start = async () => {
  error.value = false
  opening.value = true
  try {
    await startCheckout({ locale: locale.value })
  } catch (e) {
    console.error('Checkout failed:', e)
    error.value = true
  } finally {
    opening.value = false
  }
}
</script>

<template>
  <span :class="variant === 'button' ? 'flex flex-col items-start gap-1.5' : 'inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1'">
    <button
      type="button" :disabled="opening" @click="start"
      :class="variant === 'button'
        ? 'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60'
        : 'underline font-bold disabled:opacity-60'"
    >
      {{ opening ? t('common.loading') : (label || t('subscription.subscribe_button')) }} →
    </button>
    <span v-if="error" role="alert" class="text-xs font-semibold" :class="variant === 'button' ? 'text-red-600 dark:text-red-400' : ''">{{ t('checkout.error') }}</span>
  </span>
</template>
