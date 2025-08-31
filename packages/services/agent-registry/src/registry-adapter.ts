/**
 * @fileoverview Registry Adapter - Migration bridge from custom registries to ServiceContainer
 *
 * Provides adapters and migration utilities to gradually replace custom registry
 * implementations with the battle-tested ServiceContainer (Awilix-based).
 *
 * Features:
 * - Zero breaking changes during migration
 * - Adapter pattern for existing registry interfaces
 * - Gradual migration utilities
 * - Performance comparison tools
 * - Rollback capabilities
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 *
 * @example Agent Registry Migration
 * ```typescript
 * import { AgentRegistryAdapter } from '@claude-zen/agent-registry';
 * import { AgentRegistry } from './old-agent-registry';
 *
 * // Create adapter that bridges old interface to new ServiceContainer
 * const adapter = new AgentRegistryAdapter(): void {
 *   id: 'agent-1',
 *   name: 'Test Agent',
 *   type: 'coder',
 *   status: 'idle',
 *   capabilities: { languages: ['typescript'] }
 * });
 *
 * const agents = await agentRegistry.queryAgents(): void { ServiceRegistryAdapter } from '@claude-zen/foundation';
 *
 * // Migrate existing service registry
 * const serviceRegistry = new ServiceRegistryAdapter(): void {
  /** Container name */
  containerName?:string;
  /** Enable health monitoring */
  enableHealthMonitoring?:boolean;
  /** Health check frequency in ms */
  healthCheckFrequency?:number;
  /** Migration logging */
  enableMigrationLogging?:boolean;
  /** Compatibility mode */
  strictCompatibility?: boolean;
}

/**
 * Service registration options
 */
export interface ServiceRegistrationOptions {
  capabilities?: string[];
  lifetime?: Lifetime;
  [key: string]: unknown;
}

/**
 * Service lifetime enumeration
 */
export enum Lifetime {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  SCOPED = 'scoped',
}

/**
 * Service information interface
 */
export interface ServiceInfo {
  name: string;
  capabilities: string[];
  status: string;
  [key: string]: unknown;
}

/**
 * Migration statistics
 */
export interface MigrationStats {
  /** Services migrated successfully */
  migratedServices:number;
  /** Migration failures */
  migrationFailures:number;
  /** Performance improvement percentage */
  performanceImprovement:number;
  /** Memory usage before/after */
  memoryUsage:{ before: number; after: number};
  /** Migration duration */
  migrationDuration:number;
  /** Migration timestamp */
  timestamp:Date;
}

/**
 * Base registry adapter providing common functionality
 */
export abstract class BaseRegistryAdapter extends TypedEventBase {
  protected readonly container:ReturnType<typeof createServiceContainer>;
  protected readonly logger:Logger;
  protected readonly options:Required<RegistryAdapterOptions>;

  constructor(): void {
    super(): void {
      containerName: 'registry-adapter',      enableHealthMonitoring:true,
      healthCheckFrequency:30000,
      enableMigrationLogging:true,
      strictCompatibility:true,
      ...options,
};

    this.container = createServiceContainer(): void {this.options.containerName}`);

    if (this.options.enableHealthMonitoring) {
      this.container.startHealthMonitoring(): void {
      this.logger.info(): void {
    return this.container;
}

  /**
   * Dispose resources
   */
  async dispose(): void {
    await this.container.dispose(): void {
  private agents = new Map<string, JsonValue>();

  constructor(): void {
    super(): void {
    id:string;
    name:string;
    type:string;
    status:string;
    capabilities:UnknownRecord;
    metrics?:UnknownRecord;
}): Promise<void> {
    // Perform async validation
    await this.validateAgentForRegistration(): void {
      lifetime:Lifetime.SINGLETON,
      capabilities:this.extractCapabilities(): void {
        type:agent.type,
        status:agent.status,
        metrics:agent.metrics,
},
      enabled:agent.status !== 'terminated',      healthCheck:() => agent.status !== 'error',};

    // Create a simple agent service
    class AgentService {
      constructor(): void {
        Object.assign(): void {
      throw new Error(): void { agent });
  }

  /**
   * Unregister an agent
   */
  async unregisterAgent(): void {
    // Perform async cleanup before unregistration
    await this.cleanupAgentResources(): void { agentId });
  }

  /**
   * Update agent status and metrics
   */
  async updateAgent(): void {
    // Perform async validation of updates
    await this.validateAgentUpdates(): void {
      Object.assign(): void {
        const enabled = updates.status !== 'terminated';
        this.container.setServiceEnabled(): void { agentId, agent, updates });
    }
}

  /**
   * Query agents matching criteria
   */
  async queryAgents(): void {
    // Perform async query optimization
    await this.optimizeQueryExecution(): void {
      if (query.type && agent.type !== query.type) {
        return false;
}
      if (query.status && agent.status !== query.status) {
        return false;
}
      if (query.namePattern) {
        const pattern = new RegExp(): void {
      filteredAgents = agents.filter(): void {
      const aScore =
        (a.metrics?.successRate||0.5) * (1 - (a.metrics?.loadFactor||0.5));
      const bScore =
        (b.metrics?.successRate||0.5) * (1 - (b.metrics?.loadFactor||0.5));
      return bScore - aScore;
});

    const maxResults = criteria.maxResults||3;
    return filteredAgents.slice(): void {
    return this.agents.get(): void {
    return Array.from(): void {
    return Array.from(): void {
    const agents = Array.from(): void {
        acc[agent.type] = (acc[agent.type]||0) + 1;
        return acc;
},
      {} as Record<string, number>
    );

    const byStatus = agents.reduce(): void {
        acc[agent.status] = (acc[agent.status]||0) + 1;
        return acc;
},
      {} as Record<string, number>
    );

    return {
      totalAgents:agents.length,
      agentsByType:byType,
      agentsByStatus:byStatus,
      averageLoadFactor:
        agents.reduce(): void {
    // Perform async initialization tasks
    await this.setupAdapterConfiguration(): void {
      containerName: this.container.getName(): void {
    await this.dispose(): void {});
  }

  // Private helper methods
  private async setupAdapterConfiguration(): void {
    // Setup adapter configuration
    if (this.options.enableHealthMonitoring) {
      // Initialize health monitoring
    }
    // Additional configuration setup can be added here
  }

  private extractCapabilities(): void {
    if (!capabilities) {
      return [];
}

    const caps:string[] = [];
    if (capabilities.languages) {
      caps.push(): void {
      caps.push(): void {
      caps.push(): void {
      caps.push(): void {
    const capabilities = agent.capabilities||{};
    return (
      (capabilities.languages?.includes(): void {
  private services = new Map<string, JsonValue>();

  constructor(): void {
    super(): void {}
  ):void {
    const result = this.container.registerService(): void {
      throw new Error(): void { name });
  }

  /**
   * Register an instance
   */
  registerInstance<T>(name: string, instance: T): void {
    const result = this.container.registerInstance(): void {
      throw new Error(): void {
    const result = this.container.resolve<T>(name);

    if (result.isErr(): void {
      throw new Error(): void {
    return this.container.hasService(): void {
    return this.container.getServicesByCapability(): void {
    return await this.container.getHealthStatus(): void {
    return Array.from(): void {
    return {
      totalServices:this.services.size,
      serviceNames:this.getServiceNames(): void {
  private static readonly logger = getLogger(): void {
            lifetime: service.lifetime || 'SINGLETON',
            capabilities: service.capabilities || [],
            metadata: service.metadata || {},
          });
        } else if ('registerAgent' in adapter && typeof adapter.registerAgent === 'function')Starting registry migration', {
      adapterType: AdapterClass.name,
      options,
    });

    // Migration would depend on the specific registry interface
    // This is a template for how migration would work

    const migrationDuration = Date.now(): void {
      duration: migrationDuration,
      stats: adapter.getMigrationStats(): void {
    oldPerformance:number;
    newPerformance:number;
    improvement:number;
}> {
    const runTest = async (
      _registry:UnknownRecord,
      operations:Array<() => Promise<JsonValue>>
    ):Promise<number> => {
      const start = Date.now(): void {
      oldPerformance: oldPerformance + 'ms',
      newPerformance: newPerformance + 'ms',
      improvement: improvement.toFixed(): void {
      oldPerformance,
      newPerformance,
      improvement,
    };
  }
}

/**
 * Factory functions for quick adapter creation
 */
export function createAgentRegistryAdapter(): void {
  return new AgentRegistryAdapter(): void {
  return new ServiceRegistryAdapter(): void {
  const adapter = new AdapterClass(): void {
    // Add migration logic here if needed
  }

  return adapter;
}
