/**
 * Coordination Service Adapter Usage Examples
 *
 * Demonstrates how to use the CoordinationServiceAdapter for various
 * coordination operations including agent management, session handling,
 * and swarm coordination.
 */

import {
  analyzeCoordinationPerformance,
  CoordinationConfigPresets,
  CoordinationServiceAdapter,
  coordinateIntelligentSwarm,
  createAgentBatch,
  createAgentCoordinationConfig,
  createDAACoordinationConfig,
  createDefaultCoordinationServiceAdapterConfig,
  createIntelligentAgent,
  createManagedSession,
  createSessionCoordinationConfig,
} from '../src/interfaces/services/adapters';
import { ServiceType } from '../src/interfaces/services/types';

/**
 * Example 1: Basic Coordination Service Setup
 */
async function basicCoordinationExample() {
  // Create basic coordination configuration
  const config = createDefaultCoordinationServiceAdapterConfig('basic-coordination', {
    type: ServiceType.COORDINATION,
    daaService: { enabled: true },
    sessionService: { enabled: true },
    swarmCoordinator: { enabled: true },
  });

  // Create and initialize the adapter
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();

  // Get service status
  const _status = await adapter.getStatus();

  // Cleanup
  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 2: Agent Management Operations
 */
async function agentManagementExample() {
  // Create agent-focused configuration
  const config = createAgentCoordinationConfig('agent-manager', {
    maxAgents: 20,
    topology: 'hierarchical',
    enableLearning: true,
    autoSpawn: false,
  });

  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  const researcher = await createIntelligentAgent(adapter, {
    type: 'researcher',
    capabilities: ['search', 'analysis', 'documentation'],
    specialization: 'technical-research',
    learningEnabled: true,
  });

  // Create batch of agents
  const agentConfigs = [
    { type: 'coder', capabilities: ['programming', 'debugging'] },
    { type: 'analyst', capabilities: ['data-analysis', 'reporting'] },
    { type: 'tester', capabilities: ['testing', 'quality-assurance'] },
  ];

  const _batchAgents = await createAgentBatch(adapter, agentConfigs, {
    maxConcurrency: 3,
    staggerDelay: 100,
  });

  // Get agent performance metrics
  const agentMetrics = await adapter.execute('agent-metrics');
  if (agentMetrics.success) {
  }

  // Adapt an agent for better performance
  const adaptResult = await adapter.execute('agent-adapt', {
    agentId: researcher.id,
    adaptation: {
      learningRate: 0.15,
      errorTolerance: 0.05,
      specializationBoost: 1.2,
    },
  });

  if (adaptResult.success) {
  }

  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 3: Session Management Operations
 */
async function sessionManagementExample() {
  // Create session-focused configuration
  const config = createSessionCoordinationConfig('session-manager', {
    maxSessions: 50,
    checkpointInterval: 180000, // 3 minutes
    autoRecovery: true,
  });

  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  const { sessionId, monitoringId } = await createManagedSession(
    adapter,
    'example-workflow-session',
    {
      autoCheckpoint: true,
      checkpointInterval: 120000, // 2 minutes
      maxDuration: 1800000, // 30 minutes
    }
  );

  // Perform some session operations
  const _saveResult = await adapter.execute('session-save', { sessionId });

  const _checkpointResult = await adapter.execute('session-checkpoint', {
    sessionId,
    description: 'Manual checkpoint for example',
  });

  // Get session statistics
  const statsResult = await adapter.execute('session-stats', { sessionId });
  if (statsResult.success) {
  }

  // List all sessions
  const sessionsResult = await adapter.execute('session-list');
  if (sessionsResult.success) {
  }

  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 4: Advanced Swarm Coordination
 */
async function swarmCoordinationExample() {
  // Create high-performance coordination configuration
  const config = CoordinationConfigPresets.HIGH_PERFORMANCE('swarm-coordinator');

  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();

  // Create agents for swarm coordination
  const agents = [
    { id: 'agent-r1', type: 'researcher', status: 'idle', capabilities: ['search', 'analysis'] },
    { id: 'agent-c1', type: 'coder', status: 'idle', capabilities: ['programming', 'debugging'] },
    {
      id: 'agent-a1',
      type: 'analyst',
      status: 'idle',
      capabilities: ['data-analysis', 'reporting'],
    },
    { id: 'agent-t1', type: 'tester', status: 'idle', capabilities: ['testing', 'validation'] },
  ];
  for (const agent of agents) {
    await adapter.execute('swarm-add-agent', { agent });
  }
  const _coordination = await coordinateIntelligentSwarm(adapter, agents, {
    targetLatency: 100, // 100ms target
    minSuccessRate: 0.9, // 90% minimum success rate
    adaptiveTopology: true,
  });

  // Create and distribute tasks
  const _tasks = [
    { id: 'task-1', type: 'research', requirements: ['search'], priority: 5 },
    { id: 'task-2', type: 'coding', requirements: ['programming'], priority: 4 },
    { id: 'task-3', type: 'analysis', requirements: ['data-analysis'], priority: 3 },
    { id: 'task-4', type: 'testing', requirements: ['testing'], priority: 2 },
  ];

  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 5: DAA (Data Accessibility and Analysis) Operations
 */
async function daaOperationsExample() {
  // Create DAA-focused configuration
  const config = createDAACoordinationConfig('daa-service', {
    enableMetaLearning: true,
    enableCognitive: true,
    analysisInterval: 600000, // 10 minutes
  });

  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  const workflowResult = await adapter.execute('workflow-create', {
    workflow: {
      name: 'data-analysis-pipeline',
      steps: [
        { id: 'data-collection', type: 'research' },
        { id: 'data-processing', type: 'analysis' },
        { id: 'pattern-recognition', type: 'cognitive' },
        { id: 'report-generation', type: 'documentation' },
      ],
    },
  });

  if (workflowResult.success) {
    // Execute the workflow
    const executionResult = await adapter.execute('workflow-execute', {
      workflowId: workflowResult.data.id,
      params: {
        dataSource: 'example-dataset',
        analysisType: 'pattern-recognition',
        outputFormat: 'report',
      },
    });

    if (executionResult.success) {
    }
  }
  const knowledgeResult = await adapter.execute('knowledge-share', {
    knowledge: {
      type: 'pattern-recognition',
      insights: ['data-correlation-improved', 'analysis-accuracy-increased'],
      confidence: 0.87,
      applicability: ['similar-datasets', 'related-domains'],
    },
  });

  if (knowledgeResult.success) {
  }

  // Perform cognitive pattern analysis
  const cognitiveResult = await adapter.execute('cognitive-analyze');
  if (cognitiveResult.success) {
  }

  // Perform meta-learning to improve system performance
  const metaLearningResult = await adapter.execute('meta-learning', {
    operationType: 'system-optimization',
    learningData: {
      recentPerformance: 0.85,
      errorPatterns: ['timeout-errors', 'coordination-delays'],
      improvementAreas: ['response-time', 'accuracy'],
    },
  });

  if (metaLearningResult.success) {
  }

  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 6: Performance Monitoring and Analytics
 */
async function performanceMonitoringExample() {
  const config = CoordinationConfigPresets.ADVANCED('performance-monitor');
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();

  // Perform various operations to generate metrics
  const operations = [
    adapter.execute('agent-create', { config: { type: 'researcher' } }),
    adapter.execute('session-create', { name: 'perf-test' }),
    adapter.execute('swarm-metrics'),
    adapter.execute('performance-metrics'),
  ];

  await Promise.allSettled(operations);
  const performanceAnalysis = await analyzeCoordinationPerformance(adapter);

  if (performanceAnalysis.overall.issues.length > 0) {
    performanceAnalysis.overall.issues.forEach((_issue) => {});
  }

  if (performanceAnalysis.overall.recommendations.length > 0) {
    performanceAnalysis.overall.recommendations.forEach((_rec) => {});
  }

  // Get detailed service metrics
  const _metrics = await adapter.getMetrics();

  await adapter.stop();
  await adapter.destroy();
}

/**
 * Main execution function
 */
async function main() {
  try {
    await basicCoordinationExample();
    await agentManagementExample();
    await sessionManagementExample();
    await swarmCoordinationExample();
    await daaOperationsExample();
    await performanceMonitoringExample();
  } catch (error) {
    console.error('❌ Example execution failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  basicCoordinationExample,
  agentManagementExample,
  sessionManagementExample,
  swarmCoordinationExample,
  daaOperationsExample,
  performanceMonitoringExample,
};
