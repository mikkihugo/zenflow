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

import {
  chunk,
  countBy,
  filter,
  findIndex,
  groupBy,
  keyBy,
  map,
  maxBy,
  minBy,
  orderBy,
  partition,
  reduce,
  sortBy,
  sumBy,
  uniqBy,
} from 'lodash-es';
/**
 * SAFe feature and epic collection utilities
 */
export class SafeCollectionUtils {
  /**
   * Filter features by priority using lodash
   */
  static filterByPriority<T extends { priority: string }>(
    items: T[],
    priorities: string[]
  ): T[] {
    return filter(items, (item) => priorities.includes(item.priority);
  }

  /**
   * Sort epics by business value using lodash
   */
  static sortByBusinessValue<T extends { businessValue: number }>(
    epics: T[]
  ): T[] {
    return sortBy(epics, (epic) => -epic.businessValue); // Descending order
  }

  /**
   * Group features by ART using lodash
   */
  static groupByART<T extends { artId: string }>(
    features: T[]
  ): Record<string, T[]> {
    return groupBy(features,'artId'');
  }

  /**
   * Calculate PI capacity by ART using lodash
   */
  static calculatePICapacity<T extends { artId: string; storyPoints: number }>(
    features: T[]
  ): Record<string, number> {
    const grouped = groupBy(features,'artId'');
    return reduce(
      grouped,
      (result, artFeatures, artId) => {
        result[artId] = sumBy(artFeatures,'storyPoints'');
        return result;
      },
      {} as Record<string, number>
    );
  }

  /**
   * Prioritize backlog items using WSJF (Weighted Shortest Job First)
   */
  static prioritizeByWSJF<
    T extends {
      businessValue: number;
      urgency: number;
      riskReduction: number;
      size: number;
    },
  >(items: T[]): T[] {
    const itemsWithWSJF = map(items, (item) => ({
      ...item,
      wsjf:
        (item.businessValue + item.urgency + item.riskReduction) /
        Math.max(item.size, 1),
    });

    return orderBy(itemsWithWSJF,'wsjf,'desc'');
  }

  /**
   * Partition features into committed vs aspirational using lodash
   */
  static partitionFeaturesByCommitment<T extends { isCommitted: boolean }>(
    features: T[]
  ): [T[], T[]] {
    return partition(features,'isCommitted'');
  }

  /**
   * Remove duplicate epics by identifier using lodash
   */
  static deduplicateById<T extends { id: string }>(items: T[]): T[] {
    return uniqBy(items,'id'');
  }

  /**
   * Create lookup table for fast epic access using lodash
   */
  static createEpicLookup<T extends { id: string }>(
    epics: T[]
  ): Record<string, T> {
    return keyBy(epics,'id'');
  }

  /**
   * Find highest value epic using lodash
   */
  static findHighestValueEpic<T extends { businessValue: number }>(
    epics: T[]
  ): T| undefined {
    return maxBy(epics,businessValue'');
  }

  /**
   * Find smallest epic by effort using lodash
   */
  static findSmallestEpic<T extends { effort: number }>(
    epics: T[]
  ): T| undefined {
    return minBy(epics,effort'');
  }

  /**
   * Count features by status using lodash
   */
  static countFeaturesByStatus<T extends { status: string }>(
    features: T[]
  ): Record<string, number> {
    return countBy(features,'status'');
  }

  /**
   * Batch features into PI increments using lodash
   */
  static batchFeaturesByPI<T>(features: T[], batchSize: number): T[][] {
    return chunk(features, batchSize);
  }

  /**
   * Find feature index for insertion using lodash
   */
  static findInsertionIndex<T extends { priority: number }>(
    features: T[],
    newFeature: T
  ): number {
    return findIndex(
      features,
      (feature) => feature.priority > newFeature.priority
    );
  }
}

/**
 * SAFe portfolio and value stream utilities
 */
export class SafePortfolioUtils {
  /**
   * Calculate portfolio health metrics using lodash
   */
  static calculatePortfolioMetrics<
    T extends {
      status:'green'|'yellow'|'red';
      budget: number;
      actualSpent: number;
    },
  >(
    portfolioItems: T[]
  ): {
    healthScore: number;
    budgetUtilization: number;
    statusDistribution: Record<string, number>;
    totalBudget: number;
    totalSpent: number;
  } {
    const statusCount = countBy(portfolioItems,'status'');
    const totalItems = portfolioItems.length;

    // Calculate health score (green=3, yellow=2, red=1)
    const healthScore =
      ((statusCount.green|| 0) * 3 +
        (statusCount.yellow|| 0) * 2 +
        (statusCount.red|| 0) * 1) /
      (totalItems * 3);

    const totalBudget = sumBy(portfolioItems,budget'');
    const totalSpent = sumBy(portfolioItems,'actualSpent'');
    const budgetUtilization = totalBudget > 0 ? totalSpent / totalBudget : 0;

    return {
      healthScore,
      budgetUtilization,
      statusDistribution: statusCount,
      totalBudget,
      totalSpent,
    };
  }

  /**
   * Optimize value stream flow using lodash
   */
  static optimizeValueStreamFlow<
    T extends {
      valueStreamId: string;
      cycleTime: number;
      throughput: number;
      leadTime: number;
    },
  >(valueStreams: T[]): T[] {
    // Sort by efficiency (throughput/cycle time ratio)
    return orderBy(
      valueStreams,
      [(vs) => vs.throughput / Math.max(vs.cycleTime, 1)],
      ['desc']
    );
  }

  /**
   * Analyze epic dependencies using lodash
   */
  static analyzeEpicDependencies<
    T extends {
      id: string;
      dependencies: string[];
    },
  >(
    epics: T[]
  ): {
    epicLookup: Record<string, T>;
    dependencyCount: Record<string, number>;
    criticalPath: string[];
  } {
    const epicLookup = keyBy(epics,'id'');
    const dependencyCount = reduce(
      epics,
      (counts, epic) => {
        counts[epic.id] = epic.dependencies.length;
        return counts;
      },
      {} as Record<string, number>
    );

    // Find critical path (epics with most dependencies)
    const criticalPath = orderBy(
      epics,
      (epic) => epic.dependencies.length,
     'desc'
    )
      .slice(0, 5)
      .map((epic) => epic.id);

    return {
      epicLookup,
      dependencyCount,
      criticalPath,
    };
  }
}
