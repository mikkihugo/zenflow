/**
 * Task-Agent Matcher.
 * Intelligent matching of tasks to suitable agents based on capabilities and performance.
 */
/**
 * @file Coordination system:task-agent-matcher
 */
import type { CapacityManager } from '../interfaces';
import type { Agent, Task } from '../types';
export declare class TaskAgentMatcher {
  private matchingHistory;
  findCandidates(
    task: Task,
    availableAgents: Agent[],
    capacityManager: CapacityManager
  ): Promise<Agent[]>;
  private calculateMatchingScore;
  private calculateCapabilityMatch;
  private calculatePerformanceMatch;
}
//# sourceMappingURL=task-agent-matcher.d.ts.map
