# MCP Protocol Compliance Tests - TDD London Style

This directory contains comprehensive test suites for MCP (Model Context Protocol) compliance using TDD London School principles.

## Overview

The tests focus on **behavior verification** and **interaction testing** rather than implementation details, following the London School of TDD approach:

- **Outside-in development** from protocol specifications
- **Mock-driven contracts** for all external dependencies  
- **Behavior verification** over state testing
- **Interaction focus** on component communication

## Test Structure

### 🎯 Core Test Files

1. **`protocol-message-validation.test.ts`**
   - JSON-RPC 2.0 base protocol validation
   - MCP method validation and schema compliance
   - Parameter validation and error handling
   - Message format verification

2. **`tool-registration-discovery.test.ts`**
   - Tool registration workflow and validation
   - Tool discovery and enumeration mechanisms
   - Tool metadata validation and schema compliance
   - Registry management contracts and lifecycle

3. **`request-response-handling.test.ts`**
   - Request processing lifecycle management
   - Response generation and formatting
   - Timeout handling and session management
   - Request routing and method dispatch

4. **`error-scenarios.test.ts`**
   - Error classification and handling strategies
   - Retry mechanisms with exponential backoff
   - Circuit breaker patterns and fail-fast behavior
   - Alert management and threshold monitoring

5. **`streaming-support.test.ts`**
   - Stream creation and lifecycle management
   - Data chunk processing and sequencing
   - Backpressure detection and management
   - Buffer optimization and flow control

6. **`index.test.ts`**
   - Test suite overview and organization
   - Protocol compliance verification
   - London School pattern demonstrations

## London School TDD Principles Applied

### 1. Outside-In Development
```typescript
// Start with high-level behavior requirements
describe('User Story: Handle MCP Tool Calls', () => {
  it('should process tool calls with proper validation and execution', async () => {
    // Test the complete workflow from user perspective
  });
});
```

### 2. Mock-Driven Contracts
```typescript
// Define clear contracts through mocking
const mockToolExecutor = {
  execute: jest.fn(),
  validate: jest.fn(),
  getSchema: jest.fn()
};

// Focus on interaction contracts, not implementation
expect(mockToolExecutor.execute).toHaveBeenCalledWith(
  'analyze_code',
  { codebase: '/path/to/project' }
);
```

### 3. Behavior Verification
```typescript
// Test what the component does, not how it does it
expect(mockLogger.info).toHaveBeenCalledWith(
  'Tool registered successfully',
  { name: 'code_analyzer' }
);
expect(mockEventBus.emit).toHaveBeenCalledWith('tool:registered', {
  name: 'code_analyzer',
  tool: validTool
});
```

### 4. Interaction Testing
```typescript
// Verify the conversation between components
expect(mockValidator.validate).toHaveBeenCalledWith(request);
expect(mockRouter.getHandler).toHaveBeenCalledWith('tools/call');
expect(mockExecutor.execute).toHaveBeenCalledWith(toolName, args);
expect(mockResponseBuilder.createResponse).toHaveBeenCalledWith(id, result);
```

## Test Organization Patterns

### Acceptance Tests (🎯)
Focus on complete user workflows and protocol compliance:
```typescript
describe('🎯 Acceptance Tests - Protocol Compliance', () => {
  describe('User Story: Register New Tool', () => {
    it('should register a valid tool with proper validation', async () => {
      // Complete workflow from user perspective
    });
  });
});
```

### Contract Verification (🔗)
Test component integration and interface contracts:
```typescript
describe('🔗 Contract Verification - Component Integration', () => {
  describe('Memory Store Integration', () => {
    it('should coordinate memory operations with tool execution', async () => {
      // Test component interaction contracts
    });
  });
});
```

### London School Patterns (🧪)
Demonstrate interaction-focused testing patterns:
```typescript
describe('🧪 London School Patterns - Interaction Focus', () => {
  it('should demonstrate validation workflow coordination', async () => {
    // Show complete interaction workflow
  });
});
```

## Mock Strategy

### Contract-Based Mocking
Each mock represents a clear contract interface:

```typescript
const mockToolRegistry = {
  register: jest.fn(),    // Registration contract
  get: jest.fn(),        // Retrieval contract  
  list: jest.fn(),       // Discovery contract
  exists: jest.fn(),     // Existence check contract
  validate: jest.fn()    // Validation contract
};
```

### Behavior-Driven Mocks
Mocks simulate real component behavior:

```typescript
mockValidator.validate.mockReturnValue({ valid: true, errors: [] });
mockExecutor.execute.mockResolvedValue({ 
  content: [{ type: 'text', text: 'Analysis complete' }] 
});
```

## Running the Tests

```bash
# Run all MCP protocol tests
npm test -- src/__tests__/unit/london/mcp-protocol

# Run specific test file
npm test -- src/__tests__/unit/london/mcp-protocol/protocol-message-validation.test.ts

# Run with coverage
npm test -- --coverage src/__tests__/unit/london/mcp-protocol

# Run in watch mode
npm test -- --watch src/__tests__/unit/london/mcp-protocol
```

## Key Benefits

### 1. Protocol Compliance
- Ensures MCP specification adherence
- Validates JSON-RPC 2.0 compliance
- Tests all required MCP methods
- Verifies error code standards

### 2. Maintainability  
- Clear test structure and naming
- Focused on behavior, not implementation
- Easy to understand and modify
- Self-documenting test cases

### 3. Reliability
- Comprehensive error scenario coverage
- Edge case handling validation
- Timeout and recovery testing
- Backpressure management verification

### 4. Development Speed
- Outside-in development approach
- Clear component contracts
- Mock-driven development
- Fast feedback cycles

## London School vs Classical TDD

| Aspect | London School (This Implementation) | Classical TDD |
|--------|-----------------------------------|---------------|
| **Focus** | Behavior and interactions | State and implementation |
| **Mocking** | Mock all dependencies | Mock only infrastructure |
| **Design** | Outside-in from requirements | Inside-out from domain |
| **Tests** | Interaction verification | State verification |
| **Feedback** | Component communication | Algorithm correctness |

## Contributing

When adding new MCP protocol tests:

1. **Follow the naming convention**: Use emojis and clear descriptions
2. **Apply London School principles**: Mock dependencies, test interactions
3. **Organize by user stories**: Group tests by acceptance criteria
4. **Verify contracts**: Test component communication patterns
5. **Document behavior**: Make tests self-explanatory

## Example Test Pattern

```typescript
describe('🎯 Acceptance Tests - [Feature Area]', () => {
  describe('User Story: [User Goal]', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Arrange - Mock all dependencies with expected behavior
      mockDependency.method.mockReturnValue(expectedResult);
      
      const component = new ComponentUnderTest(mockDependency);
      const input = createTestInput();
      
      // Act - Execute the behavior
      const result = await component.performAction(input);
      
      // Assert - Verify the conversation (London School focus)
      expect(mockDependency.method).toHaveBeenCalledWith(expectedParams);
      expect(result).toEqual(expectedOutcome);
    });
  });
});
```

This test structure ensures clear, maintainable, and behavior-focused tests that verify MCP protocol compliance through interaction testing rather than implementation details.