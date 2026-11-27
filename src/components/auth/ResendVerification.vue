<script setup>
// Reenvía el email de verificación. Tras cada envío queda deshabilitado 60 segundos.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authApi } from '../../services/api'

const props = defineProps({
  email: { type: String, default: '' },
  label: { type: String, default: '' },
  // Arranca en espera cuando se acaba de enviar un email (pantalla de registro)
  justSent: { type: Boolean, default: false }
})

const { t } = useI18n()
const COOLDOWN = 60
const wait = ref(0)
const sending = ref(false)
const message = ref('')
const failed = ref(false)
let timer = null

const startCooldown = () => {
  wait.value = COOLDOWN
  clearInterval(timer)
  timer = setInterval(() => {
    if (--wait.value <= 0) clearInterval(timer)
  }, 1000)
}
onMounted(() => { if (props.justSent) startCooldown() })
onUnmounted(() => clearInterval(timer))

const disabled = computed(() => sending.value || wait.value > 0 || !props.email.trim())

const resend = async () => {
  message.value = ''
  failed.value = false
  sending.value = true
  try {
    await authApi.resendVerification(props.email.trim())
    message.value = t('security.verify.resent')
    startCooldown()
  } catch (e) {
    failed.value = true
    message.value = e.response?.status === 429 ? t('security.tooMany') : t('common.error')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <button type="button" class="btn btn-secondary w-full" :disabled="disabled" @click="resend">
      {{ wait > 0 ? t('security.verify.resendIn', { seconds: wait }) : (label || t('security.verify.resend')) }}
    </button>
    <p v-if="message" role="status" class="text-xs text-center" :class="failed ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'">
      {{ message }}
    </p>
  </div>
</template>
