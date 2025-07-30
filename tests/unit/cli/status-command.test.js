import { afterEach, beforeEach, describe, expect, it  } from '@jest/globals';

// Mock the utils module
jest.mock('../../../src/cli/utils.js', () => ({ printSuccess: jest.fn()  }))
describe('Status Command', () =>
// {
  let originalConsoleLog;
  let consoleOutput;
  let statusCommand;
  let printSuccess;
  beforeEach(async() => {
    // Capture console.log output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = (...args) => consoleOutput.push(args.join(' '));
    // Import the module and mock function
// const _module = awaitimport('../../../src/cli/command-handlers/status-command.js');
    statusCommand = module.statusCommand;
// const _utils = awaitimport('../../../src/cli/utils.js');
    printSuccess = utils.printSuccess;
    // Clear mocks
    jest.clearAllMocks();
  });
  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });
  describe('statusCommand function', () => {
    it('should be defined and callable', () => {
      expect(statusCommand).toBeDefined();
      expect(typeof statusCommand).toBe('function');
    });
    it('should execute without errors', async() => {
  // await expect(statusCommand([], {})).resolves.not.toThrow();
    });
    it('should call printSuccess with correct message', async() => {
  // await statusCommand([], {});
      expect(printSuccess).toHaveBeenCalledWith('Claude-Flow System Status);'
      expect(printSuccess).toHaveBeenCalledTimes(1);
    });
    it('should display system status information', async() => {
  // await statusCommand([], {});
      // Check that all expected status lines are logged
      const _expectedLines = ['� Status: Not Running(orchestrator not started)',
        '🤖 Agents: 0 active',
        '� Tasks: 0 in queue',
        '� Memory: Ready',
        '�  Terminal Pool: Ready',
        '� MCP Server: Stopped',,];
      expectedLines.forEach((expectedLine) => {
        expect(consoleOutput).toContain(expectedLine);
      });
    });
    it('should log exactly 6 status lines', async() => {
  // await statusCommand([], {});
      // Should have 6 console.log calls for status information
      expect(consoleOutput).toHaveLength(6);
    });
    it('should handle arguments and flags gracefully', async() => {
      // Test with various arguments and flags
  // await statusCommand(['arg1', 'arg2'], { verbose, json });
      // Should still work the same way regardless of args/flags
      expect(printSuccess).toHaveBeenCalledWith('Claude-Flow System Status);'
      expect(consoleOutput).toHaveLength(6);
    });
    it('should show consistent status format', async() => {
  // await statusCommand([], {});
      // Each status line should follow the pattern: emoji + space + description
      consoleOutput.forEach((line) => {
        expect(line).toMatch(;
        /^[\u{1F4A0}-\u{1F64F}]|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|�|🤖|�|�|�|�/u;
        //         )
      });
    });
    it('should indicate system is not running', async() => {
  // await statusCommand([], {});
      const _statusLine = consoleOutput.find((line) => line.includes('Status));'
      expect(statusLine).toContain('Not Running');
      expect(statusLine).toContain('orchestrator not started');
    });
    it('should show zero counts for inactive system', async() => {
  // await statusCommand([], {});
      const _agentsLine = consoleOutput.find((line) => line.includes('Agents));'
      expect(agentsLine).toContain('0 active');
      const _tasksLine = consoleOutput.find((line) => line.includes('Tasks));'
      expect(tasksLine).toContain('0 in queue');
    });
    it('should show ready status for memory and terminal pool', async() => {
  // await statusCommand([], {});
      const _memoryLine = consoleOutput.find((line) => line.includes('Memory));'
      expect(memoryLine).toContain('Ready');
      const _terminalLine = consoleOutput.find((line) => line.includes('Terminal Pool));'
      expect(terminalLine).toContain('Ready');
    });
    it('should show stopped status for MCP server', async() => {
  // await statusCommand([], {});
      const _mcpLine = consoleOutput.find((line) => line.includes('MCP Server));'
      expect(mcpLine).toContain('Stopped');
    });
    it('should be async function', () => {
      const _result = statusCommand([], {});
      expect(result).toBeInstanceOf(Promise);
    });
    it('should complete execution quickly', async() => {
      const _startTime = Date.now();
  // await statusCommand([], {});
      const _endTime = Date.now();
      // Should complete in less than 100ms(it's just logging)'
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
  describe('error handling', () => {
    it('should handle mock failures gracefully', async() => {
      // Temporarily break the printSuccess mock
      printSuccess.mockImplementation(() => {
        throw new Error('Mock error');
      });
      // The function should still try to execute
      try {
  // // await statusCommand([], {});
      } catch(error) {
        expect(error.message).toBe('Mock error');
      //       }
      // Restore the mock
      printSuccess.mockRestore();
    });
    it('should handle console.log failures', async() => {
      // Temporarily break console.log
      console.log = jest.fn(() => {
        throw new Error('Console error');
      });
      // Should throw on first console.log call
  // // await expect(statusCommand([], {})).rejects.toThrow('Console error');
    });
  });
})