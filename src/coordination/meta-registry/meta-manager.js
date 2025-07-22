/**
 * Meta Registry Manager
 * High-level orchestration system that manages multiple meta registries
 * and provides advanced coordination patterns
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import MetaRegistry from './index.js';

export class MetaRegistryManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxRegistries: 50,
      healthCheckInterval: 30000,
      syncInterval: 60000,
      failoverEnabled: true,
      loadBalancing: 'round-robin',
      replicationFactor: 3,
      ...options
    };

    this.registries = new Map();
    this.activeRegistry = null;
    this.topologies = new Map();
    this.federations = new Map();
    this.syncManagers = new Map();
    this.loadBalancer = null;
    this.healthMonitor = null;
    this.id = nanoid();
    this.state = 'initialized';
  }

  /**
   * Initialize the meta registry manager
   */
  async initialize() {
    this.state = 'initializing';

    // Initialize load balancer
    this.loadBalancer = new RegistryLoadBalancer(this);

    // Start health monitoring
    this.startHealthMonitoring();

    // Start synchronization services
    this.startSynchronization();

    this.state = 'ready';
    this.emit('ready', { id: this.id });
  }

  /**
   * Create a new meta registry
   */
  async createRegistry(name, backend, options = {}) {
    if (this.registries.has(name)) {
      throw new Error(`Registry '${name}' already exists`);
    }

    if (this.registries.size >= this.options.maxRegistries) {
      throw new Error(`Maximum number of registries (${this.options.maxRegistries}) reached`);
    }

    const registry = new MetaRegistry(backend, {
      name,
      managerId: this.id,
      ...options
    });

    // Initialize registry
    await registry.initialize(options.config || {});

    // Register event handlers
    this.setupRegistryEventHandlers(name, registry);

    // Add to collection
    this.registries.set(name, {
      registry,
      name,
      backend: backend.constructor.name,
      created: new Date(),
      status: 'active',
      stats: {
        requests: 0,
        errors: 0,
        uptime: 0
      }
    });

    // Set as active if first registry or explicitly requested
    if (!this.activeRegistry || options.setAsActive) {
      this.activeRegistry = name;
    }

    // Setup federation if configured
    if (options.federation) {
      await this.setupFederation(name, options.federation);
    }

    this.emit('registryCreated', { name, registry });
    return registry;
  }

  /**
   * Remove a meta registry
   */
  async removeRegistry(name, options = {}) {
    const registryInfo = this.registries.get(name);
    if (!registryInfo) {
      return false;
    }

    // Drain connections if graceful shutdown
    if (options.graceful) {
      await this.drainRegistry(name);
    }

    // Remove from federations
    for (const [fedId, federation] of this.federations.entries()) {
      if (federation.registries.includes(name)) {
        await this.removeFederationMember(fedId, name);
      }
    }

    // Close registry
    await registryInfo.registry.close();

    // Remove from collection
    this.registries.delete(name);

    // Update active registry if needed
    if (this.activeRegistry === name) {
      this.activeRegistry = this.registries.size > 0 ? 
        Array.from(this.registries.keys())[0] : null;
    }

    this.emit('registryRemoved', { name, registryInfo });
    return true;
  }

  /**
   * Get registry by name
   */
  getRegistry(name) {
    const registryInfo = this.registries.get(name);
    return registryInfo?.registry || null;
  }

  /**
   * Get the best available registry using load balancing
   */
  getBestRegistry(criteria = {}) {
    return this.loadBalancer.selectRegistry(criteria);
  }

  /**
   * Create a federation of registries
   */
  async createFederation(federationId, registryNames, options = {}) {
    if (this.federations.has(federationId)) {
      throw new Error(`Federation '${federationId}' already exists`);
    }

    // Validate all registries exist
    for (const name of registryNames) {
      if (!this.registries.has(name)) {
        throw new Error(`Registry '${name}' not found`);
      }
    }

    const federation = new RegistryFederation(federationId, this, {
      registries: registryNames,
      syncStrategy: options.syncStrategy || 'eventual-consistency',
      conflictResolution: options.conflictResolution || 'last-write-wins',
      partitionTolerant: options.partitionTolerant !== false,
      ...options
    });

    await federation.initialize();

    this.federations.set(federationId, federation);
    this.emit('federationCreated', { federationId, federation });

    return federation;
  }

  /**
   * Setup registry federation
   */
  async setupFederation(registryName, federationConfig) {
    const { federationId, peers = [], role = 'member' } = federationConfig;

    // Create or join federation
    if (!this.federations.has(federationId)) {
      await this.createFederation(federationId, [registryName], { role });
    } else {
      await this.addFederationMember(federationId, registryName);
    }

    // Setup peer connections
    for (const peer of peers) {
      await this.connectFederationPeer(federationId, peer);
    }
  }

  /**
   * Add member to federation
   */
  async addFederationMember(federationId, registryName) {
    const federation = this.federations.get(federationId);
    if (!federation) {
      throw new Error(`Federation '${federationId}' not found`);
    }

    await federation.addMember(registryName);
  }

  /**
   * Remove member from federation
   */
  async removeFederationMember(federationId, registryName) {
    const federation = this.federations.get(federationId);
    if (!federation) {
      return false;
    }

    await federation.removeMember(registryName);
    return true;
  }

  /**
   * Create topology management
   */
  async createTopology(topologyId, type, registries, options = {}) {
    if (this.topologies.has(topologyId)) {
      throw new Error(`Topology '${topologyId}' already exists`);
    }

    const topology = new RegistryTopology(topologyId, this, {
      type, // mesh, hierarchical, ring, star, etc.
      registries,
      ...options
    });

    await topology.initialize();

    this.topologies.set(topologyId, topology);
    this.emit('topologyCreated', { topologyId, topology });

    return topology;
  }

  /**
   * Coordinate cross-registry operations
   */
  async coordinateOperation(operation, targets = [], options = {}) {
    const coordinator = new CrossRegistryCoordinator(this, {
      operation,
      targets: targets.length > 0 ? targets : Array.from(this.registries.keys()),
      strategy: options.strategy || 'all-or-nothing',
      timeout: options.timeout || 30000,
      retries: options.retries || 3
    });

    return coordinator.execute();
  }

  /**
   * Replicate data across registries
   */
  async replicateData(sourceRegistry, targetRegistries, query = {}, options = {}) {
    const source = this.getRegistry(sourceRegistry);
    if (!source) {
      throw new Error(`Source registry '${sourceRegistry}' not found`);
    }

    // Discover data to replicate
    const data = await source.discover(query, options.discoveryOptions);

    // Replicate to target registries
    const results = await Promise.allSettled(
      targetRegistries.map(async (targetName) => {
        const target = this.getRegistry(targetName);
        if (!target) {
          throw new Error(`Target registry '${targetName}' not found`);
        }

        const replicationResults = await Promise.allSettled(
          data.map(item => target.register(item.key, item.value, item.metadata))
        );

        return {
          registry: targetName,
          results: replicationResults,
          success: replicationResults.filter(r => r.status === 'fulfilled').length,
          failed: replicationResults.filter(r => r.status === 'rejected').length
        };
      })
    );

    this.emit('dataReplicated', {
      sourceRegistry,
      targetRegistries,
      itemCount: data.length,
      results
    });

    return results;
  }

  /**
   * Perform health check on all registries
   */
  async performHealthCheck() {
    const healthResults = new Map();

    for (const [name, registryInfo] of this.registries.entries()) {
      try {
        const health = await registryInfo.registry.status();
        healthResults.set(name, {
          status: 'healthy',
          ...health
        });
      } catch (error) {
        healthResults.set(name, {
          status: 'unhealthy',
          error: error.message,
          lastError: new Date()
        });

        // Update registry status
        registryInfo.status = 'error';
        registryInfo.stats.errors++;
      }
    }

    // Handle failover if needed
    if (this.options.failoverEnabled) {
      await this.handleFailover(healthResults);
    }

    this.emit('healthCheck', { results: healthResults });
    return healthResults;
  }

  /**
   * Handle failover scenarios
   */
  async handleFailover(healthResults) {
    const activeHealth = healthResults.get(this.activeRegistry);
    
    if (activeHealth?.status === 'unhealthy') {
      // Find healthy alternative
      for (const [name, health] of healthResults.entries()) {
        if (health.status === 'healthy') {
          const oldActive = this.activeRegistry;
          this.activeRegistry = name;
          
          this.emit('failover', {
            from: oldActive,
            to: name,
            reason: 'health-check-failure'
          });
          
          break;
        }
      }
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthMonitor = setInterval(() => {
      this.performHealthCheck();
    }, this.options.healthCheckInterval);
  }

  /**
   * Start synchronization services
   */
  startSynchronization() {
    this.syncInterval = setInterval(() => {
      this.synchronizeFederations();
    }, this.options.syncInterval);
  }

  /**
   * Synchronize all federations
   */
  async synchronizeFederations() {
    for (const federation of this.federations.values()) {
      await federation.synchronize();
    }
  }

  /**
   * Setup registry event handlers
   */
  setupRegistryEventHandlers(name, registry) {
    registry.on('registered', (event) => {
      this.emit('registryEvent', { registry: name, type: 'registered', event });
    });

    registry.on('discovered', (event) => {
      this.emit('registryEvent', { registry: name, type: 'discovered', event });
    });

    registry.on('error', (error) => {
      this.emit('registryError', { registry: name, error });
      
      // Update stats
      const registryInfo = this.registries.get(name);
      if (registryInfo) {
        registryInfo.stats.errors++;
      }
    });
  }

  /**
   * Drain registry connections gracefully
   */
  async drainRegistry(name) {
    // Implementation would gradually reduce traffic to this registry
    this.emit('drainingRegistry', { registry: name });
    
    // Wait for ongoing operations to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  /**
   * Get comprehensive manager statistics
   */
  async getStats() {
    const stats = {
      manager: {
        id: this.id,
        state: this.state,
        uptime: process.uptime()
      },
      registries: {
        total: this.registries.size,
        active: this.activeRegistry,
        byStatus: {}
      },
      federations: {
        total: this.federations.size,
        active: Array.from(this.federations.keys())
      },
      topologies: {
        total: this.topologies.size,
        active: Array.from(this.topologies.keys())
      }
    };

    // Registry statistics
    for (const [name, info] of this.registries.entries()) {
      stats.registries.byStatus[info.status] = 
        (stats.registries.byStatus[info.status] || 0) + 1;
    }

    // Individual registry stats
    stats.registryDetails = {};
    for (const [name, info] of this.registries.entries()) {
      try {
        stats.registryDetails[name] = await info.registry.status();
      } catch (error) {
        stats.registryDetails[name] = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Close the manager and all registries
   */
  async close() {
    this.state = 'closing';

    // Clear intervals
    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Close federations
    for (const federation of this.federations.values()) {
      await federation.close();
    }

    // Close topologies
    for (const topology of this.topologies.values()) {
      await topology.close();
    }

    // Close all registries
    for (const [name] of this.registries.entries()) {
      await this.removeRegistry(name);
    }

    this.state = 'closed';
    this.emit('closed');
  }
}

/**
 * Registry Load Balancer
 * Intelligent routing of requests across registries
 */
class RegistryLoadBalancer {
  constructor(manager) {
    this.manager = manager;
    this.roundRobinIndex = 0;
    this.stats = new Map();
  }

  selectRegistry(criteria = {}) {
    const availableRegistries = Array.from(this.manager.registries.entries())
      .filter(([name, info]) => info.status === 'active')
      .map(([name, info]) => ({ name, ...info }));

    if (availableRegistries.length === 0) {
      throw new Error('No healthy registries available');
    }

    switch (this.manager.options.loadBalancing) {
      case 'round-robin':
        return this.roundRobin(availableRegistries);
      case 'least-connections':
        return this.leastConnections(availableRegistries);
      case 'weighted':
        return this.weighted(availableRegistries, criteria.weights);
      case 'performance':
        return this.performance(availableRegistries);
      default:
        return availableRegistries[0];
    }
  }

  roundRobin(registries) {
    const selected = registries[this.roundRobinIndex % registries.length];
    this.roundRobinIndex++;
    return selected.registry;
  }

  leastConnections(registries) {
    // Simplified - in real implementation would track actual connections
    const selected = registries.reduce((min, current) => 
      current.stats.requests < min.stats.requests ? current : min
    );
    return selected.registry;
  }

  weighted(registries, weights = {}) {
    // Implementation would use weighted selection based on provided weights
    return registries[0].registry;
  }

  performance(registries) {
    // Select based on performance metrics
    const selected = registries.reduce((best, current) => {
      const currentScore = this.calculatePerformanceScore(current);
      const bestScore = this.calculatePerformanceScore(best);
      return currentScore > bestScore ? current : best;
    });
    return selected.registry;
  }

  calculatePerformanceScore(registryInfo) {
    // Simple performance scoring - in real implementation would be more sophisticated
    const errorRate = registryInfo.stats.errors / (registryInfo.stats.requests || 1);
    return 1 - errorRate;
  }
}

/**
 * Registry Federation
 * Manages distributed coordination across multiple registries
 */
class RegistryFederation extends EventEmitter {
  constructor(id, manager, options = {}) {
    super();
    this.id = id;
    this.manager = manager;
    this.options = options;
    this.members = new Set(options.registries || []);
    this.syncState = new Map();
    this.conflictResolver = new ConflictResolver(options.conflictResolution);
  }

  async initialize() {
    // Setup federation coordination
    this.emit('initialized');
  }

  async addMember(registryName) {
    this.members.add(registryName);
    this.emit('memberAdded', { registry: registryName });
  }

  async removeMember(registryName) {
    this.members.delete(registryName);
    this.emit('memberRemoved', { registry: registryName });
  }

  async synchronize() {
    // Simplified synchronization logic
    for (const registryName of this.members) {
      await this.syncRegistry(registryName);
    }
  }

  async syncRegistry(registryName) {
    // Implementation would sync data between federation members
    this.emit('syncCompleted', { registry: registryName });
  }

  async close() {
    this.emit('closed');
  }
}

/**
 * Registry Topology
 * Manages network topologies of registries
 */
class RegistryTopology extends EventEmitter {
  constructor(id, manager, options = {}) {
    super();
    this.id = id;
    this.manager = manager;
    this.options = options;
    this.connections = new Map();
  }

  async initialize() {
    await this.buildTopology();
    this.emit('initialized');
  }

  async buildTopology() {
    // Implementation would create topology-specific connections
    switch (this.options.type) {
      case 'mesh':
        await this.buildMeshTopology();
        break;
      case 'hierarchical':
        await this.buildHierarchicalTopology();
        break;
      case 'ring':
        await this.buildRingTopology();
        break;
      case 'star':
        await this.buildStarTopology();
        break;
    }
  }

  async buildMeshTopology() {
    // Connect every registry to every other registry
    const registries = Array.from(this.options.registries);
    for (let i = 0; i < registries.length; i++) {
      for (let j = i + 1; j < registries.length; j++) {
        await this.createConnection(registries[i], registries[j]);
      }
    }
  }

  async buildHierarchicalTopology() {
    // Implementation for hierarchical connections
  }

  async buildRingTopology() {
    // Implementation for ring connections
  }

  async buildStarTopology() {
    // Implementation for star connections
  }

  async createConnection(registry1, registry2) {
    const connectionId = `${registry1}-${registry2}`;
    this.connections.set(connectionId, {
      id: connectionId,
      nodes: [registry1, registry2],
      created: new Date()
    });
  }

  async close() {
    this.connections.clear();
    this.emit('closed');
  }
}

/**
 * Cross-Registry Coordinator
 * Coordinates operations across multiple registries
 */
class CrossRegistryCoordinator {
  constructor(manager, options = {}) {
    this.manager = manager;
    this.options = options;
  }

  async execute() {
    const { operation, targets, strategy, timeout } = this.options;
    
    switch (strategy) {
      case 'all-or-nothing':
        return this.executeAllOrNothing();
      case 'best-effort':
        return this.executeBestEffort();
      case 'quorum':
        return this.executeQuorum();
      default:
        return this.executeAllOrNothing();
    }
  }

  async executeAllOrNothing() {
    // All operations must succeed or all are rolled back
    const results = new Map();
    const rollbackActions = [];

    try {
      for (const target of this.options.targets) {
        const registry = this.manager.getRegistry(target);
        if (!registry) {
          throw new Error(`Registry '${target}' not found`);
        }

        const result = await this.executeOnRegistry(registry, this.options.operation);
        results.set(target, result);
        
        // Store rollback action
        rollbackActions.push(() => this.rollbackOperation(registry, result));
      }

      return { status: 'success', results };
    } catch (error) {
      // Rollback all successful operations
      await Promise.allSettled(rollbackActions.map(action => action()));
      throw error;
    }
  }

  async executeBestEffort() {
    // Execute on all, return partial success
    const results = await Promise.allSettled(
      this.options.targets.map(async (target) => {
        const registry = this.manager.getRegistry(target);
        return this.executeOnRegistry(registry, this.options.operation);
      })
    );

    return {
      status: 'partial',
      results,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }

  async executeQuorum() {
    // Require majority success
    const results = await this.executeBestEffort();
    const quorumSize = Math.floor(this.options.targets.length / 2) + 1;
    
    if (results.successful >= quorumSize) {
      return { ...results, status: 'quorum-success' };
    } else {
      throw new Error('Failed to achieve quorum');
    }
  }

  async executeOnRegistry(registry, operation) {
    // Execute the specific operation on the registry
    // This would be expanded based on operation type
    return { executed: true, timestamp: new Date() };
  }

  async rollbackOperation(registry, result) {
    // Rollback logic specific to operation type
    return { rolledBack: true, timestamp: new Date() };
  }
}

/**
 * Conflict Resolver
 * Handles conflicts in distributed registry operations
 */
class ConflictResolver {
  constructor(strategy = 'last-write-wins') {
    this.strategy = strategy;
  }

  resolve(conflicts) {
    switch (this.strategy) {
      case 'last-write-wins':
        return this.lastWriteWins(conflicts);
      case 'first-write-wins':
        return this.firstWriteWins(conflicts);
      case 'merge':
        return this.mergeConflicts(conflicts);
      default:
        return this.lastWriteWins(conflicts);
    }
  }

  lastWriteWins(conflicts) {
    return conflicts.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  firstWriteWins(conflicts) {
    return conflicts.reduce((earliest, current) => 
      current.timestamp < earliest.timestamp ? current : earliest
    );
  }

  mergeConflicts(conflicts) {
    // Merge strategy would combine data from all conflicts
    return conflicts[0]; // Simplified
  }
}

export default MetaRegistryManager;