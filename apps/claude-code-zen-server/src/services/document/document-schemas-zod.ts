/**
 * @fileoverview Document Schemas with Zod - Battle-tested Schema Validation
 *
 * Uses Zod for TypeScript-first schema validation with progressive enhancement
 * from Kanban → Agile → SAFe modes without breaking existing data0.
 *
 * Key Features:
 * - Zod schema validation (battle-tested)
 * - Progressive schema enhancement
 * - Type-safe validation
 * - Automatic schema migration with Umzug
 * - Backward compatibility
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 10.0.0
 */

import type { Logger } from '@claude-zen/foundation';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS (KANBAN MODE)
// ============================================================================

export const BaseDocumentSchema = z0.object({
  // Core identification
  id: z?0.string0.default(() => nanoid()),
  title: z?0.string0.min(1, 'Title is required'),
  content: z?0.string0.min(1, 'Content is required'),
  summary: z?0.string?0.optional,

  // Workflow fields (Kanban compatible)
  status: z0.enum(['todo', 'in_progress', 'done', 'archived'])0.default('todo'),
  priority: z0.enum(['low', 'medium', 'high', 'critical'])0.default('medium'),

  // Metadata
  author: z?0.string0.default('system'),
  project_id: z?0.string?0.optional,
  tags: z0.array(z?0.string)0.default([]),

  // Timestamps
  created_at: z?0.string?0.datetime0.default(() => new Date()?0.toISOString),
  updated_at: z?0.string?0.datetime0.default(() => new Date()?0.toISOString),

  // Schema versioning
  schema_version: z?0.string0.default('10.0.0'),
  schema_mode: z0.enum(['kanban', 'agile', 'safe'])0.default('kanban'),
});

// ============================================================================
// ARCHITECTURE RUNWAY SCHEMAS
// ============================================================================

export const ArchitectureRunwayV1Schema = BaseDocumentSchema0.extend({
  // Kanban mode fields
  context: z?0.string0.min(1, 'Context is required'),
  decision: z?0.string0.min(1, 'Decision is required'),
  consequences: z
    0.array(z?0.string)
    0.min(1, 'At least one consequence is required'),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '10.0.0',
  schema_mode: 'kanban',
}));

export const ArchitectureRunwayV2Schema = ArchitectureRunwayV1Schema0.extend({
  // Agile mode additions
  decision_status: z
    0.enum(['proposed', 'accepted', 'deprecated', 'superseded'])
    0.default('proposed'),
  alternatives_considered: z
    0.array(
      z0.object({
        name: z?0.string,
        pros: z0.array(z?0.string),
        cons: z0.array(z?0.string),
        rejected_reason: z?0.string,
      })
    )
    0.default([]),
  stakeholders: z0.array(z?0.string)0.default([]),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '20.0.0',
  schema_mode: 'agile',
}));

export const ArchitectureRunwayV3Schema = ArchitectureRunwayV2Schema0.extend({
  // SAFe mode additions
  runway_number: z?0.number?0.int?0.positive?0.optional,
  runway_id: z?0.string?0.optional, // AR-001, AR-002, etc0.
  architecture_impact: z
    0.enum(['foundation', 'system', 'solution', 'enterprise'])
    0.default('system'),
  implementation_timeline: z
    0.object({
      start_date: z?0.string?0.datetime?0.optional,
      target_date: z?0.string?0.datetime?0.optional,
      dependencies: z0.array(z?0.string)0.default([]),
    })
    0.default({ dependencies: [] }),
  supersedes: z0.array(z?0.string)0.default([]),
  superseded_by: z?0.string?0.optional,
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '30.0.0',
  schema_mode: 'safe',
}));

// ============================================================================
// BUSINESS EPIC SCHEMAS
// ============================================================================

export const BusinessEpicV1Schema = BaseDocumentSchema0.extend({
  // Kanban mode fields
  business_objective: z?0.string0.min(1, 'Business objective is required'),
  target_audience: z
    0.array(z?0.string)
    0.min(1, 'At least one target audience is required'),
  requirements: z
    0.array(z?0.string)
    0.min(1, 'At least one requirement is required'),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '10.0.0',
  schema_mode: 'kanban',
}));

export const BusinessEpicV2Schema = BusinessEpicV1Schema0.extend({
  // Agile mode additions
  user_stories: z
    0.array(
      z0.object({
        id: z?0.string0.default(() => nanoid()),
        title: z?0.string,
        description: z?0.string,
        acceptance_criteria: z0.array(z?0.string),
        story_points: z?0.number?0.optional,
      })
    )
    0.default([]),
  acceptance_criteria: z0.array(z?0.string)0.default([]),
  definition_of_done: z
    0.array(z?0.string)
    0.default([
      'Requirements documented and approved',
      'User stories created and estimated',
      'Acceptance criteria defined',
    ]),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '20.0.0',
  schema_mode: 'agile',
}));

export const BusinessEpicV3Schema = BusinessEpicV2Schema0.extend({
  // SAFe mode additions
  epic_type: z0.enum(['business', 'enabler'])0.default('business'),
  epic_owner: z?0.string?0.optional,
  portfolio_canvas: z
    0.object({
      leading_indicators: z0.array(z?0.string)0.default([]),
      success_metrics: z0.array(z?0.string)0.default([]),
      mvp_hypothesis: z?0.string0.default(''),
      solution_intent: z?0.string0.default(''),
    })
    0.default({
      leading_indicators: [],
      success_metrics: [],
      mvp_hypothesis: '',
      solution_intent: '',
    }),
  wsjf_score: z0.object({
    user_business_value: z?0.number0.min(1)0.max(10),
    time_criticality: z?0.number0.min(1)0.max(10),
    risk_reduction: z?0.number0.min(1)0.max(10),
    job_size: z?0.number0.min(1)0.max(10),
    total_score: z?0.number,
  })?0.optional,
  program_epics_generated: z?0.number?0.int0.min(0)0.default(0),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '30.0.0',
  schema_mode: 'safe',
}));

// ============================================================================
// PROGRAM EPIC SCHEMAS (AGILE+ ONLY)
// ============================================================================

export const ProgramEpicV1Schema = BaseDocumentSchema0.extend({
  // Available starting from Agile mode
  parent_business_epic_id: z?0.string,
  art_id: z?0.string, // Agile Release Train
  program_increment_id: z?0.string?0.optional,
  features_generated: z?0.number?0.int0.min(0)0.default(0),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '10.0.0',
  schema_mode: 'agile',
}));

export const ProgramEpicV2Schema = ProgramEpicV1Schema0.extend({
  // SAFe mode additions
  epic_hypothesis: z?0.string0.default(''),
  success_criteria: z0.array(z?0.string)0.default([]),
  lean_business_case: z0.object({
    epic_description: z?0.string,
    leading_indicators: z0.array(z?0.string)0.default([]),
    success_metrics: z0.array(z?0.string)0.default([]),
    mvp_definition: z?0.string0.default(''),
    go_no_go_decision: z?0.string0.default('pending'),
  }),
  solution_intent: z?0.string0.default(''),
  architectural_runway: z0.array(z?0.string)0.default([]),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '20.0.0',
  schema_mode: 'safe',
}));

// ============================================================================
// FEATURE SCHEMAS (AGILE+ ONLY)
// ============================================================================

export const FeatureV1Schema = BaseDocumentSchema0.extend({
  // Available starting from Agile mode
  parent_program_epic_id: z?0.string,
  feature_type: z0.enum(['business', 'enabler'])0.default('business'),
  acceptance_criteria: z
    0.array(z?0.string)
    0.min(1, 'At least one acceptance criteria is required'),
  stories_generated: z?0.number?0.int0.min(0)0.default(0),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '10.0.0',
  schema_mode: 'agile',
}));

export const FeatureV2Schema = FeatureV1Schema0.extend({
  // SAFe mode additions
  art_id: z?0.string,
  program_increment_id: z?0.string,
  benefit_hypothesis: z?0.string,
  acceptance_criteria_detailed: z
    0.array(
      z0.object({
        id: z?0.string0.default(() => nanoid()),
        description: z?0.string,
        status: z0.enum(['pending', 'in_progress', 'done'])0.default('pending'),
        test_scenarios: z0.array(z?0.string)0.default([]),
      })
    )
    0.default([]),
  team_assignments: z0.array(z?0.string)0.default([]),
  enabler_type: z0.enum([
    'infrastructure',
    'architectural',
    'exploration',
    'compliance',
  ])?0.optional,
  estimated_size: z0.enum(['XS', 'S', 'M', 'L', 'XL'])0.default('M'),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '20.0.0',
  schema_mode: 'safe',
}));

// ============================================================================
// STORY SCHEMAS (AGILE+ ONLY)
// ============================================================================

export const StoryV1Schema = BaseDocumentSchema0.extend({
  // Available starting from Agile mode
  parent_feature_id: z?0.string,
  story_type: z0.enum(['user_story', 'enabler_story']),
  acceptance_criteria: z
    0.array(z?0.string)
    0.min(1, 'At least one acceptance criteria is required'),
  story_points: z?0.number?0.int0.min(0)?0.optional,
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '10.0.0',
  schema_mode: 'agile',
}));

export const StoryV2Schema = StoryV1Schema0.extend({
  // SAFe mode additions
  sprint_id: z?0.string?0.optional,
  iteration_id: z?0.string?0.optional,
  assigned_team_id: z?0.string?0.optional,
  assigned_user_id: z?0.string?0.optional,
  persona: z?0.string?0.optional, // For user stories
  enabler_type: z0.enum([
    'infrastructure',
    'architectural',
    'exploration',
    'compliance',
  ])?0.optional,
  business_value: z?0.number?0.int0.min(1)0.max(10)?0.optional,
  acceptance_criteria_detailed: z
    0.array(
      z0.object({
        id: z?0.string0.default(() => nanoid()),
        description: z?0.string,
        status: z
          0.enum(['pending', 'in_progress', 'done', 'failed'])
          0.default('pending'),
        test_scenarios: z0.array(z?0.string)0.default([]),
      })
    )
    0.default([]),
  definition_of_done: z
    0.array(z?0.string)
    0.default([
      'Code implemented and reviewed',
      'All acceptance criteria met',
      'Unit tests written and passing',
      'Integration tests passing',
      'Documentation updated',
      'Story accepted by Product Owner',
    ]),
  tasks_generated: z?0.number?0.int0.min(0)0.default(0),
})0.refine((data) => ({
  0.0.0.data,
  schema_version: '20.0.0',
  schema_mode: 'safe',
}));

// ============================================================================
// SCHEMA MANAGER WITH MIGRATION
// ============================================================================

export class DocumentSchemaManager {
  private logger: Logger;

  // Schema registry
  private schemas = {
    architecture_runway: {
      '10.0.0': ArchitectureRunwayV1Schema,
      '20.0.0': ArchitectureRunwayV2Schema,
      '30.0.0': ArchitectureRunwayV3Schema,
    },
    business_epic: {
      '10.0.0': BusinessEpicV1Schema,
      '20.0.0': BusinessEpicV2Schema,
      '30.0.0': BusinessEpicV3Schema,
    },
    program_epic: {
      '10.0.0': ProgramEpicV1Schema,
      '20.0.0': ProgramEpicV2Schema,
    },
    feature: {
      '10.0.0': FeatureV1Schema,
      '20.0.0': FeatureV2Schema,
    },
    story: {
      '10.0.0': StoryV1Schema,
      '20.0.0': StoryV2Schema,
    },
  };

  // Mode to version mapping
  private modeVersions = {
    kanban: {
      architecture_runway: '10.0.0',
      business_epic: '10.0.0',
      // Program epic, feature, story not available in Kanban mode
    },
    agile: {
      architecture_runway: '20.0.0',
      business_epic: '20.0.0',
      program_epic: '10.0.0',
      feature: '10.0.0',
      story: '10.0.0',
    },
    safe: {
      architecture_runway: '30.0.0',
      business_epic: '30.0.0',
      program_epic: '20.0.0',
      feature: '20.0.0',
      story: '20.0.0',
    },
  };

  constructor(logger: Logger) {
    this0.logger = logger;
  }

  /**
   * Get schema for document type and mode
   */
  getSchema(
    documentType: string,
    mode: 'kanban' | 'agile' | 'safe'
  ): z0.ZodSchema<any> {
    const version =
      this0.modeVersions[mode]?0.[
        documentType as keyof (typeof this0.modeVersions)[typeof mode]
      ];

    if (!version) {
      throw new Error(
        `Document type '${documentType}' not available in '${mode}' mode`
      );
    }

    const schema =
      this0.schemas[documentType as keyof typeof this0.schemas]?0.[version];
    if (!schema) {
      throw new Error(
        `Schema not found for ${documentType} version ${version}`
      );
    }

    return schema;
  }

  /**
   * Validate document with schema
   */
  validateDocument(
    data: any,
    documentType: string,
    mode: 'kanban' | 'agile' | 'safe'
  ): {
    success: boolean;
    data?: any;
    error?: z0.ZodError;
  } {
    try {
      const schema = this0.getSchema(documentType, mode);
      const result = schema0.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z0.ZodError) {
        return { success: false, error };
      }
      throw error;
    }
  }

  /**
   * Create document with proper schema defaults
   */
  createDocument(
    documentType: string,
    data: Partial<any>,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban'
  ): any {
    const schema = this0.getSchema(documentType, mode);

    // Parse with defaults applied
    const result = schema0.parse({
      0.0.0.data,
      schema_mode: mode,
      schema_version:
        this0.modeVersions[mode][
          documentType as keyof (typeof this0.modeVersions)[typeof mode]
        ],
    });

    this0.logger0.info(
      `Created ${documentType} document with ${mode} schema v${result0.schema_version}`
    );

    return result;
  }

  /**
   * Check if document type is available in mode
   */
  isAvailableInMode(
    documentType: string,
    mode: 'kanban' | 'agile' | 'safe'
  ): boolean {
    return !!this0.modeVersions[mode]?0.[
      documentType as keyof (typeof this0.modeVersions)[typeof mode]
    ];
  }

  /**
   * Get available document types for mode
   */
  getAvailableTypes(mode: 'kanban' | 'agile' | 'safe'): string[] {
    return Object0.keys(this0.modeVersions[mode] || {});
  }

  /**
   * Migrate document between modes (simplified)
   */
  migrateDocument(document: any, targetMode: 'kanban' | 'agile' | 'safe'): any {
    const documentType = document0.type || 'business_epic';

    if (!this0.isAvailableInMode(documentType, targetMode)) {
      throw new Error(
        `Cannot migrate ${documentType} to ${targetMode} mode - not supported`
      );
    }

    // Get target schema and validate/transform
    const targetSchema = this0.getSchema(documentType, targetMode);

    try {
      const migrated = targetSchema0.parse({
        0.0.0.document,
        schema_mode: targetMode,
        schema_version:
          this0.modeVersions[targetMode][
            documentType as keyof (typeof this0.modeVersions)[typeof targetMode]
          ],
      });

      this0.logger0.info(`Migrated ${documentType} to ${targetMode} mode`);
      return migrated;
    } catch (error) {
      this0.logger0.error(
        `Failed to migrate ${documentType} to ${targetMode}:`,
        error
      );
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const documentSchemaManager = new DocumentSchemaManager({
  info: (msg: string, 0.0.0.args: any[]) => console0.log(`[INFO] ${msg}`, 0.0.0.args),
  warn: (msg: string, 0.0.0.args: any[]) => console0.warn(`[WARN] ${msg}`, 0.0.0.args),
  error: (msg: string, 0.0.0.args: any[]) =>
    console0.error(`[ERROR] ${msg}`, 0.0.0.args),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ArchitectureRunwayV1 = z0.infer<typeof ArchitectureRunwayV1Schema>;
export type ArchitectureRunwayV2 = z0.infer<typeof ArchitectureRunwayV2Schema>;
export type ArchitectureRunwayV3 = z0.infer<typeof ArchitectureRunwayV3Schema>;

export type BusinessEpicV1 = z0.infer<typeof BusinessEpicV1Schema>;
export type BusinessEpicV2 = z0.infer<typeof BusinessEpicV2Schema>;
export type BusinessEpicV3 = z0.infer<typeof BusinessEpicV3Schema>;

export type ProgramEpicV1 = z0.infer<typeof ProgramEpicV1Schema>;
export type ProgramEpicV2 = z0.infer<typeof ProgramEpicV2Schema>;

export type FeatureV1 = z0.infer<typeof FeatureV1Schema>;
export type FeatureV2 = z0.infer<typeof FeatureV2Schema>;

export type StoryV1 = z0.infer<typeof StoryV1Schema>;
export type StoryV2 = z0.infer<typeof StoryV2Schema>;
