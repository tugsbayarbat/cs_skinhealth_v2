/**
 * otpAttempts.js — Brute-force protection for OTP verification.
 *
 * Rules enforced:
 *   - Max 5 failed attempts per email within a rolling 15-minute window.
 *   - On lockout, all subsequent attempts are rejected with a 429 until
 *     the window expires (no early unlock).
 *   - A successful verification clears all attempts for that email.
 *
 * Storage: otp_attempts table in Neon (survives restarts and works across
 * multiple Next.js instances, unlike the old in-memory Map).
 */

import sql from '@/lib/db';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

/**
 * Count recent failed attempts for an email within the rolling window.
 * @param {string} email - Normalised (lowercase) email address.
 * @returns {Promise<number>}
 */
async function countRecentAttempts(email) {
    const rows = await sql`
        SELECT COUNT(*) AS cnt
        FROM otp_attempts
        WHERE email        = ${email}
          AND attempted_at > NOW() - INTERVAL '${sql.unsafe(String(WINDOW_MINUTES))} minutes'
    `;
    return Number(rows[0].cnt);
}

/**
 * Check whether an email is currently locked out.
 * @param {string} email - Normalised (lowercase) email address.
 * @returns {Promise<{ locked: boolean, remainingSeconds: number }>}
 */
export async function checkLockout(email) {
    const count = await countRecentAttempts(email);
    if (count < MAX_ATTEMPTS) {
        return { locked: false, remainingSeconds: 0 };
    }

    // Find when the oldest attempt in the window will expire
    const rows = await sql`
        SELECT attempted_at
        FROM otp_attempts
        WHERE email        = ${email}
          AND attempted_at > NOW() - INTERVAL '${sql.unsafe(String(WINDOW_MINUTES))} minutes'
        ORDER BY attempted_at ASC
        LIMIT 1
    `;

    const oldestAttempt = new Date(rows[0].attempted_at);
    const unlockAt      = new Date(oldestAttempt.getTime() + WINDOW_MINUTES * 60 * 1000);
    const remainingMs   = Math.max(0, unlockAt - Date.now());

    return { locked: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
}

/**
 * Record one failed attempt for an email.
 * @param {string} email - Normalised (lowercase) email address.
 */
export async function recordFailedAttempt(email) {
    await sql`
        INSERT INTO otp_attempts (email)
        VALUES (${email})
    `;
}

/**
 * Clear all attempts for an email after a successful verification.
 * @param {string} email - Normalised (lowercase) email address.
 */
export async function clearAttempts(email) {
    await sql`
        DELETE FROM otp_attempts
        WHERE email = ${email}
    `;
}
