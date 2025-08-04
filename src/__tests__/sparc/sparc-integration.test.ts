/**
 * SPARC Engine Integration Tests
 *
 * Comprehensive tests for the SPARC methodology system using London TDD approach
 * for testing interactions and protocols.
 */

import { SPARCEngineCore } from '../sparc/core/sparc-engine';
import { sparcMCPTools } from '../sparc/integrations/mcp-sparc-tools';
import { SpecificationPhaseEngine } from '../sparc/phases/specification/specification-engine';
import type {
  ProjectDomain,
  ProjectSpecification,
  SPARCPhase,
  SPARCProject,
} from '../sparc/types/sparc-types';

describe('SPARC Methodology System - Integration Tests (London TDD)', () => {
  let sparcEngine: SPARCEngineCore;
  let specificationEngine: SpecificationPhaseEngine;

  beforeEach(() => {
    sparcEngine = new SPARCEngineCore();
    specificationEngine = new SpecificationPhaseEngine();
  });

  describe('🚀 SPARC Project Lifecycle', () => {
    describe('Project Initialization', () => {
      it('should initialize a new SPARC project with complete setup', async () => {
        // Arrange
        const projectSpec: ProjectSpecification = {
          name: 'Intelligent Load Balancer',
          domain: 'swarm-coordination',
          complexity: 'high',
          requirements: [
            'Distribute tasks optimally across agents',
            'Handle agent failures gracefully',
            'Support 1000+ concurrent agents',
          ],
          constraints: ['Sub-100ms response time', 'TypeScript implementation'],
        };

        // Act
        const project = await sparcEngine.initializeProject(projectSpec);

        // Assert
        expect(project).toBeDefined();
        expect(project.id).toMatch(/^[a-zA-Z0-9_-]+$/);
        expect(project.name).toBe('Intelligent Load Balancer');
        expect(project.domain).toBe('swarm-coordination');
        expect(project.currentPhase).toBe('specification');
        expect(project.progress.overallProgress).toBe(0);
        expect(project.progress.completedPhases).toHaveLength(0);
        expect(project.metadata.createdAt).toBeInstanceOf(Date);
        expect(project.metadata.version).toBe('1.0.0');

        // Verify initial structure
        expect(project.specification.functionalRequirements).toHaveLength(0);
        expect(project.pseudocode.algorithms).toHaveLength(0);
        expect(project.architecture.systemArchitecture.components).toHaveLength(0);
        expect(project.refinements).toHaveLength(0);
        expect(project.implementation.sourceCode).toHaveLength(0);
      }, 10000);

      it('should handle different domain types correctly', async () => {
        const domains: ProjectDomain[] = [
          'neural-networks',
          'wasm-integration',
          'rest-api',
          'memory-systems',
        ];

        for (const domain of domains) {
          const projectSpec: ProjectSpecification = {
            name: `Test ${domain} Project`,
            domain,
            complexity: 'moderate',
            requirements: ['Basic functionality', 'Performance optimization'],
          };

          const project = await sparcEngine.initializeProject(projectSpec);

          expect(project.domain).toBe(domain);
          expect(project.name).toBe(`Test ${domain} Project`);
        }
      });
    });

    describe('Phase Execution', () => {
      let testProject: SPARCProject;

      beforeEach(async () => {
        const projectSpec: ProjectSpecification = {
          name: 'Test Swarm System',
          domain: 'swarm-coordination',
          complexity: 'high',
          requirements: ['Agent coordination', 'Task distribution', 'Health monitoring'],
        };
        testProject = await sparcEngine.initializeProject(projectSpec);
      });

      it('should execute specification phase successfully', async () => {
        // Act
        const result = await sparcEngine.executePhase(testProject, 'specification');

        // Assert
        expect(result.success).toBe(true);
        expect(result.phase).toBe('specification');
        expect(result.metrics.duration).toBeGreaterThan(0);
        expect(result.metrics.qualityScore).toBeGreaterThan(0.5);
        expect(result.metrics.completeness).toBeGreaterThan(0.8);
        expect(result.deliverables).toHaveLength(1);
        expect(result.nextPhase).toBe('pseudocode');
        expect(result.recommendations).toContain(
          'Ensure all stakeholder requirements are captured'
        );

        // Verify project state updated
        expect(testProject.currentPhase).toBe('specification');
        expect(testProject.progress.completedPhases).toContain('specification');
        expect(testProject.progress.overallProgress).toBe(0.2); // 1/5 phases completed
        expect(testProject.progress.phaseStatus.specification.status).toBe('completed');
      });

      it('should execute all phases in sequence', async () => {
        const phases: SPARCPhase[] = [
          'specification',
          'pseudocode',
          'architecture',
          'refinement',
          'completion',
        ];

        for (const phase of phases) {
          const result = await sparcEngine.executePhase(testProject, phase);

          expect(result.success).toBe(true);
          expect(result.phase).toBe(phase);
          expect(testProject.progress.completedPhases).toContain(phase);
        }

        expect(testProject.progress.completedPhases).toHaveLength(5);
        expect(testProject.progress.overallProgress).toBe(1.0);
      }, 15000);

      it('should provide phase-specific recommendations', async () => {
        const phases: SPARCPhase[] = ['specification', 'pseudocode', 'architecture'];
        const expectedRecommendations = {
          specification: ['Ensure all stakeholder requirements are captured'],
          pseudocode: ['Optimize algorithm complexity where possible'],
          architecture: ['Apply appropriate architectural patterns'],
        };

        for (const phase of phases) {
          const result = await sparcEngine.executePhase(testProject, phase);
          expect(result.recommendations).toEqual(
            expect.arrayContaining([
              expect.stringContaining(expectedRecommendations[phase][0].split(' ')[0]),
            ])
          );
        }
      });
    });

    describe('Artifact Generation', () => {
      let testProject: SPARCProject;

      beforeEach(async () => {
        const projectSpec: ProjectSpecification = {
          name: 'Artifact Test Project',
          domain: 'swarm-coordination',
          complexity: 'moderate',
          requirements: ['Core functionality'],
        };
        testProject = await sparcEngine.initializeProject(projectSpec);
      });

      it('should generate comprehensive artifact set', async () => {
        // Act
        const artifactSet = await sparcEngine.generateArtifacts(testProject);

        // Assert
        expect(artifactSet).toBeDefined();
        expect(artifactSet.artifacts).toHaveLength(4); // spec, arch, impl, tests
        expect(artifactSet.metadata.totalSize).toBeGreaterThan(0);
        expect(artifactSet.metadata.author).toBe('SPARC Engine');
        expect(artifactSet.relationships).toHaveLength(3);

        // Verify artifact types
        const artifactTypes = artifactSet.artifacts.map((a) => a.type);
        expect(artifactTypes).toContain('specification-document');
        expect(artifactTypes).toContain('architecture-document');
        expect(artifactTypes).toContain('source-code');
        expect(artifactTypes).toContain('test-suite');

        // Verify relationships
        expect(artifactSet.relationships[0].type).toBe('generates');
        expect(artifactSet.relationships[1].type).toBe('implements');
        expect(artifactSet.relationships[2].type).toBe('validates');
      });
    });

    describe('Completion Validation', () => {
      let testProject: SPARCProject;

      beforeEach(async () => {
        const projectSpec: ProjectSpecification = {
          name: 'Validation Test Project',
          domain: 'swarm-coordination',
          complexity: 'simple',
          requirements: ['Basic functionality'],
        };
        testProject = await sparcEngine.initializeProject(projectSpec);
      });

      it('should validate incomplete project correctly', async () => {
        // Act - validate project without completing phases
        const validation = await sparcEngine.validateCompletion(testProject);

        // Assert
        expect(validation.readyForProduction).toBe(false);
        expect(validation.score).toBeLessThan(0.8);
        expect(validation.blockers).toContain('all-phases-completed: 0/5 phases completed');
        expect(validation.warnings).toContain('specification-quality could be improved');
      });

      it('should validate complete project correctly', async () => {
        // Arrange - complete all phases
        const phases: SPARCPhase[] = [
          'specification',
          'pseudocode',
          'architecture',
          'refinement',
          'completion',
        ];
        for (const phase of phases) {
          await sparcEngine.executePhase(testProject, phase);
        }

        // Add some mock implementation data
        testProject.specification.functionalRequirements.push({
          id: 'FR-001',
          title: 'Test Requirement',
          description: 'Test',
          priority: 'HIGH',
          testCriteria: ['Test criteria'],
        });
        testProject.architecture.systemArchitecture.components.push({
          name: 'TestComponent',
          type: 'service',
          responsibilities: ['Test'],
          interfaces: ['ITest'],
          dependencies: [],
          qualityAttributes: {},
        });
        testProject.implementation.sourceCode.push({
          path: 'test.ts',
          content: 'test content',
          language: 'typescript',
          type: 'implementation',
          dependencies: [],
        });
        testProject.implementation.testSuites.push({
          name: 'Test Suite',
          type: 'unit',
          tests: [],
          coverage: { lines: 0, functions: 0, branches: 0, statements: 0 },
        });

        // Act
        const validation = await sparcEngine.validateCompletion(testProject);

        // Assert
        expect(validation.readyForProduction).toBe(true);
        expect(validation.score).toBeGreaterThan(0.8);
        expect(validation.blockers).toHaveLength(0);
      }, 20000);
    });
  });

  describe('🔧 Specification Phase Engine', () => {
    describe('Requirements Gathering', () => {
      it('should gather domain-specific requirements', async () => {
        // Arrange
        const context = {
          domain: 'swarm-coordination' as ProjectDomain,
          teamSize: 5,
          timeline: 90,
          constraints: ['Performance critical', 'High availability'],
        };

        // Act
        const requirements = await specificationEngine.gatherRequirements(context);

        // Assert
        expect(requirements).toBeDefined();
        expect(requirements.length).toBeGreaterThan(5);

        // Should have both functional and non-functional requirements
        const functionalReqs = requirements.filter((req) => 'testCriteria' in req);
        const nonFunctionalReqs = requirements.filter((req) => 'metrics' in req);

        expect(functionalReqs.length).toBeGreaterThan(0);
        expect(nonFunctionalReqs.length).toBeGreaterThan(0);
      });

      it('should include domain-specific requirements for swarm coordination', async () => {
        const context = { domain: 'swarm-coordination' as ProjectDomain };
        const requirements = await specificationEngine.gatherRequirements(context);

        const functionalReqs = requirements.filter((req) => 'testCriteria' in req);
        const swarmSpecificReqs = functionalReqs.filter(
          (req) =>
            req.id.includes('SWM') ||
            req.title.toLowerCase().includes('agent') ||
            req.title.toLowerCase().includes('swarm')
        );

        expect(swarmSpecificReqs.length).toBeGreaterThan(0);
      });
    });

    describe('Constraint Analysis', () => {
      it('should analyze constraints from requirements', async () => {
        const mockRequirements = [
          {
            id: 'NFR-001',
            title: 'Performance Requirements',
            description: 'System performance benchmarks',
            metrics: { 'response-time': '<100ms' },
            priority: 'HIGH' as const,
          },
        ] as any[];

        const constraints = await specificationEngine.analyzeConstraints(mockRequirements);

        expect(constraints).toBeDefined();
        expect(constraints.length).toBeGreaterThan(2);

        // Should identify technical and performance constraints
        const technicalConstraints = constraints.filter(
          (c) => 'type' in c && c.type === 'technical'
        );
        const performanceConstraints = constraints.filter(
          (c) => 'type' in c && c.type === 'performance'
        );

        expect(technicalConstraints.length).toBeGreaterThan(0);
        expect(performanceConstraints.length).toBeGreaterThan(0);
      });
    });

    describe('Specification Document Generation', () => {
      it('should generate comprehensive specification document', async () => {
        const mockAnalysis = [
          {
            id: 'SC-001',
            type: 'technical' as const,
            description: 'TypeScript implementation required',
            impact: 'medium' as const,
          },
          {
            id: 'PA-001',
            description: 'Users have basic technical knowledge',
            confidence: 'medium' as const,
            riskIfIncorrect: 'MEDIUM' as const,
          },
        ] as any[];

        const spec = await specificationEngine.generateSpecificationDocument(mockAnalysis);

        expect(spec).toBeDefined();
        expect(spec.functionalRequirements).toBeDefined();
        expect(spec.nonFunctionalRequirements).toBeDefined();
        expect(spec.constraints).toBeDefined();
        expect(spec.assumptions).toBeDefined();
        expect(spec.dependencies).toBeDefined();
        expect(spec.acceptanceCriteria).toBeDefined();
        expect(spec.riskAssessment).toBeDefined();
        expect(spec.successMetrics).toBeDefined();

        // Verify risk assessment structure
        expect(spec.riskAssessment.risks.length).toBeGreaterThan(0);
        expect(spec.riskAssessment.mitigationStrategies.length).toBeGreaterThan(0);
        expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(spec.riskAssessment.overallRisk);
      });
    });

    describe('Specification Validation', () => {
      it('should validate specification completeness', async () => {
        const mockSpec = {
          functionalRequirements: [
            {
              id: 'FR-001',
              title: 'Test',
              description: 'Test',
              priority: 'HIGH',
              testCriteria: ['test'],
            },
          ],
          nonFunctionalRequirements: [
            {
              id: 'NFR-001',
              title: 'Performance',
              description: 'Test',
              metrics: { latency: '<100ms' },
              priority: 'HIGH',
            },
          ],
          constraints: [],
          assumptions: [],
          dependencies: [],
          acceptanceCriteria: [
            {
              id: 'AC-001',
              requirement: 'FR-001',
              criteria: ['test'],
              testMethod: 'automated' as const,
            },
          ],
          riskAssessment: {
            risks: [
              {
                id: 'R-001',
                description: 'Test risk',
                probability: 'low' as const,
                impact: 'low' as const,
                category: 'technical' as const,
              },
            ],
            mitigationStrategies: [],
            overallRisk: 'LOW' as const,
          },
          successMetrics: [
            {
              id: 'SM-001',
              name: 'Coverage',
              description: 'Test coverage',
              target: '90%',
              measurement: 'automated',
            },
          ],
        } as any;

        const validation = await specificationEngine.validateSpecificationCompleteness(mockSpec);

        expect(validation.overall).toBe(true);
        expect(validation.score).toBeGreaterThan(0.8);
        expect(validation.results.every((r) => r.passed)).toBe(true);
        expect(validation.recommendations).toContain(
          'Specification is complete - proceed to pseudocode phase'
        );
      });
    });
  });

  describe('🔌 MCP Integration', () => {
    describe('SPARC MCP Tools', () => {
      it('should provide comprehensive tool definitions', () => {
        const tools = sparcMCPTools.getTools();

        expect(tools).toHaveLength(7);

        const toolNames = tools.map((t) => t.name);
        expect(toolNames).toContain('sparc_create_project');
        expect(toolNames).toContain('sparc_execute_phase');
        expect(toolNames).toContain('sparc_get_project_status');
        expect(toolNames).toContain('sparc_generate_artifacts');
        expect(toolNames).toContain('sparc_validate_completion');
        expect(toolNames).toContain('sparc_list_projects');
        expect(toolNames).toContain('sparc_refine_implementation');

        // Verify tool schemas
        tools.forEach((tool) => {
          expect(tool.inputSchema).toBeDefined();
          expect(tool.description).toBeDefined();
          expect(tool.description.length).toBeGreaterThan(10);
        });
      });

      it('should handle project creation via MCP', async () => {
        const args = {
          name: 'MCP Test Project',
          domain: 'swarm-coordination',
          complexity: 'moderate',
          requirements: ['Agent coordination', 'Task distribution'],
        };

        const result = await sparcMCPTools.handleToolCall('sparc_create_project', args);

        expect(result.success).toBe(true);
        expect(result.projectId).toBeDefined();
        expect(result.project.name).toBe('MCP Test Project');
        expect(result.project.domain).toBe('swarm-coordination');
        expect(result.nextSteps).toContain('Execute specification phase to analyze requirements');
      });

      it('should handle phase execution via MCP', async () => {
        // First create a project
        const createArgs = {
          name: 'Phase Test Project',
          domain: 'general',
          complexity: 'simple',
          requirements: ['Basic functionality'],
        };
        const createResult = await sparcMCPTools.handleToolCall('sparc_create_project', createArgs);

        // Then execute a phase
        const executeArgs = {
          projectId: createResult.projectId,
          phase: 'specification',
        };
        const executeResult = await sparcMCPTools.handleToolCall(
          'sparc_execute_phase',
          executeArgs
        );

        expect(executeResult.success).toBe(true);
        expect(executeResult.phase).toBe('specification');
        expect(executeResult.duration).toMatch(/\d+\.\d+ minutes/);
        expect(executeResult.nextPhase).toBe('pseudocode');
        expect(executeResult.recommendations).toBeDefined();
      });

      it('should handle project status retrieval via MCP', async () => {
        // Create and execute phases on a project
        const createArgs = {
          name: 'Status Test Project',
          domain: 'neural-networks',
          complexity: 'high',
          requirements: ['Neural network training', 'WASM acceleration'],
        };
        const createResult = await sparcMCPTools.handleToolCall('sparc_create_project', createArgs);

        const statusArgs = {
          projectId: createResult.projectId,
          includeDetails: true,
        };
        const statusResult = await sparcMCPTools.handleToolCall(
          'sparc_get_project_status',
          statusArgs
        );

        expect(statusResult.id).toBe(createResult.projectId);
        expect(statusResult.name).toBe('Status Test Project');
        expect(statusResult.domain).toBe('neural-networks');
        expect(statusResult.overallProgress).toBe('0.0%');
        expect(statusResult.specification).toBeDefined();
        expect(statusResult.artifacts).toBeDefined();
      });

      it('should list projects correctly via MCP', async () => {
        // Create multiple projects
        const projects = [
          {
            name: 'Project 1',
            domain: 'swarm-coordination',
            complexity: 'simple',
            requirements: ['test'],
          },
          {
            name: 'Project 2',
            domain: 'neural-networks',
            complexity: 'moderate',
            requirements: ['test'],
          },
        ];

        for (const project of projects) {
          await sparcMCPTools.handleToolCall('sparc_create_project', project);
        }

        const listResult = await sparcMCPTools.handleToolCall('sparc_list_projects', {});

        expect(listResult.totalProjects).toBeGreaterThanOrEqual(2);
        expect(listResult.projects).toBeDefined();
        expect(listResult.projects.length).toBeGreaterThanOrEqual(2);

        // Test domain filtering
        const filteredResult = await sparcMCPTools.handleToolCall('sparc_list_projects', {
          domain: 'swarm-coordination',
        });
        expect(filteredResult.projects.every((p: any) => p.domain === 'swarm-coordination')).toBe(
          true
        );
      });
    });
  });

  describe('📊 Performance and Quality Metrics', () => {
    it('should complete full SPARC cycle within performance targets', async () => {
      const startTime = Date.now();

      const projectSpec: ProjectSpecification = {
        name: 'Performance Test Project',
        domain: 'rest-api',
        complexity: 'moderate',
        requirements: ['API endpoints', 'Authentication', 'Data validation'],
      };

      // Full SPARC cycle
      const project = await sparcEngine.initializeProject(projectSpec);

      const phases: SPARCPhase[] = [
        'specification',
        'pseudocode',
        'architecture',
        'refinement',
        'completion',
      ];
      for (const phase of phases) {
        await sparcEngine.executePhase(project, phase);
      }

      const artifacts = await sparcEngine.generateArtifacts(project);
      const validation = await sparcEngine.validateCompletion(project);

      const totalTime = Date.now() - startTime;

      // Performance assertions
      expect(totalTime).toBeLessThan(10000); // Should complete in under 10 seconds
      expect(project.progress.overallProgress).toBe(1.0);
      expect(artifacts.artifacts.length).toBeGreaterThan(0);
      expect(validation.score).toBeGreaterThan(0.5);
    }, 15000);

    it('should maintain quality standards across different domains', async () => {
      const domains: ProjectDomain[] = ['swarm-coordination', 'neural-networks', 'memory-systems'];
      const qualityResults = [];

      for (const domain of domains) {
        const projectSpec: ProjectSpecification = {
          name: `Quality Test ${domain}`,
          domain,
          complexity: 'moderate',
          requirements: ['Core functionality', 'Performance optimization'],
        };

        const project = await sparcEngine.initializeProject(projectSpec);
        await sparcEngine.executePhase(project, 'specification');
        const validation = await sparcEngine.validateCompletion(project);

        qualityResults.push({
          domain,
          score: validation.score,
          blockers: validation.blockers.length,
        });
      }

      // All domains should maintain minimum quality
      qualityResults.forEach((result) => {
        expect(result.score).toBeGreaterThan(0.3); // Partial completion acceptable
      });
    }, 20000);
  });

  describe('🚨 Error Handling and Edge Cases', () => {
    it('should handle invalid project specifications gracefully', async () => {
      const invalidSpecs = [
        { name: '', domain: 'swarm-coordination', complexity: 'simple', requirements: [] },
        {
          name: 'Test',
          domain: 'invalid-domain' as any,
          complexity: 'simple',
          requirements: ['test'],
        },
        {
          name: 'Test',
          domain: 'swarm-coordination',
          complexity: 'invalid' as any,
          requirements: ['test'],
        },
      ];

      for (const spec of invalidSpecs) {
        try {
          await sparcEngine.initializeProject(spec);
          // If we get here, the validation didn't catch the invalid spec
          expect(true).toBe(false); // Force failure
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    it('should handle phase execution on non-existent project', async () => {
      try {
        // Mock project with invalid ID
        const mockProject = {
          id: 'non-existent-id',
          currentPhase: 'specification',
        } as any;

        await sparcEngine.executePhase(mockProject, 'specification');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle MCP tool calls with invalid arguments', async () => {
      const invalidCalls = [
        { tool: 'sparc_create_project', args: {} }, // Missing required fields
        { tool: 'sparc_execute_phase', args: { projectId: 'invalid' } }, // Missing phase
        { tool: 'sparc_get_project_status', args: {} }, // Missing projectId
        { tool: 'invalid_tool', args: {} }, // Invalid tool name
      ];

      for (const call of invalidCalls) {
        try {
          await sparcMCPTools.handleToolCall(call.tool, call.args);
          expect(true).toBe(false); // Should have thrown error
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      }
    });
  });
});
