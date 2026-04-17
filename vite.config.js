import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    includedRoutes(paths) {
      // Pre-renderizar todas las rutas públicas
      const publicRoutes = ['/landing', '/login', '/register', '/privacy', '/terms', '/payment-success']
      return paths.filter(p => publicRoutes.includes(p))
    }
  }
})
