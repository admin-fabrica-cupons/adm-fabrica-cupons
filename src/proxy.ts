import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/auth/login'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir todas as rotas da API sem verificação
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Permitir arquivos estáticos e recursos do Next.js
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/sounds') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Permitir rotas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Verificar token simples no cookie
  const token = request.cookies.get('refreshToken')?.value;

  if (!token || !token.startsWith('refresh-token')) {
    // Se não estiver autenticado e não estiver na página de login, redirecionar
    if (pathname !== '/auth/login') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
