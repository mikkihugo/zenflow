/**
 * @file Test suite for comprehensive-sparc-test.
 */

import { getLogger } from './config/logging-config';
import type {
  Priority,
  RiskLevel,
} from './coordination/swarm/sparc/types/sparc-types';
import type {
  TestResult,
  CommandResult,
  BaseApiResponse,
} from './coordination/types/interfaces';

const logger = getLogger('comprehensive-sparc-test');

/**
 * Comprehensive End-to-End Test for SPARC Pseudocode Engine (Sub-task 4.2).
 *
 * This test validates the complete implementation of SPARC Phase 2:
 * - Core pseudocode engine functionality
 * - CLI integration
 * - End-to-end specification → pseudocode flow.
 */

import { writeFile } from 'node:fs/promises';

async function runComprehensiveTest() {
  const results = {
    coreEngine: false,
    cliIntegration: false,
    endToEndFlow: false,
    overallSuccess: false,
  };

  try {
    const coreTest: TestResult = await testCoreEngine();
    results.coreEngine = coreTest.success;
    const cliTest: TestResult = await testCLIIntegration();
    results.cliIntegration = cliTest.success;
    const e2eTest: TestResult = await testEndToEndFlow();
    results.endToEndFlow = e2eTest.success;

    // Overall assessment
    results.overallSuccess = Object.values(results)
      .slice(0, -1)
      .every((r) => r);

    if (results.overallSuccess) {
    } else {
    }

    return results;
  } catch (error) {
    logger.error('💥 Comprehensive test failed:', error);
    return { ...results, overallSuccess: false };
  }
}

async function testCoreEngine() {
  try {
    const { PseudocodePhaseEngine } = await import(
      './coordination/swarm/sparc/phases/pseudocode/pseudocode-engine'
    );
    const engine = new PseudocodePhaseEngine();

    const testSpec = {
      id: 'comprehensive-test-spec',
      domain: 'swarm-coordination',
      functionalRequirements: [
        {
          id: 'req-001',
          title: 'Core Algorithm Test',
          description: 'Test core algorithm generation',
          type: 'algorithmic',
          priority: 'HIGH' as Priority,
          testCriteria: ['Algorithm generates correctly'],
        },
      ],
      nonFunctionalRequirements: [],
      constraints: [],
      assumptions: [],
      dependencies: [],
      acceptanceCriteria: [],
      riskAssessment: {
        risks: [],
        mitigationStrategies: [],
        overallRisk: 'LOW' as RiskLevel,
      },
      successMetrics: [],
    };

    // Test all core methods
    const algorithms = await engine.generateAlgorithmPseudocode(testSpec);
    const dataStructures = await engine.designDataStructures(
      testSpec.functionalRequirements
    );
    const controlFlows = await engine.mapControlFlows(algorithms);
    const validation = await engine.validatePseudocodeLogic(algorithms);
    const pseudocodeStructure = await engine.generatePseudocode(testSpec);

    const success: boolean =
      algorithms.length > 0 &&
      dataStructures.length > 0 &&
      controlFlows.length > 0 &&
      validation.length > 0 &&
      !!pseudocodeStructure.id;

    return {
      success,
      details: {
        algorithms: algorithms.length,
        dataStructures: dataStructures.length,
        controlFlows: controlFlows.length,
        validationResults: validation.length,
        pseudocodeGenerated: !!pseudocodeStructure.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as TestResult;
  }
}

async function testCLIIntegration() {
  try {
    // Create test spec file
    const testSpec = {
      id: 'cli-test-spec',
      domain: 'memory-systems',
      functionalRequirements: [
        {
          id: 'req-cli-001',
          title: 'CLI Memory Algorithm',
          description: 'Test memory algorithm via CLI',
          type: 'algorithmic',
          priority: 'HIGH' as Priority,
          testCriteria: ['CLI generation works'],
        },
      ],
      nonFunctionalRequirements: [],
      constraints: [],
      assumptions: [],
      dependencies: [],
      acceptanceCriteria: [],
      riskAssessment: {
        risks: [],
        mitigationStrategies: [],
        overallRisk: 'LOW' as RiskLevel,
      },
      successMetrics: [],
    };

    await writeFile(
      '/tmp/cli-test-spec.json',
      JSON.stringify(testSpec, null, 2)
    );

    // Import CLI command functions (simulate CLI usage)
    const { exec } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execAsync = promisify(exec);

    // Test CLI commands (simulate via direct execution)
    const generateCommand = `cd ${process.cwd()} && npx tsx src/sparc-pseudocode-cli.ts generate --spec-file /tmp/cli-test-spec.json --output /tmp/cli-test-output.json`;
    const validateCommand = `cd ${process.cwd()} && npx tsx src/sparc-pseudocode-cli.ts validate --pseudocode-file /tmp/cli-test-output.json`;

    const generateExecResult = await execAsync(generateCommand);
    const validateExecResult = await execAsync(validateCommand);
    
    const generateResult: CommandResult = {
      success: true,
      timestamp: new Date(),
      stdout: generateExecResult.stdout,
      stderr: generateExecResult.stderr
    };
    
    const validateResult: CommandResult = {
      success: true,
      timestamp: new Date(),
      stdout: validateExecResult.stdout,
      stderr: validateExecResult.stderr
    };

    const success: boolean =
      (generateResult?.stdout?.includes('✅ Pseudocode generation completed') ??
        false) &&
      (validateResult?.stdout?.includes('✅ APPROVED') ?? false);

    return {
      success,
      details: {
        generateOutput: generateResult?.stdout?.includes('Generated'),
        validateOutput: validateResult?.stdout?.includes('APPROVED'),
      },
    } as TestResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as TestResult;
  }
}

// MCP integration test removed - MCP was eliminated from architecture

async function testEndToEndFlow() {
  try {
    // Phase 1 Output (Specification)
    const phase1Output = {
      id: 'e2e-test-phase1-output',
      domain: 'general',
      functionalRequirements: [
        {
          id: 'req-e2e-001',
          title: 'E2E Data Processing',
          description: 'End-to-end data processing algorithm',
          type: 'algorithmic',
          priority: 'HIGH' as Priority,
          testCriteria: ['Processes data correctly', 'Handles edge cases'],
        },
        {
          id: 'req-e2e-002',
          title: 'E2E Validation',
          description: 'Data validation and error handling',
          type: 'algorithmic',
          priority: 'MEDIUM' as Priority,
          testCriteria: ['Validates input', 'Reports errors clearly'],
        },
      ],
      nonFunctionalRequirements: [
        {
          id: 'nf-e2e-001',
          title: 'Performance',
          description: 'System performance requirements',
          metrics: { latency: '<50ms', throughput: '>2000/sec' },
          priority: 'HIGH' as Priority,
        },
      ],
      constraints: [
        {
          id: 'const-e2e-001',
          type: 'performance' as const,
          description: 'Must process within time limits',
          impact: 'high' as const,
        },
      ],
      assumptions: [],
      dependencies: [],
      acceptanceCriteria: [],
      riskAssessment: {
        risks: [],
        mitigationStrategies: [],
        overallRisk: 'LOW' as RiskLevel,
      },
      successMetrics: [
        {
          id: 'metric-e2e-001',
          name: 'Processing Speed',
          description: 'Data processing performance',
          target: '2000 items/sec',
          measurement: 'automated testing',
        },
      ],
    };

    // Phase 2 Processing (Pseudocode Generation)
    const { PseudocodePhaseEngine } = await import(
      './coordination/swarm/sparc/phases/pseudocode/pseudocode-engine'
    );
    const engine = new PseudocodePhaseEngine();

    const phase2Output = await engine.generatePseudocode(phase1Output);

    // Validation
    const validation = await engine.validatePseudocode(phase2Output);

    // Quality checks
    const hasRequiredAlgorithms = phase2Output.algorithms.length >= 2; // One for each functional requirement
    const hasDataStructures = phase2Output.dataStructures.length > 0;
    const hasComplexityAnalysis = !!phase2Output.complexityAnalysis;
    const hasOptimizations = phase2Output.optimizations.length > 0;
    const validationPassed = validation.approved;

    const success: boolean =
      hasRequiredAlgorithms &&
      hasDataStructures &&
      hasComplexityAnalysis &&
      hasOptimizations &&
      validationPassed;

    return {
      success,
      details: {
        algorithmsGenerated: phase2Output.algorithms.length,
        dataStructuresGenerated: phase2Output.dataStructures.length,
        optimizationsIdentified: phase2Output.optimizations.length,
        complexityAnalysisPresent: hasComplexityAnalysis,
        validationScore: validation.overallScore,
        approved: validationPassed,
      },
    } as TestResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as TestResult;
  }
}

// Run the comprehensive test if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runComprehensiveTest().then((results) => {
    process.exit(results.overallSuccess ? 0 : 1);
  });
}

export { runComprehensiveTest };
