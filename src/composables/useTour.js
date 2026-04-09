import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function useTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      animate: true,
      overlayOpacity: 0.7,
      popoverClass: 'leadflow-tour',
      steps: [
        {
          element: '#tour-header',
          popover: {
            title: '👋 Bienvenido a LeadFlow',
            description: 'Este tour te va a guiar por las funciones principales del sistema. Podés saltearlo cuando quieras.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-sidebar',
          popover: {
            title: '📋 Navegación principal',
            description: 'Desde acá accedés a todas las secciones: Dashboard, Leads, Vendedores, Usuarios y Configuración.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-dashboard-link',
          popover: {
            title: '📊 Dashboard',
            description: 'Visualizá en tiempo real los leads por vendedor, etapas del funnel y distribución por equipos.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-leads-link',
          popover: {
            title: '📥 Leads',
            description: 'Listado completo de leads ingresados. Podés filtrar por vendedor, equipo, etapa y período.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-sellers-link',
          popover: {
            title: '👥 Vendedores',
            description: 'Gestioná tu equipo de ventas. Configurá límites diarios y semanales para cada vendedor.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-config-link',
          popover: {
            title: '⚙️ Configuración',
            description: 'Configurá equipos con porcentajes de distribución, etapas del pipeline, webhook de GHL y zona horaria.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-darkmode',
          popover: {
            title: '🌙 Modo oscuro',
            description: 'Cambiá entre modo claro y oscuro según tu preferencia.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '#tour-help-btn',
          popover: {
            title: '❓ Guía de ayuda',
            description: 'Podés volver a ver esta guía o consultar el manual desde este botón en cualquier momento.',
            side: 'bottom',
            align: 'end'
          }
        }
      ]
    })

    driverObj.drive()
  }

  return { startTour }
}
