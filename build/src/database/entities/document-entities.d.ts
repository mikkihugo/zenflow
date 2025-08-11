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
    project_id?: string;
    parent_document_id?: string;
    dependencies: string[];
    related_documents: string[];
    version: string;
    checksum: string;
    metadata: Record<string, any>;
    name?: string;
    created_at: Date;
    updated_at: Date;
    searchable_content: string;
    keywords: string[];
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
    generated_adrs: string[];
    generated_prds: string[];
}
/**
 * Architecture Decision Record Entity.
 * Technical decisions and rationale.
 *
 * @example
 */
export interface ADRDocumentEntity extends BaseDocumentEntity {
    type: 'adr';
    decision_number: number;
    decision_status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
    context: string;
    decision: string;
    consequences: string[];
    alternatives_considered: string[];
    source_vision_id?: string;
    impacted_prds: string[];
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
    source_vision_id?: string;
    related_adrs: string[];
    generated_epics: string[];
}
/**
 * Epic Document Entity.
 * Large feature groupings.
 *
 * @example
 */
export interface EpicDocumentEntity extends BaseDocumentEntity {
    type: 'epic';
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
    source_prd_id?: string;
    feature_ids: string[];
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
        mockups?: string[];
    };
    source_epic_id?: string;
    task_ids: string[];
    implementation_status: 'not_started' | 'in_progress' | 'code_complete' | 'testing' | 'done';
    test_coverage_percentage?: number;
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
                algorithms: string[];
            };
            architecture: {
                status: 'not_started' | 'in_progress' | 'completed' | 'failed';
                deliverables: string[];
                completion_date?: Date;
                components: string[];
            };
            refinement: {
                status: 'not_started' | 'in_progress' | 'completed' | 'failed';
                deliverables: string[];
                completion_date?: Date;
                optimizations: string[];
            };
            completion: {
                status: 'not_started' | 'in_progress' | 'completed' | 'failed';
                deliverables: string[];
                completion_date?: Date;
                artifacts: string[];
            };
        };
        current_sparc_phase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
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
    source_feature_id?: string;
    assigned_to?: string;
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
    sparc_implementation_details?: {
        parent_feature_sparc_id?: string;
        sparc_phase_assignment: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
        sparc_deliverable_type: 'requirements_doc' | 'algorithm_design' | 'component_spec' | 'optimization_plan' | 'production_code';
        sparc_quality_gates: {
            requirement: string;
            status: 'pending' | 'passed' | 'failed';
            validation_method: 'automated' | 'manual' | 'ai_assisted';
            validation_date?: Date;
        }[];
        sparc_artifacts: {
            artifact_id: string;
            artifact_type: 'specification' | 'pseudocode' | 'architecture_diagram' | 'refactored_code' | 'final_implementation';
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
    started_at: Date;
    updated_at: Date;
    estimated_completion?: Date;
    auto_transitions: boolean;
    requires_approval: boolean;
    approved_by?: string;
    approved_at?: Date;
    workflow_results?: Record<string, any>;
    generated_artifacts: string[];
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
    created_at: Date;
    updated_at: Date;
    start_date?: Date;
    target_completion?: Date;
    actual_completion?: Date;
    vision_document_ids: string[];
    adr_document_ids: string[];
    prd_document_ids: string[];
    epic_document_ids: string[];
    feature_document_ids: string[];
    task_document_ids: string[];
    overall_progress_percentage: number;
    phase: 'planning' | 'requirements' | 'design' | 'implementation' | 'testing' | 'deployment' | 'complete';
    sparc_integration: {
        enabled: boolean;
        sparc_project_mappings: Array<{
            feature_id: string;
            sparc_project_id: string;
            sparc_project_name: string;
            domain: 'swarm-coordination' | 'neural-networks' | 'wasm-integration' | 'rest-api' | 'memory-systems' | 'interfaces' | 'general';
            complexity: 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise';
            current_phase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
            progress_percentage: number;
            created_at: Date;
            updated_at: Date;
        }>;
        sparc_project_ids: string[];
        document_sparc_workflow: {
            vision_generates_sparc_specs: boolean;
            features_trigger_sparc_projects: boolean;
            tasks_map_to_sparc_phases: boolean;
            auto_create_sparc_from_features: boolean;
            sparc_completion_updates_tasks: boolean;
        };
        integration_health: {
            document_sparc_sync_status: 'synced' | 'out_of_sync' | 'error';
            last_sync_date?: Date;
            sync_errors: string[];
            sparc_coverage_percentage: number;
        };
    };
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
    title_vector: number[];
    content_vector: number[];
    combined_vector: number[];
    keywords: string[];
    tags: string[];
    extracted_entities: string[];
    status: string;
    priority: string;
    author: string;
    created_date: Date;
    updated_date: Date;
    parent_documents: string[];
    child_documents: string[];
    related_documents: string[];
    search_rank: number;
    last_accessed: Date;
    access_count: number;
}
/**
 * Database Schema Export.
 * Defines table structures for database creation.
 */
export declare const DATABASE_SCHEMAS: {
    readonly documents: "\n    CREATE TABLE IF NOT EXISTS documents (\n      id TEXT PRIMARY KEY,\n      type TEXT NOT NULL,\n      title TEXT NOT NULL,\n      content TEXT NOT NULL,\n      status TEXT DEFAULT 'draft',\n      priority TEXT DEFAULT 'medium',\n      author TEXT,\n      tags TEXT, -- JSON array\n      project_id TEXT,\n      parent_document_id TEXT,\n      dependencies TEXT, -- JSON array\n      related_documents TEXT, -- JSON array\n      version TEXT DEFAULT '1.0.0',\n      checksum TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      searchable_content TEXT,\n      keywords TEXT, -- JSON array\n      workflow_stage TEXT,\n      completion_percentage INTEGER DEFAULT 0,\n      \n      -- Type-specific JSON fields\n      vision_data TEXT, -- JSON for vision-specific fields\n      adr_data TEXT, -- JSON for ADR-specific fields\n      prd_data TEXT, -- JSON for PRD-specific fields\n      epic_data TEXT, -- JSON for epic-specific fields\n      feature_data TEXT, -- JSON for feature-specific fields\n      task_data TEXT, -- JSON for task-specific fields\n      \n      FOREIGN KEY (project_id) REFERENCES projects(id),\n      FOREIGN KEY (parent_document_id) REFERENCES documents(id)\n    );\n    \n    CREATE INDEX idx_documents_type ON documents(type);\n    CREATE INDEX idx_documents_project ON documents(project_id);\n    CREATE INDEX idx_documents_status ON documents(status);\n    CREATE INDEX idx_documents_created ON documents(created_at);\n    CREATE INDEX idx_documents_updated ON documents(updated_at);\n    CREATE INDEX idx_documents_workflow ON documents(workflow_stage);\n    CREATE UNIQUE INDEX idx_documents_checksum ON documents(checksum);\n  ";
    readonly document_relationships: "\n    CREATE TABLE IF NOT EXISTS document_relationships (\n      id TEXT PRIMARY KEY,\n      source_document_id TEXT NOT NULL,\n      target_document_id TEXT NOT NULL,\n      relationship_type TEXT NOT NULL,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      metadata TEXT, -- JSON\n      \n      FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE CASCADE,\n      FOREIGN KEY (target_document_id) REFERENCES documents(id) ON DELETE CASCADE,\n      UNIQUE(source_document_id, target_document_id, relationship_type)\n    );\n    \n    CREATE INDEX idx_relationships_source ON document_relationships(source_document_id);\n    CREATE INDEX idx_relationships_target ON document_relationships(target_document_id);\n    CREATE INDEX idx_relationships_type ON document_relationships(relationship_type);\n  ";
    readonly document_workflow_states: "\n    CREATE TABLE IF NOT EXISTS document_workflow_states (\n      id TEXT PRIMARY KEY,\n      document_id TEXT NOT NULL UNIQUE,\n      workflow_name TEXT NOT NULL,\n      current_stage TEXT NOT NULL,\n      stages_completed TEXT, -- JSON array\n      next_stages TEXT, -- JSON array\n      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      estimated_completion DATETIME,\n      auto_transitions BOOLEAN DEFAULT TRUE,\n      requires_approval BOOLEAN DEFAULT FALSE,\n      approved_by TEXT,\n      approved_at DATETIME,\n      workflow_results TEXT, -- JSON\n      generated_artifacts TEXT, -- JSON array\n      \n      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE\n    );\n    \n    CREATE INDEX idx_workflow_states_document ON document_workflow_states(document_id);\n    CREATE INDEX idx_workflow_states_workflow ON document_workflow_states(workflow_name);\n    CREATE INDEX idx_workflow_states_stage ON document_workflow_states(current_stage);\n  ";
    readonly projects: "\n    CREATE TABLE IF NOT EXISTS projects (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      description TEXT,\n      domain TEXT NOT NULL,\n      complexity TEXT DEFAULT 'moderate',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      start_date DATETIME,\n      target_completion DATETIME,\n      actual_completion DATETIME,\n      vision_document_ids TEXT, -- JSON array\n      adr_document_ids TEXT, -- JSON array\n      prd_document_ids TEXT, -- JSON array\n      epic_document_ids TEXT, -- JSON array\n      feature_document_ids TEXT, -- JSON array\n      task_document_ids TEXT, -- JSON array\n      overall_progress_percentage INTEGER DEFAULT 0,\n      phase TEXT DEFAULT 'planning',\n      sparc_project_id TEXT,\n      sparc_phase TEXT,\n      tags TEXT, -- JSON array\n      stakeholders TEXT, -- JSON array\n      author TEXT NOT NULL\n    );\n    \n    CREATE INDEX idx_projects_domain ON projects(domain);\n    CREATE INDEX idx_projects_phase ON projects(phase);\n    CREATE INDEX idx_projects_author ON projects(author);\n    CREATE INDEX idx_projects_created ON projects(created_at);\n    CREATE UNIQUE INDEX idx_projects_sparc ON projects(sparc_project_id) WHERE sparc_project_id IS NOT NULL;\n  ";
    readonly document_search_index: "\n    CREATE TABLE IF NOT EXISTS document_search_index (\n      document_id TEXT PRIMARY KEY,\n      document_type TEXT NOT NULL,\n      project_id TEXT,\n      title_vector BLOB, -- Serialized embedding vector\n      content_vector BLOB, -- Serialized embedding vector\n      combined_vector BLOB, -- Serialized embedding vector\n      keywords TEXT, -- JSON array\n      tags TEXT, -- JSON array\n      extracted_entities TEXT, -- JSON array\n      status TEXT,\n      priority TEXT,\n      author TEXT,\n      created_date DATETIME,\n      updated_date DATETIME,\n      parent_documents TEXT, -- JSON array\n      child_documents TEXT, -- JSON array\n      related_documents TEXT, -- JSON array\n      search_rank REAL DEFAULT 0.0,\n      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,\n      access_count INTEGER DEFAULT 0,\n      \n      -- SPARC INTEGRATION SEARCH FIELDS\n      sparc_project_ids TEXT, -- JSON array of associated SPARC project IDs\n      sparc_phase TEXT, -- Current SPARC phase if document uses SPARC\n      sparc_progress REAL DEFAULT 0.0, -- SPARC completion percentage\n      uses_sparc_methodology BOOLEAN DEFAULT FALSE,\n      \n      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,\n      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL\n    );\n    \n    CREATE INDEX idx_search_type ON document_search_index(document_type);\n    CREATE INDEX idx_search_project ON document_search_index(project_id);\n    CREATE INDEX idx_search_status ON document_search_index(status);\n    CREATE INDEX idx_search_rank ON document_search_index(search_rank DESC);\n    CREATE INDEX idx_search_accessed ON document_search_index(last_accessed DESC);\n    CREATE INDEX idx_search_sparc_phase ON document_search_index(sparc_phase);\n    CREATE INDEX idx_search_sparc_progress ON document_search_index(sparc_progress);\n    CREATE INDEX idx_search_sparc_enabled ON document_search_index(uses_sparc_methodology);\n  ";
    readonly sparc_integration_state: "\n    CREATE TABLE IF NOT EXISTS sparc_integration_state (\n      id TEXT PRIMARY KEY,\n      document_project_id TEXT NOT NULL,\n      feature_document_id TEXT,\n      sparc_project_id TEXT NOT NULL,\n      sparc_project_name TEXT NOT NULL,\n      \n      -- SPARC project metadata\n      sparc_domain TEXT NOT NULL,\n      sparc_complexity TEXT NOT NULL,\n      current_sparc_phase TEXT NOT NULL,\n      sparc_progress_percentage REAL DEFAULT 0.0,\n      \n      -- Integration workflow state\n      sync_status TEXT DEFAULT 'synced', -- 'synced' | 'out_of_sync' | 'error'\n      last_sync_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n      sync_errors TEXT, -- JSON array\n      \n      -- Phase completion tracking\n      specification_completed BOOLEAN DEFAULT FALSE,\n      pseudocode_completed BOOLEAN DEFAULT FALSE,\n      architecture_completed BOOLEAN DEFAULT FALSE,\n      refinement_completed BOOLEAN DEFAULT FALSE,\n      completion_completed BOOLEAN DEFAULT FALSE,\n      \n      -- Timestamps\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      \n      -- Foreign key constraints\n      FOREIGN KEY (document_project_id) REFERENCES projects(id) ON DELETE CASCADE,\n      FOREIGN KEY (feature_document_id) REFERENCES documents(id) ON DELETE CASCADE,\n      UNIQUE(feature_document_id, sparc_project_id)\n    );\n    \n    CREATE INDEX idx_sparc_integration_project ON sparc_integration_state(document_project_id);\n    CREATE INDEX idx_sparc_integration_feature ON sparc_integration_state(feature_document_id);\n    CREATE INDEX idx_sparc_integration_sparc_project ON sparc_integration_state(sparc_project_id);\n    CREATE INDEX idx_sparc_integration_phase ON sparc_integration_state(current_sparc_phase);\n    CREATE INDEX idx_sparc_integration_sync ON sparc_integration_state(sync_status);\n    CREATE INDEX idx_sparc_integration_progress ON sparc_integration_state(sparc_progress_percentage);\n  ";
};
/**
 * Type guards for document entities.
 *
 * @param doc
 * @example
 */
export declare function isVisionDocument(doc: BaseDocumentEntity): doc is VisionDocumentEntity;
export declare function isADRDocument(doc: BaseDocumentEntity): doc is ADRDocumentEntity;
export declare function isPRDDocument(doc: BaseDocumentEntity): doc is PRDDocumentEntity;
export declare function isEpicDocument(doc: BaseDocumentEntity): doc is EpicDocumentEntity;
export declare function isFeatureDocument(doc: BaseDocumentEntity): doc is FeatureDocumentEntity;
export declare function isTaskDocument(doc: BaseDocumentEntity): doc is TaskDocumentEntity;
//# sourceMappingURL=document-entities.d.ts.map