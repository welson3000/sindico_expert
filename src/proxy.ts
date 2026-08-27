import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');
  const isPortalRoute = nextUrl.pathname.startsWith('/portal');
  const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'FORNECEDOR') {
        return NextResponse.redirect(new URL('/portal', nextUrl));
      }
      return NextResponse.redirect(new URL('/dashboard/condominiums', nextUrl));
    }
    return null;
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (role === 'FORNECEDOR') {
      return NextResponse.redirect(new URL('/portal', nextUrl));
    }
    return null;
  }

  if (isPortalRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (role !== 'FORNECEDOR') {
      return NextResponse.redirect(new URL('/dashboard/condominiums', nextUrl));
    }
    return null;
  }

  return null;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
