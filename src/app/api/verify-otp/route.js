import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request) {
    const { email, otp } = await request.json();

    if (!email || !otp) {
        return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const key = email.toLowerCase();
    const record = otpStore.get(key);

    if (!record) {
        return NextResponse.json({ error: 'No OTP found for this email. Please request a new code.' }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    if (record.otp !== otp) {
        return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 });
    }

    // Valid — clear the OTP so it can't be reused
    otpStore.delete(key);

    return NextResponse.json({ success: true });
}
