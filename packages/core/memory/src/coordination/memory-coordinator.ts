/**
 * @file Advanced Memory Coordination System
 * Provides advanced coordination capabilities for distributed memory management.
 */

import { EventEmitter } from '@claude-zen/foundation';

// BackendInterface type for compatibility - matches core memory-system.ts
export interface BackendInterface {
  initialize(): Promise<void>;
  store(key: string, value: unknown, namespace?: string): Promise<unknown>;
  retrieve(key: string, namespace?: string): Promise<unknown | null>;
  search(pattern: string, namespace?: string): Promise<Record<string, unknown>>;
  delete(key: string, namespace?: string): Promise<boolean>;
  listNamespaces(): Promise<string[]>;
  getStats(): Promise<unknown>;
  close?(): Promise<void>;
}

export interface MemoryCoordinationConfig {
  enabled: boolean;
  consensus: {
    quorum: number;
    timeout: number;
    strategy: 'majority|unanimous|leader';
  };
  distributed: {
    replication: number;
    consistency: 'eventual|strong|weak';
    partitioning: 'hash|range|consistent';
  };
  optimization: {
    autoCompaction: boolean;
    cacheEviction: 'lru|lfu|adaptive';
    memoryThreshold: number;
  };
}

export interface MemoryNode {
  id: string;
  backend: BackendInterface;
  status: 'active|inactive|degraded';
  lastHeartbeat: number;
  load: number;
  capacity: number;
}

export interface CoordinationDecision {
  id: string;
  type: 'read|write|delete|sync|repair';
  sessionId: string;
  target: string;
  participants: string[];
  status: 'pending|executing|completed|failed';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Advanced Memory Coordinator.
 * Manages distributed memory operations with consensus and optimization.
 *
 * @example
 */
export class MemoryCoordinator extends EventEmitter {
  private nodes = new Map<string, MemoryNode>();
  private decisions = new Map<string, CoordinationDecision>();
  private configuration: MemoryCoordinationConfig;

  constructor(config: MemoryCoordinationConfig) {
    super();
    this.config = config;
  }

  /**
   * Register a memory node for coordination.
   *
   * @param id
   * @param backend
   */
  async registerNode(id: string, backend: BackendInterface): Promise<void> {
    const node: MemoryNode = {
      id,
      backend,
      status: 'active',
      lastHeartbeat: Date.now(),
      load: 0,
      capacity: 1000, // Default capacity
    };

    this.nodes.set(id, node);
    this.emit('nodeRegistered', { nodeId: id, node });
  }

  /**
   * Unregister a memory node.
   *
   * @param id
   */
  async unregisterNode(id: string): Promise<void> {
    this.nodes.delete(id);
    this.emit('nodeUnregistered', { nodeId: id });
  }

  /**
   * Coordinate a distributed memory operation.
   *
   * @param operation
   */
  async coordinate(
    operation: Partial<CoordinationDecision>
  ): Promise<CoordinationDecision> {
    const decision: CoordinationDecision = {
      id: `coord_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: operation.type || 'read',
      sessionId: operation.sessionId || 'default',
      target: operation.target || 'default',
      participants: this.selectParticipants(operation.type || 'read'),
      status: 'pending',
      timestamp: Date.now(),
      metadata: operation.metadata,
    };

    this.decisions.set(decision.id, decision);
    this.emit('coordinationStarted', decision);

    try {
      await this.executeCoordination(decision);
      decision.status = 'completed';
      this.emit('coordinationCompleted', decision);
    } catch (error) {
      decision.status = 'failed';
      this.emit('coordinationFailed', { decision, error });
      throw error;
    }

    return decision;
  }

  /**
   * Select optimal nodes for an operation.
   *
   * @param operationType
   */
  private selectParticipants(operationType: string): string[] {
    const activeNodes = Array.from(this.nodes.entries())
      .filter(([, node]) => node?.status === 'active')
      .sort(([, a], [, b]) => a.load - b.load);

    if (operationType === 'read') {
      // For reads, prefer nodes with lower load
      return activeNodes?.slice(0, 1).map(([id]) => id);
    }

    if (operationType === 'write') {
      // For writes, use replication factor
      const replicationCount = Math.min(
        this.config.distributed.replication,
        activeNodes.length
      );
      return activeNodes?.slice(0, replicationCount).map(([id]) => id);
    }

    // Default to single node for other operations
    return activeNodes?.slice(0, 1).map(([id]) => id);
  }

  /**
   * Execute coordination decision.
   *
   * @param decision
   */
  private async executeCoordination(
    decision: CoordinationDecision
  ): Promise<void> {
    decision.status = 'executing';

    switch (decision.type) {
      case 'read':
        await this.executeRead(decision);
        break;
      case 'write':
        await this.executeWrite(decision);
        break;
      case 'delete':
        await this.executeDelete(decision);
        break;
      case 'sync':
        await this.executeSync(decision);
        break;
      case 'repair':
        await this.executeRepair(decision);
        break;
      default:
        throw new Error(`Unknown coordination type:${decision.type}`);
    }
  }

  /**
   * Execute distributed read operation.
   *
   * @param decision
   */
  private async executeRead(decision: CoordinationDecision): Promise<unknown> {
    const node = this.nodes.get(decision.participants[0]);
    if (!node) {
      throw new Error(`Node not found:${decision.participants[0]}`);
    }

    return await node?.backend?.retrieve(decision.target);
  }

  /**
   * Execute distributed write operation.
   *
   * @param decision
   */
  private async executeWrite(decision: CoordinationDecision): Promise<void> {
    const writePromises = decision.participants.map(async (nodeId) => {
      const node = this.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Node not found:${nodeId}`);
      }

      return await node?.backend?.store(
        decision.target,
        decision.metadata?.data
      );
    });

    if (this.config.distributed.consistency === 'strong') {
      // Wait for all writes to complete
      await Promise.all(writePromises);
    } else {
      // Wait for quorum
      const quorum = Math.ceil(
        decision.participants.length * this.config.consensus.quorum
      );
      await Promise.race([
        Promise.all(writePromises.slice(0, quorum)),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Quorum timeout')),
            this.config.consensus.timeout
          )
        ),
      ]);
    }
  }

  /**
   * Execute distributed delete operation.
   *
   * @param decision
   */
  private async executeDelete(decision: CoordinationDecision): Promise<void> {
    const deletePromises = decision.participants.map(async (nodeId) => {
      const node = this.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Node not found:${nodeId}`);
      }

      return await node?.backend?.delete(decision.target);
    });

    await Promise.all(deletePromises);
  }

  /**
   * Execute sync operation between nodes.
   *
   * @param decision
   */
  private async executeSync(decision: CoordinationDecision): Promise<void> {
    // Synchronize data between nodes
    const sourceNode = this.nodes.get(decision.participants[0]);
    if (!sourceNode) {
      throw new Error(`Source node not found:${decision.participants[0]}`);
    }

    for (let i = 1; i < decision.participants.length; i++) {
      const targetNode = this.nodes.get(decision.participants[i]);
      if (!targetNode) {
        continue;
      }

      const data = await sourceNode?.backend?.retrieve(decision.target);
      if (data) {
        await targetNode?.backend?.store(decision.target, data);
      }
    }
  }

  /**
   * Execute repair operation for inconsistent data.
   *
   * @param decision
   */
  private async executeRepair(decision: CoordinationDecision): Promise<void> {
    // Implement repair logic for data inconsistencies
    const values = await Promise.all(
      decision.participants.map(async (nodeId) => {
        const node = this.nodes.get(nodeId);
        if (!node) return null;

        try {
          return await node?.backend?.retrieve(decision.target);
        } catch {
          return null;
        }
      })
    );

    // Find the most common value (simple consensus)
    const validValues = values.filter((v) => v !== null);
    if (validValues.length === 0) return;

    const valueCount = new Map();
    for (const value of validValues) {
      const key = JSON.stringify(value);
      valueCount.set(key, (valueCount.get(key) || 0) + 1);
    }

    const [winningValue] = Array.from(valueCount.entries()).sort(
      ([, a], [, b]) => b - a
    )[0];

    const correctValue = JSON.parse(winningValue);

    // Repair all nodes with the correct value
    const repairPromises = decision.participants.map(async (nodeId) => {
      const node = this.nodes.get(nodeId);
      if (!node) return;

      await node?.backend?.store(decision.target, correctValue);
    });

    await Promise.all(repairPromises);
  }

  /**
   * Get coordination statistics.
   */
  getStats() {
    return {
      nodes: {
        total: this.nodes.size,
        active: Array.from(this.nodes.values()).filter(
          (n) => n.status === 'active'
        ).length,
        degraded: Array.from(this.nodes.values()).filter(
          (n) => n.status === 'degraded'
        ).length,
      },
      decisions: {
        total: this.decisions.size,
        pending: Array.from(this.decisions.values()).filter(
          (d) => d.status === 'pending'
        ).length,
        executing: Array.from(this.decisions.values()).filter(
          (d) => d.status === 'executing'
        ).length,
        completed: Array.from(this.decisions.values()).filter(
          (d) => d.status === 'completed'
        ).length,
        failed: Array.from(this.decisions.values()).filter(
          (d) => d.status === 'failed'
        ).length,
      },
      config: this.config,
    };
  }

  /**
   * Store data across distributed memory nodes.
   *
   * @param key
   * @param data
   * @param options
   * @param options.ttl
   * @param options.replicas
   */
  async store(
    key: string,
    data: unknown,
    options?: { ttl?: number; replicas?: number }
  ): Promise<void> {
    const decision = await this.coordinate({
      type: 'write',
      target: key,
      metadata: { data, options },
    });

    if (decision.status === 'failed') {
      throw new Error(`Failed to store data for key:${key}`);
    }
  }

  /**
   * Retrieve data from distributed memory nodes.
   *
   * @param key
   */
  async get(key: string): Promise<unknown> {
    const decision = await this.coordinate({
      type: 'read',
      target: key,
    });

    if (decision.status === 'failed') {
      throw new Error(`Failed to retrieve data for key:${key}`);
    }

    return await this.executeRead(decision);
  }

  /**
   * Delete data from distributed memory nodes.
   *
   * @param key
   */
  async deleteEntry(key: string): Promise<void> {
    const decision = await this.coordinate({
      type: 'delete',
      target: key,
    });

    if (decision.status === 'failed') {
      throw new Error(`Failed to delete data for key:${key}`);
    }
  }

  /**
   * List all keys matching a pattern across distributed nodes.
   *
   * @param pattern
   */
  async list(pattern: string): Promise<Array<{ key: string; value: unknown }>> {
    const results: Array<{ key: string; value: unknown }> = [];

    // Get all active nodes
    const activeNodes = Array.from(this.nodes.values()).filter(
      (n) => n.status === 'active'
    );

    for (const node of activeNodes) {
      try {
        // Assuming backend implements a keys() method
        if (
          'keys' in node?.backend &&
          typeof node?.backend?.keys === 'function'
        ) {
          const keys = await node?.backend?.keys();
          const matchingKeys = keys.filter((key) =>
            this.matchesPattern(key, pattern)
          );

          for (const key of matchingKeys) {
            try {
              const value = await node?.backend?.retrieve(key);
              results?.push({ key, value });
            } catch (error) {
              this.logger.warn(`Failed to retrieve key ${key} from node`, {
                error,
              });
            }
          }
        }
      } catch (error) {
        this.logger.warn('Failed to query node during search', { error });
      }
    }

    // Remove duplicates (in case of replication)
    const uniqueResults = new Map();
    for (const result of results) {
      if (!uniqueResults?.has(result?.key)) {
        uniqueResults?.set(result?.key, result);
      }
    }

    return Array.from(uniqueResults?.values())();
  }

  /**
   * Simple pattern matching for key listing.
   *
   * @param key
   * @param pattern
   */
  private matchesPattern(key: string, pattern: string): boolean {
    // Convert simple glob pattern to regex
    const regexPattern = pattern
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\[/g, '\\[')
      .replace(/]/g, '\\]');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }

  /**
   * Health check for coordinator.
   */
  async healthCheck(): Promise<{ status: string; details: unknown }> {
    const __stats = this.getStats();
    const unhealthyNodes = Array.from(this.nodes.values()).filter(
      (n) => n.status !== 'active'
    );

    return {
      status: unhealthyNodes.length === 0 ? 'healthy' : ' degraded',
      details: {
        ...stats,
        unhealthyNodes: unhealthyNodes?.map((n) => ({
          id: n.id,
          status: n.status,
        })),
      },
    };
  }
}
