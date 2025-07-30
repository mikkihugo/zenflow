/**
 * AI Providers Types
 * Re-export and extend the existing provider types with additional functionality
 */

// Re-export all existing provider types
export * from '../providers/types.js';

// Import the existing types to extend them
import { 
  AIProvider as BaseAIProvider, 
  AIRequest as BaseAIRequest,
  AIResponse as BaseAIResponse,
  ProviderMetrics as BaseProviderMetrics
} from '../providers/types.js';
import { Identifiable, JSONObject } from './core.js';

// =============================================================================
// EXTENDED PROVIDER TYPES
// =============================================================================

export interface ExtendedAIProvider extends BaseAIProvider, Identifiable {
  // Enhanced capabilities
  enhancedCapabilities: {
    // Advanced features
    multimodal: boolean;
    reasoning: boolean;
    toolUsing: boolean;
    codeGeneration: boolean;
    mathSolving: boolean;
    
    // Performance characteristics
    maxContextWindow: number;
    recommendedBatchSize: number;
    optimalTemperature: number;
    
    // Specialized domains
    domains: ProviderDomain[];
    
    // Quality metrics
    qualityScores: QualityScores;
  };
  
  // Provider health and status
  health: ProviderHealth;
  
  // Usage analytics
  analytics: ProviderAnalytics;
  
  // Configuration
  configuration: ProviderConfiguration;
  
  // Integration status
  integration: IntegrationStatus;
}

export interface ProviderDomain {
  name: string;
  description: string;
  proficiency: number; // 0-1
  examples: string[];
  benchmarkScores: Record<string, number>;
}

export interface QualityScores {
  // General quality metrics
  accuracy: number; // 0-1
  coherence: number; // 0-1
  relevance: number; // 0-1
  creativity: number; // 0-1
  factualness: number; // 0-1
  
  // Technical metrics
  codeQuality: number; // 0-1
  reasoningDepth: number; // 0-1
  problemSolving: number; // 0-1
  
  // Language metrics
  fluency: number; // 0-1
  grammarAccuracy: number; // 0-1
  styleConsistency: number; // 0-1
  
  // Specialized metrics
  mathAccuracy: number; // 0-1
  scientificAccuracy: number; // 0-1
  ethicalReasoning: number; // 0-1
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  lastCheck: Date;
  
  // Health indicators
  indicators: {
    availability: number; // 0-1
    responseTime: number; // milliseconds
    errorRate: number; // 0-1
    throughput: number; // requests per second
    qualityScore: number; // 0-1
  };
  
  // Issues and alerts
  issues: HealthIssue[];
  alerts: HealthAlert[];
  
  // Historical data
  healthHistory: HealthSnapshot[];
  
  // Maintenance information
  maintenance: MaintenanceInfo;
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'availability' | 'quality' | 'security' | 'cost';
  description: string;
  impact: string;
  recommendation: string;
  detectedAt: Date;
  resolvedAt?: Date;
  autoResolvable: boolean;
}

export interface HealthAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'prediction';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Alert details
  metric: string;
  threshold?: number;
  actualValue: number;
  duration: number; // milliseconds
  
  // Actions taken
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'notification' | 'scaling' | 'failover' | 'throttling' | 'restart';
  executedAt: Date;
  result: 'success' | 'failure' | 'partial';
  details: JSONObject;
}

export interface HealthSnapshot {
  timestamp: Date;
  status: string;
  indicators: JSONObject;
  issues: number;
  alerts: number;
}

export interface MaintenanceInfo {
  scheduled: boolean;
  nextMaintenance?: Date;
  maintenanceWindow: {
    start: string; // Time format: HH:MM
    end: string;   // Time format: HH:MM
    timezone: string;
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  
  // Impact assessment
  impact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
  
  // Communication
  notifications: boolean;
  contactEmail: string;
}

export interface ProviderAnalytics {
  // Usage patterns
  usage: {
    totalRequests: number;
    totalTokens: number;
    averageRequestSize: number; // tokens
    averageResponseSize: number; // tokens
    peakUsageTime: Date;
    usageDistribution: UsageDistribution;
  };
  
  // Performance analytics
  performance: {
    averageLatency: number; // milliseconds
    p95Latency: number; // milliseconds
    p99Latency: number; // milliseconds
    throughputTrend: TrendData;
    qualityTrend: TrendData;
  };
  
  // Cost analytics
  cost: {
    totalCost: number;
    costPerRequest: number;
    costPerToken: number;
    costTrend: TrendData;
    budgetUtilization: number; // 0-1
    projectedMonthlyCost: number;
  };
  
  // User analytics
  users: {
    totalUsers: number;
    activeUsers: number;
    topUsers: UserUsage[];
    userSatisfaction: number; // 0-1
  };
  
  // Error analytics
  errors: {
    totalErrors: number;
    errorRate: number; // 0-1
    errorTypes: Record<string, number>;
    errorTrend: TrendData;
    resolutionTime: number; // milliseconds
  };
  
  // Quality analytics
  quality: {
    averageQuality: number; // 0-1
    qualityDistribution: QualityDistribution;
    qualityByDomain: Record<string, number>;
    userFeedback: FeedbackSummary;
  };
  
  // Time-based analytics
  timeRange: {
    start: Date;
    end: Date;
  };
  
  // Comparative analytics
  benchmarks: {
    industryAverage: BenchmarkComparison;
    competitorComparison: BenchmarkComparison;
    historicalComparison: BenchmarkComparison;
  };
}

export interface UsageDistribution {
  byHour: Record<string, number>;
  byDay: Record<string, number>;
  byWeek: Record<string, number>;
  byMonth: Record<string, number>;
  byRegion: Record<string, number>;
  byUserType: Record<string, number>;
  byUseCase: Record<string, number>;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number; // percentage
  trend: 'increasing' | 'decreasing' | 'stable';
  prediction: number[]; // next 7 values
  confidence: number; // 0-1
}

export interface UserUsage {
  userId: string;
  requests: number;
  tokens: number;
  cost: number;
  averageQuality: number; // 0-1
  satisfaction: number; // 0-1
}

export interface QualityDistribution {
  excellent: number; // 0.9-1.0
  good: number;      // 0.7-0.9
  fair: number;      // 0.5-0.7
  poor: number;      // 0.3-0.5
  veryPoor: number;  // 0.0-0.3
}

export interface FeedbackSummary {
  totalFeedback: number;
  averageRating: number; // 1-5
  ratingDistribution: Record<number, number>;
  positivePercentage: number; // 0-1
  negativePercentage: number; // 0-1
  
  // Sentiment analysis
  sentiment: {
    positive: number; // 0-1
    neutral: number;  // 0-1
    negative: number; // 0-1
  };
  
  // Common themes
  themes: {
    praise: string[];
    complaints: string[];
    suggestions: string[];
  };
}

export interface BenchmarkComparison {
  latency: {
    current: number;
    benchmark: number;
    percentile: number; // 0-100
  };
  
  quality: {
    current: number;
    benchmark: number;
    percentile: number; // 0-100
  };
  
  cost: {
    current: number;
    benchmark: number;
    percentile: number; // 0-100
  };
  
  reliability: {
    current: number;
    benchmark: number;
    percentile: number; // 0-100
  };
}

export interface ProviderConfiguration {
  // Model selection
  preferredModels: string[];
  fallbackModels: string[];
  modelSelection: ModelSelectionStrategy;
  
  // Request optimization
  optimization: {
    enableCaching: boolean;
    cacheStrategy: 'aggressive' | 'conservative' | 'adaptive';
    batchingEnabled: boolean;
    maxBatchSize: number;
    batchTimeout: number; // milliseconds
    
    // Response optimization
    streamingEnabled: boolean;
    compressionEnabled: boolean;
    adaptiveTimeout: boolean;
  };
  
  // Quality control
  qualityControl: {
    minimumQuality: number; // 0-1
    qualityChecks: QualityCheck[];
    fallbackOnLowQuality: boolean;
    retryOnLowQuality: boolean;
    maxQualityRetries: number;
  };
  
  // Cost management
  costManagement: {
    dailyBudget?: number;
    monthlyBudget?: number;
    costAlerts: CostAlert[];
    budgetExceededAction: 'stop' | 'throttle' | 'fallback' | 'continue';
    
    // Cost optimization
    costOptimization: boolean;
    preferCheaperModels: boolean;
    dynamicModelSelection: boolean;
  };
  
  // Security settings
  security: {
    dataRetention: number; // days
    dataEncryption: boolean;
    auditLogging: boolean;
    sensitiveDataFiltering: boolean;
    
    // Access control
    allowedUsers: string[];
    allowedDomains: string[];
    ipWhitelist: string[];
  };
  
  // Advanced features
  advanced: {
    experimentalFeatures: boolean;
    betaModels: boolean;
    customInstructions: string;
    systemPrompts: Record<string, string>;
    
    // Integration settings
    webhooks: WebhookConfig[];
    callbacks: CallbackConfig[];
  };
}

export interface ModelSelectionStrategy {
  strategy: 'performance' | 'cost' | 'quality' | 'balanced' | 'custom';
  
  // Weights for balanced strategy
  weights?: {
    performance: number; // 0-1
    cost: number;        // 0-1
    quality: number;     // 0-1
  };
  
  // Custom strategy function
  customFunction?: string;
  
  // Context-aware selection
  contextAware: boolean;
  contextFactors: string[];
  
  // A/B testing
  abTesting: {
    enabled: boolean;
    trafficSplit: Record<string, number>; // model -> percentage
    metrics: string[];
  };
}

export interface QualityCheck {
  name: string;
  type: 'coherence' | 'relevance' | 'factuality' | 'safety' | 'custom';
  threshold: number; // 0-1
  enabled: boolean;
  
  // Custom check configuration
  config?: JSONObject;
  
  // Failure handling
  onFailure: 'reject' | 'retry' | 'fallback' | 'accept_with_warning';
}

export interface CostAlert {
  type: 'daily' | 'monthly' | 'total';
  threshold: number; // dollar amount or percentage
  recipients: string[];
  
  // Alert frequency
  frequency: 'immediate' | 'hourly' | 'daily';
  
  // Escalation
  escalation?: {
    threshold: number;
    recipients: string[];
    actions: string[];
  };
}

export interface WebhookConfig {
  name: string;
  url: string;
  events: string[];
  
  // Security
  secret?: string;
  headers?: Record<string, string>;
  
  // Retry configuration
  retries: number;
  retryDelay: number; // milliseconds
  
  // Filtering
  filters?: Record<string, any>;
}

export interface CallbackConfig {
  name: string;
  function: string;
  events: string[];
  
  // Execution context
  timeout: number; // milliseconds
  retries: number;
  
  // Error handling
  onError: 'ignore' | 'log' | 'alert' | 'stop';
}

export interface IntegrationStatus {
  // Connection status
  connected: boolean;
  lastConnection: Date;
  connectionAttempts: number;
  
  // Authentication status
  authenticated: boolean;
  tokenExpiry?: Date;
  lastAuthentication: Date;
  
  // API compatibility
  apiVersion: string;
  compatibilityLevel: 'full' | 'partial' | 'limited' | 'deprecated';
  deprecationWarnings: string[];
  
  // Feature support
  supportedFeatures: string[];
  unsupportedFeatures: string[];
  experimentalFeatures: string[];
  
  // Integration health
  integrationHealth: {
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    recommendations: string[];
  };
  
  // Synchronization status
  synchronization: {
    lastSync: Date;
    syncStatus: 'up-to-date' | 'pending' | 'failed' | 'in-progress';
    pendingUpdates: number;
    conflicts: number;
  };
  
  // Version information
  providerVersion: string;
  clientVersion: string;
  protocolVersion: string;
  
  // Monitoring and diagnostics
  diagnostics: {
    latencyTests: LatencyTest[];
    throughputTests: ThroughputTest[];
    qualityTests: QualityTest[];
    
    // Last diagnostic run
    lastDiagnostic: Date;
    nextDiagnostic: Date;
    
    // Overall health score
    healthScore: number; // 0-1
  };
}

export interface LatencyTest {
  timestamp: Date;
  requestType: string;
  latency: number; // milliseconds
  status: 'pass' | 'fail' | 'warning';
  threshold: number; // milliseconds
}

export interface ThroughputTest {
  timestamp: Date;
  duration: number; // milliseconds
  requestCount: number;
  throughput: number; // requests per second
  status: 'pass' | 'fail' | 'warning';
  threshold: number; // requests per second
}

export interface QualityTest {
  timestamp: Date;
  testType: string;
  qualityScore: number; // 0-1
  status: 'pass' | 'fail' | 'warning';
  threshold: number; // 0-1
  sampleSize: number;
}

// =============================================================================
// ENHANCED REQUEST/RESPONSE TYPES
// =============================================================================

export interface ExtendedAIRequest extends BaseAIRequest {
  // Enhanced request features
  context: {
    // Session context
    sessionId?: string;
    conversationId?: string;
    userId?: string;
    
    // Business context
    domain?: string;
    useCase?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    
    // Quality requirements
    qualityRequirements?: {
      minimumQuality: number; // 0-1
      factualityRequired: boolean;
      creativityPreferred: boolean;
      consistencyRequired: boolean;
    };
    
    // Performance requirements
    performanceRequirements?: {
      maxLatency: number; // milliseconds
      maxCost: number;
      realtime: boolean;
    };
  };
  
  // Advanced options
  advanced: {
    // Multi-provider settings
    providers?: string[];
    providerWeights?: Record<string, number>;
    fallbackProviders?: string[];
    
    // Response processing
    postProcessing?: string[];
    validation?: string[];
    filtering?: string[];
    
    // Caching
    caching?: {
      enabled: boolean;
      ttl?: number; // seconds
      key?: string;
      tags?: string[];
    };
    
    // A/B testing
    experiment?: {
      experimentId: string;
      variant: string;
      control: boolean;
    };
  };
  
  // Tracing and observability
  tracing: {
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
    baggage?: Record<string, string>;
  };
}

export interface ExtendedAIResponse extends BaseAIResponse {
  // Enhanced response data
  enhanced: {
    // Quality metrics
    quality: {
      overall: number; // 0-1
      coherence: number; // 0-1
      relevance: number; // 0-1
      factuality: number; // 0-1
      creativity: number; // 0-1
    };
    
    // Processing information
    processing: {
      actualProvider: string;
      model: string;
      version: string;
      
      // Multi-provider details
      providersAttempted: string[];
      fallbackUsed: boolean;
      retryCount: number;
      
      // Performance breakdown
      preprocessing: number; // milliseconds
      inference: number; // milliseconds
      postprocessing: number; // milliseconds
      networking: number; // milliseconds
    };
    
    // Analysis results
    analysis: {
      sentiment?: 'positive' | 'neutral' | 'negative';
      topics?: string[];
      entities?: Entity[];
      intent?: string;
      confidence?: number; // 0-1
      
      // Safety analysis
      safety?: {
        safe: boolean;
        categories: string[];
        scores: Record<string, number>;
      };
    };
    
    // Recommendations
    recommendations: {
      // Follow-up suggestions
      followUp?: string[];
      
      // Related topics
      related?: string[];
      
      // Improvement suggestions
      improvements?: string[];
      
      // Alternative approaches
      alternatives?: string[];
    };
    
    // Caching information
    caching: {
      hit: boolean;
      key?: string;
      ttl?: number; // seconds
      createdAt?: Date;
      tags?: string[];
    };
  };
  
  // Tracing and observability
  tracing: {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    
    // Timing breakdown
    spans: TracingSpan[];
    
    // Resource usage
    resources: {
      cpu: number; // milliseconds
      memory: number; // MB
      network: number; // bytes
    };
  };
  
  // Billing information
  billing: {
    cost: number;
    currency: string;
    breakdown: {
      inputCost: number;
      outputCost: number;
      processingCost: number;
      additionalCosts: Record<string, number>;
    };
    
    // Usage tracking
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      characterCount: number;
      
      // Provider-specific usage
      providerUsage: Record<string, any>;
    };
  };
}

export interface Entity {
  text: string;
  type: string;
  confidence: number; // 0-1
  start: number;
  end: number;
  
  // Additional properties
  properties?: Record<string, any>;
  
  // Linked entities
  linkedEntities?: LinkedEntity[];
}

export interface LinkedEntity {
  id: string;
  source: string;
  confidence: number; // 0-1
  url?: string;
  description?: string;
}

export interface TracingSpan {
  spanId: string;
  operationName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  
  // Span details
  tags: Record<string, string>;
  logs: TracingLog[];
  
  // Relationships
  parentSpanId?: string;
  childSpans: string[];
}

export interface TracingLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, any>;
}

// =============================================================================
// ENHANCED METRICS TYPES
// =============================================================================

export interface ExtendedProviderMetrics extends BaseProviderMetrics {
  // Enhanced metrics
  enhanced: {
    // Quality metrics over time
    qualityMetrics: {
      timeline: QualityTimelinePoint[];
      trends: QualityTrends;
      distribution: QualityDistribution;
      
      // Quality by different dimensions
      byDomain: Record<string, number>;
      byUseCase: Record<string, number>;
      byUser: Record<string, number>;
      byModel: Record<string, number>;
    };
    
    // Cost metrics
    costMetrics: {
      totalCost: number;
      costPerRequest: number;
      costPerToken: number;
      costTrend: TrendData;
      
      // Cost breakdown
      breakdown: {
        compute: number;
        storage: number;
        bandwidth: number;
        api: number;
        other: number;
      };
      
      // Cost optimization opportunities
      optimization: {
        potentialSavings: number;
        recommendations: string[];
      };
    };
    
    // User experience metrics
    userExperience: {
      satisfaction: number; // 0-1
      nps: number; // Net Promoter Score
      csat: number; // Customer Satisfaction Score
      
      // Experience breakdown
      usability: number; // 0-1
      reliability: number; // 0-1
      performance: number; // 0-1
      
      // User feedback
      feedback: {
        total: number;
        positive: number;
        negative: number;
        neutral: number;
      };
    };
    
    // Business impact metrics
    businessImpact: {
      // Productivity metrics
      timesSaved: number; // hours
      tasksAutomated: number;
      efficiencyGain: number; // percentage
      
      // Value metrics
      businessValue: number; // dollar amount
      roi: number; // return on investment
      
      // Adoption metrics
      userAdoption: number; // percentage
      featureUtilization: Record<string, number>;
    };
    
    // Competitive analysis
    competitive: {
      marketPosition: number; // 1-10
      competitorComparison: CompetitorComparison[];
      
      // Differentiation factors
      advantages: string[];
      disadvantages: string[];
      
      // Market trends
      marketTrends: MarketTrend[];
    };
  };
  
  // Predictive analytics
  predictions: {
    // Usage predictions
    usageForecast: ForecastPoint[];
    capacityNeeds: CapacityForecast[];
    
    // Performance predictions
    performanceForecast: PerformanceForecast[];
    
    // Cost predictions
    costForecast: CostForecast[];
    
    // Quality predictions
    qualityForecast: QualityForecast[];
    
    // Confidence intervals
    confidenceLevel: number; // 0-1
    forecastHorizon: number; // days
  };
  
  // Anomaly detection
  anomalies: {
    detected: Anomaly[];
    patterns: AnomalyPattern[];
    
    // Detection settings
    sensitivity: number; // 0-1
    threshold: number;
    
    // Resolution tracking
    resolved: number;
    falsePositives: number;
    actionsTaken: string[];
  };
}

export interface QualityTimelinePoint {
  timestamp: Date;
  overall: number; // 0-1
  coherence: number; // 0-1
  relevance: number; // 0-1
  factuality: number; // 0-1
  creativity: number; // 0-1
  sampleSize: number;
}

export interface QualityTrends {
  overall: TrendData;
  coherence: TrendData;
  relevance: TrendData;
  factuality: TrendData;
  creativity: TrendData;
}

export interface CompetitorComparison {
  competitor: string;
  metrics: {
    performance: number; // relative score
    cost: number; // relative score
    quality: number; // relative score
    features: number; // relative score
  };
  
  // Detailed comparison
  strengths: string[];
  weaknesses: string[];
  marketShare: number; // 0-1
}

export interface MarketTrend {
  trend: string;
  direction: 'up' | 'down' | 'stable';
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  description: string;
  
  // Timeline
  detectedAt: Date;
  expectedDuration: number; // months
}

export interface ForecastPoint {
  timestamp: Date;
  value: number;
  confidence: number; // 0-1
  
  // Confidence interval
  lower: number;
  upper: number;
}

export interface CapacityForecast {
  resource: string;
  current: number;
  forecast: ForecastPoint[];
  
  // Capacity planning
  recommendedCapacity: number;
  scalingTriggers: ScalingTrigger[];
}

export interface ScalingTrigger {
  metric: string;
  threshold: number;
  action: 'scale_up' | 'scale_down' | 'alert';
  confidence: number; // 0-1
}

export interface PerformanceForecast {
  metric: string;
  forecast: ForecastPoint[];
  
  // Performance targets
  target: number;
  sla: number;
  
  // Risk assessment
  riskOfSLABreach: number; // 0-1
  mitigationStrategies: string[];
}

export interface CostForecast {
  totalCost: ForecastPoint[];
  costPerRequest: ForecastPoint[];
  
  // Budget tracking
  budget?: number;
  budgetUtilization: number; // 0-1
  projectedOverrun: number;
  
  // Cost optimization
  optimizationOpportunities: CostOptimization[];
}

export interface CostOptimization {
  opportunity: string;
  potentialSavings: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeline: number; // days
}

export interface QualityForecast {
  overall: ForecastPoint[];
  byDimension: Record<string, ForecastPoint[]>;
  
  // Quality targets
  target: number; // 0-1
  minimumAcceptable: number; // 0-1
  
  // Risk assessment
  riskOfQualityDegradation: number; // 0-1
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  metric: string;
  value: number;
  expected: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Anomaly details
  type: 'spike' | 'drop' | 'trend' | 'pattern';
  confidence: number; // 0-1
  description: string;
  
  // Impact assessment
  impact: {
    users: number;
    requests: number;
    cost: number;
    quality: number; // 0-1
  };
  
  // Resolution
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  resolution?: string;
  resolvedAt?: Date;
  actionsTaken: string[];
}

export interface AnomalyPattern {
  pattern: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Pattern details
  triggers: string[];
  conditions: string[];
  
  // Historical data
  occurrences: number;
  lastOccurrence: Date;
  
  // Prevention
  prevention: string[];
  monitoring: string[];
}