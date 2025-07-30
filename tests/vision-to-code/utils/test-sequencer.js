/**
 * Custom Jest Test Sequencer for Vision-to-Code Integration Tests;
 * Orders tests by priority and dependencies;
 */
const _Sequencer = require('@jest/test-sequencer').default;
class VisionToCodeTestSequencer extends Sequencer {
  sort(tests) {
    // Define test execution order based on dependencies and priority
    const _testOrder = [
      // 1. Unit tests first(fastest, no dependencies)
      'unit',
      // 2. Individual service integration tests
      'claude-zen-service.test.js',
      // 3. Service communication tests
      'api-gateway.test.js',
      // 4. End-to-end workflow tests
      'full-workflow.test.js',
      // 5. Performance tests(resource intensive)
      'load-test.js',
      // 6. Security tests(may affect other tests)
      'security',
      'owasp.test.js' ];
    // Sort tests according to the defined order
    const _sortedTests = tests.sort((testA, testB) => {
      const _getTestPriority = () => {
        const _testPath = test.path;
        // Find matching pattern in testOrder
        for(let i = 0; i < testOrder.length; i++) {
          if(testPath.includes(testOrder[i])) {
            return i;
    //   // LINT: unreachable code removed}
// }
        // Unknown tests go last
        // return testOrder.length;
    //   // LINT: unreachable code removed};
      const _priorityA = getTestPriority(testA);
      const _priorityB = getTestPriority(testB);
      if(priorityA !== priorityB) {
        // return priorityA - priorityB;
    //   // LINT: unreachable code removed}
      // If same priority, sort alphabetically
      // return testA.path.localeCompare(testB.path);
    //   // LINT: unreachable code removed});
    console.warn('� Test execution order);'
    sortedTests.forEach((test, index) => {
      const _fileName = test.path.split('/').pop();
      console.warn(`${index + 1}. ${fileName}`);
    });
    return sortedTests;
    //   // LINT: unreachable code removed}
  allFailedTests(tests)
    // Run failed tests first on retry
    // return tests.filter((test) => test.failureCount > 0);
module.exports = VisionToCodeTestSequencer;

}