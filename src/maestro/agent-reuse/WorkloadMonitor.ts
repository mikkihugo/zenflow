/**
 * Workload Monitor for Agent Pool Management
 * Monitors agent workloads and performance metrics
 */

export interface WorkloadMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeTasks: number;
  completedTasks: number;
  averageTaskDuration: number;
  errorRate: number;
  timestamp: Date;
}

export interface WorkloadThresholds {
  maxCpuUsage: number;
  maxMemoryUsage: number;
  maxConcurrentTasks: number;
  maxErrorRate: number;
}

export class WorkloadMonitor {
  private metrics: Map<string, WorkloadMetrics[]> = new Map();
  private thresholds: WorkloadThresholds;

  constructor(thresholds: Partial<WorkloadThresholds> = {}) {
    this.thresholds = {
      maxCpuUsage: thresholds.maxCpuUsage || 0.8,
      maxMemoryUsage: thresholds.maxMemoryUsage || 0.9,
      maxConcurrentTasks: thresholds.maxConcurrentTasks || 10,
      maxErrorRate: thresholds.maxErrorRate || 0.1
    };
  }

  /**
   * Record metrics for an agent
   */
  recordMetrics(agentId: string, metrics: WorkloadMetrics): void {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, []);
    }
    
    const agentMetrics = this.metrics.get(agentId)!;
    agentMetrics.push(metrics);
    
    // Keep only last 100 metrics entries
    if (agentMetrics.length > 100) {
      agentMetrics.shift();
    }
  }

  /**
   * Get current workload for an agent
   */
  getCurrentWorkload(agentId: string): WorkloadMetrics | null {
    const agentMetrics = this.metrics.get(agentId);
    if (!agentMetrics || agentMetrics.length === 0) {
      return null;
    }
    return agentMetrics[agentMetrics.length - 1];
  }

  /**
   * Check if agent is overloaded
   */
  isOverloaded(agentId: string): boolean {
    const current = this.getCurrentWorkload(agentId);
    if (!current) return false;

    return (
      current.cpuUsage > this.thresholds.maxCpuUsage ||
      current.memoryUsage > this.thresholds.maxMemoryUsage ||
      current.activeTasks > this.thresholds.maxConcurrentTasks ||
      current.errorRate > this.thresholds.maxErrorRate
    );
  }

  /**
   * Get average metrics over a time period
   */
  getAverageMetrics(agentId: string, minutes: number = 10): WorkloadMetrics | null {
    const agentMetrics = this.metrics.get(agentId);
    if (!agentMetrics || agentMetrics.length === 0) {
      return null;
    }

    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = agentMetrics.filter(m => m.timestamp >= cutoff);
    
    if (recentMetrics.length === 0) return null;

    const sum = recentMetrics.reduce((acc, m) => ({
      cpuUsage: acc.cpuUsage + m.cpuUsage,
      memoryUsage: acc.memoryUsage + m.memoryUsage,
      activeTasks: acc.activeTasks + m.activeTasks,
      completedTasks: acc.completedTasks + m.completedTasks,
      averageTaskDuration: acc.averageTaskDuration + m.averageTaskDuration,
      errorRate: acc.errorRate + m.errorRate
    }), {
      cpuUsage: 0,
      memoryUsage: 0,
      activeTasks: 0,
      completedTasks: 0,
      averageTaskDuration: 0,
      errorRate: 0
    });

    const count = recentMetrics.length;
    return {
      cpuUsage: sum.cpuUsage / count,
      memoryUsage: sum.memoryUsage / count,
      activeTasks: Math.round(sum.activeTasks / count),
      completedTasks: Math.round(sum.completedTasks / count),
      averageTaskDuration: sum.averageTaskDuration / count,
      errorRate: sum.errorRate / count,
      timestamp: new Date()
    };
  }

  /**
   * Clear metrics for an agent
   */
  clearMetrics(agentId: string): void {
    this.metrics.delete(agentId);
  }

  /**
   * Get all monitored agents
   */
  getMonitoredAgents(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Filter agents by availability based on workload
   */
  async filterByAvailability(
    candidates: any[],
    options: { capabilities: string[] }
  ): Promise<any[]> {
    return candidates.filter(candidate => {
      const workload = this.getCurrentWorkload(candidate.id || candidate.agentId);
      return !this.isOverloaded(candidate.id || candidate.agentId);
    });
  }

  /**
   * Track task assignment to an agent
   */
  trackTaskAssignment(agentId: string, taskId: string): void {
    // Record task assignment for workload tracking
    const current = this.getCurrentWorkload(agentId);
    if (current) {
      this.recordMetrics(agentId, {
        ...current,
        activeTasks: current.activeTasks + 1,
        timestamp: new Date()
      });
    }
  }

  /**
   * Track task completion for an agent
   */
  trackTaskCompletion(agentId: string, taskId: string, success: boolean): void {
    const current = this.getCurrentWorkload(agentId);
    if (current) {
      this.recordMetrics(agentId, {
        ...current,
        activeTasks: Math.max(0, current.activeTasks - 1),
        completedTasks: current.completedTasks + 1,
        errorRate: success ? current.errorRate : current.errorRate + 0.1,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get workload statistics for all agents
   */
  getWorkloadStatistics(): {
    totalAgents: number;
    averageLoad: number;
    overloadedAgents: number;
    idleAgents: number;
  } {
    const agents = Array.from(this.metrics.keys());
    const totalAgents = agents.length;
    
    if (totalAgents === 0) {
      return { totalAgents: 0, averageLoad: 0, overloadedAgents: 0, idleAgents: 0 };
    }

    let totalLoad = 0;
    let overloadedCount = 0;
    let idleCount = 0;

    agents.forEach(agentId => {
      const current = this.getCurrentWorkload(agentId);
      if (current) {
        totalLoad += current.activeTasks;
        if (this.isOverloaded(agentId)) {
          overloadedCount++;
        } else if (current.activeTasks === 0) {
          idleCount++;
        }
      }
    });

    return {
      totalAgents,
      averageLoad: totalLoad / totalAgents,
      overloadedAgents: overloadedCount,
      idleAgents: idleCount
    };
  }
}