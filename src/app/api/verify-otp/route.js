import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkLockout, recordFailedAttempt, clearAttempts } from '@/lib/otpAttempts';

export async function POST(request) {
    const { email, otp } = await request.json();

    if (!email || !otp) {
        return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const key = email.toLowerCase();

    // ── 1. Brute-force lockout check ───────────────────────────
    const { locked, remainingSeconds } = await checkLockout(key);
    if (locked) {
        const minutes = Math.ceil(remainingSeconds / 60);
        return NextResponse.json(
            { error: `Too many incorrect attempts. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` },
            { status: 429 }
        );
    }

    // ── 2. Look up the most recent valid OTP from DB ────────────
    const records = await sql`
        SELECT * FROM otp_codes
        WHERE email      = ${key}
          AND used       = FALSE
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
    `;

    const record = records[0];

    if (!record) {
        return NextResponse.json(
            { error: 'No OTP found for this email. Please request a new code.' },
            { status: 400 }
        );
    }

    // ── 3. Validate the code ────────────────────────────────────
    if (record.code !== String(otp)) {
        await recordFailedAttempt(key);

        // Warn the user how many attempts remain
        const { locked: nowLocked, remainingSeconds: secs } = await checkLockout(key);
        if (nowLocked) {
            const minutes = Math.ceil(secs / 60);
            return NextResponse.json(
                { error: `Too many incorrect attempts. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 });
    }

    // ── 4. Valid — mark used, clear attempt history ─────────────
    await sql`UPDATE otp_codes SET used = TRUE WHERE id = ${record.id}`;
    await clearAttempts(key);

    return NextResponse.json({ success: true });
}
