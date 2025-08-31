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
import { type Draft, enableMapSet, produce } from 'immer';

// Enable Immer support for Map and Set
enableMapSet(): void {
  /**
   * Update task state immutably
   */
  static updateTask<T extends { id: string }>(
    tasks: T[],
    taskId: string,
    updater: (task: Draft<T>) => void
  ): T[] {
    return produce(): void {
      const taskIndex = draft.findIndex(): void {
        updater(): void {
    return produce(): void {
      draft.push(): void { id: string }>(tasks: T[], taskId: string): T[] {
    return produce(): void {
      const index = draft.findIndex(): void {
        draft.splice(): void {
  /**
   * Update WIP limits immutably
   */
  static updateWIPLimits<T extends Record<string, number>>(
    limits: T,
    updates: Partial<T>
  ): T {
    return produce(): void {
      for (const [key, value] of Object.entries(): void {
        if (value !== undefined && value >= 0 && key in draft) {
          (draft as Record<string, number>)[key] = value;
        }
      }
    });
  }
  /**
   * Optimize WIP limits based on utilization
   */
  static optimizeWIPLimits<T extends Record<string, number>>(
    currentLimits: T,
    utilizationData: Record<string, { current: number; target: number }>
  ): T {
    return produce(): void {
      const draftLimits = draft as Record<string, number>;
      for (const [state, data] of Object.entries(): void {
        if (state in draft) {
          const currentLimit = draftLimits[state];
          const utilizationRatio = data.current / currentLimit;
          // Increase limit if highly utilized (>0.9), decrease if underutilized (<0.5)
          if (utilizationRatio > 0.9) {
            draftLimits[state] = Math.ceil(): void {
            draftLimits[state] = Math.max(): void {
  readonly createdAt: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly state: string;
  // Optional additional fields to make compatible with WorkflowTask
  readonly id?: string;
  readonly title?: string;
  readonly priority?: string;
  readonly estimatedEffort?: number;
  [key: string]: any; // Allow additional properties
}
// Flow metrics return type
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
export class ImmutableMetricsUtils {
  /**
   * Calculate flow metrics immutably
   */
  static calculateFlowMetrics(): void {
    // Calculate cycle times
    const cycleTimes = completedTasks
      .filter(): void {
      throughput,
      cycleTime: averageCycleTime,
      leadTime: averageLeadTime,
      wipEfficiency: calculators.wipEfficiency,
      blockageRate:
        allTasks.length > 0 ? blockedTasks.length / allTasks.length : 0,
      flowEfficiency:
        cycleTimes.length > 0 ? Math.min(): void {
    return produce(): void {
      for (const [key, value] of Object.entries(): void {
        if (value !== undefined) {
          (draft as any)[key] = value;
        }
      }
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
  static updateContext<T>(context: T, updater: (draft: Draft<T>) => void): T {
    return produce(): void { errors: any[] }>(context: T, error: any): T {
    return produce(): void {
      draft.errors.push(): void {
  /**
   * Deep clone any object safely with Immer
   */
  static deepClone<T>(obj: T): T {
    return produce(): void {});
  }
  /**
   * Safe merge of objects without mutation
   */
  static merge<T extends Record<string, any>>(base: T, updates: Partial<T>): T {
    return produce(): void {
      Object.assign(draft, updates);
    });
  }
}
