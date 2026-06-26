import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// Slugs del blog leídos del locale → así un post nuevo se pre-renderiza solo
const esLocale = JSON.parse(readFileSync(fileURLToPath(new URL('./src/locales/es.json', import.meta.url)), 'utf-8'))
const blogRoutes = Object.keys(esLocale.blog?.posts || {}).map(slug => `/blog/${slug}`)

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin()
  ],
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
      // Pre-renderizar todas las rutas públicas + el blog (índice y cada artículo)
      const publicRoutes = ['/landing', '/login', '/register', '/privacy', '/terms', '/payment-success', '/blog']
      const staticPublic = paths.filter(p => publicRoutes.includes(p))
      // /blog/:slug es dinámica: no aparece en `paths`, la agregamos a mano
      return [...new Set([...staticPublic, ...blogRoutes])]
    }
  }
})
