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
import { type Draft } from 'immer';
/**
 * Immutable task utilities using battle-tested Immer
 */
export declare class ImmutableTaskUtils {
    /**
     * Update task state immutably
     */
    static updateTask<T extends {
        id: string;
    }>(tasks: T[], taskId: string, updater: (task: Draft<T>) => void): T[];
    /**
     * Add task to collection immutably
     */
    static addTask<T>(tasks: T[], newTask: T): T[];
    /**
     * Remove task from collection immutably
     */
    static removeTask<T extends {
        id: string;
    }>(tasks: T[], taskId: string): T[];
}
/**
 * Immutable WIP limits utilities using battle-tested Immer
 */
export declare class ImmutableWIPUtils {
    /**
     * Update WIP limits immutably
     */
    static updateWIPLimits<T extends Record<string, number>>(limits: T, updates: Partial<T>): T;
    /**
     * Optimize WIP limits based on utilization
     */
    static optimizeWIPLimits<T extends Record<string, number>>(currentLimits: T, utilizationData: Record<string, {
        current: number;
        target: number;
    }>): T;
}
interface TaskForMetrics {
    readonly createdAt: Date;
    readonly startedAt?: Date;
    readonly completedAt?: Date;
    readonly state: string;
    readonly id?: string;
    readonly title?: string;
    readonly priority?: string;
    readonly estimatedEffort?: number;
    [key: string]: any;
}
interface FlowMetrics {
    readonly throughput: number;
    readonly cycleTime: number;
    readonly leadTime: number;
    readonly wipEfficiency: number;
    readonly blockageRate: number;
    readonly flowEfficiency: number;
    readonly predictability: number;
    readonly qualityIndex: number;
}
/**
 * Immutable metrics utilities using battle-tested Immer
 */
export declare class ImmutableMetricsUtils {
    /**
     * Calculate flow metrics immutably
     */
    static calculateFlowMetrics(allTasks: TaskForMetrics[], completedTasks: TaskForMetrics[], blockedTasks: TaskForMetrics[], calculators: {
        wipEfficiency: number;
        predictabilityCalculator: (cycleTimes: number[]) => number;
        qualityCalculator: (tasks: TaskForMetrics[]) => number;
    }): FlowMetrics;
    /**
     * Update metrics state immutably
     */
    static updateMetrics<T extends Record<string, any>>(currentMetrics: T, newMetrics: Partial<T>): T;
}
/**
 * Immutable context utilities using battle-tested Immer
 */
export declare class ImmutableContextUtils {
    /**
     * Update workflow context safely
     */
    static updateContext<T>(context: T, updater: (draft: Draft<T>) => void): T;
    /**
     * Add error to context errors array
     */
    static addError<T extends {
        errors: any[];
    }>(context: T, error: any): T;
}
export {};
//# sourceMappingURL=immutable-utils.d.ts.map