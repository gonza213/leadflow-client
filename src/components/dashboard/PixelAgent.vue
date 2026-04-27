<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'idle'
  },
  color: {
    type: String,
    default: '#4B2BBB'
  },
  frame: {
    type: Number,
    default: 0
  },
  id: {
    type: String,
    default: 'dev'
  }
})

const isWorking = computed(() => props.status === 'active')
const isDone = computed(() => props.status === 'done')
const isIdle = computed(() => props.status === 'idle')

// Animation logic based on frame
const bounce = computed(() => (isWorking.value ? (props.frame % 30 < 15 ? 0 : -4) : 0))
const typingY = computed(() => (isWorking.value ? (props.frame % 20 < 10 ? 2 : -2) : 0))

// Skin color from the reference
const skinColor = '#ffd0b0'
const earColor = '#f5c0a0'
const chairBack = '#263238'
const chairSeat = '#37474f'
const mouthColor = '#c0705a'
const eyeColor = '#1a1a2a'

const isAway = computed(() => props.status === 'away')
const isOffline = computed(() => props.status === 'offline')
</script>

<template>
  <div class="pixel-agent relative w-20 h-20" :style="{ transform: `translateY(${bounce}px)` }">
    <svg viewBox="0 0 100 100" class="w-full h-full" :class="{ 'grayscale opacity-60': isOffline }" style="image-rendering: pixelated;">
      <!-- Glow effect -->
      <rect v-if="isWorking" x="25" y="10" width="50" height="70" fill="rgba(75,43,187,0.15)" />
      
      <!-- Chair -->
      <rect x="32" y="60" width="36" height="6" :fill="chairBack" /> <!-- seat base -->
      <rect x="32" y="50" width="36" height="12" :fill="chairSeat" /> <!-- cushion -->
      <rect x="34" y="35" width="10" height="15" :fill="chairBack" /> <!-- left back -->
      <rect x="56" y="35" width="10" height="15" :fill="chairBack" /> <!-- right back -->

      <!-- Body -->
      <rect x="34" y="45" width="32" height="22" :fill="color" />
      <rect x="44" y="45" width="12" height="6" :fill="skinColor" /> <!-- neck/collar -->

      <!-- Head -->
      <rect x="38" y="27" width="24" height="18" :fill="skinColor" />
      <rect x="36" y="31" width="4" height="8" :fill="earColor" /> <!-- L Ear -->
      <rect x="60" y="31" width="4" height="8" :fill="earColor" /> <!-- R Ear -->

      <!-- Eyes -->
      <template v-if="isAway">
        <!-- Looking away eyes (to the extreme left) -->
        <rect x="36" y="33" width="4" height="4" :fill="eyeColor" />
        <rect x="44" y="33" width="4" height="4" :fill="eyeColor" />
      </template>
      <template v-else-if="frame % 60 > 5">
        <rect x="42" y="33" width="4" height="4" :fill="eyeColor" />
        <rect x="54" y="33" width="4" height="4" :fill="eyeColor" />
        <rect x="43" y="34" width="2" height="2" fill="white" />
        <rect x="55" y="34" width="2" height="2" fill="white" />
      </template>
      <template v-else>
        <!-- Blink -->
        <rect x="42" y="35" width="4" height="2" :fill="eyeColor" />
        <rect x="54" y="35" width="4" height="2" :fill="eyeColor" />
      </template>

      <!-- Mouth -->
      <rect v-if="isAway" x="42" y="40" width="4" height="2" :fill="mouthColor" />
      <rect v-else x="45" y="40" width="10" height="2" :fill="mouthColor" />

      <!-- Arms / Hands -->
      <template v-if="isWorking">
        <!-- Typing animation -->
        <rect x="24" y="55" width="14" height="8" :fill="skinColor" :style="{ transform: `translateY(${typingY}px)` }" />
        <rect x="62" y="55" width="14" height="8" :fill="skinColor" :style="{ transform: `translateY(${-typingY}px)` }" />
      </template>
      <template v-else>
        <rect x="26" y="58" width="12" height="16" :fill="skinColor" />
        <rect x="62" y="58" width="12" height="16" :fill="skinColor" />
      </template>

      <!-- Headset (QA style as default or based on id) -->
      <template v-if="id === 'qa' || isWorking">
        <rect x="36" y="25" width="4" height="14" fill="#1a1a2a" />
        <rect x="60" y="25" width="4" height="14" fill="#1a1a2a" />
        <rect x="36" y="23" width="28" height="5" fill="#1a1a2a" />
        <rect x="60" y="37" width="8" height="3" fill="#333" /> <!-- mic arm -->
        <rect x="66" y="37" width="4" height="4" :fill="color" /> <!-- mic -->
      </template>
    </svg>
  </div>
</template>
