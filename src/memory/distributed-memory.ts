/**
 * Distributed Memory System
 * Handles distributed memory coordination across agents and components
 */

import { EventEmitter } from 'node:events';

export interface MemoryEntry {
  id: string;
  key: string;
  value: any;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, any>;
}

export interface MemoryNode {
  id: string;
  priority: number;
  lastSync: number;
  entries: Map<string, MemoryEntry>;
}

export interface DistributedMemoryConfig {
  nodeId: string;
  syncInterval: number;
  ttl: number;
  maxEntries: number;
  replicationFactor: number;
}

export class DistributedMemorySystem extends EventEmitter {
  private config: DistributedMemoryConfig;
  private localNode: MemoryNode;
  private remoteNodes = new Map<string, MemoryNode>();
  private syncTimer?: NodeJS.Timeout;

  constructor(config: Partial<DistributedMemoryConfig> = {}) {
    super();

    this.config = {
      nodeId: config.nodeId || `node-${Date.now()}`,
      syncInterval: config.syncInterval || 30000, // 30 seconds
      ttl: config.ttl || 3600000, // 1 hour
      maxEntries: config.maxEntries || 10000,
      replicationFactor: config.replicationFactor || 2,
      ...config,
    };

    this.localNode = {
      id: this.config.nodeId,
      priority: Math.random(),
      lastSync: Date.now(),
      entries: new Map(),
    };
  }

  async initialize(): Promise<void> {
    this.startSyncTimer();
    this.emit('initialized', this.config.nodeId);
  }

  async store(key: string, value: any, ttl?: number): Promise<void> {
    const entry: MemoryEntry = {
      id: `${this.config.nodeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    };

    this.localNode.entries.set(key, entry);
    await this.replicateEntry(entry);
    this.emit('stored', key, value);
  }

  async retrieve(key: string): Promise<any> {
    // Check local first
    const localEntry = this.localNode.entries.get(key);
    if (localEntry && this.isEntryValid(localEntry)) {
      return localEntry.value;
    }

    // Check remote nodes
    for (const [, node] of this.remoteNodes) {
      const remoteEntry = node.entries.get(key);
      if (remoteEntry && this.isEntryValid(remoteEntry)) {
        // Cache locally
        this.localNode.entries.set(key, remoteEntry);
        return remoteEntry.value;
      }
    }

    return null;
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.localNode.entries.delete(key);

    // Propagate deletion to remote nodes
    for (const [, node] of this.remoteNodes) {
      node.entries.delete(key);
    }

    if (deleted) {
      this.emit('deleted', key);
    }

    return deleted;
  }

  async clear(): Promise<void> {
    this.localNode.entries.clear();
    this.emit('cleared');
  }

  async sync(): Promise<void> {
    // Cleanup expired entries
    this.cleanupExpiredEntries();

    // Update sync timestamp
    this.localNode.lastSync = Date.now();

    this.emit('synced', this.localNode.id);
  }

  getStats(): {
    localEntries: number;
    remoteNodes: number;
    totalEntries: number;
    lastSync: number;
  } {
    let totalEntries = this.localNode.entries.size;
    for (const [, node] of this.remoteNodes) {
      totalEntries += node.entries.size;
    }

    return {
      localEntries: this.localNode.entries.size,
      remoteNodes: this.remoteNodes.size,
      totalEntries,
      lastSync: this.localNode.lastSync,
    };
  }

  async shutdown(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    await this.clear();
    this.emit('shutdown');
  }

  private startSyncTimer(): void {
    this.syncTimer = setInterval(() => {
      this.sync().catch((error) => {
        this.emit('error', 'Sync failed', error);
      });
    }, this.config.syncInterval);
  }

  private async replicateEntry(entry: MemoryEntry): Promise<void> {
    // Simple replication logic - could be enhanced
    let replicated = 0;
    for (const [, node] of this.remoteNodes) {
      if (replicated >= this.config.replicationFactor) break;

      node.entries.set(entry.key, entry);
      replicated++;
    }
  }

  private isEntryValid(entry: MemoryEntry): boolean {
    if (!entry.ttl) return true;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();

    // Cleanup local entries
    for (const [key, entry] of this.localNode.entries) {
      if (!this.isEntryValid(entry)) {
        this.localNode.entries.delete(key);
      }
    }

    // Cleanup remote entries
    for (const [, node] of this.remoteNodes) {
      for (const [key, entry] of node.entries) {
        if (!this.isEntryValid(entry)) {
          node.entries.delete(key);
        }
      }
    }
  }
}

export default DistributedMemorySystem;
