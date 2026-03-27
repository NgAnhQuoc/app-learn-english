import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const isAuth = request.cookies.has('co_minh_auth');
  const path = request.nextUrl.pathname;
  
  // Skip static files, Next.js internal routes, and explicitly allowed API endpoints
  if (
    path.startsWith('/_next') || 
    path === '/favicon.ico' || 
    path === '/icon' ||
    path.match(/\.(.*)$/) // Skip files with extensions like .png, .svg
  ) {
    return NextResponse.next();
  }

  // Handle root route
  if (path === '/') {
    if (isAuth) {
      return NextResponse.redirect(new URL('/co-minh-english', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle unauthenticated users
  if (!isAuth && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle authenticated users visiting login page
  if (isAuth && path === '/login') {
    return NextResponse.redirect(new URL('/co-minh-english', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon).*)'],
};
