/**
 * @deprecated Use CoordinationDao from '../dao/coordination.dao.ts';.
 * This shim will be removed after migration period.
 */
/**
 * @file Database layer: coordination-dao.
 */
export { CoordinationDao as CoordinationDAO } from '../dao/coordination.dao.ts';
import type { Logger } from '../../config/logging-config.ts';
interface CoordinationLock {
    id: string;
    acquired: Date;
    ttl?: number;
}
interface TransactionOperation {
    type: string;
    data?: any;
    entityType?: string;
}
interface CoordinationStats {
    messagesPublished: number;
    uptime: number;
}
interface CoordinationRepository {
    publish(channel: string, event: any): Promise<void>;
    tryAcquireLock(key: string, maxRetries: number, retryDelay: number, timeout: number): Promise<CoordinationLock | null>;
    acquireLock(key: string, timeout: number): Promise<CoordinationLock>;
    releaseLock(lockId: string): Promise<void>;
    getCoordinationStats(): Promise<CoordinationStats>;
    getActiveLocks(): Promise<CoordinationLock[]>;
    getSubscriptions(): Promise<any[]>;
}
export declare class CoordinationService {
    private logger;
    private coordinationRepository;
    constructor(logger: Logger, coordinationRepository: CoordinationRepository);
    /**
     * Distributed messaging and event coordination.
     *
     * @param eventType
     * @param data
     * @param options
     * @param options.channel
     * @param options.waitForAcknowledgment
     * @param options.timeout
     * @param options.targetNodes
     */
    coordinateEvent(eventType: string, data: any, options?: {
        channel?: string;
        waitForAcknowledgment?: boolean;
        timeout?: number;
        targetNodes?: string[];
    }): Promise<{
        published: boolean;
        acknowledgments: number;
        errors: string[];
    }>;
    /**
     * Leader election and consensus management.
     *
     * @param electionId
     * @param candidateId
     * @param options
     * @param options.timeout
     * @param options.termDuration
     * @param options.voteWeight
     */
    electLeader(electionId: string, candidateId: string, options?: {
        timeout?: number;
        termDuration?: number;
        voteWeight?: number;
    }): Promise<{
        isLeader: boolean;
        leaderId?: string;
        term: number;
        votes: number;
    }>;
    /**
     * Distributed workflow coordination.
     *
     * @param workflowId
     * @param steps
     * @param options
     * @param options.parallelExecution
     * @param options.failureHandling
     * @param options.maxRetries
     */
    coordinateWorkflow(workflowId: string, steps: Array<{
        stepId: string;
        operation: TransactionOperation;
        dependencies?: string[];
        timeout?: number;
    }>, options?: {
        parallelExecution?: boolean;
        failureHandling?: 'abort' | 'continue' | 'retry';
        maxRetries?: number;
    }): Promise<{
        workflowId: string;
        completed: boolean;
        results: Record<string, any>;
        errors: Record<string, string>;
        executionTime: number;
    }>;
    /**
     * Get coordination health and metrics.
     */
    getCoordinationHealth(): Promise<{
        stats: CoordinationStats;
        activeLocks: number;
        averageLockDuration: number;
        lockContention: number;
        publishRate: number;
        subscriptionCount: number;
        messageLatency: number;
        leaderElections: number;
        consensusFailures: number;
        networkPartitions: number;
    }>;
    /**
     * Get database-specific metadata with coordination information.
     */
    protected getDatabaseType(): 'relational' | 'graph' | 'vector' | 'memory' | 'coordination';
    protected getSupportedFeatures(): string[];
    protected getConfiguration(): Record<string, any>;
    /**
     * Enhanced performance metrics for coordination databases.
     */
    protected getCustomMetrics(): Record<string, any> | undefined;
    /**
     * Private helper methods.
     */
    private extractResourceIds;
    private verifyConsensus;
    private waitForAcknowledgments;
    private waitForElectionResult;
    private conductElection;
    private executeWorkflowParallel;
    private executeWorkflowSequential;
    private generateNodeIdentifier;
    private calculateAverageLockDuration;
    private executeTransaction;
}
//# sourceMappingURL=coordination-dao.d.ts.map