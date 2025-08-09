/**
 * Comprehensive test suite for Session Management System.
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import type { SessionCoordinationDao, SessionEntity, CoordinationLock, CoordinationChange, CoordinationEvent, CoordinationStats, QueryOptions, CustomQuery } from '../../../database';
import { SessionEnabledSwarm, SessionRecoveryService } from './session-integration';
import { SessionManager, type SessionState } from './session-manager';
import { SessionSerializer, SessionStats, SessionValidator } from './session-utils';
import type { SwarmOptions, SwarmState } from './types';

// TDD London Mock - Tests INTERACTIONS, not state
class MockCoordinationDao implements SessionCoordinationDao {
  public initialized: boolean = true;

  // Jest spies for interaction testing (TDD London approach) - properly typed
  query: jest.MockedFunction<(sql: string, params?: unknown[]) => Promise<any[]>> = jest.fn();
  execute: jest.MockedFunction<(sql: string, params?: unknown[]) => Promise<{ affectedRows?: number; insertId?: number }>> = jest.fn();
  findById: jest.MockedFunction<(id: string | number) => Promise<SessionEntity | null>> = jest.fn();
  findBy: jest.MockedFunction<(criteria: Partial<SessionEntity>, options?: QueryOptions) => Promise<SessionEntity[]>> = jest.fn();
  findAll: jest.MockedFunction<(options?: QueryOptions) => Promise<SessionEntity[]>> = jest.fn();
  create: jest.MockedFunction<(entity: Omit<SessionEntity, 'id'>) => Promise<SessionEntity>> = jest.fn();
  update: jest.MockedFunction<(id: string | number, updates: Partial<SessionEntity>) => Promise<SessionEntity>> = jest.fn();
  delete: jest.MockedFunction<(id: string | number) => Promise<boolean>> = jest.fn();
  count: jest.MockedFunction<(criteria?: Partial<SessionEntity>) => Promise<number>> = jest.fn();
  exists: jest.MockedFunction<(id: string | number) => Promise<boolean>> = jest.fn();
  executeCustomQuery: jest.MockedFunction<(query: CustomQuery) => Promise<any>> = jest.fn();
  acquireLock: jest.MockedFunction<(resourceId: string, lockTimeout?: number) => Promise<CoordinationLock>> = jest.fn();
  releaseLock: jest.MockedFunction<(lockId: string) => Promise<void>> = jest.fn();
  subscribe: jest.MockedFunction<(pattern: string, callback: (change: CoordinationChange<SessionEntity>) => void) => Promise<string>> = jest.fn();
  unsubscribe: jest.MockedFunction<(subscriptionId: string) => Promise<void>> = jest.fn();
  publish: jest.MockedFunction<(channel: string, event: CoordinationEvent<SessionEntity>) => Promise<void>> = jest.fn();
  getCoordinationStats: jest.MockedFunction<() => Promise<CoordinationStats>> = jest.fn();

  constructor() {
    // Configure default return values for London TDD - with correct types
    this.query.mockResolvedValue([]);
    this.execute.mockResolvedValue({ affectedRows: 1, insertId: 1 });
    this.findById.mockResolvedValue(null);
    this.findBy.mockResolvedValue([]);
    this.findAll.mockResolvedValue([]);
    this.create.mockResolvedValue({ id: 'mock-session-id' } as SessionEntity);
    this.update.mockResolvedValue({ id: 'mock-session-id' } as SessionEntity);
    this.delete.mockResolvedValue(true);
    this.count.mockResolvedValue(0);
    this.exists.mockResolvedValue(false);
    this.executeCustomQuery.mockResolvedValue({});
    this.acquireLock.mockResolvedValue({
      id: 'mock-lock-id',
      resourceId: 'test-resource',
      acquired: new Date(), // Fixed: 'acquired' not 'acquiredAt'
      expiresAt: new Date(Date.now() + 30000),
      owner: 'test'
    });
    this.releaseLock.mockResolvedValue(undefined);
    this.subscribe.mockResolvedValue('mock-subscription-id');
    this.unsubscribe.mockResolvedValue(undefined);
    this.publish.mockResolvedValue(undefined);
    this.getCoordinationStats.mockResolvedValue({
      activeLocks: 0,
      activeSubscriptions: 0,
      messagesPublished: 0,
      messagesReceived: 0,
      uptime: 0
    });
  }

  // Helper methods for test setup (TDD London approach)
  setupSessionExists(sessionId: string, sessionData: Partial<SessionEntity> = {}) {
    this.findById.mockResolvedValueOnce({
      id: sessionId,
      name: 'Test Session',
      status: 'active',
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      ...sessionData
    } as SessionEntity);
    this.exists.mockResolvedValueOnce(true);
  }

  setupSessionNotExists(sessionId: string) {
    this.findById.mockResolvedValueOnce(null);
    this.exists.mockResolvedValueOnce(false);
  }

  expectQueryCalled(expectedSql: string, expectedParams?: any[]) {
    expect(this.query).toHaveBeenCalledWith(expectedSql, expectedParams);
  }

  expectExecuteCalled(expectedSql: string, expectedParams?: any[]) {
    expect(this.execute).toHaveBeenCalledWith(expectedSql, expectedParams);
  }

  expectCreateCalled(expectedEntity: Partial<SessionEntity>) {
    expect(this.create).toHaveBeenCalledWith(expect.objectContaining(expectedEntity));
  }

  expectUpdateCalled(expectedId: string, expectedUpdates: Partial<SessionEntity>) {
    expect(this.update).toHaveBeenCalledWith(expectedId, expect.objectContaining(expectedUpdates));
  }

  expectLockAcquired(expectedResourceId: string, expectedTimeout?: number) {
    expect(this.acquireLock).toHaveBeenCalledWith(expectedResourceId, expectedTimeout);
  }

  clearAllMocks() {
    jest.clearAllMocks();
  }
}

describe('SessionManager', () => {
  let persistence: MockCoordinationDao;
  let sessionManager: SessionManager;

  const mockSwarmOptions: SwarmOptions = {
    topology: 'mesh',
    maxAgents: 10,
    connectionDensity: 0.5,
    syncInterval: 1000,
  };

  const mockSwarmState: SwarmState = {
    agents: new Map(),
    tasks: new Map(),
    topology: 'mesh',
    connections: [],
    metrics: {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageCompletionTime: 0,
      agentUtilization: new Map(),
      throughput: 0,
    },
  };

  beforeEach(async () => {
    persistence = new MockCoordinationDao();
    persistence.initialized = true;

    sessionManager = new SessionManager(persistence, {
      autoCheckpoint: false, // Disable for testing
      checkpointInterval: 60000,
      maxCheckpoints: 5,
    });

    await sessionManager.initialize();
  });

  afterEach(async () => {
    await sessionManager.shutdown();
    // London TDD: Clear all mocks after each test
    persistence.clearAllMocks();
  });

  describe('Session Lifecycle', () => {
    test('should create a new session - London TDD: verify DAO interactions', async () => {
      // ARRANGE: Setup mock return value
      persistence.create.mockResolvedValueOnce({ 
        id: 'session_123', 
        name: 'Test Session',
        status: 'active'
      } as SessionEntity);

      // ACT: Create session
      const sessionId = await sessionManager.createSession(
        'Test Session',
        mockSwarmOptions,
        mockSwarmState
      );

      // ASSERT: Verify interactions (London TDD)
      persistence.expectCreateCalled({
        name: 'Test Session',
        status: 'active'
      });
      expect(sessionId).toBe('session_123');
    });

    test('should load existing session - London TDD: verify DAO called with correct ID', async () => {
      // ARRANGE: Setup mock data
      const testSessionId = 'session_456';
      persistence.setupSessionExists(testSessionId, {
        name: 'Test Session',
        status: 'active'
      });

      // ACT: Load session
      const loadedSession = await sessionManager.loadSession(testSessionId);

      // ASSERT: Verify interaction (London TDD)
      expect(persistence.findById).toHaveBeenCalledWith(testSessionId);
      expect(loadedSession.id).toBe(testSessionId);
      expect(loadedSession.name).toBe('Test Session');
    });

    test('should save session state - London TDD: verify update interaction', async () => {
      // ARRANGE: Setup session exists
      const sessionId = 'session_save_test';
      persistence.setupSessionExists(sessionId);
      
      const updatedState = {
        ...mockSwarmState,
        metrics: {
          ...mockSwarmState.metrics,
          totalTasks: 5,
          completedTasks: 3,
        },
      };

      // ACT: Save session
      await sessionManager.saveSession(sessionId, updatedState);

      // ASSERT: Verify interaction (London TDD) - check DAO was called to update
      // Enhanced: Use correct SessionEntity properties for assertion
      persistence.expectUpdateCalled(sessionId, {
        // Note: swarmState is part of SessionState but not SessionEntity
        // Using available properties for test verification
        lastAccessedAt: expect.any(Date) as any
      });
    });

    test('should pause and resume session', async () => {
      const sessionId = await sessionManager.createSession(
        'Test Session',
        mockSwarmOptions,
        mockSwarmState
      );

      await sessionManager.pauseSession(sessionId);
      let session = await sessionManager.loadSession(sessionId);
      expect(session.status).toBe('paused');

      await sessionManager.resumeSession(sessionId);
      session = await sessionManager.loadSession(sessionId);
      expect(session.status).toBe('active');
    });

    test('should hibernate and restore session', async () => {
      const sessionId = await sessionManager.createSession(
        'Test Session',
        mockSwarmOptions,
        mockSwarmState
      );

      await sessionManager.hibernateSession(sessionId);

      // Session should be hibernated and removed from active sessions
      const session = await sessionManager.loadSession(sessionId);
      expect(session.status).toBe('hibernated');
    });

    test('should terminate session', async () => {
      const sessionId = await sessionManager.createSession(
        'Test Session',
        mockSwarmOptions,
        mockSwarmState
      );

      await sessionManager.terminateSession(sessionId);

      const session = await sessionManager.loadSession(sessionId);
      expect(session.status).toBe('terminated');
    });
  });

  describe('Checkpoint System', () => {
    test('should create checkpoint - London TDD: verify lock acquisition and release', async () => {
      // ARRANGE: Setup session exists and mock lock
      const sessionId = 'session_checkpoint_test';
      persistence.setupSessionExists(sessionId);
      
      persistence.acquireLock.mockResolvedValueOnce({
        id: 'checkpoint_lock_123',
        resourceId: sessionId,
        acquired: new Date(),
        expiresAt: new Date(Date.now() + 30000),
        owner: 'session_manager'
      });

      // ACT: Create checkpoint
      const checkpointId = await sessionManager.createCheckpoint(sessionId, 'Test checkpoint');

      // ASSERT: Verify coordination interactions (London TDD)
      persistence.expectLockAcquired(`session:${sessionId}`, undefined);
      expect(persistence.releaseLock).toHaveBeenCalledWith('checkpoint_lock_123');
      persistence.expectExecuteCalled(
        'INSERT INTO session_checkpoints',
        [expect.any(String), sessionId, 'Test checkpoint']
      );
      expect(checkpointId).toBeDefined();
    });

    test('should restore from checkpoint', async () => {
      const sessionId = await sessionManager.createSession(
        'Test Session',
        mockSwarmOptions,
        mockSwarmState
      );

      // Create initial checkpoint
      const checkpointId = await sessionManager.createCheckpoint(sessionId, 'Initial state');

      // Modify session state
      const modifiedState = {
        ...mockSwarmState,
        metrics: {
          ...mockSwarmState.metrics,
          totalTasks: 10,
        },
      };
      await sessionManager.saveSession(sessionId, modifiedState);

      // Restore from checkpoint
      await sessionManager.restoreFromCheckpoint(sessionId, checkpointId);

      const restoredSession = await sessionManager.loadSession(sessionId);
      expect(restoredSession.swarmState.metrics.totalTasks).toBe(0); // Original state
    });
  });

  describe('Session Statistics', () => {
    test('should get session statistics', async () => {
      const sessionId = await sessionManager.createSession(
        'Test Session',
        mockSwarmOptions,
        mockSwarmState
      );

      const stats = await sessionManager.getSessionStats(sessionId);

      expect(stats).toHaveProperty('sessionId', sessionId);
      expect(stats).toHaveProperty('name', 'Test Session');
      expect(stats).toHaveProperty('status', 'active');
      expect(stats).toHaveProperty('totalAgents');
      expect(stats).toHaveProperty('totalTasks');
    });

    test('should get global statistics', async () => {
      await sessionManager.createSession('Session 1', mockSwarmOptions, mockSwarmState);
      await sessionManager.createSession('Session 2', mockSwarmOptions, mockSwarmState);

      const globalStats = await sessionManager.getSessionStats();

      expect(globalStats).toHaveProperty('totalSessions');
      expect(globalStats).toHaveProperty('activeSessions');
      expect(globalStats).toHaveProperty('statusBreakdown');
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent session', async () => {
      await expect(sessionManager.loadSession('non-existent-session')).rejects.toThrow(
        'Session non-existent-session not found'
      );
    });

    test('should handle invalid checkpoint restoration', async () => {
      const sessionId = await sessionManager.createSession(
        'Test Session',
        mockSwarmOptions,
        mockSwarmState
      );

      await expect(
        sessionManager.restoreFromCheckpoint(sessionId, 'invalid-checkpoint')
      ).rejects.toThrow('Checkpoint invalid-checkpoint not found');
    });
  });
});

describe('SessionEnabledSwarm', () => {
  let persistence: MockCoordinationDao;
  let swarm: SessionEnabledSwarm;

  beforeEach(async () => {
    persistence = new MockCoordinationDao();
    swarm = new SessionEnabledSwarm(
      {
        topology: 'mesh',
        maxAgents: 5,
      },
      {
        autoCheckpoint: false,
      },
      persistence
    );

    await swarm.initialize();
  });

  afterEach(async () => {
    await swarm.destroy();
  });

  test('should create session-enabled swarm', async () => {
    const sessionId = await swarm.createSession('Test Swarm Session');

    expect(sessionId).toBeDefined();

    const currentSession = await swarm.getCurrentSession();
    expect(currentSession).not.toBeNull();
    expect(currentSession?.name).toBe('Test Swarm Session');
  });

  test('should auto-save on agent addition', async () => {
    const _sessionId = await swarm.createSession('Test Swarm Session');

    const agentId = swarm.addAgent({
      id: 'test-agent',
      type: 'researcher',
    });

    expect(agentId).toBeDefined();

    // Give some time for auto-save to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    const session = await swarm.getCurrentSession();
    expect(session?.swarmState.agents.size).toBeGreaterThan(0);
  });

  test('should create and restore from checkpoint', async () => {
    const _sessionId = await swarm.createSession('Test Swarm Session');

    swarm.addAgent({
      id: 'test-agent',
      type: 'researcher',
    });

    const checkpointId = await swarm.createCheckpoint('Test checkpoint');
    expect(checkpointId).toBeDefined();

    // Add another agent
    swarm.addAgent({
      id: 'test-agent-2',
      type: 'coder',
    });

    // Restore from checkpoint
    await swarm.restoreFromCheckpoint(checkpointId);

    const session = await swarm.getCurrentSession();
    expect(session?.swarmState.agents.size).toBe(1); // Should have only the first agent
  });
});

describe('SessionValidator', () => {
  const validSession: SessionState = {
    id: 'test-session',
    name: 'Test Session',
    createdAt: new Date(),
    lastAccessedAt: new Date(),
    status: 'active',
    swarmState: {
      agents: new Map(),
      tasks: new Map(),
      topology: 'mesh',
      connections: [],
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageCompletionTime: 0,
        agentUtilization: new Map(),
        throughput: 0,
      },
    },
    swarmOptions: {
      topology: 'mesh',
      maxAgents: 10,
    },
    metadata: {},
    checkpoints: [],
    version: '1.0.0',
  };

  test('should validate valid session state', () => {
    const result = SessionValidator.validateSessionState(validSession);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect invalid session state', () => {
    const invalidSession = {
      ...validSession,
      id: null, // Invalid ID
      status: 'invalid-status', // Invalid status
    } as any;

    const result = SessionValidator.validateSessionState(invalidSession);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('SessionSerializer', () => {
  const testSwarmState: SwarmState = {
    agents: new Map([['agent1', { id: 'agent1', type: 'researcher' } as any]]),
    tasks: new Map([['task1', { id: 'task1', description: 'Test task' } as any]]),
    topology: 'mesh',
    connections: [],
    metrics: {
      totalTasks: 1,
      completedTasks: 0,
      failedTasks: 0,
      averageCompletionTime: 0,
      agentUtilization: new Map([['agent1', 0.5]]),
      throughput: 0,
    },
  };

  test('should serialize and deserialize swarm state', () => {
    const serialized = SessionSerializer.serializeSwarmState(testSwarmState);
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe('string');

    const deserialized = SessionSerializer.deserializeSwarmState(serialized);
    expect(deserialized.agents.size).toBe(1);
    expect(deserialized.tasks.size).toBe(1);
    expect(deserialized.topology).toBe('mesh');
    expect(deserialized.metrics.totalTasks).toBe(1);
    expect(deserialized.metrics.agentUtilization.get('agent1')).toBe(0.5);
  });

  test('should export and import session', () => {
    const testSession: SessionState = {
      id: 'test-session',
      name: 'Test Session',
      createdAt: new Date('2023-01-01'),
      lastAccessedAt: new Date('2023-01-01'),
      status: 'active',
      swarmState: testSwarmState,
      swarmOptions: { topology: 'mesh' },
      metadata: { test: true },
      checkpoints: [],
      version: '1.0.0',
    };

    const exported = SessionSerializer.exportSession(testSession);
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('string');

    const imported = SessionSerializer.importSession(exported);
    expect(imported.id).toBe('test-session');
    expect(imported.name).toBe('Test Session');
    expect(imported.swarmState.agents.size).toBe(1);
    expect(imported.metadata['test']).toBe(true);
  });
});

describe('SessionStats', () => {
  const testSession: SessionState = {
    id: 'test-session',
    name: 'Test Session',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    lastAccessedAt: new Date(Date.now() - 3600000), // 1 hour ago
    status: 'active',
    swarmState: {
      agents: new Map([['agent1', {} as any]]),
      tasks: new Map([['task1', {} as any]]),
      topology: 'mesh',
      connections: [],
      metrics: {
        totalTasks: 10,
        completedTasks: 8,
        failedTasks: 2,
        averageCompletionTime: 1000,
        agentUtilization: new Map(),
        throughput: 0.5,
      },
    },
    swarmOptions: { topology: 'mesh' },
    metadata: {},
    checkpoints: [
      {
        id: 'cp1',
        sessionId: 'test-session',
        timestamp: new Date(),
        checksum: 'abc123',
        state: {} as any,
        description: 'Test checkpoint',
        metadata: {},
      },
    ],
    version: '1.0.0',
  };

  test('should calculate health score', () => {
    const healthScore = SessionStats.calculateHealthScore(testSession);
    expect(healthScore).toBeGreaterThan(0);
    expect(healthScore).toBeLessThanOrEqual(100);
  });

  test('should generate session summary', () => {
    const summary = SessionStats.generateSummary(testSession);

    expect(summary).toHaveProperty('id', 'test-session');
    expect(summary).toHaveProperty('name', 'Test Session');
    expect(summary).toHaveProperty('status', 'active');
    expect(summary).toHaveProperty('healthScore');
    expect(summary).toHaveProperty('agents');
    expect(summary).toHaveProperty('tasks');
    expect(summary).toHaveProperty('checkpoints');
    expect(summary).toHaveProperty('performance');

    expect(summary['agents']['total']).toBe(1);
    expect(summary['tasks']['total']).toBe(10);
    expect(summary['tasks']['completed']).toBe(8);
    expect(summary['tasks']['successRate']).toBe(0.8);
    expect(summary['checkpoints']['total']).toBe(1);
  });
});

describe('SessionRecoveryService', () => {
  let persistence: MockCoordinationDao;
  let sessionManager: SessionManager;
  let recoveryService: SessionRecoveryService;

  beforeEach(async () => {
    persistence = new MockCoordinationDao();
    persistence.initialized = true;

    sessionManager = new SessionManager(persistence, {
      autoCheckpoint: false,
    });
    await sessionManager.initialize();

    recoveryService = new SessionRecoveryService(sessionManager);
  });

  afterEach(async () => {
    await sessionManager.shutdown();
  });

  test('should run health check', async () => {
    // Create a few test sessions
    await sessionManager.createSession('Session 1', { topology: 'mesh' });
    await sessionManager.createSession('Session 2', { topology: 'hierarchical' });

    const healthReport = await recoveryService.runHealthCheck();

    expect(healthReport).toHaveProperty('total');
    expect(healthReport).toHaveProperty('healthy');
    expect(healthReport).toHaveProperty('corrupted');
    expect(healthReport).toHaveProperty('needsRecovery');
    expect(healthReport).toHaveProperty('recoveryRecommendations');

    expect(healthReport['total']).toBeGreaterThanOrEqual(2);
  });
});

// Integration tests
describe('Session Management Integration', () => {
  test('should handle complete session lifecycle', async () => {
    const persistence = new MockCoordinationDao();
    persistence.initialized = true;

    const swarm = new SessionEnabledSwarm(
      { topology: 'mesh', maxAgents: 10 },
      { autoCheckpoint: false },
      persistence
    );

    await swarm.initialize();

    try {
      // Create session
      const sessionId = await swarm.createSession('Integration Test Session');
      expect(sessionId).toBeDefined();

      // Add agents and tasks
      const _agentId = await swarm.addAgent({
        id: 'test-agent',
        type: 'researcher',
      });

      const _taskId = await swarm.submitTask({
        description: 'Test task',
        priority: 'medium',
        dependencies: [],
        assignedAgents: [],
        swarmId: 'default',
        strategy: 'balanced',
        progress: 0,
        requireConsensus: false,
        maxAgents: 5,
        requiredCapabilities: [],
        createdAt: new Date(),
        metadata: {},
      });

      // Create checkpoint
      const checkpointId = await swarm.createCheckpoint('Integration checkpoint');
      expect(checkpointId).toBeDefined();

      // Verify session state
      const session = await swarm.getCurrentSession();
      expect(session).not.toBeNull();
      expect(session?.swarmState.agents.size).toBeGreaterThan(0);
      expect(session?.swarmState.tasks.size).toBeGreaterThan(0);
      expect(session?.checkpoints.length).toBeGreaterThan(0);

      // Pause and resume
      await swarm.pauseSession();
      await swarm.resumeSession();

      // Get statistics
      const stats = await swarm.getSessionStats();
      expect(stats).toHaveProperty('sessionId');
      expect(stats).toHaveProperty('totalAgents');
      expect(stats).toHaveProperty('totalTasks');

      // Terminate session
      await swarm.terminateSession();
    } finally {
      await swarm.destroy();
    }
  });
});