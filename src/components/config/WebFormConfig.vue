<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { formApi } from '../../services/api'

const props = defineProps({ apiBaseUrl: { type: String, required: true } })
const { t } = useI18n()
const authStore = useAuthStore()

const formKey = ref('')
const origins = ref('')
const loading = ref(true)
const saving = ref(false)
const copied = ref(false)
const error = ref('')
const success = ref('')

const apply = (data) => {
  formKey.value = data.formKey
  origins.value = data.allowedOrigins.join('\n')
}

const request = async (action, errorKey) => {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    apply((await action()).data)
    return true
  } catch (err) {
    error.value = t(err.response?.data?.message === 'invalid_origins' ? 'webForm.invalidOrigins' : errorKey)
    return false
  } finally {
    saving.value = false
  }
}

watch(() => authStore.tenantSlug, async (slug) => {
  formKey.value = ''
  if (!slug) return
  loading.value = true
  await request(() => formApi.get(slug), 'webForm.loadError')
  loading.value = false
}, { immediate: true })

const regenerate = async () => {
  if (!window.confirm(t('webForm.confirmRegenerate'))) return
  if (await request(() => formApi.regenerateKey(authStore.tenantSlug), 'common.saveError')) success.value = t('webForm.regenerated')
}

const saveOrigins = async () => {
  const list = origins.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
  if (await request(() => formApi.update(authStore.tenantSlug, { allowedOrigins: list }), 'common.saveError')) success.value = t('config.messages.success')
}

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)

// Fragmento para pegar en el sitio del cliente. Envía como urlencoded (sin preflight)
const snippet = computed(() => {
  const url = `${props.apiBaseUrl}/api/${authStore.tenantSlug}/form/lead`
  const label = (key) => escapeHtml(t(key))
  const js = (key) => JSON.stringify(t(key)).replace(/</g, '\\u003c')
  return `<form id="leaddistro-form">
  <input type="hidden" name="form_key" value="${formKey.value}">
  <input name="name" placeholder="${label('leads.table.name')}" required>
  <input name="email" type="email" placeholder="${label('leads.table.email')}">
  <input name="phone" type="tel" placeholder="${label('leads.table.phone')}">
  <!-- Anti-spam: no mostrar ni quitar este campo -->
  <input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">
  <button type="submit">${label('webForm.send')}</button>
  <p role="status"></p>
</form>
<script>
document.getElementById('leaddistro-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  var form = event.target, status = form.querySelector('[role=status]'), button = form.querySelector('button');
  button.disabled = true;
  try {
    var response = await fetch('${url}', { method: 'POST', body: new URLSearchParams(new FormData(form)) });
    if (!response.ok) throw new Error(response.status);
    form.reset();
    status.textContent = ${js('webForm.thanks')};
  } catch (e) {
    status.textContent = ${js('webForm.sendError')};
  }
  button.disabled = false;
});
<` + `/script>`
})

const copy = () => {
  navigator.clipboard.writeText(snippet.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="card space-y-4">
    <div>
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ t('webForm.title') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('webForm.info') }}</p>
    </div>

    <div v-if="error" role="alert" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{{ error }}</div>
    <div v-if="success" role="status" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm">{{ success }}</div>

    <p v-if="loading" class="text-sm text-gray-400">{{ t('common.loading') }}</p>
    <template v-else-if="formKey">
      <div>
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="label !mb-0">{{ t('webForm.snippet') }}</span>
          <button type="button" class="btn btn-secondary btn-sm whitespace-nowrap" @click="copy">{{ copied ? t('common.copied') : t('common.copy') }}</button>
        </div>
        <pre class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-xs font-mono overflow-auto max-h-72 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{{ snippet }}</pre>
      </div>

      <div>
        <label class="label" for="webform-origins">{{ t('webForm.origins') }}</label>
        <textarea id="webform-origins" v-model="origins" rows="3" class="input text-sm font-mono" placeholder="https://www.example.com"></textarea>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('webForm.originsInfo') }}</p>
        <button type="button" class="btn btn-primary btn-sm mt-2" :disabled="saving" @click="saveOrigins">{{ t('common.save') }}</button>
      </div>

      <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
        <button type="button" class="text-sm text-red-600 dark:text-red-400 hover:underline" :disabled="saving" @click="regenerate">{{ t('webForm.regenerate') }}</button>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('webForm.regenerateInfo') }}</p>
      </div>
    </template>
  </div>
</template>
