// Pantalla de entrada según el rol, después de iniciar sesión
export const homeRoute = (authStore) => {
  if (authStore.isSuperAdmin) return '/admin/tenants'
  // dueño multi-cuenta: siempre pasa por el selector de cuentas
  if (authStore.isAdminClient) return '/cuentas'
  return '/'
}
