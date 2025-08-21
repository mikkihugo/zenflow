/**
 * @fileoverview Agent Monitoring System Interface Delegation
 * 
 * Provides interface delegation to @claude-zen/agent-monitoring package following
 * the same architectural pattern as database and monitoring delegation.
 * 
 * Runtime imports prevent circular dependencies while providing unified access
 * to comprehensive agent health monitoring, intelligence systems, and performance tracking through operations package.
 * 
 * Delegates to:
 * - @claude-zen/agent-monitoring: Agent health monitoring, intelligence systems, performance tracking
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation/logging';

const logger = getLogger('operations-agent-monitoring');

/**
 * Custom error types for agent monitoring operations
 */
export class AgentMonitoringSystemError extends Error {
  public override cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'AgentMonitoringSystemError';
    if (cause) {
      this.cause = cause;
    }
  }
}

export class AgentMonitoringSystemConnectionError extends AgentMonitoringSystemError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'AgentMonitoringSystemConnectionError';
  }
}

/**
 * Agent monitoring module interface for accessing real agent monitoring backends.
 * @internal
 */
interface AgentMonitoringSystemModule {
  IntelligenceSystem: any;
  IntelligenceFactory: any;
  PerformanceTracker: any;
  TaskPredictor: any;
  AgentHealthMonitor: any;
  createIntelligenceSystem: (...args: any[]) => any;
  createIntelligenceFactory: (...args: any[]) => any;
  createPerformanceTracker: (...args: any[]) => any;
}

/**
 * Agent monitoring access interface
 */
interface AgentMonitoringSystemAccess {
  /**
   * Create a new intelligence system
   */
  createIntelligenceSystem(config?: any): Promise<any>;
  
  /**
   * Create a new intelligence factory
   */
  createIntelligenceFactory(config?: any): Promise<any>;
  
  /**
   * Create a new performance tracker
   */
  createPerformanceTracker(config?: any): Promise<any>;
  
  /**
   * Create a new task predictor
   */
  createTaskPredictor(config?: any): Promise<any>;
  
  /**
   * Create an agent health monitor
   */
  createAgentHealthMonitor(config?: any): Promise<any>;
}

/**
 * Agent monitoring configuration interface
 */
interface AgentMonitoringSystemConfig {
  enableIntelligenceTracking?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableHealthMonitoring?: boolean;
  enableTaskPrediction?: boolean;
  monitoringInterval?: number;
  healthThreshold?: number;
  performanceMetrics?: string[];
}

/**
 * Implementation of agent monitoring access via runtime delegation
 */
class AgentMonitoringSystemAccessImpl implements AgentMonitoringSystemAccess {
  private agentMonitoringModule: AgentMonitoringSystemModule | null = null;
  
  private async getAgentMonitoringModule(): Promise<AgentMonitoringSystemModule> {
    if (!this.agentMonitoringModule) {
      try {
        // Import the agent-monitoring package at runtime (matches database pattern)
        // Use dynamic import with string to avoid TypeScript compile-time checking
        const packageName = '@claude-zen/agent-monitoring';
        this.agentMonitoringModule = await import(packageName) as AgentMonitoringSystemModule;
        logger.debug('Agent monitoring module loaded successfully');
      } catch (error) {
        throw new AgentMonitoringSystemConnectionError(
          'Agent monitoring package not available. Operations requires @claude-zen/agent-monitoring for monitoring operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.agentMonitoringModule;
  }
  
  async createIntelligenceSystem(config?: any): Promise<any> {
    const module = await this.getAgentMonitoringModule();
    logger.debug('Creating intelligence system via operations delegation', { config });
    return module.createIntelligenceSystem ? module.createIntelligenceSystem(config) : new module.IntelligenceSystem(config);
  }
  
  async createIntelligenceFactory(config?: any): Promise<any> {
    const module = await this.getAgentMonitoringModule();
    logger.debug('Creating intelligence factory via operations delegation', { config });
    return module.createIntelligenceFactory ? module.createIntelligenceFactory(config) : new module.IntelligenceFactory(config);
  }
  
  async createPerformanceTracker(config?: any): Promise<any> {
    const module = await this.getAgentMonitoringModule();
    logger.debug('Creating performance tracker via operations delegation', { config });
    return module.createPerformanceTracker ? module.createPerformanceTracker(config) : new module.PerformanceTracker(config);
  }
  
  async createTaskPredictor(config?: any): Promise<any> {
    const module = await this.getAgentMonitoringModule();
    logger.debug('Creating task predictor via operations delegation', { config });
    return new module.TaskPredictor(config);
  }
  
  async createAgentHealthMonitor(config?: any): Promise<any> {
    const module = await this.getAgentMonitoringModule();
    logger.debug('Creating agent health monitor via operations delegation', { config });
    return new module.AgentHealthMonitor(config);
  }
}

// Global singleton instance
let globalAgentMonitoringSystemAccess: AgentMonitoringSystemAccess | null = null;

/**
 * Get agent monitoring access interface (singleton pattern)
 */
export function getAgentMonitoringSystemAccess(): AgentMonitoringSystemAccess {
  if (!globalAgentMonitoringSystemAccess) {
    globalAgentMonitoringSystemAccess = new AgentMonitoringSystemAccessImpl();
    logger.info('Initialized global agent monitoring access');
  }
  return globalAgentMonitoringSystemAccess;
}

/**
 * Create an intelligence system through operations delegation
 * @param config - Intelligence system configuration
 */
export async function getIntelligenceSystem(config?: AgentMonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getAgentMonitoringSystemAccess();
  return monitoringSystem.createIntelligenceSystem(config);
}

/**
 * Create an intelligence factory through operations delegation  
 * @param config - Intelligence factory configuration
 */
export async function getIntelligenceFactory(config?: AgentMonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getAgentMonitoringSystemAccess();
  return monitoringSystem.createIntelligenceFactory(config);
}

/**
 * Create a performance tracker through operations delegation  
 * @param config - Performance tracker configuration
 */
export async function getPerformanceTracker(config?: AgentMonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getAgentMonitoringSystemAccess();
  return monitoringSystem.createPerformanceTracker(config);
}

/**
 * Create a task predictor through operations delegation  
 * @param config - Task predictor configuration
 */
export async function getTaskPredictor(config?: AgentMonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getAgentMonitoringSystemAccess();
  return monitoringSystem.createTaskPredictor(config);
}

/**
 * Create an agent health monitor through operations delegation  
 * @param config - Agent health monitor configuration
 */
export async function getAgentHealthMonitor(config?: AgentMonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getAgentMonitoringSystemAccess();
  return monitoringSystem.createAgentHealthMonitor(config);
}

/**
 * Get LLM provider through operations delegation (fallback implementation)
 * @param config - LLM provider configuration
 */
export async function getLLMProvider(config?: any): Promise<any> {
  logger.debug('Creating LLM provider via operations facade (fallback mode)', { config });
  
  // Simple fallback LLM provider
  return {
    complete: async (prompt: string, options: any = {}) => {
      logger.debug('LLM completion request (fallback mode)', { 
        promptLength: prompt.length, 
        options 
      });
      return `LLM response for: ${prompt.substring(0, 50)}...`;
    },
    chat: async (messages: any[], options: any = {}) => {
      logger.debug('LLM chat request (fallback mode)', { 
        messageCount: messages.length, 
        options 
      });
      return `Chat response for ${messages.length} messages`;
    }
  };
}

// Simple AgentMonitor class for compatibility
export class AgentMonitor {
  async track() { return {}; }
}

export function createAgentMonitor() {
  return new AgentMonitor();
}

// Professional agent monitoring object with proper naming (matches Storage/Telemetry patterns)
export const agentMonitoringSystem = {
  getAccess: getAgentMonitoringSystemAccess,
  getIntelligenceSystem: getIntelligenceSystem,
  getIntelligenceFactory: getIntelligenceFactory,
  getPerformanceTracker: getPerformanceTracker,
  getTaskPredictor: getTaskPredictor,
  getHealthMonitor: getAgentHealthMonitor
};

// Type exports for external consumers
export type {
  AgentMonitoringSystemAccess,
  AgentMonitoringSystemConfig
};