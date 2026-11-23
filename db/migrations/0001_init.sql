-- The Billion Club — initial schema
-- Monetary values are stored in KOBO (bigint) to avoid floating-point errors.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('member', 'admin', 'auditor', 'support');
  CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
  CREATE TYPE account_status AS ENUM ('active', 'suspended', 'closed');
  CREATE TYPE contribution_status AS ENUM ('simulated', 'reconciled', 'failed', 'reversed');
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
  CREATE TYPE severity AS ENUM ('low', 'medium', 'high', 'critical');
  CREATE TYPE compliance_status AS ENUM ('not_started', 'in_progress', 'awaiting_regulator', 'complete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_no text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  state text,
  role user_role NOT NULL DEFAULT 'member',
  verification verification_status NOT NULL DEFAULT 'unverified',
  status account_status NOT NULL DEFAULT 'active',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_created_idx ON users(created_at);

-- Contribution LEDGER. In this build every row is status 'simulated' and is_demo = true.
-- Production rows will only be written by the payments module after provider confirmation.
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_kobo bigint NOT NULL CHECK (amount_kobo > 0),
  contribution_date date NOT NULL,
  channel text NOT NULL,
  reference text UNIQUE NOT NULL,
  status contribution_status NOT NULL DEFAULT 'simulated',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contributions_user_date_idx ON contributions(user_id, contribution_date DESC);
CREATE INDEX IF NOT EXISTS contributions_date_idx ON contributions(contribution_date);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('employment', 'supplier', 'training', 'business')),
  title text NOT NULL,
  organisation text NOT NULL,
  location text NOT NULL,
  summary text NOT NULL,
  closes_at date,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text NOT NULL,
  state text NOT NULL,
  stage text NOT NULL,
  capital_kobo bigint NOT NULL DEFAULT 0,
  jobs_created integer NOT NULL DEFAULT 0,
  suppliers_engaged integer NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text NOT NULL,
  body text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority severity NOT NULL DEFAULT 'low',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON support_tickets(status);

-- Append-only audit log. UPDATE/DELETE are blocked by trigger.
CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION audit_logs_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'audit_logs is append-only'; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS audit_logs_no_mutation ON audit_logs;
CREATE TRIGGER audit_logs_no_mutation BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  rule text NOT NULL,
  severity severity NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_items (
  id serial PRIMARY KEY,
  area text NOT NULL,
  requirement text NOT NULL,
  authority text NOT NULL,
  status compliance_status NOT NULL DEFAULT 'not_started',
  owner text,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
