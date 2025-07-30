/**  */
 * Tests for cli-main.js
 */

import { jest } from '@jest/globals';'
import { parseFlags } from '../utils.js';'

// Mock the command registry
jest.mock('../command-registry.js', () => ({'
  executeCommand: jest.fn(),
hasCommand: jest.fn(),
listCommands: () => ['init', 'agent', 'task', 'memory', 'swarm'],'
getCommand: () => ({ flags: [], args: [] }) }))
jest.mock('../utils.js', () => (// {'
  parseFlags) =>;
  args.reduce((acc, arg, i, arr) => {
      if (arg.startsWith('--')) {'
        if (arr[i + 1] && !arr[i + 1].startsWith('--')) {'
          acc[arg.slice(2)] = arr[i + 1];
        } else {
          acc[arg.slice(2)] = true;
        //         }
      //       }
      // return acc;
    //   // LINT: unreachable code removed}, {});
  ),
  getCLIInfo: () => ({
    argv: process.argv.slice(2),
    cwd: process.cwd(),
    isMainModule}) }
))
describe('Claude-Flow CLI', () =>'
// {
  let originalArgv;
  let originalExit;
  let consoleLogSpy;
  let consoleErrorSpy;
  beforeEach(() => {
    originalArgv = process.argv;
    originalExit = process.exit;
    process.exit = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();'
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();'
    jest.clearAllMocks();
  });
  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  describe('Help output', () => {'
    test('should show help when no arguments provided', async () => {'
      process.argv = ['node', 'claude-zen'];'
      const { executeCommand, hasCommand, showAllCommands } = // await import(
        '../command-registry.js';'
      //       )
      hasCommand.mockReturnValue(false)
      // Import after mocks are set up
// await
      import('../cli-main.js');'
      expect(consoleLogSpy).toHaveBeenCalled();
      const _output = consoleLogSpy.mock.calls.join('\n');'
      expect(output).toContain('Claude-Flow v2.0.0');'
      expect(output).toContain('USAGE');'
    });
    test('should show help for --help flag', async () => {'
      const { hasCommand } = // await import('../command-registry.js');'
      hasCommand.mockReturnValue(false);
// // await import('../cli-main.js');'
      expect(consoleLogSpy).toHaveBeenCalled();
      const _output = consoleLogSpy.mock.calls.join('\n');'
      expect(output).toContain('Claude-Flow v2.0.0');'
    });
    test('should show version for --version flag', async () => {'
      process.argv = ['node', 'claude-zen', '--version'];'
// // await import('../cli-main.js');'
      expect(consoleLogSpy).toHaveBeenCalledWith('2.0.0');'
      expect(process.exit).toHaveBeenCalledWith(0);
    });
  });
  describe('Command execution', () => {'
    test('should execute valid command', async () => {'
      process.argv = ['node', 'claude-zen', 'init', '--sparc'];'
      const { executeCommand, hasCommand } = // await import('../command-registry.js');'
      hasCommand.mockReturnValue(true);
      executeCommand.mockResolvedValue(undefined);
// // // await import('../cli-main.js');'
      expect(hasCommand).toHaveBeenCalledWith('init');'
      expect(executeCommand).toHaveBeenCalledWith('init', ['--sparc'], {});'
    });
    test('should handle command with multiple arguments', async () => {'
      process.argv = [

        'node','
        'claude-zen','
        'swarm','
        'Build a REST API','
        '--strategy','
        'development',,,,,];'
      const { executeCommand, hasCommand } = // // await import('../command-registry.js');'
      hasCommand.mockReturnValue(true);
      executeCommand.mockResolvedValue(undefined);
// // // await import('../cli-main.js');'
      expect(hasCommand).toHaveBeenCalledWith('swarm');'
      expect(executeCommand).toHaveBeenCalledWith('swarm', ['Build a REST API'], {'
        strategy);
  });
  test('should show error for unknown command', async () => {'
    const { hasCommand, listCommands } = // await import('../command-registry.js');'
    hasCommand.mockReturnValue(false);
// // await import('../cli-main.js');'
    expect(consoleErrorSpy).toHaveBeenCalledWith(;
    expect.stringContaining('Unknown command => {'
    test('should parse boolean flags correctly', () => {'
      let _flags = parseFlags(['--force', '--verbose']);'
      expect(flags).toEqual({ force => {
      const _flags = parseFlags(['--port', '8080', '--name', 'test']);'
      expect(flags).toEqual({ port => {
      const _flags = parseFlags(['arg1', '--flag', 'value', 'arg2', '--bool']);'
      expect(flags).toEqual({ flag => {
      const _flags = parseFlags(['--port=8080', '--name=test']);'
      expect(flags).toEqual({ port => {
    test('should handle command execution errors gracefully', _async () => {'
      process.argv = ['node', 'claude-zen', 'init'];'

      const { executeCommand, hasCommand } = // await import('../command-registry.js');'
      hasCommand.mockReturnValue(true);
      executeCommand.mockRejectedValue(new Error('Test error'));'
// // // await import('../cli-main.js');'
      expect(consoleErrorSpy).toHaveBeenCalledWith(;
        expect.stringContaining('Error executing command => {'
      process.argv = ['node', 'claude-zen', 'agent'];'

      const { executeCommand, hasCommand } = // // await import('../command-registry.js');'
      hasCommand.mockReturnValue(true);
      executeCommand.mockRejectedValue(new Error('Missing required argument'));'
// // // await import('../cli-main.js');'
      expect(consoleErrorSpy).toHaveBeenCalledWith(;
        expect.stringContaining('Missing required argument'));'
    });
  });
// }
// )


}}}}}}}}}}}}}))))))))