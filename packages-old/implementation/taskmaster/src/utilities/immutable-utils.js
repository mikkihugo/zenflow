/**
 * @fileoverview Immutable Utilities - Battle-Tested State Management
 *
 * Professional immutable state updates using Immer library.
 * Replaces all custom state mutation logic with battle-tested producers.
 *
 * File name: immutable-utils.ts (kebab-case as per TS standards)
 * Class name: ImmutableUtils (PascalCase as per TS standards)
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { enableMapSet, produce } from 'immer';
// Enable Immer support for Map and Set
enableMapSet();
/**
 * Immutable task utilities using battle-tested Immer
 */
export class ImmutableTaskUtils {
    /**
     * Update task state immutably
     */
    static updateTask(tasks, taskId, updater) {
        return produce(tasks, (draft) => {
            const taskIndex = draft.findIndex((t) => t.id === taskId);
            if (taskIndex >= 0) {
                updater(draft[taskIndex]);
            }
        });
    }
    /**
     * Add task to collection immutably
     */
    static addTask(tasks, newTask) {
        return produce(tasks, (draft) => {
            draft.push(newTask);
        });
    }
    /**
     * Remove task from collection immutably
     */
    static removeTask(tasks, taskId) {
        return produce(tasks, (draft) => {
            const index = draft.findIndex((t) => t.id === taskId);
            if (index >= 0) {
                draft.splice(index, 1);
            }
        });
    }
}
/**
 * Immutable WIP limits utilities using battle-tested Immer
 */
export class ImmutableWIPUtils {
    /**
     * Update WIP limits immutably
     */
    static updateWIPLimits(limits, updates) {
        return produce(limits, (draft) => {
            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined && value >= 0 && key in draft) {
                    draft[key] = value;
                }
            });
        });
    }
    /**
     * Optimize WIP limits based on utilization
     */
    static optimizeWIPLimits(currentLimits, utilizationData) {
        return produce(currentLimits, (draft) => {
            const draftLimits = draft;
            Object.entries(utilizationData).forEach(([state, data]) => {
                if (state in draft) {
                    const currentLimit = draftLimits[state];
                    const utilizationRatio = data.current / currentLimit;
                    // Increase limit if highly utilized (>0.9), decrease if underutilized (<0.5)
                    if (utilizationRatio > 0.9) {
                        draftLimits[state] = Math.ceil(currentLimit * 1.2);
                    }
                    else if (utilizationRatio < 0.5) {
                        draftLimits[state] = Math.max(1, Math.floor(currentLimit * 0.8));
                    }
                }
            });
        });
    }
}
/**
 * Immutable metrics utilities using battle-tested Immer
 */
export class ImmutableMetricsUtils {
    /**
     * Calculate flow metrics immutably
     */
    static calculateFlowMetrics(allTasks, completedTasks, blockedTasks, calculators) {
        // Calculate cycle times
        const cycleTimes = completedTasks
            .filter((t) => t.startedAt && t.completedAt)
            .map((t) => ((t.completedAt?.getTime() || 0) - (t.startedAt?.getTime() || 0)) /
            (1000 * 60 * 60)); // hours
        const averageCycleTime = cycleTimes.length > 0
            ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
            : 0;
        // Calculate lead times
        const leadTimes = completedTasks
            .filter((t) => t.completedAt)
            .map((t) => ((t.completedAt?.getTime() || 0) - t.createdAt.getTime()) /
            (1000 * 60 * 60)); // hours
        const averageLeadTime = leadTimes.length > 0
            ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
            : 0;
        // Calculate throughput (tasks per day)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentCompletions = completedTasks.filter((t) => t.completedAt && t.completedAt.getTime() > oneDayAgo);
        const throughput = recentCompletions.length;
        return {
            throughput,
            cycleTime: averageCycleTime,
            leadTime: averageLeadTime,
            wipEfficiency: calculators.wipEfficiency,
            blockageRate: allTasks.length > 0 ? blockedTasks.length / allTasks.length : 0,
            flowEfficiency: cycleTimes.length > 0 ? Math.min(1, 168 / averageCycleTime) : 1, // Efficiency relative to 1 week
            predictability: calculators.predictabilityCalculator(cycleTimes),
            qualityIndex: calculators.qualityCalculator(completedTasks),
        };
    }
    /**
     * Update metrics state immutably
     */
    static updateMetrics(currentMetrics, newMetrics) {
        return produce(currentMetrics, (draft) => {
            Object.entries(newMetrics).forEach(([key, value]) => {
                if (value !== undefined) {
                    draft[key] = value;
                }
            });
        });
    }
}
/**
 * Immutable context utilities using battle-tested Immer
 */
export class ImmutableContextUtils {
    /**
     * Update workflow context safely
     */
    static updateContext(context, updater) {
        return produce(context, updater);
    }
    /**
     * Add error to context errors array
     */
    static addError(context, error) {
        return produce(context, (draft) => {
            draft.errors.push({
                ...error,
                timestamp: new Date(),
                id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            } `
      });
    });
  }
}

/**
 * General immutable utilities using battle-tested Immer (legacy support)
 */
export class ImmutableUtils {
  /**
   * Deep clone any object safely with Immer
   */
  static deepClone<T>(obj: T): T {
    return produce(obj, () => {});
  }

  /**
   * Safe merge of objects without mutation
   */
  static merge<T extends Record<string, any>>(base: T, updates: Partial<T>): T {
    return produce(base, (draft) => {
      Object.assign(draft, updates);
    });
  }
}
            );
        });
    }
}
