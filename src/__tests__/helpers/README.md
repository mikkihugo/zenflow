# Test Helper Utilities

Comprehensive test helper utilities supporting both London School (interaction-focused) and Classical School (state-focused) TDD approaches.

## 📚 Overview

This test helper library provides a complete toolkit for writing effective tests in both TDD styles:

- **London School TDD**: Mock-heavy, interaction-focused testing
- **Classical School TDD**: Real object, state-focused testing

## 🛠️ Core Components

### MockBuilder
Creates sophisticated mocks for London School TDD with interaction tracking.

```typescript
import { createLondonMocks } from './helpers';

const mockBuilder = createLondonMocks({
  trackInteractions: true,
  autoGenerate: true
});

const mocks = mockBuilder.createCommonMocks();
```

### TestDataFactory
Generates realistic, reproducible test data for various scenarios.

```typescript
import { testDataFactory } from './helpers';

// Generate users
const users = testDataFactory.createUsers(10);

// Generate neural network training data
const trainingData = testDataFactory.createNeuralTrainingData(1000);

// Generate project structures
const project = testDataFactory.createProject({
  type: 'typescript',
  name: 'my-awesome-project'
});
```

### AssertionHelpers
Enhanced assertions for specialized testing scenarios.

```typescript
import { assertionHelpers } from './helpers';

// Performance assertions
assertionHelpers.toMeetPerformanceThreshold(metrics, thresholds);

// Approximate equality
assertionHelpers.toBeApproximately(actual, expected, precision);

// Mathematical properties
assertionHelpers.toSatisfyMathematicalProperty(values, 'monotonic-increasing');
```

### PerformanceMeasurement
Comprehensive performance testing and benchmarking.

```typescript
import { performanceMeasurement } from './helpers';

// Measure function performance
const metrics = performanceMeasurement.measureSync('myFunction', myFunction);

// Benchmark multiple implementations
const results = await performanceMeasurement.benchmarkComparison([
  { name: 'Algorithm A', fn: algorithmA },
  { name: 'Algorithm B', fn: algorithmB }
]);

// Detect memory leaks
const leakResult = await performanceMeasurement.detectMemoryLeaks(
  'suspiciousFunction', 
  suspiciousFunction, 
  100
);
```

### IntegrationTestSetup
Complete environment setup and teardown for integration tests.

```typescript
import { IntegrationTestSetup } from './helpers';

const testSetup = new IntegrationTestSetup({
  environment: {
    database: 'sqlite',
    filesystem: 'temp',
    network: 'mock'
  }
});

const { database, filesystem, network } = await testSetup.setup();
// ... run tests ...
await testSetup.cleanup();
```

## 🎭 London School TDD Examples

### Basic Mock Usage

```typescript
import { createLondonMocks } from './helpers';

describe('User Service - London School', () => {
  it('should coordinate user creation workflow', async () => {
    const mockBuilder = createLondonMocks();
    const mocks = mockBuilder.createCommonMocks();

    // Setup expectations
    mocks.database.save.mockResolvedValue({ id: 1, email: 'test@example.com' });
    mocks.emailService.sendWelcome.mockResolvedValue(true);

    const userService = new UserService(mocks.database, mocks.emailService);
    
    // Execute
    const result = await userService.createUser({ email: 'test@example.com' });

    // Verify interactions (London School focus)
    expect(mocks.database.save).toHaveBeenCalledWith('users', expect.any(Object));
    expect(mocks.emailService.sendWelcome).toHaveBeenCalledWith('test@example.com');
    expect(mocks.database.save).toHaveBeenCalledBefore(mocks.emailService.sendWelcome);
  });
});
```

### Interaction Sequence Testing

```typescript
import { assertionHelpers } from './helpers';

it('should follow correct interaction sequence', () => {
  const mockService = createMockService();
  
  // Execute workflow
  performComplexWorkflow(mockService);
  
  // Verify interaction sequence
  assertionHelpers.toHaveInteractionSequence(mockService, [
    { method: 'connect' },
    { method: 'authenticate', args: ['user', 'pass'] },
    { method: 'performAction', args: [expect.any(Object)] },
    { method: 'disconnect' }
  ]);
});
```

## 🏛️ Classical School TDD Examples

### Algorithm Testing

```typescript
describe('Sorting Algorithms - Classical School', () => {
  it('should correctly sort arrays', () => {
    const sorter = new SortingAlgorithms();
    const input = [64, 34, 25, 12, 22, 11, 90];
    const expected = [11, 12, 22, 25, 34, 64, 90];

    // Test actual behavior, not mocks
    expect(sorter.quickSort(input)).toEqual(expected);
    expect(sorter.bubbleSort(input)).toEqual(expected);
    
    // Test mathematical properties
    const result = sorter.quickSort(input);
    assertionHelpers.toSatisfyMathematicalProperty(result, 'monotonic-increasing');
  });
});
```

### Neural Network Testing

```typescript
describe('Neural Network Training - Classical School', () => {
  it('should converge to target accuracy', () => {
    const network = new NeuralNetwork([2, 4, 1]);
    const xorData = testDataFactory.createNeuralTrainingData(4);
    
    // Train on actual data
    const result = network.train(xorData, { epochs: 1000 });
    
    // Test mathematical convergence
    assertionHelpers.toConvergeToTarget(result.history, 0.1, 1000);
    
    // Test actual predictions
    expect(network.predict([0, 0])[0]).toBeCloseTo(0, 1);
    expect(network.predict([1, 1])[0]).toBeCloseTo(0, 1);
  });
});
```

## 📊 Performance Testing

### Benchmarking

```typescript
describe('Performance Tests', () => {
  it('should meet performance requirements', async () => {
    const testData = testDataFactory.createPerformanceData(10000);
    
    const metrics = await performanceMeasurement.measureAsync(
      'Data Processing',
      () => processLargeDataset(testData),
      { iterations: 100 }
    );

    // Performance assertions
    assertionHelpers.toMeetPerformanceThreshold(metrics, {
      executionTime: 1000, // max 1 second
      memoryUsage: { heap: 50 * 1024 * 1024 }, // max 50MB
      throughput: 100 // min 100 ops/sec
    });
  });
});
```

### Memory Leak Detection

```typescript
it('should not leak memory', async () => {
  const leakTest = await performanceMeasurement.detectMemoryLeaks(
    'Potential Memory Leak',
    () => suspiciousFunction(),
    200 // iterations
  );

  expect(leakTest.hasLeak).toBe(false);
  expect(leakTest.memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
});
```

## 🧪 Integration Testing

### Complete Environment Setup

```typescript
describe('Integration Tests', () => {
  let testEnv: any;

  beforeEach(async () => {
    const setup = new IntegrationTestSetup({
      environment: {
        database: 'sqlite',
        filesystem: 'temp',
        network: 'localhost'
      }
    });
    
    testEnv = await setup.setup();
  });

  it('should handle end-to-end workflow', async () => {
    // Setup test data
    await testEnv.database.seed(testDataFactory.createDatabaseSeed());
    
    // Create test files
    const workDir = await testEnv.filesystem.createTempDir('workflow-test');
    await testEnv.filesystem.createFile(`${workDir}/config.json`, JSON.stringify({
      environment: 'test',
      features: ['feature1', 'feature2']
    }));

    // Setup API endpoints
    testEnv.network.mockRequest('GET', '/api/status', {
      status: 200,
      body: { status: 'healthy' }
    });

    // Execute end-to-end test
    const result = await runCompleteWorkflow(workDir);
    
    // Verify results
    expect(result.success).toBe(true);
    expect(result.processedFiles).toBeGreaterThan(0);
    
    // Verify network interactions
    const requests = testEnv.network.captureRequests();
    expect(requests).toContainEqual(
      expect.objectContaining({
        method: 'GET',
        url: '/api/status'
      })
    );
  });
});
```

## 📝 Test Logging

### Structured Test Logging

```typescript
import { createTestLogger } from './helpers';

describe('Service Tests', () => {
  const logger = createTestLogger('ServiceTests');

  it('should log test execution details', () => {
    const serviceLogger = logger.createChild('UserService');
    
    // Log different types of events
    serviceLogger.info('Starting user validation');
    serviceLogger.logInteraction('Validator', 'validateEmail', ['user@example.com']);
    serviceLogger.logStateChange('User', { valid: false }, { valid: true });
    serviceLogger.logPerformance('Validation', 15);
    serviceLogger.logAssertion('Email validation', true);

    // Analyze logs
    const performanceLogs = serviceLogger.getLogsByCategory('performance');
    expect(performanceLogs).toHaveLength(1);
    
    // Export for analysis
    const report = serviceLogger.exportLogs('json');
    expect(JSON.parse(report)).toBeInstanceOf(Array);
  });
});
```

## 🔧 Configuration

### Jest Configuration

Add to your `jest.config.ts`:

```typescript
export default {
  // ... existing config
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/helpers/jest-setup.ts'
  ],
  moduleNameMapper: {
    '^@test-helpers/(.*)$': '<rootDir>/src/__tests__/helpers/$1'
  }
};
```

### TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@test-helpers/*": ["src/__tests__/helpers/*"]
    }
  }
}
```

## 🚀 Getting Started

1. **Install dependencies**: The helpers use Jest and common Node.js modules
2. **Choose your approach**: London School for interaction testing, Classical for behavior testing
3. **Start simple**: Begin with basic mock builders or test data factories
4. **Add complexity**: Integrate performance testing and full environment setup as needed

## 📈 Best Practices

### London School TDD
- Focus on object interactions and collaborations
- Use mocks to isolate units under test
- Verify method calls, parameters, and call sequences
- Test the communication protocol between objects

### Classical School TDD
- Focus on inputs, outputs, and state changes
- Use real objects whenever possible
- Verify mathematical properties and algorithmic correctness
- Test domain logic and business rules

### Performance Testing
- Set realistic performance thresholds
- Test with representative data sizes
- Monitor memory usage and detect leaks
- Compare algorithm implementations

### Integration Testing
- Use isolated test environments
- Clean up resources properly
- Test complete user workflows
- Verify system behavior under load

## 🤝 Contributing

When adding new test helpers:

1. Support both London and Classical TDD approaches
2. Include comprehensive examples and documentation
3. Provide performance-conscious implementations
4. Add appropriate error handling and logging
5. Write tests for the test helpers themselves

## 📄 License

Part of the Claude Code Flow project. See main project license for details.