# Maestro Steering Document Tests

## Overview

This document describes the comprehensive test suite created for the Maestro steering document generation functionality. The test suite ensures that steering documents are created correctly, follow proper format standards, integrate with the agent reuse system, and demonstrate the full workflow working correctly.

## Test Structure

### 1. Comprehensive End-to-End Test (`test-maestro-steering-complete.js`)

**Location**: `/test-maestro-steering-complete.js`

This is the main comprehensive test that can be run independently to validate the entire steering document workflow.

**Features**:
- **5 Major Test Suites**: Basic creation, templates, agent integration, workflow, and format validation
- **Mock Framework**: Complete mock implementations for testing without dependencies
- **Realistic Scenarios**: Tests real-world usage patterns and edge cases
- **Performance Tracking**: Measures execution times and resource usage
- **Comprehensive Reporting**: Detailed test results with validation summaries

**Key Test Areas**:
1. **Basic Steering Creation**: Tests document creation for different domains
2. **Template Structure**: Validates document templates and required sections
3. **Agent Integration**: Tests integration with agent reuse system
4. **End-to-End Workflow**: Complete workflow from steering to implementation
5. **Format Standards**: Validates markdown format and content quality

### 2. Unit Tests (`src/__tests__/unit/maestro/steering-documents.test.ts`)

**Location**: `src/__tests__/unit/maestro/steering-documents.test.ts`

Jest-based unit tests for individual steering document components.

**Coverage**:
- `createSteeringDocument()` method testing
- `getSteeringContext()` functionality
- Template validation logic
- Error handling scenarios
- Agent system integration points

**Test Categories**:
- Basic document creation with various domains
- Custom content handling
- Event emission verification
- File system error handling
- Concurrent operation support

### 3. Integration Tests (`src/__tests__/integration/maestro/steering-workflow.test.ts`)

**Location**: `src/__tests__/integration/maestro/steering-workflow.test.ts`

Integration tests that work with real file system operations and validate the complete workflow.

**Features**:
- Real file system operations
- Complete project setup scenarios
- Steering context integration with spec creation
- Document versioning and updates
- Performance and scalability testing

**Test Scenarios**:
- Multiple steering document creation for project setup
- Steering context integration with requirements generation
- Document update and versioning workflows
- Quality and consistency validation
- Error handling and edge cases

### 4. CLI End-to-End Tests (`src/__tests__/e2e/maestro/steering-cli.test.ts`)

**Location**: `src/__tests__/e2e/maestro/steering-cli.test.ts`

End-to-end tests for CLI command functionality (simulated for current implementation).

**CLI Commands Tested**:
- `maestro init-steering <domain>` - Create steering documents
- `maestro create-spec <feature>` - Create specs with steering integration
- Complete workflow integration
- Error handling and validation
- Performance and usability

### 5. Performance Tests (`src/__tests__/performance/maestro/steering-performance.test.ts`)

**Location**: `src/__tests__/performance/maestro/steering-performance.test.ts`

Performance benchmarks and scalability testing for steering document operations.

**Performance Metrics**:
- Single document creation: <100ms
- Bulk operations: 10 documents <1s
- Context retrieval: <50ms
- Memory usage: <50MB for 100 documents
- Concurrent operations support
- Stress testing with 200+ operations

## Running the Tests

### 1. Run Comprehensive Test Suite

```bash
# Run the complete standalone test
node test-maestro-steering-complete.js
```

This will execute all 5 test suites and provide a comprehensive report.

### 2. Run Jest Unit Tests

```bash
# Run all steering-related unit tests
npm test -- --testPathPattern=steering

# Run specific test file
npm test src/__tests__/unit/maestro/steering-documents.test.ts
```

### 3. Run Integration Tests

```bash
# Run integration tests
npm test src/__tests__/integration/maestro/steering-workflow.test.ts
```

### 4. Run Performance Tests

```bash
# Run performance benchmarks
npm test src/__tests__/performance/maestro/steering-performance.test.ts
```

### 5. Run All Tests

```bash
# Run complete test suite
npm test
```

## Test Coverage

### Domains Tested
- **Product**: Product vision and strategy guidelines
- **Tech**: Technology standards and development practices  
- **Structure**: Project organization and file structure
- **Security**: Security guidelines and best practices
- **Custom**: Custom domain-specific guidelines

### Scenarios Covered
- ✅ Basic steering document creation
- ✅ Template structure validation
- ✅ Agent reuse system integration
- ✅ Complete workflow execution
- ✅ Format and standards compliance
- ✅ Error handling and validation
- ✅ Performance benchmarks
- ✅ CLI command simulation
- ✅ Concurrent operations
- ✅ Large content handling

### Quality Metrics
- **Template Structure**: >80% required sections present
- **Agent Reuse Rate**: >30% for repeated operations
- **Workflow Success**: >80% end-to-end completion
- **Format Compliance**: >80% markdown standards
- **Performance**: <100ms single operations, <1s bulk operations

## Expected Test Results

When all tests pass, you should see output like:

```
🧪 COMPREHENSIVE MAESTRO STEERING DOCUMENT TESTS
═══════════════════════════════════════════════

📋 TEST 1: Basic steering document creation
✅ product: Created and validated (2847 chars)
✅ tech: Created and validated (3156 chars)
✅ structure: Created and validated (2934 chars)
✅ security: Created and validated (3421 chars)
✅ custom-domain: Created and validated (1876 chars)

🎨 TEST 2: Steering document templates and structure
✅ product: Template score 95.0% (4/4 sections, 3/3 keywords)
✅ tech: Template score 90.0% (4/4 sections, 3/3 keywords)
✅ structure: Template score 100.0% (4/4 sections, 3/3 keywords)
✅ security: Template score 95.0% (4/4 sections, 3/3 keywords)

🤖 TEST 3: Agent integration and reuse system
✅ Sequential steering creation: 6 agents, 50.0% reuse, 284ms
✅ Parallel steering workflows: 6 agents, 50.0% reuse, 156ms
✅ Mixed domain workflows: 4 agents, 0.0% reuse, 98ms

🔄 TEST 4: Complete steering workflow end-to-end
✅ Complete Project Setup: 5/5 steps successful, 423ms total
✅ Security-Focused Development: 3/3 steps successful, 167ms total

📝 TEST 5: Format and standards validation
✅ Markdown format validation: 100.0% pass rate
✅ Required sections presence: 100.0% pass rate
✅ Agent context inclusion: 100.0% pass rate
✅ Content quality standards: 100.0% pass rate

🎯 Final Score: 5/5 validations passed

🎉 ALL STEERING TESTS PASSED! Maestro steering document generation is working perfectly.
```

## Implementation Status

### ✅ Completed
- Comprehensive test framework with 5 major test suites
- Unit tests with Jest integration
- Integration tests with real file operations
- Performance benchmarks and scalability testing
- CLI command simulation and validation
- Mock implementations for isolated testing
- Format and standards validation
- Agent integration testing
- Error handling and edge case coverage

### 🔄 In Progress
- Performance optimization based on benchmark results
- Additional CLI command integration

### 📋 Future Enhancements
- Integration with actual CLI commands when available
- Additional domain-specific template tests
- Automated performance regression detection
- Test result visualization and reporting

## Contributing

When adding new steering document functionality:

1. **Add Unit Tests**: Create tests in `src/__tests__/unit/maestro/`
2. **Add Integration Tests**: Add workflow tests in `src/__tests__/integration/maestro/`
3. **Update Performance Tests**: Add benchmarks for new operations
4. **Update Comprehensive Test**: Add scenarios to `test-maestro-steering-complete.js`
5. **Document Changes**: Update this README with new test coverage

## Troubleshooting

### Common Issues

1. **File System Permissions**: Ensure test has write access to temporary directories
2. **Mock Dependencies**: Verify all dependencies are properly mocked for unit tests
3. **Async Operations**: Ensure all async operations are properly awaited
4. **Cleanup**: Verify test cleanup removes temporary files and directories

### Debug Mode

Run tests with additional logging:

```bash
# Enable debug logging
DEBUG=maestro:* npm test

# Run with verbose output  
npm test -- --verbose
```

This comprehensive test suite ensures that the Maestro steering document generation functionality works correctly, maintains high quality standards, and integrates properly with the agent reuse system.