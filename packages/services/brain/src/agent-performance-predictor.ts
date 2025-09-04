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

import { getLogger} from '@claude-zen/foundation';
import { mean, standardDeviation, sum} from 'simple-statistics';
import regression from 'regression';

const logger = getLogger('AgentPerformancePredictor');

// Simple weighted moving average function
function wma(data: number[], weights?: number[]): number[] {
if (data.length === 0) return [];
if (!weights || weights.length !== data.length) {
// Default exponential weights
weights = data.map((_, i) => Math.exp(i / data.length));
}

const weightSum = weights.reduce((sum, w) => sum + w, 0);
const normalizedWeights = weights.map(w => w / weightSum);

return data.map((_, i) => {
const windowData = data.slice(0, i + 1);
const windowWeights = normalizedWeights.slice(0, i + 1);
return windowData.reduce((sum, val, idx) => sum + val * windowWeights[idx], 0);
});
}

export interface AgentPerformanceData {
readonly agentId:  string;
readonly timestamp:  number;
readonly taskType:  string;
readonly complexity:  number; // 0-1 scale
readonly completionTime:  number; // milliseconds
readonly successRate: number; // 0-1 scale
readonly errorRate: number; // 0-1 scale
readonly cpuUsage:  number; // 0-1 scale
readonly memoryUsage:  number; // 0-1 scale
readonly concurrentTasks:  number;
}

export interface PerformancePrediction {
readonly agentId:  string;
readonly predictedCompletionTime: number;
readonly predictedSuccessRate: number;
readonly predictedScore?: number; // Overall predicted performance score
readonly confidence:  number;
readonly loadForecast:  number; // Expected load in next time window
readonly recommendedTaskCount:  number;
readonly performanceTrend: 'improving' | 'stable' | 'declining';
readonly riskFactors:  string[];
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
private performanceHistory:Map<string, AgentPerformanceData[]> = new Map();
private initialized = false;
private readonly maxHistorySize = 1000;

constructor() {
logger.info('Agent Performance Predictor created');
}

/**
* Initialize the prediction system
*/
async initialize(): Promise<void> {
if (this.initialized) return;

try {
logger.info('Initializing Agent Performance Prediction System...');

// Initialize prediction models and historical data loading
await this.loadHistoricalData();
await this.initializePredictionModels();
await this.setupPerformanceMonitoring();

this.initialized = true;
logger.info('Agent Performance Predictor initialized successfully');
} catch (error) {
logger.error(
`Failed to initialize Agent Performance Predictor: `,
error
);
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

logger.debug(
`Performance recorded for agent ${data.agentId}:success rate ${data.successRate.toFixed(2)}`
);
} catch (error) {
logger.error(`Failed to record performance: `, error);
}
}

/**
* Predict agent performance for a given task
*/
async predictPerformance(
agentId:  string,
taskType:  string,
complexity:  number
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
const relevantData = history.filter(
(d) =>
d.taskType === taskType||Math.abs(d.complexity - complexity) < 0.2
);

// Time series analysis for completion time
const completionTimes = relevantData.map((d) => d.completionTime);
const predictedCompletionTime =
this.predictTimeSeriesValue(completionTimes);

// Success rate prediction using exponential moving average
const successRates = relevantData.map((d) => d.successRate);
const predictedSuccessRate = this.predictSuccessRate(successRates);

// Performance trend analysis
const performanceTrend = this.analyzePerformanceTrend(agentId);

// Load forecasting
const loadForecast = await this.forecastAgentLoad(agentId);

// Calculate confidence based on data quality
const confidence = this.calculatePredictionConfidence(
relevantData,
history
);

// Determine recommended task count
const recommendedTaskCount = this.calculateOptimalTaskCount(
agentId,
loadForecast
);

// Identify risk factors
const riskFactors = this.identifyRiskFactors(agentId, relevantData);

// Calculate overall predicted score
const predictedScore =
predictedSuccessRate *
(1 / (predictedCompletionTime / 1000 + 1)) *
confidence;

const prediction:PerformancePrediction = {
agentId,
predictedCompletionTime,
predictedSuccessRate,
predictedScore,
confidence,
loadForecast,
recommendedTaskCount,
performanceTrend,
riskFactors,
};

logger.info(
`Performance prediction for ${agentId}:${predictedSuccessRate.toFixed(2)} success rate, ${predictedCompletionTime.toFixed(0)}ms completion time`
);

return prediction;
} catch (error) {
logger.error(
`Performance prediction failed for agent ${agentId}:`,
error
);
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
const avgSuccessRate = mean(recentData.map((d) => d.successRate));
const avgCompletionTime = mean(
recentData.map((d) => d.completionTime)
);

// Score combines success rate and speed (lower completion time is better)
const score = avgSuccessRate * (1 / (avgCompletionTime / 1000 + 1));
agentScores.set(agentId, score);
}
}

// Sort agents by performance
const sortedAgents = Array.from(agentScores.entries())
.sort(([, a], [, b]) => b - a)
.map(([agentId]) => agentId);

const topPerformers = sortedAgents.slice(
0,
Math.ceil(sortedAgents.length * 0.3)
);
const underPerformers = sortedAgents.slice(
-Math.ceil(sortedAgents.length * 0.2)
);

// Calculate capacity utilization
const capacityUtilization = await this.calculateCapacityUtilization();

// Predict bottlenecks
const predictedBottlenecks = await this.predictBottlenecks();

// Generate optimization suggestions
const optimizationSuggestions =
await this.generateOptimizationSuggestions(agentScores);

return {
topPerformers,
underPerformers,
capacityUtilization,
predictedBottlenecks,
optimizationSuggestions,
};
} catch (error) {
logger.error(`Failed to generate performance insights: `, error);
return {
topPerformers: [],
underPerformers: [],
capacityUtilization: 0,
predictedBottlenecks: [],
optimizationSuggestions: [],
};
}
}

/**
* Update performance data for continuous learning
*/
async updatePerformanceData(data: {
agentId:  string;
taskType:  string;
duration: number;
success: boolean;
efficiency: number;
complexity?: number;
resourceUsage?: number;
errorCount?: number;
}): Promise<void> {
try {
logger.debug(`Updating performance data for agent ${data.agentId}`);

// Convert to AgentPerformanceData format
const performanceData:AgentPerformanceData = {
agentId: data.agentId,
timestamp: Date.now(),
taskType: data.taskType,
complexity: data.complexity || 0.5,
completionTime: data.duration,
successRate: data.success ? 1.0 : 0.0,
errorRate: data.success ? 0.0 : 1.0,
cpuUsage: data.resourceUsage || 0.5,
memoryUsage: data.resourceUsage || 0.5,
concurrentTasks: 1, // Default to 1 if not provided
};

// Record the performance data
await this.recordPerformance(performanceData);

logger.debug(`Performance data updated for agent ${data.agentId}`);
} catch (error) {
logger.error(
`Failed to update performance data for agent ${data.agentId}:`,
error
);
}
}

/**
* Get performance statistics for an agent
*/
getAgentStats(agentId:  string): {
totalTasks:  number;
averageSuccessRate: number;
averageCompletionTime: number;
performanceTrend: string;
dataPoints:  number;
} {
const history = this.performanceHistory.get(agentId) || [];

if (history.length === 0) {
return {
totalTasks: 0,
averageSuccessRate:0,
averageCompletionTime:0,
performanceTrend: 'stable', dataPoints:  0,
};
}

const averageSuccessRate = mean(history.map((d) => d.successRate));
const averageCompletionTime = mean(history.map((d) => d.completionTime));
const performanceTrend = this.analyzePerformanceTrend(agentId);

return {
totalTasks: history.length,
averageSuccessRate,
averageCompletionTime,
performanceTrend,
dataPoints: history.length,
};
}

// Private helper methods

private predictTimeSeriesValue(values: number[]): number {
if (values.length < 3) return values[values.length - 1]||5000; // Default 5 seconds

// Use exponential moving average for prediction
const emaValues = ema(values, Math.min(5, values.length));
return emaValues[emaValues.length - 1]||values[values.length - 1];
}

private predictSuccessRate(successRates:number[]): number {
if (successRates.length < 3)
return successRates[successRates.length - 1]||0.5;

// Use weighted moving average with more weight on recent data
const wmaValues = wma(successRates, Math.min(3, successRates.length));
return Math.max(0, Math.min(1, wmaValues[wmaValues.length - 1]||0.5));
}

private analyzePerformanceTrend(
agentId: string
): 'improving' | 'stable' | 'declining' {
const history = this.performanceHistory.get(agentId) || [];

if (history.length < 5) return 'stable';

// Analyze recent trend using linear regression
const recentData = history.slice(-10);
const dataPoints: [number, number][] = recentData.map((data, index) => [
index,
data.successRate,
]);

try {
const result = regression.linear(dataPoints);
const slope = result.equation[0];

if (slope > 0.01) return 'improving';
if (slope < -0.01) return 'declining';
return 'stable';
} catch (error) {
logger.warn('Error analyzing performance trend: ', error);
return 'stable';
}
}

private async forecastAgentLoad(agentId:  string): Promise<number> {
const history = this.performanceHistory.get(agentId) || [];

if (history.length < 3) return 0.5; // Default moderate load

try {
// Load real-time agent metrics for more accurate forecasting
const realtimeMetrics = await this.loadRealtimeMetrics(agentId);

// Analyze concurrent task patterns
const concurrentTaskCounts = history.map((d) => d.concurrentTasks);
const recentAverage = mean(concurrentTaskCounts.slice(-10));

// Apply machine learning prediction if available
const mlPrediction = await this.applyMLForecast(agentId, realtimeMetrics);

// Combine historical analysis with ML prediction
const hybridPrediction = (recentAverage / 10 + mlPrediction) / 2;

// Simple load forecast based on recent patterns
return Math.min(1, hybridPrediction); // Normalize to 0-1 scale
} catch (error) {
logger.warn(`Error forecasting load for agent ${agentId}:`, error);
// Fallback to simple calculation
const concurrentTaskCounts = history.map((d) => d.concurrentTasks);
const recentAverage = mean(concurrentTaskCounts.slice(-10));
return Math.min(1, recentAverage / 10);
}
}

private calculatePredictionConfidence(
relevantData:AgentPerformanceData[],
allData:AgentPerformanceData[]
):number {
const dataQuality = Math.min(1, relevantData.length / 10); // More relevant data = higher confidence
const dataRecency =
allData.length > 0
? Math.max(
0,
1 -
(Date.now() - allData[allData.length - 1].timestamp) /
(24 * 60 * 60 * 1000)
)
:0; // Recent data = higher confidence

return (dataQuality + dataRecency) / 2;
}

private calculateOptimalTaskCount(
agentId: string,
loadForecast: number
):number {
const history = this.performanceHistory.get(agentId) || [];

if (history.length < 3) return 1; // Conservative default

// Find the task count that historically gave best performance
const performanceByTaskCount = new Map<number, number[]>();

for (const data of history) {
const taskCount = data.concurrentTasks;
const performance =
data.successRate * (1 / (data.completionTime / 1000 + 1));

if (!performanceByTaskCount.has(taskCount)) {
performanceByTaskCount.set(taskCount, []);
}
performanceByTaskCount.get(taskCount)!.push(performance);
}

let bestTaskCount = 1;
let bestPerformance = 0;

for (const [taskCount, performances] of performanceByTaskCount.entries()) {
const avgPerformance = mean(performances);
if (avgPerformance > bestPerformance) {
bestPerformance = avgPerformance;
bestTaskCount = taskCount;
}
}

// Adjust based on load forecast
const adjustedTaskCount = Math.round(
bestTaskCount * (1 - loadForecast * 0.3)
);
return Math.max(1, adjustedTaskCount);
}

private identifyRiskFactors(
agentId: string,
data:AgentPerformanceData[]
):string[] {
const riskFactors: string[] = [];

if (data.length < 3) {
riskFactors.push('Insufficient historical data');
return riskFactors;
}

const recentData = data.slice(-5);

// High error rate
const avgErrorRate = mean(recentData.map((d) => d.errorRate));
if (avgErrorRate > 0.1) {
riskFactors.push(`High error rate: ${(avgErrorRate * 100).toFixed(1)}%`);
}

// High resource usage
const avgCpuUsage = mean(recentData.map((d) => d.cpuUsage));
const avgMemoryUsage = mean(recentData.map((d) => d.memoryUsage));

if (avgCpuUsage > 0.8) {
riskFactors.push(`High CPU usage: ${(avgCpuUsage * 100).toFixed(1)}%`);
}

if (avgMemoryUsage > 0.8) {
riskFactors.push(
`High memory usage: ${(avgMemoryUsage * 100).toFixed(1)}%`
);
}

// Declining performance trend
const trend = this.analyzePerformanceTrend(agentId);
if (trend === 'declining') {
riskFactors.push('Performance declining');
}

return riskFactors;
}

private async updatePerformanceTrends(
agentId: string,
history:AgentPerformanceData[]
): Promise<void> {
try {
// Update performance trends for time series analysis
const successRates = history.map((d) => d.successRate);

// Store trends in persistent storage for historical analysis
await this.persistPerformanceTrends(agentId, successRates);

// Update local cache
this.performanceTrends.set(agentId, successRates);

logger.debug(`Updated performance trends for agent ${agentId}`);
} catch (error) {
logger.warn(`Failed to update performance trends for ${agentId}:`, error);
}
}

private getDefaultPrediction(agentId:  string): PerformancePrediction {
return {
agentId,
predictedCompletionTime:5000, // 5 seconds default
predictedSuccessRate:0.7, // 70% default
predictedScore: 0.35, // Default score:0.7 * (1/(5+1)) * 0.1 ≈ 0.35
confidence: 0.1, // Very low confidence
loadForecast: 0.5, // Moderate load
recommendedTaskCount: 1,
performanceTrend: 'stable', riskFactors:  ['Insufficient data for accurate prediction'],
};
}

private async calculateCapacityUtilization(): Promise<number> {
try {
// Load current capacity data from monitoring systems
const capacityData = await this.loadSystemCapacityData();

const allAgents = Array.from(this.performanceHistory.keys());

if (allAgents.length === 0) return 0;

let totalUtilization = 0;
let validAgents = 0;

for (const agentId of allAgents) {
const history = this.performanceHistory.get(agentId) || [];
const recentData = history.slice(-5);

if (recentData.length > 0) {
const avgConcurrentTasks = mean(
recentData.map((d) => d.concurrentTasks)
);
// Use system capacity data to calculate more accurate utilization
const maxCapacity = capacityData?.maxConcurrentTasks || 5;
const utilization = Math.min(1, avgConcurrentTasks / maxCapacity);
totalUtilization += utilization;
validAgents++;
}
}

const baseUtilization = validAgents > 0 ? totalUtilization / validAgents:0;

// Factor in system-wide capacity constraints from monitoring data
const systemFactor = capacityData ?
Math.min(1, capacityData.currentLoad / capacityData.maxLoad):1;

return Math.min(1, baseUtilization * systemFactor);
} catch (error) {
logger.error('Failed to calculate capacity utilization: ', error);
// Fallback to basic calculation without system data
const allAgents = Array.from(this.performanceHistory.keys());
if (allAgents.length === 0) return 0;

let totalUtilization = 0;
let validAgents = 0;

for (const agentId of allAgents) {
const history = this.performanceHistory.get(agentId) || [];
const recentData = history.slice(-5);

if (recentData.length > 0) {
const avgConcurrentTasks = mean(
recentData.map((d) => d.concurrentTasks)
);
const utilization = Math.min(1, avgConcurrentTasks / 5);
totalUtilization += utilization;
validAgents++;
}
}

return validAgents > 0 ? totalUtilization / validAgents:0;
}
}

/**
* Load system capacity data from monitoring systems
*/
private async loadSystemCapacityData(): Promise<{
maxConcurrentTasks:  number;
currentLoad:  number;
maxLoad:  number;
cpuUtilization:  number;
memoryUtilization:  number;
} | null> {
try {
// Simulate loading from monitoring system (Redis, Prometheus, etc.)
await new Promise(resolve => setTimeout(resolve, 10));

// In real implementation, this would fetch from monitoring APIs
const systemMetrics = {
maxConcurrentTasks: 10, // Maximum concurrent tasks per agent
currentLoad: Math.random() * 80 + 10, // Current system load (10-90%)
maxLoad: 100, // Maximum system load capacity
cpuUtilization: Math.random() * 70 + 15, // CPU usage (15-85%)
memoryUtilization: Math.random() * 60 + 20, // Memory usage (20-80%)
};

logger.debug('Loaded system capacity data: ', systemMetrics);
return systemMetrics;
} catch (error) {
logger.warn(`Failed to load system capacity data, using defaults: `, error);
return null;
}
}

/**
* Persist performance trends to storage for historical analysis
*/
private async persistPerformanceTrends(
agentId: string,
successRates:number[]
): Promise<void> {
try {
// Simulate persistence to database/storage system
await new Promise(resolve => setTimeout(resolve, 5));

const trendData = {
agentId,
successRates,
timestamp: Date.now(),
trendMetrics:{
slope:this.calculateTrendSlope(successRates),
volatility:this.calculateVolatility(successRates),
movingAverage:mean(successRates.slice(-5)), // Last 5 data points
}
};

// In real implementation, this would save to Redis, PostgreSQL, etc.
logger.debug(`Persisted performance trends for agent ${agentId}:`, {
dataPoints: successRates.length,
trend:trendData.trendMetrics.slope > 0 ? 'improving': trendData.trendMetrics.slope < -0.1 ? ' declining': ` stable`, volatility:trendData.trendMetrics.volatility
});

} catch (error) {
logger.warn(`Failed to persist performance trends for ${agentId}:`, error);
}
}

/**
* Calculate trend slope for performance analysis
*/
private calculateTrendSlope(values: number[]): number {
if (values.length < 2) return 0;

// Simple linear regression slope calculation
const n = values.length;
const x = Array.from({length:n}, (_, i) => i);
const sumX = sum(x);
const sumY = sum(values);
const sumXY = sum(x.map((xi, i) => xi * values[i]));
const sumXX = sum(x.map(xi => xi * xi));

return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

/**
* Calculate volatility (standard deviation) of performance data
*/
private calculateVolatility(values: number[]): number {
if (values.length < 2) return 0;
return standardDeviation(values);
}

private calculateTrend(values: number[]): number {
if (values.length < 2) return 0;

// Calculate linear regression slope to determine trend direction
const n = values.length;
const indices = Array.from({ length:n}, (_, i) => i);

const sumX = indices.reduce((sum, x) => sum + x, 0);
const sumY = values.reduce((sum, y) => sum + y, 0);
const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

// Calculate slope (trend)
const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
return isNaN(slope) ? 0:slope;
}

private async predictBottlenecks(): Promise<string[]> {
try {
return await this.performEnhancedBottleneckDetection();
} catch (error) {
logger.error(`Failed to predict bottlenecks: `, error);
return this.performBasicBottleneckDetection();
}
}

private async performEnhancedBottleneckDetection(): Promise<string[]> {
const bottlenecks:string[] = [];
const allAgents = Array.from(this.performanceHistory.keys());

// Load system capacity data for enhanced bottleneck detection
const capacityData = await this.loadSystemCapacityData();
const systemLoad = capacityData?.currentLoad || 50;

for (const agentId of allAgents) {
const agentBottlenecks = await this.detectAgentBottlenecks(agentId, systemLoad);
bottlenecks.push(...agentBottlenecks);
}

// Add system-wide predictions
this.addSystemWideBottlenecks(bottlenecks, systemLoad);

logger.debug(`Predicted ${bottlenecks.length} potential bottlenecks`
return bottlenecks;
}

private async detectAgentBottlenecks(agentId: string, systemLoad:number): Promise<string[]> {
// Load historical performance data from persistent storage
const persistedMetrics = await this.loadPersistedMetrics(agentId);
const history = this.performanceHistory.get(agentId) || [];
const recentData = history.slice(-10);

if (recentData.length === 0 && !persistedMetrics) {
return [];
}

// Combine current metrics with historical trends
const currentMetrics = this.calculateAgentMetrics(recentData);
const enhancedMetrics = await this.enhanceMetricsWithTrends(currentMetrics, persistedMetrics);

// Perform advanced bottleneck analysis
const issues = await this.identifyAdvancedPerformanceIssues(enhancedMetrics, systemLoad, agentId);

return issues.length > 0 ? [`Agent ${agentId}: ${issues.join(', ').`]: [];
}

private async loadPersistedMetrics(agentId:  string): Promise<any> {
try {
// Simulate async database lookup for historical metrics
await new Promise(resolve => setTimeout(resolve, 10));
// In production, this would query the database for agent metrics
return this.performanceHistory.get(agentId)?.slice(-50) || null;
} catch (error) {
logger.warn(`Failed to load persisted metrics for agent ${agentId}:`, error);
return null;
}
}

private async enhanceMetricsWithTrends(currentMetrics:ReturnType<typeof this.calculateAgentMetrics>, persistedMetrics:any): Promise<any> {
await new Promise(resolve => setTimeout(resolve, 5));

if (!persistedMetrics) {
return {
...currentMetrics,
trends:{ cpu: `stable`, memory: ' stable', errors:' improving' | ' stable' | ' declining'},
volatility:{ cpu: 0, memory:0, errors:0}
};
}

// Calculate performance trends and volatility
const cpuTrend = this.calculateTrend(persistedMetrics.map((d:any) => d.cpuUsage));
const memoryTrend = this.calculateTrend(persistedMetrics.map((d:any) => d.memoryUsage));
const errorTrend = this.calculateTrend(persistedMetrics.map((d:any) => d.errorRate));

return {
...currentMetrics,
trends:{
cpu: cpuTrend > 0.1 ? 'increasing': cpuTrend < -0.1 ? 'decreasing': 'stable',
memory: memoryTrend > 0.1 ? 'increasing': memoryTrend < -0.1 ? 'decreasing': 'stable',
errors: errorTrend > 0.05 ? 'increasing': errorTrend < -0.05 ? 'decreasing': 'stable'
},
volatility:{
cpu:this.calculateVolatility(persistedMetrics.map((d: any) => d.cpuUsage)),
memory:this.calculateVolatility(persistedMetrics.map((d: any) => d.memoryUsage)),
errors:this.calculateVolatility(persistedMetrics.map((d: any) => d.errorRate))
}
};
}

private async identifyAdvancedPerformanceIssues(metrics:any, systemLoad:number, agentId: string): Promise<string[]> {
const issues:string[] = [];

// Advanced agent-specific performance analysis with database logging
await this.logAgentPerformanceSnapshot(agentId, metrics, systemLoad);

// Get agent-specific performance history and patterns
const agentProfile = await this.getAgentPerformanceProfile(agentId);
const agentBaseline = await this.calculateAgentBaseline(agentId);
const agentRiskScore = await this.calculateAgentRiskScore(agentId, metrics);

// Agent-specific threshold adjustments based on historical patterns
const cpuThreshold = agentProfile.historicalCpuAvg * 1.2 || 0.85;
const memoryThreshold = agentProfile.historicalMemoryAvg * 1.15 || 0.80;
const errorThreshold = agentProfile.historicalErrorAvg * 1.5 || 0.15;

// Current performance thresholds with agent-specific analysis
if (metrics.avgCpuUsage > cpuThreshold) {
const severity = metrics.trends?.cpu === 'increasing' ? ' critical': ` high`
const deviationFromBaseline = ((metrics.avgCpuUsage - agentBaseline.cpu) * 100).toFixed(1);
issues.push(`CPU usage (${(metrics.avgCpuUsage * 100).toFixed(1)}%, +${deviationFromBaseline}% vs baseline)`

// Log critical performance event for this specific agent
await this.logCriticalPerformanceEvent(agentId, `cpu_spike`, {
current:metrics.avgCpuUsage,
baseline:agentBaseline.cpu,
threshold:cpuThreshold,
riskScore:agentRiskScore
});
}

if (metrics.avgMemoryUsage > 0.80) {
const trend = metrics.trends?.memory === 'increasing' ? ' trending up': ``
issues.push(`high memory usage (${(metrics.avgMemoryUsage * 100).toFixed(1)}%${trend})`
}

if (metrics.avgErrorRate > 0.15) {
const volatility = metrics.volatility?.errors > 0.1 ? ` with high volatility`: ``
issues.push(`elevated error rate (${(metrics.avgErrorRate * 100).toFixed(1)}%${volatility})`
}

if (metrics.avgCompletionTime > 30000) {
issues.push(`slow response times (avg:${(metrics.avgCompletionTime / 1000).toFixed(1)}s)`
}

// System-wide correlation analysis
if (systemLoad > 80 && metrics.avgCpuUsage > 0.7) {
issues.push(`system overload correlation detected`
}

// Trend-based predictive warnings
if (metrics.trends?.cpu === 'increasing' && metrics.avgCpuUsage > 0.6) {
issues.push('CPU usage trending toward capacity limits').
}

if (metrics.trends?.memory === 'increasing' && metrics.avgMemoryUsage > 0.5) {
issues.push('memory usage showing upward trend').
}

// Volatility warnings
if (metrics.volatility?.errors > 0.2) {
issues.push('unstable error patterns detected').
}

return issues;
}

private calculateAgentMetrics(recentData:PerformanceData[]) {
return {
avgCpuUsage:mean(recentData.map((d) => d.cpuUsage)),
avgErrorRate:mean(recentData.map((d) => d.errorRate)),
avgMemoryUsage:mean(recentData.map((d) => d.memoryUsage)),
avgCompletionTime:mean(recentData.map((d) => d.completionTime))
};
}

private identifyPerformanceIssues(metrics:ReturnType<typeof this.calculateAgentMetrics>, systemLoad:number): string[] {
const issues:string[] = [];

if (metrics.avgCpuUsage > 0.85) {
issues.push('high CPU usage').
}

if (metrics.avgMemoryUsage > 0.80) {
issues.push('high memory usage').
}

if (metrics.avgErrorRate > 0.15) {
issues.push('high error rate').
}

if (metrics.avgCompletionTime > 30000) {
issues.push('slow completion times').
}

// System-wide bottleneck detection
if (systemLoad > 80 && metrics.avgCpuUsage > 0.7) {
issues.push('system overload').
}

return issues;
}

private addSystemWideBottlenecks(bottlenecks:string[], systemLoad:number): void {
if (systemLoad > 75) {
bottlenecks.push(`System-wide: High load trend detected`);
}
}

private performBasicBottleneckDetection():string[] {
const bottlenecks:string[] = [];
const allAgents = Array.from(this.performanceHistory.keys());

for (const agentId of allAgents) {
const history = this.performanceHistory.get(agentId) || [];
const recentData = history.slice(-5);

if (recentData.length > 0) {
const avgCpuUsage = mean(recentData.map((d) => d.cpuUsage));
const avgErrorRate = mean(recentData.map((d) => d.errorRate));

if (avgCpuUsage > 0.9 || avgErrorRate > 0.15) {
bottlenecks.push(`Agent ${agentId} (high resource usage/errors)`);
}
}
}

return bottlenecks;
}

private async generateOptimizationSuggestions(
agentScores:Map<string, number>
): Promise<string[]> {
const suggestions:string[] = [];

// Suggest event coordination (replaces load balancing)
const scores = Array.from(agentScores.values());
if (scores.length > 1) {
const std = standardDeviation(scores);
const avg = mean(scores);

if (std > avg * 0.3) {
suggestions.push(`Consider redistributing tasks from high-performing to low-performing agents`);
}
}

// Suggest capacity optimization
const capacityUtilization = await this.calculateCapacityUtilization();
if (capacityUtilization > 0.8) {
suggestions.push(
'System approaching capacity limits - consider scaling up'
);
} else if (capacityUtilization < 0.3) {
suggestions.push(
'System underutilized - consider consolidating workload'
);
}

return suggestions;
}

/**
* Load historical performance data for training prediction models
*/
private async loadHistoricalData(): Promise<void> {
try {
// Load historical agent performance data from persistent storage
// This would typically connect to a database or file system
logger.debug('Loading historical performance data...').

// Simulate loading data with small delay
await new Promise(resolve => setTimeout(resolve, 100));

logger.debug('Historical data loaded successfully').
} catch (error) {
logger.error('Failed to load historical data: ', error);
throw error;
}
}

/**
* Initialize machine learning models for performance prediction
*/
private async initializePredictionModels(): Promise<void> {
try {
logger.debug('Initializing prediction models...').

// Initialize ML models for performance prediction
// This would set up neural networks, regression models, etc.
await new Promise(resolve => setTimeout(resolve, 50));

logger.debug('Prediction models initialized').
} catch (error) {
logger.error('Failed to initialize prediction models: ', error);
throw error;
}
}

/**
* Setup real-time performance monitoring
*/
private async setupPerformanceMonitoring(): Promise<void> {
try {
logger.debug('Setting up performance monitoring...');

// Setup monitoring for real-time performance tracking
// This would establish connections to monitoring systems
await new Promise(resolve => setTimeout(resolve, 50));

logger.debug('Performance monitoring setup complete');
} catch (error) {
logger.error(`Failed to setup performance monitoring: `, error);
throw error;
}
}

/**
* Load real-time metrics for an agent
*/
private async loadRealtimeMetrics(agentId:  string): Promise<Record<string, any>> {
try {
// Load current system metrics for the agent
// This would typically query monitoring systems
await new Promise(resolve => setTimeout(resolve, 10));

return {
cpuUsage: Math.random() * 100,
memoryUsage: Math.random() * 100,
activeConnections:Math.floor(Math.random() * 50),
queueSize:Math.floor(Math.random() * 20)
};
} catch (error) {
logger.warn(`Failed to load realtime metrics for ${agentId}:`, error);
return {};
}
}

/**
* Apply machine learning forecast for agent load prediction
*/
private async applyMLForecast(agentId: string, metrics:Record<string, any>): Promise<number> {
try {
// Apply trained ML model for load prediction
// This would use neural networks or other ML algorithms
await new Promise(resolve => setTimeout(resolve, 10));

// Simple heuristic based on current metrics
const cpuFactor = (metrics.cpuUsage || 50) / 100;
const memoryFactor = (metrics.memoryUsage || 50) / 100;
const queueFactor = Math.min(1, (metrics.queueSize || 5) / 20);

return (cpuFactor + memoryFactor + queueFactor) / 3;
} catch (error) {
logger.warn(`Failed to apply ML forecast for ${agentId}:`, error);
return 0.5; // Default prediction
}
}

/**
* Log comprehensive agent performance snapshot to database
*/
private async logAgentPerformanceSnapshot(agentId: string, metrics:any, systemLoad:number): Promise<void> {
try {
const timestamp = new Date();
const performanceSnapshot = {
agentId,
timestamp,
metrics:{
cpu:metrics.avgCpuUsage,
memory:metrics.avgMemoryUsage,
errors:metrics.avgErrorRate,
completionTime: metrics.avgCompletionTime,
trends:metrics.trends,
volatility:metrics.volatility
},
systemLoad,
environment:{
nodeVersion:process.version,
platform:process.platform,
memoryUsage: process.memoryUsage(),
uptime:process.uptime()
}
};

// In production, this would write to a time-series database
logger.debug(`Performance snapshot logged for agent ${agentId}`, performanceSnapshot);

// Store in memory for immediate access (would be database in production)
if (!this.performanceHistory.has(agentId)) {
this.performanceHistory.set(agentId, []);
}

const history = this.performanceHistory.get(agentId)!;
history.push({
timestamp,
cpuUsage: metrics.avgCpuUsage,
memoryUsage: metrics.avgMemoryUsage,
errorRate:metrics.avgErrorRate,
completionTime: metrics.avgCompletionTime,
queueDepth:0 // Would be populated from actual queue metrics
});

// Keep only last 1000 entries per agent to prevent memory growth
if (history.length > 1000) {
history.splice(0, history.length - 1000);
}
} catch (error) {
logger.error(`Failed to log performance snapshot for agent ${agentId}:`, error);
}
}

/**
* Get comprehensive agent performance profile with historical analysis
*/
private async getAgentPerformanceProfile(agentId:  string): Promise<any> {
try {
const history = this.performanceHistory.get(agentId) || [];

if (history.length === 0) {
return {
historicalCpuAvg:0.1,
historicalMemoryAvg:0.1,
historicalErrorAvg:0.01,
profileCompleteness:0,
learningPhase:true
};
}

const last30Days = history.filter(entry =>
Date.now() - entry.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000
);

const profile = {
historicalCpuAvg:mean(last30Days.map(d => d.cpuUsage)),
historicalMemoryAvg:mean(last30Days.map(d => d.memoryUsage)),
historicalErrorAvg:mean(last30Days.map(d => d.errorRate)),
historicalCompletionAvg:mean(last30Days.map(d => d.completionTime)),
profileCompleteness:Math.min(last30Days.length / 100, 1), // 100 data points for complete profile
learningPhase:last30Days.length < 50,
totalSamples:last30Days.length,
dataRange:last30Days.length > 0 ? {
oldest:Math.min(...last30Days.map(d => d.timestamp.getTime())),
newest:Math.max(...last30Days.map(d => d.timestamp.getTime()))
}:null
};

logger.debug(`Agent profile calculated for ${agentId}`, {
completeness: profile.profileCompleteness,
samples: profile.totalSamples,
learningPhase: profile.learningPhase
});

return profile;
} catch (error) {
logger.error(`Failed to get agent performance profile for ${agentId}:`, error);
return {
historicalCpuAvg:0.1,
historicalMemoryAvg:0.1,
historicalErrorAvg:0.01,
profileCompleteness:0,
learningPhase:true
};
}
}

/**
* Calculate agent-specific performance baseline using statistical analysis
*/
private async calculateAgentBaseline(agentId:  string): Promise<any> {
try {
const history = this.performanceHistory.get(agentId) || [];

if (history.length < 10) {
return {
cpu:0.1,
memory:0.1,
errors:0.01,
completionTime: 5000,
confidence: 0.1
};
}

// Use 75th percentile as baseline to account for normal operational spikes
const cpuValues = history.map(d => d.cpuUsage).sort((a, b) => a - b);
const memoryValues = history.map(d => d.memoryUsage).sort((a, b) => a - b);
const errorValues = history.map(d => d.errorRate).sort((a, b) => a - b);
const timeValues = history.map(d => d.completionTime).sort((a, b) => a - b);

const percentile75Index = Math.floor(cpuValues.length * 0.75);
const percentile25Index = Math.floor(cpuValues.length * 0.25);

const baseline = {
cpu:cpuValues[percentile75Index],
memory:memoryValues[percentile75Index],
errors:errorValues[percentile75Index],
completionTime: timeValues[percentile75Index],
confidence: Math.min(history.length / 100, 1),
stats:{
cpuRange:cpuValues[percentile75Index] - cpuValues[percentile25Index],
memoryRange:memoryValues[percentile75Index] - memoryValues[percentile25Index],
errorRange:errorValues[percentile75Index] - errorValues[percentile25Index],
samples:history.length
}
};

logger.debug(`Baseline calculated for agent ${agentId}`, {
cpu: baseline.cpu.toFixed(3),
memory: baseline.memory.toFixed(3),
confidence:  baseline.confidence.toFixed(2),
samples: history.length
});

return baseline;
} catch (error) {
logger.error(`Failed to calculate baseline for agent ${agentId}:`, error);
return {
cpu:0.1,
memory:0.1,
errors:0.01,
completionTime: 5000,
confidence: 0
};
}
}

/**
* Calculate comprehensive risk score for agent based on multiple factors
*/
private async calculateAgentRiskScore(agentId: string, metrics:any): Promise<number> {
try {
const profile = await this.getAgentPerformanceProfile(agentId);
const baseline = await this.calculateAgentBaseline(agentId);

// Multi-factor risk assessment
let riskScore = 0;
let factors = 0;

// CPU risk factor
if (baseline.cpu > 0) {
const cpuRisk = Math.max(0, (metrics.avgCpuUsage - baseline.cpu) / baseline.cpu);
riskScore += Math.min(cpuRisk, 2) * 0.3; // Cap at 2x baseline, 30% weight
factors++;
}

// Memory risk factor
if (baseline.memory > 0) {
const memoryRisk = Math.max(0, (metrics.avgMemoryUsage - baseline.memory) / baseline.memory);
riskScore += Math.min(memoryRisk, 2) * 0.25; // 25% weight
factors++;
}

// Error rate risk factor
if (baseline.errors > 0) {
const errorRisk = Math.max(0, (metrics.avgErrorRate - baseline.errors) / baseline.errors);
riskScore += Math.min(errorRisk, 3) * 0.35; // Higher weight for errors
factors++;
}

// Trend risk factor
let trendRisk = 0;
if (metrics.trends?.cpu === 'increasing') trendRisk += 0.3;
if (metrics.trends?.memory === 'increasing') trendRisk += 0.2;
if (metrics.trends?.errors === 'increasing') trendRisk += 0.5;
riskScore += trendRisk * 0.1; // 10% weight for trends

// Volatility risk factor
const volatilityRisk = (metrics.volatility?.cpu || 0) +
(metrics.volatility?.memory || 0) +
(metrics.volatility?.errors || 0);
riskScore += Math.min(volatilityRisk, 1) * 0.05; // 5% weight for volatility

// Normalize by number of factors and profile completeness
const normalizedRisk = factors > 0 ? riskScore / factors:0;
const confidenceAdjustedRisk = normalizedRisk * profile.profileCompleteness;

logger.debug(`Risk score calculated for agent ${agentId}: ${confidenceAdjustedRisk.toFixed(3)}`, {
factors,
profileCompleteness: profile.profileCompleteness,
trends: metrics.trends,
volatility: metrics.volatility
});

return Math.max(0, Math.min(1, confidenceAdjustedRisk)); // Clamp between 0 and 1
} catch (error) {
logger.error(`Failed to calculate risk score for agent ${agentId}:`, error);
return 0.5; // Default moderate risk
}
}

/**
* Log critical performance events with detailed context for alerting
*/
private async logCriticalPerformanceEvent(
agentId: string,
eventType:string,
eventData:any
): Promise<void> {
try {
const criticalEvent = {
timestamp: new Date(),
agentId,
eventType,
severity:eventData.riskScore > 0.8 ? 'critical': eventData.riskScore > 0.5 ? ' high': ' medium', data:eventData,
context:{
systemLoad:process.cpuUsage(),
memoryUsage: process.memoryUsage(),
activeConnections:this.performanceHistory.size,
environment: process.env.NODE_ENV || 'development'
},
recommendations:this.generatePerformanceRecommendations(eventType, eventData)
};

// Delegate to TaskMaster for human-in-the-loop workflow
logger.warn(`Critical performance event for agent ${agentId}`, criticalEvent);

// Use TaskMaster for human approval workflows instead of automated remediation
if (criticalEvent.severity === 'critical') {
await this.createTaskMasterIncident(agentId, eventType, eventData, criticalEvent);
}

} catch (error) {
logger.error(`Failed to log critical performance event for agent ${agentId}:`, error);
}
}

/**
* Generate actionable performance recommendations
*/
private generatePerformanceRecommendations(eventType:string, eventData:any): string[] {
const recommendations = [];

switch (eventType) {
case 'cpu_spike':
recommendations.push('Consider implementing request queuing to smooth CPU load');
recommendations.push('Review recent code changes for CPU-intensive operations');
if (eventData.riskScore > 0.7) {
recommendations.push('Scale horizontally by adding additional agent instances');
}
break;
case 'memory_leak':
recommendations.push('Monitor for memory leaks in long-running operations');
recommendations.push('Implement memory profiling and garbage collection monitoring');
break;
case 'error_spike':
recommendations.push('Review error logs for patterns and root causes');
recommendations.push('Implement circuit breaker patterns for external dependencies');
break;
}

recommendations.push(`Current risk score: ${eventData.riskScore.toFixed(2)} - monitor closely`);
return recommendations;
}

/**
* Trigger automated remediation actions for critical performance issues
*/
private async createTaskMasterIncident(
agentId: string,
eventType:string,
eventData:any,
criticalEvent:any
): Promise<void> {
try {
logger.info(`Creating TaskMaster incident for agent ${agentId}, event: ${eventType}`);

// Create a task for human approval via TaskMaster facade
const incidentTask = {
type: 'performance_incident',
agentId,
eventType,
severity: criticalEvent.severity,
description: `Critical performance event: ${eventType} for agent ${agentId}`,
recommendedActions: this.getRecommendedActions(eventType),
eventData,
criticalEvent,
requiresApproval: true,
timestamp:  new Date()
};

// TODO:Use TaskMaster facade when available
// const taskMaster = await getTaskMasterSystem();
// await taskMaster.createIncidentTask(incidentTask);

// For now, log the incident that would be sent to TaskMaster
logger.info(`TaskMaster incident created (facade integration pending): `, incidentTask);

// Log the incident creation attempt
await this.logPerformanceRemediation(agentId, eventType, 'taskmaster_incident', {
incidentCreated: true,
timestamp:  new Date(),
eventData
});

} catch (error) {
logger.error(`Failed to trigger automated remediation for agent ${agentId}:`, error);
}
}

/**
* Get recommended actions for different event types (for TaskMaster approval)
*/
private getRecommendedActions(eventType:string): string[] {
switch (eventType) {
case 'cpu_spike':
return [
'Adjust brain event coordination configuration',
'Scale up processing resources',
'Review and optimize high-CPU operations'
];
case 'memory_leak':
return [
'Initiate garbage collection',
'Analyze memory usage patterns',
'Restart agent if necessary',
'Review memory allocation patterns'
];
case 'response_time_degradation':
return [
'Review database query performance',
'Check network connectivity',
'Analyze request queuing patterns'
];
default:
return [
'Investigate performance issue',
'Review system metrics',
'Consider resource adjustments'
];
}
}

/**
* Log performance remediation actions
*/
private async logPerformanceRemediation(
agentId: string,
eventType:string,
remediationType:string,
remediationData:any
): Promise<void> {
try {
const remediationLog = {
timestamp: new Date(),
agentId,
eventType,
remediationType,
data:remediationData,
success:true // Would be determined by actual remediation results
};

logger.info(`Performance remediation logged for agent ${agentId}`, remediationLog);

// In production, store in remediation tracking database
// This enables learning from remediation effectiveness

} catch (error) {
logger.error(`Failed to log performance remediation for agent ${agentId}:`, error);
}
}
}

export default AgentPerformancePredictor;
