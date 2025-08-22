/**
 * @fileoverview Integration Test for SAFe 6.0 Development Manager Cross-Package Integration
 *
 * Tests the integration between:
 * - SPARC package (SAFe 6.0 Development Manager)
 * - Development facade
 * - Safe-framework package
 * - TaskMaster AGUI integration
 * - Brain package coordination
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('safe6-integration-test');

async function testSafe6CrossPackageIntegration(): Promise<{
  success: boolean;
  results: Record<string, any>;
  errors: string[];
}> {
  const results: Record<string, any> = {};
  const errors: string[] = [];

  try {
    logger.info('🧪 Starting SAFe 6.0 cross-package integration test...');

    // Test 1: Development Facade Integration
    logger.info('📦 Testing development facade integration...');
    try {
      const { getSafe6DevelopmentManager, createSafe6SolutionTrainManager } =
        await import('@claude-zen/development');

      const Safe6DevelopmentManagerClass = await getSafe6DevelopmentManager();
      const manager = new Safe6DevelopmentManagerClass({
        managerId: 'facade-test-manager',
        mode: 'flow-system',
        assignedSolutionTrain: 'facade-test-train',
        assignedART: 'facade-test-art',
        flowSystems: [],
        solutionTrains: [],
        teams: [],
        features: {
          flowOptimization: true,
          businessAgilityMetrics: true,
          solutionTrainCoordination: true,
        },
      });

      await manager.initialize();
      results.developmentFacade = { status: 'success', manager: !!manager };
      logger.info('✅ Development facade integration working');
    } catch (error) {
      const errorMsg = `Development facade integration failed: ${error}`;
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.developmentFacade = { status: 'failed', error: String(error) };
    }

    // Test 2: Safe Framework Integration
    logger.info('🔐 Testing safe framework integration...');
    try {
      const { getSafeFramework } = await import('@claude-zen/enterprise');
      const safeFramework = await getSafeFramework();
      results.safeFramework = { status: 'success', framework: !!safeFramework };
      logger.info('✅ Safe framework integration working');
    } catch (error) {
      const errorMsg = `Safe framework integration failed: ${error}`;
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.safeFramework = { status: 'failed', error: String(error) };
    }

    // Test 3: Brain Package Coordination
    logger.info('🧠 Testing brain package coordination...');
    try {
      const { getBrainSystem } = await import('@claude-zen/intelligence');
      const brainSystem = await getBrainSystem();
      const coordinator = brainSystem.createCoordinator();

      // Test SAFe 6.0 coordination if the method exists
      if (
        coordinator &&
        typeof coordinator.coordinateWithSafe6 === 'function'
      ) {
        const coordination = await coordinator.coordinateWithSafe6({
          epicId: 'test-epic-123',
          neuralTaskType: 'analysis',
          context: { testMode: true },
        });
        results.brainCoordination = {
          status: 'success',
          coordinator: !!coordinator,
          safe6Method: true,
          coordination: !!coordination,
        };
        logger.info('✅ Brain SAFe 6.0 coordination working');
      } else {
        results.brainCoordination = {
          status: 'partial',
          coordinator: !!coordinator,
          safe6Method: false,
          note: 'Brain coordinator available but SAFe 6.0 method not found',
        };
        logger.warn(
          '⚠️ Brain coordinator available but SAFe 6.0 method not found'
        );
      }
    } catch (error) {
      const errorMsg = `Brain coordination failed: ${error}`;
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.brainCoordination = { status: 'failed', error: String(error) };
    }

    // Test 4: SPARC SAFe 6.0 Development Manager Direct
    logger.info('🎯 Testing SPARC SAFe 6.0 Development Manager directly...');
    try {
      const { Safe6DevelopmentManager } = await import(
        './safe6-development-manager'
      );

      const manager = new Safe6DevelopmentManager({
        managerId: 'test-manager-123',
        mode: 'flow-system',
        assignedSolutionTrain: 'test-solution-train',
        assignedART: 'test-art',
        flowSystems: [
          {
            id: 'test-flow-system',
            name: 'Test Flow System',
            valueStreams: ['test-value-stream'],
            teams: ['test-team'],
            metrics: {
              flowEfficiency: 0.8,
              flowVelocity: 0.75,
              flowTime: 0.9,
              flowLoad: 0.6,
              flowPredictability: 0.85,
              flowDistribution: 0.7,
            },
          },
        ],
        solutionTrains: [
          {
            id: 'test-solution-train',
            name: 'Test Solution Train',
            arts: ['test-art'],
            supplier: {
              id: 'test-supplier',
              name: 'Test Supplier',
              capabilities: ['development'],
            },
            customer: {
              id: 'test-customer',
              name: 'Test Customer',
              segments: ['enterprise'],
            },
          },
        ],
        teams: [
          {
            type: 'stream-aligned',
            id: 'test-team',
            name: 'Test Team',
            flowMetrics: {
              flowEfficiency: 0.8,
              flowVelocity: 0.75,
              flowTime: 0.9,
              flowLoad: 0.6,
              flowPredictability: 0.85,
              flowDistribution: 0.7,
            },
          },
        ],
        features: {
          flowOptimization: true,
          businessAgilityMetrics: true,
          solutionTrainCoordination: true,
          portfolioFlowAlignment: true,
          devSecOpsFlow: true,
          continuousFlowDelivery: true,
          enterpriseAgility: true,
        },
      });

      await manager.initialize();

      // Test flow metrics
      const flowMetrics = await manager.getFlowMetrics('test-epic-123');

      results.sparcDirect = {
        status: 'success',
        manager: !!manager,
        flowMetrics: !!flowMetrics,
      };
      logger.info('✅ SPARC SAFe 6.0 Development Manager working directly');
    } catch (error) {
      const errorMsg = `SPARC direct test failed: ${error}`;
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.sparcDirect = { status: 'failed', error: String(error) };
    }

    // Test 5: TaskMaster Integration Test (Simple)
    logger.info('📋 Testing TaskMaster integration...');
    try {
      // Test that the imports work
      const taskMasterIntegration = await import(
        '../../taskmaster/src/integrations/safe-framework-integration'
      );

      results.taskMasterIntegration = {
        status: 'success',
        integration:
          !!taskMasterIntegration.default||!!taskMasterIntegration.SafeFrameworkIntegration,
      };
      logger.info('✅ TaskMaster integration imports working');
    } catch (error) {
      const errorMsg = `TaskMaster integration test failed: ${error}`;
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.taskMasterIntegration = {
        status: 'failed',
        error: String(error),
      };
    }

    // Summary
    const successCount = Object.values(results).filter(
      (r) => r.status === 'success'
    ).length;
    const totalTests = Object.keys(results).length;
    const success = errors.length === 0 && successCount === totalTests;

    logger.info(
      `🎯 Integration test complete: ${successCount}/${totalTests} tests passed`
    );

    if (success) {
      logger.info(
        '🎉 All SAFe 6.0 cross-package integrations working correctly!'
      );
    } else {
      logger.warn(`⚠️ Some integration issues found: ${errors.length} errors`);
    }

    return { success, results, errors };
  } catch (error) {
    const errorMsg = `Integration test failed: ${error}`;
    errors.push(errorMsg);
    logger.error(errorMsg);

    return {
      success: false,
      results: { testFramework: { status: 'failed', error: String(error) } },
      errors,
    };
  }
}

// Export for testing
export { testSafe6CrossPackageIntegration };

// Run test if executed directly
if (require.main === module) {
  testSafe6CrossPackageIntegration()
    .then((result) => {
      console.log('\n📊 Integration Test Results:');
      console.log('Success:', result.success);
      console.log('Results:', JSON.stringify(result.results, null, 2));

      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach((error) => console.log(`  - ${error}`));
      }

      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Integration test failed:', error);
      process.exit(1);
    });
}
