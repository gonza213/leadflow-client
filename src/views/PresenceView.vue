<script setup>
import PresenceOffice from '../components/dashboard/PresenceOffice.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('dashboard.presence.title') }}
      </h1>
    </div>

    <div class="h-[calc(100vh-200px)] min-h-[600px]">
      <PresenceOffice />
    </div>

    <!-- Additional info or metrics can go here -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {{ t('presence.howItWorks.title', '¿Cómo funciona?') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {{ t('presence.howItWorks.desc', 'Este panel muestra la actividad real de tus vendedores. Un vendedor se marca como activo cuando realiza una actualización en cualquier lead (cambio de etapa, nota, etc.). Si no hay actividad por más de 15 minutos, pasará a estado inactivo.') }}
        </p>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {{ t('presence.tip.title', 'Tip de productividad') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {{ t('presence.tip.desc', 'Usa esta vista para identificar cuellos de botella o momentos de alta demanda. Si ves a muchos vendedores en inactivo durante horas pico, puede ser un buen momento para revisar la distribución de leads.') }}
        </p>
      </div>
    </div>
  </div>
</template>
