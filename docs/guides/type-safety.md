# Union Type Safety Guide

This document provides guidance on using the new type guard utilities to safely handle union types throughout the claude-code-zen codebase.

## Overview

TypeScript strict mode compilation requires safe property access on union types. This guide shows how to use the new type guard functions to ensure type safety when working with union types.

## Type Guard Patterns

### Database Operations

Instead of unsafe direct property access:

```typescript
// ❌ Unsafe - TypeScript strict mode error
const result: QueryResult | ErrorResult = await query();
const data = result.data; // Error: Property 'data' does not exist on type 'ErrorResult'
```

Use type guards for safe property access:

```typescript
// ✅ Safe - Using type guards
import { DatabaseResult, isQuerySuccess, isQueryError } from '../../utils/type-guards';

const result: DatabaseResult<User[]> = await queryWithResult('SELECT * FROM users');

if (isQuerySuccess(result)) {
  // TypeScript knows this is QuerySuccess<User[]>
  console.log('Query successful:', result.data.length, 'users found');
  console.log('Execution time:', result.executionTime, 'ms');
} else if (isQueryError(result)) {
  // TypeScript knows this is QueryError
  console.error('Query failed:', result.error.message);
  console.error('Error code:', result.error.code);
}
```

### Memory Store Operations

```typescript
import { MemoryResult, isMemorySuccess, isMemoryNotFound, isMemoryError } from '../../utils/type-guards';

const result: MemoryResult<UserProfile> = await memoryStore.retrieve('user:123');

if (isMemorySuccess(result)) {
  // Safe access to user data
  console.log('User found:', result.data.name);
  console.log('Cache timestamp:', result.timestamp);
} else if (isMemoryNotFound(result)) {
  console.log('User not found, reason:', result.reason);
} else if (isMemoryError(result)) {
  console.error('Memory error:', result.error.message);
}
```

### Neural Network Operations

```typescript
import { NeuralResult, isTrainingResult, isInferenceResult, isNeuralError } from '../../utils/type-guards';

const result: NeuralResult = await neuralNetwork.train(trainingData, options);

if (isTrainingResult(result)) {
  console.log('Training completed successfully');
  console.log('Final error:', result.finalError);
  console.log('Converged:', result.converged);
  
  if (result.accuracy !== undefined) {
    console.log('Accuracy:', result.accuracy * 100, '%');
  }
} else if (isNeuralError(result)) {
  console.error('Training failed:', result.error.message);
  console.error('Operation:', result.error.operation);
}
```

### API Response Handling

```typescript
import { APIResult, isAPISuccess, isAPIError } from '../../utils/type-guards';

const result: APIResult<User> = await apiClient.get<User>('/users/123');

if (isAPISuccess(result)) {
  // Safe access to API response data
  console.log('User:', result.data.name);
  console.log('Request ID:', result.metadata?.requestId);
} else if (isAPIError(result)) {
  console.error('API error:', result.error.message);
  
  // Handle specific error codes
  switch (result.error.code) {
    case 'HTTP_404':
      console.error('User not found');
      break;
    case 'HTTP_401':
      console.error('Authentication required');
      break;
    default:
      console.error('Unexpected error');
  }
}
```

### WASM Operations

```typescript
import { WasmResult, isWasmSuccess, isWasmError } from '../../utils/type-guards';

const result: WasmResult<number[]> = await wasmModule.computeVector(input);

if (isWasmSuccess(result)) {
  console.log('WASM computation successful:', result.result);
  console.log('Execution time:', result.executionTime, 'ms');
  console.log('Memory usage:', result.memoryUsage, 'bytes');
} else if (isWasmError(result)) {
  console.error('WASM error:', result.error.message);
  if (result.error.wasmStack) {
    console.error('WASM stack:', result.error.wasmStack);
  }
}
```

## Utility Functions

### Safe Property Access

```typescript
import { hasProperty, safePropertyAccess } from '../../utils/type-guards';

// Check if property exists
if (hasProperty(obj, 'specificProperty')) {
  // TypeScript knows obj has 'specificProperty'
  console.log(obj.specificProperty);
}

// Safe property access with undefined fallback
const value = safePropertyAccess(obj, 'maybeProperty'); // Returns T[K] | undefined
```

### Error Message Extraction

```typescript
import { extractErrorMessage } from '../../utils/type-guards';

// Works with any result type that has error information
const errorMessage = extractErrorMessage(result);
if (errorMessage) {
  console.error('Operation failed:', errorMessage);
}
```

### Data Extraction

```typescript
import { extractData } from '../../utils/type-guards';

// Safely extract data from database results
const userData = extractData(databaseResult); // Returns T | null
if (userData) {
  // Process the user data
  console.log('User data:', userData);
}
```

## Integration Examples

### Combining Multiple Operations

```typescript
async function createUserWorkflow(userData: CreateUserData): Promise<void> {
  // 1. Store user in database
  const dbResult = await database.queryWithResult('INSERT INTO users ...');
  
  if (!isQuerySuccess(dbResult)) {
    console.error('Database error:', extractErrorMessage(dbResult));
    return;
  }
  
  const userId = dbResult.data.insertId;
  
  // 2. Cache user profile
  const cacheResult = await memoryStore.store(`user:${userId}`, userData);
  
  if (!isMemorySuccess(cacheResult)) {
    console.warn('Cache error:', extractErrorMessage(cacheResult));
    // Continue - caching failure is not critical
  }
  
  // 3. Initialize user's neural profile
  const neuralResult = await neuralService.initializeUserProfile(userId);
  
  if (isNeuralError(neuralResult)) {
    console.error('Neural initialization failed:', neuralResult.error.message);
    // Handle cleanup if needed
  }
  
  console.log('✅ User workflow completed successfully');
}
```

### Error Handling Patterns

```typescript
function handleOperationResult<T>(result: DatabaseResult<T> | MemoryResult<T> | APIResult<T>): T | null {
  // Extract error message works with any result type
  const errorMessage = extractErrorMessage(result);
  
  if (errorMessage) {
    console.error('Operation failed:', errorMessage);
    return null;
  }
  
  // Type guards work with union types
  if ('success' in result && isQuerySuccess(result)) {
    return result.data;
  }
  
  if ('found' in result && isMemorySuccess(result)) {
    return result.data;
  }
  
  if ('success' in result && isAPISuccess(result)) {
    return result.data;
  }
  
  return null;
}
```

## Migration Guidelines

### Updating Existing Code

1. **Identify Union Type Usage**: Look for direct property access on union types
2. **Import Type Guards**: Add imports for relevant type guard functions
3. **Replace Direct Access**: Use type guards instead of direct property access
4. **Add Error Handling**: Implement proper error handling for each union variant
5. **Test Thoroughly**: Ensure all code paths are covered

### Common Migration Patterns

Before:
```typescript
// Unsafe union type access
const result = await someOperation();
if (result.success) {
  return result.data; // ❌ Might not exist on error types
}
```

After:
```typescript
// Safe union type access
const result = await someOperation();
if (isOperationSuccess(result)) {
  return result.data; // ✅ TypeScript knows this property exists
}
```

## Best Practices

1. **Always Use Type Guards**: Never access properties directly on union types
2. **Handle All Cases**: Ensure all union variants are handled in your code
3. **Use Utility Functions**: Leverage helper functions for common operations
4. **Add Comprehensive Error Handling**: Don't ignore error cases
5. **Test Edge Cases**: Test both success and error scenarios
6. **Document Complex Unions**: Add comments explaining complex union logic

## Testing

All type guard functions include comprehensive tests demonstrating correct usage:

```bash
npm test src/__tests__/unit/classical/utils/type-guards.test.ts
```

The test suite covers:
- Type discrimination accuracy
- Type narrowing behavior
- Edge cases and error conditions
- Integration scenarios
- Utility function behavior

## Performance Considerations

Type guards are compile-time constructs that don't add runtime overhead. They provide:

- **Zero runtime cost**: Type guards are erased during compilation
- **Better optimization**: TypeScript can optimize code with known types
- **Reduced errors**: Catch type errors at compile time instead of runtime
- **Improved intellisense**: Better IDE support with narrowed types

## Troubleshooting

### Common Issues

1. **Type Guard Not Working**: Ensure discriminant properties are present
2. **Still Getting Type Errors**: Check that all union variants have proper discriminants
3. **Unexpected Behavior**: Verify that type guard logic matches actual data structure
4. **Performance Issues**: Type guards should have no runtime impact - check implementation

### Debugging Tips

1. Use TypeScript's built-in type checking to verify type narrowing
2. Add explicit type annotations to verify expected types
3. Use the TypeScript compiler's strict mode for maximum safety
4. Enable detailed error messages to understand type issues