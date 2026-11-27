import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import ptBR from './locales/pt-BR.json'
import en from './locales/en.json'

// Idioma elegido o, si nunca eligió, el del navegador. En el build (sin window) es español
export const detectLocale = () => {
  if (typeof window === 'undefined') return 'es'
  const saved = localStorage.getItem('user-locale')
  if (saved) return saved
  const nav = (navigator.language || 'es').toLowerCase()
  if (nav.startsWith('en')) return 'en'
  if (nav.startsWith('pt')) return 'pt-BR'
  return 'es'
}

const i18n = createI18n({
  legacy: false, 
  locale: detectLocale(),
  fallbackLocale: 'es',
  messages: {
    'es': es,
    'pt-BR': ptBR,
    'en': en
  }
})

export default i18n
