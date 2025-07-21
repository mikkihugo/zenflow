# Vision-to-Code Integration Test Suite

Comprehensive integration tests for the Vision-to-Code system covering all services, workflows, and scenarios.

## Test Structure

```
tests/vision-to-code/
├── unit/                    # Unit tests for individual components
│   ├── services/           # Service-level unit tests
│   ├── utils/              # Utility function tests
│   └── models/             # Data model tests
├── integration/            # Integration tests for service communication
│   ├── api-gateway.test.js # API Gateway integration tests
│   ├── services/           # Service-to-service tests
│   └── database/           # Database integration tests
├── e2e/                    # End-to-end tests
│   ├── full-flow.test.js   # Complete user journey tests
│   ├── mobile/             # Mobile-specific E2E tests
│   └── desktop/            # Desktop-specific E2E tests
├── performance/            # Performance and load tests
│   ├── load-test.js        # K6 load testing scripts
│   ├── stress-test.js      # Stress testing scenarios
│   └── benchmarks/         # Performance benchmarks
├── security/               # Security tests
│   ├── owasp.test.js       # OWASP Top 10 security tests
│   ├── penetration/        # Penetration testing
│   └── vulnerability/      # Vulnerability scanning
├── fixtures/               # Test data and fixtures
│   ├── mock-data.js        # Mock data for tests
│   ├── images/             # Test images
│   └── responses/          # Mock API responses
└── utils/                  # Test utilities
    ├── test-helpers.js     # Common test helper functions
    ├── test-db.js          # Test database utilities
    └── metrics.js          # Performance metrics collection
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Performance Tests
```bash
npm run test:performance
```

### Security Tests
```bash
npm run test:security
```

### With Coverage
```bash
npm run test:coverage
```

## Test Categories

### 1. Unit Tests (Target: 98% Coverage)
- Individual function testing
- Component isolation
- Mock external dependencies
- Fast execution (<5s total)

### 2. Integration Tests (Target: 95% Coverage)
- Service communication
- API endpoint testing
- Database operations
- Authentication flows

### 3. End-to-End Tests (Target: 90% Coverage)
- Complete user workflows
- UI interaction testing
- Cross-browser compatibility
- Mobile responsiveness

### 4. Performance Tests
- Load testing (1,000-10,000 concurrent users)
- Stress testing
- Spike testing
- Response time validation (<100ms P95)

### 5. Security Tests
- OWASP Top 10 coverage
- Authentication testing
- Authorization validation
- Input validation
- XSS/CSRF protection

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Unit Test Coverage | 98% | - |
| Integration Test Coverage | 95% | - |
| E2E Test Coverage | 90% | - |
| API Response Time (P95) | <100ms | - |
| Test Suite Execution | <5 min | - |
| CI/CD Pipeline | <10 min | - |

## Writing Tests

### Unit Test Example
```javascript
describe('VisionAnalysisService', () => {
  it('should analyze image successfully', async () => {
    const mockImage = await TestHelpers.createMockImage();
    const result = await visionService.analyzeImage(mockImage);
    
    expect(result).toHaveProperty('components');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
```

### Integration Test Example
```javascript
describe('API Gateway Integration', () => {
  it('should handle image upload', async () => {
    const response = await request(app)
      .post('/api/v1/images/upload')
      .attach('image', 'test.png')
      .expect(200);
      
    expect(response.body.data).toHaveProperty('imageId');
  });
});
```

### E2E Test Example
```javascript
describe('Complete User Flow', () => {
  it('should generate code from image', async () => {
    await page.goto('http://localhost:3000');
    await page.setInputFiles('#image-upload', 'test.png');
    await page.click('#analyze-button');
    await page.waitForSelector('.code-output');
    
    const code = await page.textContent('.code-output');
    expect(code).toContain('export const');
  });
});
```

## Load Testing

### Running Load Tests
```bash
# Normal load test
k6 run tests/vision-to-code/performance/load-test.js

# Stress test
k6 run tests/vision-to-code/performance/load-test.js --env SCENARIO=stress

# Spike test
k6 run tests/vision-to-code/performance/load-test.js --env SCENARIO=spike
```

### Load Test Scenarios
1. **Normal Load**: 100 concurrent users for 5 minutes
2. **Peak Load**: 1,000 concurrent users for 10 minutes
3. **Stress Test**: 5,000 concurrent users for 15 minutes
4. **Spike Test**: Sudden increase to 10,000 users

## Security Testing

### OWASP Top 10 Coverage
- [x] A01: Broken Access Control
- [x] A02: Cryptographic Failures
- [x] A03: Injection
- [x] A04: Insecure Design
- [x] A05: Security Misconfiguration
- [x] A06: Vulnerable Components
- [x] A07: Authentication Failures
- [x] A08: Data Integrity Failures
- [x] A09: Security Logging Failures
- [x] A10: Server-Side Request Forgery

### Running Security Scans
```bash
# OWASP ZAP scan
npm run security:scan

# Dependency vulnerability check
npm run security:deps

# Full security audit
npm run security:audit
```

## Test Data Management

### Fixtures
- Mock images in various formats (PNG, JPG, WebP)
- Sample vision analysis results
- Code generation templates
- User authentication tokens

### Test Database
- Isolated test database
- Automatic cleanup after tests
- Seed data for consistent testing

## CI/CD Integration

### GitHub Actions Workflow
```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      test-type: [unit, integration, e2e, performance, security]
  steps:
    - uses: actions/checkout@v2
    - run: npm install
    - run: npm run test:${{ matrix.test-type }}
    - uses: codecov/codecov-action@v1
```

### Test Reports
- JUnit XML for CI integration
- HTML coverage reports
- Performance metrics dashboard
- Security scan results

## Monitoring Test Health

### Metrics Dashboard
Access the test metrics dashboard at: http://localhost:3001/test-dashboard

### Key Metrics
- Test execution time trends
- Coverage trends
- Flaky test detection
- Performance regression alerts

## Contributing

1. Write tests for all new features
2. Maintain >95% coverage
3. Ensure tests are deterministic
4. Use meaningful test descriptions
5. Follow the existing test patterns

## Troubleshooting

### Common Issues
1. **Flaky Tests**: Check for timing issues, use proper waits
2. **Slow Tests**: Profile and optimize, use parallel execution
3. **Coverage Gaps**: Add missing test cases
4. **Environment Issues**: Verify test database and services