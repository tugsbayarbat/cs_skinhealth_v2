import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    const isLoginPage = pathname === '/login';
    const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

    if (isPublicAsset) return NextResponse.next();

    // Redirect unauthenticated users to login
    if (!isLoggedIn && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Redirect already-authenticated users away from login
    if (isLoggedIn && isLoginPage) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
});

// Apply middleware to all routes except API and static assets
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
