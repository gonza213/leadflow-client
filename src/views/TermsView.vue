<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="legal-page">
    <div class="legal-header">
      <button @click="router.push('/landing')" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Volver
      </button>
      <img src="/logo_leaddistro.png" alt="LeadDistro" class="legal-logo" />
    </div>

    <div class="legal-container">
      <h1>Términos de Servicio</h1>
      <p class="legal-updated">Última actualización: 11 de abril de 2026</p>

      <section>
        <h2>1. Aceptación de los términos</h2>
        <p>Al crear una cuenta y utilizar LeadDistro, aceptás estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguno de estos términos, no podés usar el servicio.</p>
      </section>

      <section>
        <h2>2. Descripción del servicio</h2>
        <p>LeadDistro es una plataforma SaaS de distribución automática de leads para equipos de ventas. El servicio incluye:</p>
        <ul>
          <li>Distribución automática de leads mediante webhook y algoritmo de asignación por equipos y vendedores.</li>
          <li>Dashboard de métricas y seguimiento de leads.</li>
          <li>Gestión de usuarios con roles (Manager, Viewer, Seller).</li>
          <li>Integración con CRMs y herramientas de automatización via webhook.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cuentas y registro</h2>
        <p>Para usar LeadDistro debés crear una cuenta con información verdadera y actualizada. Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.</p>
        <p>Podés invitar usuarios a tu organización (tenant). Sos responsable del uso que esos usuarios hagan del servicio.</p>
      </section>

      <section>
        <h2>4. Suscripción y pagos</h2>
        <p><strong>Período de prueba:</strong> Al registrarte obtenés 7 días de prueba gratuita sin requerir tarjeta de crédito. Al vencer el período de prueba, la cuenta queda inactiva hasta que se active una suscripción.</p>
        <p><strong>Suscripción mensual:</strong> El plan de suscripción tiene un costo de $25 USD por mes. Los pagos se procesan a través de dLocalGo.</p>
        <p><strong>Renovación:</strong> La suscripción se renueva automáticamente cada mes a través de dLocalGo. No necesitás hacer nada para que continúe activa.</p>
        <p><strong>Reembolsos:</strong> No ofrecemos reembolsos por períodos ya utilizados. Si cancelás antes del vencimiento, podés usar el servicio hasta que expire el período pagado.</p>
      </section>

      <section>
        <h2>5. Uso aceptable</h2>
        <p>Al usar LeadDistro te comprometés a:</p>
        <ul>
          <li>No usar el servicio para actividades ilegales o no autorizadas.</li>
          <li>No intentar acceder a datos de otros tenants o usuarios.</li>
          <li>No realizar ingeniería inversa, descompilar o modificar el servicio.</li>
          <li>No sobrecargar intencionalmente la infraestructura del servicio.</li>
          <li>Cumplir con las leyes de privacidad y protección de datos aplicables en tu país respecto a los leads que procesás.</li>
        </ul>
      </section>

      <section>
        <h2>6. Propiedad de los datos</h2>
        <p>Los datos que cargás en LeadDistro (leads, vendedores, configuración) son de tu propiedad. LeadDistro no reclama ningún derecho sobre ellos.</p>
        <p>Al usar el servicio, nos otorgás una licencia limitada para procesar esos datos únicamente con el fin de proveerte el servicio.</p>
      </section>

      <section>
        <h2>7. Disponibilidad del servicio</h2>
        <p>Nos esforzamos por mantener LeadDistro disponible las 24 horas, pero no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimiento programado notificando con anticipación razonable.</p>
        <p>No somos responsables por pérdidas derivadas de interrupciones del servicio, fallos de terceros (MongoDB, Vercel, Koyeb) o causas de fuerza mayor.</p>
      </section>

      <section>
        <h2>8. Limitación de responsabilidad</h2>
        <p>LeadDistro se provee "tal cual" y "según disponibilidad". En ningún caso seremos responsables por daños indirectos, incidentales, especiales o consecuentes que resulten del uso o imposibilidad de usar el servicio.</p>
        <p>Nuestra responsabilidad máxima en cualquier circunstancia estará limitada al monto pagado por el servicio en los últimos 3 meses.</p>
      </section>

      <section>
        <h2>9. Cancelación y terminación</h2>
        <p><strong>Por tu parte:</strong> Podés cancelar tu cuenta en cualquier momento. Tu cuenta permanecerá activa hasta el final del período pagado.</p>
        <p><strong>Por nuestra parte:</strong> Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos, con o sin previo aviso dependiendo de la gravedad de la violación.</p>
        <p>Al cancelar, podés exportar tus datos desde el dashboard antes del cierre de cuenta.</p>
      </section>

      <section>
        <h2>10. Modificaciones</h2>
        <p>Podemos modificar estos términos en cualquier momento. Te notificaremos cambios significativos por email con al menos 7 días de anticipación. El uso continuado del servicio implica aceptación de los términos actualizados.</p>
      </section>

      <section>
        <h2>11. Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se resolverá en los tribunales ordinarios de la ciudad de Buenos Aires.</p>
      </section>

      <section>
        <h2>12. Contacto</h2>
        <p>Para consultas sobre estos términos, contactanos por WhatsApp al +54 221 220 4194 o visitá <a href="https://www.leaddistro.site" target="_blank">www.leaddistro.site</a>.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.legal-page { min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.legal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; background: #0f172a; }
.back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; transition: color 0.2s; }
.back-btn:hover { color: #fff; }
.legal-logo { height: 40px; filter: brightness(0) invert(1); }
.legal-container { max-width: 760px; margin: 0 auto; padding: 56px 24px 80px; }
h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.legal-updated { color: #94a3b8; font-size: 0.85rem; margin-bottom: 48px; }
section { margin-bottom: 36px; }
h2 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
p { color: #475569; font-size: 0.92rem; line-height: 1.8; margin-bottom: 12px; }
ul { padding-left: 20px; margin-bottom: 12px; }
li { color: #475569; font-size: 0.92rem; line-height: 1.8; margin-bottom: 6px; }
a { color: #6366f1; }
</style>
