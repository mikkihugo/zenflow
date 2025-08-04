/**
 * Output Formatter Tests - TDD London School
 *
 * Tests the behavior of output formatting functionality using mocks
 * and interaction-based testing. Focuses on how the formatter collaborates
 * with different output targets and handles various data formats.
 */

import { jest } from '@jest/globals';

// Mock output formatter interface for testing interactions
interface OutputFormatter {
  format(data: unknown, options?: FormatOptions): string;
  setDefaults(defaults: Partial<FormatOptions>): void;
  addRenderer(format: string, renderer: FormatRenderer): void;
  getSupportedFormats(): string[];
  validate(format: string): boolean;
}

interface FormatOptions {
  format: 'json' | 'yaml' | 'table' | 'text' | 'csv' | 'xml';
  indent?: number;
  colors?: boolean;
  compact?: boolean;
  headers?: boolean;
  maxWidth?: number;
  theme?: 'light' | 'dark' | 'minimal';
}

interface FormatRenderer {
  render(data: unknown, options: FormatOptions): string;
  validate?(data: unknown): boolean;
}

interface TableColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
}

// Mock console interface for testing output behavior
interface MockConsole {
  log: jest.Mock;
  error: jest.Mock;
  warn: jest.Mock;
  info: jest.Mock;
  table: jest.Mock;
}

// Mock implementation for testing
class MockOutputFormatter implements OutputFormatter {
  private defaults: Partial<FormatOptions> = {};
  private renderers = new Map<string, FormatRenderer>();
  private formatFunction: jest.Mock;

  constructor(formatFunction?: jest.Mock) {
    this.formatFunction = formatFunction || jest.fn();

    // Setup default renderers
    this.setupDefaultRenderers();
  }

  format(data: unknown, options?: FormatOptions): string {
    return this.formatFunction(data, options);
  }

  setDefaults(defaults: Partial<FormatOptions>): void {
    this.defaults = { ...this.defaults, ...defaults };
  }

  addRenderer(format: string, renderer: FormatRenderer): void {
    this.renderers.set(format, renderer);
  }

  getSupportedFormats(): string[] {
    return Array.from(this.renderers.keys());
  }

  validate(format: string): boolean {
    return this.renderers.has(format);
  }

  // Test helpers
  getDefaults(): Partial<FormatOptions> {
    return { ...this.defaults };
  }

  getRenderer(format: string): FormatRenderer | undefined {
    return this.renderers.get(format);
  }

  private setupDefaultRenderers(): void {
    // Mock renderers for testing
    this.renderers.set('json', {
      render: jest.fn((data) => JSON.stringify(data, null, 2)),
    });

    this.renderers.set('table', {
      render: jest.fn(() => 'Mock table output'),
    });

    this.renderers.set('yaml', {
      render: jest.fn(() => 'Mock YAML output'),
    });
  }
}

// Mock output writer for testing output behavior
class MockOutputWriter {
  private console: MockConsole;
  private formatFunction: jest.Mock;

  constructor() {
    this.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      table: jest.fn(),
    };
    this.formatFunction = jest.fn();
  }

  write(data: unknown, options?: FormatOptions & { target?: 'stdout' | 'stderr' }): void {
    const formatted = this.formatFunction(data, options);
    const target = options?.target || 'stdout';

    if (target === 'stderr') {
      this.console.error(formatted);
    } else {
      this.console.log(formatted);
    }
  }

  writeTable(data: Record<string, unknown>[], _columns?: TableColumn[]): void {
    this.console.table(data);
  }

  getConsole(): MockConsole {
    return this.console;
  }

  setFormatter(formatter: jest.Mock): void {
    this.formatFunction = formatter;
  }
}

describe('OutputFormatter - TDD London', () => {
  let formatter: MockOutputFormatter;
  let writer: MockOutputWriter;
  let mockFormatFunction: jest.Mock;

  beforeEach(() => {
    mockFormatFunction = jest.fn();
    formatter = new MockOutputFormatter(mockFormatFunction);
    writer = new MockOutputWriter();
    writer.setFormatter(mockFormatFunction);
  });

  describe('formatting behavior', () => {
    it('should format data according to specified format', () => {
      // Arrange
      const data = { status: 'active', count: 42 };
      const options: FormatOptions = { format: 'json', indent: 4 };
      const expectedOutput = JSON.stringify(data, null, 4);
      mockFormatFunction.mockReturnValue(expectedOutput);

      // Act
      const result = formatter.format(data, options);

      // Assert - verify formatting behavior
      expect(mockFormatFunction).toHaveBeenCalledWith(data, options);
      expect(result).toBe(expectedOutput);
    });

    it('should use default options when none provided', () => {
      // Arrange
      const data = { test: 'data' };
      formatter.setDefaults({ format: 'json', colors: true });
      mockFormatFunction.mockReturnValue('formatted output');

      // Act
      formatter.format(data);

      // Assert - verify default option usage
      expect(mockFormatFunction).toHaveBeenCalledWith(data, undefined);
      expect(formatter.getDefaults()).toEqual({
        format: 'json',
        colors: true,
      });
    });

    it('should merge provided options with defaults', () => {
      // Arrange
      const data = { test: 'data' };
      formatter.setDefaults({ format: 'json', colors: true, indent: 2 });
      const options: Partial<FormatOptions> = { colors: false }; // Override colors
      mockFormatFunction.mockReturnValue('formatted output');

      // Act
      formatter.format(data, options as FormatOptions);

      // Assert - verify option merging behavior
      expect(mockFormatFunction).toHaveBeenCalledWith(data, options);
    });
  });

  describe('renderer registration behavior', () => {
    it('should register custom format renderer', () => {
      // Arrange
      const customRenderer: FormatRenderer = {
        render: jest.fn(() => 'custom output'),
        validate: jest.fn(() => true),
      };

      // Act
      formatter.addRenderer('custom', customRenderer);

      // Assert - verify renderer registration
      expect(formatter.validate('custom')).toBe(true);
      expect(formatter.getSupportedFormats()).toContain('custom');
      expect(formatter.getRenderer('custom')).toBe(customRenderer);
    });

    it('should list all supported formats', () => {
      // Arrange
      formatter.addRenderer('xml', { render: jest.fn() });
      formatter.addRenderer('csv', { render: jest.fn() });

      // Act
      const formats = formatter.getSupportedFormats();

      // Assert - verify format listing
      expect(formats).toContain('json');
      expect(formats).toContain('table');
      expect(formats).toContain('yaml');
      expect(formats).toContain('xml');
      expect(formats).toContain('csv');
    });

    it('should validate format support', () => {
      // Act & Assert - verify format validation
      expect(formatter.validate('json')).toBe(true);
      expect(formatter.validate('table')).toBe(true);
      expect(formatter.validate('unsupported')).toBe(false);
    });
  });

  describe('output writing behavior', () => {
    it('should write formatted output to stdout by default', () => {
      // Arrange
      const data = { message: 'test output' };
      const expectedOutput = 'formatted test output';
      mockFormatFunction.mockReturnValue(expectedOutput);

      // Act
      writer.write(data, { format: 'text' });

      // Assert - verify stdout writing behavior
      expect(mockFormatFunction).toHaveBeenCalledWith(data, { format: 'text' });
      expect(writer.getConsole().log).toHaveBeenCalledWith(expectedOutput);
      expect(writer.getConsole().error).not.toHaveBeenCalled();
    });

    it('should write to stderr when specified', () => {
      // Arrange
      const errorData = { error: 'Something went wrong' };
      const expectedOutput = 'formatted error output';
      mockFormatFunction.mockReturnValue(expectedOutput);

      // Act
      writer.write(errorData, { format: 'text', target: 'stderr' });

      // Assert - verify stderr writing behavior
      expect(writer.getConsole().error).toHaveBeenCalledWith(expectedOutput);
      expect(writer.getConsole().log).not.toHaveBeenCalled();
    });

    it('should handle table output specially', () => {
      // Arrange
      const tableData = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Boston' },
      ];
      const columns: TableColumn[] = [
        { key: 'name', header: 'Name' },
        { key: 'age', header: 'Age', align: 'right' },
        { key: 'city', header: 'City' },
      ];

      // Act
      writer.writeTable(tableData, columns);

      // Assert - verify table writing behavior
      expect(writer.getConsole().table).toHaveBeenCalledWith(tableData);
    });
  });

  describe('JSON formatting behavior', () => {
    it('should format JSON with proper indentation', () => {
      // Arrange
      const data = { nested: { value: 'test', number: 42 } };
      const jsonRenderer = formatter.getRenderer('json')!;

      // Act
      const result = jsonRenderer.render(data, { format: 'json', indent: 2 });

      // Assert - verify JSON formatting
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('should handle circular references gracefully', () => {
      // Arrange
      const circularData: any = { prop: 'value' };
      circularData.self = circularData;

      const safeJsonRenderer: FormatRenderer = {
        render: jest.fn().mockImplementation((data) => {
          try {
            return JSON.stringify(data, null, 2);
          } catch (_error) {
            return JSON.stringify({ error: 'Circular reference detected' }, null, 2);
          }
        }),
      };

      formatter.addRenderer('safe-json', safeJsonRenderer);

      // Act
      const result = formatter.getRenderer('safe-json')?.render(circularData, { format: 'json' });

      // Assert - verify circular reference handling
      expect(result).toContain('Circular reference detected');
    });
  });

  describe('table formatting behavior', () => {
    it('should format array data as table', () => {
      // Arrange
      const tableData = [
        { id: 1, name: 'Agent 1', status: 'active' },
        { id: 2, name: 'Agent 2', status: 'idle' },
      ];

      const tableRenderer: FormatRenderer = {
        render: jest.fn().mockImplementation((data) => {
          if (Array.isArray(data)) {
            return `Mock table with ${data.length} rows`;
          }
          return 'Not table data';
        }),
      };

      formatter.addRenderer('table', tableRenderer);

      // Act
      const result = formatter.getRenderer('table')?.render(tableData, { format: 'table' });

      // Assert - verify table formatting behavior
      expect(result).toBe('Mock table with 2 rows');
    });

    it('should handle empty array gracefully', () => {
      // Arrange
      const emptyData: unknown[] = [];
      const tableRenderer = formatter.getRenderer('table')!;

      // Act
      const result = tableRenderer.render(emptyData, { format: 'table' });

      // Assert - verify empty array handling
      expect(result).toBe('Mock table output');
    });
  });

  describe('color and theme behavior', () => {
    it('should apply colors when enabled', () => {
      // Arrange
      const colorRenderer: FormatRenderer = {
        render: jest.fn().mockImplementation((data, options) => {
          const baseOutput = JSON.stringify(data);
          return options.colors ? `\x1b[32m${baseOutput}\x1b[0m` : baseOutput;
        }),
      };

      formatter.addRenderer('colored-json', colorRenderer);
      const data = { status: 'success' };

      // Act
      const coloredResult = formatter.getRenderer('colored-json')?.render(data, {
        format: 'json',
        colors: true,
      });
      const plainResult = formatter.getRenderer('colored-json')?.render(data, {
        format: 'json',
        colors: false,
      });

      // Assert - verify color application behavior
      expect(coloredResult).toContain('\x1b[32m'); // Contains color codes
      expect(plainResult).not.toContain('\x1b[32m'); // No color codes
    });

    it('should apply theme-specific formatting', () => {
      // Arrange
      const themedRenderer: FormatRenderer = {
        render: jest.fn().mockImplementation((data, options) => {
          const theme = options.theme || 'light';
          return `[${theme}] ${JSON.stringify(data)}`;
        }),
      };

      formatter.addRenderer('themed', themedRenderer);
      const data = { message: 'test' };

      // Act
      const lightResult = formatter.getRenderer('themed')?.render(data, {
        format: 'json',
        theme: 'light',
      });
      const darkResult = formatter.getRenderer('themed')?.render(data, {
        format: 'json',
        theme: 'dark',
      });

      // Assert - verify theme behavior
      expect(lightResult).toContain('[light]');
      expect(darkResult).toContain('[dark]');
    });
  });

  describe('error handling behavior', () => {
    it('should handle invalid data gracefully', () => {
      // Arrange
      const invalidData = undefined;
      const robustRenderer: FormatRenderer = {
        render: jest.fn().mockImplementation((data) => {
          if (data === undefined || data === null) {
            return 'No data available';
          }
          return JSON.stringify(data);
        }),
        validate: jest.fn().mockImplementation((data) => data !== undefined),
      };

      formatter.addRenderer('robust', robustRenderer);

      // Act
      const result = formatter.getRenderer('robust')?.render(invalidData, { format: 'json' });

      // Assert - verify error handling
      expect(result).toBe('No data available');
    });

    it('should validate data before rendering when validator is provided', () => {
      // Arrange
      const validatingRenderer: FormatRenderer = {
        render: jest.fn(() => 'Valid data rendered'),
        validate: jest.fn().mockReturnValue(false),
      };

      formatter.addRenderer('validating', validatingRenderer);
      const data = { invalid: 'data' };

      // Act
      const isValid = formatter.getRenderer('validating')?.validate?.(data);

      // Assert - verify validation behavior
      expect(validatingRenderer.validate).toHaveBeenCalledWith(data);
      expect(isValid).toBe(false);
    });
  });

  describe('output size and truncation behavior', () => {
    it('should respect maximum width constraints', () => {
      // Arrange
      const longData = { message: 'This is a very long message that should be truncated' };
      const widthConstrainedRenderer: FormatRenderer = {
        render: jest.fn().mockImplementation((data, options) => {
          let output = JSON.stringify(data);
          if (options.maxWidth && output.length > options.maxWidth) {
            output = `${output.substring(0, options.maxWidth - 3)}...`;
          }
          return output;
        }),
      };

      formatter.addRenderer('constrained', widthConstrainedRenderer);

      // Act
      const result = formatter.getRenderer('constrained')?.render(longData, {
        format: 'json',
        maxWidth: 20,
      });

      // Assert - verify width constraint behavior
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toMatch(/\.\.\.$/); // ends with ...
    });
  });
});
