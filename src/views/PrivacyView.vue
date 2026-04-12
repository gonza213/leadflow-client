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
      <h1>Política de Privacidad</h1>
      <p class="legal-updated">Última actualización: 11 de abril de 2026</p>

      <section>
        <h2>1. Información que recopilamos</h2>
        <p>LeadDistro recopila la siguiente información cuando usás nuestro servicio:</p>
        <ul>
          <li><strong>Datos de cuenta:</strong> nombre, email y contraseña (almacenada con hash bcrypt) al registrarte.</li>
          <li><strong>Datos de empresa:</strong> nombre de la organización y configuración del equipo de ventas.</li>
          <li><strong>Datos de leads:</strong> la información de los prospectos que tu CRM envía a través de la API de LeadDistro (nombre, email, teléfono, u otros campos que vos configurés).</li>
          <li><strong>Datos de uso:</strong> logs de actividad, IP de acceso y métricas de uso del servicio.</li>
        </ul>
      </section>

      <section>
        <h2>2. Cómo usamos tu información</h2>
        <p>Usamos la información recopilada para:</p>
        <ul>
          <li>Proveer, mantener y mejorar el servicio de distribución de leads.</li>
          <li>Procesar y gestionar tu suscripción.</li>
          <li>Enviarte notificaciones transaccionales (confirmación de cuenta, alertas de límites, recuperación de contraseña).</li>
          <li>Detectar y prevenir fraudes o usos no autorizados.</li>
        </ul>
        <p>No vendemos, alquilamos ni compartimos tu información personal con terceros con fines comerciales.</p>
      </section>

      <section>
        <h2>3. Aislamiento de datos entre tenants</h2>
        <p>Cada empresa (tenant) opera en un entorno completamente aislado. Los datos de tus leads, vendedores y configuración nunca son accesibles desde otra cuenta. El aislamiento se implementa a nivel de base de datos mediante identificadores únicos de tenant en cada registro.</p>
      </section>

      <section>
        <h2>4. Seguridad de los datos</h2>
        <p>Implementamos las siguientes medidas de seguridad:</p>
        <ul>
          <li>Todas las comunicaciones van cifradas mediante HTTPS/TLS.</li>
          <li>Las contraseñas se almacenan con hash bcrypt (nunca en texto plano).</li>
          <li>El acceso a la API requiere autenticación mediante JWT con expiración.</li>
          <li>Los datos se almacenan en MongoDB Atlas con backups automáticos.</li>
        </ul>
      </section>

      <section>
        <h2>5. Servicios de terceros</h2>
        <p>LeadDistro utiliza los siguientes proveedores de servicio:</p>
        <ul>
          <li><strong>MongoDB Atlas</strong> — almacenamiento de datos.</li>
          <li><strong>Resend</strong> — envío de emails transaccionales.</li>
          <li><strong>dLocalGo</strong> — procesamiento de pagos y suscripciones.</li>
          <li><strong>Vercel</strong> — hosting del frontend.</li>
          <li><strong>Koyeb</strong> — hosting del backend.</li>
        </ul>
        <p>Estos proveedores tienen sus propias políticas de privacidad y solo reciben la información necesaria para prestar su servicio.</p>
      </section>

      <section>
        <h2>6. Retención y eliminación de datos</h2>
        <p>Tus datos se conservan mientras tu cuenta esté activa. Si cancelás tu cuenta, podés solicitar la eliminación completa de tus datos escribiéndonos a través de WhatsApp. Los datos de facturación pueden conservarse por obligaciones legales según la legislación aplicable.</p>
      </section>

      <section>
        <h2>7. Tus derechos</h2>
        <p>Tenés derecho a:</p>
        <ul>
          <li>Acceder a los datos personales que tenemos sobre vos.</li>
          <li>Corregir información incorrecta.</li>
          <li>Solicitar la eliminación de tu cuenta y datos.</li>
          <li>Exportar tus leads en formato CSV desde el dashboard.</li>
        </ul>
        <p>Para ejercer cualquiera de estos derechos, contactanos por WhatsApp.</p>
      </section>

      <section>
        <h2>8. Cambios en esta política</h2>
        <p>Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos por email. El uso continuado del servicio después de los cambios implica tu aceptación de la nueva política.</p>
      </section>

      <section>
        <h2>9. Contacto</h2>
        <p>Para consultas sobre esta política de privacidad, contactanos por WhatsApp al +54 221 220 4194 o visitá <a href="https://www.leaddistro.site" target="_blank">www.leaddistro.site</a>.</p>
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
