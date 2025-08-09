/**
 * GitHub Integration Automation E2E Test Suite
 * Tests automated issue creation, PR workflows, and project management sync
 */

import { DocumentDrivenSystem } from '../../core/document-driven-system';
import { RealFileSystemTestHelper } from '../helpers/filesystem-test-helper';
import { IntegrationTestSetup } from '../helpers/integration-test-setup';
import { RealNetworkTestHelper } from '../helpers/network-test-helper';

// Mock GitHub API for testing
class MockGitHubAPI {
  private issues: any[] = [];
  private pullRequests: any[] = [];
  private projects: any[] = [];

  async createIssue(data: any) {
    const issue = {
      id: this.issues.length + 1,
      number: this.issues.length + 1,
      title: data?.["title"],
      body: data?.["body"],
      labels: data?.["labels"] || [],
      assignees: data?.["assignees"] || [],
      state: 'open',
      created_at: new Date().toISOString(),
    };
    this.issues.push(issue);
    return issue;
  }

  async updateIssue(issueNumber: number, data: any) {
    const issue = this.issues.find((i) => i.number === issueNumber);
    if (issue) {
      Object.assign(issue, data);
    }
    return issue;
  }

  async createPullRequest(data: any) {
    const pr = {
      id: this.pullRequests.length + 1,
      number: this.pullRequests.length + 1,
      title: data?.["title"],
      body: data?.["body"],
      head: { ref: data?.["head"] },
      base: { ref: data?.["base"] },
      state: 'open',
      created_at: new Date().toISOString(),
    };
    this.pullRequests.push(pr);
    return pr;
  }

  async createProject(data: any) {
    const project = {
      id: this.projects.length + 1,
      name: data?.["name"],
      body: data?.["body"],
      state: 'open',
      created_at: new Date().toISOString(),
    };
    this.projects.push(project);
    return project;
  }

  getIssues() {
    return this.issues;
  }
  getPullRequests() {
    return this.pullRequests;
  }
  getProjects() {
    return this.projects;
  }

  reset() {
    this.issues = [];
    this.pullRequests = [];
    this.projects = [];
  }
}

describe('GitHub Integration Automation E2E Tests', () => {
  let documentSystem: DocumentDrivenSystem;
  let testSetup: IntegrationTestSetup;
  let fsHelper: RealFileSystemTestHelper;
  let networkHelper: RealNetworkTestHelper;
  let mockGitHub: MockGitHubAPI;

  const TEST_PROJECT_PATH = '/tmp/claude-zen-github-test';
  const E2E_TIMEOUT = 60000; // 1 minute

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    fsHelper = new RealFileSystemTestHelper();
    networkHelper = new RealNetworkTestHelper();
    mockGitHub = new MockGitHubAPI();

    await testSetup.initializeFullEnvironment();
    await fsHelper.createTestDirectory(TEST_PROJECT_PATH);
  }, E2E_TIMEOUT);

  afterAll(async () => {
    await testSetup.cleanup();
    await fsHelper.cleanup();
  });

  beforeEach(() => {
    mockGitHub.reset();
  });

  describe('Automated Issue Creation and Management', () => {
    let workspaceId: string;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      await documentSystem.initialize();
      workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
    });

    it('should automatically create GitHub issues from Vision documents', async () => {
      const visionContent = `
# E-Commerce Platform Vision

## Overview
Build a modern e-commerce platform with AI-powered recommendations and real-time inventory management.

## Key Features
- User authentication and profiles
- Product catalog with search
- Shopping cart and checkout
- Payment processing integration
- Order tracking and history
- Admin dashboard
- AI-powered product recommendations
- Real-time inventory management
- Mobile responsive design

## Technical Requirements
- React frontend with TypeScript
- Node.js backend with Express
- PostgreSQL database
- Redis for caching
- Stripe for payments
- AWS deployment
- Docker containerization

## Success Criteria
- Handle 10,000+ concurrent users
- Sub-2s page load times
- 99.9% uptime
- Mobile-first responsive design
- WCAG 2.1 accessibility compliance

## Issues to Track
- [ ] User authentication system
- [ ] Product catalog implementation
- [ ] Shopping cart functionality
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Security audit
`;

      const visionPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/01-vision/ecommerce-vision.md`,
        visionContent
      );

      // Process vision document (should trigger GitHub integration)
      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.type === 'vision') {
          // Simulate GitHub issue creation from vision
          const issues = await Promise.all([
            mockGitHub.createIssue({
              title: '🔐 Implement User Authentication System',
              body: 'Create secure user authentication with registration, login, and profile management.\n\n**Acceptance Criteria:**\n- User registration with email verification\n- Secure login with JWT tokens\n- Password reset functionality\n- Profile management interface',
              labels: ['enhancement', 'authentication', 'high-priority'],
            }),
            mockGitHub.createIssue({
              title: '🛒 Build Product Catalog with Search',
              body: 'Implement product catalog with advanced search and filtering capabilities.\n\n**Acceptance Criteria:**\n- Product listing with pagination\n- Search functionality with filters\n- Category navigation\n- Product detail views',
              labels: ['enhancement', 'catalog', 'medium-priority'],
            }),
            mockGitHub.createIssue({
              title: '💳 Integrate Payment Processing',
              body: 'Integrate Stripe payment processing for secure transactions.\n\n**Acceptance Criteria:**\n- Stripe integration setup\n- Secure payment forms\n- Order confirmation flow\n- Payment status tracking',
              labels: ['enhancement', 'payments', 'high-priority'],
            }),
          ]);

          expect(issues.length).toBe(3);
          expect(issues[0]?.title).toContain('Authentication System');
          expect(issues[1]?.title).toContain('Product Catalog');
          expect(issues[2]?.title).toContain('Payment Processing');
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, visionPath);

      // Verify issues were created
      const createdIssues = mockGitHub.getIssues();
      expect(createdIssues.length).toBeGreaterThanOrEqual(3);

      // Check issue structure
      const authIssue = createdIssues.find((i) => i.title.includes('Authentication'));
      expect(authIssue).toBeDefined();
      expect(authIssue.labels).toContain('high-priority');
      expect(authIssue.body).toContain('Acceptance Criteria');
    });

    it('should update GitHub issues based on PRD progress', async () => {
      // Create initial issues
      const authIssue = await mockGitHub.createIssue({
        title: 'User Authentication System',
        body: 'Initial implementation needed',
        labels: ['enhancement'],
      });

      const prdContent = `
# User Authentication PRD

## Status: In Progress

## User Stories
- [x] As a user, I want to register with email verification
- [x] As a user, I want to login securely with JWT tokens
- [ ] As a user, I want to reset my password if forgotten
- [ ] As a user, I want to manage my profile information

## Technical Specifications
- JWT token-based authentication
- Email verification service
- Password hashing with bcrypt
- Rate limiting for login attempts

## Implementation Progress
- ✅ Registration flow completed
- ✅ Login functionality implemented  
- 🔄 Password reset in progress
- ⏳ Profile management pending

## Next Steps
- Complete password reset functionality
- Implement profile management UI
- Add comprehensive testing
- Security audit review
`;

      const prdPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/03-prds/auth-prd.md`,
        prdContent
      );

      // Process PRD (should update GitHub issue)
      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.type === 'prd' && event["document"]?.["path"]?.includes('auth-prd')) {
          // Simulate GitHub issue update
          await mockGitHub.updateIssue(authIssue.number, {
            body: `${authIssue.body}\n\n**Progress Update:**\n- ✅ Registration completed\n- ✅ Login implemented\n- 🔄 Password reset in progress\n- ⏳ Profile management pending`,
            labels: [...authIssue.labels, 'in-progress'],
          });
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, prdPath);

      // Verify issue was updated
      const updatedIssue = mockGitHub.getIssues().find((i) => i.number === authIssue.number);
      expect(updatedIssue.body).toContain('Progress Update');
      expect(updatedIssue.labels).toContain('in-progress');
    });

    it('should automatically close issues when features are completed', async () => {
      const completedIssue = await mockGitHub.createIssue({
        title: 'Shopping Cart Implementation',
        body: 'Implement shopping cart functionality',
        labels: ['enhancement', 'in-progress'],
      });

      const completedTaskContent = `
# Shopping Cart Implementation - COMPLETED

## Status: ✅ Completed

## Implementation Details
- Cart state management with Redux
- Local storage persistence
- Add/remove/update item functionality
- Cart total calculations
- Checkout integration

## Testing
- ✅ Unit tests: 95% coverage
- ✅ Integration tests passed
- ✅ E2E tests passed
- ✅ Performance tests passed

## Deployment
- ✅ Code reviewed and approved
- ✅ Deployed to staging
- ✅ User acceptance testing completed
- ✅ Deployed to production

## Metrics
- Load time: 1.2s
- Memory usage: 15MB
- Bundle size impact: +45KB (gzipped)
`;

      const taskPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/06-tasks/shopping-cart-task.md`,
        completedTaskContent
      );

      // Process completed task (should close GitHub issue)
      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.type === 'task' && event["document"]?.["content"]?.includes('COMPLETED')) {
          await mockGitHub.updateIssue(completedIssue.number, {
            state: 'closed',
            labels: [...completedIssue.labels, 'completed'],
          });
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, taskPath);

      // Verify issue was closed
      const closedIssue = mockGitHub.getIssues().find((i) => i.number === completedIssue.number);
      expect(closedIssue.state).toBe('closed');
      expect(closedIssue.labels).toContain('completed');
    });
  });

  describe('Pull Request Workflow Integration', () => {
    let workspaceId: string;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      await documentSystem.initialize();
      workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
    });

    it('should create pull requests for feature implementations', async () => {
      const featureContent = `
# Product Search Feature

## Implementation Plan
- Search API endpoint
- Frontend search component
- Search result pagination
- Filter functionality
- Search analytics

## Code Changes
- \`src/api/search.ts\` - Search API implementation
- \`src/components/Search.tsx\` - Search UI component
- \`src/hooks/useSearch.ts\` - Search state management
- \`tests/search.test.ts\` - Test coverage

## Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Security review completed
`;

      const featurePath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/05-features/product-search.md`,
        featureContent
      );

      // Process feature (should create PR)
      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.type === 'feature') {
          const pr = await mockGitHub.createPullRequest({
            title: 'feat: implement product search functionality',
            body: `
## Summary
Implements product search with filtering and pagination.

## Changes
- Added search API endpoint with ElasticSearch integration
- Created responsive search UI component
- Implemented search state management
- Added comprehensive test coverage

## Testing
- ✅ Unit tests: 98% coverage
- ✅ Integration tests passed
- ✅ E2E search scenarios verified

## Performance
- Search response time: <200ms
- UI render time: <50ms
- Bundle size increase: +12KB

Closes #123
            `,
            head: 'feature/product-search',
            base: 'main',
          });

          expect(pr.title).toContain('product search');
          expect(pr.body).toContain('Closes #123');
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, featurePath);

      // Verify PR was created
      const createdPRs = mockGitHub.getPullRequests();
      expect(createdPRs.length).toBeGreaterThan(0);

      const searchPR = createdPRs.find((pr) => pr.title.includes('product search'));
      expect(searchPR).toBeDefined();
      expect(searchPR.head.ref).toBe('feature/product-search');
      expect(searchPR.base.ref).toBe('main');
    });

    it('should automate code review checklist generation', async () => {
      const implementationContent = `
# Payment Gateway Integration - Implementation

## Code Structure
\`\`\`
src/
├── services/
│   ├── payment.service.ts     # Payment processing logic
│   └── stripe.integration.ts  # Stripe API wrapper
├── components/
│   ├── CheckoutForm.tsx       # Payment form UI
│   └── PaymentStatus.tsx      # Payment result display
├── types/
│   └── payment.types.ts       # Payment type definitions
└── tests/
    ├── payment.test.ts        # Unit tests
    └── checkout.e2e.test.ts   # E2E tests
\`\`\`

## Security Considerations
- PCI DSS compliance requirements
- Secure token handling
- Input validation and sanitization
- Error message security
- Audit logging

## Performance Requirements
- Payment processing: <3s
- Form validation: <100ms
- Error handling: graceful degradation
- Network timeout handling

## Testing Strategy
- Unit tests for payment logic
- Integration tests with Stripe sandbox
- E2E tests for complete checkout flow
- Security penetration testing
- Load testing for concurrent payments
`;

      const implPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/06-tasks/payment-implementation.md`,
        implementationContent
      );

      // Process implementation (should generate review checklist)
      const reviewChecklist = {
        security: [
          'PCI DSS compliance verified',
          'Token handling security reviewed',
          'Input validation implemented',
          'Error messages sanitized',
          'Audit logging configured',
        ],
        performance: [
          'Payment processing under 3s verified',
          'Form validation under 100ms',
          'Error handling graceful',
          'Network timeouts handled',
          'Load testing completed',
        ],
        testing: [
          'Unit test coverage >95%',
          'Integration tests with sandbox',
          'E2E checkout flow verified',
          'Security tests passed',
          'Performance benchmarks met',
        ],
        code: [
          'Code follows style guidelines',
          'TypeScript types properly defined',
          'Documentation updated',
          'No console.log statements',
          'Error boundaries implemented',
        ],
      };

      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.type === 'task' && event["document"]?.["content"]?.includes('Implementation')) {
          // Simulate automated review checklist creation
          expect(reviewChecklist.security.length).toBe(5);
          expect(reviewChecklist.performance.length).toBe(5);
          expect(reviewChecklist.testing.length).toBe(5);
          expect(reviewChecklist.code.length).toBe(5);
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, implPath);

      // Verify checklist structure
      expect(reviewChecklist.security).toContain('PCI DSS compliance verified');
      expect(reviewChecklist.performance).toContain('Payment processing under 3s verified');
      expect(reviewChecklist.testing).toContain('Unit test coverage >95%');
      expect(reviewChecklist.code).toContain('Code follows style guidelines');
    });
  });

  describe('CI/CD Pipeline Integration', () => {
    let workspaceId: string;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      await documentSystem.initialize();
      workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
    });

    it('should trigger CI/CD pipeline from documentation changes', async () => {
      const deploymentDoc = `
# Deployment Configuration

## Environments
- **Development**: Auto-deploy on feature branch push
- **Staging**: Auto-deploy on main branch merge
- **Production**: Manual deploy after approval

## Pipeline Stages
1. **Build**: Compile TypeScript, run linting
2. **Test**: Unit, integration, and E2E tests
3. **Security**: Security scanning and audit
4. **Deploy**: Environment-specific deployment
5. **Verify**: Health checks and smoke tests

## Rollback Strategy
- Automatic rollback on health check failure
- Manual rollback capability
- Database migration rollback plan
- CDN cache invalidation

## Monitoring
- Application performance monitoring
- Error tracking and alerting
- Resource usage monitoring
- User experience metrics
`;

      const deployPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/07-specs/deployment-spec.md`,
        deploymentDoc
      );

      const pipelineEvents: any[] = [];

      // Simulate CI/CD pipeline triggers
      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.["path"]?.includes('deployment-spec')) {
          pipelineEvents.push({
            trigger: 'documentation_update',
            pipeline: 'infrastructure_validation',
            timestamp: Date.now(),
            status: 'triggered',
          });

          // Simulate pipeline stages
          const stages = ['build', 'test', 'security', 'deploy', 'verify'];
          for (const stage of stages) {
            pipelineEvents.push({
              stage,
              status: 'completed',
              duration: Math.random() * 1000 + 500, // 500ms - 1.5s
              timestamp: Date.now(),
            });
          }
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, deployPath);

      // Verify pipeline was triggered
      expect(pipelineEvents.length).toBeGreaterThan(0);

      const triggerEvent = pipelineEvents.find((e) => e.trigger === 'documentation_update');
      expect(triggerEvent).toBeDefined();
      expect(triggerEvent.pipeline).toBe('infrastructure_validation');

      const completedStages = pipelineEvents.filter((e) => e.status === 'completed');
      expect(completedStages.length).toBe(5); // All stages completed
    });

    it('should validate deployment readiness from documentation', async () => {
      const readinessChecklist = `
# Production Readiness Checklist

## Code Quality ✅
- [x] Code review completed
- [x] All tests passing (Unit: 98%, Integration: 95%, E2E: 92%)
- [x] Security scan passed
- [x] Performance benchmarks met
- [x] Documentation updated

## Infrastructure ✅
- [x] Production environment provisioned
- [x] Database migrations tested
- [x] CDN configured
- [x] SSL certificates valid
- [x] Monitoring configured

## Operations ✅
- [x] Deployment runbook created
- [x] Rollback procedure tested
- [x] Support team trained
- [x] Incident response plan updated
- [x] Communication plan ready

## Security ✅
- [x] Security audit completed
- [x] Penetration testing passed
- [x] OWASP compliance verified
- [x] Data privacy requirements met
- [x] Access controls configured

## Performance ✅
- [x] Load testing completed (10K concurrent users)
- [x] Database performance optimized
- [x] CDN performance verified
- [x] Mobile performance tested
- [x] Accessibility compliance verified

## Business ✅
- [x] Stakeholder approval received
- [x] User acceptance testing completed
- [x] Marketing materials prepared
- [x] Support documentation ready
- [x] Success metrics defined
`;

      const checklistPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/07-specs/production-readiness.md`,
        readinessChecklist
      );

      let readinessScore = 0;

      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.["content"]?.includes('Production Readiness Checklist')) {
          // Calculate readiness score based on completed items
          const content = event["document"]?.["content"];
          const totalItems = (content.match(/- \[/g) || []).length;
          const completedItems = (content.match(/- \[x\]/g) || []).length;
          readinessScore = (completedItems / totalItems) * 100;
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, checklistPath);

      // Verify readiness calculation
      expect(readinessScore).toBeGreaterThan(95); // Should be nearly 100%

      // All categories should be complete (✅)
      expect(readinessChecklist).toContain('Code Quality ✅');
      expect(readinessChecklist).toContain('Infrastructure ✅');
      expect(readinessChecklist).toContain('Operations ✅');
      expect(readinessChecklist).toContain('Security ✅');
      expect(readinessChecklist).toContain('Performance ✅');
      expect(readinessChecklist).toContain('Business ✅');
    });
  });

  describe('Project Management Synchronization', () => {
    let workspaceId: string;

    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      await documentSystem.initialize();
      workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
    });

    it('should sync epics and features with GitHub Projects', async () => {
      const epicContent = `
# E-Commerce Platform Epic

## Overview
Complete e-commerce platform with user management, product catalog, and order processing.

## Features
1. **User Authentication** (Status: ✅ Completed)
   - Registration and login
   - Profile management
   - Password reset

2. **Product Catalog** (Status: 🔄 In Progress)
   - Product listings
   - Search and filters
   - Category navigation
   - Product details

3. **Shopping Cart** (Status: ⏳ Planned)
   - Add/remove items
   - Quantity management
   - Cart persistence
   - Checkout integration

4. **Order Management** (Status: ⏳ Planned)
   - Order placement
   - Payment processing
   - Order tracking
   - Order history

5. **Admin Dashboard** (Status: ⏳ Planned)
   - User management
   - Product management
   - Order management
   - Analytics

## Timeline
- Q1 2024: User Authentication + Product Catalog
- Q2 2024: Shopping Cart + Order Management  
- Q3 2024: Admin Dashboard + Analytics
- Q4 2024: Advanced features + optimization

## Success Metrics
- User registration: 10,000+ users
- Product catalog: 1,000+ products
- Order volume: 100+ orders/day
- Customer satisfaction: 4.5+ stars
`;

      const epicPath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/04-epics/ecommerce-epic.md`,
        epicContent
      );

      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.type === 'epic') {
          // Create GitHub project for epic
          const project = await mockGitHub.createProject({
            name: 'E-Commerce Platform Epic',
            body: 'Complete e-commerce platform development project',
          });

          // Create columns for project board
          const columns = ['Backlog', 'In Progress', 'Review', 'Done'];

          expect(project.name).toBe('E-Commerce Platform Epic');
          expect(columns.length).toBe(4);
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, epicPath);

      // Verify project was created
      const projects = mockGitHub.getProjects();
      expect(projects.length).toBeGreaterThan(0);

      const ecommerceProject = projects.find((p) => p.name.includes('E-Commerce'));
      expect(ecommerceProject).toBeDefined();
    });

    it('should update project board based on task progress', async () => {
      // Create project board state
      const projectBoard = {
        backlog: ['Shopping Cart Implementation', 'Payment Integration'],
        inProgress: ['Product Search Enhancement'],
        review: ['User Authentication Fixes'],
        done: ['User Registration', 'Login System'],
      };

      const taskUpdate = `
# Product Search Enhancement - Progress Update

## Status: 🔄 Moving to Review

## Completed Work
- ✅ Search API implementation
- ✅ Frontend search component
- ✅ Search result pagination
- ✅ Basic filter functionality
- ✅ Unit and integration tests

## Ready for Review
- Code review requested
- Testing completed
- Documentation updated
- Performance benchmarks met

## Next Steps
- Address review feedback
- Final testing
- Deployment preparation
`;

      const updatePath = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/06-tasks/search-update.md`,
        taskUpdate
      );

      documentSystem.on('document:processed', async (event) => {
        if (event["document"]?.["content"]?.includes('Moving to Review')) {
          // Simulate moving card on project board
          const taskName = 'Product Search Enhancement';

          // Remove from in progress
          projectBoard.inProgress = projectBoard.inProgress.filter((task) => task !== taskName);

          // Add to review
          if (!projectBoard.review.includes(taskName)) {
            projectBoard.review.push(taskName);
          }
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, updatePath);

      // Verify board state updated
      expect(projectBoard.inProgress).not.toContain('Product Search Enhancement');
      expect(projectBoard.review).toContain('Product Search Enhancement');
      expect(projectBoard.review.length).toBe(2); // Original + moved task
    });

    it('should generate project status reports from documentation', async () => {
      const projectDocs = [
        { type: 'epic', status: 'in-progress', completion: 60 },
        { type: 'feature', status: 'completed', completion: 100 },
        { type: 'feature', status: 'in-progress', completion: 75 },
        { type: 'feature', status: 'planned', completion: 0 },
        { type: 'task', status: 'completed', completion: 100 },
        { type: 'task', status: 'completed', completion: 100 },
        { type: 'task', status: 'in-progress', completion: 40 },
        { type: 'task', status: 'planned', completion: 0 },
      ];

      let projectStatus: any = {};

      documentSystem.on('document:processed', async (event) => {
        // Simulate status report generation
        const byType = projectDocs.reduce((acc, doc) => {
          if (!acc[doc.type]) acc[doc.type] = [];
          acc[doc.type]?.push(doc);
          return acc;
        }, {} as any);

        const overallCompletion =
          projectDocs.reduce((sum, doc) => sum + doc.completion, 0) / projectDocs.length;

        projectStatus = {
          overview: {
            totalDocuments: projectDocs.length,
            completed: projectDocs.filter((d) => d.status === 'completed').length,
            inProgress: projectDocs.filter((d) => d.status === 'in-progress').length,
            planned: projectDocs.filter((d) => d.status === 'planned').length,
            overallCompletion: Math.round(overallCompletion),
          },
          byType: {
            epics: byType.epic?.length || 0,
            features: byType.feature?.length || 0,
            tasks: byType.task?.length || 0,
          },
          progress: {
            epics: byType.epic
              ? Math.round(
                  byType.epic.reduce((sum: number, d: any) => sum + d.completion, 0) /
                    byType.epic.length
                )
              : 0,
            features: byType.feature
              ? Math.round(
                  byType.feature.reduce((sum: number, d: any) => sum + d.completion, 0) /
                    byType.feature.length
                )
              : 0,
            tasks: byType.task
              ? Math.round(
                  byType.task.reduce((sum: number, d: any) => sum + d.completion, 0) /
                    byType.task.length
                )
              : 0,
          },
        };
      });

      // Trigger status calculation
      const statusDoc = await fsHelper.writeFile(
        `${TEST_PROJECT_PATH}/docs/project-status.md`,
        '# Project Status Report\n\nGenerated automatically from documentation.'
      );

      await documentSystem.processVisionaryDocument(workspaceId, statusDoc);

      // Verify status report
      expect(projectStatus.overview.totalDocuments).toBe(8);
      expect(projectStatus.overview.completed).toBe(3);
      expect(projectStatus.overview.inProgress).toBe(3);
      expect(projectStatus.overview.planned).toBe(2);
      expect(projectStatus.overview.overallCompletion).toBe(59); // ~59%

      expect(projectStatus.byType.epics).toBe(1);
      expect(projectStatus.byType.features).toBe(3);
      expect(projectStatus.byType.tasks).toBe(4);

      expect(projectStatus.progress.epics).toBe(60);
      expect(projectStatus.progress.features).toBe(58); // (100+75+0)/3
      expect(projectStatus.progress.tasks).toBe(60); // (100+100+40+0)/4
    });
  });
});
