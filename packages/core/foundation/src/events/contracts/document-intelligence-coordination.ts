/**
 * @fileoverview Document Intelligence ↔ Coordination Event Contracts (moved into foundation)
 */

import type { BaseEvent } from '../event-catalog.js';

export interface DocumentIntelligenceImportCompleteEvent extends BaseEvent {
  workflowId: string;
  importWorkflowType: 'external-vision-import' | 'external-prd-import' | 'content-extraction' | 'integration-preparation';
  documentId: string;
  externalDocument: { sourceType: 'external-upload' | 'external-url' | 'external-email' | 'external-api'; originalTitle: string; originalFormat: string; content: string; importMetadata: Record<string, unknown> };
  importedArtifacts: Array<{ type: 'imported-requirements' | 'feature-enhancement' | 'analysis-report' | 'integration-spec'; title: string; content: string; integrationTarget: 'existing-epic' | 'existing-feature' | 'new-feature' | 'analysis-input'; targetProjectId: string; extractedValue: string; metadata: Record<string, unknown> }>;
  importMetrics: { importTime: number; extractionConfidence: number; integrationReadinessScore: number; aiTokensUsed: number };
  targetIntegrationPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  nextIntegrationActions: string[];
}

export interface DocumentIntelligenceImportIntegrationReadyEvent extends BaseEvent {
  importId: string;
  sourceDocumentId: string;
  targetProjectId: string;
  integrationData: { targetArtifactId: string; targetArtifactType: 'epic' | 'feature' | 'story'; integrationMethod: 'enhancement' | 'extension' | 'validation' | 'reference'; extractedContent: string; businessValueAlignment: string; suggestedIntegrationPoints: Array<{ section: string; content: string; integrationMethod: 'merge' | 'append' | 'replace' | 'reference' }>; dependencies: string[]; constraints: string[] };
  integrationMetadata: { targetPortfolioId: string; targetProgramId: string; targetPiId: string; integrationComplexity: 'simple' | 'moderate' | 'complex'; estimatedIntegrationEffort: number; businessImpact: 'low' | 'medium' | 'high' | 'critical' };
  integrationCompliance: { targetPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion'; qualityGates: Record<string, boolean>; integrationArtifacts: string[] };
  integrationApprovalRequired: boolean;
}

export interface DocumentIntelligenceImportErrorEscalatedEvent extends BaseEvent {
  workflowId: string;
  documentId: string;
  importErrorType: 'import-failure' | 'format-unsupported' | 'integration-validation-failed' | 'timeout' | 'resource-exhaustion';
  errorDetails: { message: string; stack?: string; context: Record<string, unknown>; retryAttempts: number; lastRetryAt: string };
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
  escalationTo: 'coordination' | 'project-owner' | 'human-review';
  importImpact: { affectedImports: string[]; delayedIntegrations: string[]; impactedProjects: string[]; stakeholdersToNotify: string[] };
}

export interface CoordinationImportApprovedEvent extends BaseEvent {
  documentId: string;
  importWorkflowType: 'external-vision-import' | 'external-prd-import' | 'content-extraction' | 'integration-preparation';
  importApprovalId: string;
  approvedBy: string;
  targetProjectId: string;
  importParameters: { priority: 'low' | 'medium' | 'high' | 'critical'; extractionQuality: 'basic' | 'standard' | 'premium'; aiAssistanceLevel: 'minimal' | 'standard' | 'advanced'; integrationValidation: boolean; projectImpactAssessment: boolean };
  importResourceAllocation: { maxImportTime: number; aiTokenBudget: number; humanReviewRequired: boolean; integrationReviewRequired: boolean; computePriority: number };
  importConstraints: { integrationDeadlines: Array<{ milestone: string; deadline: string }>; qualityGates: Record<string, unknown>; projectAlignmentRequirements: string[] };
}

export interface CoordinationImportWorkflowAssignedEvent extends BaseEvent {
  importWorkflowId: string;
  documentId: string;
  importWorkflowType: 'external-vision-import' | 'external-prd-import' | 'content-extraction' | 'integration-preparation';
  importAssignmentDetails: { assignedTo: 'document-intelligence-service'; priority: 'low' | 'medium' | 'high' | 'critical'; integrationDeadline: string; dependencies: string[] };
  targetProjectContext: { projectId: string; currentPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion'; existingSafeStructure: { portfolioId: string; programId: string; piId: string; existingEpics: string[] }; projectStakeholders: string[] };
  importQualityRequirements: { minimumExtractionConfidence: number; requiredIntegrationArtifacts: string[]; integrationValidationCriteria: Record<string, unknown>; projectAlignmentThreshold: number };
}

export interface CoordinationImportContextProvidedEvent extends BaseEvent {
  documentId: string;
  importWorkflowId: string;
  targetProjectId: string;
  contextType: 'project-business' | 'project-technical' | 'integration-stakeholder' | 'import-historical';
  additionalContext: {
    businessContext?: { industry: string; businessModel: string; competitiveAdvantages: string[]; marketRequirements: string[] };
    technicalContext?: { existingArchitecture: string; technologyStack: string[]; technicalConstraints: string[]; performanceRequirements: Record<string, unknown> };
    stakeholderContext?: { primaryStakeholders: string[]; decisionMakers: string[]; influencers: string[]; communicationPreferences: Record<string, string> };
    historicalContext?: { previousSimilarProjects: string[]; lessonsLearned: string[]; successPatterns: string[]; avoidancePatterns: string[] };
  };
  integrationContextPriority: 'informational' | 'recommended' | 'required';
}

export const DOCUMENT_IMPORT_COORDINATION_EVENT_CATALOG = {
  'document-intelligence:coordination:import-complete': 'DocumentIntelligenceImportCompleteEvent',
  'document-intelligence:coordination:integration-ready': 'DocumentIntelligenceImportIntegrationReadyEvent',
  'document-intelligence:coordination:import-error-escalated': 'DocumentIntelligenceImportErrorEscalatedEvent',
  'coordination:document-intelligence:import-approved': 'CoordinationImportApprovedEvent',
  'coordination:document-intelligence:import-workflow-assigned': 'CoordinationImportWorkflowAssignedEvent',
  'coordination:document-intelligence:import-context-provided': 'CoordinationImportContextProvidedEvent',
} as const;

export type DocumentImportCoordinationEventName = keyof typeof DOCUMENT_IMPORT_COORDINATION_EVENT_CATALOG;

export interface DocumentImportCoordinationEventMap {
  'document-intelligence:coordination:import-complete': DocumentIntelligenceImportCompleteEvent;
  'document-intelligence:coordination:integration-ready': DocumentIntelligenceImportIntegrationReadyEvent;
  'document-intelligence:coordination:import-error-escalated': DocumentIntelligenceImportErrorEscalatedEvent;
  'coordination:document-intelligence:import-approved': CoordinationImportApprovedEvent;
  'coordination:document-intelligence:import-workflow-assigned': CoordinationImportWorkflowAssignedEvent;
  'coordination:document-intelligence:import-context-provided': CoordinationImportContextProvidedEvent;
}
