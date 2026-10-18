<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { creditsApi } from '../services/api'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const credits = ref(null)
const purchases = ref([])

const quantity = ref(100)
const provider = ref('')
const paying = ref(false)
const payError = ref('')
const returnState = ref('') // '', 'checking', 'completed', 'pending', 'cancel', 'error'

const exhausted = computed(() => credits.value?.enabled && credits.value.leadCredits === 0)
const providerLabel = (p) => (p === 'mercadopago' ? 'Mercado Pago' : 'Stripe')

const total = computed(() => {
  const price = credits.value?.price
  const q = Math.floor(Number(quantity.value))
  if (!price || !Number.isFinite(q) || q < 1) return null
  return Math.round(q * price.amount * 100) / 100
})

const money = (amount, currency) =>
  new Intl.NumberFormat(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount)

const statusLabel = (s) => t(`giftcard.status.${s}`)
const formatDate = (d) => new Date(d).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'es-AR')

const fetchAll = async () => {
  const [c, p] = await Promise.all([
    creditsApi.get(authStore.tenantSlug),
    creditsApi.getPurchases(authStore.tenantSlug)
  ])
  if (!c.data.enabled) {
    router.replace('/')
    return false
  }
  credits.value = c.data
  purchases.value = p.data.purchases
  if (!provider.value || !c.data.providers.includes(provider.value)) {
    provider.value = c.data.providers[0] || ''
  }
  return true
}

// Al volver del checkout (?purchase=<id>&status=...) se verifica el pago contra el proveedor.
// El webhook puede tardar unos segundos, así que se reintenta un par de veces.
const handleReturn = async () => {
  const purchaseId = route.query.purchase
  const status = route.query.status
  if (!purchaseId) return

  if (status === 'cancel') {
    returnState.value = 'cancel'
  } else {
    returnState.value = 'checking'
    let result = 'pending'
    for (let i = 0; i < 4; i++) {
      try {
        const res = await creditsApi.confirm(authStore.tenantSlug, purchaseId)
        if (res.data.status === 'completed') { result = 'completed'; break }
      } catch {
        result = 'error'
        break
      }
      await new Promise((r) => setTimeout(r, 2500))
    }
    returnState.value = result
  }
  // Limpia la URL para que un refresh no vuelva a disparar la verificación
  router.replace({ path: '/credits' })
  await fetchAll()
}

onMounted(async () => {
  // La sección solo existe si la empresa habilitó la gift card
  if (!authStore.user?.tenant?.giftCardEnabled) {
    router.replace('/')
    return
  }
  try {
    if (await fetchAll()) await handleReturn()
  } catch (e) {
    error.value = e.response?.data?.message || t('giftcard.loadError')
  } finally {
    loading.value = false
  }
})

const pay = async () => {
  payError.value = ''
  paying.value = true
  try {
    const res = await creditsApi.checkout(authStore.tenantSlug, {
      quantity: Math.floor(Number(quantity.value)),
      provider: provider.value
    })
    window.location.href = res.data.url
  } catch (e) {
    payError.value = e.response?.data?.message || t('giftcard.pay.error')
    paying.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('giftcard.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ t('giftcard.subtitle') }}</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
      {{ error }}
    </div>

    <template v-else-if="credits">
      <!-- Resultado al volver del checkout -->
      <div v-if="returnState === 'checking'" class="p-3 rounded-lg text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
        {{ t('giftcard.pay.checking') }}
      </div>
      <div v-else-if="returnState === 'completed'" class="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
        {{ t('giftcard.pay.completed') }}
      </div>
      <div v-else-if="returnState === 'pending'" class="p-3 rounded-lg text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
        {{ t('giftcard.pay.pending') }}
      </div>
      <div v-else-if="returnState === 'cancel'" class="p-3 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        {{ t('giftcard.pay.cancelled') }}
      </div>
      <div v-else-if="returnState === 'error'" class="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
        {{ t('giftcard.pay.verifyError') }}
      </div>

      <div
        v-if="exhausted"
        class="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4"
      >
        <p class="font-semibold text-amber-900 dark:text-amber-200">{{ t('giftcard.banner.title') }}</p>
        <p class="text-sm text-amber-800 dark:text-amber-300">{{ t('giftcard.banner.message') }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="card">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('giftcard.balance') }}</p>
          <p class="mt-2 text-4xl font-bold" :class="exhausted ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'">
            {{ credits.leadCredits }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ t('giftcard.balanceHint') }}</p>
        </div>
        <div class="card">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('giftcard.held') }}</p>
          <p class="mt-2 text-4xl font-bold text-gray-900 dark:text-white">{{ credits.heldLeads }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ t('giftcard.heldHint') }}</p>
        </div>
      </div>

      <!-- Comprar -->
      <div class="card space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('giftcard.buyTitle') }}</h2>

        <p v-if="!credits.purchasable" class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('giftcard.buyUnavailable') }}
        </p>

        <form v-else @submit.prevent="pay" class="space-y-4">
          <div class="flex flex-wrap items-end gap-4">
            <div class="w-40">
              <label class="label text-xs">{{ t('giftcard.pay.quantity') }}</label>
              <input v-model.number="quantity" type="number" min="1" max="100000" step="1" class="input" />
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p>{{ t('giftcard.pay.unitPrice') }}: <strong>{{ money(credits.price.amount, credits.price.currency) }}</strong></p>
              <p v-if="total !== null">
                {{ t('giftcard.pay.total') }}:
                <strong class="text-lg text-gray-900 dark:text-white">{{ money(total, credits.price.currency) }}</strong>
              </p>
            </div>
          </div>

          <div>
            <p class="label text-xs">{{ t('giftcard.pay.method') }}</p>
            <div class="flex flex-wrap gap-3">
              <label
                v-for="p in credits.providers"
                :key="p"
                class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer"
                :class="provider === p
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'"
              >
                <input v-model="provider" type="radio" :value="p" class="text-primary-600" />
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ providerLabel(p) }}</span>
              </label>
            </div>
          </div>

          <p v-if="payError" class="text-sm text-red-600 dark:text-red-400">{{ payError }}</p>

          <button type="submit" class="btn btn-primary" :disabled="paying || total === null || !provider">
            {{ paying ? t('giftcard.pay.redirecting') : t('giftcard.pay.cta') }}
          </button>
        </form>
      </div>

      <!-- Historial -->
      <div v-if="purchases.length" class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">{{ t('giftcard.history') }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 px-2">{{ t('ownerPayments.date') }}</th>
                <th class="py-2 px-2 text-right">Leads</th>
                <th class="py-2 px-2 text-right">{{ t('ownerPayments.amount') }}</th>
                <th class="py-2 px-2">{{ t('ownerPayments.method') }}</th>
                <th class="py-2 px-2">{{ t('giftcard.statusLabel') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in purchases" :key="p._id" class="border-b border-gray-100 dark:border-gray-800">
                <td class="py-2 px-2">{{ formatDate(p.createdAt) }}</td>
                <td class="py-2 px-2 text-right">{{ p.quantity }}</td>
                <td class="py-2 px-2 text-right">{{ money(p.amount, p.currency) }}</td>
                <td class="py-2 px-2">{{ providerLabel(p.provider) }}</td>
                <td class="py-2 px-2">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="p.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : p.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'"
                  >{{ statusLabel(p.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
