/**
 * @file Shared Types for Coordination Layer.
 * 
 * Shared interfaces to prevent circular dependencies between coordination modules.
 * Extracted from hive-fact-integration and hive-swarm-sync to break circular imports.
 */

import type { EventEmitter } from 'node:events';
import type { FACTSearchQuery, FACTStorageStats } from '../knowledge/types/fact-types';
import type {
  GlobalAgentInfo,
  GlobalResourceMetrics, 
  HiveHealthMetrics,
  Task as HiveTask,
  SwarmInfo,
  SwarmPerformanceMetrics,
} from './hive-types';

/**
 * Hive FACT System Interface
 * Shared interface to break circular dependency between hive modules.
 *
 * @example
 */
export interface HiveFACTSystemInterface extends EventEmitter {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // FACT Operations
  searchFacts(query: FACTSearchQuery): Promise<any[]>;
  storeFact(fact: any): Promise<void>;
  getStats(): Promise<FACTStorageStats>;
  
  // Integration Methods
  notifySwarmUpdate?(swarmInfo: SwarmInfo): void;
  broadcastFactUpdate?(fact: any): void;
}

/**
 * Hive Swarm Coordinator Interface  
 * Shared interface to break circular dependency between hive modules.
 *
 * @example
 */
export interface HiveSwarmCoordinatorInterface extends EventEmitter {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // Swarm Management
  registerSwarm(swarmInfo: SwarmInfo): Promise<void>;
  unregisterSwarm(swarmId: string): Promise<void>;
  getSwarmInfo(swarmId: string): Promise<SwarmInfo | null>;
  getAllSwarms(): Promise<SwarmInfo[]>;
  
  // Task Distribution
  distributeTask(task: HiveTask): Promise<void>;
  getGlobalAgents(): Promise<GlobalAgentInfo[]>;
  
  // Health & Metrics
  getHiveHealth(): Promise<HiveHealthMetrics>;
  getSwarmMetrics(swarmId: string): Promise<SwarmPerformanceMetrics>;
  getGlobalResourceMetrics(): Promise<GlobalResourceMetrics>;
  
  // Integration Methods
  notifyFACTUpdate?(fact: any): void;
  requestFACTSearch?(query: FACTSearchQuery): Promise<any[]>;
}