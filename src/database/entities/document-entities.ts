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

import type { DocumentType } from '../types/workflow-types';

/**
 * Base document entity - all documents inherit from this.
 *
 * @example
 */
export interface BaseDocumentEntity {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  author?: string;
  tags: string[];

  // Relationships
  project_id?: string;
  parent_document_id?: string;
  dependencies: string[]; // Array of document IDs
  related_documents: string[]; // Array of document IDs

  // Metadata
  version: string;
  checksum: string;
  metadata: Record<string, any>; // Generic metadata for extensibility
  name?: string; // Optional name property for compatibility
  created_at: Date;
  updated_at: Date;

  // Search and indexing
  searchable_content: string; // Processed content for full-text search
  keywords: string[];

  // Workflow integration
  workflow_stage?: string;
  completion_percentage: number;
}

/**
 * Vision Document Entity.
 * Strategic vision and high-level goals.
 *
 * @example
 */
export interface VisionDocumentEntity extends BaseDocumentEntity {
  type: 'vision';

  // Vision-specific fields
  business_objectives: string[];
  success_criteria: string[];
  stakeholders: string[];
  timeline: {
    start_date?: Date;
    target_completion?: Date;
    milestones: Array<{
      name: string;
      date: Date;
      description: string;
    }>;
  };

  // Generated from vision
  generated_adrs: string[]; // ADR document IDs
  generated_prds: string[]; // PRD document IDs
}

/**
 * Architecture Decision Record Entity.
 * Technical decisions and rationale.
 *
 * @example
 */
export interface ADRDocumentEntity extends BaseDocumentEntity {
  type: 'adr';

  // ADR-specific fields
  decision_number: number;
  decision_status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  consequences: string[];
  alternatives_considered: string[];

  // Source and impact
  source_vision_id?: string;
  impacted_prds: string[]; // PRD document IDs affected
  supersedes_adr_id?: string;
}

/**
 * Product Requirements Document Entity.
 * Detailed feature specifications.
 *
 * @example
 */
export interface PRDDocumentEntity extends BaseDocumentEntity {
  type: 'prd';

  // PRD-specific fields
  functional_requirements: Array<{
    id: string;
    description: string;
    acceptance_criteria: string[];
    priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  }>;

  non_functional_requirements: Array<{
    id: string;
    type: 'performance' | 'security' | 'usability' | 'reliability' | 'scalability';
    description: string;
    metrics: string;
  }>;

  user_stories: Array<{
    id: string;
    title: string;
    description: string;
    acceptance_criteria: string[];
    story_points?: number;
  }>;

  // Breakdown and generation
  source_vision_id?: string;
  related_adrs: string[]; // ADR document IDs
  generated_epics: string[]; // Epic document IDs
}

/**
 * Epic Document Entity.
 * Large feature groupings.
 *
 * @example
 */
export interface EpicDocumentEntity extends BaseDocumentEntity {
  type: 'epic';

  // Epic-specific fields
  business_value: string;
  user_impact: string;
  effort_estimation: {
    story_points?: number;
    time_estimate_weeks?: number;
    complexity: 'low' | 'medium' | 'high' | 'very_high';
  };

  timeline: {
    start_date?: Date;
    estimated_completion?: Date;
    actual_completion?: Date;
  };

  // Source and breakdown
  source_prd_id?: string;
  feature_ids: string[]; // Feature document IDs

  // Progress tracking
  features_completed: number;
  features_total: number;
}

/**
 * Feature Document Entity.
 * Individual implementable features with SPARC methodology integration.
 *
 * @example
 */
export interface FeatureDocumentEntity extends BaseDocumentEntity {
  type: 'feature';

  // Feature-specific fields
  feature_type: 'ui' | 'api' | 'database' | 'integration' | 'infrastructure';
  acceptance_criteria: string[];
  technical_approach: string;

  api_specification?: {
    endpoints: Array<{
      method: string;
      path: string;
      description: string;
      parameters?: any;
      responses?: any;
    }>;
  };

  ui_specification?: {
    components: string[];
    workflows: string[];
    mockups?: string[]; // File paths or URLs
  };

  // Source and breakdown
  source_epic_id?: string;
  task_ids: string[]; // Task document IDs

  // Implementation tracking
  implementation_status: 'not_started' | 'in_progress' | 'code_complete' | 'testing' | 'done';
  test_coverage_percentage?: number;

  // SPARC METHODOLOGY INTEGRATION
  sparc_implementation?: {
    sparc_project_id?: string;
    sparc_phases: {
      specification: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[];
        completion_date?: Date;
        quality_score?: number;
      };
      pseudocode: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[];
        completion_date?: Date;
        algorithms: string[]; // Algorithm names/IDs
      };
      architecture: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[];
        completion_date?: Date;
        components: string[]; // Component names/IDs
      };
      refinement: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[];
        completion_date?: Date;
        optimizations: string[]; // Optimization strategy IDs
      };
      completion: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[];
        completion_date?: Date;
        artifacts: string[]; // Generated code/test artifact IDs
      };
    };
    current_sparc_phase:
      | 'specification'
      | 'pseudocode'
      | 'architecture'
      | 'refinement'
      | 'completion';
    sparc_progress_percentage: number;
    use_sparc_methodology: boolean;
  };
}

/**
 * Task Document Entity.
 * Granular implementation tasks with SPARC methodology integration.
 *
 * @example
 */
export interface TaskDocumentEntity extends BaseDocumentEntity {
  type: 'task';

  // Task-specific fields
  task_type: 'development' | 'testing' | 'documentation' | 'deployment' | 'research';
  estimated_hours: number;
  actual_hours?: number;

  implementation_details: {
    files_to_create: string[];
    files_to_modify: string[];
    test_files: string[];
    documentation_updates: string[];
  };

  technical_specifications: {
    component: string;
    module: string;
    functions: string[];
    dependencies: string[];
  };

  // Source and completion
  source_feature_id?: string;
  assigned_to?: string;

  // Code generation
  generated_code?: {
    source_files: Array<{
      path: string;
      content: string;
      language: string;
    }>;
    test_files: Array<{
      path: string;
      content: string;
      test_type: 'unit' | 'integration' | 'e2e';
    }>;
  };

  completion_status: 'todo' | 'in_progress' | 'code_review' | 'testing' | 'done';

  // SPARC METHODOLOGY INTEGRATION
  sparc_implementation_details?: {
    parent_feature_sparc_id?: string; // Links to feature's SPARC project
    sparc_phase_assignment:
      | 'specification'
      | 'pseudocode'
      | 'architecture'
      | 'refinement'
      | 'completion';
    sparc_deliverable_type:
      | 'requirements_doc'
      | 'algorithm_design'
      | 'component_spec'
      | 'optimization_plan'
      | 'production_code';
    sparc_quality_gates: {
      requirement: string;
      status: 'pending' | 'passed' | 'failed';
      validation_method: 'automated' | 'manual' | 'ai_assisted';
      validation_date?: Date;
    }[];
    sparc_artifacts: {
      artifact_id: string;
      artifact_type:
        | 'specification'
        | 'pseudocode'
        | 'architecture_diagram'
        | 'refactored_code'
        | 'final_implementation';
      file_path?: string;
      content?: string;
      checksum?: string;
    }[];
    complexity_analysis?: {
      time_complexity: string;
      space_complexity: string;
      maintainability_score: number;
      performance_impact: 'low' | 'medium' | 'high';
    };
  };
}

/**
 * Document Relationships Entity.
 * Tracks relationships between documents.
 *
 * @example
 */
export interface DocumentRelationshipEntity {
  id: string;
  source_document_id: string;
  target_document_id: string;
  relationship_type: 'generates' | 'implements' | 'depends_on' | 'relates_to' | 'supersedes';
  created_at: Date;
  metadata?: Record<string, any>;
}

/**
 * Document Workflow State Entity.
 * Tracks document workflow progression.
 *
 * @example
 */
export interface DocumentWorkflowStateEntity {
  id: string;
  document_id: string;
  workflow_name: string;
  current_stage: string;
  stages_completed: string[];
  next_stages: string[];

  // Progress tracking
  started_at: Date;
  updated_at: Date;
  estimated_completion?: Date;

  // Automation
  auto_transitions: boolean;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: Date;

  // Results
  workflow_results?: Record<string, any>;
  generated_artifacts: string[]; // Document IDs or file paths
}

/**
 * Project Entity.
 * Groups related documents into projects with comprehensive SPARC integration.
 *
 * @example
 */
export interface ProjectEntity {
  id: string;
  name: string;
  description: string;
  domain: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';

  // Timeline
  created_at: Date;
  updated_at: Date;
  start_date?: Date;
  target_completion?: Date;
  actual_completion?: Date;

  // Document relationships
  vision_document_ids: string[];
  adr_document_ids: string[];
  prd_document_ids: string[];
  epic_document_ids: string[];
  feature_document_ids: string[];
  task_document_ids: string[];

  // Progress
  overall_progress_percentage: number;
  phase:
    | 'planning'
    | 'requirements'
    | 'design'
    | 'implementation'
    | 'testing'
    | 'deployment'
    | 'complete';

  // COMPREHENSIVE SPARC INTEGRATION
  sparc_integration: {
    enabled: boolean;
    sparc_project_mappings: Array<{
      feature_id: string;
      sparc_project_id: string;
      sparc_project_name: string;
      domain:
        | 'swarm-coordination'
        | 'neural-networks'
        | 'wasm-integration'
        | 'rest-api'
        | 'memory-systems'
        | 'interfaces'
        | 'general';
      complexity: 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise';
      current_phase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
      progress_percentage: number;
      created_at: Date;
      updated_at: Date;
    }>;
    sparc_project_ids: string[]; // All SPARC project IDs associated with this document project

    // SPARC workflow coordination
    document_sparc_workflow: {
      vision_generates_sparc_specs: boolean;
      features_trigger_sparc_projects: boolean;
      tasks_map_to_sparc_phases: boolean;
      auto_create_sparc_from_features: boolean;
      sparc_completion_updates_tasks: boolean;
    };

    // Integration health and metrics
    integration_health: {
      document_sparc_sync_status: 'synced' | 'out_of_sync' | 'error';
      last_sync_date?: Date;
      sync_errors: string[];
      sparc_coverage_percentage: number; // % of features using SPARC
    };
  };

  // Metadata
  tags: string[];
  stakeholders: string[];
  author: string;
}

/**
 * Document Search Index Entity.
 * Optimized search and discovery.
 *
 * @example
 */
export interface DocumentSearchIndexEntity {
  document_id: string;
  document_type: DocumentType;
  project_id?: string;

  // Full-text search
  title_vector: number[]; // Embedding vector for title
  content_vector: number[]; // Embedding vector for content
  combined_vector: number[]; // Combined semantic vector

  // Keyword search
  keywords: string[];
  tags: string[];
  extracted_entities: string[]; // Named entities, concepts

  // Faceted search
  status: string;
  priority: string;
  author: string;
  created_date: Date;
  updated_date: Date;

  // Relationship search
  parent_documents: string[];
  child_documents: string[];
  related_documents: string[];

  // Search optimization
  search_rank: number; // Popularity/importance score
  last_accessed: Date;
  access_count: number;
}

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
} as const;

/**
 * Type guards for document entities.
 *
 * @param doc
 * @example
 */
export function isVisionDocument(doc: BaseDocumentEntity): doc is VisionDocumentEntity {
  return doc.type === 'vision';
}

export function isADRDocument(doc: BaseDocumentEntity): doc is ADRDocumentEntity {
  return doc.type === 'adr';
}

export function isPRDDocument(doc: BaseDocumentEntity): doc is PRDDocumentEntity {
  return doc.type === 'prd';
}

export function isEpicDocument(doc: BaseDocumentEntity): doc is EpicDocumentEntity {
  return doc.type === 'epic';
}

export function isFeatureDocument(doc: BaseDocumentEntity): doc is FeatureDocumentEntity {
  return doc.type === 'feature';
}

export function isTaskDocument(doc: BaseDocumentEntity): doc is TaskDocumentEntity {
  return doc.type === 'task';
}
