<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '../../stores/config'

const configStore = useConfigStore()
const router = useRouter()

onMounted(() => {
  if (!configStore.config) {
    configStore.fetchConfig()
  }
})

const goToSettings = () => {
  router.push('/config')
}
</script>

<template>
  <Transition name="fade-slide">
    <div v-if="configStore.isPeriodExpired" class="period-banner">
      <div class="banner-content">
        <div class="icon-pulse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="text-container">
          <h3>Periodo de distribución vencido</h3>
          <p>La fecha de fin del periodo es anterior a hoy. Actualizá el periodo para que la distribución y las métricas funcionen correctamente.</p>
        </div>
        <button @click="goToSettings" class="btn-banner">
          Configurar Periodo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.period-banner {
  background: linear-gradient(90deg, #ff4b2b, #ff416c);
  color: white;
  padding: 12px 24px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(255, 75, 43, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-pulse {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.text-container {
  flex: 1;
}

.text-container h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.text-container p {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}

.btn-banner {
  background: white;
  color: #ff4b2b;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .btn-banner {
    width: 100%;
    justify-content: center;
  }
}
</style>
