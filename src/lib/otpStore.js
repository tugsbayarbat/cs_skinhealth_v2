// Shared singleton OTP store used by both send-otp and verify-otp routes.
// Next.js reuses module instances within the same server process.
// Replace with Redis/DB for production multi-instance deployments.

export const otpStore = new Map();
