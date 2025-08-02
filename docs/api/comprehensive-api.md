# Comprehensive API Documentation

*Generated: 2025-08-02T13:54:19.215Z*  
*Version: 2.0.0-alpha.73*

## Overview

This documentation covers all TypeScript interfaces and JavaScript exports in the Claude-Zen codebase.

## TypeScript Files (19)


### src/index.ts

**Lines of Code:** 286

**Interfaces (1):**
- `ClaudeZenConfig`

**Exports (3):**
- `ClaudeZenConfig`
- `defaultConfig`
- `getVersion`


### src/workflows/index.ts

**Lines of Code:** 132

**Interfaces (0):**


**Exports (2):**
- `WorkflowUtils`
- `WorkflowFactory`


### src/workflows/engine.ts

**Lines of Code:** 600

**Interfaces (5):**
- `WorkflowStep`
- `WorkflowDefinition`
- `WorkflowContext`
- `WorkflowState`
- `WorkflowEngineConfig`

**Exports (6):**
- `WorkflowStep`
- `WorkflowDefinition`
- `WorkflowContext`
- `WorkflowState`
- `WorkflowEngineConfig`
- `WorkflowEngine`


### src/types/workflow-types.ts

**Lines of Code:** 475

**Interfaces (36):**
- `WorkflowParameterObject`
- `DocumentContent`
- `DocumentMetadata`
- `StepExecutionResult`
- `WorkflowResultMetadata`
- `ResourceUsage`
- `WorkflowError`
- `WorkflowErrorContext`
- `WorkflowData`
- `WorkflowDataObject`
- `WorkflowStep`
- `WorkflowCondition`
- `WorkflowValidator`
- `WorkflowDefinition`
- `WorkflowTrigger`
- `WorkflowVariable`
- `WorkflowContext`
- `WorkflowDocumentRegistry`
- `WorkflowEnvironment`
- `WorkflowLimits`
- `WorkflowPermissions`
- `WorkflowState`
- `WorkflowStepState`
- `WorkflowStepResults`
- `CompletedStepInfo`
- `WorkflowProgress`
- `WorkflowMetrics`
- `WorkflowExecutionOptions`
- `RetryPolicy`
- `NotificationConfig`
- `NotificationChannel`
- `NotificationChannelConfig`
- `LoggingConfig`
- `WorkflowEngineConfig`
- `StorageBackend`
- `StorageBackendConfig`

**Exports (36):**
- `WorkflowParameterObject`
- `DocumentContent`
- `DocumentMetadata`
- `StepExecutionResult`
- `WorkflowResultMetadata`
- `ResourceUsage`
- `WorkflowError`
- `WorkflowErrorContext`
- `WorkflowData`
- `WorkflowDataObject`
- `WorkflowStep`
- `WorkflowCondition`
- `WorkflowValidator`
- `WorkflowDefinition`
- `WorkflowTrigger`
- `WorkflowVariable`
- `WorkflowContext`
- `WorkflowDocumentRegistry`
- `WorkflowEnvironment`
- `WorkflowLimits`
- `WorkflowPermissions`
- `WorkflowState`
- `WorkflowStepState`
- `WorkflowStepResults`
- `CompletedStepInfo`
- `WorkflowProgress`
- `WorkflowMetrics`
- `WorkflowExecutionOptions`
- `RetryPolicy`
- `NotificationConfig`
- `NotificationChannel`
- `NotificationChannelConfig`
- `LoggingConfig`
- `WorkflowEngineConfig`
- `StorageBackend`
- `StorageBackendConfig`


### src/types/shared-types.ts

**Lines of Code:** 235

**Interfaces (17):**
- `RuvSwarm`
- `SwarmAgent`
- `SwarmConfig`
- `MemoryEntry`
- `StorageProvider`
- `SystemEvent`
- `Message`
- `ComponentConfig`
- `SystemHealth`
- `ComponentHealth`
- `Task`
- `NeuralModel`
- `ModelMetadata`
- `APIError`
- `CoordinationProvider`
- `MemoryProvider`
- `LoggingProvider`

**Exports (18):**
- `RuvSwarm`
- `SwarmAgent`
- `SwarmConfig`
- `MemoryEntry`
- `StorageProvider`
- `SystemEvent`
- `Message`
- `ComponentConfig`
- `SystemHealth`
- `ComponentHealth`
- `Task`
- `NeuralModel`
- `ModelMetadata`
- `APIResponse`
- `APIError`
- `CoordinationProvider`
- `MemoryProvider`
- `LoggingProvider`


### src/types/index.ts

**Lines of Code:** 43

**Interfaces (0):**


**Exports (3):**
- `isRuvSwarm`
- `isSwarmAgent`
- `isSystemEvent`


### src/types/event-types.ts

**Lines of Code:** 412

**Interfaces (20):**
- `BaseEventPayload`
- `SystemEvents`
- `WorkflowEvents`
- `CoordinationEvents`
- `NeuralEvents`
- `MemoryEvents`
- `SystemConfig`
- `SystemError`
- `SystemErrorContext`
- `ServiceHealthMap`
- `WorkflowEventContext`
- `WorkflowResults`
- `WorkflowEventError`
- `StepEventResult`
- `TaskEventResult`
- `TaskEventError`
- `NeuralEventError`
- `MemoryStoreConfig`
- `EventBusConfig`
- `EventMetrics`

**Exports (52):**
- `BaseEventPayload`
- `SystemEvents`
- `SystemStartedPayload`
- `SystemStoppedPayload`
- `SystemErrorPayload`
- `SystemHealthChangedPayload`
- `WorkflowEvents`
- `WorkflowStartedPayload`
- `WorkflowCompletedPayload`
- `WorkflowFailedPayload`
- `WorkflowPausedPayload`
- `WorkflowResumedPayload`
- `WorkflowCancelledPayload`
- `WorkflowStepStartedPayload`
- `WorkflowStepCompletedPayload`
- `WorkflowStepFailedPayload`
- `CoordinationEvents`
- `AgentCreatedPayload`
- `AgentDestroyedPayload`
- `AgentStatusChangedPayload`
- `TaskAssignedPayload`
- `TaskCompletedPayload`
- `TaskFailedPayload`
- `SwarmInitializedPayload`
- `SwarmTopologyChangedPayload`
- `NeuralEvents`
- `NeuralNetworkCreatedPayload`
- `NeuralTrainingStartedPayload`
- `NeuralTrainingCompletedPayload`
- `NeuralTrainingFailedPayload`
- `NeuralPredictionMadePayload`
- `MemoryEvents`
- `MemoryStoreCreatedPayload`
- `MemoryKeySetPayload`
- `MemoryKeyGetPayload`
- `MemoryKeyDeletedPayload`
- `MemorySyncStartedPayload`
- `MemorySyncCompletedPayload`
- `SystemConfig`
- `SystemError`
- `SystemErrorContext`
- `ServiceHealthMap`
- `WorkflowEventContext`
- `WorkflowResults`
- `WorkflowEventError`
- `StepEventResult`
- `TaskEventResult`
- `TaskEventError`
- `NeuralEventError`
- `MemoryStoreConfig`
- `EventBusConfig`
- `EventMetrics`


### src/types/agent-types.ts

**Lines of Code:** 305

**Interfaces (11):**
- `AgentId`
- `AgentState`
- `AgentCapabilities`
- `AgentConfig`
- `AgentEnvironment`
- `AgentMetrics`
- `AgentError`
- `ExecutionResult`
- `AgentCapability`
- `Task`
- `Message`

**Exports (11):**
- `AgentId`
- `AgentState`
- `AgentCapabilities`
- `AgentConfig`
- `AgentEnvironment`
- `AgentMetrics`
- `AgentError`
- `ExecutionResult`
- `AgentCapability`
- `Task`
- `Message`


### src/neural/neural-bridge.ts

**Lines of Code:** 324

**Interfaces (4):**
- `NeuralConfig`
- `NeuralNetwork`
- `TrainingData`
- `PredictionResult`

**Exports (5):**
- `NeuralConfig`
- `NeuralNetwork`
- `TrainingData`
- `PredictionResult`
- `NeuralBridge`


### src/knowledge/storage-interface.ts

**Lines of Code:** 112

**Interfaces (5):**
- `FACTKnowledgeEntry`
- `FACTSearchQuery`
- `FACTStorageStats`
- `FACTStorageBackend`
- `FACTStorageConfig`

**Exports (5):**
- `FACTKnowledgeEntry`
- `FACTSearchQuery`
- `FACTStorageStats`
- `FACTStorageBackend`
- `FACTStorageConfig`


### src/knowledge/project-context-analyzer.ts

**Lines of Code:** 839

**Interfaces (7):**
- `ProjectContext`
- `DependencyInfo`
- `DetectedFramework`
- `DetectedLanguage`
- `DetectedAPI`
- `KnowledgeGatheringMission`
- `ProjectAnalyzerConfig`

**Exports (1):**
- `ProjectContextAnalyzer`


### src/knowledge/performance-optimization-system.ts

**Lines of Code:** 915

**Interfaces (44):**
- `IntelligentCachingSystem`
- `CacheManager`
- `CacheStorage`
- `CacheEntry`
- `CacheEntryMetadata`
- `EvictionPolicyManager`
- `ReplicationManager`
- `PrefetchingEngine`
- `BandwidthOptimizationSystem`
- `CompressionEngine`
- `CompressionAlgorithm`
- `DeltaEncodingSystem`
- `BatchingStrategyManager`
- `AdaptiveStreamingEngine`
- `PriorityQueuingSystem`
- `PriorityManagementSystem`
- `PriorityCalculationEngine`
- `DynamicPrioritizationSystem`
- `ResourceAllocationManager`
- `QoSManager`
- `LoadBalancingSystem`
- `LoadBalancer`
- `BalancingStrategy`
- `HealthCheckingSystem`
- `TrafficShapingEngine`
- `RealTimeMonitoringSystem`
- `MetricsCollectionEngine`
- `PerformanceAnalyticsEngine`
- `AnomalyDetectionSystem`
- `AlertingSystem`
- `PerformanceOptimizationConfig`
- `KnowledgeRequest`
- `KnowledgeSharingRequest`
- `OptimizedKnowledgeResponse`
- `KnowledgeSharingOptimization`
- `CacheOptimizationResult`
- `PerformanceOptimizationMetrics`
- `OptimizationMetrics`
- `SharingOptimizationMetrics`
- `PerformanceImprovement`
- `CacheResult`
- `RequestPriority`
- `ProcessingStrategy`
- `IntelligentCachingEngine`

**Exports (44):**
- `IntelligentCachingSystem`
- `CacheManager`
- `CacheStorage`
- `CacheEntry`
- `CacheEntryMetadata`
- `EvictionPolicyManager`
- `ReplicationManager`
- `PrefetchingEngine`
- `BandwidthOptimizationSystem`
- `CompressionEngine`
- `CompressionAlgorithm`
- `DeltaEncodingSystem`
- `BatchingStrategyManager`
- `AdaptiveStreamingEngine`
- `PriorityQueuingSystem`
- `PriorityManagementSystem`
- `PriorityCalculationEngine`
- `DynamicPrioritizationSystem`
- `ResourceAllocationManager`
- `QoSManager`
- `LoadBalancingSystem`
- `LoadBalancer`
- `BalancingStrategy`
- `HealthCheckingSystem`
- `TrafficShapingEngine`
- `RealTimeMonitoringSystem`
- `MetricsCollectionEngine`
- `PerformanceAnalyticsEngine`
- `AnomalyDetectionSystem`
- `AlertingSystem`
- `PerformanceOptimizationSystem`
- `PerformanceOptimizationConfig`
- `KnowledgeRequest`
- `KnowledgeSharingRequest`
- `OptimizedKnowledgeResponse`
- `KnowledgeSharingOptimization`
- `CacheOptimizationResult`
- `PerformanceOptimizationMetrics`
- `OptimizationMetrics`
- `SharingOptimizationMetrics`
- `PerformanceImprovement`
- `CacheResult`
- `RequestPriority`
- `ProcessingStrategy`


### src/knowledge/knowledge-swarm.ts

**Lines of Code:** 803

**Interfaces (4):**
- `KnowledgeAgentSpecialization`
- `KnowledgeQuery`
- `KnowledgeSwarmResult`
- `KnowledgeAgent`

**Exports (3):**
- `KnowledgeSwarm`
- `getFACTSwarm`
- `FACTSwarmHelpers`


### src/knowledge/knowledge-storage.ts

**Lines of Code:** 407

**Interfaces (0):**


**Exports (1):**
- `FACTStorageSystem`


### src/knowledge/knowledge-quality-management.ts

**Lines of Code:** 936

**Interfaces (37):**
- `ReputationSystem`
- `ReputationModel`
- `ReputationScore`
- `ScoringAlgorithm`
- `ConsensusWeightingConfig`
- `DecayFunction`
- `ValidationProtocol`
- `ValidatorConfig`
- `ValidationThresholds`
- `EvidenceRequirements`
- `CrossValidationConfig`
- `ValidationResult`
- `QualityAssuranceSystem`
- `QualityMetricDefinition`
- `AssessmentProtocol`
- `MonitoringConfig`
- `ImprovementMechanism`
- `BenchmarkingConfig`
- `TemporalKnowledgeManager`
- `KnowledgeVersionControl`
- `TemporalValidationSystem`
- `KnowledgeDecayManager`
- `UpdatePropagationSystem`
- `PeerReviewSystem`
- `ReviewProcess`
- `ReviewerSelectionSystem`
- `ReviewWorkflowManager`
- `ReviewResult`
- `KnowledgeQualityConfig`
- `KnowledgeItem`
- `ContributionRecord`
- `QualityMonitoringReport`
- `KnowledgeQualityMetrics`
- `ReviewerAssignment`
- `ValidationScore`
- `ReviewScore`
- `ReputationManagementSystem`

**Exports (37):**
- `ReputationSystem`
- `ReputationModel`
- `ReputationScore`
- `ScoringAlgorithm`
- `ConsensusWeightingConfig`
- `DecayFunction`
- `ValidationProtocol`
- `ValidatorConfig`
- `ValidationThresholds`
- `EvidenceRequirements`
- `CrossValidationConfig`
- `ValidationResult`
- `QualityAssuranceSystem`
- `QualityMetricDefinition`
- `AssessmentProtocol`
- `MonitoringConfig`
- `ImprovementMechanism`
- `BenchmarkingConfig`
- `TemporalKnowledgeManager`
- `KnowledgeVersionControl`
- `TemporalValidationSystem`
- `KnowledgeDecayManager`
- `UpdatePropagationSystem`
- `PeerReviewSystem`
- `ReviewProcess`
- `ReviewerSelectionSystem`
- `ReviewWorkflowManager`
- `ReviewResult`
- `KnowledgeQualityManagementSystem`
- `KnowledgeQualityConfig`
- `KnowledgeItem`
- `ContributionRecord`
- `QualityMonitoringReport`
- `KnowledgeQualityMetrics`
- `ReviewerAssignment`
- `ValidationScore`
- `ReviewScore`


### src/knowledge/knowledge-processor.ts

**Lines of Code:** 811

**Interfaces (4):**
- `WASMFact`
- `WASMFactConfig`
- `CognitiveTemplate`
- `WASMPerformanceMetrics`

**Exports (1):**
- `WASMFactIntegration`


### src/knowledge/knowledge-client.ts

**Lines of Code:** 499

**Interfaces (4):**
- `FACTConfig`
- `FACTQuery`
- `FACTResult`
- `FACTMetrics`

**Exports (3):**
- `FACTIntegration`
- `getFACT`
- `FACTHelpers`


### src/knowledge/intelligence-coordination-system.ts

**Lines of Code:** 936

**Interfaces (38):**
- `ExpertiseDiscoveryEngine`
- `ExpertiseProfile`
- `DomainExpertise`
- `SkillProfile`
- `ExperienceProfile`
- `DiscoveryMechanism`
- `ExpertiseEvolutionTracker`
- `KnowledgeRoutingSystem`
- `RoutingEntry`
- `RoutingStrategy`
- `LoadBalancingConfig`
- `QoSConfig`
- `AdaptiveRoutingConfig`
- `SpecializationEmergenceDetector`
- `EmergencePattern`
- `EmergenceDetectionAlgorithm`
- `SpecializationTracker`
- `AdaptationMechanism`
- `CrossDomainTransferSystem`
- `CrossDomainTransferMap`
- `DomainNode`
- `AnalogyEngine`
- `AbstractionEngine`
- `TransferValidationSystem`
- `CollectiveMemoryManager`
- `SharedMemorySpace`
- `CollectiveMemory`
- `MemoryRetrievalSystem`
- `ForgettingMechanism`
- `IntelligenceCoordinationConfig`
- `ExpertiseDiscoveryResult`
- `RoutingResult`
- `SpecializationEmergenceResult`
- `CrossDomainTransferResult`
- `IntelligenceCoordinationMetrics`
- `KnowledgeQuery`
- `RoutingOptions`
- `ExpertiseDiscoverySystem`

**Exports (38):**
- `ExpertiseDiscoveryEngine`
- `ExpertiseProfile`
- `DomainExpertise`
- `SkillProfile`
- `ExperienceProfile`
- `DiscoveryMechanism`
- `ExpertiseEvolutionTracker`
- `KnowledgeRoutingSystem`
- `RoutingEntry`
- `RoutingStrategy`
- `LoadBalancingConfig`
- `QoSConfig`
- `AdaptiveRoutingConfig`
- `SpecializationEmergenceDetector`
- `EmergencePattern`
- `EmergenceDetectionAlgorithm`
- `SpecializationTracker`
- `AdaptationMechanism`
- `CrossDomainTransferSystem`
- `CrossDomainTransferMap`
- `DomainNode`
- `AnalogyEngine`
- `AbstractionEngine`
- `TransferValidationSystem`
- `CollectiveMemoryManager`
- `SharedMemorySpace`
- `CollectiveMemory`
- `MemoryRetrievalSystem`
- `ForgettingMechanism`
- `IntelligenceCoordinationSystem`
- `IntelligenceCoordinationConfig`
- `ExpertiseDiscoveryResult`
- `RoutingResult`
- `SpecializationEmergenceResult`
- `CrossDomainTransferResult`
- `IntelligenceCoordinationMetrics`
- `KnowledgeQuery`
- `RoutingOptions`


### src/knowledge/index.ts

**Lines of Code:** 316

**Interfaces (0):**


**Exports (4):**
- `validateKnowledgeConfig`
- `getSystemCapabilities`
- `createTestConfig`
- `getKnowledgeStoragePaths`


## JavaScript Files (19)


### src/__tests__/test-mcp-tools.js

**Lines of Code:** 38

**JSDoc Comments:** 1
**Exports:** 0


### src/__tests__/test-integration-direct.js

**Lines of Code:** 432

**JSDoc Comments:** 1
**Exports:** 1


### src/neural/wasm/wasm-memory-optimizer.js

**Lines of Code:** 808

**JSDoc Comments:** 31
**Exports:** 2


### src/neural/wasm/wasm-loader2.js

**Lines of Code:** 417

**JSDoc Comments:** 1
**Exports:** 3


### src/neural/wasm/wasm-loader.js

**Lines of Code:** 634

**JSDoc Comments:** 0
**Exports:** 7


### src/neural/core/neural.js

**Lines of Code:** 620

**JSDoc Comments:** 1
**Exports:** 1


### src/neural/core/neural-network-manager.js

**Lines of Code:** 1952

**JSDoc Comments:** 38
**Exports:** 8


### src/neural/coordination/neural-coordination-protocol.js

**Lines of Code:** 1375

**JSDoc Comments:** 35
**Exports:** 1


### src/neural/agents/neural-agent.js

**Lines of Code:** 842

**JSDoc Comments:** 20
**Exports:** 1


### src/database/persistence/unified-lance-persistence.js

**Lines of Code:** 692

**JSDoc Comments:** 3
**Exports:** 2


### src/database/persistence/persistence.js

**Lines of Code:** 487

**JSDoc Comments:** 2
**Exports:** 1


### src/database/persistence/persistence-pooled.js

**Lines of Code:** 760

**JSDoc Comments:** 1
**Exports:** 1


### src/coordination/diagnostics/health-monitor.js

**Lines of Code:** 560

**JSDoc Comments:** 13
**Exports:** 2


### src/coordination/diagnostics/diagnostics.js

**Lines of Code:** 537

**JSDoc Comments:** 22
**Exports:** 6


### src/coordination/diagnostics/cli-diagnostics.js

**Lines of Code:** 372

**JSDoc Comments:** 1
**Exports:** 1


### src/__tests__/swarm-zen/wasm-integration.test.js

**Lines of Code:** 444

**JSDoc Comments:** 1
**Exports:** 1


### src/__tests__/swarm-zen/verify-wasm-no-warnings.js

**Lines of Code:** 66

**JSDoc Comments:** 1
**Exports:** 0


### src/__tests__/swarm-zen/validate-wasm-loading.js

**Lines of Code:** 278

**JSDoc Comments:** 1
**Exports:** 0


### src/__tests__/swarm-zen/validate-setup.js

**Lines of Code:** 115

**JSDoc Comments:** 1
**Exports:** 0


---

*This documentation is automatically generated. Do not edit manually.*
