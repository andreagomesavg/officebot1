import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth_session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Si no hay cookie y no está en el login, redirigir a /login
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya está logueado e intenta ir al login, mandarlo al dashboard
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Protege todas las rutas excepto la API y archivos estáticos
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};