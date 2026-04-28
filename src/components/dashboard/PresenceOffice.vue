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
  <div class="executive-office h-full flex flex-col bg-[#0f172a] text-slate-200 overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative font-sans">
    
    <!-- Header: Professional UI -->
    <div class="h-20 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md border-b border-white/5 z-50">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight leading-tight">{{ t('presence.title') }}</h2>
          <p class="text-xs text-slate-400 font-medium">{{ t('presence.subtitle') }} • {{ authStore.user?.tenant?.name }}</p>
        </div>
      </div>
      
      <div class="flex gap-6">
        <div v-for="stat in ['active', 'idle', 'away', 'offline']" :key="stat" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
          <div class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" :style="{ color: getStatusColor(stat) }"></div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">{{ t('presence.status.' + stat) }}</span>
        </div>
      </div>
    </div>

    <!-- Main Scene -->
    <div class="flex-1 relative flex">
      
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
      <div class="flex-1 relative overflow-auto custom-scroll p-12 bg-slate-950/50">
        <!-- Floor Grid FX -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#6366f1 1px, transparent 1px); background-size: 40px 40px;"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
          <div v-for="(seller, idx) in sellersStore.presence" :key="seller._id" 
               class="workspace-card group relative">
            
            <!-- Desk Background (Glassmorphism) -->
            <div class="relative p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/[0.07] group-hover:border-indigo-500/30 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              
              <!-- Status Glow -->
              <div class="absolute -top-1 -left-1 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" :style="{ backgroundColor: getStatusColor(seller.status) }"></div>

              <div class="flex items-start gap-6">
                <!-- Avatar Section -->
                <div class="relative pt-6">
                  <!-- Minimalist Desk -->
                  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120%] h-3 bg-[#3e2723] rounded-sm shadow-lg border-b-2 border-black/20 z-0">
                    <div class="absolute inset-0 bg-white/5 rounded-sm"></div>
                  </div>
                  <!-- Desk Legs (Subtle) -->
                  <div class="absolute bottom-0 left-2 w-0.5 h-2 bg-[#2d1b18] z-0"></div>
                  <div class="absolute bottom-0 right-2 w-0.5 h-2 bg-[#2d1b18] z-0"></div>

                  <div class="w-24 h-24 relative z-10">
                    <PixelAgent 
                      :status="seller.status" 
                      :color="getSellerIdentityColor(idx)" 
                      :frame="frame"
                      :id="seller.seller_name"
                    />
                  </div>
                </div>

                <!-- Info Section -->
                <div class="flex-1">
                  <div class="mb-4">
                    <h4 class="text-lg font-bold text-white tracking-tight mb-1">{{ seller.seller_name }}</h4>
                    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5">
                      <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getStatusColor(seller.status) }"></div>
                      <span class="text-[10px] font-black uppercase tracking-wider text-slate-300">{{ t('presence.status.' + seller.status) }}</span>
                    </div>
                  </div>

                  <!-- Quick Stats -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div class="text-[9px] font-bold text-slate-500 uppercase mb-1">{{ t('presence.stats.leads') }}</div>
                      <div class="text-lg font-black text-indigo-400">{{ seller.leadsToday || 0 }}</div>
                    </div>
                    <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div class="text-[9px] font-bold text-slate-500 uppercase mb-1">{{ t('presence.stats.sales') }}</div>
                      <div class="text-lg font-black text-emerald-400">{{ seller.salesToday || 0 }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Realtime Action Badge -->
              <div v-if="seller.status === 'active'" class="absolute -top-3 -right-3 px-4 py-1.5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white text-[10px] font-black uppercase tracking-widest animate-bounce z-30">
                {{ t('presence.alerts.processing') }}
              </div>

              <!-- Overload / Support Alert -->
              <div v-if="seller.supportNeeded" class="absolute -top-3 -left-3 px-4 py-1.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/40 text-white text-[10px] font-black uppercase tracking-widest animate-pulse z-30 border border-white/20">
                ⚠️ {{ t('presence.alerts.support') || '¡SOPORTE!' }}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Ticker: Localized -->
    <div class="h-10 bg-slate-900 border-t border-white/5 flex items-center overflow-hidden z-50">
       <div class="animate-marquee whitespace-nowrap flex gap-16 items-center px-10">
          <div v-for="seller in sellersStore.presence" :key="'ticker-'+seller._id" class="flex items-center gap-3">
             <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getStatusColor(seller.status) }"></div>
             <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
</style>
