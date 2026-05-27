-- BW Nexus AI learning and performance persistence schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outcome_records (
  id SERIAL PRIMARY KEY,
  report_id VARCHAR(255) NOT NULL,
  predicted_spi NUMERIC(5, 2) NOT NULL DEFAULT 0,
  predicted_rroi NUMERIC(5, 2) NOT NULL DEFAULT 0,
  predicted_confidence NUMERIC(5, 2) NOT NULL DEFAULT 0,
  actual_status VARCHAR(32) NOT NULL CHECK (actual_status IN ('complete', 'abandoned')),
  user_rating NUMERIC(3, 2),
  time_to_complete INTEGER,
  was_exported BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engine_weights (
  id SERIAL PRIMARY KEY,
  engine VARCHAR(32) NOT NULL UNIQUE,
  weights JSONB NOT NULL,
  adjustment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_adjustments (
  id SERIAL PRIMARY KEY,
  engine VARCHAR(32) NOT NULL,
  field_name VARCHAR(128) NOT NULL,
  old_value NUMERIC(8, 6) NOT NULL,
  new_value NUMERIC(8, 6) NOT NULL,
  reason TEXT NOT NULL,
  sample_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS improvement_suggestions (
  id SERIAL PRIMARY KEY,
  proposed_by VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'applied', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial weight sets if absent
INSERT INTO engine_weights (engine, weights)
  SELECT 'SPI', '{"base": 0.5, "context":0.3, "user_feedback":0.2}'::jsonb
  WHERE NOT EXISTS(SELECT 1 FROM engine_weights WHERE engine = 'SPI');

INSERT INTO engine_weights (engine, weights)
  SELECT 'RROI', '{"efficiency":0.45, "impact":0.35, "cost_control":0.2}'::jsonb
  WHERE NOT EXISTS(SELECT 1 FROM engine_weights WHERE engine = 'RROI');

INSERT INTO engine_weights (engine, weights)
  SELECT 'NormalPrediction', '{"historical_accuracy":0.4, "variance":0.3, "trend":0.3}'::jsonb
  WHERE NOT EXISTS(SELECT 1 FROM engine_weights WHERE engine = 'NormalPrediction');
