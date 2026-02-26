// Canonical NextAuth v5 middleware — re-export `auth` directly.
// Redirect logic lives in the `authorized` callback in src/auth.js.
export { auth as middleware } from '@/auth';

// Apply to all routes except API, static assets, and images
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
