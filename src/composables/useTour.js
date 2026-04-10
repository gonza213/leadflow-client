import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

// SVG icons matching the dashboard sidebar
const icons = {
  wave:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  menu:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  chart:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  leads:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
  users:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
  group:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
  cog:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  moon:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`,
  plug:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  sparkles: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
  help:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" stroke-width="2.5"/></svg>`,
}

// Wrap icon in a styled span
const ic = (svg, color = '#3b82f6', bg = 'rgba(59,130,246,0.12)') =>
  `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:${bg};color:${color};vertical-align:middle;margin-right:8px;flex-shrink:0">${svg}</span>`

export function useTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: '¡Entendido!',
      animate: true,
      overlayOpacity: 0.7,
      popoverClass: 'leaddistro-tour',
      steps: [
        {
          element: '#tour-header',
          popover: {
            title: `${ic(icons.wave, '#3b82f6', 'rgba(59,130,246,0.12)')} Bienvenido a LeadDistro`,
            description: 'Este tour te va a guiar por las funciones principales del sistema. Podés saltearlo cuando quieras.',
            side: 'bottom', align: 'start'
          }
        },
        {
          element: '#tour-sidebar',
          popover: {
            title: `${ic(icons.menu, '#64748b', 'rgba(100,116,139,0.12)')} Navegación principal`,
            description: 'Desde acá accedés a todas las secciones: Dashboard, Leads, Vendedores, Usuarios y Configuración.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-dashboard-link',
          popover: {
            title: `${ic(icons.chart, '#3b82f6', 'rgba(59,130,246,0.12)')} Dashboard`,
            description: 'Visualizá en tiempo real los leads por vendedor, etapas del funnel y distribución por equipos.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-leads-link',
          popover: {
            title: `${ic(icons.leads, '#22c55e', 'rgba(34,197,94,0.12)')} Leads`,
            description: 'Listado completo de leads ingresados. Podés filtrar por vendedor, equipo, etapa y período.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-vendedores-link',
          popover: {
            title: `${ic(icons.users, '#8b5cf6', 'rgba(139,92,246,0.12)')} Vendedores`,
            description: 'Gestioná tu equipo de ventas. Configurá límites diarios y semanales para cada vendedor.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-usuarios-link',
          popover: {
            title: `${ic(icons.group, '#f97316', 'rgba(249,115,22,0.12)')} Usuarios`,
            description: 'Gestioná los usuarios de tu organización y sus roles de acceso.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-integraciones-link',
          popover: {
            title: `${ic(icons.plug, '#06b6d4', 'rgba(6,182,212,0.12)')} Integraciones`,
            description: 'Conectá tu CRM con LeadDistro. Encontrás las URLs de webhook, las plataformas compatibles y la configuración de notificaciones.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-resumenes-link',
          popover: {
            title: `${ic(icons.sparkles, '#6366f1', 'rgba(99,102,241,0.12)')} Resúmenes IA`,
            description: 'Historial de resúmenes generados automáticamente con OpenAI. Cada resumen incluye métricas del período y se puede descargar como PDF.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-configuracion-link',
          popover: {
            title: `${ic(icons.cog, '#64748b', 'rgba(100,116,139,0.12)')} Configuración`,
            description: 'Configurá equipos con porcentajes de distribución, etapas del pipeline, webhook del CRM, zona horaria y el resumen automático con IA.',
            side: 'right', align: 'start'
          }
        },
        {
          element: '#tour-darkmode',
          popover: {
            title: `${ic(icons.moon, '#6366f1', 'rgba(99,102,241,0.12)')} Modo oscuro`,
            description: 'Cambiá entre modo claro y oscuro según tu preferencia.',
            side: 'bottom', align: 'end'
          }
        },
        {
          element: '#tour-help-btn',
          popover: {
            title: `${ic(icons.help, '#3b82f6', 'rgba(59,130,246,0.12)')} Guía de ayuda`,
            description: 'Podés volver a ver esta guía o consultar el manual desde este botón en cualquier momento.',
            side: 'bottom', align: 'end'
          }
        }
      ]
    })

    driverObj.drive()
  }

  return { startTour }
}
