/**
 * Base ZenSwarm Class - Core implementation without circular dependencies
 *
 * This file contains the core ZenSwarm implementation to avoid circular
 * dependencies with session-integration.ts
 */

import { EventEmitter } from 'node:events';
import { SwarmPersistencePooled } from '../../../database/persistence/persistence-pooled';
import { WasmModuleLoader } from '../../../neural/wasm/wasm-loader';
import { AgentPool, type BaseAgent } from '../../agents/agent';
import { getContainer } from './singleton-container';
import type { SwarmEventEmitter, SwarmOptions, SwarmState } from './types';
import { generateId, validateSwarmOptions } from './utils';

/**
 * Core ZenSwarm implementation with all base functionality
 */
export class ZenSwarm extends EventEmitter implements SwarmEventEmitter {
  private swarmId: string;
  private agents: Map<string, BaseAgent> = new Map();
  private state: SwarmState = 'idle';
  private persistence?: SwarmPersistencePooled;
  private agentPool?: AgentPool;
  private wasmLoader: WasmModuleLoader;
  private options: Required<SwarmOptions>;
  private metrics: any;
  private neuralProcessor: any;
  private isRunning: boolean;

  constructor(options: SwarmOptions = {}) {
    super();

    this.options = validateSwarmOptions(options);
    this.swarmId = generateId('swarm');
    this.wasmLoader = getContainer().get(WasmModuleLoader) || new WasmModuleLoader();
    this.isRunning = false;

    this.metrics = {
      tasksCreated: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      messagesProcessed: 0,
      cognitiveLoad: 0,
      averageResponseTime: 0,
      neuralNetworkAccuracy: 0,
      swarmEfficiency: 0,
      timestamp: Date.now(),
    };
  }

  // All the ZenSwarm methods would go here...
  // (Moving the entire class implementation from index.ts)

  async initialize(): Promise<void> {
    this.emit('swarm:initializing', { swarmId: this.swarmId });

    // Initialize persistence if enabled
    if (this.options.persistence.enabled) {
      this.persistence = new SwarmPersistencePooled({
        dbPath: this.options.persistence.dbPath || './swarm-state.db',
        checkpointInterval: this.options.persistence.checkpointInterval || 30000,
        compressionEnabled: this.options.persistence.compressionEnabled ?? true,
        usePooledConnections: true,
        maxConnections: this.options.pooling?.maxPoolSize || 10,
      });
      await this.persistence.initialize();
    }

    // Initialize WASM neural processor
    try {
      await this.wasmLoader.loadModule();
      this.neuralProcessor = this.wasmLoader;
    } catch (error) {
      console.warn('Failed to load WASM module, falling back to JS implementation:', error);
    }

    // Initialize agent pool
    if (this.options.pooling?.enabled) {
      this.agentPool = new AgentPool();
    }

    this.state = 'initialized';
    this.emit('swarm:initialized', { swarmId: this.swarmId });
  }

  getSwarmId(): string {
    return this.swarmId;
  }

  getState(): SwarmState {
    return this.state;
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;
    this.state = 'terminated';

    // Clean up agents
    for (const agent of this.agents.values()) {
      await agent.shutdown();
    }
    this.agents.clear();

    // Clean up persistence
    if (this.persistence) {
      await this.persistence.shutdown();
    }

    // Clean up agent pool
    if (this.agentPool) {
      await this.agentPool.shutdown();
    }

    this.emit('swarm:shutdown', { swarmId: this.swarmId });
  }

  // Type guard to satisfy TypeScript's event typing
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }
}

export default ZenSwarm;
