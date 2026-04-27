<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useSellersStore } from '../../stores/sellers'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import PixelAgent from './PixelAgent.vue'

const sellersStore = useSellersStore()
const authStore = useAuthStore()
const { t } = useI18n()
const polling = ref(null)
const frame = ref(0)
const animationFrame = ref(null)

const tenantName = computed(() => authStore.user?.tenant?.name || 'SISTEMA')
const version = 'v1.0.2'

onMounted(async () => {
  await sellersStore.fetchPresence()
  polling.value = setInterval(() => {
    sellersStore.fetchPresence()
  }, 15000)

  const animate = () => {
    frame.value++
    animationFrame.value = requestAnimationFrame(animate)
  }
  animationFrame.value = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (polling.value) clearInterval(polling.value)
  if (animationFrame.value) cancelAnimationFrame(animationFrame.value)
})

const getStatusLabel = (status) => {
  switch (status) {
    case 'active': return 'TRABAJANDO'
    case 'idle': return 'INACTIVO'
    case 'away': return 'AUSENTE'
    default: return 'DESCONECTADO'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#06d6a0' // Green
    case 'idle': return '#faae42'   // Orange
    case 'away': return '#8b5cf6'   // Purple
    default: return '#666666'      // Gray
  }
}

// Fixed identity colors for characters/mugs (not status)
const IDENTITY_COLORS = [
  '#4B2BBB', '#ec4899', '#039be5', '#7c4a1e', '#e62965', '#8b5cf6'
]

const getSellerIdentityColor = (index) => IDENTITY_COLORS[index % IDENTITY_COLORS.length]
</script>

<template>
  <div class="retro-office-container h-full flex flex-col bg-[#0f0f18] text-[#f0f0f5] font-['Press_Start_2P'] overflow-hidden rounded-xl border-4 border-[#283252] shadow-2xl">
    <!-- Header / Top Bar -->
    <div class="flex items-center justify-between p-4 bg-[#283252] border-b-4 border-[#4B2BBB]">
      <div class="flex flex-col gap-1">
        <h2 class="text-[12px] text-white tracking-widest uppercase">
          {{ t('dashboard.presence.title', 'Oficina en Vivo') }}
        </h2>
        <div class="text-[8px] text-[#06d6a0] animate-pulse">
          SISTEMA OPERATIVO {{ tenantName.toUpperCase() }} {{ version }}
        </div>
      </div>
      <div class="flex gap-4">
        <div class="text-[10px] bg-black/40 px-3 py-2 rounded border border-[#4B2BBB]/30">
          ACTIVOS: <span class="text-[#06d6a0]">{{ sellersStore.presence.filter(s => s.status === 'active').length }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar: Logs & Stats -->
      <div class="w-72 bg-[#0a0a16]/80 backdrop-blur-md border-r-4 border-[#4B2BBB]/50 p-5 flex flex-col gap-4 overflow-y-auto hidden lg:flex shadow-2xl z-30">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-2 h-2 rounded-full bg-[#4B2BBB] animate-pulse"></div>
          <div class="text-[9px] font-bold text-gray-300 uppercase tracking-[2px]">Registro de Actividad</div>
        </div>
        
        <div class="flex flex-col gap-3">
          <div v-for="seller in sellersStore.presence.filter(s => s.lastAction).slice(0, 10)" :key="seller._id" 
               class="activity-card group text-[7px] leading-relaxed p-3 bg-black/40 rounded-lg border border-white/5 hover:border-[#4B2BBB]/50 transition-all duration-300 transform hover:-translate-x-1" 
               :style="{ borderLeft: `3px solid ${getSellerIdentityColor(sellersStore.presence.indexOf(seller))}` }">
            <div class="flex justify-between items-center mb-1.1">
              <span class="text-white font-bold opacity-90 group-hover:opacity-100 transition-opacity">{{ seller.seller_name }}</span>
              <span class="text-[5px] text-gray-500">{{ new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
            </div>
            <span class="text-[#06d6a0] mt-1 block font-mono">{{ seller.lastAction }}</span>
          </div>
        </div>

        <!-- Mini Stats at Bottom -->
        <div class="mt-auto pt-4 border-t border-white/5">
           <div class="text-[6px] text-gray-500 uppercase tracking-widest mb-2">Rendimiento Equipo</div>
           <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[#4B2BBB] to-[#06d6a0]" :style="{ width: '75%' }"></div>
           </div>
        </div>
      </div>

      <!-- Right: Office Floor -->
      <div class="flex-1 relative bg-[#080810] overflow-auto office-container">
        <!-- Floor Texture -->
        <div class="absolute inset-0 pointer-events-none opacity-10" 
             style="background-image: radial-gradient(#4B2BBB 0.5px, transparent 0.5px); background-size: 30px 30px;"></div>
        
        <!-- Floor Glows -->
        <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#4B2BBB]/5 to-transparent"></div>

        <!-- Retro Whiteboard / Chalkboard -->
        <div class="absolute top-12 right-12 w-56 bg-[#1b3a20] border-4 border-[#5d4037] p-3 shadow-2xl z-20 hidden md:block transform rotate-1">
           <div class="absolute inset-0 bg-black/10 pointer-events-none"></div>
           <div class="text-[7px] font-bold text-[#06d6a0] mb-3 border-b border-[#06d6a0]/30 pb-1 flex justify-between">
              <span>OBJETIVOS DEL DÍA</span>
              <span class="animate-pulse">●</span>
           </div>
           <div class="space-y-2 text-[6px] text-white/70 font-mono">
              <div class="flex justify-between"><span>LEADS HOY:</span> <span class="text-white">{{ sellersStore.presence.length * 8 }}</span></div>
              <div class="flex justify-between"><span>CONVERSIÓN:</span> <span class="text-white">14.2%</span></div>
              <div class="flex justify-between"><span>META:</span> <span class="text-[#faae42] animate-bounce">¡A VENDER!</span></div>
           </div>
        </div>

        <div class="office-floor pt-24 md:pt-48 pb-20 px-8 md:px-16 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-16 md:gap-y-32">
          <div v-for="(seller, idx) in sellersStore.presence" :key="seller._id" 
               class="relative group flex flex-col items-center">
            
            <!-- Floor Shadow -->
            <div class="absolute -bottom-4 w-48 h-8 bg-black/40 blur-xl rounded-full pointer-events-none"></div>

            <!-- Desk Structure -->
            <div class="desk relative w-64 h-24 bg-[#5d4037] rounded-sm border-b-8 border-[#3e2723] shadow-2xl transform transition-transform group-hover:scale-[1.02] duration-300">
              <!-- Desk Top Highlight -->
              <div class="absolute inset-x-2 top-2 h-1 bg-white/10 rounded-full"></div>
              
              <!-- Active Desk Glow -->
              <div v-if="seller.status === 'active'" class="absolute -top-12 inset-x-4 h-24 bg-blue-500/10 blur-2xl rounded-full animate-pulse"></div>

              <!-- Desk Accessories -->
              <!-- Mug -->
              <div v-if="seller.status !== 'offline'" class="absolute -top-3 right-6 w-5 h-5 bg-[#d32f2f]/30 rounded-full border border-white/5">
                 <div v-if="seller.status === 'active'" class="absolute -top-4 left-1 w-1 h-4 bg-white/20 blur-[2px] animate-pulse"></div>
              </div>
              <!-- Notebook -->
              <div class="absolute -top-1 left-4 w-6 h-8 bg-gray-200/10 border border-white/5 rotate-[-15deg] rounded-sm"></div>
              
              <!-- Legs -->
              <div class="absolute -bottom-8 left-6 w-3 h-8 bg-[#3e2723]"></div>
              <div class="absolute -bottom-8 right-6 w-3 h-8 bg-[#3e2723]"></div>

              <!-- Monitor -->
              <div class="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-18 bg-[#111] border-[5px] border-[#222] rounded shadow-2xl overflow-hidden flex items-center justify-center">
                <!-- CRT Overlay -->
                <div v-if="seller.status !== 'offline'" class="absolute inset-0 pointer-events-none z-10 opacity-30" 
                     style="background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%;"></div>
                
                <!-- Screen Content -->
                <div v-if="seller.status !== 'offline'" class="w-full h-full p-2 flex flex-col gap-1.5 overflow-hidden" 
                     :class="seller.status === 'active' ? 'bg-[#0a0f1e]' : 'bg-[#050505]'">
                  <div v-for="i in 4" :key="i" class="h-1 bg-[#06d6a0]/30 rounded-full animate-code-line" 
                       :style="{ width: `${30 + Math.random() * 60}%`, animationDelay: `${i * 250}ms` }"></div>
                  <div class="flex gap-1 mt-auto">
                    <div class="w-2 h-2 rounded-full" :class="seller.status === 'active' ? 'bg-[#06d6a0] shadow-[0_0_5px_#06d6a0]' : 'bg-gray-800'"></div>
                    <div class="w-8 h-1 bg-white/5 rounded-full"></div>
                  </div>
                </div>
                <div v-else class="w-full h-full bg-black"></div>
              </div>
            </div>

            <!-- Seller Character (Dynamic Pixel Art) -->
            <div class="absolute -top-14 -left-4 w-20 h-20 transition-transform duration-300">
              <PixelAgent 
                :status="seller.status" 
                :color="getSellerIdentityColor(idx)" 
                :frame="frame"
                :id="seller.seller_name" 
              />
              
              <!-- Chat Bubble for task -->
              <div v-if="seller.status === 'active'" 
                    class="absolute -top-14 -right-12 bg-white text-black p-2 rounded-lg text-[6px] shadow-xl border-2 border-gray-200 min-w-[80px] animate-fade-in z-30">
                {{ seller.lastAction?.split('(')[0] || 'Llamando...' }}
                <div class="absolute -bottom-2 left-2 w-2 h-2 bg-white rotate-45 border-b-2 border-r-2 border-gray-200"></div>
              </div>
            </div>

            <!-- Seller Name & Status Label (Uses status color) -->
            <div class="mt-4 md:mt-8 text-center flex flex-col items-center gap-1">
              <div class="text-[8px] font-bold tracking-tight" :style="{ color: getStatusColor(seller.status) }">
                {{ seller.seller_name }}
              </div>
              <div class="inline-block px-2 py-1 bg-black/60 rounded text-[5px] border"
                   :style="{ color: getStatusColor(seller.status), borderColor: getStatusColor(seller.status) + '33' }">
                {{ getStatusLabel(seller.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="bg-[#283252] p-3 border-t-4 border-[#4B2BBB] flex flex-wrap justify-center md:justify-around gap-4 text-[7px] text-gray-400">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse"></span>
        TRABAJANDO: {{ sellersStore.presence.filter(s => s.status === 'active').length }}
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#faae42]"></span>
        INACTIVOS: {{ sellersStore.presence.filter(s => s.status === 'idle').length }}
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
        AUSENTES: {{ sellersStore.presence.filter(s => s.status === 'away').length }}
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-gray-500"></span>
        OFFLINE: {{ sellersStore.presence.filter(s => s.status === 'offline').length }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-pixelated {
  image-rendering: pixelated;
}

.crt-effect::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
  z-index: 10;
  background-size: 100% 3px, 3px 100%;
  pointer-events: none;
}

@keyframes code-line {
  0% { opacity: 0; transform: translateX(-10px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateX(10px); }
}

.animate-code-line {
  animation: code-line 1.5s infinite linear;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-float {
  animation: float 2.5s infinite ease-in-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.office-floor {
  background: 
    linear-gradient(to right, rgba(75, 43, 187, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(75, 43, 187, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Custom Scrollbar for Retro Feel */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #0f0f18;
}
::-webkit-scrollbar-thumb {
  background: #283252;
  border: 2px solid #4B2BBB;
}
</style>
