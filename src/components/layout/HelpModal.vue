<script setup>
import { ref } from 'vue'
import { useTour } from '../../composables/useTour'

const emit = defineEmits(['close'])
const { startTour } = useTour()

const currentStep = ref(0)

const sections = [
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.12)',
    title: 'Dashboard',
    desc: 'Visualizá métricas en tiempo real: leads por vendedor, distribución por equipo, etapas del funnel y más. Usá los filtros de período para analizar rangos específicos.'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    iconColor: '#f43f5e',
    iconBg: 'rgba(244,63,94,0.12)',
    title: 'Período de Distribución',
    desc: 'El período es el ciclo activo de trabajo. Es fundamental para que las métricas y los límites de los vendedores funcionen correctamente.',
    items: [
      '**Ciclo de Límites**: Los límites de leads se contabilizan dentro de las fechas del período activo.',
      '**Métricas**: El Dashboard muestra por defecto los datos del período configurado.',
      '**Tipos**: Puede ser **Manual** (fechas fijas) o **Automático** (se reinicia solo cada semana).',
      '**Vencimiento**: Si vence, verás un aviso para actualizarlo y mantener la distribución activa.'
    ]
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.12)',
    title: 'Leads',
    desc: 'Listado completo de leads ingresados al sistema. Filtrá por vendedor, equipo, etapa y período. Exportá cualquier resultado a CSV con un clic.'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.12)',
    title: 'Vendedores',
    desc: 'Creá y administrá tu equipo de ventas. Asignales límites diarios y semanales. El algoritmo de distribución respeta estos límites automáticamente.'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,0.12)',
    title: 'Usuarios',
    desc: 'Gestioná los accesos de tu organización. Asigná roles de Manager, Viewer o Seller a cada usuario del tenant.'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    iconColor: '#64748b',
    iconBg: 'rgba(100,116,139,0.12)',
    title: 'Configuración',
    items: [
      '**Equipos**: Definí los equipos de ventas y el porcentaje de leads que recibe cada uno (deben sumar 100%).',
      '**Etapas**: Configurá las etapas del pipeline (Nuevo, Contactado, Calificado, Cerrado).',
      '**Respaldo (Fallback)**: Configurá hasta 2 vendedores de respaldo para cuando todos alcancen su límite.',
      '**Zona horaria**: Configurá la zona horaria de tu organización para que los límites y reportes sean correctos.'
    ]
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    iconColor: '#06b6d4',
    iconBg: 'rgba(6,182,212,0.12)',
    title: 'Integraciones',
    items: [
      '**Plataformas**: Compatible con GoHighLevel, HubSpot, Make, Zapier, ActiveCampaign, Pipedrive, n8n y cualquier herramienta que soporte webhooks.',
      '**Webhook de entrada**: Copiá la URL única de tu tenant desde la sección Integraciones y pegala en tu workflow del CRM.',
      '**Webhook de salida**: LeadDistro notifica a tu CRM con el nombre e ID del vendedor asignado.',
      '**Cambio de etapa**: Usá el segundo webhook para sincronizar los cambios de etapa desde tu CRM al sistema.'
    ]
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
    iconColor: '#6366f1',
    iconBg: 'rgba(99,102,241,0.12)',
    title: 'Resúmenes IA',
    items: [
      '**Qué es**: El sistema genera automáticamente un resumen de métricas con OpenAI y lo guarda para que puedas consultarlo cuando quieras.',
      '**Configuración**: Activalo desde Configuración → Resumen IA. Elegí frecuencia diaria o semanal y la hora de envío.',
      '**PDF**: Desde cada resumen podés descargar un PDF profesional con el análisis y las métricas del período.',
      '**Webhook**: Si configurás una URL de Make o Zapier, el resumen también se envía automáticamente al generarse.'
    ]
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    iconColor: '#ec4899',
    iconBg: 'rgba(236,72,153,0.12)',
    title: 'Algoritmo de distribución',
    desc: 'Cuando entra un lead, el sistema calcula el equipo target según los porcentajes configurados. Dentro del equipo, selecciona al vendedor con el menor ratio (leads actuales / límite semanal). Si todos alcanzan el límite, el lead se redirige al vendedor de respaldo (fallback).'
  }
]

const prev = () => { if (currentStep.value > 0) currentStep.value-- }
const next = () => { if (currentStep.value < sections.length - 1) currentStep.value++ }

const handleStartTour = () => {
  emit('close')
  setTimeout(() => startTour(), 300)
}
</script>

<template>
  <Teleport to="body">
    <div class="help-overlay" @click.self="$emit('close')">
      <div class="help-modal">

        <!-- Header -->
        <div class="hm-header">
          <div class="hm-title-wrap">
            <div class="hm-icon">❓</div>
            <div>
              <h2 class="hm-title">Guía de uso — LeadDistro</h2>
              <p class="hm-subtitle">Paso {{ currentStep + 1 }} de {{ sections.length }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="hm-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Progress dots -->
        <div class="hm-dots">
          <button
            v-for="(s, i) in sections"
            :key="i"
            @click="currentStep = i"
            :class="['hm-dot', { active: i === currentStep, visited: i < currentStep }]"
            :title="s.title"
          />
        </div>

        <!-- Step content -->
        <div class="hm-body">
          <transition name="step" mode="out-in">
            <div :key="currentStep" class="hm-step">
              <!-- Icon + title -->
              <div class="hm-step-header">
                <div class="hm-step-icon" :style="{ background: sections[currentStep].iconBg, color: sections[currentStep].iconColor }" v-html="sections[currentStep].icon" />
                <h3 class="hm-step-title">{{ sections[currentStep].title }}</h3>
              </div>

              <!-- Description -->
              <p v-if="sections[currentStep].desc" class="hm-step-desc">
                {{ sections[currentStep].desc }}
              </p>

              <!-- Bullet items -->
              <ul v-if="sections[currentStep].items" class="hm-list">
                <li
                  v-for="item in sections[currentStep].items"
                  :key="item"
                  v-html="item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')"
                />
              </ul>

              <!-- Numbered steps -->
              <ol v-if="sections[currentStep].steps" class="hm-steps">
                <li v-for="(step, i) in sections[currentStep].steps" :key="i">
                  <span class="step-num">{{ i + 1 }}</span>
                  {{ step }}
                </li>
              </ol>
            </div>
          </transition>
        </div>

        <!-- Footer navigation -->
        <div class="hm-footer">
          <button @click="handleStartTour" class="btn-tour">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Tour interactivo
          </button>
          <div class="hm-nav">
            <button @click="prev" :disabled="currentStep === 0" class="hm-nav-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              Anterior
            </button>
            <button
              v-if="currentStep < sections.length - 1"
              @click="next"
              class="hm-nav-btn primary"
            >
              Siguiente
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button v-else @click="$emit('close')" class="hm-nav-btn primary">
              ¡Entendido!
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.help-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: fade-in 0.2s ease;
}
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }

.help-modal {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.25);
  animation: slide-up 0.25s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
:global(.dark) .help-modal { background: #0f172a; border: 1px solid rgba(255,255,255,0.08); }
@keyframes slide-up { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }

/* Header */
.hm-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}
:global(.dark) .hm-header { border-color: rgba(255,255,255,0.07); }
.hm-title-wrap { display: flex; align-items: center; gap: 12px; }
.hm-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
}
.hm-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0; }
:global(.dark) .hm-title { color: #f1f5f9; }
.hm-subtitle { font-size: 0.78rem; color: #94a3b8; margin: 2px 0 0; }
.hm-close {
  padding: 8px; border-radius: 8px; border: none; background: none; cursor: pointer;
  color: #94a3b8; transition: background 0.2s;
}
.hm-close:hover { background: #f1f5f9; color: #334155; }
:global(.dark) .hm-close:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

/* Progress dots */
.hm-dots {
  display: flex; justify-content: center; gap: 6px;
  padding: 14px 24px 0;
}
.hm-dot {
  width: 8px; height: 8px; border-radius: 99px;
  background: #e2e8f0; border: none; cursor: pointer;
  transition: all 0.2s; padding: 0;
}
:global(.dark) .hm-dot { background: #334155; }
.hm-dot.visited { background: #a5b4fc; width: 8px; }
.hm-dot.active { background: #6366f1; width: 24px; }

/* Body */
.hm-body {
  padding: 24px 28px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

.hm-step-header {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 18px;
}
.hm-step-icon {
  width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hm-step-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; }
:global(.dark) .hm-step-title { color: #f1f5f9; }

.hm-step-desc { font-size: 0.9rem; color: #64748b; line-height: 1.7; margin: 0; }

.hm-list { padding: 0; margin: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
.hm-list li {
  font-size: 0.88rem; color: #64748b; line-height: 1.6;
  padding-left: 16px; position: relative;
}
.hm-list li::before { content: '·'; position: absolute; left: 4px; color: #6366f1; font-weight: 700; }
.hm-list li :deep(strong) { color: #334155; font-weight: 700; }
:global(.dark) .hm-list li :deep(strong) { color: #e2e8f0; }

.hm-steps { padding: 0; margin: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.hm-steps li {
  display: flex; align-items: flex-start; gap: 12px;
  font-size: 0.88rem; color: #64748b; line-height: 1.6;
}
.step-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: #6366f1; color: #fff;
  font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}

/* Step transition */
.step-enter-active, .step-leave-active { transition: all 0.2s ease; }
.step-enter-from { opacity: 0; transform: translateX(16px); }
.step-leave-to { opacity: 0; transform: translateX(-16px); }

/* Footer */
.hm-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}
:global(.dark) .hm-footer { border-color: rgba(255,255,255,0.07); }

.btn-tour {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; color: #6366f1;
  font-weight: 600; font-size: 0.8rem;
  padding: 8px 12px; border-radius: 8px; border: 1.5px solid #e0e7ff;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-tour:hover { background: #f5f3ff; border-color: #6366f1; }
:global(.dark) .btn-tour { border-color: rgba(99,102,241,0.3); color: #a5b4fc; }
:global(.dark) .btn-tour:hover { background: rgba(99,102,241,0.1); }

.hm-nav { display: flex; gap: 8px; }
.hm-nav-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0;
  background: transparent; color: #64748b;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.hm-nav-btn:hover:not(:disabled) { background: #f8fafc; color: #334155; }
.hm-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
:global(.dark) .hm-nav-btn { border-color: rgba(255,255,255,0.1); color: #94a3b8; }
:global(.dark) .hm-nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: #e2e8f0; }
.hm-nav-btn.primary {
  background: #6366f1; color: #fff; border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}
.hm-nav-btn.primary:hover { background: #4f46e5; border-color: #4f46e5; }
</style>
