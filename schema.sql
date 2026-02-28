-- ============================================================
-- SkinHealth Assistant — Neon PostgreSQL Schema
-- Run this in your Neon SQL Editor (console.neon.tech)
-- ============================================================

-- ── 1. USERS ────────────────────────────────────────────────
-- Core user profile. Email is the primary identifier (OTP login).
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  email         TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image         TEXT,
  role          TEXT NOT NULL DEFAULT 'patient',   -- 'patient' | 'admin'
  gender        TEXT,                               -- 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  birth_year    INTEGER,                            -- collected on first login
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. SESSIONS ─────────────────────────────────────────────
-- NextAuth database sessions (one row per active login).
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

-- ── 3. ACCOUNTS ─────────────────────────────────────────────
-- NextAuth OAuth / credentials account linking.
-- For OTP-only login this table will be empty, but the
-- NextAuth Neon adapter requires it.
CREATE TABLE IF NOT EXISTS accounts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL,
  provider             TEXT NOT NULL,
  provider_account_id  TEXT NOT NULL,
  refresh_token        TEXT,
  access_token         TEXT,
  expires_at           BIGINT,
  token_type           TEXT,
  scope                TEXT,
  id_token             TEXT,
  session_state        TEXT,
  UNIQUE (provider, provider_account_id)
);

-- ── 4. VERIFICATION TOKENS ──────────────────────────────────
-- Used by NextAuth for magic-link / email verification flows.
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier  TEXT NOT NULL,
  token       TEXT NOT NULL,
  expires     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ── 5. OTP CODES ────────────────────────────────────────────
-- Replaces the in-memory Map. Stores pending OTPs in the DB
-- so they survive server restarts and work across instances.
CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);

-- ── 6. OPTIONAL: auto-update updated_at on users ────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
