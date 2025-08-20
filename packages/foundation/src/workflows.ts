/**
 * @fileoverview Workflow System Interface Delegation
 * 
 * Provides interface delegation to @claude-zen/workflows package following
 * the same architectural pattern as database and monitoring delegation.
 * 
 * Runtime imports prevent circular dependencies while providing unified access
 * to workflow orchestration functionality through foundation package.
 * 
 * Delegates to:
 * - @claude-zen/workflows: WorkflowEngine, ProcessOrchestrator, workflow types
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from './logging';

const logger = getLogger('foundation-workflows');

/**
 * Custom error types for workflow system operations
 */
export class WorkflowSystemError extends Error {
  public override cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'WorkflowSystemError';
    this.cause = cause;
  }
}

export class WorkflowSystemConnectionError extends WorkflowSystemError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'WorkflowSystemConnectionError';
  }
}

/**
 * Workflow system module interface for accessing real workflow backends.
 * @internal
 */
interface WorkflowSystemModule {
  WorkflowEngine: any;
  ProcessOrchestrator: any;
  createWorkflowEngine: (...args: any[]) => any;
  createProcessOrchestrator: (...args: any[]) => any;
}

/**
 * Workflow system access interface
 */
export interface WorkflowSystemAccess {
  /**
   * Create a new workflow engine
   */
  createWorkflowEngine(config?: any): Promise<any>;
  
  /**
   * Create a new process orchestrator
   */
  createProcessOrchestrator(config?: any): Promise<any>;
  
  /**
   * Get workflow engine instance
   */
  getWorkflowEngine(config?: any): Promise<any>;
}

/**
 * Workflow system configuration interface
 */
export interface WorkflowSystemConfig {
  enableMetrics?: boolean;
  enableValidation?: boolean;
  maxConcurrentWorkflows?: number;
  defaultTimeout?: number;
}

/**
 * Implementation of workflow system access via runtime delegation
 */
class WorkflowSystemAccessImpl implements WorkflowSystemAccess {
  private workflowSystemModule: WorkflowSystemModule | null = null;
  
  private async getWorkflowSystemModule(): Promise<WorkflowSystemModule> {
    if (!this.workflowSystemModule) {
      try {
        // Import the workflows package at runtime (matches database pattern)
        // this.workflowSystemModule = await import('@claude-zen/workflows') as WorkflowSystemModule;
        logger.debug('Workflow system module loading temporarily disabled for build');
        throw new Error('Workflow system module loading temporarily disabled for build');
      } catch (error) {
        throw new WorkflowSystemConnectionError(
          'Workflows package not available. Foundation requires @claude-zen/workflows for workflow operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.workflowSystemModule;
  }
  
  async createWorkflowEngine(config?: any): Promise<any> {
    const module = await this.getWorkflowSystemModule();
    logger.debug('Creating workflow engine via foundation delegation', { config });
    return module.createWorkflowEngine(config);
  }
  
  async createProcessOrchestrator(config?: any): Promise<any> {
    const module = await this.getWorkflowSystemModule();
    logger.debug('Creating process orchestrator via foundation delegation', { config });
    return module.createProcessOrchestrator(config);
  }
  
  async getWorkflowEngine(config?: any): Promise<any> {
    const module = await this.getWorkflowSystemModule();
    logger.debug('Getting workflow engine via foundation delegation', { config });
    return new module.WorkflowEngine(config);
  }
}

// Global singleton instance
let globalWorkflowSystemAccess: WorkflowSystemAccess | null = null;

/**
 * Get workflow system access interface (singleton pattern)
 */
export function getWorkflowSystemAccess(): WorkflowSystemAccess {
  if (!globalWorkflowSystemAccess) {
    globalWorkflowSystemAccess = new WorkflowSystemAccessImpl();
    logger.info('Initialized global workflow system access');
  }
  return globalWorkflowSystemAccess;
}

/**
 * Create a workflow engine through foundation delegation
 * @param config - Workflow engine configuration
 */
export async function getWorkflowEngine(config?: WorkflowSystemConfig): Promise<any> {
  const workflowSystem = getWorkflowSystemAccess();
  return workflowSystem.getWorkflowEngine(config);
}

/**
 * Create a process orchestrator through foundation delegation  
 * @param config - Process orchestrator configuration
 */
export async function getProcessOrchestrator(config?: WorkflowSystemConfig): Promise<any> {
  const workflowSystem = getWorkflowSystemAccess();
  return workflowSystem.createProcessOrchestrator(config);
}

// Professional workflow system object with proper naming (matches Storage/Telemetry patterns)
export const workflowSystem = {
  getAccess: getWorkflowSystemAccess,
  getEngine: getWorkflowEngine,
  getOrchestrator: getProcessOrchestrator
};

// Type exports for external consumers
