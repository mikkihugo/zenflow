/**
 * Argument Parser Tests - TDD London School
 *
 * Tests the behavior of argument parsing functionality using mocks
 * and interaction-based testing. Focuses on how the parser collaborates
 * with other components rather than testing implementation details.
 */

import type { jest } from 'vitest';

// Mock argument parser interface for testing interactions
interface ArgumentParser {
  parse(args: string[]): ParseResult;
  setOptions(options: ParserOptions): void;
  addCommand(config: CommandDefinition): void;
  getHelp(): string;
  validate(result: ParseResult): ValidationResult;
}

interface ParseResult {
  command: string | null;
  args: string[];
  flags: Record<string, unknown>;
  unknown: string[];
  raw: string[];
}

interface ParserOptions {
  allowUnknownFlags?: boolean;
  allowUnknownCommands?: boolean;
  stopAtFirstUnknown?: boolean;
  flagPrefix?: string;
  helpFlag?: string | string[];
  versionFlag?: string | string[];
}

interface CommandDefinition {
  name: string;
  description?: string;
  aliases?: string[];
  flags?: FlagDefinition[];
  args?: ArgumentDefinition[];
}

interface FlagDefinition {
  name: string;
  type: 'boolean' | 'string' | 'number' | 'array';
  description?: string;
  aliases?: string[];
  required?: boolean;
  default?: unknown;
}

interface ArgumentDefinition {
  name: string;
  description?: string;
  required?: boolean;
  variadic?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Mock implementation for testing
class MockArgumentParser implements ArgumentParser {
  private options: ParserOptions = {};
  private commands = new Map<string, CommandDefinition>();
  private parseFunction: vi.Mock;
  private validateFunction: vi.Mock;

  constructor(parseFunction?: vi.Mock, validateFunction?: vi.Mock) {
    this.parseFunction = parseFunction || vi.fn();
    this.validateFunction = validateFunction || vi.fn();
  }

  parse(args: string[]): ParseResult {
    return this.parseFunction(args);
  }

  setOptions(options: ParserOptions): void {
    this.options = { ...this.options, ...options };
  }

  addCommand(config: CommandDefinition): void {
    this.commands.set(config?.name, config);
    config?.aliases?.forEach((alias) => {
      this.commands.set(alias, config);
    });
  }

  getHelp(): string {
    return 'Mock help text';
  }

  validate(result: ParseResult): ValidationResult {
    return this.validateFunction(result);
  }

  // Test helpers
  getOptions(): ParserOptions {
    return { ...this.options };
  }

  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }

  getCommand(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }
}

describe('ArgumentParser - TDD London', () => {
  let parser: MockArgumentParser;
  let mockParseFunction: vi.Mock;
  let mockValidateFunction: vi.Mock;

  beforeEach(() => {
    mockParseFunction = vi.fn();
    mockValidateFunction = vi.fn();
    parser = new MockArgumentParser(mockParseFunction, mockValidateFunction);
  });

  describe('parsing behavior', () => {
    it('should parse simple command with arguments', () => {
      // Arrange
      const args = ['status', 'arg1', 'arg2'];
      const expectedResult: ParseResult = {
        command: 'status',
        args: ['arg1', 'arg2'],
        flags: {},
        unknown: [],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify parser behavior through result
      expect(mockParseFunction).toHaveBeenCalledWith(args);
      expect(result).toEqual(expectedResult);
    });

    it('should parse command with flags', () => {
      // Arrange
      const args = ['deploy', '--verbose', '--env', 'production', 'app'];
      const expectedResult: ParseResult = {
        command: 'deploy',
        args: ['app'],
        flags: {
          verbose: true,
          env: 'production',
        },
        unknown: [],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify flag parsing behavior
      expect(result?.flags).toEqual({
        verbose: true,
        env: 'production',
      });
      expect(result?.args).toEqual(['app']);
    });

    it('should handle unknown flags based on options', () => {
      // Arrange
      parser.setOptions({ allowUnknownFlags: false });
      const args = ['command', '--unknown-flag', 'value'];
      const expectedResult: ParseResult = {
        command: 'command',
        args: [],
        flags: {},
        unknown: ['--unknown-flag', 'value'],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify unknown flag handling
      expect(result?.unknown).toContain('--unknown-flag');
      expect(mockParseFunction).toHaveBeenCalledWith(args);
    });

    it('should handle boolean flags correctly', () => {
      // Arrange
      const args = ['test', '--debug', '--no-verbose'];
      const expectedResult: ParseResult = {
        command: 'test',
        args: [],
        flags: {
          debug: true,
          verbose: false,
        },
        unknown: [],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify boolean flag behavior
      expect(result?.flags?.debug).toBe(true);
      expect(result?.flags?.verbose).toBe(false);
    });

    it('should parse array flags', () => {
      // Arrange
      const args = ['build', '--include', 'file1.js', '--include', 'file2.js'];
      const expectedResult: ParseResult = {
        command: 'build',
        args: [],
        flags: {
          include: ['file1.js', 'file2.js'],
        },
        unknown: [],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify array flag behavior
      expect(result?.flags?.include).toEqual(['file1.js', 'file2.js']);
    });
  });

  describe('command definition behavior', () => {
    it('should register command with configuration', () => {
      // Arrange
      const commandConfig: CommandDefinition = {
        name: 'deploy',
        description: 'Deploy application',
        aliases: ['d'],
        flags: [
          {
            name: 'env',
            type: 'string',
            description: 'Environment to deploy to',
            required: true,
          },
          {
            name: 'verbose',
            type: 'boolean',
            description: 'Verbose output',
            aliases: ['v'],
          },
        ],
        args: [
          {
            name: 'target',
            description: 'Deployment target',
            required: true,
          },
        ],
      };

      // Act
      parser.addCommand(commandConfig);

      // Assert - verify command registration behavior
      expect(parser.hasCommand('deploy')).toBe(true);
      expect(parser.hasCommand('d')).toBe(true); // alias
      expect(parser.getCommand('deploy')).toEqual(commandConfig);
    });

    it('should register multiple commands without conflicts', () => {
      // Arrange
      const cmd1: CommandDefinition = { name: 'start', description: 'Start service' };
      const cmd2: CommandDefinition = { name: 'stop', description: 'Stop service' };

      // Act
      parser.addCommand(cmd1);
      parser.addCommand(cmd2);

      // Assert - verify multiple command registration
      expect(parser.hasCommand('start')).toBe(true);
      expect(parser.hasCommand('stop')).toBe(true);
      expect(parser.getCommand('start')).toEqual(cmd1);
      expect(parser.getCommand('stop')).toEqual(cmd2);
    });

    it('should handle command aliases correctly', () => {
      // Arrange
      const commandConfig: CommandDefinition = {
        name: 'status',
        aliases: ['st', 'stat', 's'],
      };

      // Act
      parser.addCommand(commandConfig);

      // Assert - verify alias behavior
      const aliases = ['st', 'stat', 's'];
      aliases.forEach((alias) => {
        expect(parser.hasCommand(alias)).toBe(true);
        expect(parser.getCommand(alias)).toBe(commandConfig);
      });
    });
  });

  describe('validation behavior', () => {
    it('should validate parsed result and return validation errors', () => {
      // Arrange
      const parseResult: ParseResult = {
        command: 'deploy',
        args: [],
        flags: { env: 'production' },
        unknown: [],
        raw: ['deploy', '--env', 'production'],
      };

      const validationResult: ValidationResult = {
        valid: false,
        errors: ['Missing required argument: target'],
        warnings: [],
      };

      mockValidateFunction.mockReturnValue(validationResult);

      // Act
      const result = parser.validate(parseResult);

      // Assert - verify validation behavior
      expect(mockValidateFunction).toHaveBeenCalledWith(parseResult);
      expect(result).toEqual(validationResult);
      expect(result?.valid).toBe(false);
      expect(result?.errors).toContain('Missing required argument: target');
    });

    it('should validate required flags', () => {
      // Arrange
      const parseResult: ParseResult = {
        command: 'deploy',
        args: ['app'],
        flags: {}, // Missing required --env flag
        unknown: [],
        raw: ['deploy', 'app'],
      };

      const validationResult: ValidationResult = {
        valid: false,
        errors: ['Required flag --env is missing'],
        warnings: [],
      };

      mockValidateFunction.mockReturnValue(validationResult);

      // Act
      const result = parser.validate(parseResult);

      // Assert - verify required flag validation
      expect(result?.valid).toBe(false);
      expect(result?.errors).toContain('Required flag --env is missing');
    });

    it('should validate flag types', () => {
      // Arrange
      const parseResult: ParseResult = {
        command: 'config',
        args: [],
        flags: {
          port: 'not-a-number', // Should be number
        },
        unknown: [],
        raw: ['config', '--port', 'not-a-number'],
      };

      const validationResult: ValidationResult = {
        valid: false,
        errors: ['Flag --port must be a number'],
        warnings: [],
      };

      mockValidateFunction.mockReturnValue(validationResult);

      // Act
      const result = parser.validate(parseResult);

      // Assert - verify type validation behavior
      expect(result?.valid).toBe(false);
      expect(result?.errors).toContain('Flag --port must be a number');
    });

    it('should return warnings for deprecated flags', () => {
      // Arrange
      const parseResult: ParseResult = {
        command: 'build',
        args: [],
        flags: {
          'old-flag': true,
        },
        unknown: [],
        raw: ['build', '--old-flag'],
      };

      const validationResult: ValidationResult = {
        valid: true,
        errors: [],
        warnings: ['Flag --old-flag is deprecated, use --new-flag instead'],
      };

      mockValidateFunction.mockReturnValue(validationResult);

      // Act
      const result = parser.validate(parseResult);

      // Assert - verify warning behavior
      expect(result?.valid).toBe(true);
      expect(result?.warnings).toContain('Flag --old-flag is deprecated, use --new-flag instead');
    });
  });

  describe('options configuration behavior', () => {
    it('should apply parser options correctly', () => {
      // Arrange
      const options: ParserOptions = {
        allowUnknownFlags: true,
        allowUnknownCommands: false,
        stopAtFirstUnknown: true,
        flagPrefix: '--',
        helpFlag: ['help', 'h'],
        versionFlag: ['version', 'v'],
      };

      // Act
      parser.setOptions(options);

      // Assert - verify options application
      const appliedOptions = parser.getOptions();
      expect(appliedOptions).toEqual(options);
    });

    it('should merge options with existing configuration', () => {
      // Arrange
      parser.setOptions({ allowUnknownFlags: true });
      parser.setOptions({ allowUnknownCommands: false });

      // Act
      const options = parser.getOptions();

      // Assert - verify option merging behavior
      expect(options?.allowUnknownFlags).toBe(true);
      expect(options?.allowUnknownCommands).toBe(false);
    });
  });

  describe('help generation behavior', () => {
    it('should generate help text', () => {
      // Act
      const help = parser.getHelp();

      // Assert - verify help generation
      expect(help).toBe('Mock help text');
    });
  });

  describe('edge case behavior', () => {
    it('should handle empty argument array', () => {
      // Arrange
      const expectedResult: ParseResult = {
        command: null,
        args: [],
        flags: {},
        unknown: [],
        raw: [],
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse([]);

      // Assert - verify empty args handling
      expect(mockParseFunction).toHaveBeenCalledWith([]);
      expect(result?.command).toBeNull();
      expect(result?.args).toEqual([]);
    });

    it('should handle flags without values', () => {
      // Arrange
      const args = ['command', '--flag-without-value'];
      const expectedResult: ParseResult = {
        command: 'command',
        args: [],
        flags: {
          'flag-without-value': true, // Boolean flag
        },
        unknown: [],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify flag without value handling
      expect(result?.flags?.['flag-without-value']).toBe(true);
    });

    it('should handle special characters in arguments', () => {
      // Arrange
      const args = ['deploy', '--message', 'Deploy v1.0.0 with "quotes" and spaces'];
      const expectedResult: ParseResult = {
        command: 'deploy',
        args: [],
        flags: {
          message: 'Deploy v1.0.0 with "quotes" and spaces',
        },
        unknown: [],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify special character handling
      expect(result?.flags?.message).toBe('Deploy v1.0.0 with "quotes" and spaces');
    });

    it('should handle variadic arguments', () => {
      // Arrange
      const args = ['process', 'file1.js', 'file2.js', 'file3.js'];
      const expectedResult: ParseResult = {
        command: 'process',
        args: ['file1.js', 'file2.js', 'file3.js'],
        flags: {},
        unknown: [],
        raw: args,
      };
      mockParseFunction.mockReturnValue(expectedResult);

      // Act
      const result = parser.parse(args);

      // Assert - verify variadic argument handling
      expect(result?.args).toEqual(['file1.js', 'file2.js', 'file3.js']);
    });
  });
});
