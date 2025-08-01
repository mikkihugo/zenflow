# CLI Commands - TDD London School Tests

This directory contains London School TDD tests for CLI command processing components. These tests focus on **behavior verification** and **interaction testing** using mocks, rather than state-based testing.

## 🎯 London School TDD Principles

### Core Characteristics

1. **Mock External Dependencies**: All external collaborators are mocked
2. **Test Interactions**: Focus on how objects collaborate, not their internal state
3. **Behavior Verification**: Verify that the right methods are called with correct parameters
4. **Outside-In Development**: Start from the user interface and work inward
5. **Fine-Grained Tests**: Each test focuses on a specific interaction or behavior

### Testing Philosophy

- **What**: Test the behavior and interactions between components
- **How**: Use mocks and spies to verify method calls and collaborations
- **Why**: Ensure components work together correctly and maintain proper contracts

## 📁 Test Structure

```
cli-commands/
├── command-registry.test.ts     - Command registration and discovery
├── base-command.test.ts         - Command lifecycle and validation  
├── argument-parser.test.ts      - Command-line argument parsing
├── output-formatter.test.ts     - Output formatting and rendering
├── error-handler.test.ts        - Error handling and recovery
├── index.test.ts                - Integration between components
└── README.md                    - This documentation
```

## 🧩 Component Tests

### CommandRegistry Tests (`command-registry.test.ts`)

Tests the behavior of command registration, discovery, and execution:

- **Registration Behavior**: Event emissions, alias handling, duplicate prevention
- **Discovery Behavior**: Category filtering, search functionality, listing
- **Execution Behavior**: Handler invocation, context passing, error handling
- **Integration Behavior**: BaseCommand integration, usage statistics
- **Cleanup Behavior**: Resource disposal, event listener removal

**Key Interactions Tested**:
- Registry ↔ EventEmitter (event emissions)
- Registry ↔ BaseCommand (command execution)
- Registry ↔ CommandHandler (fallback execution)

### BaseCommand Tests (`base-command.test.ts`)

Tests the command lifecycle, validation, and hook system:

- **Lifecycle Behavior**: Execution flow, concurrent execution prevention
- **Validation Behavior**: Flag validation, argument validation, custom validation
- **Hook Behavior**: Lifecycle hooks, error hooks, hook exception handling
- **Error Handling Behavior**: Exception catching, error result generation
- **Metadata Behavior**: Configuration access, help text generation

**Key Interactions Tested**:
- BaseCommand ↔ EventEmitter (lifecycle events)
- BaseCommand ↔ CommandHooks (lifecycle callbacks)
- BaseCommand ↔ Validation (context validation)

### ArgumentParser Tests (`argument-parser.test.ts`)

Tests command-line argument parsing and validation:

- **Parsing Behavior**: Command extraction, flag parsing, argument handling
- **Command Definition Behavior**: Registration, alias handling, configuration
- **Validation Behavior**: Required flags, type validation, warning generation
- **Options Configuration Behavior**: Parser settings, option merging
- **Edge Case Behavior**: Empty inputs, special characters, variadic arguments

**Key Interactions Tested**:
- Parser ↔ CommandDefinition (command configuration)
- Parser ↔ ValidationResult (validation reporting)
- Parser ↔ ParseResult (parsing output)

### OutputFormatter Tests (`output-formatter.test.ts`)

Tests output formatting and rendering across different formats:

- **Formatting Behavior**: Format-specific rendering, option handling
- **Renderer Registration Behavior**: Custom renderer support, format validation
- **Output Writing Behavior**: stdout/stderr routing, table formatting
- **Color and Theme Behavior**: Styling application, theme support
- **Error Handling Behavior**: Invalid data handling, validation integration

**Key Interactions Tested**:
- Formatter ↔ FormatRenderer (rendering delegation)
- Formatter ↔ OutputWriter (output generation)
- Formatter ↔ Console (output display)

### ErrorHandler Tests (`error-handler.test.ts`)

Tests error handling, recovery strategies, and logging integration:

- **Error Handling Behavior**: Error processing, context utilization, metrics tracking
- **Handler Registration Behavior**: Type-specific handlers, custom handler support
- **Recovery Strategy Behavior**: Strategy registration, priority ordering, recovery attempts
- **Logging Integration Behavior**: Log level handling, severity-based logging
- **Context-Aware Behavior**: User-specific handling, command context utilization

**Key Interactions Tested**:
- ErrorHandler ↔ Logger (error logging)
- ErrorHandler ↔ RecoveryStrategy (error recovery)
- ErrorHandler ↔ ErrorContext (context-aware handling)

### Integration Tests (`index.test.ts`)

Tests the integration and coordination between all CLI components:

- **System Initialization Behavior**: Component initialization order, event coordination
- **Command Execution Flow Behavior**: End-to-end command processing
- **Component Interaction Behavior**: Parser-Registry coordination, Formatter integration
- **Error Propagation Behavior**: Error handling across component boundaries
- **Lifecycle Management Behavior**: System startup, shutdown, cleanup

**Key Interactions Tested**:
- CLISystem ↔ All Components (system orchestration)
- Parser ↔ Registry (command resolution)
- Registry ↔ Formatter (output generation)
- System ↔ ErrorHandler (error coordination)

## 🔧 Mock Strategies

### Component Mocking Patterns

1. **Interface Mocking**: Create mock implementations of interfaces
2. **Method Mocking**: Use `jest.fn()` to mock specific methods
3. **Event Mocking**: Mock EventEmitter behavior for event testing
4. **Dependency Injection**: Inject mocks into constructors for testing

### Example Mock Pattern

```typescript
// Mock external dependency
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Test interaction
await errorHandler.handle(error, context);

// Verify interaction
expect(mockLogger.error).toHaveBeenCalledWith(
  expect.stringContaining('error message'),
  expect.objectContaining({ context })
);
```

## 🚀 Running Tests

### Run All CLI Command Tests

```bash
# Using the test runner script
node scripts/run-tdd-london-cli-tests.js

# Using Jest directly
npx jest src/__tests__/unit/london/cli-commands
```

### Run Specific Test Files

```bash
# Command registry tests
npx jest command-registry.test.ts

# Base command tests  
npx jest base-command.test.ts

# Integration tests
npx jest index.test.ts
```

### Run with Coverage

```bash
# Generate coverage report
npx jest src/__tests__/unit/london/cli-commands --coverage

# Coverage for specific components
npx jest command-registry.test.ts --coverage --collectCoverageFrom="src/cli/core/command-registry.ts"
```

### Watch Mode

```bash
# Run in watch mode for development
npx jest src/__tests__/unit/london/cli-commands --watch
```

## 📊 Test Metrics

### Coverage Goals

- **Line Coverage**: > 90%
- **Function Coverage**: > 95%
- **Branch Coverage**: > 85%
- **Statement Coverage**: > 90%

### Interaction Coverage

- **Method Calls**: All public methods should be tested
- **Event Emissions**: All events should be verified
- **Error Paths**: All error scenarios should be covered
- **Edge Cases**: Boundary conditions and invalid inputs

## 🎨 Test Writing Guidelines

### Test Structure

```typescript
describe('ComponentName - TDD London', () => {
  describe('behavior category', () => {
    it('should verify specific interaction or behavior', () => {
      // Arrange - Setup mocks and test data
      // Act - Execute the behavior being tested
      // Assert - Verify interactions and behavior
    });
  });
});
```

### Naming Conventions

- **Test Suites**: `ComponentName - TDD London`
- **Test Groups**: `behavior category behavior`
- **Test Cases**: `should verify specific interaction or behavior`

### Assertion Patterns

```typescript
// Verify method calls
expect(mockMethod).toHaveBeenCalledWith(expectedArgs);

// Verify event emissions
expect(eventHandler).toHaveBeenCalledWith(expectedEvent);

// Verify behavior outcomes
expect(result).toEqual(expectedResult);

// Verify error handling
expect(() => operation()).toThrow(expectedError);
```

## 🔍 Debugging Tests

### Common Issues

1. **Mock Not Called**: Check if the code path reaches the mocked method
2. **Wrong Arguments**: Verify the exact arguments passed to mocks
3. **Async Issues**: Ensure proper async/await usage with Promise-based mocks
4. **Event Timing**: Check event emission timing and listener registration

### Debug Strategies

```typescript
// Log mock calls
console.log(mockMethod.mock.calls);

// Check mock call count
console.log(mockMethod.mock.calls.length);

// Inspect call arguments
console.log(mockMethod.mock.calls[0]);

// Debug event emissions
emitter.on('event', (data) => console.log('Event emitted:', data));
```

## 🔗 Related Documentation

- [TDD London School Principles](../../../../../../docs/TDD-LONDON-SCHOOL-IMPLEMENTATION-SUMMARY.md)
- [CLI Architecture](../../../../../cli/README.md)
- [Command Types](../../../../../cli/types/command.ts)
- [Jest Configuration](../../../../../../jest.config.ts)

## 🤝 Contributing

When adding new CLI command tests:

1. Follow the London School TDD approach
2. Mock all external dependencies
3. Focus on behavior and interactions
4. Use descriptive test names
5. Group related behaviors together
6. Verify both success and error paths
7. Test edge cases and boundary conditions

---

**Remember**: London School TDD is about testing the **conversations between objects**, not their internal implementation. Focus on verifying that components collaborate correctly and maintain their contracts.