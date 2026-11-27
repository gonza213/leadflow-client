<script setup>
// Verificación en dos pasos: activar, desactivar y regenerar códigos de respaldo.
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const enabled = computed(() => !!authStore.user?.twoFactorEnabled)

// idle | setup | codes | disable | regenerate
const step = ref('idle')
const busy = ref(false)
const error = ref('')
const setup = ref(null)
const code = ref('')
const password = ref('')
const backupCodes = ref([])
const saved = ref(false)
const copied = ref(false)

// El estado guardado puede ser anterior a esta función o de otro dispositivo
onMounted(async () => {
  try {
    const { data } = await authApi.getMe()
    authStore.setTwoFactorEnabled(!!data.user.twoFactorEnabled)
  } catch {
    // Se muestra el último estado conocido
  }
})

const manualKey = computed(() => {
  if (!setup.value) return ''
  const secret = new URL(setup.value.otpauthUrl).searchParams.get('secret') || ''
  return secret.match(/.{1,4}/g)?.join(' ') || ''
})

const reset = (next = 'idle') => {
  step.value = next
  error.value = ''
  code.value = ''
  password.value = ''
}

const MESSAGES = { invalid_2fa_code: 'security.twoFactor.invalidCode', invalid_password: 'security.twoFactor.invalidPassword' }
const run = async (action) => {
  error.value = ''
  busy.value = true
  try {
    await action()
  } catch (e) {
    const known = MESSAGES[e.response?.data?.message]
    error.value = e.response?.status === 429 ? t('security.tooMany') : t(known || 'common.error')
  } finally {
    busy.value = false
  }
}

const startSetup = () => run(async () => {
  const { data } = await authApi.setupTwoFactor()
  reset('setup')
  setup.value = data
})

const showCodes = (codes) => {
  backupCodes.value = codes
  saved.value = false
  copied.value = false
  setup.value = null
  reset('codes')
}

const enable = () => run(async () => {
  const { data } = await authApi.enableTwoFactor(code.value)
  authStore.setTwoFactorEnabled(true)
  showCodes(data.backupCodes)
})

const regenerate = () => run(async () => {
  const { data } = await authApi.regenerateBackupCodes(code.value)
  showCodes(data.backupCodes)
})

const disable = () => run(async () => {
  await authApi.disableTwoFactor(password.value, code.value)
  authStore.setTwoFactorEnabled(false)
  reset()
})

const copy = async () => {
  try {
    await navigator.clipboard.writeText(backupCodes.value.join('\n'))
    copied.value = true
  } catch {
    error.value = t('common.error')
  }
}

const download = () => {
  const text = `LeadDistro - ${t('security.twoFactor.codesTitle')}\n${authStore.user?.email || ''}\n\n${backupCodes.value.join('\n')}\n`
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: 'leaddistro-backup-codes.txt' })
  link.click()
  URL.revokeObjectURL(url)
}

const finish = () => {
  backupCodes.value = []
  reset()
}
</script>

<template>
  <section class="card p-6 space-y-4" aria-labelledby="security-title">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 id="security-title" class="text-base font-semibold text-gray-900 dark:text-white">{{ t('security.title') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('security.twoFactor.desc') }}</p>
      </div>
      <span class="text-xs font-semibold px-3 py-1 rounded-full"
        :class="enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'">
        {{ enabled ? t('security.twoFactor.on') : t('security.twoFactor.off') }}
      </span>
    </div>

    <div v-if="step === 'idle'" class="flex flex-wrap gap-3">
      <button v-if="!enabled" type="button" class="btn btn-primary" :disabled="busy" @click="startSetup">{{ t('security.twoFactor.activate') }}</button>
      <template v-else>
        <button type="button" class="btn btn-secondary" @click="reset('regenerate')">{{ t('security.twoFactor.regenerate') }}</button>
        <button type="button" class="btn btn-secondary" @click="reset('disable')">{{ t('security.twoFactor.deactivate') }}</button>
      </template>
    </div>

    <form v-else-if="step === 'setup' && setup" class="space-y-4" @submit.prevent="enable">
      <p class="text-sm text-gray-700 dark:text-gray-300">{{ t('security.twoFactor.scan') }}</p>
      <img :src="setup.qrDataUrl" :alt="t('security.twoFactor.qrAlt')" width="200" height="200" class="rounded-lg bg-white p-2" />
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('security.twoFactor.manual') }}</p>
        <code class="block mt-1 text-sm font-mono break-all select-all text-gray-900 dark:text-white">{{ manualKey }}</code>
      </div>
      <div>
        <label class="label" for="enable-code">{{ t('security.twoFactor.codeLabel') }}</label>
        <input id="enable-code" v-model="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="7" class="input max-w-[12rem] tracking-widest" />
      </div>
      <div class="flex gap-3">
        <button type="button" class="btn btn-secondary" @click="reset()">{{ t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary" :disabled="busy || !code.trim()">{{ t('security.twoFactor.confirm') }}</button>
      </div>
    </form>

    <div v-else-if="step === 'codes'" class="space-y-4">
      <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('security.twoFactor.codesTitle') }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('security.twoFactor.codesDesc') }}</p>
      <ul class="grid grid-cols-2 gap-2 font-mono text-sm text-gray-900 dark:text-white" data-test="backup-codes">
        <li v-for="item in backupCodes" :key="item" class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 select-all">{{ item }}</li>
      </ul>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn btn-secondary btn-sm" @click="copy">{{ copied ? t('security.twoFactor.copied') : t('security.twoFactor.copy') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="download">{{ t('security.twoFactor.download') }}</button>
      </div>
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input v-model="saved" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
        {{ t('security.twoFactor.saved') }}
      </label>
      <button type="button" class="btn btn-primary" :disabled="!saved" @click="finish">{{ t('security.twoFactor.close') }}</button>
    </div>

    <form v-else class="space-y-4" @submit.prevent="step === 'disable' ? disable() : regenerate()">
      <p class="text-sm text-gray-700 dark:text-gray-300">{{ step === 'disable' ? t('security.twoFactor.disableDesc') : t('security.twoFactor.regenerateDesc') }}</p>
      <div v-if="step === 'disable'">
        <label class="label" for="disable-password">{{ t('auth.password') }}</label>
        <input id="disable-password" v-model="password" type="password" autocomplete="current-password" class="input max-w-xs" />
      </div>
      <div>
        <label class="label" for="manage-code">{{ step === 'disable' ? t('security.twoFactor.codeOrBackup') : t('security.twoFactor.codeLabel') }}</label>
        <input id="manage-code" v-model="code" type="text" autocomplete="one-time-code" maxlength="14" class="input max-w-[14rem] tracking-widest" />
      </div>
      <div class="flex gap-3">
        <button type="button" class="btn btn-secondary" @click="reset()">{{ t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary" :disabled="busy || !code.trim() || (step === 'disable' && !password)">
          {{ step === 'disable' ? t('security.twoFactor.deactivate') : t('security.twoFactor.regenerate') }}
        </button>
      </div>
    </form>

    <p v-if="error" role="alert" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </section>
</template>
