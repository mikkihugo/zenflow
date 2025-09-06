/**
 * @fileoverview Brain ↔ Document Intelligence Event Contracts (moved into foundation)
 */

import type { BaseEvent } from '../event-catalog.js';

export interface BrainDocumentImportRequestEvent extends BaseEvent {
  documentData: { id?: string; type: string; title: string; content: string; metadata?: Record<string, unknown> };
  importType: 'external-vision' | 'external-prd' | 'external-requirements' | 'content-analysis' | 'format-conversion';
  importContext: {
    importId: string;
    sourceType: 'upload' | 'url' | 'email' | 'api';
    targetProjectId: string;
    importApprovalId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  targetSafeProject: {
    portfolioId: string;
    programId: string;
    piId?: string;
    existingEpicId?: string;
    integrationPoint: 'new-feature' | 'epic-enhancement' | 'requirement-addition' | 'analysis-input';
  };
  importConstraints: {
    maxImportTime: number;
    qualityThreshold: number;
    aiTokenBudget: number;
    requiresImportApproval: boolean;
    preserveOriginalFormat: boolean;
  };
}

export interface BrainDocumentImportWorkflowRequestEvent extends BaseEvent {
  workflowName: 'external-document-import' | 'format-conversion' | 'content-extraction' | 'integration-preparation';
  importContext: { documentSource: 'external'; importId: string; targetProjectId: string; workflowId: string; priority: 'low' | 'medium' | 'high' | 'critical' };
  integrationReadiness: { targetPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion'; existingArtifacts: string[]; integrationMethod: 'merge' | 'append' | 'reference' | 'analysis' };
}

export interface DocumentImportResultEvent extends BaseEvent {
  documentId: string;
  importResult: {
    success: boolean;
    originalDocument: { id: string; sourceType: 'external'; title: string; format: string };
    importedArtifacts: Array<{ id: string; type: 'feature' | 'requirement' | 'analysis' | 'reference'; title: string; content: string; integrationReady: boolean; targetProjectId: string; metadata: Record<string, unknown> }>;
    integrationWorkflowsTriggered: string[];
    error?: string;
  };
  integrationNotifications: { notifyProjectOwner: boolean; integrationArtifactsReady: boolean; importApprovalRequired: boolean; manualReviewRequired: boolean; nextIntegrationSteps: string[] };
  importMetrics: { importTime: number; extractionConfidence: number; integrationReadinessScore: number; aiTokensUsed: number; humanReviewRequired: boolean; preservedOriginalContent: boolean };
}

export interface DocumentImportWorkflowResultEvent extends BaseEvent {
  workflowName: 'external-document-import' | 'format-conversion' | 'content-extraction' | 'integration-preparation';
  importWorkflowResult: {
    success: boolean;
    importId: string;
    targetProjectId: string;
    integrationSteps: Array<{ stepType: 'extract' | 'transform' | 'validate' | 'prepare-integration'; success: boolean; output?: unknown; integrationReady: boolean; error?: string }>;
    error?: string;
  };
  integrationImpact: { triggersProjectUpdate: boolean; affectedSafeArtifacts: string[]; integrationPoint: { targetPhase: string; integrationMethod: 'merge' | 'append' | 'reference'; approvalRequired: boolean }; stakeholdersToNotify: string[] };
}

export interface BrainExternalContentAnalysisRequestEvent extends BaseEvent {
  externalContent: string;
  sourceFormat: string;
  targetProjectId: string;
  importContext: { importId: string; integrationIntent: 'requirement-extraction' | 'feature-analysis' | 'reference-material' };
}

export interface BrainIntegrationExtractionRequestEvent extends BaseEvent {
  externalDocument: string;
  sourceType: 'vision' | 'prd' | 'requirements' | 'specification';
  targetProjectId: string;
  integrationContext: { importId: string; targetSafeArtifacts: string[]; extractionGoal: 'enhance-existing' | 'add-features' | 'validate-requirements' };
}

export interface BrainGetImportWorkflowsRequestEvent extends BaseEvent {
  importContext: { requestedBy: string; targetProjectType: 'safe-portfolio' | 'safe-program' | 'safe-team'; documentTypes: string[] };
}

export interface ExternalContentAnalysisResultEvent extends BaseEvent {
  externalAnalysis: {
    sourceType: string;
    extractedElements: string[];
    integrationComplexity: 'simple' | 'moderate' | 'complex';
    recommendedIntegrationMethod: 'direct' | 'transformation' | 'manual-review';
    detectedArtifacts: Array<{ type: 'requirement' | 'feature' | 'constraint' | 'assumption'; content: string; confidence: number }>;
  };
  integrationRecommendations: string[];
}

export interface IntegrationExtractionResultEvent extends BaseEvent {
  extractedForIntegration: {
    targetProjectId: string;
    extractedRequirements: { functional: string[]; nonFunctional: string[]; constraints: string[]; assumptions: string[] };
    integrationPoints: Array<{ existingArtifactId: string; integrationMethod: 'enhance' | 'extend' | 'validate'; extractedContent: string }>;
    businessValueAlignment: string;
  };
  integrationReady: boolean;
}

export interface ImportWorkflowsListResultEvent extends BaseEvent {
  importWorkflows: Array<{ name: string; description: string; version: string; supportedFormats: string[]; targetIntegrations: string[]; steps: unknown[] }>;
}

/**
 * Event: DocumentClassificationRequested
 * Fired when a document classification is requested.
 */
export interface DocumentClassificationRequestedEvent extends BaseEvent {
  documentId: string;
  requestedBy: string;
}

export interface DocumentImportErrorEvent extends BaseEvent {
  importError: string;
  importId: string;
  sourceDocument: string;
  targetProjectId: string;
  context?: Record<string, unknown>;
  escalateToProjectOwner: boolean;
  retryRecommended: boolean;
}

export const BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG = {
  'brain:document-intelligence:import-request': 'BrainDocumentImportRequestEvent',
  'brain:document-intelligence:import-workflow-execute': 'BrainDocumentImportWorkflowRequestEvent',
  'brain:document-intelligence:analyze-external-content': 'BrainExternalContentAnalysisRequestEvent',
  'brain:document-intelligence:extract-for-integration': 'BrainIntegrationExtractionRequestEvent',
  'brain:document-intelligence:get-import-workflows': 'BrainGetImportWorkflowsRequestEvent',
  'brain:document-intelligence:classification-requested': 'DocumentClassificationRequestedEvent',
  'document-intelligence:brain:import-result': 'DocumentImportResultEvent',
  'document-intelligence:brain:import-workflow-result': 'DocumentImportWorkflowResultEvent',
  'document-intelligence:brain:external-content-analyzed': 'ExternalContentAnalysisResultEvent',
  'document-intelligence:brain:integration-extracted': 'IntegrationExtractionResultEvent',
  'document-intelligence:brain:import-workflows-list': 'ImportWorkflowsListResultEvent',
  'document-intelligence:brain:import-error': 'DocumentImportErrorEvent',
} as const;

export type BrainDocumentImportEventName = keyof typeof BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG;

export interface BrainDocumentImportEventMap {
  'brain:document-intelligence:import-request': BrainDocumentImportRequestEvent;
  'brain:document-intelligence:import-workflow-execute': BrainDocumentImportWorkflowRequestEvent;
  'brain:document-intelligence:classification-requested': DocumentClassificationRequestedEvent;
  'document-intelligence:brain:import-result': DocumentImportResultEvent;
  'document-intelligence:brain:import-workflow-result': DocumentImportWorkflowResultEvent;
}
