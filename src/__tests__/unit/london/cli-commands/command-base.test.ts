/**
 * BaseCommand Tests - TDD London School
 *
 * Tests the behavior and interactions of the BaseCommand abstract class
 * using mocks for dependencies and focusing on command lifecycle,
 * validation behavior, and hook interactions.
 */

import { jest } from '@jest/globals';
import { BaseCommand, type CommandHooks } from '../../../../cli/core/base-command';
import type {
  CommandConfig,
  CommandContext,
  CommandResult,
  CommandValidationResult,
} from '../../../../cli/types/index';

// Concrete implementation for testing
class TestCommand extends BaseCommand {
  private mockRun: jest.Mock;

  constructor(config: CommandConfig, mockRun?: jest.Mock) {
    super(config);
    this.mockRun =
      mockRun ||
      jest.fn().mockResolvedValue({
        success: true,
        exitCode: 0,
        message: 'Test command executed',
      });
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    return this.mockRun(context);
  }

  getHelp(): string {
    return `Help for ${this.config.name}`;
  }

  // Expose protected methods for testing
  public async testValidateContext(context: CommandContext): Promise<CommandValidationResult> {
    return this.validateContext(context);
  }

  public async testValidate(context: CommandContext): Promise<CommandValidationResult | null> {
    return this.validate(context);
  }

  // Allow injection of custom validation logic
  private customValidation?: (context: CommandContext) => Promise<CommandValidationResult | null>;

  setCustomValidation(fn: (context: CommandContext) => Promise<CommandValidationResult | null>) {
    this.customValidation = fn;
  }

  protected async validate(context: CommandContext): Promise<CommandValidationResult | null> {
    return this.customValidation ? this.customValidation(context) : null;
  }
}

describe('BaseCommand - TDD London', () => {
  let command: TestCommand;
  let mockContext: CommandContext;
  let mockEventHandler: jest.Mock;

  beforeEach(() => {
    const config: CommandConfig = {
      name: 'test-command',
      description: 'Test command for validation',
      minArgs: 1,
      maxArgs: 3,
      flags: {
        required: {
          type: 'string',
          description: 'Required flag',
          required: true,
        },
        optional: {
          type: 'boolean',
          description: 'Optional flag',
          default: false,
        },
        number: {
          type: 'number',
          description: 'Number flag',
        },
      },
    };

    command = new TestCommand(config);
    mockEventHandler = jest.fn();

    // Listen to command events
    command.on('start', mockEventHandler);
    command.on('validation-error', mockEventHandler);
    command.on('validation-warning', mockEventHandler);
    command.on('before-execution', mockEventHandler);
    command.on('after-execution', mockEventHandler);
    command.on('error', mockEventHandler);
    command.on('complete', mockEventHandler);

    mockContext = {
      args: ['arg1'],
      flags: { required: 'test-value' },
      input: ['test-command', 'arg1', '--required', 'test-value'],
      pkg: { name: 'test-cli', version: '1.0.0' },
      cwd: '/test/dir',
      env: {},
      debug: false,
      verbose: false,
    };
  });

  afterEach(() => {
    command.removeAllListeners();
  });

  describe('command lifecycle behavior', () => {
    it('should emit start event when execution begins', async () => {
      // Act
      await command.execute(mockContext);

      // Assert - verify start event emission
      expect(mockEventHandler).toHaveBeenCalledWith(mockContext);
      expect(mockEventHandler).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should emit complete event with execution time', async () => {
      // Act
      await command.execute(mockContext);

      // Assert - verify complete event with timing
      expect(mockEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          executionTime: expect.any(Number),
        }),
      );
    });

    it('should prevent concurrent execution', async () => {
      // Arrange
      const slowCommand = new TestCommand(
        { name: 'slow', description: 'Slow command' },
        jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100))),
      );

      // Act
      const promise1 = slowCommand.execute(mockContext);
      const result2 = await slowCommand.execute(mockContext);

      // Assert - verify concurrent execution prevention
      expect(result2).toEqual({
        success: false,
        error: 'Command is already executing',
        exitCode: 1,
        executionTime: 0,
      });

      await promise1; // Cleanup
    });

    it('should track executing state correctly', async () => {
      // Arrange
      let executingDuringRun = false;
      const trackingCommand = new TestCommand(
        { name: 'tracking', description: 'Tracking command' },
        jest.fn().mockImplementation(() => {
          executingDuringRun = trackingCommand.executing;
          return Promise.resolve({ success: true, exitCode: 0 });
        }),
      );

      // Act
      expect(trackingCommand.executing).toBe(false);
      await trackingCommand.execute(mockContext);

      // Assert - verify state tracking
      expect(executingDuringRun).toBe(true);
      expect(trackingCommand.executing).toBe(false);
    });
  });

  describe('validation behavior', () => {
    it('should validate required flags and emit validation error', async () => {
      // Arrange
      const invalidContext = {
        ...mockContext,
        flags: {}, // Missing required flag
      };

      // Act
      const result = await command.execute(invalidContext);

      // Assert - verify validation error behavior
      expect(mockEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          errors: expect.arrayContaining([
            expect.stringContaining('Required flag --required is missing'),
          ]),
        }),
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Validation failed'),
        exitCode: 1,
        executionTime: expect.any(Number),
      });
    });

    it('should validate flag types', async () => {
      // Arrange
      const invalidContext = {
        ...mockContext,
        flags: {
          required: 'test-value',
          number: 'not-a-number', // Invalid type
        },
      };

      // Act
      const result = await command.execute(invalidContext);

      // Assert - verify type validation
      expect(result.success).toBe(false);
      expect(result.error).toContain('expected number but got string');
    });

    it('should validate argument count', async () => {
      // Arrange - Too few arguments
      const tooFewArgs = {
        ...mockContext,
        args: [], // Less than minArgs (1)
      };

      // Act
      const result1 = await command.execute(tooFewArgs);

      // Assert
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Expected at least 1 arguments, got 0');

      // Arrange - Too many arguments
      const tooManyArgs = {
        ...mockContext,
        args: ['arg1', 'arg2', 'arg3', 'arg4'], // More than maxArgs (3)
      };

      // Act
      const result2 = await command.execute(tooManyArgs);

      // Assert
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Expected at most 3 arguments, got 4');
    });

    it('should call custom validation and include its results', async () => {
      // Arrange
      const customValidation = jest.fn().mockResolvedValue({
        valid: false,
        errors: ['Custom validation failed'],
        warnings: ['Custom warning'],
      });
      command.setCustomValidation(customValidation);

      // Act
      const result = await command.execute(mockContext);

      // Assert - verify custom validation integration
      expect(customValidation).toHaveBeenCalledWith(mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Custom validation failed');

      expect(mockEventHandler).toHaveBeenCalledWith(['Custom warning']);
    });

    it('should handle validation exceptions gracefully', async () => {
      // Arrange
      const throwingValidation = jest.fn().mockRejectedValue(new Error('Validation exploded'));
      command.setCustomValidation(throwingValidation);

      // Act
      const result = await command.execute(mockContext);

      // Assert - verify validation error handling
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed: Validation exploded');
    });
  });

  describe('hook behavior', () => {
    let mockHooks: jest.Mocked<CommandHooks>;

    beforeEach(() => {
      mockHooks = {
        beforeValidation: jest.fn(),
        afterValidation: jest.fn(),
        beforeExecution: jest.fn(),
        afterExecution: jest.fn(),
        onError: jest.fn(),
      };

      command.registerHooks(mockHooks);
    });

    it('should call hooks in correct order during successful execution', async () => {
      // Act
      await command.execute(mockContext);

      // Assert - verify hook execution order and parameters
      expect(mockHooks.beforeValidation).toHaveBeenCalledWith(mockContext);
      expect(mockHooks.afterValidation).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({ valid: true }),
      );
      expect(mockHooks.beforeExecution).toHaveBeenCalledWith(mockContext);
      expect(mockHooks.afterExecution).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({ success: true }),
      );
      expect(mockHooks.onError).not.toHaveBeenCalled();
    });

    it('should call error hook when command execution fails', async () => {
      // Arrange
      const error = new Error('Command failed');
      const failingCommand = new TestCommand(
        { name: 'failing', description: 'Failing command' },
        jest.fn().mockRejectedValue(error),
      );
      failingCommand.registerHooks(mockHooks);

      // Act
      await failingCommand.execute(mockContext);

      // Assert - verify error hook behavior
      expect(mockHooks.onError).toHaveBeenCalledWith(mockContext, error);
      expect(mockHooks.afterExecution).not.toHaveBeenCalled();
    });

    it('should handle hook exceptions without breaking execution', async () => {
      // Arrange
      mockHooks.beforeExecution?.mockRejectedValue(new Error('Hook failed'));

      // Act
      const result = await command.execute(mockContext);

      // Assert - verify hook exception handling
      expect(result.success).toBe(false);
      expect(result.error).toContain('Hook failed');
      expect(mockHooks.onError).toHaveBeenCalled();
    });

    it('should allow hooks to be registered partially', async () => {
      // Arrange
      const partialHooks = {
        beforeExecution: jest.fn(),
      };

      const partialCommand = new TestCommand({
        name: 'partial',
        description: 'Partial hooks',
      });
      partialCommand.registerHooks(partialHooks);

      // Act
      await partialCommand.execute(mockContext);

      // Assert - verify partial hook registration
      expect(partialHooks.beforeExecution).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('error handling behavior', () => {
    it('should emit error event and return error result when run throws', async () => {
      // Arrange
      const error = new Error('Run method failed');
      const errorCommand = new TestCommand(
        { name: 'error', description: 'Error command' },
        jest.fn().mockRejectedValue(error),
      );

      const errorEventHandler = jest.fn();
      errorCommand.on('error', errorEventHandler);

      // Act
      const result = await errorCommand.execute(mockContext);

      // Assert - verify error handling behavior
      expect(errorEventHandler).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: 'Run method failed',
        exitCode: 1,
        executionTime: expect.any(Number),
      });
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const stringError = 'String error';
      const errorCommand = new TestCommand(
        { name: 'string-error', description: 'String error command' },
        jest.fn().mockRejectedValue(stringError),
      );

      // Act
      const result = await errorCommand.execute(mockContext);

      // Assert - verify non-Error handling
      expect(result).toEqual({
        success: false,
        error: 'String error',
        exitCode: 1,
        executionTime: expect.any(Number),
      });
    });
  });

  describe('metadata and configuration behavior', () => {
    it('should provide correct metadata', () => {
      // Act
      const metadata = command.metadata;

      // Assert - verify metadata structure
      expect(metadata).toEqual({
        config: expect.objectContaining({
          name: 'test-command',
          description: 'Test command for validation',
        }),
        handler: expect.any(Function),
        registeredAt: expect.any(Date),
        available: true,
      });
    });

    it('should return immutable configuration copy', () => {
      // Act
      const config1 = command.getConfig();
      const config2 = command.getConfig();

      // Assert - verify immutability
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);

      // Modify copy and verify original is unaffected
      config1.name = 'modified';
      expect(command.getConfig().name).toBe('test-command');
    });

    it('should return help text', () => {
      // Act
      const help = command.getHelp();

      // Assert - verify help text
      expect(help).toBe('Help for test-command');
    });

    it('should return examples from configuration', () => {
      // Arrange
      const commandWithExamples = new TestCommand({
        name: 'examples',
        description: 'Command with examples',
        examples: ['example 1', 'example 2'],
      });

      // Act
      const examples = commandWithExamples.getExamples();

      // Assert - verify examples
      expect(examples).toEqual(['example 1', 'example 2']);
    });
  });

  describe('cleanup behavior', () => {
    it('should remove all event listeners when disposed', () => {
      // Arrange
      const listeners = command.listenerCount('start');
      expect(listeners).toBeGreaterThan(0);

      // Act
      command.dispose();

      // Assert - verify cleanup
      expect(command.listenerCount('start')).toBe(0);
      expect(command.listenerCount('complete')).toBe(0);
      expect(command.listenerCount('error')).toBe(0);
    });
  });
});
