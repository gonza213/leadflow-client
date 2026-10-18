<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { creditsApi } from '../../services/api'

const { t } = useI18n()
const authStore = useAuthStore()

const state = ref(null)

// Solo el manager de una empresa con gift card habilitada ve el cartel.
// El adminclient y el resto de roles no compran leads desde acá.
const applies = computed(() =>
  authStore.user?.role === 'manager' && !!authStore.user?.tenant?.giftCardEnabled
)

onMounted(async () => {
  if (!applies.value || !authStore.tenantSlug) return
  try {
    const res = await creditsApi.get(authStore.tenantSlug)
    state.value = res.data
  } catch {
    state.value = null
  }
})

const exhausted = computed(() => state.value?.enabled && state.value.leadCredits === 0)
</script>

<template>
  <div
    v-if="applies && exhausted"
    class="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-wrap items-center justify-between gap-3"
  >
    <div>
      <p class="font-semibold text-amber-900 dark:text-amber-200">{{ t('giftcard.banner.title') }}</p>
      <p class="text-sm text-amber-800 dark:text-amber-300">
        {{ t('giftcard.banner.message') }}
        <span v-if="state.heldLeads > 0"> {{ t('giftcard.banner.held', { count: state.heldLeads }) }}</span>
      </p>
    </div>
    <router-link to="/credits" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors">
      {{ t('giftcard.banner.cta') }}
    </router-link>
  </div>
</template>
