/**
 * @file Context Manager - Replaces Hook System Context Loading
 *
 * Manages agent and swarm context, replacing the removed hook system's
 * context loading functionality with integrated memory management.
 */

import { EventEmitter } from '@claude-zen/foundation';

import { getLogger } from '../config/logging-config';

import { MemorySystem } from './core/memory-system';

const logger = getLogger('context-manager');

/**
 * Context loading result (replaces hook context loading)
 */
export interface ContextLoadingResult {
  loaded: boolean;
  context: Record<string, unknown>;
  timestamp: number;
  source?: string;
  error?: string;
}

/**
 * Agent context information
 */
export interface AgentContext {
  agentId: string;
  swarmId: string;
  type: string;
  instance: number;
  currentTask?: string;
  environment: Record<string, unknown>;
  preferences: Record<string, unknown>;
  history: Array<{
    task: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }>;
  metrics: {
    tasksCompleted: number;
    averageDuration: number;
    successRate: number;
    lastActivity: number;
  };
}

/**
 * Swarm context information
 */
export interface SwarmContext {
  swarmId: string;
  name: string;
  topology: string;
  agents: string[];
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  coordination: {
    strategy: string;
    lastSync: number;
    nextSync: number;
  };
  performance: {
    throughput: number;
    avgTaskTime: number;
    efficiency: number;
  };
}

/**
 * Session context information
 */
export interface SessionContext {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  swarms: string[];
  globalState: Record<string, unknown>;
  preferences: Record<string, unknown>;
}

/**
 * Context Manager Configuration
 */
export interface ContextManagerConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxCacheSize: number;
  autoSync: boolean;
  syncInterval: number;
  namespaces: {
    agents: string;
    swarms: string;
    sessions: string;
    global: string;
  };
}

/**
 * Default context manager configuration
 */
export const DEFAULT_CONTEXT_CONFIG: ContextManagerConfig = {
  enabled: true,
  cacheTimeout: 300000, // 5 minutes
  maxCacheSize: 1000,
  autoSync: true,
  syncInterval: 30000, // 30 seconds
  namespaces: {
    agents: 'context:agents',
    swarms: 'context:swarms',
    sessions: 'context:sessions',
    global: 'context:global',
  },
};

/**
 * Context Manager - Handles context loading and management
 *
 * Replaces the removed hook system's context loading with memory-backed
 * context management for agents, swarms, and sessions.
 */
export class ContextManager extends EventEmitter {
  private config: ContextManagerConfig;
  private memorySystem: MemorySystem;
  private contextCache: Map<string, { data: unknown; timestamp: number }> =
    new Map();
  private syncTimer?: NodeJS.Timeout;

  constructor(
    memorySystem: MemorySystem,
    config?: Partial<ContextManagerConfig>
  ) {
    super();
    this.config = { ...DEFAULT_CONTEXT_CONFIG, ...config };
    this.memorySystem = memorySystem;

    if (this.config.enabled && this.config.autoSync) {
      this.startAutoSync();
    }

    logger.info('ContextManager initialized', {
      enabled: this.config.enabled,
      autoSync: this.config.autoSync,
    });
  }

  /**
   * Load context for any entity (replaces hook system context loading)
   */
  async loadContext(context: {
    type: 'agent|swarm|session|global';
    id: string;
    options?: {
      includeHistory?: boolean;
      includeMetrics?: boolean;
      maxAge?: number;
    };
  }): Promise<ContextLoadingResult> {
    if (!this.config.enabled) {
      return { loaded: false, context: {}, timestamp: Date.now() };
    }

    try {
      const cacheKey = `${context.type}:${context.id}`;

      // Check cache first
      const cached = this.contextCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        logger.debug('Context loaded from cache', {
          type: context.type,
          id: context.id,
        });
        return {
          loaded: true,
          context: cached.data as Record<string, unknown>,
          timestamp: cached.timestamp,
          source: 'cache',
        };
      }

      // Load from memory system
      const namespace = this.getNamespace(context.type);
      const data = await this.memorySystem.retrieve(context.id, namespace);

      if (data) {
        // Update cache
        this.contextCache.set(cacheKey, { data, timestamp: Date.now() });

        // Clean cache if needed
        this.cleanCache();

        logger.debug('Context loaded from memory', {
          type: context.type,
          id: context.id,
        });

        this.emit('context-loaded', {
          type: context.type,
          id: context.id,
          success: true,
        });

        return {
          loaded: true,
          context: data as Record<string, unknown>,
          timestamp: Date.now(),
          source: 'memory',
        };
      } else {
        // No context found, return empty context
        logger.debug('No context found, returning empty', {
          type: context.type,
          id: context.id,
        });

        return {
          loaded: false,
          context: {},
          timestamp: Date.now(),
          source: 'empty',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Context loading failed', {
        type: context.type,
        id: context.id,
        error: errorMessage,
      });

      this.emit('context-error', {
        type: context.type,
        id: context.id,
        error: errorMessage,
      });

      return {
        loaded: false,
        context: {},
        timestamp: Date.now(),
        error: errorMessage,
      };
    }
  }

  /**
   * Save context to memory
   */
  async saveContext(
    type: 'agent|swarm|session|global',
    id: string,
    contextData: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const namespace = this.getNamespace(type);
      await this.memorySystem.store(id, contextData, namespace);

      // Update cache
      const cacheKey = `${type}:${id}`;
      this.contextCache.set(cacheKey, {
        data: contextData,
        timestamp: Date.now(),
      });

      logger.debug('Context saved', { type, id });

      this.emit('context-saved', {
        type,
        id,
        success: true,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Context saving failed', { type, id, error: errorMessage });

      this.emit('context-error', {
        type,
        id,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Load agent context with full details
   */
  async loadAgentContext(agentId: string): Promise<AgentContext | null> {
    const result = await this.loadContext({ type: 'agent', id: agentId });

    if (result.loaded && result.context) {
      return result.context as AgentContext;
    }

    // Return default agent context if none exists
    return {
      agentId,
      swarmId: 'unknown',
      type: 'unknown',
      instance: 1,
      environment: {},
      preferences: {},
      history: [],
      metrics: {
        tasksCompleted: 0,
        averageDuration: 0,
        successRate: 0,
        lastActivity: Date.now(),
      },
    };
  }

  /**
   * Load swarm context with full details
   */
  async loadSwarmContext(swarmId: string): Promise<SwarmContext | null> {
    const result = await this.loadContext({ type: 'swarm', id: swarmId });

    if (result.loaded && result.context) {
      return result.context as SwarmContext;
    }

    return null;
  }

  /**
   * Load session context with full details
   */
  async loadSessionContext(sessionId: string): Promise<SessionContext | null> {
    const result = await this.loadContext({ type: 'session', id: sessionId });

    if (result.loaded && result.context) {
      return result.context as SessionContext;
    }

    return null;
  }

  /**
   * Update agent metrics in context
   */
  async updateAgentMetrics(
    agentId: string,
    metrics: Partial<AgentContext['metrics']>
  ): Promise<boolean> {
    try {
      const context = await this.loadAgentContext(agentId);
      if (!context) return false;

      context.metrics = { ...context.metrics, ...metrics };
      return await this.saveContext('agent', agentId, context);
    } catch (error) {
      logger.error('Failed to update agent metrics', { agentId, error });
      return false;
    }
  }

  /**
   * Add task to agent history
   */
  async addTaskToHistory(
    agentId: string,
    task: string,
    duration: number,
    success: boolean
  ): Promise<boolean> {
    try {
      const context = await this.loadAgentContext(agentId);
      if (!context) return false;

      context.history.push({
        task,
        duration,
        success,
        timestamp: Date.now(),
      });

      // Keep only last 50 history items
      if (context.history.length > 50) {
        context.history = context.history.slice(-50);
      }

      // Update metrics
      context.metrics.tasksCompleted++;
      context.metrics.lastActivity = Date.now();

      const successful = context.history.filter((h) => h.success).length;
      context.metrics.successRate = successful / context.history.length;

      const avgDuration =
        context.history.reduce((sum, h) => sum + h.duration, 0) /
        context.history.length;
      context.metrics.averageDuration = avgDuration;

      return await this.saveContext('agent', agentId, context);
    } catch (error) {
      logger.error('Failed to add task to history', { agentId, error });
      return false;
    }
  }

  /**
   * Get global system context
   */
  async getGlobalContext(): Promise<Record<string, unknown>> {
    const result = await this.loadContext({ type: 'global', id: ' system' });
    return result.context || {};
  }

  /**
   * Update global system context
   */
  async updateGlobalContext(
    updates: Record<string, unknown>
  ): Promise<boolean> {
    const current = await this.getGlobalContext();
    const updated = { ...current, ...updates };
    return await this.saveContext('global', 'system', updated);
  }

  /**
   * Clear all context cache
   */
  clearCache(): void {
    this.contextCache.clear();
    logger.info('Context cache cleared');
  }

  /**
   * Get context cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: number;
  } {
    let oldestTimestamp = Date.now();
    for (const entry of this.contextCache.values()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      size: this.contextCache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: 0, // Would need to track hits/misses
      oldestEntry: oldestTimestamp,
    };
  }

  /**
   * Shutdown context manager
   */
<<<<<<< HEAD
  shutdown():void {
=======
  async shutdown(): Promise<void> {
>>>>>>> origin/main
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    this.contextCache.clear();
    this.emit('shutdown', {});
    logger.info('ContextManager shutdown');
  }

  /**
   * Get namespace for context type
   */
  private getNamespace(type: 'agent|swarm|session|global'): string {
    return this.config.namespaces[type];
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.config.cacheTimeout;
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    if (this.contextCache.size > this.config.maxCacheSize) {
      // Remove oldest entries
      const entries = Array.from(this.contextCache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );

      const toRemove = entries.slice(
        0,
        Math.floor(this.config.maxCacheSize * 0.2)
      );
      for (const [key] of toRemove) {
        this.contextCache.delete(key);
      }
    }

    // Remove expired entries
    const now = Date.now();
    for (const [key, entry] of this.contextCache.entries()) {
      if (now - entry.timestamp > this.config.cacheTimeout) {
        this.contextCache.delete(key);
      }
    }
  }

  /**
   * Start automatic sync timer
   */
  private startAutoSync(): void {
    this.syncTimer = setInterval(() => {
      this.cleanCache();
      this.emit('auto-sync', {});
    }, this.config.syncInterval);
  }
}

/**
 * Factory function to create Context Manager
 */
export function createContextManager(
  memorySystem: MemorySystem,
  config?: Partial<ContextManagerConfig>
): ContextManager {
  return new ContextManager(memorySystem, config);
}

/**
 * Global context manager instance
 */
let globalContextManager: ContextManager | null = null;

/**
 * Get or create global context manager
 */
export function getGlobalContextManager(
  memorySystem?: MemorySystem
): ContextManager {
  if (!globalContextManager && memorySystem) {
    globalContextManager = new ContextManager(memorySystem);
  }

  if (!globalContextManager) {
    throw new Error(
      'Global context manager not initialized. Provide memorySystem parameter.'
    );
  }

  return globalContextManager;
}

/**
 * Utility function to wrap a task with context loading
 */
export async function withContextLoading<T>(
  contextManager: ContextManager,
  contextType: 'agent|swarm|session',
  contextId: string,
  fn: (context: Record<string, unknown>) => Promise<T>
): Promise<T> {
  const contextResult = await contextManager.loadContext({
    type: contextType,
    id: contextId,
  });
  return await fn(contextResult.context);
}
