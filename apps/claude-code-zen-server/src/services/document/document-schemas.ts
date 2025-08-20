/**
 * @fileoverview Document Schemas - Progressive Enhancement Schema System
 * 
 * Provides schema versioning for documents that supports progressive enhancement
 * from Kanban → Agile → SAFe modes without breaking existing data.
 * 
 * Key Features:
 * - Schema versioning with migration support
 * - Progressive field addition (Kanban fields → Agile fields → SAFe fields)
 * - Backward compatibility guarantees
 * - Type-safe schema validation
 * - Automatic schema migration
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */

import { nanoid } from 'nanoid';
import type { Logger } from '@claude-zen/foundation';

// ============================================================================
// CORE SCHEMA TYPES
// ============================================================================

export interface SchemaVersion {
  version: string;
  mode: 'kanban' | 'agile' | 'safe';
  description: string;
  addedFields: string[];
  removedFields: string[];
  migrations?: SchemaMigration[];
}

export interface SchemaMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => any;
  rollback?: (data: any) => any;
}

export interface DocumentSchema {
  documentType: string;
  currentVersion: string;
  versions: Record<string, SchemaVersion>;
  migrations: SchemaMigration[];
}

// ============================================================================
// BASE DOCUMENT SCHEMA (KANBAN MODE)
// ============================================================================

export interface BaseDocumentFields {
  // Core identification
  id: string;
  title: string;
  content: string;
  summary?: string;
  
  // Workflow fields (Kanban compatible)
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Metadata
  author: string;
  project_id?: string;
  tags: string[];
  
  // Timestamps
  created_at: string; // ISO string
  updated_at: string; // ISO string
  
  // Schema versioning
  schema_version: string;
  schema_mode: 'kanban' | 'agile' | 'safe';
}

// ============================================================================
// ARCHITECTURE RUNWAY SCHEMAS
// ============================================================================

export interface ArchitectureRunwaySchemaV1 extends BaseDocumentFields {
  // Kanban mode fields
  context: string;
  decision: string;
  consequences: string[];
}

export interface ArchitectureRunwaySchemaV2 extends ArchitectureRunwaySchemaV1 {
  // Agile mode additions
  decision_status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  alternatives_considered: Array<{
    name: string;
    pros: string[];
    cons: string[];
    rejected_reason: string;
  }>;
  stakeholders: string[];
}

export interface ArchitectureRunwaySchemaV3 extends ArchitectureRunwaySchemaV2 {
  // SAFe mode additions
  runway_number: number;
  runway_id: string; // AR-001, AR-002, etc.
  architecture_impact: 'foundation' | 'system' | 'solution' | 'enterprise';
  implementation_timeline: {
    start_date?: string;
    target_date?: string;
    dependencies: string[];
  };
  supersedes: string[];
  superseded_by?: string;
}

// ============================================================================
// BUSINESS EPIC SCHEMAS
// ============================================================================

export interface BusinessEpicSchemaV1 extends BaseDocumentFields {
  // Kanban mode fields
  business_objective: string;
  target_audience: string[];
  requirements: string[];
}

export interface BusinessEpicSchemaV2 extends BusinessEpicSchemaV1 {
  // Agile mode additions
  user_stories: Array<{
    id: string;
    title: string;
    description: string;
    acceptance_criteria: string[];
    story_points?: number;
  }>;
  acceptance_criteria: string[];
  definition_of_done: string[];
}

export interface BusinessEpicSchemaV3 extends BusinessEpicSchemaV2 {
  // SAFe mode additions
  epic_type: 'business' | 'enabler';
  epic_owner: string;
  portfolio_canvas: {
    leading_indicators: string[];
    success_metrics: string[];
    mvp_hypothesis: string;
    solution_intent: string;
  };
  wsjf_score?: {
    user_business_value: number;
    time_criticality: number;
    risk_reduction: number;
    job_size: number;
    total_score: number;
  };
  program_epics_generated: number;
}

// ============================================================================
// PROGRAM EPIC SCHEMAS
// ============================================================================

export interface ProgramEpicSchemaV1 extends BaseDocumentFields {
  // Available starting from Agile mode
  parent_business_epic_id: string;
  art_id: string;
  program_increment_id?: string;
  features_generated: number;
}

export interface ProgramEpicSchemaV2 extends ProgramEpicSchemaV1 {
  // SAFe mode additions
  epic_hypothesis: string;
  success_criteria: string[];
  lean_business_case: {
    epic_description: string;
    leading_indicators: string[];
    success_metrics: string[];
    mvp_definition: string;
    go_no_go_decision: string;
  };
  solution_intent: string;
  architectural_runway: string[];
}

// ============================================================================
// FEATURE SCHEMAS
// ============================================================================

export interface FeatureSchemaV1 extends BaseDocumentFields {
  // Available starting from Agile mode
  parent_program_epic_id: string;
  feature_type: 'business' | 'enabler';
  acceptance_criteria: string[];
  stories_generated: number;
}

export interface FeatureSchemaV2 extends FeatureSchemaV1 {
  // SAFe mode additions
  art_id: string;
  program_increment_id: string;
  benefit_hypothesis: string;
  acceptance_criteria_detailed: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'done';
    test_scenarios: string[];
  }>;
  team_assignments: string[];
  enabler_type?: 'infrastructure' | 'architectural' | 'exploration' | 'compliance';
  estimated_size: 'XS' | 'S' | 'M' | 'L' | 'XL';
}

// ============================================================================
// STORY SCHEMAS
// ============================================================================

export interface StorySchemaV1 extends BaseDocumentFields {
  // Available starting from Agile mode
  parent_feature_id: string;
  story_type: 'user_story' | 'enabler_story';
  acceptance_criteria: string[];
  story_points?: number;
}

export interface StorySchemaV2 extends StorySchemaV1 {
  // SAFe mode additions
  sprint_id?: string;
  iteration_id?: string;
  assigned_team_id?: string;
  assigned_user_id?: string;
  persona?: string; // For user stories
  enabler_type?: 'infrastructure' | 'architectural' | 'exploration' | 'compliance';
  business_value?: number;
  acceptance_criteria_detailed: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'done' | 'failed';
    test_scenarios: string[];
  }>;
  definition_of_done: string[];
  tasks_generated: number;
}

// ============================================================================
// SCHEMA REGISTRY
// ============================================================================

export const DOCUMENT_SCHEMAS: Record<string, DocumentSchema> = {
  architecture_runway: {
    documentType: 'architecture_runway',
    currentVersion: '3.0.0',
    versions: {
      '1.0.0': {
        version: '1.0.0',
        mode: 'kanban',
        description: 'Basic architecture decision tracking',
        addedFields: ['context', 'decision', 'consequences'],
        removedFields: []
      },
      '2.0.0': {
        version: '2.0.0',
        mode: 'agile',
        description: 'Agile architecture decision workflow',
        addedFields: ['decision_status', 'alternatives_considered', 'stakeholders'],
        removedFields: []
      },
      '3.0.0': {
        version: '3.0.0',
        mode: 'safe',
        description: 'SAFe Architecture Runway Items',
        addedFields: ['runway_number', 'runway_id', 'architecture_impact', 'implementation_timeline', 'supersedes', 'superseded_by'],
        removedFields: []
      }
    },
    migrations: [
      {
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        migrate: (data: ArchitectureRunwaySchemaV1): ArchitectureRunwaySchemaV2 => ({
          ...data,
          decision_status: 'proposed',
          alternatives_considered: [],
          stakeholders: [],
          schema_version: '2.0.0',
          schema_mode: 'agile'
        })
      },
      {
        fromVersion: '2.0.0',
        toVersion: '3.0.0',
        migrate: (data: ArchitectureRunwaySchemaV2): ArchitectureRunwaySchemaV3 => ({
          ...data,
          runway_number: 0, // Will be assigned by service
          runway_id: '', // Will be assigned by service
          architecture_impact: 'system',
          implementation_timeline: {
            dependencies: []
          },
          supersedes: [],
          schema_version: '3.0.0',
          schema_mode: 'safe'
        })
      }
    ]
  },

  business_epic: {
    documentType: 'business_epic',
    currentVersion: '3.0.0',
    versions: {
      '1.0.0': {
        version: '1.0.0',
        mode: 'kanban',
        description: 'Basic business requirements tracking',
        addedFields: ['business_objective', 'target_audience', 'requirements'],
        removedFields: []
      },
      '2.0.0': {
        version: '2.0.0',
        mode: 'agile',
        description: 'Agile user story breakdown',
        addedFields: ['user_stories', 'acceptance_criteria', 'definition_of_done'],
        removedFields: []
      },
      '3.0.0': {
        version: '3.0.0',
        mode: 'safe',
        description: 'SAFe Business Epic management',
        addedFields: ['epic_type', 'epic_owner', 'portfolio_canvas', 'wsjf_score', 'program_epics_generated'],
        removedFields: []
      }
    },
    migrations: [
      {
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        migrate: (data: BusinessEpicSchemaV1): BusinessEpicSchemaV2 => ({
          ...data,
          user_stories: [],
          acceptance_criteria: [],
          definition_of_done: [
            'Requirements documented and approved',
            'User stories created and estimated',
            'Acceptance criteria defined'
          ],
          schema_version: '2.0.0',
          schema_mode: 'agile'
        })
      },
      {
        fromVersion: '2.0.0',
        toVersion: '3.0.0',
        migrate: (data: BusinessEpicSchemaV2): BusinessEpicSchemaV3 => ({
          ...data,
          epic_type: 'business',
          epic_owner: data.author,
          portfolio_canvas: {
            leading_indicators: [],
            success_metrics: [],
            mvp_hypothesis: '',
            solution_intent: ''
          },
          program_epics_generated: 0,
          schema_version: '3.0.0',
          schema_mode: 'safe'
        })
      }
    ]
  },

  program_epic: {
    documentType: 'program_epic',
    currentVersion: '2.0.0',
    versions: {
      '1.0.0': {
        version: '1.0.0',
        mode: 'agile',
        description: 'Program-level epic management',
        addedFields: ['parent_business_epic_id', 'art_id', 'program_increment_id', 'features_generated'],
        removedFields: []
      },
      '2.0.0': {
        version: '2.0.0',
        mode: 'safe',
        description: 'SAFe Program Epic with Lean Business Case',
        addedFields: ['epic_hypothesis', 'success_criteria', 'lean_business_case', 'solution_intent', 'architectural_runway'],
        removedFields: []
      }
    },
    migrations: [
      {
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        migrate: (data: ProgramEpicSchemaV1): ProgramEpicSchemaV2 => ({
          ...data,
          epic_hypothesis: '',
          success_criteria: [],
          lean_business_case: {
            epic_description: data.content,
            leading_indicators: [],
            success_metrics: [],
            mvp_definition: '',
            go_no_go_decision: 'pending'
          },
          solution_intent: '',
          architectural_runway: [],
          schema_version: '2.0.0',
          schema_mode: 'safe'
        })
      }
    ]
  },

  feature: {
    documentType: 'feature',
    currentVersion: '2.0.0',
    versions: {
      '1.0.0': {
        version: '1.0.0',
        mode: 'agile',
        description: 'Basic feature management',
        addedFields: ['parent_program_epic_id', 'feature_type', 'acceptance_criteria', 'stories_generated'],
        removedFields: []
      },
      '2.0.0': {
        version: '2.0.0',
        mode: 'safe',
        description: 'SAFe Feature with benefit hypothesis',
        addedFields: ['art_id', 'program_increment_id', 'benefit_hypothesis', 'acceptance_criteria_detailed', 'team_assignments', 'enabler_type', 'estimated_size'],
        removedFields: []
      }
    },
    migrations: [
      {
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        migrate: (data: FeatureSchemaV1): FeatureSchemaV2 => ({
          ...data,
          art_id: '',
          program_increment_id: '',
          benefit_hypothesis: '',
          acceptance_criteria_detailed: data.acceptance_criteria.map(criteria => ({
            id: nanoid(),
            description: criteria,
            status: 'pending' as const,
            test_scenarios: []
          })),
          team_assignments: [],
          estimated_size: 'M' as const,
          schema_version: '2.0.0',
          schema_mode: 'safe'
        })
      }
    ]
  },

  story: {
    documentType: 'story',
    currentVersion: '2.0.0',
    versions: {
      '1.0.0': {
        version: '1.0.0',
        mode: 'agile',
        description: 'Basic user story management',
        addedFields: ['parent_feature_id', 'story_type', 'acceptance_criteria', 'story_points'],
        removedFields: []
      },
      '2.0.0': {
        version: '2.0.0',
        mode: 'safe',
        description: 'SAFe Story with sprint assignment',
        addedFields: ['sprint_id', 'iteration_id', 'assigned_team_id', 'assigned_user_id', 'persona', 'enabler_type', 'business_value', 'acceptance_criteria_detailed', 'definition_of_done', 'tasks_generated'],
        removedFields: []
      }
    },
    migrations: [
      {
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        migrate: (data: StorySchemaV1): StorySchemaV2 => ({
          ...data,
          acceptance_criteria_detailed: data.acceptance_criteria.map(criteria => ({
            id: nanoid(),
            description: criteria,
            status: 'pending' as const,
            test_scenarios: []
          })),
          definition_of_done: [
            'Code implemented and reviewed',
            'All acceptance criteria met',
            'Unit tests written and passing',
            'Integration tests passing',
            'Documentation updated',
            'Story accepted by Product Owner'
          ],
          tasks_generated: 0,
          schema_version: '2.0.0',
          schema_mode: 'safe'
        })
      }
    ]
  }
};

// ============================================================================
// SCHEMA MIGRATION ENGINE
// ============================================================================

export class DocumentSchemaManager {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Get the current schema version for a document type
   */
  getCurrentVersion(documentType: string): string {
    const schema = DOCUMENT_SCHEMAS[documentType];
    if (!schema) {
      throw new Error(`Unknown document type: ${documentType}`);
    }
    return schema.currentVersion;
  }

  /**
   * Get the target schema version for a specific mode
   */
  getVersionForMode(documentType: string, mode: 'kanban' | 'agile' | 'safe'): string {
    const schema = DOCUMENT_SCHEMAS[documentType];
    if (!schema) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    // Find the latest version for the requested mode
    const versions = Object.values(schema.versions)
      .filter(v => v.mode === mode || (mode === 'safe' && ['kanban', 'agile', 'safe'].includes(v.mode)))
      .sort((a, b) => b.version.localeCompare(a.version));

    if (versions.length === 0) {
      throw new Error(`No schema version found for ${documentType} in ${mode} mode`);
    }

    // Return the highest version available for the mode
    if (mode === 'kanban') {
      return versions.find(v => v.mode === 'kanban')?.version || '1.0.0';
    } else if (mode === 'agile') {
      return versions.find(v => v.mode === 'agile')?.version || 
             versions.find(v => v.mode === 'kanban')?.version || '1.0.0';
    } else { // safe
      return versions[0].version; // Latest version
    }
  }

  /**
   * Check if a document needs migration
   */
  needsMigration(document: any, targetMode: 'kanban' | 'agile' | 'safe'): boolean {
    const currentVersion = document.schema_version || '1.0.0';
    const targetVersion = this.getVersionForMode(document.type || 'business_epic', targetMode);
    
    return currentVersion !== targetVersion;
  }

  /**
   * Migrate a document to the target mode
   */
  migrateDocument(document: any, targetMode: 'kanban' | 'agile' | 'safe'): any {
    const documentType = document.type || 'business_epic';
    const currentVersion = document.schema_version || '1.0.0';
    const targetVersion = this.getVersionForMode(documentType, targetMode);

    if (currentVersion === targetVersion) {
      return document; // No migration needed
    }

    const schema = DOCUMENT_SCHEMAS[documentType];
    if (!schema) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    let migratedDocument = { ...document };
    let fromVersion = currentVersion;

    // Apply migrations step by step
    while (fromVersion !== targetVersion) {
      const migration = schema.migrations.find(m => m.fromVersion === fromVersion);
      
      if (!migration) {
        this.logger.warn(`No migration path found from ${fromVersion} to ${targetVersion} for ${documentType}`);
        break;
      }

      migratedDocument = migration.migrate(migratedDocument);
      fromVersion = migration.toVersion;

      this.logger.info(`Migrated ${documentType} from ${migration.fromVersion} to ${migration.toVersion}`);

      // Safety check to prevent infinite loops
      if (fromVersion === targetVersion) {
        break;
      }
    }

    return migratedDocument;
  }

  /**
   * Validate document against schema
   */
  validateDocument(document: any, documentType: string): { isValid: boolean; errors: string[] } {
    const schema = DOCUMENT_SCHEMAS[documentType];
    if (!schema) {
      return { isValid: false, errors: [`Unknown document type: ${documentType}`] };
    }

    const version = document.schema_version || '1.0.0';
    const versionSchema = schema.versions[version];
    if (!versionSchema) {
      return { isValid: false, errors: [`Unknown schema version: ${version} for ${documentType}`] };
    }

    const errors: string[] = [];

    // Basic validation
    if (!document.id) errors.push('Document ID is required');
    if (!document.title) errors.push('Document title is required');
    if (!document.content) errors.push('Document content is required');
    if (!document.status) errors.push('Document status is required');
    if (!document.priority) errors.push('Document priority is required');

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Create new document with proper schema
   */
  createDocumentWithSchema(
    documentType: string,
    data: Partial<BaseDocumentFields>,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban'
  ): any {
    const version = this.getVersionForMode(documentType, mode);
    
    const baseDocument: BaseDocumentFields = {
      id: data.id || nanoid(),
      title: data.title || '',
      content: data.content || '',
      summary: data.summary,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      author: data.author || 'system',
      project_id: data.project_id,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      schema_version: version,
      schema_mode: mode
    };

    // Add mode-specific fields based on the schema
    return this.migrateDocument(baseDocument, mode);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const documentSchemaManager = new DocumentSchemaManager({
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`)
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  ArchitectureRunwaySchemaV1,
  ArchitectureRunwaySchemaV2,
  ArchitectureRunwaySchemaV3,
  BusinessEpicSchemaV1,
  BusinessEpicSchemaV2,
  BusinessEpicSchemaV3,
  ProgramEpicSchemaV1,
  ProgramEpicSchemaV2,
  FeatureSchemaV1,
  FeatureSchemaV2,
  StorySchemaV1,
  StorySchemaV2
};