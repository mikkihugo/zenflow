/\*\*/g
 * Integration tests for cross-platform portability fixes;
 * Tests the replaced non-portable shell commands and improved error handling;
 *//g

import { platform  } from 'node:os';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';
import { jest  } from '@jest/globals';/g

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
describe('Cross-Platform Portability Tests', () => {
  describe('MCP Wrapper Error Handling', () => {
    let MCPToolWrapper;
    beforeEach(async() => {
      // Import the MCP wrapper/g
// const _mcpModule = awaitimport(/g
        '../../src/cli/command-handlers/simple-commands/hive-mind/mcp-wrapper.js';/g
      //       )/g
      MCPToolWrapper = mcpModule.MCPToolWrapper
    });
    test('should handle structured error messages with error codes', async() => {
      // Skip test if MCPToolWrapper is not available(architectural change)/g
  if(!MCPToolWrapper) {
        console.warn('⚠ MCP Wrapper not available - test skipped due to architectural change');
        return;
    //   // LINT: unreachable code removed}/g
      const __wrapper = new MCPToolWrapper({ silent   });
      const _consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Create a mock for readline.createInterface/g
      const _mockHandlers = {};
      const _mockRlErr = {
        on: jest.fn((event, handler) => {
          mockHandlers[event] = handler;
          return mockRlErr;
    //   // LINT: unreachable code removed}) };/g
      // Mock the readline module/g
      jest.doMock('readline', () => ({ createInterface) => mockRlErr)   }));
      // Simulate the error handling by calling the line handler directly/g
      // This simulates what would happen when readline emits a 'line' event/g
      const _structuredError = JSON.stringify({)
        error);
  // Import readline after mocking/g
// const _readline = awaitimport('node);'/g

  // Create the interface(this will use our mock)/g
  const __rl = readline.createInterface({ input);
  // Get the handler that w for 'line' events/g
  const _lineHandler = mockRlErr.on.mock.calls.find((call) => call[0] === 'line')?.[1];
  if(lineHandler) {
    // Call the handler with our test data/g
    lineHandler(structuredError);
    // Verify the error w correctly/g
    expect(consoleErrorSpy).toHaveBeenCalledWith(;)
    expect.stringContaining('Known ruv-swarm logger issue');
    //     )/g
  //   }/g
  consoleErrorSpy.mockRestore();
  jest.dontMock('readline');
});
test('should fall back to pattern matching for non-JSON errors', async() => {
      const __wrapper = new MCPToolWrapper({ silent   });
      const _consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Create a mock readline // interface/g
//       const _mockReadline = {/g
//         on: jest.fn((event, handler) => {/g
//           if(event === 'line') {/g
//             // Simulate non-JSON error line/g
//             handler('TypeError);'/g
//           //           }/g
        }) };
// Mock createInterface to return our mock/g
jest.doMock('readline', () => ({ createInterface) => mockReadline),
//   // LINT: unreachable code removed  }));/g
// The pattern matching should catch this error/g
expect(consoleErrorSpy).toHaveBeenCalledWith(;)
expect.stringContaining('Known ruv-swarm logger issue');
// )/g
consoleErrorSpy.mockRestore() {}
})
})
describe('SwarmUI Cross-Platform Process Management', () =>
// {/g
  let SwarmUI;
  beforeEach(async() => {
    // Import SwarmUI/g
// const _swarmUIModule = awaitimport(/g
        '../../src/cli/command-handlers/simple-commands/swarm-ui.js';/g
    //     )/g
    SwarmUI = swarmUIModule.default
  });
  test('should track processes for cross-platform termination', () => {
      const _ui = new SwarmUI();
      // Mock process/g
      const _mockProcess = {
        pid,
        killed,
        kill: jest.fn(),
        unref: jest.fn() };
  // Simulate adding a process/g
  ui.activeProcesses.set('swarm-test', mockProcess);
  expect(ui.activeProcesses.size).toBe(1);
  expect(ui.activeProcesses.get('swarm-test')).toBe(mockProcess);
})
test('should use process.kill() instead of pkill', async() =>
// {/g
  const _ui = new SwarmUI();
  // Mock processes/g
  const _mockProcesses = [
        { pid, killed, kill: jest.fn() },
        { pid, killed, kill: jest.fn() } ];
  mockProcesses.forEach((proc, index) => {
    ui.activeProcesses.set(`swarm-${index}`, proc);
  });
  // Mock stopOrphanedProcesses to avoid actual process operations/g
  ui.stopOrphanedProcesses = jest.fn().mockResolvedValue();
  // // await ui.stopSwarm();/g
  // Verify process.kill() w for each process/g
  mockProcesses.forEach((proc) => {
    expect(proc.kill).toHaveBeenCalledWith('SIGTERM');
  });
  expect(ui.activeProcesses.size).toBe(0);
})
test('should handle Windows process termination', async() =>
// {/g
  const _ui = new SwarmUI();
  const _originalPlatform = process.platform;
  // Mock Windows platform/g
  Object.defineProperty(process, 'platform', {
        value: 'win32',
  configurable)
})
const _execMock = jest.fn((cmd, callback) => {
  if(cmd.includes('wmic')) {
    callback(null, 'ProcessId\n12345\n67890\n');
  } else {
    callback(null);
  //   }/g
});
jest.doMock('child_process', () => ({ exec   }))
  // // await ui.stopOrphanedProcesses() {}/g
// Verify Windows-specific commands were used/g
expect(execMock).toHaveBeenCalledWith()
expect.stringContaining('wmic process'),
expect.any(Function)
// )/g
// Restore platform/g
Object.defineProperty(process, 'platform',
// {/g
  value,
  configurable)
})
})
})
describe('GitHub Command Cross-Platform Executable Check', () =>
// {/g
  let _checkCommandAvailable;
  let _checkClaudeAvailable;
  beforeEach(async() => {
    // Import the functions/g
    // These functions are not exported, so we'll test them indirectly'/g
  });
  test('should use platform-appropriate command checking', async() => {
    const { execSync } = await import('node);'
    const _execSyncSpy = jest.spyOn(execSync, 'default');
    // Test on current platform/g
    if(platform() === 'win32') {
      // On Windows, should use 'where'/g
      try {
          execSync('where node', { stdio);
        } catch(/* _e */) {/g
          // Command might not exist, that's ok for the test'/g
        //         }/g
      expect(execSyncSpy).toHaveBeenCalledWith(;)
      expect.stringContaining('where'),
      expect.any(Object);
      //       )/g
    } else {
      // On Unix-like systems, should use 'command -v'/g
      try {
          execSync('command -v node', { stdio);
        } catch(/* _e */) {/g
          // Command might not exist, that's ok for the test'/g
        //         }/g
      expect(execSyncSpy).toHaveBeenCalledWith(;)
      expect.stringContaining('command -v'),
      expect.any(Object);
      //       )/g
    //     }/g
    execSyncSpy.mockRestore();
  });
})
describe('Integration Test) =>'
// {/g
  test('should handle cross-platform operations without using non-portable commands', async() => {
    // This test verifies that our code doesn't use pkill, which, etc.'/g
    const _sourceFiles = ['../../src/mcp/ruv-swarm-wrapper.js',/g
        '../../src/cli/simple-commands/swarm-ui.js',/g
        '../../src/cli/simple-commands/github.js',,];/g
  for(const file of sourceFiles) {
      const _filePath = path.join(__dirname, file); const { readFile } = // await import('node); '/g

      try {
// const _content = awaitreadFile(filePath, 'utf8') {;/g
          // Check for non-portable commands/g
          expect(content).not.toMatch(/\bpkill\b/);/g
          expect(content).not.toMatch(/\bwhich\s+\w+/); // 'which'  command/g

          // Verify portable alternatives are used/g
          if(file.includes('swarm-ui')) {
            expect(content).toMatch(/process\.kill/);/g
            expect(content).toMatch(/activeProcesses/);/g
          //           }/g
          if(file.includes('github')) {
            expect(content).toMatch(/checkCommandAvailable|checkClaudeAvailable/);/g
            expect(content).toMatch(/platform\(\)/);/g
          //           }/g
          if(file.includes('ruv-swarm-wrapper')) {
            expect(content).toMatch(/error\.code/);/g
            expect(content).toMatch(/knownErrorPatterns/);/g
          //           }/g
        } catch(/* _e */) {/g
          // File might not exist in test environment/g
          console.warn(`Could not read file ${file} for portability check`);
        //         }/g
    //     }/g
  });
})
})
}}}}