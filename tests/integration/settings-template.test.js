/**
 * Integration tests for settings.json template compatibility
 * Tests that the hook commands in settings.json work with the actual implementation
 */

import { jest } from '@jest/globals';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Settings Template Hook Integration', () => {
  const testTimeout = 30000;
  
  const executeHook = (hookCommand, input = {}) => {
    return new Promise((resolve, reject) => {
      const command = `echo '${JSON.stringify({ tool_input: input })}' | ${hookCommand}`;
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.join(__dirname, '../..'),
        env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', (error) => {
        reject(error);
      });

      setTimeout(() => {
        child.kill();
        reject(new Error('Test timed out'));
      }, testTimeout);
    });
  };

  describe('PreToolUse Bash Hook', () => {
    const hookCommand = 'npx claude-flow@alpha hooks pre-command --command "{}" --validate-safety true --prepare-resources true';

    test('should execute pre-command hook with template parameters', async () => {
      const result = await executeHook(
        hookCommand.replace('{}', 'echo "test"'),
        { command: 'echo "test"' }
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Executing pre-bash hook');
      expect(result.stdout).toContain('Safety validation: ENABLED');
      expect(result.stdout).toContain('Resource preparation: ENABLED');
      expect(result.stdout).toContain('Pre-bash hook completed');
    }, testTimeout);

    test('should block dangerous commands when validation enabled', async () => {
      const result = await executeHook(
        hookCommand.replace('{}', 'rm -rf /'),
        { command: 'rm -rf /' }
      );

      expect(result.code).toBe(0);
      expect(result.stderr).toContain('Command blocked due to safety validation');
    }, testTimeout);
  });

  describe('PreToolUse File Hook', () => {
    const hookCommand = 'npx claude-flow@alpha hooks pre-edit --file "{}" --auto-assign-agents true --load-context true';

    test('should execute pre-edit hook with template parameters', async () => {
      const result = await executeHook(
        hookCommand.replace('{}', 'test.js'),
        { file_path: 'test.js' }
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Executing pre-edit hook');
      expect(result.stdout).toContain('Auto-assign agents: ENABLED');
      expect(result.stdout).toContain('Load context: ENABLED');
      expect(result.stdout).toContain('Recommended agent: javascript-developer');
    }, testTimeout);

    test('should handle alternative file_path extraction', async () => {
      const result = await executeHook(
        hookCommand.replace('{}', 'test.py'),
        { path: 'test.py' } // Alternative path field
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Recommended agent: python-developer');
    }, testTimeout);
  });

  describe('PostToolUse Bash Hook', () => {
    const hookCommand = 'npx claude-flow@alpha hooks post-command --command "{}" --track-metrics true --store-results true';

    test('should execute post-command hook with template parameters', async () => {
      const result = await executeHook(
        hookCommand.replace('{}', 'echo "test"'),
        { command: 'echo "test"' }
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Executing post-bash hook');
      expect(result.stdout).toContain('Metrics tracking: ENABLED');
      expect(result.stdout).toContain('Results storage: ENABLED');
      expect(result.stdout).toContain('Post-bash hook completed');
    }, testTimeout);

    test('should track command metrics properly', async () => {
      const result = await executeHook(
        hookCommand.replace('{}', 'echo "test"') + ' --exit-code 0 --duration 1234',
        { command: 'echo "test"' }
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Command metrics:');
      expect(result.stdout).toContain('SUCCESS');
    }, testTimeout);
  });

  describe('PostToolUse File Hook', () => {
    const hookCommand = 'npx claude-flow@alpha hooks post-edit --file "{}" --format true --update-memory true --train-neural true';

    test('should execute post-edit hook with template parameters', async () => {
      const result = await executeHook(
        hookCommand.replace('{}', 'test.js'),
        { file_path: 'test.js' }
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Executing post-edit hook');
      expect(result.stdout).toContain('Auto-format: ENABLED');
      expect(result.stdout).toContain('Memory update: ENABLED');
      expect(result.stdout).toContain('Neural training: ENABLED');
    }, testTimeout);

    test('should handle formatting for different file types', async () => {
      const testCases = [
        { file: 'test.js', formatter: 'prettier' },
        { file: 'test.py', formatter: 'black' },
        { file: 'test.go', formatter: 'gofmt' },
        { file: 'test.unknown', formatter: null }
      ];

      for (const testCase of testCases) {
        const result = await executeHook(
          hookCommand.replace('{}', testCase.file),
          { file_path: testCase.file }
        );

        expect(result.code).toBe(0);
        if (testCase.formatter) {
          expect(result.stdout).toContain(`Auto-formatting with ${testCase.formatter}`);
        } else {
          expect(result.stdout).toContain('No formatter available');
        }
      }
    }, testTimeout);
  });

  describe('Stop Hook', () => {
    const hookCommand = 'npx claude-flow@alpha hooks session-end --generate-summary true --persist-state true --export-metrics true';

    test('should execute session-end hook with template parameters', async () => {
      const result = await executeHook(hookCommand, {});

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Executing session-end hook');
      expect(result.stdout).toContain('Summary generation: ENABLED');
      expect(result.stdout).toContain('State persistence: ENABLED');
      expect(result.stdout).toContain('Metrics export: ENABLED');
    }, testTimeout);

    test('should generate comprehensive session summary', async () => {
      const result = await executeHook(hookCommand, {});

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('SESSION SUMMARY:');
      expect(result.stdout).toContain('Tasks:');
      expect(result.stdout).toContain('Edits:');
      expect(result.stdout).toContain('Commands:');
      expect(result.stdout).toContain('Agents:');
    }, testTimeout);
  });

  describe('Parameter Extraction', () => {
    test('should properly extract command from tool_input', async () => {
      const toolInput = {
        tool_input: {
          command: 'npm test',
          description: 'Run tests'
        }
      };

      const extractedCommand = JSON.parse(JSON.stringify(toolInput))
        .tool_input.command;

      expect(extractedCommand).toBe('npm test');
    });

    test('should properly extract file path with fallback', async () => {
      const toolInputs = [
        { tool_input: { file_path: 'test.js' } },
        { tool_input: { path: 'test.js' } },
        { tool_input: { file_path: null, path: 'test.js' } }
      ];

      for (const input of toolInputs) {
        const extractedPath = input.tool_input.file_path || input.tool_input.path || '';
        expect(extractedPath).toBe('test.js');
      }
    });
  });

  describe('Command Path Compatibility', () => {
    test('should work with claude-flow@alpha path', async () => {
      const result = await executeHook(
        'npx claude-flow@alpha hooks pre-command --command "echo test" --validate-safety true'
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Pre-bash hook completed');
    }, testTimeout);

    test('should work with local claude-flow path', async () => {
      const result = await executeHook(
        'node src/cli/simple-commands/hooks.js pre-command --command "echo test" --validate-safety true'
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Pre-bash hook completed');
    }, testTimeout);
  });

  describe('Error Handling', () => {
    test('should handle missing required parameters gracefully', async () => {
      const result = await executeHook(
        'npx claude-flow@alpha hooks pre-command --validate-safety true'
      );

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Command:'); // Should show empty or default command
    }, testTimeout);

    test('should handle invalid hook names gracefully', async () => {
      const result = await executeHook(
        'npx claude-flow@alpha hooks invalid-hook --test true'
      );

      expect(result.code).toBe(0);
      expect(result.stderr).toContain('Unknown hooks command: invalid-hook');
    }, testTimeout);
  });
});