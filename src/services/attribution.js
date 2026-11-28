// De dónde llega cada visitante al sitio (UTM y referrer), sin cookies ni datos personales.
// - Primera visita (first touch): se guarda 90 días y viaja con el registro.
// - Una visita por sesión: se registra en el server para las métricas del superadmin.
import api from './api'

const FIRST_TOUCH_KEY = 'ld_first_touch'
const SESSION_KEY = 'ld_visit_sent'
// Navegador de alguien que inició sesión (vos o un cliente): no cuenta como tráfico nuevo
const INTERNAL_KEY = 'ld_no_track'
const FIRST_TOUCH_DAYS = 90
const OWN_HOSTS = /(^|\.)leaddistro\.(site|app)$|\.vercel\.app$|^localhost$/

const externalReferrer = () => {
  try {
    if (!document.referrer) return ''
    const host = new URL(document.referrer).hostname.replace(/^www\./, '')
    return OWN_HOSTS.test(host) ? '' : document.referrer
  } catch {
    return ''
  }
}

// Identificadores de clic que agregan las plataformas (se manda solo cuál vino, no su valor)
const CLICK_IDS = ['fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'ttclid', 'li_fat_id']

const currentTouch = () => {
  const q = new URLSearchParams(window.location.search)
  return {
    click: CLICK_IDS.find((id) => q.has(id)) || '',
    referrer: externalReferrer(),
    utm_source: q.get('utm_source') || '',
    utm_medium: q.get('utm_medium') || '',
    utm_campaign: q.get('utm_campaign') || '',
    landingPage: window.location.pathname,
    at: Date.now()
  }
}

// Llamar una vez al arrancar la app en el navegador
export const captureFirstTouch = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FIRST_TOUCH_KEY) || 'null')
    const fresh = saved && Date.now() - saved.at < FIRST_TOUCH_DAYS * 86400000
    if (!fresh) localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(currentTouch()))
  } catch { /* sin storage: el registro va sin fuente */ }
}

// Lo que se manda con el registro
export const getAttribution = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FIRST_TOUCH_KEY) || 'null')
    if (!saved) return null
    const { at, ...rest } = saved
    return rest
  } catch {
    return null
  }
}

export const markInternal = () => {
  try { localStorage.setItem(INTERNAL_KEY, '1') } catch { /* sin storage */ }
}

// Registra la visita una sola vez por sesión (la primera página que ve).
// El server además cuenta cada IP una sola vez.
// Pantallas de acceso: quien entra ahí es un usuario existente, no tráfico nuevo
const NOT_TRAFFIC = /^\/(login|reset-password|verify-email|payment-success)(\/|$)/

export const trackVisit = (path) => {
  if (NOT_TRAFFIC.test(path)) return
  try {
    if (localStorage.getItem(INTERNAL_KEY) || sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    return
  }
  const touch = currentTouch()
  api.post('/analytics/visit', {
    path,
    referrer: touch.referrer,
    utm_source: touch.utm_source,
    utm_medium: touch.utm_medium,
    utm_campaign: touch.utm_campaign,
    click: touch.click
  }).catch(() => { /* una métrica nunca debe molestar al visitante */ })
}
