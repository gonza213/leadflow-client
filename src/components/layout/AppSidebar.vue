<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  uiStore.closeSidebar()
})

const filteredMenuItems = computed(() => {
  if (authStore.isSuperAdmin) {
    return [
      { name: 'Tenants', path: '/admin/tenants', icon: 'building' }
    ]
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: 'chart-bar', roles: ['manager', 'seller', 'viewer'] },
    { name: 'Leads', path: '/leads', icon: 'clipboard-list', roles: ['manager', 'seller', 'viewer'] },
    { name: 'Vendedores', path: '/sellers', icon: 'users', roles: ['manager', 'viewer'] },
    { name: 'Usuarios', path: '/users', icon: 'user-group', tourId: 'usuarios', roles: ['manager'] },
    { name: 'Integraciones', path: '/integrations', icon: 'plug', tourId: 'integraciones', roles: ['manager'] },
    { name: 'Resúmenes IA', path: '/summaries', icon: 'sparkles', tourId: 'resumenes', roles: ['manager'] },
    { name: 'Configuracion', path: '/config', icon: 'cog', tourId: 'configuracion', roles: ['manager'] }
  ]

  return menuItems.filter(item => item.roles.includes(authStore.user?.role))
})
</script>

<template>
  <!-- Backdrop (mobile) -->
  <div
    v-if="uiStore.sidebarOpen"
    @click="uiStore.closeSidebar"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  ></div>

  <!-- Sidebar -->
  <aside
    id="tour-sidebar"
    class="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40 transform transition-all duration-300 ease-in-out"
    :class="[
      uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0'
    ]"
  >
    <nav class="p-4">
      <ul class="space-y-2">
        <li v-for="item in filteredMenuItems" :key="item.path">
          <router-link
            :id="'tour-' + (item.tourId || item.name.toLowerCase()) + '-link'"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="[
              route.path === item.path
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <svg v-if="item.icon === 'chart-bar'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <svg v-else-if="item.icon === 'clipboard-list'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <svg v-else-if="item.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else-if="item.icon === 'user-group'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <svg v-else-if="item.icon === 'cog'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg v-else-if="item.icon === 'plug'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <svg v-else-if="item.icon === 'sparkles'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <svg v-else-if="item.icon === 'building'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>
