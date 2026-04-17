import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import ptBR from './locales/pt-BR.json'

const i18n = createI18n({
  legacy: false, 
  locale: (typeof window !== 'undefined' && localStorage.getItem('user-locale')) || 'es',
  fallbackLocale: 'es',
  messages: {
    'es': es,
    'pt-BR': ptBR
  }
})

export default i18n
