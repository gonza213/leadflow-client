// Permiso corto que entrega el login cuando la cuenta está bloqueada: solo sirve para pagar.
// Vive en sessionStorage para sobrevivir el paso a /payment-success en la misma pestaña.
const KEY = 'paymentToken'

export const getPaymentToken = () => {
  try { return sessionStorage.getItem(KEY) } catch { return null }
}

export const setPaymentToken = (token) => {
  try {
    if (token) sessionStorage.setItem(KEY, token)
    else sessionStorage.removeItem(KEY)
  } catch {
    // Sin almacenamiento no hay pago desde el login
  }
}
