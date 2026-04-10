<script setup>
import { ref } from 'vue'
import { useTour } from '../../composables/useTour'

const emit = defineEmits(['close'])
const { startTour } = useTour()

const sections = [
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.12)',
    title: 'Dashboard',
    desc: 'Visualizá métricas en tiempo real: leads por vendedor, distribución por equipo, etapas del funnel y más. Usá los filtros de período para analizar rangos específicos.'
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.12)',
    title: 'Leads',
    desc: 'Listado completo de leads ingresados al sistema. Filtrá por vendedor, equipo, etapa y período. Exportá cualquier resultado a CSV con un clic.'
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.12)',
    title: 'Vendedores',
    desc: 'Creá y administrá tu equipo de ventas. Asignales límites diarios y semanales. El algoritmo de distribución respeta estos límites automáticamente.'
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,0.12)',
    title: 'Usuarios',
    desc: 'Gestioná los accesos de tu organización. Asigná roles de Manager, Viewer o Seller a cada usuario del tenant.'
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    iconColor: '#64748b',
    iconBg: 'rgba(100,116,139,0.12)',
    title: 'Configuración',
    items: [
      '**Equipos**: Definí los equipos de ventas y el porcentaje de leads que recibe cada uno (deben sumar 100%).',
      '**Etapas**: Configurá las etapas del pipeline (Nuevo, Contactado, Calificado, Cerrado).',
      '**Webhook CRM**: Copiá la URL única de tu tenant y pegala en tu workflow del CRM (GHL, HubSpot, Make, etc.).',
      '**Zona horaria**: Configurá la zona horaria de tu organización para que los límites y reportes sean correctos.'
    ]
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
    iconColor: '#06b6d4',
    iconBg: 'rgba(6,182,212,0.12)',
    title: 'Integración con CRM',
    steps: [
      'Copiá la URL del webhook desde Configuración → Integración.',
      'En tu CRM, creá un workflow para "Nuevo contacto" y agregá la acción Webhook apuntando a esa URL.',
      'LeadFlow responderá con el nombre y ID del vendedor asignado.',
      'Usá esos datos en tu workflow para notificar al vendedor (email, SMS, push).'
    ]
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    iconColor: '#ec4899',
    iconBg: 'rgba(236,72,153,0.12)',
    title: 'Algoritmo de distribución',
    desc: 'Cuando entra un lead, el sistema calcula el equipo target según los porcentajes configurados. Dentro del equipo, selecciona al vendedor con el menor ratio (leads actuales / límite semanal). Si todos alcanzan el límite, el lead se redirige al vendedor de respaldo (fallback).'
  }
]

const handleStartTour = () => {
  emit('close')
  setTimeout(() => startTour(), 300)
}
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div class="help-overlay" @click.self="$emit('close')">
      <div class="help-modal">

        <!-- Header -->
        <div class="hm-header">
          <div class="hm-title-wrap">
            <div class="hm-icon">❓</div>
            <div>
              <h2 class="hm-title">Guía de uso — LeadFlow</h2>
              <p class="hm-subtitle">Todo lo que necesitás saber para empezar</p>
            </div>
          </div>
          <button @click="$emit('close')" class="hm-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Tour button -->
        <div class="hm-tour-banner">
          <div class="hm-tour-text">
            <span class="hm-tour-icon">🚀</span>
            <div>
              <strong>Tour interactivo</strong>
              <p>Hacé el recorrido guiado del dashboard paso a paso</p>
            </div>
          </div>
          <button @click="handleStartTour" class="btn-tour">
            Iniciar tour
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Sections -->
        <div class="hm-sections">
          <div v-for="s in sections" :key="s.title" class="hm-section">
            <div class="hm-sec-header">
              <div class="hm-sec-icon-wrap" :style="{ background: s.iconBg, color: s.iconColor }" v-html="s.icon"></div>
              <h3 class="hm-sec-title">{{ s.title }}</h3>
            </div>
            <!-- Simple description -->
            <p v-if="s.desc" class="hm-sec-desc" v-html="s.desc"></p>
            <!-- Bullet items -->
            <ul v-if="s.items" class="hm-list">
              <li v-for="item in s.items" :key="item" v-html="item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')"></li>
            </ul>
            <!-- Numbered steps -->
            <ol v-if="s.steps" class="hm-steps">
              <li v-for="step in s.steps" :key="step">{{ step }}</li>
            </ol>
          </div>
        </div>

        <!-- Footer -->
        <div class="hm-footer">
          <span>¿Necesitás ayuda extra?</span>
          <a
            href="https://wa.me/542212204194?text=Hola!%20Necesito%20ayuda%20con%20LeadFlow"
            target="_blank"
            class="hm-wa-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escribir por WhatsApp
          </a>
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
  border-radius: 20px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,0.3);
  animation: slide-up 0.25s ease;
}
:global(.dark) .help-modal { background: #0f172a; border: 1px solid rgba(255,255,255,0.08); }

@keyframes slide-up { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }

.hm-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f1f5f9;
}
:global(.dark) .hm-header { border-color: rgba(255,255,255,0.07); }
.hm-title-wrap { display: flex; align-items: center; gap: 14px; }
.hm-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; flex-shrink: 0;
}
.hm-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0; }
:global(.dark) .hm-title { color: #f1f5f9; }
.hm-subtitle { font-size: 0.82rem; color: #94a3b8; margin: 2px 0 0; }
.hm-close {
  padding: 8px; border-radius: 8px; border: none; background: none; cursor: pointer;
  color: #94a3b8; transition: background 0.2s, color 0.2s; flex-shrink: 0;
}
.hm-close:hover { background: #f1f5f9; color: #334155; }
:global(.dark) .hm-close:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

.hm-tour-banner {
  margin: 0 24px 0;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08));
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 14px; padding: 16px 20px;
  margin-top: 20px;
}
.hm-tour-text { display: flex; align-items: center; gap: 12px; }
.hm-tour-icon { font-size: 1.4rem; }
.hm-tour-text strong { font-size: 0.9rem; color: #0f172a; display: block; }
:global(.dark) .hm-tour-text strong { color: #f1f5f9; }
.hm-tour-text p { font-size: 0.8rem; color: #64748b; margin: 1px 0 0; }
.btn-tour {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff; font-weight: 700; font-size: 0.85rem;
  padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer;
  white-space: nowrap; transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}
.btn-tour:hover { opacity: 0.9; transform: translateY(-1px); }

.hm-sections {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 20px;
}
.hm-section {
  border-left: 3px solid #3b82f6;
  padding-left: 16px;
}
.hm-sec-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.hm-sec-icon-wrap {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hm-sec-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; }
:global(.dark) .hm-sec-title { color: #f1f5f9; }
.hm-sec-desc { font-size: 0.85rem; color: #64748b; line-height: 1.65; margin: 0; }
.hm-list { padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.hm-list li { font-size: 0.85rem; color: #64748b; line-height: 1.55; }
.hm-list li :deep(strong) { color: #334155; font-weight: 600; }
:global(.dark) .hm-list li :deep(strong) { color: #e2e8f0; }
.hm-steps { padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.hm-steps li { font-size: 0.85rem; color: #64748b; line-height: 1.55; }

.hm-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
:global(.dark) .hm-footer { border-color: rgba(255,255,255,0.07); }
.hm-footer span { font-size: 0.82rem; color: #94a3b8; }
.hm-wa-btn {
  display: inline-flex; align-items: center; gap: 7px;
  background: #25d366; color: #fff;
  font-size: 0.82rem; font-weight: 700;
  padding: 8px 16px; border-radius: 8px;
  text-decoration: none; transition: opacity 0.2s;
}
.hm-wa-btn:hover { opacity: 0.9; }
</style>
