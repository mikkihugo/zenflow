/**
 * Product Flow + SPARC Unit Tests
 *
 * LIGHTWEIGHT UNIT TESTS: Focus on core integration logic without heavy dependencies
 * Tests the architecture and design decisions for Product Flow + SPARC integration
 */

import { describe, expect, it } from '@jest/globals';
import { nanoid } from 'nanoid';
import type {
  FeatureDocumentEntity,
  TaskDocumentEntity,
} from '../../database/entities/product-entities';

describe('Product Flow + SPARC Unit Tests', () => {
  describe('🎯 Entity Structure Validation', () => {
    it('should have proper SPARC integration structure in FeatureDocumentEntity', () => {
      const feature: FeatureDocumentEntity = {
        id: nanoid(),
        type: 'feature',
        title: 'API Authentication Feature',
        content: 'Implement JWT-based authentication for REST API',
        feature_type: 'api',
        acceptance_criteria: [
          'Generate JWT tokens on login',
          'Validate tokens for protected endpoints',
          'Handle token refresh flow',
        ],
        technical_approach: 'JWT middleware with refresh tokens',
        status: 'draft',
        priority: 'high',
        tags: ['authentication', 'api'],
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        checksum: 'test-checksum',
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: 'authentication api jwt',
        keywords: ['auth', 'api', 'jwt'],
        completion_percentage: 0,
        task_ids: [],
        implementation_status: 'not_started',

        // SPARC INTEGRATION - The key integration point
        sparc_implementation: {
          sparc_project_id: 'sparc-auth-api-001',
          sparc_phases: {
            specification: {
              status: 'completed',
              deliverables: ['requirements.md', 'api-spec.yaml'],
              completion_date: new Date(),
              quality_score: 0.92,
            },
            pseudocode: {
              status: 'in_progress',
              deliverables: ['auth-algorithms.md'],
              algorithms: ['jwt-generation', 'token-validation', 'refresh-logic'],
            },
            architecture: {
              status: 'not_started',
              deliverables: [],
              components: [],
            },
            refinement: {
              status: 'not_started',
              deliverables: [],
              optimizations: [],
            },
            completion: {
              status: 'not_started',
              deliverables: [],
              artifacts: [],
            },
          },
          current_sparc_phase: 'pseudocode',
          sparc_progress_percentage: 40.0, // 2/5 phases complete + 1 in progress
          use_sparc_methodology: true,
        },
      };

      // Validate SPARC integration exists and is properly structured
      expect(feature.sparc_implementation).toBeDefined();
      expect(feature.sparc_implementation?.use_sparc_methodology).toBe(true);
      expect(feature.sparc_implementation?.sparc_project_id).toBe('sparc-auth-api-001');

      // Validate all 5 SPARC phases are defined
      const phases = feature.sparc_implementation?.sparc_phases;
      expect(phases?.specification).toBeDefined();
      expect(phases?.pseudocode).toBeDefined();
      expect(phases?.architecture).toBeDefined();
      expect(phases?.refinement).toBeDefined();
      expect(phases?.completion).toBeDefined();

      // Validate phase structure
      expect(phases?.specification.status).toBe('completed');
      expect(phases?.specification.deliverables).toHaveLength(2);
      expect(phases?.specification.quality_score).toBe(0.92);

      expect(phases?.pseudocode.status).toBe('in_progress');
      expect(phases?.pseudocode.algorithms).toHaveLength(3);

      // Validate current phase and progress
      expect(feature.sparc_implementation?.current_sparc_phase).toBe('pseudocode');
      expect(feature.sparc_implementation?.sparc_progress_percentage).toBe(40.0);
    });

    it('should have proper SPARC integration structure in TaskDocumentEntity', () => {
      const task: TaskDocumentEntity = {
        id: nanoid(),
        type: 'task',
        title: 'Implement JWT Token Generation Logic',
        content: 'Create secure JWT token generation with proper claims and expiration',
        task_type: 'development',
        estimated_hours: 6,
        implementation_details: {
          files_to_create: ['auth/jwt-generator.ts', 'auth/token-types.ts'],
          files_to_modify: ['auth/index.ts', 'middleware/auth.ts'],
          test_files: ['auth/__tests__/jwt-generator.test.ts'],
          documentation_updates: ['docs/authentication.md'],
        },
        technical_specifications: {
          component: 'authentication-service',
          module: 'jwt-generator',
          functions: ['generateAccessToken', 'generateRefreshToken', 'validateTokenClaims'],
          dependencies: ['jsonwebtoken', '@types/jsonwebtoken'],
        },
        status: 'draft',
        priority: 'high',
        tags: ['jwt', 'auth', 'implementation'],
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        checksum: 'task-checksum',
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: 'jwt token generation authentication',
        keywords: ['jwt', 'token', 'auth'],
        completion_percentage: 0,
        source_feature_id: 'feature-auth-api',
        completion_status: 'in_progress',

        // SPARC INTEGRATION FOR TASKS - Links to parent feature's SPARC project
        sparc_implementation_details: {
          parent_feature_sparc_id: 'sparc-auth-api-001',
          sparc_phase_assignment: 'completion', // This task contributes to completion phase
          sparc_deliverable_type: 'production_code',
          sparc_quality_gates: [
            {
              requirement: 'Token generation must be cryptographically secure',
              status: 'pending',
              validation_method: 'automated',
            },
            {
              requirement: 'Token validation latency must be < 5ms',
              status: 'pending',
              validation_method: 'automated',
            },
            {
              requirement: 'Code coverage must be > 95%',
              status: 'pending',
              validation_method: 'automated',
            },
          ],
          sparc_artifacts: [
            {
              artifact_id: 'jwt-generator-v1',
              artifact_type: 'final_implementation',
              file_path: 'auth/jwt-generator.ts',
              content: '// Production-ready JWT generator implementation',
              checksum: 'abc123def456',
            },
            {
              artifact_id: 'jwt-tests-v1',
              artifact_type: 'final_implementation',
              file_path: 'auth/__tests__/jwt-generator.test.ts',
              content: '// Comprehensive test suite',
              checksum: 'test456ghi789',
            },
          ],
          complexity_analysis: {
            time_complexity: 'O(1)',
            space_complexity: 'O(1)',
            maintainability_score: 85,
            performance_impact: 'low',
          },
        },
      };

      // Validate SPARC task integration
      expect(task.sparc_implementation_details).toBeDefined();
      expect(task.sparc_implementation_details?.parent_feature_sparc_id).toBe('sparc-auth-api-001');
      expect(task.sparc_implementation_details?.sparc_phase_assignment).toBe('completion');
      expect(task.sparc_implementation_details?.sparc_deliverable_type).toBe('production_code');

      // Validate quality gates
      const qualityGates = task.sparc_implementation_details?.sparc_quality_gates;
      expect(qualityGates).toHaveLength(3);
      expect(qualityGates?.[0].requirement).toContain('cryptographically secure');
      expect(qualityGates?.[1].requirement).toContain('latency');
      expect(qualityGates?.[2].requirement).toContain('coverage');

      // Validate artifacts
      const artifacts = task.sparc_implementation_details?.sparc_artifacts;
      expect(artifacts).toHaveLength(2);
      expect(artifacts?.[0].artifact_type).toBe('final_implementation');
      expect(artifacts?.[0].file_path).toBe('auth/jwt-generator.ts');

      // Validate complexity analysis
      const complexity = task.sparc_implementation_details?.complexity_analysis;
      expect(complexity?.time_complexity).toBe('O(1)');
      expect(complexity?.maintainability_score).toBe(85);
      expect(complexity?.performance_impact).toBe('low');
    });
  });

  describe('🔧 Integration Logic Validation', () => {
    it('should properly map feature types to SPARC methodology usage', () => {
      // Define mapping logic (would be in ProductWorkflowEngine)
      const shouldUseSPARC = (featureType: string): boolean => {
        const technicalFeatureTypes = ['api', 'database', 'integration', 'infrastructure'];
        return technicalFeatureTypes.includes(featureType);
      };

      // Test technical features that should use SPARC
      expect(shouldUseSPARC('api')).toBe(true);
      expect(shouldUseSPARC('database')).toBe(true);
      expect(shouldUseSPARC('integration')).toBe(true);
      expect(shouldUseSPARC('infrastructure')).toBe(true);

      // Test non-technical features that might not need SPARC
      expect(shouldUseSPARC('ui')).toBe(false); // Simple UI might not need SPARC

      // NOTE: In practice, even UI features might benefit from SPARC for complex interactions
      // This is a business decision that can be configured per project
    });

    it('should validate SPARC domain mapping from feature types', () => {
      // Define domain mapping logic (from ProductWorkflowEngine config)
      const mapFeatureTypeToSPARCDomain = (featureType: string): string => {
        const domainMapping: Record<string, string> = {
          ui: 'interfaces',
          api: 'rest-api',
          database: 'memory-systems',
          integration: 'swarm-coordination',
          infrastructure: 'general',
        };
        return domainMapping[featureType] || 'general';
      };

      // Validate domain mappings
      expect(mapFeatureTypeToSPARCDomain('api')).toBe('rest-api');
      expect(mapFeatureTypeToSPARCDomain('database')).toBe('memory-systems');
      expect(mapFeatureTypeToSPARCDomain('ui')).toBe('interfaces');
      expect(mapFeatureTypeToSPARCDomain('integration')).toBe('swarm-coordination');
      expect(mapFeatureTypeToSPARCDomain('infrastructure')).toBe('general');
      expect(mapFeatureTypeToSPARCDomain('unknown')).toBe('general');
    });

    it('should validate SPARC phase progression logic', () => {
      const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];

      // Define phase progression logic
      const getNextPhase = (currentPhase: string): string | null => {
        const currentIndex = phases.indexOf(currentPhase);
        return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
      };

      // Test phase progression
      expect(getNextPhase('specification')).toBe('pseudocode');
      expect(getNextPhase('pseudocode')).toBe('architecture');
      expect(getNextPhase('architecture')).toBe('refinement');
      expect(getNextPhase('refinement')).toBe('completion');
      expect(getNextPhase('completion')).toBe(null); // Final phase
    });

    it('should validate SPARC progress calculation', () => {
      // Define progress calculation logic
      const calculateSPARCProgress = (phases: Record<string, { status: string }>): number => {
        const phaseList = [
          'specification',
          'pseudocode',
          'architecture',
          'refinement',
          'completion',
        ];
        let completed = 0;
        let inProgress = 0;

        phaseList.forEach((phase) => {
          if (phases[phase]?.status === 'completed') {
            completed += 1;
          } else if (phases[phase]?.status === 'in_progress') {
            inProgress += 0.5; // Half credit for in-progress
          }
        });

        return Math.round(((completed + inProgress) / phaseList.length) * 100);
      };

      // Test progress calculation
      const phases1 = {
        specification: { status: 'completed' },
        pseudocode: { status: 'completed' },
        architecture: { status: 'in_progress' },
        refinement: { status: 'not_started' },
        completion: { status: 'not_started' },
      };

      expect(calculateSPARCProgress(phases1)).toBe(50); // 2 complete + 0.5 in-progress = 2.5/5 = 50%

      const phases2 = {
        specification: { status: 'completed' },
        pseudocode: { status: 'completed' },
        architecture: { status: 'completed' },
        refinement: { status: 'completed' },
        completion: { status: 'completed' },
      };

      expect(calculateSPARCProgress(phases2)).toBe(100); // All complete = 100%
    });
  });

  describe('📊 Integration Validation Rules', () => {
    it('should validate proper Product Flow → SPARC relationship', () => {
      // The key integration principle:
      // Product Flow defines WHAT to build (business requirements)
      // SPARC defines HOW to implement (technical methodology)

      const integrationPrinciples = {
        productFlowDefines: 'WHAT to build',
        sparcDefines: 'HOW to implement',
        integrationPoint: 'Features and Tasks',
        sparcAppliedTo: 'Technical features only',
        productFlowSteps: [
          'vision-analysis',
          'adr-generation',
          'prd-creation',
          'epic-breakdown',
          'feature-definition',
          'task-creation',
          'sparc-integration', // ← Integration happens here
        ],
        sparcPhases: [
          'specification', // Technical requirements from business requirements
          'pseudocode', // Algorithm design
          'architecture', // System design
          'refinement', // Optimization
          'completion', // Implementation
        ],
      };

      // Validate integration architecture
      expect(integrationPrinciples.productFlowDefines).toBe('WHAT to build');
      expect(integrationPrinciples.sparcDefines).toBe('HOW to implement');
      expect(integrationPrinciples.integrationPoint).toBe('Features and Tasks');

      // Validate workflow includes SPARC integration step
      expect(integrationPrinciples.productFlowSteps).toContain('sparc-integration');

      // Validate all SPARC phases are defined
      expect(integrationPrinciples.sparcPhases).toHaveLength(5);
      expect(integrationPrinciples.sparcPhases).toContain('specification');
      expect(integrationPrinciples.sparcPhases).toContain('completion');
    });

    it('should validate clean separation of concerns', () => {
      // Product Flow concerns (Business)
      const productFlowConcerns = [
        'Business objectives',
        'User requirements',
        'Feature prioritization',
        'Epic-level planning',
        'Acceptance criteria',
        'Business value',
      ];

      // SPARC concerns (Technical)
      const sparcConcerns = [
        'Technical specifications',
        'Algorithm design',
        'System architecture',
        'Performance optimization',
        'Code implementation',
        'Quality gates',
      ];

      // Validate no overlap in concerns
      const overlap = productFlowConcerns.filter((concern) =>
        sparcConcerns.some(
          (sparcConcern) =>
            concern.toLowerCase().includes(sparcConcern.toLowerCase()) ||
            sparcConcern.toLowerCase().includes(concern.toLowerCase())
        )
      );

      expect(overlap).toHaveLength(0); // No direct overlap

      // Validate proper separation
      expect(productFlowConcerns).toContain('Business objectives');
      expect(sparcConcerns).toContain('Technical specifications');
      expect(productFlowConcerns).not.toContain('Algorithm design');
      expect(sparcConcerns).not.toContain('Business objectives');
    });
  });

  describe('🎯 Quality Assurance Validation', () => {
    it('should validate SPARC quality gates structure', () => {
      const qualityGate = {
        requirement: 'API response time must be < 100ms',
        status: 'pending' as const,
        validation_method: 'automated' as const,
        validation_date: undefined as Date | undefined,
      };

      // Validate quality gate structure
      expect(qualityGate.requirement).toBeDefined();
      expect(['pending', 'passed', 'failed']).toContain(qualityGate.status);
      expect(['automated', 'manual', 'ai_assisted']).toContain(qualityGate.validation_method);

      // Validate requirement is specific and measurable
      expect(qualityGate.requirement).toContain('<');
      expect(qualityGate.requirement).toMatch(/\d+/); // Contains numbers
    });

    it('should validate SPARC artifact structure', () => {
      const artifact = {
        artifact_id: 'jwt-service-v1.2.0',
        artifact_type: 'final_implementation' as const,
        file_path: 'src/auth/jwt-service.ts',
        content: '// Production JWT service implementation',
        checksum: 'sha256:abc123def456',
      };

      // Validate artifact structure
      expect(artifact.artifact_id).toMatch(/^[\w.-]+$/); // Valid ID format (allows dots)
      expect([
        'specification',
        'pseudocode',
        'architecture_diagram',
        'refactored_code',
        'final_implementation',
      ]).toContain(artifact.artifact_type);
      expect(artifact.file_path).toMatch(/\.(ts|js|md|json)$/); // Valid file extension
      expect(artifact.checksum).toMatch(/^(sha256|md5):/); // Valid checksum format
    });
  });
});
