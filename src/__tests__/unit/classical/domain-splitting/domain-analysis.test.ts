/**
 * Classical TDD tests for domain splitting functionality
 * Tests actual file operations and analysis results
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { DomainAnalysisEngine } from '../../../../tools/domain-splitting/analyzers/domain-analyzer';
import { NEURAL_SPLITTING_PLAN } from '../../../../tools/domain-splitting/types/domain-types';

describe('Domain Splitting - Classical TDD', () => {
  let tempDir: string;
  let analyzer: DomainAnalysisEngine;

  beforeEach(async () => {
    // Create temporary test directory
    tempDir = path.join(__dirname, '../../../../..', 'tmp', 'domain-test');
    await fs.ensureDir(tempDir);

    analyzer = new DomainAnalysisEngine();
  });

  afterEach(async () => {
    // Cleanup temp directory
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Domain Analysis Engine', () => {
    it('should analyze domain complexity correctly', async () => {
      // Arrange: Create test domain structure
      const testDomain = path.join(tempDir, 'test-domain');
      await createTestDomainStructure(testDomain);

      // Act: Analyze domain
      const analysis = await analyzer.analyzeDomainComplexity(testDomain);

      // Assert: Check analysis results
      expect(analysis).toBeDefined();
      expect(analysis.totalFiles).toBeGreaterThan(0);
      expect(analysis.complexityScore).toBeGreaterThan(0);
      expect(analysis.categories).toBeDefined();
      expect(analysis.dependencies).toBeDefined();
      expect(analysis.coupling).toBeDefined();
      expect(analysis.splittingRecommendations).toBeDefined();
    });

    it('should categorize files correctly by purpose', async () => {
      // Arrange: Create test files with specific patterns
      const testDomain = path.join(tempDir, 'categorization-test');
      await fs.ensureDir(testDomain);

      // Create files that should be categorized differently
      await fs.writeFile(
        path.join(testDomain, 'neural-network.ts'),
        `
        export class NeuralNetwork {
          forward() { /* neural logic */ }
        }
      `
      );

      await fs.writeFile(
        path.join(testDomain, 'trainer.ts'),
        `
        export class Trainer {
          train() { /* training logic */ }
          optimize() { /* optimization */ }
        }
      `
      );

      await fs.writeFile(
        path.join(testDomain, 'utils.ts'),
        `
        export function helper() { /* utility */ }
      `
      );

      await fs.writeFile(
        path.join(testDomain, 'config.ts'),
        `
        export const config = { /* configuration */ };
      `
      );

      // Act: Analyze domain
      const analysis = await analyzer.analyzeDomainComplexity(testDomain);

      // Assert: Check categorization
      expect(analysis.categories['core-algorithms']).toContain(
        expect.stringContaining('neural-network.ts')
      );
      expect(analysis.categories['training-systems']).toContain(
        expect.stringContaining('trainer.ts')
      );
      expect(analysis.categories['utilities']).toContain(expect.stringContaining('utils.ts'));
      expect(analysis.categories['configuration']).toContain(expect.stringContaining('config.ts'));
    });

    it('should build dependency graph correctly', async () => {
      // Arrange: Create files with dependencies
      const testDomain = path.join(tempDir, 'dependency-test');
      await fs.ensureDir(testDomain);

      await fs.writeFile(
        path.join(testDomain, 'moduleA.ts'),
        `
        import { functionB } from './moduleB';
        export function functionA() { return functionB(); }
      `
      );

      await fs.writeFile(
        path.join(testDomain, 'moduleB.ts'),
        `
        export function functionB() { return 'B'; }
      `
      );

      await fs.writeFile(
        path.join(testDomain, 'moduleC.ts'),
        `
        import { functionA } from './moduleA';
        import { functionB } from './moduleB';
        export function functionC() { return functionA() + functionB(); }
      `
      );

      // Act: Analyze domain
      const analysis = await analyzer.analyzeDomainComplexity(testDomain);

      // Assert: Check dependency graph
      expect(analysis.dependencies.nodes).toHaveLength(3);
      expect(analysis.dependencies.edges.length).toBeGreaterThanOrEqual(2);

      // Check specific dependencies
      const moduleANode = analysis.dependencies.nodes.find((n) => n.file.includes('moduleA.ts'));
      expect(moduleANode).toBeDefined();
      expect(moduleANode!.imports).toContain(expect.stringContaining('moduleB'));
    });

    it('should identify sub-domains from analysis', async () => {
      // Arrange: Create complex domain
      const testDomain = path.join(tempDir, 'complex-domain');
      await createComplexDomainStructure(testDomain);

      // Act: Analyze and identify sub-domains
      const analysis = await analyzer.analyzeDomainComplexity(testDomain);
      const plans = await analyzer.identifySubDomains(analysis);

      // Assert: Check plans
      expect(plans).toBeDefined();
      expect(plans.length).toBeGreaterThan(0);

      const categoryPlan = plans.find((p) =>
        p.targetSubDomains.some((s) => s.name.includes('core'))
      );
      expect(categoryPlan).toBeDefined();
      expect(categoryPlan!.targetSubDomains.length).toBeGreaterThan(1);
    });

    it('should calculate splitting benefits accurately', async () => {
      // Arrange: Use neural splitting plan
      const plans = [NEURAL_SPLITTING_PLAN];

      // Act: Calculate benefits
      const metrics = await analyzer.calculateSplittingBenefits(plans);

      // Assert: Check metrics
      expect(metrics).toBeDefined();
      expect(metrics.complexityReduction).toBeGreaterThan(0);
      expect(metrics.maintainabilityImprovement).toBeGreaterThan(0);
      expect(typeof metrics.buildTimeImpact).toBe('number');
      expect(metrics.testTimeImpact).toBeGreaterThanOrEqual(0);
      expect(metrics.migrationEffort).toBeGreaterThan(0);
    });
  });

  describe('Neural Domain Splitting Plan', () => {
    it('should have valid structure', () => {
      // Assert: Check plan structure
      expect(NEURAL_SPLITTING_PLAN).toBeDefined();
      expect(NEURAL_SPLITTING_PLAN.sourceDomain).toBe('neural');
      expect(NEURAL_SPLITTING_PLAN.targetSubDomains).toBeDefined();
      expect(NEURAL_SPLITTING_PLAN.targetSubDomains.length).toBe(6);

      // Check required sub-domains
      const subdomainNames = NEURAL_SPLITTING_PLAN.targetSubDomains.map((s) => s.name);
      expect(subdomainNames).toContain('neural-core');
      expect(subdomainNames).toContain('neural-models');
      expect(subdomainNames).toContain('neural-agents');
      expect(subdomainNames).toContain('neural-coordination');
      expect(subdomainNames).toContain('neural-wasm');
      expect(subdomainNames).toContain('neural-bridge');
    });

    it('should have proper dependency relationships', () => {
      // Assert: Check dependencies
      for (const subdomain of NEURAL_SPLITTING_PLAN.targetSubDomains) {
        expect(subdomain.dependencies).toBeDefined();
        expect(Array.isArray(subdomain.dependencies)).toBe(true);

        // Core dependencies should exist
        if (subdomain.name !== 'neural-core') {
          expect(subdomain.dependencies.length).toBeGreaterThan(0);
        }
      }

      // Bridge should depend on core, models, and wasm
      const bridge = NEURAL_SPLITTING_PLAN.targetSubDomains.find((s) => s.name === 'neural-bridge');
      expect(bridge!.dependencies).toContain('neural-core');
      expect(bridge!.dependencies).toContain('neural-models');
      expect(bridge!.dependencies).toContain('neural-wasm');
    });

    it('should follow kebab-case naming convention', () => {
      // Assert: Check naming
      for (const subdomain of NEURAL_SPLITTING_PLAN.targetSubDomains) {
        expect(subdomain.name).toMatch(/^[a-z]+(-[a-z]+)*$/);
      }
    });
  });

  describe('File Analysis', () => {
    it('should extract imports and exports correctly', async () => {
      // Arrange: Create test file with imports/exports
      const testFile = path.join(tempDir, 'test-file.ts');
      await fs.writeFile(
        testFile,
        `
        import { Component } from 'react';
        import * as utils from './utils';
        import config from '../config';
        
        export interface TestInterface {
          prop: string;
        }
        
        export class TestClass extends Component {
          method() { return 'test'; }
        }
        
        export const testFunction = () => 'function';
        
        export default TestClass;
      `
      );

      // Act: Analyze file (using analyzer's private methods through reflection)
      const analyzeFile = (analyzer as any).analyzeFile.bind(analyzer);
      const analysis = await analyzeFile(testFile);

      // Assert: Check imports
      expect(analysis.imports).toBeDefined();
      expect(analysis.imports.length).toBeGreaterThanOrEqual(3);

      const reactImport = analysis.imports.find((imp: any) => imp.module === 'react');
      expect(reactImport).toBeDefined();
      expect(reactImport.external).toBe(true);

      const utilsImport = analysis.imports.find((imp: any) => imp.module === './utils');
      expect(utilsImport).toBeDefined();
      expect(utilsImport.isRelative).toBe(true);

      // Assert: Check exports
      expect(analysis.exports).toBeDefined();
      expect(analysis.exports.length).toBeGreaterThanOrEqual(3);

      const interfaceExport = analysis.exports.find((exp: any) => exp.name === 'TestInterface');
      expect(interfaceExport).toBeDefined();

      const classExport = analysis.exports.find((exp: any) => exp.name === 'TestClass');
      expect(classExport).toBeDefined();

      const functionExport = analysis.exports.find((exp: any) => exp.name === 'testFunction');
      expect(functionExport).toBeDefined();
    });

    it('should calculate complexity correctly', async () => {
      // Arrange: Create files with different complexity levels
      const simpleFile = path.join(tempDir, 'simple.ts');
      await fs.writeFile(
        simpleFile,
        `
        export const simple = () => 'simple';
      `
      );

      const complexFile = path.join(tempDir, 'complex.ts');
      await fs.writeFile(
        complexFile,
        `
        export function complex(input: any) {
          if (input.type === 'A') {
            for (let i = 0; i < input.count; i++) {
              if (input.items && input.items[i]) {
                try {
                  return input.items[i].process();
                } catch (error) {
                  if (error.code === 'RETRY') {
                    continue;
                  } else {
                    throw error;
                  }
                }
              }
            }
          } else if (input.type === 'B') {
            return input.data?.map(item => 
              item.valid ? item.transform() : null
            ).filter(Boolean);
          }
          return null;
        }
      `
      );

      // Act: Analyze files
      const analyzeFile = (analyzer as any).analyzeFile.bind(analyzer);
      const simpleAnalysis = await analyzeFile(simpleFile);
      const complexAnalysis = await analyzeFile(complexFile);

      // Assert: Complex file should have higher complexity
      expect(complexAnalysis.complexity).toBeGreaterThan(simpleAnalysis.complexity);
      expect(simpleAnalysis.complexity).toBe(1); // Base complexity
      expect(complexAnalysis.complexity).toBeGreaterThan(5);
    });
  });

  // Helper functions for test setup
  async function createTestDomainStructure(domainPath: string): Promise<void> {
    await fs.ensureDir(domainPath);

    // Create core files
    await fs.writeFile(
      path.join(domainPath, 'core.ts'),
      `
      export class Core {
        process() { return 'core'; }
      }
    `
    );

    // Create model files
    await fs.writeFile(
      path.join(domainPath, 'model.ts'),
      `
      import { Core } from './core';
      export class Model extends Core {
        predict() { return 'prediction'; }
      }
    `
    );

    // Create utility files
    await fs.writeFile(
      path.join(domainPath, 'utils.ts'),
      `
      export function helper() { return 'help'; }
    `
    );

    // Create test file
    await fs.writeFile(
      path.join(domainPath, 'core.test.ts'),
      `
      import { Core } from './core';
      describe('Core', () => {
        it('should work', () => {
          const core = new Core();
          expect(core.process()).toBe('core');
        });
      });
    `
    );
  }

  async function createComplexDomainStructure(domainPath: string): Promise<void> {
    await fs.ensureDir(domainPath);

    // Create core directory
    const coreDir = path.join(domainPath, 'core');
    await fs.ensureDir(coreDir);
    await fs.writeFile(
      path.join(coreDir, 'algorithm.ts'),
      `
      export class Algorithm {
        execute() { return 'executed'; }
      }
    `
    );
    await fs.writeFile(
      path.join(coreDir, 'network.ts'),
      `
      export class Network {
        forward() { return 'forward'; }
      }
    `
    );

    // Create models directory
    const modelsDir = path.join(domainPath, 'models');
    await fs.ensureDir(modelsDir);
    await fs.writeFile(
      path.join(modelsDir, 'cnn.ts'),
      `
      import { Network } from '../core/network';
      export class CNN extends Network {
        convolve() { return 'convolved'; }
      }
    `
    );
    await fs.writeFile(
      path.join(modelsDir, 'rnn.ts'),
      `
      import { Network } from '../core/network';
      export class RNN extends Network {
        recur() { return 'recurred'; }
      }
    `
    );

    // Create agents directory
    const agentsDir = path.join(domainPath, 'agents');
    await fs.ensureDir(agentsDir);
    await fs.writeFile(
      path.join(agentsDir, 'neural-agent.ts'),
      `
      export class NeuralAgent {
        decide() { return 'decision'; }
      }
    `
    );

    // Create wasm directory
    const wasmDir = path.join(domainPath, 'wasm');
    await fs.ensureDir(wasmDir);
    await fs.writeFile(
      path.join(wasmDir, 'wasm-loader.ts'),
      `
      export class WasmLoader {
        load() { return 'loaded'; }
      }
    `
    );

    // Create utilities
    await fs.writeFile(
      path.join(domainPath, 'utils.ts'),
      `
      export function helper() { return 'help'; }
    `
    );

    // Create bridge
    await fs.writeFile(
      path.join(domainPath, 'bridge.ts'),
      `
      import { Network } from './core/network';
      import { WasmLoader } from './wasm/wasm-loader';
      export class Bridge {
        connect() { return 'connected'; }
      }
    `
    );
  }
});
