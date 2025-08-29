/**
 * @fileoverview Domain Services Index
 *
 * Centralized exports for all domain services in the Kanban system.
 * Domain services contain pure business logic and domain rules without
 * infrastructure concerns.
 *
 * **Domain Services: new TaskManagementService();
}
    return this.taskManagement;
}
  /**
   * Create WIP management service
   */
  createWIPManagementService(initialLimits: new WIPManagementService(initialLimits);
}
    return this.wipManagement;
}
  /**
   * Create flow analysis service
   */
  createFlowAnalysisService():FlowAnalysisService {
    if (!this.flowAnalysis) {
      this.flowAnalysis = new FlowAnalysisService();
}
    return this.flowAnalysis;
}
  /**
   * Create bottleneck detection service
   */
  createBottleneckDetectionService(config?:any): new BottleneckDetectionService(config);
}
    return this.bottleneckDetection;
}
  /**
   * Create health monitoring service
   */
  createHealthMonitoringService(config?:any, performanceMetrics?:any): new HealthMonitoringService(config, performanceMetrics);
}
    return this.healthMonitoring;
}
  /**
   * Create all domain services
   */
  createAllServices(config?:  {
    wipLimits?:any;
    bottleneckDetection?:any;
    healthMonitoring?:any;
    performanceMetrics?:any;
}):  {
    taskManagement: config?.wipLimits|| {
      analysis: undefined;
    this.wipManagement = undefined;
    this.flowAnalysis = undefined;
    this.bottleneckDetection = undefined;
    this.healthMonitoring = undefined;
}
}