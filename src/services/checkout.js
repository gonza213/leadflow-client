// Checkout de la suscripción con Paddle (única pasarela; es el Merchant of Record).
import { subscriptionApi } from './api'

const PADDLE_SCRIPT = 'https://cdn.paddle.com/paddle/v2/paddle.js'
const env = import.meta.env

const onPaddleEvent = (event) => {
  if (event?.name !== 'checkout.completed') return
  const txn = event.data?.transaction_id
  if (txn) window.location.assign(`/payment-success?txn=${encodeURIComponent(txn)}`)
}

// Paddle.js se descarga una sola vez y recién cuando hace falta
let paddlePromise = null
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
      script.onerror = () => reject(new Error('Paddle.js could not be loaded'))
      document.head.appendChild(script)
    }).catch((error) => {
      paddlePromise = null // permitir reintentar
      throw error
    })
  }
  return paddlePromise
}

const PADDLE_LOCALES = { es: 'es', en: 'en', 'pt-BR': 'pt' }

export const startCheckout = async ({ locale = 'en' } = {}) => {
  if (!env.VITE_PADDLE_CLIENT_TOKEN || !env.VITE_PADDLE_PRICE_ID) {
    throw new Error('Faltan VITE_PADDLE_CLIENT_TOKEN o VITE_PADDLE_PRICE_ID')
  }
  const [{ data }, Paddle] = await Promise.all([subscriptionApi.getCheckoutInfo(), loadPaddle()])
  Paddle.Checkout.open({
    items: [{ priceId: env.VITE_PADDLE_PRICE_ID, quantity: 1 }],
    customer: { email: data.email },
    customData: { entityType: data.entityType, entityId: data.entityId },
    settings: { displayMode: 'overlay', locale: PADDLE_LOCALES[locale] || 'en' }
  })
}
