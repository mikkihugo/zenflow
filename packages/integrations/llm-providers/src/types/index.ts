// LLM Provider Types

export interface ProviderConfig {
  apiKey: string;
  endpoint?: string;
  model?: string;
}

export interface ProviderRoutingContext {
  requestId: string;
  userId?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RoutingStrategy {
  type: 'round-robin' | 'least-loaded' | 'failover';
  config?: Record<string, unknown>;
}

export interface AnalysisRequest {
  text: string;
  type: 'sentiment' | 'summary' | 'classification';
  options?: Record<string, unknown>;
}

export interface AnalysisResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface LLMAnalytics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
}

export interface LLMCallRecord {
  id: string;
  provider: string;
  model: string;
  timestamp: number;
  duration: number;
  status: 'success' | 'error';
}

export interface LLMError {
  code: string;
  message: string;
  provider: string;
  timestamp: number;
}

export interface LLMProviderStats {
  provider: string;
  totalCalls: number;
  successRate: number;
  averageLatency: number;
}

export interface LLMRoutingStats {
  strategy: string;
  routedRequests: number;
  failoverCount: number;
}

export interface LLMSystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  providers: Record<string, 'healthy' | 'degraded' | 'down'>;
  lastCheck: number;
}