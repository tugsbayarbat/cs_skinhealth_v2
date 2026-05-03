import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import sql from '@/lib/db';

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(request) {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    // Check if user exists
    let userRows = await sql`
        SELECT id, is_approved FROM users
        WHERE email = ${email.toLowerCase()}
        LIMIT 1
    `;

    if (userRows.length === 0) {
        // Register the user on the waitlist
        await sql`
            INSERT INTO users (email, email_verified, is_approved)
            VALUES (${email.toLowerCase()}, NOW(), FALSE)
        `;
        return NextResponse.json({ error: 'Registered successfully.', reason: 'waitlist' }, { status: 403 });
    }

    const user = userRows[0];
    if (!user.is_approved) {
        return NextResponse.json({ error: 'You are on the waitlist.', reason: 'waitlist' }, { status: 403 });
    }

    const otp = generateOtp();

    // Persist OTP to Neon DB (expires in 10 minutes)
    await sql`
        INSERT INTO otp_codes (email, code, expires_at)
        VALUES (
            ${email.toLowerCase()},
            ${otp},
            NOW() + INTERVAL '10 minutes'
        )
    `;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Your SkinHealth sign-in code',
            html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#F7F8FC;border-radius:16px;">
          <h2 style="font-size:22px;color:#1A1A2E;margin-bottom:8px;">Your sign-in code</h2>
          <p style="font-size:15px;color:#5A5A7A;margin-bottom:28px;">
            Use the code below to sign in to <strong>SkinHealth Assistant</strong>.<br/>
            It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#6B35D9;border-radius:14px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;color:white;">
            ${otp}
          </div>
          <p style="margin-top:24px;font-size:13px;color:#9898B8;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('SMTP error:', err);
        return NextResponse.json({ error: 'Failed to send email. Check SMTP credentials.' }, { status: 500 });
    }
}
