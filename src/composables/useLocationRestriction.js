import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export function useLocationRestriction() {
  const router = useRouter()
  const authStore = useAuthStore()

  const allowedCountryCodes = [
    'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'EC', 'GT', 'MX', 'PY', 'PA', 'PE', 'UY', // LATAM
    'ID', 'MY', // ASIA
    'KE', 'NG'  // AFRICA
  ]

  const checkLocation = async () => {
    // If already authenticated or checked in this session, skip
    if (authStore.isAuthenticated || sessionStorage.getItem('location_allowed') === 'true') return

    try {
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      
      if (data.country_code && !allowedCountryCodes.includes(data.country_code)) {
        console.warn(`Access restricted for country: ${data.country_code}. Redirecting to login.`)
        router.replace('/login')
      } else {
        sessionStorage.setItem('location_allowed', 'true')
      }
    } catch (err) {
      console.error('Location check failed:', err)
      // We don't block if the API fails to avoid false positives for legitimate users
    }
  }

  return {
    checkLocation
  }
}
