/**
 * Agent Registry - Centralized tracking of all agents and their capabilities
 * Implements Single Responsibility principle for agent state management
 */

import { ILogger } from '../../core/logger.js';
import {
  RegisteredAgent,
  AgentProfile,
  AgentStatus,
  RegistryStatistics,
  AgentStatusSubscriber,
  PerformanceHistory
} from './types.js';

/**
 * Implementation of PerformanceHistory for tracking agent performance
 */
class AgentPerformanceHistory implements PerformanceHistory {
  tasksCompleted: number = 0;
  tasksFailed: number = 0;
  averageDuration: number = 0;
  successRate: number = 1.0;
  qualityScores: number[] = [];
  lastUpdated: Date = new Date();
  
  private durations: number[] = [];
  private failures: string[] = [];

  addCompletion(duration: number, estimatedDuration: number): void {
    this.tasksCompleted++;
    this.durations.push(duration);
    
    // Keep only recent durations (last 100)
    if (this.durations.length > 100) {
      this.durations = this.durations.slice(-100);
    }
    
    this.averageDuration = this.durations.reduce((sum, d) => sum + d, 0) / this.durations.length;
    this.successRate = this.tasksCompleted / (this.tasksCompleted + this.tasksFailed);
    this.lastUpdated = new Date();
    
    // Add quality score based on duration accuracy
    const accuracy = Math.max(0, 1 - Math.abs(duration - estimatedDuration) / estimatedDuration);
    this.qualityScores.push(Math.min(1, accuracy + 0.5));
    
    if (this.qualityScores.length > 50) {
      this.qualityScores = this.qualityScores.slice(-50);
    }
  }

  addFailure(reason: string): void {
    this.tasksFailed++;
    this.failures.push(reason);
    
    if (this.failures.length > 50) {
      this.failures = this.failures.slice(-50);
    }
    
    this.successRate = this.tasksCompleted / (this.tasksCompleted + this.tasksFailed);
    this.qualityScores.push(0); // Failed tasks get 0 quality
    this.lastUpdated = new Date();
  }

  getRecentSuccessRate(window: number = 10): number {
    const recentTotal = Math.min(window, this.tasksCompleted + this.tasksFailed);
    if (recentTotal === 0) return 1.0;
    
    const recentFailures = Math.min(window, this.tasksFailed);
    return Math.max(0, (recentTotal - recentFailures) / recentTotal);
  }

  getAverageQuality(window: number = 20): number {
    if (this.qualityScores.length === 0) return 0.8; // Default quality
    
    const recentScores = this.qualityScores.slice(-window);
    return recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  }
}

/**
 * Centralized registry for all active agents with efficient capability indexing
 */
export class AgentRegistry {
  private activeAgents: Map<string, RegisteredAgent> = new Map();
  private capabilityIndex: Map<string, Set<string>> = new Map();
  private statusSubscribers: Set<AgentStatusSubscriber> = new Set();
  private registryHealth: number = 1.0;

  constructor(private logger: ILogger) {
    this.logger.info('Agent Registry initialized');
  }

  /**
   * Register new agent with comprehensive metadata
   */
  async registerAgent(agentId: string, profile: AgentProfile): Promise<void> {
    try {
      const registeredAgent: RegisteredAgent = {
        id: agentId,
        profile,
        status: 'available',
        currentWorkload: 0,
        capabilities: profile.capabilities || [],
        performanceHistory: new AgentPerformanceHistory(),
        registeredAt: new Date(),
        lastActivity: new Date(),
        metadata: profile.metadata || {}
      };

      this.activeAgents.set(agentId, registeredAgent);
      this.updateCapabilityIndex(agentId, registeredAgent.capabilities);
      
      this.logger.info(`Registered agent ${agentId} with capabilities: [${registeredAgent.capabilities.join(', ')}]`);
      
      await this.notifyStatusChange(agentId, 'available');
      this.updateRegistryHealth();

    } catch (error) {
      this.logger.error(`Failed to register agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Unregister agent and cleanup all references
   */
  async unregisterAgent(agentId: string): Promise<void> {
    try {
      const agent = this.activeAgents.get(agentId);
      if (!agent) {
        this.logger.warn(`Attempted to unregister non-existent agent: ${agentId}`);
        return;
      }

      // Remove from capability index
      this.removeFromCapabilityIndex(agentId, agent.capabilities);
      
      // Remove from active agents
      this.activeAgents.delete(agentId);
      
      this.logger.info(`Unregistered agent: ${agentId}`);
      
      await this.notifyStatusChange(agentId, 'offline');
      this.updateRegistryHealth();

    } catch (error) {
      this.logger.error(`Failed to unregister agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Find agents with matching capabilities using efficient indexing
   * Implements intersection algorithm for multiple capability requirements
   */
  async findCapableAgents(requiredCapabilities: string[]): Promise<RegisteredAgent[]> {
    if (requiredCapabilities.length === 0) {
      return Array.from(this.activeAgents.values());
    }

    let candidateIds: Set<string> | null = null;
    
    // Use capability index for efficient lookup
    for (const capability of requiredCapabilities) {
      const agentsWithCapability = this.capabilityIndex.get(capability);
      
      if (!agentsWithCapability || agentsWithCapability.size === 0) {
        // If any required capability has no agents, return empty
        return [];
      }
      
      if (candidateIds === null) {
        // First capability - initialize with all agents that have it
        candidateIds = new Set(agentsWithCapability);
      } else {
        // Subsequent capabilities - intersection with existing candidates
        const intersection = new Set<string>();
        candidateIds.forEach(id => {
          if (agentsWithCapability.has(id)) {
            intersection.add(id);
          }
        });
        candidateIds = intersection;
      }
      
      // Early termination if no candidates remain
      if (candidateIds.size === 0) {
        return [];
      }
    }

    // Convert IDs to registered agents and filter out any that no longer exist
    const capableAgents = Array.from(candidateIds || [])
      .map(id => this.activeAgents.get(id))
      .filter(agent => agent !== undefined) as RegisteredAgent[];

    this.logger.debug(`Found ${capableAgents.length} agents with capabilities: [${requiredCapabilities.join(', ')}]`);
    
    return capableAgents;
  }

  /**
   * Get specific agent by ID
   */
  async getAgent(agentId: string): Promise<RegisteredAgent | undefined> {
    return this.activeAgents.get(agentId);
  }

  /**
   * Update agent status with event notification
   */
  async updateAgentStatus(agentId: string, status: AgentStatus, metadata?: any): Promise<void> {
    const agent = this.activeAgents.get(agentId);
    if (!agent) {
      this.logger.warn(`Attempted to update status for non-existent agent: ${agentId}`);
      return;
    }

    const previousStatus = agent.status;
    agent.status = status;
    agent.lastActivity = new Date();
    
    if (metadata) {
      agent.metadata = { ...agent.metadata, ...metadata };
    }

    this.logger.debug(`Agent ${agentId} status changed: ${previousStatus} -> ${status}`);
    
    await this.notifyStatusChange(agentId, status);
    this.updateRegistryHealth();
  }

  /**
   * Update agent workload
   */
  async updateAgentWorkload(agentId: string, workload: number): Promise<void> {
    const agent = this.activeAgents.get(agentId);
    if (agent) {
      agent.currentWorkload = workload;
      agent.lastActivity = new Date();
      
      // Auto-update status based on workload
      if (workload > 0.8 && agent.status === 'available') {
        await this.updateAgentStatus(agentId, 'busy');
      } else if (workload < 0.2 && agent.status === 'busy') {
        await this.updateAgentStatus(agentId, 'available');
      }
    }
  }

  /**
   * Get all active agents
   */
  getAllActiveAgents(): RegisteredAgent[] {
    return Array.from(this.activeAgents.values());
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: AgentStatus): RegisteredAgent[] {
    return Array.from(this.activeAgents.values()).filter(agent => agent.status === status);
  }

  /**
   * Get comprehensive agent statistics
   */
  getRegistryStats(): RegistryStatistics {
    const agents = Array.from(this.activeAgents.values());
    const totalAgents = agents.length;
    
    if (totalAgents === 0) {
      return {
        totalAgents: 0,
        availableAgents: 0,
        busyAgents: 0,
        averageWorkload: 0,
        capabilityCoverage: 0,
        registryHealth: 1.0
      };
    }

    const availableAgents = agents.filter(a => a.status === 'available').length;
    const busyAgents = agents.filter(a => a.status === 'busy').length;
    const averageWorkload = agents.reduce((sum, a) => sum + a.currentWorkload, 0) / totalAgents;
    const capabilityCoverage = this.capabilityIndex.size;

    return {
      totalAgents,
      availableAgents,
      busyAgents,
      averageWorkload,
      capabilityCoverage,
      registryHealth: this.registryHealth
    };
  }

  /**
   * Subscribe to agent status changes
   */
  subscribeToStatusChanges(subscriber: AgentStatusSubscriber): void {
    this.statusSubscribers.add(subscriber);
  }

  /**
   * Unsubscribe from agent status changes
   */
  unsubscribeFromStatusChanges(subscriber: AgentStatusSubscriber): void {
    this.statusSubscribers.delete(subscriber);
  }

  /**
   * Update capability index when agent is registered
   */
  private updateCapabilityIndex(agentId: string, capabilities: string[]): void {
    for (const capability of capabilities) {
      if (!this.capabilityIndex.has(capability)) {
        this.capabilityIndex.set(capability, new Set());
      }
      this.capabilityIndex.get(capability)!.add(agentId);
    }
  }

  /**
   * Remove agent from capability index
   */
  private removeFromCapabilityIndex(agentId: string, capabilities: string[]): void {
    for (const capability of capabilities) {
      const agentSet = this.capabilityIndex.get(capability);
      if (agentSet) {
        agentSet.delete(agentId);
        
        // Clean up empty capability entries
        if (agentSet.size === 0) {
          this.capabilityIndex.delete(capability);
        }
      }
    }
  }

  /**
   * Notify all subscribers of status changes
   */
  private async notifyStatusChange(agentId: string, status: AgentStatus): Promise<void> {
    const notifications = Array.from(this.statusSubscribers).map(subscriber => {
      try {
        return subscriber.onAgentStatusChange(agentId, status);
      } catch (error) {
        this.logger.warn(`Status change subscriber error: ${error instanceof Error ? error.message : String(error)}`);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(notifications);
  }

  /**
   * Calculate and update registry health score
   */
  private updateRegistryHealth(): void {
    const stats = this.getRegistryStats();
    
    if (stats.totalAgents === 0) {
      this.registryHealth = 1.0;
      return;
    }

    // Health factors:
    // - Availability ratio (available vs total)
    // - Workload distribution (avoid overload)
    // - Capability coverage
    
    const availabilityRatio = stats.availableAgents / stats.totalAgents;
    const workloadHealth = Math.max(0, 1 - stats.averageWorkload);
    const coverageHealth = Math.min(1, stats.capabilityCoverage / 10); // Assume 10 capabilities is good
    
    this.registryHealth = (availabilityRatio * 0.4 + workloadHealth * 0.4 + coverageHealth * 0.2);
  }

  /**
   * Cleanup stale agents that haven't been active recently
   */
  async cleanupStaleAgents(maxInactiveTime: number = 3600000): Promise<string[]> {
    const now = new Date();
    const staleAgents: string[] = [];
    
    for (const [agentId, agent] of this.activeAgents) {
      const inactiveTime = now.getTime() - agent.lastActivity.getTime();
      
      if (inactiveTime > maxInactiveTime && agent.status !== 'busy') {
        staleAgents.push(agentId);
      }
    }

    // Remove stale agents
    for (const agentId of staleAgents) {
      await this.unregisterAgent(agentId);
    }

    if (staleAgents.length > 0) {
      this.logger.info(`Cleaned up ${staleAgents.length} stale agents`);
    }

    return staleAgents;
  }

  /**
   * Get detailed capability analysis
   */
  getCapabilityAnalysis(): {
    totalCapabilities: number;
    capabilityDistribution: Record<string, number>;
    mostCommonCapabilities: string[];
    rareCapabilities: string[];
  } {
    const capabilityDistribution: Record<string, number> = {};
    
    // Count agents per capability
    for (const [capability, agentSet] of this.capabilityIndex) {
      capabilityDistribution[capability] = agentSet.size;
    }

    // Sort capabilities by frequency
    const sortedCapabilities = Object.entries(capabilityDistribution)
      .sort(([,a], [,b]) => b - a);

    const mostCommon = sortedCapabilities.slice(0, 5).map(([cap]) => cap);
    const rare = sortedCapabilities.slice(-5).map(([cap]) => cap);

    return {
      totalCapabilities: this.capabilityIndex.size,
      capabilityDistribution,
      mostCommonCapabilities: mostCommon,
      rareCapabilities: rare
    };
  }

  /**
   * Shutdown registry and cleanup resources
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Agent Registry');
    
    // Clear all data structures
    this.activeAgents.clear();
    this.capabilityIndex.clear();
    this.statusSubscribers.clear();
    
    this.logger.info('Agent Registry shutdown complete');
  }
}