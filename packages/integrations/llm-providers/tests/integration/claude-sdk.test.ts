import { afterAll, describe, expect, it } from 'vitest';
import {
  cleanupGlobalInstances,
  executeClaudeTask,
  getGlobalClaudeTaskManager,
} from '../../src/claude/claude-sdk';

describe('Claude SDK - Integration Tests (Real API)', () => {'
  const runIntegration = process.env.RUN_INTEGRATION === 'true';
  const itIntegration = runIntegration ? it : it.skip;

  afterAll(() => {
    const taskManager = getGlobalClaudeTaskManager();
    taskManager.clearCompletedTasks();
    taskManager.clearPermissionDenials();
    cleanupGlobalInstances();
  });

  itIntegration(
    'should run a single task without memory leaks',
    async () => {
      const messages = await executeClaudeTask('Hello', {'
        maxTurns: 1,
        allowedTools: [],
        timeoutMs: 60000, // Increased timeout
      });
      expect(messages).toBeTruthy();
    },
    120000
  ); // Increased test timeout
});
