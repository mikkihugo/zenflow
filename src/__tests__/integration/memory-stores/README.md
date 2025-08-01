# Memory Stores Integration Tests

This directory contains comprehensive hybrid integration tests for memory store implementations, demonstrating both London School and Classical School testing approaches.

## 🎯 Testing Philosophy

### Hybrid Approach Benefits

Our memory store tests combine the best of both testing schools:

- **London School (Interface Testing)**: Mock external dependencies to test interfaces in isolation
- **Classical School (Behavior Testing)**: Test actual implementations with real data operations
- **Hybrid Integration**: Combine both approaches for comprehensive coverage

## 📁 Test Structure

```
memory-stores/
├── sqlite-persistence.test.ts       # SQLite database operations
├── lancedb-vector-operations.test.ts # Vector database and similarity
├── session-management.test.ts       # Session lifecycle management
├── cache-performance.test.ts        # Cache algorithms and performance
├── data-integrity.test.ts          # Data validation and corruption handling
├── index.test.ts                   # Test suite integration
└── README.md                       # This documentation
```

## 🧪 Test Categories

### 1. SQLite Persistence (`sqlite-persistence.test.ts`)

**London School Tests:**
- Mock SQLite connections and query execution
- Test connection error handling
- Validate transaction management interfaces

**Classical School Tests:**
- Actual SQLite database operations
- Real data persistence and retrieval
- Performance benchmarking with real queries
- Concurrent access testing

### 2. LanceDB Vector Operations (`lancedb-vector-operations.test.ts`)

**London School Tests:**
- Mock LanceDB connection and table operations
- Simulate database connection failures
- Test search operation interfaces

**Classical School Tests:**
- Real vector similarity calculations (cosine, euclidean)
- Actual vector mathematics and normalization
- Performance benchmarks with large datasets
- High-dimensional vector handling

### 3. Session Management (`session-management.test.ts`)

**London School Tests:**
- Mock session storage backends
- Simulate storage failures and recovery
- Test event emission interfaces

**Classical School Tests:**
- Real session lifecycle management
- Actual expiration and cleanup operations
- Concurrent session access patterns
- Memory usage tracking

### 4. Cache Performance (`cache-performance.test.ts`)

**London School Tests:**
- Mock cache implementations and strategies
- Test eviction policy interfaces
- Simulate cache failure scenarios

**Classical School Tests:**
- Real cache algorithm implementations (LRU, LFU, TTL)
- Actual performance benchmarking
- Memory usage optimization
- Concurrent cache access patterns

### 5. Data Integrity (`data-integrity.test.ts`)

**London School Tests:**
- Mock corruption scenarios and storage failures
- Test repair strategy interfaces
- Simulate backup system failures

**Classical School Tests:**
- Real checksum calculation and validation
- Actual data corruption detection
- Performance of integrity operations
- Complex data structure validation

## 🚀 Running the Tests

### All Memory Store Tests
```bash
npm run test:integration -- memory-stores
```

### Individual Test Files
```bash
# SQLite tests
npm test -- sqlite-persistence.test.ts

# Vector operations tests  
npm test -- lancedb-vector-operations.test.ts

# Session management tests
npm test -- session-management.test.ts

# Cache performance tests
npm test -- cache-performance.test.ts

# Data integrity tests
npm test -- data-integrity.test.ts
```

### With Coverage
```bash
npm run test:coverage:integration -- memory-stores
```

### Debug Mode
```bash
npm run test:debug -- memory-stores
```

## 📊 Test Metrics and Benchmarks

The tests include comprehensive performance benchmarking:

### SQLite Performance
- **Write Operations**: Target >100 ops/sec
- **Read Operations**: Target >200 ops/sec
- **Large Dataset**: <5 seconds for 100 sessions with 1000 records each

### Vector Operations
- **Similarity Calculations**: Target >1,000 calculations/sec for 128-dim vectors
- **High-Dimensional**: <100ms for 4096-dim vectors
- **Batch Operations**: Target >100 batch insertions/sec

### Cache Performance
- **Memory Operations**: Target >10,000 ops/sec
- **Mixed Workload**: Target >5,000 ops/sec (70% reads, 25% writes, 5% deletes)
- **Hit Rate Optimization**: Target >80% hit rate in realistic scenarios

### Session Management
- **Session Creation**: Target >1,000 sessions/sec
- **Concurrent Access**: Handle 100+ concurrent operations
- **Cleanup Efficiency**: Expired session cleanup <1 second for 1,000 sessions

### Data Integrity
- **Validation Speed**: Target >100 validations/sec
- **Corruption Detection**: <1ms per record for structural analysis
- **Repair Operations**: Success rate >90% for recoverable corruption

## 🛠️ Dependencies

The tests use these key dependencies:

- **Jest**: Test framework with TypeScript support
- **SQLite3**: For actual database operations (Classical tests)
- **@lancedb/lancedb**: For vector database operations
- **Node.js Crypto**: For checksum calculations
- **Node.js Events**: For event emitter testing

## 🎨 Test Patterns

### London School Pattern
```typescript
describe('Component Interface (London School)', () => {
  let mockDependency: MockDependency;
  
  beforeEach(() => {
    mockDependency = new MockDependency();
    mockDependency.operation = jest.fn().mockResolvedValue(expectedResult);
  });
  
  it('should handle interface correctly', async () => {
    const result = await component.useInterface(mockDependency);
    expect(mockDependency.operation).toHaveBeenCalledWith(expectedParams);
    expect(result).toEqual(expectedResult);
  });
});
```

### Classical School Pattern
```typescript
describe('Component Behavior (Classical School)', () => {
  let realImplementation: RealImplementation;
  
  beforeEach(async () => {
    realImplementation = new RealImplementation();
    await realImplementation.initialize();
  });
  
  it('should perform actual operations correctly', async () => {
    const result = await realImplementation.performRealOperation(inputData);
    expect(result).toMatchExpectedBehavior();
    
    // Verify side effects
    const sideEffect = await realImplementation.checkSideEffect();
    expect(sideEffect).toBeDefined();
  });
});
```

### Hybrid Integration Pattern
```typescript
describe('Full Integration (Hybrid)', () => {
  it('should work with both mocked and real components', async () => {
    const mockExternal = new MockExternalService();
    const realProcessor = new RealDataProcessor();
    
    const system = new IntegratedSystem(mockExternal, realProcessor);
    
    const result = await system.processWithBothComponents(testData);
    
    // Verify mock interactions
    expect(mockExternal.wasCalled()).toBe(true);
    
    // Verify real processing
    expect(result.processedData).toMatchRealProcessingRules();
  });
});
```

## 🔍 Test Analysis Features

### Automatic Test Categorization
Tests are automatically categorized as London, Classical, or Hybrid based on their describe blocks and implementation patterns.

### Performance Regression Detection
Benchmark tests will fail if performance degrades beyond acceptable thresholds, helping catch performance regressions early.

### Coverage Analysis
The test suite provides coverage analysis for both interface coverage (London) and behavior coverage (Classical).

### Error Scenario Testing
Comprehensive error handling tests cover both expected failures (Classical) and dependency failures (London).

## 🚦 Continuous Integration

These tests are designed for CI/CD environments:

- **Fast Feedback**: London School tests run quickly for rapid feedback
- **Comprehensive Validation**: Classical School tests provide thorough validation
- **Performance Monitoring**: Benchmark results are tracked over time
- **Flaky Test Detection**: Tests are designed to be deterministic and reliable

## 📈 Extending the Tests

### Adding New Memory Store Tests

1. **Create Test File**: Follow the naming pattern `new-component.test.ts`
2. **Implement Both Approaches**: Include London and Classical test sections
3. **Add Performance Benchmarks**: Include relevant performance tests
4. **Update Index**: Add to `index.test.ts` for integration testing
5. **Document Patterns**: Update this README with new patterns

### Test Structure Template
```typescript
/**
 * New Component Integration Tests
 * 
 * Hybrid Testing Approach:
 * - London School: Mock [external dependencies]
 * - Classical School: Test [actual behaviors]
 */

describe('New Component Integration Tests', () => {
  describe('Interface Testing (London School)', () => {
    // Mock external dependencies and test interfaces
  });
  
  describe('Behavior Testing (Classical School)', () => {
    // Test actual implementations and real operations
  });
  
  describe('Performance Benchmarks', () => {
    // Include relevant performance tests
  });
  
  describe('Error Handling', () => {
    // Test both mocked and real error scenarios
  });
});
```

## 🤝 Contributing

When contributing to these tests:

1. **Follow Hybrid Approach**: Include both London and Classical tests
2. **Add Performance Tests**: Include benchmarks for new functionality
3. **Document Patterns**: Update README with new patterns
4. **Maintain Balance**: Aim for ~40% London, ~50% Classical, ~10% Integration
5. **Test Real Scenarios**: Include realistic usage patterns

## 📚 References

- [London School vs Classical School Testing](https://martinfowler.com/articles/mocksArentStubs.html)
- [Jest Testing Framework](https://jestjs.io/)
- [TypeScript Testing Best Practices](https://typescript-handbook.com/testing)
- [Integration Testing Patterns](https://martinfowler.com/bliki/IntegrationTest.html)