# Steering Document Test Framework

A comprehensive, standalone test framework for validating steering document generation functionality in Claude-Flow, independent of the main build system.

## 🎯 Features

- **Complete Test Coverage**: Unit tests, integration tests, quality validation, and performance benchmarks
- **Standalone Operation**: Tests work independently of main build system issues
- **Mock Data Generation**: Realistic test scenarios across multiple domains
- **Quality Validation**: NLP-powered content analysis and format validation  
- **Agent Reuse Testing**: Validates agent pool management and reuse mechanisms
- **Error Handling**: Comprehensive error scenario testing and recovery validation
- **Performance Benchmarks**: Load testing and throughput analysis
- **Multiple Report Formats**: Console, JSON, and HTML reporting

## 🏗️ Architecture

```
tests/steering/
├── steering-test-framework.js     # Main test harness with mock orchestrator
├── steering-integration-tests.js  # End-to-end integration testing
├── steering-quality-validator.js  # Document quality validation engine
├── steering-mock-data.js         # Test data generation and scenarios
├── run-tests.js                  # Comprehensive test runner
├── package.json                  # Dependencies and npm scripts
└── README.md                     # This documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- No external dependencies required for basic functionality
- Optional: `natural` package for advanced NLP analysis

### Installation

```bash
# Navigate to test directory
cd tests/steering

# Install dependencies (optional for enhanced features)
npm install

# Run all tests
npm test
```

### Basic Usage

```bash
# Run all test suites
npm run test

# Run specific test suites
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:quality      # Quality validation only
npm run test:performance  # Performance benchmarks only

# Run with different configurations
npm run test:parallel     # Parallel execution
npm run test:sequential   # Sequential execution
npm run test:verbose      # Verbose output
npm run test:json         # JSON report output
npm run test:html         # HTML report output
```

## 📊 Test Suites

### 1. Unit Tests (`steering-test-framework.js`)

Tests core steering document generation functionality:

- ✅ Basic steering document creation
- ✅ Multiple domain document generation
- ✅ Document quality validation
- ✅ Format compliance checking
- ✅ Agent reuse mechanisms
- ✅ Error handling scenarios
- ✅ Performance benchmarks
- ✅ Mock scenario integration

**Example Output:**
```
🧪 STEERING DOCUMENT GENERATION TEST FRAMEWORK
================================
✅ Basic Steering Creation (145ms)
✅ Multiple Domain Steering (312ms)
✅ Document Quality Validation (89ms)
✅ Format Validation (67ms)
✅ Agent Reuse Validation (234ms)
✅ Error Handling (123ms)
✅ Performance Benchmarks (456ms)
✅ Mock Scenarios Integration (678ms)

📊 Summary: 8/8 passed (0 failed, 0 skipped)
⏱️ Total Duration: 2104ms
🚀 Success Rate: 100.0%
```

### 2. Integration Tests (`steering-integration-tests.js`)

End-to-end workflow validation:

- 🔄 Complete steering document workflow
- 📄 Real document compatibility validation
- ⚡ Concurrent document generation
- 🛡️ Error recovery and resilience
- 🚀 Performance under load
- 👥 Agent pool integration
- 💾 Memory and resource management

**Example Output:**
```
🧪 STEERING DOCUMENT INTEGRATION TESTS
=====================================
📋 Testing end-to-end steering workflow...
  ✅ e2e-workflow:e2e-product (187ms)
  ✅ e2e-workflow:e2e-technical (203ms)
  ✅ e2e-workflow:e2e-security (156ms)

⚡ Testing concurrent document generation...
  ✅ concurrent-generation:batch-0 (445ms)
  ✅ concurrent-generation:batch-1 (398ms)

📊 Summary: 12/12 passed (0 failed)
🚀 Success Rate: 100.0%
```

### 3. Quality Validation (`steering-quality-validator.js`)

Advanced document quality analysis:

- **Format Validation**: Structure, headers, sections
- **Completeness Analysis**: Domain-specific requirements
- **Clarity Assessment**: Readability and language analysis
- **Specificity Checking**: Actionable vs. vague content
- **Consistency Validation**: Terminology and formatting

**Quality Scoring:**
- **Excellent**: ≥90% - Production ready
- **Good**: ≥75% - Minor improvements needed  
- **Acceptable**: ≥60% - Requires revision
- **Poor**: ≥45% - Significant issues
- **Unacceptable**: <45% - Complete rewrite needed

### 4. Performance Benchmarks

Load testing across different scenarios:

| Configuration | Documents | Concurrency | Max Time | Target Throughput |
|--------------|-----------|-------------|----------|-------------------|
| Lightweight  | 5         | 1           | 1s       | 5+ docs/sec       |
| Standard     | 20        | 3           | 5s       | 4+ docs/sec       |
| Stress       | 100       | 10          | 30s      | 3+ docs/sec       |

## 🧪 Mock Data System

The framework includes comprehensive mock data generation:

### Domain Templates

Pre-built templates for common steering document types:

- **Product**: Vision, UX standards, prioritization
- **Technical**: Architecture, technology stack, performance
- **Workflow**: Process standards, quality gates, procedures
- **Security**: Compliance, controls, audit requirements
- **Performance**: Metrics, optimization, monitoring

### Scenario Generation

```javascript
import { generateSteeringScenarios } from './steering-mock-data.js';

// Generate 50 diverse test scenarios
const scenarios = generateSteeringScenarios(50);

// Each scenario includes:
// - Unique domain and content
// - Expected complexity level
// - Required agent types
// - Quality expectations
```

### Error Scenarios

Comprehensive error condition testing:

- Invalid input validation
- Edge case handling
- Resource constraint scenarios
- Network timeout simulation
- File system error conditions

## 🔧 Configuration

### Environment Variables

```bash
# Test execution
TEST_PARALLEL=true|false       # Enable/disable parallel execution
TEST_TIMEOUT=300000            # Test timeout in milliseconds
TEST_RETRIES=1                 # Number of retry attempts
TEST_BAIL=true|false          # Stop on first failure

# Output configuration  
TEST_REPORT_FORMAT=console|json|html  # Report format
TEST_VERBOSE=true|false       # Verbose output
TEST_COVERAGE=true|false      # Enable coverage analysis
TEST_FILTER=pattern           # Filter tests by pattern
```

### Framework Configuration

```javascript
const TEST_CONFIG = {
  maxTestDuration: 30000,    // 30 seconds per test
  retryAttempts: 3,          // Retry failed tests
  parallelTests: true,       // Enable parallel execution
  tempDir: './temp',         // Temporary files directory
  mockSteeringDir: './mock-steering'  // Mock documents
};
```

## 📈 Quality Metrics

### Document Quality Scoring

Quality scores are calculated using weighted components:

- **Format** (25%): Document structure and formatting
- **Completeness** (30%): Required sections and content depth
- **Clarity** (20%): Language clarity and readability
- **Specificity** (15%): Actionable vs. vague content
- **Consistency** (10%): Internal consistency and coherence

### Performance Metrics

Key performance indicators tracked:

- **Throughput**: Documents generated per second
- **Response Time**: Average time per document
- **Resource Usage**: Memory and CPU utilization
- **Error Rate**: Percentage of failed generations
- **Agent Efficiency**: Pool utilization and reuse rates

## 🛠️ Extending the Framework

### Adding New Test Cases

```javascript
// Add to steering-test-framework.js
async testCustomScenario() {
  const domain = 'custom-test';
  const content = 'Custom test content for validation.';
  
  const steeringPath = await this.orchestrator.createSteeringDocument(domain, content);
  
  // Add custom validations
  const fileContent = await readFile(steeringPath, 'utf8');
  if (!fileContent.includes('custom requirement')) {
    throw new Error('Custom requirement not met');
  }
}
```

### Custom Quality Rules

```javascript
// Extend steering-quality-validator.js
class CustomQualityValidator extends SteeringQualityValidator {
  validateCustomRequirements(content, issues) {
    // Add custom validation logic
    if (!content.includes('mandatory requirement')) {
      issues.push({
        type: 'custom',
        severity: 'high', 
        message: 'Missing mandatory requirement',
        suggestion: 'Add mandatory requirement section'
      });
    }
  }
}
```

### New Mock Scenarios

```javascript
// Add to steering-mock-data.js
export const CUSTOM_SCENARIOS = [
  {
    id: 'custom-scenario-1',
    domain: 'custom',
    content: 'Custom domain specific content...',
    complexity: 'high',
    agents: ['custom-agent-type']
  }
];
```

## 🚨 Troubleshooting

### Common Issues

**1. Tests timeout or hang**
```bash
# Increase timeout
TEST_TIMEOUT=600000 npm test

# Run sequentially
npm run test:sequential
```

**2. Mock data generation fails**
```bash
# Verify mock data system
npm run mock-data

# Clean temporary files
npm run clean
```

**3. Quality validation errors**
```bash
# Test validator independently
npm run validate

# Run without NLP features
TEST_NLP=false npm test
```

**4. Memory issues during stress testing**
```bash
# Run with garbage collection
node --expose-gc run-tests.js performance

# Reduce concurrent load
TEST_CONCURRENT=2 npm run test:performance
```

### Debug Mode

Enable verbose output for detailed debugging:

```bash
TEST_VERBOSE=true npm test
```

This provides:
- Detailed test execution logs
- Performance timing information
- Mock data generation details
- Quality validation breakdown
- Agent pool statistics

## 📋 Test Results

### Sample Console Output

```
🧪 STEERING DOCUMENT TEST RUNNER
================================
🔧 Configuration:
   • Parallel execution: true
   • Coverage analysis: false
   • Bail on failure: false
   • Timeout: 300000ms
   • Report format: console

🚀 Starting Unit Tests...
✅ Unit Tests completed (2104ms)

🚀 Starting Integration Tests...
✅ Integration Tests completed (8743ms)

🚀 Starting Quality Validation...
✅ Quality Validation completed (1234ms)

🚀 Starting Performance Benchmarks...
✅ Performance Benchmarks completed (15678ms)

================================================================================
📊 TEST EXECUTION SUMMARY
================================================================================
🔢 Total Tests: 156
✅ Passed: 156
❌ Failed: 0
⏭️ Skipped: 0
⏱️ Duration: 27759ms
🎯 Success Rate: 100.0%

📋 Suite Breakdown:
   ✅ Unit Tests: 8/8 passed (2104ms)
   ✅ Integration Tests: 12/12 passed (8743ms)  
   ✅ Quality Validation: 20/20 passed (1234ms)
   ✅ Performance Benchmarks: 3/3 passed (15678ms)

⚡ Performance Summary:
   • lightweight: 5.23 docs/sec, 191ms avg
   • standard: 4.12 docs/sec, 243ms avg
   • stress: 3.45 docs/sec, 290ms avg

🎉 All tests passed!
```

### HTML Report Features

The HTML report includes:
- Interactive test results dashboard
- Performance charts and graphs
- Detailed error information with stack traces
- Quality score breakdowns
- Agent pool utilization statistics
- Exportable results data

## 🤝 Contributing

To contribute to the steering test framework:

1. **Add Test Cases**: Extend existing test suites with new scenarios
2. **Improve Quality Rules**: Enhance validation logic for better accuracy
3. **Performance Optimization**: Optimize test execution and resource usage
4. **Documentation**: Update documentation for new features
5. **Bug Reports**: Report issues with detailed reproduction steps

## 📚 API Reference

### SteeringTestFramework

Main test harness class with mock orchestrator:

```javascript
const framework = new SteeringTestFramework();
await framework.setup();
const success = await framework.runAllTests();
await framework.cleanup();
```

### SteeringQualityValidator

Document quality validation engine:

```javascript
const validator = new SteeringQualityValidator({ enableNLP: true });
const validation = await validator.validateDocument(content, domain, 'standard');
console.log(`Quality Score: ${validation.overallScore}`);
```

### Mock Data Generation

Generate test scenarios and data:

```javascript
import { generateSteeringScenarios, generateMockAgents } from './steering-mock-data.js';

const scenarios = generateSteeringScenarios(10);
const agents = generateMockAgents(5);
```

## 📄 License

MIT License - see LICENSE file for details.

---

**🧪 Steering Document Test Framework v1.0.0**  
*Comprehensive testing for Claude-Flow steering document generation*