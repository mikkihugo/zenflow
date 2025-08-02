/**
 * Pattern Recognition Engine for Swarm Execution Analysis
 * Analyzes swarm behaviors, task patterns, and communication flows
 */

import { EventEmitter } from 'events';

export interface ExecutionPattern {
  id: string;
  type: 'task_completion' | 'communication' | 'resource_utilization' | 'failure' | 'coordination';
  pattern: any;
  frequency: number;
  confidence: number;
  context: ExecutionContext;
  metadata: PatternMetadata;
  timestamp: number;
}

export interface ExecutionContext {
  swarmId: string;
  agentIds: string[];
  taskType: string;
  topology: string;
  environment: string;
  resourceConstraints: ResourceConstraints;
}

export interface PatternMetadata {
  complexity: number;
  predictability: number;
  stability: number;
  anomalyScore: number;
  correlations: PatternCorrelation[];
}

export interface PatternCorrelation {
  patternId: string;
  strength: number;
  type: 'causal' | 'temporal' | 'spatial' | 'behavioral';
}

export interface ResourceConstraints {
  cpuLimit: number;
  memoryLimit: number;
  networkBandwidth: number;
  concurrencyLimit: number;
}

export interface ExecutionTrace {
  swarmId: string;
  agentId: string;
  action: string;
  parameters: any;
  result: any;
  timestamp: number;
  duration: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  diskIO: number;
}

export interface CommunicationPattern {
  source: string;
  target: string;
  messageType: string;
  frequency: number;
  latency: number;
  payloadSize: number;
  reliability: number;
}

export interface FailurePattern {
  type: string;
  frequency: number;
  context: string[];
  preconditions: any[];
  impacts: string[];
  recoveryTime: number;
}

export class PatternRecognitionEngine extends EventEmitter {
  private patterns: Map<string, ExecutionPattern> = new Map();
  private traces: ExecutionTrace[] = [];
  private communicationPatterns: Map<string, CommunicationPattern> = new Map();
  private failurePatterns: Map<string, FailurePattern> = new Map();
  private analysisWindow: number = 3600000; // 1 hour
  private minPatternFrequency: number = 3;
  private confidenceThreshold: number = 0.7;

  constructor() {
    super();
    this.startPatternAnalysis();
  }

  /**
   * Record execution trace for pattern analysis
   */
  recordTrace(trace: ExecutionTrace): void {
    this.traces.push(trace);

    // Maintain sliding window
    const cutoff = Date.now() - this.analysisWindow;
    this.traces = this.traces.filter((t) => t.timestamp > cutoff);

    // Trigger pattern analysis if we have enough data
    if (this.traces.length > 100) {
      this.analyzePatterns();
    }
  }

  /**
   * Analyze execution patterns from traces
   */
  private analyzePatterns(): void {
    this.analyzeTaskCompletionPatterns();
    this.analyzeCommunicationPatterns();
    this.analyzeResourceUtilizationPatterns();
    this.analyzeFailurePatterns();
    this.analyzeCoordinationPatterns();

    this.emit('patternsUpdated', this.patterns);
  }

  /**
   * Analyze task completion patterns
   */
  private analyzeTaskCompletionPatterns(): void {
    const taskGroups = this.groupTracesByTask();

    for (const [taskType, traces] of taskGroups) {
      const completionTimes = traces.map((t) => t.duration);
      const resourceUsages = traces.map((t) => t.resourceUsage);

      const pattern = this.calculateTaskPattern(taskType, completionTimes, resourceUsages);

      if (pattern.frequency >= this.minPatternFrequency) {
        this.patterns.set(`task_completion_${taskType}`, {
          id: `task_completion_${taskType}`,
          type: 'task_completion',
          pattern,
          frequency: pattern.frequency,
          confidence: this.calculateConfidence(pattern),
          context: this.extractContext(traces),
          metadata: this.calculateMetadata(pattern, traces),
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Analyze communication patterns between agents
   */
  private analyzeCommunicationPatterns(): void {
    const communicationTraces = this.traces.filter(
      (t) => t.action.includes('message') || t.action.includes('communicate')
    );

    const pairwiseCommunication = new Map<string, number>();
    const messageTypes = new Map<string, number>();

    for (const trace of communicationTraces) {
      if (trace.parameters?.target) {
        const key = `${trace.agentId}->${trace.parameters.target}`;
        pairwiseCommunication.set(key, (pairwiseCommunication.get(key) || 0) + 1);

        const msgType = trace.parameters.messageType || 'unknown';
        messageTypes.set(msgType, (messageTypes.get(msgType) || 0) + 1);
      }
    }

    // Create communication patterns
    for (const [pair, frequency] of pairwiseCommunication) {
      if (frequency >= this.minPatternFrequency) {
        const [source, target] = pair.split('->');
        const commPattern: CommunicationPattern = {
          source,
          target,
          messageType: this.getMostFrequentMessageType(source, target, communicationTraces),
          frequency,
          latency: this.calculateAverageLatency(source, target, communicationTraces),
          payloadSize: this.calculateAveragePayloadSize(source, target, communicationTraces),
          reliability: this.calculateReliability(source, target, communicationTraces),
        };

        this.communicationPatterns.set(pair, commPattern);
      }
    }
  }

  /**
   * Analyze resource utilization patterns
   */
  private analyzeResourceUtilizationPatterns(): void {
    const resourceGroups = this.groupTracesByResource();

    for (const [resourceType, usages] of resourceGroups) {
      const pattern = this.calculateResourcePattern(resourceType, usages);

      if (pattern.significance > 0.5) {
        this.patterns.set(`resource_${resourceType}`, {
          id: `resource_${resourceType}`,
          type: 'resource_utilization',
          pattern,
          frequency: usages.length,
          confidence: pattern.significance,
          context: this.extractResourceContext(usages),
          metadata: this.calculateResourceMetadata(pattern, usages),
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Analyze failure patterns
   */
  private analyzeFailurePatterns(): void {
    const failureTraces = this.traces.filter((t) => t.result?.error || t.result?.success === false);

    const failureTypes = new Map<string, ExecutionTrace[]>();

    for (const trace of failureTraces) {
      const errorType = this.classifyError(trace.result?.error);
      if (!failureTypes.has(errorType)) {
        failureTypes.set(errorType, []);
      }
      failureTypes.get(errorType)!.push(trace);
    }

    for (const [errorType, traces] of failureTypes) {
      if (traces.length >= this.minPatternFrequency) {
        const failurePattern: FailurePattern = {
          type: errorType,
          frequency: traces.length,
          context: this.extractFailureContext(traces),
          preconditions: this.identifyPreconditions(traces),
          impacts: this.assessFailureImpacts(traces),
          recoveryTime: this.calculateRecoveryTime(traces),
        };

        this.failurePatterns.set(errorType, failurePattern);
      }
    }
  }

  /**
   * Analyze coordination patterns
   */
  private analyzeCoordinationPatterns(): void {
    const coordinationTraces = this.traces.filter(
      (t) => t.action.includes('coordinate') || t.action.includes('synchronize')
    );

    const topologies = new Map<string, ExecutionTrace[]>();

    for (const trace of coordinationTraces) {
      const topology = trace.parameters?.topology || 'unknown';
      if (!topologies.has(topology)) {
        topologies.set(topology, []);
      }
      topologies.get(topology)!.push(trace);
    }

    for (const [topology, traces] of topologies) {
      const pattern = this.calculateCoordinationPattern(topology, traces);

      if (pattern.effectiveness > 0.6) {
        this.patterns.set(`coordination_${topology}`, {
          id: `coordination_${topology}`,
          type: 'coordination',
          pattern,
          frequency: traces.length,
          confidence: pattern.effectiveness,
          context: this.extractCoordinationContext(traces),
          metadata: this.calculateCoordinationMetadata(pattern, traces),
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Get patterns by type and confidence
   */
  getPatterns(type?: string, minConfidence?: number): ExecutionPattern[] {
    let patterns = Array.from(this.patterns.values());

    if (type) {
      patterns = patterns.filter((p) => p.type === type);
    }

    if (minConfidence !== undefined) {
      patterns = patterns.filter((p) => p.confidence >= minConfidence);
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Predict likely patterns for given context
   */
  predictPatterns(context: ExecutionContext): ExecutionPattern[] {
    const relevantPatterns = Array.from(this.patterns.values())
      .filter((p) => this.isContextRelevant(p.context, context))
      .sort((a, b) => b.confidence - a.confidence);

    return relevantPatterns.slice(0, 10); // Top 10 predictions
  }

  /**
   * Get communication patterns for agents
   */
  getCommunicationPatterns(agentId?: string): CommunicationPattern[] {
    let patterns = Array.from(this.communicationPatterns.values());

    if (agentId) {
      patterns = patterns.filter((p) => p.source === agentId || p.target === agentId);
    }

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get failure patterns
   */
  getFailurePatterns(): FailurePattern[] {
    return Array.from(this.failurePatterns.values()).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Start continuous pattern analysis
   */
  private startPatternAnalysis(): void {
    setInterval(() => {
      if (this.traces.length > 50) {
        this.analyzePatterns();
      }
    }, 60000); // Analyze every minute
  }

  // Helper methods for pattern calculation
  private groupTracesByTask(): Map<string, ExecutionTrace[]> {
    const groups = new Map<string, ExecutionTrace[]>();

    for (const trace of this.traces) {
      const taskType = trace.action;
      if (!groups.has(taskType)) {
        groups.set(taskType, []);
      }
      groups.get(taskType)!.push(trace);
    }

    return groups;
  }

  private groupTracesByResource(): Map<string, number[]> {
    const groups = new Map<string, number[]>();

    for (const trace of this.traces) {
      groups.set('cpu', (groups.get('cpu') || []).concat(trace.resourceUsage.cpu));
      groups.set('memory', (groups.get('memory') || []).concat(trace.resourceUsage.memory));
      groups.set('network', (groups.get('network') || []).concat(trace.resourceUsage.network));
      groups.set('diskIO', (groups.get('diskIO') || []).concat(trace.resourceUsage.diskIO));
    }

    return groups;
  }

  private calculateTaskPattern(
    taskType: string,
    durations: number[],
    resources: ResourceUsage[]
  ): any {
    return {
      taskType,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      durationVariance: this.calculateVariance(durations),
      averageResourceUsage: this.calculateAverageResourceUsage(resources),
      frequency: durations.length,
      trendDirection: this.calculateTrend(durations),
    };
  }

  private calculateResourcePattern(resourceType: string, usages: number[]): any {
    return {
      resourceType,
      average: usages.reduce((a, b) => a + b, 0) / usages.length,
      variance: this.calculateVariance(usages),
      peak: Math.max(...usages),
      trough: Math.min(...usages),
      utilization: this.calculateUtilization(usages),
      significance: this.calculateSignificance(usages),
    };
  }

  private calculateCoordinationPattern(topology: string, traces: ExecutionTrace[]): any {
    const durations = traces.map((t) => t.duration);
    const successRate = traces.filter((t) => t.result?.success !== false).length / traces.length;

    return {
      topology,
      averageCoordinationTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      successRate,
      agentParticipation: this.calculateAgentParticipation(traces),
      effectiveness: successRate * (1 / (durations.reduce((a, b) => a + b, 0) / durations.length)),
    };
  }

  private calculateConfidence(pattern: any): number {
    // Simple confidence calculation based on frequency and stability
    const frequencyScore = Math.min(pattern.frequency / 10, 1);
    const stabilityScore = 1 - (pattern.durationVariance || 0) / (pattern.averageDuration || 1);
    return (frequencyScore + stabilityScore) / 2;
  }

  private calculateMetadata(pattern: any, traces: ExecutionTrace[]): PatternMetadata {
    return {
      complexity: this.calculateComplexity(pattern, traces),
      predictability: this.calculatePredictability(pattern, traces),
      stability: this.calculateStability(pattern, traces),
      anomalyScore: this.calculateAnomalyScore(pattern, traces),
      correlations: this.findCorrelations(pattern, traces),
    };
  }

  private extractContext(traces: ExecutionTrace[]): ExecutionContext {
    const swarmIds = [...new Set(traces.map((t) => t.swarmId))];
    const agentIds = [...new Set(traces.map((t) => t.agentId))];

    return {
      swarmId: swarmIds[0] || 'unknown',
      agentIds,
      taskType: traces[0]?.action || 'unknown',
      topology: 'mesh', // Default, could be extracted from traces
      environment: 'production',
      resourceConstraints: {
        cpuLimit: 100,
        memoryLimit: 1024,
        networkBandwidth: 1000,
        concurrencyLimit: 10,
      },
    };
  }

  // Additional helper methods would be implemented here...
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
  }

  private calculateAverageResourceUsage(resources: ResourceUsage[]): ResourceUsage {
    return {
      cpu: resources.reduce((sum, r) => sum + r.cpu, 0) / resources.length,
      memory: resources.reduce((sum, r) => sum + r.memory, 0) / resources.length,
      network: resources.reduce((sum, r) => sum + r.network, 0) / resources.length,
      diskIO: resources.reduce((sum, r) => sum + r.diskIO, 0) / resources.length,
    };
  }

  private calculateTrend(values: number[]): string {
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.1) return 'increasing';
    if (secondAvg < firstAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  private calculateUtilization(usages: number[]): number {
    return usages.reduce((a, b) => a + b, 0) / (usages.length * 100); // Assuming 100 is max
  }

  private calculateSignificance(usages: number[]): number {
    const variance = this.calculateVariance(usages);
    const mean = usages.reduce((a, b) => a + b, 0) / usages.length;
    return mean / (variance + 1); // Higher significance for high mean, low variance
  }

  private calculateAgentParticipation(traces: ExecutionTrace[]): number {
    const uniqueAgents = new Set(traces.map((t) => t.agentId));
    return uniqueAgents.size / Math.max(traces.length, 1);
  }

  private calculateComplexity(pattern: any, traces: ExecutionTrace[]): number {
    // Simple complexity metric based on parameter count and variance
    const paramCount = Object.keys(pattern).length;
    const variance = pattern.durationVariance || 0;
    return paramCount / 10 + variance / 1000;
  }

  private calculatePredictability(pattern: any, traces: ExecutionTrace[]): number {
    // Higher predictability for lower variance
    return 1 - Math.min(pattern.durationVariance || 0, 1);
  }

  private calculateStability(pattern: any, traces: ExecutionTrace[]): number {
    // Simple stability metric
    return 1 - (pattern.durationVariance || 0) / (pattern.averageDuration || 1);
  }

  private calculateAnomalyScore(pattern: any, traces: ExecutionTrace[]): number {
    // Simple anomaly detection
    return pattern.durationVariance || 0 > (pattern.averageDuration || 1) ? 0.8 : 0.2;
  }

  private findCorrelations(pattern: any, traces: ExecutionTrace[]): PatternCorrelation[] {
    // Simplified correlation detection
    return [];
  }

  private getMostFrequentMessageType(
    source: string,
    target: string,
    traces: ExecutionTrace[]
  ): string {
    const relevantTraces = traces.filter(
      (t) => t.agentId === source && t.parameters?.target === target
    );

    const types = new Map<string, number>();
    for (const trace of relevantTraces) {
      const type = trace.parameters?.messageType || 'unknown';
      types.set(type, (types.get(type) || 0) + 1);
    }

    let maxType = 'unknown';
    let maxCount = 0;
    for (const [type, count] of types) {
      if (count > maxCount) {
        maxType = type;
        maxCount = count;
      }
    }

    return maxType;
  }

  private calculateAverageLatency(
    source: string,
    target: string,
    traces: ExecutionTrace[]
  ): number {
    const relevantTraces = traces.filter(
      (t) => t.agentId === source && t.parameters?.target === target
    );

    const latencies = relevantTraces.map((t) => t.duration);
    return latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
  }

  private calculateAveragePayloadSize(
    source: string,
    target: string,
    traces: ExecutionTrace[]
  ): number {
    const relevantTraces = traces.filter(
      (t) => t.agentId === source && t.parameters?.target === target
    );

    const sizes = relevantTraces.map((t) => JSON.stringify(t.parameters || {}).length);

    return sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;
  }

  private calculateReliability(source: string, target: string, traces: ExecutionTrace[]): number {
    const relevantTraces = traces.filter(
      (t) => t.agentId === source && t.parameters?.target === target
    );

    const successful = relevantTraces.filter((t) => t.result?.success !== false).length;
    return relevantTraces.length > 0 ? successful / relevantTraces.length : 0;
  }

  private classifyError(error: any): string {
    if (!error) return 'unknown';

    const errorString = error.toString().toLowerCase();

    if (errorString.includes('timeout')) return 'timeout';
    if (errorString.includes('connection')) return 'connection';
    if (errorString.includes('memory')) return 'memory';
    if (errorString.includes('cpu')) return 'cpu';
    if (errorString.includes('permission')) return 'permission';

    return 'generic';
  }

  private extractFailureContext(traces: ExecutionTrace[]): string[] {
    return [...new Set(traces.map((t) => t.action))];
  }

  private identifyPreconditions(traces: ExecutionTrace[]): any[] {
    // Simple precondition identification
    return traces.map((t) => ({
      resourceUsage: t.resourceUsage,
      parameters: t.parameters,
    }));
  }

  private assessFailureImpacts(traces: ExecutionTrace[]): string[] {
    return ['performance_degradation', 'task_failure', 'resource_waste'];
  }

  private calculateRecoveryTime(traces: ExecutionTrace[]): number {
    // Simple recovery time calculation
    return traces.reduce((sum, t) => sum + t.duration, 0) / traces.length;
  }

  private extractResourceContext(usages: number[]): ExecutionContext {
    return {
      swarmId: 'unknown',
      agentIds: [],
      taskType: 'resource_usage',
      topology: 'unknown',
      environment: 'production',
      resourceConstraints: {
        cpuLimit: 100,
        memoryLimit: 1024,
        networkBandwidth: 1000,
        concurrencyLimit: 10,
      },
    };
  }

  private calculateResourceMetadata(pattern: any, usages: number[]): PatternMetadata {
    return {
      complexity: pattern.variance / pattern.average,
      predictability: 1 - pattern.variance / pattern.average,
      stability: pattern.average / pattern.peak,
      anomalyScore: pattern.peak > pattern.average * 2 ? 0.8 : 0.2,
      correlations: [],
    };
  }

  private extractCoordinationContext(traces: ExecutionTrace[]): ExecutionContext {
    return {
      swarmId: traces[0]?.swarmId || 'unknown',
      agentIds: [...new Set(traces.map((t) => t.agentId))],
      taskType: 'coordination',
      topology: traces[0]?.parameters?.topology || 'unknown',
      environment: 'production',
      resourceConstraints: {
        cpuLimit: 100,
        memoryLimit: 1024,
        networkBandwidth: 1000,
        concurrencyLimit: 10,
      },
    };
  }

  private calculateCoordinationMetadata(pattern: any, traces: ExecutionTrace[]): PatternMetadata {
    return {
      complexity: traces.length / 10,
      predictability: pattern.successRate,
      stability: pattern.successRate,
      anomalyScore: pattern.successRate < 0.8 ? 0.7 : 0.2,
      correlations: [],
    };
  }

  private isContextRelevant(
    patternContext: ExecutionContext,
    targetContext: ExecutionContext
  ): boolean {
    return (
      patternContext.taskType === targetContext.taskType ||
      patternContext.topology === targetContext.topology ||
      patternContext.environment === targetContext.environment
    );
  }
}
