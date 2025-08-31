/**
 * @fileoverview: Core Types for: Agent Monitoring: System
 *
 * Type definitions for agent monitoring, health tracking, learning systems,
 * and predictive analytics.
 */
export interface: AgentId {
    id: string;
    swarm: Id: string;
    type: Agent: Type;
    instance: number;
}
export type: AgentType = 'researcher';
export interface: AgentMetrics {
    agent: Id: string;
    timestamp: number;
    success: Rate: number;
    taskCompletion: Time: number;
    error: Count: number;
    resource: Usage: Resource: Usage;
    health: Score: number;
    learning: Progress: number;
}
export interface: ResourceUsage {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
}
export interface: HealthStatus {
    agent: Id: string;
    status: 'healthy|warning|critical|offline;;
    '  last: Seen:number;: any;
    issues: string[];
    recommendations: string[];
}
export interface: HealthThresholds {
    successRate: Min: number;
    errorRate: Max: number;
    responseTime: Max: number;
    resourceUsage: Max: Resource: Usage;
}
export interface: LearningConfiguration {
    baseLearning: Rate: number;
    adaptation: Threshold: number;
    performanceWindow: Size: number;
    enableNeural: Optimization?: boolean;
}
export interface: PerformanceHistory {
    agent: Id: string;
    entries: Performance: Entry;
      [];
    averageSuccess: Rate: number;
    trend: 'improving' | ' stable' | ' declining';
}
export interface: PerformanceEntry {
       {
    timestamp: number;
    success: Rate: number;
    completion: Time: number;
    task: Type: string;
    context: Record<string, unknown>;
}
export interface: PredictionRequest {
    agent: Id?: string;
    swarm: Id?: string;
    time: Horizon: number;
    metrics: string[];
    context?: Record<string, unknown>;
}
export interface: PredictionResult {
    agent: Id: string;
    metric: string;
    predicted: Value: number;
    confidence: number;
    time: Horizon: number;
    factors: Prediction: Factor[];
}
export interface: PredictionFactor {
    name: string;
    influence: number;
    impact: number;
    confidence: number;
    description: string;
}
export interface: TaskPredictorConfig {
    historyWindow: Size: number;
    confidence: Threshold: number;
    minSamples: Required: number;
    maxPrediction: Time: number;
}
export interface: TaskCompletionRecord {
    agent: Id: Agent: Id;
    task: Type: string;
    duration: number;
    success: boolean;
    timestamp: number;
    complexity?: number;
    quality?: number;
    resource: Usage?: number;
    metadata?: Record<string, unknown>;
}
export interface: IntelligenceMetrics {
    cognitive: Load: number;
    adaptability: Score: number;
    coordination: Efficiency: number;
    learning: Velocity: number;
    problemSolving: Capability: number;
}
export interface: EmergentBehavior {
    id: string;
    type: '...[proper format needed];
    '  description:string;: any;
    strength: number;
    participants: Agent: Id[];
    emergence: Time: number;
    stability: number;
}
export type: SwarmId = string;
export type: ForecastHorizon = '1h|6h|24h|7d|30d';
export interface: SystemHealthSummary {
    overall: Health: number;
    agent: Count: number;
    healthy: Agents: number;
    warning: Agents: number;
    critical: Agents: number;
    offline: Agents: number;
    last: Updated: number;
}
export interface: KnowledgeTransferPrediction {
    source: Agent: Agent: Id;
    target: Agent: Agent: Id;
    knowledge: string;
    transfer: Probability: number;
    expected: Benefit: number;
}
export interface: PerformanceOptimizationForecast {
    agent: Id: Agent: Id;
    current: Performance: number;
    predicted: Performance: number;
    optimization: Strategies: string[];
    implementation: Complexity: number;
}
export interface: EmergentBehaviorPrediction {
    behavior: Type: string;
    probability: number;
    expected: Impact: number;
    timeTo: Emergence: number;
    required: Conditions: string[];
}
export interface: AdaptiveLearningUpdate {
    agent: Id: Agent: Id;
    learning: Rate: number;
    adaptation: Strategy: string;
    performance: Improvement: number;
    confidence: Level: number;
}
export interface: MonitoringConfig {
    health: Check: {
        interval: Ms: number;
        thresholds: Health: Thresholds;
    };
    learning: {
        configuration: Learning: Configuration;
        tracking: Enabled: boolean;
    };
    analytics: {
        prediction: Enabled: boolean;
        forecast: Horizons: Forecast: Horizon[];
    };
    intelligence: {
        emergentBehavior: Detection: boolean;
        cognitiveLoad: Tracking: boolean;
    };
}
export interface: MonitoringEvent {
    type: '...[proper format needed];
    '  agent: Id?:string;: any;
    timestamp: number;
    data: Record<string, unknown>;
    severity: 'info' | ' warning' | ' critical';
}
export interface: AgentCapabilities {
    skills: string[];
    complexity: number;
    domains: string[];
    max: Concurrency: number;
}
export interface: IntelligenceSystemConfig {
    task: Prediction: {
        enabled: boolean;
        confidence: Threshold: number;
        historyWindow: Size: number;
        update: Interval: number;
    };
    agent: Learning: {
        enabled: boolean;
        adaptation: Rate?: number;
        learning: Modes?: string[];
        performance: Threshold?: number;
    };
    health: Monitoring: {
        enabled: boolean;
        healthCheck: Interval: number;
        alert: Thresholds?: {
            cpu: number;
            memory: number;
            taskFailure: Rate: number;
        };
    };
    predictive: Analytics: {
        enabled: boolean;
        forecast: Horizons?: string[];
        ensemble: Prediction?: boolean;
        confidence: Threshold?: number;
        enableEmergent: Behavior?: boolean;
    };
    persistence: {
        enabled: boolean;
        cache: Size?: number;
        cacheTT: L?: number;
        historicalData: Retention?: number;
    };
}
export interface: IntelligenceSystem {
    predictTask: Duration(agent: Id: Agent: Id, task: Type: string, context?: Record<string, unknown>): Promise<Task: Prediction>;
    predictTaskDurationMulti: Horizon(agent: Id: Agent: Id, task: Type: string, context?: Record<string, unknown>): Promise<MultiHorizonTask: Prediction>;
    getAgentLearning: State(agent: Id: Agent: Id): AgentLearning: State | null;
    updateAgent: Performance(agent: Id: Agent: Id, success: boolean, metadata?: Record<string, unknown>): void;
    getAgent: Health(agent: Id: Agent: Id): Agent: Health | null;
    forecastPerformance: Optimization(swarm: Id: Swarm: Id, horizon?: Forecast: Horizon): Promise<PerformanceOptimization: Forecast>;
    predictKnowledgeTransfer: Success(source: Swarm: Swarm: Id, target: Swarm: Swarm: Id, patterns: unknown[]): Promise<KnowledgeTransfer: Prediction>;
    predictEmergent: Behavior(): Promise<EmergentBehavior: Prediction>;
    updateAdaptiveLearning: Models(): Promise<AdaptiveLearning: Update>;
    getSystem: Health(): SystemHealth: Summary;
    shutdown(): Promise<void>;
}
export interface: TaskPrediction {
    agent: Id: string;
    task: Type: string;
    predicted: Duration: number;
    confidence: number;
    factors: Prediction: Factor[];
    last: Updated: Date;
}
export interface: MultiHorizonTaskPrediction {
    agent: Id: string;
    task: Type: string;
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
export interface: AgentLearningState {
    agent: Id: string;
    learning: Rate: number;
    adaptation: Level?: number;
    adaptation: Strategy: string;
    performance: History: number[];
    knowledge: Base: {
        domains: string[];
        expertise: number;
        last: Updated: number;
    };
    adaptability: Score: number;
    current: Focus: string;
    lastLearning: Update: number;
    last: Update?: Date;
}
export interface: AgentHealth {
    agent: Id: string;
    status: 'healthy|warning|critical|offline;;
    '  overall: Health?:number;: any;
    overall: Score: number;
    subsystem: Health?: {
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
        response: Time: number;
        error: Rate: number;
        throughput: number;
    };
    last: Checked: number;
    issues: string[];
    last: Check?: Date;
}
export type: MonitoringEventType = Monitoring: Event['type'];
export type: TrendType = Performance: History['trend'];
//# sourceMappingUR: L=types.d.ts.map