<script setup>
// Botón de suscripción: el método sugerido según la zona horaria y, abajo, el otro.
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { paddleEnabled, suggestedProvider, startCheckout } from '../../services/checkout'

const props = defineProps({
  // 'button' (pantallas de suscripción) | 'inline' (banner de la prueba)
  variant: { type: String, default: 'button' },
  label: { type: String, default: '' }
})

const { t, locale } = useI18n()
const authStore = useAuthStore()

const provider = ref('dlocalgo')
onMounted(() => { provider.value = suggestedProvider() })
const alternative = computed(() => (provider.value === 'paddle' ? 'dlocalgo' : 'paddle'))

const opening = ref(false)
const error = ref(false)
const start = async (chosen) => {
  error.value = false
  opening.value = true
  try {
    await startCheckout(chosen, { email: authStore.user?.email, locale: locale.value })
  } catch (e) {
    console.error('Checkout failed:', e)
    error.value = true
  } finally {
    opening.value = false
  }
}

const mainLabel = computed(() =>
  provider.value === 'paddle' ? t('checkout.payByCard') : (props.label || t('subscription.subscribe_button'))
)
</script>

<template>
  <span :class="variant === 'button' ? 'flex flex-col items-start gap-1.5' : 'inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1'">
    <button
      type="button" :disabled="opening" @click="start(provider)"
      :class="variant === 'button'
        ? 'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60'
        : 'underline font-bold disabled:opacity-60'"
    >
      {{ opening ? t('common.loading') : mainLabel }} →
    </button>
    <button v-if="paddleEnabled()" type="button" :disabled="opening" class="text-xs underline opacity-80 hover:opacity-100 text-left" @click="start(alternative)">
      {{ alternative === 'paddle' ? t('checkout.otherInternational') : t('checkout.otherLocal') }}
    </button>
    <span v-if="error" role="alert" class="text-xs font-semibold" :class="variant === 'button' ? 'text-red-600 dark:text-red-400' : ''">{{ t('checkout.error') }}</span>
  </span>
</template>
