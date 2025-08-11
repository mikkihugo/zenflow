/**
 * Database Entities for Document-Driven System.
 *
 * PURE DATABASE-DRIVEN ARCHITECTURE
 * Replaces file-based document system with database entities.
 * Provides typed interfaces for Vision/ADR/PRD/Epic/Feature/Task storage.
 */
/**
 * @file Database layer: document-entities.
 */
/**
 * Database Schema Export.
 * Defines table structures for database creation.
 */
export const DATABASE_SCHEMAS = {
    documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      priority TEXT DEFAULT 'medium',
      author TEXT,
      tags TEXT, -- JSON array
      project_id TEXT,
      parent_document_id TEXT,
      dependencies TEXT, -- JSON array
      related_documents TEXT, -- JSON array
      version TEXT DEFAULT '1.0.0',
      checksum TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      searchable_content TEXT,
      keywords TEXT, -- JSON array
      workflow_stage TEXT,
      completion_percentage INTEGER DEFAULT 0,
      
      -- Type-specific JSON fields
      vision_data TEXT, -- JSON for vision-specific fields
      adr_data TEXT, -- JSON for ADR-specific fields
      prd_data TEXT, -- JSON for PRD-specific fields
      epic_data TEXT, -- JSON for epic-specific fields
      feature_data TEXT, -- JSON for feature-specific fields
      task_data TEXT, -- JSON for task-specific fields
      
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (parent_document_id) REFERENCES documents(id)
    );
    
    CREATE INDEX idx_documents_type ON documents(type);
    CREATE INDEX idx_documents_project ON documents(project_id);
    CREATE INDEX idx_documents_status ON documents(status);
    CREATE INDEX idx_documents_created ON documents(created_at);
    CREATE INDEX idx_documents_updated ON documents(updated_at);
    CREATE INDEX idx_documents_workflow ON documents(workflow_stage);
    CREATE UNIQUE INDEX idx_documents_checksum ON documents(checksum);
  `,
    document_relationships: `
    CREATE TABLE IF NOT EXISTS document_relationships (
      id TEXT PRIMARY KEY,
      source_document_id TEXT NOT NULL,
      target_document_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT, -- JSON
      
      FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (target_document_id) REFERENCES documents(id) ON DELETE CASCADE,
      UNIQUE(source_document_id, target_document_id, relationship_type)
    );
    
    CREATE INDEX idx_relationships_source ON document_relationships(source_document_id);
    CREATE INDEX idx_relationships_target ON document_relationships(target_document_id);
    CREATE INDEX idx_relationships_type ON document_relationships(relationship_type);
  `,
    document_workflow_states: `
    CREATE TABLE IF NOT EXISTS document_workflow_states (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL UNIQUE,
      workflow_name TEXT NOT NULL,
      current_stage TEXT NOT NULL,
      stages_completed TEXT, -- JSON array
      next_stages TEXT, -- JSON array
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      estimated_completion DATETIME,
      auto_transitions BOOLEAN DEFAULT TRUE,
      requires_approval BOOLEAN DEFAULT FALSE,
      approved_by TEXT,
      approved_at DATETIME,
      workflow_results TEXT, -- JSON
      generated_artifacts TEXT, -- JSON array
      
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_workflow_states_document ON document_workflow_states(document_id);
    CREATE INDEX idx_workflow_states_workflow ON document_workflow_states(workflow_name);
    CREATE INDEX idx_workflow_states_stage ON document_workflow_states(current_stage);
  `,
    projects: `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      domain TEXT NOT NULL,
      complexity TEXT DEFAULT 'moderate',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      start_date DATETIME,
      target_completion DATETIME,
      actual_completion DATETIME,
      vision_document_ids TEXT, -- JSON array
      adr_document_ids TEXT, -- JSON array
      prd_document_ids TEXT, -- JSON array
      epic_document_ids TEXT, -- JSON array
      feature_document_ids TEXT, -- JSON array
      task_document_ids TEXT, -- JSON array
      overall_progress_percentage INTEGER DEFAULT 0,
      phase TEXT DEFAULT 'planning',
      sparc_project_id TEXT,
      sparc_phase TEXT,
      tags TEXT, -- JSON array
      stakeholders TEXT, -- JSON array
      author TEXT NOT NULL
    );
    
    CREATE INDEX idx_projects_domain ON projects(domain);
    CREATE INDEX idx_projects_phase ON projects(phase);
    CREATE INDEX idx_projects_author ON projects(author);
    CREATE INDEX idx_projects_created ON projects(created_at);
    CREATE UNIQUE INDEX idx_projects_sparc ON projects(sparc_project_id) WHERE sparc_project_id IS NOT NULL;
  `,
    document_search_index: `
    CREATE TABLE IF NOT EXISTS document_search_index (
      document_id TEXT PRIMARY KEY,
      document_type TEXT NOT NULL,
      project_id TEXT,
      title_vector BLOB, -- Serialized embedding vector
      content_vector BLOB, -- Serialized embedding vector
      combined_vector BLOB, -- Serialized embedding vector
      keywords TEXT, -- JSON array
      tags TEXT, -- JSON array
      extracted_entities TEXT, -- JSON array
      status TEXT,
      priority TEXT,
      author TEXT,
      created_date DATETIME,
      updated_date DATETIME,
      parent_documents TEXT, -- JSON array
      child_documents TEXT, -- JSON array
      related_documents TEXT, -- JSON array
      search_rank REAL DEFAULT 0.0,
      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
      access_count INTEGER DEFAULT 0,
      
      -- SPARC INTEGRATION SEARCH FIELDS
      sparc_project_ids TEXT, -- JSON array of associated SPARC project IDs
      sparc_phase TEXT, -- Current SPARC phase if document uses SPARC
      sparc_progress REAL DEFAULT 0.0, -- SPARC completion percentage
      uses_sparc_methodology BOOLEAN DEFAULT FALSE,
      
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
    
    CREATE INDEX idx_search_type ON document_search_index(document_type);
    CREATE INDEX idx_search_project ON document_search_index(project_id);
    CREATE INDEX idx_search_status ON document_search_index(status);
    CREATE INDEX idx_search_rank ON document_search_index(search_rank DESC);
    CREATE INDEX idx_search_accessed ON document_search_index(last_accessed DESC);
    CREATE INDEX idx_search_sparc_phase ON document_search_index(sparc_phase);
    CREATE INDEX idx_search_sparc_progress ON document_search_index(sparc_progress);
    CREATE INDEX idx_search_sparc_enabled ON document_search_index(uses_sparc_methodology);
  `,
    // NEW TABLE: SPARC Integration tracking
    sparc_integration_state: `
    CREATE TABLE IF NOT EXISTS sparc_integration_state (
      id TEXT PRIMARY KEY,
      document_project_id TEXT NOT NULL,
      feature_document_id TEXT,
      sparc_project_id TEXT NOT NULL,
      sparc_project_name TEXT NOT NULL,
      
      -- SPARC project metadata
      sparc_domain TEXT NOT NULL,
      sparc_complexity TEXT NOT NULL,
      current_sparc_phase TEXT NOT NULL,
      sparc_progress_percentage REAL DEFAULT 0.0,
      
      -- Integration workflow state
      sync_status TEXT DEFAULT 'synced', -- 'synced' | 'out_of_sync' | 'error'
      last_sync_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      sync_errors TEXT, -- JSON array
      
      -- Phase completion tracking
      specification_completed BOOLEAN DEFAULT FALSE,
      pseudocode_completed BOOLEAN DEFAULT FALSE,
      architecture_completed BOOLEAN DEFAULT FALSE,
      refinement_completed BOOLEAN DEFAULT FALSE,
      completion_completed BOOLEAN DEFAULT FALSE,
      
      -- Timestamps
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Foreign key constraints
      FOREIGN KEY (document_project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (feature_document_id) REFERENCES documents(id) ON DELETE CASCADE,
      UNIQUE(feature_document_id, sparc_project_id)
    );
    
    CREATE INDEX idx_sparc_integration_project ON sparc_integration_state(document_project_id);
    CREATE INDEX idx_sparc_integration_feature ON sparc_integration_state(feature_document_id);
    CREATE INDEX idx_sparc_integration_sparc_project ON sparc_integration_state(sparc_project_id);
    CREATE INDEX idx_sparc_integration_phase ON sparc_integration_state(current_sparc_phase);
    CREATE INDEX idx_sparc_integration_sync ON sparc_integration_state(sync_status);
    CREATE INDEX idx_sparc_integration_progress ON sparc_integration_state(sparc_progress_percentage);
  `,
};
/**
 * Type guards for document entities.
 *
 * @param doc
 * @example
 */
export function isVisionDocument(doc) {
    return doc.type === 'vision';
}
export function isADRDocument(doc) {
    return doc.type === 'adr';
}
export function isPRDDocument(doc) {
    return doc.type === 'prd';
}
export function isEpicDocument(doc) {
    return doc.type === 'epic';
}
export function isFeatureDocument(doc) {
    return doc.type === 'feature';
}
export function isTaskDocument(doc) {
    return doc.type === 'task';
}
