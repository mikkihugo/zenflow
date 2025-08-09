/**
 * Pattern Recognition Engine for Swarm Execution Analysis
 * Analyzes swarm behaviors, task patterns, and communication flows
 * Enhanced to implement the adaptive learning interface.
 */

import { EventEmitter } from 'node:events';
import type {
  AdaptiveLearningConfig,
  Anomaly,
  ExecutionData,
  FailurePrediction,
  CommunicationPattern as ICommunicationPattern,
  FailurePattern as IFailurePattern,
  PatternRecognitionEngine as IPatternRecognitionEngine,
  Message,
  PatternAnalysis,
  PatternCluster,
  PatternInsight,
  ResourcePattern,
  ResourceUsage,
  SystemContext,
  TaskCompletionPattern,
  TaskResult,
} from './types';

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

export class PatternRecognitionEngine extends EventEmitter implements IPatternRecognitionEngine {
  private patterns: Map<string, ExecutionPattern> = new Map();
  private traces: ExecutionTrace[] = [];
  private communicationPatterns: Map<string, CommunicationPattern> = new Map();
  private failurePatterns: Map<string, FailurePattern> = new Map();
  private analysisWindow: number = 3600000; // 1 hour
  private minPatternFrequency: number = 3;
  private confidenceThreshold: number = 0.7;
  private config: AdaptiveLearningConfig;
  private context: SystemContext;

  constructor(config?: AdaptiveLearningConfig, context?: SystemContext) {
    super();
    this.config = config || this.getDefaultConfig();
    this.context = context || this.getDefaultContext();
    this.minPatternFrequency = this.config.patternRecognition.minPatternFrequency;
    this.confidenceThreshold = this.config.patternRecognition.confidenceThreshold;
    this.analysisWindow = this.config.patternRecognition.analysisWindow;
    this.startPatternAnalysis();
  }

  /**
   * Analyze execution patterns from execution data.
   *
   * @param data
   */
  async analyzeExecutionPatterns(data: ExecutionData[]): Promise<PatternAnalysis> {
    // Convert ExecutionData to ExecutionTrace format for compatibility
    const traces = data.map(this.convertToTrace.bind(this));

    // Update internal traces
    this.traces.push(...traces);
    this.maintainSlidingWindow();

    // Perform pattern analysis
    await this.analyzePatterns();

    // Generate pattern clusters
    const clusters = this.generatePatternClusters(data);

    // Detect anomalies
    const anomalies = this.detectAnomalies(data);

    // Generate insights
    const insights = this.generateInsights(clusters, anomalies);

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(clusters);

    const analysis: PatternAnalysis = {
      patterns: clusters,
      anomalies,
      confidence,
      insights,
      timestamp: Date.now(),
    };

    this.emit('patternsAnalyzed', {
      patterns: clusters.length,
      anomalies: anomalies.length,
      confidence,
      timestamp: Date.now(),
    });

    return analysis;
  }

  /**
   * Classify task completion patterns.
   *
   * @param task
   */
  classifyTaskCompletion(task: TaskResult): TaskCompletionPattern {
    // Find similar task completions from historical data
    const similarTasks = this.traces.filter(
      (trace) => trace.action === 'task_completion' && trace.agentId === task.agentId
    );

    // Calculate pattern metrics
    const durations = similarTasks.map((t) => t.duration);
    const averageDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : task.duration;

    const successfulTasks = similarTasks.filter((t) => t.result?.success !== false);
    const successRate =
      similarTasks.length > 0
        ? successfulTasks.length / similarTasks.length
        : task.status === 'completed'
          ? 1
          : 0;

    // Extract resource profile
    const resourceProfile = this.calculateAverageResourceUsage(
      similarTasks.map((t) => t.resourceUsage)
    );

    // Identify optimal conditions
    const optimalConditions = this.identifyOptimalConditions(successfulTasks);

    // Identify common failures
    const failedTasks = similarTasks.filter((t) => t.result?.success === false);
    const commonFailures = this.identifyCommonFailures(failedTasks);

    const pattern: TaskCompletionPattern = {
      taskType: (task.metadata as any)?.taskType || 'unknown',
      averageDuration,
      successRate,
      qualityScore: task.quality,
      resourceProfile: {
        cpu: resourceProfile.cpu,
        memory: resourceProfile.memory,
        network: resourceProfile.network,
        diskIO: resourceProfile.diskIO,
        bandwidth: task.resourceUsage.bandwidth,
        latency: task.resourceUsage.latency,
      },
      optimalConditions,
      commonFailures,
    };

    this.emit('taskPatternClassified', {
      taskId: task.taskId,
      pattern: pattern.taskType,
      successRate,
      timestamp: Date.now(),
    });

    return pattern;
  }

  /**
   * Detect communication patterns from messages.
   *
   * @param messages
   */
  detectCommunicationPatterns(messages: Message[]): ICommunicationPattern[] {
    const patterns: ICommunicationPattern[] = [];

    // Group messages by communication pairs
    const pairGroups = new Map<string, Message[]>();

    for (const message of messages) {
      const pairKey = `${message.from}->${message.to}`;
      if (!pairGroups.has(pairKey)) {
        pairGroups.set(pairKey, []);
      }
      pairGroups.get(pairKey)?.push(message);
    }

    // Analyze each communication pair
    for (const [pairKey, pairMessages] of pairGroups) {
      if (pairMessages.length >= this.minPatternFrequency) {
        const parts = pairKey.split('->');
        const source = parts[0] || 'unknown';
        const target = parts[1] || 'unknown';

        const pattern: ICommunicationPattern = {
          source,
          target,
          messageType: this.getMostFrequentMessageType(pairMessages),
          frequency: pairMessages.length,
          averageLatency: this.calculateAverageLatency(pairMessages),
          averageSize: this.calculateAverageSize(pairMessages),
          reliability: this.calculateReliability(pairMessages),
          efficiency: this.calculateCommunicationEfficiency(pairMessages),
        };

        patterns.push(pattern);
      }
    }

    this.emit('communicationPatternsDetected', {
      patterns: patterns.length,
      messages: messages.length,
      timestamp: Date.now(),
    });

    return patterns;
  }

  /**
   * Identify resource usage patterns.
   *
   * @param usage
   */
  identifyResourcePatterns(usage: ResourceUsage[]): ResourcePattern[] {
    const patterns: ResourcePattern[] = [];
    const resourceTypes: Array<'cpu' | 'memory' | 'network' | 'diskIO'> = [
      'cpu',
      'memory',
      'network',
      'diskIO',
    ];

    for (const resourceType of resourceTypes) {
      const values = usage.map((u) => u[resourceType]);

      if (values.length > 0) {
        const pattern: ResourcePattern = {
          resourceType,
          usage: this.calculateResourceStatistics(values),
          trends: this.analyzeTrends(values),
          seasonality: this.detectSeasonality(values),
          anomalies: this.detectResourceAnomalies(values, resourceType),
          optimization: this.generateResourceOptimizations(values, resourceType),
        };

        patterns.push(pattern);
      }
    }

    this.emit('resourcePatternsIdentified', {
      patterns: patterns.length,
      usageRecords: usage.length,
      timestamp: Date.now(),
    });

    return patterns;
  }

  /**
   * Predict failures based on failure patterns.
   *
   * @param patterns
   */
  predictFailures(patterns: IFailurePattern[]): FailurePrediction[] {
    const predictions: FailurePrediction[] = [];

    for (const pattern of patterns) {
      // Calculate failure probability based on frequency and severity
      const probability = Math.min(
        0.95,
        (pattern.frequency / 100) * this.getSeverityMultiplier(pattern.severity)
      );

      // Estimate time to failure based on historical data
      const timeToFailure = this.estimateTimeToFailure(pattern);

      // Calculate prediction confidence
      const confidence = this.calculatePredictionConfidence(pattern);

      // Identify affected components
      const affectedComponents = this.identifyAffectedComponents(pattern);

      // Generate prevention actions
      const preventionActions = this.generatePreventionActions(pattern);

      const prediction: FailurePrediction = {
        failureType: pattern.type,
        probability,
        timeToFailure,
        confidence,
        affectedComponents,
        preventionActions,
        riskLevel: this.calculateRiskLevel(probability, pattern.severity),
      };

      predictions.push(prediction);
    }

    // Sort by risk level and probability
    predictions.sort((a, b) => {
      const aRisk = this.getRiskScore(a.riskLevel);
      const bRisk = this.getRiskScore(b.riskLevel);
      return bRisk - aRisk || b.probability - a.probability;
    });

    this.emit('failuresPredicted', {
      predictions: predictions.length,
      highRisk: predictions.filter((p) => p.riskLevel === 'critical' || p.riskLevel === 'high')
        .length,
      timestamp: Date.now(),
    });

    return predictions;
  }

  /**
   * Record execution trace for pattern analysis.
   *
   * @param trace
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
   * Analyze execution patterns from traces.
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
   * Analyze task completion patterns.
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
   * Analyze communication patterns between agents.
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
        const parts = pair.split('->');
        const source = parts[0] || 'unknown';
        const target = parts[1] || 'unknown';
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
   * Analyze resource utilization patterns.
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
   * Analyze failure patterns.
   */
  private analyzeFailurePatterns(): void {
    const failureTraces = this.traces.filter((t) => t.result?.error || t.result?.success === false);

    const failureTypes = new Map<string, ExecutionTrace[]>();

    for (const trace of failureTraces) {
      const errorType = this.classifyError(trace.result?.error);
      if (!failureTypes.has(errorType)) {
        failureTypes.set(errorType, []);
      }
      failureTypes.get(errorType)?.push(trace);
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
   * Analyze coordination patterns.
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
      topologies.get(topology)?.push(trace);
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
   * Get patterns by type and confidence.
   *
   * @param type
   * @param minConfidence
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
   * Predict likely patterns for given context.
   *
   * @param context
   */
  predictPatterns(context: ExecutionContext): ExecutionPattern[] {
    const relevantPatterns = Array.from(this.patterns.values())
      .filter((p) => this.isContextRelevant(p.context, context))
      .sort((a, b) => b.confidence - a.confidence);

    return relevantPatterns.slice(0, 10); // Top 10 predictions
  }

  /**
   * Get communication patterns for agents.
   *
   * @param agentId
   */
  getCommunicationPatterns(agentId?: string): CommunicationPattern[] {
    let patterns = Array.from(this.communicationPatterns.values());

    if (agentId) {
      patterns = patterns.filter((p) => p.source === agentId || p.target === agentId);
    }

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get failure patterns.
   */
  getFailurePatterns(): FailurePattern[] {
    return Array.from(this.failurePatterns.values()).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Start continuous pattern analysis.
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
      groups.get(taskType)?.push(trace);
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
    if (resources.length === 0) {
      return {
        cpu: 0,
        memory: 0,
        network: 0,
        diskIO: 0,
        timestamp: Date.now(),
        duration: 0,
        context: 'empty'
      };
    }

    return {
      cpu: resources.reduce((sum, r) => sum + r.cpu, 0) / resources.length,
      memory: resources.reduce((sum, r) => sum + r.memory, 0) / resources.length,
      network: resources.reduce((sum, r) => sum + r.network, 0) / resources.length,
      diskIO: resources.reduce((sum, r) => sum + r.diskIO, 0) / resources.length,
      timestamp: Date.now(),
      duration: resources.reduce((sum, r) => sum + (r.duration || 0), 0) / resources.length,
      context: 'aggregated'
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

  private calculateComplexity(pattern: any, _traces: ExecutionTrace[]): number {
    // Simple complexity metric based on parameter count and variance
    const paramCount = Object.keys(pattern).length;
    const variance = pattern.durationVariance || 0;
    return paramCount / 10 + variance / 1000;
  }

  private calculatePredictability(pattern: any, _traces: ExecutionTrace[]): number {
    // Higher predictability for lower variance
    return 1 - Math.min(pattern.durationVariance || 0, 1);
  }

  private calculateStabilityFromPattern(pattern: any, _traces: ExecutionTrace[]): number {
    // Simple stability metric
    return 1 - (pattern.durationVariance || 0) / (pattern.averageDuration || 1);
  }

  private calculateAnomalyScore(pattern: any, _traces: ExecutionTrace[]): number {
    // Simple anomaly detection
    return pattern.durationVariance || 0 > (pattern.averageDuration || 1) ? 0.8 : 0.2;
  }

  private findCorrelations(_pattern: any, _traces: ExecutionTrace[]): PatternCorrelation[] {
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

  private calculateAverageLatencyFromTraces(
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

  private calculateReliabilityFromTraces(source: string, target: string, traces: ExecutionTrace[]): number {
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

  private assessFailureImpacts(_traces: ExecutionTrace[]): string[] {
    return ['performance_degradation', 'task_failure', 'resource_waste'];
  }

  private calculateRecoveryTime(traces: ExecutionTrace[]): number {
    // Simple recovery time calculation
    return traces.reduce((sum, t) => sum + t.duration, 0) / traces.length;
  }

  private extractResourceContext(_usages: number[]): ExecutionContext {
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

  private calculateResourceMetadata(pattern: any, _usages: number[]): PatternMetadata {
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

  // New helper methods for enhanced interface implementation

  private getDefaultConfig(): AdaptiveLearningConfig {
    return {
      patternRecognition: {
        enabled: true,
        minPatternFrequency: 3,
        confidenceThreshold: 0.7,
        analysisWindow: 3600000,
      },
      learning: {
        enabled: true,
        learningRate: 0.1,
        adaptationRate: 0.1,
        knowledgeRetention: 0.9,
      },
      optimization: {
        enabled: true,
        optimizationThreshold: 0.8,
        maxOptimizations: 10,
        validationRequired: true,
      },
      ml: {
        neuralNetwork: true,
        reinforcementLearning: true,
        ensemble: true,
        onlineLearning: true,
      },
    };
  }

  private getDefaultContext(): SystemContext {
    return {
      environment: 'production',
      resources: [],
      constraints: [],
      objectives: [],
    };
  }

  private convertToTrace(data: ExecutionData): ExecutionTrace {
    return {
      swarmId: (data.context as any)?.swarmId || 'unknown',
      agentId: data.agentId,
      action: data.action,
      parameters: data.parameters,
      result: data.result,
      timestamp: data.timestamp,
      duration: data.duration,
      resourceUsage: {
        cpu: data.resourceUsage.cpu,
        memory: data.resourceUsage.memory,
        network: data.resourceUsage.network,
        diskIO: data.resourceUsage.diskIO,
        timestamp: data.resourceUsage.timestamp || Date.now(),
        duration: data.resourceUsage.duration || data.duration,
        context: data.resourceUsage.context || 'execution'
      },
    };
  }

  private maintainSlidingWindow(): void {
    const cutoff = Date.now() - this.analysisWindow;
    this.traces = this.traces.filter((t) => t.timestamp > cutoff);
  }

  private generatePatternClusters(data: ExecutionData[]): PatternCluster[] {
    const clusters: PatternCluster[] = [];

    // Simple clustering by task type and success
    const groups = new Map<string, ExecutionData[]>();

    for (const item of data) {
      const key = `${item.taskType}_${item.success}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(item);
    }

    for (const [key, members] of groups) {
      if (members.length >= this.minPatternFrequency) {
        const firstMember = members[0];
        if (firstMember) {
          const cluster: PatternCluster = {
            id: `cluster_${key}_${Date.now()}`,
            type: firstMember.success ? 'task_completion' : 'failure',
            centroid: this.calculateCentroid(members),
            members,
            confidence: members.length / data.length,
            stability: this.calculateStabilityFromData(members),
          };

          clusters.push(cluster);
        }
      }
    }

    return clusters;
  }

  private calculateCentroid(data: ExecutionData[]): any {
    const avgDuration = data.reduce((sum, d) => sum + d.duration, 0) / data.length;
    const avgResourceUsage = this.calculateAverageResourceUsage(data.map((d) => d.resourceUsage));

    return {
      avgDuration,
      avgResourceUsage,
      taskType: data[0]?.taskType,
      successRate: data.filter((d) => d.success).length / data.length,
    };
  }

  private calculateStabilityFromData(data: ExecutionData[]): number {
    const durations = data.map((d) => d.duration);
    const variance = this.calculateVariance(durations);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    return 1 - Math.min(1, variance / mean);
  }

  private detectAnomalies(data: ExecutionData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Detect performance anomalies
    const durations = data.map((d) => d.duration);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const std = Math.sqrt(this.calculateVariance(durations));

    for (const item of data) {
      const zScore = Math.abs((item.duration - mean) / std);

      if (zScore > 3) {
        // 3-sigma rule
        anomalies.push({
          id: `anomaly_${item.id}_${Date.now()}`,
          type: 'performance',
          severity: zScore > 4 ? 'critical' : 'high',
          description: `Unusual execution time: ${item.duration}ms (expected ~${mean.toFixed(0)}ms)`,
          affectedData: [item],
          confidence: Math.min(0.95, zScore / 5),
          timestamp: Date.now(),
        });
      }
    }

    // Detect resource anomalies
    for (const resourceType of ['cpu', 'memory', 'network', 'diskIO'] as const) {
      const values = data.map((d) => d.resourceUsage[resourceType]);
      const resourceMean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const resourceStd = Math.sqrt(this.calculateVariance(values));

      for (let i = 0; i < data.length; i++) {
        const value = values[i];
        if (value !== undefined) {
          const zScore = Math.abs((value - resourceMean) / resourceStd);

          if (zScore > 2.5) {
            const dataItem = data[i];
            if (dataItem) {
              anomalies.push({
                id: `resource_anomaly_${dataItem.id}_${resourceType}_${Date.now()}`,
                type: 'resource',
                severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
                description: `Unusual ${resourceType} usage: ${value.toFixed(2)} (expected ~${resourceMean.toFixed(2)})`,
                affectedData: [dataItem],
                confidence: Math.min(0.9, zScore / 4),
                timestamp: Date.now(),
              });
            }
          }
        }
      }
    }

    return anomalies;
  }

  private generateInsights(clusters: PatternCluster[], anomalies: Anomaly[]): PatternInsight[] {
    const insights: PatternInsight[] = [];

    // Generate insights from clusters
    for (const cluster of clusters) {
      if (cluster.confidence > 0.7) {
        insights.push({
          type: 'optimization',
          description: `Pattern identified: ${cluster.type} with ${cluster.members.length} instances`,
          impact: cluster.confidence,
          confidence: cluster.confidence,
          actionable: true,
          relatedPatterns: [cluster.id],
        });
      }
    }

    // Generate insights from anomalies
    const criticalAnomalies = anomalies.filter((a) => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      insights.push({
        type: 'warning',
        description: `${criticalAnomalies.length} critical performance anomalies detected`,
        impact: 0.8,
        confidence: 0.9,
        actionable: true,
        relatedPatterns: criticalAnomalies.map((a) => a.id),
      });
    }

    // Performance recommendations
    const lowPerformanceClusters = clusters.filter(
      (c) => c.centroid.successRate < 0.8 || c.centroid.avgDuration > 5000
    );

    if (lowPerformanceClusters.length > 0) {
      insights.push({
        type: 'recommendation',
        description: `Consider optimizing ${lowPerformanceClusters.length} low-performance patterns`,
        impact: 0.6,
        confidence: 0.75,
        actionable: true,
        relatedPatterns: lowPerformanceClusters.map((c) => c.id),
      });
    }

    return insights;
  }

  private calculateOverallConfidence(clusters: PatternCluster[]): number {
    if (clusters.length === 0) return 0;

    const avgConfidence = clusters.reduce((sum, c) => sum + c.confidence, 0) / clusters.length;
    const stabilityFactor = clusters.reduce((sum, c) => sum + c.stability, 0) / clusters.length;

    return (avgConfidence + stabilityFactor) / 2;
  }

  private getMostFrequentMessageType(messages: Message[]): string {
    const typeCounts = new Map<string, number>();

    for (const message of messages) {
      typeCounts.set(message.type, (typeCounts.get(message.type) || 0) + 1);
    }

    let maxType = 'unknown';
    let maxCount = 0;

    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        maxType = type;
        maxCount = count;
      }
    }

    return maxType;
  }

  private calculateAverageLatency(messages: Message[]): number {
    const latencies = messages.filter((m) => m.latency !== undefined).map((m) => m.latency!);
    return latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0;
  }

  private calculateAverageSize(messages: Message[]): number {
    const sizes = messages.filter((m) => m.size !== undefined).map((m) => m.size!);
    return sizes.length > 0 ? sizes.reduce((sum, s) => sum + s, 0) / sizes.length : 0;
  }

  private calculateReliability(_messages: Message[]): number {
    // Simplified: assume all delivered messages are reliable
    return 1.0;
  }

  private calculateCommunicationEfficiency(messages: Message[]): number {
    const avgLatency = this.calculateAverageLatency(messages);
    const avgSize = this.calculateAverageSize(messages);

    // Simple efficiency calculation: inversely related to latency and size
    return 1 / (1 + avgLatency / 1000 + avgSize / 1000);
  }

  private calculateResourceStatistics(values: number[]): any {
    const sorted = [...values].sort((a, b) => a - b);

    return {
      mean: values.reduce((sum, v) => sum + v, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      std: Math.sqrt(this.calculateVariance(values)),
      min: Math.min(...values),
      max: Math.max(...values),
      percentiles: new Map([
        [25, sorted[Math.floor(sorted.length * 0.25)]],
        [50, sorted[Math.floor(sorted.length * 0.5)]],
        [75, sorted[Math.floor(sorted.length * 0.75)]],
        [90, sorted[Math.floor(sorted.length * 0.9)]],
        [95, sorted[Math.floor(sorted.length * 0.95)]],
      ]),
    };
  }

  private analyzeTrends(values: number[]): any {
    if (values.length < 3) {
      return {
        direction: 'stable',
        slope: 0,
        confidence: 0,
        seasonality: false,
      };
    }

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, xi) => sum + xi, 0);
    const sumY = values.reduce((sum, yi) => sum + yi, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i]!, 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    let direction: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
    if (Math.abs(slope) > 0.1) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    return {
      direction,
      slope,
      confidence: Math.min(1, Math.abs(slope) * 10),
      seasonality: this.detectSeasonalitySimple(values),
      cyclePeriod: this.detectCyclePeriod(values),
    };
  }

  private detectSeasonality(values: number[]): any {
    const seasonality = this.detectSeasonalitySimple(values);

    return {
      detected: seasonality,
      period: seasonality ? this.detectCyclePeriod(values) : 0,
      amplitude: seasonality ? this.calculateSeasonalAmplitude(values) : 0,
      phase: 0, // Simplified
      confidence: seasonality ? 0.7 : 0.1,
    };
  }

  private detectSeasonalitySimple(values: number[]): boolean {
    // Very simple seasonality detection
    if (values.length < 8) return false;

    const periods = [2, 3, 4, 6, 8];

    for (const period of periods) {
      if (values.length >= period * 2) {
        const correlation = this.calculateAutocorrelation(values, period);
        if (correlation > 0.7) return true;
      }
    }

    return false;
  }

  private calculateAutocorrelation(values: number[], lag: number): number {
    if (values.length <= lag) return 0;

    const n = values.length - lag;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const currentValue = values[i];
      const laggedValue = values[i + lag];
      if (currentValue !== undefined && laggedValue !== undefined) {
        numerator += (currentValue - mean) * (laggedValue - mean);
      }
    }

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value !== undefined) {
        denominator += (value - mean) ** 2;
      }
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private detectCyclePeriod(values: number[]): number {
    // Simplified cycle detection
    if (values.length < 6) return 0;

    const periods = [2, 3, 4, 6, 8, 12];
    let bestPeriod = 0;
    let bestCorrelation = 0;

    for (const period of periods) {
      if (values.length >= period * 2) {
        const correlation = this.calculateAutocorrelation(values, period);
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestPeriod = period;
        }
      }
    }

    return bestCorrelation > 0.6 ? bestPeriod : 0;
  }

  private calculateSeasonalAmplitude(values: number[]): number {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    return (max - min) / (2 * mean);
  }

  private detectResourceAnomalies(values: number[], resourceType: string): any[] {
    const anomalies: any[] = [];
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const std = Math.sqrt(this.calculateVariance(values));

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value !== undefined) {
        const zScore = Math.abs((value - mean) / std);

        if (zScore > 2.5) {
          anomalies.push({
            timestamp: Date.now() - (values.length - i) * 60000, // Rough timestamp
            type: 'statistical',
            severity: zScore > 3 ? 0.8 : 0.5,
            description: `${resourceType} anomaly: ${value.toFixed(2)}`,
            impact: Math.min(1, zScore / 4),
          });
        }
      }
    }

    return anomalies;
  }

  private generateResourceOptimizations(values: number[], resourceType: string): any[] {
    const optimizations: any[] = [];
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const max = Math.max(...values);

    if (mean > 0.8) {
      optimizations.push({
        type: 'capacity_increase',
        description: `Consider increasing ${resourceType} capacity`,
        expectedSavings: 0.2,
        effort: 0.5,
        risk: 0.1,
        priority: 0.8,
      });
    }

    if (max / mean > 2) {
      optimizations.push({
        type: 'load_balancing',
        description: `Implement ${resourceType} load balancing`,
        expectedSavings: 0.15,
        effort: 0.3,
        risk: 0.05,
        priority: 0.6,
      });
    }

    return optimizations;
  }

  private getSeverityMultiplier(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (severity) {
      case 'low':
        return 0.25;
      case 'medium':
        return 0.5;
      case 'high':
        return 0.75;
      case 'critical':
        return 1.0;
      default:
        return 0.5;
    }
  }

  private estimateTimeToFailure(pattern: IFailurePattern): number {
    // Simple estimation based on frequency
    return Math.max(3600, 86400 / pattern.frequency); // At least 1 hour
  }

  private calculatePredictionConfidence(pattern: IFailurePattern): number {
    const frequencyFactor = Math.min(1, pattern.frequency / 10);
    const severityFactor = this.getSeverityMultiplier(pattern.severity);

    return (frequencyFactor + severityFactor) / 2;
  }

  private identifyAffectedComponents(pattern: IFailurePattern): string[] {
    return pattern.context.slice(0, 3); // First 3 context items as components
  }

  private generatePreventionActions(pattern: IFailurePattern): string[] {
    const actions: string[] = [];

    actions.push(`Monitor for ${pattern.type} conditions`);
    actions.push(`Implement safeguards for ${pattern.type}`);

    if (pattern.preconditions.length > 0) {
      actions.push('Address identified preconditions');
    }

    return actions;
  }

  private calculateRiskLevel(
    probability: number,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severityScore = this.getSeverityMultiplier(severity);
    const riskScore = probability * severityScore;

    if (riskScore > 0.75) return 'critical';
    if (riskScore > 0.5) return 'high';
    if (riskScore > 0.25) return 'medium';
    return 'low';
  }

  private getRiskScore(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (riskLevel) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      case 'critical':
        return 4;
      default:
        return 0;
    }
  }

  private identifyOptimalConditions(traces: ExecutionTrace[]): string[] {
    const conditions: string[] = [];

    if (traces.length === 0) return conditions;

    // Analyze resource usage patterns for successful tasks
    const avgResourceUsage = this.calculateAverageResourceUsage(traces.map((t) => t.resourceUsage));

    if (avgResourceUsage.cpu < 0.7) conditions.push('moderate_cpu_usage');
    if (avgResourceUsage.memory < 0.8) conditions.push('adequate_memory');
    if (avgResourceUsage.network < 0.6) conditions.push('low_network_load');

    return conditions;
  }

  private identifyCommonFailures(traces: ExecutionTrace[]): string[] {
    const failures: string[] = [];

    if (traces.length === 0) return failures;

    // Analyze failure patterns
    const errorTypes = new Map<string, number>();

    for (const trace of traces) {
      if (trace.result?.error) {
        const errorType = this.classifyError(trace.result.error);
        errorTypes.set(errorType, (errorTypes.get(errorType) || 0) + 1);
      }
    }

    // Return most common failures
    return Array.from(errorTypes.entries())
      .filter(([, count]) => count >= Math.max(2, traces.length * 0.3))
      .map(([type]) => type);
  }

  // Rename method to avoid duplication with calculateStabilityFromData
  private calculateStability(data: ExecutionData[]): number {
    return this.calculateStabilityFromData(data);
  }
}