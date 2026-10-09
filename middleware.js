// Vercel Routing Middleware: bloquea por país SOLO /landing y /register.
// Los países no permitidos se redirigen a /login (mismo comportamiento que useLocationRestriction).
// Vercel inyecta x-vercel-ip-country en cada request.
const ALLOWED = [
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'EC', 'GT', 'MX', 'PY', 'PA', 'PE', 'UY', // LATAM
  'ID', 'MY', // Asia
  'KE', 'NG'  // África
]

export const config = {
  matcher: ['/landing', '/landing/:path*', '/register', '/register/:path*']
}

export default function middleware(request) {
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase()

  // Sin país (header ausente o 'XX'): se deja pasar; el chequeo del cliente queda de respaldo
  if (!country || country === 'XX' || ALLOWED.includes(country)) return

  return Response.redirect(new URL('/login', request.url), 307)
}
