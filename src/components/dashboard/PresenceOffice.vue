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
      <div class="w-64 bg-[#1a1a2e] border-r-4 border-[#4B2BBB] p-4 flex flex-col gap-4 overflow-y-auto hidden lg:flex">
        <div class="text-[8px] text-gray-500 mb-2 uppercase border-b border-[#283252] pb-2">Registro de Actividad</div>
        <div class="flex flex-col gap-3">
          <div v-for="seller in sellersStore.presence.filter(s => s.lastAction).slice(0, 8)" :key="seller._id" 
               class="text-[7px] leading-relaxed p-2 bg-black/20 rounded border-l-2" 
               :style="{ borderLeftColor: getSellerIdentityColor(sellersStore.presence.indexOf(seller)) }">
            <span class="text-white opacity-80">{{ seller.seller_name }}</span><br/>
            <span class="text-[#06d6a0] mt-1 block">{{ seller.lastAction }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Office Floor -->
      <div class="flex-1 relative bg-[#080810] overflow-auto crt-effect">
        <!-- Floor & Walls -->
        <div class="absolute inset-0 pointer-events-none opacity-20" 
             style="background-image: radial-gradient(#4B2BBB 0.5px, transparent 0.5px); background-size: 20px 20px;"></div>
        
        <!-- Retro Whiteboard / Chalkboard -->
        <div class="absolute top-12 right-12 w-48 bg-[#1b3a20] border-4 border-[#5d4037] p-2 shadow-xl z-20 hidden md:block">
           <div class="text-[6px] text-[#06d6a0] mb-2 border-b border-[#06d6a0]/30 pb-1">OBJETIVOS DEL DÍA</div>
           <div class="space-y-1 text-[5px] text-white/70">
              <div class="flex justify-between"><span>LEADS HOY:</span> <span class="text-white">{{ sellersStore.presence.length * 5 }}</span></div>
              <div class="flex justify-between"><span>CONVERSIÓN:</span> <span class="text-white">12%</span></div>
              <div class="flex justify-between"><span>META:</span> <span class="text-[#faae42]">¡A VENDER!</span></div>
           </div>
        </div>

        <div class="office-floor pt-16 md:pt-48 pb-12 px-4 md:px-12 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-24">
          <div v-for="(seller, idx) in sellersStore.presence" :key="seller._id" 
               class="relative group flex flex-col items-center">
            
            <!-- Desk Structure (Scaled Down & Fixed Width) -->
            <div class="desk relative w-64 h-20 bg-[#5d4037] rounded-sm border-b-4 border-[#3e2723] shadow-lg">
              <div class="absolute inset-x-2 top-2 bottom-2 bg-[#6d4c41] rounded-sm opacity-50"></div>
              
              <!-- Legs -->
              <div class="absolute -bottom-4 left-4 w-2 h-4 bg-[#3e2723]"></div>
              <div class="absolute -bottom-4 right-4 w-2 h-4 bg-[#3e2723]"></div>

              <!-- Monitor (Scaled Down) -->
              <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-14 bg-[#333] border-4 border-[#111] rounded shadow-xl overflow-hidden flex items-center justify-center">
                <!-- Screen Content -->
                <div v-if="seller.status === 'active'" class="w-full h-full p-1 flex flex-col gap-1 overflow-hidden">
                  <div v-for="i in 3" :key="i" class="h-1 bg-[#06d6a0]/40 rounded-full animate-code-line" 
                       :style="{ width: `${20 + Math.random() * 60}%`, animationDelay: `${i * 200}ms` }"></div>
                </div>
                <div v-else-if="seller.status === 'idle'" class="w-full h-full flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-[#4B2BBB]/50 animate-ping"></div>
                </div>
                <div v-else class="w-full h-full bg-black/80"></div>
              </div>
              <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-[#444]"></div>

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

              <!-- Office Decor: Coffee Mug (Uses identity color, gray if offline) -->
              <div class="absolute top-2 right-4 w-2 h-2 rounded-t-sm" 
                   :style="{ backgroundColor: seller.status === 'offline' ? '#444' : getSellerIdentityColor(idx) }">
                <div class="absolute top-0 right-[-1px] w-1.5 h-1.5 border-2 rounded-full" 
                     :style="{ borderColor: seller.status === 'offline' ? '#444' : getSellerIdentityColor(idx) }"></div>
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
