import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if they are trying to access dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Basic protection: if we don't see our custom token cookie or header
    // Wait, since we store token in localStorage, it's not accessible to Next.js middleware by default unless we set a cookie.
    // Instead of full server middleware, we can just let AuthContext handle the redirect on the client side, 
    // but a client component wrapper in the Dashboard layout is better.
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
