/**
 * Product Flow Entities - Clean Naming and Proper SPARC Integration.
 *
 * MISSION ACCOMPLISHED: Renamed from document-entities.ts to product-entities.ts
 * - Clean Product Flow naming throughout (no generic "document" terminology)
 * - Proper SPARC integration in Features and Tasks
 * - Clear separation: Product Flow = WHAT, SPARC = HOW
 */
/**
 * @file Database layer: product-entities
 */



import type { DocumentType } from '../types/workflow-types';

/**
 * Base entity for all Product Flow documents.
 *
 * @example
 */
export interface BaseProductEntity {
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
export interface VisionDocumentEntity extends BaseProductEntity {
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
export interface ADRDocumentEntity extends BaseProductEntity {
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
export interface PRDDocumentEntity extends BaseProductEntity {
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
export interface EpicDocumentEntity extends BaseProductEntity {
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
 * Feature Document Entity - ENHANCED with PROPER SPARC INTEGRATION
 * Individual implementable features with SPARC methodology as implementation tool.
 *
 * @example
 */
export interface FeatureDocumentEntity extends BaseProductEntity {
  type: 'feature';

  // Feature-specific fields (Business Requirements - WHAT to build)
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

  // ==================== SPARC METHODOLOGY INTEGRATION ====================
  // SPARC = HOW to implement the business requirements defined above
  sparc_implementation?: {
    sparc_project_id?: string; // Links to actual SPARC project

    // SPARC provides the technical implementation methodology
    sparc_phases: {
      specification: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[]; // Technical specification documents
        completion_date?: Date;
        quality_score?: number; // AI-assessed quality of technical spec
      };
      pseudocode: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[]; // Algorithm and data structure designs
        completion_date?: Date;
        algorithms: string[]; // Algorithm names/IDs designed in this phase
      };
      architecture: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[]; // System architecture documents
        completion_date?: Date;
        components: string[]; // Component names/IDs designed
      };
      refinement: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[]; // Optimization and refinement plans
        completion_date?: Date;
        optimizations: string[]; // Optimization strategy IDs applied
      };
      completion: {
        status: 'not_started' | 'in_progress' | 'completed' | 'failed';
        deliverables: string[]; // Final production code and tests
        completion_date?: Date;
        artifacts: string[]; // Generated code/test artifact IDs
      };
    };

    // SPARC workflow state
    current_sparc_phase:
      | 'specification'
      | 'pseudocode'
      | 'architecture'
      | 'refinement'
      | 'completion';
    sparc_progress_percentage: number; // 0-100% completion across all phases
    use_sparc_methodology: boolean; // Feature uses SPARC for implementation

    // Integration metadata
    sparc_domain:
      | 'swarm-coordination'
      | 'neural-networks'
      | 'wasm-integration'
      | 'rest-api'
      | 'memory-systems'
      | 'interfaces'
      | 'general';
    sparc_complexity: 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise';
    integration_health: {
      sync_status: 'synced' | 'out_of_sync' | 'error';
      last_sync_date?: Date;
      sync_errors: string[];
    };
  };
}

/**
 * Task Document Entity - ENHANCED with PROPER SPARC INTEGRATION
 * Granular implementation tasks with SPARC methodology details.
 *
 * @example
 */
export interface TaskDocumentEntity extends BaseProductEntity {
  type: 'task';

  // Task-specific fields (Business Requirements - WHAT to implement)
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
  completion_status: 'todo' | 'in_progress' | 'code_review' | 'testing' | 'done';

  // Code generation results
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

  // ==================== SPARC METHODOLOGY INTEGRATION ====================
  // Tasks can be linked to specific SPARC phases of their parent Feature
  sparc_implementation_details?: {
    parent_feature_sparc_id?: string; // Links to parent feature's SPARC project

    // Which SPARC phase this task contributes to
    sparc_phase_assignment:
      | 'specification'
      | 'pseudocode'
      | 'architecture'
      | 'refinement'
      | 'completion';

    // What type of SPARC deliverable this task produces
    sparc_deliverable_type:
      | 'requirements_doc'
      | 'algorithm_design'
      | 'component_spec'
      | 'optimization_plan'
      | 'production_code';

    // SPARC quality gates that this task must pass
    sparc_quality_gates: {
      requirement: string;
      status: 'pending' | 'passed' | 'failed';
      validation_method: 'automated' | 'manual' | 'ai_assisted';
      validation_date?: Date;
    }[];

    // SPARC artifacts produced by this task
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

    // Complexity analysis for this task (provided by SPARC methodology)
    complexity_analysis?: {
      time_complexity: string;
      space_complexity: string;
      maintainability_score: number; // 0-100
      performance_impact: 'low' | 'medium' | 'high';
    };
  };
}

/**
 * Product Flow Relationship Entity.
 * Tracks relationships between Product Flow documents.
 *
 * @example
 */
export interface ProductRelationshipEntity {
  id: string;
  source_document_id: string;
  target_document_id: string;
  relationship_type:
    | 'generates'
    | 'implements'
    | 'depends_on'
    | 'relates_to'
    | 'supersedes'
    | 'sparc_implements';
  created_at: Date;
  metadata?: Record<string, any>;
}

/**
 * Product Workflow State Entity.
 * Tracks Product Flow workflow progression.
 *
 * @example
 */
export interface ProductWorkflowStateEntity {
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

  // SPARC integration workflow state
  sparc_workflow_integration?: {
    features_using_sparc: string[]; // Feature IDs using SPARC
    sparc_phases_active: Record<string, string>; // featureId -> current SPARC phase
    sparc_completion_percentage: number; // Overall SPARC completion %
  };
}

/**
 * Product Project Entity - ENHANCED with COMPREHENSIVE SPARC INTEGRATION
 * Groups related Product Flow documents with SPARC methodology support.
 *
 * @example
 */
export interface ProductProjectEntity {
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

  // Product Flow document relationships
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

  // ==================== COMPREHENSIVE SPARC INTEGRATION ====================
  sparc_integration: {
    enabled: boolean; // Project uses SPARC methodology

    // Feature -> SPARC Project mappings
    sparc_project_mappings: Array<{
      feature_id: string; // Product Flow feature ID
      sparc_project_id: string; // SPARC project ID
      sparc_project_name: string; // Human-readable name
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
      progress_percentage: number; // 0-100% completion
      created_at: Date;
      updated_at: Date;
    }>;

    sparc_project_ids: string[]; // All SPARC project IDs associated with this Product project

    // SPARC workflow coordination settings
    product_sparc_workflow: {
      vision_generates_sparc_specs: boolean; // Vision analysis feeds into SPARC specifications
      features_trigger_sparc_projects: boolean; // Feature creation auto-creates SPARC projects
      tasks_map_to_sparc_phases: boolean; // Tasks are mapped to specific SPARC phases
      auto_create_sparc_from_features: boolean; // Automatically create SPARC projects for technical features
      sparc_completion_updates_tasks: boolean; // SPARC completion automatically updates task status
    };

    // Integration health and metrics
    integration_health: {
      product_sparc_sync_status: 'synced' | 'out_of_sync' | 'error';
      last_sync_date?: Date;
      sync_errors: string[];
      sparc_coverage_percentage: number; // % of features using SPARC methodology
      sparc_completion_average: number; // Average completion % across all SPARC projects
    };

    // SPARC methodology benefits tracking
    sparc_benefits: {
      features_with_sparc: number; // Count of features using SPARC
      features_without_sparc: number; // Count of features not using SPARC
      sparc_quality_improvement: number; // Quality score improvement from SPARC usage
      sparc_delivery_speed: number; // Delivery speed improvement metrics
      sparc_maintainability_score: number; // Overall maintainability improvement
    };
  };

  // Metadata
  tags: string[];
  stakeholders: string[];
  author: string;
}

/**
 * Product Search Index Entity.
 * Optimized search and discovery for Product Flow.
 *
 * @example
 */
export interface ProductSearchIndexEntity {
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

  // ==================== SPARC INTEGRATION SEARCH FIELDS ====================
  sparc_project_ids: string[]; // Associated SPARC project IDs for search
  sparc_phase: string; // Current SPARC phase if document uses SPARC
  sparc_progress: number; // SPARC completion percentage (0-100)
  uses_sparc_methodology: boolean; // Whether document/project uses SPARC
  sparc_domain: string; // SPARC domain classification
  sparc_complexity: string; // SPARC complexity level
}

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
} as const;

/**
 * Type guards for Product Flow entities.
 *
 * @param doc
 */
export function isVisionDocument(doc: BaseProductEntity): doc is VisionDocumentEntity {
  return doc.type === 'vision';
}

export function isADRDocument(doc: BaseProductEntity): doc is ADRDocumentEntity {
  return doc.type === 'adr';
}

export function isPRDDocument(doc: BaseProductEntity): doc is PRDDocumentEntity {
  return doc.type === 'prd';
}

export function isEpicDocument(doc: BaseProductEntity): doc is EpicDocumentEntity {
  return doc.type === 'epic';
}

export function isFeatureDocument(doc: BaseProductEntity): doc is FeatureDocumentEntity {
  return doc.type === 'feature';
}

export function isTaskDocument(doc: BaseProductEntity): doc is TaskDocumentEntity {
  return doc.type === 'task';
}

// Alias BaseDocumentEntity to BaseProductEntity for compatibility
export type BaseDocumentEntity = BaseProductEntity;
