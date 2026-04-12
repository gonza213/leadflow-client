<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const scrolled = ref(false)
const menuOpen = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.documentElement.style.scrollBehavior = 'smooth'
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.documentElement.style.scrollBehavior = ''
})
</script>

<template>
  <div class="landing-root">

    <!-- NAV -->
    <nav :class="['landing-nav', { 'nav-scrolled': scrolled }]">
      <div class="nav-inner">
        <a href="#" class="logo">
          <img src="/logo_leaddistro.png" alt="LeadDistro Logo" class="h-14 dark:brightness-0 dark:invert" />
        </a>
        <ul class="nav-links">
          <li><a href="#features">Funciones</a></li>
          <li><a href="#how">Cómo funciona</a></li>
          <li><a href="#roles">Roles</a></li>
          <li><a href="#integraciones">Integraciones</a></li>
          <li><a href="#pricing">Precios</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <button @click="router.push('/login')" class="btn-nav">Iniciar sesión →</button>
        <div class="nav-mobile-right">
          <button @click="menuOpen = !menuOpen" class="hamburger" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div :class="['mobile-menu', { 'open': menuOpen }]">
        <a href="#features" @click="menuOpen = false">Funciones</a>
        <a href="#how" @click="menuOpen = false">Cómo funciona</a>
        <a href="#roles" @click="menuOpen = false">Roles</a>
        <a href="#integraciones" @click="menuOpen = false">Integraciones</a>
        <a href="#pricing" @click="menuOpen = false">Precios</a>
        <a href="#faq" @click="menuOpen = false">FAQ</a>
        <button @click="router.push('/login'); menuOpen = false" class="btn-nav mobile-cta">Iniciar sesión →</button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero" id="top">
      <div class="glow-1"></div>
      <div class="glow-2"></div>
      <div class="hero-content">
        <div class="badge-pill">
          <span class="badge-dot"></span>
          Para agencias en LATAM y Estados Unidos
        </div>
        <h1 class="hero-title">
          Distribución de leads<br/>
          <span class="gradient-text">inteligente y automática</span>
        </h1>
        <p class="hero-subtitle">
          LeadDistro asigna cada lead al vendedor correcto según capacidad, equipo y límites — sin intervención manual, sin leads perdidos.
        </p>
        <div class="hero-actions">
          <button @click="router.push('/register')" class="btn-primary">
            Empezar gratis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button @click="router.push('/login')" class="btn-ghost">Ya tengo cuenta →</button>
        </div>
        <div class="hero-trust">
          <span>✓ 7 días gratis</span>
          <span class="trust-sep">·</span>
          <span>✓ Sin tarjeta de crédito</span>
          <span class="trust-sep">·</span>
          <span>✓ Setup en 5 minutos</span>
          <span class="trust-sep">·</span>
          <span>✓ Cancelás cuando querés</span>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">100%</span><span class="stat-label">Leads asignados</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">USD 25</span><span class="stat-label">Por mes, sin contratos</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">9+</span><span class="stat-label">CRMs compatibles</span></div>
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
              <div class="mini-kpi blue"><span class="kpi-val">247</span><span class="kpi-lbl">Leads totales</span></div>
              <div class="mini-kpi emerald"><span class="kpi-val">12</span><span class="kpi-lbl">Vendedores activos</span></div>
              <div class="mini-kpi purple"><span class="kpi-val">96%</span><span class="kpi-lbl">Asignados</span></div>
            </div>
            <div class="mini-sellers">
              <div class="mini-seller" v-for="s in mockSellers" :key="s.name">
                <div class="s-avatar" :style="{ background: s.color }">{{ s.initials }}</div>
                <div class="s-info">
                  <span class="s-name">{{ s.name }}</span>
                  <div class="s-bar"><div class="s-fill" :style="{ width: s.pct + '%', background: s.color }"></div></div>
                </div>
                <span class="s-count">{{ s.count }}/{{ s.limit }}</span>
              </div>
            </div>
            <div class="mini-next">
              <span class="next-lbl">Próxima asignación →</span>
              <span class="next-val">Equipo CH · Karla Perez</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" id="features">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">Funcionalidades</div>
          <h2 class="section-title">Todo lo que necesita tu equipo de ventas</h2>
          <p class="section-sub">Un sistema diseñado para que ningún lead quede sin atender y cada vendedor trabaje a su máxima capacidad.</p>
        </div>

        <div class="features-grid">
          <!-- Feature grande -->
          <div class="feat-card feat-large">
            <div class="feat-icon icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3>Distribución automática con algoritmo inteligente</h3>
            <p>Cada lead entrante se asigna al vendedor más disponible del equipo proporcional. El algoritmo considera capacidad semanal, carga diaria y ratio del vendedor.</p>
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
          <div class="section-tag">Flujo de trabajo</div>
          <h2 class="section-title">Cómo funciona LeadDistro</h2>
          <p class="section-sub">Desde que entra un lead en tu CRM hasta que está en manos de tu vendedor — todo automático.</p>
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
          <div class="section-tag">Control de acceso</div>
          <h2 class="section-title">Roles diseñados para tu equipo</h2>
          <p class="section-sub">Cada persona ve y puede hacer exactamente lo que necesita. Tu cuenta incluye Manager y Vendedores.</p>
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
          <div class="section-tag">Integraciones</div>
          <h2 class="section-title">Integraciones con HubSpot, GoHighLevel y monday.com</h2>
          <p class="section-sub">LeadDistro se integra perfectamente con tu CRM y herramientas de automatización. Somos la solución especializada en distribución de leads para equipos que usan HubSpot, GHL, monday y más.</p>
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
              {{ platform.status === 'optimized' ? 'Optimizado' : 'Webhook' }}
            </div>
          </div>
        </div>

        <!-- Flujo técnico -->
        <div class="integration-layout" style="margin-top: 64px">
          <div class="int-text">
            <div class="section-tag">Cómo conectar</div>
            <h2 class="section-title text-left">Configuración en menos de 5 minutos</h2>
            <p class="section-sub text-left" style="margin: 0 0 32px">Solo necesitás copiar la URL de tu tenant y pegarla en el workflow de tu herramienta. Sin código, sin APIs complejas.</p>
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
              <span>LeadDistro asigna el vendedor</span>
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

    <!-- PRICING -->
    <section class="section" id="pricing">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">Precios</div>
          <h2 class="section-title">Simple y transparente</h2>
          <p class="section-sub">Un solo plan, sin contratos anuales. Pagás mes a mes y cancelás cuando quieras.</p>
        </div>
        <div class="pricing-grid">

          <!-- Plan mensual -->
          <div class="pricing-card pricing-main">
            <div class="pricing-popular">Más popular</div>
            <h3 class="pricing-name">Plan Mensual</h3>
            <div class="pricing-price">
              <span class="price-currency">USD</span>
              <span class="price-amount">25</span>
              <span class="price-period">/ mes</span>
            </div>
            <p class="pricing-desc">Todo lo que necesita tu agencia para no perder ni un lead.</p>
            <ul class="pricing-features">
              <li>✓ Vendedores ilimitados</li>
              <li>✓ Leads ilimitados</li>
              <li>✓ Multi-equipo con % configurables</li>
              <li>✓ Dashboard en tiempo real</li>
              <li>✓ Integración con cualquier CRM</li>
              <li>✓ Exportación de leads a CSV</li>
              <li>✓ Soporte incluido</li>
            </ul>
            <button @click="router.push('/register')" class="btn-primary btn-full">
              Empezar gratis
            </button>
          </div>

          <!-- Setup opcional -->
          <div class="pricing-card pricing-addon">
            <div class="pricing-optional">Opcional</div>
            <h3 class="pricing-name">Setup & Configuración</h3>
            <div class="pricing-price">
              <span class="price-currency">USD</span>
              <span class="price-amount">100</span>
              <span class="price-period">única vez</span>
            </div>
            <p class="pricing-desc">Nosotros configuramos todo por vos. Listo en menos de 24 horas.</p>
            <ul class="pricing-features">
              <li>✓ Configuración completa del sistema</li>
              <li>✓ Integración con tu CRM</li>
              <li>✓ Alta de equipos y vendedores</li>
              <li>✓ Configuración de webhooks</li>
              <li>✓ Capacitación del equipo</li>
            </ul>
            <a href="https://wa.me/542212204194?text=Hola!%20Me%20interesa%20el%20setup%20de%20LeadDistro%20con%20mi%20CRM" target="_blank" class="btn-secondary btn-full">
              Consultar setup
            </a>
          </div>

        </div>
        <p class="pricing-note">¿Tenés dudas? Escribinos por WhatsApp y te respondemos al instante.</p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" id="faq">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">Preguntas frecuentes</div>
          <h2 class="section-title">Todo lo que necesitás saber</h2>
          <p class="section-sub">Si tenés más dudas, escribinos por WhatsApp y te respondemos al instante.</p>
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
            Multi-tenant · Multi-equipo · Tiempo real
          </div>
          <h2 class="cta-title">¿Listo para empezar?</h2>
          <p class="cta-sub">Registrate en segundos y empezá a distribuir leads hoy. 7 días gratis, sin tarjeta de crédito. Desde $25 USD/mes.</p>
          <div class="cta-actions">
            <button @click="router.push('/register')" class="btn-primary btn-lg">
              Empezar gratis →
            </button>
            <button @click="router.push('/login')" class="btn-ghost btn-lg">Ya tengo cuenta</button>
          </div>
          <div class="cta-feats">
            <span>✓ Setup en 5 minutos</span>
            <span>✓ Integración CRM</span>
            <span>✓ Sin leads perdidos</span>
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
            <p>Distribución inteligente de leads para equipos de ventas modernos.</p>
          </div>
          <div class="footer-links">
            <div class="footer-col">
              <span class="fcol-title">Producto</span>
              <a href="#features">Funciones</a>
              <a href="#how">Cómo funciona</a>
              <a href="#integraciones">Integraciones</a>
              <a href="#pricing">Precios</a>
            </div>
            <div class="footer-col">
              <span class="fcol-title">Acceso</span>
              <button @click="router.push('/login')" class="footer-link-btn">Iniciar sesión</button>
              <button @click="router.push('/register')" class="footer-link-btn">Crear cuenta</button>
            </div>
            <div class="footer-col">
              <span class="fcol-title">Legal</span>
              <button @click="router.push('/privacy')" class="footer-link-btn">Política de privacidad</button>
              <button @click="router.push('/terms')" class="footer-link-btn">Términos de servicio</button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          © 2026 LeadDistro. Todos los derechos reservados. ·
          <button @click="router.push('/privacy')" class="footer-inline-link">Privacidad</button> ·
          <button @click="router.push('/terms')" class="footer-inline-link">Términos</button>
        </div>
      </div>
    </footer>
  </div>

  <!-- WhatsApp floating button -->
  <a
    href="https://wa.me/542212204194?text=Hola!%20Me%20interesa%20LeadDistro%20para%20mi%20equipo%20de%20ventas"
    target="_blank"
    class="wa-float"
    title="Contactar por WhatsApp"
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    <span class="wa-label">¿Consultas?</span>
  </a>
</template>

<script>
export default {
  data() {
    return {
      openFaq: null,
      faqs: [
        {
          q: '¿Cómo funciona la distribución automática de leads?',
          a: 'Cuando tu CRM envía un lead al webhook de LeadDistro, el sistema identifica el equipo destino según los porcentajes configurados, y dentro de ese equipo selecciona al vendedor con mayor capacidad disponible (menor ratio carga/límite). Todo ocurre en milisegundos y el resultado vuelve al CRM automáticamente.'
        },
        {
          q: '¿Con qué CRMs se integra LeadDistro?',
          a: 'LeadDistro se integra con cualquier plataforma que soporte webhooks: GoHighLevel, HubSpot, Salesforce, Pipedrive, ActiveCampaign, Make, Zapier, n8n y muchos más. Si tu CRM puede enviar un HTTP POST, funciona con LeadDistro.'
        },
        {
          q: '¿Qué pasa si todos los vendedores alcanzan su límite?',
          a: 'Podés configurar hasta 2 vendedores de respaldo (fallback). Cuando todos los vendedores activos alcanzan su límite diario o semanal, los leads se redirigen automáticamente a esos vendedores de respaldo. Así nunca queda un lead sin asignar.'
        },
        {
          q: '¿Puedo tener múltiples equipos con distribuciones distintas?',
          a: 'Sí. Podés crear tantos equipos como necesitás y asignarle a cada uno un porcentaje del total de leads. Por ejemplo: Equipo A recibe 60% y Equipo B el 40%. Cada equipo tiene sus propios vendedores, límites y configuraciones.'
        },
        {
          q: '¿Qué sucede cuando vence el período de prueba?',
          a: 'Al vencer los 7 días de prueba, tu cuenta queda en estado inactivo. No perdés ningún dato — al suscribirte por $25 USD/mes recuperás el acceso inmediatamente con toda tu configuración intacta.'
        },
        {
          q: '¿Puedo cancelar en cualquier momento?',
          a: 'Sí, sin permanencia ni penalidades. Al cancelar tu suscripción no se renueva el siguiente mes. Tus datos permanecen disponibles hasta el final del período pagado.'
        },
        {
          q: '¿Los datos de mis leads están seguros?',
          a: 'Sí. Cada empresa tiene su propio tenant aislado — ningún dato es accesible desde otra cuenta. Las comunicaciones van cifradas por HTTPS y las contraseñas se guardan con hash bcrypt. No compartimos ni vendemos datos de ningún tipo.'
        },
        {
          q: '¿Qué incluye el servicio de setup?',
          a: 'El servicio de setup ($100 USD, pago único) incluye: configuración completa del sistema, integración con tu CRM, alta de equipos y vendedores, configuración de webhooks y una sesión de capacitación para tu equipo. Todo listo en menos de 24 horas.'
        }
      ],
      mockSellers: [
        { name: 'Karla Perez', initials: 'KP', color: '#3b82f6', pct: 43, count: 43, limit: 60 },
        { name: 'Christopher Valles', initials: 'CV', color: '#22c55e', pct: 35, count: 32, limit: 90 },
        { name: 'Adrian Anez', initials: 'AA', color: '#eab308', pct: 67, count: 40, limit: 60 }
      ],
      algoSteps: [
        { n: '1', text: 'Lead entra por webhook desde el CRM', success: false },
        { n: '2', text: 'Se determina el equipo target por porcentaje', success: false },
        { n: '3', text: 'Se selecciona el vendedor con menor ratio', success: false },
        { n: '✓', text: 'Lead asignado y notificado automáticamente', success: true }
      ],
      features: [
        {
          title: 'Equipos con porcentajes configurables',
          desc: 'Dividí tu fuerza de ventas en equipos y definí qué porcentaje de los leads recibe cada uno. CH 60% — MH 40%, o cualquier combinación que sume 100%.',
          iconClass: 'icon-green',
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
        },
        {
          title: 'Límites diarios y semanales por vendedor',
          desc: 'Configurá cuántos leads puede manejar cada vendedor por día y por semana. Cuando llega al límite, el sistema lo salta automáticamente.',
          iconClass: 'icon-purple',
          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
        },
        {
          title: 'Vendedores de respaldo (Fallback)',
          desc: 'Configurá hasta 2 vendedores de respaldo. Cuando todos alcanzan su límite, los nuevos leads se redirigen a ellos para que nunca quede uno sin asignar.',
          iconClass: 'icon-orange',
          icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
        },
        {
          title: 'Dashboard de métricas en tiempo real',
          desc: 'Visualizá leads por vendedor, etapas del funnel, estados y distribución por equipos. Filtrá por período, vendedor, equipo o etapa.',
          iconClass: 'icon-cyan',
          icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
        }
      ],
      steps: [
        {
          title: 'Webhook desde el CRM',
          desc: 'Tu CRM envía automáticamente el lead a la URL única de tu tenant. Solo pegás la URL en tu workflow.',
          icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
        },
        {
          title: 'Algoritmo de asignación',
          desc: 'El sistema determina el equipo por porcentaje y selecciona al vendedor con más capacidad disponible (menor ratio carga/límite).',
          icon: '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>'
        },
        {
          title: 'Notificación al vendedor',
          desc: 'Tu CRM recibe el webhook de respuesta con los datos del vendedor asignado y ejecuta tu workflow de notificación.',
          icon: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 15.1"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>'
        },
        {
          title: 'Lead registrado',
          desc: 'El lead queda en LeadDistro con vendedor, equipo, etapa y fecha. Disponible en el dashboard con todos los filtros.',
          icon: '<polyline points="20 6 9 17 4 12"/>'
        }
      ],
      roles: [
        {
          name: 'Manager',
          class: 'role-manager',
          badgeClass: 'badge-blue',
          iconClass: 'ricon-blue',
          title: 'Manager del equipo',
          desc: 'Acceso completo a su tenant. Configura equipos, vendedores, períodos, etapas e integración con el CRM.',
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
          perms: ['✓ Dashboard completo con filtros', '✓ Crear/editar/eliminar vendedores', '✓ Configurar equipos y % distribución', '✓ Configurar integración CRM', '✓ Exportar leads a CSV', '✓ Gestionar usuarios del tenant']
        },
        {
          name: 'Viewer',
          class: 'role-viewer',
          badgeClass: 'badge-yellow',
          iconClass: 'ricon-yellow',
          title: 'Visor / Supervisor',
          desc: 'Puede ver todos los leads y editar su información, pero no puede crear ni eliminar registros ni acceder a configuración.',
          icon: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
          perms: ['✓ Ver todos los leads del tenant', '✓ Editar etapa y datos del lead', '✓ Dashboard con métricas generales', '✗ No puede crear ni eliminar', '✗ Sin acceso a configuración']
        },
        {
          name: 'Seller',
          class: 'role-seller',
          badgeClass: 'badge-green',
          iconClass: 'ricon-green',
          title: 'Vendedor',
          desc: 'Accede solo a sus propios leads asignados. Ve sus métricas individuales de capacidad y puede gestionar el estado de sus leads.',
          icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
          perms: ['✓ Ver sus propios leads asignados', '✓ Editar etapa de sus leads', '✓ Exportar leads a CSV', '✓ Ver sus métricas individuales', '✗ No ve leads de otros vendedores', '✗ Sin acceso a configuración']
        }
      ],
      integrations: [
        {
          name: 'GoHighLevel',
          desc: 'El aliado #1 para agencias GHL',
          status: 'optimized',
          bg: 'rgba(34,197,94,0.12)',
          color: '#22c55e',
          icon: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>'
        },
        {
          name: 'Kommo (amoCRM)',
          desc: 'Potenciá tus ventas por WhatsApp',
          status: 'webhook',
          bg: 'rgba(59,130,246,0.12)',
          color: '#3b82f6',
          icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.9.1"/><path d="M7 11V7l5-2 5 2v4"/><path d="M7 11l5 2 5-2M12 13v8"/>'
        },
        {
          name: 'monday.com',
          desc: 'El cerebro de asignación para monday',
          status: 'webhook',
          bg: 'rgba(0,202,114,0.12)',
          color: '#00ca72',
          icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
        },
        {
          name: 'HubSpot',
          desc: 'Distribución inteligente para tu CRM',
          status: 'webhook',
          bg: 'rgba(249,115,22,0.12)',
          color: '#f97316',
          icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>'
        },
        {
          name: 'Clientify',
          desc: 'Impulsá tu CRM de marketing',
          status: 'webhook',
          bg: 'rgba(225,29,72,0.12)',
          color: '#e11d48',
          icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
        },
        {
          name: 'Make / Zapier',
          desc: 'Conectá con más de 3000 apps',
          status: 'webhook',
          bg: 'rgba(139,92,246,0.12)',
          color: '#8b5cf6',
          icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
        }
      ],
      intSteps: [
        { title: 'Copiás la URL del webhook', desc: 'Desde configuración de LeadDistro, copiás la URL única de tu tenant.' },
        { title: 'Pegala en tu workflow del CRM', desc: 'En el workflow de "nuevo contacto" de tu CRM, agregás la acción webhook apuntando a esa URL.' },
        { title: 'Configurás el webhook de respuesta', desc: 'LeadDistro te envía el nombre del vendedor asignado para que puedas notificarlo desde tu CRM.' }
      ]
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
.hero-subtitle { font-size: 1.05rem; color: #94a3b8; margin-bottom: 36px; line-height: 1.7; }
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
.hero-stats { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.stat { display: flex; flex-direction: column; }
.stat-num { font-size: 1.3rem; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
.stat-label { font-size: 0.76rem; color: #64748b; font-weight: 500; }
.stat-divider { width: 1px; height: 34px; background: rgba(255,255,255,0.1); }

/* ===== HERO VISUAL ===== */
.hero-visual { position: relative; z-index: 1; flex: 1; display: flex; justify-content: flex-end; }
.dashboard-card {
  background: rgba(15,23,42,0.92); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; width: 360px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1);
  backdrop-filter: blur(20px); overflow: hidden;
}
.card-header {
  display: flex; align-items: center; gap: 8px;
  padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.card-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #eab308; }
.dot.green { background: #22c55e; }
.card-title { font-size: 0.76rem; color: #64748b; }
.card-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.mini-kpis { display: flex; gap: 8px; }
.mini-kpi {
  flex: 1; border-radius: 10px; padding: 11px;
  display: flex; flex-direction: column; gap: 3px;
}
.mini-kpi.blue { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15); }
.mini-kpi.emerald { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.15); }
.mini-kpi.purple { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15); }
.kpi-val { font-size: 1.3rem; font-weight: 800; color: #fff; line-height: 1; }
.kpi-lbl { font-size: 0.65rem; color: #64748b; font-weight: 500; }
.mini-sellers { display: flex; flex-direction: column; gap: 8px; }
.mini-seller { display: flex; align-items: center; gap: 8px; }
.s-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.s-info { flex: 1; min-width: 0; }
.s-name { font-size: 0.76rem; font-weight: 600; color: #e2e8f0; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s-bar { height: 3px; background: rgba(255,255,255,0.08); border-radius: 4px; margin-top: 4px; overflow: hidden; }
.s-fill { height: 100%; border-radius: 4px; }
.s-count { font-size: 0.7rem; color: #64748b; font-weight: 600; flex-shrink: 0; }
.mini-next { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15); border-radius: 8px; padding: 9px 11px; }
.next-lbl { font-size: 0.65rem; color: #64748b; display: block; }
.next-val { font-size: 0.8rem; font-weight: 700; color: #93c5fd; }

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
.section-sub { font-size: 1rem; color: #64748b; max-width: 560px; margin: 0 auto; line-height: 1.7; }
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
.feat-card p { font-size: 0.875rem; color: #64748b; line-height: 1.65; }
.algo-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 20px; }
.algo-step {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px; padding: 9px 13px; font-size: 0.84rem; color: #94a3b8;
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
  background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
  border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #60a5fa;
}
.step-item h3 { font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
.step-item p { font-size: 0.83rem; color: #64748b; line-height: 1.6; }
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
.role-card p { font-size: 0.84rem; color: #64748b; line-height: 1.6; margin-bottom: 18px; }
.role-perms { display: flex; flex-direction: column; gap: 5px; list-style: none; }
.role-perms li { font-size: 0.82rem; color: #94a3b8; }
.role-perms li.perm-no { color: #475569; }

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
.int-card-info span { font-size: 0.75rem; color: #64748b; margin-top: 2px; }
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
.int-step p { font-size: 0.83rem; color: #64748b; line-height: 1.6; }
.int-visual { display: flex; flex-direction: column; gap: 10px; }
.wh-card { background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 13px; overflow: hidden; }
.wh-header {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 15px; border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.76rem; color: #64748b;
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

/* ===== PRICING ===== */
.pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 820px; margin: 0 auto; }
.pricing-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 36px 32px; position: relative; display: flex; flex-direction: column; gap: 16px; }
.dark .pricing-card { background: #1e293b; border-color: #334155; }
.pricing-main { border-color: #6366f1; box-shadow: 0 8px 32px rgba(99,102,241,0.13); }
.dark .pricing-main { border-color: #6366f1; }
.pricing-popular { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 16px; border-radius: 99px; white-space: nowrap; letter-spacing: 0.04em; }
.pricing-optional { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #64748b; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 16px; border-radius: 99px; white-space: nowrap; letter-spacing: 0.04em; }
.pricing-name { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-top: 8px; }
.dark .pricing-name { color: #f1f5f9; }
.pricing-price { display: flex; align-items: baseline; gap: 4px; }
.price-currency { font-size: 1.1rem; font-weight: 700; color: #6366f1; }
.price-amount { font-size: 2.4rem; font-weight: 800; color: #0f172a; line-height: 1; word-break: break-all; }
.dark .price-amount { color: #f1f5f9; }
.price-period { font-size: 0.95rem; color: #64748b; font-weight: 500; }
.pricing-desc { font-size: 0.9rem; color: #64748b; line-height: 1.6; }
.pricing-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.pricing-features li { font-size: 0.88rem; color: #475569; display: flex; align-items: center; gap: 8px; }
.dark .pricing-features li { color: #94a3b8; }
.pricing-features li::before { content: none; }
.btn-full { width: 100%; justify-content: center; text-align: center; display: flex; align-items: center; padding: 13px 20px; border-radius: 10px; font-weight: 600; font-size: 0.95rem; text-decoration: none; transition: all 0.2s; }
.pricing-main .btn-full { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
.pricing-main .btn-full:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.45); transform: translateY(-1px); }
.pricing-addon .btn-full { background: transparent; color: #6366f1; border: 1.5px solid #6366f1; }
.pricing-addon .btn-full:hover { background: rgba(99,102,241,0.07); }
.currency-toggle { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.05); border-radius: 8px; padding: 3px; }
.dark .currency-toggle { background: rgba(255,255,255,0.07); }
.flag-btn { background: transparent; border: none; cursor: pointer; font-size: 1.25rem; width: 34px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; opacity: 0.45; }
.flag-btn.active { background: #fff; opacity: 1; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
.dark .flag-btn.active { background: #334155; }
.pricing-note { text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 28px; }
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
.cta-sub { font-size: 1rem; color: #64748b; line-height: 1.7; margin-bottom: 34px; }
.cta-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.cta-feats { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; font-size: 0.8rem; color: #475569; font-weight: 500; }
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
.footer-brand p { font-size: 0.84rem; color: #475569; margin-top: 12px; line-height: 1.6; max-width: 260px; }
.footer-links { display: flex; gap: 48px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.fcol-title { font-size: 0.75rem; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.footer-col a { font-size: 0.84rem; color: #475569; transition: color 0.2s; cursor: pointer; }
.footer-col a:hover { color: #94a3b8; }
.footer-link-btn { font-size: 0.84rem; color: #475569; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.2s; }
.footer-link-btn:hover { color: #94a3b8; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; font-size: 0.78rem; color: #334155; text-align: center; }
.footer-inline-link { background: none; border: none; cursor: pointer; color: #475569; font-size: 0.78rem; padding: 0; transition: color 0.2s; }
.footer-inline-link:hover { color: #94a3b8; }

/* ===== HERO TRUST BAR ===== */
.hero-trust {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px 10px;
  margin-top: 20px; margin-bottom: 8px;
}
.hero-trust span {
  font-size: 0.8rem; color: #64748b; font-weight: 500; white-space: nowrap;
}
.trust-sep { color: #334155; font-size: 0.75rem; }

/* ===== FAQ ===== */
.faq-list { max-width: 740px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.faq-item {
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px;
  overflow: hidden; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
}
.dark .faq-item { background: #1e293b; border-color: #334155; }
.faq-item:hover { border-color: #6366f1; box-shadow: 0 4px 16px rgba(99,102,241,0.08); }
.faq-open { border-color: #6366f1 !important; box-shadow: 0 4px 16px rgba(99,102,241,0.12) !important; }
.faq-question {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; gap: 16px;
  font-size: 0.95rem; font-weight: 600; color: #0f172a;
  user-select: none;
}
.dark .faq-question { color: #f1f5f9; }
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
  margin: 0; font-size: 0.88rem; color: #475569; line-height: 1.7;
  border-top: 1px solid #f0f4f8; padding-top: 16px;
}
.dark .faq-answer p { color: #94a3b8; border-top-color: #334155; }

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero { flex-direction: column; text-align: center; padding-bottom: 60px; }
  .hero-content { max-width: 100%; }
  .hero-actions { justify-content: center; }
  .hero-stats { justify-content: center; }
  .hero-visual { justify-content: center; }
  .integrations-grid { grid-template-columns: 1fr 1fr; }
  .integration-layout { grid-template-columns: 1fr; }
  .section-title.text-left,.section-sub.text-left { text-align: center; }
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
  .dashboard-card { width: min(360px, 100%); }
  .integrations-grid { grid-template-columns: 1fr; }
}
</style>
