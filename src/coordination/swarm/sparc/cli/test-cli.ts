/**
 * Simple test for architecture CLI functionality
 */

import { nanoid } from 'nanoid';
import { DatabaseDrivenArchitecturePhaseEngine } from '../phases/architecture/database-driven-architecture-engine';
import type { PseudocodeStructure } from '../types/sparc-types';

// Simple mock database
class MockDB {
  async execute(): Promise<any> {
    return { affectedRows: 1 };
  }
  async query(): Promise<any> {
    return { rows: [] };
  }
}

async function testCLIFunctionality() {
  console.log('🚀 Testing SPARC Architecture CLI Functionality\n');

  const db = new MockDB();
  const engine = new DatabaseDrivenArchitecturePhaseEngine(db, {
    info: console.log,
    error: console.error,
    debug: console.log,
    warn: console.warn,
  });

  await engine.initialize();

  const samplePseudocode: PseudocodeStructure = {
    id: nanoid(),
    algorithms: [
      {
        name: 'TaskProcessor',
        purpose: 'Process tasks in parallel',
        inputs: [
          { name: 'tasks', type: 'Task[]', description: 'Tasks to process', optional: false },
        ],
        outputs: [{ name: 'results', type: 'Result[]', description: 'Processing results' }],
        steps: [
          {
            stepNumber: 1,
            description: 'Validate tasks',
            pseudocode: 'validate(tasks)',
            complexity: 'O(n)',
          },
          {
            stepNumber: 2,
            description: 'Process in parallel',
            pseudocode: 'parallel_process(tasks)',
            complexity: 'O(n/p)',
          },
        ],
        complexity: {
          timeComplexity: 'O(n/p)',
          spaceComplexity: 'O(n)',
          scalability: 'Excellent with parallelization',
          worstCase: 'O(n)',
        },
        optimizations: [],
      },
    ],
    dataStructures: [
      {
        name: 'TaskQueue',
        type: 'Queue',
        properties: [
          { name: 'items', type: 'Task[]', visibility: 'private', description: 'Queue items' },
        ],
        methods: [
          {
            name: 'enqueue',
            parameters: [{ name: 'task', type: 'Task', description: 'Task to add' }],
            returnType: 'void',
            visibility: 'public',
            description: 'Add task',
          },
        ],
        relationships: [],
      },
    ],
    controlFlows: [],
    optimizations: [],
    dependencies: [],
  };

  console.log('📋 Generating architecture from sample pseudocode...');
  const architecture = await engine.designArchitecture(samplePseudocode);

  console.log(`✅ Architecture generated successfully!`);
  console.log(`   - ID: ${architecture.id}`);
  console.log(`   - Components: ${architecture.components?.length || 0}`);
  console.log(`   - Quality Attributes: ${architecture.qualityAttributes?.length || 0}`);

  if (architecture.components) {
    console.log('\n🔧 Generated Components:');
    architecture.components.forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.name} (${comp.type})`);
    });
  }

  console.log('\n🔍 Validating architecture...');
  const validation = await engine.validateArchitecturalConsistency(architecture.systemArchitecture);
  console.log(`✅ Validation score: ${validation.overallScore.toFixed(2)}`);
  console.log(`   Status: ${validation.approved ? '✅ Approved' : '❌ Needs improvement'}`);

  console.log('\n🎉 CLI functionality test completed!');
}

testCLIFunctionality().catch(console.error);
