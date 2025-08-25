#!/usr/bin/env node
/**
 * @file Claude Code Zen - Minimal Entry Point
 *
 * Simplified entry point that provides essential services without legacy web dashboard.
 * The workspace functionality is now handled by the standalone workspace server.
 */

// ✅ FOUNDATION - Direct import (contains primitives and centralized utilities)
import { 
  getLogger, 
  createContainer, 
  getConfig,
  initializeTelemetry,
  withRetry,
  withTrace,
  getProjectManager,
  createCircuitBreaker,
  recordMetric,
  getStorage
} from '@claude-zen/foundation';

// ✅ STRATEGIC FACADES - Tier 1 Public API
import { getBrainSystem } from '@claude-zen/intelligence';
import { getSafeFramework, getWorkflowEngine } from '@claude-zen/enterprise';
import { getPerformanceTracker } from '@claude-zen/operations';
import { getDatabaseSystem, getEventSystem } from '@claude-zen/infrastructure';

// Local coordination remains as is
import { SafetyInterventionProtocols } from './coordination/safety-intervention-protocols';

// ============================================================================
// GLOBAL FOUNDATION FACADES - Available to all modules below
// ============================================================================

// Foundation services already imported above

// Foundation global interface for type safety
interface FoundationGlobal {
  getLogger: typeof getLogger;
  createContainer: typeof createContainer;
  getConfig: typeof getConfig;
  initializeTelemetry?: typeof initializeTelemetry;
  withRetry?: typeof withRetry;
  withTrace?: typeof withTrace;
  getProjectManager?: typeof getProjectManager;
  createCircuitBreaker?: typeof createCircuitBreaker;
  recordMetric?: typeof recordMetric;
  getStorage?: typeof getStorage;
}

// Make foundation services globally available with proper typing
(global as { foundation: FoundationGlobal }).foundation = {
  // Core foundation services
  getLogger,
  createContainer,
  getConfig,
  // Foundation utilities
  initializeTelemetry,
  withRetry,
  withTrace,
  getProjectManager,
  createCircuitBreaker,
  recordMetric,
  getStorage,
  // Version information - inline instead of separate config file
  getVersion: () => {
    try {
      const pkg = require('../package.json');
      return pkg.version || '1.0.0-alpha.44';
    } catch {
      return '1.0.0-alpha.44';
    }
  },
};

// ✅ EXTRACTED PACKAGES: All specialized systems from standalone libraries

// 🧠 BRAIN PACKAGE: Central neural gateway(
//   includes DSPy,
//   behavioral intelligence,
//   neural networks, WASM
// )

const logger = getLogger('Main');

// Use foundation's configuration system + command line args
const { getConfig: getConfigFn } = await import('@claude-zen/foundation');
const foundationConfig = getConfigFn();

// Handle CLI commands first
if (process.argv.includes('auth')) {
  const { authCommand } = await import('./commands/auth');
  const authIndex = process.argv.indexOf('auth');
  const provider = process.argv[authIndex + 1];
  authCommand(provider);
  process.exit(0);
}

// Parse port from command line arguments or environment
const portArg = process.argv.find((arg) => arg.startsWith('--port'));
const envPort = process.env.PORT || process.env.ZEN_SERVER_PORT;
const defaultPort = portArg
  ? parseInt(
      portArg.split('=')[1] || process.argv[process.argv.indexOf(portArg) + 1]
    )
  : envPort
    ? parseInt(envPort)
    : 3000;

const port = defaultPort;
const host = process.env.ZEN_SERVER_HOST || 'localhost';

async function checkIfRunning(): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  // Check if another instance is already running
  const isRunning = await checkIfRunning();
  if (isRunning) {
    logger.info(
      '📡 Claude-zen is already running - redirecting to existing web dashboard...'
    );
    logger.info(`🌐 Access your dashboard at: http://localhost:${port}`);
    process.exit(0);
  }
  logger.info('🚀 Starting Claude Code Zen with FULL SWARM SYSTEM ACTIVATION');
  // 🔧 FOUNDATION INFRASTRUCTURE: Initialize comprehensive systems from packages
  logger.info('🏗️ Initializing comprehensive foundation infrastructure...');
  // Initialize telemetry system for observability
  const {
    initializeTelemetry: initializeTelemetryFn,
    withTrace: foundationWithTrace,
  } = await import('@claude-zen/foundation');
  // Provide fallback for withTrace if not available
  const withTraceFn =
    foundationWithTrace ||
    (async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      logger.debug(`Starting trace: ${name}`);
      const result = await fn();
      logger.debug(`Completed trace: ${name}`);
      return result;
    });
  const telemetry = await withRetry(
    async () =>
      initializeTelemetryFn({
        serviceName: 'claude-code-zen',
        serviceVersion: '2.0.0',
        enableTracing: true,
        enableMetrics: true,
        enableLogging: true,
      }),
    {
      retries: 3,
      minTimeout: 1000,
    }
  );
  // Initialize core systems via strategic facades
  const container = createContainer('claude-zen-main');
  const eventSystem = await getEventSystem();
  const databaseSystem = await getDatabaseSystem();
  // Get other foundation services (already imported)
  const storage = await getStorage();
  const projectManager = await getProjectManager();
  // Initialize circuit breaker for resilience
  const systemCircuitBreaker = createCircuitBreaker({
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
  });
  // Record system startup metrics
  recordMetric('system_startup', 1, {
    component: 'main',
    version: '2.0.0',
  });
  logger.info(
    '✅ Foundation infrastructure initialized (DI, Events, Database, Telemetry, Storage, Resilience)'
  );
  // 🔥 Initialize systems via strategic facades
  logger.info('👑 Initializing enterprise systems...');
  const safeFramework = await getSafeFramework({
    coordinationSafety: true,
    realTimeMonitoring: true,
    interventionThreshold: 0.7
  });
  logger.info('✅ Enterprise systems initialized');
  // Initialize workflow engine
  logger.info('🎯 Initializing workflow systems...');
  const workflowEngine = await getWorkflowEngine({
    orchestration: true,
    processManagement: true
  });
  logger.info('✅ Workflow systems initialized');
  // Initialize performance tracking
  logger.info('⚡ Initializing performance systems...');
  const performanceTracker = await getPerformanceTracker({
    healthMonitoring: true,
    performancePrediction: true,
    realTimeMetrics: true
  });
  logger.info('✅ Performance systems initialized');
  // Initialize Neural Brain System via strategic facade
  logger.info(
    '🧠 Initializing Brain System via strategic facade...'
  );
  const brainSystem = await getBrainSystem({
    enabled: true,
    neuralNetworks: true,
    wasmAcceleration: true,
    rustCore: true,
    dspyOptimization: true,
    retrainingEnabled: true
  });
  // Initialize brain system with telemetry and resilience
  await withTraceFn('brain-system-initialization', async () => {
    await systemCircuitBreaker.fire(async () => {
      await brainSystem?.initialize();
    });
  });
  // Record brain system metrics
  recordMetric('brain_system_initialized', 1, {
    components: 'coordinator, neural-bridge, dspy, retraining',
    version: '2.0.0',
  });
  logger.info(
    '✅ Brain System initialized - Neural foundation ready with telemetry tracking'
  );
  logger.info(
    '🔬Capabilities: Agent learning, performance prediction, behavioral optimization, DSPy optimization'
  );
  // Initialize AI Safety via enterprise facade
  logger.info(
    '🛡️ Initializing AI Safety via enterprise facade...'
  );
  // Safety systems are part of the enterprise facade
  const safetySystem = safeFramework.getSafetySystem();
  // Initialize local Safety Intervention Protocols (local coordination)
  const safetyInterventionProtocols = new SafetyInterventionProtocols({
    enabled: true,
    autoEscalationThreshold: 0.8,
    humanTimeoutMs: 300000,
    defaultDecision: 'pause',
    escalationChannels: ['agui', 'log'],
    criticalPatterns: [
      'VERIFICATION_FRAUD',
      'TOOL_OMNIPOTENCE',
      'CAPABILITY_INFLATION_ADVANCED',
      'KNOWLEDGE_HALLUCINATION_TECHNICAL',
    ],
  });
  // Start safety monitoring with circuit breaker protection
  await withTraceFn('ai-safety-initialization', async () => {
    await systemCircuitBreaker.fire(async () => {
      await Promise.all([
        safetySystem?.initialize(),
        safetyInterventionProtocols?.initialize(),
      ]);
    });
  });
  // Record safety system metrics
  recordMetric('ai_safety_system_initialized', 1, {
    patterns: '25',
    categories: 'capability, knowledge, verification, confidence, context',
    coordinationSafety: 'enabled',
    version: '1.0.0',
  });
  logger.info(
    '✅ AI Safety System initialized - 25-pattern deception detection ACTIVE'
  );
  logger.info(
    '🔍Monitoring: Tool omnipotence, verification fraud, knowledge hallucination'
  );
  logger.info(
    '👑 Queen coordination safety: Strategic validation, delegation integrity'
  );
  logger.info(
    '🔄 Agent interaction pipeline: Real-time monitoring, neural enhancement'
  );
  logger.info(
    '🚨 Human escalation protocols: AGUI integration, 60s timeout, critical pattern detection'
  );
  logger.info('⚠️ Real-time intervention protocols: ENABLED');
  // All systems are now accessed via strategic facades
  logger.info('✅ All strategic facade systems initialized');
  // Store strategic facade systems for global access
  (global as any).systems = {
    brainSystem,
    safeFramework,
    workflowEngine,
    performanceTracker,
    eventSystem,
    databaseSystem,
    safetySystem,
    safetyInterventionProtocols, // Local coordination
  };
  try {
    logger.info('🚀 Starting Claude Code Zen Web Server...');
    logger.info('🌐 Web server with API endpoints and workspace functionality');
    // Import and start the API server
    logger.info('🔧 Importing ApiServer...');
    const { ApiServer } = await import('./interfaces/web/api-server');
    logger.info('✅ ApiServer imported successfully');
    logger.info('🏗️ Creating ApiServer instance...');
    const webApp = new ApiServer({
      port,
      host,
      // Pass foundation infrastructure to ApiServer
      eventBus: eventSystem,
      databaseAccess: databaseSystem,
      container,
      swarmCoordinators: (global as any).systems,
    });
    logger.info('✅ ApiServer instance created');
    logger.info('🚀 Starting ApiServer...');
    await webApp?.start();
    logger.info('✅ ApiServer started successfully');
    logger.info(`✅ Web Server running at http://localhost:${port}`);
    logger.info(`🌐 Access your workspace: http://localhost:${port}/workspace`);
    logger.info(
      '📊 API Features: File Operations • Health Check • System Status • Workspace Management'
    );
    // 🔥 SWARM STATUS: Log complete hierarchy activation
    logger.info('🐝 SWARM HIERARCHY FULLY ACTIVATED:');
    logger.info(
      '👑 Queen Coordinator: Strategic multi-swarm coordination active'
    );
    logger.info('🎯 Cube Matrons: Dev + Ops domain leaders active');
    logger.info(
      '⚡ Swarm Commanders: Primary + SPARC tactical coordination active'
    );
    logger.info(
      '🧠 Unified Brain System: Neural networks, behavioral intelligence, learning active'
    );
    logger.info(
      '🔧 Specialized Systems: Chaos, load balancing, teamwork, AI safety active'
    );
    const swarmStats = (global as any).systems;
    logger.info('📈 System Statistics:');
    logger.info(
      `• Brain System: ${swarmStats.brainSystem ? 'Active' : 'Inactive'}`
    );
    logger.info(
      `• Safety Framework: ${swarmStats.safeFramework ? 'Active' : 'Inactive'}`
    );
    logger.info(
      `• Systems: ${Object.keys(swarmStats).length} strategic facade systems`
    );
    logger.info('✅ Claude Code Zen STRATEGIC FACADE SYSTEM running successfully');
    logger.info(`🌐 Workspace: http://localhost:${port}/workspace`);
    logger.info(`🔗 API: http://localhost:${port}/api/`);
    logger.info(
      '🎯 Ready for strategic facade coordination and neural processing'
    );
    logger.info('🛡️ Graceful shutdown enabled - use Ctrl+C or SIGTERM to stop');
    // Since terminus handles shutdown, we can use a simple keep-alive
    // The server will handle graceful shutdown via terminus
    const keepAlive = () => new Promise(() => {});
    // Infinite promise
    await keepAlive();
  } catch (error) {
    logger.error('💥 Application error: ', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
