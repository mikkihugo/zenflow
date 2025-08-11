/**
 * Flow Integration Manager - Day 21: Advanced Flow Integration and Testing
 *
 * Integrates all Kanban flow components with multi-level orchestrators and provides
 * unified flow monitoring, control coordination, and performance validation.
 */
import { EventEmitter } from 'events';
export interface FlowIntegrationConfig {
    enableRealTimeOptimization: boolean;
    monitoringInterval: number;
    performanceThresholds: FlowPerformanceThresholds;
    integrationLevels: FlowIntegrationLevel[];
    resilience: ResilienceConfig;
}
export interface FlowPerformanceThresholds {
    minThroughput: number;
    maxLeadTime: number;
    minEfficiency: number;
    maxBottleneckDuration: number;
    resourceUtilizationTarget: number;
    qualityGateThreshold: number;
}
export interface FlowIntegrationLevel {
    level: 'portfolio' | 'program' | 'swarm';
    orchestratorPath: string;
    integrationPoints: IntegrationPoint[];
    monitoringEnabled: boolean;
    optimizationEnabled: boolean;
}
export interface IntegrationPoint {
    id: string;
    type: 'wip_management' | 'bottleneck_detection' | 'metrics_collection' | 'resource_optimization';
    triggerEvents: string[];
    targetMethods: string[];
    priority: number;
}
export interface ResilienceConfig {
    enableAutoRecovery: boolean;
    maxRetryAttempts: number;
    backoffMultiplier: number;
    circuitBreakerThreshold: number;
    healthCheckInterval: number;
}
export interface UnifiedFlowStatus {
    overallHealth: number;
    activeFlows: number;
    bottlenecks: FlowBottleneck[];
    performance: UnifiedPerformanceMetrics;
    resourceStatus: UnifiedResourceStatus;
    optimizations: ActiveOptimization[];
    alerts: FlowAlert[];
}
export interface FlowBottleneck {
    id: string;
    level: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    duration: number;
    impact: string;
    resolutionProgress: number;
    estimatedResolutionTime: number;
}
export interface UnifiedPerformanceMetrics {
    throughput: number;
    leadTime: number;
    cycleTime: number;
    efficiency: number;
    quality: number;
    predictability: number;
    customerSatisfaction: number;
}
export interface UnifiedResourceStatus {
    totalCapacity: number;
    utilization: number;
    efficiency: number;
    availability: number;
    conflicts: number;
    optimization: number;
}
export interface ActiveOptimization {
    id: string;
    type: string;
    level: string;
    progress: number;
    expectedBenefit: OptimizationBenefit;
    startTime: Date;
    estimatedCompletion: Date;
}
export interface OptimizationBenefit {
    throughputIncrease: number;
    leadTimeReduction: number;
    efficiencyImprovement: number;
    costReduction: number;
}
export interface FlowAlert {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    type: string;
    message: string;
    source: string;
    timestamp: Date;
    actionRequired: boolean;
    suggestedActions: string[];
}
export interface FlowTestResult {
    testId: string;
    testType: 'optimization' | 'bottleneck' | 'resource' | 'resilience' | 'load';
    status: 'passed' | 'failed' | 'warning';
    metrics: TestMetrics;
    issues: TestIssue[];
    recommendations: string[];
    executionTime: number;
}
export interface TestMetrics {
    throughput: number;
    accuracy: number;
    responseTime: number;
    resourceUsage: number;
    errorRate: number;
}
export interface TestIssue {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    component: string;
    resolution: string;
}
export interface FlowIntegrationEvents {
    'flow-integrated': {
        level: string;
        component: string;
    };
    'optimization-applied': {
        type: string;
        level: string;
        benefit: OptimizationBenefit;
    };
    'bottleneck-resolved': {
        id: string;
        resolution: string;
        duration: number;
    };
    'performance-threshold-exceeded': {
        metric: string;
        value: number;
        threshold: number;
    };
    'alert-generated': {
        alert: FlowAlert;
    };
    'test-completed': {
        result: FlowTestResult;
    };
    'flow-health-changed': {
        previousHealth: number;
        currentHealth: number;
    };
    'resource-reallocation': {
        fromLevel: string;
        toLevel: string;
        amount: number;
    };
}
export interface FlowValidationResult {
    timestamp: Date;
    testSuite: string;
    overallStatus: 'passed' | 'warning' | 'failed';
    results: FlowTestDetail[];
    performanceMetrics: ValidationPerformanceMetrics;
    recommendations: string[];
}
export interface FlowTestDetail {
    testName: string;
    status: 'passed' | 'warning' | 'failed';
    message: string;
    duration: number;
    metrics: Record<string, any>;
}
export interface ValidationPerformanceMetrics {
    responseTime: number;
    throughput: number;
    resourceUtilization: number;
    errorRate: number;
}
export interface FlowResilienceTestResult {
    timestamp: Date;
    testSuite: string;
    overallStatus: 'passed' | 'warning' | 'failed';
    loadTests: FlowTestDetail[];
    failureRecoveryTests: FlowTestDetail[];
    adaptationTests: FlowTestDetail[];
    stabilityMetrics: StabilityMetrics;
    recommendations: string[];
}
export interface StabilityMetrics {
    uptime: number;
    errorRecoveryTime: number;
    adaptationSpeed: number;
    stabilityScore: number;
}
export interface AlgorithmTestResult {
    success: boolean;
    message: string;
    duration: number;
    metrics: Record<string, any>;
}
/**
 * Flow Integration Manager
 *
 * Coordinates all Kanban flow components and provides unified management
 */
export declare class FlowIntegrationManager extends EventEmitter {
    private config;
    private flowManager;
    private bottleneckDetector;
    private metricsTracker;
    private resourceManager;
    private integrationStatus;
    private monitoringInterval;
    private currentOptimizations;
    private performanceHistory;
    private alerts;
    constructor(config: FlowIntegrationConfig);
    /**
     * Initialize all flow components
     */
    private initializeComponents;
    /**
     * Setup event handlers for component coordination
     */
    private setupEventHandlers;
    /**
     * Integrate with multi-level orchestrators
     */
    integrateWithOrchestrators(): Promise<void>;
    /**
     * Integrate with specific level orchestrator
     */
    private integrateLevelOrchestrator;
    /**
     * Add integration point to orchestrator
     */
    private addIntegrationPoint;
    /**
     * Integrate WIP management
     */
    private integrateWIPManagement;
    /**
     * Integrate bottleneck detection
     */
    private integrateBottleneckDetection;
    /**
     * Integrate metrics collection
     */
    private integrateMetricsCollection;
    /**
     * Integrate resource optimization
     */
    private integrateResourceOptimization;
    /**
     * Enable level monitoring
     */
    private enableLevelMonitoring;
    /**
     * Enable level optimization
     */
    private enableLevelOptimization;
    /**
     * Start real-time monitoring
     */
    private startRealTimeMonitoring;
    /**
     * Run unified monitoring across all levels
     */
    private runUnifiedMonitoring;
    /**
     * Get unified flow status across all components
     */
    getUnifiedFlowStatus(): Promise<UnifiedFlowStatus>;
    /**
     * Run comprehensive flow tests
     */
    runFlowTests(): Promise<FlowTestResult[]>;
    /**
     * Run comprehensive flow performance validation tests (Task 20.2)
     */
    runFlowPerformanceValidation(): Promise<FlowValidationResult>;
    /**
     * Run flow system resilience testing (Task 20.3)
     */
    runFlowResilienceTests(): Promise<FlowResilienceTestResult>;
    /**
     * Test flow optimization algorithms
     */
    private testFlowOptimization;
    /**
     * Test bottleneck detection
     */
    private testBottleneckDetection;
    /**
     * Test resource management
     */
    private testResourceManagement;
    /**
     * Test system resilience
     */
    private testSystemResilience;
    /**
     * Test under load
     */
    private testUnderLoad;
    private queueWorkItem;
    private sanitizeResult;
    private estimateMethodDuration;
    private collectLevelMetrics;
    private analyzeLevelHealth;
    private runLevelOptimization;
    private calculateUnifiedMetrics;
    private mapBottlenecks;
    private calculateUnifiedResourceStatus;
    private calculateOverallHealth;
    private checkPerformanceThresholds;
    private createAlert;
    private handleWIPOptimization;
    private handleFlowStateChange;
    private handleBottleneckDetection;
    private handleBottleneckResolution;
    private handlePerformanceOptimization;
    private handleThresholdExceeded;
    private handleResourceAllocation;
    private handleResourceOptimization;
    private validateWIPOptimization;
    private validateFlowState;
    private validateBottleneckDetection;
    private validateResourceManagement;
    private generateOptimizationRecommendations;
    private generateBottleneckRecommendations;
    private generateResourceRecommendations;
    private generateResilienceRecommendations;
    private generateLoadTestRecommendations;
    private simulateBottleneck;
    private testBottleneckResolution;
    private testErrorRecovery;
    private testFailureHandling;
    private testAdaptation;
    private simulateHighLoad;
    private measurePerformanceUnderLoad;
    private testRecoveryAfterLoad;
    /**
     * Shutdown and cleanup
     */
    shutdown(): void;
}
export default FlowIntegrationManager;
//# sourceMappingURL=flow-integration-manager.d.ts.map