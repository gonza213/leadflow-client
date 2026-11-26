<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTour } from '../../composables/useTour'
import { useAuthStore } from '../../stores/auth'
import { useConfigStore } from '../../stores/config'

const emit = defineEmits(['close'])
const { startTour } = useTour()
const { t, tm, rt, te } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()

const currentStep = ref(0)

// Rol para decidir qué secciones ve cada uno (igual que el menú lateral)
const role = computed(() => {
  if (authStore.isManager) return 'manager'
  if (authStore.isSeller) return 'seller'
  return 'viewer'
})
const pipelineOn = computed(() =>
  configStore.configSlug === authStore.tenantSlug && !!configStore.config?.pipeline_enabled
)

const svg = (paths) => `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

// Secciones de la guía; los textos viven en i18n (help.s.*).
// roles: quién la ve · path: a dónde lleva el botón "Ir a…" · isNew: etiqueta "Nuevo"
const sectionMeta = [
  { key: 'dashboard', roles: ['manager', 'seller', 'viewer'], path: '/',
    icon: svg('<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>') },
  { key: 'pipeline', roles: ['manager', 'seller', 'viewer'], path: '/pipeline', isNew: true, needsPipeline: true,
    icon: svg('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>') },
  { key: 'leads', roles: ['manager', 'seller', 'viewer'], path: '/leads',
    icon: svg('<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>') },
  { key: 'newLeads', roles: ['manager'], path: '/leads', isNew: true,
    icon: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>') },
  { key: 'presence', roles: ['manager', 'viewer'], path: '/presence',
    icon: svg('<path d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>') },
  { key: 'period', roles: ['manager'], path: '/config?tab=period',
    icon: svg('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') },
  { key: 'sellers', roles: ['manager', 'viewer'], path: '/sellers',
    icon: svg('<path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>') },
  { key: 'users', roles: ['manager'], path: '/users',
    icon: svg('<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>') },
  { key: 'config', roles: ['manager'], path: '/config',
    icon: svg('<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>') },
  { key: 'integrations', roles: ['manager'], path: '/integrations',
    icon: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>') },
  { key: 'summaries', roles: ['manager'], path: '/summaries',
    icon: svg('<path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>') },
  { key: 'algorithm', roles: ['manager', 'seller', 'viewer'],
    icon: svg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>') }
]

// Computed para que reaccione al cambio de idioma en vivo
const sections = computed(() => sectionMeta
  .filter(meta => meta.roles.includes(role.value))
  // Sin pipeline activo, solo el manager ve el paso (para saber cómo activarlo)
  .filter(meta => !meta.needsPipeline || pipelineOn.value || role.value === 'manager')
  .map(meta => {
    const base = `help.s.${meta.key}`
    // te() devuelve false para nodos array; tm() retorna {} si la clave no existe
    const rawItems = tm(`${base}.items`)
    // El pipeline apagado lleva a Configuración, donde se activa
    const path = meta.needsPipeline && !pipelineOn.value ? '/config' : meta.path
    return {
      ...meta,
      path,
      goLabel: meta.needsPipeline && !pipelineOn.value ? t('menu.config') : t(`${base}.t`),
      title: t(`${base}.t`),
      desc: te(`${base}.d`) ? t(`${base}.d`) : null,
      items: Array.isArray(rawItems) && rawItems.length ? rawItems.map(i => rt(i)) : null
    }
  }))

const current = computed(() => sections.value[Math.min(currentStep.value, sections.value.length - 1)])
const isLast = computed(() => currentStep.value >= sections.value.length - 1)

const prev = () => { if (currentStep.value > 0) currentStep.value-- }
const next = () => { if (!isLast.value) currentStep.value++ }

const goTo = (path) => {
  emit('close')
  router.push(path)
}

const handleStartTour = () => {
  emit('close')
  setTimeout(() => startTour(), 300)
}

const bold = (text) => text
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
</script>

<template>
  <Teleport to="body">
    <div class="help-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')">
      <div class="help-modal" role="dialog" aria-modal="true" :aria-label="t('help.title')">

        <!-- Header -->
        <div class="hm-header">
          <div class="hm-title-wrap">
            <div class="hm-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.6-2.8 2.6"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <h2 class="hm-title">{{ t('help.title') }}</h2>
              <p class="hm-subtitle">{{ t('help.step', { n: currentStep + 1, total: sections.length }) }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="hm-close" :aria-label="t('help.close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Progreso -->
        <div class="hm-progress" aria-hidden="true">
          <div class="hm-progress-bar" :style="{ width: ((currentStep + 1) / sections.length * 100) + '%' }" />
        </div>
        <div class="hm-dots">
          <button
            v-for="(s, i) in sections"
            :key="s.key"
            @click="currentStep = i"
            :class="['hm-dot', { active: i === currentStep, visited: i < currentStep }]"
            :title="s.title"
            :aria-label="s.title"
          />
        </div>

        <!-- Contenido del paso -->
        <div class="hm-body">
          <transition name="step" mode="out-in">
            <div v-if="current" :key="current.key" class="hm-step">
              <div class="hm-step-header">
                <div class="hm-step-icon" v-html="current.icon" />
                <div class="hm-step-heading">
                  <h3 class="hm-step-title">{{ current.title }}</h3>
                  <span v-if="current.isNew" class="hm-new">{{ t('help.newBadge') }}</span>
                </div>
              </div>

              <p v-if="current.desc" class="hm-step-desc">{{ current.desc }}</p>

              <ul v-if="current.items" class="hm-list">
                <li v-for="item in current.items" :key="item" v-html="bold(item)" />
              </ul>

              <button v-if="current.path" type="button" class="hm-go" @click="goTo(current.path)">
                {{ t('help.goTo', { section: current.goLabel }) }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </transition>
        </div>

        <!-- Navegación -->
        <div class="hm-footer">
          <button @click="handleStartTour" class="btn-tour">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {{ t('help.tourBtn') }}
          </button>
          <div class="hm-nav">
            <button @click="prev" :disabled="currentStep === 0" class="hm-nav-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              {{ t('help.prev') }}
            </button>
            <button v-if="!isLast" @click="next" class="hm-nav-btn primary">
              {{ t('help.next') }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button v-else @click="$emit('close')" class="hm-nav-btn primary">
              {{ t('help.done') }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Colores de la marca: lima #C8F23A, verde #4D7C0F, grafito #0E110F */
.help-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(8, 10, 9, 0.62);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: fade-in 0.2s ease;
}
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }

.help-modal {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  box-shadow: 0 30px 90px -20px rgba(0,0,0,0.45);
  animation: slide-up 0.25s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
@keyframes slide-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }

/* Header */
.hm-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 20px 24px 16px;
}
.hm-title-wrap { display: flex; align-items: center; gap: 12px; }
.hm-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: #c8f23a; color: #0e110f;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hm-title { font-size: 1rem; font-weight: 800; color: #0e110f; margin: 0; }
.hm-subtitle { font-size: 0.78rem; color: #8a9187; margin: 2px 0 0; }
.hm-close {
  padding: 8px; border-radius: 10px; border: none; background: none; cursor: pointer;
  color: #8a9187; transition: background 0.2s, color 0.2s;
}
.hm-close:hover { background: #eef0ea; color: #363b37; }

/* Progreso */
.hm-progress { height: 3px; background: #eef0ea; }
.hm-progress-bar { height: 100%; background: linear-gradient(90deg, #4d7c0f, #c8f23a); transition: width 0.3s ease; }
.hm-dots { display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; padding: 14px 24px 0; }
.hm-dot {
  width: 8px; height: 8px; border-radius: 99px;
  background: #dfe2da; border: none; cursor: pointer;
  transition: all 0.2s; padding: 0;
}
.hm-dot.visited { background: #a3e635; }
.hm-dot.active { background: #4d7c0f; width: 24px; }

/* Cuerpo */
.hm-body { padding: 22px 28px 24px; min-height: 260px; overflow-y: auto; }
.hm-step-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.hm-step-icon {
  width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #f1f8de; color: #4d7c0f;
}
.hm-step-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.hm-step-title { font-size: 1.25rem; font-weight: 800; color: #0e110f; margin: 0; letter-spacing: -0.01em; }
.hm-new {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 99px; background: #c8f23a; color: #0e110f;
}
.hm-step-desc { font-size: 0.92rem; color: #5b625b; line-height: 1.7; margin: 0 0 14px; }

.hm-list { padding: 0; margin: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
.hm-list li {
  font-size: 0.88rem; color: #5b625b; line-height: 1.6;
  padding-left: 20px; position: relative;
}
.hm-list li::before {
  content: ''; position: absolute; left: 4px; top: 0.62em;
  width: 6px; height: 6px; border-radius: 50%; background: #65a30d;
}
.hm-list li :deep(strong) { color: #1d221e; font-weight: 700; }

.hm-go {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 18px;
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 0.86rem; font-weight: 700; color: #4d7c0f;
}
.hm-go:hover { text-decoration: underline; }

/* Transición entre pasos */
.step-enter-active, .step-leave-active { transition: all 0.2s ease; }
.step-enter-from { opacity: 0; transform: translateX(16px); }
.step-leave-to { opacity: 0; transform: translateX(-16px); }

/* Footer */
.hm-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eef0ea;
}
.btn-tour {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; color: #4d7c0f;
  font-weight: 700; font-size: 0.8rem;
  padding: 9px 12px; border-radius: 10px; border: 1.5px solid #d9f99d;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-tour:hover { background: #f7fee7; border-color: #65a30d; }

.hm-nav { display: flex; gap: 8px; }
.hm-nav-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 10px; border: 1.5px solid #dfe2da;
  background: transparent; color: #5b625b;
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.hm-nav-btn:hover:not(:disabled) { background: #f6f7f3; color: #1d221e; }
.hm-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.hm-nav-btn.primary { background: #c8f23a; color: #0e110f; border-color: #c8f23a; }
.hm-nav-btn.primary:hover { background: #b5e02a; border-color: #b5e02a; color: #0e110f; }

/* ===== Modo oscuro (la app pone .dark en <html>) ===== */
:root.dark .help-modal { background: #0e110f; border: 1px solid rgba(255,255,255,0.08); }
:root.dark .hm-title, :root.dark .hm-step-title { color: #eef0ea; }
:root.dark .hm-subtitle { color: #8a9187; }
:root.dark .hm-close:hover { background: rgba(255,255,255,0.08); color: #dfe2da; }
:root.dark .hm-progress { background: rgba(255,255,255,0.06); }
:root.dark .hm-dot { background: #2b302c; }
:root.dark .hm-dot.visited { background: #4d7c0f; }
:root.dark .hm-dot.active { background: #c8f23a; }
:root.dark .hm-step-icon { background: rgba(200,242,58,0.12); color: #c8f23a; }
:root.dark .hm-step-desc, :root.dark .hm-list li { color: #a3a9a2; }
:root.dark .hm-list li::before { background: #c8f23a; }
:root.dark .hm-list li :deep(strong) { color: #eef0ea; }
:root.dark .hm-go { color: #c8f23a; }
:root.dark .hm-footer { border-color: rgba(255,255,255,0.07); }
:root.dark .btn-tour { border-color: rgba(200,242,58,0.3); color: #c8f23a; }
:root.dark .btn-tour:hover { background: rgba(200,242,58,0.08); border-color: rgba(200,242,58,0.5); }
:root.dark .hm-nav-btn { border-color: rgba(255,255,255,0.1); color: #a3a9a2; }
:root.dark .hm-nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: #dfe2da; }
:root.dark .hm-nav-btn.primary { background: #c8f23a; color: #0e110f; border-color: #c8f23a; }

@media (max-width: 520px) {
  .hm-body { padding: 18px 20px 20px; }
  .hm-footer { flex-wrap: wrap; }
  .btn-tour { order: 2; width: 100%; justify-content: center; }
  .hm-nav { width: 100%; }
  .hm-nav-btn { flex: 1; justify-content: center; }
}
</style>
