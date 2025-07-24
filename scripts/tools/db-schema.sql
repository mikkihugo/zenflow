-- Vision-to-Code Database Schema
-- SQLite schema for staging environment

-- Create visions table for business service
CREATE TABLE IF NOT EXISTS visions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME NULL,
    approved_by TEXT NULL,
    rejection_reason TEXT NULL,
    metadata TEXT NULL -- JSON field for additional data
);

-- Create roadmaps table for business service
CREATE TABLE IF NOT EXISTS roadmaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vision_id INTEGER NOT NULL REFERENCES visions(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    phases TEXT NOT NULL, -- JSON array of phases
    timeline TEXT NOT NULL, -- JSON timeline data
    dependencies TEXT NULL, -- JSON array of dependencies
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create swarms table for core service coordination
CREATE TABLE IF NOT EXISTS swarms (
    id TEXT PRIMARY KEY,
    topology TEXT NOT NULL CHECK (topology IN ('mesh', 'hierarchical', 'ring', 'star')),
    max_agents INTEGER DEFAULT 6,
    strategy TEXT DEFAULT 'parallel' CHECK (strategy IN ('parallel', 'sequential', 'adaptive')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT NULL -- JSON field for swarm configuration
);

-- Create agents table for agent tracking
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    swarm_id TEXT NOT NULL REFERENCES swarms(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    capabilities TEXT NULL, -- JSON array of capabilities
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'idle', 'busy', 'failed', 'terminated')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table for task orchestration
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    swarm_id TEXT NOT NULL REFERENCES swarms(id) ON DELETE CASCADE,
    agent_id TEXT NULL REFERENCES agents(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    strategy TEXT DEFAULT 'parallel',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled')),
    result TEXT NULL, -- JSON field for task results
    error_message TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create llm_requests table for swarm service (LLM routing)
CREATE TABLE IF NOT EXISTS llm_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_hash TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NULL,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL
);

-- Create storage_entries table for development service
CREATE TABLE IF NOT EXISTS storage_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    namespace TEXT DEFAULT 'default',
    value TEXT NOT NULL, -- JSON field
    metadata TEXT NULL, -- JSON field
    ttl_expires_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, namespace)
);

-- Create event_log table for event bus tracking
CREATE TABLE IF NOT EXISTS event_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    source_service TEXT NOT NULL,
    target_service TEXT NULL,
    payload TEXT NOT NULL, -- JSON field
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'delivered', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME NULL,
    error_message TEXT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visions_status ON visions(status);
CREATE INDEX IF NOT EXISTS idx_visions_created_at ON visions(created_at);
CREATE INDEX IF NOT EXISTS idx_roadmaps_vision_id ON roadmaps(vision_id);
CREATE INDEX IF NOT EXISTS idx_agents_swarm_id ON agents(swarm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_swarm_id ON tasks(swarm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_storage_key_namespace ON storage_entries(key, namespace);
CREATE INDEX IF NOT EXISTS idx_storage_ttl ON storage_entries(ttl_expires_at);
CREATE INDEX IF NOT EXISTS idx_event_log_type ON event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_event_log_source ON event_log(source_service);

-- Insert sample data for testing
INSERT OR IGNORE INTO visions (id, title, description, created_by) VALUES 
(1, 'AI-Powered Code Generator', 'Develop an intelligent system that can generate production-ready code from natural language descriptions and visual mockups', 'system'),
(2, 'Real-time Collaboration Platform', 'Create a real-time collaborative development environment with live code sharing and pair programming capabilities', 'system'),
(3, 'Automated Testing Suite', 'Build a comprehensive automated testing framework that can generate and execute tests for any codebase', 'system');

-- Insert sample roadmap data
INSERT OR IGNORE INTO roadmaps (id, vision_id, phases, timeline) VALUES 
(1, 1, '["Research", "Prototype", "MVP", "Beta", "Production"]', '{"research": "2 weeks", "prototype": "4 weeks", "mvp": "8 weeks", "beta": "6 weeks", "production": "4 weeks"}'),
(2, 2, '["Design", "Core Features", "Integration", "Testing", "Launch"]', '{"design": "3 weeks", "core": "6 weeks", "integration": "4 weeks", "testing": "3 weeks", "launch": "2 weeks"}'),
(3, 3, '["Analysis", "Framework", "Test Generation", "Automation", "Deployment"]', '{"analysis": "2 weeks", "framework": "5 weeks", "generation": "6 weeks", "automation": "4 weeks", "deployment": "3 weeks"}');

-- Insert sample storage entries for development service
INSERT OR IGNORE INTO storage_entries (key, namespace, value, metadata) VALUES 
('system_config', 'default', '{"version": "1.0.0", "environment": "staging", "debug": true}', '{"type": "config", "category": "system"}'),
('active_features', 'features', '["vision_management", "code_generation", "real_time_collaboration"]', '{"type": "feature_flags", "category": "features"}'),
('deployment_settings', 'config', '{"auto_deploy": false, "staging_approval": true, "rollback_enabled": true}', '{"type": "deployment", "category": "config"}');