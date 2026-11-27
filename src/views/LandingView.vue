<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import PixelAgent from '../components/dashboard/PixelAgent.vue'

const { t, tm, rt, locale } = useI18n()
const authStore = useAuthStore()
const uiStore = useUiStore()
const crmNames = ['GoHighLevel', 'HubSpot', 'monday.com', 'Kommo', 'Clientify', 'Make', 'Zapier']

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
    { property: 'og:site_name', content: 'LeadDistro' },
    { property: 'og:locale', content: () => ({ es: 'es_ES', 'pt-BR': 'pt_BR', en: 'en_US' }[locale.value] || 'en_US') },
    { property: 'og:url', content: 'https://www.leaddistro.site/landing' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: () => t('meta.ogTitle') },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
    { property: 'og:image', content: 'https://res.cloudinary.com/dazfmv5ls/image/upload/b_rgb:0f172a,c_pad,w_1200,h_630/v1775877205/Gemini_Generated_Image_66tv5366tv5366tv-removebg-preview_cdwhmv.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: () => t('meta.ogTitle') },
    { name: 'twitter:description', content: () => t('meta.ogDescription') },
    { name: 'twitter:image', content: 'https://res.cloudinary.com/dazfmv5ls/image/upload/b_rgb:0f172a,c_pad,w_1200,h_630/v1775877205/Gemini_Generated_Image_66tv5366tv5366tv-removebg-preview_cdwhmv.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://www.leaddistro.site/landing' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "LeadDistro",
        "url": "https://www.leaddistro.site/",
        "logo": "https://www.leaddistro.site/logo_leaddistro.png",
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "25.00",
          "priceCurrency": "USD",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "25.00",
            "priceCurrency": "USD",
            "unitText": "month"
          }
        },
        "description": t('meta.schemaDescription'),
        "featureList": "Automatic lead distribution, HubSpot integration, GoHighLevel integration, monday.com automation, Limits per sales rep, Percentage-based team management",
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
      innerHTML: () => JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.leaddistro.site/#organization",
            "name": "LeadDistro",
            "url": "https://www.leaddistro.site/",
            "logo": { "@type": "ImageObject", "url": "https://www.leaddistro.site/favicon-192.png", "width": 192, "height": 192 }
          },
          {
            "@type": "WebSite",
            "@id": "https://www.leaddistro.site/#website",
            "url": "https://www.leaddistro.site/",
            "name": "LeadDistro",
            "inLanguage": locale.value,
            "publisher": { "@id": "https://www.leaddistro.site/#organization" }
          }
        ]
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
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
  { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
  { code: 'pt-BR', label: 'Português', flag: 'https://flagcdn.com/w40/br.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' }
]

const getLangData = (code) => languages.find(l => l.code === code) || languages[0]

// --- Mockup Animations Logic ---
const dashboardSellers = ref([
  { name: 'Karla Perez', team: 'Team CH', initials: 'KP', color: '#C8F23A', pct: 72, count: 43, limit: 60 },
  { name: 'Christopher Valles', team: 'Team US', initials: 'CV', color: '#7DD3FC', pct: 35, count: 32, limit: 90 },
  { name: 'Adrian Anez', team: 'Team ES', initials: 'AA', color: '#FDBA74', pct: 66, count: 40, limit: 60 }
])

const currentAssignmentIndex = ref(0)
const nextSeller = computed(() => dashboardSellers.value[currentAssignmentIndex.value])
const isAssigning = ref(false)
const hitIndex = ref(-1)

// KPIs: arrancan con el valor final (para el HTML prerenderizado) y al montar cuentan desde 0
const KPI_TARGET = { leads: 247, sellers: 12, assigned: 96 }
const kpis = ref({ ...KPI_TARGET })
let kpiRaf = null
let kpisExtra = 0

const animateKpis = () => {
  const start = performance.now()
  const dur = 1600
  const tick = (now) => {
    const k = Math.min(1, (now - start) / dur)
    const e = 1 - Math.pow(1 - k, 3)
    kpis.value = {
      leads: Math.round(KPI_TARGET.leads * e) + (k === 1 ? kpisExtra : 0),
      sellers: Math.round(KPI_TARGET.sellers * e),
      assigned: Math.round(KPI_TARGET.assigned * e)
    }
    if (k < 1) kpiRaf = requestAnimationFrame(tick)
  }
  kpiRaf = requestAnimationFrame(tick)
}

// Feed de leads entrando en vivo
const incomingLeads = [
  { lead: 'María G.', source: 'Facebook Ads' },
  { lead: 'Lucas R.', source: 'Instagram' },
  { lead: 'Sofía M.', source: 'Referral' },
  { lead: 'Diego P.', source: 'Landing' },
  { lead: 'Valentina C.', source: 'Facebook Ads' },
  { lead: 'Martín S.', source: 'Google Ads' }
]
const feed = ref([])
let feedId = 0
let leadCursor = 0

const rotateAssignment = () => {
  isAssigning.value = true
  const idx = currentAssignmentIndex.value
  const seller = dashboardSellers.value[idx]

  setTimeout(() => {
    // El lead se asigna: sube el contador del vendedor, su barra y el total
    if (seller.count < seller.limit) seller.count++
    hitIndex.value = idx
    kpisExtra++
    kpis.value = { ...kpis.value, leads: KPI_TARGET.leads + kpisExtra }

    const l = incomingLeads[leadCursor++ % incomingLeads.length]
    feed.value = [{ id: ++feedId, lead: l.lead, source: l.source, seller: seller.name.split(' ')[0], team: seller.team }, ...feed.value].slice(0, 3)

    currentAssignmentIndex.value = (idx + 1) % dashboardSellers.value.length
    isAssigning.value = false
    setTimeout(() => { hitIndex.value = -1 }, 700)
  }, 450)
}

let rotationInterval = null

// --- Demo animada de la Oficina en Vivo (sección Presencia) ---
const OFFICE_GRADIENTS = [['#C8F23A', '#84CC16'], ['#7DD3FC', '#38BDF8'], ['#FDBA74', '#F97316'], ['#F9A8D4', '#EC4899']]
const OFFICE_STATUS_COLOR = { active: '#84CC16', idle: '#F59E0B', away: '#38BDF8', offline: '#8A918A' }
const OFFICE_ORDER = { active: 0, idle: 1, away: 2, offline: 3 }
const officeDemo = ref([
  { name: 'Karla Pérez', team: 'Team CH', status: 'active', leads: 9, sales: 5, g: 0 },
  { name: 'Christopher Vallés', team: 'Team US', status: 'idle', leads: 6, sales: 3, g: 1 },
  { name: 'Adrián Ávalos', team: 'Team ES', status: 'away', leads: 4, sales: 1, g: 2 },
  { name: 'Luis Rodríguez', team: 'Team CH', status: 'offline', leads: 0, sales: 2, g: 3 }
])
const officeSorted = computed(() =>
  [...officeDemo.value].sort((a, b) => OFFICE_ORDER[a.status] - OFFICE_ORDER[b.status])
)
const officeCount = (st) => officeDemo.value.filter(a => a.status === st).length
const officeColor = (st) => OFFICE_STATUS_COLOR[st]
const officeScene = (a) => {
  const [c1, c2] = OFFICE_GRADIENTS[a.g]
  return a.status === 'offline'
    ? { background: 'linear-gradient(160deg, rgba(138,145,138,0.2), rgba(138,145,138,0.06))' }
    : { background: `radial-gradient(120% 90% at 50% 0%, ${c1}55, transparent 70%), linear-gradient(160deg, ${c2}33, ${c2}0D)` }
}
// Guion de cambios de estado: se repite en loop para mostrar la oficina "viva"
const OFFICE_SCRIPT = [[1, 'active'], [0, 'idle'], [3, 'active'], [2, 'active'], [1, 'idle'], [3, 'offline'], [0, 'active'], [2, 'away']]
let officeStep = 0
let officeInterval = null
const tickOffice = () => {
  const [i, st] = OFFICE_SCRIPT[officeStep++ % OFFICE_SCRIPT.length]
  const agent = officeDemo.value[i]
  agent.status = st
  if (st === 'active') agent.leads++
  officeDemo.value.forEach(a => { if (a !== agent && a.status === 'active') a.leads++ })
  // Tope para que la demo no muestre números irreales si la página queda abierta mucho rato
  officeDemo.value.forEach((a, i) => { if (a.leads > 24) a.leads = [9, 6, 4, 0][i] })
}

// --- Scroll Reveal Logic ---
const setupRevealObserver = () => {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  document.querySelectorAll('.reveal').forEach(el => {
    revealObs.observe(el)
  })
  
  return revealObs
}

let revealObserver = null

// --- Hero Interaction Logic ---
const heroRef = ref(null)
const cardRef = ref(null)

const handleGlobalMouseMove = (e) => {
  const root = document.querySelector('.landing-root')
  if (!root) return
  
  const rect = root.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  root.style.setProperty('--mouse-x', `${x}px`)
  root.style.setProperty('--mouse-y', `${y}px`)
}

onMounted(() => {
  setupObserver()
  revealObserver = setupRevealObserver()
  document.documentElement.style.scrollBehavior = 'smooth'
  
  // Mockup del hero: contadores y feed en vivo (sin movimiento si el usuario lo desactivó)
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    kpis.value = { leads: 0, sellers: 0, assigned: 0 }
    animateKpis()
    setTimeout(rotateAssignment, 1800)
    rotationInterval = setInterval(rotateAssignment, 3200)
    officeInterval = setInterval(tickOffice, 2800)
  }
})
onUnmounted(() => {
  if (observer) observer.disconnect()
  if (revealObserver) revealObserver.disconnect()
  if (rotationInterval) clearInterval(rotationInterval)
  if (officeInterval) clearInterval(officeInterval)
  if (kpiRaf) cancelAnimationFrame(kpiRaf)
  document.documentElement.style.scrollBehavior = ''
})
</script>

<template>
  <div class="landing-root" @mousemove="handleGlobalMouseMove">
    <!-- Sentinel for scroll detection -->
    <div ref="sentinel" class="scroll-sentinel"></div>

    <!-- NAV -->
    <nav :class="['landing-nav', { 'nav-scrolled': scrolled }]">
      <div class="nav-inner">
        <a href="#" class="logo">
          <img src="/logo_leaddistro.png" alt="LeadDistro Logo" class="h-14 ld-logo ld-logo-dark" /><img src="/logo_leaddistro_light.png" alt="LeadDistro Logo" class="h-14 ld-logo-light" />
        </a>
        <ul class="nav-links">
          <li><a href="#features">{{ t('nav.features') }}</a></li>
          <li><a href="#how">{{ t('nav.howItWorks') }}</a></li>
          <li><a href="#pricing">{{ t('nav.pricing') }}</a></li>
          <li><a href="#faq">{{ t('nav.faq') }}</a></li>
          <li><a href="/blog" target="_blank">{{ t('nav.blog') || 'Blog' }}</a></li>
        </ul>
        <button v-if="!authStore.isAuthenticated" @click="router.push('/login')" class="btn-nav">{{ t('nav.login') }} →</button>
        <button v-else @click="router.push('/')" class="btn-nav !px-3 !py-1.5 flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
            {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <span class="truncate max-w-[100px]">{{ authStore.user?.name?.split(' ')[0] || 'Dashboard' }}</span> →
        </button>

        <!-- Theme toggle (claro / oscuro) -->
        <button @click="uiStore.toggleDarkMode()" class="theme-toggle-nav ml-2" :aria-label="t('landing.themeToggle')" :title="t('landing.themeToggle')">
          <svg class="ic-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg class="ic-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        </button>

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
        <a href="/blog" target="_blank" @click="menuOpen = false">{{ t('nav.blog') || 'Blog' }}</a>
        <button v-if="!authStore.isAuthenticated" @click="router.push('/login'); menuOpen = false" class="btn-nav mobile-cta">{{ t('nav.login') }} →</button>
        <button v-else @click="router.push('/'); menuOpen = false" class="btn-nav mobile-cta flex items-center justify-center gap-2">
          <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
            {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          {{ authStore.user?.name?.split(' ')[0] || 'Dashboard' }} →
        </button>
      </div>
    </nav>

    <!-- HERO -->
    <section 
      class="hero" 
      id="top" 
      ref="heroRef" 
    >
      <div class="hero-spotlight"></div>
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
        <div class="hero-glow"></div>

        <div class="float-badge fb-top">
          <span class="fb-ic">⚡</span>
          <span>{{ t('landing.hero.badgeFast') }}</span>
        </div>
        <div class="float-badge fb-bottom">
          <span class="fb-ic ok">✓</span>
          <span>{{ t('landing.hero.badgeSaved') }}</span>
        </div>

        <div class="dashboard-card" ref="cardRef">
          <div class="card-header">
            <div class="card-dots">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            </div>
            <span class="card-title">Dashboard LeadDistro</span>
            <span class="card-live"><span class="live-dot"></span>LIVE</span>
          </div>
          <div class="card-body">
            <div class="mini-kpis">
              <div class="mini-kpi blue"><span class="kpi-val">{{ kpis.leads }}</span><span class="kpi-lbl">{{ t('leads.total') }}</span></div>
              <div class="mini-kpi emerald"><span class="kpi-val">{{ kpis.sellers }}</span><span class="kpi-lbl">{{ t('sellers.title') }}</span></div>
              <div class="mini-kpi purple"><span class="kpi-val">{{ kpis.assigned }}%</span><span class="kpi-lbl">{{ t('leads.status.assigned') }}</span></div>
            </div>

            <div class="mini-sellers">
              <div class="mini-seller" v-for="(s, i) in dashboardSellers" :key="s.name" :class="{ 'is-hit': hitIndex === i }">
                <div class="s-avatar" :style="{ background: s.color }">{{ s.initials }}</div>
                <div class="s-info">
                  <div class="s-top">
                    <span class="s-name">{{ s.name }}</span>
                    <span class="s-count"><b>{{ s.count }}</b>/{{ s.limit }}</span>
                  </div>
                  <div class="s-bar"><div class="s-fill" :style="{ width: Math.round(s.count / s.limit * 100) + '%', background: s.color }"></div></div>
                </div>
              </div>
            </div>

            <TransitionGroup name="feed" tag="div" class="mini-feed">
              <div class="feed-item" v-for="f in feed" :key="f.id">
                <span class="feed-dot"></span>
                <span class="feed-txt"><b>{{ f.lead }}</b> · {{ f.source }}</span>
                <span class="feed-arrow">→</span>
                <span class="feed-to">{{ f.seller }}</span>
                <span class="feed-team">{{ f.team }}</span>
              </div>
            </TransitionGroup>

            <div class="mini-next" :class="{ 'is-assigning': isAssigning }">
              <span class="next-lbl">{{ t('main.nextAssignment') }} →</span>
              <span class="next-val">{{ nextSeller.team }} · {{ nextSeller.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CRM BAR -->
    <div class="crm-bar">
      <div class="crm-bar-inner">
        <span class="crm-bar-label">{{ t('landing.crmBar') }}</span>
        <span class="crm-bar-name" v-for="crm in crmNames" :key="crm">{{ crm }}</span>
      </div>
    </div>

    <!-- FEATURES -->
    <section class="section reveal" id="features">
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

    <!-- CRM PROPIO (pipeline + nuevas fuentes de leads) -->
    <section class="section reveal ldcrm-section" id="crm">
      <div class="ldcrm-glow"></div>
      <div class="container">
        <div class="ldcrm-grid">
          <div class="ldcrm-text">
            <div class="section-tag">{{ t('landing.crm.tag') }}</div>
            <h2 class="section-title text-left">{{ t('landing.crm.title') }} <span class="ldcrm-accent">{{ t('landing.crm.titleAccent') }}</span></h2>
            <p class="section-sub text-left">{{ t('landing.crm.subtitle') }}</p>
            <ul class="ldcrm-points">
              <li>
                <span class="ldcrm-pi"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/></svg></span>
                <div><h4>{{ t('landing.crm.p1t') }}</h4><p>{{ t('landing.crm.p1d') }}</p></div>
              </li>
              <li>
                <span class="ldcrm-pi"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
                <div><h4>{{ t('landing.crm.p2t') }}</h4><p>{{ t('landing.crm.p2d') }}</p></div>
              </li>
              <li>
                <span class="ldcrm-pi"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg></span>
                <div><h4>{{ t('landing.crm.p3t') }}</h4><p>{{ t('landing.crm.p3d') }}</p></div>
              </li>
            </ul>
            <div class="ldcrm-cta">
              <button @click="router.push('/register')" class="btn-primary">
                {{ t('landing.crm.cta') }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <span class="ldcrm-note">{{ t('landing.crm.ctaNote') }}</span>
            </div>
          </div>

          <!-- Tablero de ejemplo (datos ficticios) -->
          <div class="ldcrm-board" aria-hidden="true">
            <div class="ldcrm-board-top">
              <b>{{ t('landing.crm.board.title') }}</b>
              <div class="ldcrm-chips"><span class="ldcrm-chip on">{{ t('landing.crm.board.all') }}</span><span class="ldcrm-chip">Karla P.</span><span class="ldcrm-chip">Adrián A.</span></div>
            </div>
            <div class="ldcrm-cols">
              <div class="ldcrm-col">
                <div class="ldcrm-col-h">{{ t('landing.crm.board.col1') }} <span>3</span></div>
                <div class="ldcrm-card"><div class="n">Sofía Medina</div><div class="m">{{ t('landing.crm.src.form') }}</div><div class="r"><span class="ldcrm-av"><i></i>Karla P.</span><span class="ldcrm-wa"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg></span></div></div>
                <div class="ldcrm-card"><div class="n">Martín Gómez</div><div class="m">{{ t('landing.crm.src.crm') }}</div><div class="r"><span class="ldcrm-av"><i></i>Adrián A.</span><span class="ldcrm-wa"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg></span></div></div>
                <div class="ldcrm-card"><div class="n">Lucía Herrera</div><div class="m">{{ t('landing.crm.src.manual') }}</div><div class="r"><span class="ldcrm-unassigned">{{ t('landing.crm.board.unassigned') }}</span><span class="ldcrm-wa"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg></span></div></div>
              </div>
              <div class="ldcrm-col">
                <div class="ldcrm-col-h">{{ t('landing.crm.board.col2') }} <span>2</span></div>
                <div class="ldcrm-card ldcrm-drag"><div class="n">Diego Paredes</div><div class="m">{{ t('landing.crm.src.csv') }}</div><div class="r"><span class="ldcrm-av"><i></i>Karla P.</span><span class="ldcrm-val">USD 1.200</span></div></div>
                <div class="ldcrm-card"><div class="n">Camila Ruiz</div><div class="m">{{ t('landing.crm.src.crm') }}</div><div class="r"><span class="ldcrm-av"><i></i>Adrián A.</span><span class="ldcrm-val">USD 800</span></div></div>
                <div class="ldcrm-sum">{{ t('landing.crm.board.total') }}: USD 2.000</div>
              </div>
              <div class="ldcrm-col">
                <div class="ldcrm-col-h">{{ t('landing.crm.board.col3') }} <span>2</span></div>
                <div class="ldcrm-card"><div class="n">Pablo Sosa</div><div class="m">{{ t('landing.crm.src.form') }}</div><div class="r"><span class="ldcrm-av"><i></i>Karla P.</span><span class="ldcrm-val">USD 1.500</span></div></div>
                <div class="ldcrm-card"><div class="n">Ana Torres</div><div class="m">{{ t('landing.crm.src.crm') }}</div><div class="r"><span class="ldcrm-av"><i></i>Adrián A.</span><span class="ldcrm-val">USD 650</span></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="ldcrm-mini">
          <div class="feat-card">
            <div class="feat-icon icon-green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/></svg></div>
            <h3>{{ t('landing.crm.m1t') }}</h3>
            <p>{{ t('landing.crm.m1d') }}</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon icon-green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/></svg></div>
            <h3>{{ t('landing.crm.m2t') }}</h3>
            <p>{{ t('landing.crm.m2d') }}</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon icon-green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg></div>
            <h3>{{ t('landing.crm.m3t') }}</h3>
            <p>{{ t('landing.crm.m3d') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- GIFT CARD + CAMPAÑA ÚNICA -->
    <section class="section reveal" id="extras">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.extras.tag') }}</div>
          <h2 class="section-title">{{ t('landing.extras.title') }}</h2>
          <p class="section-sub">{{ t('landing.extras.subtitle') }}</p>
        </div>
        <div class="extras-grid">
          <div class="feat-card extras-card">
            <div class="feat-icon icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <h3>{{ t('landing.extras.g.title') }}</h3>
            <p>{{ t('landing.extras.g.desc') }}</p>
            <ul class="extras-list">
              <li v-for="n in 4" :key="n">{{ t('landing.extras.g.p' + n) }}</li>
            </ul>
          </div>
          <div class="feat-card extras-card">
            <div class="feat-icon icon-pink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
            </div>
            <h3>{{ t('landing.extras.c.title') }}</h3>
            <p>{{ t('landing.extras.c.desc') }}</p>
            <ul class="extras-list">
              <li v-for="n in 4" :key="n">{{ t('landing.extras.c.p' + n) }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section section-dark reveal" id="how">
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

    <!-- PRESENCE FEATURE (REFINED) -->
    <section class="section section-presence overflow-hidden reveal">
      <!-- Background Atmospheric Glow -->
      <div class="presence-bg-glow"></div>
      
      <div class="container">
        <div class="presence-layout">
          <div class="presence-text" data-aos="fade-right">
            <div class="section-tag">{{ t('landing.presence.tag') }}</div>
            <h2 class="section-title text-left">{{ t('landing.presence.title') }}</h2>
            <p class="section-sub text-left" style="margin: 0 0 32px">{{ t('landing.presence.subtitle') }}</p>
            
            <ul class="presence-list">
              <li>
                <div class="p-list-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <span>{{ t('landing.presence.feature1') }}</span>
              </li>
              <li>
                <div class="p-list-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <span>{{ t('landing.presence.feature2') }}</span>
              </li>
              <li>
                <div class="p-list-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <span>{{ t('landing.presence.feature3') }}</span>
              </li>
            </ul>

            <button @click="router.push('/register')" class="btn-primary" style="margin-top: 32px">
              {{ t('landing.cta.cta') }} →
            </button>
          </div>
          <div class="presence-visual" data-aos="fade-left">
            <div class="presence-browser-frame">
              <div class="browser-header">
                <div class="browser-dots">
                  <span class="dot-red"></span>
                  <span class="dot-yellow"></span>
                  <span class="dot-green"></span>
                </div>
                <div class="browser-address">leaddistro.com/oficina-en-vivo</div>
              </div>
              <div class="presence-mockup-wrap office-demo">
                <div class="od-head">
                  <span class="od-title">{{ t('presence.title') }}</span>
                  <div class="od-legend">
                    <span v-for="st in ['active', 'idle', 'away', 'offline']" :key="st" class="od-legend-item" :title="t('presence.status.' + st)">
                      <i :style="{ backgroundColor: officeColor(st) }"></i>{{ officeCount(st) }}
                    </span>
                  </div>
                </div>
                <TransitionGroup name="od" tag="div" class="od-grid">
                  <div v-for="a in officeSorted" :key="a.name" class="od-card" :class="'is-' + a.status">
                    <div class="od-scene" :style="officeScene(a)">
                      <PixelAgent :status="a.status" :color="OFFICE_GRADIENTS[a.g][1]" :id="a.name" />
                      <span class="od-dot" :class="{ 'is-pulse': a.status === 'active' }" :style="{ backgroundColor: officeColor(a.status) }"></span>
                    </div>
                    <div class="od-info">
                      <b class="od-name">{{ a.name }}</b>
                      <span class="od-pill" :style="{ '--c': officeColor(a.status) }"><i></i>{{ t('presence.status.' + a.status) }}</span>
                      <div class="od-stats">
                        <span><small>{{ t('presence.stats.leadsToday') }}</small><strong>{{ a.leads }}</strong></span>
                        <span><small>{{ t('presence.stats.salesPeriod') }}</small><strong>{{ a.sales }}</strong></span>
                      </div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ROLES -->
    <section class="section reveal" id="roles">
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
    <section class="section section-dark reveal" id="integraciones">
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
              <div class="wh-flow-dot"></div>
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
    <section class="section section-dark reveal" id="comparativa">
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
                <td class="crm-val" :data-label="t('landing.comparison.headers.crm')">
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
                <td class="ld-val" :data-label="t('landing.comparison.headers.ld')">
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

    <!-- PRICING -->
    <section class="section reveal" id="pricing">
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
            <p class="pricing-trial">{{ t('landing.pricing.monthly.trialNote') }}</p>
            <p class="pricing-trial">
              <router-link to="/refund" class="pricing-refund">{{ t('landing.pricing.refundLink') }}</router-link>
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section reveal" id="faq">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">{{ t('landing.faq.tag') }}</div>
          <h2 class="section-title">{{ t('landing.faq.title') }}</h2>
          <p class="section-sub">{{ t('landing.faq.subtitle') }}</p>
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
    <section class="cta-section reveal">
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
              <img src="/logo_leaddistro.png" alt="LeadDistro Logo" class="h-12 ld-logo ld-logo-dark" /><img src="/logo_leaddistro_light.png" alt="LeadDistro Logo" class="h-12 ld-logo-light" />
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
              <a href="/blog" target="_blank">{{ t('nav.blog') || 'Blog' }}</a>
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
              <router-link to="/refund" class="footer-link-btn">{{ t('auth.refundPolicy') }}</router-link>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          {{ t('landing.footer.rights') }} ·
          <button @click="router.push('/privacy')" class="footer-inline-link">{{ t('nav.privacy') }}</button> ·
          <button @click="router.push('/terms')" class="footer-inline-link">{{ t('nav.terms') }}</button> ·
          <router-link to="/refund" class="footer-inline-link">{{ t('nav.refund') }}</router-link>
        </div>
      </div>
    </footer>
  </div>

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
          title: this.$rt(items.teams?.title),
          desc: this.$rt(items.teams?.desc),
          iconClass: 'icon-green',
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
        },
        {
          title: this.$rt(items.limits?.title),
          desc: this.$rt(items.limits?.desc),
          iconClass: 'icon-purple',
          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
        },
        {
          title: this.$rt(items.fallback?.title),
          desc: this.$rt(items.fallback?.desc),
          iconClass: 'icon-orange',
          icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
        },
        {
          title: this.$rt(items.metrics?.title),
          desc: this.$rt(items.metrics?.desc),
          iconClass: 'icon-cyan',
          icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
        },
        {
          title: this.$rt(items.presence?.title),
          desc: this.$rt(items.presence?.desc),
          iconClass: 'icon-purple',
          icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'
        },
        {
          title: this.$rt(items.aiScoring?.title || 'AI Scoring'),
          desc: this.$rt(items.aiScoring?.desc || 'Evaluación inteligente de leads con inteligencia artificial'),
          iconClass: 'icon-blue',
          icon: '<path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12l8-4"/><circle cx="12" cy="12" r="10"/>'
        }
      ]
    },
    steps() {
      const steps = this.$tm('landing.howItWorks.steps')
      return [
        {
          title: this.$rt(steps['1']?.title),
          desc: this.$rt(steps['1']?.desc),
          icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
        },
        {
          title: this.$rt(steps['2']?.title),
          desc: this.$rt(steps['2']?.desc),
          icon: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>'
        },
        {
          title: this.$rt(steps['3']?.title),
          desc: this.$rt(steps['3']?.desc),
          icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
        },
        {
          title: this.$rt(steps['4']?.title),
          desc: this.$rt(steps['4']?.desc),
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
          title: this.$rt(items.manager?.title),
          desc: this.$rt(items.manager?.desc),
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
          perms: items.manager?.perms?.map(p => this.$rt(p)) || []
        },
        {
          name: 'Viewer',
          class: 'role-viewer',
          badgeClass: 'badge-yellow',
          iconClass: 'ricon-yellow',
          title: this.$rt(items.viewer?.title),
          desc: this.$rt(items.viewer?.desc),
          icon: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
          perms: items.viewer?.perms?.map(p => this.$rt(p)) || []
        },
        {
          name: 'Seller',
          class: 'role-seller',
          badgeClass: 'badge-green',
          iconClass: 'ricon-green',
          title: this.$rt(items.seller?.title),
          desc: this.$rt(items.seller?.desc),
          icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
          perms: items.seller?.perms?.map(p => this.$rt(p)) || []
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
  background: var(--ld-bg);
  color: var(--ld-ink);
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
  background: rgba(var(--ld-card-rgb),0.88);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 0 rgba(var(--ld-fg),0.06);
}
.nav-inner {
  max-width: 1160px; margin: 0 auto;
  display: flex; align-items: center; gap: 24px; height: 68px;
}
.logo {
  display: flex; align-items: center; gap: 10px;
  font-size: 1.2rem; font-weight: 800; color: var(--ld-ink);
  letter-spacing: -0.5px; text-decoration: none;
}
.logo-icon {
  width: 34px; height: 34px;
  background: var(--ld-accent);
  border-radius: 9px; display: flex; align-items: center; justify-content: center;
  color: var(--ld-on-accent);
}
.nav-links { display: flex; align-items: center; gap: 4px; margin-left: 20px; flex: 1; list-style: none; }
.nav-links a {
  font-size: 0.88rem; font-weight: 500; color: var(--ld-muted);
  padding: 6px 12px; border-radius: 8px;
  transition: color 0.2s, background 0.2s; cursor: pointer;
}
.nav-links a:hover { color: var(--ld-ink); background: rgba(var(--ld-fg),0.07); }
.btn-nav {
  font-size: 0.875rem; font-weight: 600;
  background: var(--ld-accent);
  color: var(--ld-on-accent); padding: 9px 20px; border-radius: 10px;
  border: none; cursor: pointer; white-space: nowrap;
  transition: opacity 0.2s, transform 0.2s;
}
.btn-nav:hover { opacity: 0.9; transform: translateY(-1px); }

.lang-toggle-nav {
  font-size: 0.8rem; font-weight: 700; color: var(--ld-muted);
  padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(var(--ld-fg),0.1);
  background: rgba(var(--ld-fg),0.03); cursor: pointer;
  transition: all 0.2s; margin-left: 8px;
}
.lang-toggle-nav:hover { color: var(--ld-ink); background: rgba(var(--ld-fg),0.08); border-color: rgba(var(--ld-fg),0.2); }

.mobile-lang-row {
  padding: 8px 12px; border-bottom: 1px solid rgba(var(--ld-fg),0.05);
  margin-bottom: 8px;
}
.mobile-lang-btn {
  background: rgba(var(--ld-fg),0.05); border: 1px solid rgba(var(--ld-fg),0.1);
  color: var(--ld-ink); padding: 8px 16px; border-radius: 8px; font-weight: 600;
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
.hamburger span { display: block; width: 22px; height: 2px; background: var(--ld-muted); border-radius: 2px; }
.mobile-menu {
  display: none; flex-direction: column; padding: 12px 16px 16px; gap: 4px;
  border-top: 1px solid rgba(var(--ld-fg),0.08);
  background: rgba(var(--ld-card-rgb),0.97);
  backdrop-filter: blur(20px);
}
.mobile-menu.open { display: flex; }
.mobile-menu a, .mobile-menu button {
  font-size: 0.95rem; font-weight: 500; color: var(--ld-muted);
  padding: 10px 12px; border-radius: 8px; cursor: pointer;
  transition: color 0.2s; background: none; border: none; text-align: left;
}
.mobile-menu a:hover { color: var(--ld-ink); }
.mobile-cta { margin-top: 8px; background: var(--ld-accent) !important; color: var(--ld-on-accent) !important; text-align: center !important; }

/* ===== HERO ===== */
.hero {
  min-height: 100vh;
  display: flex; align-items: center;
  padding: 120px 24px 80px;
  max-width: 1160px; margin: 0 auto;
  position: relative; gap: 48px;
}
.glow-1, .glow-2 {
  position: absolute; border-radius: 50%;
  filter: blur(120px); pointer-events: none; z-index: 0;
}
.glow-1 { 
  width: 600px; height: 600px; 
  background: radial-gradient(circle, rgba(var(--ld-acc),0.12) 0%, transparent 70%); 
  top: -150px; left: -150px; 
}
.glow-2 { 
  width: 500px; height: 500px; 
  background: radial-gradient(circle, rgba(var(--ld-acc),0.1) 0%, transparent 70%); 
  bottom: 50px; right: -100px; 
}
.hero-spotlight {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(var(--ld-acc),0.08),
    transparent 40%
  );
  z-index: 0;
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; flex: 1; max-width: 560px; }
.badge-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(var(--ld-acc),0.12); border: 1px solid rgba(var(--ld-acc),0.3);
  color: var(--ld-acc-text); font-size: 0.8rem; font-weight: 600;
  padding: 6px 14px; border-radius: 100px; margin-bottom: 24px;
}
.badge-dot {
  width: 7px; height: 7px; background: var(--ld-accent); border-radius: 50%;
  animation: blink 2s infinite;
}
@keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
.hero-title { font-size: clamp(2.2rem,5vw,3.8rem); font-weight: 900; letter-spacing: -2px; line-height: 1.1; color: var(--ld-ink); margin-bottom: 20px; }
.gradient-text { background: var(--ld-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-subtitle { font-size: 1.05rem; color: var(--ld-ink-2); margin-bottom: 36px; line-height: 1.7; }
.hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--ld-accent);
  color: var(--ld-on-accent); font-weight: 700; font-size: 0.95rem;
  padding: 13px 26px; border-radius: 12px; border: none; cursor: pointer;
  box-shadow: 0 4px 24px rgba(var(--ld-acc),0.35), inset 0 0 0 1px rgba(var(--ld-fg),0.1);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative; overflow: hidden;
}
.btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px rgba(var(--ld-acc),0.5); }
.btn-primary::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--ld-fg),0.2), transparent);
  transition: left 0.6s;
}
.btn-primary:hover::before { left: 100%; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--ld-ink-2); font-weight: 600; font-size: 0.95rem;
  padding: 13px 26px; border-radius: 12px;
  border: 1px solid rgba(var(--ld-fg),0.1);
  background: rgba(var(--ld-fg),0.03); cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  text-decoration: none;
}
.btn-ghost:hover { color: var(--ld-ink); border-color: rgba(var(--ld-fg),0.3); background: rgba(var(--ld-fg),0.08); transform: translateY(-2px); }
.btn-outline {
  border: 1px solid rgba(var(--ld-fg),0.15); color: var(--ld-ink);
  background: rgba(var(--ld-fg),0.03);
}
.btn-outline:hover { background: rgba(var(--ld-fg),0.08); border-color: rgba(var(--ld-fg),0.3); }
.hero-stats { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.stat { display: flex; flex-direction: column; }
.stat-num { font-size: 1.3rem; font-weight: 800; color: var(--ld-ink); letter-spacing: -0.5px; }
.stat-label { font-size: 0.76rem; color: var(--ld-muted); font-weight: 500; }
.stat-divider { width: 1px; height: 34px; background: rgba(var(--ld-fg),0.1); }

/* ===== HERO VISUAL ===== */
.hero-visual {
  flex: 1; display: flex; justify-content: center; position: relative;
  perspective: 1000px;
}
.dashboard-card {
  background: rgba(var(--ld-card-rgb),0.8);
  border: 1px solid rgba(var(--ld-fg),0.1);
  border-radius: 12px;
  width: 100%; max-width: 400px;
  box-shadow: 
    0 40px 80px -20px rgba(0,0,0,0.5), 
    0 0 0 1px rgba(var(--ld-fg),0.05),
    0 0 40px rgba(var(--ld-acc),0.1);
  overflow: hidden;
  backdrop-filter: blur(12px);
  animation: entrance 1s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}
.dashboard-card::after {
  content: '';
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(var(--ld-fg),0.03), transparent);
  transform: skewX(-25deg);
  animation: shine 8s infinite;
  pointer-events: none;
}
.card-header {
  padding: 8px 12px;
  background: rgba(var(--ld-fg),0.03);
  border-bottom: 1px solid rgba(var(--ld-fg),0.05);
  display: flex; align-items: center; gap: 10px;
}
.card-dots { display: flex; gap: 4px; }
.dot { width: 7px; height: 7px; border-radius: 50%; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #eab308; }
.dot.green { background: var(--ld-accent); }
.card-title { font-size: 0.6rem; color: var(--ld-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.card-body { padding: 10px; display: flex; flex-direction: column; gap: 10px; }
.mini-kpis { display: flex; gap: 6px; }
.mini-kpi {
  flex: 1; border-radius: 8px; padding: 7px 4px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.mini-kpi.blue { background: rgba(var(--ld-acc),0.08); border: 1px solid rgba(var(--ld-acc),0.15); }
.mini-kpi.emerald { background: rgba(var(--ld-acc),0.08); border: 1px solid rgba(var(--ld-acc),0.15); }
.mini-kpi.purple { background: rgba(var(--ld-acc),0.08); border: 1px solid rgba(var(--ld-acc),0.15); }
.price-card {
  background: rgba(var(--ld-card-rgb),0.6);
  border: 1px solid rgba(var(--ld-fg),0.08);
  backdrop-filter: blur(10px);
  padding: 40px 32px; border-radius: 24px; position: relative;
  display: flex; flex-direction: column; gap: 24px; transition: transform 0.3s, border-color 0.3s;
}
.price-card:hover { transform: translateY(-5px); border-color: rgba(var(--ld-acc),0.3); }
.price-card h3 { font-size: 1.25rem; font-weight: 800; color: var(--ld-ink); letter-spacing: -0.5px; }
.kpi-val { font-size: 0.9rem; font-weight: 800; color: var(--ld-ink); line-height: 1; }
.kpi-lbl { font-size: 0.5rem; color: var(--ld-muted); font-weight: 500; }
.mini-sellers { display: flex; flex-direction: column; gap: 5px; }
.s-avatar {
  width: 24px; height: 24px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700; color: var(--ld-ink);
}
/* High contrast for light avatar backgrounds */
.s-avatar[style*="#eab308"], .s-avatar[style*="rgb(234, 179, 8)"] { color: #0f172a !important; }
.s-info { flex: 1; }
.s-name { display: block; font-size: 0.7rem; font-weight: 600; color: var(--ld-ink); margin-bottom: 3px; }
.s-bar { height: 3px; background: rgba(var(--ld-fg),0.08); border-radius: 10px; overflow: hidden; }
.s-fill {
  height: 100%; border-radius: 10px;
  animation: fillIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: left;
}
.s-count { font-size: 0.65rem; color: var(--ld-muted); font-weight: 500; }

.mini-next {
  margin-top: 12px; padding: 8px 10px;
  background: rgba(30,58,138,0.2);
  border: 1px solid rgba(var(--ld-acc),0.15);
  border-radius: 8px;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.mini-next.is-assigning {
  opacity: 0.5;
  transform: translateY(-2px);
}
.next-lbl { display: block; font-size: 0.55rem; font-weight: 600; color: var(--ld-acc-text); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
.next-val { font-size: 0.8rem; font-weight: 700; color: var(--ld-ink); }

.live-indicator {
  position: absolute; top: 9px; right: 10px;
  display: flex; align-items: center; gap: 3px;
}
.live-dot {
  width: 4px; height: 4px; background: var(--ld-accent); border-radius: 50%;
  box-shadow: 0 0 0 rgba(var(--ld-acc),0.4);
  animation: livePulse 2s infinite;
}
.live-text {
  font-size: 7px; font-weight: 800; color: var(--ld-acc-text); letter-spacing: 1px;
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
  0% { box-shadow: 0 0 0 0 rgba(var(--ld-acc),0.7); }
  70% { box-shadow: 0 0 0 10px rgba(var(--ld-acc),0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--ld-acc),0); }
}

/* ===== SECTIONS ===== */
.section { padding: 96px 0; }
.section-dark {
  background: var(--ld-bg);
  background-image: 
    radial-gradient(circle at 2px 2px, rgba(var(--ld-fg),0.03) 1px, transparent 0);
  background-size: 32px 32px;
  border-top: 1px solid rgba(var(--ld-fg),0.05);
  border-bottom: 1px solid rgba(var(--ld-fg),0.05);
  position: relative;
}
.section-header { text-align: center; margin-bottom: 60px; }
.section-tag {
  display: inline-flex; align-items: center;
  background: rgba(var(--ld-acc),0.1); border: 1px solid rgba(var(--ld-acc),0.2);
  color: var(--ld-acc-text); font-size: 0.75rem; font-weight: 700;
  padding: 5px 14px; border-radius: 100px;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;
}
.section-title { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 900; letter-spacing: -1.5px; color: var(--ld-ink); margin-bottom: 16px; line-height: 1.15; }
.section-title.text-left { text-align: left; }
.section-sub { font-size: 1rem; color: var(--ld-muted); max-width: 560px; margin: 0 auto; line-height: 1.7; }
.section-sub.text-left { text-align: left; margin: 0; }

/* ===== FEATURES ===== */
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.feat-card {
  background: rgba(var(--ld-card-rgb),0.6); border: 1px solid rgba(var(--ld-fg),0.07);
  border-radius: 16px; padding: 26px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative; overflow: hidden;
}
.feat-card::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(800px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(var(--ld-fg),0.06), transparent 40%);
  opacity: 0; transition: opacity 0.3s;
}
.feat-card:hover::after { opacity: 1; }
.feat-card:hover { border-color: rgba(var(--ld-acc),0.3); transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
.feat-large { grid-column: span 2; }
.extras-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.extras-list { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.extras-list li { position: relative; padding-left: 22px; font-size: 14px; line-height: 1.5; color: var(--text-muted, var(--ld-muted)); }
.extras-list li::before { content: '✓'; position: absolute; left: 0; color: var(--ld-acc-text); font-weight: 700; }
.feat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
.icon-blue { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.icon-green { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.icon-purple { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.icon-orange { background: rgba(249,115,22,0.15); color: #fb923c; }
.icon-cyan { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.icon-pink { background: rgba(236,72,153,0.15); color: #f472b6; }
.feat-card h3 { font-size: 1rem; font-weight: 700; color: var(--ld-ink); margin-bottom: 10px; letter-spacing: -0.2px; }
.feat-card p { font-size: 0.875rem; color: var(--ld-muted); line-height: 1.65; }
.algo-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 20px; }
.algo-step {
  display: flex; align-items: center; gap: 10px;
  background: rgba(var(--ld-fg),0.03); border: 1px solid rgba(var(--ld-fg),0.05);
  border-radius: 8px; padding: 9px 13px; font-size: 0.84rem; color: var(--ld-ink-2);
}
.algo-step.step-success { background: rgba(var(--ld-acc),0.08); border-color: rgba(var(--ld-acc),0.2); color: var(--ld-acc-text); }
.step-n {
  width: 22px; height: 22px; background: rgba(var(--ld-acc),0.2); color: var(--ld-acc-text);
  font-size: 0.7rem; font-weight: 800; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.algo-step.step-success .step-n { background: rgba(var(--ld-acc),0.2); color: var(--ld-acc-text); }

/* ===== STEPS ===== */
.steps-flow { display: flex; align-items: flex-start; }
.step-item { flex: 1; text-align: center; padding: 0 14px; }
.step-icon-wrap { position: relative; display: inline-block; margin-bottom: 18px; }
.step-num-badge {
  position: absolute; top: -8px; right: -8px;
  width: 22px; height: 22px;
  background: var(--ld-accent);
  color: var(--ld-on-accent); font-size: 0.65rem; font-weight: 800; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; z-index: 1;
}
.step-icon {
  width: 70px; height: 70px;
  background: rgba(var(--ld-acc),0.15); border: 1px solid rgba(var(--ld-acc),0.25);
  border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--ld-acc-text);
  box-shadow: 0 0 20px rgba(var(--ld-acc),0.1);
}
.step-item h3 { font-size: 0.95rem; font-weight: 700; color: var(--ld-ink); margin-bottom: 8px; }
.step-item p { font-size: 0.83rem; color: var(--ld-muted); line-height: 1.6; }
.step-connector { display: flex; flex-direction: column; align-items: center; padding-top: 26px; min-width: 36px; }
.conn-line { 
  width: 28px; height: 1px; 
  background: linear-gradient(90deg, rgba(var(--ld-acc),0.1), rgba(var(--ld-acc),0.6), rgba(var(--ld-acc),0.1));
  background-size: 200% 100%;
  animation: flowBeam 2s linear infinite;
}
@keyframes flowBeam {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
.conn-arrow { font-size: 0.78rem; color: var(--ld-acc-text); margin-top: 3px; }

/* ===== ROLES ===== */
.roles-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.role-card {
  background: rgba(var(--ld-card-rgb),0.6); border: 1px solid rgba(var(--ld-fg),0.07);
  border-radius: 16px; padding: 26px; position: relative; overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.role-card::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(var(--ld-fg),0.06), transparent 40%);
  opacity: 0; transition: opacity 0.3s;
}
.role-card:hover::after { opacity: 1; }
.role-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.role-admin::before { background: linear-gradient(90deg, #ef4444, #f97316); }
.role-manager::before { background: var(--ld-accent); }
.role-viewer::before { background: var(--ld-accent); }
.role-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.3); }
.role-badge {
  display: inline-flex; font-size: 0.7rem; font-weight: 700;
  padding: 3px 10px; border-radius: 100px; margin-bottom: 14px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.badge-red { background: rgba(239,68,68,0.15); color: #f87171; }
.badge-blue { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.badge-green { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.badge-yellow { background: rgba(234,179,8,0.15); color: #facc15; }
.role-icon { width: 50px; height: 50px; border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.ricon-red { background: rgba(239,68,68,0.1); color: #f87171; }
.ricon-blue { background: rgba(var(--ld-acc),0.1); color: var(--ld-acc-text); }
.ricon-green { background: rgba(var(--ld-acc),0.1); color: var(--ld-acc-text); }
.ricon-yellow { background: rgba(234,179,8,0.1); color: #facc15; }
.role-seller::before { background: var(--ld-accent); }
.roles-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.role-card h3 { font-size: 0.95rem; font-weight: 700; color: var(--ld-ink); margin-bottom: 8px; }
.role-card p { font-size: 0.84rem; color: var(--ld-muted); line-height: 1.6; margin-bottom: 18px; }
.role-perms { display: flex; flex-direction: column; gap: 5px; list-style: none; }
.role-perms li { font-size: 0.82rem; color: var(--ld-ink-2); }
.role-perms li.perm-no { color: var(--ld-muted); }

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
  background: rgba(var(--ld-fg),0.04);
  border: 1px solid rgba(var(--ld-fg),0.08);
  border-radius: 14px;
  padding: 16px 18px;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.integration-card:hover {
  background: rgba(var(--ld-fg),0.07);
  border-color: rgba(var(--ld-fg),0.15);
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
.int-card-info strong { font-size: 0.9rem; color: var(--ld-ink); font-weight: 600; }
.int-card-info span { font-size: 0.75rem; color: var(--ld-muted); margin-top: 2px; }
.int-card-badge {
  font-size: 0.65rem; font-weight: 700; padding: 3px 8px;
  border-radius: 99px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.05em;
}
.badge-native { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); border: 1px solid rgba(var(--ld-acc),0.3); }
.badge-webhook { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); border: 1px solid rgba(var(--ld-acc),0.3); }

.integration-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.int-steps { display: flex; flex-direction: column; gap: 18px; }
.int-step { display: flex; gap: 14px; align-items: flex-start; }
.int-num {
  width: 30px; height: 30px; background: var(--ld-accent);
  color: var(--ld-on-accent); font-size: 0.82rem; font-weight: 800; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;
}
.int-step strong { font-size: 0.93rem; color: var(--ld-ink); display: block; margin-bottom: 3px; }
.int-step p { font-size: 0.83rem; color: var(--ld-muted); line-height: 1.6; }
.int-visual { display: flex; flex-direction: column; gap: 10px; }
.wh-card { background: rgba(var(--ld-card-rgb),0.8); border: 1px solid rgba(var(--ld-fg),0.08); border-radius: 13px; overflow: hidden; }
.wh-header {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 15px; border-bottom: 1px solid rgba(var(--ld-fg),0.05);
  font-size: 0.76rem; color: var(--ld-muted);
}
.wh-dot { width: 7px; height: 7px; border-radius: 50%; }
.wh-dot.green { background: var(--ld-accent); }
.wh-dot.blue { background: var(--ld-accent); }
.wh-badge { margin-left: auto; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
.wh-badge.post { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.wh-badge.webhook { background: rgba(var(--ld-acc),0.15); color: var(--ld-acc-text); }
.wh-json { padding: 13px 15px; font-family: 'SF Mono','Fira Code',monospace; font-size: 0.75rem; line-height: 1.7; overflow-x: auto; }
.j-key { color: var(--ld-acc-text); }
.j-c { color: var(--ld-muted); }
.j-s { color: var(--ld-acc-text); }
.wh-arrow { 
  display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--ld-muted); 
  position: relative; font-size: 0.76rem; font-weight: 600;
}
.wh-flow-dot {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  width: 6px; height: 6px; background: var(--ld-accent); border-radius: 50%;
  box-shadow: 0 0 10px var(--ld-accent);
  animation: leadFlow 2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes leadFlow {
  0% { top: 0; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 100px; opacity: 0; }
}

/* ===== COMPARISON ===== */
.comparison-table-wrapper {
  background: rgba(var(--ld-card-rgb),0.8);
  border: 1px solid rgba(var(--ld-fg),0.08);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  max-width: 900px;
  margin: 0 auto;
}
.comparison-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}
.comparison-table th {
  padding: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(var(--ld-fg),0.08);
  background: var(--ld-card);
}
.feat-col { 
  color: var(--ld-muted); 
}
.crm-col { text-align: center; background: rgba(var(--ld-fg),0.02); color: var(--ld-ink-2); }
.ld-col { text-align: center; background: rgba(var(--ld-acc),0.05); color: var(--ld-acc-text); }
.crm-col { text-align: center; background: rgba(var(--ld-fg),0.02); color: var(--ld-ink-2); }
.ld-col { text-align: center; background: rgba(var(--ld-acc),0.05); color: var(--ld-acc-text); }

.comparison-table td {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(var(--ld-fg),0.04);
  font-size: 0.95rem;
}
.feat-name { 
  font-weight: 500; color: var(--ld-ink); 
}
.crm-val, .ld-val { text-align: center; }
.crm-val { background: rgba(var(--ld-fg),0.02); }
.ld-val { background: rgba(var(--ld-acc),0.05); color: var(--ld-acc-text); font-weight: 700; }

.icon-check { color: var(--ld-acc-text); font-size: 1.2rem; }
.icon-cross { color: #ef4444; font-size: 1.2rem; opacity: 0.5; }
.val-text { font-size: 0.85rem; }

.comparison-footer { text-align: center; margin-top: 32px; }
.comparison-footer p { font-size: 0.9rem; color: var(--ld-muted); font-weight: 500; }


/* ===== PRICING ===== */
.pricing-grid { display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 420px; margin: 0 auto; }
.pricing-card {
  background: var(--ld-card);
  border: 1px solid rgba(var(--ld-fg),0.1);
  border-radius: 24px; padding: 40px 32px;
  position: relative; display: flex; flex-direction: column; gap: 24px;
}
.pricing-main { border-color: var(--ld-accent); box-shadow: 0 8px 32px rgba(var(--ld-acc),0.2); }
.pricing-popular { 
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%); 
  background: var(--ld-accent); color: var(--ld-on-accent); 
  font-size: 0.72rem; font-weight: 700; padding: 4px 16px; border-radius: 99px; 
  white-space: nowrap; letter-spacing: 0.04em;
  box-shadow: 0 4px 12px rgba(var(--ld-acc),0.4);
  animation: badgePulse 2s infinite;
}
@keyframes badgePulse {
  0% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); box-shadow: 0 0 20px rgba(var(--ld-acc),0.6); }
  100% { transform: translateX(-50%) scale(1); }
}
.pricing-optional { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--ld-faint); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 16px; border-radius: 99px; white-space: nowrap; letter-spacing: 0.04em; }
.pricing-name { font-size: 1.25rem; font-weight: 800; color: var(--ld-ink); letter-spacing: -0.5px; margin-top: 8px; }
.pricing-price { display: flex; align-items: baseline; gap: 4px; }
.price-currency { font-size: 1.1rem; font-weight: 700; color: var(--ld-acc-text); }
.price-amount { font-size: 2.4rem; font-weight: 800; color: var(--ld-ink); line-height: 1; word-break: break-all; }
.price-period { font-size: 0.95rem; color: var(--ld-muted); font-weight: 500; }
.pricing-desc { font-size: 0.9rem; color: var(--ld-muted); line-height: 1.6; }
.pricing-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.pricing-features li { font-size: 0.88rem; color: var(--ld-ink-2); display: flex; align-items: center; gap: 8px; }
.pricing-features li::before { content: none; }
.btn-full { width: 100%; justify-content: center; text-align: center; display: flex; align-items: center; padding: 13px 20px; border-radius: 10px; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: all 0.2s; }
.pricing-main .btn-full { background: var(--ld-accent); color: var(--ld-on-accent); box-shadow: 0 4px 14px rgba(var(--ld-acc),0.35); }
.pricing-main .btn-full:hover { box-shadow: 0 6px 20px rgba(var(--ld-acc),0.45); transform: translateY(-1px); }
.currency-toggle { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.05); border-radius: 8px; padding: 3px; }
.dark .currency-toggle { background: rgba(var(--ld-fg),0.07); }
.flag-btn { background: transparent; border: none; cursor: pointer; font-size: 1.25rem; width: 34px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; opacity: 0.45; }
.flag-btn.active { background: #fff; opacity: 1; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
.dark .flag-btn.active { background: #334155; }
.pricing-note { text-align: center; color: var(--ld-ink-2); font-size: 0.85rem; margin-top: 28px; }
.pricing-trial { text-align: center; color: var(--ld-muted); font-size: 0.8rem; margin-top: 12px; }
@media (max-width: 640px) {
  .pricing-grid { grid-template-columns: 1fr; }
  
  .comparison-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
    margin: 0 -4px;
  }
  .comparison-table {
    min-width: 580px;
  }
  .comparison-table th, .comparison-table td {
    padding: 14px 16px;
    font-size: 0.85rem;
  }
  .feat-col, .feat-name {
    min-width: 160px;
    border-right: 1px solid rgba(var(--ld-fg),0.05);
  }
  .feat-name { font-size: 0.85rem; }
  .icon-check, .icon-cross { font-size: 1rem; }
  
  .comparison-table-wrapper::-webkit-scrollbar {
    height: 4px;
  }
  .comparison-table-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }
  .comparison-table-wrapper::-webkit-scrollbar-thumb {
    background: rgba(var(--ld-acc),0.3);
    border-radius: 10px;
  }
}

/* ===== CTA ===== */
.cta-section { padding: 96px 0; position: relative; overflow: hidden; }
.cta-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 700px; height: 400px;
  background: radial-gradient(ellipse, rgba(var(--ld-acc),0.1) 0%, transparent 70%);
  pointer-events: none;
}
.cta-box { max-width: 580px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
.cta-title { font-size: clamp(2rem,5vw,3.2rem); font-weight: 900; letter-spacing: -2px; color: var(--ld-ink); margin: 18px 0 14px; }
.cta-sub { font-size: 1rem; color: var(--ld-muted); line-height: 1.7; margin-bottom: 34px; }
.cta-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.cta-feats { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; font-size: 0.8rem; color: var(--ld-muted); font-weight: 500; }
/* ===== FOOTER ===== */
.landing-footer { padding: 48px 0 24px; border-top: 1px solid rgba(var(--ld-fg),0.06); }
.footer-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 48px; margin-bottom: 40px; flex-wrap: wrap; }
.footer-brand p { font-size: 0.84rem; color: var(--ld-muted); margin-top: 12px; line-height: 1.6; max-width: 260px; }
.footer-links { display: flex; gap: 48px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.fcol-title { font-size: 0.75rem; font-weight: 700; color: var(--ld-ink); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.footer-col a { font-size: 0.84rem; color: var(--ld-muted); transition: color 0.2s; cursor: pointer; }
.footer-col a:hover { color: var(--ld-muted); }
.footer-link-btn { font-size: 0.84rem; color: var(--ld-muted); background: none; border: none; cursor: pointer; padding: 0; transition: color 0.2s; }
.footer-link-btn:hover { color: var(--ld-muted); }
.footer-bottom { border-top: 1px solid rgba(var(--ld-fg),0.05); padding-top: 20px; font-size: 0.78rem; color: var(--ld-faint); text-align: center; }
.footer-inline-link { background: none; border: none; cursor: pointer; color: var(--ld-faint); font-size: 0.78rem; padding: 0; transition: color 0.2s; }
.footer-inline-link:hover { color: var(--ld-muted); }
.pricing-refund { color: inherit; text-decoration: underline; text-underline-offset: 3px; }

/* ===== CRM PROPIO ===== */
.ldcrm-section { position: relative; overflow: hidden; }
.ldcrm-glow { position: absolute; width: 560px; height: 560px; border-radius: 50%; right: -140px; top: 40px; background: radial-gradient(circle, rgba(var(--ld-acc),0.10), transparent 70%); filter: blur(60px); pointer-events: none; }
.ldcrm-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 56px; align-items: center; position: relative; }
.ldcrm-accent { color: var(--ld-acc-text); }
.ldcrm-points { list-style: none; margin: 28px 0 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }
.ldcrm-points li { display: flex; gap: 14px; align-items: flex-start; text-align: left; }
.ldcrm-points li > div { padding-top: 1px; }
.ldcrm-points h4 { font-size: 0.98rem; font-weight: 700; color: var(--ld-ink); margin: 0 0 3px; padding: 0; line-height: 1.35; }
.ldcrm-points p { font-size: 0.88rem; color: var(--ld-muted); line-height: 1.55; margin: 0; padding: 0; }
.ldcrm-pi { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(var(--ld-acc),0.12); color: var(--ld-acc-text); }
.ldcrm-cta { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin-top: 30px; }
.ldcrm-note { font-size: 0.8rem; color: var(--ld-faint); }
.ldcrm-board { text-align: left; background: var(--ld-card); border: 1px solid rgba(var(--ld-fg),0.1); border-radius: 20px; padding: 16px; box-shadow: 0 30px 70px -30px rgba(0,0,0,0.55); }
.ldcrm-board-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.ldcrm-board-top b { font-size: 0.85rem; color: var(--ld-ink); }
.ldcrm-chips { display: flex; gap: 6px; }
.ldcrm-chip { font-size: 0.68rem; font-weight: 600; padding: 3px 9px; border-radius: 100px; border: 1px solid rgba(var(--ld-fg),0.12); color: var(--ld-muted); white-space: nowrap; }
.ldcrm-chip.on { background: rgba(var(--ld-acc),0.14); border-color: rgba(var(--ld-acc),0.35); color: var(--ld-acc-text); }
.ldcrm-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ldcrm-col { background: var(--ld-card-2); border: 1px solid rgba(var(--ld-fg),0.06); border-radius: 14px; padding: 10px; }
.ldcrm-col-h { display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 700; color: var(--ld-ink-2); margin-bottom: 8px; }
.ldcrm-col-h span { color: var(--ld-faint); font-weight: 600; }
.ldcrm-card { background: var(--ld-card); border: 1px solid rgba(var(--ld-fg),0.08); border-radius: 10px; padding: 9px 10px; margin-bottom: 8px; }
.ldcrm-card .n { font-size: 0.78rem; font-weight: 700; color: var(--ld-ink); }
.ldcrm-card .m { font-size: 0.66rem; color: var(--ld-faint); margin-top: 1px; }
.ldcrm-card .r { display: flex; justify-content: space-between; align-items: center; margin-top: 7px; }
.ldcrm-drag { transform: rotate(-3deg) translateY(-4px); border-color: rgba(var(--ld-acc),0.6); box-shadow: 0 14px 28px -12px rgba(0,0,0,0.6); }
.ldcrm-av { display: flex; align-items: center; gap: 5px; font-size: 0.64rem; color: var(--ld-muted); }
.ldcrm-av i { width: 16px; height: 16px; border-radius: 50%; background: rgba(var(--ld-acc),0.25); display: inline-block; }
.ldcrm-wa { width: 20px; height: 20px; border-radius: 6px; background: rgba(37,211,102,0.15); color: #25d366; display: flex; align-items: center; justify-content: center; }
.ldcrm-val { font-size: 0.6rem; font-weight: 700; padding: 1px 6px; border-radius: 5px; background: rgba(var(--ld-fg),0.07); color: var(--ld-muted); }
.ldcrm-unassigned { font-size: 0.6rem; font-weight: 700; padding: 1px 6px; border-radius: 5px; background: rgba(234,179,8,0.15); color: #ca8a04; }
.ldcrm-sum { font-size: 0.66rem; color: var(--ld-faint); margin-top: 2px; }
.ldcrm-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 56px; position: relative; }
:root:not(.dark) .landing-root .ldcrm-board { box-shadow: 0 30px 70px -30px rgba(14,17,15,0.28); }
:root:not(.dark) .landing-root .ldcrm-drag { box-shadow: 0 14px 28px -12px rgba(14,17,15,0.3); }
@media (max-width: 960px) {
  .ldcrm-grid { grid-template-columns: 1fr; gap: 40px; }
  .ldcrm-mini { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .ldcrm-board { padding: 12px; overflow-x: auto; }
  .ldcrm-cols { grid-template-columns: repeat(3, 170px); }
  .ldcrm-chips { display: none; }
}

/* ===== HERO TRUST BAR ===== */
.hero-trust {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px 10px;
  margin-top: 20px; margin-bottom: 8px;
}
.hero-trust span {
  font-size: 0.8rem; color: var(--ld-muted); font-weight: 500; white-space: nowrap;
}
.trust-sep { color: var(--ld-faint); font-size: 0.75rem; }

/* ===== FAQ ===== */
.faq-list { max-width: 740px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.faq-item {
  background: var(--ld-card); border: 1px solid rgba(var(--ld-fg),0.1); border-radius: 14px;
  overflow: hidden; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
}
.faq-item:hover { border-color: var(--ld-accent); box-shadow: 0 4px 16px rgba(var(--ld-acc),0.15); }
.faq-open { border-color: var(--ld-accent) !important; box-shadow: 0 4px 16px rgba(var(--ld-acc),0.2) !important; }
.faq-question {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; gap: 16px;
  font-size: 0.95rem; font-weight: 600; color: var(--ld-ink);
  user-select: none;
}
.faq-chevron {
  flex-shrink: 0; color: var(--ld-acc-text);
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
  margin: 0; font-size: 0.88rem; color: var(--ld-muted); line-height: 1.7;
  border-top: 1px solid rgba(var(--ld-fg),0.05); padding-top: 16px;
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
  .extras-grid { grid-template-columns: 1fr; }
  .roles-grid { grid-template-columns: 1fr; }
  .steps-flow { flex-direction: column; align-items: center; gap: 24px; }
  .step-connector { display: none; }
  .dashboard-card { width: min(400px, 90vw); margin: 0 auto; }
  .integrations-grid { grid-template-columns: 1fr; }
}

/* ===== AVAILABILITY TABLE ===== */

@media (max-width: 640px) {
}
.section-presence {
  background: var(--ld-bg);
  position: relative;
  padding: 120px 0;
}

.presence-bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(var(--ld-acc),0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.presence-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.presence-list {
  list-style: none;
  padding: 0;
  margin: 40px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.presence-list li {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1.05rem;
  color: var(--ld-muted);
  transition: transform 0.2s;
}

.presence-list li:hover { transform: translateX(8px); color: var(--ld-ink); }

.p-list-icon {
  width: 36px;
  height: 36px;
  background: rgba(var(--ld-acc),0.1);
  color: var(--ld-acc-text);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(var(--ld-acc),0.1);
}

.presence-visual {
  position: relative;
}

.presence-browser-frame {
  background: var(--ld-card);
  border-radius: 16px;
  border: 1px solid rgba(var(--ld-fg),0.1);
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  position: relative;
}

.browser-header {
  height: 40px;
  background: var(--ld-card-2);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  border-bottom: 1px solid rgba(var(--ld-fg),0.05);
}

.browser-dots { display: flex; gap: 8px; }
.browser-dots span { width: 10px; height: 10px; border-radius: 50%; }
.dot-red { background: #ff5f56; }
.dot-yellow { background: #ffbd2e; }
.dot-green { background: #27c93f; }

.browser-address {
  background: rgba(var(--ld-fg),0.05);
  height: 24px;
  flex: 1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 10px;
  color: var(--ld-muted);
  font-family: monospace;
}

.presence-mockup-wrap {
  position: relative;
  padding: 4px;
  background: var(--ld-card-2);
}

.presence-img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
}

@media (max-width: 992px) {
  .presence-layout {
    grid-template-columns: 1fr;
    gap: 60px;
    text-align: center;
  }
  .presence-text {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .presence-text .section-title, .presence-text .section-sub {
    text-align: center !important;
  }
  .presence-floating-card.top-right {
    right: 20px;
    top: 20px;
  }
  .presence-floating-card.bottom-left {
    left: 20px;
    bottom: 20px;
  }
}

/* ===== SCROLL REVEAL ===== */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Delay for children if needed */
.reveal.is-visible .features-grid > * {
  animation: fade-in-up 0.6s ease forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered children reveal */
.reveal.is-visible .feat-card:nth-child(1) { transition-delay: 0.1s; }
.reveal.is-visible .feat-card:nth-child(2) { transition-delay: 0.2s; }
.reveal.is-visible .feat-card:nth-child(3) { transition-delay: 0.3s; }
.reveal.is-visible .feat-card:nth-child(4) { transition-delay: 0.4s; }

.reveal.is-visible .step-item:nth-child(1) { transition-delay: 0.1s; }
.reveal.is-visible .step-item:nth-child(2) { transition-delay: 0.2s; }
.reveal.is-visible .step-item:nth-child(3) { transition-delay: 0.3s; }

/* ===== FUTURISTIC LAYER (override-only, no markup changes) ===== */

/* Animated perspective grid + drifting aurora behind everything */
.landing-root::before {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(var(--ld-acc),0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ld-acc),0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%);
  animation: gridDrift 22s linear infinite;
}
.landing-root::after {
  content: ''; position: fixed; inset: -20% -20% auto -20%; height: 80vh; z-index: 0; pointer-events: none;
  background:
    radial-gradient(40% 60% at 20% 30%, rgba(var(--ld-acc),0.14), transparent 60%),
    radial-gradient(40% 60% at 80% 20%, rgba(var(--ld-acc),0.12), transparent 60%),
    radial-gradient(40% 60% at 60% 70%, rgba(var(--ld-acc),0.10), transparent 60%);
  filter: blur(40px);
  animation: auroraShift 18s ease-in-out infinite alternate;
}
@keyframes gridDrift { to { background-position: 48px 48px, 48px 48px; } }
@keyframes auroraShift {
  0%   { transform: translate3d(-4%, 0, 0) scale(1); }
  100% { transform: translate3d(4%, 3%, 0) scale(1.1); }
}
/* keep real content above the grid/aurora */
/* la barra de navegación queda fuera: es position: fixed y debe seguir al scroll */
.hero, .section, .cta-section, .landing-footer { position: relative; z-index: 1; }

/* Rotating neon border on hover for the key cards (role-card keeps its top bar) */
.feat-card, .integration-card, .pricing-card {
  --neon: conic-gradient(from var(--a, 0deg), var(--ld-accent), transparent 35%, transparent 65%, var(--ld-accent));
}
.feat-card::before, .integration-card::before, .pricing-card::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
  background: var(--neon);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity 0.4s; pointer-events: none; z-index: 2;
}
.feat-card:hover::before,
.integration-card:hover::before, .pricing-card:hover::before {
  opacity: 0.8; animation: borderSpin 4s linear infinite;
}
@property --a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes borderSpin { to { --a: 360deg; } }

/* Neon glow pulse on the gradient hero title + cyan halo on primary CTAs */
.gradient-text {
  filter: drop-shadow(0 0 18px rgba(var(--ld-acc),0.45));
  animation: titlePulse 4s ease-in-out infinite;
}
@keyframes titlePulse {
  0%,100% { filter: drop-shadow(0 0 14px rgba(var(--ld-acc),0.35)); }
  50%     { filter: drop-shadow(0 0 26px rgba(var(--ld-acc),0.55)); }
}
.btn-primary { box-shadow: 0 4px 24px rgba(var(--ld-acc),0.35), 0 0 0 1px rgba(var(--ld-acc),0.25) inset, 0 0 30px rgba(var(--ld-acc),0.18); }

/* Sharper glassmorphism on the nav once scrolled */
.nav-scrolled { background: rgba(var(--ld-card-rgb),0.6); backdrop-filter: blur(22px) saturate(160%); box-shadow: 0 1px 0 rgba(var(--ld-acc),0.25); }

@media (prefers-reduced-motion: reduce) {
  .landing-root::before, .landing-root::after, .gradient-text,
  .feat-card:hover::before,
  .integration-card:hover::before, .pricing-card:hover::before { animation: none; }
}

/* ===== HERO MOCKUP — rediseño ===== */
.hero-visual { align-items: center; }
.hero-glow {
  position: absolute; width: 440px; height: 440px; border-radius: 50%; z-index: 0;
  background: radial-gradient(circle, rgba(var(--ld-acc),0.35), rgba(var(--ld-acc),0.18) 45%, transparent 70%);
  filter: blur(40px); animation: glowDrift 9s ease-in-out infinite alternate; pointer-events: none;
}
@keyframes glowDrift { from { transform: translate(-30px, -20px) scale(0.95); } to { transform: translate(30px, 20px) scale(1.08); } }

.dashboard-card { max-width: 460px; z-index: 1; border-radius: 16px; border-color: rgba(var(--ld-acc),0.25);
  box-shadow: 0 50px 100px -25px rgba(0,0,0,0.65), 0 0 0 1px rgba(var(--ld-fg),0.06), 0 0 70px rgba(var(--ld-acc),0.22); }
.card-header { padding: 11px 16px; }
.dot { width: 9px; height: 9px; }
.card-title { font-size: 0.68rem; }
.card-live { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 1px; color: var(--ld-acc-text); }
.card-live .live-dot { width: 7px; height: 7px; }
.card-body { padding: 16px; gap: 14px; }

.mini-kpis { gap: 10px; }
.mini-kpi { padding: 12px 6px; border-radius: 12px; gap: 4px; }
.kpi-val { font-size: 1.5rem; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
.kpi-lbl { font-size: 0.66rem; }

.mini-sellers { gap: 10px; }
.mini-seller { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 12px; border: 1px solid transparent; transition: background 0.4s, border-color 0.4s; }
.mini-seller.is-hit { background: rgba(var(--ld-fg),0.05); border-color: rgba(var(--ld-fg),0.1); }
.s-avatar { width: 34px; height: 34px; border-radius: 10px; font-size: 0.72rem; flex-shrink: 0; }
.s-info { flex: 1; min-width: 0; }
.s-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.s-name { font-size: 0.84rem; margin-bottom: 0; display: inline; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s-count { font-size: 0.74rem; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.s-count b { color: var(--ld-ink); font-weight: 700; }
.s-bar { height: 6px; }
.s-fill { animation: none; transition: width 0.9s cubic-bezier(0.16, 1, 0.3, 1); }

.mini-feed { display: flex; flex-direction: column; gap: 6px; min-height: 96px; }
.feed-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.74rem; color: var(--ld-ink-2);
  background: rgba(var(--ld-acc),0.07); border: 1px solid rgba(var(--ld-acc),0.18); border-radius: 10px; }
.feed-item b { color: var(--ld-ink); font-weight: 700; }
.feed-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ld-accent); box-shadow: 0 0 8px var(--ld-accent); flex-shrink: 0; }
.feed-txt { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.feed-arrow { color: var(--ld-muted); }
.feed-to { font-weight: 700; color: var(--ld-acc-text); }
.feed-enter-active, .feed-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.feed-enter-from { opacity: 0; transform: translateY(-14px) scale(0.96); }
.feed-leave-to { opacity: 0; transform: translateX(24px); }
.feed-leave-active { position: absolute; width: calc(100% - 32px); }
.feed-move { transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.mini-feed { position: relative; }

.mini-next { margin-top: 0; padding: 12px 14px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--ld-acc),0.18), rgba(var(--ld-acc),0.18)); border-color: rgba(var(--ld-acc),0.3); }
.next-lbl { font-size: 0.64rem; margin-bottom: 4px; }
.next-val { font-size: 0.95rem; }

.float-badge { position: absolute; z-index: 2; display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 12px;
  font-size: 0.76rem; font-weight: 600; color: var(--ld-ink); white-space: nowrap;
  background: rgba(var(--ld-card-rgb),0.85); border: 1px solid rgba(var(--ld-fg),0.12); backdrop-filter: blur(14px);
  box-shadow: 0 14px 34px rgba(0,0,0,0.45); animation: badgeFloat 6s ease-in-out infinite; }
.fb-top { top: -40px; right: 24px; }
.fb-bottom { bottom: -40px; left: 24px; animation-delay: -3s; }
.fb-ic { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(250,204,21,0.15); font-size: 0.8rem; }
.fb-ic.ok { background: rgba(var(--ld-acc),0.18); color: var(--ld-acc-text); font-weight: 800; }
@keyframes badgeFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }

@media (max-width: 1000px) {
  .fb-top { right: 12px; }
  .fb-bottom { left: 12px; }
}
@media (max-width: 520px) {
  .float-badge { display: none; }
  .kpi-val { font-size: 1.25rem; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-glow, .float-badge { animation: none; }
  .feed-enter-active, .feed-leave-active, .feed-move { transition: none; }
}

/* ===================================================================
   REDISEÑO 2026 · "Lima eléctrico" — tokens de tema (oscuro / claro)
   El modo lo decide la clase .dark en <html> (misma que usa el panel).
   =================================================================== */
.landing-root {
  --ld-bg: #0B0C0B; --ld-card: #111311; --ld-card-2: #0E100E; --ld-card-rgb: 17,19,17;
  --ld-fg: 255,255,255; --ld-ink: #F2F4EF; --ld-ink-2: #D4D8D1; --ld-muted: #A3A9A2; --ld-faint: #6B716B;
  --ld-accent: #C8F23A; --ld-acc: 200,242,58; --ld-acc-text: #C8F23A; --ld-on-accent: #0E110F;
  --ld-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  background: var(--ld-bg); color: var(--ld-ink);
  transition: background 0.3s, color 0.3s;
}
:root:not(.dark) .landing-root {
  --ld-bg: #F5F6F0; --ld-card: #FFFFFF; --ld-card-2: #F0F2EA; --ld-card-rgb: 255,255,255;
  --ld-fg: 14,17,15; --ld-ink: #0E110F; --ld-ink-2: #2B312D; --ld-muted: #4A514C; --ld-faint: #6B726D;
  --ld-acc: 101,163,13; --ld-acc-text: #3F6212;
}
/* Tipografía */
.hero-title, .section-title, .cta-title, .pricing-name, .price-amount, .kpi-val, .stat-num, .feat-card h3, .role-card h3, .step-item h3 {
  font-family: var(--ld-display);
}
.hero-title { font-size: clamp(2.6rem, 6vw, 4.6rem); font-weight: 700; letter-spacing: -0.04em; line-height: 1.0; }
.section-title { font-weight: 700; letter-spacing: -0.035em; }
.cta-title { font-weight: 700; letter-spacing: -0.04em; }
/* Título del hero: lima sólido en oscuro, resaltador en claro */
.gradient-text {
  background: none; -webkit-text-fill-color: currentColor; color: var(--ld-acc-text);
  filter: none; animation: none;
}
:root:not(.dark) .landing-root .gradient-text {
  color: var(--ld-on-accent);
  background: linear-gradient(transparent 22%, var(--ld-accent) 22%, var(--ld-accent) 94%, transparent 94%);
  padding: 0 0.12em; margin-left: -0.12em;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.trust-sep { display: none; }
.hero-trust { gap: 6px 18px; }
/* Fondo: grilla sutil, sin auroras de colores */
.landing-root::before {
  background-image:
    linear-gradient(rgba(var(--ld-fg),0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ld-fg),0.045) 1px, transparent 1px);
}
.landing-root::after {
  background: radial-gradient(45% 55% at 70% 20%, rgba(var(--ld-acc),0.10), transparent 65%);
  filter: blur(30px);
}
.glow-1, .glow-2, .hero-spotlight { display: none; }
.section-dark, .section-presence { background-color: var(--ld-card-2); }
.nav-scrolled { background: rgba(var(--ld-card-rgb),0.75); box-shadow: 0 1px 0 rgba(var(--ld-fg),0.08); }
.mobile-menu { background: var(--ld-bg); }
.btn-primary { box-shadow: 0 10px 30px -10px rgba(var(--ld-acc),0.55); font-size: 1rem; padding: 15px 28px; border-radius: 14px; }
.btn-primary:hover { box-shadow: 0 16px 40px -12px rgba(var(--ld-acc),0.7); }
.btn-primary::before { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); }
.btn-ghost { font-size: 1rem; padding: 15px 26px; border-radius: 14px; color: var(--ld-ink); }
.btn-nav { color: var(--ld-on-accent); font-weight: 700; }
/* Botón de tema */
.theme-toggle-nav {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ld-ink); background: rgba(var(--ld-fg),0.04); border: 1px solid rgba(var(--ld-fg),0.12);
  cursor: pointer; transition: background 0.2s, border-color 0.2s;
}
.theme-toggle-nav:hover { background: rgba(var(--ld-fg),0.09); border-color: rgba(var(--ld-fg),0.25); }
.lang-toggle-nav { color: var(--ld-ink-2); }
/* Hero: producto más grande y legible */
.hero { max-width: 1240px; gap: 56px; }
.hero-content { max-width: 600px; }
.hero-subtitle { font-size: 1.15rem; color: var(--ld-muted); }
.hero-trust { justify-content: flex-start; }
.hero-trust span { color: var(--ld-muted); font-size: 0.86rem; }
.hero-visual { flex: 1.1; }
.dashboard-card { max-width: 560px; border-radius: 20px; background: var(--ld-card); border-color: rgba(var(--ld-fg),0.1);
  box-shadow: 0 40px 90px -30px rgba(var(--ld-acc),0.22), 0 0 0 1px rgba(var(--ld-fg),0.04); }
:root:not(.dark) .landing-root .dashboard-card { box-shadow: 0 30px 70px -30px rgba(14,17,15,0.28); }
.card-title { font-size: 0.78rem; color: var(--ld-ink); letter-spacing: 0.02em; text-transform: none; font-family: var(--ld-display); }
.card-live { color: var(--ld-acc-text); }
.mini-kpi { background: rgba(var(--ld-fg),0.04) !important; border: 1px solid rgba(var(--ld-fg),0.06) !important; padding: 14px 8px; }
.mini-kpi.purple { background: var(--ld-accent) !important; border-color: transparent !important; }
.mini-kpi.purple .kpi-val, .mini-kpi.purple .kpi-lbl { color: var(--ld-on-accent); }
.kpi-val { font-size: 1.75rem; }
.kpi-lbl { font-size: 0.74rem; }
.s-avatar { color: #0E110F !important; }
.s-name { font-size: 0.9rem; }
.s-count, .s-count b { color: var(--ld-ink-2); }
.feed-item { background: rgba(var(--ld-fg),0.03); border-color: rgba(var(--ld-fg),0.08); font-size: 0.8rem; color: var(--ld-ink-2); padding: 10px 12px; }
.feed-item b { color: var(--ld-ink); }
.feed-to { color: var(--ld-acc-text); }
.feed-team { font-size: 0.7rem; font-weight: 600; color: var(--ld-muted); white-space: nowrap; }
.mini-next { background: rgba(var(--ld-acc),0.08); border: 1px dashed rgba(var(--ld-fg),0.18); }
.next-lbl { color: var(--ld-acc-text); }
.float-badge { background: rgba(var(--ld-card-rgb),0.92); color: var(--ld-ink); border-color: rgba(var(--ld-fg),0.12); }
.fb-ic { background: rgba(var(--ld-acc),0.18); color: var(--ld-acc-text); }
/* Barra de CRMs bajo el hero */
.crm-bar { position: relative; z-index: 1; max-width: 1240px; margin: -40px auto 0; padding: 0 24px 24px; }
.crm-bar-inner { border-top: 1px solid rgba(var(--ld-fg),0.1); padding-top: 26px; display: flex; align-items: center; flex-wrap: wrap; gap: 14px 40px; }
.crm-bar-label { font-size: 0.85rem; color: var(--ld-muted); }
.crm-bar-name { font-family: var(--ld-display); font-weight: 700; font-size: 1.25rem; letter-spacing: -0.02em; color: var(--ld-faint); transition: color 0.2s; }
.crm-bar-name:hover { color: var(--ld-ink); }
/* Secciones */
.section-tag { background: rgba(var(--ld-acc),0.1); border-color: rgba(var(--ld-acc),0.3); color: var(--ld-acc-text); }
.feat-card, .role-card { background: var(--ld-card); border-color: rgba(var(--ld-fg),0.08); }
.pricing-card, .faq-item, .comparison-table-wrapper { background: var(--ld-card); }
.comparison-table th { background: var(--ld-card-2); }
:root:not(.dark) .landing-root .feat-card:hover,
:root:not(.dark) .landing-root .role-card:hover { box-shadow: 0 20px 40px -20px rgba(14,17,15,0.25); }
:root:not(.dark) .landing-root .presence-browser-frame { box-shadow: 0 40px 80px -30px rgba(14,17,15,0.35); }
.cta-glow { background: radial-gradient(ellipse, rgba(var(--ld-acc),0.14) 0%, transparent 70%); }
@media (max-width: 768px) {
  .crm-bar { margin-top: 0; }
  .crm-bar-inner { gap: 10px 24px; }
  .crm-bar-name { font-size: 1.05rem; }
}
/* Logo: mismo archivo, blanco en oscuro y negro en claro */
.ld-logo { filter: brightness(0) invert(1); }
:root:not(.dark) .ld-logo { filter: none; }
.ld-logo-light { display: none; }
:root:not(.dark) .ld-logo-dark { display: none; }
:root:not(.dark) .ld-logo-light { display: block; }
.theme-toggle-nav .ic-moon { display: none; }
:root:not(.dark) .theme-toggle-nav .ic-sun { display: none; }
:root:not(.dark) .theme-toggle-nav .ic-moon { display: block; }

/* ===== Demo animada: Oficina en Vivo ===== */
.office-demo { padding: 14px; }
.od-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.od-title { font-family: var(--ld-display); font-weight: 700; font-size: 0.95rem; color: var(--ld-ink); }
.od-legend { display: flex; gap: 6px; }
.od-legend-item { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 99px; font-size: 0.7rem; font-weight: 700; color: var(--ld-ink-2); background: rgba(var(--ld-fg),0.05); border: 1px solid rgba(var(--ld-fg),0.08); font-variant-numeric: tabular-nums; }
.od-legend-item i { width: 6px; height: 6px; border-radius: 50%; }
.od-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.od-card { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 16px; background: var(--ld-card); border: 1px solid rgba(var(--ld-fg),0.09); transition: border-color 0.4s, box-shadow 0.4s, background 0.4s; }
.od-card.is-active { border-color: rgba(var(--ld-acc),0.5); box-shadow: 0 10px 26px -16px rgba(var(--ld-acc),0.8); }
.od-card.is-offline { background: rgba(var(--ld-fg),0.02); }
.od-scene { position: relative; width: 78px; height: 78px; flex-shrink: 0; border-radius: 12px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(var(--ld-fg),0.1); transition: background 0.5s; }
.od-scene :deep(.pixel-agent) { padding: 3px 3px 0; }
.od-dot { position: absolute; top: 5px; right: 5px; width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--ld-card); }
.od-dot.is-pulse { animation: odPulse 1.8s infinite; }
@keyframes odPulse { 0% { box-shadow: 0 0 0 0 rgba(132,204,22,0.6); } 70% { box-shadow: 0 0 0 7px rgba(132,204,22,0); } 100% { box-shadow: 0 0 0 0 rgba(132,204,22,0); } }
.od-info { min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
.od-name { font-family: var(--ld-display); font-size: 0.85rem; font-weight: 700; color: var(--ld-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.od-card.is-offline .od-name { color: var(--ld-muted); }
.od-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 99px; font-size: 0.66rem; font-weight: 700; color: color-mix(in srgb, var(--c) 60%, var(--ld-ink)); background: color-mix(in srgb, var(--c) 16%, transparent); transition: color 0.4s, background 0.4s; }
.od-pill i { width: 5px; height: 5px; border-radius: 50%; background: var(--c); }
.od-stats { display: flex; gap: 12px; }
.od-stats span { display: flex; flex-direction: column; line-height: 1.1; }
.od-stats small { font-size: 0.6rem; color: var(--ld-muted); }
.od-stats strong { font-family: var(--ld-display); font-size: 1rem; color: var(--ld-ink); font-variant-numeric: tabular-nums; }
.od-move { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@media (max-width: 520px) {
  .od-grid { grid-template-columns: 1fr; }
  .od-legend { display: none; }
}
</style>
