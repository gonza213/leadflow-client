<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

const { t, tm, rt, locale } = useI18n()

useHead({
  title: () => t('meta.title'),
  htmlAttrs: {
    lang: () => locale.value
  },
  meta: [
    { name: 'description', content: () => t('meta.description') },
    { property: 'og:title', content: () => t('meta.ogTitle') },
    { property: 'og:description', content: () => t('meta.ogDescription') },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.leaddistro.site/landing' },
    { property: 'og:image', content: 'https://res.cloudinary.com/dazfmv5ls/image/upload/b_rgb:0f172a,c_pad,w_1200,h_630/v1775877205/Gemini_Generated_Image_66tv5366tv5366tv-removebg-preview_cdwhmv.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: () => t('meta.ogTitle') },
    { name: 'twitter:description', content: () => t('meta.ogDescription') },
    { name: 'twitter:image', content: 'https://res.cloudinary.com/dazfmv5ls/image/upload/b_rgb:0f172a,c_pad,w_1200,h_630/v1775877205/Gemini_Generated_Image_66tv5366tv5366tv-removebg-preview_cdwhmv.png' },
    { name: 'keywords', content: () => t('meta.keywords') }
  ],
  link: [
    { rel: 'canonical', href: 'https://www.leaddistro.site/landing' },
    { rel: 'alternate', hreflang: 'es', href: 'https://www.leaddistro.site/landing' },
    { rel: 'alternate', hreflang: 'pt-BR', href: 'https://www.leaddistro.site/landing' },
    { rel: 'alternate', hreflang: 'en', href: 'https://www.leaddistro.site/landing' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://www.leaddistro.site/landing' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: () => JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "LeadDistro",
        "url": "https://www.leaddistro.site/",
        "logo": "https://www.leaddistro.site/logo_leaddistro.png",
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "120"
        },
        "offers": {
          "@type": "Offer",
          "price": "25.00",
          "priceCurrency": "USD",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "25.00",
            "priceCurrency": "USD",
            "unitText": "mes"
          }
        },
        "description": t('meta.schemaDescription'),
        "featureList": "Distribución automática de leads, Integración HubSpot, Integración GoHighLevel, Automatización monday.com, Límites por vendedor, Gestión de equipos por porcentaje",
        "inLanguage": locale.value,
        "creator": {
          "@type": "Organization",
          "name": "LeadDistro",
          "url": "https://www.leaddistro.site/"
        }
      })
    },
    {
      type: 'application/ld+json',
      children: () => JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": tm('landing.faq.items').map(item => ({
          "@type": "Question",
          "name": rt(item.q),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": rt(item.a)
          }
        }))
      })
    }
  ]
})

const router = useRouter()
const scrolled = ref(false)
const menuOpen = ref(false)
const sentinel = ref(null)

let observer = null

const setupObserver = () => {
  observer = new IntersectionObserver((entries) => {
    // isIntersecting será TRUE cuando el centinela sea visible (al inicio)
    // Queremos que 'scrolled' sea TRUE cuando el centinela deje de verse
    scrolled.value = !entries[0].isIntersecting
  }, {
    threshold: 0
  })

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
}

const showLangMenu = ref(false)

const setLanguage = (newLocale) => {
  locale.value = newLocale
  localStorage.setItem('user-locale', newLocale)
  document.documentElement.lang = newLocale
  showLangMenu.value = false
}

const languages = [
  { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w40/ar.png' },
  { code: 'pt-BR', label: 'Português', flag: 'https://flagcdn.com/w40/br.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' }
]

const getLangData = (code) => languages.find(l => l.code === code) || languages[0]

// --- Mockup Animations Logic ---
const dashboardSellers = ref([
  { name: 'Karla Perez', team: 'Equipo CH', initials: 'KP', color: '#3b82f6', pct: 72, count: 43, limit: 60 },
  { name: 'Christopher Valles', team: 'Equipo LATAM', initials: 'CV', color: '#22c55e', pct: 35, count: 32, limit: 90 },
  { name: 'Adrian Anez', team: 'Equipo ES', initials: 'AA', color: '#eab308', pct: 66, count: 40, limit: 60 }
])

const currentAssignmentIndex = ref(0)
const nextSeller = computed(() => dashboardSellers.value[currentAssignmentIndex.value])
const isAssigning = ref(false)

const rotateAssignment = () => {
  isAssigning.value = true
  setTimeout(() => {
    currentAssignmentIndex.value = (currentAssignmentIndex.value + 1) % dashboardSellers.value.length
    isAssigning.value = false
  }, 400)
}

let rotationInterval = null

onMounted(() => {
  setupObserver()
  document.documentElement.style.scrollBehavior = 'smooth'
  
  // Iniciar rotación del mockup
  rotationInterval = setInterval(rotateAssignment, 4000)
})
onUnmounted(() => {
  if (observer) observer.disconnect()
  if (rotationInterval) clearInterval(rotationInterval)
  document.documentElement.style.scrollBehavior = ''
})
</script>

<template>
  <div class="landing-root">
    <!-- Sentinel for scroll detection -->
    <div ref="sentinel" class="scroll-sentinel"></div>

    <!-- NAV -->
    <nav :class="['landing-nav', { 'nav-scrolled': scrolled }]">
      <div class="nav-inner">
        <a href="#" class="logo">
          <img src="/logo_leaddistro.png" alt="LeadDistro Logo" class="h-14 dark:brightness-0 dark:invert" />
        </a>
        <ul class="nav-links">
          <li><a href="#features">{{ t('nav.features') }}</a></li>
          <li><a href="#how">{{ t('nav.howItWorks') }}</a></li>
          <li><a href="#roles">{{ t('nav.roles') }}</a></li>
          <li><a href="#integraciones">{{ t('nav.integrations') }}</a></li>
          <li><a href="#pricing">{{ t('nav.pricing') }}</a></li>
          <li><a href="#faq">{{ t('nav.faq') }}</a></li>
        </ul>
        <button @click="router.push('/login')" class="btn-nav">{{ t('nav.login') }} →</button>

        <!-- Language dropdown -->
        <div class="relative ml-2">
          <button 
            @click="showLangMenu = !showLangMenu"
            class="lang-toggle-nav flex items-center gap-2 px-3 py-1.5"
            :title="t('ui.changeLang')"
          >
            <img :src="getLangData(locale).flag" :alt="getLangData(locale).code" class="w-5 h-auto rounded-sm shadow-sm" />
            <span class="uppercase">{{ getLangData(locale).code }}</span>
            <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showLangMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
          </button>

          <!-- Dropdown menu -->
          <div v-if="showLangMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[60] py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
            <button 
              v-for="lang in languages" 
              :key="lang.code"
              @click="setLanguage(lang.code)"
              class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': locale === lang.code, 'text-gray-700 dark:text-gray-300': locale !== lang.code }"
            >
              <img :src="lang.flag" :alt="lang.code" class="w-5 h-auto rounded-sm shadow-sm" />
              <span class="font-medium">{{ lang.label }}</span>
              <svg v-if="locale === lang.code" class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            </button>
          </div>

          <!-- Overlay to close menu -->
          <div v-if="showLangMenu" @click="showLangMenu = false" class="fixed inset-0 z-[-1]"></div>
        </div>

        <div class="nav-mobile-right">
          <button @click="menuOpen = !menuOpen" class="hamburger" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div :class="['mobile-menu', { 'open': menuOpen }]">
        <div class="mobile-lang-row grid grid-cols-3 gap-2 px-4 py-2">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            @click="setLanguage(lang.code); menuOpen = false" 
            class="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/30 text-primary-600': locale === lang.code, 'text-gray-600 dark:text-gray-400': locale !== lang.code }"
          >
            <img :src="lang.flag" :alt="lang.code" class="w-6 h-auto rounded-sm" />
            <span class="text-[10px] font-bold uppercase">{{ lang.code }}</span>
          </button>
        </div>
        <a href="#features" @click="menuOpen = false">{{ t('nav.features') }}</a>
        <a href="#how" @click="menuOpen = false">{{ t('nav.howItWorks') }}</a>
        <a href="#roles" @click="menuOpen = false">{{ t('nav.roles') }}</a>
        <a href="#integraciones" @click="menuOpen = false">{{ t('nav.integrations') }}</a>
        <a href="#pricing" @click="menuOpen = false">{{ t('nav.pricing') }}</a>
        <a href="#faq" @click="menuOpen = false">{{ t('nav.faq') }}</a>
        <button @click="router.push('/login'); menuOpen = false" class="btn-nav mobile-cta">{{ t('nav.login') }} →</button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero" id="top">
      <div class="glow-1"></div>
      <div class="glow-2"></div>
      <div class="hero-content">
        <div class="badge-pill">
          <span class="badge-dot"></span>
          {{ t('hero.badge') }}
        </div>
        <h1 class="hero-title">
          {{ t('hero.title') }}<br/>
          <span class="gradient-text">{{ t('hero.titleGradient') }}</span>
        </h1>
        <p class="hero-subtitle">
          {{ t('hero.subtitle') }}
        </p>
        <div class="hero-actions">
          <button @click="router.push('/register')" class="btn-primary">
            {{ t('hero.ctaPrimary') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button @click="router.push('/login')" class="btn-ghost">{{ t('hero.ctaSecondary') }} →</button>
        </div>
        <div class="hero-trust">
          <span>✓ {{ t('hero.trust.trial') }}</span>
          <span class="trust-sep">·</span>
          <span>✓ {{ t('hero.trust.noCard') }}</span>
          <span class="trust-sep">·</span>
          <span>✓ {{ t('hero.trust.setup') }}</span>
          <span class="trust-sep">·</span>
          <span>✓ {{ t('hero.trust.cancel') }}</span>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">100%</span><span class="stat-label">{{ t('hero.stats.assigned') }}</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">USD 25</span><span class="stat-label">{{ t('hero.stats.price') }}</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">9+</span><span class="stat-label">{{ t('hero.stats.crms') }}</span></div>
        </div>
      </div>

      <!-- Dashboard mockup -->
      <div class="hero-visual">
        <div class="dashboard-card">
          <div class="card-header">
            <div class="card-dots">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            </div>
            <span class="card-title">Dashboard LeadDistro</span>
          </div>
          <div class="card-body">
            <div class="mini-kpis">
              <div class="mini-kpi blue"><span class="kpi-val">247</span><span class="kpi-lbl">{{ t('leads.total') }}</span></div>
              <div class="mini-kpi emerald"><span class="kpi-val">12</span><span class="kpi-lbl">{{ t('sellers.title') }}</span></div>
              <div class="mini-kpi purple"><span class="kpi-val">96%</span><span class="kpi-lbl">{{ t('leads.status.assigned') }}</span></div>
            </div>
            <div class="mini-sellers">
              <div class="mini-seller" v-for="(s, i) in dashboardSellers" :key="s.name" :style="{ 'transition-delay': (0.3 + (i * 0.1)) + 's' }">
                <div class="s-avatar" :style="{ background: s.color }">{{ s.initials }}</div>
                <div class="s-info">
                  <span class="s-name">{{ s.name }}</span>
                  <div class="s-bar"><div class="s-fill" :style="{ width: s.pct + '%', background: s.color }"></div></div>
                </div>
                <span class="s-count">{{ s.count }}/{{ s.limit }}</span>
              </div>
            </div>
            <div class="mini-next" :class="{ 'is-assigning': isAssigning }">
              <span class="next-lbl">{{ t('main.nextAssignment') }} →</span>
              <span class="next-val">{{ nextSeller.team }} · {{ nextSeller.name }}</span>
              <div class="live-indicator">
                <span class="live-dot"></span>
                <span class="live-text">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" id="features">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.features.tag') }}</div>
          <h2 class="section-title">{{ t('landing.features.title') }}</h2>
          <p class="section-sub">{{ t('landing.features.subtitle') }}</p>
        </div>

        <div class="features-grid">
          <!-- Feature grande -->
          <div class="feat-card feat-large">
            <div class="feat-icon icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3>{{ t('landing.features.algoTitle') }}</h3>
            <p>{{ t('landing.features.algoDesc') }}</p>
            <div class="algo-steps">
              <div class="algo-step" v-for="step in algoSteps" :key="step.text" :class="{ 'step-success': step.success }">
                <span class="step-n">{{ step.n }}</span>
                <span>{{ step.text }}</span>
              </div>
            </div>
          </div>

          <div class="feat-card" v-for="f in features" :key="f.title">
            <div class="feat-icon" :class="f.iconClass">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="f.icon"></svg>
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section section-dark" id="how">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.howItWorks.tag') }}</div>
          <h2 class="section-title">{{ t('landing.howItWorks.title') }}</h2>
          <p class="section-sub">{{ t('landing.howItWorks.subtitle') }}</p>
        </div>
        <div class="steps-flow">
          <template v-for="(step, i) in steps" :key="step.title">
            <div class="step-item">
              <div class="step-icon-wrap">
                <span class="step-num-badge">0{{ i + 1 }}</span>
                <div class="step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="step.icon"></svg>
                </div>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
            <div v-if="i < steps.length - 1" class="step-connector">
              <div class="conn-line"></div>
              <span class="conn-arrow">→</span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ROLES -->
    <section class="section" id="roles">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.roles.tag') }}</div>
          <h2 class="section-title">{{ t('landing.roles.title') }}</h2>
          <p class="section-sub">{{ t('landing.roles.subtitle') }}</p>
        </div>
        <div class="roles-grid">
          <div v-for="role in roles" :key="role.name" class="role-card" :class="role.class">
            <div class="role-badge" :class="role.badgeClass">{{ role.name }}</div>
            <div class="role-icon" :class="role.iconClass">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="role.icon"></svg>
            </div>
            <h3>{{ role.title }}</h3>
            <p>{{ role.desc }}</p>
            <ul class="role-perms">
              <li v-for="perm in role.perms" :key="perm" :class="perm.startsWith('✗') ? 'perm-no' : ''">{{ perm }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- INTEGRACIONES -->
    <section class="section section-dark" id="integraciones">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.integrations.tag') }}</div>
          <h2 class="section-title">{{ t('landing.integrations.title') }}</h2>
          <p class="section-sub">{{ t('landing.integrations.subtitle') }}</p>
        </div>

        <!-- Grid de plataformas -->
        <div class="integrations-grid">
          <div v-for="platform in integrations" :key="platform.name" class="integration-card">
            <div class="int-card-icon" :style="{ background: platform.bg }">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke="platform.color" stroke-width="2" v-html="platform.icon"></svg>
            </div>
            <div class="int-card-info">
              <strong>{{ platform.name }}</strong>
              <span>{{ platform.desc }}</span>
            </div>
            <div class="int-card-badge" :class="platform.status === 'optimized' ? 'badge-native' : 'badge-webhook'">
              {{ platform.status === 'optimized' ? t('landing.integrations.badges.optimized') : t('landing.integrations.badges.webhook') }}
            </div>
          </div>
        </div>

        <!-- Flujo técnico -->
        <div class="integration-layout" style="margin-top: 64px">
          <div class="int-text">
            <div class="section-tag">{{ t('landing.integrations.config.tag') }}</div>
            <h2 class="section-title text-left">{{ t('landing.integrations.config.title') }}</h2>
            <p class="section-sub text-left" style="margin: 0 0 32px">{{ t('landing.integrations.config.subtitle') }}</p>
            <div class="int-steps">
              <div v-for="(s, i) in intSteps" :key="i" class="int-step">
                <div class="int-num">{{ i + 1 }}</div>
                <div>
                  <strong>{{ s.title }}</strong>
                  <p>{{ s.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="int-visual">
            <div class="wh-card">
              <div class="wh-header">
                <span class="wh-dot green"></span>
                <span>CRM → LeadDistro</span>
                <span class="wh-badge post">POST</span>
              </div>
              <pre class="wh-json"><span class="j-key">{"contact_id"</span><span class="j-c">:</span> <span class="j-s">"ABC123"</span><span class="j-key">,
"name"</span><span class="j-c">:</span> <span class="j-s">"Juan Pérez"</span><span class="j-key">,
"email"</span><span class="j-c">:</span> <span class="j-s">"juan@mail.com"</span><span class="j-key">,
"source"</span><span class="j-c">:</span> <span class="j-s">"Facebook Ads"</span>}</pre>
            </div>
            <div class="wh-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              <span>{{ t('landing.integrations.assignMsg') }}</span>
            </div>
            <div class="wh-card">
              <div class="wh-header">
                <span class="wh-dot blue"></span>
                <span>LeadDistro → CRM</span>
                <span class="wh-badge webhook">WEBHOOK</span>
              </div>
              <pre class="wh-json"><span class="j-key">{"contact_id"</span><span class="j-c">:</span> <span class="j-s">"ABC123"</span><span class="j-key">,
"seller_name"</span><span class="j-c">:</span> <span class="j-s">"Karla Perez"</span><span class="j-key">,
"seller_user_id"</span><span class="j-c">:</span> <span class="j-s">"crm_xyz"</span><span class="j-key">,
"team"</span><span class="j-c">:</span> <span class="j-s">"CH"</span>}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMPARISON SECTION -->
    <section class="section section-dark" id="comparativa">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.comparison.tag') }}</div>
          <h2 class="section-title">{{ t('landing.comparison.title') }}</h2>
          <p class="section-sub">{{ t('landing.comparison.subtitle') }}</p>
        </div>

        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="feat-col">{{ t('landing.comparison.headers.feat') }}</th>
                <th class="crm-col">{{ t('landing.comparison.headers.crm') }}</th>
                <th class="ld-col">{{ t('landing.comparison.headers.ld') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in comparisonFeatures" :key="f.name">
                <td class="feat-name">{{ f.name }}</td>
                <td class="crm-val">
                  <template v-if="f.native === true">
                    <span class="icon-check">✓</span>
                  </template>
                  <template v-else-if="f.native === false">
                    <span class="icon-cross">✗</span>
                  </template>
                  <template v-else>
                    <span class="val-text">{{ f.native }}</span>
                  </template>
                </td>
                <td class="ld-val">
                  <template v-if="f.leaddistro === true">
                    <span class="icon-check">✓</span>
                  </template>
                  <template v-else>
                    <span class="val-text">{{ f.leaddistro }}</span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="comparison-footer">
          <p>{{ t('landing.comparison.footer') }}</p>
        </div>
      </div>
    </section>

    <!-- AVAILABILITY -->
    <section class="section section-dark" id="availability">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.availability.tag') }}</div>
          <h2 class="section-title text-white">{{ t('landing.availability.title') }}</h2>
          <p class="section-sub">{{ t('landing.availability.subtitle') }}</p>
        </div>

        <div class="availability-table-wrapper">
          <table class="availability-table">
            <thead>
              <tr>
                <th class="region-col">{{ t('landing.availability.headers.region') }}</th>
                <th class="countries-col">{{ t('landing.availability.headers.countries') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in availabilityItems" :key="item.region">
                <td class="region-name"><strong>{{ item.region }}</strong></td>
                <td class="countries-list">{{ item.countries }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="section" id="pricing">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.pricing.tag') }}</div>
          <h2 class="section-title">{{ t('landing.pricing.title') }}</h2>
          <p class="section-sub">{{ t('landing.pricing.subtitle') }}</p>
        </div>
        <div class="pricing-grid">

          <!-- Plan mensual -->
          <div class="pricing-card pricing-main">
            <div class="pricing-popular">{{ t('landing.pricing.mostPopular') }}</div>
            <h3 class="pricing-name">{{ t('landing.pricing.monthly.title') }}</h3>
            <div class="pricing-price">
              <span class="price-currency">USD</span>
              <span class="price-amount">25</span>
              <span class="price-period">{{ t('landing.pricing.monthly.period') }}</span>
            </div>
            <p class="pricing-desc">{{ t('landing.pricing.monthly.desc') }}</p>
            <ul class="pricing-features">
              <li v-for="f in $tm('landing.pricing.monthly.features')" :key="f">✓ {{ $rt(f) }}</li>
            </ul>
            <button @click="router.push('/register')" class="btn-primary btn-full">
              {{ t('landing.pricing.cta') }}
            </button>
          </div>

          <!-- Setup opcional -->
          <div class="pricing-card pricing-addon">
            <div class="pricing-optional">{{ t('landing.pricing.optional') }}</div>
            <h3 class="pricing-name">{{ t('landing.pricing.setup.title') }}</h3>
            <div class="pricing-price">
              <span class="price-currency">USD</span>
              <span class="price-amount">{{ t('landing.pricing.setup.amount') }}</span>
              <span class="price-period">{{ t('landing.pricing.setup.period') }}</span>
            </div>
            <p class="pricing-desc">{{ t('landing.pricing.setup.desc') }}</p>
            <ul class="pricing-features">
              <li v-for="f in $tm('landing.pricing.setup.features')" :key="f">✓ {{ $rt(f) }}</li>
            </ul>
            <template v-if="locale === 'es'">
              <a href="https://wa.me/542212204194?text=Hola!%20Me%20interesa%20el%20setup%20de%20LeadDistro%20con%20mi%20CRM" target="_blank" class="btn-secondary btn-full">
                {{ t('landing.pricing.setup.cta') }}
              </a>
            </template>
            <template v-else>
              <button @click="alert(t('landing.pricing.setup.alert'))" class="btn-secondary btn-full opacity-60 cursor-not-allowed">
                {{ t('landing.pricing.setup.cta') }}
              </button>
            </template>
          </div>

        </div>
        <p v-if="locale === 'es'" class="pricing-note">{{ t('landing.pricing.note') }}</p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" id="faq">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.faq.tag') }}</div>
          <h2 class="section-title">{{ t('landing.faq.title') }}</h2>
          <p v-if="locale === 'es'" class="section-sub">{{ t('landing.faq.subtitle') }}</p>
        </div>
        <div class="faq-list">
          <div
            v-for="(item, i) in faqs"
            :key="i"
            class="faq-item"
            :class="{ 'faq-open': openFaq === i }"
            @click="openFaq = openFaq === i ? null : i"
          >
            <div class="faq-question">
              <span>{{ item.q }}</span>
              <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div class="faq-answer">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-glow"></div>
      <div class="container">
        <div class="cta-box">
          <div class="badge-pill">
            <span class="badge-dot"></span>
            {{ t('landing.cta.badge') }}
          </div>
          <h2 class="cta-title">{{ t('landing.cta.title') }}</h2>
          <p class="cta-sub">{{ t('landing.cta.subtitle') }}</p>
          <div class="cta-actions">
            <button @click="router.push('/register')" class="btn-primary btn-lg">
              {{ t('landing.cta.cta') }}
            </button>
            <button @click="router.push('/login')" class="btn-ghost btn-lg">{{ t('landing.cta.hasAccount') }}</button>
          </div>
          <div class="cta-feats">
            <span v-for="f in $tm('landing.cta.feats')" :key="f">✓ {{ $rt(f) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <a href="#" class="logo">
              <img src="/logo_leaddistro.png" alt="LeadDistro Logo" class="h-12 dark:brightness-0 dark:invert" />
            </a>
            <p>{{ t('landing.footer.desc') }}</p>
          </div>
          <div class="footer-links">
            <div class="footer-col">
              <span class="fcol-title">{{ t('landing.footer.product') }}</span>
              <a href="#features">{{ t('nav.features') }}</a>
              <a href="#how">{{ t('nav.howItWorks') }}</a>
              <a href="#integraciones">{{ t('nav.integrations') }}</a>
              <a href="#pricing">{{ t('nav.pricing') }}</a>
            </div>
            <div class="footer-col">
              <span class="fcol-title">{{ t('landing.footer.access') }}</span>
              <button @click="router.push('/login')" class="footer-link-btn">{{ t('auth.login') }}</button>
              <button @click="router.push('/register')" class="footer-link-btn">{{ t('auth.register') }}</button>
            </div>
            <div class="footer-col">
              <span class="fcol-title">{{ t('landing.footer.legal') }}</span>
              <button @click="router.push('/privacy')" class="footer-link-btn">{{ t('auth.privacyPolicy') }}</button>
              <button @click="router.push('/terms')" class="footer-link-btn">{{ t('auth.termsOfService') }}</button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          {{ t('landing.footer.rights') }} ·
          <button @click="router.push('/privacy')" class="footer-inline-link">{{ t('nav.privacy') }}</button> ·
          <button @click="router.push('/terms')" class="footer-inline-link">{{ t('nav.terms') }}</button>
        </div>
      </div>
    </footer>
  </div>

  <!-- WhatsApp floating button -->
  <a
    v-if="locale === 'es'"
    href="https://wa.me/542212204194?text=Hola!%20Me%20interesa%20LeadDistro%20para%20mi%20equipo%20de%20ventas"
    target="_blank"
    class="wa-float"
    :title="t('landing.footer.waTitle')"
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    <span class="wa-label">{{ t('landing.footer.waTitle') }}</span>
  </a>
</template>

<script>
export default {
  computed: {
    faqs() {
      return this.$tm('landing.faq.items').map(item => ({
        q: this.$rt(item.q),
        a: this.$rt(item.a)
      }))
    },
    algoSteps() {
      return [
        { n: '1', text: this.$t('landing.features.algoSteps.1'), success: false },
        { n: '2', text: this.$t('landing.features.algoSteps.2'), success: false },
        { n: '3', text: this.$t('landing.features.algoSteps.3'), success: false },
        { n: '✓', text: this.$t('landing.features.algoSteps.4'), success: true }
      ]
    },
    features() {
      const items = this.$tm('landing.features.items')
      return [
        {
          title: this.$rt(items.teams.title),
          desc: this.$rt(items.teams.desc),
          iconClass: 'icon-green',
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
        },
        {
          title: this.$rt(items.limits.title),
          desc: this.$rt(items.limits.desc),
          iconClass: 'icon-purple',
          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
        },
        {
          title: this.$rt(items.fallback.title),
          desc: this.$rt(items.fallback.desc),
          iconClass: 'icon-orange',
          icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
        },
        {
          title: this.$rt(items.metrics.title),
          desc: this.$rt(items.metrics.desc),
          iconClass: 'icon-cyan',
          icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
        }
      ]
    },
    steps() {
      const steps = this.$tm('landing.howItWorks.steps')
      return [
        {
          title: this.$rt(steps['1'].title),
          desc: this.$rt(steps['1'].desc),
          icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
        },
        {
          title: this.$rt(steps['2'].title),
          desc: this.$rt(steps['2'].desc),
          icon: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>'
        },
        {
          title: this.$rt(steps['3'].title),
          desc: this.$rt(steps['3'].desc),
          icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
        },
        {
          title: this.$rt(steps['4'].title),
          desc: this.$rt(steps['4'].desc),
          icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
        }
      ]
    },
    roles() {
      const items = this.$tm('landing.roles.items')
      return [
        {
          name: 'Manager',
          class: 'role-manager',
          badgeClass: 'badge-blue',
          iconClass: 'ricon-blue',
          title: this.$rt(items.manager.title),
          desc: this.$rt(items.manager.desc),
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
          perms: items.manager.perms.map(p => this.$rt(p))
        },
        {
          name: 'Viewer',
          class: 'role-viewer',
          badgeClass: 'badge-yellow',
          iconClass: 'ricon-yellow',
          title: this.$rt(items.viewer.title),
          desc: this.$rt(items.viewer.desc),
          icon: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
          perms: items.viewer.perms.map(p => this.$rt(p))
        },
        {
          name: 'Seller',
          class: 'role-seller',
          badgeClass: 'badge-green',
          iconClass: 'ricon-green',
          title: this.$rt(items.seller.title),
          desc: this.$rt(items.seller.desc),
          icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
          perms: items.seller.perms.map(p => this.$rt(p))
        }
      ]
    },
    integrations() {
      const items = this.$tm('landing.integrations.items')
      return [
        {
          name: 'GoHighLevel',
          desc: this.$rt(items.ghl.desc),
          status: 'optimized',
          bg: 'rgba(34,197,94,0.12)',
          color: '#22c55e',
          icon: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>'
        },
        {
          name: 'Kommo (amoCRM)',
          desc: this.$rt(items.kommo.desc),
          status: 'webhook',
          bg: 'rgba(59,130,246,0.12)',
          color: '#3b82f6',
          icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.9.1"/><path d="M7 11V7l5-2 5 2v4"/><path d="M7 11l5 2 5-2M12 13v8"/>'
        },
        {
          name: 'monday.com',
          desc: this.$rt(items.monday.desc),
          status: 'webhook',
          bg: 'rgba(0,202,114,0.12)',
          color: '#00ca72',
          icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
        },
        {
          name: 'HubSpot',
          desc: this.$rt(items.hubspot.desc),
          status: 'webhook',
          bg: 'rgba(249,115,22,0.12)',
          color: '#f97316',
          icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>'
        },
        {
          name: 'Clientify',
          desc: this.$rt(items.clientify.desc),
          status: 'webhook',
          bg: 'rgba(225,29,72,0.12)',
          color: '#e11d48',
          icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
        },
        {
          name: 'Make / Zapier',
          desc: this.$rt(items.make.desc),
          status: 'webhook',
          bg: 'rgba(139,92,246,0.12)',
          color: '#8b5cf6',
          icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
        }
      ]
    },
    intSteps() {
      const steps = this.$tm('landing.integrations.config.steps')
      return [
        { title: this.$rt(steps['1'].title), desc: this.$rt(steps['1'].desc) },
        { title: this.$rt(steps['2'].title), desc: this.$rt(steps['2'].desc) },
        { title: this.$rt(steps['3'].title), desc: this.$rt(steps['3'].desc) }
      ]
    },
    comparisonFeatures() {
      const items = this.$tm('landing.comparison.items')
      const vals = this.$tm('landing.comparison.values')
      return [
        { name: this.$rt(items.roundRobin), native: this.$rt(vals.basic), leaddistro: this.$rt(vals.advanced) },
        { name: this.$rt(items.dailyLimits), native: false, leaddistro: true },
        { name: this.$rt(items.weeklyLimits), native: false, leaddistro: true },
        { name: this.$rt(items.percent), native: false, leaddistro: true },
        { name: this.$rt(items.fallback), native: false, leaddistro: true },
        { name: this.$rt(items.metrics), native: false, leaddistro: true }
      ]
    },
    availabilityItems() {
      return this.$tm('landing.availability.items').map(item => ({
        region: this.$rt(item.region),
        countries: this.$rt(item.countries)
      }))
    }
  },
  data() {
    return {
      openFaq: null
    }
  }
}
</script>

<style scoped>
/* ===== BASE ===== */
.landing-root {
  font-family: 'Inter', system-ui, sans-serif;
  background: #060b14;
  color: #e2e8f0;
  line-height: 1.6;
  overflow-x: hidden;
}
.container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }

/* ===== NAV ===== */
.landing-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 24px;
  transition: background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s;
  will-change: background, backdrop-filter, box-shadow;
}
.scroll-sentinel {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
  visibility: hidden;
}
.nav-scrolled {
  background: rgba(6,11,20,0.88);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.06);
}
.nav-inner {
  max-width: 1160px; margin: 0 auto;
  display: flex; align-items: center; gap: 24px; height: 68px;
}
.logo {
  display: flex; align-items: center; gap: 10px;
  font-size: 1.2rem; font-weight: 800; color: #fff;
  letter-spacing: -0.5px; text-decoration: none;
}
.logo-icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 9px; display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.nav-links { display: flex; align-items: center; gap: 4px; margin-left: 20px; flex: 1; list-style: none; }
.nav-links a {
  font-size: 0.88rem; font-weight: 500; color: #94a3b8;
  padding: 6px 12px; border-radius: 8px;
  transition: color 0.2s, background 0.2s; cursor: pointer;
}
.nav-links a:hover { color: #fff; background: rgba(255,255,255,0.07); }
.btn-nav {
  font-size: 0.875rem; font-weight: 600;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff; padding: 9px 20px; border-radius: 10px;
  border: none; cursor: pointer; white-space: nowrap;
  transition: opacity 0.2s, transform 0.2s;
}
.btn-nav:hover { opacity: 0.9; transform: translateY(-1px); }

.lang-toggle-nav {
  font-size: 0.8rem; font-weight: 700; color: #94a3b8;
  padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03); cursor: pointer;
  transition: all 0.2s; margin-left: 8px;
}
.lang-toggle-nav:hover { color: #fff; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }

.mobile-lang-row {
  padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 8px;
}
.mobile-lang-btn {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 600;
  width: 100%; text-align: center; cursor: pointer;
}

.nav-mobile-right {
  display: none; align-items: center; gap: 8px; margin-left: auto;
}
.currency-toggle-mobile {
  display: flex; gap: 4px;
}
.hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 8px; margin-left: auto;
}
.hamburger span { display: block; width: 22px; height: 2px; background: #94a3b8; border-radius: 2px; }
.mobile-menu {
  display: none; flex-direction: column; padding: 12px 16px 16px; gap: 4px;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: rgba(6,11,20,0.97);
  backdrop-filter: blur(20px);
}
.mobile-menu.open { display: flex; }
.mobile-menu a, .mobile-menu button {
  font-size: 0.95rem; font-weight: 500; color: #94a3b8;
  padding: 10px 12px; border-radius: 8px; cursor: pointer;
  transition: color 0.2s; background: none; border: none; text-align: left;
}
.mobile-menu a:hover { color: #fff; }
.mobile-cta { margin-top: 8px; background: linear-gradient(135deg,#3b82f6,#6366f1) !important; color: #fff !important; text-align: center !important; }

/* ===== HERO ===== */
.hero {
  min-height: 100vh;
  display: flex; align-items: center;
  padding: 120px 24px 80px;
  max-width: 1160px; margin: 0 auto;
  position: relative; gap: 48px;
}
.glow-1, .glow-2 {
  position: fixed; border-radius: 50%;
  filter: blur(90px); pointer-events: none; z-index: 0;
}
.glow-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%); top: -100px; left: -80px; }
.glow-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%); bottom: 0; right: -60px; }
.hero-content { position: relative; z-index: 1; flex: 1; max-width: 560px; }
.badge-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3);
  color: #93c5fd; font-size: 0.8rem; font-weight: 600;
  padding: 6px 14px; border-radius: 100px; margin-bottom: 24px;
}
.badge-dot {
  width: 7px; height: 7px; background: #3b82f6; border-radius: 50%;
  animation: blink 2s infinite;
}
@keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
.hero-title { font-size: clamp(2.2rem,5vw,3.8rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; color: #fff; margin-bottom: 20px; }
.gradient-text { background: linear-gradient(135deg,#3b82f6 0%,#8b5cf6 50%,#06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-subtitle { font-size: 1.05rem; color: #cbd5e1; margin-bottom: 36px; line-height: 1.7; }
.hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff; font-weight: 700; font-size: 0.95rem;
  padding: 13px 24px; border-radius: 12px; border: none; cursor: pointer;
  box-shadow: 0 4px 24px rgba(59,130,246,0.35);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(59,130,246,0.45); }
.btn-primary.btn-lg { padding: 15px 32px; font-size: 1rem; }
.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  color: #94a3b8; font-weight: 600; font-size: 0.95rem;
  padding: 13px 24px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: none; cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  text-decoration: none;
}
.btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
.btn-outline {
  border: 1px solid rgba(255,255,255,0.15); color: #fff;
  background: rgba(255,255,255,0.03);
}
.btn-outline:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }
.hero-stats { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.stat { display: flex; flex-direction: column; }
.stat-num { font-size: 1.3rem; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
.stat-label { font-size: 0.76rem; color: #94a3b8; font-weight: 500; }
.stat-divider { width: 1px; height: 34px; background: rgba(255,255,255,0.1); }

/* ===== HERO VISUAL ===== */
.hero-visual {
  flex: 1; display: flex; justify-content: center; position: relative;
  perspective: 1000px;
}
.dashboard-card {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  width: 100%; max-width: 300px;
  box-shadow: 0 40px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  overflow: hidden;
  animation: float 6s ease-in-out infinite, entrance 1s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}
.dashboard-card::after {
  content: '';
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent);
  transform: skewX(-25deg);
  animation: shine 8s infinite;
  pointer-events: none;
}
.card-header {
  padding: 8px 12px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex; align-items: center; gap: 10px;
}
.card-dots { display: flex; gap: 4px; }
.dot { width: 7px; height: 7px; border-radius: 50%; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #eab308; }
.dot.green { background: #22c55e; }
.card-title { font-size: 0.6rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.card-body { padding: 10px; display: flex; flex-direction: column; gap: 10px; }
.mini-kpis { display: flex; gap: 6px; }
.mini-kpi {
  flex: 1; border-radius: 8px; padding: 7px 4px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.mini-kpi.blue { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15); }
.mini-kpi.emerald { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.15); }
.mini-kpi.purple { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15); }
.price-card {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  padding: 40px 32px; border-radius: 24px; position: relative;
  display: flex; flex-direction: column; gap: 24px; transition: transform 0.3s, border-color 0.3s;
}
.price-card:hover { transform: translateY(-5px); border-color: rgba(59,130,246,0.3); }
.price-card h3 { font-size: 1.25rem; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
.kpi-val { font-size: 0.9rem; font-weight: 800; color: #fff; line-height: 1; }
.kpi-lbl { font-size: 0.5rem; color: #94a3b8; font-weight: 500; }
.mini-sellers { display: flex; flex-direction: column; gap: 5px; }
.s-avatar {
  width: 24px; height: 24px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700; color: #fff;
}
/* High contrast for light avatar backgrounds */
.s-avatar[style*="#eab308"], .s-avatar[style*="rgb(234, 179, 8)"] { color: #0f172a !important; }
.s-info { flex: 1; }
.s-name { display: block; font-size: 0.7rem; font-weight: 600; color: #f1f5f9; margin-bottom: 3px; }
.s-bar { height: 3px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; }
.s-fill {
  height: 100%; border-radius: 10px;
  animation: fillIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: left;
}
.s-count { font-size: 0.65rem; color: #94a3b8; font-weight: 500; }

.mini-next {
  margin-top: 12px; padding: 8px 10px;
  background: rgba(30,58,138,0.2);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 8px;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.mini-next.is-assigning {
  opacity: 0.5;
  transform: translateY(-2px);
}
.next-lbl { display: block; font-size: 0.55rem; font-weight: 600; color: #60a5fa; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
.next-val { font-size: 0.8rem; font-weight: 700; color: #fff; }

.live-indicator {
  position: absolute; top: 9px; right: 10px;
  display: flex; align-items: center; gap: 3px;
}
.live-dot {
  width: 4px; height: 4px; background: #22c55e; border-radius: 50%;
  box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
  animation: livePulse 2s infinite;
}
.live-text {
  font-size: 7px; font-weight: 800; color: #22c55e; letter-spacing: 1px;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotateX(2deg); }
  50% { transform: translateY(-15px) rotateX(0deg); }
}
@keyframes shine {
  0% { left: -100%; transition-property: left; }
  20%, 100% { left: 200%; }
}
@keyframes entrance {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fillIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes livePulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* ===== SECTIONS ===== */
.section { padding: 96px 0; }
.section-dark {
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.section-header { text-align: center; margin-bottom: 60px; }
.section-tag {
  display: inline-flex; align-items: center;
  background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
  color: #60a5fa; font-size: 0.75rem; font-weight: 700;
  padding: 5px 14px; border-radius: 100px;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;
}
.section-title { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 900; letter-spacing: -1.5px; color: #fff; margin-bottom: 16px; line-height: 1.15; }
.section-title.text-left { text-align: left; }
.section-sub { font-size: 1rem; color: #94a3b8; max-width: 560px; margin: 0 auto; line-height: 1.7; }
.section-sub.text-left { text-align: left; margin: 0; }

/* ===== FEATURES ===== */
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.feat-card {
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; padding: 26px;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}
.feat-card:hover { border-color: rgba(59,130,246,0.3); transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,0,0,0.3); }
.feat-large { grid-column: span 2; }
.feat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
.icon-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
.icon-green { background: rgba(34,197,94,0.15); color: #4ade80; }
.icon-purple { background: rgba(139,92,246,0.15); color: #a78bfa; }
.icon-orange { background: rgba(249,115,22,0.15); color: #fb923c; }
.icon-cyan { background: rgba(6,182,212,0.15); color: #22d3ee; }
.icon-pink { background: rgba(236,72,153,0.15); color: #f472b6; }
.feat-card h3 { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 10px; letter-spacing: -0.2px; }
.feat-card p { font-size: 0.875rem; color: #94a3b8; line-height: 1.65; }
.algo-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 20px; }
.algo-step {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px; padding: 9px 13px; font-size: 0.84rem; color: #cbd5e1;
}
.algo-step.step-success { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); color: #4ade80; }
.step-n {
  width: 22px; height: 22px; background: rgba(59,130,246,0.2); color: #60a5fa;
  font-size: 0.7rem; font-weight: 800; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.algo-step.step-success .step-n { background: rgba(34,197,94,0.2); color: #4ade80; }

/* ===== STEPS ===== */
.steps-flow { display: flex; align-items: flex-start; }
.step-item { flex: 1; text-align: center; padding: 0 14px; }
.step-icon-wrap { position: relative; display: inline-block; margin-bottom: 18px; }
.step-num-badge {
  position: absolute; top: -8px; right: -8px;
  width: 22px; height: 22px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff; font-size: 0.65rem; font-weight: 800; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; z-index: 1;
}
.step-icon {
  width: 70px; height: 70px;
  background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.25);
  border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #60a5fa;
  box-shadow: 0 0 20px rgba(59,130,246,0.1);
}
.step-item h3 { font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
.step-item p { font-size: 0.83rem; color: #94a3b8; line-height: 1.6; }
.step-connector { display: flex; flex-direction: column; align-items: center; padding-top: 26px; min-width: 36px; }
.conn-line { width: 28px; height: 1px; background: linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3)); }
.conn-arrow { font-size: 0.78rem; color: #3b82f6; margin-top: 3px; }

/* ===== ROLES ===== */
.roles-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.role-card {
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; padding: 26px; position: relative; overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.role-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.role-admin::before { background: linear-gradient(90deg, #ef4444, #f97316); }
.role-manager::before { background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
.role-viewer::before { background: linear-gradient(90deg, #22c55e, #06b6d4); }
.role-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.3); }
.role-badge {
  display: inline-flex; font-size: 0.7rem; font-weight: 700;
  padding: 3px 10px; border-radius: 100px; margin-bottom: 14px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.badge-red { background: rgba(239,68,68,0.15); color: #f87171; }
.badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
.badge-green { background: rgba(34,197,94,0.15); color: #4ade80; }
.badge-yellow { background: rgba(234,179,8,0.15); color: #facc15; }
.role-icon { width: 50px; height: 50px; border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.ricon-red { background: rgba(239,68,68,0.1); color: #f87171; }
.ricon-blue { background: rgba(59,130,246,0.1); color: #60a5fa; }
.ricon-green { background: rgba(34,197,94,0.1); color: #4ade80; }
.ricon-yellow { background: rgba(234,179,8,0.1); color: #facc15; }
.role-seller::before { background: linear-gradient(90deg, #22c55e, #10b981); }
.roles-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.role-card h3 { font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
.role-card p { font-size: 0.84rem; color: #94a3b8; line-height: 1.6; margin-bottom: 18px; }
.role-perms { display: flex; flex-direction: column; gap: 5px; list-style: none; }
.role-perms li { font-size: 0.82rem; color: #cbd5e1; }
.role-perms li.perm-no { color: #64748b; }

/* ===== INTEGRACIONES ===== */
.integrations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 48px;
}
.integration-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 16px 18px;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.integration-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-2px);
}
.int-card-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.int-card-info {
  display: flex; flex-direction: column; flex: 1; min-width: 0;
}
.int-card-info strong { font-size: 0.9rem; color: #f1f5f9; font-weight: 600; }
.int-card-info span { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
.int-card-badge {
  font-size: 0.65rem; font-weight: 700; padding: 3px 8px;
  border-radius: 99px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.05em;
}
.badge-native { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
.badge-webhook { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }

.integration-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.int-steps { display: flex; flex-direction: column; gap: 18px; }
.int-step { display: flex; gap: 14px; align-items: flex-start; }
.int-num {
  width: 30px; height: 30px; background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff; font-size: 0.82rem; font-weight: 800; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;
}
.int-step strong { font-size: 0.93rem; color: #e2e8f0; display: block; margin-bottom: 3px; }
.int-step p { font-size: 0.83rem; color: #94a3b8; line-height: 1.6; }
.int-visual { display: flex; flex-direction: column; gap: 10px; }
.wh-card { background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 13px; overflow: hidden; }
.wh-header {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 15px; border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.76rem; color: #94a3b8;
}
.wh-dot { width: 7px; height: 7px; border-radius: 50%; }
.wh-dot.green { background: #22c55e; }
.wh-dot.blue { background: #3b82f6; }
.wh-badge { margin-left: auto; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
.wh-badge.post { background: rgba(34,197,94,0.15); color: #4ade80; }
.wh-badge.webhook { background: rgba(59,130,246,0.15); color: #60a5fa; }
.wh-json { padding: 13px 15px; font-family: 'SF Mono','Fira Code',monospace; font-size: 0.75rem; line-height: 1.7; overflow-x: auto; }
.j-key { color: #a78bfa; }
.j-c { color: #64748b; }
.j-s { color: #4ade80; }
.wh-arrow { display: flex; flex-direction: column; align-items: center; gap: 3px; color: #3b82f6; font-size: 0.76rem; font-weight: 600; }

/* ===== COMPARISON ===== */
.comparison-table-wrapper {
  background: rgba(15,23,42,0.8);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  max-width: 900px;
  margin: 0 auto;
}
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.comparison-table th {
  padding: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.feat-col { color: #94a3b8; }
.crm-col { text-align: center; background: rgba(255,255,255,0.02); color: #cbd5e1; }
.ld-col { text-align: center; background: rgba(59,130,246,0.05); color: #60a5fa; }

.comparison-table td {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 0.95rem;
}
.feat-name { font-weight: 500; color: #e2e8f0; }
.crm-val, .ld-val { text-align: center; }
.crm-val { background: rgba(255,255,255,0.02); }
.ld-val { background: rgba(59,130,246,0.05); font-weight: 700; }

.icon-check { color: #22c55e; font-size: 1.2rem; }
.icon-cross { color: #ef4444; font-size: 1.2rem; opacity: 0.5; }
.val-text { font-size: 0.85rem; }

.comparison-footer { text-align: center; margin-top: 32px; }
.comparison-footer p { font-size: 0.9rem; color: #64748b; font-weight: 500; }


/* ===== PRICING ===== */
.pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 820px; margin: 0 auto; }
.pricing-card {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px; padding: 40px 32px;
  position: relative; display: flex; flex-direction: column; gap: 24px;
}
.pricing-main { border-color: #6366f1; box-shadow: 0 8px 32px rgba(99,102,241,0.2); }
.pricing-popular { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 16px; border-radius: 99px; white-space: nowrap; letter-spacing: 0.04em; }
.pricing-optional { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #64748b; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 16px; border-radius: 99px; white-space: nowrap; letter-spacing: 0.04em; }
.pricing-name { font-size: 1.25rem; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-top: 8px; }
.pricing-price { display: flex; align-items: baseline; gap: 4px; }
.price-currency { font-size: 1.1rem; font-weight: 700; color: #6366f1; }
.price-amount { font-size: 2.4rem; font-weight: 800; color: #fff; line-height: 1; word-break: break-all; }
.price-period { font-size: 0.95rem; color: #94a3b8; font-weight: 500; }
.pricing-desc { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }
.pricing-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.pricing-features li { font-size: 0.88rem; color: #cbd5e1; display: flex; align-items: center; gap: 8px; }
.pricing-features li::before { content: none; }
.btn-full { width: 100%; justify-content: center; text-align: center; display: flex; align-items: center; padding: 13px 20px; border-radius: 10px; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: all 0.2s; }
.pricing-main .btn-full { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
.pricing-main .btn-full:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.45); transform: translateY(-1px); }
.pricing-addon .btn-full { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); }
.pricing-addon .btn-full:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.4); }
.currency-toggle { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.05); border-radius: 8px; padding: 3px; }
.dark .currency-toggle { background: rgba(255,255,255,0.07); }
.flag-btn { background: transparent; border: none; cursor: pointer; font-size: 1.25rem; width: 34px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; opacity: 0.45; }
.flag-btn.active { background: #fff; opacity: 1; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
.dark .flag-btn.active { background: #334155; }
.pricing-note { text-align: center; color: #cbd5e1; font-size: 0.85rem; margin-top: 28px; }
@media (max-width: 640px) {
  .pricing-grid { grid-template-columns: 1fr; }
}

/* ===== CTA ===== */
.cta-section { padding: 96px 0; position: relative; overflow: hidden; }
.cta-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 700px; height: 400px;
  background: radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%);
  pointer-events: none;
}
.cta-box { max-width: 580px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
.cta-title { font-size: clamp(2rem,5vw,3.2rem); font-weight: 900; letter-spacing: -2px; color: #fff; margin: 18px 0 14px; }
.cta-sub { font-size: 1rem; color: #94a3b8; line-height: 1.7; margin-bottom: 34px; }
.cta-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.cta-feats { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; font-size: 0.8rem; color: #64748b; font-weight: 500; }
.btn-whatsapp {
  display: inline-flex; align-items: center; gap: 10px;
  background: #25d366; color: #fff;
  font-weight: 700; font-size: 1rem;
  padding: 15px 32px; border-radius: 12px;
  box-shadow: 0 4px 24px rgba(37,211,102,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
}
.btn-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(37,211,102,0.55); }
/* Floating WhatsApp */
.wa-float {
  position: fixed; bottom: 28px; right: 28px; z-index: 200;
  display: flex; align-items: center; gap: 10px;
  background: #25d366; color: #fff;
  padding: 13px 20px 13px 16px;
  border-radius: 100px;
  box-shadow: 0 6px 28px rgba(37,211,102,0.45);
  font-weight: 700; font-size: 0.88rem;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: wa-pop 0.4s ease 1s both;
}
.wa-float:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 12px 36px rgba(37,211,102,0.55); }
.wa-label { white-space: nowrap; }
@keyframes wa-pop { from { opacity:0; transform: translateY(20px) scale(0.9); } to { opacity:1; transform: translateY(0) scale(1); } }

/* ===== FOOTER ===== */
.landing-footer { padding: 48px 0 24px; border-top: 1px solid rgba(255,255,255,0.06); }
.footer-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 48px; margin-bottom: 40px; flex-wrap: wrap; }
.footer-brand p { font-size: 0.84rem; color: #64748b; margin-top: 12px; line-height: 1.6; max-width: 260px; }
.footer-links { display: flex; gap: 48px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.fcol-title { font-size: 0.75rem; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.footer-col a { font-size: 0.84rem; color: #64748b; transition: color 0.2s; cursor: pointer; }
.footer-col a:hover { color: #94a3b8; }
.footer-link-btn { font-size: 0.84rem; color: #64748b; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.2s; }
.footer-link-btn:hover { color: #94a3b8; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; font-size: 0.78rem; color: #475569; text-align: center; }
.footer-inline-link { background: none; border: none; cursor: pointer; color: #475569; font-size: 0.78rem; padding: 0; transition: color 0.2s; }
.footer-inline-link:hover { color: #94a3b8; }

/* ===== HERO TRUST BAR ===== */
.hero-trust {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px 10px;
  margin-top: 20px; margin-bottom: 8px;
}
.hero-trust span {
  font-size: 0.8rem; color: #94a3b8; font-weight: 500; white-space: nowrap;
}
.trust-sep { color: #334155; font-size: 0.75rem; }

/* ===== FAQ ===== */
.faq-list { max-width: 740px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.faq-item {
  background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
  overflow: hidden; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
}
.faq-item:hover { border-color: #6366f1; box-shadow: 0 4px 16px rgba(99,102,241,0.15); }
.faq-open { border-color: #6366f1 !important; box-shadow: 0 4px 16px rgba(99,102,241,0.2) !important; }
.faq-question {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; gap: 16px;
  font-size: 0.95rem; font-weight: 600; color: #fff;
  user-select: none;
}
.faq-chevron {
  flex-shrink: 0; color: #6366f1;
  transition: transform 0.3s ease;
}
.faq-open .faq-chevron { transform: rotate(180deg); }
.faq-answer {
  max-height: 0; overflow: hidden;
  transition: max-height 0.35s ease, padding 0.3s ease;
  padding: 0 24px;
}
.faq-open .faq-answer { max-height: 200px; padding: 0 24px 20px; }
.faq-answer p {
  margin: 0; font-size: 0.88rem; color: #94a3b8; line-height: 1.7;
  border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero { flex-direction: column; text-align: left; padding-bottom: 60px; }
  .hero-content { max-width: 100%; text-align: left; }
  .hero-actions { justify-content: flex-start; }
  .hero-stats { justify-content: center; }
  .hero-visual { justify-content: center; }
  .integrations-grid { grid-template-columns: 1fr 1fr; }
  .integration-layout { grid-template-columns: 1fr; }
  .section-title.text-left,.section-sub.text-left { text-align: left; }
}
@media (max-width: 768px) {
  .nav-links, .btn-nav, .currency-toggle { display: none; }
  .mobile-menu .btn-nav { display: block; }
  .nav-mobile-right { display: flex; }
  .hamburger { display: flex; }
  .features-grid { grid-template-columns: 1fr; }
  .feat-large { grid-column: span 1; }
  .roles-grid { grid-template-columns: 1fr; }
  .steps-flow { flex-direction: column; align-items: center; gap: 24px; }
  .step-connector { display: none; }
  .dashboard-card { width: min(300px, 90vw); margin: 0 auto; }
  .integrations-grid { grid-template-columns: 1fr; }
}

/* ===== AVAILABILITY TABLE ===== */
.availability-table-wrapper {
  margin-top: 40px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.availability-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.availability-table th, .availability-table td {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.availability-table th {
  background: rgba(255, 255, 255, 0.02);
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.availability-table tr:last-child td { border-bottom: none; }
.region-name { 
  width: 200px; 
  color: #f1f5f9; 
  font-size: 1rem;
  white-space: nowrap;
}
.countries-list {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .availability-table th, .availability-table td { padding: 16px; }
  .region-name { width: auto; font-size: 0.9rem; }
  .countries-list { font-size: 0.85rem; }
}
</style>
