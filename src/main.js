import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'
import i18n from './i18n'
import App from './App.vue'
import { routes } from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

export const createApp = ViteSSG(
  App,
  { routes, base: '/' },
  ({ app, router }) => {
    // El head lo provee vite-ssg (createHead + app.use internos): así useHead
    // se renderiza en el HTML estático. No crear otra instancia acá.
    const pinia = createPinia()
    app.use(pinia)
    app.use(i18n)

    // Actualizar atributo lang en <html>
    if (!import.meta.env.SSR) {
      document.documentElement.lang = i18n.global.locale.value
    }

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
