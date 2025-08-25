/**
 * @fileoverview Simple Integration Test for SAFe 6.0 Development Manager
 *
 * Tests the core SPARC SAFe 6.0 Development Manager functionality
 * to verify our SAFe 6.0 integration is working correctly.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('simple-safe6-test');'

async function testSafe6Core(): Promise<{
  success: boolean;
  results: Record<string, any>;
  errors: string[];
}> {
  const results: Record<string, any> = {};
  const errors: string[] = [];

  try {
    logger.info('🧪 Starting simple SAFe 6.0 core integration test...');'

    // Test 1: Basic SPARC SAFe 6.0 Development Manager
    logger.info('🎯 Testing SPARC SAFe 6.0 Development Manager...');'
    try {
      const { Safe6DevelopmentManager } = await import(
        './safe6-development-manager''
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
      const flowMetrics = await manager.getFlowMetrics('test-epic-123');'

      // Test business agility assessment
      const businessAgility = await manager.assessBusinessAgility();

      // Test solution train coordination
      const solutionTrainStatus = await manager.getSolutionTrainStatus(
        'test-solution-train''
      );

      results.safe6Manager = {
        status: 'success',
        manager: !!manager,
        flowMetrics: !!flowMetrics,
        businessAgility: !!businessAgility,
        solutionTrainStatus: !!solutionTrainStatus,
      };
      logger.info('✅ SPARC SAFe 6.0 Development Manager working correctly');'
    } catch (error) {
      const errorMsg = `SPARC SAFe 6.0 test failed: ${error}`;`
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.safe6Manager = { status: 'failed', error: String(error) };'
    }

    // Test 2: SAFe-SPARC Workflow Integration
    logger.info('🔄 Testing SAFe-SPARC workflow integration...');'
    try {
      const { SafeSparcWorkflow } = await import('./core/safe-sparc-workflow');'

      const workflow = new SafeSparcWorkflow({
        workflowId: 'test-workflow-123',
        sparc: {
          enabled: true,
          phases: [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
          ],
        },
        safe: {
          epicId: 'test-epic-123',
          programIncrementId: 'PI-2024-Q4',
          artId: 'test-art',
          solutionTrainId: 'test-solution-train',
        },
      });

      await workflow.initialize();

      results.safeSparcWorkflow = {
        status: 'success',
        workflow: !!workflow,
      };
      logger.info('✅ SAFe-SPARC workflow integration working');'
    } catch (error) {
      const errorMsg = `SAFe-SPARC workflow test failed: ${error}`;`
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.safeSparcWorkflow = { status: 'failed', error: String(error) };'
    }

    // Test 3: Index Exports
    logger.info('📦 Testing SPARC package exports...');'
    try {
      const sparcExports = await import('./index');'

      const hasRequired = !!(
        sparcExports.Safe6DevelopmentManager &&
        sparcExports.createSafe6DevelopmentManager &&
        sparcExports.createSafe6SolutionTrainManager &&
        sparcExports.createSafe6BusinessAgilityManager
      );

      results.sparcExports = {
        status: hasRequired ? 'success' : 'partial',
        exports: {
          Safe6DevelopmentManager: !!sparcExports.Safe6DevelopmentManager,
          createSafe6DevelopmentManager:
            !!sparcExports.createSafe6DevelopmentManager,
          createSafe6SolutionTrainManager:
            !!sparcExports.createSafe6SolutionTrainManager,
          createSafe6BusinessAgilityManager:
            !!sparcExports.createSafe6BusinessAgilityManager,
        },
      };

      if (hasRequired) {
        logger.info('✅ SPARC package exports working correctly');'
      } else {
        logger.warn('⚠️ Some SPARC exports missing or failed');'
      }
    } catch (error) {
      const errorMsg = `SPARC exports test failed: ${error}`;`
      errors.push(errorMsg);
      logger.error(errorMsg);
      results.sparcExports = { status: 'failed', error: String(error) };'
    }

    // Summary
    const successCount = Object.values(results).filter(
      (r) => r.status === 'success''
    ).length;
    const totalTests = Object.keys(results).length;
    const success = errors.length === 0 && successCount === totalTests;

    logger.info(
      `🎯 Integration test complete: ${successCount}/${totalTests} tests passed``
    );

    if (success) {
      logger.info('🎉 All SPARC SAFe 6.0 integrations working correctly!');'
    } else {
      logger.warn(`⚠️ Some integration issues found: ${errors.length} errors`);`
    }

    return { success, results, errors };
  } catch (error) {
    const errorMsg = `Integration test failed: ${error}`;`
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
export { testSafe6Core };

// Run test if executed directly
if (require.main === module) {
  testSafe6Core()
    .then((result) => {
      console.log('\n📊 Simple Integration Test Results:');'
      console.log('Success:', result.success);'
      console.log('Results:', JSON.stringify(result.results, null, 2));'

      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');'
        result.errors.forEach((error) => console.log(`  - ${error}`));`
      }

      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Simple integration test failed:', error);'
      process.exit(1);
    });
}
