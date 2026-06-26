<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'idle' },
  color: { type: String, default: '#4B2BBB' },
  frame: { type: Number, default: 0 },
  id: { type: String, default: 'dev' }
})

const isWorking = computed(() => props.status === 'active')
const isAway = computed(() => props.status === 'away')
const isOffline = computed(() => props.status === 'offline')

// Animación
const bounce = computed(() => (isWorking.value ? (props.frame % 30 < 15 ? 0 : -4) : 0))
const typingY = computed(() => (isWorking.value ? (props.frame % 20 < 10 ? 2 : -2) : 0))

// --- Personalización procedural y determinista a partir del nombre ---
// Mismo nombre => siempre el mismo avatar. Sin librerías, todo SVG.
const hash = computed(() => {
  let h = 2166136261
  const s = props.id || 'dev'
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
})
// pick: usa distintos bits del hash para que los rasgos no queden correlacionados
const pick = (arr, shift) => arr[(hash.value >>> shift) % arr.length]

const SKIN = ['#ffd0b0', '#f1c27d', '#e0ac69', '#c68642', '#8d5524']
const SKIN_EAR = ['#f5c0a0', '#e3b170', '#cf9a58', '#b1742f', '#79461c'] // tono oreja por índice de piel
const HAIR = ['#2b2b2b', '#5a3a22', '#d9b45b', '#7a3b1d', '#9a9a9a', '#3b2f5e', '#1a1a2a']
const HEADSET = ['#1a1a2a', '#3949ab', '#00838f', '#ad1457', '#2e7d32', '#ef6c00']

const skinIdx = computed(() => hash.value % SKIN.length)
const skin = computed(() => SKIN[skinIdx.value])
const ear = computed(() => SKIN_EAR[skinIdx.value])
const hairColor = computed(() => pick(HAIR, 8))
const hairStyle = computed(() => (hash.value >>> 5) % 6) // 0..5
const hasGlasses = computed(() => (hash.value >>> 14) % 3 === 0) // ~1/3
// Sin vello facial: no tenemos el género del vendedor, así que no arriesgamos
// ponerle barba a una mujer. El pelo da variedad suficiente.
const headsetColor = computed(() => pick(HEADSET, 22))

const mouthColor = '#c0705a'
const eyeColor = '#1a1a2a'
const chairBack = '#263238'
const chairSeat = '#37474f'
</script>

<template>
  <div class="pixel-agent relative w-20 h-20 sm:w-full sm:h-full" :style="{ transform: `translateY(${bounce}px)` }">
    <svg viewBox="0 0 100 100" class="w-full h-full" :class="{ 'grayscale opacity-60': isOffline }" style="image-rendering: pixelated; shape-rendering: crispEdges;">
      <!-- Glow -->
      <rect v-if="isWorking" x="25" y="10" width="50" height="70" fill="rgba(75,43,187,0.15)" />

      <!-- Chair -->
      <rect x="32" y="60" width="36" height="6" :fill="chairBack" />
      <rect x="32" y="50" width="36" height="12" :fill="chairSeat" />
      <rect x="34" y="35" width="10" height="15" :fill="chairBack" />
      <rect x="56" y="35" width="10" height="15" :fill="chairBack" />

      <!-- Body -->
      <rect x="34" y="45" width="32" height="22" :fill="color" />
      <rect x="44" y="45" width="12" height="6" :fill="skin" /> <!-- cuello -->

      <!-- Cabeza -->
      <rect x="38" y="27" width="24" height="18" :fill="skin" />
      <rect x="36" y="31" width="4" height="8" :fill="ear" /> <!-- oreja izq -->
      <rect x="60" y="31" width="4" height="8" :fill="ear" /> <!-- oreja der -->

      <!-- ===== PELO (estilo según hash) ===== -->
      <template v-if="hairStyle === 0">
        <!-- Rapado / corto -->
        <rect x="38" y="24" width="24" height="5" :fill="hairColor" />
      </template>
      <template v-else-if="hairStyle === 1">
        <!-- Corto con patillas -->
        <rect x="38" y="22" width="24" height="7" :fill="hairColor" />
        <rect x="37" y="27" width="3" height="7" :fill="hairColor" />
        <rect x="60" y="27" width="3" height="7" :fill="hairColor" />
      </template>
      <template v-else-if="hairStyle === 2">
        <!-- Tupé / jopo alto -->
        <rect x="38" y="19" width="24" height="10" :fill="hairColor" />
        <rect x="41" y="15" width="10" height="5" :fill="hairColor" />
      </template>
      <template v-else-if="hairStyle === 3">
        <!-- Raya al costado -->
        <rect x="38" y="23" width="24" height="6" :fill="hairColor" />
        <rect x="38" y="23" width="13" height="3" :fill="hairColor" />
        <rect x="36" y="26" width="3" height="6" :fill="hairColor" />
      </template>
      <template v-else-if="hairStyle === 4">
        <!-- Largo (enmarca la cara) -->
        <rect x="36" y="21" width="28" height="8" :fill="hairColor" />
        <rect x="34" y="27" width="5" height="18" :fill="hairColor" />
        <rect x="61" y="27" width="5" height="18" :fill="hairColor" />
      </template>
      <template v-else>
        <!-- Enrulado / afro -->
        <rect x="41" y="15" width="18" height="5" :fill="hairColor" />
        <rect x="37" y="18" width="26" height="6" :fill="hairColor" />
        <rect x="36" y="22" width="4" height="9" :fill="hairColor" />
        <rect x="60" y="22" width="4" height="9" :fill="hairColor" />
      </template>

      <!-- Ojos -->
      <template v-if="isAway">
        <rect x="40" y="33" width="4" height="4" :fill="eyeColor" />
        <rect x="48" y="33" width="4" height="4" :fill="eyeColor" />
      </template>
      <template v-else-if="frame % 60 > 5">
        <rect x="42" y="33" width="4" height="4" :fill="eyeColor" />
        <rect x="54" y="33" width="4" height="4" :fill="eyeColor" />
        <rect x="43" y="34" width="2" height="2" fill="white" />
        <rect x="55" y="34" width="2" height="2" fill="white" />
      </template>
      <template v-else>
        <rect x="42" y="35" width="4" height="2" :fill="eyeColor" />
        <rect x="54" y="35" width="4" height="2" :fill="eyeColor" />
      </template>

      <!-- Lentes -->
      <template v-if="hasGlasses">
        <rect x="41" y="32" width="6" height="5" fill="rgba(255,255,255,0.18)" stroke="#1a1a2a" stroke-width="1" />
        <rect x="53" y="32" width="6" height="5" fill="rgba(255,255,255,0.18)" stroke="#1a1a2a" stroke-width="1" />
        <rect x="47" y="34" width="6" height="1" fill="#1a1a2a" />
      </template>

      <!-- Boca -->
      <rect v-if="isAway" x="42" y="40" width="4" height="2" :fill="mouthColor" />
      <rect v-else x="45" y="40" width="10" height="2" :fill="mouthColor" />

      <!-- Brazos / manos -->
      <template v-if="isWorking">
        <rect x="24" y="55" width="14" height="8" :fill="skin" :style="{ transform: `translateY(${typingY}px)` }" />
        <rect x="62" y="55" width="14" height="8" :fill="skin" :style="{ transform: `translateY(${-typingY}px)` }" />
      </template>
      <template v-else>
        <rect x="26" y="58" width="12" height="16" :fill="skin" />
        <rect x="62" y="58" width="12" height="16" :fill="skin" />
      </template>

      <!-- Headset (color por persona) -->
      <template v-if="!isOffline">
        <rect x="36" y="25" width="4" height="14" :fill="headsetColor" />
        <rect x="60" y="25" width="4" height="14" :fill="headsetColor" />
        <rect x="38" y="23" width="24" height="4" :fill="headsetColor" />
        <rect x="62" y="36" width="10" height="2" fill="#333" />
        <rect x="70" y="35" width="4" height="4" :fill="headsetColor" />
        <rect x="61" y="30" width="2" height="2" :fill="isWorking ? '#00f2ff' : '#666'" />
      </template>
    </svg>
  </div>
</template>
