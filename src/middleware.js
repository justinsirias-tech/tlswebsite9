import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // If user accesses /en/partner/..., /th/partner/..., /cn/partner/..., strip the locale
  const partnerLocaleMatch = pathname.match(/^\/(en|th|cn)(\/partner(?:\/.*)?)$/);
  if (partnerLocaleMatch) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = partnerLocaleMatch[2];
    return NextResponse.redirect(cleanUrl);
  }

  // If user accesses /en/admin/..., /th/admin/..., /cn/admin/..., strip the locale
  const adminLocaleMatch = pathname.match(/^\/(en|th|cn)(\/admin(?:\/.*)?)$/);
  if (adminLocaleMatch) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = adminLocaleMatch[2];
    return NextResponse.redirect(cleanUrl);
  }

  // If path is /partner, /admin, or /api, do not run intl middleware
  if (pathname.startsWith('/partner') || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, excluding api, admin, partner, _next, _vercel
  matcher: ['/', '/(en|th|cn)/:path*', '/((?!api|admin|partner|_next|_vercel|.*\\..*).*)']
};

