/**
 * Global test teardown for Visionary integration tests
 * Cleans up test environment and stops services
 */

const fs = require('node:fs').promises;
const path = require('node:path');

module.exports = async () => {
  console.warn('🧹 Tearing down Visionary test environment...');

  try {
    // Clean up test workspace
    const testWorkspaceDir = process.env.TEST_WORKSPACE_DIR;
    if (testWorkspaceDir) {
      try {
        await fs.rmdir(testWorkspaceDir, { recursive: true });
        console.warn('✅ Test workspace cleaned up');
      } catch (error) {
        console.warn('⚠️ Failed to clean up test workspace:', error.message);
      }
    }

    // Clean up test database
    const testDbPath = process.env.TEST_DATABASE_PATH;
    if (testDbPath) {
      try {
        await fs.unlink(testDbPath);
        console.warn('✅ Test database cleaned up');
      } catch (error) {
        console.warn('⚠️ Failed to clean up test database:', error.message);
      }
    }

    // Generate final test report
    await generateTestReport();

    // Clean up environment variables
    delete process.env.VISIONARY_TEST_MODE;
    delete process.env.TEST_WORKSPACE_DIR;
    delete process.env.TEST_DATABASE_PATH;

    console.warn('✅ Visionary test environment teardown complete');
  } catch (error) {
    console.error('❌ Error during test teardown:', error);
    // Don't throw error to avoid breaking test results
  }
};

async function generateTestReport() {
  try {
    const reportDir = path.join(process.cwd(), 'tests/visionary/test-results');
    await fs.mkdir(reportDir, { recursive: true });

    const testSummary = {
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory_usage: process.memoryUsage(),
      },
      test_configuration: {
        test_mode: process.env.NODE_ENV,
        visionary_test_mode: process.env.VISIONARY_TEST_MODE,
        services_mocked: {
          business: !!process.env.BUSINESS_SERVICE_MOCKED,
          core: !!process.env.CORE_SERVICE_MOCKED,
          swarm: !!process.env.SWARM_SERVICE_MOCKED,
          development: !!process.env.DEVELOPMENT_SERVICE_MOCKED,
        },
      },
      notes: [
        'Integration tests completed',
        'Check individual test reports for detailed results',
        'Performance metrics available in load-test reports',
      ],
    };

    const summaryPath = path.join(reportDir, 'test-execution-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(testSummary, null, 2));

    console.warn(`📊 Test execution summary generated: ${summaryPath}`);
  } catch (error) {
    console.warn('⚠️ Failed to generate test report:', error.message);
  }
}
