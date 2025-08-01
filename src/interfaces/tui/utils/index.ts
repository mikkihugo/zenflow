/**
 * Swarm UI Utilities - Helper functions for swarm-focused UI components
 * Optimized for swarm coordination, formatting, and data visualization
 */

import { SwarmAgent, SwarmTask, SwarmMetrics, SwarmStatus } from '../types';

// Time and duration formatting utilities
export class SwarmTimeUtils {
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  static formatTimestamp(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

// Text and display utilities
export class SwarmDisplayUtils {
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  static formatNumber(num: number, decimals: number = 1): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    } else {
      return num.toFixed(decimals);
    }
  }
  
  static formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  }
  
  static getStatusIcon(status: string): string {
    const icons = {
      active: '🟢',
      idle: '🔵', 
      busy: '🟡',
      error: '🔴',
      stopped: '⚪',
      initializing: '🔄',
      coordinating: '🐝',
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      failed: '❌',
      assigned: '📋',
    };
    return icons[status as keyof typeof icons] || '⚪';
  }
}

// Swarm-specific data processing utilities
export class SwarmDataUtils {
  static calculateSwarmHealth(agents: SwarmAgent[]): {
    health: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    issues: string[];
  } {
    if (agents.length === 0) {
      return { health: 'poor', score: 0, issues: ['No agents available'] };
    }
    
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const errorAgents = agents.filter(a => a.status === 'error').length;
    const avgSuccessRate = agents.reduce((sum, a) => sum + a.metrics.successRate, 0) / agents.length;
    const avgResponseTime = agents.reduce((sum, a) => sum + a.metrics.averageResponseTime, 0) / agents.length;
    
    let score = 0;
    const issues: string[] = [];
    
    // Agent availability score (40% weight)
    const availabilityScore = (activeAgents / agents.length) * 40;
    score += availabilityScore;
    
    if (activeAgents / agents.length < 0.5) {
      issues.push('Low agent availability');
    }
    
    // Success rate score (30% weight)
    const successScore = avgSuccessRate * 30;
    score += successScore;
    
    if (avgSuccessRate < 0.8) {
      issues.push('Low success rate');
    }
    
    // Response time score (20% weight) - inverse relationship
    const responseScore = Math.max(0, (5000 - avgResponseTime) / 5000) * 20;
    score += responseScore;
    
    if (avgResponseTime > 2000) {
      issues.push('High response times');
    }
    
    // Error rate score (10% weight)
    const errorScore = Math.max(0, (1 - errorAgents / agents.length)) * 10;
    score += errorScore;
    
    if (errorAgents > 0) {
      issues.push(`${errorAgents} agents in error state`);
    }
    
    // Determine health level
    let health: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) health = 'excellent';
    else if (score >= 70) health = 'good';
    else if (score >= 50) health = 'fair';
    else health = 'poor';
    
    return { health, score, issues };
  }
  
  static getTopPerformingAgents(agents: SwarmAgent[], count: number = 5): SwarmAgent[] {
    return [...agents]
      .sort((a, b) => {
        // Sort by composite performance score
        const aScore = (a.metrics.successRate * 0.4) + 
                      ((a.metrics.tasksCompleted / Math.max(1, a.metrics.totalTasks)) * 0.3) +
                      (Math.max(0, 1 - a.metrics.averageResponseTime / 5000) * 0.3);
        const bScore = (b.metrics.successRate * 0.4) + 
                      ((b.metrics.tasksCompleted / Math.max(1, b.metrics.totalTasks)) * 0.3) +
                      (Math.max(0, 1 - b.metrics.averageResponseTime / 5000) * 0.3);
        return bScore - aScore;
      })
      .slice(0, count);
  }
  
  static aggregateTaskMetrics(tasks: SwarmTask[]): {
    completed: number;
    inProgress: number;
    pending: number;
    failed: number;
    avgCompletionTime: number;
    successRate: number;
  } {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'assigned').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.startedAt && t.completedAt);
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => {
          return sum + (t.completedAt!.getTime() - t.startedAt!.getTime());
        }, 0) / completedTasks.length
      : 0;
    
    const processedTasks = completed + failed;
    const successRate = processedTasks > 0 ? completed / processedTasks : 0;
    
    return {
      completed,
      inProgress,
      pending,
      failed,
      avgCompletionTime,
      successRate
    };
  }
}

// Coordination pattern utilities
export class SwarmCoordinationUtils {
  static getOptimalTopology(agentCount: number, taskComplexity: 'low' | 'medium' | 'high'): SwarmStatus['topology'] {
    if (agentCount <= 3) return 'mesh';
    if (agentCount <= 10 && taskComplexity === 'low') return 'ring';
    if (agentCount <= 20 && taskComplexity === 'medium') return 'hierarchical';
    if (taskComplexity === 'high') return 'mesh';
    return 'distributed';
  }
  
  static calculateCoordinationEfficiency(agents: SwarmAgent[], tasks: SwarmTask[]): {
    efficiency: number;
    bottlenecks: string[];
    recommendations: string[];
  } {
    const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'busy');
    const utilization = activeAgents.length / agents.length;
    
    const taskMetrics = SwarmDataUtils.aggregateTaskMetrics(tasks);
    const efficiency = (taskMetrics.successRate * 0.5) + (utilization * 0.3) + 
                      (Math.min(1, taskMetrics.completed / Math.max(1, taskMetrics.completed + taskMetrics.failed)) * 0.2);
    
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];
    
    if (utilization < 0.3) {
      bottlenecks.push('Low agent utilization');
      recommendations.push('Consider reducing agent count or increasing task load');
    }
    
    if (utilization > 0.9) {
      bottlenecks.push('High agent utilization');
      recommendations.push('Consider adding more agents or optimizing task distribution');
    }
    
    if (taskMetrics.successRate < 0.8) {
      bottlenecks.push('Low task success rate');
      recommendations.push('Review task complexity and agent capabilities');
    }
    
    return { efficiency, bottlenecks, recommendations };
  }
}

// Export all utilities
export const SwarmUIUtils = {
  time: SwarmTimeUtils,
  display: SwarmDisplayUtils,
  data: SwarmDataUtils,
  coordination: SwarmCoordinationUtils,
};

export default SwarmUIUtils;