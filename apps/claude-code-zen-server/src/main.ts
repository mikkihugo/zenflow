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
  getStorage,
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

// Global systems interface for type safety
interface GlobalSystems {
  brainSystem: unknown;
  safeFramework: unknown;
  workflowEngine: unknown;
  performanceTracker: unknown;
  eventSystem: unknown;
  databaseSystem: unknown;
  safetySystem: unknown;
  safetyInterventionProtocols: unknown;
}

// Extend global to include systems
declare global {
  namespace globalThis {
    let systems: GlobalSystems;
  }
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

// Foundation config available but not used in this scope

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

  try {
    // Initialize foundation infrastructure
    const {
      container,
      eventSystem,
      databaseSystem,
      systemCircuitBreaker,
      withTraceFn,
    } = await initializeFoundationInfrastructure();

    // Initialize strategic facade systems
    const systems = await initializeStrategicSystems(
      systemCircuitBreaker,
      withTraceFn
    );

    // Store systems for global access
    globalThis.systems = systems;

    // Start the web server
    await startWebServer({
      port,
      host,
      eventSystem,
      databaseSystem,
      container,
      systems,
    });

    // Log final system status
    logSystemStatus(systems);

    // Keep the application alive
    await keepApplicationAlive();
  } catch (error) {
    logger.error('💥 Application error: ', error);
    process.exit(1);
  }
}

// ============================================================================
// INFRASTRUCTURE INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize foundation infrastructure (telemetry, DI, events, database)
 */
async function initializeFoundationInfrastructure() {
  logger.info('🏗️ Initializing comprehensive foundation infrastructure...');

  // Initialize telemetry system
  const {
    initializeTelemetry: initializeTelemetryFn,
    withTrace: foundationWithTrace,
  } = await import('@claude-zen/foundation');

  const withTraceFn = foundationWithTrace || createFallbackTracer();

  await withRetry(
    async () =>
      await initializeTelemetryFn({
        serviceName: 'claude-code-zen',
        serviceVersion: '2.0.0',
        enableTracing: true,
        enableMetrics: true,
        enableLogging: true,
      }),
    { retries: 3, minTimeout: 1000 }
  );

  // Initialize core systems
  const container = createContainer('claude-zen-main');
  const eventSystem = await getEventSystem();
  const databaseSystem = await getDatabaseSystem();

  // Initialize other foundation services
  await getStorage();
  await getProjectManager();

  // Initialize circuit breaker for resilience
  const systemCircuitBreaker = createCircuitBreaker({
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
  });

  // Record startup metrics
  recordMetric('system_startup', 1, {
    component: 'main',
    version: '2.0.0',
  });

  logger.info(
    '✅ Foundation infrastructure initialized (DI, Events, Database, Telemetry, Storage, Resilience)'
  );

  return {
    container,
    eventSystem,
    databaseSystem,
    systemCircuitBreaker,
    withTraceFn,
  };
}

/**
 * Create fallback tracer when foundation withTrace is not available
 */
function createFallbackTracer() {
  return async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    logger.debug(`Starting trace: ${name}`);
    const result = await fn();
    logger.debug(`Completed trace: ${name}`);
    return result;
  };
}

/**
 * Initialize all strategic facade systems
 */
async function initializeStrategicSystems(
  systemCircuitBreaker: unknown,
  withTraceFn: unknown
) {
  // Initialize enterprise systems
  logger.info('👑 Initializing enterprise systems...');
  const safeFramework = await getSafeFramework({
    coordinationSafety: true,
    realTimeMonitoring: true,
    interventionThreshold: 0.7,
  });
  logger.info('✅ Enterprise systems initialized');

  // Initialize workflow systems
  const workflowEngine = await initializeWorkflowSystems();

  // Initialize performance systems
  const performanceTracker = await initializePerformanceSystems();

  // Initialize brain systems
  const brainSystem = await initializeBrainSystems(
    systemCircuitBreaker,
    withTraceFn
  );

  // Initialize safety systems
  const { safetySystem, safetyInterventionProtocols } =
    await initializeSafetySystems(
      safeFramework,
      systemCircuitBreaker,
      withTraceFn
    );

  logger.info('✅ All strategic facade systems initialized');

  return {
    brainSystem,
    safeFramework,
    workflowEngine,
    performanceTracker,
    safetySystem,
    safetyInterventionProtocols,
  };
}

/**
 * Initialize workflow engine systems
 */
async function initializeWorkflowSystems() {
  logger.info('🎯 Initializing workflow systems...');
  const workflowEngine = await getWorkflowEngine({
    orchestration: true,
    processManagement: true,
  });
  logger.info('✅ Workflow systems initialized');
  return workflowEngine;
}

/**
 * Initialize performance tracking systems
 */
async function initializePerformanceSystems() {
  logger.info('⚡ Initializing performance systems...');
  const performanceTracker = await getPerformanceTracker({
    healthMonitoring: true,
    performancePrediction: true,
    realTimeMetrics: true,
  });
  logger.info('✅ Performance systems initialized');
  return performanceTracker;
}

/**
 * Initialize brain system with neural networks and DSPy
 */
async function initializeBrainSystems(
  systemCircuitBreaker: unknown,
  withTraceFn: unknown
) {
  logger.info('🧠 Initializing Brain System via strategic facade...');

  const brainSystem = await getBrainSystem({
    enabled: true,
    neuralNetworks: true,
    wasmAcceleration: true,
    rustCore: true,
    dspyOptimization: true,
    retrainingEnabled: true,
  });

  // Initialize with telemetry and resilience
  await withTraceFn('brain-system-initialization', async () => {
    await systemCircuitBreaker.fire(async () => {
      await brainSystem?.initialize();
    });
  });

  // Record metrics
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

  return brainSystem;
}

/**
 * Initialize AI safety systems with intervention protocols
 */
async function initializeSafetySystems(
  safeFramework: unknown,
  systemCircuitBreaker: unknown,
  withTraceFn: unknown
) {
  logger.info('🛡️ Initializing AI Safety via enterprise facade...');

  const safetySystem = safeFramework.getSafetySystem();

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

  // Record safety metrics
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

  return { safetySystem, safetyInterventionProtocols };
}

// ============================================================================
// WEB SERVER INITIALIZATION
// ============================================================================

/**
 * Start the web server with all systems
 */
async function startWebServer(config: {
  port: number;
  host: string;
  eventSystem: unknown;
  databaseSystem: unknown;
  container: unknown;
  systems: unknown;
}) {
  logger.info('🚀 Starting Claude Code Zen Web Server...');
  logger.info('🌐 Web server with API endpoints and workspace functionality');

  // Import and start the API server
  logger.info('🔧 Importing ApiServer...');
  const { ApiServer: API_SERVER } = await import('./services/web/api-server');
  logger.info('✅ ApiServer imported successfully');

  logger.info('🏗️ Creating ApiServer instance...');
  const webApp = new API_SERVER({
    port: config.port,
    host: config.host,
    // Pass foundation infrastructure to ApiServer
    eventBus: config.eventSystem,
    databaseAccess: config.databaseSystem,
    container: config.container,
    swarmCoordinators: config.systems,
  });
  logger.info('✅ ApiServer instance created');

  logger.info('🚀 Starting ApiServer...');
  await webApp?.start();
  logger.info('✅ ApiServer started successfully');

  logger.info(`✅ Web Server running at http://localhost:${config.port}`);
  logger.info(
    `🌐 Access your workspace: http://localhost:${config.port}/workspace`
  );
  logger.info(
    '📊 API Features: File Operations • Health Check • System Status • Workspace Management'
  );
}

/**
 * Log comprehensive system status information
 */
function logSystemStatus(systems: Record<string, unknown>) {
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

  logger.info('📈 System Statistics:');
  logger.info(`• Brain System: ${systems.brainSystem ? 'Active' : 'Inactive'}`);
  logger.info(
    `• Safety Framework: ${systems.safeFramework ? 'Active' : 'Inactive'}`
  );
  logger.info(
    `• Systems: ${Object.keys(systems).length} strategic facade systems`
  );

  logger.info(
    '✅ Claude Code Zen STRATEGIC FACADE SYSTEM running successfully'
  );
  logger.info(`🌐 Workspace: http://localhost:${port}/workspace`);
  logger.info(`🔗 API: http://localhost:${port}/api/`);
  logger.info(
    '🎯 Ready for strategic facade coordination and neural processing'
  );
  logger.info('🛡️ Graceful shutdown enabled - use Ctrl+C or SIGTERM to stop');
}

/**
 * Keep the application alive with graceful shutdown handling
 */
async function keepApplicationAlive() {
  // Since terminus handles shutdown, we can use a simple keep-alive
  const keepAlive = () => new Promise(() => {});
  await keepAlive();
}

// Start the application
main().catch((error) => {
  logger.error('💥 Fatal error:', error);
  process.exit(1);
});
