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
// No imports needed for type definitions
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
static groupByART<T extends { artId: string }>(features: T[]): Record<string, T[]>;

}
/**
* SAFe portfolio and value stream utilities
*/
export declare class SafePortfolioUtils {
/**
* Calculate portfolio health metrics using lodash
*/
static calculatePortfolioMetrics<T extends { status: string }>(portfolioItems: T[]): { totalItems: number; healthScore: number };

}
//# sourceMappingURL=safe-collections.d.ts.map