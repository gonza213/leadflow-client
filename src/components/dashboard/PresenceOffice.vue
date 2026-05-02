<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
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

const startPolling = () => {
  stopPolling()
  sellersStore.fetchPresence() // Initial fetch on start
  polling.value = setInterval(() => {
    sellersStore.fetchPresence()
  }, 15000)
}

const stopPolling = () => {
  if (polling.value) {
    clearInterval(polling.value)
    polling.value = null
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    startPolling()
  } else {
    stopPolling()
  }
}

onMounted(async () => {
  startPolling()
  document.addEventListener('visibilitychange', handleVisibilityChange)

  const animate = () => {
    frame.value++
    animationFrame.value = requestAnimationFrame(animate)
  }
  animationFrame.value = requestAnimationFrame(animate)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (animationFrame.value) cancelAnimationFrame(animationFrame.value)
})

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#10b981'
    case 'idle': return '#f59e0b'
    case 'away': return '#8b5cf6'
    default: return '#64748b'
  }
}

const IDENTITY_COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6', '#10b981']
const getSellerIdentityColor = (index) => IDENTITY_COLORS[index % IDENTITY_COLORS.length]
</script>

<template>
  <div class="executive-office h-full flex flex-col bg-[#0f172a] text-slate-200 overflow-hidden sm:rounded-3xl border border-white/10 shadow-2xl relative font-sans">
    
    <!-- Header: Professional UI -->
    <div class="min-h-[5rem] flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 sm:py-0 bg-slate-900/50 backdrop-blur-md border-b border-white/5 z-50 gap-4">
      <div class="flex items-center gap-4 w-full sm:w-auto">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="text-sm sm:text-lg font-bold text-white tracking-tight leading-tight truncate">{{ t('presence.title') }}</h2>
          <p class="text-[10px] sm:text-xs text-slate-400 font-medium truncate">{{ t('presence.subtitle') }} • {{ authStore.user?.tenant?.name }}</p>
        </div>
      </div>
      
      <div class="flex gap-3 sm:gap-6 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 px-2 sm:px-0 custom-scroll no-scrollbar">
        <div v-for="stat in ['active', 'idle', 'away', 'offline']" :key="stat" class="flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/5 shrink-0">
          <div class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" :style="{ color: getStatusColor(stat) }"></div>
          <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300">{{ t('presence.status.' + stat) }}</span>
        </div>
      </div>
    </div>

    <!-- Main Scene -->
    <div class="flex-1 relative flex overflow-hidden">
      
      <!-- Side Activity Bar -->
      <div class="w-80 bg-slate-900/30 backdrop-blur-xl border-r border-white/5 flex flex-col z-40 hidden xl:flex">
         <div class="p-6">
            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
               {{ t('presence.logs') }}
            </h3>
            <div class="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)] custom-scroll pr-3">
               <div v-for="seller in sellersStore.presence.filter(s => s.lastAction).slice(0, 10)" :key="seller._id" 
                    class="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group cursor-default">
                  <div class="flex justify-between items-center mb-2">
                     <span class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{{ seller.seller_name }}</span>
                     <span class="text-[10px] font-medium text-slate-500">{{ new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 leading-relaxed italic">
                     "{{ seller.lastAction }}"
                  </div>
               </div>
            </div>
         </div>

         <div class="mt-auto p-6 border-t border-white/5 bg-slate-900/50">
            <div class="flex items-center justify-between">
               <div>
                  <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ t('presence.activeNodes') }}</div>
                  <div class="text-2xl font-black text-white">{{ sellersStore.presence.length }}</div>
               </div>
               <div class="w-12 h-12 rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                  <div class="w-8 h-8 rounded-full border-2 border-indigo-500/50 border-t-indigo-500 animate-spin"></div>
               </div>
            </div>
         </div>
      </div>

      <!-- Office Floor -->
      <div class="flex-1 relative overflow-auto custom-scroll p-4 sm:p-8 bg-slate-950/80">
        <!-- Floor Grid FX: More refined for different pixel densities -->
        <div class="absolute inset-0 pointer-events-none opacity-[0.05]" 
             style="background-image: radial-gradient(#6366f1 0.5px, transparent 0.5px); background-size: 30px 30px;"></div>
        <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950 via-transparent to-slate-950 opacity-40"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-8 max-w-[1600px] mx-auto">
          <div v-for="(seller, idx) in sellersStore.presence" :key="seller._id" 
               class="workspace-card group relative perspective-1000">
            
            <!-- Workspace Environment (Cubicle) -->
            <div class="relative p-4 sm:p-6 rounded-[2rem] bg-slate-900/60 border border-white/10 backdrop-blur-2xl transition-all duration-700 group-hover:bg-slate-800/80 group-hover:border-indigo-500/40 group-hover:translate-y-[-4px] group-hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
              
              <!-- Status Aura (Subtle) -->
              <div class="absolute -top-10 -left-10 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000" :style="{ backgroundColor: getStatusColor(seller.status) }"></div>

              <div class="flex flex-row items-center gap-4 sm:gap-6 relative z-20">
                
                <!-- Interaction Zone: The Desk -->
                <div class="relative pt-10 pb-1 shrink-0">
                  
                  <!-- Office Chair (Back) -->
                  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 w-14 h-16 bg-slate-800/60 rounded-t-xl border-t border-x border-white/5 -z-10 group-hover:translate-y-[-1px] transition-transform duration-500">
                  </div>

                  <!-- The Desk (Compact) -->
                  <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130%] h-3 bg-[#3e2723] rounded-sm shadow-lg border-b-2 border-black/30 z-20">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-white/5 rounded-sm"></div>
                  </div>

                  <!-- Office Items -->
                  <!-- Monitor -->
                  <div class="absolute bottom-3 -right-1 w-12 h-10 bg-slate-900 border border-slate-700 rounded-sm shadow-lg z-10 hidden sm:block">
                     <div class="absolute inset-0.5 bg-indigo-900/20 overflow-hidden">
                        <div class="w-full h-0.5 bg-indigo-500/30 rounded-full animate-pulse mt-1"></div>
                        <div class="w-full h-2 bg-indigo-500/10 rounded-sm mt-auto"></div>
                     </div>
                  </div>

                  <!-- The Agent -->
                  <div class="w-16 h-16 sm:w-24 sm:h-24 relative z-10">
                    <PixelAgent 
                      class="pixel-agent"
                      :status="seller.status" 
                      :color="getSellerIdentityColor(idx)" 
                      :frame="frame"
                      :id="seller.seller_name"
                    />
                  </div>
                </div>

                <!-- Info Section -->
                <div class="flex-1 min-w-0">
                  <div class="mb-3">
                    <h4 class="text-base sm:text-xl font-black text-white tracking-tight mb-1 group-hover:text-indigo-300 transition-colors leading-tight">
                      {{ seller.seller_name }}
                    </h4>
                    <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/5">
                      <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getStatusColor(seller.status) }"></div>
                      <span class="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">{{ t('presence.status.' + seller.status) }}</span>
                    </div>
                  </div>

                  <!-- Dynamic Stats (Flexible) -->
                  <div class="flex flex-wrap gap-2 sm:gap-3">
                    <div class="flex-1 min-w-[70px] sm:min-w-[90px] p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
                      <div class="text-[7px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest">{{ t('presence.stats.leads') }}</div>
                      <div class="text-sm sm:text-xl font-black text-white">{{ seller.leadsToday || 0 }}</div>
                    </div>
                    <div class="flex-1 min-w-[70px] sm:min-w-[90px] p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
                      <div class="text-[7px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest">{{ t('presence.stats.sales') }}</div>
                      <div class="text-sm sm:text-xl font-black text-white">{{ seller.salesToday || 0 }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Floating Action Indicator -->
              <div v-if="seller.status === 'active'" class="absolute top-4 right-4 flex gap-1">
                <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" :style="{ animationDelay: (i * 0.1) + 's' }"></span>
              </div>

              <!-- Overload Badge -->
              <div v-if="seller.supportNeeded" class="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-md animate-pulse border border-white/20 shadow-lg shadow-rose-500/40">
                SOS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticker: Localized -->
    <div class="h-8 sm:h-10 bg-slate-900 border-t border-white/5 flex items-center overflow-hidden z-50">
       <div class="animate-marquee whitespace-nowrap flex gap-10 sm:gap-16 items-center px-6 sm:px-10">
          <div v-for="seller in sellersStore.presence" :key="'ticker-'+seller._id" class="flex items-center gap-3">
             <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getStatusColor(seller.status) }"></div>
             <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               {{ seller.seller_name }} • {{ t('presence.status.' + seller.status) }} • {{ seller.leadsToday }} {{ t('presence.stats.leads') }}
             </span>
             <span class="text-white/10 opacity-20">/</span>
          </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.2);
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 50s infinite linear;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.perspective-1000 {
  perspective: 1000px;
}

/* Fix for high-DPI screens and pixel art */
.pixel-agent {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

@media (min-width: 1920px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 2560px) {
  .grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
