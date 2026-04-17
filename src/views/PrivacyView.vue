<script setup>
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

useHead({
  title: `${t('privacy.title')} | LeadDistro`,
  meta: [
    { name: 'description', content: t('privacy.metaDescription') },
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
      <h1>{{ t('privacy.title') }}</h1>
      <p class="legal-updated">{{ t('privacy.updated') }}</p>

      <section>
        <h2>{{ t('privacy.s1.title') }}</h2>
        <p>{{ t('privacy.s1.desc') }}</p>
        <ul>
          <li><strong>{{ t('privacy.s1.l1').split(':')[0] }}:</strong>{{ t('privacy.s1.l1').split(':')[1] }}</li>
          <li><strong>{{ t('privacy.s1.l2').split(':')[0] }}:</strong>{{ t('privacy.s1.l2').split(':')[1] }}</li>
          <li><strong>{{ t('privacy.s1.l3').split(':')[0] }}:</strong>{{ t('privacy.s1.l3').split(':')[1] }}</li>
          <li><strong>{{ t('privacy.s1.l4').split(':')[0] }}:</strong>{{ t('privacy.s1.l4').split(':')[1] }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('privacy.s2.title') }}</h2>
        <p>{{ t('privacy.s2.desc') }}</p>
        <ul>
          <li>{{ t('privacy.s2.l1') }}</li>
          <li>{{ t('privacy.s2.l2') }}</li>
          <li>{{ t('privacy.s2.l3') }}</li>
          <li>{{ t('privacy.s2.l4') }}</li>
        </ul>
        <p>{{ t('privacy.s2.footer') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.s3.title') }}</h2>
        <p>{{ t('privacy.s3.desc') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.s4.title') }}</h2>
        <p>{{ t('privacy.s4.desc') }}</p>
        <ul>
          <li>{{ t('privacy.s4.l1') }}</li>
          <li>{{ t('privacy.s4.l2') }}</li>
          <li>{{ t('privacy.s4.l3') }}</li>
          <li>{{ t('privacy.s4.l4') }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('privacy.s5.title') }}</h2>
        <p>{{ t('privacy.s5.desc') }}</p>
        <ul>
          <li><strong>MongoDB Atlas</strong> — {{ t('privacy.s5.l1').split('—')[1] }}</li>
          <li><strong>Resend</strong> — {{ t('privacy.s5.l2').split('—')[1] }}</li>
          <li><strong>dLocalGo</strong> — {{ t('privacy.s5.l3').split('—')[1] }}</li>
          <li><strong>Vercel</strong> — {{ t('privacy.s5.l4').split('—')[1] }}</li>
          <li><strong>Koyeb</strong> — {{ t('privacy.s5.l5').split('—')[1] }}</li>
        </ul>
        <p>{{ t('privacy.s5.footer') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.s6.title') }}</h2>
        <p>{{ t('privacy.s6.desc') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.s7.title') }}</h2>
        <p>{{ t('privacy.s7.desc') }}</p>
        <ul>
          <li>{{ t('privacy.s7.l1') }}</li>
          <li>{{ t('privacy.s7.l2') }}</li>
          <li>{{ t('privacy.s7.l3') }}</li>
          <li>{{ t('privacy.s7.l4') }}</li>
        </ul>
        <p>{{ t('privacy.s7.footer') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.s8.title') }}</h2>
        <p>{{ t('privacy.s8.desc') }}</p>
      </section>

      <section>
        <h2>{{ t('privacy.s9.title') }}</h2>
        <p>{{ t('privacy.s9.desc') }} <a href="https://www.leaddistro.site" target="_blank">www.leaddistro.site</a>.</p>
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
