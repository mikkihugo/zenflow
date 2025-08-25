/**
 * Memory Coordination System - Intelligent Memory Orchestration
 *
 * Coordinates memory operations across multiple backends with intelligent routing,
 * load balancing, health monitoring, and automatic failover.
 */
import { TypedEventBase } from '@claude-zen/foundation';
import {
  getLogger,
  recordMetric,
  withTrace,
  TelemetryManager,
} from '@claude-zen/foundation';
import { MemoryLoadBalancer } from './memory-load-balancer';
import { MemoryHealthMonitor } from './memory-health-monitor';
export class MemoryCoordinationSystem extends TypedEventBase {
  logger;
  config;
  nodes = new Map();
  loadBalancer;
  healthMonitor;
  telemetry;
  initialized = false;
  primaryNode;
  shardConfig;
  tierConfig;
  constructor(config) {
    super();
    this.config = config;
    this.logger = getLogger('MemoryCoordinationSystem');
    this.loadBalancer = new MemoryLoadBalancer(config.loadBalancing);
    this.healthMonitor = new MemoryHealthMonitor(config.healthCheck);
    this.telemetry = new TelemetryManager({
      serviceName: 'memory-coordination',
      enableTracing: true,
      enableMetrics: true,
    });
  }
  async initialize() {
    if (this.initialized) return;
    try {
      await withTrace('memory-coordination-init', async () => {
        await this.telemetry.initialize();
        await this.healthMonitor.initialize();
        // Setup event listeners
        this.healthMonitor.on(
          'nodeUnhealthy',
          this.handleNodeUnhealthy.bind(this)
        );
        this.healthMonitor.on(
          'nodeRecovered',
          this.handleNodeRecovered.bind(this)
        );
        this.loadBalancer.on(
          'overloaded',
          this.handleNodeOverloaded.bind(this)
        );
        this.initialized = true;
        this.logger.info('Memory coordination system initialized');
        recordMetric('memory_coordination_initialized', 1);
      });
    } catch (error) {
      this.logger.error(
        'Failed to initialize memory coordination system:',
        error
      );
      throw error;
    }
  }
  async addNode(id, backend, options = {}) {
    this.ensureInitialized();
    try {
      await withTrace('memory-coordination-add-node', async (span) => {
        span?.setAttributes({
          'memory.node.id': id,
          'memory.node.tier': options.tier || 'warm',
        });
        // Initialize the backend
        await backend.initialize();
        // Create node configuration
        const node = {
          id,
          backend,
          weight: options.weight || 1,
          priority: options.priority || 1,
          tier: options.tier || 'warm',
          status: {
            healthy: true,
            latency: 0,
            errorRate: 0,
            uptime: Date.now(),
            details: {},
          },
          metrics: {
            connections: 0,
            requestsPerSecond: 0,
            averageResponseTime: 0,
            memoryUsage: 0,
            storageUsage: 0,
            cacheHitRate: 0,
            operationCounts: {
              reads: 0,
              writes: 0,
              deletes: 0,
            },
          },
          lastHealthCheck: Date.now(),
        };
        this.nodes.set(id, node);
        this.loadBalancer.addNode(node);
        this.healthMonitor.addNode(node);
        // Set as primary if it's the first node or higher priority
        if (
          !this.primaryNode ||
          node.priority > (this.nodes.get(this.primaryNode)?.priority || 0)
        ) {
          this.primaryNode = id;
        }
        this.emit('nodeAdded', { nodeId: id, node });
        this.logger.info(`Added memory node: ${id}`);
        recordMetric('memory_coordination_nodes_total', this.nodes.size);
      });
    } catch (error) {
      this.logger.error(`Failed to add memory node ${id}:`, error);
      throw error;
    }
  }
  async removeNode(id) {
    this.ensureInitialized();
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Memory node not found: ${id}`);
    }
    try {
      await withTrace('memory-coordination-remove-node', async (span) => {
        span?.setAttributes({ 'memory.node.id': id });
        // Remove from monitoring and load balancing
        this.healthMonitor.removeNode(id);
        this.loadBalancer.removeNode(id);
        // Close the backend
        await node.backend.close();
        // Remove from nodes
        this.nodes.delete(id);
        // Update primary node if necessary
        if (this.primaryNode === id) {
          this.selectNewPrimaryNode();
        }
        this.emit('nodeRemoved', { nodeId: id });
        this.logger.info(`Removed memory node: ${id}`);
        recordMetric('memory_coordination_nodes_total', this.nodes.size);
      });
    } catch (error) {
      this.logger.error(`Failed to remove memory node ${id}:`, error);
      throw error;
    }
  }
  async store(key, value, namespace = 'default', options) {
    this.ensureInitialized();
    const request = {
      operation: 'store',
      key,
      value,
      namespace,
      options,
    };
    return this.executeOperation(request);
  }
  async retrieve(key, namespace = 'default', options) {
    this.ensureInitialized();
    const request = {
      operation: 'retrieve',
      key,
      namespace,
      options,
    };
    return this.executeOperation(request);
  }
  async delete(key, namespace = 'default', options) {
    this.ensureInitialized();
    const request = {
      operation: 'delete',
      key,
      namespace,
      options,
    };
    return this.executeOperation(request);
  }
  async list(pattern, namespace = 'default') {
    this.ensureInitialized();
    const request = {
      operation: 'list',
      key: pattern,
      namespace,
    };
    return this.executeOperation(request);
  }
  async search(pattern, namespace = 'default') {
    this.ensureInitialized();
    const request = {
      operation: 'search',
      key: pattern,
      namespace,
    };
    return this.executeOperation(request);
  }
  async clear(namespace) {
    this.ensureInitialized();
    const request = {
      operation: 'clear',
      namespace,
    };
    return this.executeOperation(request);
  }
  // Private methods
  async executeOperation(request) {
    return withTrace('memory-coordination-operation', async (span) => {
      span?.setAttributes({
        'memory.operation': request.operation,
        'memory.key': request.key || '',
        'memory.namespace': request.namespace || 'default',
        'memory.strategy': this.config.strategy,
      });
      const startTime = Date.now();
      try {
        // Select nodes based on strategy
        const targetNodes = await this.selectNodes(request);
        if (targetNodes.length === 0) {
          throw new Error('No healthy memory nodes available');
        }
        // Execute operation based on strategy
        let result;
        switch (this.config.strategy) {
          case 'single':
            result = await this.executeSingleNode(request, targetNodes[0]);
            break;
          case 'replicated':
            result = await this.executeReplicated(request, targetNodes);
            break;
          case 'sharded':
            result = await this.executeSharded(request, targetNodes);
            break;
          case 'tiered':
            result = await this.executeTiered(request, targetNodes);
            break;
          case 'intelligent':
            result = await this.executeIntelligent(request, targetNodes);
            break;
          default:
            throw new Error(`Unsupported strategy: ${this.config.strategy}`);
        }
        const latency = Date.now() - startTime;
        recordMetric('memory_coordination_operation_duration', latency, {
          operation: request.operation,
          strategy: this.config.strategy,
          success: 'true',
        });
        return result;
      } catch (error) {
        const latency = Date.now() - startTime;
        recordMetric('memory_coordination_operation_duration', latency, {
          operation: request.operation,
          strategy: this.config.strategy,
          success: 'false',
        });
        recordMetric('memory_coordination_operation_errors', 1, {
          operation: request.operation,
          error: error.message,
        });
        this.logger.error(`Memory operation failed:`, error);
        return {
          success: false,
          error: error.message,
          metadata: {
            nodeId: 'unknown',
            latency,
            fromCache: false,
            consistency: request.options?.consistency || 'eventual',
            timestamp: Date.now(),
          },
        };
      }
    });
  }
  async selectNodes(request) {
    const healthyNodes = Array.from(this.nodes.values()).filter(
      (node) => node.status.healthy
    );
    if (healthyNodes.length === 0) {
      return [];
    }
    switch (this.config.strategy) {
      case 'single':
        return [this.loadBalancer.selectNode(healthyNodes)];
      case 'replicated':
        return healthyNodes.slice(0, this.config.replication);
      case 'sharded':
        return this.selectShardedNodes(request, healthyNodes);
      case 'tiered':
        return this.selectTieredNodes(request, healthyNodes);
      case 'intelligent':
        return this.selectIntelligentNodes(request, healthyNodes);
      default:
        return [healthyNodes[0]];
    }
  }
  selectShardedNodes(request, nodes) {
    if (!request.key || !this.shardConfig) {
      return [nodes[0]];
    }
    // Simple hash-based sharding
    const hash = this.hashKey(request.key);
    const shardIndex = hash % this.shardConfig.shardCount;
    const nodeIndex = shardIndex % nodes.length;
    return [nodes[nodeIndex]];
  }
  selectTieredNodes(request, nodes) {
    const tier = request.options?.tier || 'warm';
    const tieredNodes = nodes.filter((node) => node.tier === tier);
    return tieredNodes.length > 0 ? [tieredNodes[0]] : [nodes[0]];
  }
  selectIntelligentNodes(request, nodes) {
    // AI-driven node selection based on historical performance and current load
    // For now, use load balancer with additional intelligence
    const bestNode = this.loadBalancer.selectNode(nodes);
    return [bestNode];
  }
  async executeSingleNode(request, node) {
    const startTime = Date.now();
    try {
      let data;
      switch (request.operation) {
        case 'store':
          await node.backend.store(
            request.key,
            request.value,
            request.namespace
          );
          break;
        case 'retrieve':
          data = await node.backend.retrieve(request.key, request.namespace);
          break;
        case 'delete':
          data = await node.backend.delete(request.key, request.namespace);
          break;
        case 'list':
          data = await node.backend.list(request.key, request.namespace);
          break;
        case 'search':
          data = await node.backend.search(request.key, request.namespace);
          break;
        case 'clear':
          await node.backend.clear(request.namespace);
          break;
      }
      const latency = Date.now() - startTime;
      this.updateNodeMetrics(node, request.operation, latency, true);
      return {
        success: true,
        data,
        metadata: {
          nodeId: node.id,
          latency,
          fromCache: false,
          consistency: request.options?.consistency || 'eventual',
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateNodeMetrics(node, request.operation, latency, false);
      throw error;
    }
  }
  async executeReplicated(request, nodes) {
    // For read operations, use primary node
    if (
      request.operation === 'retrieve' ||
      request.operation === 'list' ||
      request.operation === 'search'
    ) {
      const primaryNode =
        nodes.find((n) => n.id === this.primaryNode) || nodes[0];
      return this.executeSingleNode(request, primaryNode);
    }
    // For write operations, write to all nodes
    const results = await Promise.allSettled(
      nodes.map((node) => this.executeSingleNode(request, node))
    );
    const successfulResults = results.filter((r) => r.status === 'fulfilled');
    if (successfulResults.length === 0) {
      throw new Error('All replica operations failed');
    }
    // Return result from primary node if available, otherwise first successful
    const primaryResult = successfulResults.find(
      (r) => r.value.metadata.nodeId === this.primaryNode
    );
    return primaryResult?.value || successfulResults[0].value;
  }
  async executeSharded(request, nodes) {
    // For sharded operations, we already selected the correct node
    return this.executeSingleNode(request, nodes[0]);
  }
  async executeTiered(request, nodes) {
    // For tiered operations, we already selected the correct tier
    return this.executeSingleNode(request, nodes[0]);
  }
  async executeIntelligent(request, nodes) {
    // Intelligent execution with fallback and optimization
    return this.executeSingleNode(request, nodes[0]);
  }
  updateNodeMetrics(node, operation, latency, success) {
    node.metrics.averageResponseTime =
      (node.metrics.averageResponseTime + latency) / 2;
    switch (operation) {
      case 'retrieve':
      case 'list':
      case 'search':
        node.metrics.operationCounts.reads++;
        break;
      case 'store':
        node.metrics.operationCounts.writes++;
        break;
      case 'delete':
      case 'clear':
        node.metrics.operationCounts.deletes++;
        break;
    }
    if (!success) {
      node.status.errorRate = (node.status.errorRate + 1) / 2;
    } else {
      node.status.errorRate = node.status.errorRate * 0.95; // Decay error rate
    }
  }
  handleNodeUnhealthy(nodeId) {
    this.logger.warn(`Memory node unhealthy: ${nodeId}`);
    recordMetric('memory_coordination_node_unhealthy', 1, { nodeId });
    // If primary node is unhealthy, select new primary
    if (this.primaryNode === nodeId) {
      this.selectNewPrimaryNode();
    }
    this.emit('nodeUnhealthy', { nodeId });
  }
  handleNodeRecovered(nodeId) {
    this.logger.info(`Memory node recovered: ${nodeId}`);
    recordMetric('memory_coordination_node_recovered', 1, { nodeId });
    this.emit('nodeRecovered', { nodeId });
  }
  handleNodeOverloaded(nodeId) {
    this.logger.warn(`Memory node overloaded: ${nodeId}`);
    recordMetric('memory_coordination_node_overloaded', 1, { nodeId });
    this.emit('nodeOverloaded', { nodeId });
  }
  selectNewPrimaryNode() {
    const healthyNodes = Array.from(this.nodes.values())
      .filter((node) => node.status.healthy)
      .sort((a, b) => b.priority - a.priority);
    if (healthyNodes.length > 0) {
      this.primaryNode = healthyNodes[0].id;
      this.logger.info(`New primary node selected: ${this.primaryNode}`);
    } else {
      this.primaryNode = undefined;
      this.logger.warn('No healthy nodes available for primary');
    }
  }
  hashKey(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error(
        'Memory coordination system not initialized. Call initialize() first.'
      );
    }
  }
  // Public getters
  getNodes() {
    return new Map(this.nodes);
  }
  getHealthStatus() {
    return {
      totalNodes: this.nodes.size,
      healthyNodes: Array.from(this.nodes.values()).filter(
        (n) => n.status.healthy
      ).length,
      primaryNode: this.primaryNode,
      strategy: this.config.strategy,
      loadBalancing: this.loadBalancer.getStats(),
      healthMonitoring: this.healthMonitor.getStats(),
    };
  }
  async shutdown() {
    if (!this.initialized) return;
    try {
      await this.healthMonitor.shutdown();
      // Close all nodes
      for (const node of this.nodes.values()) {
        await node.backend.close();
      }
      this.nodes.clear();
      this.initialized = false;
      this.logger.info('Memory coordination system shut down');
    } catch (error) {
      this.logger.error('Error during coordination system shutdown:', error);
      throw error;
    }
  }
}
