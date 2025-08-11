/**
 * @file Integration test for the refactored Orchestrator.
 * This test adapts the London School TDD approach from the original test suite.
 */

import { Orchestrator } from 'coordination/orchestrator';
import { ZenSwarmStrategy } from 'coordination/strategies/ruv-swarm.strategy';
import { describe, expect, it } from 'vitest';
import { SwarmDatabase } from '../../src/database/swarm-database';

// Mock dependencies
vi.mock('../../src/database/swarm-database');
vi.mock('coordination/strategies/ruv-swarm.strategy');

const MockedSwarmDatabase = SwarmDatabase as vi.MockedClass<
  typeof SwarmDatabase
>;
const MockedZenSwarmStrategy = ZenSwarmStrategy as vi.MockedClass<
  typeof ZenSwarmStrategy
>;

describe('Orchestrator Integration Test', () => {
  let orchestrator: Orchestrator;
  let mockStrategy: vi.Mocked<ZenSwarmStrategy>;
  let mockDb: vi.Mocked<SwarmDatabase>;
  let mockLogger: vi.Mocked<ILogger>;

  beforeEach(() => {
    // Instantiate the mocks
    mockStrategy = new MockedZenSwarmStrategy() as vi.Mocked<ZenSwarmStrategy>;
    mockDb = new MockedSwarmDatabase() as vi.Mocked<SwarmDatabase>;
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    // Mock the database constructor to return our mock instance
    (SwarmDatabase as vi.Mock).mockImplementation(() => mockDb);

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
      expect(mockDb.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'task-123' }),
      );
      expect(mockStrategy.getAgents).toHaveBeenCalled();
      expect(mockStrategy.assignTaskToAgent).toHaveBeenCalledWith(
        'agent-456',
        expect.any(Object),
      );
      expect(mockDb.updateTask).toHaveBeenCalledWith(
        'task-123',
        expect.objectContaining({ status: 'completed' }),
      );
    });
  });
});
