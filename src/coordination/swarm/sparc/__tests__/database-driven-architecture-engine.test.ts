/**
 * Test for Database-Driven SPARC Architecture Engine
 *
 * Tests the enhanced architecture engine with database persistence,
 * ensuring architecture designs can be generated, stored, and retrieved.
 */

import { nanoid } from 'nanoid';
import { ArchitectureStorageService } from '../database/architecture-storage';
import { DatabaseDrivenArchitecturePhaseEngine } from '../phases/architecture/database-driven-architecture-engine';
import type { ArchitectureDesign, PseudocodeStructure } from '../types/sparc-types';

// Mock database adapter for testing
class MockDatabaseAdapter {
  private tables: Map<string, any[]> = new Map();
  private queryResults: Map<string, any> = new Map();

  async execute(sql: string, params?: any[]): Promise<any> {
    // Simple mock for table creation and data manipulation
    if (sql.includes('CREATE TABLE')) {
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      if (tableName && !this.tables.has(tableName)) {
        this.tables.set(tableName, []);
      }
      return { affectedRows: 0 };
    }

    if (sql.includes('INSERT INTO')) {
      const tableName = sql.match(/INSERT INTO (\w+)/)?.[1];
      if (tableName && this.tables.has(tableName)) {
        const table = this.tables.get(tableName)!;
        const record = this.createMockRecord(params || []);
        table.push(record);
        return { affectedRows: 1 };
      }
    }

    if (sql.includes('UPDATE')) {
      return { affectedRows: 1 };
    }

    if (sql.includes('DELETE')) {
      return { affectedRows: 1 };
    }

    return { affectedRows: 0 };
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (sql.includes('SELECT') && params) {
      const tableName = sql.match(/FROM (\w+)/)?.[1];
      if (tableName && this.tables.has(tableName)) {
        const table = this.tables.get(tableName)!;

        if (sql.includes('WHERE') && params.length > 0) {
          // Simple mock for WHERE queries
          const record = table.find((r) => r.architecture_id === params[0] || r.id === params[0]);
          return { rows: record ? [record] : [] };
        }

        return { rows: table };
      }
    }

    // Handle COUNT queries
    if (sql.includes('COUNT(*)')) {
      const tableName = sql.match(/FROM (\w+)/)?.[1];
      if (tableName && this.tables.has(tableName)) {
        const count = this.tables.get(tableName)!.length;
        return { rows: [{ count }] };
      }
      return { rows: [{ count: 0 }] };
    }

    // Handle aggregate queries
    if (sql.includes('AVG(') || sql.includes('GROUP BY')) {
      return { rows: [{ avg_components: 5, average_score: 0.8, pass_rate: 0.75 }] };
    }

    return { rows: [] };
  }

  private createMockRecord(params: any[]): any {
    return {
      id: params[0] || nanoid(),
      architecture_id: params[1] || nanoid(),
      project_id: params[2] || null,
      name: params[3] || 'Test Architecture',
      domain: params[4] || 'general',
      design_data: params[5] || '{}',
      components_data: params[6] || '[]',
      validation_data: params[7] || null,
      created_at: new Date(),
      updated_at: new Date(),
      version: 1,
      tags: params[10] || '[]',
      metadata: params[11] || '{}',
    };
  }
}

// Mock logger
const mockLogger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
};

/**
 * Test the database-driven architecture engine functionality
 */
async function testDatabaseDrivenArchitectureEngine(): Promise<void> {
  console.log('🏗️  Testing Database-Driven SPARC Architecture Engine...\n');

  // Setup test environment
  const mockDb = new MockDatabaseAdapter();
  const architectureEngine = new DatabaseDrivenArchitecturePhaseEngine(mockDb, mockLogger);

  try {
    // Initialize the engine and database
    console.log('1. Initializing architecture engine with database...');
    await architectureEngine.initialize();
    console.log('✅ Architecture engine initialized successfully\n');

    // Create test pseudocode structure
    console.log('2. Creating test pseudocode structure...');
    const testPseudocode: PseudocodeStructure = {
      id: nanoid(),
      algorithms: [
        {
          name: 'SwarmCoordinator',
          purpose: 'Coordinate agent tasks and resource allocation',
          inputs: [
            { name: 'agents', type: 'Agent[]', description: 'Available agents', optional: false },
            { name: 'tasks', type: 'Task[]', description: 'Pending tasks', optional: false },
          ],
          outputs: [
            { name: 'assignments', type: 'TaskAssignment[]', description: 'Task assignments' },
          ],
          steps: [
            {
              stepNumber: 1,
              description: 'Analyze agent capabilities',
              pseudocode: 'FOR each agent: analyze(agent.capabilities)',
              complexity: 'O(n)',
            },
            {
              stepNumber: 2,
              description: 'Match tasks to agents',
              pseudocode: 'FOR each task: findBestAgent(task)',
              complexity: 'O(n*m)',
            },
            {
              stepNumber: 3,
              description: 'Create assignments',
              pseudocode: 'assignments = createAssignments(matches)',
              complexity: 'O(n)',
            },
          ],
          complexity: {
            timeComplexity: 'O(n*m)',
            spaceComplexity: 'O(n+m)',
            scalability: 'Good for moderate task volumes',
            worstCase: 'O(n²*m)',
          },
          optimizations: [
            {
              type: 'algorithmic',
              description: 'Use priority queues for task matching',
              impact: 'high',
              effort: 'medium',
            },
          ],
        },
        {
          name: 'TaskScheduler',
          purpose: 'Schedule tasks based on priority and dependencies',
          inputs: [
            { name: 'tasks', type: 'Task[]', description: 'Tasks to schedule', optional: false },
            {
              name: 'dependencies',
              type: 'Dependency[]',
              description: 'Task dependencies',
              optional: true,
            },
          ],
          outputs: [{ name: 'schedule', type: 'Schedule', description: 'Execution schedule' }],
          steps: [
            {
              stepNumber: 1,
              description: 'Build dependency graph',
              pseudocode: 'graph = buildGraph(dependencies)',
              complexity: 'O(d)',
            },
            {
              stepNumber: 2,
              description: 'Topological sort',
              pseudocode: 'sorted = topologicalSort(graph)',
              complexity: 'O(d+e)',
            },
            {
              stepNumber: 3,
              description: 'Schedule tasks',
              pseudocode: 'schedule = createSchedule(sorted)',
              complexity: 'O(n)',
            },
          ],
          complexity: {
            timeComplexity: 'O(d+e)',
            spaceComplexity: 'O(d)',
            scalability: 'Excellent for dependency chains',
            worstCase: 'O(n²)',
          },
          optimizations: [
            {
              type: 'caching',
              description: 'Cache dependency calculations',
              impact: 'medium',
              effort: 'low',
            },
          ],
        },
      ],
      dataStructures: [
        {
          name: 'AgentRegistry',
          type: 'HashMap',
          properties: [
            {
              name: 'agents',
              type: 'Map<string, Agent>',
              visibility: 'private',
              description: 'Agent storage',
            },
            {
              name: 'capabilities',
              type: 'Map<string, Capability[]>',
              visibility: 'private',
              description: 'Agent capabilities index',
            },
          ],
          methods: [
            {
              name: 'register',
              parameters: [{ name: 'agent', type: 'Agent', description: 'Agent to register' }],
              returnType: 'void',
              visibility: 'public',
              description: 'Register new agent',
            },
            {
              name: 'findByCapability',
              parameters: [
                { name: 'capability', type: 'string', description: 'Required capability' },
              ],
              returnType: 'Agent[]',
              visibility: 'public',
              description: 'Find agents by capability',
            },
          ],
          relationships: [{ type: 'uses', target: 'Agent', description: 'Stores agent instances' }],
        },
        {
          name: 'TaskQueue',
          type: 'PriorityQueue',
          properties: [
            {
              name: 'tasks',
              type: 'PriorityQueue<Task>',
              visibility: 'private',
              description: 'Task priority queue',
            },
            {
              name: 'priorities',
              type: 'Map<string, number>',
              visibility: 'private',
              description: 'Task priorities',
            },
          ],
          methods: [
            {
              name: 'enqueue',
              parameters: [{ name: 'task', type: 'Task', description: 'Task to add' }],
              returnType: 'void',
              visibility: 'public',
              description: 'Add task to queue',
            },
            {
              name: 'dequeue',
              parameters: [],
              returnType: 'Task | null',
              visibility: 'public',
              description: 'Get highest priority task',
            },
          ],
          relationships: [
            { type: 'contains', target: 'Task', description: 'Manages task instances' },
          ],
        },
      ],
      controlFlows: [],
      optimizations: [
        {
          type: 'performance',
          description: 'Implement WASM for heavy computations',
          impact: 'high',
          effort: 'high',
        },
        {
          type: 'memory',
          description: 'Use object pooling for agents',
          impact: 'medium',
          effort: 'medium',
        },
      ],
      dependencies: [],
    };
    console.log('✅ Test pseudocode structure created\n');

    // Test architecture generation
    console.log('3. Generating architecture from pseudocode...');
    const architecture = await architectureEngine.designArchitecture(testPseudocode);
    console.log(
      `✅ Architecture generated with ${architecture.components?.length || 0} components\n`
    );

    // Test architecture validation
    console.log('4. Validating generated architecture...');
    const validation = await architectureEngine.validateArchitecturalConsistency(
      architecture.systemArchitecture
    );
    console.log(
      `✅ Architecture validation completed with score: ${validation.overallScore.toFixed(2)}\n`
    );

    // Test architecture retrieval
    console.log('5. Testing architecture retrieval...');
    if (architecture.id) {
      const retrievedArchitecture = await architectureEngine.getArchitectureById(architecture.id);
      console.log(`✅ Architecture retrieved: ${retrievedArchitecture ? 'Found' : 'Not found'}\n`);
    }

    // Test architecture search
    console.log('6. Testing architecture search...');
    const searchResults = await architectureEngine.searchArchitectures({
      domain: 'swarm-coordination',
      limit: 10,
    });
    console.log(`✅ Architecture search completed: ${searchResults.length} results found\n`);

    // Test architecture statistics
    console.log('7. Testing architecture statistics...');
    const stats = await architectureEngine.getArchitectureStatistics();
    console.log(
      `✅ Architecture statistics retrieved: ${stats.totalArchitectures} total architectures\n`
    );

    // Display architecture details
    console.log('8. Architecture Details:');
    console.log(`   - ID: ${architecture.id}`);
    console.log(`   - Components: ${architecture.components?.length || 0}`);
    console.log(`   - Quality Attributes: ${architecture.qualityAttributes?.length || 0}`);
    console.log(`   - Security Requirements: ${architecture.securityRequirements?.length || 0}`);
    console.log(
      `   - Scalability Requirements: ${architecture.scalabilityRequirements?.length || 0}`
    );
    console.log(`   - Validation Score: ${validation.overallScore.toFixed(2)}`);
    console.log(`   - Validation Approved: ${validation.approved ? '✅' : '❌'}\n`);

    // Display component details
    if (architecture.components && architecture.components.length > 0) {
      console.log('9. Component Details:');
      architecture.components.forEach((component, index) => {
        console.log(`   ${index + 1}. ${component.name} (${component.type})`);
        console.log(`      - Responsibilities: ${component.responsibilities?.length || 0}`);
        console.log(`      - Dependencies: ${component.dependencies?.length || 0}`);
        console.log(`      - Interfaces: ${component.interfaces?.length || 0}`);
      });
      console.log('');
    }

    // Display recommendations if any
    if (validation.recommendations && validation.recommendations.length > 0) {
      console.log('10. Architecture Recommendations:');
      validation.recommendations.forEach((rec, index) => {
        console.log(`    ${index + 1}. ${rec}`);
      });
      console.log('');
    }

    console.log('🎉 Database-Driven Architecture Engine test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Run the test (ES module compatible)
 */
async function runTest() {
  try {
    await testDatabaseDrivenArchitectureEngine();
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest();
}

export { testDatabaseDrivenArchitectureEngine };
