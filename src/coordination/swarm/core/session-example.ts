/**
 * @file Coordination system: session-example.
 */

import { getLogger } from '../../../config/logging-config.ts';

const logger = getLogger('coordination-swarm-core-session-example');

/**
 * Session Management System - Comprehensive Examples.
 *
 * This file demonstrates how to use the session management system.
 * For persistent swarm orchestration across multiple executions.
 */

// import { DALFactory } from '../../database'; // TODO: Implement proper DI integration
import { SessionEnabledSwarm, SessionRecoveryService } from './session-integration.ts';
import { SessionManager } from './session-manager.ts';
import { SessionStats, SessionValidator } from './session-utils.ts';

/**
 * Example 1: Basic Session Usage.
 *
 * @example
 */
async function basicSessionExample() {
  // Create a session-enabled swarm
  const swarm = new SessionEnabledSwarm(
    {
      topology: 'hierarchical',
      maxAgents: 8,
      connectionDensity: 0.7,
      syncInterval: 2000,
    },
    {
      autoCheckpoint: true,
      checkpointInterval: 60000, // 1 minute
      maxCheckpoints: 10,
    }
  );

  try {
    // Initialize the swarm
    await swarm.initialize();

    // Create a new session
    const sessionId = await swarm.createSession('ML Training Pipeline');

    // Add agents with different capabilities
    const dataAgent = await swarm.addAgent({
      id: 'data-processor',
      type: 'analyst',
      capabilities: ['data-preprocessing', 'feature-extraction'],
    });

    const modelAgent = await swarm.addAgent({
      id: 'model-trainer',
      type: 'researcher',
      capabilities: ['neural-networks', 'optimization'],
    });

    const evaluatorAgent = await swarm.addAgent({
      id: 'model-evaluator',
      type: 'tester',
      capabilities: ['validation', 'metrics-calculation'],
    });

    // Submit tasks
    const dataTask = await swarm.submitTask({
      description: 'Preprocess training dataset',
      priority: 'high',
      assignedAgents: [dataAgent],
      dependencies: [],
      swarmId: 'default',
      strategy: 'balanced',
      progress: 0,
      requireConsensus: false,
      maxAgents: 5,
      requiredCapabilities: [],
      createdAt: new Date(),
      metadata: {},
    });

    const trainingTask = await swarm.submitTask({
      description: 'Train neural network model',
      priority: 'high',
      dependencies: [dataTask],
      assignedAgents: [modelAgent],
      swarmId: 'default',
      strategy: 'balanced',
      progress: 0,
      requireConsensus: false,
      maxAgents: 5,
      requiredCapabilities: [],
      createdAt: new Date(),
      metadata: {},
    });

    const _evaluationTask = await swarm.submitTask({
      description: 'Evaluate model performance',
      priority: 'medium',
      dependencies: [trainingTask],
      assignedAgents: [evaluatorAgent],
      swarmId: 'default',
      strategy: 'balanced',
      progress: 0,
      requireConsensus: false,
      maxAgents: 5,
      requiredCapabilities: [],
      createdAt: new Date(),
      metadata: {},
    });

    // Create a manual checkpoint
    const _checkpointId = await swarm.createCheckpoint('Initial pipeline setup');

    // Get session statistics
    const _stats = await swarm.getSessionStats();

    // Save the session
    await swarm.saveSession();

    return sessionId;
  } finally {
    await swarm.destroy();
  }
}

/**
 * Example 2: Session Recovery and Restoration.
 *
 * @param existingSessionId
 * @example
 */
async function sessionRecoveryExample(existingSessionId: string) {
  const swarm = new SessionEnabledSwarm({
    topology: 'mesh',
    maxAgents: 10,
  });

  try {
    await swarm.initialize();
    await swarm.loadSession(existingSessionId);

    const currentSession = await swarm.getCurrentSession();
    if (currentSession) {
      // Add more work to the restored session
      const optimizerAgent = await swarm.addAgent({
        id: 'hyperparameter-optimizer',
        type: 'optimizer',
        capabilities: ['grid-search', 'bayesian-optimization'],
      });

      const _optimizationTask = await swarm.submitTask({
        description: 'Optimize hyperparameters',
        priority: 'medium',
        assignedAgents: [optimizerAgent],
        dependencies: [],
        swarmId: 'default',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [],
        createdAt: new Date(),
        metadata: {},
      });

      // Create another checkpoint
      await swarm.createCheckpoint('Added hyperparameter optimization');

      // Demonstrate checkpoint restoration
      if (currentSession?.checkpoints.length > 0) {
        const firstCheckpoint = currentSession?.checkpoints?.[0]!; // Non-null assertion since we checked length
        await swarm.restoreFromCheckpoint(firstCheckpoint.id);
      }
    }
  } finally {
    await swarm.destroy();
  }
}

/**
 * Example 3: Session Lifecycle Management.
 *
 * @example
 */
async function sessionLifecycleExample() {
  // Create a simple mock implementation for now
  // TODO: Implement proper DALFactory integration with DI
  const persistence = {
    query: async (_sql: string, _params?: any[]) => [],
    execute: async (_sql: string, _params?: any[]) => ({ affectedRows: 1 }),
    initialize: async () => {},
    close: async () => {},
  } as any;
  await persistence.initialize();

  const sessionManager = new SessionManager(persistence, {
    autoCheckpoint: true,
    checkpointInterval: 30000, // 30 seconds
    maxCheckpoints: 5,
    compressionEnabled: true,
    encryptionEnabled: false,
  });

  try {
    await sessionManager.initialize();

    // Create a session
    const sessionId = await sessionManager.createSession('Long Running Analysis', {
      topology: 'distributed',
      maxAgents: 15,
    });

    // Simulate some work
    await sessionManager.saveSession(sessionId, {
      agents: new Map([
        ['analyst-1', { id: 'analyst-1', type: 'analyst' } as any],
        ['researcher-1', { id: 'researcher-1', type: 'researcher' } as any],
      ]),
      tasks: new Map([['task-1', { id: 'task-1', description: 'Analyze data' } as any]]),
      topology: 'distributed',
      connections: [],
      metrics: {
        totalTasks: 1,
        completedTasks: 0,
        failedTasks: 0,
        averageCompletionTime: 0,
        agentUtilization: new Map(),
        throughput: 0,
      },
    });

    // Create checkpoints
    const _checkpoint1 = await sessionManager.createCheckpoint(sessionId, 'Work started');

    // Pause the session
    await sessionManager.pauseSession(sessionId);

    // Resume the session
    await sessionManager.resumeSession(sessionId);

    // Get session statistics
    const _stats = await sessionManager.getSessionStats(sessionId);

    // List all sessions
    const _allSessions = await sessionManager.listSessions();

    // Hibernate the session
    await sessionManager.hibernateSession(sessionId);

    // Load hibernated session
    const _hibernatedSession = await sessionManager.loadSession(sessionId);

    return sessionId;
  } finally {
    await sessionManager.shutdown();
    await persistence.close();
  }
}

/**
 * Example 4: Session Health Monitoring and Recovery.
 *
 * @example
 */
async function sessionHealthExample() {
  // Create a simple mock implementation for now
  // TODO: Implement proper DALFactory integration with DI
  const persistence = {
    query: async (_sql: string, _params?: any[]) => [],
    execute: async (_sql: string, _params?: any[]) => ({ affectedRows: 1 }),
    initialize: async () => {},
    close: async () => {},
  } as any;
  await persistence.initialize();

  const sessionManager = new SessionManager(persistence);
  await sessionManager.initialize();

  const recoveryService = new SessionRecoveryService(sessionManager);

  try {
    // Create some test sessions
    const session1 = await sessionManager.createSession('Healthy Session', { topology: 'mesh' });
    const session2 = await sessionManager.createSession('Test Session', {
      topology: 'hierarchical',
    });

    // Add some checkpoints
    await sessionManager.createCheckpoint(session1, 'Healthy checkpoint');
    await sessionManager.createCheckpoint(session2, 'Test checkpoint');
    const healthReport = await recoveryService.runHealthCheck();

    // Get detailed statistics for each session
    for (const sessionId of [session1, session2]) {
      const session = await sessionManager.loadSession(sessionId);
      const _healthScore = SessionStats.calculateHealthScore(session);
      const _summary = SessionStats.generateSummary(session);
    }

    // Schedule automatic recovery if needed
    // Fix: Use bracket notation to access index signature property
    if (healthReport['needsRecovery'] && healthReport['needsRecovery'].length > 0) {
      await recoveryService.scheduleAutoRecovery();
    }
  } finally {
    await sessionManager.shutdown();
    await persistence.close();
  }
}

/**
 * Example 5: Advanced Session Operations.
 *
 * @example
 */
async function advancedSessionExample() {
  const swarm = new SessionEnabledSwarm(
    {
      topology: 'hybrid',
      maxAgents: 20,
      connectionDensity: 0.8,
    },
    {
      autoCheckpoint: true,
      checkpointInterval: 45000,
      maxCheckpoints: 8,
      compressionEnabled: true,
    }
  );

  try {
    await swarm.initialize();

    // Create session with event monitoring
    swarm.on('session:created', (_data: any) => {});

    swarm.on('session:checkpoint_created', (_data: any) => {});

    swarm.on('session:error', (data: any) => {
      logger.error(`Session error: ${data?.error} during ${data?.operation}`);
    });

    const _sessionId = await swarm.createSession('Advanced ML Pipeline');

    // Create multiple specialized agents
    const agents = [
      {
        id: 'data-collector',
        type: 'researcher' as const,
        capabilities: ['web-scraping', 'api-integration'],
      },
      {
        id: 'data-cleaner',
        type: 'analyst' as const,
        capabilities: ['data-validation', 'outlier-detection'],
      },
      {
        id: 'feature-engineer',
        type: 'architect' as const,
        capabilities: ['feature-selection', 'dimensionality-reduction'],
      },
      {
        id: 'model-builder',
        type: 'coder' as const,
        capabilities: ['deep-learning', 'ensemble-methods'],
      },
      {
        id: 'model-validator',
        type: 'reviewer' as const,
        capabilities: ['cross-validation', 'performance-metrics'],
      },
      {
        id: 'deployment-manager',
        type: 'architect' as const,
        capabilities: ['containerization', 'monitoring'],
      },
    ];

    // Fix: Add proper type annotation for agentIds
    const agentIds: string[] = [];
    for (const agent of agents) {
      const agentId = await swarm.addAgent(agent);
      agentIds.push(agentId);
    }

    // Create complex task dependencies
    const tasks = [
      {
        description: 'Collect training data from multiple sources',
        priority: 'critical' as const,
        assignedAgents: [agentIds[0]!], // Fix: Use non-null assertion since we know it exists
        dependencies: [] as string[],
        swarmId: 'advanced-pipeline',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [] as string[],
        createdAt: new Date(),
        metadata: {},
      },
      {
        description: 'Clean and validate collected data',
        priority: 'high' as const,
        assignedAgents: [agentIds[1]!], // Fix: Use non-null assertion
        dependencies: [] as string[],
        swarmId: 'advanced-pipeline',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [] as string[],
        createdAt: new Date(),
        metadata: {},
      },
      {
        description: 'Engineer features from cleaned data',
        priority: 'high' as const,
        assignedAgents: [agentIds[2]!], // Fix: Use non-null assertion
        dependencies: [] as string[],
        swarmId: 'advanced-pipeline',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [] as string[],
        createdAt: new Date(),
        metadata: {},
      },
      {
        description: 'Build and train multiple models',
        priority: 'high' as const,
        assignedAgents: [agentIds[3]!], // Fix: Use non-null assertion
        dependencies: [] as string[],
        swarmId: 'advanced-pipeline',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [] as string[],
        createdAt: new Date(),
        metadata: {},
      },
      {
        description: 'Validate model performance',
        priority: 'medium' as const,
        assignedAgents: [agentIds[4]!], // Fix: Use non-null assertion
        dependencies: [] as string[],
        swarmId: 'advanced-pipeline',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [] as string[],
        createdAt: new Date(),
        metadata: {},
      },
      {
        description: 'Deploy best performing model',
        priority: 'medium' as const,
        assignedAgents: [agentIds[5]!], // Fix: Use non-null assertion
        dependencies: [] as string[],
        swarmId: 'advanced-pipeline',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [] as string[],
        createdAt: new Date(),
        metadata: {},
      },
    ];

    // Fix: Add proper type annotation for taskIds
    const taskIds: string[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]!; // Non-null assertion since we're within array bounds

      if (i > 0) {
        const previousTaskId = taskIds[i - 1];
        if (previousTaskId) {
          task.dependencies = [previousTaskId]; // Sequential dependencies
        }
      }

      const taskId = await swarm.submitTask(task);
      taskIds.push(taskId);
    }

    // Create milestone checkpoints
    await swarm.createCheckpoint('Pipeline setup complete');

    // Simulate some progress
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await swarm.createCheckpoint('Data collection phase');

    // Get comprehensive session information
    const session = await swarm.getCurrentSession();
    if (session) {
      // Validate session integrity
      const validation = SessionValidator.validateSessionState(session);
      if (!validation.valid) {
      }

      // Calculate health metrics
      const _healthScore = SessionStats.calculateHealthScore(session);

      const _summary = SessionStats.generateSummary(session);
    }

    // Demonstrate session export/import capability
    if (session) {
      const _exportedData = await swarm.exportSession();

      // In a real scenario, you would save this to a file
      // and import it in another application instance
    }
  } finally {
    await swarm.destroy();
  }
}

/**
 * Main execution function.
 *
 * @example
 */
async function runAllExamples() {
  try {
    // Run basic session example
    const sessionId = await basicSessionExample();

    // Run recovery example using the created session
    await sessionRecoveryExample(sessionId);

    // Run lifecycle management example
    const _lifecycleSessionId = await sessionLifecycleExample();

    // Run health monitoring example
    await sessionHealthExample();

    // Run advanced operations example
    await advancedSessionExample();
  } catch (error) {
    logger.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

/**
 * Extension method for SessionEnabledSwarm to export session data.
 */
declare module './session-integration.js' {
  interface SessionEnabledSwarm {
    exportSession(): Promise<string>;
  }
}

// Add the export method to the prototype (for demonstration)
if (typeof module !== 'undefined' && module.exports) {
  const { SessionEnabledSwarm } = require('./session-integration');
  const { SessionSerializer } = require('./session-utils');

  SessionEnabledSwarm.prototype.exportSession = async function (): Promise<string> {
    const session = await this.getCurrentSession();
    if (!session) {
      throw new Error('No active session to export');
    }
    return SessionSerializer.exportSession(session);
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  basicSessionExample,
  sessionRecoveryExample,
  sessionLifecycleExample,
  sessionHealthExample,
  advancedSessionExample,
  runAllExamples,
};
