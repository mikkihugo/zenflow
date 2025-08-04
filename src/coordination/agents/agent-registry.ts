/**
 * Agent Registry - Manages registration and discovery of agents
 *
 * Provides a centralized registry for agent management, allowing
 * agents to be discovered, queried, and managed across the system.
 */

import { EventEmitter } from 'node:events';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator';
import type {
  AgentCapabilities,
  AgentId,
  AgentMetrics,
  AgentStatus,
  AgentType,
} from '../../types/agent-types';

export interface AgentRegistryQuery {
  type?: AgentType;
  status?: AgentStatus;
  namePattern?: string;
  capabilities?: string[];
  minSuccessRate?: number;
  maxLoadFactor?: number;
}

export interface RegisteredAgent {
  id: AgentId;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  metrics: AgentMetrics;
  registeredAt: Date;
  lastSeen: Date;
  loadFactor: number;
  health: number;
}

export interface AgentSelectionCriteria {
  type?: AgentType;
  requiredCapabilities?: string[];
  excludeAgents?: AgentId[];
  prioritizeBy?: 'load' | 'performance' | 'health' | 'availability';
  maxResults?: number;
  fileType?: string;
  projectContext?: string;
  taskType?: 'performance' | 'migration' | 'testing' | 'ui-ux' | 'development' | 'analysis';
}

/**
 * Centralized agent registry for discovery and management
 */
export class AgentRegistry extends EventEmitter {
  private memory: MemoryCoordinator;
  private namespace: string;
  private agents = new Map<AgentId, RegisteredAgent>();
  private lastUpdate = new Map<AgentId, Date>();
  private healthCheckInterval?: NodeJS.Timeout;
  private initialized = false;

  constructor(memory: MemoryCoordinator, namespace: string = 'agent-registry') {
    super();
    this.memory = memory;
    this.namespace = namespace;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load existing registrations from distributed memory
    await this.loadExistingRegistrations();

    // Start health monitoring
    this.startHealthChecking();

    this.initialized = true;
    this.emit('initialized');
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Persist current state
    await this.persistRegistrations();

    this.agents.clear();
    this.lastUpdate.clear();
    this.initialized = false;

    this.emit('shutdown');
  }

  /**
   * Register an agent in the registry
   */
  async registerAgent(agent: {
    id: AgentId;
    name: string;
    type: AgentType;
    status: AgentStatus;
    capabilities: AgentCapabilities;
    metrics?: AgentMetrics;
  }): Promise<void> {
    const now = new Date();

    const registeredAgent: RegisteredAgent = {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      capabilities: agent.capabilities,
      metrics: agent.metrics || this.createDefaultMetrics(),
      registeredAt: this.agents.has(agent.id)
        ? (this.agents.get(agent.id)?.registeredAt ?? now)
        : now,
      lastSeen: now,
      loadFactor: this.calculateLoadFactor(agent.metrics),
      health: this.calculateHealth(agent.metrics, agent.status),
    };

    this.agents.set(agent.id, registeredAgent);
    this.lastUpdate.set(agent.id, now);

    // Store in distributed memory
    await this.memory.coordinate({
      type: 'write',
      sessionId: `registry-session-${agent.id}`,
      target: `${this.namespace}/agents/${agent.id}`,
      metadata: {
        data: registeredAgent,
        type: 'agent-registration',
        tags: [agent.type, agent.status],
        partition: 'registry',
      },
    });

    this.emit('agentRegistered', { agent: registeredAgent });
  }

  /**
   * Unregister an agent from the registry
   */
  async unregisterAgent(agentId: AgentId): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    this.agents.delete(agentId);
    this.lastUpdate.delete(agentId);

    // Remove from distributed memory
    await this.memory.deleteEntry(`${this.namespace}/agents/${agentId}`);

    this.emit('agentUnregistered', { agentId, agent });
  }

  /**
   * Update agent status and metrics
   */
  async updateAgent(
    agentId: AgentId,
    updates: {
      status?: AgentStatus;
      metrics?: Partial<AgentMetrics>;
      capabilities?: AgentCapabilities;
    },
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const now = new Date();

    if (updates.status) {
      agent.status = updates.status;
    }

    if (updates.metrics) {
      agent.metrics = { ...agent.metrics, ...updates.metrics };
    }

    if (updates.capabilities) {
      agent.capabilities = updates.capabilities;
    }

    agent.lastSeen = now;
    agent.loadFactor = this.calculateLoadFactor(agent.metrics);
    agent.health = this.calculateHealth(agent.metrics, agent.status);

    this.lastUpdate.set(agentId, now);

    // Update in distributed memory
    await this.memory.store(`${this.namespace}/agents/${agentId}`, agent, {
      ttl: 3600, // 1 hour TTL for agent registrations
      replicas: 2,
    });

    this.emit('agentUpdated', { agentId, agent, updates });
  }

  /**
   * Query agents matching criteria
   */
  async queryAgents(query: AgentRegistryQuery = {}): Promise<RegisteredAgent[]> {
    const agents = Array.from(this.agents.values());

    return agents.filter((agent) => {
      // Type filter
      if (query.type && agent.type !== query.type) {
        return false;
      }

      // Status filter
      if (query.status && agent.status !== query.status) {
        return false;
      }

      // Name pattern filter
      if (query.namePattern) {
        const pattern = new RegExp(query.namePattern, 'i');
        if (!pattern.test(agent.name)) {
          return false;
        }
      }

      // Capabilities filter
      if (query.capabilities && query.capabilities.length > 0) {
        const hasAllCapabilities = query.capabilities.every(
          (cap) =>
            agent.capabilities.languages?.includes(cap) ||
            agent.capabilities.frameworks?.includes(cap) ||
            agent.capabilities.domains?.includes(cap) ||
            agent.capabilities.tools?.includes(cap),
        );
        if (!hasAllCapabilities) {
          return false;
        }
      }

      // Success rate filter
      if (query.minSuccessRate !== undefined && agent.metrics.successRate < query.minSuccessRate) {
        return false;
      }

      // Load factor filter
      if (query.maxLoadFactor !== undefined && agent.loadFactor > query.maxLoadFactor) {
        return false;
      }

      return true;
    });
  }

  /**
   * Select best agents for a task based on criteria
   */
  async selectAgents(criteria: AgentSelectionCriteria): Promise<RegisteredAgent[]> {
    let candidates = await this.queryAgents({
      ...(criteria.type && { type: criteria.type }),
      status: 'idle', // Only consider idle agents
      ...(criteria.requiredCapabilities && { capabilities: criteria.requiredCapabilities }),
    });

    // Exclude specific agents
    if (criteria.excludeAgents) {
      candidates = candidates.filter((agent) => !criteria.excludeAgents?.includes(agent.id));
    }

    // Enhanced selection based on file type and task context
    if (criteria.fileType || criteria.taskType) {
      candidates = this.filterByContext(candidates, criteria);
    }

    // Sort by priority
    candidates.sort((a, b) => {
      switch (criteria.prioritizeBy) {
        case 'load':
          return a.loadFactor - b.loadFactor;
        case 'performance':
          return b.metrics.successRate - a.metrics.successRate;
        case 'health':
          return b.health - a.health;
        case 'availability':
          return (a.metrics.tasksInProgress || 0) - (b.metrics.tasksInProgress || 0);
        default: {
          // Default: balanced scoring with context awareness
          const scoreA = this.calculateSelectionScore(a, criteria);
          const scoreB = this.calculateSelectionScore(b, criteria);
          return scoreB - scoreA;
        }
      }
    });

    // Limit results
    const maxResults = criteria.maxResults || 3;
    return candidates.slice(0, maxResults);
  }

  /**
   * Get specific agent by ID
   */
  getAgent(agentId: AgentId): RegisteredAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): RegisteredAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AgentType): RegisteredAgent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.type === type);
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const agents = Array.from(this.agents.values());
    const byType = agents.reduce(
      (acc, agent) => {
        acc[agent.type] = (acc[agent.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus = agents.reduce(
      (acc, agent) => {
        acc[agent.status] = (acc[agent.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalAgents: agents.length,
      agentsByType: byType,
      agentsByStatus: byStatus,
      averageLoadFactor: agents.reduce((sum, a) => sum + a.loadFactor, 0) / agents.length || 0,
      averageHealth: agents.reduce((sum, a) => sum + a.health, 0) / agents.length || 0,
      averageSuccessRate:
        agents.reduce((sum, a) => sum + a.metrics.successRate, 0) / agents.length || 0,
    };
  }

  // Private helper methods

  private async loadExistingRegistrations(): Promise<void> {
    try {
      const entries = await this.memory.list(`${this.namespace}/agents/*`);

      for (const entry of entries) {
        if (entry.value && typeof entry.value === 'object') {
          const agent = entry.value as RegisteredAgent;
          this.agents.set(agent.id, agent);
          this.lastUpdate.set(agent.id, new Date());
        }
      }
    } catch (_error) {
      // Ignore errors during initial load
    }
  }

  private async persistRegistrations(): Promise<void> {
    const promises = Array.from(this.agents.entries()).map(([id, agent]) =>
      this.memory.store(`${this.namespace}/agents/${id}`, agent, {
        ttl: 3600000, // 1 hour
        replicas: 2,
      }),
    );

    await Promise.allSettled(promises);
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  private performHealthCheck(): void {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [agentId, lastUpdate] of this.lastUpdate) {
      if (now.getTime() - lastUpdate.getTime() > staleThreshold) {
        const agent = this.agents.get(agentId);
        if (agent && agent.status !== 'terminated') {
          // Mark as potentially stale
          agent.status = 'error';
          agent.health = Math.max(0, agent.health - 0.2);
          this.emit('agentStale', { agentId, agent });
        }
      }
    }
  }

  private createDefaultMetrics(): AgentMetrics {
    return {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageExecutionTime: 0,
      successRate: 1.0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkUsage: 0,
      codeQuality: 1.0,
      testCoverage: 0,
      bugRate: 0,
      userSatisfaction: 1.0,
      totalUptime: 0,
      lastActivity: new Date(),
      responseTime: 0,
      tasksInProgress: 0,
      resourceUsage: {
        memory: 0,
        cpu: 0,
      },
    };
  }

  private calculateLoadFactor(metrics?: AgentMetrics): number {
    if (!metrics) return 0;

    // Simple load factor calculation
    const taskLoad =
      (metrics.tasksInProgress || 0) /
      Math.max(1, metrics.tasksCompleted + (metrics.tasksInProgress || 0));
    const resourceLoad =
      ((metrics.resourceUsage?.memory || 0) + (metrics.resourceUsage?.cpu || 0)) / 2;

    return Math.min(1, taskLoad * 0.6 + resourceLoad * 0.4);
  }

  private calculateHealth(metrics?: AgentMetrics, status?: AgentStatus): number {
    if (!metrics) return 1.0;

    let health = 1.0;

    // Status penalty
    if (status === 'error') health *= 0.5;
    if (status === 'terminated') health = 0;

    // Success rate factor
    health *= metrics.successRate;

    // Resource usage penalty
    const resourcePenalty = Math.max(
      0,
      ((metrics.resourceUsage?.memory || 0) + (metrics.resourceUsage?.cpu || 0)) / 2 - 0.8,
    );
    health -= resourcePenalty * 0.3;

    return Math.max(0, Math.min(1, health));
  }

  private calculateSelectionScore(
    agent: RegisteredAgent,
    criteria?: AgentSelectionCriteria,
  ): number {
    // Balanced scoring for agent selection
    const availabilityScore = (1 - agent.loadFactor) * 0.3;
    const performanceScore = agent.metrics.successRate * 0.4;
    const healthScore = agent.health * 0.3;

    let contextScore = 0;
    if (criteria) {
      contextScore = this.calculateContextScore(agent, criteria) * 0.2;
    }

    return availabilityScore + performanceScore + healthScore + contextScore;
  }

  private filterByContext(
    candidates: RegisteredAgent[],
    criteria: AgentSelectionCriteria,
  ): RegisteredAgent[] {
    const fileTypeToAgents = this.getFileTypeMapping();
    const taskTypeToAgents = this.getTaskTypeMapping();

    return candidates.filter((agent) => {
      // File type matching
      if (criteria.fileType && fileTypeToAgents[criteria.fileType]) {
        const relevantTypes = fileTypeToAgents[criteria.fileType];
        if (relevantTypes && !relevantTypes.includes(agent.type)) {
          return false;
        }
      }

      // Task type matching
      if (criteria.taskType && taskTypeToAgents[criteria.taskType]) {
        const relevantTypes = taskTypeToAgents[criteria.taskType];
        if (relevantTypes && !relevantTypes.includes(agent.type)) {
          return false;
        }
      }

      return true;
    });
  }

  private calculateContextScore(agent: RegisteredAgent, criteria: AgentSelectionCriteria): number {
    const fileTypeToAgents = this.getFileTypeMapping();
    const taskTypeToAgents = this.getTaskTypeMapping();

    let score = 0;

    // File type relevance
    if (criteria.fileType && fileTypeToAgents[criteria.fileType]) {
      const relevantTypes = fileTypeToAgents[criteria.fileType];
      if (relevantTypes?.includes(agent.type)) {
        score += 0.5;
      }
    }

    // Task type relevance
    if (criteria.taskType && taskTypeToAgents[criteria.taskType]) {
      const relevantTypes = taskTypeToAgents[criteria.taskType];
      if (relevantTypes?.includes(agent.type)) {
        score += 0.5;
      }
    }

    return Math.min(1, score);
  }

  private getFileTypeMapping(): Record<string, AgentType[]> {
    return {
      // Frontend files
      tsx: ['frontend-dev', 'ui-designer', 'ux-designer', 'accessibility-specialist'],
      jsx: ['frontend-dev', 'ui-designer', 'ux-designer'],
      css: ['ui-designer', 'frontend-dev'],
      scss: ['ui-designer', 'frontend-dev'],
      html: ['frontend-dev', 'ui-designer', 'accessibility-specialist'],

      // Backend files
      js: ['fullstack-dev', 'dev-backend-api', 'frontend-dev'],
      ts: ['fullstack-dev', 'dev-backend-api', 'frontend-dev'],
      py: ['dev-backend-api', 'ai-ml-specialist', 'data-ml-model'],
      java: ['dev-backend-api', 'system-architect'],
      go: ['dev-backend-api', 'performance-analyzer'],

      // Database files
      sql: ['database-architect', 'data-ml-model', 'etl-specialist'],
      mongodb: ['database-architect', 'data-ml-model'],

      // DevOps files
      yaml: ['ops-cicd-github', 'infrastructure-ops'],
      yml: ['ops-cicd-github', 'infrastructure-ops'],
      dockerfile: ['infrastructure-ops', 'deployment-ops'],
      tf: ['infrastructure-ops', 'cloud-architect'],

      // Documentation
      md: ['technical-writer', 'readme-writer', 'user-guide-writer'],
      rst: ['technical-writer', 'user-guide-writer'],

      // Performance files
      wasm: ['performance-analyzer', 'bottleneck-analyzer', 'latency-optimizer'],
      c: ['performance-analyzer', 'embedded-specialist', 'latency-optimizer'],
      cpp: ['performance-analyzer', 'embedded-specialist', 'latency-optimizer'],
      rs: ['performance-analyzer', 'memory-optimizer', 'latency-optimizer'],
    };
  }

  private getTaskTypeMapping(): Record<string, AgentType[]> {
    return {
      performance: [
        'performance-analyzer',
        'cache-optimizer',
        'memory-optimizer',
        'latency-optimizer',
        'bottleneck-analyzer',
        'performance-benchmarker',
        'load-balancer',
        'topology-optimizer',
      ],
      migration: [
        'legacy-analyzer',
        'modernization-agent',
        'migration-coordinator',
        'migration-plan',
        'system-architect',
        'database-architect',
      ],
      testing: [
        'unit-tester',
        'integration-tester',
        'e2e-tester',
        'performance-tester',
        'tdd-london-swarm',
        'production-validator',
      ],
      'ui-ux': [
        'ux-designer',
        'ui-designer',
        'accessibility-specialist',
        'frontend-dev',
        'user-guide-writer',
      ],
      development: [
        'coder',
        'developer',
        'fullstack-dev',
        'frontend-dev',
        'dev-backend-api',
        'api-dev',
      ],
      analysis: [
        'analyst',
        'analyze-code-quality',
        'performance-analyzer',
        'security-analyzer',
        'refactoring-analyzer',
        'data-ml-model',
      ],
    };
  }
}
