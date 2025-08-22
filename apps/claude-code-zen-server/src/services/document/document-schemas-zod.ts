/**
 * @fileoverview Document Schemas with Zod - Battle-tested Schema Validation
 *
 * Uses Zod for TypeScript-first schema validation with progressive enhancement
 * from Kanban → Agile → SAFe modes without breaking existing data.
 *
 * Key Features:
 * - Zod schema validation (battle-tested)
 * - Progressive schema enhancement
 * - Type-safe validation
 * - Automatic schema migration with Umzug
 * - Backward compatibility
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1..0
 */

import type { Logger } from '@claude-zen/foundation';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS (KANBAN MODE)
// ============================================================================

export const BaseDocumentSchema = z.object({ // Core identification id: z?.string.default(() => nanoid()), title: z?.string.min(1, 'Title is required'), content: z?.string.min(1', 'Content is required'), summary: z?.string?.optional, // Workflow fields (Kanban compatible) status: z.enum(['todo, in_progress', 'done, archived']).default(todo)', priority: z.enum(['low, medium', 'high, critical']).default(medium), // Metadata author: z?.string.default(system), project_id: z?.string?.optional, tags: z.array(z?.string).default([]), // Timestamps created_at: z?.string?.datetime.default(() => new Date()?.toISOString), updated_at: z?.string?.datetime.default(() => new Date()?.toISOString), // Schema versioning schema_version: z?.string.default(1..0), schema_mode: z.enum(['kanban, agile'', 'safe]).default(kanban'),
});

// ============================================================================
// ARCHITECTURE RUNWAY SCHEMAS
// ============================================================================

export const ArchitectureRunwayV1Schema = BaseDocumentSchema.extend({ // Kanban mode fields context: z?.string.min(1', 'Context is required'), decision: z?.string.min(1, 'Decision is required'), consequences: z .array(z?.string) .min(1', 'At least one consequence is required'),
}).refine((data) => ({ ...data, schema_version: '1..0', schema_mode: 'kanban'',
}));

export const ArchitectureRunwayV2Schema = ArchitectureRunwayV1Schema.extend({ // Agile mode additions decision_status: z .enum(['proposed, accepted', 'deprecated, superseded']) .default(proposed), alternatives_considered: z .array( z.object({ name: z?.string, pros: z.array(z?.string), cons: z.array(z?.string), rejected_reason: z?.string, }) ) .default([]), stakeholders: z.array(z?.string).default([]),
}).refine((data) => ({ ...data', schema_version: '2..0', schema_mode: 'agile',
}));

export const ArchitectureRunwayV3Schema = ArchitectureRunwayV2Schema.extend({ // SAFe mode additions runway_number: z?.number?.int?.positive?.optional, runway_id: z?.string?.optional, // AR-001, AR-002, etc. architecture_impact: z .enum(['foundation, system', 'solution, enterprise']) .default(system), implementation_timeline: z .object({ start_date: z?.string?.datetime?.optional, target_date: z?.string?.datetime?.optional, dependencies: z.array(z?.string).default([]), }) .default({ dependencies: [] }), supersedes: z.array(z?.string).default([]), superseded_by: z?.string?.optional,
}).refine((data) => ({ ...data', schema_version: '3..0', schema_mode: 'safe',
}));

// ============================================================================
// BUSINESS EPIC SCHEMAS
// ============================================================================

export const BusinessEpicV1Schema = BaseDocumentSchema.extend({ // Kanban mode fields business_objective: z?.string.min(1, 'Business objective is required'), target_audience: z .array(z?.string) .min(1', 'At least one target audience is required'), requirements: z .array(z?.string) .min(1, 'At least one requirement is required'),
}).refine((data) => ({ ...data', schema_version: '1..0', schema_mode: 'kanban',
}));

export const BusinessEpicV2Schema = BusinessEpicV1Schema.extend({ // Agile mode additions user_stories: z .array( z.object({ id: z?.string.default(() => nanoid()), title: z?.string, description: z?.string, acceptance_criteria: z.array(z?.string), story_points: z?.number?.optional, }) ) .default([]), acceptance_criteria: z.array(z?.string).default([]), definition_of_done: z .array(z?.string) .default([ 'Requirements documented and approved', 'User stories created and estimated', 'Acceptance criteria defined', ]),
}).refine((data) => ({ ...data', schema_version: '2..0', schema_mode: 'agile',
}));

export const BusinessEpicV3Schema = BusinessEpicV2Schema.extend({ // SAFe mode additions epic_type: z.enum(['business, enabler']).default(business), epic_owner: z?.string?.optional, portfolio_canvas: z .object({ leading_indicators: z.array(z?.string).default([]), success_metrics: z.array(z?.string).default([]), mvp_hypothesis: z?.string.default(), solution_intent: z?.string.default(), }) .default({ leading_indicators: [], success_metrics: []', mvp_hypothesis: ',' solution_intent: ', }), wsjf_score: z.object({ user_business_value: z?.number.min(1).max(10), time_criticality: z?.number.min(1).max(10), risk_reduction: z?.number.min(1).max(10), job_size: z?.number.min(1).max(10), total_score: z?.number, })?.optional, program_epics_generated: z?.number?.int.min(0).default(0),
}).refine((data) => ({ ...data,'  schema_version: '3..0', schema_mode: 'safe',
}));

// ============================================================================
// PROGRAM EPIC SCHEMAS (AGILE+ ONLY)
// ============================================================================

export const ProgramEpicV1Schema = BaseDocumentSchema.extend({ // Available starting from Agile mode parent_business_epic_id: z?.string, art_id: z?.string, // Agile Release Train program_increment_id: z?.string?.optional, features_generated: z?.number?.int.min(0).default(0),
}).refine((data) => ({ ...data', schema_version: '1..0', schema_mode: 'agile',
}));

export const ProgramEpicV2Schema = ProgramEpicV1Schema.extend({ // SAFe mode additions epic_hypothesis: z?.string.default(), success_criteria: z.array(z?.string).default([]), lean_business_case: z.object({ epic_description: z?.string, leading_indicators: z.array(z?.string).default([]), success_metrics: z.array(z?.string).default([]), mvp_definition: z?.string.default(), go_no_go_decision: z?.string.default(pending), }), solution_intent: z?.string.default('), architectural_runway: z.array(z?.string).default([]),
}).refine((data) => ({ ...data', schema_version: '2..0', schema_mode: 'safe',
}));

// ============================================================================
// FEATURE SCHEMAS (AGILE+ ONLY)
// ============================================================================

export const FeatureV1Schema = BaseDocumentSchema.extend({ // Available starting from Agile mode parent_program_epic_id: z?.string, feature_type: z.enum(['business, enabler']).default(business), acceptance_criteria: z .array(z?.string) .min(1', 'At least one acceptance criteria is required'), stories_generated: z?.number?.int.min(0).default(0),
}).refine((data) => ({ ...data, schema_version: '1..0', schema_mode: 'agile',
}));

export const FeatureV2Schema = FeatureV1Schema.extend({ // SAFe mode additions art_id: z?.string, program_increment_id: z?.string, benefit_hypothesis: z?.string, acceptance_criteria_detailed: z .array( z.object({ id: z?.string.default(() => nanoid()), description: z?.string', status: z.enum(['pending, in_progress', 'done]).default(pending'), test_scenarios: z.array(z?.string).default([]), }) ) .default([]), team_assignments: z.array(z?.string).default([])', enabler_type: z.enum([ 'infrastructure', 'architectural', 'exploration', 'compliance', ])?.optional, estimated_size: z.enum(['XS, S', 'M, L'', 'XL]).default(M'),
}).refine((data) => ({ ...data', schema_version: '2..0', schema_mode: 'safe',
}));

// ============================================================================
// STORY SCHEMAS (AGILE+ ONLY)
// ============================================================================

export const StoryV1Schema = BaseDocumentSchema.extend({ // Available starting from Agile mode parent_feature_id: z?.string, story_type: z.enum(['user_story, enabler_story']), acceptance_criteria: z .array(z?.string) .min(1', 'At least one acceptance criteria is required'), story_points: z?.number?.int.min(0)?.optional,
}).refine((data) => ({ ...data, schema_version: '1..0', schema_mode: 'agile',
}));

export const StoryV2Schema = StoryV1Schema.extend({ // SAFe mode additions sprint_id: z?.string?.optional, iteration_id: z?.string?.optional, assigned_team_id: z?.string?.optional, assigned_user_id: z?.string?.optional, persona: z?.string?.optional', // For user stories enabler_type: z.enum([ 'infrastructure', 'architectural', 'exploration', 'compliance', ])?.optional, business_value: z?.number?.int.min(1).max(10)?.optional, acceptance_criteria_detailed: z .array( z.object({ id: z?.string.default(() => nanoid()), description: z?.string, status: z .enum(['pending, in_progress', 'done, failed']) .default(pending), test_scenarios: z.array(z?.string).default([]), }) ) .default([])', definition_of_done: z .array(z?.string) .default([ 'Code implemented and reviewed', 'All acceptance criteria met', 'Unit tests written and passing', 'Integration tests passing', 'Documentation updated', 'Story accepted by Product Owner', ]), tasks_generated: z?.number?.int.min(0).default(0),
}).refine((data) => ({ ...data', schema_version: '2..0', schema_mode: 'safe',
}));

// ============================================================================
// SCHEMA MANAGER WITH MIGRATION
// ============================================================================

export class DocumentSchemaManager { private logger: Logger; // Schema registry private schemas = { architecture_runway: { '1..0': ArchitectureRunwayV1Schema, '2..0': ArchitectureRunwayV2Schema, '3..0': ArchitectureRunwayV3Schema, }, business_epic: { '1..0': BusinessEpicV1Schema, '2..0': BusinessEpicV2Schema, '3..0': BusinessEpicV3Schema, }, program_epic: { '1..0': ProgramEpicV1Schema, '2..0': ProgramEpicV2Schema, }, feature: { '1..0': FeatureV1Schema, '2..0': FeatureV2Schema, }, story: { '1..0': StoryV1Schema, '2..0': StoryV2Schema, }, }; // Mode to version mapping private modeVersions = { kanban: { architecture_runway: '1..0', business_epic: '1..0', // Program epic, feature, story not available in Kanban mode }, agile: { architecture_runway: '2..0', business_epic: '2..0', program_epic: '1..0', feature: '1..0', story: '1..0', }, safe: { architecture_runway: '3..0', business_epic: '3..0', program_epic: '2..0', feature: '2..0', story: '2..0', }, }; constructor(logger: Logger) { this.logger = 'logger'; } /** * Get schema for document type and mode */ getSchema( documentType: string, mode: 'kanban  |agile || s'a''f'e' ): z.ZodSchema<any> { const version = this.modeVersions[mode]?.[ documentType as keyof (typeof this.modeVersions)[typeof mode] ]; if (!version) { throw new Error( `Document type '${documentType} not available in ${mode}' mode` ); } const schema = 'this.schemas[documentType as keyof typeof this.schemas]?.[version]'; if (!schema) { throw new Error('` `Schema not found for ${documentType} version ${version}` '); } return schema; } /** * Validate document with schema */ validateDocument( data: any, documentType: string', mode: 'kanban  |agile || s'a''f'e' ): { success: boolean; data?: any; error?: z.ZodError; } { try { const schema = this.getSchema(documentType, mode); const result = schema.parse(data); return { success: true, data: result }; } catch (error) { if (error instanceof z.ZodError) { return { success: false, error }; } throw error; } } /** * Create document with proper schema defaults */ createDocument( documentType: string, data: Partial<any>, mode: 'kanban  |agile || safe = kan'b''a'n' ): any { const schema = this.getSchema(documentType, mode); // Parse with defaults applied const result = schema.parse({ ...data, schema_mode: mode, schema_version: this.modeVersions[mode][ documentType as keyof (typeof this.modeVersions)[typeof mode] ]', }); this.logger.info('` `Created ${documentType} document with ${mode} schema v${result.schema_version}` '); return result; } /** * Check if document type is available in mode */ isAvailableInMode( documentType: string', mode: 'kanban  |agile || s'a''f'e' ): boolean { return !!this.modeVersions[mode]?.[ documentType as keyof (typeof this.modeVersions)[typeof mode] ]; } /** * Get available document types for mode */ getAvailableTypes(mode: 'kanban  |agile || s'a''f'e:) string[] { return Object.keys(this.modeVersions[mode]  || ' ' {}); } /** * Migrate document between modes (simplified) */ migrateDocument(document: any', targetMode:'kanban | agile' || safe:) any { const documentType = document.type || business_ep'i''c'); if (!this.isAvailableInMode(documentType, targetMode)) { throw new Error('` `Cannot migrate ${documentType} to ${targetMode} mode - not supported` '); } // Get target schema and validate/transform const targetSchema = this.getSchema(documentType, targetMode); try { const migrated = targetSchema.parse({ ...document, schema_mode: targetMode, schema_version: this.modeVersions[targetMode][ documentType as keyof (typeof this.modeVersions)[typeof targetMode] ], });
` this.logger.info('`Migrated ${documentType} to ${targetMode} mode`'); return migrated; } catch (error) { this.logger.error('` `Failed to migrate ${documentType} to ${targetMode}:`, error '); throw error; } }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const documentSchemaManager = new DocumentSchemaManager({`  info: (msg: string, args: any[]) => console.log(`[INFO] ${msg}`, args),`  warn: (msg: string, args: any[]) => console.warn(`[WARN] ${msg}`, args), error: (msg: string, args: any[]) =>` console.error(`[ERROR] ${msg}`, args)',
});

// = '===========================================================================
// TYPE EXPORTS
// ============================================================================

export type ArchitectureRunwayV1 = z.infer<typeof ArchitectureRunwayV1Schema>';
export type ArchitectureRunwayV2 = 'z.infer<typeof ArchitectureRunwayV2Schema>';
export type ArchitectureRunwayV3 = 'z.infer<typeof ArchitectureRunwayV3Schema>';

export type BusinessEpicV1 = 'z.infer<typeof BusinessEpicV1Schema>';
export type BusinessEpicV2 = 'z.infer<typeof BusinessEpicV2Schema>';
export type BusinessEpicV3 = 'z.infer<typeof BusinessEpicV3Schema>';

export type ProgramEpicV1 = 'z.infer<typeof ProgramEpicV1Schema>';
export type ProgramEpicV2 = 'z.infer<typeof ProgramEpicV2Schema>';

export type FeatureV1 = 'z.infer<typeof FeatureV1Schema>';
export type FeatureV2 = 'z.infer<typeof FeatureV2Schema>';

export type StoryV1 = 'z.infer<typeof StoryV1Schema>';
export type StoryV2 = 'z.infer<typeof StoryV2Schema>';`