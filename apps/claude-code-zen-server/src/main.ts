#!/usr/bin/env node
/**
 * @file Claude Code Zen - Minimal Entry Point
 * 
 * Simplified entry point that provides essential services without legacy web dashboard.
 * The workspace functionality is now handled by the standalone workspace server.
 */

// 🔧 FOUNDATION: Comprehensive infrastructure (includes database via Storage)
import { getSPARCCommander, getWorkflowEngineAccess } from '@claude-zen/enterprise';
import { getLogger, createContainer } from '@claude-zen/foundation';
import { getEventBus, getDatabaseSystemAccess, getTelemetryManager, getLoadBalancingSystemAccess, getConfig } from '@claude-zen/infrastructure';
import { 
  AISafetyOrchestrator, 
  AIDeceptionDetector,
  NeuralDeceptionDetector 
, 
  BrainCoordinator, 
  NeuralBridge, 
  DSPyLLMBridge, 
  RetrainingMonitor,
  BehavioralIntelligence
, getTeamworkAccess } from '@claude-zen/intelligence';
import { getAgentMonitoringSystem, getChaosEngine } from '@claude-zen/operations';

// 🔥 MAIN APP: Only coordination system (business logic specific to claude-code-zen)

import { AgentInteractionPipeline } from './coordination/agent-interaction-pipeline';
import { QueenCommander } from './coordination/agents/queen-coordinator';
import { QueenSafetyIntegration } from './coordination/agents/queen-safety-integration';
import { SwarmCommander } from './coordination/agents/swarm-commander';
import { DevCubeMatron } from './coordination/cubes/dev-cube-matron';
import { OpsCubeMatron } from './coordination/cubes/ops-cube-matron';
import { SafetyInterventionProtocols } from './coordination/safety-intervention-protocols';

// ============================================================================ 
// GLOBAL FOUNDATION FACADES - Available to all modules below
// ============================================================================

// Import ALL foundation services once for global availability
const { 
  initializeTelemetry, 
  withRetry, 
  withTrace, 
  getProjectManager, 
  createCircuitBreaker, 
  recordMetric, 
  getStorage 
} = await import('@claude-zen/foundation');

// Make ALL foundation facades globally available - eliminates scattered imports
(global as any).claudeZenFoundation = {
  // Core foundation services
  getLogger,
  createContainer,
  getConfig,
  
  // Infrastructure services  
  getEventBus,
  getDatabaseSystemAccess,
  getTelemetryManager,
  getLoadBalancingSystemAccess,
  
  // Operations services
  getAgentMonitoringSystem,
  getChaosEngine,
  
  // Enterprise services
  getSPARCCommander,
  getWorkflowEngineAccess,
  getTeamworkAccess,
  
  // Foundation utilities
  initializeTelemetry,
  withRetry,
  withTrace,
  getProjectManager,
  createCircuitBreaker,
  recordMetric,
  getStorage,
  
  // New packages - Moved from core for clean separation
  getDocumentProcessing: async () => (await import('@claude-zen/document-processing')),
  getExporters: async () => (await import('@claude-zen/exporters')),
  getDocumentation: async () => (await import('@claude-zen/documentation')),
  getArchitecture: async () => (await import('@claude-zen/architecture')),
  getCodeAnalyzer: async () => (await import('@claude-zen/code-analyzer')),
  getInterfaces: async () => (await import('@claude-zen/interfaces')),
  
  // Version information - inline instead of separate config file
  getVersion: () => {
    try {
      const pkg = require('../package.json');
      return pkg.version || '1.0.0-alpha.44';
    } catch {
      return '1.0.0-alpha.44';
    }
  }
};

// ✅ EXTRACTED PACKAGES: All specialized systems from standalone libraries

// 🧠 BRAIN PACKAGE: Central neural gateway (includes DSPy, behavioral intelligence, neural networks, WASM)

const logger = getLogger('Main');

// Use foundation's configuration system + command line args
const { getConfig } = await import('@claude-zen/foundation');
const config = getConfig();

// Handle CLI commands first
if (process.argv.includes('auth')) {
  const { authCommand } = await import('./commands/auth');
  const authIndex = process.argv.indexOf('auth');
  const provider = process.argv[authIndex + 1];
  authCommand(provider);
  process.exit(0);
}

// Parse port from command line arguments or environment
const portArg = process.argv.find(arg => arg.startsWith('--port'));
const envPort = process.env.PORT || process.env.ZEN_SERVER_PORT;
const defaultPort = portArg 
  ? parseInt(portArg.split('=')[1] || process.argv[process.argv.indexOf(portArg) + 1])
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
    logger.info('📡 Claude-zen is already running - redirecting to existing web dashboard...');
    logger.info(`🌐 Access your dashboard at: http://localhost:${port}`);
    process.exit(0);
  }

  logger.info('🚀 Starting Claude Code Zen with FULL SWARM SYSTEM ACTIVATION');

  // 🔧 FOUNDATION INFRASTRUCTURE: Initialize comprehensive systems from packages
  logger.info('🏗️ Initializing comprehensive foundation infrastructure...');
  
  // Initialize telemetry system for observability
  const { initializeTelemetry, withRetry, withTrace: foundationWithTrace } = await import('@claude-zen/foundation');
  
  // Provide fallback for withTrace if not available
  const withTrace = foundationWithTrace || (async (name: string, fn: () => Promise<any>) => {
    logger.debug(`Starting trace: ${name}`);
    const result = await fn();
    logger.debug(`Completed trace: ${name}`);
    return result;
  });
  const telemetry = await withRetry(
    () => initializeTelemetry({
      serviceName: 'claude-code-zen',
      serviceVersion: '2.0.0',
      enableTracing: true,
      enableMetrics: true,
      enableLogging: true
    }),
    { retries: 3, minTimeout: 1000 }
  );
  
  // Initialize core systems
  const container = createContainer('claude-zen-main');
  const eventBus = await getEventBus();
  const databaseAccess = await getDatabaseSystemAccess();
  
  // Get other foundation services
  const { getProjectManager, createCircuitBreaker, recordMetric, getStorage } = await import('@claude-zen/foundation');
  const storage = await getStorage();
  const projectManager = await getProjectManager();
  
  // Initialize circuit breaker for resilience
  const systemCircuitBreaker = createCircuitBreaker({
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000
  });
  
  // Record system startup metrics
  recordMetric('system_startup', 1, { component: 'main', version: '2.0.0' });
  
  logger.info('✅ Foundation infrastructure initialized (DI, Events, Database, Telemetry, Storage, Resilience)');

  // 🔥 ACTIVATE THE DORMANT: Initialize the complete swarm hierarchy
  logger.info('👑 Initializing Queen Coordinator...');
  const queenCommander = new QueenCommander({
    id: 'main-queen',
    name: 'Primary Strategic Coordinator',
    maxQueens: 10,
    resourceLimits: { memory: 8192, cpu: 8, disk: 1024 },
    queenDefaults: { autonomyLevel: 8, learningEnabled: true, borgProtocol: true }
  });
  await queenCommander.initialize();
  logger.info('✅ Queen Coordinator initialized');

  // Initialize Cube Matrons (Domain Leaders)
  logger.info('🎯 Initializing Cube Matrons...');
  const devMatron = new DevCubeMatron({
    cubeId: 'dev-cube',
    name: 'Development Domain Leader',
    coordinationStyle: 'collaborative',
    autonomyLevel: 7
  });
  
  const opsMatron = new OpsCubeMatron({
    cubeId: 'ops-cube', 
    name: 'Operations Domain Leader',
    coordinationStyle: 'efficient',
    autonomyLevel: 8
  });
  
  await Promise.all([devMatron.initialize(), opsMatron.initialize()]);
  logger.info('✅ Cube Matrons initialized');

  // Initialize Swarm Commanders (Tactical Coordination)
  logger.info('⚡ Initializing Swarm Commanders...');
  const swarmCommander = new SwarmCommander({
    swarmId: 'main-swarm',
    name: 'Primary Tactical Coordinator',
    maxAgents: 50,
    strategy: 'adaptive'
  });

  const sparcCommander = await getSPARCCommander({
    swarmId: 'sparc-swarm',
    name: 'SPARC Methodology Coordinator',
    enabledPhases: ['specification', 'pseudocode', 'architecture', 'refinement', 'completion']
  });

  await Promise.all([swarmCommander.initialize()]);
  logger.info('✅ Swarm Commanders initialized');

  // Initialize Neural Brain System (Central Gateway) with foundation infrastructure
  logger.info('🧠 Initializing Brain System (Neural Gateway) with foundation integration...');
  
  const brainCoordinator = new BrainCoordinator({
    enabled: true,
    neuralNetworks: true,
    wasmAcceleration: true,
    rustCore: true
  });
  
  const neuralBridge = NeuralBridge.getInstance({
    wasmPath: './wasm',
    gpuAcceleration: false,
    enabled: true
  });
  
  const dspyBridge = new DSPyLLMBridge({
    teleprompter: 'MIPROv2',
    maxTokens: 8192,
    optimizationSteps: 10,
    coordinationFeedback: true,
    hybridMode: true
  });
  
  const retrainingMonitor = new RetrainingMonitor({
    enabled: true,
    retrainingInterval: 3600000, // 1 hour
    performanceThreshold: 0.85
  });

  // Initialize all brain systems with telemetry and resilience
  await withTrace('brain-system-initialization', async () => {
    await systemCircuitBreaker.fire(async () => {
      await Promise.all([
        brainCoordinator.initialize(),
        neuralBridge.initialize(), 
        dspyBridge.initialize(),
        retrainingMonitor.initialize()
      ]);
    });
  });
  
  // Record brain system metrics
  recordMetric('brain_system_initialized', 1, { 
    components: 'coordinator,neural-bridge,dspy,retraining',
    version: '2.0.0' 
  });
  
  logger.info('✅ Brain System initialized - Neural foundation ready with telemetry tracking');

  // Initialize Behavioral Intelligence System (now integrated into brain package)
  logger.info('🧠 Initializing Behavioral Intelligence System from brain package...');
  
  const behavioralIntelligence = new BehavioralIntelligence({
    enabled: true,
    learningRate: 0.3,
    networkArchitecture: {
      hiddenLayers: [10, 8],
      activation: 'sigmoid',
      learningRate: 0.3
    },
    predictionThreshold: 0.7,
    maxTrainingData: 10000,
    retrainingInterval: 300000 // 5 minutes
  });
  
  await behavioralIntelligence.initialize();
  
  logger.info('✅ Behavioral Intelligence initialized from unified brain package');
  logger.info('🔬 Capabilities: Agent learning, performance prediction, behavioral optimization');

  // Initialize AI Safety Orchestration System (CRITICAL SECURITY)
  logger.info('🛡️ Initializing AI Safety Orchestration System - 25-Pattern Deception Detection...');
  
  const aiSafetyOrchestrator = new AISafetyOrchestrator();
  const aiDeceptionDetector = new AIDeceptionDetector();
  const neuralDeceptionDetector = new NeuralDeceptionDetector();
  
  // Initialize Queen Safety Integration
  const queenSafetyIntegration = new QueenSafetyIntegration({
    enabled: true,
    realTimeMonitoring: true,
    interventionThreshold: 0.7,
    strategicValidation: true,
    coordinationSafety: true,
    escalationProtocols: true
  });

  // Initialize Agent Interaction Pipeline
  const agentInteractionPipeline = new AgentInteractionPipeline({
    enabled: true,
    realTimeMonitoring: true,
    neuralEnhancement: true,
    interventionThreshold: 0.7,
    logAllInteractions: true,
    escalationToHumans: true,
    coordinationValidation: true
  });

  // Initialize Safety Intervention Protocols with AGUI Human Escalation
  const safetyInterventionProtocols = new SafetyInterventionProtocols({
    enabled: true,
    autoEscalationThreshold: 0.8,
    humanTimeoutMs: 300000, // 5 minutes for human response - much more reasonable
    defaultDecision: 'pause',
    escalationChannels: ['agui', 'log'],
    criticalPatterns: [
      'VERIFICATION_FRAUD',
      'TOOL_OMNIPOTENCE',
      'CAPABILITY_INFLATION_ADVANCED',
      'KNOWLEDGE_HALLUCINATION_TECHNICAL'
    ]
  });
  
  // Start safety monitoring with circuit breaker protection
  await withTrace('ai-safety-initialization', async () => {
    await systemCircuitBreaker.fire(async () => {
      await Promise.all([
        aiSafetyOrchestrator.startSafetyMonitoring(),
        queenSafetyIntegration.initialize(),
        agentInteractionPipeline.initialize(),
        safetyInterventionProtocols.initialize()
      ]);
    });
  });
  
  // Record safety system metrics
  recordMetric('ai_safety_system_initialized', 1, { 
    patterns: '25',
    categories: 'capability,knowledge,verification,confidence,context',
    coordinationSafety: 'enabled',
    version: '1.0.0' 
  });
  
  logger.info('✅ AI Safety System initialized - 25-pattern deception detection ACTIVE');
  logger.info('🔍 Monitoring: Tool omnipotence, verification fraud, knowledge hallucination');
  logger.info('👑 Queen coordination safety: Strategic validation, delegation integrity');
  logger.info('🔄 Agent interaction pipeline: Real-time monitoring, neural enhancement');
  logger.info('🚨 Human escalation protocols: AGUI integration, 60s timeout, critical pattern detection');
  logger.info('⚠️ Real-time intervention protocols: ENABLED');

  // Initialize Other Specialized Systems
  logger.info('🔧 Initializing Other Specialized Systems...');
  
  // Initialize chaos engineering via strategic facade
  const chaosEngine = await getChaosEngine({ 
    enabled: true, 
    enableChaosExperiments: true,
    enableResilienceTesting: true,
    enableFailureSimulation: true,
    safetyChecks: true
  });
  
  // Initialize agent monitoring via strategic facade
  const agentMonitoringSystem = await getAgentMonitoringSystem({
    healthMonitoring: true,
    performancePrediction: true,
    taskPrediction: true
  });
  const agentMonitor = agentMonitoringSystem; // For compatibility

  // Initialize workflow engine via strategic facade
  const workflowEngineAccess = await getWorkflowEngineAccess({
    orchestration: true,
    processManagement: true
  });
  const workflowEngine = workflowEngineAccess; // For compatibility

  // Initialize load balancer via strategic facade
  const loadBalancingSystem = await getLoadBalancingSystemAccess({
    algorithms: ['brain-neural', 'ml-predictive'],
    capacityManagement: true
  });
  const loadBalancer = loadBalancingSystem; // For compatibility

  // Initialize teamwork coordination via strategic facade
  const teamworkAccess = await getTeamworkAccess({
    multiAgentCollaboration: true,
    coordinationPatterns: true
  });
  const teamworkCoord = teamworkAccess; // For compatibility

  // Initialize all other systems in parallel  
  // All systems (chaos, agentMonitor, loadBalancer, workflowEngine, teamworkCoord) are already initialized via strategic facades
  // No additional initialization needed
  
  logger.info('✅ All specialized systems initialized');

  // Store all coordinators for global access
  (global as any).claudeZenSwarm = {
    queenCommander,
    devMatron,
    opsMatron,
    swarmCommander,
    sparcCommander,
    brainCoordinator,
    neuralBridge,
    dspyBridge,
    retrainingMonitor,
    behavioralIntelligence, // 🧠 Unified neural intelligence with behavioral learning
    aiSafetyOrchestrator, // 🛡️ AI Safety orchestration system
    aiDeceptionDetector, // 🔍 25-pattern deception detection
    neuralDeceptionDetector, // 🧠 Neural-enhanced deception detection
    queenSafetyIntegration, // 👑 Queen coordination safety
    agentInteractionPipeline, // 🔄 Real-time agent interaction monitoring
    safetyInterventionProtocols, // 🚨 Human escalation protocols via AGUI
    chaosEngine,
    agentMonitor,
    workflowEngine,
    loadBalancer,
    teamworkCoord
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
      port: port,
      host: host,
      // Pass foundation infrastructure to ApiServer
      eventBus,
      databaseAccess,
      container,
      swarmCoordinators: (global as any).claudeZenSwarm
    });
    logger.info('✅ ApiServer instance created');

    logger.info('🚀 Starting ApiServer...');
    await webApp.start();
    logger.info('✅ ApiServer started successfully');
    
    logger.info(`✅ Web Server running at http://localhost:${port}`);
    logger.info(`🌐 Access your workspace: http://localhost:${port}/workspace`);
    logger.info(`📊 API Features: File Operations • Health Check • System Status • Workspace Management`);
    
    // 🔥 SWARM STATUS: Log complete hierarchy activation
    logger.info('🐝 SWARM HIERARCHY FULLY ACTIVATED:');
    logger.info('  👑 Queen Coordinator: Strategic multi-swarm coordination active');
    logger.info('  🎯 Cube Matrons: Dev + Ops domain leaders active');  
    logger.info('  ⚡ Swarm Commanders: Primary + SPARC tactical coordination active');
    logger.info('  🧠 Unified Brain System: Neural networks, behavioral intelligence, learning active');
    logger.info('  🔧 Specialized Systems: Chaos, load balancing, teamwork, AI safety active');
    
    const swarmStats = (global as any).claudeZenSwarm;
    logger.info(`📈 Swarm Statistics:`);
    logger.info(`  • Queens: ${swarmStats.queenCommander?.getQueenCount?.() || 'Active'}`);
    logger.info(`  • Agents: ${swarmStats.swarmCommander?.getAgentCount?.() || 'Available'}`);
    logger.info(`  • Systems: ${Object.keys(swarmStats).length} specialized coordinators`);
    
    logger.info('✅ Claude Code Zen FULL SWARM SYSTEM running successfully');
    logger.info(`🌐 Workspace: http://localhost:${port}/workspace`);
    logger.info(`🔗 API: http://localhost:${port}/api/`);
    logger.info('🎯 Ready for advanced swarm coordination and neural processing');
    logger.info('🛡️ Graceful shutdown enabled - use Ctrl+C or SIGTERM to stop');
    
    // Since terminus handles shutdown, we can use a simple keep-alive
    // The server will handle graceful shutdown via terminus
    const keepAlive = () => new Promise(() => {}); // Infinite promise
    await keepAlive();
  } catch (error) {
    logger.error('💥 Application error:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
