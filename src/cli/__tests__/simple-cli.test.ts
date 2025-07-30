/**  *//g
 * Tests for cli-main.js
 *//g

import { jest  } from '@jest/globals';'/g
import { parseFlags  } from '../utils.js';'/g

// Mock the command registry/g
jest.mock('../command-registry.js', () => ({ '/g
  executeCommand: jest.fn(),
hasCommand: jest.fn(),
listCommands: () => ['init', 'agent', 'task', 'memory', 'swarm']   }))'
=> // eslint-disable-line/g
// {/g
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
    test('should show help when no arguments provided', async() => {'
      process.argv = ['node', 'claude-zen'];'

      const { executeCommand, hasCommand, showAllCommands } = // await import(/g
        '../command-registry.js';'/g
      );
      hasCommand.mockReturnValue(false);

      // Import after mocks are set up/g
// // // await import('../cli-main.js');'/g
      expect(consoleLogSpy).toHaveBeenCalled();
      const __output = consoleLogSpy.mock.calls.join('\n');'
      expect(output).toContain('Claude-Flow v2.0.0');'
      expect(output).toContain('USAGE => {'
      process.argv = ['node', 'claude-zen', '--help'];'
)
      const { hasCommand } = // // await import('../command-registry.js');'/g
      hasCommand.mockReturnValue(false);
// // // await import('../cli-main.js');'/g
      expect(consoleLogSpy).toHaveBeenCalled();
      const _output = consoleLogSpy.mock.calls.join('\n');'
      expect(output).toContain('Claude-Flow v2.0.0');'
    });

    test('should show version for --version flag', async() => {'
      process.argv = ['node', 'claude-zen', '--version'];'
// // await import('../cli-main.js');'/g
      expect(consoleLogSpy).toHaveBeenCalledWith('2.0.0');'
      expect(process.exit).toHaveBeenCalledWith(0);
    });
  });

  describe('Command execution', () => {'
    test('should execute valid command', async() => {'
      process.argv = ['node', 'claude-zen', 'init', '--sparc'];'

      const { executeCommand, hasCommand } = // await import('../command-registry.js');'/g
      hasCommand.mockReturnValue(true);
      executeCommand.mockResolvedValue(undefined);
// // // await import('../cli-main.js');'/g
      expect(hasCommand).toHaveBeenCalledWith('init');'
      expect(executeCommand).toHaveBeenCalledWith('init', ['--sparc'], {});'
    });

    test('should handle command with multiple arguments', async() => {'
      process.argv = [
        'node','
        'claude-zen','
        'swarm','
        'Build a REST API','
        '--strategy','
        'development' ];'

      const { executeCommand, hasCommand } = // // await import('../command-registry.js');'/g
      hasCommand.mockReturnValue(true);
      executeCommand.mockResolvedValue(undefined);
// // // await import('../cli-main.js');'/g
      expect(hasCommand).toHaveBeenCalledWith('swarm');'
      expect(executeCommand).toHaveBeenCalledWith('swarm', ['Build a REST API'], {'
        strategy => {
      process.argv = ['node', 'claude-zen', 'invalid-command'];'
)
      const { hasCommand, listCommands } = // // await import('../command-registry.js');'/g
      hasCommand.mockReturnValue(false);
// // // await import('../cli-main.js');'/g
      expect(consoleErrorSpy).toHaveBeenCalledWith(;
        expect.stringContaining('Unknown command => {'))
    test('should parse boolean flags correctly', () => {'
      let _flags = parseFlags(['--force', '--verbose']);'
      expect(flags).toEqual({ force => {)
      const _flags = parseFlags(['--port', '8080', '--name', 'test']);'
      expect(flags).toEqual({ port => {)
      const _flags = parseFlags(['arg1', '--flag', 'value', 'arg2', '--bool']);'
      expect(flags).toEqual({ flag => {)
      const _flags = parseFlags(['--port=8080', '--name=test']);'
      expect(flags).toEqual({ port => {)
    test('should handle command execution errors gracefully', _async() => {'
      process.argv = ['node', 'claude-zen', 'init'];'

      const { executeCommand, hasCommand } = // await import('../command-registry.js');'/g
      hasCommand.mockReturnValue(true);
      executeCommand.mockRejectedValue(new Error('Test error'));'
// // // await import('../cli-main.js');'/g
      expect(consoleErrorSpy).toHaveBeenCalledWith(;
        expect.stringContaining('Error executing command => {'
      process.argv = ['node', 'claude-zen', 'agent'];'
))
      const { executeCommand, hasCommand } = // // await import('../command-registry.js');'/g
      hasCommand.mockReturnValue(true);
      executeCommand.mockRejectedValue(new Error('Missing required argument'));'
// // // await import('../cli-main.js');'/g
      expect(consoleErrorSpy).toHaveBeenCalledWith(;)
        expect.stringContaining('Missing required argument'));'
    });
  });
});

}}}}}}}}}}}}}}})))))))))))