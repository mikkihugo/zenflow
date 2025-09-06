/**
 * @fileoverview Brain ↔ Document Intelligence Event Contracts  
 * 
 * Event contracts for brain-document intelligence communication focused on
 * external document import processing and integration into existing SAFe projects
 * Document Intelligence handles importing external documents, not primary epic creation
 */

import type { BaseEvent } from '@claude-zen/foundation';

// =============================================================================
// EXISTING BRAIN → DOCUMENT INTELLIGENCE EVENTS (Enhanced)
// =============================================================================

/**
 * Brain requests document intelligence to import and process external document
 * Focus: External document import, not primary SAFe artifact creation
 */
export interface BrainDocumentImportRequestEvent extends BaseEvent {
  documentData: {
    id?: string;
    type: string;
    title: string; 
    content: string;
    metadata?: Record<string, unknown>;
  };
  importType: 'external-vision' | 'external-prd' | 'external-requirements' | 'content-analysis' | 'format-conversion';
  
  // Import coordination context
  importContext: {
    importId: string;
    sourceType: 'upload' | 'url' | 'email' | 'api';
    targetProjectId: string; // Existing SAFe project to integrate into
    importApprovalId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Target SAFe project for integration
  targetSafeProject: {
    portfolioId: string;
    programId: string;
    piId?: string;
    existingEpicId?: string; // Epic to extend/enhance
    integrationPoint: 'new-feature' | 'epic-enhancement' | 'requirement-addition' | 'analysis-input';
  };
  
  // Import processing constraints
  importConstraints: {
    maxImportTime: number;
    qualityThreshold: number;
    aiTokenBudget: number;
    requiresImportApproval: boolean;
    preserveOriginalFormat: boolean;
  };
}

/**
 * Brain requests document intelligence to execute import workflow
 * Focus: Processing external documents for integration into existing projects
 */
export interface BrainDocumentImportWorkflowRequestEvent extends BaseEvent {
  workflowName: 'external-document-import' | 'format-conversion' | 'content-extraction' | 'integration-preparation';
  importContext: {
    documentSource: 'external';
    importId: string;
    targetProjectId: string;
    workflowId: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Integration readiness
  integrationReadiness: {
    targetPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
    existingArtifacts: string[];
    integrationMethod: 'merge' | 'append' | 'reference' | 'analysis';
  };
}

// =============================================================================
// EXISTING DOCUMENT INTELLIGENCE → BRAIN EVENTS (Enhanced)
// =============================================================================

/**
 * Document intelligence reports external document import result
 * Focus: Results of importing external documents into SAFe projects
 */
export interface DocumentImportResultEvent extends BaseEvent {
  documentId: string;
  importResult: {
    success: boolean;
    originalDocument: {
      id: string;
      sourceType: 'external';
      title: string;
      format: string;
    };
    importedArtifacts: Array<{
      id: string;
      type: 'feature' | 'requirement' | 'analysis' | 'reference';
      title: string;
      content: string;
      integrationReady: boolean;
      targetProjectId: string;
      metadata: Record<string, unknown>;
    }>;
    integrationWorkflowsTriggered: string[];
    error?: string;
  };
  
  // Import integration notifications
  integrationNotifications: {
    notifyProjectOwner: boolean;
    integrationArtifactsReady: boolean;
    importApprovalRequired: boolean;
    manualReviewRequired: boolean;
    nextIntegrationSteps: string[];
  };
  
  // Import processing metrics
  importMetrics: {
    importTime: number;
    extractionConfidence: number;
    integrationReadinessScore: number;
    aiTokensUsed: number;
    humanReviewRequired: boolean;
    preservedOriginalContent: boolean;
  };
}

/**
 * Document import workflow execution result
 * Focus: Results of external document import workflows
 */
export interface DocumentImportWorkflowResultEvent extends BaseEvent {
  workflowName: 'external-document-import' | 'format-conversion' | 'content-extraction' | 'integration-preparation';
  importWorkflowResult: {
    success: boolean;
    importId: string;
    targetProjectId: string;
    integrationSteps: Array<{
      stepType: 'extract' | 'transform' | 'validate' | 'prepare-integration';
      success: boolean;
      output?: unknown;
      integrationReady: boolean;
      error?: string;
    }>;
    error?: string;
  };
  
  // Project integration impact
  integrationImpact: {
    triggersProjectUpdate: boolean;
    affectedSafeArtifacts: string[];
    integrationPoint: {
      targetPhase: string;
      integrationMethod: 'merge' | 'append' | 'reference';
      approvalRequired: boolean;
    };
    stakeholdersToNotify: string[];
  };
}

// =============================================================================
// EVENT TYPE REGISTRY  
// =============================================================================

/**
 * Brain-Document Intelligence event catalog for external document imports
 */
export const BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG = {
  // Brain → Document Intelligence (Import Focus)
  'brain:document-intelligence:import-request': 'BrainDocumentImportRequestEvent',
  'brain:document-intelligence:import-workflow-execute': 'BrainDocumentImportWorkflowRequestEvent',
  'brain:document-intelligence:analyze-external-content': 'BrainExternalContentAnalysisRequestEvent',
  'brain:document-intelligence:extract-for-integration': 'BrainIntegrationExtractionRequestEvent',
  'brain:document-intelligence:get-import-workflows': 'BrainGetImportWorkflowsRequestEvent',
  
  // Document Intelligence → Brain (Import Focus)  
  'document-intelligence:brain:import-result': 'DocumentImportResultEvent',
  'document-intelligence:brain:import-workflow-result': 'DocumentImportWorkflowResultEvent',
  'document-intelligence:brain:external-content-analyzed': 'ExternalContentAnalysisResultEvent',
  'document-intelligence:brain:integration-extracted': 'IntegrationExtractionResultEvent',
  'document-intelligence:brain:import-workflows-list': 'ImportWorkflowsListResultEvent',
  'document-intelligence:brain:import-error': 'DocumentImportErrorEvent',
} as const;

/**
 * Union type of brain-document import event names
 */
export type BrainDocumentImportEventName = keyof typeof BRAIN_DOCUMENT_IMPORT_EVENT_CATALOG;

/**
 * Event map for type-safe import event handling
 */
export interface BrainDocumentImportEventMap {
  'brain:document-intelligence:import-request': BrainDocumentImportRequestEvent;
  'brain:document-intelligence:import-workflow-execute': BrainDocumentImportWorkflowRequestEvent;
  'document-intelligence:brain:import-result': DocumentImportResultEvent;
  'document-intelligence:brain:import-workflow-result': DocumentImportWorkflowResultEvent;
}

// =============================================================================
// ADDITIONAL EVENT INTERFACES (Referenced above)
// =============================================================================

export interface BrainExternalContentAnalysisRequestEvent extends BaseEvent {
  externalContent: string;
  sourceFormat: string;
  targetProjectId: string;
  importContext: {
    importId: string;
    integrationIntent: 'requirement-extraction' | 'feature-analysis' | 'reference-material';
  };
}

export interface BrainIntegrationExtractionRequestEvent extends BaseEvent {
  externalDocument: string;
  sourceType: 'vision' | 'prd' | 'requirements' | 'specification';
  targetProjectId: string;
  integrationContext: {
    importId: string;
    targetSafeArtifacts: string[];
    extractionGoal: 'enhance-existing' | 'add-features' | 'validate-requirements';
  };
}

export interface BrainGetImportWorkflowsRequestEvent extends BaseEvent {
  importContext: {
    requestedBy: string;
    targetProjectType: 'safe-portfolio' | 'safe-program' | 'safe-team';
    documentTypes: string[];
  };
}

export interface ExternalContentAnalysisResultEvent extends BaseEvent {
  externalAnalysis: {
    sourceType: string;
    extractedElements: string[];
    integrationComplexity: 'simple' | 'moderate' | 'complex';
    recommendedIntegrationMethod: 'direct' | 'transformation' | 'manual-review';
    detectedArtifacts: Array<{
      type: 'requirement' | 'feature' | 'constraint' | 'assumption';
      content: string;
      confidence: number;
    }>;
  };
  integrationRecommendations: string[];
}

export interface IntegrationExtractionResultEvent extends BaseEvent {
  extractedForIntegration: {
    targetProjectId: string;
    extractedRequirements: {
      functional: string[];
      nonFunctional: string[];
      constraints: string[];
      assumptions: string[];
    };
    integrationPoints: Array<{
      existingArtifactId: string;
      integrationMethod: 'enhance' | 'extend' | 'validate';
      extractedContent: string;
    }>;
    businessValueAlignment: string;
  };
  integrationReady: boolean;
}

export interface ImportWorkflowsListResultEvent extends BaseEvent {
  importWorkflows: Array<{
    name: string;
    description: string;
    version: string;
    supportedFormats: string[];
    targetIntegrations: string[];
    steps: unknown[];
  }>;
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