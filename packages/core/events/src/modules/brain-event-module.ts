/**
 * @fileoverview Brain Event Module Wrapper
 * 
 * Unified Brain domain event module that bridges the existing brain event module
 * with the new standardized event module patterns. Maintains backward compatibility
 * while providing enhanced functionality.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// =============================================================================
// IMPORTS
// =============================================================================

import {
  getLogger,
  generateUUID,
  recordMetric,
  withTrace,
  ok,
  err,
  Result
} from '@claude-zen/foundation';

import type { Logger } from '@claude-zen/foundation/core';
import type { UUID } from '@claude-zen/foundation/types';

import {
  EventModuleFactory,
  type BrainModuleConfig,
  type IEventModule
} from './event-module-factory.js';

import {
  type CorrelationContext,
  type EventEmissionOptions
} from './base-event-module.js';

// Import event contracts from foundation (they were migrated there)
// Note: These types would need to be imported from foundation or redefined locally
// For now, using any types to allow compilation
type BrainCoordinationEventMap = {
  'brain:coordination:safe-workflow-support': any;
  'brain:coordination:sparc-phase-ready': any;
  'coordination:brain:workflow-approved': any;
  'coordination:brain:priority-escalated': any;
  'coordination:brain:resource-allocated': any;
};

type BrainDocumentImportEventMap = {
  'brain:document-intelligence:import-request': any;
  'brain:document-intelligence:import-workflow-execute': any;
  'document-intelligence:brain:import-result': any;
  'document-intelligence:brain:import-workflow-result': any;
  'document-intelligence:brain:import-error': any;
};

// =============================================================================
// BRAIN EVENT MODULE WRAPPER TYPES
// =============================================================================

/**
 * Configuration for the unified Brain Event Module
 */
export interface UnifiedBrainEventModuleConfig extends Partial<BrainModuleConfig> {
  /** Unique identifier for the module instance */
  moduleId: string;
  
  /** Optional human readable name override */
  moduleName?: string;
  
  /** Module version override */
  version?: string;
  
  /** Enable backward compatibility mode */
  enableLegacyCompatibility?: boolean;
  
  /** Enable enhanced saga workflow features */
  enableEnhancedSaga?: boolean;
  
  /** Custom brain-specific metadata */
  brainMetadata?: Record<string, unknown>;
}

/**
 * SAFe workflow support request options
 */
export interface SafeWorkflowSupportOptions {
  workflowType: 'epic-support' | 'pi-planning' | 'feature-approval' | 'architecture-review';
  documentId: string;
  documentType: 'vision' | 'prd' | 'epic' | 'feature';
  safeArtifacts: {
    businessValue: string;
    acceptanceCriteria: string[];
    dependencies: string[];
    estimates: Record<string, unknown>;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  sparcPhase?: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  approvalRequired?: boolean;
}

/**
 * SPARC phase transition request options
 */
export interface SparcPhaseTransitionOptions {
  projectId: string;
  currentPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  nextPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  artifacts: Array<{
    type: string;
    name: string;
    content: string;
    metadata: Record<string, unknown>;
  }>;
  qualityGates: {
    passed: boolean;
    criteria: string[];
    metrics: Record<string, number>;
  };
  taskMasterApprovalRequired?: boolean;
}

/**
 * Document import request options
 */
export interface DocumentImportOptions {
  documentData: {
    id?: string;
    type: string;
    title: string;
    content: string;
    metadata?: Record<string, unknown>;
  };
  importType: 'external-vision' | 'external-prd' | 'external-requirements' | 'content-analysis' | 'format-conversion';
  importContext: {
    importId: string;
    sourceType: 'upload' | 'url' | 'email' | 'api';
    targetProjectId: string;
    importApprovalId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  targetSafeProject: {
    portfolioId: string;
    programId: string;
    piId?: string;
    existingEpicId?: string;
    integrationPoint: 'new-feature' | 'epic-enhancement' | 'requirement-addition' | 'analysis-input';
  };
  importConstraints?: {
    maxImportTime?: number;
    qualityThreshold?: number;
    aiTokenBudget?: number;
    requiresImportApproval?: boolean;
    preserveOriginalFormat?: boolean;
  };
}

/**
 * Import workflow execution options
 */
export interface ImportWorkflowOptions {
  workflowName: 'external-document-import' | 'format-conversion' | 'content-extraction' | 'integration-preparation';
  importContext: {
    importId: string;
    targetProjectId: string;
    workflowId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  integrationReadiness: {
    targetPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
    existingArtifacts: string[];
    integrationMethod: 'merge' | 'append' | 'reference' | 'analysis';
  };
}

/**
 * Saga step definition for brain workflows
 */
export interface BrainSagaStep {
  stepId: string;
  stepName: string;
  stepType: 'coordination' | 'document-intelligence' | 'approval' | 'integration' | 'analysis';
  operation: string;
  parameters: Record<string, unknown>;
  compensationOperation?: string;
  timeout?: number;
  retryConfig?: {
    maxAttempts: number;
    backoffMs: number;
    exponentialBackoff: boolean;
  };
}

// =============================================================================
// UNIFIED BRAIN EVENT MODULE
// =============================================================================

/**
 * Unified Brain Event Module that combines legacy functionality with new patterns
 * 
 * Provides high-level methods for brain coordination, document intelligence, and
 * saga workflows while maintaining backward compatibility with existing brain modules.
 */
export class UnifiedBrainEventModule {
  private readonly moduleId: string;
  private readonly config: UnifiedBrainEventModuleConfig;
  private readonly logger: Logger;
  private eventModule?: IEventModule;
  
  private isInitialized = false;
  private eventHandlers = new Map<string, Set<Function>>();

  constructor(config: UnifiedBrainEventModuleConfig) {
    this.moduleId = config.moduleId;
    this.config = {
      moduleName: `Unified Brain Module ${config.moduleId}`,
      version: '2.1.0',
      enableLegacyCompatibility: true,
      enableEnhancedSaga: true,
      enableCorrelation: true,
      enableHeartbeat: false,
      heartbeatInterval: 30000,
      enableSafeWorkflows: true,
      enableSparcIntegration: true,
      enableDocumentIntelligence: true,
      enableSagaWorkflows: true,
      ...config
    };
    
    this.logger = getLogger(`unified-brain-event-module:${this.moduleId}`);
  }

  /**
   * Initialize the unified brain event module
   */
  async initialize(): Promise<Result<void, Error>> {
    if (this.isInitialized) {
      this.logger.warn('Unified brain event module already initialized');
      return ok();
    }

    return await withTrace('unified-brain-event-module:initialize', async () => {
      try {
        this.logger.info('Initializing unified brain event module', {
          moduleId: this.moduleId,
          config: this.config
        });

        // Create the underlying event module using factory
        const brainModuleConfig: BrainModuleConfig = {
          moduleId: this.config.moduleId,
          moduleName: this.config.moduleName!,
          version: this.config.version!,
          description: `Unified Brain Event Module for ${this.moduleId}`,
          enableCorrelation: this.config.enableCorrelation,
          enableHeartbeat: this.config.enableHeartbeat,
          heartbeatInterval: this.config.heartbeatInterval,
          enableSafeWorkflows: this.config.enableSafeWorkflows,
          enableSparcIntegration: this.config.enableSparcIntegration,
          enableDocumentIntelligence: this.config.enableDocumentIntelligence,
          enableSagaWorkflows: this.config.enableSagaWorkflows,
          metadata: {
            unifiedModule: true,
            legacyCompatibility: this.config.enableLegacyCompatibility,
            enhancedSaga: this.config.enableEnhancedSaga,
            ...this.config.brainMetadata
          }
        };

        const moduleResult = await EventModuleFactory.createBrainModuleWithDefaults(
          this.config.moduleId,
          this.config.moduleName,
          brainModuleConfig
        );

        if (moduleResult.isErr()) {
          return err(new Error(`Failed to create brain module: ${moduleResult.error.message}`));
        }

        this.eventModule = moduleResult.value;

        // Setup enhanced event handling
        this.setupEnhancedEventHandling();

        this.isInitialized = true;
        
        recordMetric('unified_brain_event_module_initialized', 1, {
          moduleId: this.moduleId
        });

        this.logger.info('Unified brain event module initialized successfully');
        return ok();
      } catch (error) {
        return err(new Error(`Unified brain event module initialization failed: ${error}`));
      }
    });
  }

  /**
   * Shutdown the unified brain event module
   */
  async shutdown(): Promise<Result<void, Error>> {
    if (!this.isInitialized || !this.eventModule) {
      return ok();
    }

    return await withTrace('unified-brain-event-module:shutdown', async () => {
      try {
        this.logger.info('Shutting down unified brain event module');

        const shutdownResult = await this.eventModule!.shutdown();
        if (shutdownResult.isErr()) {
          this.logger.error('Event module shutdown failed', { 
            error: shutdownResult.error.message 
          });
        }
        
        this.eventHandlers.clear();
        this.isInitialized = false;
        
        recordMetric('unified_brain_event_module_shutdown', 1, {
          moduleId: this.moduleId
        });

        this.logger.info('Unified brain event module shutdown complete');
        return ok();
      } catch (error) {
        return err(new Error(`Unified brain event module shutdown failed: ${error}`));
      }
    });
  }

  // =============================================================================
  // COORDINATION METHODS
  // =============================================================================

  /**
   * Request SAFe workflow support
   */
  async requestSafeWorkflowSupport(options: SafeWorkflowSupportOptions): Promise<Result<string, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'safe-workflow-request',
        { workflowType: options.workflowType, documentId: options.documentId }
      );

      const event: BrainCoordinationEventMap['brain:coordination:safe-workflow-support'] = {
        requestId: generateUUID(),
        timestamp: Date.now(),
        workflowType: options.workflowType,
        documentId: options.documentId,
        documentType: options.documentType,
        safeArtifacts: options.safeArtifacts,
        priority: options.priority || 'medium',
        sparcPhase: options.sparcPhase || 'specification',
        approvalRequired: options.approvalRequired ?? true
      };

      this.eventModule!.emit('brain:coordination:safe-workflow-support', event, { correlationContext });

      this.logger.info('SAFe workflow support requested', {
        requestId: event.requestId,
        workflowType: options.workflowType,
        documentId: options.documentId
      });

      return ok(event.requestId);
    } catch (error) {
      return err(new Error(`SAFe workflow request failed: ${error}`));
    }
  }

  /**
   * Request SPARC phase transition
   */
  async requestSparcPhaseTransition(options: SparcPhaseTransitionOptions): Promise<Result<string, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'sparc-phase-transition',
        { projectId: options.projectId, currentPhase: options.currentPhase }
      );

      const event: BrainCoordinationEventMap['brain:coordination:sparc-phase-ready'] = {
        requestId: generateUUID(),
        timestamp: Date.now(),
        projectId: options.projectId,
        currentPhase: options.currentPhase,
        nextPhase: options.nextPhase,
        artifacts: options.artifacts,
        qualityGates: options.qualityGates,
        taskMasterApprovalRequired: options.taskMasterApprovalRequired ?? false
      };

      this.eventModule!.emit('brain:coordination:sparc-phase-ready', event, { correlationContext });

      this.logger.info('SPARC phase transition requested', {
        requestId: event.requestId,
        projectId: options.projectId,
        currentPhase: options.currentPhase,
        nextPhase: options.nextPhase
      });

      return ok(event.requestId);
    } catch (error) {
      return err(new Error(`SPARC phase transition request failed: ${error}`));
    }
  }

  // =============================================================================
  // DOCUMENT INTELLIGENCE METHODS
  // =============================================================================

  /**
   * Request document import
   */
  async requestDocumentImport(options: DocumentImportOptions): Promise<Result<string, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'document-import-request',
        { importId: options.importContext.importId, importType: options.importType }
      );

      const event: BrainDocumentImportEventMap['brain:document-intelligence:import-request'] = {
        requestId: generateUUID(),
        timestamp: Date.now(),
        documentData: options.documentData,
        importType: options.importType,
        importContext: {
          ...options.importContext,
          priority: options.importContext.priority || 'medium'
        },
        targetSafeProject: options.targetSafeProject,
        importConstraints: {
          maxImportTime: 300000, // 5 minutes default
          qualityThreshold: 0.8,
          aiTokenBudget: 10000,
          requiresImportApproval: true,
          preserveOriginalFormat: false,
          ...options.importConstraints
        }
      };

      this.eventModule!.emit('brain:document-intelligence:import-request', event, { correlationContext });

      this.logger.info('Document import requested', {
        requestId: event.requestId,
        importId: options.importContext.importId,
        importType: options.importType,
        targetProjectId: options.importContext.targetProjectId
      });

      return ok(event.requestId);
    } catch (error) {
      return err(new Error(`Document import request failed: ${error}`));
    }
  }

  /**
   * Request document import workflow execution
   */
  async requestImportWorkflow(options: ImportWorkflowOptions): Promise<Result<string, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'import-workflow-request',
        { workflowName: options.workflowName, importId: options.importContext.importId }
      );

      const event: BrainDocumentImportEventMap['brain:document-intelligence:import-workflow-execute'] = {
        requestId: generateUUID(),
        timestamp: Date.now(),
        workflowName: options.workflowName,
        importContext: {
          documentSource: 'external' as const,
          workflowId: options.importContext.workflowId || generateUUID(),
          priority: options.importContext.priority || 'medium',
          ...options.importContext
        },
        integrationReadiness: options.integrationReadiness
      };

      this.eventModule!.emit('brain:document-intelligence:import-workflow-execute', event, { correlationContext });

      this.logger.info('Import workflow requested', {
        requestId: event.requestId,
        workflowName: options.workflowName,
        importId: options.importContext.importId
      });

      return ok(event.requestId);
    } catch (error) {
      return err(new Error(`Import workflow request failed: ${error}`));
    }
  }

  // =============================================================================
  // ENHANCED SAGA WORKFLOW METHODS
  // =============================================================================

  /**
   * Create an enhanced saga workflow with brain-specific steps
   */
  async createBrainSagaWorkflow(
    workflowId: string,
    steps: BrainSagaStep[]
  ): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    return await withTrace('unified-brain-event-module:create-saga', async () => {
      try {
        const correlationContext = this.eventModule!.createCorrelation(
          'brain-saga-workflow-creation',
          { workflowId, stepCount: steps.length }
        );

        const sagaWorkflow = {
          workflowId,
          steps: steps.map((step, index) => ({
            ...step,
            stepIndex: index,
            status: 'pending' as const,
            attempts: 0
          })),
          currentStep: 0,
          status: 'created' as const,
          createdAt: Date.now(),
          metadata: {
            createdBy: this.moduleId,
            correlationId: correlationContext.correlationId,
            brainWorkflow: true,
            enhanced: this.config.enableEnhancedSaga
          }
        };

        // Emit saga creation event
        this.eventModule!.emit('brain:saga:workflow-created', sagaWorkflow, { correlationContext });

        this.logger.info('Brain saga workflow created', {
          workflowId,
          stepCount: steps.length,
          enhanced: this.config.enableEnhancedSaga
        });

        return ok();
      } catch (error) {
        return err(new Error(`Brain saga workflow creation failed: ${error}`));
      }
    });
  }

  // =============================================================================
  // EVENT LISTENING METHODS
  // =============================================================================

  /**
   * Listen for coordination workflow approval events
   */
  onWorkflowApproved(
    handler: (event: BrainCoordinationEventMap['coordination:brain:workflow-approved']) => void | Promise<void>
  ): void {
    this.addEventListener('coordination:brain:workflow-approved', handler);
  }

  /**
   * Listen for priority escalation events
   */
  onPriorityEscalated(
    handler: (event: BrainCoordinationEventMap['coordination:brain:priority-escalated']) => void | Promise<void>
  ): void {
    this.addEventListener('coordination:brain:priority-escalated', handler);
  }

  /**
   * Listen for resource allocation events
   */
  onResourceAllocated(
    handler: (event: BrainCoordinationEventMap['coordination:brain:resource-allocated']) => void | Promise<void>
  ): void {
    this.addEventListener('coordination:brain:resource-allocated', handler);
  }

  /**
   * Listen for document import results
   */
  onDocumentImportResult(
    handler: (event: BrainDocumentImportEventMap['document-intelligence:brain:import-result']) => void | Promise<void>
  ): void {
    this.addEventListener('document-intelligence:brain:import-result', handler);
  }

  /**
   * Listen for document import workflow results
   */
  onDocumentImportWorkflowResult(
    handler: (event: BrainDocumentImportEventMap['document-intelligence:brain:import-workflow-result']) => void | Promise<void>
  ): void {
    this.addEventListener('document-intelligence:brain:import-workflow-result', handler);
  }

  /**
   * Listen for document import errors
   */
  onDocumentImportError(
    handler: (event: any) => void | Promise<void>
  ): void {
    this.addEventListener('document-intelligence:brain:import-error', handler);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get module status and metrics
   */
  getStatus(): {
    moduleId: string;
    isInitialized: boolean;
    eventHandlerCount: number;
    correlationEnabled: boolean;
    heartbeatEnabled: boolean;
    legacyCompatibility: boolean;
    enhancedSaga: boolean;
    underlyingModuleStatus?: any;
  } {
    const baseStatus = {
      moduleId: this.moduleId,
      isInitialized: this.isInitialized,
      eventHandlerCount: Array.from(this.eventHandlers.values()).reduce((sum, set) => sum + set.size, 0),
      correlationEnabled: this.config.enableCorrelation ?? true,
      heartbeatEnabled: this.config.enableHeartbeat ?? false,
      legacyCompatibility: this.config.enableLegacyCompatibility ?? true,
      enhancedSaga: this.config.enableEnhancedSaga ?? true
    };

    if (this.eventModule) {
      return {
        ...baseStatus,
        underlyingModuleStatus: this.eventModule.getStatus()
      };
    }

    return baseStatus;
  }

  /**
   * Send a custom heartbeat with additional data
   */
  async sendHeartbeat(customData?: Record<string, unknown>): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }
    
    try {
      await this.eventModule!.sendHeartbeat({
        moduleId: this.moduleId,
        eventHandlerCount: Array.from(this.eventHandlers.values()).reduce((sum, set) => sum + set.size, 0),
        unifiedModule: true,
        ...customData
      });
      return ok();
    } catch (error) {
      return err(new Error(`Heartbeat failed: ${error}`));
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private ensureInitialized(): boolean {
    return this.isInitialized && !!this.eventModule;
  }

  private addEventListener(eventName: string, handler: Function): void {
    if (!this.ensureInitialized()) {
      throw new Error(`Unified brain event module ${this.moduleId} not initialized. Call initialize() first.`);
    }

    // Store handler for tracking
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName)!.add(handler);

    // Add to underlying event module
    this.eventModule!.on(eventName, handler);

    this.logger.debug('Event listener added', {
      eventName,
      handlerCount: this.eventHandlers.get(eventName)!.size
    });
  }

  private setupEnhancedEventHandling(): void {
    if (!this.eventModule) return;

    // Enhanced correlation tracking
    const enhancedEvents = [
      'coordination:brain:workflow-approved',
      'coordination:brain:priority-escalated',
      'coordination:brain:resource-allocated',
      'document-intelligence:brain:import-result',
      'document-intelligence:brain:import-workflow-result',
      'document-intelligence:brain:import-error'
    ];

    for (const eventName of enhancedEvents) {
      this.eventModule.on(eventName, (event: any) => {
        this.logger.debug('Enhanced brain event received', { 
          eventName, 
          requestId: event.requestId,
          correlationId: event._correlation?.correlationId
        });
        
        recordMetric('unified_brain_event_module_event_received', 1, {
          moduleId: this.moduleId,
          eventName,
          hasCorrelation: !!event._correlation
        });
      });
    }

    // Enhanced saga event handling
    if (this.config.enableEnhancedSaga) {
      this.setupEnhancedSagaHandling();
    }
  }

  private setupEnhancedSagaHandling(): void {
    if (!this.eventModule) return;

    const sagaEvents = [
      'brain:saga:workflow-created',
      'brain:saga:step-started',
      'brain:saga:step-completed',
      'brain:saga:step-failed',
      'brain:saga:workflow-completed',
      'brain:saga:workflow-failed'
    ];

    for (const eventName of sagaEvents) {
      this.eventModule.on(eventName, (event: any) => {
        this.logger.info('Enhanced saga event', {
          eventName,
          workflowId: event.workflowId,
          stepId: event.stepId
        });
        
        recordMetric('unified_brain_event_module_saga_event', 1, {
          moduleId: this.moduleId,
          eventName,
          workflowId: event.workflowId
        });
      });
    }
  }
}

// =============================================================================
// CONVENIENCE FACTORY FUNCTIONS
// =============================================================================

/**
 * Create and initialize a unified brain event module
 */
export async function createUnifiedBrainEventModule(
  moduleId: string,
  config?: Partial<UnifiedBrainEventModuleConfig>
): Promise<Result<UnifiedBrainEventModule, Error>> {
  try {
    const fullConfig: UnifiedBrainEventModuleConfig = {
      moduleId,
      ...config
    };

    const module = new UnifiedBrainEventModule(fullConfig);
    const initResult = await module.initialize();
    
    if (initResult.isErr()) {
      return err(initResult.error);
    }
    
    return ok(module);
  } catch (error) {
    return err(new Error(`Failed to create unified brain event module: ${error}`));
  }
}

/**
 * Create a unified brain event module for external service integration
 */
export async function createExternalServiceUnifiedBrainEventModule(
  serviceId: string,
  serviceName?: string,
  customConfig?: Partial<UnifiedBrainEventModuleConfig>
): Promise<Result<UnifiedBrainEventModule, Error>> {
  return createUnifiedBrainEventModule(serviceId, {
    moduleName: serviceName || `External Service ${serviceId}`,
    enableCorrelation: true,
    enableHeartbeat: true,
    heartbeatInterval: 60000, // 1 minute for external services
    enableLegacyCompatibility: true,
    enableEnhancedSaga: true,
    brainMetadata: {
      serviceType: 'external',
      integrationType: 'brain-coordination'
    },
    ...customConfig
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  UnifiedBrainEventModuleConfig,
  SafeWorkflowSupportOptions,
  SparcPhaseTransitionOptions,
  DocumentImportOptions,
  ImportWorkflowOptions,
  BrainSagaStep
};