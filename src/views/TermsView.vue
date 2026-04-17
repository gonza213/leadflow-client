<script setup>
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

useHead({
  title: `${t('terms.title')} | LeadDistro`,
  meta: [
    { name: 'description', content: t('terms.metaDescription') },
    { name: 'robots', content: 'noindex, follow' }
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
      <h1>{{ t('terms.title') }}</h1>
      <p class="legal-updated">{{ t('terms.updated') }}</p>

      <section>
        <h2>{{ t('terms.s1.title') }}</h2>
        <p>{{ t('terms.s1.desc') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s2.title') }}</h2>
        <p>{{ t('terms.s2.desc') }}</p>
        <ul>
          <li>{{ t('terms.s2.l1') }}</li>
          <li>{{ t('terms.s2.l2') }}</li>
          <li>{{ t('terms.s2.l3') }}</li>
          <li>{{ t('terms.s2.l4') }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('terms.s3.title') }}</h2>
        <p>{{ t('terms.s3.desc') }}</p>
        <p>{{ t('terms.s3.footer') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s4.title') }}</h2>
        <p><strong>{{ t('terms.s4.p1').split(':')[0] }}:</strong>{{ t('terms.s4.p1').split(':')[1] }}</p>
        <p><strong>{{ t('terms.s4.p2').split(':')[0] }}:</strong>{{ t('terms.s4.p2').split(':')[1] }}</p>
        <p><strong>{{ t('terms.s4.p3').split(':')[0] }}:</strong>{{ t('terms.s4.p3').split(':')[1] }}</p>
        <p><strong>{{ t('terms.s4.p4').split(':')[0] }}:</strong>{{ t('terms.s4.p4').split(':')[1] }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s5.title') }}</h2>
        <p>{{ t('terms.s5.desc') }}</p>
        <ul>
          <li>{{ t('terms.s5.l1') }}</li>
          <li>{{ t('terms.s5.l2') }}</li>
          <li>{{ t('terms.s5.l3') }}</li>
          <li>{{ t('terms.s5.l4') }}</li>
          <li>{{ t('terms.s5.l5') }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('terms.s6.title') }}</h2>
        <p>{{ t('terms.s6.p1') }}</p>
        <p>{{ t('terms.s6.p2') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s7.title') }}</h2>
        <p>{{ t('terms.s7.p1') }}</p>
        <p>{{ t('terms.s7.p2') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s8.title') }}</h2>
        <p>{{ t('terms.s8.p1') }}</p>
        <p>{{ t('terms.s8.p2') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s9.title') }}</h2>
        <p><strong>{{ t('terms.s9.p1').split(':')[0] }}:</strong>{{ t('terms.s9.p1').split(':')[1] }}</p>
        <p><strong>{{ t('terms.s9.p2').split(':')[0] }}:</strong>{{ t('terms.s9.p2').split(':')[1] }}</p>
        <p>{{ t('terms.s9.footer') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s10.title') }}</h2>
        <p>{{ t('terms.s10.desc') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s11.title') }}</h2>
        <p>{{ t('terms.s11.desc') }}</p>
      </section>

      <section>
        <h2>{{ t('terms.s12.title') }}</h2>
        <p>{{ t('terms.s12.desc') }} <a href="https://www.leaddistro.site" target="_blank">www.leaddistro.site</a>.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.legal-page { min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.legal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; background: #0f172a; }
.back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; transition: color 0.2s; }
.back-btn:hover { color: #fff; }
.legal-logo { height: 40px; filter: brightness(0) invert(1); }
.legal-container { max-width: 760px; margin: 0 auto; padding: 56px 24px 80px; }
h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.legal-updated { color: #94a3b8; font-size: 0.85rem; margin-bottom: 48px; }
section { margin-bottom: 36px; }
h2 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
p { color: #475569; font-size: 0.92rem; line-height: 1.8; margin-bottom: 12px; }
ul { padding-left: 20px; margin-bottom: 12px; }
li { color: #475569; font-size: 0.92rem; line-height: 1.8; margin-bottom: 6px; }
a { color: #6366f1; }
</style>
