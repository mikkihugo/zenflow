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
export interface VisionDocumentEntity extends BaseProductEntity {
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
export interface ADRDocumentEntity extends BaseProductEntity {
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
export interface PRDDocumentEntity extends BaseProductEntity {
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
export interface EpicDocumentEntity extends BaseProductEntity {
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
 * Feature Document Entity - ENHANCED with PROPER SPARC INTEGRATION
 * Individual implementable features with SPARC methodology as implementation tool.
 *
 * @example
 */
export interface FeatureDocumentEntity extends BaseProductEntity {
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
        sparc_domain: 'swarm-coordination' | 'neural-networks' | 'wasm-integration' | 'rest-api' | 'memory-systems' | 'interfaces' | 'general';
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
    completion_status: 'todo' | 'in_progress' | 'code_review' | 'testing' | 'done';
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
 * Product Flow Relationship Entity.
 * Tracks relationships between Product Flow documents.
 *
 * @example
 */
export interface ProductRelationshipEntity {
    id: string;
    source_document_id: string;
    target_document_id: string;
    relationship_type: 'generates' | 'implements' | 'depends_on' | 'relates_to' | 'supersedes' | 'sparc_implements';
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
    started_at: Date;
    updated_at: Date;
    estimated_completion?: Date;
    auto_transitions: boolean;
    requires_approval: boolean;
    approved_by?: string;
    approved_at?: Date;
    workflow_results?: Record<string, any>;
    generated_artifacts: string[];
    sparc_workflow_integration?: {
        features_using_sparc: string[];
        sparc_phases_active: Record<string, string>;
        sparc_completion_percentage: number;
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
        product_sparc_workflow: {
            vision_generates_sparc_specs: boolean;
            features_trigger_sparc_projects: boolean;
            tasks_map_to_sparc_phases: boolean;
            auto_create_sparc_from_features: boolean;
            sparc_completion_updates_tasks: boolean;
        };
        integration_health: {
            product_sparc_sync_status: 'synced' | 'out_of_sync' | 'error';
            last_sync_date?: Date;
            sync_errors: string[];
            sparc_coverage_percentage: number;
            sparc_completion_average: number;
        };
        sparc_benefits: {
            features_with_sparc: number;
            features_without_sparc: number;
            sparc_quality_improvement: number;
            sparc_delivery_speed: number;
            sparc_maintainability_score: number;
        };
    };
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
    sparc_project_ids: string[];
    sparc_phase: string;
    sparc_progress: number;
    uses_sparc_methodology: boolean;
    sparc_domain: string;
    sparc_complexity: string;
}
/**
 * Database Schema Export - UPDATED for Product Flow naming.
 */
export declare const PRODUCT_DATABASE_SCHEMAS: {
    readonly product_documents: "\n    CREATE TABLE IF NOT EXISTS product_documents (\n      id TEXT PRIMARY KEY,\n      type TEXT NOT NULL,\n      title TEXT NOT NULL,\n      content TEXT NOT NULL,\n      status TEXT DEFAULT 'draft',\n      priority TEXT DEFAULT 'medium',\n      author TEXT,\n      tags TEXT, -- JSON array\n      project_id TEXT,\n      parent_document_id TEXT,\n      dependencies TEXT, -- JSON array\n      related_documents TEXT, -- JSON array\n      version TEXT DEFAULT '1.0.0',\n      checksum TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      searchable_content TEXT,\n      keywords TEXT, -- JSON array\n      workflow_stage TEXT,\n      completion_percentage INTEGER DEFAULT 0,\n      \n      -- Type-specific JSON fields\n      vision_data TEXT, -- JSON for vision-specific fields\n      adr_data TEXT, -- JSON for ADR-specific fields\n      prd_data TEXT, -- JSON for PRD-specific fields\n      epic_data TEXT, -- JSON for epic-specific fields\n      feature_data TEXT, -- JSON for feature-specific fields (includes SPARC integration)\n      task_data TEXT, -- JSON for task-specific fields (includes SPARC integration)\n      \n      -- SPARC Integration columns\n      uses_sparc_methodology BOOLEAN DEFAULT FALSE,\n      sparc_project_id TEXT,\n      sparc_phase TEXT,\n      sparc_progress_percentage REAL DEFAULT 0.0,\n      sparc_domain TEXT,\n      sparc_complexity TEXT,\n      \n      FOREIGN KEY (project_id) REFERENCES product_projects(id),\n      FOREIGN KEY (parent_document_id) REFERENCES product_documents(id)\n    );\n    \n    CREATE INDEX idx_product_docs_type ON product_documents(type);\n    CREATE INDEX idx_product_docs_project ON product_documents(project_id);\n    CREATE INDEX idx_product_docs_status ON product_documents(status);\n    CREATE INDEX idx_product_docs_sparc ON product_documents(uses_sparc_methodology);\n    CREATE INDEX idx_product_docs_sparc_phase ON product_documents(sparc_phase);\n    CREATE INDEX idx_product_docs_sparc_progress ON product_documents(sparc_progress_percentage);\n    CREATE UNIQUE INDEX idx_product_docs_checksum ON product_documents(checksum);\n  ";
    readonly product_relationships: "\n    CREATE TABLE IF NOT EXISTS product_relationships (\n      id TEXT PRIMARY KEY,\n      source_document_id TEXT NOT NULL,\n      target_document_id TEXT NOT NULL,\n      relationship_type TEXT NOT NULL,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      metadata TEXT, -- JSON\n      \n      FOREIGN KEY (source_document_id) REFERENCES product_documents(id) ON DELETE CASCADE,\n      FOREIGN KEY (target_document_id) REFERENCES product_documents(id) ON DELETE CASCADE,\n      UNIQUE(source_document_id, target_document_id, relationship_type)\n    );\n    \n    CREATE INDEX idx_prod_relationships_source ON product_relationships(source_document_id);\n    CREATE INDEX idx_prod_relationships_target ON product_relationships(target_document_id);\n    CREATE INDEX idx_prod_relationships_type ON product_relationships(relationship_type);\n  ";
    readonly product_workflow_states: "\n    CREATE TABLE IF NOT EXISTS product_workflow_states (\n      id TEXT PRIMARY KEY,\n      document_id TEXT NOT NULL UNIQUE,\n      workflow_name TEXT NOT NULL,\n      current_stage TEXT NOT NULL,\n      stages_completed TEXT, -- JSON array\n      next_stages TEXT, -- JSON array\n      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      estimated_completion DATETIME,\n      auto_transitions BOOLEAN DEFAULT TRUE,\n      requires_approval BOOLEAN DEFAULT FALSE,\n      approved_by TEXT,\n      approved_at DATETIME,\n      workflow_results TEXT, -- JSON\n      generated_artifacts TEXT, -- JSON array\n      \n      -- SPARC workflow integration\n      sparc_workflow_integration TEXT, -- JSON with SPARC workflow state\n      \n      FOREIGN KEY (document_id) REFERENCES product_documents(id) ON DELETE CASCADE\n    );\n    \n    CREATE INDEX idx_prod_workflow_states_document ON product_workflow_states(document_id);\n    CREATE INDEX idx_prod_workflow_states_workflow ON product_workflow_states(workflow_name);\n    CREATE INDEX idx_prod_workflow_states_stage ON product_workflow_states(current_stage);\n  ";
    readonly product_projects: "\n    CREATE TABLE IF NOT EXISTS product_projects (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      description TEXT,\n      domain TEXT NOT NULL,\n      complexity TEXT DEFAULT 'moderate',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      start_date DATETIME,\n      target_completion DATETIME,\n      actual_completion DATETIME,\n      vision_document_ids TEXT, -- JSON array\n      adr_document_ids TEXT, -- JSON array\n      prd_document_ids TEXT, -- JSON array\n      epic_document_ids TEXT, -- JSON array\n      feature_document_ids TEXT, -- JSON array\n      task_document_ids TEXT, -- JSON array\n      overall_progress_percentage INTEGER DEFAULT 0,\n      phase TEXT DEFAULT 'planning',\n      \n      -- COMPREHENSIVE SPARC INTEGRATION\n      sparc_integration_enabled BOOLEAN DEFAULT FALSE,\n      sparc_project_mappings TEXT, -- JSON array of feature->SPARC mappings\n      sparc_project_ids TEXT, -- JSON array of SPARC project IDs\n      sparc_workflow_config TEXT, -- JSON with SPARC workflow settings\n      sparc_integration_health TEXT, -- JSON with sync status and metrics\n      sparc_benefits_tracking TEXT, -- JSON with SPARC benefits metrics\n      \n      tags TEXT, -- JSON array\n      stakeholders TEXT, -- JSON array\n      author TEXT NOT NULL\n    );\n    \n    CREATE INDEX idx_product_projects_domain ON product_projects(domain);\n    CREATE INDEX idx_product_projects_phase ON product_projects(phase);\n    CREATE INDEX idx_product_projects_author ON product_projects(author);\n    CREATE INDEX idx_product_projects_sparc ON product_projects(sparc_integration_enabled);\n  ";
    readonly product_search_index: "\n    CREATE TABLE IF NOT EXISTS product_search_index (\n      document_id TEXT PRIMARY KEY,\n      document_type TEXT NOT NULL,\n      project_id TEXT,\n      title_vector BLOB, -- Serialized embedding vector\n      content_vector BLOB, -- Serialized embedding vector\n      combined_vector BLOB, -- Serialized embedding vector\n      keywords TEXT, -- JSON array\n      tags TEXT, -- JSON array\n      extracted_entities TEXT, -- JSON array\n      status TEXT,\n      priority TEXT,\n      author TEXT,\n      created_date DATETIME,\n      updated_date DATETIME,\n      parent_documents TEXT, -- JSON array\n      child_documents TEXT, -- JSON array\n      related_documents TEXT, -- JSON array\n      search_rank REAL DEFAULT 0.0,\n      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,\n      access_count INTEGER DEFAULT 0,\n      \n      -- SPARC INTEGRATION SEARCH FIELDS\n      sparc_project_ids TEXT, -- JSON array of associated SPARC project IDs\n      sparc_phase TEXT, -- Current SPARC phase if document uses SPARC\n      sparc_progress REAL DEFAULT 0.0, -- SPARC completion percentage\n      uses_sparc_methodology BOOLEAN DEFAULT FALSE,\n      sparc_domain TEXT, -- SPARC domain classification\n      sparc_complexity TEXT, -- SPARC complexity level\n      \n      FOREIGN KEY (document_id) REFERENCES product_documents(id) ON DELETE CASCADE,\n      FOREIGN KEY (project_id) REFERENCES product_projects(id) ON DELETE SET NULL\n    );\n    \n    CREATE INDEX idx_prod_search_type ON product_search_index(document_type);\n    CREATE INDEX idx_prod_search_project ON product_search_index(project_id);\n    CREATE INDEX idx_prod_search_sparc_phase ON product_search_index(sparc_phase);\n    CREATE INDEX idx_prod_search_sparc_progress ON product_search_index(sparc_progress);\n    CREATE INDEX idx_prod_search_sparc_enabled ON product_search_index(uses_sparc_methodology);\n  ";
    readonly product_sparc_integration: "\n    CREATE TABLE IF NOT EXISTS product_sparc_integration (\n      id TEXT PRIMARY KEY,\n      product_project_id TEXT NOT NULL,\n      feature_document_id TEXT,\n      sparc_project_id TEXT NOT NULL,\n      sparc_project_name TEXT NOT NULL,\n      \n      -- SPARC project metadata\n      sparc_domain TEXT NOT NULL,\n      sparc_complexity TEXT NOT NULL,\n      current_sparc_phase TEXT NOT NULL,\n      sparc_progress_percentage REAL DEFAULT 0.0,\n      \n      -- Integration workflow state\n      sync_status TEXT DEFAULT 'synced', -- 'synced' | 'out_of_sync' | 'error'\n      last_sync_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n      sync_errors TEXT, -- JSON array\n      \n      -- Phase completion tracking\n      specification_completed BOOLEAN DEFAULT FALSE,\n      pseudocode_completed BOOLEAN DEFAULT FALSE,\n      architecture_completed BOOLEAN DEFAULT FALSE,\n      refinement_completed BOOLEAN DEFAULT FALSE,\n      completion_completed BOOLEAN DEFAULT FALSE,\n      \n      -- Quality and benefits tracking\n      quality_improvement_score REAL DEFAULT 0.0,\n      delivery_speed_multiplier REAL DEFAULT 1.0,\n      maintainability_score REAL DEFAULT 0.0,\n      \n      -- Timestamps\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      \n      -- Foreign key constraints\n      FOREIGN KEY (product_project_id) REFERENCES product_projects(id) ON DELETE CASCADE,\n      FOREIGN KEY (feature_document_id) REFERENCES product_documents(id) ON DELETE CASCADE,\n      UNIQUE(feature_document_id, sparc_project_id)\n    );\n    \n    CREATE INDEX idx_prod_sparc_project ON product_sparc_integration(product_project_id);\n    CREATE INDEX idx_prod_sparc_feature ON product_sparc_integration(feature_document_id);\n    CREATE INDEX idx_prod_sparc_sparc_project ON product_sparc_integration(sparc_project_id);\n    CREATE INDEX idx_prod_sparc_phase ON product_sparc_integration(current_sparc_phase);\n    CREATE INDEX idx_prod_sparc_sync ON product_sparc_integration(sync_status);\n    CREATE INDEX idx_prod_sparc_progress ON product_sparc_integration(sparc_progress_percentage);\n  ";
};
/**
 * Type guards for Product Flow entities.
 *
 * @param doc
 * @example
 */
export declare function isVisionDocument(doc: BaseProductEntity): doc is VisionDocumentEntity;
export declare function isADRDocument(doc: BaseProductEntity): doc is ADRDocumentEntity;
export declare function isPRDDocument(doc: BaseProductEntity): doc is PRDDocumentEntity;
export declare function isEpicDocument(doc: BaseProductEntity): doc is EpicDocumentEntity;
export declare function isFeatureDocument(doc: BaseProductEntity): doc is FeatureDocumentEntity;
export declare function isTaskDocument(doc: BaseProductEntity): doc is TaskDocumentEntity;
export type BaseDocumentEntity = BaseProductEntity;
//# sourceMappingURL=product-entities.d.ts.map