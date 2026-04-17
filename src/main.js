import { ViteSSG } from 'vite-ssg'
import { createHead } from '@unhead/vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import { routes } from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

export const createApp = ViteSSG(
  App,
  { routes, base: '/' },
  ({ app, router }) => {
    const pinia = createPinia()
    const head = createHead()
    app.use(pinia)
    app.use(head)
    app.use(VueApexCharts)

    if (import.meta.env.SSR) {
      router.beforeEach((_to, _from, next) => next())
      return
    }

    router.beforeEach((to, _from, next) => {
      const authStore = useAuthStore()

      if (to.meta.public) {
        next()
      } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/landing')
      } else if (to.meta.guest && authStore.isAuthenticated) {
        next(authStore.isSuperAdmin ? '/admin/tenants' : '/')
      } else if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
        next('/')
      } else if (to.meta.requiresManager && !authStore.isManager) {
        next('/')
      } else if (to.meta.denyRoles && to.meta.denyRoles.includes(authStore.userRole)) {
        next('/')
      } else {
        next()
      }
    })
  }
)
