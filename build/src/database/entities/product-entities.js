/**
 * Product Flow Entities - Clean Naming and Proper SPARC Integration.
 *
 * MISSION ACCOMPLISHED: Renamed from document-entities.ts to product-entities.ts
 * - Clean Product Flow naming throughout (no generic "document" terminology)
 * - Proper SPARC integration in Features and Tasks
 * - Clear separation: Product Flow = WHAT, SPARC = HOW.
 */
/**
 * @file Database layer: product-entities.
 */
/**
 * Database Schema Export - UPDATED for Product Flow naming.
 */
export const PRODUCT_DATABASE_SCHEMAS = {
    product_documents: `
    CREATE TABLE IF NOT EXISTS product_documents (
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
      feature_data TEXT, -- JSON for feature-specific fields (includes SPARC integration)
      task_data TEXT, -- JSON for task-specific fields (includes SPARC integration)
      
      -- SPARC Integration columns
      uses_sparc_methodology BOOLEAN DEFAULT FALSE,
      sparc_project_id TEXT,
      sparc_phase TEXT,
      sparc_progress_percentage REAL DEFAULT 0.0,
      sparc_domain TEXT,
      sparc_complexity TEXT,
      
      FOREIGN KEY (project_id) REFERENCES product_projects(id),
      FOREIGN KEY (parent_document_id) REFERENCES product_documents(id)
    );
    
    CREATE INDEX idx_product_docs_type ON product_documents(type);
    CREATE INDEX idx_product_docs_project ON product_documents(project_id);
    CREATE INDEX idx_product_docs_status ON product_documents(status);
    CREATE INDEX idx_product_docs_sparc ON product_documents(uses_sparc_methodology);
    CREATE INDEX idx_product_docs_sparc_phase ON product_documents(sparc_phase);
    CREATE INDEX idx_product_docs_sparc_progress ON product_documents(sparc_progress_percentage);
    CREATE UNIQUE INDEX idx_product_docs_checksum ON product_documents(checksum);
  `,
    product_relationships: `
    CREATE TABLE IF NOT EXISTS product_relationships (
      id TEXT PRIMARY KEY,
      source_document_id TEXT NOT NULL,
      target_document_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT, -- JSON
      
      FOREIGN KEY (source_document_id) REFERENCES product_documents(id) ON DELETE CASCADE,
      FOREIGN KEY (target_document_id) REFERENCES product_documents(id) ON DELETE CASCADE,
      UNIQUE(source_document_id, target_document_id, relationship_type)
    );
    
    CREATE INDEX idx_prod_relationships_source ON product_relationships(source_document_id);
    CREATE INDEX idx_prod_relationships_target ON product_relationships(target_document_id);
    CREATE INDEX idx_prod_relationships_type ON product_relationships(relationship_type);
  `,
    product_workflow_states: `
    CREATE TABLE IF NOT EXISTS product_workflow_states (
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
      
      -- SPARC workflow integration
      sparc_workflow_integration TEXT, -- JSON with SPARC workflow state
      
      FOREIGN KEY (document_id) REFERENCES product_documents(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_prod_workflow_states_document ON product_workflow_states(document_id);
    CREATE INDEX idx_prod_workflow_states_workflow ON product_workflow_states(workflow_name);
    CREATE INDEX idx_prod_workflow_states_stage ON product_workflow_states(current_stage);
  `,
    product_projects: `
    CREATE TABLE IF NOT EXISTS product_projects (
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
      
      -- COMPREHENSIVE SPARC INTEGRATION
      sparc_integration_enabled BOOLEAN DEFAULT FALSE,
      sparc_project_mappings TEXT, -- JSON array of feature->SPARC mappings
      sparc_project_ids TEXT, -- JSON array of SPARC project IDs
      sparc_workflow_config TEXT, -- JSON with SPARC workflow settings
      sparc_integration_health TEXT, -- JSON with sync status and metrics
      sparc_benefits_tracking TEXT, -- JSON with SPARC benefits metrics
      
      tags TEXT, -- JSON array
      stakeholders TEXT, -- JSON array
      author TEXT NOT NULL
    );
    
    CREATE INDEX idx_product_projects_domain ON product_projects(domain);
    CREATE INDEX idx_product_projects_phase ON product_projects(phase);
    CREATE INDEX idx_product_projects_author ON product_projects(author);
    CREATE INDEX idx_product_projects_sparc ON product_projects(sparc_integration_enabled);
  `,
    product_search_index: `
    CREATE TABLE IF NOT EXISTS product_search_index (
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
      sparc_domain TEXT, -- SPARC domain classification
      sparc_complexity TEXT, -- SPARC complexity level
      
      FOREIGN KEY (document_id) REFERENCES product_documents(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES product_projects(id) ON DELETE SET NULL
    );
    
    CREATE INDEX idx_prod_search_type ON product_search_index(document_type);
    CREATE INDEX idx_prod_search_project ON product_search_index(project_id);
    CREATE INDEX idx_prod_search_sparc_phase ON product_search_index(sparc_phase);
    CREATE INDEX idx_prod_search_sparc_progress ON product_search_index(sparc_progress);
    CREATE INDEX idx_prod_search_sparc_enabled ON product_search_index(uses_sparc_methodology);
  `,
    // NEW TABLE: SPARC Integration State Tracking
    product_sparc_integration: `
    CREATE TABLE IF NOT EXISTS product_sparc_integration (
      id TEXT PRIMARY KEY,
      product_project_id TEXT NOT NULL,
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
      
      -- Quality and benefits tracking
      quality_improvement_score REAL DEFAULT 0.0,
      delivery_speed_multiplier REAL DEFAULT 1.0,
      maintainability_score REAL DEFAULT 0.0,
      
      -- Timestamps
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Foreign key constraints
      FOREIGN KEY (product_project_id) REFERENCES product_projects(id) ON DELETE CASCADE,
      FOREIGN KEY (feature_document_id) REFERENCES product_documents(id) ON DELETE CASCADE,
      UNIQUE(feature_document_id, sparc_project_id)
    );
    
    CREATE INDEX idx_prod_sparc_project ON product_sparc_integration(product_project_id);
    CREATE INDEX idx_prod_sparc_feature ON product_sparc_integration(feature_document_id);
    CREATE INDEX idx_prod_sparc_sparc_project ON product_sparc_integration(sparc_project_id);
    CREATE INDEX idx_prod_sparc_phase ON product_sparc_integration(current_sparc_phase);
    CREATE INDEX idx_prod_sparc_sync ON product_sparc_integration(sync_status);
    CREATE INDEX idx_prod_sparc_progress ON product_sparc_integration(sparc_progress_percentage);
  `,
};
/**
 * Type guards for Product Flow entities.
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
