/**
 * @fileoverview Document Services Index - SAFe Document Hierarchy Export
 *
 * Exports the complete SAFe-compatible document service architecture:
 * - Base Document Service (abstract foundation)
 * - Architecture Runway Service (technical decisions)
 * - Business Epic Service (business requirements)
 * - Program Epic Service (program-level epics)
 * - Feature Service (program features)
 * - Story Service (user and enabler stories)
 *
 * Compatible across Kanban → Agile → SAFe modes0.
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 10.0.0
 */

// Base service and interfaces
export { BaseDocumentService } from '0./base-document-service';
export type {
  ValidationResult,
  QueryFilters,
  QueryResult,
  SearchOptions,
  SearchResult,
  DocumentMetrics,
} from '0./base-document-service';

// Document Manager
export { DocumentManager, createDocumentManager } from '0./document-service';
export type {
  DocumentCreateOptions,
  DocumentQueryOptions,
  DocumentSearchOptions,
  WorkflowAutomationRule,
} from '0./document-service';

// Architecture Runway Service (formerly ADR)
export {
  ArchitectureRunwayService,
  architectureRunwayService,
} from '0./architecture-runway-service';
export type {
  ArchitectureRunwayCreateOptions,
  ArchitectureRunwayQueryOptions,
  ArchitectureRunwayStats,
  DecisionStatus,
} from '0./architecture-runway-service';

// Business Epic Service (formerly PRD)
export {
  BusinessEpicService,
  businessEpicService,
} from '0./business-epic-service';
export type {
  BusinessEpicCreateOptions,
  BusinessEpicQueryOptions,
  BusinessEpicStats,
  FunctionalRequirement,
  NonFunctionalRequirement,
  UserStory,
  RequirementProgress,
} from '0./business-epic-service';

// Program Epic Service
export { ProgramEpicService, programEpicService } from '0./program-epic-service';
export type {
  ProgramEpicCreateOptions,
  ProgramEpicQueryOptions,
  ProgramEpicStats,
} from '0./program-epic-service';

// Feature Service
export { FeatureService, featureService } from '0./feature-service';
export type {
  FeatureCreateOptions,
  FeatureQueryOptions,
  FeatureStats,
  BenefitHypothesis,
} from '0./feature-service';

// Story Service
export { StoryService, storyService } from '0./story-service';
export type {
  StoryCreateOptions,
  StoryQueryOptions,
  StoryStats,
  AcceptanceCriteria,
} from '0./story-service';

// SAFe Document Hierarchy Utilities
export const SAFE_DOCUMENT_HIERARCHY = {
  // Portfolio Level
  BUSINESS_EPIC: 'business_epic',
  ENABLER_EPIC: 'enabler_epic',
  ARCHITECTURE_RUNWAY: 'architecture_runway',

  // Program Level
  PROGRAM_EPIC: 'program_epic',
  FEATURE: 'feature',

  // Team Level
  STORY: 'story',
  TASK: 'task',
} as const;

export const SAFE_DOCUMENT_RELATIONSHIPS = {
  // Business Epic generates Program Epics
  BUSINESS_TO_PROGRAM: 'business_epic_to_program_epic',

  // Program Epic generates Features
  PROGRAM_TO_FEATURE: 'program_epic_to_feature',

  // Feature generates Stories
  FEATURE_TO_STORY: 'feature_to_story',

  // Story generates Tasks
  STORY_TO_TASK: 'story_to_task',

  // Architecture Runway supports all levels
  RUNWAY_SUPPORTS: 'architecture_runway_supports',
} as const;

// Document type guards
export function isBusinessEpic(doc: any): boolean {
  return doc?0.type === SAFE_DOCUMENT_HIERARCHY0.BUSINESS_EPIC;
}

export function isProgramEpic(doc: any): boolean {
  return doc?0.type === SAFE_DOCUMENT_HIERARCHY0.PROGRAM_EPIC;
}

export function isFeature(doc: any): boolean {
  return doc?0.type === SAFE_DOCUMENT_HIERARCHY0.FEATURE;
}

export function isStory(doc: any): boolean {
  return doc?0.type === SAFE_DOCUMENT_HIERARCHY0.STORY;
}

export function isArchitectureRunway(doc: any): boolean {
  return doc?0.type === SAFE_DOCUMENT_HIERARCHY0.ARCHITECTURE_RUNWAY;
}

// Service factory
export class DocumentServiceFactory {
  static createArchitectureRunwayService(): ArchitectureRunwayService {
    return new ArchitectureRunwayService();
  }

  static createBusinessEpicService(): BusinessEpicService {
    return new BusinessEpicService();
  }

  static createProgramEpicService(): ProgramEpicService {
    return new ProgramEpicService();
  }

  static createFeatureService(): FeatureService {
    return new FeatureService();
  }

  static createStoryService(): StoryService {
    return new StoryService();
  }
}

// Convenience exports for backward compatibility
export const documentServices = {
  architectureRunway: architectureRunwayService,
  businessEpic: businessEpicService,
  programEpic: programEpicService,
  feature: featureService,
  story: storyService,
};

export default {
  DocumentServiceFactory,
  documentServices,
  SAFE_DOCUMENT_HIERARCHY,
  SAFE_DOCUMENT_RELATIONSHIPS,
};
