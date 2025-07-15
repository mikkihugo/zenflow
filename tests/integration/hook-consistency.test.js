/**
 * Integration tests for hook consistency between templates and implementation
 * Tests the fixes for issue #280 - hook inconsistencies between claude-flow and ruv-swarm
 */

import { jest } from '@jest/globals';
import { hooksAction } from '../../src/cli/simple-commands/hooks.js';

describe('Hook Consistency Tests', () => {
  // Mock the store and utilities
  let mockStore;
  let mockPrintSuccess;
  let mockPrintError;
  
  beforeEach(() => {
    mockStore = {
      store: jest.fn().mockResolvedValue(true),
      retrieve: jest.fn().mockResolvedValue(null),
      list: jest.fn().mockResolvedValue([]),
      initialize: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true)
    };
    
    mockPrintSuccess = jest.fn();
    mockPrintError = jest.fn();
    
    // Mock the SqliteMemoryStore
    jest.doMock('../../src/memory/sqlite-store.js', () => ({
      SqliteMemoryStore: jest.fn().mockImplementation(() => mockStore)
    }));
    
    // Mock the utils
    jest.doMock('../../src/cli/utils.js', () => ({
      printSuccess: mockPrintSuccess,
      printError: mockPrintError,
      printWarning: jest.fn(),
      execRuvSwarmHook: jest.fn().mockResolvedValue({ success: true, output: 'test output' }),
      checkRuvSwarmAvailable: jest.fn().mockResolvedValue(true)
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Pre-Command Hook Compatibility', () => {
    test('should handle both pre-command and pre-bash names', async () => {
      // Test pre-command
      await hooksAction(['pre-command'], {
        command: 'echo "test"',
        'validate-safety': true,
        'prepare-resources': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^bash:.+:pre$/),
        expect.objectContaining({
          command: 'echo "test"',
          validationEnabled: true,
          resourcesPrepped: true
        }),
        expect.any(Object)
      );

      // Test pre-bash (should work the same way)
      mockStore.store.mockClear();
      await hooksAction(['pre-bash'], {
        command: 'echo "test2"',
        'validate-safety': true,
        'prepare-resources': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^bash:.+:pre$/),
        expect.objectContaining({
          command: 'echo "test2"',
          validationEnabled: true,
          resourcesPrepped: true
        }),
        expect.any(Object)
      );
    });

    test('should validate dangerous commands when validate-safety is enabled', async () => {
      await hooksAction(['pre-command'], {
        command: 'rm -rf /',
        'validate-safety': true
      });
      
      expect(mockPrintError).toHaveBeenCalledWith(
        expect.stringContaining('Command blocked due to safety validation')
      );
    });

    test('should handle resource preparation', async () => {
      await hooksAction(['pre-command'], {
        command: 'ls',
        'prepare-resources': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^bash:.+:pre$/),
        expect.objectContaining({
          resourcesPrepped: true
        }),
        expect.any(Object)
      );
    });
  });

  describe('Post-Command Hook Compatibility', () => {
    test('should handle both post-command and post-bash names', async () => {
      // Test post-command
      await hooksAction(['post-command'], {
        command: 'echo "test"',
        'track-metrics': true,
        'store-results': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^bash:.+:post$/),
        expect.objectContaining({
          command: 'echo "test"',
          trackMetrics: true,
          storeResults: true
        }),
        expect.any(Object)
      );

      // Test post-bash (should work the same way)
      mockStore.store.mockClear();
      await hooksAction(['post-bash'], {
        command: 'echo "test2"',
        'track-metrics': true,
        'store-results': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^bash:.+:post$/),
        expect.objectContaining({
          command: 'echo "test2"',
          trackMetrics: true,
          storeResults: true
        }),
        expect.any(Object)
      );
    });

    test('should track metrics when enabled', async () => {
      await hooksAction(['post-command'], {
        command: 'echo "test"',
        'exit-code': '0',
        'track-metrics': true,
        duration: '1234'
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^command-metrics:.+$/),
        expect.objectContaining({
          success: true,
          duration: 1234
        }),
        expect.any(Object)
      );
    });

    test('should store detailed results when enabled', async () => {
      await hooksAction(['post-command'], {
        command: 'echo "test"',
        'store-results': true,
        output: 'test output'
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^command-results:.+$/),
        expect.objectContaining({
          command: 'echo "test"',
          output: 'test output',
          fullOutput: true
        }),
        expect.any(Object)
      );
    });
  });

  describe('Pre-Edit Hook Compatibility', () => {
    test('should handle auto-assign-agents parameter', async () => {
      await hooksAction(['pre-edit'], {
        file: 'test.js',
        'auto-assign-agents': true,
        'load-context': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^edit:.+:pre$/),
        expect.objectContaining({
          file: 'test.js',
          autoAssignAgents: true,
          loadContext: true,
          assignedAgentType: 'javascript-developer'
        }),
        expect.any(Object)
      );
    });

    test('should recommend correct agent type based on file extension', async () => {
      const testCases = [
        { file: 'test.js', expected: 'javascript-developer' },
        { file: 'test.ts', expected: 'typescript-developer' },
        { file: 'test.py', expected: 'python-developer' },
        { file: 'test.go', expected: 'golang-developer' },
        { file: 'test.md', expected: 'technical-writer' },
        { file: 'test.yml', expected: 'devops-engineer' },
        { file: 'test.unknown', expected: 'general-developer' }
      ];

      for (const testCase of testCases) {
        mockStore.store.mockClear();
        await hooksAction(['pre-edit'], {
          file: testCase.file,
          'auto-assign-agents': true
        });
        
        expect(mockStore.store).toHaveBeenCalledWith(
          expect.stringMatching(/^edit:.+:pre$/),
          expect.objectContaining({
            assignedAgentType: testCase.expected
          }),
          expect.any(Object)
        );
      }
    });
  });

  describe('Post-Edit Hook Compatibility', () => {
    test('should handle all post-edit parameters', async () => {
      await hooksAction(['post-edit'], {
        file: 'test.js',
        'memory-key': 'test-key',
        format: true,
        'update-memory': true,
        'train-neural': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^edit:.+:post$/),
        expect.objectContaining({
          file: 'test.js',
          memoryKey: 'test-key',
          format: true,
          updateMemory: true,
          trainNeural: true
        }),
        expect.any(Object)
      );
    });

    test('should store neural training patterns when enabled', async () => {
      await hooksAction(['post-edit'], {
        file: 'test.js',
        'train-neural': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^neural-pattern:.+$/),
        expect.objectContaining({
          fileType: '.js',
          patterns: expect.arrayContaining([
            expect.stringContaining('.js_edit_pattern')
          ])
        }),
        expect.any(Object)
      );
    });
  });

  describe('Session-End Hook Compatibility', () => {
    test('should handle all session-end parameters', async () => {
      mockStore.list.mockResolvedValue([
        { value: { timestamp: new Date().toISOString() } },
        { value: { timestamp: new Date().toISOString() } }
      ]);

      await hooksAction(['session-end'], {
        'generate-summary': true,
        'persist-state': true,
        'export-metrics': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^session:.+$/),
        expect.objectContaining({
          generateSummary: true,
          persistState: true,
          exportMetrics: true
        }),
        expect.any(Object)
      );
    });

    test('should persist detailed state when enabled', async () => {
      mockStore.list.mockResolvedValue([
        { value: { timestamp: new Date().toISOString() } }
      ]);

      await hooksAction(['session-end'], {
        'persist-state': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^session-state:.+$/),
        expect.objectContaining({
          fullState: true
        }),
        expect.any(Object)
      );
    });

    test('should export metrics when enabled', async () => {
      mockStore.list.mockResolvedValue([
        { value: { timestamp: new Date().toISOString(), success: true } }
      ]);

      await hooksAction(['session-end'], {
        'export-metrics': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.stringMatching(/^session-metrics:.+$/),
        expect.objectContaining({
          commandSuccessRate: expect.any(Number),
          sessionDuration: expect.any(Number)
        }),
        expect.any(Object)
      );
    });
  });

  describe('Parameter Validation', () => {
    test('should handle both dash and camelCase parameter formats', async () => {
      // Test with dashes
      await hooksAction(['pre-command'], {
        'validate-safety': true,
        'prepare-resources': true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          validationEnabled: true,
          resourcesPrepped: true
        }),
        expect.any(Object)
      );

      // Test with camelCase
      mockStore.store.mockClear();
      await hooksAction(['pre-command'], {
        validateSafety: true,
        prepareResources: true
      });
      
      expect(mockStore.store).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          validationEnabled: true,
          resourcesPrepped: true
        }),
        expect.any(Object)
      );
    });
  });
});