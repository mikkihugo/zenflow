/**
 * @fileoverview Flow Analysis Domain Service
 *
 * Pure domain logic for workflow flow analysis and metrics calculation.
 * Handles cycle time, lead time, throughput, and flow efficiency analysis.
 *
 * **Responsibilities: getLogger('FlowAnalysis');
/**
 * Flow trend analysis result
 */
export interface FlowTrend {
  metric: [];
  constructor() {
    logger.info('FlowAnalysisService initialized');
}
  /**
   * Calculate current flow metrics
   */
  async calculateFlowMetrics(allTasks: allTasks.filter(task => task.state === 'done');)    const blockedTasks = allTasks.filter(task => task.state === 'blocked');
    if (completedTasks.length === 0) {
    ')      logger.warn('No completed tasks available for flow metrics calculation');
      return null;
}
    // Use immutable utilities for safe metrics calculation
    const metrics = ImmutableMetricsUtils.calculateFlowMetrics(
      allTasks,
      completedTasks,
      blockedTasks,
      {
        wipEfficiency: timeRange|| {
      start: allTasks.filter(
      task => task.createdAt >= range.start && task.createdAt <= range.end;
    );')    const completedTasks = tasksInRange.filter(task => task.state === 'done');')    const blockedTasks = tasksInRange.filter(task => task.state === 'blocked');
    // Calculate cycle times
    const cycleTimes = completedTasks
      .filter(task => task.startedAt && task.completedAt)
      .map(task => 
        ((task.completedAt?.getTime()|| 0) - (task.startedAt?.getTime()|| 0)) / (1000 * 60 * 60);
      );
    // Calculate lead times
    const leadTimes = completedTasks.map(task =>
      ((task.completedAt?.getTime()|| 0) - task.createdAt.getTime()) / (1000 * 60 * 60);
    );
    // Calculate averages
    const averageCycleTime = cycleTimes.length > 0;
      ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length: leadTimes.length > 0;
      ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length: (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60);
    const throughput = rangeHours > 0 ? (completedTasks.length / rangeHours) * 24: {
      totalTasks: this.metricsHistory[this.metricsHistory.length - 1];
    const previous = this.metricsHistory[this.metricsHistory.length - 2];
    const trends: [')      this.calculateTrend('throughput, current.throughput, previous.throughput,' higher'),')      this.calculateTrend('averageCycleTime, current.averageCycleTime, previous.averageCycleTime,' lower'),')      this.calculateTrend('averageLeadTime, current.averageLeadTime, previous.averageLeadTime,' lower'),')      this.calculateTrend('flowEfficiency, current.flowEfficiency, previous.flowEfficiency,' higher'),';
];
    return trends.filter(trend => trend.confidence > 0.3); // Only return meaningful trends
}
  /**
   * Analyze predictability of workflow
   */
  async analyzePredictability(completedTasks: completedTasks
      .filter(task => task.startedAt && task.completedAt)
      .map(task => 
        ((task.completedAt?.getTime()|| 0) - (task.startedAt?.getTime()|| 0)) / (1000 * 60 * 60);
      );
    if (cycleTimes.length < 3) {
      return {
        cycleTimes,
        averageCycleTime: cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    const variance = cycleTimes.reduce((acc, time) => acc + (time - averageCycleTime) ** 2, 0) / cycleTimes.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = averageCycleTime > 0 ? standardDeviation / averageCycleTime: higher predictability
    const predictabilityScore = Math.max(0, 1 - Math.min(1, coefficientOfVariation);
    const analysis: {
      cycleTimes,
      averageCycleTime,
      standardDeviation,
      coefficientOfVariation,
      predictabilityScore,
      recommendation: completedTasks.length;)    const blockedTasks = allTasks.filter(task => task.state ==='blocked').length')    // Quality metric based on tasks not being blocked';
    const qualityIndex = totalTasks > 0
      ? Math.max(0, 1 - blockedTasks / (totalTasks + blockedTasks));
      :1;
    logger.debug('Flow quality index calculated,{';
      qualityIndex,
      totalTasks,
      blockedTasks,')';
});
    return qualityIndex;
}
  // =============================================================================
  // PRIVATE DOMAIN LOGIC
  // =============================================================================
  private calculateWIPEfficiency(allTasks: ['analysis,' development,'testing,' review,'deployment];;
    const workingTasks = allTasks.filter(task => workingStates.includes(task.state);')    const blockedTasks = allTasks.filter(task => task.state === 'blocked');
    const totalActiveTasks = workingTasks.length + blockedTasks.length;
    return totalActiveTasks > 0 ? workingTasks.length / totalActiveTasks: cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    const variance = cycleTimes.reduce((acc, time) => acc + (time - mean) ** 2, 0) / cycleTimes.length;
    const stdDev = Math.sqrt(variance);
    // Lower coefficient of variation = higher predictability
    const coefficientOfVariation = mean > 0 ? stdDev / mean: current - previous;
    const percentChange = previous !== 0 ? Math.abs(change / previous) :0;
    
    let trend : 'stable')} else {';
      const isImproving = betterDirection ==='higher '? change > 0: isImproving ?'improving : ' declining')};;
    return {
      metric,
      current,
      previous,
      change,
      trend,
      confidence: Math.min(1, percentChange * 2), // Higher confidence for bigger changes
};
}
  private generatePredictabilityRecommendation(score: number, cv: number): string {
    if (score > 0.8) {
      return'Workflow shows high predictability. Continue current practices.')} else if (score > 0.6) {';
      return'Workflow shows moderate predictability. Consider identifying and reducing sources of variation.')} else if (score > 0.4) {';
      return'Workflow shows low predictability. Focus on standardizing processes and removing blockers.')} else {';
      return'Workflow shows very low predictability. Immediate attention needed to identify and address root causes of variation.')};;
}
}