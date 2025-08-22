/**
 * @fileoverview Swarm Registry - ServiceContainer-based implementation
 *
 * Modern swarm registry using battle-tested ServiceContainer (Awilix) backend.
 * Provides zero breaking changes migration from file-based SwarmRegistry implementation
 * with enhanced capabilities including health monitoring, service discovery, and metrics.
 *
 * Production-grade swarm registry using battle-tested ServiceContainer (Awilix) backend.
 *
 * Key Improvements:
 * - Battle-tested Awilix dependency injection for swarm management
 * - Health monitoring and metrics collection for all swarms
 * - Service discovery and capability-based swarm queries
 * - Type-safe registration with lifecycle management
 * - Error handling with Result patterns
 * - Event-driven notifications for registry changes
 * - Persistent storage with automatic cleanup and expiry management
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

import {
  ServiceContainer,
  createServiceContainer,
  Lifetime,
} from '@claude-zen/foundation';
import { getLogger, type Logger } from '@claude-zen/foundation';
import { TypedEventBase } from '@claude-zen/foundation';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import type { EphemeralSwarm } from './types';

/**
 * Service Container-based Swarm Registry
 *
 * Drop-in replacement for SwarmRegistry with enhanced capabilities through ServiceContainer.
 * Maintains exact API compatibility while adding health monitoring, metrics, and discovery.
 */
export class SwarmRegistry extends TypedEventBase {
  private container: ServiceContainer;
  private logger: Logger;
  private projectRoot: string;
  private swarmDir: string;
  private registryPath: string;
  private registryCache: Map<string, EphemeralSwarm>|null = null;
  private initialized = false;

  constructor() {
    super();
    this.container = createServiceContainer('swarm-registry', {
      healthCheckFrequency: 30000, // 30 seconds
      autoCleanup: true,
      persistentStorage: true,
    });
    this.logger = getLogger('SwarmRegistry');

    // Initialize paths
    this.projectRoot = this.findProjectRoot();
    this.swarmDir = join(this.projectRoot, '.zenswarm');
    this.registryPath = join(this.swarmDir, 'swarms.json');
  }

  /**
   * Initialize the swarm registry with enhanced ServiceContainer features
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Start health monitoring and auto-cleanup
      this.container.startHealthMonitoring();
      this.container.enableAutoCleanup(3600000); // 1 hour cleanup interval

      // Ensure swarm directory exists
      this.ensureSwarmDir();

      // Load existing swarms from disk and register with ServiceContainer
      await this.loadAndRegisterSwarms();

      this.initialized = true;
      this.logger.info('✅ SwarmRegistry initialized with ServiceContainer');
      this.emit('initialized', { timestamp: new Date() });
    } catch (error) {
      this.logger.error('❌ Failed to initialize SwarmRegistry:', error);
      throw error;
    }
  }

  /**
   * Add a swarm to the global registry (compatible with existing SwarmRegistry interface)
   */
  registerSwarm(swarm: EphemeralSwarm): void {
    try {
      this.logger.debug('Registering swarm', {
        swarmId: swarm.id,
        registryPath: this.registryPath,
      });

      // Register with ServiceContainer for enhanced capabilities
      const registrationResult = this.container.registerInstance(
        swarm.id,
        swarm,
        {
          capabilities: this.extractSwarmCapabilities(swarm),
          metadata: {
            type: 'ephemeral-swarm',
            task: swarm.task,
            topology: swarm.topology,
            status: swarm.status,
            registeredAt: new Date(),
            expiresAt: swarm.expiresAt,
            persistent: swarm.persistent,
          },
          enabled: swarm.status !== 'dissolved',
          healthCheck: () => this.performSwarmHealthCheck(swarm),
          lifetime: Lifetime.SINGLETON,
        }
      );

      if (registrationResult.isErr()) {
        throw new Error(
          `Failed to register swarm ${swarm.id}: ${registrationResult.error.message}`
        );
      }

      // Update file-based storage for persistence
      const registry = this.loadRegistry();
      registry.set(swarm.id, swarm);
      this.saveRegistry(registry);

      this.logger.debug('Registry updated', { swarmCount: registry.size });
      this.logger.debug('Registry saved successfully');
      this.emit('swarm-registered', swarm);
    } catch (error) {
      this.logger.error(`❌ Failed to register swarm ${swarm.id}:`, error);
      throw error;
    }
  }

  /**
   * Get a swarm from the global registry (compatible with existing SwarmRegistry interface)
   */
  getSwarm(swarmId: string): EphemeralSwarm|undefined {
    try {
      // Try ServiceContainer first for enhanced resolution
      const result = this.container.resolve<EphemeralSwarm>(swarmId);

      if (result.isOk()) {
        return result.value;
      }

      // Fallback to file-based storage
      const registry = this.loadRegistry();
      return registry.get(swarmId);
    } catch (error) {
      this.logger.warn(`⚠️ Failed to resolve swarm ${swarmId}:`, error);
      const registry = this.loadRegistry();
      return registry.get(swarmId);
    }
  }

  /**
   * Get all active swarms from the global registry (compatible with existing SwarmRegistry interface)
   */
  getAllSwarms(): EphemeralSwarm[] {
    this.logger.debug('Loading swarms from registry', {
      registryPath: this.registryPath,
    });

    try {
      // Collect swarms from ServiceContainer
      const containerSwarms: EphemeralSwarm[] = [];
      for (const serviceName of this.container.getServiceNames()) {
        const result = this.container.resolve<EphemeralSwarm>(serviceName);
        if (result.isOk() && this.isSwarmService(result.value)) {
          containerSwarms.push(result.value);
        }
      }

      // Also load from file-based storage for any swarms not in container
      const registry = this.loadRegistry();
      const fileSwarms = Array.from(registry.values())();

      // Combine and deduplicate
      const allSwarmsMap = new Map<string, EphemeralSwarm>();

      for (const swarm of [...containerSwarms, ...fileSwarms]) {
        allSwarmsMap.set(swarm.id, swarm);
      }

      this.logger.debug('Loaded registry', { swarmCount: allSwarmsMap.size });

      // Filter out expired swarms and perform cleanup
      const now = Date.now();
      const activeSwarms: EphemeralSwarm[] = [];
      let expiredCount = 0;

      for (const [id, swarm] of allSwarmsMap.entries()) {
        this.logger.debug('Checking swarm', {
          swarmId: id,
          expiresAt: swarm.expiresAt.toISOString(),
          status: swarm.status,
        });

        if (swarm.expiresAt.getTime() > now && swarm.status !== 'dissolved') {
          activeSwarms.push(swarm);
        } else {
          this.logger.debug('Removing expired/dissolved swarm', {
            swarmId: id,
          });

          // Remove from ServiceContainer
          this.container.unregister(id);

          // Remove from file storage
          registry.delete(id);
          expiredCount++;
        }
      }

      // Save cleaned registry if any swarms were removed
      if (expiredCount > 0) {
        this.logger.debug('Saving cleaned registry', {
          removedCount: expiredCount,
        });
        this.saveRegistry(registry);
      }

      this.logger.debug('Returning active swarms', {
        activeCount: activeSwarms.length,
      });
      return activeSwarms;
    } catch (error) {
      this.logger.error(
        '❌ Failed to get all swarms, falling back to file storage:',
        error
      );

      // Fallback to file-based storage only
      const registry = this.loadRegistry();
      const now = Date.now();
      return Array.from(registry.values()).filter(
        (swarm) =>
          swarm.expiresAt.getTime() > now && swarm.status !== 'dissolved'
      );
    }
  }

  /**
   * Update a swarm in the global registry (compatible with existing SwarmRegistry interface)
   */
  updateSwarm(swarm: EphemeralSwarm): void {
    try {
      // Update in ServiceContainer
      const result = this.container.resolve<EphemeralSwarm>(swarm.id);
      if (result.isOk()) {
        // Update metadata
        this.container.updateServiceMetadata(swarm.id, {
          status: swarm.status,
          expiresAt: swarm.expiresAt,
          lastActivity: new Date(),
        });
      }

      // Update file-based storage
      const registry = this.loadRegistry();
      registry.set(swarm.id, swarm);
      this.saveRegistry(registry);

      this.emit('swarm-updated', swarm);
    } catch (error) {
      this.logger.error(`❌ Failed to update swarm ${swarm.id}:`, error);
      throw error;
    }
  }

  /**
   * Remove a swarm from the global registry (compatible with existing SwarmRegistry interface)
   */
  removeSwarm(swarmId: string): void {
    try {
      // Remove from ServiceContainer
      this.container.unregister(swarmId);

      // Remove from file-based storage
      const registry = this.loadRegistry();
      registry.delete(swarmId);
      this.saveRegistry(registry);

      this.emit('swarm-removed', swarmId);
    } catch (error) {
      this.logger.error(`❌ Failed to remove swarm ${swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all swarms from the global registry (compatible with existing SwarmRegistry interface)
   */
  clearRegistry(): void {
    try {
      // Clear ServiceContainer
      for (const serviceName of this.container.getServiceNames()) {
        this.container.unregister(serviceName);
      }

      // Clear file-based storage
      this.registryCache = new Map();
      this.saveRegistry(this.registryCache);

      this.emit('registry-cleared', { timestamp: new Date() });
    } catch (error) {
      this.logger.error('❌ Failed to clear registry:', error);
      throw error;
    }
  }

  /**
   * Get the count of active swarms (compatible with existing SwarmRegistry interface)
   */
  getSwarmCount(): number {
    return this.getAllSwarms().length;
  }

  /**
   * Get swarms by capability (NEW - ServiceContainer enhancement)
   */
  getSwarmsByCapability(capability: string): EphemeralSwarm[] {
    const serviceInfos = this.container.getServicesByCapability(capability);
    const swarms: EphemeralSwarm[] = [];

    for (const serviceInfo of serviceInfos) {
      const result = this.container.resolve<EphemeralSwarm>(serviceInfo.name);
      if (result.isOk() && this.isSwarmService(result.value)) {
        swarms.push(result.value);
      }
    }

    return swarms;
  }

  /**
   * Get health status (NEW - ServiceContainer enhancement)
   */
  async getHealthStatus() {
    return await this.container.getHealthStatus();
  }

  /**
   * Enable/disable swarm (NEW - ServiceContainer enhancement)
   */
  setSwarmEnabled(swarmId: string, enabled: boolean) {
    const result = this.container.setServiceEnabled(swarmId, enabled);

    if (result.isOk()) {
      this.logger.debug(
        `${enabled ? '✅' : '❌'} ${enabled ? 'Enabled' : 'Disabled'} swarm: ${swarmId}`
      );
      this.emit('swarm-status-changed', { swarmId, enabled });
    }

    return result.isOk();
  }

  /**
   * Get swarms by status (NEW - ServiceContainer enhancement)
   */
  getSwarmsByStatus(status: EphemeralSwarm['status']): EphemeralSwarm[] {
    return this.getAllSwarms().filter((swarm) => swarm.status === status);
  }

  /**
   * Get swarm statistics (NEW - ServiceContainer enhancement)
   */
  getSwarmStats() {
    const allSwarms = this.getAllSwarms();
    const containerStats = this.container.getStats();

    const statusCounts = allSwarms.reduce(
      (counts, swarm) => {
        counts[swarm.status] = (counts[swarm.status]||0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    const topologyCounts = allSwarms.reduce(
      (counts, swarm) => {
        counts[swarm.topology] = (counts[swarm.topology]||0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    return {
      totalSwarms: allSwarms.length,
      enabledSwarms: containerStats.enabledServices,
      disabledSwarms: containerStats.disabledServices,
      statusCounts,
      topologyCounts,
      averagePerformance: this.calculateAveragePerformance(allSwarms),
      oldestSwarm: this.getOldestSwarm(allSwarms),
      newestSwarm: this.getNewestSwarm(allSwarms),
    };
  }

  /**
   * Shutdown the registry (NEW - ServiceContainer enhancement)
   */
  async shutdown(): Promise<void> {
    this.logger.info('🔄 Shutting down swarm registry...');

    try {
      // Save current state before shutdown
      const allSwarms = this.getAllSwarms();
      const registry = new Map(allSwarms.map((swarm) => [swarm.id, swarm]));
      this.saveRegistry(registry);

      // Dispose ServiceContainer
      await this.container.dispose();

      this.initialized = false;
      this.logger.info('✅ Swarm registry shut down');
      this.emit('shutdown', { timestamp: new Date() });
    } catch (error) {
      this.logger.error('❌ Error during registry shutdown:', error);
      throw error;
    }
  }

  // Private helper methods

  private findProjectRoot(): string {
    let currentDir = cwd();

    // First, look for monorepo markers (higher priority)
    const monorepoMarkers = [
      'pnpm-workspace.yaml',
      'nx.json',
      'turbo.json',
      'lerna.json',
    ];
    const projectMarkers = ['.git', 'package.json'];

    // Start from current directory and walk up
    while (currentDir !== '/') {
      // Check for monorepo markers first
      for (const marker of monorepoMarkers) {
        if (existsSync(join(currentDir, marker))) {
          return currentDir; // Found monorepo root
        }
      }

      const parentDir = join(currentDir, '..');
      if (parentDir === currentDir) break; // Reached filesystem root
      currentDir = parentDir;
    }

    // If no monorepo markers found, look for project markers
    currentDir = cwd();
    while (currentDir !== '/') {
      for (const marker of projectMarkers) {
        if (existsSync(join(currentDir, marker))) {
          return currentDir; // Found project root
        }
      }

      const parentDir = join(currentDir, '..');
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }

    // Fallback to current working directory
    return cwd();
  }

  private ensureSwarmDir(): void {
    if (!existsSync(this.swarmDir)) {
      mkdirSync(this.swarmDir, { recursive: true });
    }
  }

  private loadRegistry(): Map<string, EphemeralSwarm> {
    if (this.registryCache) {
      return this.registryCache;
    }

    try {
      if (existsSync(this.registryPath)) {
        const data = readFileSync(this.registryPath, 'utf-8');
        const swarms = JSON.parse(data);

        // Convert plain objects back to EphemeralSwarm with proper Date objects
        const registry = new Map<string, EphemeralSwarm>();
        for (const [id, swarmData] of Object.entries(swarms)) {
          const swarm = swarmData as any;
          registry.set(id, {
            ...swarm,
            created: new Date(swarm.created),
            expiresAt: new Date(swarm.expiresAt),
            performance: {
              ...swarm.performance,
              lastActivity: new Date(swarm.performance.lastActivity),
            },
          });
        }

        this.registryCache = registry;
        return registry;
      }
    } catch (error) {
      this.logger.warn('Failed to load swarm registry', { error });
    }

    this.registryCache = new Map();
    return this.registryCache;
  }

  private saveRegistry(registry: Map<string, EphemeralSwarm>): void {
    try {
      this.ensureSwarmDir();
      const swarms = Object.fromEntries(registry.entries())();
      writeFileSync(
        this.registryPath,
        JSON.stringify(swarms, null, 2),
        'utf-8'
      );
      this.registryCache = registry;
    } catch (error) {
      this.logger.warn('Failed to save swarm registry', { error });
    }
  }

  private async loadAndRegisterSwarms(): Promise<void> {
    const registry = this.loadRegistry();

    for (const [id, swarm] of registry) {
      try {
        // Register each swarm with ServiceContainer
        const registrationResult = this.container.registerInstance(id, swarm, {
          capabilities: this.extractSwarmCapabilities(swarm),
          metadata: {
            type: 'ephemeral-swarm',
            task: swarm.task,
            topology: swarm.topology,
            status: swarm.status,
            loadedFromFile: true,
            expiresAt: swarm.expiresAt,
            persistent: swarm.persistent,
          },
          enabled: swarm.status !== 'dissolved',
          healthCheck: () => this.performSwarmHealthCheck(swarm),
          lifetime: Lifetime.SINGLETON,
        });

        if (registrationResult.isErr()) {
          this.logger.warn(
            `Failed to register loaded swarm ${id}:`,
            registrationResult.error.message
          );
        }
      } catch (error) {
        this.logger.warn(`Failed to load swarm ${id}:`, error);
      }
    }

    this.logger.debug(`Loaded ${registry.size} swarms from file storage`);
  }

  private extractSwarmCapabilities(swarm: EphemeralSwarm): string[] {
    const capabilities: string[] = ['ephemeral-swarm'];

    if (swarm.topology) capabilities.push(`topology:${swarm.topology}`);
    if (swarm.status) capabilities.push(`status:${swarm.status}`);
    if (swarm.persistent) capabilities.push('persistent');

    // Extract capabilities from agent archetypes
    for (const agent of swarm.agents) {
      capabilities.push(`agent:${agent.archetype}`);
    }

    return capabilities;
  }

  private performSwarmHealthCheck(swarm: EphemeralSwarm): boolean {
    try {
      const now = Date.now();

      // Check if swarm has expired
      if (swarm.expiresAt.getTime() <= now) {
        return false;
      }

      // Check if swarm is dissolved
      if (swarm.status === 'dissolved') {
        return false;
      }

      // Check agents health (basic check)
      const activeAgents = swarm.agents.filter(
        (agent) => agent.status !== 'dissolved'
      );

      return activeAgents.length > 0;
    } catch (error) {
      this.logger.warn(`⚠️ Swarm health check failed for ${swarm.id}:`, error);
      return false;
    }
  }

  private isSwarmService(value: any): value is EphemeralSwarm {
    return (
      value &&
      typeof value === 'object' &&
      'id' in value &&
      'task' in value &&
      'agents' in value &&
      'topology'in value
    );
  }

  private calculateAveragePerformance(swarms: EphemeralSwarm[]) {
    if (swarms.length === 0) return null;

    const totalDecisions = swarms.reduce(
      (sum, swarm) => sum + swarm.performance.decisions,
      0
    );
    const totalDecisionTime = swarms.reduce(
      (sum, swarm) => sum + swarm.performance.averageDecisionTime,
      0
    );
    const totalCoordinationEvents = swarms.reduce(
      (sum, swarm) => sum + swarm.performance.coordinationEvents,
      0
    );

    return {
      averageDecisions: totalDecisions / swarms.length,
      averageDecisionTime: totalDecisionTime / swarms.length,
      averageCoordinationEvents: totalCoordinationEvents / swarms.length,
    };
  }

  private getOldestSwarm(swarms: EphemeralSwarm[]): EphemeralSwarm|null {
    if (swarms.length === 0) return null;

    return swarms.reduce((oldest, current) =>
      current.created < oldest.created ? current : oldest
    );
  }

  private getNewestSwarm(swarms: EphemeralSwarm[]): EphemeralSwarm|null {
    if (swarms.length === 0) return null;

    return swarms.reduce((newest, current) =>
      current.created > newest.created ? current : newest
    );
  }
}

/**
 * Global registry instance for backward compatibility
 */
let swarmRegistryInstance: SwarmRegistry|null = null;

/**
 * Get singleton instance (compatible with existing pattern)
 */
export function getSwarmRegistry(): SwarmRegistry {
  if (!swarmRegistryInstance) {
    swarmRegistryInstance = new SwarmRegistry();
    // Auto-initialize for convenience
    swarmRegistryInstance.initialize().catch((error) => {
      console.error('Failed to initialize SwarmRegistry:', error);
    });
  }
  return swarmRegistryInstance;
}

/**
 * Factory function for creating new instances
 */
export function createSwarmRegistry(): SwarmRegistry {
  return new SwarmRegistry();
}

export default SwarmRegistry;
