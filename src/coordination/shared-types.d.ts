/**
 * @file Shared Types for THE COLLECTIVE Coordination Layer.
 *
 * Shared interfaces to prevent circular dependencies between coordination modules.
 * Extracted from collective-fact-integration and collective-cube-sync to break circular imports.
 */
import type { EventEmitter } from 'node:events';
import type { FACTKnowledgeEntry, FACTSearchQuery, FACTStorageStats } from '../knowledge/types/fact-types';
import type { GlobalAgentInfo, GlobalResourceMetrics, UniversalFact } from './collective-types';
/**
 * THE COLLECTIVE FACT System Interface
 * Shared interface to break circular dependency between collective modules.
 *
 * @example
 */
export interface CollectiveFACTSystemInterface extends EventEmitter {
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    searchFacts(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
    storeFact(fact: UniversalFact): Promise<void>;
    getFact(type: string, subject: string, swarmId?: string): Promise<UniversalFact | null>;
    getStats(): Promise<FACTStorageStats>;
    notifySwarmUpdate?(swarmInfo: SwarmInfo): void;
    broadcastFactUpdate?(fact: UniversalFact): void;
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
    registerSwarm(swarmInfo: SwarmInfo): Promise<void>;
    unregisterSwarm(swarmId: string): Promise<void>;
    getSwarmInfo(swarmId: string): Promise<SwarmInfo | null>;
    getAllSwarms(): Promise<SwarmInfo[]>;
    distributeTask(task: HiveTask): Promise<void>;
    getGlobalAgents(): Promise<GlobalAgentInfo[]>;
    getHiveHealth(): Promise<HiveHealthMetrics>;
    getSwarmMetrics(swarmId: string): Promise<SwarmPerformanceMetrics>;
    getGlobalResourceMetrics(): Promise<GlobalResourceMetrics>;
    notifyFACTUpdate?(fact: UniversalFact): void;
    requestFACTSearch?(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
}
//# sourceMappingURL=shared-types.d.ts.map