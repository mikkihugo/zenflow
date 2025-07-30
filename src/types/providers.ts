/**
 * AI Providers Types;
 * Re-export and extend the existing provider types with additional functionality
 */

// Re-export all existing provider types
export * from '../providers/types.js';

// Import the existing types to extend them
import type { AIProvider as BaseAIProvider } from '../providers/types.js';
import type { Identifiable } from './core.js';

// =============================================================================
// EXTENDED PROVIDER TYPES
// =============================================================================

export interface ExtendedAIProvider extends BaseAIProvider, Identifiable {
  // Enhanced capabilitiesenhancedCapabilities = ============================================================================
// ENHANCED REQUEST/RESPONSE TYPES
// =============================================================================

export interface ExtendedAIRequest extends BaseAIRequest {
  // Enhanced request featurescontext = ============================================================================
// ENHANCED METRICS TYPES
// =============================================================================

export interface ExtendedProviderMetrics extends BaseProviderMetrics {
  // Enhanced metrics
  enhanced: {
    // Quality metrics over time
    qualityMetrics: {
      timeline;
      // trends: QualityTrends
      // distribution: QualityDistribution
      // Quality by different dimensions
      byDomain: Record<string, number>;
      byUseCase: Record<string, number>;
      byUser: Record<string, number>;
      byModel: Record<string, number>;
    };
// Cost metrics
// {
  // totalCost: number
  // costPerRequest: number
  // costPerToken: number
  // costTrend: TrendData
  // compute: number
  // storage: number
  // bandwidth: number
  // api: number
  // other: number
  // potentialSavings: number
  recommendations;
// }
// User experience metrics
// {
  satisfaction: number, // 0-1
  nps: number, // Net Promoter Score
  csat: number, // Customer Satisfaction Score

  // Experience breakdown
  usability: number, // 0-1
  reliability: number, // 0-1
  performance: number, // 0-1
  // total: number
  // positive: number
  // negative: number
  // neutral: number
// }
// Business impact metrics
// {
  // Productivity metrics
  timesSaved: number, // hours
  // tasksAutomated: number
  efficiencyGain: number, // percentage

  // Value metrics
  businessValue: number, // dollar amount
  roi: number, // return on investment

  // Adoption metrics
  userAdoption: number, // percentage
  featureUtilization: Record<string, number>;
// }
// Competitive analysis
// {
  marketPosition: number, // 1-10
  competitorComparison;
  // Differentiation factors
  advantages;
  disadvantages;
  // Market trends
  marketTrends;
// }
// }
// Predictive analytics
// {
  // Usage predictions
  usageForecast;
  capacityNeeds;
  // Performance predictions
  performanceForecast;
  // Cost predictions
  costForecast;
  // Quality predictions
  qualityForecast;
  // Confidence intervals
  confidenceLevel: number, // 0-1
  forecastHorizon: number, // days
// }
// Anomaly detection
// {
  detected;
  patterns;
  // Detection settings
  sensitivity: number, // 0-1
  // threshold: number
  // Resolution tracking
  // resolved: number
  // falsePositives: number
  actionsTaken;
// }
// }
export interface QualityTimelinePoint {
  // timestamp: Date
  overall: number, // 0-1
  coherence: number, // 0-1
  relevance: number, // 0-1
  factuality: number, // 0-1
  creativity: number, // 0-1
  // sampleSize: number
// }
export interface QualityTrends {
  // overall: TrendData
  // coherence: TrendData
  // relevance: TrendData
  // factuality: TrendData
  // creativity: TrendData
// }
export interface CompetitorComparison {
  // competitor: string
  metrics: {
    performance: number, // relative score
    cost: number, // relative score
    quality: number, // relative score
    features: number, // relative score
  };
  // Detailed comparison
  strengths;
  weaknesses;
  marketShare: number, // 0-1
// }
export interface MarketTrend {
  // trend: string
  direction: 'up' | 'down' | 'stable';
  impact: 'low' | 'medium' | 'high';
  confidence: number, // 0-1
  // description: string
  // Timeline
  // detectedAt: Date
  expectedDuration: number, // months
// }
export interface ForecastPoint {
  // timestamp: Date
  // value: number
  confidence: number, // 0-1

  // Confidence interval
  // lower: number
  // upper: number
// }
export interface CapacityForecast {
  // resource: string
  // current: number
  forecast;
  // Capacity planning
  // recommendedCapacity: number
  scalingTriggers;
// }
export interface ScalingTrigger {
  // metric: string
  // threshold: number
  action: 'scale_up' | 'scale_down' | 'alert';
  confidence: number, // 0-1
// }
export interface PerformanceForecast {
  // metric: string
  forecast;
  // Performance targets
  // target: number
  // sla: number
  // Risk assessment
  riskOfSLABreach: number, // 0-1
  mitigationStrategies;
// }
export interface CostForecast {
  totalCost;
  costPerRequest;
  // Budget tracking
  budget?: number;
  budgetUtilization: number, // 0-1
  // projectedOverrun: number
  // Cost optimization
  optimizationOpportunities;
// }
export interface CostOptimization {
  // opportunity: string
  // potentialSavings: number
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeline: number, // days
// }
export interface QualityForecast {
  overall;
  byDimension: Record<string, ForecastPoint[]>;
  // Quality targets
  target: number, // 0-1
  minimumAcceptable: number, // 0-1

  // Risk assessment
  riskOfQualityDegradation: number, // 0-1
// }
export interface Anomaly {
  // id: string
  // timestamp: Date
  // metric: string
  // value: number
  // expected: number
  severity: 'low' | 'medium' | 'high' | 'critical';
// Anomaly details
type: 'spike' | 'drop' | 'trend' | 'pattern';
confidence: number, // 0-1
// description: string
// Impact assessment
// {
  // users: number
  // requests: number
  // cost: number
  quality: number, // 0-1
// }
// Resolution
status: 'open' | 'investigating' | 'resolved' | 'false_positive';
resolution?: string;
resolvedAt?: Date;
actionsTaken;
// }
export interface AnomalyPattern {
  // pattern: string
  // frequency: number
  severity: 'low' | 'medium' | 'high' | 'critical';
  // Pattern details
  triggers;
  conditions;
  // Historical data
  // occurrences: number
  // lastOccurrence: Date
  // Prevention
  prevention;
  monitoring;
// }

