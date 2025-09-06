/**
 * @fileoverview Document Intelligence Event Module Wrapper
 * 
 * External integration wrapper for document intelligence service
 * Provides simplified interface for other packages to interact with document intelligence
 * through the unified event contracts system.
 * 
 * Focus: External document import, content analysis, and integration preparation
 * 
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDocumentIntelligenceEventModule } from '@claude-zen/foundation/events/modules';
import { createCorrelationContext, type IEventModule as EventModule, type CorrelationContext } from '@claude-zen/foundation/events/modules/base-event-module';
import type {
  BrainDocumentImportRequestEvent,
  BrainDocumentImportWorkflowRequestEvent,
  DocumentImportResultEvent,
  DocumentImportWorkflowResultEvent,
  DocumentIntelligenceImportCompleteEvent,
  DocumentIntelligenceImportIntegrationReadyEvent
} from '@claude-zen/foundation/events';
import { getLogger } from '@claude-zen/foundation';
import { generateUUID } from '@claude-zen/foundation/utils';

const logger = getLogger('DocumentIntelligenceEventWrapper');

// =============================================================================
// EXTERNAL INTEGRATION INTERFACES
// =============================================================================

/**
 * Simplified document import request for external packages
 */
export interface ExternalDocumentImportRequest {
  documentContent: string;
  documentTitle: string;
  documentType: 'vision' | 'prd' | 'requirements' | 'specification' | 'analysis';
  sourceType: 'upload' | 'url' | 'email' | 'api';
  targetProjectId: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Simplified import result for external packages
 */
export interface ExternalDocumentImportResult {
  importId: string;
  success: boolean;
  documentId?: string;
  integrationArtifacts?: Array<{
    type: string;
    title: string;
    content: string;
    targetLocation: string;
  }>;
  integrationReadiness?: {
    score: number;
    recommendations: string[];
    nextSteps: string[];
  };
  error?: string;
}

/**
 * Workflow execution request for external packages
 */
export interface ExternalWorkflowExecutionRequest {
  workflowType: 'external-vision-import' | 'external-prd-import' | 'content-extraction' | 'integration-preparation';
  documentId: string;
  targetProjectId: string;
  context?: Record<string, unknown>;
}

/**
 * Content analysis request for external packages
 */
export interface ExternalContentAnalysisRequest {
  content: string;
  sourceFormat: string;
  targetProjectId: string;
  analysisLevel?: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * Content analysis result for external packages
 */
export interface ExternalContentAnalysisResult {
  analysisId: string;
  complexity: 'simple' | 'moderate' | 'complex';
  extractedElements: string[];
  integrationRecommendations: string[];
  detectedArtifacts: Array<{
    type: string;
    content: string;
    confidence: number;
  }>;
}

// =============================================================================
// EVENT MODULE WRAPPER
// =============================================================================

/**
 * Document Intelligence Event Module Wrapper
 * 
 * Provides external integration interface for document intelligence capabilities
 * Wraps complex event contracts into simplified external API
 */
export class DocumentIntelligenceEventWrapper {
  private eventModule: EventModule;
  private correlationContext: CorrelationContext;
  private initialized = false;
  
  // Response tracking for external requests
  private pendingRequests = new Map<string, {
    resolve: (result: any) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  
  constructor(moduleId: string = 'document-intelligence-wrapper') {
    this.eventModule = createDocumentIntelligenceEventModule(moduleId, '1.0.0');
    this.correlationContext = createCorrelationContext({
      initiatedBy: 'document-intelligence-wrapper',
      metadata: {
        wrapperVersion: '1.0.0',
        externalIntegration: true
      }
    });
  }

  /**
   * Initialize the event module wrapper
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await this.eventModule.initialize();
    this.setupResponseHandlers();
    this.initialized = true;
    
    logger.info('Document Intelligence Event Wrapper initialized', {
      moduleId: this.eventModule.moduleId,
      correlationId: this.correlationContext.correlationId
    });
  }

  /**
   * Shutdown the event module wrapper
   */
  async shutdown(): Promise<void> {
    // Cancel all pending requests
  for (const [, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error('Wrapper shutting down'));
    }
    this.pendingRequests.clear();
    
    if (this.eventModule) {
      await this.eventModule.shutdown();
    }
    
    this.initialized = false;
    logger.info('Document Intelligence Event Wrapper shutdown complete');
  }

  // =============================================================================
  // EXTERNAL API - Simplified Document Import Interface
  // =============================================================================

  /**
   * Import external document (simplified interface for other packages)
   */
  async importDocument(request: ExternalDocumentImportRequest): Promise<ExternalDocumentImportResult> {
    await this.ensureInitialized();
    
    const importId = generateUUID();
    const documentId = generateUUID();
    
    const brainImportRequest: BrainDocumentImportRequestEvent = {
      requestId: generateUUID(),
  timestamp: new Date(),
      documentData: {
        id: documentId,
        type: request.documentType,
        title: request.documentTitle,
        content: request.documentContent,
        metadata: {
          ...request.metadata,
          externalImport: true,
          wrapperGenerated: true
        }
      },
      importType: this.mapDocumentTypeToImportType(request.documentType),
      importContext: {
        importId,
        sourceType: request.sourceType,
        targetProjectId: request.targetProjectId,
        priority: request.priority ?? 'medium'
      },
      targetSafeProject: {
        portfolioId: 'external-import',
        programId: 'external-import',
        integrationPoint: 'epic-enhancement'
      },
      importConstraints: {
        maxImportTime: 600000, // 10 minutes
        qualityThreshold: 0.8,
        aiTokenBudget: 10000,
        requiresImportApproval: !!request.requiresApproval,
        preserveOriginalFormat: true
      }
    };
    
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(importId);
        reject(new Error('Import request timed out'));
      }, 600000); // 10 minutes
      
      // Store request for response handling
      this.pendingRequests.set(importId, {
        resolve: (result: DocumentImportResultEvent) => {
          clearTimeout(timeout);
          resolve(this.mapImportResultToExternal(result, importId));
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout
      });
      
      // Send request with correlation
      this.eventModule.emit(
        'brain:document-intelligence:import-request',
        brainImportRequest,
        { correlationContext: this.correlationContext }
      );
    });
  }

  /**
   * Execute document workflow (simplified interface)
   */
  async executeWorkflow(request: ExternalWorkflowExecutionRequest): Promise<{ success: boolean; results?: any; error?: string }> {
    await this.ensureInitialized();
    
    const workflowId = generateUUID();
    
    const workflowRequest: BrainDocumentImportWorkflowRequestEvent = {
      requestId: generateUUID(),
      timestamp: new Date(),
      workflowName: ((): BrainDocumentImportWorkflowRequestEvent['workflowName'] => {
        switch (request.workflowType) {
          case 'external-vision-import':
          case 'external-prd-import':
            return 'external-document-import';
          case 'content-extraction':
            return 'content-extraction';
          case 'integration-preparation':
          default:
            return 'integration-preparation';
        }
      })(),
      importContext: {
        documentSource: 'external',
        importId: workflowId,
        targetProjectId: request.targetProjectId,
        workflowId,
        priority: 'medium'
      },
      integrationReadiness: {
        targetPhase: 'specification',
        existingArtifacts: [],
        integrationMethod: 'merge'
      }
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(workflowId);
        reject(new Error('Workflow execution timed out'));
      }, 300000); // 5 minutes
      
      this.pendingRequests.set(workflowId, {
        resolve: (result: DocumentImportWorkflowResultEvent) => {
          clearTimeout(timeout);
          const payload: { success: boolean; results?: any; error?: string } = {
            success: result.importWorkflowResult.success,
            results: result.importWorkflowResult.integrationSteps
          };
          if (result.importWorkflowResult.error !== undefined) {
            payload.error = result.importWorkflowResult.error;
          }
          resolve(payload);
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout
      });
      
      this.eventModule.emit(
        'brain:document-intelligence:import-workflow-execute',
        workflowRequest,
        { correlationContext: this.correlationContext }
      );
    });
  }

  /**
   * Analyze external content (simplified interface)
   */
  async analyzeContent(request: ExternalContentAnalysisRequest): Promise<ExternalContentAnalysisResult> {
    await this.ensureInitialized();
    
    const analysisId = generateUUID();
    
    const analysisRequest = {
      requestId: generateUUID(),
  timestamp: new Date(),
      externalContent: request.content,
      sourceFormat: request.sourceFormat,
      targetProjectId: request.targetProjectId,
      importContext: {
        importId: analysisId,
        integrationIntent: 'requirement-extraction' as const
      }
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(analysisId);
        reject(new Error('Content analysis timed out'));
      }, 180000); // 3 minutes
      
      this.pendingRequests.set(analysisId, {
        resolve: (result: any) => {
          clearTimeout(timeout);
          resolve({
            analysisId,
            complexity: result.externalAnalysis.integrationComplexity,
            extractedElements: result.externalAnalysis.extractedElements,
            integrationRecommendations: result.integrationRecommendations,
            detectedArtifacts: result.externalAnalysis.detectedArtifacts
          });
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout
      });
      
      this.eventModule.emit(
        'brain:document-intelligence:analyze-external-content',
        analysisRequest,
        { correlationContext: this.correlationContext }
      );
    });
  }

  /**
   * Get available import workflows
   */
  async getAvailableWorkflows(): Promise<Array<{ name: string; description: string; supportedFormats: string[] }>> {
    await this.ensureInitialized();
    
    const requestId = generateUUID();
    
    const workflowsRequest = {
      requestId: generateUUID(),
  timestamp: new Date(),
      importContext: {
  requestedBy: this.eventModule.moduleId,
        targetProjectType: 'safe-program' as const,
        documentTypes: ['vision', 'prd', 'requirements', 'specification']
      }
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Workflows request timed out'));
      }, 60000); // 1 minute
      
      this.pendingRequests.set(requestId, {
        resolve: (result: any) => {
          clearTimeout(timeout);
          resolve(result.importWorkflows.map((workflow: any) => ({
            name: workflow.name,
            description: workflow.description,
            supportedFormats: workflow.supportedFormats
          })));
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout
      });
      
      this.eventModule.emit(
        'brain:document-intelligence:get-import-workflows',
        workflowsRequest,
        { correlationContext: this.correlationContext }
      );
    });
  }

  // =============================================================================
  // COORDINATION INTEGRATION - Simplified Notifications
  // =============================================================================

  /**
   * Notify coordination of import completion (for external packages)
   */
  notifyImportComplete(
    importId: string,
    documentId: string,
    targetProjectId: string,
    artifacts: Array<{ type: string; title: string; content: string }>
  ): void {
    const completionEvent: DocumentIntelligenceImportCompleteEvent = {
      requestId: generateUUID(),
  timestamp: new Date(),
      workflowId: generateUUID(),
      importWorkflowType: 'content-extraction',
      documentId,
      externalDocument: {
        sourceType: 'external-api',
        originalTitle: 'External Import',
        originalFormat: 'processed',
        content: 'External integration content',
        importMetadata: { externalImportId: importId }
      },
      importedArtifacts: artifacts.map(artifact => ({
        type: artifact.type as any,
        title: artifact.title,
        content: artifact.content,
        integrationTarget: 'existing-feature',
        targetProjectId,
        extractedValue: 'External integration value',
        metadata: { externalGenerated: true }
      })),
      importMetrics: {
        importTime: 0,
        extractionConfidence: 0.9,
        integrationReadinessScore: 0.85,
        aiTokensUsed: 500
      },
      targetIntegrationPhase: 'specification',
      nextIntegrationActions: ['validate-integration', 'update-project']
    };
    
    this.eventModule.emit(
      'document-intelligence:coordination:import-complete',
      completionEvent,
      { correlationContext: this.correlationContext }
    );
  }

  /**
   * Notify coordination of integration readiness (for external packages)
   */
  notifyIntegrationReady(
    importId: string,
    documentId: string,
    targetProjectId: string,
    integrationData: { content: string; method: string; target: string }
  ): void {
    const integrationEvent: DocumentIntelligenceImportIntegrationReadyEvent = {
      requestId: generateUUID(),
  timestamp: new Date(),
      importId,
      sourceDocumentId: documentId,
      targetProjectId,
      integrationData: {
        targetArtifactId: 'external-target',
        targetArtifactType: 'feature',
        integrationMethod: integrationData.method as any,
        extractedContent: integrationData.content,
        businessValueAlignment: 'Aligned with external integration goals',
        suggestedIntegrationPoints: [{
          section: integrationData.target,
          content: integrationData.content,
          integrationMethod: 'merge'
        }],
        dependencies: [],
        constraints: []
      },
      integrationMetadata: {
        targetPortfolioId: 'external',
        targetProgramId: 'external',
        targetPiId: 'external',
        integrationComplexity: 'simple',
        estimatedIntegrationEffort: 2,
        businessImpact: 'medium'
      },
      integrationCompliance: {
        targetPhase: 'specification',
        qualityGates: { approved: true },
        integrationArtifacts: ['integration-spec']
      },
      integrationApprovalRequired: false
    };
    
    this.eventModule.emit(
      'document-intelligence:coordination:integration-ready',
      integrationEvent,
      { correlationContext: this.correlationContext }
    );
  }

  // =============================================================================
  // PRIVATE IMPLEMENTATION
  // =============================================================================

  /**
   * Ensure wrapper is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Set up response handlers for external requests
   */
  private setupResponseHandlers(): void {
    // Handle import results from document intelligence
    this.eventModule.on('document-intelligence:brain:import-result', (event: DocumentImportResultEvent) => {
      const importId = this.findImportIdFromEvent(event);
      const pendingRequest = this.pendingRequests.get(importId);
      if (pendingRequest) {
        this.pendingRequests.delete(importId);
        pendingRequest.resolve(event);
      }
    });

    // Handle workflow results
    this.eventModule.on('document-intelligence:brain:import-workflow-result', (event: DocumentImportWorkflowResultEvent) => {
      const workflowId = event.importWorkflowResult.importId;
      const pendingRequest = this.pendingRequests.get(workflowId);
      if (pendingRequest) {
        if (workflowId) this.pendingRequests.delete(workflowId);
        pendingRequest.resolve(event);
      }
    });

    // Handle content analysis results
    this.eventModule.on('document-intelligence:brain:external-content-analyzed', (event: any) => {
      // Extract analysis ID from event context
      const analysisId = this.findAnalysisIdFromEvent(event);
      const pendingRequest = analysisId ? this.pendingRequests.get(analysisId) : undefined;
      if (pendingRequest) {
        if (analysisId) this.pendingRequests.delete(analysisId);
        pendingRequest.resolve(event);
      }
    });

    // Handle workflow list results
    this.eventModule.on('document-intelligence:brain:import-workflows-list', (event: any) => {
      // Find matching request (simplified - in real implementation, use proper correlation)
      const pendingRequest = Array.from(this.pendingRequests.values())[0];
      if (pendingRequest) {
  const requestId = Array.from(this.pendingRequests.keys())[0];
  if (requestId) this.pendingRequests.delete(requestId);
        pendingRequest.resolve(event);
      }
    });

    // Handle errors
    this.eventModule.on('document-intelligence:brain:import-error', (event: any) => {
      const importId = event.importId as string | undefined;
      const pendingRequest = importId ? this.pendingRequests.get(importId) : undefined;
      if (pendingRequest) {
        if (importId) this.pendingRequests.delete(importId);
        pendingRequest.reject(new Error(event.importError));
      }
    });
  }

  /**
   * Map document type to import type
   */
  private mapDocumentTypeToImportType(
    documentType: 'vision' | 'prd' | 'requirements' | 'specification' | 'analysis'
  ): 'external-vision' | 'external-prd' | 'external-requirements' | 'content-analysis' | 'format-conversion' {
    const mapping = {
      vision: 'external-vision' as const,
      prd: 'external-prd' as const,
      requirements: 'external-requirements' as const,
      specification: 'content-analysis' as const,
      analysis: 'content-analysis' as const
    };
    return mapping[documentType];
  }

  /**
   * Map import result to external format
   */
  private mapImportResultToExternal(
    result: DocumentImportResultEvent,
    importId: string
  ): ExternalDocumentImportResult {
    const base: ExternalDocumentImportResult = {
      importId,
      success: !!(result.importResult && result.importResult.success),
      documentId: result.documentId,
      integrationArtifacts: Array.isArray(result.importResult?.importedArtifacts)
        ? result.importResult.importedArtifacts.map(artifact => ({
            type: artifact.type,
            title: artifact.title,
            content: artifact.content,
            targetLocation: 'project-integration'
          }))
        : [],
      integrationReadiness: result.importMetrics && result.integrationNotifications
        ? {
            score: result.importMetrics.integrationReadinessScore,
            recommendations: result.integrationNotifications.nextIntegrationSteps ?? [],
            nextSteps: result.integrationNotifications.nextIntegrationSteps ?? []
          }
        : undefined
    };
    if (result.importResult && typeof result.importResult.error === 'string') {
      (base as any).error = result.importResult.error;
    }
    return base;
  }

  /**
   * Find import ID from event (simplified implementation)
   */
  private findImportIdFromEvent(_event: any): string {
    // In a real implementation, this would use proper correlation tracking
    // For now, return the first pending request ID
    return Array.from(this.pendingRequests.keys())[0] || 'unknown';
  }

  /**
   * Find analysis ID from event (simplified implementation)
   */
  private findAnalysisIdFromEvent(_event: any): string {
    // In a real implementation, this would use proper correlation tracking
    // For now, return the first pending request ID
    return Array.from(this.pendingRequests.keys())[0] || 'unknown';
  }
}

// =============================================================================
// CONVENIENCE FACTORY FUNCTIONS
// =============================================================================

/**
 * Create and initialize a document intelligence event wrapper
 */
export async function createDocumentIntelligenceWrapper(
  moduleId?: string
): Promise<DocumentIntelligenceEventWrapper> {
  const wrapper = new DocumentIntelligenceEventWrapper(moduleId);
  await wrapper.initialize();
  return wrapper;
}

/**
 * Global singleton wrapper for easy access
 */
let globalWrapper: DocumentIntelligenceEventWrapper | null = null;

/**
 * Get or create global document intelligence wrapper
 */
export async function getDocumentIntelligenceWrapper(): Promise<DocumentIntelligenceEventWrapper> {
  if (!globalWrapper) {
    globalWrapper = await createDocumentIntelligenceWrapper('global-document-intelligence-wrapper');
  }
  return globalWrapper;
}

/**
 * Shutdown global wrapper
 */
export async function shutdownGlobalWrapper(): Promise<void> {
  if (globalWrapper) {
    await globalWrapper.shutdown();
    globalWrapper = null;
  }
}