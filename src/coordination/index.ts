/**
 * Coordination Domain - Index  
 * Exports for agent coordination and swarm management
 * Provides unified coordination capabilities for distributed systems
 */

// Core coordination components
export { CoordinationManager } from './manager';

// Re-export coordination types
export type {
  CoordinationConfig,
  Agent,
  Task,
  CoordinationEvent,
  AgentStatus,
  TaskStatus,
  CoordinationMetrics
} from './manager';

// Coordination utilities and helpers
export const CoordinationUtils = {
  /**
   * Create a default coordination configuration
   */
  createDefaultConfig: (): CoordinationConfig => ({
    maxAgents: 10,
    heartbeatInterval: 5000,
    timeout: 30000,
    enableHealthCheck: true
  }),

  /**
   * Generate unique agent ID
   */
  generateAgentId: (type: string): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${type}-${timestamp}-${random}`;
  },

  /**
   * Generate unique task ID
   */
  generateTaskId: (type: string): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `task-${type}-${timestamp}-${random}`;
  },

  /**
   * Validate agent configuration
   */
  validateAgent: (agent: Partial<Agent>): boolean => {
    return Boolean(
      agent.id &&
      agent.type &&
      agent.capabilities &&
      Array.isArray(agent.capabilities)
    );
  },

  /**
   * Validate task configuration
   */
  validateTask: (task: Partial<Task>): boolean => {
    return Boolean(
      task.id &&
      task.type &&
      typeof task.priority === 'number' &&
      task.priority >= 0 &&
      task.priority <= 100
    );
  },

  /**
   * Calculate agent workload score
   */
  calculateWorkload: (agent: Agent): number => {
    const statusMultiplier = {
      idle: 0,
      busy: 1,
      error: 0.5,
      offline: 0
    };
    
    const baseScore = agent.taskCount * 10;
    const statusScore = statusMultiplier[agent.status] * 20;
    const ageScore = Math.max(0, 100 - (Date.now() - agent.created.getTime()) / 60000);
    
    return baseScore + statusScore + ageScore;
  },

  /**
   * Get optimal agent for task assignment
   */
  selectOptimalAgent: (agents: Agent[], task: Task): Agent | null => {
    const eligibleAgents = agents.filter(agent => 
      agent.status === 'idle' &&
      agent.capabilities.some(cap => task.type.includes(cap))
    );

    if (eligibleAgents.length === 0) return null;

    // Sort by workload (ascending) and capabilities match (descending)
    return eligibleAgents.sort((a, b) => {
      const workloadDiff = CoordinationUtils.calculateWorkload(a) - CoordinationUtils.calculateWorkload(b);
      if (workloadDiff !== 0) return workloadDiff;
      
      const aMatches = a.capabilities.filter(cap => task.type.includes(cap)).length;
      const bMatches = b.capabilities.filter(cap => task.type.includes(cap)).length;
      return bMatches - aMatches;
    })[0];
  }
};

// Coordination patterns and strategies
export const CoordinationPatterns = {
  /**
   * Round-robin task assignment pattern
   */
  roundRobin: (agents: Agent[]): Agent | null => {
    const idleAgents = agents.filter(a => a.status === 'idle');
    if (idleAgents.length === 0) return null;
    
    // Find agent with lowest task count
    return idleAgents.reduce((min, current) => 
      current.taskCount < min.taskCount ? current : min
    );
  },

  /**
   * Load-based task assignment pattern
   */
  loadBased: (agents: Agent[]): Agent | null => {
    const availableAgents = agents.filter(a => 
      a.status === 'idle' || (a.status === 'busy' && a.taskCount < 3)
    );
    
    if (availableAgents.length === 0) return null;
    
    return availableAgents.sort((a, b) => 
      CoordinationUtils.calculateWorkload(a) - CoordinationUtils.calculateWorkload(b)
    )[0];
  },

  /**
   * Capability-based task assignment pattern
   */
  capabilityBased: (agents: Agent[], requiredCapabilities: string[]): Agent | null => {
    const matchingAgents = agents.filter(agent => 
      agent.status === 'idle' &&
      requiredCapabilities.every(cap => agent.capabilities.includes(cap))
    );

    if (matchingAgents.length === 0) return null;

    // Return agent with most capabilities
    return matchingAgents.sort((a, b) => 
      b.capabilities.length - a.capabilities.length
    )[0];
  }
};

// Coordination factory for creating managers
export class CoordinationFactory {
  private static instances = new Map<string, CoordinationManager>();

  /**
   * Create or get a coordination manager instance
   */
  static getInstance(
    config: CoordinationConfig,
    instanceKey = 'default',
    logger?: any,
    eventBus?: any
  ): CoordinationManager {
    if (!this.instances.has(instanceKey)) {
      const manager = new CoordinationManager(config, logger, eventBus);
      this.instances.set(instanceKey, manager);
    }
    
    return this.instances.get(instanceKey)!;
  }

  /**
   * Clear all cached instances
   */
  static clearInstances(): void {
    for (const [, manager] of this.instances) {
      manager.stop();
    }
    this.instances.clear();
  }

  /**
   * Get all active manager instances
   */
  static getActiveInstances(): string[] {
    return Array.from(this.instances.keys());
  }
}

// Default export is the main coordination manager
export { CoordinationManager as default } from './manager';