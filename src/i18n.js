import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import ptBR from './locales/pt-BR.json'

const i18n = createI18n({
  legacy: false, 
  locale: 'es',
  fallbackLocale: 'es',
  messages: {
    'es': es,
    'pt-BR': ptBR
  }
})

export default i18n
