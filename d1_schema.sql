-- ADVERSIQ Intelligence D1 Database Schema
-- Full NSIL state persistence, document tracking, conversation history

-- ═══════════════════════════════════════════════════════════════════════════════
-- CONVERSATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS conversations (
  session_id TEXT PRIMARY KEY,
  region TEXT,
  messages TEXT,                    -- JSON array of messages
  nsil_state TEXT,                 -- JSON: NSIL layer statuses, decisions, confidence
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived BOOLEAN DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_conversations_region ON conversations(region);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DOCUMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INTEGER,
  type TEXT,
  uploaded_at TEXT NOT NULL,
  vector_id TEXT,                   -- Reference to Vectorize index
  tags TEXT,                         -- JSON array of tags
  FOREIGN KEY (session_id) REFERENCES conversations(session_id)
);

CREATE INDEX IF NOT EXISTS idx_documents_session_id ON documents(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DECISIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  layer INTEGER,                     -- NSIL layer number (1-10)
  timestamp TEXT NOT NULL,
  reasoning TEXT,
  decision TEXT,
  confidence REAL,
  sources TEXT,                      -- JSON array of sources
  FOREIGN KEY (session_id) REFERENCES conversations(session_id)
);

CREATE INDEX IF NOT EXISTS idx_decisions_session_id ON decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_decisions_layer ON decisions(layer);
CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions(timestamp);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PROACTIVE_INSIGHTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS proactive_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  type TEXT,                         -- 'opportunity', 'risk', 'recommendation', 'alert'
  content TEXT,
  confidence REAL,
  timestamp TEXT NOT NULL,
  sources TEXT,                      -- JSON array of sources
  acted_upon BOOLEAN DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES conversations(session_id)
);

CREATE INDEX IF NOT EXISTS idx_proactive_insights_session_id ON proactive_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_proactive_insights_type ON proactive_insights(type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- NSIL_METRICS TABLE (for tracking system health)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nsil_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  layer_name TEXT,
  execution_time_ms INTEGER,
  status TEXT,                       -- 'success', 'partial', 'error'
  confidence_avg REAL
);

CREATE INDEX IF NOT EXISTS idx_nsil_metrics_timestamp ON nsil_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_nsil_metrics_layer_name ON nsil_metrics(layer_name);

-- ═══════════════════════════════════════════════════════════════════════════════
-- KNOWLEDGE_GRAPH TABLE (for semantic relationships)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS knowledge_graph (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT,
  predicate TEXT,
  object TEXT,
  confidence REAL,
  source TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kg_subject ON knowledge_graph(subject);
CREATE INDEX IF NOT EXISTS idx_kg_predicate ON knowledge_graph(predicate);
