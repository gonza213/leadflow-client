<script setup>
import { computed } from 'vue'

// Personaje pixel-art del vendedor (Oficina en Vivo) — rediseño 2026.
// Las animaciones son CSS (antes dependían de un requestAnimationFrame por frame).
const props = defineProps({
  status: { type: String, default: 'idle' },   // active | idle | away | offline
  color: { type: String, default: '#84CC16' },  // color de la remera
  frame: { type: Number, default: 0 },          // compatibilidad, ya no se usa
  id: { type: String, default: 'dev' }          // nombre: define los rasgos
})

const isActive = computed(() => props.status === 'active')
const isIdle = computed(() => props.status === 'idle')
const isAway = computed(() => props.status === 'away')
const isOffline = computed(() => props.status === 'offline')

// --- Rasgos deterministas a partir del nombre (mismo nombre => mismo personaje) ---
const hash = computed(() => {
  let h = 2166136261
  const s = props.id || 'dev'
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
})
const pick = (arr, shift) => arr[(hash.value >>> shift) % arr.length]

const SKIN = [
  { base: '#FFD7B8', shade: '#F2BC98' },
  { base: '#F3C58E', shade: '#E0A970' },
  { base: '#E0AC69', shade: '#C99050' },
  { base: '#C68642', shade: '#A86E31' },
  { base: '#8D5524', shade: '#74431A' }
]
const HAIR = ['#232623', '#5A3A22', '#D9B45B', '#8A3B1D', '#A3A8A3', '#3B2F5E', '#B4532A']
const HEADSET = ['#1F2320', '#C8F23A', '#38BDF8', '#F472B6', '#F59E0B', '#E5E7EB']

const skin = computed(() => SKIN[hash.value % SKIN.length])
const hairColor = computed(() => pick(HAIR, 8))
const hairStyle = computed(() => (hash.value >>> 5) % 6)
const hasGlasses = computed(() => (hash.value >>> 14) % 3 === 0)
const headsetColor = computed(() => pick(HEADSET, 22))

const OUTLINE = '#141614'
</script>

<template>
  <div class="pixel-agent" :class="['st-' + status]">
    <svg viewBox="0 0 64 64" class="w-full h-full" shape-rendering="crispEdges" aria-hidden="true">
      <!-- Silla -->
      <rect x="16" y="20" width="32" height="30" fill="#2A2F2B" />
      <rect x="17" y="21" width="30" height="2" fill="#3A403B" />

      <!-- Torso (remera del color del vendedor) -->
      <g class="torso">
        <rect x="19" y="36" width="26" height="16" :fill="OUTLINE" />
        <rect x="20" y="37" width="24" height="15" :fill="color" />
        <rect x="39" y="37" width="5" height="15" fill="#000" opacity="0.18" />
        <rect x="20" y="37" width="24" height="1" fill="#fff" opacity="0.25" />
        <!-- cuello -->
        <rect x="29" y="34" width="6" height="4" :fill="skin.shade" />
        <rect x="30" y="37" width="4" height="2" :fill="skin.base" />
      </g>

      <!-- Brazos -->
      <g v-if="isActive" class="arms-typing">
        <rect class="arm-l" x="13" y="42" width="9" height="6" :fill="color" />
        <rect class="arm-l" x="13" y="47" width="6" height="3" :fill="skin.base" />
        <rect class="arm-r" x="42" y="42" width="9" height="6" :fill="color" />
        <rect class="arm-r" x="45" y="47" width="6" height="3" :fill="skin.base" />
      </g>
      <g v-else>
        <rect x="15" y="40" width="6" height="10" :fill="color" />
        <rect x="43" y="40" width="6" height="10" :fill="color" />
        <rect x="15" y="40" width="6" height="10" fill="#000" opacity="0.1" />
      </g>

      <!-- Cabeza -->
      <g class="head">
        <!-- pelo largo por detrás -->
        <template v-if="hairStyle === 4">
          <rect x="19" y="17" width="26" height="20" :fill="hairColor" />
        </template>
        <rect x="21" y="15" width="22" height="20" :fill="OUTLINE" />
        <rect x="22" y="16" width="20" height="18" :fill="skin.base" />
        <rect x="38" y="17" width="4" height="17" :fill="skin.shade" />
        <!-- orejas -->
        <rect x="19" y="23" width="3" height="5" :fill="skin.shade" />
        <rect x="42" y="23" width="3" height="5" :fill="skin.shade" />
        <!-- rubor -->
        <rect x="24" y="29" width="3" height="1" fill="#F472B6" opacity="0.45" />
        <rect x="37" y="29" width="3" height="1" fill="#F472B6" opacity="0.45" />

        <!-- Ojos -->
        <g v-if="isOffline">
          <rect x="25" y="26" width="4" height="1" :fill="OUTLINE" />
          <rect x="35" y="26" width="4" height="1" :fill="OUTLINE" />
        </g>
        <g v-else class="eyes" :class="{ 'look-side': isAway }">
          <rect x="26" y="24" width="3" height="4" :fill="OUTLINE" />
          <rect x="35" y="24" width="3" height="4" :fill="OUTLINE" />
          <rect x="26" y="24" width="1" height="1" fill="#fff" />
          <rect x="35" y="24" width="1" height="1" fill="#fff" />
        </g>

        <!-- Lentes -->
        <g v-if="hasGlasses">
          <rect x="24" y="22" width="7" height="7" fill="none" :stroke="OUTLINE" stroke-width="1" />
          <rect x="33" y="22" width="7" height="7" fill="none" :stroke="OUTLINE" stroke-width="1" />
          <rect x="31" y="24" width="2" height="1" :fill="OUTLINE" />
          <rect x="25" y="23" width="2" height="1" fill="#fff" opacity="0.5" />
          <rect x="34" y="23" width="2" height="1" fill="#fff" opacity="0.5" />
        </g>

        <!-- Boca -->
        <g v-if="isActive">
          <rect x="29" y="30" width="6" height="1" fill="#9A4A3A" />
          <rect x="28" y="29" width="1" height="1" fill="#9A4A3A" />
          <rect x="35" y="29" width="1" height="1" fill="#9A4A3A" />
        </g>
        <rect v-else-if="isOffline" x="31" y="30" width="3" height="2" fill="#9A4A3A" opacity="0.8" />
        <rect v-else x="30" y="30" width="4" height="1" fill="#9A4A3A" />

        <!-- Pelo -->
        <template v-if="hairStyle === 0">
          <rect x="21" y="13" width="22" height="5" :fill="hairColor" />
          <rect x="22" y="18" width="8" height="2" :fill="hairColor" />
        </template>
        <template v-else-if="hairStyle === 1">
          <rect x="21" y="12" width="22" height="6" :fill="hairColor" />
          <rect x="20" y="17" width="3" height="8" :fill="hairColor" />
          <rect x="41" y="17" width="3" height="8" :fill="hairColor" />
        </template>
        <template v-else-if="hairStyle === 2">
          <rect x="21" y="12" width="22" height="6" :fill="hairColor" />
          <rect x="23" y="9" width="12" height="4" :fill="hairColor" />
          <rect x="26" y="8" width="6" height="2" :fill="hairColor" />
        </template>
        <template v-else-if="hairStyle === 3">
          <rect x="21" y="13" width="22" height="5" :fill="hairColor" />
          <rect x="21" y="11" width="11" height="3" :fill="hairColor" />
          <rect x="20" y="17" width="3" height="7" :fill="hairColor" />
          <rect x="32" y="13" width="1" height="4" fill="#000" opacity="0.2" />
        </template>
        <template v-else-if="hairStyle === 4">
          <rect x="20" y="12" width="24" height="6" :fill="hairColor" />
          <rect x="19" y="17" width="4" height="18" :fill="hairColor" />
          <rect x="41" y="17" width="4" height="18" :fill="hairColor" />
        </template>
        <template v-else>
          <rect x="23" y="7" width="18" height="5" :fill="hairColor" />
          <rect x="20" y="10" width="24" height="8" :fill="hairColor" />
          <rect x="18" y="15" width="5" height="9" :fill="hairColor" />
          <rect x="41" y="15" width="5" height="9" :fill="hairColor" />
          <rect x="25" y="8" width="2" height="1" fill="#fff" opacity="0.2" />
        </template>
        <!-- brillo del pelo -->
        <rect x="25" y="14" width="5" height="1" fill="#fff" opacity="0.18" />

        <!-- Vincha con micrófono -->
        <g v-if="!isOffline">
          <rect x="21" y="11" width="22" height="2" :fill="headsetColor" />
          <rect x="18" y="21" width="4" height="8" :fill="headsetColor" />
          <rect x="42" y="21" width="4" height="8" :fill="headsetColor" />
          <rect x="18" y="21" width="4" height="8" fill="#000" opacity="0.2" />
          <rect x="40" y="31" width="5" height="1" :fill="OUTLINE" />
          <rect x="38" y="30" width="3" height="3" :fill="headsetColor" />
          <rect class="mic-led" x="44" y="22" width="1" height="1" :fill="isActive ? '#C8F23A' : '#687068'" />
        </g>
      </g>

      <!-- Luz de la pantalla sobre la cara -->
      <rect v-if="isActive" class="screen-light" x="22" y="26" width="20" height="10" fill="#C8F23A" />

      <!-- Escritorio -->
      <rect x="2" y="50" width="60" height="14" fill="#1C201D" />
      <rect x="2" y="50" width="60" height="2" fill="#2E342F" />
      <rect x="2" y="52" width="60" height="1" fill="#C8F23A" opacity="0.18" />

      <!-- Laptop (vista de atrás) -->
      <rect x="18" y="37" width="28" height="13" :fill="OUTLINE" />
      <rect x="19" y="38" width="26" height="12" fill="#2A2F2B" />
      <rect x="19" y="38" width="26" height="1" fill="#fff" opacity="0.08" />
      <rect class="laptop-logo" x="30" y="42" width="4" height="4" :fill="isOffline ? '#363B37' : '#C8F23A'" :opacity="isActive ? 1 : 0.45" />
      <rect x="16" y="49" width="32" height="2" fill="#3A403B" />

      <!-- Taza -->
      <g>
        <rect x="50" y="43" width="7" height="7" :fill="OUTLINE" />
        <rect x="51" y="44" width="5" height="6" fill="#F6F7F3" />
        <rect x="51" y="44" width="5" height="1" fill="#6B3E26" />
        <rect x="56" y="45" width="2" height="3" fill="#F6F7F3" />
        <g v-if="isIdle" class="steam">
          <rect class="s1" x="52" y="39" width="1" height="3" fill="#fff" opacity="0.5" />
          <rect class="s2" x="54" y="37" width="1" height="3" fill="#fff" opacity="0.4" />
        </g>
      </g>

      <!-- Ausente: globo "…" -->
      <g v-if="isAway" class="bubble">
        <rect x="45" y="5" width="15" height="9" fill="#F6F7F3" />
        <rect x="46" y="14" width="3" height="2" fill="#F6F7F3" />
        <rect x="48" y="9" width="2" height="2" fill="#363B37" />
        <rect x="51" y="9" width="2" height="2" fill="#363B37" />
        <rect x="54" y="9" width="2" height="2" fill="#363B37" />
      </g>

      <!-- Desconectado: Zz -->
      <g v-if="isOffline" class="zzz" fill="#9CA299">
        <g class="z1">
          <rect x="46" y="9" width="5" height="1" /><rect x="49" y="10" width="1" height="1" />
          <rect x="48" y="11" width="1" height="1" /><rect x="47" y="12" width="1" height="1" /><rect x="46" y="13" width="5" height="1" />
        </g>
        <g class="z2">
          <rect x="53" y="3" width="4" height="1" /><rect x="55" y="4" width="1" height="1" />
          <rect x="54" y="5" width="1" height="1" /><rect x="53" y="6" width="4" height="1" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.pixel-agent { width: 100%; height: 100%; image-rendering: pixelated; }
.pixel-agent svg { overflow: visible; }

/* Activo: rebote suave + manos tipeando + pantalla encendida */
.st-active .head, .st-active .torso { animation: bob 1.6s steps(2) infinite; }
.arms-typing .arm-l { animation: typeL 0.36s steps(1) infinite; }
.arms-typing .arm-r { animation: typeR 0.36s steps(1) infinite; }
.screen-light { opacity: 0.12; animation: flicker 2.4s steps(3) infinite; mix-blend-mode: screen; }
.st-active .laptop-logo { filter: drop-shadow(0 0 2px #C8F23A); }
@keyframes bob { 50% { transform: translateY(-1px); } }
@keyframes typeL { 50% { transform: translateY(-1px); } }
@keyframes typeR { 0% { transform: translateY(-1px); } 50% { transform: translateY(0); } }
@keyframes flicker { 50% { opacity: 0.2; } }

/* Parpadeo */
.eyes { animation: blink 4.2s infinite; transform-origin: 32px 26px; transform-box: view-box; }
.eyes.look-side { transform: translateX(-2px); animation: none; }
@keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }

/* Inactivo: vapor del café */
.steam .s1 { animation: steam 2s infinite; }
.steam .s2 { animation: steam 2s 1s infinite; }
@keyframes steam { 0% { transform: translateY(2px); opacity: 0; } 40% { opacity: 0.6; } 100% { transform: translateY(-4px); opacity: 0; } }

/* Ausente: globo flotando */
.bubble { animation: float 2.4s ease-in-out infinite; }
@keyframes float { 50% { transform: translateY(-1px); } }

/* Desconectado: Zz + personaje apagado */
.st-offline .head, .st-offline .torso { filter: grayscale(0.85) brightness(0.8); }
.zzz .z1 { animation: zz 2.6s infinite; }
.zzz .z2 { animation: zz 2.6s 0.8s infinite; }
@keyframes zz { 0% { opacity: 0; transform: translateY(2px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-3px); } }

@media (prefers-reduced-motion: reduce) {
  .pixel-agent *, .pixel-agent { animation: none !important; }
}
</style>
