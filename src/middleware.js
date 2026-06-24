import { NextResponse } from 'next/server';

export function middleware(request) {
  // Omitimos la protección para la ruta de login, peticiones a /api/auth y recursos estáticos
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') // Permite archivos estáticos (.css, .js, .svg, etc)
  ) {
    return NextResponse.next();
  }

  // Comprobamos si existe la cookie de sesión
  const authCookie = request.cookies.get('metal_session');

  // Si no está autenticado, redirigimos al login
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar el middleware a todas las rutas excepto a los estáticos de Next
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
