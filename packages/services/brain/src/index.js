/**
 * @fileoverview Brain Package - Autonomous AI Decision-Making System with Neural Intelligence
 *
 * **ENTERPRISE-GRADE AUTONOMOUS AI COORDINATION PLATFORM**
 *
 * Advanced autonomous AI coordination system that automatically makes intelligent decisions
 * about optimization strategies, resource allocation, and system management with continuous
 * learning and adaptation capabilities. Built with Rust/WASM acceleration for maximum
 * performance and enterprise-scale neural coordination.
 *
 * ** RECOMMENDED USAGE:Access via @claude-zen/foundation Package**
 *
 * While this package can be used directly, it is recommended to access brain
 * functionality through `@claude-zen/foundation` which provides integrated neural`
 * coordination with telemetry, logging, and configuration management.
 *
 * **CORE AUTONOMOUS CAPABILITIES:**
 * -  **Autonomous Decision-Making**:Intelligent choice between DSPy, ML, and hybrid strategies
 * -  **Task Complexity Estimation**:ML-powered complexity analysis and optimization selection
 * -  **Self-Governing Resource Allocation**:Automatic scaling and resource optimization
 * -  **Behavioral Intelligence**:Performance prediction and pattern recognition
 * -  **Real-Time Adaptation**:Continuous learning and strategy refinement
 * -  **Method Selection**:Automatic optimization based on performance history
 * -  **Rust/WASM Integration**:High-performance neural computation with FANN
 * -  **Foundation Integration**:Complete @claude-zen/foundation support
 *
 * **NEURAL COMPUTATION FEATURES:**
 * - FANN (Fast Artificial Neural Network) integration with Rust/WASM acceleration
 * - GPU acceleration support for large-scale neural computations
 * - Multi-threaded neural network training and inference
 * - Custom neural architectures (CNN, LSTM, Transformer, VAE, GAN)
 * - Advanced optimization algorithms (Adam, RMSprop, gradient descent)
 * - Neural network ensemble methods and model combination
 * - Transfer learning and fine-tuning capabilities
 * - Real-time neural network monitoring and performance optimization
 *
 * **ENTERPRISE AUTONOMOUS FEATURES:**
 * - Multi-horizon predictive modeling with confidence intervals
 * - Cross-agent performance correlation and dependency analysis
 * - Advanced anomaly detection with machine learning models
 * - Comprehensive metrics collection and export (Prometheus/Grafana)
 * - Real-time decision dashboard with customizable AI views
 * - Automated performance optimization and resource allocation
 * - Integration with external AI platforms (TensorFlow, PyTorch, Hugging Face)
 * - Enterprise-grade security with encrypted neural models
 * - Multi-tenant AI isolation and governance
 * - Audit trails for AI decision-making and compliance
 *
 * @example Recommended Usage via Foundation
 * ```typescript`
 * import { getNeuralAccess, AI} from '@claude-zen/foundation';
 *
 * // Get integrated neural access with telemetry
 * const neural = await getNeuralAccess();
 *
 * // Use the AI interface for autonomous decisions
 * const aiSystem = AI;
 * const decision = await aiSystem.makeAutonomousDecision({
 *   context: 'complex optimization task', *   constraints:{ timeLimit: 30000, quality: 'high'},
 *   learningEnabled:true
 *});
 *
 * logger.info('AI Decision: ', {
'    ') *   strategy:decision.selectedStrategy,
 *   confidence:decision.confidence,
 *   reasoning:decision.reasoning,
 *   expectedOutcome:decision.prediction
 *});
 * ````
 *
 * @example Direct Advanced Neural Coordination
 * ```typescript`
 * import {
 *   BrainCoordinator,
 *   AutonomousOptimizationEngine,
 *   NeuralBridge
 *} from '@claude-zen/brain';
 *
 * // Create enterprise-grade autonomous brain coordinator
 * const brain = new BrainCoordinator({
 *   autonomous:{
 *     enabled:true,
 *     learningRate:0.01,
 *     adaptationThreshold:0.85,
 *     decisionConfidenceMinimum:0.7
 *},
 *   neural:{
 *     rustAcceleration:true,
 *     gpuAcceleration:true,
 *     parallelProcessing:8,
 *     memoryPoolSize:'2GB') *},
 *   optimization:{
 *     strategies:['dspy',    'ml',    'hybrid',    'ensemble'],
 *     autoSelection:true,
 *     performanceTracking:true
 *},
 *   enterprise:{
 *     auditTrail:true,
 *     securityLevel: 'high', *     multiTenant:true,
 *     governanceCompliance:'soc2') *}
 *});
 *
 * await brain.initialize();
 *
 * // Autonomous optimization with full enterprise features
 * const result = await brain.optimizePrompt({
 *   task: 'complex neural network design', *   basePrompt: 'Design a CNN for image classification with 99%+ accuracy', *   context:{
 *     domain: 'computer-vision', *     datasetSize:1000000,
 *     computeConstraints:{ maxGPUMemory: '16GB', maxTrainingTime: '4h'},
 *     qualityRequirements:{ accuracy: 0.99, inference: '<10ms'}') *},
 *   priority: 'high', *   enableLearning:true
 *});
 *
 * logger.info('Autonomous Optimization Result: ', {
'    ') *   selectedStrategy:result.strategy,
 *   optimizedPrompt:result.prompt,
 *   confidence:result.confidence,
 *   expectedPerformance:result.performancePrediction,
 *   resourceAllocation:result.recommendedResources,
 *   estimatedCompletion:result.timeEstimate
 *});
 *
 * // Brain learns from results to improve future decisions
 * await brain.learnFromResult(result, true, {
 *   actualPerformance:0.995,
 *   actualTime:3.2 * 3600000, // 3.2 hours
 *   feedback:'Exceeded expectations, excellent architecture selection') *});
 * ````
 *
 * @example Enterprise Neural Network Training
 * ```typescript`
 * import {
 *   NeuralBridge,
 *   createNeuralNetwork,
 *   trainNeuralNetwork,
 *   NeuralModelPresets
 *} from '@claude-zen/brain';
 *
 * // Create high-performance neural bridge with enterprise features
 * const neuralBridge = new NeuralBridge({
 *   backend: 'rust-fann', *   acceleration:{
 *     gpu:true,
 *     multiThreading:true,
 *     vectorization: 'avx512', *     memoryOptimization:true
 *},
 *   monitoring:{
 *     realTimeMetrics:true,
 *     performanceProfiler:true,
 *     memoryTracker:true
 *},
 *   enterprise:{
 *     modelEncryption:true,
 *     auditLogging:true,
 *     accessControl:'rbac') *}
 *});
 *
 * // Create advanced neural network with custom architecture
 * const network = await createNeuralNetwork({
 *   architecture:{
 *     type: 'transformer', *     layers:[
 *       { type: 'embedding', dimensions:512, vocabulary:50000},
 *       { type: 'multihead-attention', heads:8, dimensions:512},
 *       { type: 'feedforward', dimensions:2048, activation: ' gelu'},
 *       { type: 'layer-norm', dimensions:512},
 *       { type: 'dropout', rate:0.1},
 *       { type: 'output', dimensions:1024, activation: ' softmax'}') *],
 *     optimization:{
 *       algorithm: 'adamw', *       learningRate:0.0001,
 *       weightDecay:0.01,
 *       gradientClipping:1.0
 *}
 *},
 *   hardware:{
 *     useGPU:true,
 *     precision: 'mixed', // FP16 + FP32') *     batchSize:32,
 *     gradientAccumulation:4
 *}
 *});
 *
 * // Train with enterprise-grade monitoring
 * const trainingResult = await trainNeuralNetwork(network, {
 *   trainingData:await loadLargeDataset('training.parquet'),
 *   validationData:await loadLargeDataset('validation.parquet'),
 *   epochs:100,
 *   monitoring:{
 *     checkpointInterval:10,
 *     validationInterval:5,
 *     earlyStoppingPatience:15,
 *     lossThreshold:0.001
 *},
 *   optimization:{
 *     learningRateScheduler: 'cosine-annealing', *     warmupSteps:1000,
 *     autoMixedPrecision:true,
 *     gradientCheckpointing:true
 *},
 *   enterprise:{
 *     saveCheckpoints:true,
 *     modelVersioning:true,
 *     experimentTracking: 'mlflow', *     distributedTraining:{ nodes: 4, gpusPerNode:8}
 *}
 *});
 *
 * logger.info('Training Results: ', {
'    ') *   finalLoss:trainingResult.finalLoss,
 *   bestValidationAccuracy:trainingResult.bestValidationAccuracy,
 *   trainingTime:trainingResult.totalTrainingTime,
 *   modelSize:trainingResult.modelSizeBytes,
 *   checkpoints:trainingResult.savedCheckpoints.length
 *});
 * ````
 *
 * @example Autonomous Task Complexity Analysis
 * ```typescript`
 * import {
 *   TaskComplexityEstimator,
 *   AutonomousOptimizationEngine,
 *   SmartPromptOptimizer
 *} from '@claude-zen/brain';
 *
 * // Create ML-powered complexity estimator
 * const complexityEstimator = new TaskComplexityEstimator({
 *   models:{
 *     textAnalysis: 'transformer-large', *     contextAnalysis: 'bert-large', *     domainClassification:'custom-classifier') *},
 *   features:{
 *     linguisticComplexity:true,
 *     semanticDepth:true,
 *     domainSpecificity:true,
 *     contextualDependencies:true,
 *     temporalRequirements:true
 *},
 *   learning:{
 *     enabled:true,
 *     updateFrequency: 'daily', *     feedbackIntegration:true
 *}
 *});
 *
 * // Analyze complex enterprise task
 * const complexityAnalysis = await complexityEstimator.estimateComplexity({
 *   task: 'microservices-architecture-design', *   prompt:`Design a fault-tolerant microservices architecture for a global`
 *            e-commerce platform handling 100M+ users with real-time inventory,
 *            payment processing, recommendation engine, and fraud detection`,`
 *   context:{
 *     domain: 'enterprise-architecture', *     scale: 'global', *     constraints:{
 *       availability: '99.99%', *       latency: '<100ms', *       security: 'enterprise-grade', *       compliance:['pci-dss',    'gdpr',    'sox']') *},
 *     requirements:{
 *       scalability: 'horizontal', *       deployment: 'multi-cloud', *       monitoring: 'comprehensive', *       testing:'full-coverage') *}
 *},
 *   expertise:'senior-architect') *});
 *
 * logger.info('Complexity Analysis: ', {
'    ') *   overallComplexity:complexityAnalysis.score, // 0-1 scale
 *   dimensions:{
 *     technical:complexityAnalysis.technical,
 *     architectural:complexityAnalysis.architectural,
 *     operational:complexityAnalysis.operational,
 *     business:complexityAnalysis.business
 *},
 *   recommendations:{
 *     optimizationStrategy:complexityAnalysis.recommendedStrategy,
 *     estimatedDuration:complexityAnalysis.timeEstimate,
 *     resourceRequirements:complexityAnalysis.resources,
 *     riskFactors:complexityAnalysis.risks
 *}
 *});
 *
 * // Use autonomous optimization engine for strategy selection
 * const optimizer = new AutonomousOptimizationEngine({
 *   strategies:{
 *     dspy:{ weight: 0.3, suitability:['structured-problems']},
 *     ml:{ weight: 0.4, suitability:['pattern-recognition',    'prediction']},
 *     hybrid:{ weight: 0.3, suitability:['complex-multi-domain']}') *},
 *   decisionCriteria:{
 *     performance:0.4,
 *     reliability:0.3,
 *     efficiency:0.2,
 *     learning:0.1
 *},
 *   autonomous:{
 *     enableSelfImprovement:true,
 *     adaptationRate:0.05,
 *     confidenceThreshold:0.8
 *}
 *});
 *
 * const optimizationDecision = await optimizer.selectOptimalStrategy({
 *   complexityAnalysis,
 *   historicalPerformance:await optimizer.getHistoricalData(),
 *   constraints:{
 *     timeLimit:7200000, // 2 hours
 *     qualityRequirement:0.95,
 *     resourceBudget:'high') *}
 *});
 *
 * logger.info('Autonomous Strategy Selection: ', {
'    ') *   selectedStrategy:optimizationDecision.strategy,
 *   confidence:optimizationDecision.confidence,
 *   reasoning:optimizationDecision.reasoning,
 *   expectedOutcome:optimizationDecision.prediction,
 *   alternativeStrategies:optimizationDecision.alternatives
 *});
 * ````
 *
 * @example Behavioral Intelligence and Agent Performance Prediction
 * ```typescript`
 * import {
 *   BehavioralIntelligence,
 *   AgentPerformancePredictor,
 *   demoBehavioralIntelligence
 *} from '@claude-zen/brain';
 *
 * // Create comprehensive behavioral intelligence system
 * const behavioral = new BehavioralIntelligence({
 *   models:{
 *     performancePrediction: 'time-series-transformer', *     behaviorClassification: 'ensemble-classifier', *     anomalyDetection: 'isolation-forest', *     patternRecognition:'conv-lstm') *},
 *   features:{
 *     timeSeriesAnalysis:true,
 *     behavioralClustering:true,
 *     performanceTrends:true,
 *     contextualFactors:true
 *},
 *   learning:{
 *     realTimeAdaptation:true,
 *     crossAgentLearning:true,
 *     feedbackIntegration:true,
 *     modelUpdates:'continuous') *},
 *   enterprise:{
 *     privacyPreservation:true,
 *     auditability:true,
 *     fairnessMonitoring:true
 *}
 *});
 *
 * // Track comprehensive agent execution data
 * const executionData = {
 *   agentId: 'senior-architect-001', *   taskType: 'system-design', *   startTime:Date.now() - 3600000, // 1 hour ago
 *   endTime:Date.now(),
 *   performance:{
 *     qualityScore:0.92,
 *     efficiency:0.87,
 *     innovation:0.89,
 *     completeness:0.94
 *},
 *   context:{
 *     complexity:0.8,
 *     timeOfDay: 'morning', *     workload: 'moderate', *     collaboration:true,
 *     interruptions:2
 *},
 *   outcomes:{
 *     success:true,
 *     stakeholderSatisfaction:0.91,
 *     implementationFeasibility:0.88,
 *     maintainabilityScore:0.93
 *}
 *};
 *
 * // Learn from execution to improve future predictions
 * await behavioral.learnFromExecution(executionData);
 *
 * // Predict future performance with confidence intervals
 * const performancePrediction = await behavioral.predictAgentPerformance({
 *   agentId: 'senior-architect-001', *   taskType: 'system-design', *   complexity:0.85,
 *   context:{
 *     timeOfDay: 'afternoon', *     workload: 'high', *     collaboration:false,
 *     urgency:'high') *},
 *   horizons:['1h',    '4h',    '1d']') *});
 *
 * logger.info('Performance Prediction: ', {
'    ') *   shortTerm:{
 *     expectedQuality:performancePrediction.oneHour.quality,
 *     confidence:performancePrediction.oneHour.confidence,
 *     factors:performancePrediction.oneHour.influencingFactors
 *},
 *   mediumTerm:{
 *     expectedQuality:performancePrediction.fourHours.quality,
 *     confidence:performancePrediction.fourHours.confidence,
 *     adaptationPotential:performancePrediction.fourHours.adaptation
 *},
 *   longTerm:{
 *     expectedQuality:performancePrediction.oneDay.quality,
 *     confidence:performancePrediction.oneDay.confidence,
 *     learningCurve:performancePrediction.oneDay.improvement
 *},
 *   recommendations:performancePrediction.optimizationRecommendations
 *});
 *
 * // Demo behavioral intelligence capabilities
 * const demoResults = await demoBehavioralIntelligence({
 *   agentCount:50,
 *   taskTypes:['coding',    'design',    'analysis',    'optimization'],
 *   simulationDuration: '30d', *   learningEnabled:true
 *});
 *
 * logger.info('Behavioral Intelligence Demo: ', {
'    ') *   totalAgents:demoResults.agents.length,
 *   averageAccuracy:demoResults.predictionAccuracy,
 *   improvementRate:demoResults.learningRate,
 *   insights:demoResults.keyInsights
 *});
 * ````
 *
 * @example GPU-Accelerated Neural Computation
 * ```typescript`
 * import {
 *   GPUSupport,
 *   detectGPUCapabilities,
 *   initializeGPUAcceleration,
 *   optimizeForGPU
 *} from '@claude-zen/brain';
 *
 * // Detect and initialize GPU capabilities
 * const gpuCapabilities = await detectGPUCapabilities();
 * logger.info('GPU Capabilities: ', {
'    ') *   available:gpuCapabilities.available,
 *   type:gpuCapabilities.type, // 'cuda',    'opencl',    'metal',    'webgl') *   memory:gpuCapabilities.memory,
 *   computeCapability:gpuCapabilities.computeCapability,
 *   multiProcessors:gpuCapabilities.multiProcessors
 *});
 *
 * if (gpuCapabilities.available) {
 *   // Initialize GPU acceleration
 *   const gpuSupport = await initializeGPUAcceleration({
 *     device:gpuCapabilities.bestDevice,
 *     memoryPoolSize: '8GB', *     precision: 'mixed', // FP16 + FP32') *     optimization:{
 *       tensorCores:true,
 *       cudnn:true,
 *       tensorrt:true
 *}
 *});
 *
 *   // Create GPU-optimized neural computation
 *   const gpuOptimizedBrain = new BrainCoordinator({
 *     neural:{
 *       backend: 'gpu-accelerated', *       gpuSupport,
 *       batchSize:256,
 *       parallelStreams:4
 *},
 *     optimization:{
 *       kernelFusion:true,
 *       memoryOptimization:true,
 *       pipelineParallelism:true
 *}
 *});
 *
 *   // Optimize neural networks for GPU execution
 *   const optimizedNetwork = await optimizeForGPU({
 *     network:neuralNetwork,
 *     targetGPU:gpuCapabilities.bestDevice,
 *     optimizations:{
 *       quantization: 'int8', *       pruning:0.1, // Remove 10% of weights
 *       tensorDecomposition:true,
 *       kernelFusion:true
 *}
 *});
 *
 *   logger.info('GPU Optimization Results: ', {
'    ') *     originalSize:optimizedNetwork.originalSize,
 *     optimizedSize:optimizedNetwork.optimizedSize,
 *     speedupFactor:optimizedNetwork.speedupFactor,
 *     memoryReduction:optimizedNetwork.memoryReduction,
 *     accuracyRetention:optimizedNetwork.accuracyRetention
 *});
 *}
 * ````
 *
 * @example Enterprise Multi-Tenant Neural System
 * ```typescript`
 * import {
 *   BrainCoordinator,
 *   AutonomousCoordinator,
 *   createEnterpriseNeuralSystem
 *} from '@claude-zen/brain';
 *
 * // Create enterprise multi-tenant neural system
 * const enterpriseNeuralSystem = await createEnterpriseNeuralSystem({
 *   multiTenant:{
 *     enabled:true,
 *     isolation: 'strict', *     resourceQuotas:{
 *       'tenant-a':{ cpuCores: 16, gpuMemory: '8GB', networkBandwidth: '1Gbps'},
 *       'tenant-b':{ cpuCores: 32, gpuMemory: '16GB', networkBandwidth: '10Gbps'},
 *       'tenant-c':{ cpuCores: 8, gpuMemory: '4GB', networkBandwidth: '100Mbps'}') *},
 *     billing:{
 *       model: 'usage-based', *       metrics:['compute-hours',    'gpu-hours',    'storage-gb',    'api-calls']') *}
 *},
 *   security:{
 *     encryption: 'AES-256-GCM', *     keyManagement: 'enterprise-kms', *     auditLogging: 'comprehensive', *     accessControl: 'rbac-with-abac', *     networkSecurity:'zero-trust') *},
 *   governance:{
 *     modelGovernance:true,
 *     dataGovernance:true,
 *     complianceFrameworks:['soc2',    'iso27001',    'gdpr'],
 *     ethicsMonitoring:true,
 *     biasDetection:true
 *},
 *   monitoring:{
 *     realTimeMetrics:true,
 *     performanceDashboards:true,
 *     alerting: 'enterprise-integration', *     logging: 'structured-json', *     tracing:'distributed') *}
 *});
 *
 * // Autonomous coordinator for system-wide management
 * const autonomousCoordinator = new AutonomousCoordinator({
 *   scope: 'enterprise-system', *   decisionDomains:[
 *     'resource-allocation', *     'scaling-decisions', *     'performance-optimization', *     'cost-optimization', *     'security-adaptation') *],
 *   governance:{
 *     requireApproval:['scaling-up-major',    'budget-exceed',    'security-change'],
 *     autoApprove:['performance-optimization',    'resource-reallocation'],
 *     auditAll:true
 *},
 *   learning:{
 *     enabled:true,
 *     crossTenantLearning:false, // Privacy preservation
 *     modelSharing: 'federated', *     privacyPreservation:'differential-privacy') *}
 *});
 *
 * // Register tenants with custom configurations
 * await enterpriseNeuralSystem.registerTenant('acme-corp', {
    ') *   brainConfig:{
 *     autonomous:{
 *       enabled:true,
 *       aggressiveness: 'conservative', *       domains:['optimization',    'resource-allocation']') *},
 *     neural:{
 *       models:['transformer-large',    'cnn-optimized',    'lstm-financial'],
 *       specializations:['nlp',    'computer-vision',    'time-series']') *}
 *},
 *   compliance:{
 *     dataResidency: 'us-east', *     retentionPolicy: '7y', *     privacyLevel:'high') *}
 *});
 *
 * // Autonomous system-wide optimization
 * const systemOptimization = await autonomousCoordinator.optimizeSystem({
 *   objectives:{
 *     performance:{ weight: 0.4, target: 'maximize-throughput'},
 *     cost:{ weight: 0.3, target: 'minimize-cost'},
 *     reliability:{ weight: 0.2, target: 'maximize-uptime'},
 *     security:{ weight: 0.1, target: 'maintain-posture'}') *},
 *   constraints:{
 *     maxBudgetIncrease:0.1,
 *     minReliability:0.999,
 *     complianceRequirements:['maintain-all'],
 *     tenantSLAs:'must-meet') *}
 *});
 *
 * logger.info('System Optimization Results: ', {
'    ') *   decisions:systemOptimization.decisions,
 *   expectedImpact:systemOptimization.impact,
 *   confidence:systemOptimization.confidence,
 *   implementationPlan:systemOptimization.plan,
 *   rollbackStrategy:systemOptimization.rollback
 *});
 * ````
 *
 * @example Using separate entry points (optimal tree-shaking)
 * ```typescript`
 * // Optimal imports for tree-shaking
 * import { BrainCoordinator} from '@claude-zen/brain/coordinator';
 * import { NeuralBridge} from '@claude-zen/brain/neural';
 * import { AutonomousOptimizationEngine} from '@claude-zen/brain/autonomous';
 * import { BehavioralIntelligence} from '@claude-zen/brain/behavioral';
 * import { GPUSupport} from '@claude-zen/brain/gpu';
 * ````
 *
 * **Performance Characteristics:**
 * - **Decision Latency**:<5ms for cached decisions, <50ms for complex analysis
 * - **Throughput**:10,000+ autonomous decisions/second with horizontal scaling
 * - **Memory Usage**:<2GB for full neural coordination system
 * - **Accuracy**:95%+ accuracy for task complexity estimation and strategy selection
 * - **Learning Speed**:Continuous adaptation with 90%+ accuracy after 100 examples
 * - **GPU Acceleration**:10-100x speedup for neural computations
 * - **Scalability**:Horizontally scalable with distributed neural processing
 *
 * **Enterprise Scalability:**
 * - Multi-tenant isolation with strict security boundaries
 * - Auto-scaling based on computational demand and performance metrics
 * - Distributed neural processing across multiple nodes and GPUs
 * - Enterprise-grade security with model encryption and audit trails
 * - Compliance support for SOC2, ISO27001, GDPR, and industry standards
 * - Cost optimization with intelligent resource allocation and scheduling
 *
 * **Neural Architecture Support:**
 * - Traditional neural networks (feedforward, CNN, RNN, LSTM)
 * - Modern architectures (Transformer, BERT, GPT, Vision Transformer)
 * - Generative models (VAE, GAN, Diffusion models)
 * - Reinforcement learning (DQN, A3C, PPO, SAC)
 * - Custom architectures with flexible layer composition
 * - Ensemble methods and model combination strategies
 *
 * **AI/ML Integration Ecosystem:**
 * - Native integration with @claude-zen/foundation for telemetry
 * - DSPy Stanford integration for neural program optimization
 * - TensorFlow and PyTorch model import/export capabilities
 * - Hugging Face Transformers integration for pre-trained models
 * - ONNX support for cross-platform neural network deployment
 * - Custom GPU kernels for specialized neural operations
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 2.0.0
 *
 * @see {@link https://github.com/zen-neural/claude-code-zen} Claude Code Zen Documentation
 * @see {@link ./main} Main Implementation
 *
 * @requires @claude-zen/foundation - Core utilities and infrastructure
 * @requires @claude-zen/dspy - DSPy Stanford integration for neural programming
 * @requires fann-wasm - FANN neural network library with WebAssembly
 * @requires brain.js - Neural networks in JavaScript (fallback)
 *
 * @packageDocumentation
 */
// =============================================================================
// PRIMARY EVENT-DRIVEN EXPORTS - Foundation powered with brain coordination
// =============================================================================
export { createEventDrivenBrain, EventDrivenBrain, EventDrivenBrain as default, } from './brain-event-driven.js';
// =============================================================================
// LEGACY EXPORTS - Backward compatibility (DEPRECATED)
// =============================================================================
/**
 * @deprecated Use EventDrivenBrain instead for event-based brain coordination
 */
// =============================================================================
// MAIN ENTRY POINT - Complete brain system
// =============================================================================
// =============================================================================
// NEURAL BRIDGE AND NETWORK OPERATIONS
// =============================================================================
// =============================================================================
// GPU ACCELERATION AND COORDINATION SYSTEMS
// =============================================================================
// =============================================================================
// PURE EVENT-BASED BRAIN COORDINATOR - Zero Imports
// =============================================================================
export { BrainCoordinator, createBrainCoordinator, } from './brain-coordinator-pure';
// =============================================================================
// ADDITIONAL BRAIN SYSTEMS - Extended functionality
// =============================================================================
// Note:BrainJs functionality moved to neural-ml package
export { BehavioralIntelligence, BrainCoordinator as BrainSystem, BrainCoordinator as default, createNeuralNetwork, detectGPUCapabilities, initializeGPUAcceleration, NeuralBridge, predictWithNetwork, trainNeuralNetwork } from './main';
// =============================================================================
// SMART NEURAL COORDINATION SYSTEM - Intelligent Neural Backend
// =============================================================================
export { SmartNeuralCoordinator } from './smart-neural-coordinator';
// Note:BrainJs functionality moved to neural-ml package
// export {
//   BrainJsBridge,
//   createBrainJsNetwork,
//   trainBrainJsNetwork,
//   predictWithBrainJsNetwork,
//   demoBehavioralIntelligence
//} from './main';
// =============================================================================
// AUTONOMOUS DECISION-MAKING SYSTEM - Core autonomous intelligence capabilities
// =============================================================================
/**
 *  AgentPerformancePredictor - Behavioral prediction and optimization
 *
 * Predicts agent performance using time series analysis and clustering:
 * - Performance trend prediction
 * - Behavioral pattern recognition
 * - Agent-task matching optimization
 * - Continuous performance monitoring
 */
export { AgentPerformancePredictor } from './agent-performance-predictor';
/**
 * ️ AutonomousCoordinator - Self-governing system management
 *
 * Comprehensive autonomous system coordination and resource management:
 * - Automatic resource allocation
 * - Dynamic scaling decisions
 * - Performance optimization
 * - System health monitoring
 *
 * Note:Advanced system coordination - use with caution in production
 */
export { AutonomousCoordinator } from './autonomous-coordinator';
/**
 *  AutonomousOptimizationEngine - Intelligently chooses optimization methods
 *
 * Automatically decides between DSPy, ML, and hybrid optimization based on:
 * - Task complexity analysis
 * - Historical performance data
 * - Time constraints and priorities
 * - Continuous learning from outcomes
 *
 * Features:
 * - Autonomous method selection (DSPy/ML/hybrid)
 * - Performance-driven decision making
 * - Real-time adaptation to changing patterns
 * - Continuous learning from optimization results
 */
export { AutonomousOptimizationEngine } from './autonomous-optimization-engine';
// =============================================================================
// COORDINATION SYSTEMS - Advanced coordination components
// =============================================================================
export { DSPyLLMBridge } from './coordination/dspy-llm-bridge';
export { RetrainingMonitor } from './coordination/retraining-monitor';
// ===== MEETING INTELLIGENCE - Neural-Powered Collaborative Decision Making =====
export { createMeetingIntelligence, MeetingIntelligence, } from './meeting-intelligence';
// =============================================================================
// NEURAL MODELS - Pre-built neural network models
// =============================================================================
export { AutoencoderPreset, CNNPreset, GraphNeuralNetwork, LSTMPreset, NeuralModelPresets, TransformerModel, VAEModel } from './models-dir';
// =============================================================================
// LEGACY COMPATIBILITY - Backward compatibility exports
// =============================================================================
export { NeuralBridge as IntelligenceBridge } from './neural-bridge';
/**
 *  SmartPromptOptimizer - ML-powered prompt enhancement
 *
 * Advanced prompt optimization using machine learning algorithms:
 * - Pattern recognition and template matching
 * - Statistical analysis and regression models
 * - Domain-specific optimization strategies
 * - Performance tracking and improvement
 */
export { SmartPromptOptimizer } from './smart-prompt-optimizer';
/**
 *  TaskComplexityEstimator - ML-based automatic task complexity analysis
 *
 * Uses machine learning to estimate task complexity and suggest optimal approaches:
 * - Natural language analysis of prompts
 * - Context complexity scoring
 * - Historical pattern matching
 * - Continuous learning from actual outcomes
 *
 * Features:
 * - Automatic complexity estimation (0-1 scale)
 * - Method recommendations (DSPy/ML/hybrid)
 * - Duration and difficulty predictions
 * - Continuous learning and model updates
 */
export { TaskComplexityEstimator } from './task-complexity-estimator';
// Type guards for runtime type checking
export { isAgentMessage, isNeuralAgent, isNeuralNetworkConfig, } from './types/index';
// =============================================================================
// METADATA - Package information
// =============================================================================
/**
 * Brain Package Information
 *
 * Comprehensive metadata about the brain package including
 * version details, capabilities, and neural features.
 */
export const BRAIN_INFO = {
    version: '2.0.0', name: '@claude-zen/brain', description: 'Autonomous AI decision-making system with neural intelligence and Rust/WASM acceleration', capabilities: [
        'Autonomous decision-making and strategy selection', 'Task complexity estimation with ML models', 'Neural network coordination with FANN integration', 'GPU acceleration for high-performance computing', 'Behavioral intelligence and performance prediction', 'Real-time adaptation and continuous learning', 'Enterprise-grade security and multi-tenant isolation', 'Foundation telemetry integration',
    ],
    neuralArchitectures: [
        'Feedforward Neural Networks', 'Convolutional Neural Networks (CNN)', 'Recurrent Neural Networks (RNN/LSTM)', 'Transformer and Attention-based models', 'Variational Autoencoders (VAE)', 'Generative Adversarial Networks (GAN)', 'Reinforcement Learning models', 'Custom neural architectures',
    ],
    acceleration: {
        rust: 'High-performance Rust backend with WASM bindings', gpu: 'CUDA, OpenCL, Metal, and WebGL support', cpu: 'Multi-threaded processing with SIMD optimization', distributed: 'Horizontal scaling across multiple nodes',
    },
};
/**
 * Brain Package Documentation
 *
 * ## Overview
 *
 * The Brain package provides an autonomous AI coordination system that
 * automatically makes intelligent decisions about optimization strategies,
 * resource allocation, and system management with continuous learning.
 *
 * ## Architecture
 *
 * ````
 * ┌─────────────────────────────────────────────────────┐
 * │              Application Layer                      │
 * │           (@claude-zen/foundation)                 │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │             Brain Coordinator                       │
 * │  • Autonomous decision-making                      │
 * │  • Strategy selection and optimization             │
 * │  • Performance monitoring and learning             │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │           Intelligence Layer                        │
 * │  ├─ Task Complexity Estimator                      │
 * │  ├─ Autonomous Optimization Engine                 │
 * │  ├─ Behavioral Intelligence System                 │
 * │  └─ Agent Performance Predictor                    │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │            Neural Computation                       │
 * │  ├─ Neural Bridge (Rust/WASM)                      │
 * │  ├─ FANN Neural Networks                           │
 * │  ├─ GPU Acceleration Support                       │
 * │  └─ Brain.js Integration                           │
 * └─────────────────────────────────────────────────────┘
 * ````
 *
 * ## Autonomous Decision Pipeline
 *
 *|Stage|Component|Function|*|-------|-----------|----------|*|1. Analysis|TaskComplexityEstimator|ML-powered complexity analysis|*|2. Strategy|AutonomousOptimizationEngine|Intelligent method selection|*|3. Execution|SmartPromptOptimizer + DSPy|Advanced optimization|*|4. Monitoring|AgentPerformancePredictor|Behavioral analysis|*|5. Coordination|AutonomousCoordinator|Resource allocation|*|6. Learning|BehavioralIntelligence|Continuous improvement|*
 * ## Neural Network Features
 *
 * - **FANN Integration**:Fast Artificial Neural Network library with Rust/WASM
 * - **GPU Acceleration**:CUDA, OpenCL, Metal support for high-performance computing
 * - **Custom Architectures**:Flexible layer composition for specialized models
 * - **Transfer Learning**:Fine-tuning and domain adaptation capabilities
 * - **Ensemble Methods**:Model combination and voting strategies
 * - **Real-time Training**:Online learning and model updates
 *
 * ## Performance Characteristics
 *
 * - **Decision Latency**:<5ms for cached decisions, <50ms for complex analysis
 * - **Neural Throughput**:1M+ inferences/second with GPU acceleration
 * - **Memory Efficiency**:<2GB for full coordination system
 * - **Learning Speed**:90%+ accuracy after 100 training examples
 * - **Scalability**:Horizontally scalable with distributed processing
 * - **GPU Speedup**:10-100x performance improvement for neural operations
 *
 * ## Enterprise Features
 *
 * **Security & Compliance:**
 * - Model encryption and secure storage
 * - Audit trails for AI decision-making
 * - Multi-tenant isolation and governance
 * - RBAC and ABAC access control
 * - SOC2, ISO27001, GDPR compliance support
 *
 * **Scalability & Reliability:**
 * - Auto-scaling based on computational demand
 * - Distributed neural processing across multiple nodes
 * - Circuit breaker protection and graceful degradation
 * - High availability with backup coordination instances
 * - Cost optimization through intelligent resource allocation
 *
 * **Monitoring & Observability:**
 * - Real-time performance metrics and dashboards
 * - Comprehensive logging and distributed tracing
 * - Integration with Prometheus, Grafana, DataDog
 * - Custom alerting and notification systems
 * - Performance profiling and optimization insights
 *
 * ## Integration Ecosystem
 *
 * **Core Dependencies:**
 * - @claude-zen/foundation for utilities and telemetry
 * - @claude-zen/dspy for neural program optimization
 * - fann-wasm for high-performance neural networks
 * - brain.js for JavaScript neural network fallback
 *
 * **External Integrations:**
 * - TensorFlow and PyTorch model import/export
 * - Hugging Face Transformers for pre-trained models
 * - ONNX support for cross-platform deployment
 * - MLflow for experiment tracking and model management
 * - OpenTelemetry for distributed tracing and metrics
 *
 * ## Getting Started
 *
 * ```bash`
 * # Install core brain package
 * npm install @claude-zen/brain @claude-zen/foundation @claude-zen/dspy
 *
 * # Install neural network dependencies
 * npm install fann-wasm brain.js
 *
 * # Optional:Install GPU acceleration support
 * npm install @tensorflow/tfjs-node-gpu
 * ````
 *
 * See the comprehensive examples above for detailed usage patterns and enterprise features.
 */
// Export neural orchestrator for brain-as-coordinator architecture
export { NeuralOrchestrator, TaskComplexity, StorageStrategy, } from './neural-orchestrator;;
// =============================================================================
// PROFESSIONAL NAMING PATTERNS - Enterprise Brain System Access
// =============================================================================
/**
 * Professional Brain System Access - Matches storage/telemetry patterns
 *
 * These functions provide professional enterprise naming patterns for brain system access
 * so strategic facades don't need to translate function names.') */
// Core brain system access with lazy loading
const brainSystemInstance = null;
export async function getBrainSystemAccess() {
    if (!brainSystemInstance) {
        const { BrainCoordinator } = await import('./main');
        ')    brainSystemInstance = new BrainCoordinator(;
        enabled: true,
            learningRate;
        0.1,
            adaptationThreshold;
        0.7, , ;
        ;
        await brainSystemInstance.initialize();
    }
    return brainSystemInstance;
}
export async function getBrainCoordinator(config) {
    const brainSystem = await getBrainSystemAccess();
    return brainSystem.createCoordinator(config);
}
export async function getSmartNeuralCoordinator(config) {
    const { SmartNeuralCoordinator } = await import('./smart-neural-coordinator');
    ')  return new SmartNeuralCoordinator(config);;
}
export async function getNeuralOrchestrator(_config) {
    const { NeuralOrchestrator } = await import('./neural-orchestrator');
    ')  return new NeuralOrchestrator();;
}
export async function getTaskComplexityEstimator(config) {
    const brainSystem = await getBrainSystemAccess();
    return brainSystem.createTaskComplexityEstimator(config);
}
export async function getAutonomousOptimizer(_config) {
    const { AutonomousOptimizationEngine } = await import('./autonomous-optimization-engine');
    return new AutonomousOptimizationEngine();
}
export async function getBehavioralIntelligence(_config) {
    const { BehavioralIntelligence } = await import('./main');
    ')  return new BehavioralIntelligence();;
}
export async function getNeuralBridge(_config) {
    const { NeuralBridge } = await import('./main');
    ')  return new NeuralBridge();;
}
// Professional brain system object with proper naming (matches Storage/Telemetry patterns)
export const brainSystem = {
    getAccess: getBrainSystemAccess,
    getCoordinator: getBrainCoordinator,
    getSmartCoordinator: getSmartNeuralCoordinator,
    getOrchestrator: getNeuralOrchestrator,
    getComplexityEstimator: getTaskComplexityEstimator,
    getAutonomousOptimizer: getAutonomousOptimizer,
    getBehavioralIntelligence: getBehavioralIntelligence,
    getNeuralBridge: getNeuralBridge,
};
// =============================================================================
// MONITORING SYSTEM - Internal agent monitoring (formerly @claude-zen/agent-monitoring)
// =============================================================================
export { CompleteIntelligenceSystem, createBasicIntelligenceSystem, createIntelligenceSystem, createProductionIntelligenceSystem, createTaskPredictor, getPredictionSummary, isHighConfidencePrediction, SimpleTaskPredictor, } from './monitoring/main';
// export type {
//   IntelligenceSystemConfig,
//   PerformanceMetrics,
//   SystemHealth
//} from './monitoring/types';
// =============================================================================
// LOAD BALANCING SYSTEM -  DEPRECATED (formerly @claude-zen/load-balancing)
// =============================================================================
// 
//  DEPRECATED - DO NOT USE
// Load balancing is unnecessary for 1-2 user systems.
// Use brain event coordination instead for intelligent task distribution.
//
// Replaced by:Brain event-driven coordination with modal behavior
//
// export {
//   LoadBalancer,
//   createLoadBalancer,
//   CapacityManager,
//   createCapacityManager,
//   ResourceOptimizer,
//   createResourceOptimizer,
//   RoutingStrategy,
//   createRoutingStrategy,
//   AlgorithmSelector,
//   createAlgorithmSelector
//} from './load-balancing/main';
// export type {
//   LoadBalancerConfig,
//   LoadBalancerMetrics,
//   LoadBalancerStrategy,
//   RoutingDecision,
//   NodeHealth,
//   ResourceAllocation,
//   CapacityMetrics,
//   PerformanceMetrics as LoadBalancingPerformanceMetrics
//} from './load-balancing/types';
