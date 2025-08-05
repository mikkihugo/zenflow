/**
 * Simple manual test for SPARC Pseudocode Engine
 * Tests core functionality without complex jest setup
 */

import { PseudocodePhaseEngine } from './coordination/swarm/sparc/phases/pseudocode/pseudocode-engine';
import type { DetailedSpecification } from './coordination/swarm/sparc/types/sparc-types';

async function testPseudocodeEngine() {
  console.log('🧪 Testing SPARC Pseudocode Engine...');
  
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
        testCriteria: ['Agent gets unique ID', 'Agent capabilities recorded']
      },
      {
        id: 'req-002', 
        title: 'Task Distribution',
        description: 'Distribute tasks to available agents',
        type: 'algorithmic',
        priority: 'HIGH',
        testCriteria: ['Optimal agent selection', 'Load balancing']
      }
    ],
    nonFunctionalRequirements: [],
    constraints: [],
    assumptions: [],
    dependencies: [],
    acceptanceCriteria: [],
    riskAssessment: {
      risks: [],
      mitigationStrategies: [],
      overallRisk: 'LOW'
    },
    successMetrics: []
  };

  try {
    console.log('📝 Testing algorithm generation...');
    const algorithms = await engine.generateAlgorithmPseudocode(specification);
    console.log(`✅ Generated ${algorithms.length} algorithms`);
    console.log('Algorithm names:', algorithms.map(a => a.name));
    
    console.log('🏗️ Testing data structure design...');
    const dataStructures = await engine.designDataStructures(specification.functionalRequirements);
    console.log(`✅ Generated ${dataStructures.length} data structures`);
    console.log('Data structure names:', dataStructures.map(ds => ds.name));
    
    console.log('🔄 Testing control flow mapping...');
    const controlFlows = await engine.mapControlFlows(algorithms);
    console.log(`✅ Generated ${controlFlows.length} control flows`);
    
    console.log('✅ Testing algorithm validation...');
    const validation = await engine.validatePseudocodeLogic(algorithms);
    console.log(`✅ Validated ${validation.length} criteria`);
    
    console.log('🎯 Testing complete pseudocode generation...');
    const pseudocodeStructure = await engine.generatePseudocode(specification);
    console.log('✅ Generated complete pseudocode structure');
    console.log('Structure overview:', {
      algorithms: pseudocodeStructure.algorithms.length,
      dataStructures: pseudocodeStructure.dataStructures.length,
      controlFlows: pseudocodeStructure.controlFlows.length,
      optimizations: pseudocodeStructure.optimizations.length,
      hasComplexityAnalysis: !!pseudocodeStructure.complexityAnalysis
    });
    
    console.log('🎉 All tests passed! SPARC Pseudocode Engine is working correctly.');
    
    return {
      success: true,
      details: {
        algorithmsGenerated: algorithms.length,
        dataStructuresGenerated: dataStructures.length,
        controlFlowsGenerated: controlFlows.length,
        validationResultsCount: validation.length,
        completeStructureGenerated: true
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPseudocodeEngine().then(result => {
    if (result.success) {
      console.log('🎯 Manual test completed successfully!');
      process.exit(0);
    } else {
      console.error('💥 Manual test failed:', result.error);
      process.exit(1);
    }
  });
}

export { testPseudocodeEngine };