/**
 * AI-powered insights and recommendations for dashboard
 * Provides intelligent analysis of system performance, usage patterns, and optimization suggestions
 */

export interface AIInsight {
  id: string;
  type: 'performance | optimization' | 'security''' | '''usage | prediction' | 'anomaly';
  severity: 'low | medium' | 'high''' | '''critical';
  title: string;
  description: string;
  recommendation: string;
  confidence: number; // 0-100
  timestamp: string;
  data?: any;
  actionable: boolean;
  tags: string[];
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  summary: string;
  overallScore: number; // 0-100 health score
  recommendations: string[];
  trends: {
    performance: 'improving | stable' | 'declining';
    usage: 'increasing | stable' | 'decreasing';
    efficiency: 'optimized''' | '''normal''' | '''needs-attention';
  };
}

/**
 * AI Insights Engine - Analyzes system data and provides intelligent recommendations
 */
export class AIInsightsEngine {
  private analysisHistory: AIAnalysisResult[] = [];
  private insights: AIInsight[] = [];

  /**
   * Analyze current system state and generate insights
   */
  async analyzeSystemState(data: {
    health?: any;
    performance?: any;
    agents?: any[];
    tasks?: any[];
    usage?: any;
  }): Promise<AIAnalysisResult> {
    const insights = await this.generateInsights(data);
    const analysis = this.synthesizeAnalysis(insights, data);
    
    // Store in history
    this.analysisHistory.push(analysis);
    if (this.analysisHistory.length > 50) {
      this.analysisHistory = this.analysisHistory.slice(-50);
    }
    
    this.insights = insights;
    return analysis;
  }

  /**
   * Generate AI insights from system data
   */
  private async generateInsights(data: any): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    const timestamp = new Date().toISOString();

    // Performance Analysis
    if (data.performance) {
      insights.push(...this.analyzePerformance(data.performance, timestamp));
    }

    // Agent Analysis
    if (data.agents?.length > 0) {
      insights.push(...this.analyzeAgents(data.agents, timestamp));
    }

    // Task Analysis
    if (data.tasks?.length > 0) {
      insights.push(...this.analyzeTasks(data.tasks, timestamp));
    }

    // System Health Analysis
    if (data.health) {
      insights.push(...this.analyzeSystemHealth(data.health, timestamp));
    }

    // Usage Pattern Analysis
    if (data.usage) {
      insights.push(...this.analyzeUsagePatterns(data.usage, timestamp));
    }

    // Cross-correlation Analysis
    insights.push(...this.analyzeCrossCorrelations(data, timestamp));

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze system performance metrics
   */
  private analyzePerformance(performance: any, timestamp: string): AIInsight[] {
    const insights: AIInsight[] = [];

    // CPU Analysis
    if (performance.cpu > 80) {
      insights.push({
        id: `cpu-high-${Date.now()}`,
        type: 'performance',
        severity: performance.cpu > 95 ? 'critical' : 'high',
        title: 'High CPU Usage Detected',
        description: `CPU usage is at ${performance.cpu.toFixed(1)}%, indicating potential performance bottlenecks.`,
        recommendation: 'Consider optimizing resource-intensive processes or scaling horizontally. Monitor agent workload distribution.',
        confidence: 92,
        timestamp,
        data: { cpu: performance.cpu },
        actionable: true,
        tags: ['performance', 'cpu', 'optimization']
      });
    } else if (performance.cpu < 10) {
      insights.push({
        id: `cpu-underutilized-${Date.now()}`,
        type: 'optimization',
        severity: 'low',
        title: 'CPU Underutilization Opportunity',
        description: `CPU usage is only ${performance.cpu.toFixed(1)}%, suggesting potential for increased workload capacity.`,
        recommendation: 'Consider increasing agent concurrency or processing more tasks in parallel to improve resource utilization.',
        confidence: 75,
        timestamp,
        data: { cpu: performance.cpu },
        actionable: true,
        tags: ['optimization', 'efficiency', 'scaling']
      });
    }

    // Memory Analysis
    if (performance.memory > 85) {
      insights.push({
        id: `memory-high-${Date.now()}`,
        type: 'performance',
        severity: performance.memory > 95 ? 'critical' : 'high',
        title: 'High Memory Usage Warning',
        description: `Memory usage at ${performance.memory.toFixed(1)}% may lead to performance degradation or system instability.`,
        recommendation: 'Review memory-intensive agents and consider implementing memory pooling or garbage collection optimizations.',
        confidence: 88,
        timestamp,
        data: { memory: performance.memory },
        actionable: true,
        tags: ['performance', 'memory', 'stability']
      });
    }

    // Response Time Analysis
    if (performance.avgResponse > 1000) {
      insights.push({
        id: `response-slow-${Date.now()}`,
        type: 'performance',
        severity: performance.avgResponse > 5000 ? 'high' : 'medium',
        title: 'Slow Response Times Detected',
        description: `Average response time of ${performance.avgResponse}ms exceeds optimal thresholds.`,
        recommendation: 'Analyze request processing pipeline, consider caching strategies, and optimize database queries.',
        confidence: 85,
        timestamp,
        data: { avgResponse: performance.avgResponse },
        actionable: true,
        tags: ['performance', 'latency', 'optimization']
      });
    }

    return insights;
  }

  /**
   * Analyze agent performance and patterns
   */
  private analyzeAgents(agents: any[], timestamp: string): AIInsight[] {
    const insights: AIInsight[] = [];
    const activeAgents = agents.filter(a => a.status === 'active');
    const idleAgents = agents.filter(a => a.status === 'idle');
    const errorAgents = agents.filter(a => a.status === 'error');

    // Agent Distribution Analysis
    const utilizationRate = activeAgents.length / agents.length;
    
    if (utilizationRate < 0.3) {
      insights.push({
        id: `agents-underutilized-${Date.now()}`,
        type: 'optimization',
        severity: 'medium',
        title: 'Low Agent Utilization',
        description: `Only ${(utilizationRate * 100).toFixed(1)}% of agents are active. Many agents are idle.`,
        recommendation: 'Consider reducing agent pool size or distributing more tasks to improve efficiency and reduce resource overhead.',
        confidence: 82,
        timestamp,
        data: { utilization: utilizationRate, total: agents.length, active: activeAgents.length },
        actionable: true,
        tags: ['optimization', 'agents', 'efficiency']
      });
    } else if (utilizationRate > 0.9) {
      insights.push({
        id: `agents-overutilized-${Date.now()}`,
        type: 'performance',
        severity: 'medium',
        title: 'High Agent Utilization',
        description: `${(utilizationRate * 100).toFixed(1)}% of agents are active, approaching capacity limits.`,
        recommendation: 'Consider scaling up agent pool or implementing load balancing to prevent bottlenecks.',
        confidence: 87,
        timestamp,
        data: { utilization: utilizationRate, total: agents.length, active: activeAgents.length },
        actionable: true,
        tags: ['scaling', 'agents', 'capacity']
      });
    }

    // Error Agent Analysis
    if (errorAgents.length > 0) {
      const errorRate = errorAgents.length / agents.length;
      insights.push({
        id: `agents-errors-${Date.now()}`,
        type: 'anomaly',
        severity: errorRate > 0.1 ? 'high' : 'medium',
        title: 'Agent Errors Detected',
        description: `${errorAgents.length} agents are in error state (${(errorRate * 100).toFixed(1)}% error rate).`,
        recommendation: 'Investigate agent error logs, restart failed agents, and review agent health monitoring configuration.',
        confidence: 95,
        timestamp,
        data: { errorCount: errorAgents.length, errorRate },
        actionable: true,
        tags: ['reliability', 'agents', 'errors']
      });
    }

    return insights;
  }

  /**
   * Analyze task completion patterns
   */
  private analyzeTasks(tasks: any[], timestamp: string): AIInsight[] {
    const insights: AIInsight[] = [];
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');

    // Task Backlog Analysis
    const backlogRatio = pendingTasks.length / tasks.length;
    
    if (backlogRatio > 0.6) {
      insights.push({
        id: `tasks-backlog-${Date.now()}`,
        type: 'performance',
        severity: backlogRatio > 0.8 ? 'high' : 'medium',
        title: 'Large Task Backlog',
        description: `${(backlogRatio * 100).toFixed(1)}% of tasks are pending, indicating potential processing bottlenecks.`,
        recommendation: 'Consider increasing agent capacity, optimizing task processing, or implementing task prioritization.',
        confidence: 89,
        timestamp,
        data: { backlogRatio, pending: pendingTasks.length, total: tasks.length },
        actionable: true,
        tags: ['performance', 'tasks', 'backlog']
      });
    }

    // Task Completion Rate Analysis
    const completionRate = completedTasks.length / tasks.length;
    if (completionRate > 0.8) {
      insights.push({
        id: `tasks-efficient-${Date.now()}`,
        type: 'optimization',
        severity: 'low',
        title: 'High Task Completion Rate',
        description: `${(completionRate * 100).toFixed(1)}% task completion rate indicates efficient processing.`,
        recommendation: 'System is performing well. Consider taking on additional workload or optimizing for higher throughput.',
        confidence: 78,
        timestamp,
        data: { completionRate, completed: completedTasks.length },
        actionable: false,
        tags: ['efficiency', 'tasks', 'success']
      });
    }

    return insights;
  }

  /**
   * Analyze system health indicators
   */
  private analyzeSystemHealth(health: any, timestamp: string): AIInsight[] {
    const insights: AIInsight[] = [];

    // Uptime Analysis
    if (health.uptime) {
      const uptimeHours = health.uptime / 3600;
      if (uptimeHours > 720) { // 30 days
        insights.push({
          id: `uptime-stable-${Date.now()}`,
          type: 'optimization',
          severity: 'low',
          title: 'Excellent System Stability',
          description: `System has been running for ${Math.floor(uptimeHours / 24)} days without restart.`,
          recommendation: 'System demonstrates excellent stability. Consider scheduling planned maintenance windows for updates.',
          confidence: 85,
          timestamp,
          data: { uptimeHours },
          actionable: false,
          tags: ['stability', 'uptime', 'reliability']
        });
      }
    }

    // Status Analysis
    if (health.status !== 'healthy') {
      insights.push({
        id: `health-status-${Date.now()}`,
        type: 'anomaly',
        severity: 'high',
        title: 'System Health Issue',
        description: `System status is "${health.status}", indicating potential problems.`,
        recommendation: 'Investigate system logs, check service dependencies, and review recent changes.',
        confidence: 92,
        timestamp,
        data: { status: health.status },
        actionable: true,
        tags: ['health', 'status', 'investigation']
      });
    }

    return insights;
  }

  /**
   * Analyze usage patterns for optimization opportunities
   */
  private analyzeUsagePatterns(usage: any, timestamp: string): AIInsight[] {
    const insights: AIInsight[] = [];

    // Request rate analysis
    if (usage.requestsPerMin) {
      if (usage.requestsPerMin < 10) {
        insights.push({
          id: `usage-low-${Date.now()}`,
          type: 'optimization',
          severity: 'low',
          title: 'Low System Usage',
          description: `Only ${usage.requestsPerMin} requests/min, indicating underutilization.`,
          recommendation: 'Consider cost optimization by downsizing resources or finding ways to increase system utilization.',
          confidence: 70,
          timestamp,
          data: { requestsPerMin: usage.requestsPerMin },
          actionable: true,
          tags: ['optimization', 'cost', 'utilization']
        });
      } else if (usage.requestsPerMin > 1000) {
        insights.push({
          id: `usage-high-${Date.now()}`,
          type: 'performance',
          severity: 'medium',
          title: 'High System Usage',
          description: `${usage.requestsPerMin} requests/min indicates heavy load.`,
          recommendation: 'Monitor system capacity and consider horizontal scaling to handle increased demand.',
          confidence: 83,
          timestamp,
          data: { requestsPerMin: usage.requestsPerMin },
          actionable: true,
          tags: ['scaling', 'capacity', 'performance']
        });
      }
    }

    return insights;
  }

  /**
   * Cross-correlation analysis between different metrics
   */
  private analyzeCrossCorrelations(data: any, timestamp: string): AIInsight[] {
    const insights: AIInsight[] = [];

    // Performance vs Agent correlation
    if (data.performance && data.agents) {
      const activeAgentRatio = data.agents.filter((a: any) => a.status === 'active').length / data.agents.length;
      
      if (data.performance.cpu > 70 && activeAgentRatio > 0.8) {
        insights.push({
          id: `correlation-cpu-agents-${Date.now()}`,
          type: 'prediction',
          severity: 'medium',
          title: 'Performance-Agent Correlation Alert',
          description: 'High CPU usage combined with high agent utilization suggests approaching capacity limits.',
          recommendation: 'Implement predictive scaling or load balancing before performance degradation occurs.',
          confidence: 81,
          timestamp,
          data: { cpu: data.performance.cpu, agentUtilization: activeAgentRatio },
          actionable: true,
          tags: ['prediction', 'correlation', 'scaling']
        });
      }
    }

    // Memory vs Task correlation
    if (data.performance && data.tasks) {
      const inProgressRatio = data.tasks.filter((t: any) => t.status === 'in-progress').length / data.tasks.length;
      
      if (data.performance.memory > 80 && inProgressRatio > 0.3) {
        insights.push({
          id: `correlation-memory-tasks-${Date.now()}`,
          type: 'prediction',
          severity: 'medium',
          title: 'Memory-Task Processing Correlation',
          description: 'High memory usage with many in-progress tasks suggests memory-intensive task processing.',
          recommendation: 'Consider task batching, memory optimization, or implementing task queuing mechanisms.',
          confidence: 76,
          timestamp,
          data: { memory: data.performance.memory, taskUtilization: inProgressRatio },
          actionable: true,
          tags: ['memory', 'tasks', 'optimization']
        });
      }
    }

    return insights;
  }

  /**
   * Synthesize overall analysis from individual insights
   */
  private synthesizeAnalysis(insights: AIInsight[], data: any): AIAnalysisResult {
    const criticalInsights = insights.filter(i => i.severity === 'critical');
    const highInsights = insights.filter(i => i.severity === 'high');
    const mediumInsights = insights.filter(i => i.severity === 'medium');

    // Calculate overall health score
    let healthScore = 100;
    healthScore -= criticalInsights.length * 20;
    healthScore -= highInsights.length * 10;
    healthScore -= mediumInsights.length * 5;
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Generate summary
    const summary = this.generateSummary(insights, healthScore);
    
    // Extract recommendations
    const recommendations = insights
      .filter(i => i.actionable)
      .map(i => i.recommendation)
      .slice(0, 5); // Top 5 recommendations

    // Analyze trends (simplified - would use historical data in real implementation)
    const trends = this.analyzeTrends(data);

    return {
      insights,
      summary,
      overallScore: healthScore,
      recommendations,
      trends
    };
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(insights: AIInsight[], healthScore: number): string {
    const criticalCount = insights.filter(i => i.severity === 'critical').length;
    const highCount = insights.filter(i => i.severity === 'high').length;
    
    if (criticalCount > 0) {
      return `System requires immediate attention with ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} detected. Overall health score: ${healthScore}/100.`;
    } else if (highCount > 0) {
      return `System has ${highCount} high-priority issue${highCount > 1 ? 's' : ''} that should be addressed soon. Health score: ${healthScore}/100.`;
    } else if (healthScore > 90) {
      return `System is performing excellently with minimal issues detected. Health score: ${healthScore}/100.`;
    } else if (healthScore > 70) {
      return `System is performing well with some optimization opportunities. Health score: ${healthScore}/100.`;
    } else {
      return `System has multiple areas for improvement. Health score: ${healthScore}/100.`;
    }
  }

  /**
   * Analyze trends (simplified implementation)
   */
  private analyzeTrends(data: any): any {
    // In a real implementation, this would analyze historical data
    return {
      performance: data.performance?.cpu > 80 ? 'declining' : data.performance?.cpu < 30 ? 'stable' : 'stable',
      usage: data.usage?.requestsPerMin > 500 ? 'increasing' : 'stable',
      efficiency: data.performance?.cpu < 50 && data.performance?.memory < 70 ? 'optimized' : 'normal'
    };
  }

  /**
   * Get current insights
   */
  getCurrentInsights(): AIInsight[] {
    return this.insights;
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory(): AIAnalysisResult[] {
    return this.analysisHistory;
  }

  /**
   * Get insights by type
   */
  getInsightsByType(type: AIInsight['type']): AIInsight[] {
    return this.insights.filter(i => i.type === type);
  }

  /**
   * Get actionable insights
   */
  getActionableInsights(): AIInsight[] {
    return this.insights.filter(i => i.actionable);
  }

  /**
   * Clear old insights
   */
  clearOldInsights(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();
    this.insights = this.insights.filter(i => i.timestamp > cutoff);
  }
}

/**
 * Global AI insights engine instance
 */
export const aiInsightsEngine = new AIInsightsEngine();