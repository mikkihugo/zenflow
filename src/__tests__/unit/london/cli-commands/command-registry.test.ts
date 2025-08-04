/**
 * Command Registry Tests - TDD London School
 *
 * Tests the behavior and interactions of the CommandRegistry class
 * using mocks for external dependencies and focusing on collaboration
 * between objects rather than state verification.
 */

import { jest } from '@jest/globals';
import { BaseCommand } from '../../../../cli/core/base-command';
import { CommandRegistry } from '../../../../cli/core/command-registry';
import type { CommandContext, CommandMetadata, CommandResult } from '../../../../cli/types/index';

// Mock BaseCommand for testing
class MockCommand extends BaseCommand {
  protected async run(_context: CommandContext): Promise<CommandResult> {
    return {
      success: true,
      exitCode: 0,
      message: `Mock command ${this.config.name} executed`,
    };
  }

  getHelp(): string {
    return `Help for ${this.config.name}`;
  }
}

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  stat: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  extname: jest.fn((path: string) => {
    const parts = (path as string).split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }),
}));

describe('CommandRegistry - TDD London', () => {
  let registry: CommandRegistry;
  let mockEventHandler: jest.Mock;

  beforeEach(() => {
    registry = new CommandRegistry();
    mockEventHandler = jest.fn();

    // Listen to all events for behavior verification
    registry.on('command-registered', mockEventHandler);
    registry.on('command-unregistered', mockEventHandler);
    registry.on('command-executing', mockEventHandler);
    registry.on('command-executed', mockEventHandler);
    registry.on('command-error', mockEventHandler);
  });

  afterEach(() => {
    registry.removeAllListeners();
  });

  describe('command registration behavior', () => {
    it('should emit registration event when registering a command', () => {
      // Arrange
      const metadata: CommandMetadata = {
        config: {
          name: 'test-command',
          description: 'Test command',
          category: 'core',
        },
        handler: jest.fn() as any,
        registeredAt: new Date(),
        available: true,
      };

      // Act
      registry.register(metadata);

      // Assert - verify behavior through event emissions
      expect(mockEventHandler).toHaveBeenCalledWith({
        name: 'test-command',
        metadata: expect.objectContaining({
          config: expect.objectContaining({
            name: 'test-command',
          }),
        }),
      });
    });

    it('should register command aliases and make them discoverable', () => {
      // Arrange
      const metadata: CommandMetadata = {
        config: {
          name: 'status',
          description: 'Show status',
          aliases: ['st', 'stat'],
          category: 'core',
        },
        handler: jest.fn() as any,
        registeredAt: new Date(),
        available: true,
      };

      // Act
      registry.register(metadata);

      // Assert - verify behavior through public interface
      expect(registry.has('status')).toBe(true);
      expect(registry.has('st')).toBe(true);
      expect(registry.has('stat')).toBe(true);
      expect(registry.get('st')).toBe(registry.get('status'));
    });

    it('should throw error when registering duplicate command names', () => {
      // Arrange
      const metadata1: CommandMetadata = {
        config: { name: 'duplicate', description: 'First' },
        handler: jest.fn() as any,
        registeredAt: new Date(),
        available: true,
      };
      const metadata2: CommandMetadata = {
        config: { name: 'duplicate', description: 'Second' },
        handler: jest.fn() as any,
        registeredAt: new Date(),
        available: true,
      };

      registry.register(metadata1);

      // Act & Assert - verify error behavior
      expect(() => registry.register(metadata2)).toThrow(
        "Command 'duplicate' is already registered"
      );
    });

    it('should throw error when registering duplicate aliases', () => {
      // Arrange
      const metadata1: CommandMetadata = {
        config: { name: 'cmd1', description: 'First', aliases: ['c'] },
        handler: jest.fn() as any,
        registeredAt: new Date(),
        available: true,
      };
      const metadata2: CommandMetadata = {
        config: { name: 'cmd2', description: 'Second', aliases: ['c'] },
        handler: jest.fn() as any,
        registeredAt: new Date(),
        available: true,
      };

      registry.register(metadata1);

      // Act & Assert - verify alias conflict behavior
      expect(() => registry.register(metadata2)).toThrow("Alias 'c' is already registered");
    });
  });

  describe('command discovery behavior', () => {
    beforeEach(() => {
      // Setup test commands
      const commands = [
        { name: 'status', description: 'Show status', category: 'core' as const },
        { name: 'init', description: 'Initialize project', category: 'core' as const },
        { name: 'deploy', description: 'Deploy application', category: 'utility' as const },
        {
          name: 'experimental-feature',
          description: 'Test feature',
          category: 'experimental' as const,
        },
      ];

      commands.forEach((config) => {
        registry.register({
          config,
          handler: jest.fn() as any,
          registeredAt: new Date(),
          available: true,
        });
      });
    });

    it('should find commands by category', () => {
      // Act
      const coreCommands = registry.findByCategory('core');
      const utilityCommands = registry.findByCategory('utility');

      // Assert - verify filtering behavior
      expect(coreCommands).toHaveLength(2);
      expect(coreCommands.map((cmd) => cmd.config.name)).toEqual(
        expect.arrayContaining(['status', 'init'])
      );
      expect(utilityCommands).toHaveLength(1);
      expect(utilityCommands[0].config.name).toBe('deploy');
    });

    it('should search commands by name and description', () => {
      // Act
      const statusResults = registry.search('status');
      const initResults = registry.search('Initialize');
      const deployResults = registry.search('app');

      // Assert - verify search behavior
      expect(statusResults).toHaveLength(1);
      expect(statusResults[0].config.name).toBe('status');

      expect(initResults).toHaveLength(1);
      expect(initResults[0].config.name).toBe('init');

      expect(deployResults).toHaveLength(1);
      expect(deployResults[0].config.name).toBe('deploy');
    });

    it('should list all commands in alphabetical order', () => {
      // Act
      const allCommands = registry.list();

      // Assert - verify listing behavior
      expect(allCommands).toHaveLength(4);
      const names = allCommands.map((cmd) => cmd.config.name);
      expect(names).toEqual(['deploy', 'experimental-feature', 'init', 'status']);
    });
  });

  describe('command execution behavior', () => {
    let mockHandler: jest.Mock;
    let mockContext: CommandContext;

    beforeEach(() => {
      mockHandler = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        message: 'Handler executed',
      });

      mockContext = {
        args: ['arg1'],
        flags: { verbose: true },
        input: ['test-cmd', 'arg1', '--verbose'],
        pkg: { name: 'test-cli', version: '1.0.0' },
        cwd: '/test/dir',
        env: {},
        debug: false,
        verbose: true,
      };

      registry.register({
        config: { name: 'test-cmd', description: 'Test command' },
        handler: mockHandler,
        registeredAt: new Date(),
        available: true,
      });
    });

    it('should emit executing event before running command', async () => {
      // Act
      await registry.execute('test-cmd', mockContext);

      // Assert - verify event emission behavior
      expect(mockEventHandler).toHaveBeenCalledWith({
        name: 'test-cmd',
        context: mockContext,
      });
    });

    it('should call command handler with correct context', async () => {
      // Act
      await registry.execute('test-cmd', mockContext);

      // Assert - verify handler collaboration
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
    });

    it('should emit executed event with result after successful execution', async () => {
      // Arrange
      const expectedResult = {
        success: true,
        exitCode: 0,
        message: 'Handler executed',
      };
      mockHandler.mockResolvedValue(expectedResult);

      // Act
      await registry.execute('test-cmd', mockContext);

      // Assert - verify success event behavior
      expect(mockEventHandler).toHaveBeenCalledWith({
        name: 'test-cmd',
        result: expectedResult,
      });
    });

    it('should emit error event and return error result when handler throws', async () => {
      // Arrange
      const error = new Error('Handler failed');
      mockHandler.mockRejectedValue(error);

      // Act
      const result = await registry.execute('test-cmd', mockContext);

      // Assert - verify error handling behavior
      expect(mockEventHandler).toHaveBeenCalledWith({
        name: 'test-cmd',
        error,
      });

      expect(result).toEqual({
        success: false,
        error: 'Handler failed',
        exitCode: 1,
        executionTime: 0,
      });
    });

    it('should return command not found error for unknown commands', async () => {
      // Act
      const result = await registry.execute('unknown-cmd', mockContext);

      // Assert - verify not found behavior
      expect(result).toEqual({
        success: false,
        error: "Command 'unknown-cmd' not found",
        exitCode: 127,
        executionTime: 0,
      });
    });

    it('should execute command through alias', async () => {
      // Arrange
      registry.register({
        config: {
          name: 'long-command',
          description: 'Long command name',
          aliases: ['lc'],
        },
        handler: mockHandler,
        registeredAt: new Date(),
        available: true,
      });

      // Act
      await registry.execute('lc', mockContext);

      // Assert - verify alias resolution behavior
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
      expect(mockEventHandler).toHaveBeenCalledWith({
        name: 'lc',
        context: mockContext,
      });
    });
  });

  describe('BaseCommand integration behavior', () => {
    let mockCommand: MockCommand;

    beforeEach(() => {
      mockCommand = new MockCommand({
        name: 'mock-cmd',
        description: 'Mock command',
        category: 'core',
      });

      // Spy on command methods
      jest.spyOn(mockCommand, 'execute');
      jest.spyOn(mockCommand, 'dispose');
    });

    it('should register BaseCommand instance and use its execute method', async () => {
      // Arrange
      registry.registerCommand(mockCommand);
      const context: CommandContext = {
        args: [],
        flags: {},
        input: ['mock-cmd'],
        pkg: { name: 'test', version: '1.0.0' },
        cwd: '/test',
        env: {},
        debug: false,
        verbose: false,
      };

      // Act
      await registry.execute('mock-cmd', context);

      // Assert - verify BaseCommand integration
      expect(mockCommand.execute).toHaveBeenCalledWith(context);
    });

    it('should dispose BaseCommand when unregistering', () => {
      // Arrange
      registry.registerCommand(mockCommand);

      // Act
      registry.unregister('mock-cmd');

      // Assert - verify disposal behavior
      expect(mockCommand.dispose).toHaveBeenCalled();
    });

    it('should retrieve BaseCommand instance via getCommand', () => {
      // Arrange
      registry.registerCommand(mockCommand);

      // Act
      const retrievedCommand = registry.getCommand('mock-cmd');

      // Assert - verify command retrieval
      expect(retrievedCommand).toBe(mockCommand);
    });
  });

  describe('usage statistics behavior', () => {
    let mockHandler: jest.Mock;

    beforeEach(() => {
      mockHandler = jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
      });

      registry.register({
        config: { name: 'tracked-cmd', description: 'Tracked command' },
        handler: mockHandler,
        registeredAt: new Date(),
        available: true,
      });
    });

    it('should track command usage statistics', async () => {
      // Arrange
      const context: CommandContext = {
        args: [],
        flags: {},
        input: ['tracked-cmd'],
        pkg: { name: 'test', version: '1.0.0' },
        cwd: '/test',
        env: {},
        debug: false,
        verbose: false,
      };

      // Act
      await registry.execute('tracked-cmd', context);
      await registry.execute('tracked-cmd', context);

      // Assert - verify usage tracking behavior
      const stats = registry.getUsageStats();
      const cmdStats = stats.find((s) => s.name === 'tracked-cmd');

      expect(cmdStats).toBeDefined();
      expect(cmdStats?.usageCount).toBe(2);
      expect(cmdStats?.lastUsed).toBeGreaterThan(0);
    });
  });

  describe('cleanup behavior', () => {
    let mockCommand: MockCommand;

    beforeEach(() => {
      mockCommand = new MockCommand({
        name: 'cleanup-test',
        description: 'Cleanup test command',
      });

      jest.spyOn(mockCommand, 'dispose');
      registry.registerCommand(mockCommand);
    });

    it('should dispose all commands and clear registry when cleared', async () => {
      // Act
      await registry.clear();

      // Assert - verify cleanup behavior
      expect(mockCommand.dispose).toHaveBeenCalled();
      expect(registry.list()).toHaveLength(0);
      expect(registry.has('cleanup-test')).toBe(false);
    });

    it('should emit cleared event after cleanup', async () => {
      // Arrange
      registry.on('cleared', mockEventHandler);

      // Act
      await registry.clear();

      // Assert - verify cleanup event emission
      expect(mockEventHandler).toHaveBeenCalled();
    });

    it('should provide status information', () => {
      // Act
      const status = registry.getStatus();

      // Assert - verify status reporting behavior
      expect(status).toEqual({
        initialized: false,
        commandCount: 1,
        pluginCount: 0,
        aliasCount: 0,
        loadingPaths: [],
      });
    });
  });
});
