/**
 * @file Auto-Swarm Factory - Creates optimized swarms based on domain characteristics.
 *
 * This is the CRITICAL component that enables zero-manual-initialization swarm creation.
 * It uses confidence scores from Progressive Confidence Builder to automatically:
 * - Select optimal topology (mesh, hierarchical, star, ring)
 * - Determine agent types and counts
 * - Configure persistent swarm settings
 * - Register with HiveSwarmCoordinator.
 */
import { EventEmitter } from 'node:events';
import type { HiveSwarmCoordinator } from '../hive-swarm-sync.ts';
import type { SwarmCoordinator } from '../swarm/core/swarm-coordinator.ts';
import type { AGUIInterface } from '../../interfaces/agui/agui-adapter.ts';
import type { SessionMemoryStore } from '../../memory/memory.ts';
export interface DomainCharacteristics {
    name: string;
    path: string;
    fileCount: number;
    complexity: 'low' | 'medium' | 'high' | 'extreme';
    interconnectedness: number;
    domainSize: 'small' | 'medium' | 'large' | 'massive';
    technologies: string[];
    concepts: string[];
    confidence: number;
    dependencyCount: number;
    hasNestedStructure: boolean;
    isPipeline: boolean;
    isCentralized: boolean;
}
export interface SwarmTopology {
    type: 'mesh' | 'hierarchical' | 'star' | 'ring';
    reason: string;
    optimalFor: string[];
    performance: {
        coordination: number;
        scalability: number;
        faultTolerance: number;
    };
}
export interface AgentConfiguration {
    type: string;
    count: number;
    specialization: string;
    capabilities: string[];
    priority: 'high' | 'medium' | 'low';
}
export interface SwarmConfig {
    id: string;
    name: string;
    domain: string;
    topology: SwarmTopology;
    agents: AgentConfiguration[];
    maxAgents: number;
    persistence: {
        backend: 'sqlite' | 'lancedb' | 'json';
        path: string;
        memoryLimit?: string;
    };
    coordination: {
        strategy: 'parallel' | 'sequential' | 'adaptive';
        timeout: number;
        retryPolicy: {
            maxRetries: number;
            backoff: 'linear' | 'exponential';
        };
    };
    performance: {
        expectedLatency: number;
        expectedThroughput: number;
        resourceLimits: {
            memory: string;
            cpu: number;
        };
    };
    created: number;
    lastUpdated: number;
    confidence: number;
}
export interface AutoSwarmFactoryConfig {
    enableHumanValidation: boolean;
    defaultPersistenceBackend: 'sqlite' | 'lancedb' | 'json';
    maxSwarmsPerDomain: number;
    performanceMode: 'balanced' | 'speed' | 'quality';
    resourceConstraints: {
        maxTotalAgents: number;
        memoryLimit: string;
        cpuLimit: number;
    };
}
export interface ConfidentDomain {
    name: string;
    path: string;
    files: string[];
    confidence: {
        overall: number;
        domainClarity: number;
        consistency: number;
    };
    suggestedConcepts: string[];
    technologies?: string[];
    relatedDomains: string[];
    validations: Array<{
        type: string;
        result: string;
        confidence: number;
        timestamp: number;
    }>;
    research: Array<{
        query: string;
        results: any[];
        insights: string[];
        confidence: number;
    }>;
    refinementHistory: Array<{
        changes: string[];
        confidence: number;
        timestamp: number;
    }>;
}
/**
 * Auto-Swarm Factory - The final piece for complete automation.
 *
 * This factory analyzes confident domains and automatically creates.
 * Optimized swarm configurations without manual intervention..
 *
 * @example
 */
export declare class AutoSwarmFactory extends EventEmitter {
    private swarmCoordinator;
    private hiveSync;
    private memoryStore;
    private agui?;
    private config;
    private createdSwarms;
    private domainAnalysisCache;
    constructor(swarmCoordinator: SwarmCoordinator, hiveSync: HiveSwarmCoordinator, memoryStore: SessionMemoryStore, agui?: AGUIInterface | undefined, config?: Partial<AutoSwarmFactoryConfig>);
    /**
     * Main entry point - Create swarms for all confident domains.
     *
     * @param confidentDomains
     */
    createSwarmsForDomains(confidentDomains: Map<string, ConfidentDomain>): Promise<SwarmConfig[]>;
    /**
     * Create optimized swarm configuration for a single domain.
     *
     * @param domain
     */
    createSwarmForDomain(domain: ConfidentDomain): Promise<SwarmConfig>;
    /**
     * Analyze domain characteristics for optimal swarm configuration.
     *
     * @param domain
     */
    private analyzeDomainCharacteristics;
    /**
     * Select optimal topology based on domain characteristics.
     *
     * @param chars
     */
    private selectOptimalTopology;
    /**
     * Configure agents based on domain characteristics and topology.
     *
     * @param chars
     * @param _topology
     */
    private configureAgents;
    /**
     * Configure persistence strategy based on domain characteristics.
     *
     * @param chars
     */
    private configurePersistence;
    /**
     * Configure coordination strategy.
     *
     * @param chars
     * @param topology
     */
    private configureCoordination;
    /**
     * Calculate expected performance metrics.
     *
     * @param chars
     * @param topology
     * @param agents
     */
    private calculatePerformanceExpectations;
    /**
     * Calculate maximum agents for the swarm.
     *
     * @param chars
     */
    private calculateMaxAgents;
    /**
     * Validate resource constraints across all swarms.
     *
     * @param configs
     */
    private validateResourceConstraints;
    /**
     * Perform human validation of swarm configurations.
     *
     * @param configs
     */
    private performHumanValidation;
    /**
     * Initialize all approved swarms.
     *
     * @param configs
     */
    private initializeSwarms;
    /**
     * Get statistics about created swarms.
     */
    getSwarmStatistics(): {
        totalSwarms: number;
        totalAgents: number;
        topologyDistribution: Record<string, number>;
        averageConfidence: number;
        domains: string[];
    };
}
//# sourceMappingURL=auto-swarm-factory.d.ts.map