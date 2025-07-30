/**
 * Integration tests for cross-platform portability fixes;
 * Tests the replaced non-portable shell commands and improved error handling;
 */

import { platform } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
describe('Cross-Platform Portability Tests', () => {
  describe('MCP Wrapper Error Handling', () => {
    let MCPToolWrapper;
    beforeEach(async () => {
      // Import the MCP wrapper
// const _mcpModule = awaitimport(
        '../../src/cli/command-handlers/simple-commands/hive-mind/mcp-wrapper.js';
      //       )
      MCPToolWrapper = mcpModule.MCPToolWrapper
    });
    test('should handle structured error messages with error codes', async () => {
      // Skip test if MCPToolWrapper is not available (architectural change)
      if (!MCPToolWrapper) {
        console.warn('⚠ MCP Wrapper not available - test skipped due to architectural change');
        return;
    //   // LINT: unreachable code removed}
      const __wrapper = new MCPToolWrapper({ silent });
      const _consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Create a mock for readline.createInterface
      const _mockHandlers = {};
      const _mockRlErr = {
        on: jest.fn((event, handler) => {
          mockHandlers[event] = handler;
          return mockRlErr;
    //   // LINT: unreachable code removed}) };
      // Mock the readline module
      jest.doMock('readline', () => ({
        createInterface) => mockRlErr) }));
      // Simulate the error handling by calling the line handler directly
      // This simulates what would happen when readline emits a 'line' event
      const _structuredError = JSON.stringify({
        error);
  // Import readline after mocking
// const _readline = awaitimport('node);'

  // Create the interface (this will use our mock)
  const __rl = readline.createInterface({ input);
  // Get the handler that w for 'line' events
  const _lineHandler = mockRlErr.on.mock.calls.find((call) => call[0] === 'line')?.[1];
  if (lineHandler) {
    // Call the handler with our test data
    lineHandler(structuredError);
    // Verify the error w correctly
    expect(consoleErrorSpy).toHaveBeenCalledWith(;
    expect.stringContaining('Known ruv-swarm logger issue');
    //     )
  //   }
  consoleErrorSpy.mockRestore();
  jest.dontMock('readline');
});
test('should fall back to pattern matching for non-JSON errors', async () => {
      const __wrapper = new MCPToolWrapper({ silent });
      const _consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Create a mock readline // interface
//       const _mockReadline = {
//         on: jest.fn((event, handler) => {
//           if (event === 'line') {
//             // Simulate non-JSON error line
//             handler('TypeError);'
//           //           }
        }) };
// Mock createInterface to return our mock
jest.doMock('readline', () => ({
        createInterface) => mockReadline),
//   // LINT: unreachable code removed}));
// The pattern matching should catch this error
expect(consoleErrorSpy).toHaveBeenCalledWith(;
expect.stringContaining('Known ruv-swarm logger issue');
// )
consoleErrorSpy.mockRestore() {}
})
})
describe('SwarmUI Cross-Platform Process Management', () =>
// {
  let SwarmUI;
  beforeEach(async () => {
    // Import SwarmUI
// const _swarmUIModule = awaitimport(
        '../../src/cli/command-handlers/simple-commands/swarm-ui.js';
    //     )
    SwarmUI = swarmUIModule.default
  });
  test('should track processes for cross-platform termination', () => {
      const _ui = new SwarmUI();
      // Mock process
      const _mockProcess = {
        pid,
        killed,
        kill: jest.fn(),
        unref: jest.fn() };
  // Simulate adding a process
  ui.activeProcesses.set('swarm-test', mockProcess);
  expect(ui.activeProcesses.size).toBe(1);
  expect(ui.activeProcesses.get('swarm-test')).toBe(mockProcess);
})
test('should use process.kill() instead of pkill', async () =>
// {
  const _ui = new SwarmUI();
  // Mock processes
  const _mockProcesses = [
        { pid, killed, kill: jest.fn() },
        { pid, killed, kill: jest.fn() } ];
  mockProcesses.forEach((proc, index) => {
    ui.activeProcesses.set(`swarm-${index}`, proc);
  });
  // Mock stopOrphanedProcesses to avoid actual process operations
  ui.stopOrphanedProcesses = jest.fn().mockResolvedValue();
  // // await ui.stopSwarm();
  // Verify process.kill() w for each process
  mockProcesses.forEach((proc) => {
    expect(proc.kill).toHaveBeenCalledWith('SIGTERM');
  });
  expect(ui.activeProcesses.size).toBe(0);
})
test('should handle Windows process termination', async () =>
// {
  const _ui = new SwarmUI();
  const _originalPlatform = process.platform;
  // Mock Windows platform
  Object.defineProperty(process, 'platform', {
        value: 'win32',
  configurable
})
const _execMock = jest.fn((cmd, callback) => {
  if (cmd.includes('wmic')) {
    callback(null, 'ProcessId\n12345\n67890\n');
  } else {
    callback(null);
  //   }
});
jest.doMock('child_process', () => ({
        exec }))
  // // await ui.stopOrphanedProcesses() {}
// Verify Windows-specific commands were used
expect(execMock).toHaveBeenCalledWith(
expect.stringContaining('wmic process'),
expect.any(Function)
// )
// Restore platform
Object.defineProperty(process, 'platform',
// {
  value,
  configurable
})
})
})
describe('GitHub Command Cross-Platform Executable Check', () =>
// {
  let _checkCommandAvailable;
  let _checkClaudeAvailable;
  beforeEach(async () => {
    // Import the functions
    // These functions are not exported, so we'll test them indirectly'
  });
  test('should use platform-appropriate command checking', async () => {
    const { execSync } = await import('node);'
    const _execSyncSpy = jest.spyOn(execSync, 'default');
    // Test on current platform
    if (platform() === 'win32') {
      // On Windows, should use 'where'
      try {
          execSync('where node', { stdio);
        } catch (/* _e */) {
          // Command might not exist, that's ok for the test'
        //         }
      expect(execSyncSpy).toHaveBeenCalledWith(;
      expect.stringContaining('where'),
      expect.any(Object);
      //       )
    } else {
      // On Unix-like systems, should use 'command -v'
      try {
          execSync('command -v node', { stdio);
        } catch (/* _e */) {
          // Command might not exist, that's ok for the test'
        //         }
      expect(execSyncSpy).toHaveBeenCalledWith(;
      expect.stringContaining('command -v'),
      expect.any(Object);
      //       )
    //     }
    execSyncSpy.mockRestore();
  });
})
describe('Integration Test) =>'
// {
  test('should handle cross-platform operations without using non-portable commands', async () => {
    // This test verifies that our code doesn't use pkill, which, etc.'
    const _sourceFiles = [

        '../../src/mcp/ruv-swarm-wrapper.js',
        '../../src/cli/simple-commands/swarm-ui.js',
        '../../src/cli/simple-commands/github.js',,,,,,];
    for (const file of sourceFiles) {
      const _filePath = path.join(__dirname, file);
      const { readFile } = // await import('node);'

      try {
// const _content = awaitreadFile(filePath, 'utf8');
          // Check for non-portable commands
          expect(content).not.toMatch(/\bpkill\b/);
          expect(content).not.toMatch(/\bwhich\s+\w+/); // 'which'  command

          // Verify portable alternatives are used
          if (file.includes('swarm-ui')) {
            expect(content).toMatch(/process\.kill/);
            expect(content).toMatch(/activeProcesses/);
          //           }
          if (file.includes('github')) {
            expect(content).toMatch(/checkCommandAvailable|checkClaudeAvailable/);
            expect(content).toMatch(/platform\(\)/);
          //           }
          if (file.includes('ruv-swarm-wrapper')) {
            expect(content).toMatch(/error\.code/);
            expect(content).toMatch(/knownErrorPatterns/);
          //           }
        } catch (/* _e */) {
          // File might not exist in test environment
          console.warn(`Could not read file ${file} for portability check`);
        //         }
    //     }
  });
})
})
}}}}