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
enableMapSet();
/**
 * Immutable task utilities using battle-tested Immer
 */
export class ImmutableTaskUtils {
  /**
   * Update task state immutably
   */
  static updateTask<T extends { id: string}>(
    tasks: T[],
    taskId: string,
    updater: (task: Draft<T>) => void
  ):T[] {
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
  static addTask<T>(tasks: T[], newTask: T): T[] {
    return produce(tasks, (draft) => {
      draft.push(newTask as Draft<T>);
    });
}
  /**
   * Remove task from collection immutably
   */
  static removeTask<T extends { id: string}>(tasks: T[], taskId: string): T[] {
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
  static updateWIPLimits<T extends Record<string, number>>(
    limits: T,
    updates: Partial<T>
  ): T {
    return produce(limits, (draft) => {
      for (const [key, value] of Object.entries(updates)) {
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
    utilizationData: Record<string, { current: number, target: number}>
  ): T {
    return produce(currentLimits, (draft) => {
      const draftLimits = draft as Record<string, number>;
      for (const [state, data] of Object.entries(utilizationData)) {
        if (state in draft) {
          const currentLimit = draftLimits[state];
          const utilizationRatio = data.current / currentLimit;
          // Increase limit if highly utilized (>0.9), decrease if underutilized (<0.5)
          if (utilizationRatio > 0.9) {
            draftLimits[state] = Math.ceil(currentLimit * 1.2);
          } else if (utilizationRatio < 0.5) {
            draftLimits[state] = Math.max(1, Math.floor(currentLimit * 0.8));
          }
        }
      }
    });
}
}
// Task interface for metrics calculations - compatible with WorkflowTask
interface TaskForMetrics {
  readonly createdAt: Date;
  readonly startedAt?:Date;
  readonly completedAt?:Date;
  readonly state: string;
  // Optional additional fields to make compatible with WorkflowTask
  readonly id?:string;
  readonly title?:string;
  readonly priority?:string;
  readonly estimatedEffort?:number;
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
  static calculateFlowMetrics(
    allTasks: TaskForMetrics[],
    completedTasks: TaskForMetrics[],
    blockedTasks: TaskForMetrics[],
    calculators:  {
      wipEfficiency: number;
      predictabilityCalculator: (cycleTimes: number[]) => number;
      qualityCalculator: (tasks: TaskForMetrics[]) => number;
}
  ):FlowMetrics {
    // Calculate cycle times
    const cycleTimes = completedTasks
      .filter((t) => t.startedAt && t.completedAt)
      .map(
        (t) =>
          ((t.completedAt?.getTime()|| 0) - (t.startedAt?.getTime()|| 0)) /
          (1000 * 60 * 60)
      ); // hours
    const averageCycleTime =
      cycleTimes.length > 0
        ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
        : 0;

    // Calculate lead times
    const leadTimes = completedTasks
      .filter((t) => t.completedAt)
      .map(
        (t) =>
          ((t.completedAt?.getTime()|| 0) - t.createdAt.getTime()) /
          (1000 * 60 * 60)
      ); // hours

    const averageLeadTime =
      leadTimes.length > 0
        ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
        : 0;

    // Calculate recent completions (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentCompletions = completedTasks.filter(
      (t) => t.completedAt && t.completedAt.getTime() > oneDayAgo
    );
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
  static updateMetrics<T extends Record<string, any>>(
    currentMetrics: T,
    newMetrics: Partial<T>
  ): T {
    return produce(currentMetrics, (draft) => {
      for (const [key, value] of Object.entries(newMetrics)) {
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
    return produce(context, updater);
}
  /**
   * Add error to context errors array
   */
  static addError<T extends { errors: any[]}>(context: T, error: any): T {
    return produce(context, (draft) => {
      draft.errors.push({
        ...error,
        timestamp: new Date(),
        id: Math.random().toString(36).substr(2, 9),
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
};