/**
 * @fileoverview Integration test for the refactored Orchestrator.
 * This test adapts the London School TDD approach from the original test suite.
 */

import { describe, expect, it, jest } from '@jest/globals';
import { Orchestrator } from 'coordination/orchestrator';
import { SwarmDatabase } from '../../src/database/swarm-database';
import { ZenSwarmStrategy } from 'coordination/strategies/ruv-swarm.strategy';
import { ILogger } from 'core/interfaces/base-interfaces';

// Mock dependencies
jest.mock('../../src/database/swarm-database');
jest.mock('coordination/strategies/ruv-swarm.strategy');

const MockedSwarmDatabase = SwarmDatabase as jest.MockedClass<typeof SwarmDatabase>;
const MockedZenSwarmStrategy = ZenSwarmStrategy as jest.MockedClass<typeof ZenSwarmStrategy>;

describe('Orchestrator Integration Test', () => {
  let orchestrator: Orchestrator;
  let mockStrategy: jest.Mocked<ZenSwarmStrategy>;
  let mockDb: jest.Mocked<SwarmDatabase>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // Instantiate the mocks
    mockStrategy = new MockedZenSwarmStrategy() as jest.Mocked<ZenSwarmStrategy>;
    mockDb = new MockedSwarmDatabase() as jest.Mocked<SwarmDatabase>;
    mockLogger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    // Mock the database constructor to return our mock instance
    (SwarmDatabase as jest.Mock).mockImplementation(() => mockDb);

    orchestrator = new Orchestrator(mockStrategy, mockDb, mockLogger);
  });

  describe('User Story: Task Execution', () => {
    it('should initialize, create a plan, and execute a task through the swarm', async () => {
      // Arrange
      const task = {
        id: 'task-123',
        description: 'Test task',
        strategy: 'sequential' as const,
        dependencies: [],
        requiredCapabilities: ['test-capability'],
        maxAgents: 1,
        requireConsensus: false,
      };

      const agent = {
        id: 'agent-456',
        capabilities: ['test-capability'],
        status: 'idle' as const,
      };

      // Mock the interactions
      mockDb.initialize.mockResolvedValue();
      mockDb.createTask.mockResolvedValue(task as any);
      mockDb.updateTask.mockResolvedValue(task as any);
      mockStrategy.getAgents.mockResolvedValue([agent]);
      mockStrategy.assignTaskToAgent.mockResolvedValue(undefined);

      // Act
      await orchestrator.initialize();
      await orchestrator.submitTask(task);

      // Assert
      expect(mockDb.initialize).toHaveBeenCalled();
      expect(mockDb.createTask).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-123' }));
      expect(mockStrategy.getAgents).toHaveBeenCalled();
      expect(mockStrategy.assignTaskToAgent).toHaveBeenCalledWith('agent-456', expect.any(Object));
      expect(mockDb.updateTask).toHaveBeenCalledWith('task-123', expect.objectContaining({ status: 'completed' }));
    });
  });
});
