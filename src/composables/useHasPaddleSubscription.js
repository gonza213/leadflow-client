// ¿La cuenta que paga ya tiene suscripción en Paddle? (muestra cancelar y el portal)
import { onMounted, ref } from 'vue'
import { subscriptionApi } from '../services/api'

export const useHasPaddleSubscription = () => {
  const hasPaddleSubscription = ref(false)
  onMounted(async () => {
    try {
      const { data } = await subscriptionApi.getCheckoutInfo()
      hasPaddleSubscription.value = !!data.hasPaddleSubscription
    } catch {
      // Sin el dato no se muestran las acciones de la suscripción
    }
  })
  return hasPaddleSubscription
}
