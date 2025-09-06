/**
 * @fileoverview Event Module Factory
 * 
 * Factory functions for creating standardized domain-specific event modules.
 * Provides consistent patterns for brain, coordination, and custom domain modules.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// =============================================================================
// IMPORTS
// =============================================================================

import {
  EventBus,
  ok,
  err,
  Result
} from '@claude-zen/foundation';

import {
  BaseEventModule,
  type BaseEventModuleConfig,
  type IEventModule,
  validateEventModuleConfig
} from './base-event-module.js';

// Re-export IEventModule so it's available from this module
export type { IEventModule };

// =============================================================================
// DOMAIN-SPECIFIC CONFIGURATIONS
// =============================================================================

/**
 * Standard configuration for Brain domain event modules
 */
export interface BrainModuleConfig extends Omit<BaseEventModuleConfig, 'supportedEvents'> {
  /** Optional custom event patterns beyond the defaults */
  customEventPatterns?: string[];
  
  /** Enable SAFe workflow coordination */
  enableSafeWorkflows?: boolean;
  
  /** Enable SPARC methodology integration */
  enableSparcIntegration?: boolean;
  
  /** Enable document intelligence workflows */
  enableDocumentIntelligence?: boolean;
  
  /** Enable saga workflow management */
  enableSagaWorkflows?: boolean;
}

/**
 * Standard configuration for Coordination domain event modules
 */
export interface CoordinationModuleConfig extends Omit<BaseEventModuleConfig, 'supportedEvents'> {
  /** Optional custom event patterns beyond the defaults */
  customEventPatterns?: string[];
  
  /** Maximum number of concurrent coordination tasks */
  maxConcurrentTasks?: number;
  
  /** Default timeout for coordination operations */
  defaultOperationTimeout?: number;
  
  /** Enable TaskMaster approval integration */
  enableTaskMasterIntegration?: boolean;
  
  /** Enable resource allocation coordination */
  enableResourceAllocation?: boolean;
  
  /** Enable PI planning coordination */
  enablePIPlanningCoordination?: boolean;
}

/**
 * Configuration for custom domain event modules
 */
export interface CustomDomainModuleConfig extends BaseEventModuleConfig {
  /** Domain name for this custom module */
  domainName: string;
  
  /** Custom initialization function */
  customInitializer?: () => Promise<Result<void, Error>>;
  
  /** Custom shutdown function */
  customShutdown?: () => Promise<Result<void, Error>>;
  
  /** Custom event setup function */
  customEventSetup?: (module: IEventModule) => void;
}

// =============================================================================
// SPECIALIZED EVENT MODULE IMPLEMENTATIONS
// =============================================================================

/**
 * Brain-specific event module implementation
 */
class BrainEventModule extends BaseEventModule {
  private readonly brainConfig: BrainModuleConfig;

  constructor(config: BrainModuleConfig, eventBus?: EventBus) {
    const fullConfig: BaseEventModuleConfig = {
      ...config,
      supportedEvents: [
        'brain:coordination:*',
        'brain:document-intelligence:*',
        'coordination:brain:*',
        'document-intelligence:brain:*',
        'brain:saga:*',
        'saga:brain:*',
        ...(config.customEventPatterns || [])
      ]
    };

    super(fullConfig, eventBus);
    this.brainConfig = config;
  }

  protected async initializeDomainModule(): Promise<Result<void, Error>> {
    try {
      this.logger.info('Initializing Brain domain module', {
        enableSafeWorkflows: this.brainConfig.enableSafeWorkflows,
        enableSparcIntegration: this.brainConfig.enableSparcIntegration,
        enableDocumentIntelligence: this.brainConfig.enableDocumentIntelligence,
        enableSagaWorkflows: this.brainConfig.enableSagaWorkflows
      });

      // Initialize domain-specific features
      if (this.brainConfig.enableSagaWorkflows) {
        this.setupSagaWorkflowHandlers();
      }

      if (this.brainConfig.enableSafeWorkflows) {
        this.setupSafeWorkflowHandlers();
      }

      if (this.brainConfig.enableSparcIntegration) {
        this.setupSparcIntegrationHandlers();
      }

      if (this.brainConfig.enableDocumentIntelligence) {
        this.setupDocumentIntelligenceHandlers();
      }

      return ok();
    } catch (error) {
      return err(new Error(`Brain domain initialization failed: ${error}`));
    }
  }

  protected async shutdownDomainModule(): Promise<Result<void, Error>> {
    this.logger.info('Shutting down Brain domain module');
    // Cleanup brain-specific resources
    return ok();
  }

  protected setupEventForwarding(): void {
    // Brain-specific event forwarding patterns
    const brainEventPatterns = [
      'coordination:brain:workflow-approved',
      'coordination:brain:priority-escalated',
      'coordination:brain:resource-allocated',
      'document-intelligence:brain:import-result',
      'document-intelligence:brain:import-workflow-result',
      'document-intelligence:brain:import-error'
    ];

    for (const pattern of brainEventPatterns) {
      this.on(pattern, (event: any) => {
        this.logger.debug('Brain event forwarded', { 
          eventType: pattern, 
          requestId: event.requestId 
        });
      });
    }
  }

  private setupSagaWorkflowHandlers(): void {
    this.on('brain:saga:workflow-created', (event: any) => {
      this.logger.info('Saga workflow created', { workflowId: event.workflowId });
    });

    this.on('brain:saga:step-completed', (event: any) => {
      this.logger.info('Saga step completed', { 
        workflowId: event.workflowId, 
        stepId: event.stepId 
      });
    });
  }

  private setupSafeWorkflowHandlers(): void {
    this.on('brain:coordination:safe-workflow-support', (event: any) => {
      this.logger.info('SAFe workflow support requested', { 
        requestId: event.requestId, 
        workflowType: event.workflowType 
      });
    });
  }

  private setupSparcIntegrationHandlers(): void {
    this.on('brain:coordination:sparc-phase-ready', (event: any) => {
      this.logger.info('SPARC phase transition requested', { 
        requestId: event.requestId, 
        currentPhase: event.currentPhase,
        nextPhase: event.nextPhase
      });
    });
  }

  private setupDocumentIntelligenceHandlers(): void {
    this.on('brain:document-intelligence:import-request', (event: any) => {
      this.logger.info('Document import requested', { 
        requestId: event.requestId, 
        importType: event.importType 
      });
    });

    this.on('brain:document-intelligence:import-workflow-execute', (event: any) => {
      this.logger.info('Document import workflow requested', { 
        requestId: event.requestId, 
        workflowName: event.workflowName 
      });
    });
  }
}

/**
 * Coordination-specific event module implementation
 */
class CoordinationEventModule extends BaseEventModule {
  private readonly coordinationConfig: CoordinationModuleConfig;

  constructor(config: CoordinationModuleConfig, eventBus?: EventBus) {
    const fullConfig: BaseEventModuleConfig = {
      ...config,
      supportedEvents: [
        'coordination:brain:*',
        'coordination:document-intelligence:*',
        'coordination:taskmaster:*',
        'coordination:resource:*',
        'coordination:safe:*',
        'coordination:sparc:*',
        'brain:coordination:*',
        'document-intelligence:coordination:*',
        'taskmaster:coordination:*',
        ...(config.customEventPatterns || [])
      ]
    };

    super(fullConfig, eventBus);
    this.coordinationConfig = config;
  }

  protected async initializeDomainModule(): Promise<Result<void, Error>> {
    try {
      this.logger.info('Initializing Coordination domain module', {
        maxConcurrentTasks: this.coordinationConfig.maxConcurrentTasks,
        defaultOperationTimeout: this.coordinationConfig.defaultOperationTimeout,
        enableTaskMasterIntegration: this.coordinationConfig.enableTaskMasterIntegration,
        enableResourceAllocation: this.coordinationConfig.enableResourceAllocation,
        enablePIPlanningCoordination: this.coordinationConfig.enablePIPlanningCoordination
      });

      // Initialize coordination-specific features
      if (this.coordinationConfig.enableTaskMasterIntegration) {
        this.setupTaskMasterHandlers();
      }

      if (this.coordinationConfig.enableResourceAllocation) {
        this.setupResourceAllocationHandlers();
      }

      if (this.coordinationConfig.enablePIPlanningCoordination) {
        this.setupPIPlanningHandlers();
      }

      return ok();
    } catch (error) {
      return err(new Error(`Coordination domain initialization failed: ${error}`));
    }
  }

  protected async shutdownDomainModule(): Promise<Result<void, Error>> {
    this.logger.info('Shutting down Coordination domain module');
    // Cleanup coordination-specific resources
    return ok();
  }

  protected setupEventForwarding(): void {
    // Coordination-specific event forwarding patterns
    const coordinationEventPatterns = [
      'brain:coordination:safe-workflow-support',
      'brain:coordination:sparc-phase-ready',
      'document-intelligence:coordination:import-approved',
      'taskmaster:coordination:approval-request',
      'taskmaster:coordination:approval-granted'
    ];

    for (const pattern of coordinationEventPatterns) {
      this.on(pattern, (event: any) => {
        this.logger.debug('Coordination event forwarded', { 
          eventType: pattern, 
          requestId: event.requestId 
        });
      });
    }
  }

  private setupTaskMasterHandlers(): void {
    this.on('coordination:taskmaster:approval-request', (event: any) => {
      this.logger.info('TaskMaster approval requested', { 
        approvalId: event.approvalId, 
        approvalType: event.approvalType 
      });
    });
  }

  private setupResourceAllocationHandlers(): void {
    this.on('coordination:resource:allocation-request', (event: any) => {
      this.logger.info('Resource allocation requested', { 
        resourceType: event.resourceType, 
        allocation: event.allocation 
      });
    });
  }

  private setupPIPlanningHandlers(): void {
    this.on('coordination:safe:pi-planning-request', (event: any) => {
      this.logger.info('PI planning coordination requested', { 
        piId: event.piId, 
        planningPhase: event.planningPhase 
      });
    });
  }
}

/**
 * Custom domain event module implementation
 */
class CustomDomainEventModule extends BaseEventModule {
  private readonly customConfig: CustomDomainModuleConfig;

  constructor(config: CustomDomainModuleConfig, eventBus?: EventBus) {
    super(config, eventBus);
    this.customConfig = config;
  }

  protected async initializeDomainModule(): Promise<Result<void, Error>> {
    this.logger.info('Initializing custom domain module', { 
      domainName: this.customConfig.domainName 
    });

    if (this.customConfig.customInitializer) {
      return await this.customConfig.customInitializer();
    }

    return ok();
  }

  protected async shutdownDomainModule(): Promise<Result<void, Error>> {
    this.logger.info('Shutting down custom domain module', { 
      domainName: this.customConfig.domainName 
    });

    if (this.customConfig.customShutdown) {
      return await this.customConfig.customShutdown();
    }

    return ok();
  }

  protected setupEventForwarding(): void {
    if (this.customConfig.customEventSetup) {
      this.customConfig.customEventSetup(this);
    }
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Main factory class for creating domain-specific event modules
 */
export class EventModuleFactory {
  /**
   * Create a Brain domain event module
   */
  static createBrainModule(config: BrainModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
    try {
      const validationResult = validateEventModuleConfig({
        ...config,
        supportedEvents: ['brain:*'] // Dummy for validation, actual patterns set in constructor
      });
      
      if (validationResult.isErr()) {
        return err(validationResult.error);
      }

      const module = new BrainEventModule(config, eventBus);
      return ok(module);
    } catch (error) {
      return err(new Error(`Failed to create Brain module: ${error}`));
    }
  }

  /**
   * Create a Coordination domain event module
   */
  static createCoordinationModule(config: CoordinationModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
    try {
      const validationResult = validateEventModuleConfig({
        ...config,
        supportedEvents: ['coordination:*'] // Dummy for validation, actual patterns set in constructor
      });
      
      if (validationResult.isErr()) {
        return err(validationResult.error);
      }

      const module = new CoordinationEventModule(config, eventBus);
      return ok(module);
    } catch (error) {
      return err(new Error(`Failed to create Coordination module: ${error}`));
    }
  }

  /**
   * Create a custom domain event module
   */
  static createCustomModule(config: CustomDomainModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
    try {
      const validationResult = validateEventModuleConfig(config);
      
      if (validationResult.isErr()) {
        return err(validationResult.error);
      }

      const module = new CustomDomainEventModule(config, eventBus);
      return ok(module);
    } catch (error) {
      return err(new Error(`Failed to create custom domain module: ${error}`));
    }
  }

  /**
   * Create and initialize a Brain module with common defaults
   */
  static async createBrainModuleWithDefaults(
    moduleId: string,
    moduleName?: string,
    customConfig: Partial<BrainModuleConfig> = {}
  ): Promise<Result<IEventModule, Error>> {
    const config: BrainModuleConfig = {
      moduleId,
      moduleName: moduleName || `Brain Module ${moduleId}`,
      version: '2.1.0',
      description: `Brain domain event module for ${moduleId}`,
      enableCorrelation: true,
      enableHeartbeat: true,
      heartbeatInterval: 60000, // 1 minute
      enableSafeWorkflows: true,
      enableSparcIntegration: true,
      enableDocumentIntelligence: true,
      enableSagaWorkflows: true,
      ...customConfig
    };

    const moduleResult = EventModuleFactory.createBrainModule(config);
    if (moduleResult.isErr()) {
      return err(moduleResult.error);
    }

    const initResult = await moduleResult.value.initialize();
    if (initResult.isErr()) {
      return err(initResult.error);
    }

    return ok(moduleResult.value);
  }

  /**
   * Create and initialize a Coordination module with common defaults
   */
  static async createCoordinationModuleWithDefaults(
    moduleId: string,
    moduleName?: string,
    customConfig: Partial<CoordinationModuleConfig> = {}
  ): Promise<Result<IEventModule, Error>> {
    const config: CoordinationModuleConfig = {
      moduleId,
      moduleName: moduleName || `Coordination Module ${moduleId}`,
      version: '2.1.0',
      description: `Coordination domain event module for ${moduleId}`,
      enableCorrelation: true,
      enableHeartbeat: true,
      heartbeatInterval: 30000, // 30 seconds
      maxConcurrentTasks: 50,
      defaultOperationTimeout: 300000, // 5 minutes
      enableTaskMasterIntegration: true,
      enableResourceAllocation: true,
      enablePIPlanningCoordination: true,
      ...customConfig
    };

    const moduleResult = EventModuleFactory.createCoordinationModule(config);
    if (moduleResult.isErr()) {
      return err(moduleResult.error);
    }

    const initResult = await moduleResult.value.initialize();
    if (initResult.isErr()) {
      return err(initResult.error);
    }

    return ok(moduleResult.value);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a Brain event module (legacy compatibility function)
 */
export function createBrainEventModule(config: BrainModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
  return EventModuleFactory.createBrainModule(config, eventBus);
}

/**
 * Create a Coordination event module (legacy compatibility function)
 */
export function createCoordinationEventModule(config: CoordinationModuleConfig, eventBus?: EventBus): Result<IEventModule, Error> {
  return EventModuleFactory.createCoordinationModule(config, eventBus);
}

/**
 * Validate event module configuration (re-export for convenience)
 */
export { validateEventModuleConfig };

// =============================================================================
// TYPE EXPORTS (avoid conflicts)
// =============================================================================

// Export types using declare export to avoid duplication conflicts
declare global {
  namespace EventModuleTypes {
    export interface BrainModuleConfigType extends Omit<BaseEventModuleConfig, 'supportedEvents'> {
      customEventPatterns?: string[];
      enableSafeWorkflows?: boolean;
      enableSparcIntegration?: boolean;
      enableDocumentIntelligence?: boolean;
      enableSagaWorkflows?: boolean;
    }
    
    export interface CoordinationModuleConfigType extends Omit<BaseEventModuleConfig, 'supportedEvents'> {
      customEventPatterns?: string[];
      maxConcurrentTasks?: number;
      defaultOperationTimeout?: number;
      enableTaskMasterIntegration?: boolean;
      enableResourceAllocation?: boolean;
      enablePIPlanningCoordination?: boolean;
    }
  }
}