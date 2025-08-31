/**
 * @fileoverview Task Flow Intelligence - Light ML Integration
 *
 * Integrates with @claude-zen/brain for intelligent task flow optimization.
 * Provides predictive analytics, adaptive thresholds, and smart recommendations
 * without heavy ML overhead.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0 - Brain Integration
 */
import { getLogger} from '@claude-zen/foundation')import type { TaskFlowState, TaskFlowStatus} from '../types/task-flow-types')// Light Brain integration - only what we need for task flow';
interface BrainPredictor {
  predictBottleneck(flowHistory: [];
  private approvalHistory: [];
  private isLearningEnabled: true;
  constructor() {
    this.logger = getLogger('TaskFlowIntelligence');";"
    this.initializeBrain();
}
  /**
   * Predict potential bottlenecks based on flow history
   */
  async predictBottlenecks(
    currentStatus: [];
      for (const [state, _usage] of Object.entries(currentStatus.wipUsage)) {
        const prediction = await this.brainPredictor.predictBottleneck(
          this.getRecentFlowHistory(state as TaskFlowState);
        );
        predictions.push(prediction);
}
      return predictions.filter((p) => p.probability > 0.7);
} else {
      // Fallback to statistical prediction
      return this.statisticalBottleneckPrediction(currentStatus);
}
}
  /**
   * Optimize approval thresholds based on human decision patterns
   */
  async optimizeApprovalThresholds(
    _gateId: this.approvalHistory.filter(
      (h) => h.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days;
    );
    if (this.brainPredictor && gateHistory.length > 10) {
      return await this.brainPredictor.optimizeThreshold(gateHistory);
} else {
      // Fallback to statistical optimization
      return this.statisticalThresholdOptimization(gateHistory);
}
}
  /**
   * Learn from approval decisions to improve future predictions
   */
  async learnFromApprovalDecision(Promise<void> {
    if (!this.isLearningEnabled) return;
    // Record approval metric
    this.approvalHistory.push({
      timestamp: Date.now(),
      confidence: originalConfidence,
      humanDecision,
      approved,
      responseTime,
});
    // Learn from outcome
    if (this.brainPredictor) {
      await this.brainPredictor.learnFromDecisions([
        {
          predictionAccurate: originalConfidence > 0.8 === approved,
          humanOverride: this.approvalHistory.slice(-1000);
}
}
  /**
   * Get smart recommendations for flow optimization
   */
  async getFlowRecommendations(
    currentStatus: [];
    // Bottleneck predictions
    const bottlenecks = await this.predictBottlenecks(currentStatus);
    for (const bottleneck of bottlenecks) {
      recommendations.push(...bottleneck.recommendedActions);
}
    // Threshold optimizations
    for (const [state, queue] of Object.entries(currentStatus.approvalQueues)) {
      if (queue.pending > 3) {
        const optimization = await this.optimizeApprovalThresholds(state);
        if (
          optimization.recommendedThreshold !== optimization.currentThreshold
        ) {
          recommendations.push(
            `Adjust `${state} threshold from ${optimization.currentThreshold} to ${optimization.recommendedThreshold} (${optimization.reasoning})"")          );"
}
}
}
    // Capacity recommendations
    if (currentStatus.systemCapacity.utilizationPercent > 80) {
      recommendations.push(';)';
       'System approaching capacity - consider pausing low-priority task intake'));
}
    return [...new Set(recommendations)]; // Remove duplicates
}
  /**
   * Forecast capacity needs based on historical trends
   */
  async forecastCapacity(this.flowHistory.slice(-100); // Last 100 data points
    if (recentMetrics.length < 10) {
      return {
        expectedLoad: 'low',)        recommendations: ['Insufficient data for accurate forecasting'],';
};
}
    // Simple trend analysis (can be enhanced with brain predictions)
    const avgThroughput =
      recentMetrics.reduce((sum, m) => sum + m.throughput, 0) /;
      recentMetrics.length;
    const expectedLoad = avgThroughput * hoursAhead;
    const maxQueueDepth = Math.max(...recentMetrics.map((m) => m.queueDepth);
    const requiredCapacity = expectedLoad + maxQueueDepth * 0.2; // 20% buffer
    let riskLevel : 'low| medium| high = 'low')    if (requiredCapacity > 0.8) riskLevel = 'high')    else if (requiredCapacity > 0.6) riskLevel = 'medium')    const recommendations: [];;
    if (riskLevel ==='high){';
    ')      recommendations.push(';)';
       'High capacity risk - consider increasing reviewer availability)      )";
      recommendations.push("Enable emergency auto-approval for low-risk tasks")";"
}
    return { expectedLoad, requiredCapacity, riskLevel, recommendations};
}
  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================
  private recordFlowMetrics(status: this.flowHistory.slice(-1000);
}
}
  private getRecentFlowHistory(state: TaskFlowState): FlowMetric[] 
    return this.flowHistory.filter((h) => h.state === state).slice(-50); // Last 50 data points for this state
  private statisticalBottleneckPrediction(
    status: [];
    for (const [state, usage] of Object.entries(status.wipUsage)) {
      if (usage.utilization > 0.8) {
        predictions.push({
          state: history.filter((h) => h.humanDecision);
    const avgConfidenceApproved =
      humanApprovals
        .filter((h) => h.approved)
        .reduce((sum, h) => sum + h.confidence, 0) /;
      humanApprovals.filter((h) => h.approved).length;
    const avgConfidenceRejected =
      humanApprovals
        .filter((h) => !h.approved)
        .reduce((sum, h) => sum + h.confidence, 0) /;
      humanApprovals.filter((h) => !h.approved).length;
    const optimalThreshold =;
      (avgConfidenceApproved + avgConfidenceRejected) / 2;
    return {
      currentThreshold: this.flowHistory.filter(
      (h) => h.state === state && h.timestamp > Date.now() - 60 * 60 * 1000;
    ).length; // Last hour
    return recentHistory / 60; // Tasks per minute
};)};;
/**
 * Factory function to create task flow intelligence
 */
export function createTaskFlowIntelligence(): TaskFlowIntelligence {
  return new TaskFlowIntelligence();
}
// =============================================================================
// EXPORTS
// =============================================================================
export type {
  BottleneckPrediction,
  ThresholdRecommendation,
  FlowMetric,
  ApprovalMetric,
'};;
'')';