/**
 * @fileoverview SAFe Collections - Collection Operations
 *
 * Collection utilities using lodash-es for SAFe framework operations.
 * Provides optimized array/object manipulations with consistent implementations.
 *
 * SINGLE RESPONSIBILITY: Collection operations for SAFe framework
 * FOCUSES ON: Feature prioritization, epic filtering, backlog management
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
/**
 * SAFe feature and epic collection utilities
 */
export declare class SafeCollectionUtils {
    /**
     * Filter features by priority using lodash
     */
    static filterByPriority<T extends {
        priority: string;
    }>(items: T[], priorities: string[]): T[];
    /**
     * Sort epics by business value using lodash
     */
    static sortByBusinessValue<T extends {
        businessValue: number;
    }>(epics: T[]): T[];
    /**
     * Group features by ART using lodash
     */
    static groupByART<T extends {
        artId: string;
    }>(features: T[]): Record<string, T[]>;
    /**
     * Calculate PI capacity by ART using lodash
     */
    static calculatePICapacity<T extends {
        artId: string;
        storyPoints: number;
    }>(features: T[]): Record<string, number>;
    /**
     * Prioritize backlog items using WSJF (Weighted Shortest Job First)
     */
    static prioritizeByWSJF<T extends {
        businessValue: number;
        urgency: number;
        riskReduction: number;
        size: number;
    }>(items: T[]): T[];
    /**
     * Partition features into committed vs aspirational using lodash
     */
    static partitionFeaturesByCommitment<T extends {
        isCommitted: boolean;
    }>(features: T[]): [T[], T[]];
    /**
     * Remove duplicate epics by identifier using lodash
     */
    static deduplicateById<T extends {
        id: string;
    }>(items: T[]): T[];
    /**
     * Create lookup table for fast epic access using lodash
     */
    static createEpicLookup<T extends {
        id: string;
    }>(epics: T[]): Record<string, T>;
    /**
     * Find highest value epic using lodash
     */
    static findHighestValueEpic<T extends {
        businessValue: number;
    }>(epics: T[]): T | undefined;
    /**
     * Find smallest epic by effort using lodash
     */
    static findSmallestEpic<T extends {
        effort: number;
    }>(epics: T[]): T | undefined;
    /**
     * Count features by status using lodash
     */
    static countFeaturesByStatus<T extends {
        status: string;
    }>(features: T[]): Record<string, number>;
    /**
     * Batch features into PI increments using lodash
     */
    static batchFeaturesByPI<T>(features: T[], batchSize: number): T[][];
    /**
     * Find feature index for insertion using lodash
     */
    static findInsertionIndex<T extends {
        priority: number;
    }>(features: T[], newFeature: T): number;
}
/**
 * SAFe portfolio and value stream utilities
 */
export declare class SafePortfolioUtils {
    /**
     * Calculate portfolio health metrics using lodash
     */
    static calculatePortfolioMetrics<T extends {
        status: 'green' | 'yellow' | 'red';
        budget: number;
        actualSpent: number;
    }>(portfolioItems: T[]): {
        healthScore: number;
        budgetUtilization: number;
        statusDistribution: Record<string, number>;
        totalBudget: number;
        totalSpent: number;
    };
    /**
     * Optimize value stream flow using lodash
     */
    static optimizeValueStreamFlow<T extends {
        valueStreamId: string;
        cycleTime: number;
        throughput: number;
        leadTime: number;
    }>(valueStreams: T[]): T[];
    /**
     * Analyze epic dependencies using lodash
     */
    static analyzeEpicDependencies<T extends {
        id: string;
        dependencies: string[];
    }>(epics: T[]): {
        epicLookup: Record<string, T>;
        dependencyCount: Record<string, number>;
        criticalPath: string[];
    };
}
//# sourceMappingURL=safe-collections.d.ts.map