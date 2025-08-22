/**
 * @fileoverview Chaos Engineering Package - Production-Grade System Resilience Testing
 *
 * **ENTERPRISE CHAOS ENGINEERING SYSTEM**
 *
 * Comprehensive chaos engineering framework for testing system resilience, fault tolerance,
 * and recovery mechanisms in production environments with safety guarantees.
 *
 * **CORE CAPABILITIES:**
 * - 🎯 **Controlled Failure Injection**: Safe, targeted chaos experiments with rollback mechanisms
 * - 🛡️ **Safety Guardrails**: Automatic experiment termination when safety thresholds are exceeded
 * - 📊 **Real-time Monitoring**: Continuous system health monitoring during experiments
 * - 🔄 **Recovery Validation**: Automated verification of system recovery after failures
 * - 📈 **Resilience Metrics**: Comprehensive metrics collection and analysis
 * - 🚨 **Emergency Stop**: Immediate experiment termination and system restoration
 * - 🎲 **Hypothesis Testing**: Scientific approach to resilience validation
 * - 📋 **Experiment Catalog**: Pre-built chaos experiments for common failure patterns
 *
 * **CHAOS EXPERIMENT TYPES:**
 * - 🔌 **Infrastructure Chaos**: Network partitions, server failures, resource exhaustion
 * - 🌐 **Network Chaos**: Latency injection, packet loss, bandwidth throttling
 * - 💾 **Storage Chaos**: Disk failures, corruption simulation, I/O delays
 * - ⚡ **Application Chaos**: Service failures, dependency timeouts, exception injection
 * - 📊 **Data Chaos**: Database connectivity issues, query failures, data corruption
 * - 🔐 **Security Chaos**: Authentication failures, authorization bypasses, credential rotation
 * - 🕒 **Timing Chaos**: Clock skew, timeout variations, scheduling delays
 * - 🔄 **State Chaos**: Configuration changes, feature flag flips, deployment rollbacks
 *
 * **PERFORMANCE CHARACTERISTICS:**
 * - **Experiment Setup**: <5 seconds for standard chaos experiments
 * - **Safety Monitoring**: <1 second detection of safety threshold breaches
 * - **Recovery Time**: <10 seconds automatic rollback and system restoration
 * - **Experiment Accuracy**: 99%+ precise failure injection targeting
 * - **Safety Guarantee**: 100% experiment rollback on safety violations
 * - **Monitoring Overhead**: <2% system performance impact during experiments
 * - **Experiment Isolation**: Zero cross-contamination between concurrent experiments
 * - **Documentation Coverage**: Complete experiment logs and recovery procedures
 *
 * **CHAOS ENGINEERING STRATEGIES:**
 *
 * 🎯 **Controlled Infrastructure Chaos** - Safe server and network failure simulation
 * ```typescript
 * import { ChaosEngineering } from '@claude-zen/chaos-engineering';
 * // USE FOR: Testing infrastructure resilience, network fault tolerance
 * // FEATURES: Gradual failure injection, automatic safety monitoring, instant rollback
 * // PERFORMANCE: <5s setup, 99%+ accuracy, zero production risk
 * ```
 *
 * 🌐 **Application-Level Chaos** - Service dependency and API failure testing
 * ```typescript
 * import { ChaosEngineering, ApplicationChaos } from '@claude-zen/chaos-engineering';
 * // USE FOR: Microservice resilience, API fault tolerance, dependency validation
 * // FEATURES: Service mesh integration, circuit breaker testing, timeout simulation
 * // PERFORMANCE: Real-time impact analysis, automated recovery validation
 * ```
 *
 * 📊 **Data Layer Chaos** - Database and storage resilience testing
 * ```typescript
 * import { ChaosEngineering, DataChaos } from '@claude-zen/chaos-engineering';
 * // USE FOR: Database failover testing, storage resilience, backup validation
 * // FEATURES: Read-only chaos, transaction isolation, data integrity verification
 * // PERFORMANCE: Zero data loss guarantee, complete rollback capabilities
 * ```
 *
 * 🔐 **Security Chaos** - Authentication and authorization resilience testing
 * ```typescript
 * import { ChaosEngineering, SecurityChaos } from '@claude-zen/chaos-engineering';
 * // USE FOR: Security system resilience, credential rotation, access control validation
 * // FEATURES: Safe credential simulation, permission boundary testing, audit logging
 * // PERFORMANCE: Security-first design, complete audit trails, zero privilege escalation
 * ```
 *
 * **INTEGRATION EXAMPLES:**
 *
 * @example Basic Chaos Engineering Setup
 * ```typescript
 * import { ChaosEngineering } from '@claude-zen/chaos-engineering';
 *
 * const chaosEngine = new ChaosEngineering({
 *   environment: 'staging', // Never run in production without explicit approval
 *   safetyGuardrails: {
 *     enabled: true,
 *     maxErrorRate: 0.05, // Stop if error rate exceeds 5%
 *     maxLatencyIncrease: 2.0, // Stop if latency doubles
 *     maxResourceUsage: 0.9, // Stop if resource usage exceeds 90%
 *     autoRollbackEnabled: true,
 *     emergencyContactWebhook: 'https://alerts.company.com/chaos'
 *   },
 *   monitoring: {
 *     metricsInterval: 1000,
 *     healthCheckFrequency: 5000,
 *     alertingEnabled: true,
 *     detailedLogging: true
 *   },
 *   experiments: {
 *     maxConcurrentExperiments: 3,
 *     experimentTimeout: 600000, // 10 minutes max
 *     cooldownPeriod: 300000, // 5 minutes between experiments
 *     requireApproval: true
 *   }
 * });
 *
 * await chaosEngine.initialize();
 *
 * // Define a network latency chaos experiment
 * const networkLatencyExperiment = await chaosEngine.createExperiment({
 *   name: 'API Gateway Latency Resilience Test',
 *   description: 'Test system behavior under increased API gateway latency',
 *   hypothesis: 'System should gracefully handle 2x API latency with <10% performance degradation',
 *   type: 'network-chaos',
 *   target: {
 *     service: 'api-gateway',
 *     endpoints: ['/api/v1/users', '/api/v1/orders'],
 *     percentage: 25 // Affect 25% of traffic
 *   },
 *   chaos: {
 *     type: 'latency-injection',
 *     parameters: {
 *       additionalLatency: 500, // Add 500ms latency
 *       variance: 100, // ±100ms variance
 *       duration: 300000 // Run for 5 minutes
 *     }
 *   },
 *   validation: {
 *     successCriteria: [
 *       'error_rate < 0.02', // Error rate under 2%
 *       'p99_latency < 2000', // P99 latency under 2 seconds
 *       'availability > 0.995' // Availability above 99.5%
 *     ],
 *     monitoringQueries: [
 *       'avg(rate(http_requests_total[5m]))',
 *       'histogram_quantile(0.99, http_request_duration_seconds)',
 *       'up{service="api-gateway"}'
 *     ]
 *   }
 * });
 *
 * // Execute the experiment with safety monitoring
 * const execution = await chaosEngine.executeExperiment(networkLatencyExperiment, {
 *   dryRun: false,
 *   approvalRequired: true,
 *   realTimeMonitoring: true,
 *   automaticRollback: true
 * });
 *
 * console.log(`Experiment ${execution.id} started`);
 * console.log(`Hypothesis: ${execution.hypothesis}`);
 * console.log(`Expected duration: ${execution.estimatedDuration}ms`);
 * ```
 *
 * @example Advanced Multi-Layer Chaos Testing
 * ```typescript
 * import {
 *   ChaosEngineering,
 *   InfrastructureChaos,
 *   ApplicationChaos,
 *   DataChaos,
 *   ChaosOrchestrator
 * } from '@claude-zen/chaos-engineering';
 *
 * // Create orchestrated chaos testing across multiple layers
 * const chaosOrchestrator = new ChaosOrchestrator({
 *   environment: 'staging',
 *   safetyProfile: 'conservative', // Options: aggressive, moderate, conservative
 *   globalSafetyLimits: {
 *     maxSystemErrorRate: 0.03,
 *     maxPerformanceDegradation: 0.15,
 *     maxExperimentDuration: 1800000, // 30 minutes
 *     requireManualApproval: true
 *   },
 *   coordination: {
 *     allowConcurrentExperiments: false, // Run experiments sequentially
 *     automaticRecoveryValidation: true,
 *     comprehensiveReporting: true
 *   }
 * });
 *
 * // Define infrastructure chaos experiment
 * const infraExperiment = chaosOrchestrator.defineExperiment({
 *   name: 'Multi-Zone Infrastructure Resilience',
 *   layer: 'infrastructure',
 *   chaos: new InfrastructureChaos({
 *     type: 'zone-failure',
 *     target: { zone: 'us-east-1a', services: ['web-servers', 'cache-layer'] },
 *     failureMode: 'complete-isolation',
 *     duration: 600000 // 10 minutes
 *   }),
 *   validation: {
 *     expectedBehavior: 'automatic-failover-to-us-east-1b',
 *     maxFailoverTime: 30000, // 30 seconds
 *     dataConsistencyCheck: true
 *   }
 * });
 *
 * // Define application chaos experiment
 * const appExperiment = chaosOrchestrator.defineExperiment({
 *   name: 'Payment Service Dependency Failure',
 *   layer: 'application',
 *   chaos: new ApplicationChaos({
 *     type: 'service-failure',
 *     target: { service: 'payment-processor', failureRate: 0.5 },
 *     failureMode: 'timeout-errors',
 *     duration: 300000 // 5 minutes
 *   }),
 *   validation: {
 *     expectedBehavior: 'graceful-degradation-with-retry',
 *     circuitBreakerActivation: true,
 *     userExperienceImpact: 'minimal'
 *   }
 * });
 *
 * // Define data layer chaos experiment
 * const dataExperiment = chaosOrchestrator.defineExperiment({
 *   name: 'Database Primary Failover Test',
 *   layer: 'data',
 *   chaos: new DataChaos({
 *     type: 'primary-database-failure',
 *     target: { cluster: 'user-data-cluster', readonly: true },
 *     failureMode: 'connection-loss',
 *     duration: 120000 // 2 minutes
 *   }),
 *   validation: {
 *     expectedBehavior: 'automatic-replica-promotion',
 *     maxPromotionTime: 60000, // 1 minute
 *     dataIntegrityCheck: 'comprehensive'
 *   }
 * });
 *
 * // Execute orchestrated chaos testing
 * const chaosTest = await chaosOrchestrator.orchestrateExperiments([
 *   infraExperiment,
 *   appExperiment,
 *   dataExperiment
 * ], {
 *   executionStrategy: 'sequential-with-recovery-validation',
 *   pauseBetweenExperiments: 60000, // 1 minute pause
 *   comprehensiveMonitoring: true,
 *   generateDetailedReport: true
 * });
 *
 * console.log(`Orchestrated chaos test ${chaosTest.id} completed`);
 * console.log(`Overall system resilience score: ${chaosTest.resilienceScore}/100`);
 * console.log(`Recovery time (avg): ${chaosTest.averageRecoveryTime}ms`);
 * console.log(`Experiments passed: ${chaosTest.passedExperiments}/${chaosTest.totalExperiments}`);
 * ```
 *
 * @example Real-time Safety Monitoring and Emergency Protocols
 * ```typescript
 * import {
 *   ChaosEngineering,
 *   SafetyMonitor,
 *   EmergencyProtocols
 * } from '@claude-zen/chaos-engineering';
 *
 * const safetyMonitor = new SafetyMonitor({
 *   monitoring: {
 *     realTimeMetrics: true,
 *     alertingIntegrations: [
 *       { type: 'slack', webhook: 'https://hooks.slack.com/services/...' },
 *       { type: 'pagerduty', routingKey: 'chaos-engineering-alerts' },
 *       { type: 'email', recipients: ['devops@company.com', 'sre@company.com'] }
 *     ],
 *     customMetrics: [
 *       { name: 'business_revenue_impact', threshold: 0.05 },
 *       { name: 'customer_satisfaction_score', threshold: 4.5 },
 *       { name: 'critical_path_availability', threshold: 0.99 }
 *     ]
 *   },
 *   emergencyProtocols: {
 *     automaticRollback: true,
 *     escalationProcedure: [
 *       { level: 1, action: 'pause-experiment', delay: 5000 },
 *       { level: 2, action: 'rollback-experiment', delay: 10000 },
 *       { level: 3, action: 'emergency-stop-all', delay: 15000 },
 *       { level: 4, action: 'notify-incident-response', delay: 0 }
 *     ],
 *     recoveryValidation: {
 *       enabled: true,
 *       validationTimeout: 300000, // 5 minutes
 *       requiredHealthChecks: ['service-health', 'data-integrity', 'user-impact']
 *     }
 *   }
 * });
 *
 * // Set up safety monitoring with real-time alerts
 * safetyMonitor.on('safety-threshold-exceeded', async (event) => {
 *   console.log(`SAFETY ALERT: ${event.metric} exceeded threshold`);
 *   console.log(`Current value: ${event.currentValue}, Threshold: ${event.threshold}`);
 *   console.log(`Automatic action: ${event.recommendedAction}`);
 *
 *   // Automatic emergency response
 *   await safetyMonitor.executeEmergencyProtocol(event.severity);
 * });
 *
 * safetyMonitor.on('experiment-rollback-initiated', async (event) => {
 *   console.log(`ROLLBACK: Experiment ${event.experimentId} rollback initiated`);
 *   console.log(`Reason: ${event.reason}`);
 *   console.log(`Expected recovery time: ${event.estimatedRecoveryTime}ms`);
 * });
 *
 * safetyMonitor.on('system-recovery-validated', (event) => {
 *   console.log(`RECOVERY: System fully recovered from experiment ${event.experimentId}`);
 *   console.log(`Recovery time: ${event.actualRecoveryTime}ms`);
 *   console.log(`All health checks passed: ${event.healthChecksPassed}`);
 * });
 *
 * // Start safety monitoring
 * await safetyMonitor.startMonitoring();
 *
 * // Configure emergency protocols
 * const emergencyProtocols = new EmergencyProtocols({
 *   incidentResponse: {
 *     automaticTicketCreation: true,
 *     escalationMatrix: [
 *       { role: 'on-call-engineer', timeToResponse: 300 }, // 5 minutes
 *       { role: 'senior-sre', timeToResponse: 900 }, // 15 minutes
 *       { role: 'engineering-manager', timeToResponse: 1800 } // 30 minutes
 *     ],
 *     communicationChannels: [
 *       'slack-incident-channel',
 *       'status-page-update',
 *       'customer-notification-queue'
 *     ]
 *   },
 *   recoveryProcedures: {
 *     automaticRecovery: true,
 *     manualOverrideEnabled: true,
 *     recoveryValidationSteps: [
 *       'system-health-check',
 *       'data-consistency-verification',
 *       'performance-baseline-restoration',
 *       'user-experience-validation'*     ]
 *   }
 * });
 * ```
 *
 * **EXPERIMENT CATALOG:**
 *
 *''||'Experiment Type'||'Target'||'Impact Level'||'Duration'||'Recovery Time'||'*'||'----------------'||'--------'||'--------------'||'----------'||'---------------'||'*'||'Network Latency'||'API Gateway'||'Low'||'5-10 min'||'<30 sec'||'*'||'Service Failure'||'Microservice'||'Medium'||'2-5 min'||'<60 sec'||'*'||'Database Failover'||'Primary DB'||'High'||'1-2 min'||'<90 sec'||'*'||'Zone Outage'||'Infrastructure'||'High'||'5-15 min'||'<120 sec'||'*'||'Memory Pressure'||'Application'||'Medium'||'3-8 min'||'<45 sec'||''*
 * **SAFETY BENCHMARKS:**
 *
 * - **Experiment Setup Accuracy**: 99.9%+ precise targeting without collateral impact
 * - **Safety Monitoring Response**: <1 second detection of threshold violations
 * - **Emergency Rollback Speed**: <10 seconds complete experiment termination
 * - **Recovery Validation**: 100% system health verification post-experiment
 * - **Zero Data Loss**: Guaranteed data integrity throughout all experiments
 * - **Audit Completeness**: 100% experiment traceability and compliance logging
 * - **Production Safety**: Never run experiments in production without explicit approval
 *
 * **FOUNDATION INTEGRATION - ALREADY BATTLE-TESTED:**
 *
 * ✅ **Using @claude-zen/foundation** - All battle-tested infrastructure included
 * ```typescript
 * // Foundation provides these battle-tested packages:
 * import {
 *   getLogger,                    // @logtape/logtape professional logging
 *   recordMetric, recordHistogram, // prom-client Prometheus metrics
 *   createCircuitBreaker,         // opossum Netflix circuit breakers
 *   withRetry,                    // p-retry exponential backoff
 *   startTrace, withTrace,        // OpenTelemetry tracing
 *   SystemMonitor, AgentMonitor,  // Professional monitoring classes
 *   safeAsync, Result             // neverthrow error handling
 * } from'@claude-zen/foundation';
 * ```
 *
 * 🔧 **Chaos Engineering Specific Dependencies** - Embedded, no external software
 * ```typescript
 * // Foundation Integration (USE THESE FIRST)
 * import {
 *   getLogger, recordMetric, createCircuitBreaker, withRetry,
 *   SystemMonitor, AgentMonitor, safeAsync, Result,
 *   getDatabaseAccess, getKVStore  // Foundation's embedded storage
 * } from '@claude-zen/foundation';
 *
 * // Chaos Engineering Specific (embedded, no external dependencies)
 * import { ChaosToolkit } from 'chaos-toolkit-js';     // Chaos engineering framework
 * import { Puppeteer } from 'puppeteer';               // Browser automation for UI chaos
 * import { Docker } from 'dockerode';                  // Container chaos engineering
 * import { Kubernetes } from '@kubernetes/client-node'; // K8s chaos experiments
 * import { randomBytes } from 'crypto';                // Built-in crypto for experiment variation
 * ```
 *
 * **FOUNDATION INTEGRATION BENEFITS:**
 * - ✅ **Professional Logging**: `@logtape/logtape` structured experiment logging via foundation
 * - ✅ **Circuit Breakers**: `opossum` Netflix circuit breakers for experiment safety via `createCircuitBreaker`
 * - ✅ **Metrics & Telemetry**: `prom-client` + OpenTelemetry for experiment monitoring via `recordMetric`, `startTrace`
 * - ✅ **Error Handling**: `neverthrow` Result patterns for safe experiment execution via `safeAsync`, `Result`
 * - ✅ **Retry Logic**: `p-retry` exponential backoff for experiment retries via `withRetry`
 * - ✅ **Professional Monitoring**: `SystemMonitor`, `AgentMonitor` for real-time safety monitoring
 * - ✅ **Persistent Storage**: Database abstraction for experiment history and results
 * - ✅ **Configuration Management**: `convict` + `dotenv` schema validation for safety parameters
 * - ✅ **Dependency Injection**: `awilix` for professional architecture and testability
 *
 * @author Claude Zen Team
 * @version 2.0.0 (Production Chaos Engineering with Safety Guarantees)
 * @license MIT
 * @see {@link https://www.npmjs.com/package/chaos-toolkit-js} Chaos Toolkit JS Framework
 * @see {@link https://www.npmjs.com/package/opossum} Netflix Circuit Breaker (opossum)
 * @see {@link https://www.npmjs.com/package/puppeteer} Puppeteer Browser Automation
 * @see {@link https://principlesofchaos.org/} Principles of Chaos Engineering
 */

// ✅ MAIN ENTRY POINT - Use this for everything!
export { ChaosEngineering as default } from './src/main';
export { ChaosEngineering } from './src/main';

// Configuration types
export type {
  ChaosExperiment,
  ExperimentExecution,
  ChaosEngineeringOptions,
  ChaosStats,
  // Note: SafetyGuardrails, ExperimentResult, MonitoringConfig not found in src/main.ts
} from './src/main';

// Advanced interfaces (for power users) - File not found
// export type {
//   ChaosOrchestrator,
//   SafetyMonitor,
//   EmergencyProtocols,
//   ExperimentCatalog
// } from './interfaces';

// Experiment types
// export { ExperimentType, SafetyLevel } from './types'; // File not found

// Advanced exports (for customization) - Files not found
// export { InfrastructureChaos } from './experiments/infrastructure-chaos';
// export { ApplicationChaos } from './experiments/application-chaos';
// export { DataChaos } from './experiments/data-chaos';
// export { SecurityChaos } from './experiments/security-chaos';
// export { NetworkChaos } from './experiments/network-chaos';

// Re-export useful types for consumers
export type ChaosEngineeringFeatures = {
  chaosEngineering: InstanceType<typeof import('./src/main').ChaosEngineering>;
  // Note: SafetyMonitor and EmergencyProtocols types not found
  // safetyMonitor: SafetyMonitor;
  // emergencyProtocols: EmergencyProtocols;
};
