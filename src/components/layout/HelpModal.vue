<script setup>
import { ref } from 'vue'
import { useTour } from '../../composables/useTour'

const emit = defineEmits(['close'])
const { startTour } = useTour()

const sections = [
  {
    icon: '📊',
    title: 'Dashboard',
    desc: 'Visualizá métricas en tiempo real: leads por vendedor, distribución por equipo, etapas del funnel y más. Usá los filtros de período para analizar rangos específicos.'
  },
  {
    icon: '📥',
    title: 'Leads',
    desc: 'Listado completo de leads ingresados al sistema. Filtrá por vendedor, equipo, etapa y período. Exportá cualquier resultado a CSV con un clic.'
  },
  {
    icon: '👥',
    title: 'Vendedores',
    desc: 'Creá y administrá tu equipo de ventas. Asignales límites diarios y semanales. El algoritmo de distribución respeta estos límites automáticamente.'
  },
  {
    icon: '🔧',
    title: 'Configuración',
    items: [
      '**Equipos**: Definí los equipos de ventas y el porcentaje de leads que recibe cada uno (deben sumar 100%).',
      '**Etapas**: Configurá las etapas del pipeline (Nuevo, Contactado, Calificado, Cerrado).',
      '**Webhook GHL**: Copiá la URL única de tu tenant y pegala en tu workflow de GoHighLevel.',
      '**Zona horaria**: Configurá la zona horaria de tu organización para que los límites y reportes sean correctos.'
    ]
  },
  {
    icon: '🔗',
    title: 'Integración con GoHighLevel',
    steps: [
      'Copiá la URL del webhook desde Configuración → Webhook GHL.',
      'En GHL, creá un workflow para "Nuevo contacto" y agregá la acción Webhook apuntando a esa URL.',
      'LeadFlow responderá con el nombre y ID del vendedor asignado.',
      'Usá esos datos en tu workflow de GHL para notificar al vendedor (email, SMS, push).'
    ]
  },
  {
    icon: '⚡',
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
              <span class="hm-sec-icon">{{ s.icon }}</span>
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
.hm-sec-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.hm-sec-icon { font-size: 1.1rem; }
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
