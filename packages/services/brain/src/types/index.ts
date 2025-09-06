// Basic brain types
export interface BrainConfig {
  enabled: boolean;
  learningRate?: number;
  adaptationThreshold?: number;
}

export interface BehavioralPrediction {
  confidence: number;
  recommendations: string[];
  predictedOutcome: 'success' | 'partial' | 'failure';
  riskFactors: string[];
}

export interface TaskComplexityAnalysis {
  complexity: number;
  factors: Record<string, number>;
  recommendations: string[];
}

export interface OptimizationResult {
  optimizedPrompt: string;
  confidence: number;
  improvements: string[];
  metrics: Record<string, number>;
}

export interface SystemMetrics {
  performance: number;
  efficiency: number;
  reliability: number;
  overall: number;
}

export interface OptimizationRecommendation {
  type: 'performance' | 'efficiency' | 'reliability';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: number;
}

export interface MonitoringMetrics {
  timestamp: number;
  metrics: Record<string, number>;
  status: 'healthy' | 'degraded' | 'unhealthy';
}

export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
}