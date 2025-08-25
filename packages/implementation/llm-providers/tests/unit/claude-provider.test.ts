import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  executeClaudeTask,
  executeSwarmCoordinationTask,
  ClaudeTaskManager,
  getGlobalClaudeTaskManager,
  streamClaudeTask,
  executeParallelClaudeTasks,
  filterMessagesForClaudeCode,
  cleanupGlobalInstances,
} from '../../src/claude/claude-sdk';
import {
  mockClaudeSDK,
  mockTaskManager,
  mockMessageProcessor,
  mockPermissionHandler,
} from '../mocks/llm-mocks';

// Mock the Claude Code SDK
vi.mock('@anthropic-ai/claude-code', () => ({'
  ClaudeCodeSDK: vi.fn(() => mockClaudeSDK),
  default: mockClaudeSDK,
}));

// Mock the Claude Code SDK query function
vi.mock('@anthropic-ai/claude-code/sdk.mjs', () => ({'
  query: vi.fn().mockResolvedValue({
    choices: [
      { message: { content: 'Mocked Claude response', role: 'assistant' } },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  }),
}));

describe('Claude Provider', () => {'
  beforeEach(() => {
    vi.clearAllMocks();
    cleanupGlobalInstances();
  });

  afterEach(() => {
    cleanupGlobalInstances();
  });

  describe('executeClaudeTask', () => {'
    it('should execute simple tasks successfully', async () => {'
      const mockMessages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hello! How can I help you today?' },
      ];

      mockClaudeSDK.sendMessage.mockResolvedValue({
        id: 'msg-123',
        content: 'Hello! How can I help you today?',
        role: 'assistant',
      });

      const result = await executeClaudeTask('Hello', {'
        maxTurns: 1,
        allowedTools: [],
        timeoutMs: 5000,
      });

      expect(result).toBeDefined();
      expect(mockClaudeSDK.sendMessage).toHaveBeenCalledWith('Hello');'
    });

    it('should handle task options correctly', async () => {'
      const options = {
        maxTurns: 3,
        allowedTools: ['read', 'write', 'bash'],
        timeoutMs: 30000,
        temperature: 0.7,
        maxTokens: 4000,
      };

      await executeClaudeTask('Complex task', options);'

      expect(mockClaudeSDK.sendMessage).toHaveBeenCalled();
      // Verify options are passed through (implementation specific)
    });

    it('should handle errors gracefully', async () => {'
      mockClaudeSDK.sendMessage.mockRejectedValue(
        new Error('Claude API error')'
      );

      await expect(executeClaudeTask('failing task')).rejects.toThrow('
        'Claude API error''
      );
    });

    it('should respect timeout settings', async () => {'
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      mockClaudeSDK.sendMessage.mockImplementation(() => delay(10000));

      await expect(
        executeClaudeTask('slow task', { timeoutMs: 100 })'
      ).rejects.toThrow();
    }, 1000);

    it('should handle permission checks', async () => {'
      mockPermissionHandler.checkPermission.mockResolvedValue({
        allowed: false,
        reason: 'Tool not permitted',
      });

      const result = await executeClaudeTask('task requiring permissions', {'
        allowedTools: ['bash'],
      });

      expect(mockPermissionHandler.checkPermission).toHaveBeenCalled();
    });
  });

  describe('executeSwarmCoordinationTask', () => {'
    it('should execute swarm coordination tasks', async () => {'
      const coordinationTask = {
        type: 'swarm-coordination',
        agents: ['agent1', 'agent2'],
        objective: 'Coordinate file analysis',
      };

      mockClaudeSDK.sendMessage.mockResolvedValue({
        content: 'Swarm coordination initiated',
        metadata: { agents: coordinationTask.agents },
      });

      const result = await executeSwarmCoordinationTask(coordinationTask);

      expect(result).toBeDefined();
      expect(mockClaudeSDK.sendMessage).toHaveBeenCalled();
    });

    it('should handle swarm-specific options', async () => {'
      const coordinationTask = {
        type: 'swarm-coordination',
        agents: ['researcher', 'analyzer', 'coordinator'],
        objective: 'Multi-agent analysis',
        parallelExecution: true,
        maxConcurrency: 3,
      };

      await executeSwarmCoordinationTask(coordinationTask, {
        enableMemory: true,
        memoryScope: 'swarm-session',
      });

      expect(mockClaudeSDK.sendMessage).toHaveBeenCalled();
    });
  });

  describe('ClaudeTaskManager', () => {'
    let taskManager: ClaudeTaskManager;

    beforeEach(() => {
      taskManager = new ClaudeTaskManager();
    });

    it('should create task manager instance', () => {'
      expect(taskManager).toBeDefined();
      expect(taskManager).toBeInstanceOf(ClaudeTaskManager);
    });

    it('should execute tasks through manager', async () => {'
      const taskId = await taskManager.executeTask('manager task', {'
        priority: 'high',
        category: 'analysis',
      });

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');'
    });

    it('should track task status', async () => {'
      const taskId = await taskManager.executeTask('status task');'
      const status = await taskManager.getTaskStatus(taskId);

      expect(status).toBeDefined();
      expect(['pending', 'running', 'completed', 'failed']).toContain(status);'
    });

    it('should handle task cancellation', async () => {'
      const taskId = await taskManager.executeTask('long running task');'
      const cancelled = await taskManager.cancelTask(taskId);

      expect(typeof cancelled).toBe('boolean');'
    });

    it('should manage completed tasks', () => {'
      const initialCount = taskManager.getCompletedTaskCount();
      taskManager.clearCompletedTasks();
      const afterClearCount = taskManager.getCompletedTaskCount();

      expect(typeof initialCount).toBe('number');'
      expect(afterClearCount).toBe(0);
    });

    it('should manage permission denials', () => {'
      taskManager.addPermissionDenial('test-tool', 'Not allowed in test');'
      const denials = taskManager.getPermissionDenials();

      expect(Array.isArray(denials)).toBe(true);

      taskManager.clearPermissionDenials();
      const afterClear = taskManager.getPermissionDenials();
      expect(afterClear).toHaveLength(0);
    });
  });

  describe('getGlobalClaudeTaskManager', () => {'
    it('should return singleton task manager', () => {'
      const manager1 = getGlobalClaudeTaskManager();
      const manager2 = getGlobalClaudeTaskManager();

      expect(manager1).toBe(manager2);
      expect(manager1).toBeInstanceOf(ClaudeTaskManager);
    });

    it('should maintain state across calls', async () => {'
      const manager = getGlobalClaudeTaskManager();
      const taskId = await manager.executeTask('global task');'

      const manager2 = getGlobalClaudeTaskManager();
      const status = await manager2.getTaskStatus(taskId);

      expect(status).toBeDefined();
    });
  });

  describe('streamClaudeTask', () => {'
    it('should stream task responses', async () => {'
      const mockStream = async function* () {
        yield { type: 'start', taskId: 'stream-task-123' };'
        yield { type: 'content', content: 'Streaming' };'
        yield { type: 'content', content: ' Claude' };'
        yield { type: 'content', content: ' response' };'
        yield { type: 'complete', result: 'Streaming Claude response' };'
      };

      mockClaudeSDK.streamMessage.mockReturnValue(mockStream())();

      const stream = streamClaudeTask('stream test', { enableStreaming: true });'
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(5);
      expect(chunks[0].type).toBe('start');'
      expect(chunks[4].type).toBe('complete');'
    });

    it('should handle streaming errors', async () => {'
      const mockStream = async function* () {
        yield { type: 'start', taskId: 'error-stream' };'
        throw new Error('Stream interrupted');'
      };

      mockClaudeSDK.streamMessage.mockReturnValue(mockStream())();

      const stream = streamClaudeTask('error stream');'

      try {
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Stream interrupted');'
      }
    });
  });

  describe('executeParallelClaudeTasks', () => {'
    it('should execute multiple tasks in parallel', async () => {'
      const tasks = [
        { content: 'Task 1', options: { category: 'analysis' } },
        { content: 'Task 2', options: { category: 'generation' } },
        { content: 'Task 3', options: { category: 'review' } },
      ];

      mockClaudeSDK.sendMessage
        .mockResolvedValueOnce({ content: 'Result 1', taskId: '1' })'
        .mockResolvedValueOnce({ content: 'Result 2', taskId: '2' })'
        .mockResolvedValueOnce({ content: 'Result 3', taskId: '3' });'

      const results = await executeParallelClaudeTasks(tasks, {
        maxConcurrency: 3,
        failFast: false,
      });

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
      expect(mockClaudeSDK.sendMessage).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in parallel execution', async () => {'
      const tasks = [
        { content: 'Success task' },
        { content: 'Failing task' },
        { content: 'Another success task' },
      ];

      mockClaudeSDK.sendMessage
        .mockResolvedValueOnce({ content: 'Success 1' })'
        .mockRejectedValueOnce(new Error('Task failed'))'
        .mockResolvedValueOnce({ content: 'Success 2' });'

      const results = await executeParallelClaudeTasks(tasks, {
        failFast: false,
      });

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it('should respect concurrency limits', async () => {'
      const tasks = Array.from({ length: 10 }, (_, i) => ({
        content: `Task ${i + 1}`,`
      }));

      let concurrentCount = 0;
      let maxConcurrent = 0;

      mockClaudeSDK.sendMessage.mockImplementation(async () => {
        concurrentCount++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);

        await new Promise((resolve) => setTimeout(resolve, 50));

        concurrentCount--;
        return { content: 'Task completed' };'
      });

      await executeParallelClaudeTasks(tasks, { maxConcurrency: 3 });

      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });
  });

  describe('filterMessagesForClaudeCode', () => {'
    it('should filter messages for Claude Code compatibility', () => {'
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'system', content: 'System message' },
        { role: 'tool', content: 'Tool output', tool_call_id: '123' },
        { role: 'user', content: 'Follow up question' },
      ];

      const filtered = filterMessagesForClaudeCode(messages);

      expect(Array.isArray(filtered)).toBe(true);
      expect(filtered.length).toBeLessThanOrEqual(messages.length);

      // Should contain valid Claude Code message types
      filtered.forEach((msg) => {
        expect(['user', 'assistant', 'system']).toContain(msg.role);'
        expect(msg.content).toBeDefined();
      });
    });

    it('should preserve message order', () => {'
      const messages = [
        { role: 'user', content: 'First' },
        { role: 'assistant', content: 'Second' },
        { role: 'user', content: 'Third' },
      ];

      const filtered = filterMessagesForClaudeCode(messages);

      expect(filtered[0].content).toBe('First');'
      expect(filtered[1].content).toBe('Second');'
      expect(filtered[2].content).toBe('Third');'
    });

    it('should handle empty message arrays', () => {'
      const filtered = filterMessagesForClaudeCode([]);
      expect(filtered).toEqual([]);
    });

    it('should handle malformed messages gracefully', () => {'
      const messages = [
        { role: 'user', content: 'Valid message' },
        { role: 'invalid' }, // Missing content'
        null, // Null message
        { content: 'Missing role' }, // Missing role'
        { role: 'user', content: 'Another valid message' },
      ];

      const filtered = filterMessagesForClaudeCode(messages as any);

      expect(filtered.length).toBe(2);
      expect(filtered[0].content).toBe('Valid message');'
      expect(filtered[1].content).toBe('Another valid message');'
    });
  });

  describe('cleanupGlobalInstances', () => {'
    it('should cleanup global instances', () => {'
      // Create some global state
      getGlobalClaudeTaskManager();

      expect(() => cleanupGlobalInstances()).not.toThrow();
    });

    it('should reset global task manager', () => {'
      const manager1 = getGlobalClaudeTaskManager();
      manager1.executeTask('test task');'

      cleanupGlobalInstances();

      const manager2 = getGlobalClaudeTaskManager();
      expect(manager2).not.toBe(manager1);
    });
  });

  describe('Error Handling and Resilience', () => {'
    it('should handle Claude SDK initialization errors', async () => {'
      vi.mocked(mockClaudeSDK.createSession).mockRejectedValue(
        new Error('SDK initialization failed')'
      );

      await expect(executeClaudeTask('test')).rejects.toThrow();'
    });

    it('should handle network timeouts', async () => {'
      mockClaudeSDK.sendMessage.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)'
          )
      );

      await expect(
        executeClaudeTask('test', { timeoutMs: 50 })'
      ).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {'
      mockClaudeSDK.sendMessage.mockRejectedValue(
        Object.assign(new Error('Rate limit exceeded'), {'
          code: 'RATE_LIMITED',
        })
      );

      await expect(executeClaudeTask('test')).rejects.toThrow('
        'Rate limit exceeded''
      );
    });

    it('should handle malformed responses', async () => {'
      mockClaudeSDK.sendMessage.mockResolvedValue(null);

      const result = await executeClaudeTask('test');'
      expect(result).toBeNull();
    });
  });

  describe('Performance and Optimization', () => {'
    it('should handle large message contexts efficiently', async () => {'
      const largeContent = 'x'.repeat(100000); // 100KB message'

      const startTime = Date.now();
      await executeClaudeTask(largeContent);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockClaudeSDK.sendMessage).toHaveBeenCalledWith(largeContent);
    });

    it('should reuse connections efficiently', async () => {'
      const tasks = Array.from({ length: 5 }, (_, i) => `Task ${i + 1}`);`

      for (const task of tasks) {
        await executeClaudeTask(task);
      }

      // SDK should be called for each task but connection should be reused
      expect(mockClaudeSDK.sendMessage).toHaveBeenCalledTimes(5);
    });
  });
});
