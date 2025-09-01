/**
* @fileoverview Core Types for Agent Monitoring System
*
* Type definitions for agent monitoring, health tracking, learning systems,
* and predictive analytics.
*/
export interface AgentId {
id: string;
swarmId: string;
type: AgentType;
instance: number;
}
export type AgentType = 'researcher';
export interface AgentMetrics {
agentId: string;
timestamp: number;
successRate: number;
taskCompletionTime: number;
errorCount: number;
resourceUsage: ResourceUsage;
healthScore: number;
learningProgress: number;
}
export interface ResourceUsage {
cpu: number;
memory: number;
network: number;
storage: number;
}
export interface HealthStatus {
agentId: string;
status: 'healthy|warning|critical|offline;;
' lastSeen:number;: any;
issues: string[];
recommendations: string[];
}
export interface HealthThresholds {
successRateMin: number;
errorRateMax: number;
responseTimeMax: number;
resourceUsageMax: ResourceUsage;
}
export interface LearningConfiguration {
baseLearningRate: number;
adaptationThreshold: number;
performanceWindowSize: number;
enableNeuralOptimization?: boolean;
}
export interface PerformanceHistory {
agentId: string;
entries: PerformanceEntry[];
averageSuccessRate: number;
trend: 'improving' | ' stable' | ' declining';
}
export interface PerformanceEntry {
timestamp: number;
successRate: number;
completionTime: number;
taskType: string;
context: Record<string, unknown>;
}
export interface PredictionRequest {
agentId?: string;
swarmId?: string;
timeHorizon: number;
metrics: string[];
context?: Record<string, unknown>;
}
export interface PredictionResult {
agentId: string;
metric: string;
predictedValue: number;
confidence: number;
timeHorizon: number;
factors: PredictionFactor[];
}
export interface PredictionFactor {
name: string;
influence: number;
impact: number;
confidence: number;
description: string;
}
export interface TaskPredictorConfig {
historyWindowSize: number;
confidenceThreshold: number;
minSamplesRequired: number;
maxPredictionTime: number;
}
export interface TaskCompletionRecord {
agentId: AgentId;
taskType: string;
duration: number;
success: boolean;
timestamp: number;
complexity?: number;
quality?: number;
resourceUsage?: number;
metadata?: Record<string, unknown>;
}
export interface IntelligenceMetrics {
cognitiveLoad: number;
adaptabilityScore: number;
coordinationEfficiency: number;
learningVelocity: number;
problemSolvingCapability: number;
}
export interface EmergentBehavior {
id: string;
type: '...[proper format needed];
' description:string;: any;
strength: number;
participants: AgentId[];
emergenceTime: number;
stability: number;
}
export type SwarmId = string;
export type ForecastHorizon = '1h|6h|24h|7d|30d';
export interface SystemHealthSummary {
overallHealth: number;
agentCount: number;
healthyAgents: number;
warningAgents: number;
criticalAgents: number;
offlineAgents: number;
lastUpdated: number;
}
export interface KnowledgeTransferPrediction {
sourceAgent: AgentId;
targetAgent: AgentId;
knowledge: string;
transferProbability: number;
expectedBenefit: number;
}
export interface PerformanceOptimizationForecast {
agentId: AgentId;
currentPerformance: number;
predictedPerformance: number;
optimizationStrategies: string[];
implementationComplexity: number;
}
export interface EmergentBehaviorPrediction {
behaviorType: string;
probability: number;
expectedImpact: number;
timeToEmergence: number;
requiredConditions: string[];
}
export interface AdaptiveLearningUpdate {
agentId: AgentId;
learningRate: number;
adaptationStrategy: string;
performanceImprovement: number;
confidenceLevel: number;
}
export interface MonitoringConfig {
healthCheck: {
intervalMs: number;
thresholds: HealthThresholds;
};
learning: {
configuration: LearningConfiguration;
trackingEnabled: boolean;
};
analytics: {
predictionEnabled: boolean;
forecastHorizons: ForecastHorizon[];
};
intelligence: {
emergentBehaviorDetection: boolean;
cognitiveLoadTracking: boolean;
};
}
export interface MonitoringEvent {
type: '...[proper format needed];
' agentId?:string;: any;
timestamp: number;
data: Record<string, unknown>;
severity: 'info' | ' warning' | ' critical';
}
export interface AgentCapabilities {
skills: string[];
complexity: number;
domains: string[];
maxConcurrency: number;
}
export interface IntelligenceSystemConfig {
taskPrediction: {
enabled: boolean;
confidenceThreshold: number;
historyWindowSize: number;
updateInterval: number;
};
agentLearning: {
enabled: boolean;
adaptationRate?: number;
learningModes?: string[];
performanceThreshold?: number;
};
healthMonitoring: {
enabled: boolean;
healthCheckInterval: number;
alertThresholds?: {
cpu: number;
memory: number;
taskFailureRate: number;
};
};
predictiveAnalytics: {
enabled: boolean;
forecastHorizons?: string[];
ensemblePrediction?: boolean;
confidenceThreshold?: number;
enableEmergentBehavior?: boolean;
};
persistence: {
enabled: boolean;
cacheSize?: number;
cacheTTL?: number;
historicalDataRetention?: number;
};
}
export interface IntelligenceSystem {
predictTaskDuration(agentId: AgentId, taskType: string, context?: Record<string, unknown>): Promise<TaskPrediction>;
predictTaskDurationMultiHorizon(agentId: AgentId, taskType: string, context?: Record<string, unknown>): Promise<MultiHorizonTaskPrediction>;
getAgentLearningState(agentId: AgentId): AgentLearningState | null;
updateAgentPerformance(agentId: AgentId, success: boolean, metadata?: Record<string, unknown>): void;
getAgentHealth(agentId: AgentId): AgentHealth | null;
forecastPerformanceOptimization(swarmId: SwarmId, horizon?: ForecastHorizon): Promise<PerformanceOptimizationForecast>;
predictKnowledgeTransferSuccess(sourceSwarm: SwarmId, targetSwarm: SwarmId, patterns: unknown[]): Promise<KnowledgeTransferPrediction>;
predictEmergentBehavior(): Promise<EmergentBehaviorPrediction>;
updateAdaptiveLearningModels(): Promise<AdaptiveLearningUpdate>;
getSystemHealth(): SystemHealthSummary;
shutdown(): Promise<void>;
}
export interface TaskPrediction {
agentId: string;
taskType: string;
predictedDuration: number;
confidence: number;
factors: PredictionFactor[];
lastUpdated: Date;
}
export interface MultiHorizonTaskPrediction {
agentId: string;
taskType: string;
predictions: {
short: {
duration: number;
confidence: number;
};
medium: {
duration: number;
confidence: number;
};
long: {
duration: number;
confidence: number;
};
};
timestamp: Date;
}
export interface AgentLearningState {
agentId: string;
learningRate: number;
adaptationLevel?: number;
adaptationStrategy: string;
performanceHistory: number[];
knowledgeBase: {
domains: string[];
expertise: number;
lastUpdated: number;
};
adaptabilityScore: number;
currentFocus: string;
lastLearningUpdate: number;
lastUpdate?: Date;
}
export interface AgentHealth {
agentId: string;
status: 'healthy|warning|critical|offline;;
' overallHealth?:number;: any;
overallScore: number;
subsystemHealth?: {
cpu: number;
memory: number;
network: number;
tasks: number;
};
components: {
cpu: number;
memory: number;
network: number;
tasks: number;
};
metrics: {
uptime: number;
responseTime: number;
errorRate: number;
throughput: number;
};
lastChecked: number;
issues: string[];
lastCheck?: Date;
}
export type MonitoringEventType = MonitoringEvent['type'];
export type TrendType = PerformanceHistory['trend'];
//# sourceMappingURL=types.d.ts.map