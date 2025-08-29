/**
 * @fileoverview Optional AI Enhancement Interfaces
 *
 * Clean interfaces for optional AI integration with SAFe framework.
 * These interfaces define contracts for AI enhancements without requiring implementation.
 * Services are injected via DI and are completely optional.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */
/**
 * Optional Brain Coordinator interface for AI-powered decision making
 * Implementation provided by @claude-zen/brain package
 */
export interface IBrainCoordinator {
  analyzeWSJF(input:  {
  brainCoordinator?:IBrainCoordinator;
  performanceTracker?:IPerformanceTracker;
  telemetryManager?:ITelemetryManager;
  workflowEngine?:IWorkflowEngine;
  loadBalancer?:ILoadBalancer;
  conversationOrchestrator?:IConversationOrchestrator;
'};;
/**
 * Configuration for AI enhancements
 */
export interface AIEnhancementConfig {
  enableBrainCoordinator?:boolean;
  enablePerformanceTracking?:boolean;
  enableTelemetry?:boolean;
  enableWorkflowAutomation?:boolean;
  enableLoadBalancing?:boolean;
  // enableInteractiveGUI removed - use event-driven architecture for UI
  enableConversationOrchestration?:boolean;
  // AI-specific configuration
  brainConfig?:  {
    learningRate?:number;
    adaptationThreshold?:number;
    confidenceThreshold?:number;
};
  // Performance tracking configuration
  performanceConfig?:  {
    enableDetailedMetrics?:boolean;
    retentionDays?:number;
    aggregationInterval?:number;
};
  // Telemetry configuration
  telemetryConfig?:  {
    serviceName?:string;
    enableTracing?:boolean;
    enableMetrics?:boolean;
    sampleRate?:number;
};
};