/**
 * @fileoverview WIP Management Domain Service
 *
 * Pure domain logic for Work-In-Progress limit management and optimization.
 * Handles WIP limits, capacity tracking, and optimization strategies.
 *
 * **Responsibilities: getLogger('WIPManagement');
/**
 * WIP check result interface
 */
export interface WIPCheckResult {
  allowed: {} as Record<TaskState, number[]>;
  constructor(initialLimits: { ...initialLimits};
    logger.info('WIPManagementService initialized with limits:, this.wipLimits');`;
}
  /**
   * Check WIP limits for a specific state
   */
  async checkWIPLimits(state: currentTasks.filter(task => task.state === state);
    const currentCount = tasksInState.length;
    const limit = this.wipLimits[state];
    const utilization = limit > 0 ? currentCount / limit: {
      allowed: this.generateWIPRecommendation(state, utilization, currentCount, limit);
}
    return result;
}
  /**
   * Get current WIP limits
   */
  async getWIPLimits():Promise<WIPLimits> {
    return { ...this.wipLimits};
}
  /**
   * Update WIP limits with validation
   */
  async updateWIPLimits(newLimits: ImmutableWIPUtils.updateWIPLimits(
      this.wipLimits,
      newLimits;
    );
    // Validate updated limits
    const validation = ValidationUtils.validateWIPLimits(updatedLimits);
    if (!validation.success) {
      throw new Error(
        `Invalid WIP limits: `${validation.error.issues.map((i) => i.message).join(,)})      );``;
}
    this.wipLimits = validation.data;')    logger.info('WIP limits updated:, this.wipLimits');
}
  /**
   * Generate WIP optimization recommendations
   */
  async getWIPOptimizationRecommendations(currentTasks: [];
    
    const workflowStates: [')     'analysis,';
     'development,')     'testing,';
     'review,')     'deployment,';
];
    for (const state of workflowStates) {
      const tasksInState = currentTasks.filter(task => task.state === state);
      const currentCount = tasksInState.length;
      const currentLimit = this.wipLimits[state];
      const utilization = currentLimit > 0 ? currentCount / currentLimit: this.analyzeWIPOptimization(state, currentCount, currentLimit, utilization);
      if (recommendation) {
        recommendations.push(recommendation);
}
}
    // Sort by expected impact
    recommendations.sort((a, b) => b.expectedImpact - a.expectedImpact);
    return recommendations;
}
  /**
   * Calculate overall WIP efficiency
   */
  async calculateWIPEfficiency(currentTasks: 0;
    let stateCount = 0;
    const workflowStates: [
     'analysis,')     'development,';
     'testing,')     'review,';
     'deployment,
];
    for (const state of workflowStates) {
      const limit = this.wipLimits[state];
      const tasksInState = currentTasks.filter(task => task.state === state);
      const utilization = limit > 0 ? tasksInState.length / limit: 0;
      totalUtilization += Math.min(1, utilization);
      stateCount++;
}
    return stateCount > 0 ? totalUtilization / stateCount: {};
    for (const state of Object.keys(this.utilizationHistory) as TaskState[]) {
      const history = this.utilizationHistory[state];
      const current = history[history.length - 1]|| 0;
      
      // Calculate trend (positive = increasing, negative = decreasing)
      const trend = history.length > 1 
        ? (current - history[history.length - 2]) ;
        :0;
      trends[state] = {
        current,
        trend,
        history: [...history], // Copy for immutability
};
}
    return trends;
}
  // =============================================================================
  // PRIVATE DOMAIN LOGIC
  // =============================================================================
  private trackUtilization(state: [];
}
    this.utilizationHistory[state].push(utilization);
    // Keep only last 24 data points (for trend analysis)
    if (this.utilizationHistory[state].length > 24) {
      this.utilizationHistory[state].shift();
}
}
  private generateWIPRecommendation(state: TaskState, utilization: number, currentCount: number, limit: number): string {
    if (utilization >= 1.0) {
    `)      return `WIP limit exceeded in ${state}. Consider increasing limit or optimizing flow.``)} else if (utilization > 0.9) {`;
      return `High utilization in ${state} (${Math.round(utilization * 100)}%). Monitor for bottlenecks.``)} else if (utilization > 0.8) {`;
      return `Approaching WIP limit in ${state}. Consider workflow optimization.``)};;
    
    return `WIP utilization in ${state} is healthy (${Math.round(utilization * 100)}%).`)};;
  private analyzeWIPOptimization(
    state: this.utilizationHistory[state]|| [];
    
    // Not enough data for recommendations
    if (history.length < 3) {
      return null;
}
    const avgUtilization = history.reduce((sum, val) => sum + val, 0) / history.length;
    const isConsistentlyHigh = avgUtilization > 0.8;
    const isConsistentlyLow = avgUtilization < 0.3;
    if (isConsistentlyHigh && utilization > 0.9) {
      // Recommend increasing limit
      const recommendedLimit = Math.ceil(currentLimit * 1.2);
      return {
        state,
        currentLimit,
        recommendedLimit,
        reason: Math.max(2, Math.floor(currentLimit * 0.8);
      return {
        state,
        currentLimit,
        recommendedLimit,
        reason,        confidence: 0.6,`';
        expectedImpact: 0.4,
};
}
    return null;
}
}