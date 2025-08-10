/**
 * @file Test-pseudocode processing engine.
 */

import { getLogger } from './config/logging-config';

const logger = getLogger('test-pseudocode-engine');

/**
 * Simple manual test for SPARC Pseudocode Engine.
 * Tests core functionality without complex jest setup.
 */

import { PseudocodePhaseEngine } from './coordination/swarm/sparc/phases/pseudocode/pseudocode-engine';

async function testPseudocodeEngine() {
  const engine = new PseudocodePhaseEngine();

  // Test specification
  const specification: DetailedSpecification = {
    id: 'test-spec-001',
    domain: 'swarm-coordination',
    functionalRequirements: [
      {
        id: 'req-001',
        title: 'Agent Registration',
        description: 'Register agents in the swarm system',
        type: 'algorithmic',
        priority: 'HIGH',
        testCriteria: ['Agent gets unique ID', 'Agent capabilities recorded'],
      },
      {
        id: 'req-002',
        title: 'Task Distribution',
        description: 'Distribute tasks to available agents',
        type: 'algorithmic',
        priority: 'HIGH',
        testCriteria: ['Optimal agent selection', 'Load balancing'],
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
      overallRisk: 'LOW',
    },
    successMetrics: [],
  };

  try {
    const algorithms = await engine.generateAlgorithmPseudocode(specification);
    const dataStructures = await engine.designDataStructures(specification.functionalRequirements);
    const controlFlows = await engine.mapControlFlows(algorithms);
    const validation = await engine.validatePseudocodeLogic(algorithms);
    const pseudocodeStructure = await engine.generatePseudocode(specification);

    return {
      success: true,
      details: {
        algorithmsGenerated: algorithms.length,
        dataStructuresGenerated: dataStructures.length,
        controlFlowsGenerated: controlFlows.length,
        validationResultsCount: validation.length,
        completeStructureGenerated: true,
      },
    };
  } catch (error) {
    logger.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPseudocodeEngine().then((result) => {
    if (result?.success) {
      process.exit(0);
    } else {
      logger.error('💥 Manual test failed:', result?.error);
      process.exit(1);
    }
  });
}

export { testPseudocodeEngine };
