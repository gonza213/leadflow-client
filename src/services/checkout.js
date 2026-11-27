// Checkout de la suscripción: dLocalGo (Latinoamérica) o Paddle (EE. UU. y resto del mundo).
import { subscriptionApi } from './api'
import { buildSubscribeUrl } from './subscribeUrl'

const PADDLE_SCRIPT = 'https://cdn.paddle.com/paddle/v2/paddle.js'
const env = import.meta.env

// Sin las variables de Paddle solo se ofrece dLocalGo, como antes
export const paddleEnabled = () => !!(env.VITE_PADDLE_CLIENT_TOKEN && env.VITE_PADDLE_PRICE_ID)

const LATAM_ZONES = new Set([
  'Buenos_Aires', 'Sao_Paulo', 'Bahia', 'Fortaleza', 'Recife', 'Manaus', 'Belem', 'Mexico_City', 'Monterrey', 'Cancun',
  'Merida', 'Tijuana', 'Bogota', 'Lima', 'Santiago', 'Montevideo', 'Asuncion', 'La_Paz', 'Guayaquil', 'Caracas',
  'Costa_Rica', 'Guatemala', 'El_Salvador', 'Tegucigalpa', 'Managua', 'Panama', 'Santo_Domingo',
  // Nombres antiguos de zonas argentinas que todavía informan algunos navegadores
  'Cordoba', 'Mendoza', 'Catamarca', 'Jujuy'
].map(name => `America/${name}`))

export const providerForTimeZone = (timeZone = '') =>
  timeZone.startsWith('America/Argentina/') || LATAM_ZONES.has(timeZone) ? 'dlocalgo' : 'paddle'

export const suggestedProvider = () => {
  if (!paddleEnabled()) return 'dlocalgo'
  return providerForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
}

let paddlePromise = null
const onPaddleEvent = (event) => {
  if (event?.name !== 'checkout.completed') return
  const txn = event.data?.transaction_id
  if (txn) window.location.assign(`/payment-success?provider=paddle&txn=${encodeURIComponent(txn)}`)
}

// Paddle.js se descarga una sola vez y recién cuando hace falta
const loadPaddle = () => {
  if (!paddlePromise) {
    paddlePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = PADDLE_SCRIPT
      script.async = true
      script.onload = () => {
        try {
          if (env.VITE_PADDLE_ENV === 'sandbox') window.Paddle.Environment.set('sandbox')
          window.Paddle.Initialize({ token: env.VITE_PADDLE_CLIENT_TOKEN, eventCallback: onPaddleEvent })
          resolve(window.Paddle)
        } catch (error) {
          reject(error)
        }
      }
      script.onerror = () => reject(new Error('No se pudo cargar Paddle'))
      document.head.appendChild(script)
    }).catch((error) => {
      paddlePromise = null // permitir reintentar
      throw error
    })
  }
  return paddlePromise
}

const PADDLE_LOCALES = { es: 'es', en: 'en', 'pt-BR': 'pt' }

/**
 * @param {'paddle'|'dlocalgo'} provider
 * @param {{ email?: string, locale?: string }} options - email para dLocalGo; idioma de la app
 */
export const startCheckout = async (provider, { email, locale = 'es' } = {}) => {
  if (provider === 'dlocalgo') {
    // Antes de cualquier await: si no, el navegador bloquea la ventana nueva
    window.open(buildSubscribeUrl(email), '_blank', 'noopener')
    return
  }
  const [{ data }, Paddle] = await Promise.all([subscriptionApi.getCheckoutInfo(), loadPaddle()])
  Paddle.Checkout.open({
    items: [{ priceId: env.VITE_PADDLE_PRICE_ID, quantity: 1 }],
    customer: { email: data.email },
    customData: { entityType: data.entityType, entityId: data.entityId },
    settings: { displayMode: 'overlay', locale: PADDLE_LOCALES[locale] || 'en' }
  })
}
