/**
 * Custom Jest Test Sequencer for Vision-to-Code Integration Tests
 * Orders tests by priority and dependencies
 */

const Sequencer = require('@jest/test-sequencer').default;

class VisionToCodeTestSequencer extends Sequencer {
  sort(tests) {
    // Define test execution order based on dependencies and priority
    const testOrder = [
      // 1. Unit tests first (fastest, no dependencies)
      'unit',
      
      // 2. Individual service integration tests
      'claude-zen-service.test.js',
      
      // 3. Service communication tests
      'api-gateway.test.js',
      
      // 4. End-to-end workflow tests
      'full-workflow.test.js',
      
      // 5. Performance tests (resource intensive)
      'load-test.js',
      
      // 6. Security tests (may affect other tests)
      'security',
      'owasp.test.js'
    ];

    // Sort tests according to the defined order
    const sortedTests = tests.sort((testA, testB) => {
      const getTestPriority = (test) => {
        const testPath = test.path;
        
        // Find matching pattern in testOrder
        for (let i = 0; i < testOrder.length; i++) {
          if (testPath.includes(testOrder[i])) {
            return i;
          }
        }
        
        // Unknown tests go last
        return testOrder.length;
      };

      const priorityA = getTestPriority(testA);
      const priorityB = getTestPriority(testB);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort alphabetically
      return testA.path.localeCompare(testB.path);
    });

    console.log('📋 Test execution order:');
    sortedTests.forEach((test, index) => {
      const fileName = test.path.split('/').pop();
      console.log(`  ${index + 1}. ${fileName}`);
    });

    return sortedTests;
  }

  allFailedTests(tests) {
    // Run failed tests first on retry
    return tests.filter(test => test.failureCount > 0);
  }
}

module.exports = VisionToCodeTestSequencer;