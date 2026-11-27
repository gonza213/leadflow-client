<script setup>
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

useHead({
  title: () => `${t('refund.title')} | LeadDistro`,
  meta: [
    { name: 'description', content: () => t('refund.metaDescription') }
  ],
  link: [
    { rel: 'canonical', href: 'https://www.leaddistro.site/refund' }
  ]
})
</script>

<template>
  <div class="legal-page">
    <div class="legal-header">
      <button @click="router.push('/landing')" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        {{ t('common.back') }}
      </button>
      <img src="/logo_leaddistro.png" alt="LeadDistro" class="legal-logo" />
    </div>

    <div class="legal-container">
      <h1>{{ t('refund.title') }}</h1>
      <p class="legal-updated">{{ t('refund.updated') }}</p>

      <section>
        <h2>{{ t('refund.s1.title') }}</h2>
        <p>{{ t('refund.s1.desc') }}</p>
      </section>

      <section>
        <h2>{{ t('refund.s2.title') }}</h2>
        <p>{{ t('refund.s2.desc') }}</p>
      </section>

      <section v-for="key in ['s3', 's4', 's5']" :key="key">
        <h2>{{ t(`refund.${key}.title`) }}</h2>
        <p>{{ t(`refund.${key}.desc`) }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.legal-page { min-height: 100vh; background: #f6f7f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.legal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; background: #0e110f; }
.back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #9ca299; cursor: pointer; font-size: 0.9rem; transition: color 0.2s; }
.back-btn:hover { color: #fff; }
.legal-logo { height: 40px; filter: brightness(0) invert(1); }
.legal-container { max-width: 760px; margin: 0 auto; padding: 56px 24px 80px; }
h1 { font-size: 2rem; font-weight: 800; color: #0e110f; margin-bottom: 4px; }
.legal-updated { color: #9ca299; font-size: 0.85rem; margin-bottom: 48px; }
section { margin-bottom: 36px; }
h2 { font-size: 1.1rem; font-weight: 700; color: #0e110f; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #dfe2da; }
p { color: #4c534d; font-size: 0.92rem; line-height: 1.8; margin-bottom: 12px; }
ul { padding-left: 20px; margin-bottom: 12px; }
li { color: #4c534d; font-size: 0.92rem; line-height: 1.8; margin-bottom: 6px; }
a { color: #4d7c0f; }
</style>
