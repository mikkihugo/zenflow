/**
 * London TDD tests for domain splitting orchestration
 * Tests interactions between components using mocks
 */

import { DomainAnalysisEngine } from '../../../../tools/domain-splitting/analyzers/domain-analyzer.js';
import { DomainSplittingOrchestrator } from '../../../../tools/domain-splitting/orchestrator.js';
import { SafeDomainSplitter } from '../../../../tools/domain-splitting/splitters/domain-splitter.js';
import { DependencyValidator } from '../../../../tools/domain-splitting/validators/dependency-validator.js';

// Mock implementations
jest.mock('../../../../tools/domain-splitting/analyzers/domain-analyzer.js');
jest.mock('../../../../tools/domain-splitting/splitters/domain-splitter.js');
jest.mock('../../../../tools/domain-splitting/validators/dependency-validator.js');

describe('Domain Splitting Orchestration - London TDD', () => {
  let orchestrator: DomainSplittingOrchestrator;
  let mockAnalyzer: jest.Mocked<DomainAnalysisEngine>;
  let mockSplitter: jest.Mocked<SafeDomainSplitter>;
  let mockValidator: jest.Mocked<DependencyValidator>;

  beforeEach(() => {
    // Create mock instances
    mockAnalyzer = new DomainAnalysisEngine() as jest.Mocked<DomainAnalysisEngine>;
    mockSplitter = new SafeDomainSplitter() as jest.Mocked<SafeDomainSplitter>;
    mockValidator = new DependencyValidator() as jest.Mocked<DependencyValidator>;

    // Create orchestrator with dependency injection
    orchestrator = new DomainSplittingOrchestrator();
    (orchestrator as any).analyzer = mockAnalyzer;
    (orchestrator as any).splitter = mockSplitter;
    (orchestrator as any).validator = mockValidator;
  });

  describe('Domain Splitting Workflow', () => {
    it('should execute complete domain splitting workflow', async () => {
      // Arrange
      const domainPath = 'src/neural';
      const mockAnalysis = {
        domainPath,
        totalFiles: 20,
        categories: {
          'core-algorithms': ['file1.ts'],
          models: ['file2.ts'],
          agents: ['file3.ts'],
          coordination: ['file4.ts'],
          wasm: ['file5.ts'],
          bridge: ['file6.ts'],
          'training-systems': [],
          'network-architectures': [],
          'data-processing': [],
          'evaluation-metrics': [],
          visualization: [],
          integration: [],
          utilities: [],
          tests: [],
          configuration: [],
        },
        dependencies: { nodes: [], edges: [] },
        coupling: {
          tightlyCoupledGroups: [],
          averageCoupling: 0.3,
          maxCoupling: 0.5,
          isolatedFiles: [],
        },
        complexityScore: 8.5,
        splittingRecommendations: [],
      };

      const mockPlans = [
        {
          sourceDomain: 'neural',
          targetSubDomains: [
            {
              name: 'neural-core',
              description: 'Core algorithms',
              estimatedFiles: 5,
              dependencies: ['utils'],
            },
            {
              name: 'neural-models',
              description: 'Neural models',
              estimatedFiles: 8,
              dependencies: ['neural-core'],
            },
          ],
        },
      ];

      const mockValidation = {
        success: true,
        issues: [],
        metrics: {
          buildSuccess: true,
          testSuccess: true,
          noCircularDependencies: true,
          allImportsResolved: true,
        },
      };

      const mockResult = {
        success: true,
        subDomainsCreated: 2,
        filesMoved: 13,
        importsUpdated: 8,
        validation: mockValidation,
      };

      // Setup mocks
      mockAnalyzer.analyzeDomainComplexity.mockResolvedValue(mockAnalysis);
      mockAnalyzer.identifySubDomains.mockResolvedValue(mockPlans);
      mockValidator.validateNoCyclicDependencies.mockResolvedValue(mockValidation);
      mockSplitter.executeSplitting.mockResolvedValue(mockResult);

      // Act
      const result = await orchestrator.executeDomainSplit(domainPath);

      // Assert
      expect(mockAnalyzer.analyzeDomainComplexity).toHaveBeenCalledWith(domainPath);
      expect(mockAnalyzer.identifySubDomains).toHaveBeenCalledWith(mockAnalysis);
      expect(mockValidator.validateNoCyclicDependencies).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            sourceDomain: 'neural',
            targetSubDomains: expect.any(Array),
          }),
        ])
      );
      expect(mockSplitter.executeSplitting).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            sourceDomain: 'neural',
          }),
        ])
      );

      expect(result).toEqual(mockResult);
      expect(result.success).toBe(true);
      expect(result.subDomainsCreated).toBe(2);
    });

    it('should handle analysis failure gracefully', async () => {
      // Arrange
      const domainPath = 'src/invalid';
      const analysisError = new Error('Domain not found');

      mockAnalyzer.analyzeDomainComplexity.mockRejectedValue(analysisError);

      // Act & Assert
      await expect(orchestrator.executeDomainSplit(domainPath)).rejects.toThrow('Domain not found');

      expect(mockAnalyzer.analyzeDomainComplexity).toHaveBeenCalledWith(domainPath);
      expect(mockAnalyzer.identifySubDomains).not.toHaveBeenCalled();
      expect(mockSplitter.executeSplitting).not.toHaveBeenCalled();
    });

    it('should handle validation failure and prevent splitting', async () => {
      // Arrange
      const domainPath = 'src/neural';
      const mockAnalysis = {
        domainPath,
        totalFiles: 10,
        categories: {},
        dependencies: { nodes: [], edges: [] },
        coupling: {
          tightlyCoupledGroups: [],
          averageCoupling: 0.3,
          maxCoupling: 0.5,
          isolatedFiles: [],
        },
        complexityScore: 5.0,
        splittingRecommendations: [],
      };

      const mockPlans = [
        {
          sourceDomain: 'neural',
          targetSubDomains: [
            {
              name: 'neural-core',
              description: 'Core',
              estimatedFiles: 5,
              dependencies: [],
            },
          ],
        },
      ];

      const mockValidation = {
        success: false,
        issues: [
          {
            type: 'circular-dependency' as const,
            description: 'Circular dependency detected',
            severity: 'error' as const,
          },
        ],
        metrics: {
          buildSuccess: false,
          testSuccess: true,
          noCircularDependencies: false,
          allImportsResolved: true,
        },
      };

      mockAnalyzer.analyzeDomainComplexity.mockResolvedValue(mockAnalysis);
      mockAnalyzer.identifySubDomains.mockResolvedValue(mockPlans);
      mockValidator.validateNoCyclicDependencies.mockResolvedValue(mockValidation);

      // Act & Assert
      await expect(orchestrator.executeDomainSplit(domainPath)).rejects.toThrow(
        'Plan validation failed'
      );

      expect(mockValidator.validateNoCyclicDependencies).toHaveBeenCalled();
      expect(mockSplitter.executeSplitting).not.toHaveBeenCalled();
    });

    it('should use provided plan when given', async () => {
      // Arrange
      const domainPath = 'src/neural';
      const providedPlan = {
        sourceDomain: 'neural',
        targetSubDomains: [
          {
            name: 'neural-custom',
            description: 'Custom subdomain',
            estimatedFiles: 10,
            dependencies: ['utils'],
          },
        ],
      };

      const mockAnalysis = {
        domainPath,
        totalFiles: 10,
        categories: {
          'core-algorithms': ['file1.ts'],
          models: [],
          agents: [],
          coordination: [],
          wasm: [],
          bridge: [],
          'training-systems': [],
          'network-architectures': [],
          'data-processing': [],
          'evaluation-metrics': [],
          visualization: [],
          integration: [],
          utilities: [],
          tests: [],
          configuration: [],
        },
        dependencies: { nodes: [], edges: [] },
        coupling: {
          tightlyCoupledGroups: [],
          averageCoupling: 0.2,
          maxCoupling: 0.4,
          isolatedFiles: [],
        },
        complexityScore: 4.0,
        splittingRecommendations: [],
      };

      const mockValidation = {
        success: true,
        issues: [],
        metrics: {
          buildSuccess: true,
          testSuccess: true,
          noCircularDependencies: true,
          allImportsResolved: true,
        },
      };

      const mockResult = {
        success: true,
        subDomainsCreated: 1,
        filesMoved: 10,
        importsUpdated: 5,
        validation: mockValidation,
      };

      mockAnalyzer.analyzeDomainComplexity.mockResolvedValue(mockAnalysis);
      mockValidator.validateNoCyclicDependencies.mockResolvedValue(mockValidation);
      mockSplitter.executeSplitting.mockResolvedValue(mockResult);

      // Act
      const result = await orchestrator.executeDomainSplit(domainPath, providedPlan);

      // Assert
      expect(mockAnalyzer.analyzeDomainComplexity).toHaveBeenCalledWith(domainPath);
      expect(mockAnalyzer.identifySubDomains).not.toHaveBeenCalled(); // Should not generate plans
      expect(mockSplitter.executeSplitting).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            sourceDomain: 'neural',
            targetSubDomains: expect.arrayContaining([
              expect.objectContaining({
                name: 'neural-custom',
              }),
            ]),
          }),
        ])
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Domain Analysis', () => {
    it('should analyze domain and provide recommendations', async () => {
      // Arrange
      const domainPath = 'src/coordination';
      const mockAnalysis = {
        domainPath,
        totalFiles: 15,
        categories: {},
        dependencies: { nodes: [], edges: [] },
        coupling: {
          tightlyCoupledGroups: [],
          averageCoupling: 0.4,
          maxCoupling: 0.6,
          isolatedFiles: [],
        },
        complexityScore: 7.2,
        splittingRecommendations: [],
      };

      const mockPlans = [
        {
          sourceDomain: 'coordination',
          targetSubDomains: [
            {
              name: 'coordination-core',
              description: 'Core coordination',
              estimatedFiles: 8,
              dependencies: ['utils'],
            },
          ],
        },
      ];

      const mockMetrics = {
        complexityReduction: 0.3,
        maintainabilityImprovement: 0.4,
        buildTimeImpact: -0.1,
        testTimeImpact: 0.2,
        migrationEffort: 4,
      };

      mockAnalyzer.analyzeDomainComplexity.mockResolvedValue(mockAnalysis);
      mockAnalyzer.identifySubDomains.mockResolvedValue(mockPlans);
      mockAnalyzer.calculateSplittingBenefits.mockResolvedValue(mockMetrics);

      // Act
      const result = await orchestrator.analyzeDomain(domainPath);

      // Assert
      expect(mockAnalyzer.analyzeDomainComplexity).toHaveBeenCalledWith(domainPath);
      expect(mockAnalyzer.identifySubDomains).toHaveBeenCalledWith(mockAnalysis);
      expect(mockAnalyzer.calculateSplittingBenefits).toHaveBeenCalledWith(mockPlans);

      expect(result).toEqual({
        analysis: mockAnalysis,
        recommendedPlans: mockPlans,
        benefits: mockMetrics,
      });
    });

    it('should handle domain with no splitting opportunities', async () => {
      // Arrange
      const domainPath = 'src/small-domain';
      const mockAnalysis = {
        domainPath,
        totalFiles: 3,
        categories: {},
        dependencies: { nodes: [], edges: [] },
        coupling: {
          tightlyCoupledGroups: [],
          averageCoupling: 0.1,
          maxCoupling: 0.2,
          isolatedFiles: [],
        },
        complexityScore: 2.0,
        splittingRecommendations: [],
      };

      const mockPlans: any[] = []; // No plans generated

      mockAnalyzer.analyzeDomainComplexity.mockResolvedValue(mockAnalysis);
      mockAnalyzer.identifySubDomains.mockResolvedValue(mockPlans);

      // Act
      const result = await orchestrator.analyzeDomain(domainPath);

      // Assert
      expect(result.analysis).toEqual(mockAnalysis);
      expect(result.recommendedPlans).toEqual([]);
      expect(result.benefits).toBeNull();
    });
  });

  describe('Neural Domain Splitting', () => {
    it('should split neural domain using predefined plan', async () => {
      // Arrange
      const mockAnalysis = {
        domainPath: 'src/neural',
        totalFiles: 25,
        categories: {
          'core-algorithms': ['neural-core.ts'],
          models: ['model1.ts', 'model2.ts'],
          agents: ['agent.ts'],
          coordination: ['coordinator.ts'],
          wasm: ['wasm-loader.ts'],
          bridge: ['bridge.ts'],
          'training-systems': [],
          'network-architectures': [],
          'data-processing': [],
          'evaluation-metrics': [],
          visualization: [],
          integration: [],
          utilities: [],
          tests: [],
          configuration: [],
        },
        dependencies: { nodes: [], edges: [] },
        coupling: {
          tightlyCoupledGroups: [],
          averageCoupling: 0.3,
          maxCoupling: 0.5,
          isolatedFiles: [],
        },
        complexityScore: 9.1,
        splittingRecommendations: [],
      };

      const mockValidation = {
        success: true,
        issues: [],
        metrics: {
          buildSuccess: true,
          testSuccess: true,
          noCircularDependencies: true,
          allImportsResolved: true,
        },
      };

      const mockResult = {
        success: true,
        subDomainsCreated: 6,
        filesMoved: 25,
        importsUpdated: 15,
        validation: mockValidation,
      };

      mockAnalyzer.analyzeDomainComplexity.mockResolvedValue(mockAnalysis);
      mockValidator.validateNoCyclicDependencies.mockResolvedValue(mockValidation);
      mockSplitter.executeSplitting.mockResolvedValue(mockResult);

      // Act
      const result = await orchestrator.splitNeuralDomain();

      // Assert
      expect(mockAnalyzer.analyzeDomainComplexity).toHaveBeenCalledWith('src/neural');
      expect(mockSplitter.executeSplitting).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            sourceDomain: 'neural',
            targetSubDomains: expect.arrayContaining([
              expect.objectContaining({ name: 'neural-core' }),
              expect.objectContaining({ name: 'neural-models' }),
              expect.objectContaining({ name: 'neural-agents' }),
              expect.objectContaining({ name: 'neural-coordination' }),
              expect.objectContaining({ name: 'neural-wasm' }),
              expect.objectContaining({ name: 'neural-bridge' }),
            ]),
          }),
        ])
      );

      expect(result.success).toBe(true);
      expect(result.subDomainsCreated).toBe(6);
    });
  });

  describe('Split Validation', () => {
    it('should validate domain split comprehensively', async () => {
      // Arrange
      const mockPlans = [
        {
          sourceDomain: 'test',
          targetSubDomains: [
            {
              name: 'test-core',
              description: 'Core functionality',
              estimatedFiles: 5,
              dependencies: [],
            },
          ],
        },
      ];

      const mockCyclicValidation = {
        success: true,
        issues: [],
        metrics: {
          buildSuccess: true,
          testSuccess: true,
          noCircularDependencies: true,
          allImportsResolved: true,
        },
      };

      const mockApiValidation = {
        compatibleAPIs: ['api1', 'api2'],
        breakingChanges: [],
        deprecations: [],
      };

      const mockBuildValidation = {
        success: true,
        buildTime: 1500,
        errors: [],
        warnings: [],
      };

      mockValidator.validateNoCyclicDependencies.mockResolvedValue(mockCyclicValidation);
      mockValidator.ensurePublicAPIStability.mockResolvedValue(mockApiValidation);
      mockValidator.verifyBuildIntegrity.mockResolvedValue(mockBuildValidation);

      // Act
      const result = await orchestrator.validateSplit(mockPlans);

      // Assert
      expect(mockValidator.validateNoCyclicDependencies).toHaveBeenCalledWith(mockPlans);
      expect(mockValidator.ensurePublicAPIStability).toHaveBeenCalledWith(mockPlans);
      expect(mockValidator.verifyBuildIntegrity).toHaveBeenCalledWith(mockPlans);

      expect(result).toEqual({
        cyclicDependencies: mockCyclicValidation,
        apiStability: mockApiValidation,
        buildIntegrity: mockBuildValidation,
        overall: true,
      });
    });

    it('should report overall failure when components fail', async () => {
      // Arrange
      const mockPlans = [
        {
          sourceDomain: 'test',
          targetSubDomains: [
            {
              name: 'test-core',
              description: 'Core functionality',
              estimatedFiles: 5,
              dependencies: [],
            },
          ],
        },
      ];

      const mockCyclicValidation = {
        success: false,
        issues: [
          {
            type: 'circular-dependency' as const,
            description: 'Cycle found',
            severity: 'error' as const,
          },
        ],
        metrics: {
          buildSuccess: false,
          testSuccess: true,
          noCircularDependencies: false,
          allImportsResolved: true,
        },
      };

      const mockApiValidation = { compatibleAPIs: [], breakingChanges: [], deprecations: [] };
      const mockBuildValidation = { success: true, buildTime: 1500, errors: [], warnings: [] };

      mockValidator.validateNoCyclicDependencies.mockResolvedValue(mockCyclicValidation);
      mockValidator.ensurePublicAPIStability.mockResolvedValue(mockApiValidation);
      mockValidator.verifyBuildIntegrity.mockResolvedValue(mockBuildValidation);

      // Act
      const result = await orchestrator.validateSplit(mockPlans);

      // Assert
      expect(result.overall).toBe(false); // Should fail overall due to cyclic validation failure
      expect(result.cyclicDependencies.success).toBe(false);
    });
  });
});
