/**
 * @fileoverview Type definitions for LLM routing system
 *
 * Core types and interfaces for multi-provider LLM routing, configuration,
 * and statistics tracking. These types support intelligent routing decisions,
 * performance monitoring, and cost optimization across multiple LLM providers.
 */

export interface ProviderConfig {
  name:string;
  displayName:string;
  models:string[];
  defaultModel:string;
  maxContextTokens:number;
  maxOutputTokens:number;
  rateLimits?:{
    requestsPerMinute?:number;
    tokensPerMinute?:number;
    cooldownMinutes?:number;
};
  api?:{
    baseUrl?:string;
    tokenPath?:string; // Path to token file
    headers?:Record<string, string>;
    authType?: 'bearer' | 'api-key' | 'oauth';
};
  features:{
    structuredOutput:boolean;
    fileOperations:boolean;
    codebaseAware:boolean;
    streaming:boolean;
};
  routing:{
    priority:number; // 1 = highest priority
    useForSmallContext:boolean; // < 10K tokens
    useForLargeContext:boolean; // > 10K tokens
    fallbackOrder:number;
};
}

export interface RoutingStrategy {
  SMALL_CONTEXT_THRESHOLD:number;
  LARGE_CONTEXT_THRESHOLD:number;
  STRATEGY: 'smart' | 'fallback' | 'round-robin';
  AUTO_FAILOVER:boolean;
  MAX_RETRIES_PER_PROVIDER:number;
  RULES:{
    smallContext:string[];
    largeContext:string[];
    fileOperations:string[];
    codeAnalysis:string[];
    complexReasoning:string[];
    structuredOutput:string[];
};
}

export interface ProviderRoutingContext {
  contentLength:number;
  requiresFileOps:boolean;
  requiresCodebaseAware:boolean;
  requiresStructuredOutput:boolean;
  taskType: 'analysis' | 'generation' | 'review' | 'custom';
}

export interface AnalysisRequest {
  task:string;
  prompt?:string;
  requiresFileOperations:boolean;
  context?:string;
  metadata?:Record<string, unknown>;
}

export interface AnalysisResult {
  success:boolean;
  provider:string;
  executionTime:number;
  error?:string;
  result?:string;
  metadata?:Record<string, unknown>;
}

export interface LLMCallRecord {
  id:string;
  timestamp:Date;
  requestType: 'analyze' | 'analyzeSmart' | 'analyzeArchitectureAB';
  provider:string;
  model?:string;
  task:string;
  contextLength:number;
  executionTime:number;
  success:boolean;
  error?:string;
  errorDetails?:{
    errorType:
      | 'rate_limit' | 'auth_error' | 'network_error' | 'timeout' | 'quota_exceeded' | 'provider_down' | 'parse_error' | 'other';
    statusCode?:number;
    retryable:boolean;
    providerMessage?:string;
    stackTrace?:string;
};
  tokenUsage?:{
    inputTokens?:number;
    outputTokens?:number;
    totalTokens?:number;
};
  routingDecision:{
    originalPreference:string;
    finalProvider:string;
    fallbackCount:number;
    routingReason:string;
    attemptedProviders:string[];
    failureReasons:Record<string, string>;
};
  performance:{
    responseTime:number;
    throughputScore:number;
    reliability:number;
    costEfficiency:number;
};
  metadata?:{
    requiresFileOps:boolean;
    requiresCodebaseAware:boolean;
    taskComplexity: 'low' | 'medium' | 'high';
    sessionId?:string;
};
}

export interface LLMError {
  id:string;
  timestamp:Date;
  provider:string;
  errorType:
    | 'rate_limit' | 'auth_error' | 'network_error' | 'timeout' | 'quota_exceeded' | 'provider_down' | 'parse_error' | 'other';
  message:string;
  count:number;
  firstOccurred:Date;
  lastOccurred:Date;
  isActive:boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution?:string;
  affectedCalls:number;
}

export interface LLMProviderStats {
  providerId:string;
  displayName:string;
  totalCalls:number;
  successfulCalls:number;
  failedCalls:number;
  averageExecutionTime:number;
  averageContextLength:number;
  totalTokensUsed:number;
  successRate:number;
  averageResponseTime:number;
  costEfficiency:number;
  reliability:number;
  rateLimitHits:number;
  lastUsed:Date | null;
  currentStatus: 'active' | 'cooldown' | 'error' | 'disabled';
  cooldownUntil?:Date;
  preferredForTasks:string[];
  performanceTrend: 'improving' | 'stable' | 'declining';
}

export interface LLMRoutingStats {
  totalRoutingDecisions:number;
  optimalRoutingRate:number;
  fallbackRate:number;
  averageFallbackSteps:number;
  routingEfficiency:number;
  commonRoutingPatterns:Array<{
    pattern:string[];
    frequency:number;
    successRate:number;
}>;
  taskTypeRouting:Record<
    string,
    {
      preferredProvider:string;
      alternativeProviders:string[];
      successRate:number;
}
  >;
}

export interface LLMSystemHealth {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  healthScore:number; // 0-100
  activeProviders:number;
  providersInCooldown:number;
  systemThroughput:number; // calls per minute
  averageLatency:number;
  errorRate:number;
  resourceUtilization:number;
  recommendations:string[];
  alerts:Array<{
    level: 'info' | 'warning' | 'error' | 'critical';
    message:string;
    timestamp:Date;
    provider?:string;
}>;
}

export interface LLMAnalytics {
  timeRange:{
    start:Date;
    end:Date;
};
  summary:{
    totalCalls:number;
    successRate:number;
    averageResponseTime:number;
    totalTokensUsed:number;
    costSavings:number;
};
  providerStats:LLMProviderStats[];
  routingStats:LLMRoutingStats;
  systemHealth:LLMSystemHealth;
  trends:{
    callVolume:Array<{ timestamp: Date; count: number}>;
    successRate:Array<{ timestamp: Date; rate: number}>;
    latency:Array<{ timestamp: Date; ms: number}>;
    providerUsage:Record<string, Array<{ timestamp:Date; usage: number}>>;
};
  insights:{
    topPerformingProvider:string;
    mostEfficientProvider:string;
    bottlenecks:string[];
    optimizationOpportunities:string[];
};
}
