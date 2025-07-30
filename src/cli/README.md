# Claude Code Flow CLI - TypeScript Edition

A comprehensive, type-safe command-line interface system built with TypeScript for the Claude Code Flow platform.

## 🚀 Architecture Overview

The CLI system has been completely rewritten in TypeScript with a focus on:

- **Type Safety**: Comprehensive TypeScript interfaces and type checking
- **Modularity**: Clean separation of concerns with well-defined interfaces
- **Extensibility**: Plugin-friendly architecture with type-safe command registration
- **Performance**: Efficient argument parsing and command execution
- **User Experience**: Rich formatting, interactive features, and comprehensive help

## 📁 Directory Structure

```
src/cli/
├── types/
│   └── cli.ts                    # Complete CLI type definitions
├── core/
│   ├── cli-error.ts             # Enhanced error handling system
│   ├── argument-parser.ts       # Type-safe argument parsing
│   └── command-loader.js        # Legacy command loader (to be converted)
├── command-handlers/
│   ├── typescript/
│   │   └── start.ts             # Example TypeScript command handler
│   └── simple-commands/         # Legacy JavaScript handlers (to be converted)
├── utils/
│   ├── index.ts                 # Utility exports
│   ├── output-formatter.ts      # Rich output formatting
│   ├── help-system.ts           # Comprehensive help generation
│   ├── interactive-detector.ts  # Terminal capability detection
│   └── configuration-manager.ts # Configuration management
├── claude-zen-main.ts           # Main CLI entry point (TypeScript)
├── command-registry.ts          # Type-safe command registry
└── README.md                    # This file
```

## 🔧 Core Components

### 1. Type System (`types/cli.ts`)

Comprehensive TypeScript interfaces for all CLI components:

```typescript
interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  category: CommandCategory;
  flags?: CommandFlag[];
  args?: CommandArgument[];
  examples?: CommandExample[];
  handler: CommandHandler;
}

interface CommandContext {
  command: string;
  args: string[];
  flags: Record<string, any>;
  config: CLIConfig;
  logger: Logger;
  // ... additional context
}
```

### 2. Error Handling (`core/cli-error.ts`)

Enhanced error system with detailed context and recovery suggestions:

```typescript
export class ValidationError extends CLIError {
  constructor(message: string, field?: string, value?: any, expected?: string)
}

export class CommandExecutionError extends CLIError {
  constructor(message: string, command?: string, originalError?: Error, executionContext?: ExecutionContext)
}
```

### 3. Argument Parser (`core/argument-parser.ts`)

Type-safe argument parsing with comprehensive validation:

```typescript
export class FlagValidator {
  requireString(name: string, errorMessage?: string): string
  requireNumber(name: string, min?: number, max?: number): number
  requireOneOf<T>(name: string, validValues: T[]): T
  requireArray(name: string, minLength?: number, maxLength?: number): string[]
}
```

### 4. Command Registry (`command-registry.ts`)

Type-safe command registration and execution:

```typescript
class TypeSafeCommandRegistry implements CommandRegistry {
  register(name: string, definition: CommandDefinition): void
  execute(name: string, context: CommandContext): Promise<CommandResult>
  validate(name: string, context: CommandContext): ValidationResult[]
}
```

### 5. Output Formatting (`utils/output-formatter.ts`)

Rich output formatting with colors, tables, and adaptive display:

```typescript
export function formatTable(data: any[], options: TableOptions): string
export class ProgressBar { /* ... */ }
export class Spinner { /* ... */ }
export function createBox(content: string, title?: string): string
```

### 6. Help System (`utils/help-system.ts`)

Comprehensive help generation with rich formatting:

```typescript
class TypeScriptHelpSystem implements HelpSystem {
  generateCommandHelp(definition: CommandDefinition): string
  generateGlobalHelp(registry: CommandRegistry): string
  generateCategoryHelp(category: CommandCategory): string
}
```

### 7. Interactive Detection (`utils/interactive-detector.ts`)

Terminal capability detection and adaptive features:

```typescript
export function isInteractive(): boolean
export function supportsColor(): boolean
export function getTerminalWidth(): number
export function detectTerminalFeatures(): TerminalFeatures
```

### 8. Configuration Management (`utils/configuration-manager.ts`)

Type-safe configuration with validation and hot reloading:

```typescript
class TypeScriptConfigurationManager implements ConfigurationManager {
  async load(path?: string): Promise<CLIConfig>
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T): void
  validate(schema: ConfigurationSchema): ValidationResult[]
  watch(key: string, callback: (value: any) => void): () => void
}
```

## 🎯 Command Handler Example

Here's how to create a type-safe command handler:

```typescript
export const myCommand: CommandDefinition = {
  name: 'my-command',
  description: 'Example command with full type safety',
  usage: 'claude-zen my-command [options]',
  category: 'utility',
  
  flags: [
    {
      name: 'verbose',
      alias: 'v',
      type: 'boolean',
      description: 'Enable verbose output',
      default: false
    },
    {
      name: 'count',
      type: 'number',
      description: 'Number of items to process',
      required: true,
      validate: (value: number) => value > 0 && value <= 100
    }
  ],
  
  args: [
    {
      name: 'input',
      type: 'string',
      description: 'Input file path',
      required: true,
      validate: (value: string) => value.endsWith('.txt')
    }
  ],
  
  examples: [
    {
      command: 'claude-zen my-command input.txt --count 5',
      description: 'Process input.txt with 5 items'
    }
  ],
  
  handler: async (context: CommandContext): Promise<CommandResult> => {
    const { args, flags, logger } = context;
    const validator = new FlagValidator(flags);
    
    // Type-safe flag access
    const verbose = validator.getBooleanFlag('verbose', false);
    const count = validator.requireNumber('count', 1, 100);
    const input = args[0];
    
    logger.info('Executing my-command', { input, count, verbose });
    
    try {
      // Command implementation here
      const result = await processCommand(input, count, verbose);
      
      return {
        success: true,
        data: result,
        duration: 0,
        timestamp: new Date()
      };
    } catch (error) {
      throw new CommandExecutionError(
        `Command failed: ${error.message}`,
        'my-command',
        error
      );
    }
  }
};
```

## 🔌 Usage Examples

### Basic Command Execution

```bash
# Show help
claude-zen --help
claude-zen my-command --help

# Execute commands with type-safe validation
claude-zen start --port 3000 --verbose
claude-zen swarm init --topology hierarchical --agents 8
```

### Programmatic Usage

```typescript
import { getCommandRegistry, createMeowCLI } from './command-registry';
import { myCommand } from './my-command';

// Register command
const registry = await getCommandRegistry();
registry.register('my-command', myCommand);

// Execute command programmatically
const context: CommandContext = {
  command: 'my-command',
  args: ['input.txt'],
  flags: { count: 5, verbose: true },
  // ... other context
};

const result = await registry.execute('my-command', context);
```

## 🧪 Testing

The TypeScript CLI system includes comprehensive type checking and validation:

```typescript
// Type-safe command testing
import { validateCommandInput } from './command-registry';

const validation = await validateCommandInput('my-command', ['input.txt'], {
  count: 5,
  verbose: true
});

expect(validation.valid).toBe(true);
```

## 🚀 Migration Status

### ✅ Completed Components

- **Core Type System**: Complete CLI type definitions
- **Main Entry Point**: TypeScript CLI entry point with architecture integration
- **Command Registry**: Type-safe command registration and execution
- **Error Handling**: Enhanced error system with context and recovery
- **Argument Parser**: Comprehensive type-safe argument parsing
- **Output Formatting**: Rich formatting with colors, tables, and adaptive display
- **Help System**: Comprehensive help generation with rich formatting
- **Interactive Detection**: Terminal capability detection
- **Configuration Management**: Type-safe configuration with validation

### 🔄 In Progress

- **Command Handlers**: Converting remaining JavaScript handlers to TypeScript
- **Interactive Prompts**: TUI system with type safety
- **Process Management**: Type-safe process utilities

### 📋 Remaining Tasks

- **Complete Handler Migration**: Convert all simple-commands to TypeScript
- **Integration Testing**: Comprehensive test suite
- **Documentation**: Complete API documentation
- **Performance Optimization**: Further optimization of command execution

## 🎨 Features

### Rich Output Formatting
- **Colors**: Adaptive color support with terminal detection
- **Tables**: Rich table formatting with alignment and styling
- **Progress Bars**: Visual progress indication
- **Spinners**: Loading animations
- **Box Drawing**: Fancy ASCII art boxes
- **Icons**: Emoji and text fallbacks

### Comprehensive Help System
- **Command Help**: Detailed help for individual commands
- **Global Help**: Overview of all commands with categories
- **Category Help**: Commands grouped by functionality
- **Examples**: Rich examples with descriptions
- **Status Indicators**: Experimental/deprecated command marking

### Interactive Features
- **Terminal Detection**: Automatic capability detection
- **Adaptive Display**: Output adjusts to terminal capabilities
- **Configuration Management**: Hot-reloading configuration
- **Environment Analysis**: Comprehensive environment detection

### Error Handling
- **Rich Error Context**: Detailed error information with suggestions
- **Recovery Actions**: Automated recovery suggestions
- **Stack Traces**: Debug-friendly error display
- **User-Friendly Messages**: Clear error explanations

## 🔗 Integration

The TypeScript CLI integrates seamlessly with the broader Claude Code Flow architecture:

- **Unified Architecture**: Direct integration with the ultimate unified architecture
- **Neural Networks**: Native ruv-swarm coordination
- **Vector Search**: Semantic search capabilities
- **Graph Database**: Complex relationship queries
- **Memory Management**: Persistent state across sessions

## 📚 API Reference

See the individual component files for detailed API documentation:

- [`types/cli.ts`](./types/cli.ts) - Complete type definitions
- [`core/cli-error.ts`](./core/cli-error.ts) - Error handling classes
- [`core/argument-parser.ts`](./core/argument-parser.ts) - Parsing utilities
- [`utils/output-formatter.ts`](./utils/output-formatter.ts) - Formatting functions
- [`utils/help-system.ts`](./utils/help-system.ts) - Help generation
- [`utils/configuration-manager.ts`](./utils/configuration-manager.ts) - Configuration management

---

**The TypeScript CLI system provides a solid foundation for the Claude Code Flow platform with comprehensive type safety, rich features, and excellent developer experience.**