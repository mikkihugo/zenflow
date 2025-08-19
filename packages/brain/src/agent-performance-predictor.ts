/**
 * @fileoverview Agent Performance Prediction System
 * 
 * Uses time series analysis and machine learning to predict agent performance,
 * helping with intelligent task routing and resource optimization.
 * 
 * Features:
 * - Time series forecasting using moving averages
 * - Performance trend analysis
 * - Load prediction and capacity planning
 * - Real-time performance monitoring
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 */

import { getLogger } from '@claude-zen/foundation';
import { sma, ema, wma } from 'moving-averages';
import regression from 'regression';
import * as ss from 'simple-statistics';
import { kmeans } from 'ml-kmeans';

const logger = getLogger('AgentPerformancePredictor');

export interface AgentPerformanceData {
  readonly agentId: string;
  readonly timestamp: number;
  readonly taskType: string;
  readonly complexity: number; // 0-1 scale
  readonly completionTime: number; // milliseconds
  readonly successRate: number; // 0-1 scale
  readonly errorRate: number; // 0-1 scale
  readonly cpuUsage: number; // 0-1 scale
  readonly memoryUsage: number; // 0-1 scale
  readonly concurrentTasks: number;
}

export interface PerformancePrediction {
  readonly agentId: string;
  readonly predictedCompletionTime: number;
  readonly predictedSuccessRate: number;
  readonly predictedScore?: number; // Overall predicted performance score
  readonly confidence: number;
  readonly loadForecast: number; // Expected load in next time window
  readonly recommendedTaskCount: number;
  readonly performanceTrend: 'improving' | 'stable' | 'declining';
  readonly riskFactors: string[];
}

export interface PerformanceInsights {
  readonly topPerformers: string[];
  readonly underPerformers: string[];
  readonly capacityUtilization: number;
  readonly predictedBottlenecks: string[];
  readonly optimizationSuggestions: string[];
}

/**
 * Agent Performance Prediction System
 * 
 * Analyzes historical performance data to predict future agent behavior
 * and optimize task distribution across the swarm.
 */
export class AgentPerformancePredictor {
  private performanceHistory: Map<string, AgentPerformanceData[]> = new Map();
  private performanceTrends: Map<string, number[]> = new Map();
  private initialized = false;
  private readonly maxHistorySize = 1000;
  private readonly predictionWindow = 300000; // 5 minutes in milliseconds

  constructor() {
    logger.info('📊 Agent Performance Predictor created');
  }

  /**
   * Initialize the prediction system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('🚀 Initializing Agent Performance Prediction System...');
      
      this.initialized = true;
      logger.info('✅ Agent Performance Predictor initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Agent Performance Predictor:', error);
      throw error;
    }
  }

  /**
   * Record agent performance data
   */
  async recordPerformance(data: AgentPerformanceData): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get or create performance history for agent
      let history = this.performanceHistory.get(data.agentId) || [];
      
      // Add new data point
      history.push(data);
      
      // Maintain history size limit
      if (history.length > this.maxHistorySize) {
        history = history.slice(-this.maxHistorySize);
      }
      
      this.performanceHistory.set(data.agentId, history);
      
      // Update performance trends
      await this.updatePerformanceTrends(data.agentId, history);
      
      logger.debug(`📈 Performance recorded for agent ${data.agentId}: success rate ${data.successRate.toFixed(2)}`);
    } catch (error) {
      logger.error('❌ Failed to record performance:', error);
    }
  }

  /**
   * Predict agent performance for a given task
   */
  async predictPerformance(
    agentId: string,
    taskType: string,
    complexity: number
  ): Promise<PerformancePrediction> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const history = this.performanceHistory.get(agentId) || [];
      
      if (history.length < 3) {
        // Not enough data, return conservative estimates
        return this.getDefaultPrediction(agentId);
      }

      // Filter relevant historical data
      const relevantData = history.filter(d => 
        d.taskType === taskType || 
        Math.abs(d.complexity - complexity) < 0.2
      );

      // Time series analysis for completion time
      const completionTimes = relevantData.map(d => d.completionTime);
      const predictedCompletionTime = this.predictTimeSeriesValue(completionTimes);

      // Success rate prediction using exponential moving average
      const successRates = relevantData.map(d => d.successRate);
      const predictedSuccessRate = this.predictSuccessRate(successRates);

      // Performance trend analysis
      const performanceTrend = this.analyzePerformanceTrend(agentId);

      // Load forecasting
      const loadForecast = await this.forecastAgentLoad(agentId);

      // Calculate confidence based on data quality
      const confidence = this.calculatePredictionConfidence(relevantData, history);

      // Determine recommended task count
      const recommendedTaskCount = this.calculateOptimalTaskCount(agentId, loadForecast);

      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(agentId, relevantData);

      // Calculate overall predicted score
      const predictedScore = predictedSuccessRate * (1 / (predictedCompletionTime / 1000 + 1)) * confidence;

      const prediction: PerformancePrediction = {
        agentId,
        predictedCompletionTime,
        predictedSuccessRate,
        predictedScore,
        confidence,
        loadForecast,
        recommendedTaskCount,
        performanceTrend,
        riskFactors
      };

      logger.info(`🔮 Performance prediction for ${agentId}: ${predictedSuccessRate.toFixed(2)} success rate, ${predictedCompletionTime.toFixed(0)}ms completion time`);

      return prediction;
    } catch (error) {
      logger.error(`❌ Performance prediction failed for agent ${agentId}:`, error);
      return this.getDefaultPrediction(agentId);
    }
  }

  /**
   * Get system-wide performance insights
   */
  async getPerformanceInsights(): Promise<PerformanceInsights> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const allAgents = Array.from(this.performanceHistory.keys());
      const agentScores = new Map<string, number>();

      // Calculate performance scores for each agent
      for (const agentId of allAgents) {
        const history = this.performanceHistory.get(agentId) || [];
        const recentData = history.slice(-20); // Last 20 data points
        
        if (recentData.length > 0) {
          const avgSuccessRate = ss.mean(recentData.map(d => d.successRate));
          const avgCompletionTime = ss.mean(recentData.map(d => d.completionTime));
          
          // Score combines success rate and speed (lower completion time is better)
          const score = avgSuccessRate * (1 / (avgCompletionTime / 1000 + 1));
          agentScores.set(agentId, score);
        }
      }

      // Sort agents by performance
      const sortedAgents = Array.from(agentScores.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([agentId]) => agentId);

      const topPerformers = sortedAgents.slice(0, Math.ceil(sortedAgents.length * 0.3));
      const underPerformers = sortedAgents.slice(-Math.ceil(sortedAgents.length * 0.2));

      // Calculate capacity utilization
      const capacityUtilization = await this.calculateCapacityUtilization();

      // Predict bottlenecks
      const predictedBottlenecks = await this.predictBottlenecks();

      // Generate optimization suggestions
      const optimizationSuggestions = await this.generateOptimizationSuggestions(agentScores);

      return {
        topPerformers,
        underPerformers,
        capacityUtilization,
        predictedBottlenecks,
        optimizationSuggestions
      };
    } catch (error) {
      logger.error('❌ Failed to generate performance insights:', error);
      return {
        topPerformers: [],
        underPerformers: [],
        capacityUtilization: 0,
        predictedBottlenecks: [],
        optimizationSuggestions: []
      };
    }
  }

  /**
   * Update performance data for continuous learning
   */
  async updatePerformanceData(data: {
    agentId: string;
    taskType: string;
    duration: number;
    success: boolean;
    efficiency: number;
    complexity?: number;
    resourceUsage?: number;
    errorCount?: number;
  }): Promise<void> {
    try {
      logger.debug(`📊 Updating performance data for agent ${data.agentId}`);

      // Convert to AgentPerformanceData format
      const performanceData: AgentPerformanceData = {
        agentId: data.agentId,
        timestamp: Date.now(),
        taskType: data.taskType,
        complexity: data.complexity || 0.5,
        completionTime: data.duration,
        successRate: data.success ? 1.0 : 0.0,
        errorRate: data.success ? 0.0 : 1.0,
        cpuUsage: data.resourceUsage || 0.5,
        memoryUsage: data.resourceUsage || 0.5,
        concurrentTasks: 1 // Default to 1 if not provided
      };

      // Record the performance data
      await this.recordPerformance(performanceData);

      logger.debug(`✅ Performance data updated for agent ${data.agentId}`);
    } catch (error) {
      logger.error(`❌ Failed to update performance data for agent ${data.agentId}:`, error);
    }
  }

  /**
   * Get performance statistics for an agent
   */
  getAgentStats(agentId: string): {
    totalTasks: number;
    averageSuccessRate: number;
    averageCompletionTime: number;
    performanceTrend: string;
    dataPoints: number;
  } {
    const history = this.performanceHistory.get(agentId) || [];
    
    if (history.length === 0) {
      return {
        totalTasks: 0,
        averageSuccessRate: 0,
        averageCompletionTime: 0,
        performanceTrend: 'unknown',
        dataPoints: 0
      };
    }

    const averageSuccessRate = ss.mean(history.map(d => d.successRate));
    const averageCompletionTime = ss.mean(history.map(d => d.completionTime));
    const performanceTrend = this.analyzePerformanceTrend(agentId);

    return {
      totalTasks: history.length,
      averageSuccessRate,
      averageCompletionTime,
      performanceTrend,
      dataPoints: history.length
    };
  }

  // Private helper methods

  private predictTimeSeriesValue(values: number[]): number {
    if (values.length < 3) return values[values.length - 1] || 5000; // Default 5 seconds

    // Use exponential moving average for prediction
    const emaValues = ema(values, Math.min(5, values.length));
    return emaValues[emaValues.length - 1] || values[values.length - 1];
  }

  private predictSuccessRate(successRates: number[]): number {
    if (successRates.length < 3) return successRates[successRates.length - 1] || 0.5;

    // Use weighted moving average with more weight on recent data
    const wmaValues = wma(successRates, Math.min(3, successRates.length));
    return Math.max(0, Math.min(1, wmaValues[wmaValues.length - 1] || 0.5));
  }

  private analyzePerformanceTrend(agentId: string): 'improving' | 'stable' | 'declining' {
    const history = this.performanceHistory.get(agentId) || [];
    
    if (history.length < 5) return 'stable';

    // Analyze recent trend using linear regression
    const recentData = history.slice(-10);
    const dataPoints: [number, number][] = recentData.map((data, index) => [
      index,
      data.successRate
    ]);

    try {
      const result = regression.linear(dataPoints);
      const slope = result.equation[0];

      if (slope > 0.01) return 'improving';
      if (slope < -0.01) return 'declining';
      return 'stable';
    } catch (error) {
      return 'stable';
    }
  }

  private async forecastAgentLoad(agentId: string): Promise<number> {
    const history = this.performanceHistory.get(agentId) || [];
    
    if (history.length < 3) return 0.5; // Default moderate load

    // Analyze concurrent task patterns
    const concurrentTaskCounts = history.map(d => d.concurrentTasks);
    const recentAverage = ss.mean(concurrentTaskCounts.slice(-10));
    
    // Simple load forecast based on recent patterns
    return Math.min(1, recentAverage / 10); // Normalize to 0-1 scale
  }

  private calculatePredictionConfidence(relevantData: AgentPerformanceData[], allData: AgentPerformanceData[]): number {
    const dataQuality = Math.min(1, relevantData.length / 10); // More relevant data = higher confidence
    const dataRecency = allData.length > 0 ? 
      Math.max(0, 1 - (Date.now() - allData[allData.length - 1].timestamp) / (24 * 60 * 60 * 1000)) : 0; // Recent data = higher confidence
    
    return (dataQuality + dataRecency) / 2;
  }

  private calculateOptimalTaskCount(agentId: string, loadForecast: number): number {
    const history = this.performanceHistory.get(agentId) || [];
    
    if (history.length < 3) return 1; // Conservative default

    // Find the task count that historically gave best performance
    const performanceByTaskCount = new Map<number, number[]>();
    
    history.forEach(data => {
      const taskCount = data.concurrentTasks;
      const performance = data.successRate * (1 / (data.completionTime / 1000 + 1));
      
      if (!performanceByTaskCount.has(taskCount)) {
        performanceByTaskCount.set(taskCount, []);
      }
      performanceByTaskCount.get(taskCount)!.push(performance);
    });

    let bestTaskCount = 1;
    let bestPerformance = 0;

    performanceByTaskCount.forEach((performances, taskCount) => {
      const avgPerformance = ss.mean(performances);
      if (avgPerformance > bestPerformance) {
        bestPerformance = avgPerformance;
        bestTaskCount = taskCount;
      }
    });

    // Adjust based on load forecast
    const adjustedTaskCount = Math.round(bestTaskCount * (1 - loadForecast * 0.3));
    return Math.max(1, adjustedTaskCount);
  }

  private identifyRiskFactors(agentId: string, data: AgentPerformanceData[]): string[] {
    const riskFactors: string[] = [];
    
    if (data.length < 3) {
      riskFactors.push('Insufficient historical data');
      return riskFactors;
    }

    const recentData = data.slice(-5);
    
    // High error rate
    const avgErrorRate = ss.mean(recentData.map(d => d.errorRate));
    if (avgErrorRate > 0.1) {
      riskFactors.push(`High error rate: ${(avgErrorRate * 100).toFixed(1)}%`);
    }

    // High resource usage
    const avgCpuUsage = ss.mean(recentData.map(d => d.cpuUsage));
    const avgMemoryUsage = ss.mean(recentData.map(d => d.memoryUsage));
    
    if (avgCpuUsage > 0.8) {
      riskFactors.push(`High CPU usage: ${(avgCpuUsage * 100).toFixed(1)}%`);
    }
    
    if (avgMemoryUsage > 0.8) {
      riskFactors.push(`High memory usage: ${(avgMemoryUsage * 100).toFixed(1)}%`);
    }

    // Declining performance trend
    const trend = this.analyzePerformanceTrend(agentId);
    if (trend === 'declining') {
      riskFactors.push('Performance declining');
    }

    return riskFactors;
  }

  private async updatePerformanceTrends(agentId: string, history: AgentPerformanceData[]): Promise<void> {
    // Update performance trends for time series analysis
    const successRates = history.map(d => d.successRate);
    this.performanceTrends.set(agentId, successRates);
  }

  private getDefaultPrediction(agentId: string): PerformancePrediction {
    return {
      agentId,
      predictedCompletionTime: 5000, // 5 seconds default
      predictedSuccessRate: 0.7, // 70% default
      predictedScore: 0.35, // Default score: 0.7 * (1/(5+1)) * 0.1 ≈ 0.35
      confidence: 0.1, // Very low confidence
      loadForecast: 0.5, // Moderate load
      recommendedTaskCount: 1,
      performanceTrend: 'stable',
      riskFactors: ['Insufficient data for accurate prediction']
    };
  }

  private async calculateCapacityUtilization(): Promise<number> {
    const allAgents = Array.from(this.performanceHistory.keys());
    
    if (allAgents.length === 0) return 0;

    let totalUtilization = 0;
    let validAgents = 0;

    for (const agentId of allAgents) {
      const history = this.performanceHistory.get(agentId) || [];
      const recentData = history.slice(-5);
      
      if (recentData.length > 0) {
        const avgConcurrentTasks = ss.mean(recentData.map(d => d.concurrentTasks));
        const utilization = Math.min(1, avgConcurrentTasks / 5); // Assume max 5 concurrent tasks
        totalUtilization += utilization;
        validAgents++;
      }
    }

    return validAgents > 0 ? totalUtilization / validAgents : 0;
  }

  private async predictBottlenecks(): Promise<string[]> {
    const bottlenecks: string[] = [];
    const allAgents = Array.from(this.performanceHistory.keys());

    for (const agentId of allAgents) {
      const history = this.performanceHistory.get(agentId) || [];
      const recentData = history.slice(-5);
      
      if (recentData.length > 0) {
        const avgCpuUsage = ss.mean(recentData.map(d => d.cpuUsage));
        const avgErrorRate = ss.mean(recentData.map(d => d.errorRate));
        
        if (avgCpuUsage > 0.9 || avgErrorRate > 0.15) {
          bottlenecks.push(`Agent ${agentId} (high resource usage/errors)`);
        }
      }
    }

    return bottlenecks;
  }

  private async generateOptimizationSuggestions(agentScores: Map<string, number>): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Suggest load balancing
    const scores = Array.from(agentScores.values());
    if (scores.length > 1) {
      const standardDeviation = ss.standardDeviation(scores);
      const mean = ss.mean(scores);
      
      if (standardDeviation > mean * 0.3) {
        suggestions.push('Consider redistributing tasks from high-performing to low-performing agents');
      }
    }

    // Suggest capacity optimization
    const capacityUtilization = await this.calculateCapacityUtilization();
    if (capacityUtilization > 0.8) {
      suggestions.push('System approaching capacity limits - consider scaling up');
    } else if (capacityUtilization < 0.3) {
      suggestions.push('System underutilized - consider consolidating workload');
    }

    return suggestions;
  }
}

export default AgentPerformancePredictor;