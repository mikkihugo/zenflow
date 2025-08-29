/**
 * @fileoverview Bottleneck Detection Domain Service
 *
 * Pure domain logic for workflow bottleneck detection and analysis.
 * Identifies capacity constraints, process issues, and flow impediments.
 *
 * **Responsibilities: getLogger('BottleneckDetection');
/**
 * Bottleneck detection configuration
 */
export interface BottleneckDetectionConfig {
  /** Utilization threshold for capacity bottlenecks */
  capacityThreshold:  {
  capacityThreshold: [];
  constructor(config: Partial<BottleneckDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('BottleneckDetectionService initialized', this.config);
  }

  /**
   * Detect current bottlenecks in the workflow
   */
  async detectBottlenecks(
    allTasks: any[],
    wipLimits: Record<string, number>
  ): Promise<any[]> {
    const bottlenecks: any[] = [];
    logger.debug('Starting bottleneck detection', {
      totalTasks: allTasks.length
    });

    const capacityBottlenecks = await this.detectCapacityBottlenecks(allTasks, wipLimits);
    const dwellingBottlenecks = await this.detectDwellingBottlenecks(allTasks);
    const flowRateBottlenecks = await this.detectFlowRateBottlenecks(allTasks);
    const dependencyBottlenecks = await this.detectDependencyBottlenecks(allTasks);
    // Combine all detected bottlenecks
    bottlenecks.push(
      ...capacityBottlenecks,
      ...dwellingBottlenecks,
      ...flowRateBottlenecks,
      ...dependencyBottlenecks
    );
    // Filter by confidence threshold and deduplicate
    const filteredBottlenecks = this.filterAndPrioritizeBottlenecks(bottlenecks);
    // Store in history for trend analysis
    this.detectionHistory.push(...filteredBottlenecks);
    if (this.detectionHistory.length > 100) {
      this.detectionHistory = this.detectionHistory.slice(-100); // Keep last 100 detections
}
    const report:  {
      reportId,      generatedAt: timestamp,';
      timeRange:  {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: timestamp,
},
      bottlenecks: filteredBottlenecks,
      systemHealth: this.calculateSystemHealth(filteredBottlenecks),
      recommendations: filteredBottlenecks.map(bottleneck => ({
        bottleneckId: bottleneck.id,
        strategy: this.getResolutionStrategy(bottleneck).name,
        description: bottleneck.recommendedResolution,
        estimatedImpact: Math.min(1, bottleneck.impactScore * 0.8),
        implementationEffort: bottleneck.severity == = 'critical` ? 4: 2,`;
        priority: bottleneck.severity as any,
        prerequisites: [],
})),
      trends: await this.analyzeTrends(),
};
    logger.info(`Bottleneck detection complete: ${filteredBottlenecks.length} bottlenecks found`).length,``'; `
      high: filteredBottlenecks.filter(b => b.severity === 'high').length,';
      medium: filteredBottlenecks.filter(b => b.severity === 'medium').length,';
});
    return report;
}
  /**
   * Get detailed resolution strategies for a bottleneck
   */
  async getResolutionStrategies(bottleneck: [];
    switch (bottleneck.type) {
      case 'capacity':';
        strategies.push(
          {
            id  = 'increase-wip-limit,)            name:`Increase WIP Limit``'; `
            description,    ')            estimatedEffort : 'low,'
'            expectedImpact: 'parallel-processing',)            name : 'Enable Parallel Processing')            description : 'Split work to enable parallel processing in this state')            estimatedEffort : 'medium,'
'            expectedImpact: ';
        strategies.push(
          {
            id: 'Process Optimization',)            description : 'Analyze and optimize the process in this workflow state')            estimatedEffort : 'high,'
'            expectedImpact: 'automation',)            name : 'Automation Implementation')            description : 'Automate repetitive tasks causing delays')            estimatedEffort : 'high,'
'            expectedImpact: ';
        strategies.push(
          {
            id: 'Dependency Elimination',)            description : 'Remove or reduce dependencies causing delays')            estimatedEffort : 'medium,'
'            expectedImpact: 'general-optimization',)          name : 'General Workflow Optimization')          description : 'Apply general workflow optimization techniques')          estimatedEffort : 'medium,'
'          expectedImpact: 0.6,';
          timeToImplement: 8,
          prerequisites: [],',});
}
    return strategies.sort((a, b) => b.expectedImpact - a.expectedImpact);
}
  // =============================================================================
  // DETECTION ALGORITHMS
  // =============================================================================
  private async detectCapacityBottlenecks(
    allTasks: [];)    const workflowStates: ['analysis,' development,'testing,' review,'deployment];;
    for (const state of workflowStates) {
      const tasksInState = allTasks.filter(task => task.state === state);
      const currentCount = tasksInState.length;
      const limit = wipLimits[state];
      const utilization = limit > 0 ? currentCount / limit: 0;
      if (utilization >= this.config.capacityThreshold) {
    ')        const severity = utilization >= 0.95 ?'critical: utilization >= 0.9 ?' high = medium`,)        bottlenecks.push({`;
          id: `capacity-${state}-${Date.now()},`;
          state,
          type: ``capacity,';
          severity,
          impactScore: utilization,
          detectedAt: new Date(),
          affectedTasks: tasksInState.map(t => t.id),',          estimatedDelay: [];)    const workflowStates: ['analysis,' development,'testing,' review,'deployment];;
    for (const state of workflowStates) {
      const tasksInState = allTasks.filter(task => task.state === state);
      
      // Find tasks that have been in this state too long
      const dwellingTasks = tasksInState.filter(task => {
        const hoursInState = (Date.now() - task.updatedAt.getTime()) / (1000 * 60 * 60);
        return hoursInState > this.config.dwellingThreshold;
});
      if (dwellingTasks.length > 0) {
        const avgDwellingTime = dwellingTasks.reduce(
          (sum, task) => sum + (Date.now() - task.updatedAt.getTime()) / (1000 * 60 * 60),
          0;
        ) / dwellingTasks.length;')        const severity = dwellingTasks.length > 3 ?'high =  medium`,)        const impactScore = Math.min(1, dwellingTasks.length / tasksInState.length);`;
        bottlenecks.push({
          id: `dwelling-${state}-${Date.now()},`;
          state,
          type: `process,`;
          severity,
          impactScore,
          detectedAt: new Date(),
          affectedTasks: dwellingTasks.map(t => t.id),`,`;
          estimatedDelay: [];
    
    // This would typically analyze flow rates between states
    // For now, return empty array - could be enhanced with historical flow data
    
    return bottlenecks;
}
  private async detectDependencyBottlenecks(allTasks: [];
    
    // Find tasks blocked by dependencies
    const blockedTasks = allTasks.filter(task => ')      task.state ==='blocked '&& task.dependencies && task.dependencies.length > 0';
    );
    if (blockedTasks.length >= this.config.minimumTasksForAnalysis) {
      const impactScore = Math.min(1, blockedTasks.length / allTasks.length);
      ')      bottlenecks.push({';
    ')        id,    ')        state : 'blocked')        type : 'dependency')        severity: 'medium,',
        impactScore,
        detectedAt: new Date(),
        affectedTasks: blockedTasks.map(t => t.id),',        estimatedDelay: 'Review and resolve task dependencies,',
'        metadata:  {';
          blockedTaskCount: blockedTasks.length,
          totalTasks: allTasks.length,',},';
});
}
    return bottlenecks;
}
  // =============================================================================
  // ANALYSIS AND UTILITIES
  // =============================================================================
  private filterAndPrioritizeBottlenecks(bottlenecks: bottlenecks.filter(bottleneck => 
      bottleneck.impactScore >= this.config.confidenceThreshold;
    );
    // Sort by severity and impact
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0};
    
    return filtered.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.impactScore - a.impactScore;
});
}
  private calculateSystemHealth(bottlenecks: bottlenecks.filter(b => b.severity ==='critical').length')    const highCount = bottlenecks.filter(b => b.severity ==='high').length')    const mediumCount = bottlenecks.filter(b => b.severity ==='medium').length')    const healthImpact = criticalCount * 0.3 + highCount * 0.2 + mediumCount * 0.1;;
    return Math.max(0, 1 - Math.min(1, healthImpact);
}
  private getResolutionStrategy(bottleneck: ';
        return {
          id: 'Increase Capacity',)          description : 'Increase team capacity or WIP limits')          estimatedEffort : 'medium,'
'          expectedImpact: ';
        return {
          id: 'Process Optimization',)          description : 'Optimize process efficiency')          estimatedEffort : 'high,'
'          expectedImpact: ';
        return {
          id: 'Resolve Dependencies',)          description : 'Address blocking dependencies')          estimatedEffort : 'medium,'
'          expectedImpact: 'general-optimization',)          name : 'General Optimization')          description,          estimatedEffort : 'medium,'
          expectedImpact: 0.6,
          timeToImplement: 8,
          prerequisites: [],',};;
}
}
  private async analyzeTrends(): Promise<any[]> {
    // Placeholder for trend analysis
    // Would typically analyze bottleneck history for patterns
    return [];
};)'};)';