-- ============================================================================
-- Waitlist & referral programme
-- Design notes:
--  * Attribution is a single row per referred user (UNIQUE referred_id) and is
--    IMMUTABLE once written (trigger) — codes cannot be swapped after signup.
--  * Single-level only: there is no "referrer of referrer" anywhere in the model.
--  * Aggregates live in referral_stats, refreshed by a scheduled job; dashboards
--    never walk the referral graph on request.
--  * Reward runs pin the exact config version and an input hash so every
--    calculation is reproducible.
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM ('pending', 'verified', 'under_review', 'rejected');
  CREATE TYPE reward_status AS ENUM ('estimated', 'approved', 'funded', 'paid', 'reversed');
  CREATE TYPE run_status AS ENUM ('simulation', 'calculated', 'approved', 'funded', 'paid', 'void');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Referral-safe code alphabet (no 0/O/1/I/L)
CREATE OR REPLACE FUNCTION gen_referral_code() RETURNS text AS $$
DECLARE
  alphabet text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  code text;
BEGIN
  LOOP
    code := 'TBC';
    FOR i IN 1..6 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE referral_code = code);
  END LOOP;
  RETURN code;
END $$ LANGUAGE plpgsql;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email_normalized text,
  ADD COLUMN IF NOT EXISTS phone_normalized text,
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS leaderboard_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS leaderboard_alias text,
  ADD COLUMN IF NOT EXISTS signup_ip_hash text,
  ADD COLUMN IF NOT EXISTS signup_device_hash text,
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;

UPDATE users SET referral_code = gen_referral_code() WHERE referral_code IS NULL;
UPDATE users SET email_normalized = lower(email) WHERE email_normalized IS NULL;
UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL AND verification IN ('verified', 'pending');
ALTER TABLE users ALTER COLUMN referral_code SET NOT NULL;
ALTER TABLE users ALTER COLUMN referral_code SET DEFAULT gen_referral_code();
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_uq ON users(referral_code);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_uq ON users(email_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_normalized_uq ON users(phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_referred_by_idx ON users(referred_by);
CREATE INDEX IF NOT EXISTS users_device_idx ON users(signup_device_hash);

-- referred_by can be set once and never changed
CREATE OR REPLACE FUNCTION users_referred_by_immutable() RETURNS trigger AS $$
BEGIN
  IF OLD.referred_by IS NOT NULL AND NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'referral attribution is immutable';
  END IF;
  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'referral codes are immutable';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS users_referral_immutable ON users;
CREATE TRIGGER users_referral_immutable BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION users_referred_by_immutable();

-- One attribution row per referred member
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  code_used text NOT NULL,
  source text NOT NULL CHECK (source IN ('link', 'manual_code', 'campaign')),
  campaign_slug text,
  status referral_status NOT NULL DEFAULT 'pending',
  risk_score integer NOT NULL DEFAULT 0,
  risk_flags text[] NOT NULL DEFAULT '{}',
  decision_reason text,
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  verified_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (referrer_id <> referred_id)
);
CREATE INDEX IF NOT EXISTS referrals_referrer_status_idx ON referrals(referrer_id, status);
CREATE INDEX IF NOT EXISTS referrals_status_idx ON referrals(status);
CREATE INDEX IF NOT EXISTS referrals_verified_at_idx ON referrals(verified_at);
CREATE INDEX IF NOT EXISTS referrals_created_idx ON referrals(created_at);

CREATE OR REPLACE FUNCTION referrals_attribution_immutable() RETURNS trigger AS $$
BEGIN
  IF NEW.referrer_id <> OLD.referrer_id OR NEW.referred_id <> OLD.referred_id OR NEW.code_used <> OLD.code_used THEN
    RAISE EXCEPTION 'referral attribution is immutable';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS referrals_immutable ON referrals;
CREATE TRIGGER referrals_immutable BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION referrals_attribution_immutable();

-- Append-only audit trail of every referral status change
CREATE TABLE IF NOT EXISTS referral_events (
  id bigserial PRIMARY KEY,
  referral_id uuid NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  from_status referral_status,
  to_status referral_status NOT NULL,
  reason text,
  actor_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referral_events_ref_idx ON referral_events(referral_id);
DROP TRIGGER IF EXISTS referral_events_no_mutation ON referral_events;
CREATE TRIGGER referral_events_no_mutation BEFORE UPDATE OR DELETE ON referral_events FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();

-- Daily click / share counters (aggregated, no per-click personal data)
CREATE TABLE IF NOT EXISTS referral_daily_activity (
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day date NOT NULL,
  channel text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('click', 'share')),
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (referrer_id, day, channel, kind)
);

-- Materialised per-member aggregates, refreshed by the scheduled job
CREATE TABLE IF NOT EXISTS referral_stats (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  clicks integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  registrations integer NOT NULL DEFAULT 0,
  verified integer NOT NULL DEFAULT 0,
  pending integer NOT NULL DEFAULT 0,
  under_review integer NOT NULL DEFAULT 0,
  rejected integer NOT NULL DEFAULT 0,
  verified_7d integer NOT NULL DEFAULT 0,
  verified_30d integer NOT NULL DEFAULT 0,
  rank integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referral_stats_rank_idx ON referral_stats(rank) WHERE rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS referral_stats_7d_idx ON referral_stats(verified_7d DESC);
CREATE INDEX IF NOT EXISTS referral_stats_30d_idx ON referral_stats(verified_30d DESC);

-- Snapshot of community-wide totals, written by the same job
CREATE TABLE IF NOT EXISTS referral_snapshots (
  id bigserial PRIMARY KEY,
  taken_at timestamptz NOT NULL DEFAULT now(),
  verified_members integer NOT NULL,
  verified_referrals integer NOT NULL,
  organic_verified integer NOT NULL,
  active_referrers integer NOT NULL
);

-- Programme configuration — every change is a new, immutable version
CREATE TABLE IF NOT EXISTS referral_config_versions (
  id serial PRIMARY KEY,
  config jsonb NOT NULL,
  change_note text NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS referral_config_no_mutation ON referral_config_versions;
CREATE TRIGGER referral_config_no_mutation BEFORE UPDATE OR DELETE ON referral_config_versions FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();

-- Reward engine
CREATE TABLE IF NOT EXISTS referral_reward_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL,
  status run_status NOT NULL,
  config_version integer NOT NULL REFERENCES referral_config_versions(id),
  pool_kobo bigint NOT NULL,
  pool_source text NOT NULL,
  allocation_kobo bigint NOT NULL,
  denominator integer NOT NULL,
  eligible_referrals integer NOT NULL,
  distributed_kobo bigint NOT NULL,
  unallocated_kobo bigint NOT NULL,
  recipients integer NOT NULL,
  inputs_hash text NOT NULL,
  notes text,
  created_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS reward_runs_live_uq ON referral_reward_runs(run_date) WHERE status <> 'simulation' AND status <> 'void';

CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES referral_reward_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  eligible_referrals integer NOT NULL,
  share_ppm bigint NOT NULL,
  amount_kobo bigint NOT NULL,
  status reward_status NOT NULL,
  adjustment_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, user_id)
);
CREATE INDEX IF NOT EXISTS referral_rewards_user_idx ON referral_rewards(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS referral_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'upheld', 'dismissed')),
  resolution text,
  decided_by uuid REFERENCES users(id),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referral_id)
);

-- Email / phone verification
CREATE TABLE IF NOT EXISTS verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('email', 'phone')),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verification_tokens_user_idx ON verification_tokens(user_id);

CREATE TABLE IF NOT EXISTS email_outbox (
  id bigserial PRIMARY KEY,
  to_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Campaigns and promotional materials (managed by admins, no developer needed)
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]{2,40}$'),
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('whatsapp', 'social', 'description', 'email')),
  title text NOT NULL,
  body text NOT NULL,
  campaign_slug text REFERENCES campaigns(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
