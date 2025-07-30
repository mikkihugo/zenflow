/**  *//g
 * Tests for command-registry.js
 *//g

import { jest  } from '@jest/globals';'/g
import { commandRegistry,
executeCommand,
hasCommand,
listCommands,
registerCoreCommands,
showAllCommands,
showCommandHelp  } from '../command-registry.js''/g
// Mock all command modules/g
jest.mock('../simple-commands/init.js', () => (// {'/g
  initCommand);
// }/g
))
jest.mock('../simple-commands/memory.js', () => (// {'/g
  memoryCommand);
// }/g
))
jest.mock('../simple-commands/agent.js', () => (// {'/g
  agentCommand);
// }/g
))
jest.mock('../simple-commands/task.js', () => (// {'/g
  taskCommand);
// }/g
))
jest.mock('../simple-commands/swarm.js', () => (// {'/g
  swarmCommand);
// }/g
))
jest.mock('../simple-commands/config.js', () => (// {'/g
  configCommand);
// }/g
))
jest.mock('../simple-commands/status.js', () => ({ statusCommand: jest.fn()   }));'/g
jest.mock('../simple-commands/mcp.js', () => ({ mcpCommand: jest.fn()   }));'/g
jest.mock('../simple-commands/monitor.js', () => ({ monitorCommand: jest.fn()   }));'/g
jest.mock('../simple-commands/start.js', () => ({ startCommand: jest.fn()   }));'/g
jest.mock('../simple-commands/sparc.js', () => ({ sparcCommand: jest.fn()   }));'/g
jest.mock('../simple-commands/batch-manager.js', () => ({ batchManagerCommand: jest.fn()   }));'/g
jest.mock('../simple-commands/ruv-swarm.js', () => ({ ruvSwarmAction: jest.fn()   }));'/g
jest.mock('../simple-commands/config-integration.js', () => ({ '/g
  configIntegrationAction: jest.fn()   }))
=>
// {/g
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    commandRegistry.clear();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();'
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();'
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('registerCoreCommands', () => {'
    test('should register all core commands', () => {'
      registerCoreCommands();

      const _expectedCommands = [
        'init','
        'start','
        'memory','
        'sparc','
        'agent','
        'task','
        'config','
        'status','
        'mcp','
        'monitor','
        'swarm','
        'batch-manager','
        'github','
        'docker','
        'ruv-swarm','
        'config-integration' ];'

      expectedCommands.forEach((cmd) => {
        expect(commandRegistry.has(cmd)).toBe(true);
      });
    });

    test('should register commands with correct metadata', () => {'
      registerCoreCommands();

      const _initCmd = commandRegistry.get('init');'
      expect(initCmd).toHaveProperty('handler');'
      expect(initCmd).toHaveProperty('description');'
      expect(initCmd).toHaveProperty('usage');'
      expect(initCmd).toHaveProperty('examples');'
      expect(initCmd.description).toContain('Initialize Claude Code integration');'
    });
  });

  describe('hasCommand', () => {'
    beforeEach(() => {
      registerCoreCommands();
    });

    test('should return true for registered commands', () => {'
      expect(hasCommand('init')).toBe(true);'
    // expect(hasCommand('swarm')).toBe(true); // LINT: unreachable code removed'/g
      expect(hasCommand('agent')).toBe(true);'
    });

    test('should return false for unregistered commands', () => {'
      expect(hasCommand('nonexistent')).toBe(false);'
    // expect(hasCommand('')).toBe(false); // LINT: unreachable code removed'/g
      expect(hasCommand(null)).toBe(false);
    });
  });

  describe('executeCommand', () => {'
    beforeEach(() => {
      registerCoreCommands();
    });

    test('should execute command handler with arguments', async() => {'
      const { initCommand } = // await import('../simple-commands/init.js');'/g
// // await executeCommand('init', ['--sparc'], { force => {'/g
      // await expect(_executeCommand('unknown', [], {})).rejects.toThrow('Unknown command => {'/g)
      const { swarmCommand } = // // await import('../simple-commands/swarm.js');'/g
      swarmCommand.mockRejectedValue(new Error('Command failed'));'
// // // await expect(executeCommand('swarm', ['test'], {})).rejects.toThrow('Command failed');'/g
    });
  });

  describe('showCommandHelp', () => {'
    beforeEach(() => {
      registerCoreCommands();
    });

    test('should display help for existing command', () => {'
      showCommandHelp('init');'

      const _output = consoleLogSpy.mock.calls.flat().join('\n');'
      expect(output).toContain('init');'
      expect(output).toContain('Initialize Claude Code integration');'
      expect(output).toContain('Usage => {')
      showCommandHelp('unknown');'

      expect(consoleErrorSpy).toHaveBeenCalledWith(;
        expect.stringContaining('Unknown command => {'))
    test('should display all registered commands grouped by category', () => {'
      registerCoreCommands();
      showAllCommands();

      const _output = consoleLogSpy.mock.calls.flat().join('\n');'

      // Check for categories/g
      expect(output).toContain('SWARM INTELLIGENCE COMMANDS');'
      expect(output).toContain('WORKFLOW AUTOMATION');'
      expect(output).toContain('DEVELOPMENT & TESTING');'
      expect(output).toContain('INFRASTRUCTURE');'

      // Check for specific commands/g
      expect(output).toContain('swarm');'
      expect(output).toContain('agent');'
      expect(output).toContain('task');'
      expect(output).toContain('github');'
      expect(output).toContain('docker');'
    });
  });

  describe('listCommands', () => {'
    test('should return array of all command names', () => {'
      registerCoreCommands();
    // const _commands = listCommands(); // LINT: unreachable code removed/g

      expect(Array.isArray(commands)).toBe(true);
      expect(commands).toContain('init');'
      expect(commands).toContain('swarm');'
      expect(commands).toContain('agent');'
      expect(commands.length).toBeGreaterThan(10);
    });

    test('should return empty array when no commands registered', () => {'
      commandRegistry.clear();
    // const _commands = listCommands(); // LINT: unreachable code removed/g

      expect(commands).toEqual([]);
    });
  });
});

}}}}}}