import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import sql from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
    // JWT sessions — compatible with Credentials provider.
    // User profiles live in Neon; session token is a signed cookie.
    session: { strategy: 'jwt' },

    providers: [
        Credentials({
            // These labels appear in the built-in NextAuth forms (we use our own UI)
            credentials: {
                email: { label: 'Email', type: 'email' },
                otp: { label: 'One-time code', type: 'text' },
            },

            async authorize({ email, otp }) {
                if (!email || !otp) return null;

                // 1. Find most-recent valid OTP for this email
                const records = await sql`
          SELECT * FROM otp_codes
          WHERE email      = ${email.toLowerCase()}
            AND used       = FALSE
            AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1
        `;

                const record = records[0];
                if (!record || record.code !== String(otp)) return null;

                // 2. Mark OTP as used (one-time)
                await sql`
          UPDATE otp_codes SET used = TRUE WHERE id = ${record.id}
        `;

                // 3. Find or create the user in Neon
                let userRows = await sql`
          SELECT * FROM users
          WHERE email = ${email.toLowerCase()}
          LIMIT 1
        `;

                if (userRows.length === 0) {
                    userRows = await sql`
            INSERT INTO users (email, email_verified)
            VALUES (${email.toLowerCase()}, NOW())
            RETURNING *
          `;
                }

                const user = userRows[0];

                // Return value is encoded into the JWT
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name ?? null,
                    image: user.image ?? null,
                    role: user.role,
                };
            },
        }),
    ],

    callbacks: {
        // Route protection — called by middleware on every request
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isLoginPage = nextUrl.pathname === '/login';

            // Authenticated user hitting /login → redirect to app
            if (isLoggedIn && isLoginPage) {
                return Response.redirect(new URL('/', nextUrl));
            }
            // Unauthenticated user hitting any other page → redirect to /login
            if (!isLoggedIn && !isLoginPage) {
                return Response.redirect(new URL('/login', nextUrl));
            }
            return true;
        },

        // Persist extra fields (id, role) into the JWT
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },

        // Expose id and role on the client-side session object
        session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        },
    },

    pages: {
        signIn: '/login',   // redirect here when unauthenticated
    },
});
