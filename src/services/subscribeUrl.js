// Link de suscripción del plan de dLocalGo. Con ?email= el campo de email del checkout
// llega prellenado, así el pago queda asociado al email de la cuenta.
const BASE = 'https://checkout.dlocalgo.com/validate/subscription/jlZVHZj9raWC65A7dr64sH9V7m4Yn2fS'

export const buildSubscribeUrl = (email) =>
  email ? `${BASE}?email=${encodeURIComponent(email)}` : BASE
