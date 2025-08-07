/**
 * SPARC Performance Metrics Type Definitions
 *
 * Performance tracking and optimization types for SPARC methodology
 */

export interface SPARCPerformanceMetrics {
  phaseMetrics: PhasePerformanceMetrics;
  overallMetrics: OverallPerformanceMetrics;
  resourceUsage: ResourceUsageMetrics;
  qualityMetrics: QualityMetrics;
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface PhasePerformanceMetrics {
  specification: PhaseMetrics;
  pseudocode: PhaseMetrics;
  architecture: PhaseMetrics;
  refinement: PhaseMetrics;
  completion: PhaseMetrics;
}

export interface PhaseMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  tokensUsed: number;
  iterationsCount: number;
  errorCount: number;
  qualityScore: number;
  efficiency: number;
  throughput: number;
}

export interface OverallPerformanceMetrics {
  totalDuration: number;
  totalTokensUsed: number;
  averageQualityScore: number;
  completionRate: number;
  errorRate: number;
  efficiencyRating: PerformanceRating;
  bottlenecks: BottleneckAnalysis[];
}

export interface ResourceUsageMetrics {
  cpuUtilization: number;
  memoryUsage: MemoryUsageDetails;
  networkIO: NetworkIOMetrics;
  diskIO: DiskIOMetrics;
  concurrentOperations: number;
  queueLength: number;
}

export interface MemoryUsageDetails {
  heapUsed: number;
  heapTotal: number;
  external: number;
  buffers: number;
  peakUsage: number;
  gcFrequency: number;
}

export interface NetworkIOMetrics {
  requestCount: number;
  responseTime: number;
  bandwidth: number;
  errorRate: number;
  timeouts: number;
}

export interface DiskIOMetrics {
  readOperations: number;
  writeOperations: number;
  readThroughput: number;
  writeThroughput: number;
  iops: number;
}

export interface QualityMetrics {
  codeQuality: CodeQualityMetrics;
  testCoverage: number;
  documentation: DocumentationMetrics;
  maintainability: MaintainabilityMetrics;
  reliability: ReliabilityMetrics;
}

export interface CodeQualityMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  duplicationRatio: number;
  technicalDebt: number;
  codeSmells: CodeSmell[];
  securityVulnerabilities: SecurityVulnerability[];
}

export interface DocumentationMetrics {
  coveragePercentage: number;
  qualityScore: number;
  outdatedSections: string[];
  missingDocumentation: string[];
}

export interface MaintainabilityMetrics {
  maintainabilityIndex: number;
  changeFrequency: number;
  bugFixRate: number;
  refactoringNeeded: boolean;
}

export interface ReliabilityMetrics {
  uptime: number;
  errorRate: number;
  recoveryTime: number;
  failurePoints: FailurePoint[];
}

export interface OptimizationSuggestion {
  type: OptimizationType;
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedImpact: number;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
}

export interface BottleneckAnalysis {
  location: string;
  type: BottleneckType;
  impact: number;
  recommendations: string[];
  relatedMetrics: string[];
}

export interface CodeSmell {
  type: string;
  location: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  suggestion: string;
}

export interface SecurityVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  mitigation: string;
}

export interface FailurePoint {
  component: string;
  failureRate: number;
  impact: string;
  mitigation: string;
}

export type PerformanceRating = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export type OptimizationType =
  | 'performance'
  | 'memory'
  | 'network'
  | 'algorithm'
  | 'architecture'
  | 'caching'
  | 'database'
  | 'parallelization';

export type BottleneckType =
  | 'cpu'
  | 'memory'
  | 'network'
  | 'disk'
  | 'algorithm'
  | 'database'
  | 'external_api'
  | 'concurrency';

export interface PerformanceThresholds {
  maxDuration: number;
  maxTokenUsage: number;
  minQualityScore: number;
  maxErrorRate: number;
  maxMemoryUsage: number;
  minEfficiency: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
  message: string;
  acknowledged: boolean;
}

export interface SPARCBenchmarkResult {
  benchmarkId: string;
  testName: string;
  metrics: SPARCPerformanceMetrics;
  comparison: BenchmarkComparison;
  timestamp: number;
}

export interface BenchmarkComparison {
  baseline: SPARCPerformanceMetrics;
  current: SPARCPerformanceMetrics;
  improvement: number;
  regression: number;
  significantChanges: string[];
}

export interface PerformanceReport {
  summary: PerformanceSummary;
  detailedMetrics: SPARCPerformanceMetrics;
  trends: PerformanceTrends;
  recommendations: OptimizationSuggestion[];
  alerts: PerformanceAlert[];
}

export interface PerformanceSummary {
  overallRating: PerformanceRating;
  keyMetrics: Record<string, number>;
  improvements: string[];
  concerns: string[];
}

export interface PerformanceTrends {
  duration: TrendData;
  quality: TrendData;
  efficiency: TrendData;
  errors: TrendData;
}

export interface TrendData {
  current: number;
  previous: number;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  dataPoints: number[];
}
