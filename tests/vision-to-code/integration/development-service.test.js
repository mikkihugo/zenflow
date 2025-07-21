/**
 * Development Service Integration Tests
 * Tests for vision-to-code execution, Claude Code integration, and implementation workflows
 */

const { describe, it, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@jest/globals');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { 
  SERVICE_URLS, 
  mockVisions,
  mockAgentConfigurations,
  performanceBenchmarks,
  testHelpers
} = require('../fixtures/vision-workflow-fixtures');

describe('Development Service Integration Tests', () => {
  let developmentServiceClient;
  let testSessionId;
  let testWorkspaceDir;
  let authToken;

  beforeAll(async () => {
    // Initialize HTTP client for Development Service
    developmentServiceClient = axios.create({
      baseURL: SERVICE_URLS.DEVELOPMENT,
      timeout: 30000, // Extended timeout for code generation
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Authenticate with development service
    try {
      const authResponse = await developmentServiceClient.post('/auth/claude-token', {
        service_name: 'test_development_client',
        permissions: ['code_generation', 'file_operations', 'git_operations']
      });
      authToken = authResponse.data.token;
      developmentServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      console.warn('Development service authentication failed, using mock token:', error.message);
      authToken = 'mock_development_token';
      developmentServiceClient.defaults.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Create test workspace directory
    testWorkspaceDir = path.join(process.cwd(), 'test-workspace', `session_${Date.now()}`);
    await fs.mkdir(testWorkspaceDir, { recursive: true });
  });

  beforeEach(() => {
    testSessionId = `dev_session_${Date.now()}`;
  });

  afterEach(async () => {
    // Cleanup test session
    if (testSessionId) {
      try {
        await developmentServiceClient.delete(`/api/sessions/${testSessionId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  afterAll(async () => {
    // Cleanup test workspace
    try {
      await fs.rmdir(testWorkspaceDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to cleanup test workspace:', error.message);
    }
  });

  describe('Vision-to-Code System Integration', () => {
    it('should initialize vision-to-code session with workspace', async () => {
      const sessionConfig = {
        session_id: testSessionId,
        workflow_id: 'workflow_test_001',
        vision: mockVisions.simple,
        workspace: {
          directory: testWorkspaceDir,
          git_enabled: true,
          auto_commit: true
        },
        claude_integration: {
          model: 'claude-3-sonnet',
          max_tokens: 4000,
          temperature: 0.3
        }
      };

      const response = await developmentServiceClient.post('/api/vision-to-code/initialize', sessionConfig);

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('success');
      expect(response.data.data).toMatchObject({
        session_id: testSessionId,
        workspace_path: expect.any(String),
        claude_session: expect.objectContaining({
          session_id: expect.any(String),
          model: 'claude-3-sonnet',
          status: 'active'
        }),
        git_repository: expect.objectContaining({
          initialized: expect.any(Boolean),
          remote_url: expect.any(String)
        }),
        status: 'ready'
      });
    });

    it('should analyze vision requirements and generate implementation plan', async () => {
      // Initialize session first
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        vision: mockVisions.medium,
        workspace: { directory: testWorkspaceDir }
      });

      const analysisRequest = {
        analysis_depth: 'comprehensive',
        include_architecture: true,
        include_dependencies: true,
        include_testing_strategy: true
      };

      const response = await developmentServiceClient.post(`/api/vision-to-code/${testSessionId}/analyze`, analysisRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        analysis_id: expect.any(String),
        requirements_analysis: expect.objectContaining({
          functional_requirements: expect.any(Array),
          non_functional_requirements: expect.any(Array),
          constraints: expect.any(Array)
        }),
        technical_architecture: expect.objectContaining({
          system_components: expect.any(Array),
          data_models: expect.any(Array),
          api_design: expect.any(Object),
          technology_stack: expect.any(Array)
        }),
        implementation_plan: expect.objectContaining({
          phases: expect.any(Array),
          milestones: expect.any(Array),
          estimated_timeline: expect.any(String),
          resource_requirements: expect.any(Object)
        }),
        testing_strategy: expect.objectContaining({
          test_types: expect.any(Array),
          coverage_targets: expect.any(Object),
          automation_plan: expect.any(Object)
        })
      });
    });

    it('should generate project structure and boilerplate code', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        vision: mockVisions.simple,
        workspace: { directory: testWorkspaceDir }
      });

      const generationRequest = {
        project_type: 'react_typescript',
        features: ['routing', 'state_management', 'styling', 'testing'],
        deployment_target: 'vercel',
        include_ci_cd: true
      };

      const response = await developmentServiceClient.post(`/api/vision-to-code/${testSessionId}/generate-structure`, generationRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        generation_id: expect.any(String),
        files_created: expect.any(Array),
        directory_structure: expect.any(Object),
        package_config: expect.objectContaining({
          dependencies: expect.any(Object),
          dev_dependencies: expect.any(Object),
          scripts: expect.any(Object)
        }),
        git_commits: expect.any(Array)
      });

      expect(response.data.data.files_created.length).toBeGreaterThan(5);
      expect(response.data.data.files_created).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/package\.json$/),
          expect.stringMatching(/tsconfig\.json$/),
          expect.stringMatching(/README\.md$/),
          expect.stringMatching(/src\/.*\.tsx?$/),
          expect.stringMatching(/.*\.test\.tsx?$/)
        ])
      );
    });

    it('should implement specific features using Claude Code', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        vision: mockVisions.medium,
        workspace: { directory: testWorkspaceDir }
      });

      const featureRequest = {
        feature_name: 'user_authentication',
        feature_type: 'full_stack',
        specifications: {
          authentication_methods: ['email_password', 'oauth_google'],
          user_roles: ['user', 'admin'],
          security_features: ['jwt_tokens', 'password_hashing', 'rate_limiting'],
          ui_components: ['login_form', 'signup_form', 'profile_page']
        },
        implementation_style: 'comprehensive',
        include_tests: true
      };

      const response = await developmentServiceClient.post(`/api/vision-to-code/${testSessionId}/implement-feature`, featureRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        feature_id: expect.any(String),
        implementation_status: 'completed',
        files_modified: expect.any(Array),
        files_created: expect.any(Array),
        test_files: expect.any(Array),
        code_quality: expect.objectContaining({
          complexity_score: expect.any(Number),
          test_coverage: expect.any(Number),
          lint_score: expect.any(Number)
        }),
        claude_interactions: expect.any(Array)
      });

      expect(response.data.data.files_created.length).toBeGreaterThan(0);
      expect(response.data.data.test_files.length).toBeGreaterThan(0);
    });
  });

  describe('Claude Code Integration', () => {
    it('should execute Claude Code commands through development service', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir }
      });

      const claudeCommand = {
        command_type: 'code_generation',
        instruction: 'Create a React component for a user profile card with props for name, email, avatar, and bio. Include TypeScript types and basic styling.',
        context: {
          framework: 'react',
          language: 'typescript',
          styling: 'css_modules'
        },
        output_format: 'files'
      };

      const response = await developmentServiceClient.post(`/api/claude-integration/${testSessionId}/execute`, claudeCommand);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        execution_id: expect.any(String),
        command_status: 'completed',
        generated_files: expect.any(Array),
        claude_response: expect.objectContaining({
          content: expect.any(String),
          tokens_used: expect.any(Number),
          model: expect.any(String)
        }),
        execution_time: expect.any(Number)
      });

      expect(response.data.data.generated_files).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            filename: expect.stringMatching(/UserProfile.*\.(tsx|ts|css)$/),
            content: expect.any(String),
            file_type: expect.stringMatching(/component|types|styles/)
          })
        ])
      );
    });

    it('should handle complex multi-step development workflows', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir }
      });

      const workflowRequest = {
        workflow_name: 'api_with_database',
        steps: [
          {
            step: 1,
            name: 'database_schema',
            instruction: 'Design and create database schema for a blog application with users, posts, and comments',
            dependencies: []
          },
          {
            step: 2,
            name: 'api_models',
            instruction: 'Create TypeScript interfaces and Prisma models based on the database schema',
            dependencies: ['database_schema']
          },
          {
            step: 3,
            name: 'api_routes',
            instruction: 'Implement Express.js API routes for CRUD operations on users, posts, and comments',
            dependencies: ['api_models']
          },
          {
            step: 4,
            name: 'api_tests',
            instruction: 'Create comprehensive integration tests for all API endpoints',
            dependencies: ['api_routes']
          }
        ],
        execution_mode: 'sequential'
      };

      const response = await developmentServiceClient.post(`/api/claude-integration/${testSessionId}/workflow`, workflowRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        workflow_id: expect.any(String),
        execution_status: 'completed',
        steps_completed: 4,
        total_files_created: expect.any(Number),
        workflow_summary: expect.objectContaining({
          total_execution_time: expect.any(Number),
          tokens_consumed: expect.any(Number),
          success_rate: expect.any(Number)
        }),
        step_results: expect.arrayContaining([
          expect.objectContaining({
            step_number: expect.any(Number),
            step_name: expect.any(String),
            status: 'completed',
            files_created: expect.any(Array),
            execution_time: expect.any(Number)
          })
        ])
      });

      expect(response.data.data.steps_completed).toBe(4);
      expect(response.data.data.total_files_created).toBeGreaterThan(5);
    });

    it('should provide real-time progress updates during long operations', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir }
      });

      // Start a long-running operation
      const longOperation = {
        operation_type: 'full_application_generation',
        specifications: mockVisions.complex,
        progress_updates: true
      };

      const response = await developmentServiceClient.post(`/api/claude-integration/${testSessionId}/long-operation`, longOperation);

      expect(response.status).toBe(202); // Accepted for async processing
      expect(response.data.data).toMatchObject({
        operation_id: expect.any(String),
        status: 'in_progress',
        progress_endpoint: expect.any(String),
        estimated_duration: expect.any(Number)
      });

      // Check progress
      const progressResponse = await developmentServiceClient.get(`/api/claude-integration/${testSessionId}/progress/${response.data.data.operation_id}`);

      expect(progressResponse.status).toBe(200);
      expect(progressResponse.data.data).toMatchObject({
        operation_id: response.data.data.operation_id,
        progress_percentage: expect.any(Number),
        current_stage: expect.any(String),
        stages_completed: expect.any(Array),
        estimated_remaining_time: expect.any(Number)
      });
    });
  });

  describe('Squad System Integration', () => {
    it('should coordinate with agent squads for complex implementations', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        vision: mockVisions.complex,
        workspace: { directory: testWorkspaceDir }
      });

      const squadRequest = {
        squad_configuration: mockAgentConfigurations.complex_workflow,
        task_distribution: 'capability_based',
        coordination_mode: 'collaborative',
        quality_gates: {
          code_review: true,
          testing_required: true,
          security_scan: true
        }
      };

      const response = await developmentServiceClient.post(`/api/squad-system/${testSessionId}/coordinate`, squadRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        squad_session_id: expect.any(String),
        assigned_agents: expect.any(Array),
        task_assignments: expect.any(Array),
        coordination_timeline: expect.objectContaining({
          start_time: expect.any(String),
          estimated_completion: expect.any(String),
          milestones: expect.any(Array)
        }),
        quality_checkpoints: expect.any(Array)
      });

      expect(response.data.data.assigned_agents.length).toBeGreaterThan(3);
      expect(response.data.data.task_assignments.length).toBeGreaterThan(5);
    });

    it('should handle agent handoffs and collaborative editing', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir }
      });

      const handoffRequest = {
        from_agent: 'backend_developer',
        to_agent: 'frontend_developer',
        handoff_type: 'api_contract_completion',
        context: {
          completed_work: ['database_models', 'api_endpoints'],
          handoff_artifacts: ['api_documentation', 'type_definitions'],
          next_tasks: ['ui_components', 'api_integration'],
          shared_files: ['types/api.ts', 'docs/api-spec.md']
        }
      };

      const response = await developmentServiceClient.post(`/api/squad-system/${testSessionId}/handoff`, handoffRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        handoff_id: expect.any(String),
        handoff_status: 'completed',
        transferred_context: expect.objectContaining({
          files_transferred: expect.any(Array),
          knowledge_base: expect.any(Object),
          task_continuity: expect.any(Object)
        }),
        receiving_agent_status: 'ready',
        collaboration_session: expect.any(String)
      });
    });
  });

  describe('Git Integration and Version Control', () => {
    it('should manage git operations with intelligent commit messages', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir, git_enabled: true }
      });

      const gitOperations = {
        operations: [
          {
            type: 'commit',
            message_style: 'conventional',
            include_files: ['src/**/*.ts', 'package.json'],
            auto_generate_message: true
          },
          {
            type: 'branch',
            branch_name: 'feature/user-authentication',
            base_branch: 'main'
          },
          {
            type: 'tag',
            tag_name: 'v0.1.0',
            message: 'Initial implementation milestone'
          }
        ]
      };

      const response = await developmentServiceClient.post(`/api/git-integration/${testSessionId}/execute`, gitOperations);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        execution_id: expect.any(String),
        operations_completed: expect.any(Array),
        repository_status: expect.objectContaining({
          current_branch: expect.any(String),
          last_commit: expect.any(String),
          modified_files: expect.any(Array),
          repository_size: expect.any(Number)
        }),
        commit_history: expect.any(Array)
      });
    });

    it('should handle merge conflicts and resolution strategies', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir, git_enabled: true }
      });

      const conflictScenario = {
        scenario_type: 'merge_conflict',
        branches: ['feature/auth', 'feature/dashboard'],
        conflict_files: ['src/components/App.tsx', 'package.json'],
        resolution_strategy: 'ai_assisted'
      };

      const response = await developmentServiceClient.post(`/api/git-integration/${testSessionId}/resolve-conflicts`, conflictScenario);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        resolution_id: expect.any(String),
        conflicts_detected: expect.any(Array),
        resolution_strategy: 'ai_assisted',
        resolved_files: expect.any(Array),
        manual_review_required: expect.any(Array),
        merge_status: expect.stringMatching(/completed|partial|failed/)
      });
    });
  });

  describe('Quality Assurance and Testing', () => {
    it('should run automated tests and quality checks', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir }
      });

      const qualityCheck = {
        check_types: ['unit_tests', 'integration_tests', 'linting', 'type_checking', 'security_scan'],
        coverage_threshold: 80,
        quality_gates: {
          test_pass_rate: 100,
          coverage_minimum: 80,
          lint_error_tolerance: 0,
          security_high_severity_max: 0
        }
      };

      const response = await developmentServiceClient.post(`/api/quality-assurance/${testSessionId}/run-checks`, qualityCheck);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        qa_session_id: expect.any(String),
        overall_quality_score: expect.any(Number),
        test_results: expect.objectContaining({
          unit_tests: expect.objectContaining({
            passed: expect.any(Number),
            failed: expect.any(Number),
            coverage: expect.any(Number)
          }),
          integration_tests: expect.objectContaining({
            passed: expect.any(Number),
            failed: expect.any(Number)
          })
        }),
        code_quality: expect.objectContaining({
          lint_issues: expect.any(Array),
          type_errors: expect.any(Array),
          complexity_metrics: expect.any(Object)
        }),
        security_scan: expect.objectContaining({
          vulnerabilities: expect.any(Array),
          severity_distribution: expect.any(Object)
        })
      });
    });

    it('should generate and run performance benchmarks', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir }
      });

      const performanceTest = {
        test_types: ['load_testing', 'memory_profiling', 'cpu_profiling'],
        scenarios: [
          {
            name: 'user_authentication_flow',
            concurrent_users: 100,
            duration: '2m',
            ramp_up: '30s'
          },
          {
            name: 'api_endpoints_stress',
            requests_per_second: 1000,
            duration: '1m'
          }
        ],
        performance_targets: performanceBenchmarks.medium_workflow
      };

      const response = await developmentServiceClient.post(`/api/performance-testing/${testSessionId}/run`, performanceTest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        performance_session_id: expect.any(String),
        test_results: expect.any(Array),
        performance_metrics: expect.objectContaining({
          response_times: expect.any(Object),
          throughput: expect.any(Object),
          resource_utilization: expect.any(Object),
          error_rates: expect.any(Object)
        }),
        benchmark_comparison: expect.objectContaining({
          meets_targets: expect.any(Boolean),
          performance_score: expect.any(Number),
          recommendations: expect.any(Array)
        })
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle Claude API failures gracefully', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir }
      });

      // Simulate Claude API failure
      const failureSimulation = {
        failure_type: 'api_timeout',
        duration: 30, // seconds
        recovery_strategy: 'retry_with_backoff'
      };

      const response = await developmentServiceClient.post(`/api/error-simulation/${testSessionId}/claude-failure`, failureSimulation);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        simulation_id: expect.any(String),
        failure_detected: expect.any(Boolean),
        recovery_initiated: expect.any(Boolean),
        fallback_strategy: expect.any(String),
        impact_assessment: expect.objectContaining({
          affected_operations: expect.any(Array),
          data_loss: expect.any(Boolean),
          recovery_time: expect.any(Number)
        })
      });
    });

    it('should recover from workspace corruption', async () => {
      await developmentServiceClient.post('/api/vision-to-code/initialize', {
        session_id: testSessionId,
        workspace: { directory: testWorkspaceDir, backup_enabled: true }
      });

      const recoveryRequest = {
        corruption_type: 'file_system_error',
        affected_files: ['src/components/App.tsx', 'package.json'],
        recovery_method: 'git_restore'
      };

      const response = await developmentServiceClient.post(`/api/recovery/${testSessionId}/workspace`, recoveryRequest);

      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        recovery_id: expect.any(String),
        recovery_status: expect.stringMatching(/completed|partial|failed/),
        recovered_files: expect.any(Array),
        data_loss_assessment: expect.objectContaining({
          files_lost: expect.any(Number),
          recoverable_files: expect.any(Number),
          backup_restore_required: expect.any(Boolean)
        })
      });
    });
  });
});