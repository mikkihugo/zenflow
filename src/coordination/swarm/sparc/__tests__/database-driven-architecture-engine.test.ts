import { getLogger } from "../../../../config/logging-config";
const logger = getLogger("coordination-swarm-sparc-tests-database-driven-architecture-enginetest");
/**
 * Test for Database-Driven SPARC Architecture Engine
 *
 * Tests the enhanced architecture engine with database persistence,
 * ensuring architecture designs can be generated, stored, and retrieved.
 */

import { nanoid } from 'nanoid';
import { DatabaseDrivenArchitecturePhaseEngine } from '../phases/architecture/database-driven-architecture-engine';
import type { PseudocodeStructure } from '../types/sparc-types';

// Mock database adapter for testing
class MockDatabaseAdapter {
  private tables: Map<string, any[]> = new Map();

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
        const count = this.tables.get(tableName)?.length;
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
  info: (_msg: string, ..._args: any[]) => {},
  error: (msg: string, ...args: any[]) => logger.error(`[ERROR] ${msg}`, ...args),
  debug: (_msg: string, ..._args: any[]) => {},
  warn: (msg: string, ...args: any[]) => logger.warn(`[WARN] ${msg}`, ...args),
};

/**
 * Test the database-driven architecture engine functionality
 */
async function testDatabaseDrivenArchitectureEngine(): Promise<void> {
  // Setup test environment
  const mockDb = new MockDatabaseAdapter();
  const architectureEngine = new DatabaseDrivenArchitecturePhaseEngine(mockDb, mockLogger);

  try {
    await architectureEngine.initialize();
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
      coreAlgorithms: [],
      dataStructures: [
        {
          name: 'AgentRegistry',
          type: 'class',
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
          type: 'class',
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
    const architecture = await architectureEngine.designArchitecture(testPseudocode);
    const validation = await architectureEngine.validateArchitecturalConsistency(
      architecture.systemArchitecture
    );
    if (architecture.id) {
      const _retrievedArchitecture = await architectureEngine.getArchitectureById(architecture.id);
    }
    const _searchResults = await architectureEngine.searchArchitectures({
      domain: 'swarm-coordination',
      limit: 10,
    });
    const _stats = await architectureEngine.getArchitectureStatistics();

    // Display component details
    if (architecture.components && architecture.components.length > 0) {
      architecture.components.forEach((_component, _index) => {});
    }

    // Display recommendations if any
    if (validation.recommendations && validation.recommendations.length > 0) {
      validation.recommendations.forEach((_rec, _index) => {});
    }
  } catch (error) {
    logger.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Run the test (ES module compatible)
 */
async function runTest() {
  try {
    await testDatabaseDrivenArchitectureEngine();
    process.exit(0);
  } catch (error) {
    logger.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest();
}

export { testDatabaseDrivenArchitectureEngine };
