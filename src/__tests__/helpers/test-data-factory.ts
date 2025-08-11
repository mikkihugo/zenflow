/**
 * Test Data Factory - Reproducible Test Data Generation
 *
 * Creates realistic test data for both London and Classical TDD approaches
 */

import type {
  AgentTestData,
  ProjectTestData,
  SwarmTestData,
  TestDataOptions,
  UserTestData,
} from './types.ts';

export class TestDataFactory {
  private seed: number;
  private options: TestDataOptions;

  constructor(options: TestDataOptions = {}) {
    this.seed = options?.seed ?? Date.now();
    this.options = options;
    this.initializeRandom();
  }

  /**
   * Create user test data
   *
   * @param overrides
   */
  createUser(overrides: Partial<UserTestData> = {}): UserTestData {
    const id = this.generateId();
    const name = this.generateName();
    const email = this.generateEmail(name);

    return {
      id,
      name,
      email,
      preferences: {
        theme: this.randomChoice(['light', 'dark', 'auto']),
        language: this.randomChoice(['en', 'es', 'fr', 'de']),
        notifications: this.randomBoolean(),
      },
      metadata: {
        createdAt: this.generateTimestamp(),
        lastLogin: this.generateTimestamp(),
        loginCount: this.randomInt(1, 100),
      },
      ...overrides,
    };
  }

  /**
   * Create multiple users
   *
   * @param count
   * @param baseData
   */
  createUsers(
    count: number,
    baseData: Partial<UserTestData> = {},
  ): UserTestData[] {
    return Array.from({ length: count }, (_, index) =>
      this.createUser({ ...baseData, id: `user-${index + 1}` }),
    );
  }

  /**
   * Create project test data
   *
   * @param overrides
   */
  createProject(overrides: Partial<ProjectTestData> = {}): ProjectTestData {
    const name = this.generateProjectName();
    const type = this.randomChoice([
      'typescript',
      'javascript',
      'python',
      'rust',
    ] as const);

    return {
      name,
      path: `/projects/${name}`,
      type,
      structure: this.generateProjectStructure(type),
      dependencies: this.generateDependencies(type),
      ...overrides,
    };
  }

  /**
   * Create swarm test data
   *
   * @param overrides
   */
  createSwarm(overrides: Partial<SwarmTestData> = {}): SwarmTestData {
    const id = this.generateId();
    const topology = this.randomChoice([
      'mesh',
      'hierarchical',
      'ring',
      'star',
    ] as const);
    const agentCount = this.randomInt(3, 8);

    return {
      id,
      topology,
      agents: this.createAgents(agentCount),
      configuration: {
        maxAgents: agentCount,
        strategy: this.randomChoice(['balanced', 'specialized', 'adaptive']),
        timeout: this.randomInt(30000, 120000),
      },
      ...overrides,
    };
  }

  /**
   * Create agent test data
   *
   * @param overrides
   */
  createAgent(overrides: Partial<AgentTestData> = {}): AgentTestData {
    const type = this.randomChoice([
      'researcher',
      'coder',
      'analyst',
      'tester',
      'coordinator',
    ] as const);

    return {
      id: this.generateId(),
      type,
      capabilities: this.generateCapabilities(type),
      state: this.randomChoice([
        'idle',
        'working',
        'error',
        'completed',
      ] as const),
      ...overrides,
    };
  }

  /**
   * Create multiple agents
   *
   * @param count
   * @param baseData
   */
  createAgents(
    count: number,
    baseData: Partial<AgentTestData> = {},
  ): AgentTestData[] {
    return Array.from({ length: count }, (_, index) =>
      this.createAgent({ ...baseData, id: `agent-${index + 1}` }),
    );
  }

  /**
   * Create MCP message test data
   *
   * @param method
   * @param params
   */
  createMCPMessage(method: string = 'tools/call', params: any = {}) {
    return {
      jsonrpc: '2.0',
      id: this.randomInt(1, 1000),
      method,
      params: {
        name: this.randomChoice(['analyze', 'generate', 'optimize', 'test']),
        arguments: {
          input: this.generateText(),
          options: { verbose: this.randomBoolean() },
          ...params,
        },
      },
    };
  }

  /**
   * Create neural network test data
   *
   * @param size
   */
  createNeuralTrainingData(size: number = 100) {
    return Array.from({ length: size }, () => ({
      input: Array.from({ length: 3 }, () => this.randomFloat(-1, 1)),
      output: Array.from({ length: 2 }, () => this.randomFloat(0, 1)),
    }));
  }

  /**
   * Create performance test data
   *
   * @param operations
   */
  createPerformanceData(operations: number = 1000) {
    return {
      operations,
      data: Array.from({ length: operations }, (_, i) => ({
        id: i,
        payload: this.generateText(100),
        timestamp: Date.now() + i,
        metadata: { index: i, type: 'test' },
      })),
    };
  }

  /**
   * Create file system test structure
   */
  createFileSystemStructure() {
    return {
      'src/': {
        'index.ts': "export * from './lib'",
        'lib/': {
          'core.ts': this.generateCode('typescript'),
          'utils.ts': this.generateCode('typescript'),
          'types.ts': 'export interface TestInterface {}',
        },
      },
      'tests/': {
        'unit/': {
          'core.test.ts': this.generateTestCode('typescript'),
        },
        'integration/': {
          'api.test.ts': this.generateTestCode('typescript'),
        },
      },
      'package.json': JSON.stringify(
        {
          name: 'test-project',
          version: '1.0.0',
          scripts: {
            test: 'jest',
            build: 'tsc',
          },
        },
        null,
        2,
      ),
    };
  }

  /**
   * Create database seed data
   */
  createDatabaseSeed() {
    return {
      users: this.createUsers(10),
      projects: Array.from({ length: 5 }, () => this.createProject()),
      swarms: Array.from({ length: 3 }, () => this.createSwarm()),
    };
  }

  /**
   * Reset the random seed for reproducible tests
   *
   * @param newSeed
   */
  resetSeed(newSeed?: number) {
    this.seed = newSeed ?? this.options.seed ?? Date.now();
    this.initializeRandom();
  }

  private initializeRandom() {
    // Simple seeded random number generator (LCG)
    let seed = this.seed;
    Math.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private generateId(): string {
    return `id-${this.randomInt(100000, 999999)}`;
  }

  private generateName(): string {
    const firstNames = [
      'Alice',
      'Bob',
      'Carol',
      'David',
      'Eve',
      'Frank',
      'Grace',
      'Henry',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
    ];

    return `${this.randomChoice(firstNames)} ${this.randomChoice(lastNames)}`;
  }

  private generateEmail(name: string): string {
    const domain = this.randomChoice(['example.com', 'test.org', 'demo.net']);
    const username = name.toLowerCase().replace(' ', '.');
    return `${username}@${domain}`;
  }

  private generateProjectName(): string {
    const adjectives = [
      'awesome',
      'amazing',
      'brilliant',
      'creative',
      'dynamic',
      'elegant',
    ];
    const nouns = ['project', 'app', 'service', 'tool', 'platform', 'system'];

    return `${this.randomChoice(adjectives)}-${this.randomChoice(nouns)}`;
  }

  private generateProjectStructure(type: ProjectTestData['type']) {
    const structures = {
      typescript: {
        'src/': { 'index.ts': '', 'types.ts': '', 'utils.ts': '' },
        'tests/': { 'index.test.ts': '' },
        'tsconfig.json': '',
        'package.json': '',
      },
      javascript: {
        'src/': { 'index.js': '', 'utils.js': '' },
        'tests/': { 'index.test.js': '' },
        'package.json': '',
      },
      python: {
        'src/': { '__init__.py': '', 'main.py': '', 'utils.py': '' },
        'tests/': { 'test_main.py': '' },
        'requirements.txt': '',
        'setup.py': '',
      },
      rust: {
        'src/': { 'main.rs': '', 'lib.rs': '' },
        'tests/': { 'integration_test.rs': '' },
        'Cargo.toml': '',
      },
    };

    return structures[type];
  }

  private generateDependencies(type: ProjectTestData['type']): string[] {
    const dependencies = {
      typescript: ['@types/node', 'typescript', 'jest', '@jest/types'],
      javascript: ['jest', 'lodash', 'axios'],
      python: ['pytest', 'numpy', 'requests'],
      rust: ['serde', 'tokio', 'clap'],
    };

    return dependencies[type];
  }

  private generateCapabilities(type: AgentTestData['type']): string[] {
    const capabilities = {
      researcher: ['web-search', 'document-analysis', 'data-extraction'],
      coder: ['code-generation', 'refactoring', 'testing'],
      analyst: ['data-analysis', 'pattern-recognition', 'reporting'],
      tester: ['test-generation', 'quality-assurance', 'bug-detection'],
      coordinator: [
        'task-management',
        'workflow-optimization',
        'team-coordination',
      ],
    };

    return capabilities[type];
  }

  private generateText(length: number = 50): string {
    const words = [
      'lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'consectetur',
      'adipiscing',
      'elit',
    ];
    const result = [];

    for (let i = 0; i < length; i++) {
      result.push(this.randomChoice(words));
    }

    return result.join(' ');
  }

  private generateCode(
    language: 'typescript' | 'javascript' | 'python' | 'rust',
  ): string {
    const templates = {
      typescript: `
export function testFunction(input: string): string {
  return input.toUpperCase();
}

export class TestClass {
  private value: number;
  
  constructor(value: number = 0) {
    this.value = value;
  }
  
  getValue(): number {
    return this.value;
  }
}`,
      javascript: `
function testFunction(input) {
  return input.toUpperCase();
}

class TestClass {
  constructor(value = 0) {
    this.value = value;
  }
  
  getValue() {
    return this.value;
  }
}

module.exports = { testFunction, TestClass };`,
      python: `
def test_function(input_str):
    return input_str.upper()

class TestClass:
    def __init__(self, value=0):
        self.value = value
    
    def get_value(self):
        return self.value`,
      rust: `
pub fn test_function(input: &str) -> String {
    input.to_uppercase()
}

pub struct TestStruct {
    value: i32,
}

impl TestStruct {
    pub fn new(value: i32) -> Self {
        Self { value }
    }
    
    pub fn get_value(&self) -> i32 {
        self.value
    }
}`,
    };

    return templates[language];
  }

  private generateTestCode(language: 'typescript' | 'javascript'): string {
    const templates = {
      typescript: `
import { testFunction, TestClass } from '../src/index';

describe('Test Suite', () => {
  it('should test function', () => {
    expect(testFunction('hello')).toBe('HELLO');
  });
  
  it('should test class', () => {
    const instance = new TestClass(42);
    expect(instance.getValue()).toBe(42);
  });
});`,
      javascript: `
const { testFunction, TestClass } = require('../src/index');

describe('Test Suite', () => {
  it('should test function', () => {
    expect(testFunction('hello')).toBe('HELLO');
  });
  
  it('should test class', () => {
    const instance = new TestClass(42);
    expect(instance.getValue()).toBe(42);
  });
});`,
    };

    return templates[language];
  }

  private generateTimestamp(): number {
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return now - this.randomInt(0, oneYear);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  private randomChoice<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// Convenience instance for easy use
export const testDataFactory = new TestDataFactory();
