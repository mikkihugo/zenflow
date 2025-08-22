/**
 * @file Shared Types for THE COLLECTIVE Coordination Layer.
 *
 * Shared interfaces to prevent circular dependencies between coordination modules.
 */

import type { TypedEventBase } from '@claude-zen/foundation';
import type { FACTKnowledgeEntry, FACTSearchQuery, FACTStorageStats,
} from '@claude-zen/intelligence';

import type { GlobalAgentInfo, GlobalResourceMetrics, UniversalFact,
} from "./collective-types";

/**
 * THE COLLECTIVE FACT System Interface
 * Shared interface to break circular dependency between collective modules.
 *
 * @example
 */
export interface CollectiveFACTSystemInterface extends TypedEventBase { initialize(): Promise<void>; shutdown(): Promise<void>; // FACT Operations searchFacts(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>; storeFact(fact: UniversalFact): Promise<void>; getFact( type: string, subject: string, swarmId?: string ): Promise<UniversalFact ' || null>; getStat's''(');: Promise<FACTStorageStats>; // Integration Methods notifySwarmUpdate?(swarmInfo: SwarmInfo): void; broadcastFactUpdate?(fact: UniversalFact): void;
}

/**
 * Hive Swarm Coordinator Interface
 * Shared interface to break circular dependency between hive modules.
 *
 * @example
 */
export interface HiveSwarmCoordinatorInterface extends TypedEventBase { initialize(): Promise<void>; shutdown(): Promise<void>; // Swarm Management registerSwarm(swarmInfo: SwarmInfo): Promise<void>; unregisterSwarm(swarmId: string): Promise<void>; getSwarmInfo(swarmId: string): Promise<SwarmInfo | null>; getAllSwarms(');: Promise<SwarmInfo[]>; // Task Distribution distributeTask(task: HiveTask): Promise<void>; getGlobalAgents(): Promise<GlobalAgentInfo[]>; // Health & Metrics getHiveHealth(): Promise<HiveHealthMetrics>; getSwarmMetrics(swarmId: string): Promise<SwarmPerformanceMetrics>; getGlobalResourceMetrics(): Promise<GlobalResourceMetrics>; // Integration Methods notifyFACTUpdate?(fact: UniversalFact): void; requestFACTSearch?(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
}
