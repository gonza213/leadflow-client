<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ownerPaymentsApi } from '../services/api'

const { t, locale } = useI18n()

const CURRENCIES = ['USD', 'ARS', 'BRL', 'MXN', 'CLP', 'COP', 'PEN', 'UYU', 'EUR']

const loading = ref(true)
const error = ref('')
const settings = ref(null)
const sales = ref({ totals: [], recent: [] })

// Precio por lead
const price = reactive({ amount: '', currency: 'USD' })
const savingPrice = ref(false)
const priceMsg = ref('')

// Métodos de cobro: una tarjeta por proveedor
const providers = [
  {
    key: 'stripe',
    title: 'Stripe',
    field: 'secretKey',
    placeholder: 'sk_live_… / sk_test_…',
    help: () => t('ownerPayments.stripeHelp')
  },
  {
    key: 'mercadopago',
    title: 'Mercado Pago',
    field: 'accessToken',
    placeholder: 'APP_USR-… / TEST-…',
    help: () => t('ownerPayments.mpHelp')
  }
]
const tokens = reactive({ stripe: '', mercadopago: '' })
const busy = reactive({ stripe: false, mercadopago: false })
const msgs = reactive({ stripe: '', mercadopago: '' })
const errs = reactive({ stripe: '', mercadopago: '' })
const copied = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const [s, v] = await Promise.all([ownerPaymentsApi.getSettings(), ownerPaymentsApi.getSales()])
    settings.value = s.data.settings
    price.amount = s.data.settings.leadPrice.amount ?? ''
    price.currency = s.data.settings.leadPrice.currency || 'USD'
    sales.value = v.data
  } catch (e) {
    error.value = e.response?.data?.message || t('ownerPayments.loadError')
  } finally {
    loading.value = false
  }
}
onMounted(load)

const savePrice = async () => {
  priceMsg.value = ''
  error.value = ''
  savingPrice.value = true
  try {
    const res = await ownerPaymentsApi.save({
      leadPrice: { amount: Number(price.amount), currency: price.currency }
    })
    settings.value = res.data.settings
    priceMsg.value = t('ownerPayments.saved')
  } catch (e) {
    error.value = e.response?.data?.message || t('ownerPayments.saveError')
  } finally {
    savingPrice.value = false
  }
}

// Guarda token nuevo y/o cambia enabled / remove de un proveedor
const saveProvider = async (p, patch) => {
  errs[p.key] = ''
  msgs[p.key] = ''
  busy[p.key] = true
  try {
    const res = await ownerPaymentsApi.save({ [p.key]: patch })
    settings.value = res.data.settings
    tokens[p.key] = ''
    msgs[p.key] = res.data.warnings?.length ? res.data.warnings.join(' ') : t('ownerPayments.saved')
  } catch (e) {
    errs[p.key] = e.response?.data?.message || t('ownerPayments.saveError')
  } finally {
    busy[p.key] = false
  }
}

const saveToken = (p) => {
  if (!tokens[p.key].trim()) return
  saveProvider(p, { [p.field]: tokens[p.key].trim(), enabled: true })
}
const toggle = (p) => saveProvider(p, { enabled: !settings.value.providers[p.key].enabled })
const remove = (p) => {
  if (!confirm(t('ownerPayments.removeConfirm', { name: p.title }))) return
  saveProvider(p, { remove: true })
}

const copy = async (key) => {
  try {
    await navigator.clipboard.writeText(settings.value.webhookUrls[key])
    copied.value = key
    setTimeout(() => { copied.value = '' }, 1500)
  } catch { /* sin portapapeles: el usuario puede copiarlo a mano */ }
}

const money = (amount, currency) =>
  new Intl.NumberFormat(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount)

const formatDate = (d) => d ? new Date(d).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR') : ''
const canPrice = computed(() => Number(price.amount) > 0)
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('ownerPayments.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ t('ownerPayments.subtitle') }}</p>
    </div>

    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else-if="settings">
      <!-- Precio por lead -->
      <div class="card space-y-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('ownerPayments.priceTitle') }}</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('ownerPayments.priceHelp') }}</p>
        </div>
        <form @submit.prevent="savePrice" class="flex flex-wrap items-end gap-3">
          <div class="w-40">
            <label class="label text-xs">{{ t('ownerPayments.pricePerLead') }}</label>
            <input v-model="price.amount" type="number" min="0" step="0.01" class="input" placeholder="0.50" />
          </div>
          <div class="w-32">
            <label class="label text-xs">{{ t('ownerPayments.currency') }}</label>
            <select v-model="price.currency" class="input">
              <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="savingPrice || !canPrice">
            {{ savingPrice ? '…' : t('ownerPayments.save') }}
          </button>
          <span v-if="priceMsg" class="text-sm text-green-600 dark:text-green-400">{{ priceMsg }}</span>
        </form>
      </div>

      <!-- Métodos de cobro -->
      <div v-for="p in providers" :key="p.key" class="card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ p.title }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ p.help() }}</p>
          </div>
          <span
            class="text-xs font-semibold px-3 py-1 rounded-full"
            :class="settings.providers[p.key].enabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
          >
            {{ settings.providers[p.key].enabled ? t('ownerPayments.active') : t('ownerPayments.inactive') }}
          </span>
        </div>

        <p v-if="settings.providers[p.key].configured" class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('ownerPayments.savedToken') }}
          <code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ settings.providers[p.key].hint }}</code>
        </p>

        <form @submit.prevent="saveToken(p)" class="flex flex-wrap items-end gap-3">
          <div class="flex-1 min-w-[16rem]">
            <label class="label text-xs">
              {{ settings.providers[p.key].configured ? t('ownerPayments.replaceToken') : t('ownerPayments.token') }}
            </label>
            <input
              v-model="tokens[p.key]"
              type="password"
              class="input"
              :placeholder="p.placeholder"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="busy[p.key] || !tokens[p.key].trim()">
            {{ busy[p.key] ? '…' : t('ownerPayments.validateSave') }}
          </button>
        </form>

        <div v-if="settings.providers[p.key].configured" class="flex flex-wrap items-center gap-2">
          <button @click="toggle(p)" :disabled="busy[p.key]" class="btn btn-secondary text-sm">
            {{ settings.providers[p.key].enabled ? t('ownerPayments.disable') : t('ownerPayments.enable') }}
          </button>
          <button @click="remove(p)" :disabled="busy[p.key]" class="px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">
            {{ t('ownerPayments.remove') }}
          </button>
        </div>

        <div v-if="settings.webhookUrls[p.key]" class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>{{ t('ownerPayments.webhookUrl') }}</p>
          <div class="flex items-center gap-2">
            <code class="flex-1 min-w-0 truncate px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{{ settings.webhookUrls[p.key] }}</code>
            <button type="button" @click="copy(p.key)" class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
              {{ copied === p.key ? t('ownerPayments.copied') : t('ownerPayments.copy') }}
            </button>
          </div>
        </div>

        <p v-if="msgs[p.key]" class="text-sm text-green-600 dark:text-green-400">{{ msgs[p.key] }}</p>
        <p v-if="errs[p.key]" class="text-sm text-red-600 dark:text-red-400">{{ errs[p.key] }}</p>
      </div>

      <!-- Ventas -->
      <div class="card space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('ownerPayments.salesTitle') }}</h2>

        <p v-if="sales.recent.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('ownerPayments.noSales') }}
        </p>

        <template v-else>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div v-for="tot in sales.totals" :key="tot.currency" class="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ tot.currency }}</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ money(tot.amount, tot.currency) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ tot.leads }} leads · {{ tot.sales }} {{ t('ownerPayments.salesCount') }}</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th class="py-2 px-2">{{ t('ownerPayments.company') }}</th>
                  <th class="py-2 px-2 text-right">Leads</th>
                  <th class="py-2 px-2 text-right">{{ t('ownerPayments.amount') }}</th>
                  <th class="py-2 px-2">{{ t('ownerPayments.method') }}</th>
                  <th class="py-2 px-2">{{ t('ownerPayments.date') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sales.recent" :key="s.id" class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 px-2 text-gray-900 dark:text-white">{{ s.tenantName }}</td>
                  <td class="py-2 px-2 text-right">{{ s.quantity }}</td>
                  <td class="py-2 px-2 text-right">{{ money(s.amount, s.currency) }}</td>
                  <td class="py-2 px-2 capitalize">{{ s.provider === 'mercadopago' ? 'Mercado Pago' : 'Stripe' }}</td>
                  <td class="py-2 px-2">{{ formatDate(s.completedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
