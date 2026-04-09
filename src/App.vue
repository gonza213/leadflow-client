<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'

const route = useRoute()
const authStore = useAuthStore()

const showLayout = computed(() => {
  return authStore.isAuthenticated && route.name !== 'Login' && route.name !== 'Landing'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <template v-if="showLayout">
      <AppHeader />
      <div class="flex">
        <AppSidebar />
        <main class="flex-1 p-4 lg:p-6 lg:ml-64 mt-16">
          <router-view />
        </main>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>
