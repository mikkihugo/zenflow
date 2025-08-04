/**
 * @fileoverview Integration test for the refactored Orchestrator.
 * This test adapts the London School TDD approach from the original test suite.
 */

import { describe, expect, it, jest } from '@jest/globals';
import { Orchestrator } from '../../coordination/orchestrator';
import { SwarmDatabase } from '../../database/swarm-database';

// Mock dependencies
jest.mock('../../coordination/strategies/ruv-swarm.strategy.js');

// Create a mock strategy instead of importing non-existent one
const mockZenSwarmStrategy = {
  getAgents: jest.fn(),
  assignTaskToAgent: jest.fn(),
};

const MockedSwarmDatabase = SwarmDatabase as jest.MockedClass<typeof SwarmDatabase>;

describe('Orchestrator Integration Test', () => {
  let orchestrator: Orchestrator;
  let mockDb: jest.Mocked<SwarmDatabase>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Instantiate the mock database
    mockDb = new MockedSwarmDatabase() as jest.Mocked<SwarmDatabase>;

    // Mock the database constructor to return our mock instance
    (SwarmDatabase as jest.Mock).mockImplementation(() => mockDb);

    orchestrator = new Orchestrator(mockZenSwarmStrategy as any);
  });

  describe('User Story: Task Execution', () => {
    it('should initialize, create a plan, and execute a task through the swarm', async () => {
      // Arrange
      const task = {
        id: 'task-123',
        description: 'Test task',
        strategy: 'sequential',
        dependencies: [],
        requiredCapabilities: ['test-capability'],
        maxAgents: 1,
        requireConsensus: false,
      };

      const agent = {
        id: 'agent-456',
        capabilities: ['test-capability'],
        status: 'idle',
      };

      // Mock the interactions
      mockDb.initialize.mockResolvedValue();
      mockDb.createTask.mockResolvedValue(task as any);
      mockDb.updateTask.mockResolvedValue(task as any);
      mockZenSwarmStrategy.getAgents.mockResolvedValue([agent]);
      mockZenSwarmStrategy.assignTaskToAgent.mockResolvedValue();

      // Act
      await orchestrator.initialize();
      await orchestrator.submitTask(task);

      // Assert
      expect(mockDb.initialize).toHaveBeenCalled();
      expect(mockDb.createTask).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-123' }));
      expect(mockZenSwarmStrategy.getAgents).toHaveBeenCalled();
      expect(mockZenSwarmStrategy.assignTaskToAgent).toHaveBeenCalledWith(
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
