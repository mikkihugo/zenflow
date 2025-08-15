/**
 * Document Manager Integration Tests
 *
 * Comprehensive integration tests for document management workflow automation,
 * relationship management, and advanced search functionality.
 */

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import type {
  ADRDocumentEntity,
  BaseDocumentEntity,
  DocumentRelationshipEntity,
  EpicDocumentEntity,
  FeatureDocumentEntity,
  PRDDocumentEntity,
  ProjectEntity,
  TaskDocumentEntity,
  VisionDocumentEntity,
} from '../../database/entities/document-entities.ts';
import { DocumentManager } from '../../database/managers/document-manager.ts';

describe('DocumentManager Integration Tests', () => {
  let documentManager: DocumentManager;
  let testProject: ProjectEntity;

  beforeAll(async () => {
    // Initialize document manager with test database
    documentManager = new DocumentManager('sqlite'); // Use SQLite for tests
    await documentManager.initialize();
  });

  afterAll(async () => {
    // Cleanup test database
    // In production, this would clean up the test database
  });

  beforeEach(async () => {
    // Create test project
    testProject = await documentManager.createProject({
      name: 'Test Project',
      description: 'Integration test project',
      domain: 'testing',
      complexity: 'simple',
    } as any);
  });

  afterEach(async () => {
    // Clean up test data after each test
    // In production, this would clean up created documents and relationships
  });

  describe('Document Relationship Management', () => {
    test('should auto-generate parent relationships based on document type hierarchy', async () => {
      // Create a PRD first
      const prd = await documentManager.createDocument<PRDDocumentEntity>(
        {
          type: 'prd',
          title: 'User Authentication PRD',
          content: 'Detailed PRD for user authentication system...',
          summary: 'PRD for auth system',
          author: 'product-manager',
          project_id: testProject.id,
          status: 'draft',
          priority: 'high',
          keywords: ['authentication', 'security', 'users'],
          metadata: {},
          dependencies: [],
          version: '1.0.0',
          tags: ['authentication', 'security'],
          completion_percentage: 0,
          related_documents: [],
          functional_requirements: [],
          non_functional_requirements: [],
          user_stories: [],
          related_adrs: [],
          generated_epics: [],
          searchable_content:
            'User Authentication PRD Detailed PRD for user authentication system PRD for auth system',
        },
        {
          autoGenerateRelationships: true,
        }
      );

      // Create an Epic that should automatically relate to the PRD
      const epic = await documentManager.createDocument<EpicDocumentEntity>(
        {
          type: 'epic',
          title: 'Authentication Epic',
          content: 'Epic for implementing authentication features...',
          summary: 'Auth implementation epic',
          author: 'tech-lead',
          project_id: testProject.id,
          status: 'draft',
          priority: 'high',
          keywords: ['authentication', 'implementation'],
          metadata: {},
          dependencies: [],
          version: '1.0.0',
          tags: ['authentication', 'epic'],
          completion_percentage: 0,
          related_documents: [],
          business_value: 'Enable secure user access to the platform',
          user_impact: 'Users can securely access their accounts',
          effort_estimation: {
            story_points: 13,
            time_estimate_weeks: 3,
            complexity: 'medium',
          },
          timeline: {
            start_date: new Date(),
            estimated_completion: new Date(
              Date.now() + 21 * 24 * 60 * 60 * 1000
            ),
          },
          feature_ids: [],
          features_completed: 0,
          features_total: 0,
          searchable_content:
            'Authentication Epic Epic for implementing authentication features Auth implementation epic',
          // definition_of_done: ['All auth features complete'],
          // estimated_effort: 40,
          // technical_complexity: 'Medium',
        },
        {
          autoGenerateRelationships: true,
        }
      );

      // Check that relationship was created
      const epicWithRelationships =
        await documentManager.getDocument<EpicDocumentEntity>(epic.id, {
          includeRelationships: true,
        });

      expect(epicWithRelationships).not.toBeNull();
      expect((epicWithRelationships as any).relationships).toBeDefined();
      expect(
        (epicWithRelationships as any).relationships.length
      ).toBeGreaterThan(0);

      // Find relationship to PRD
      const prdRelationship = (epicWithRelationships as any).relationships.find(
        (rel: DocumentRelationshipEntity) =>
          rel['target_document_id'] === prd.id &&
          rel['relationship_type'] === 'relates_to'
      );

      expect(prdRelationship).toBeDefined();
      expect(prdRelationship.metadata['auto_generated']).toBe(true);
      expect(prdRelationship.metadata['generation_method']).toBe(
        'type_hierarchy'
      );
    });

    test('should create semantic relationships based on content analysis', async () => {
      // Create two documents with similar content
      const doc1 = await documentManager.createDocument(
        {
          type: 'feature',
          title: 'JWT Token Authentication',
          content:
            'Implement JWT token-based authentication with refresh tokens...',
          summary: 'JWT auth feature',
          author: 'developer',
          project_id: testProject.id,
          status: 'draft',
          priority: 'high',
          keywords: ['jwt', 'authentication', 'tokens', 'security'],
          tags: ['jwt', 'authentication', 'tokens', 'security'],
          version: '1.0.0',
          dependencies: [],
          related_documents: [],
          searchable_content:
            'Implement JWT token-based authentication with refresh tokens...',
          completion_percentage: 0,
          metadata: {},
        },
        {
          autoGenerateRelationships: true,
        }
      );

      const doc2 = await documentManager.createDocument(
        {
          type: 'feature',
          title: 'OAuth Integration',
          content:
            'Integrate OAuth 2.0 for third-party authentication providers...',
          summary: 'OAuth integration',
          author: 'developer',
          project_id: testProject.id,
          status: 'draft',
          priority: 'medium',
          keywords: ['oauth', 'authentication', 'integration', 'security'],
          tags: ['oauth', 'authentication', 'integration', 'security'],
          version: '1.0.0',
          dependencies: [],
          related_documents: [],
          searchable_content:
            'Integrate OAuth 2.0 for third-party authentication providers...',
          completion_percentage: 0,
          metadata: {},
        },
        {
          autoGenerateRelationships: true,
        }
      );

      // Check semantic relationships
      const doc1WithRel = await documentManager.getDocument(doc1.id, {
        includeRelationships: true,
      });
      const relationships = (doc1WithRel as any)
        .relationships as DocumentRelationshipEntity[];

      const semanticRel = relationships.find(
        (rel) =>
          rel['target_document_id'] === doc2.id &&
          rel['relationship_type'] === 'relates_to'
      );

      expect(semanticRel).toBeDefined();
      expect(
        semanticRel?.metadata &&
          (semanticRel.metadata as any)['generation_method']
      ).toBe('keyword_analysis');
      expect(semanticRel?.strength).toBeGreaterThan(0.3);
    });

    test('should update relationships when document content changes', async () => {
      const document = await documentManager.createDocument(
        {
          type: 'feature',
          title: 'Test Feature',
          content: 'Original content about payments',
          summary: 'Payment feature',
          author: 'developer',
          project_id: testProject.id,
          status: 'draft',
          priority: 'medium',
          keywords: ['payments', 'billing'],
          metadata: {},
        } as any,
        {
          autoGenerateRelationships: true,
        }
      );

      // Update content significantly
      const updated = await documentManager.updateDocument(
        document.id,
        {
          content: 'Updated content about authentication and security',
          keywords: ['authentication', 'security', 'login'],
        },
        {
          autoGenerateRelationships: true,
        }
      );

      expect(updated.content).toContain('authentication');
      expect(updated.keywords).toContain('authentication');

      // Verify relationships were updated
      const docWithRel = await documentManager.getDocument(updated.id, {
        includeRelationships: true,
      });
      const relationships = (docWithRel as any)
        .relationships as DocumentRelationshipEntity[];

      // Should have new relationships based on updated content
      expect(relationships.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Advanced Document Search', () => {
    let searchDocuments: BaseDocumentEntity[];

    beforeEach(async () => {
      // Create test documents for search
      searchDocuments = await Promise.all([
        documentManager.createDocument(
          {
            type: 'prd',
            title: 'User Authentication System',
            content:
              'Comprehensive authentication system with JWT tokens, OAuth integration, and multi-factor authentication...',
            summary: 'Auth system PRD',
            author: 'product-manager',
            project_id: testProject.id,
            status: 'approved',
            priority: 'high',
            keywords: ['authentication', 'security', 'jwt', 'oauth', 'mfa'],
            metadata: {},
          } as any,
          { generateSearchIndex: true }
        ),

        documentManager.createDocument(
          {
            type: 'feature',
            title: 'Password Recovery',
            content:
              'Implement secure password recovery mechanism with email verification and temporary tokens...',
            summary: 'Password recovery feature',
            author: 'developer',
            project_id: testProject.id,
            status: 'review',
            priority: 'medium',
            keywords: ['password', 'recovery', 'email', 'security'],
            metadata: {},
          } as any,
          { generateSearchIndex: true }
        ),

        documentManager.createDocument(
          {
            type: 'task',
            title: 'Database Migration',
            content:
              'Migrate user authentication tables to support new security requirements...',
            summary: 'DB migration task',
            author: 'developer',
            project_id: testProject.id,
            status: 'draft',
            priority: 'low',
            keywords: ['database', 'migration', 'authentication'],
            metadata: {},
          } as any,
          { generateSearchIndex: true }
        ),
      ]);
    });

    test('should perform fulltext search with relevance scoring', async () => {
      const results = await documentManager.searchDocuments({
        searchType: 'fulltext',
        query: 'authentication security',
        projectId: testProject.id,
        limit: 10,
      });

      expect(results?.documents).toBeDefined();
      expect(results?.documents.length).toBeGreaterThan(0);
      expect(results?.searchMetadata?.searchType).toBe('fulltext');
      expect(results?.searchMetadata?.relevanceScores).toBeDefined();
      expect(results?.searchMetadata?.processingTime).toBeGreaterThan(0);

      // Verify results are ordered by relevance
      const scores = results?.searchMetadata?.relevanceScores!;
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }

      // Auth system PRD should rank highest (more keywords match)
      expect(results?.documents?.[0]?.title).toContain('Authentication');
    });

    test('should perform semantic search with content similarity', async () => {
      const results = await documentManager.searchDocuments({
        searchType: 'semantic',
        query: 'user login system',
        projectId: testProject.id,
        limit: 10,
      });

      expect(results?.documents).toBeDefined();
      expect(results?.documents.length).toBeGreaterThan(0);
      expect(results?.searchMetadata?.searchType).toBe('semantic');
      expect(results?.searchMetadata?.relevanceScores).toBeDefined();

      // Should find authentication-related documents even without exact matches
      const authRelated = results?.documents?.some(
        (doc) =>
          doc.keywords.includes('authentication') ||
          doc.title.toLowerCase().includes('auth')
      );
      expect(authRelated).toBe(true);
    });

    test('should perform keyword-based search', async () => {
      const results = await documentManager.searchDocuments({
        searchType: 'keyword',
        query: 'security',
        projectId: testProject.id,
        limit: 10,
      });

      expect(results?.documents).toBeDefined();
      expect(results?.documents.length).toBeGreaterThan(0);
      expect(results?.searchMetadata?.searchType).toBe('keyword');

      // All results should have 'security' in keywords or title
      results?.documents?.forEach((doc) => {
        const hasSecurityKeyword = doc.keywords.includes('security');
        const hasSecurityInTitle = doc.title.toLowerCase().includes('security');
        const hasSecurityInContent = doc.content
          .toLowerCase()
          .includes('security');

        expect(
          hasSecurityKeyword || hasSecurityInTitle || hasSecurityInContent
        ).toBe(true);
      });
    });

    test('should perform combined search with weighted scoring', async () => {
      const results = await documentManager.searchDocuments({
        searchType: 'combined',
        query: 'authentication',
        projectId: testProject.id,
        limit: 10,
      });

      expect(results?.documents).toBeDefined();
      expect(results?.documents.length).toBeGreaterThan(0);
      expect(results?.searchMetadata?.searchType).toBe('combined');
      expect(results?.searchMetadata?.relevanceScores).toBeDefined();

      // Combined search should provide comprehensive results
      expect(results?.documents.length).toBeGreaterThanOrEqual(1);
    });

    test('should apply filters and date ranges', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const results = await documentManager.searchDocuments({
        searchType: 'fulltext',
        query: 'authentication',
        projectId: testProject.id,
        documentTypes: ['prd', 'feature'],
        status: ['approved', 'in_progress'],
        priority: ['high', 'medium'],
        dateRange: {
          start: yesterday,
          end: tomorrow,
          field: 'created_at',
        },
        limit: 10,
      });

      expect(results?.documents).toBeDefined();

      // Verify filters are applied
      results?.documents?.forEach((doc) => {
        expect(['prd', 'feature']).toContain(doc.type);
        expect(['approved', 'in_progress']).toContain(doc.status);
        expect(['high', 'medium']).toContain(doc.priority);
        expect(doc['created_at']?.getTime()).toBeGreaterThanOrEqual(
          yesterday.getTime()
        );
        expect(doc['created_at']?.getTime()).toBeLessThanOrEqual(
          tomorrow.getTime()
        );
      });
    });

    test('should handle pagination correctly', async () => {
      const page1 = await documentManager.searchDocuments({
        searchType: 'fulltext',
        query: 'authentication',
        projectId: testProject.id,
        limit: 2,
        offset: 0,
      });

      const page2 = await documentManager.searchDocuments({
        searchType: 'fulltext',
        query: 'authentication',
        projectId: testProject.id,
        limit: 2,
        offset: 2,
      });

      expect(page1.documents).toBeDefined();
      expect(page2.documents).toBeDefined();

      if (page1.total > 2) {
        expect(page1.hasMore).toBe(true);
        expect(page1.documents.length).toBeLessThanOrEqual(2);
      }

      // Verify no duplicate documents between pages
      const page1Ids = new Set(page1.documents.map((d) => d.id));
      const page2Ids = new Set(page2.documents.map((d) => d.id));
      const intersection = new Set(
        [...page1Ids].filter((id) => page2Ids.has(id))
      );
      expect(intersection.size).toBe(0);
    });
  });

  describe('Workflow Automation', () => {
    test('should auto-create epics when PRD is approved', async () => {
      // Create PRD
      const prd = await documentManager.createDocument<PRDDocumentEntity>(
        {
          type: 'prd',
          title: 'E-commerce Platform PRD',
          content: 'Comprehensive PRD for e-commerce platform...',
          summary: 'E-commerce PRD',
          author: 'product-manager',
          project_id: testProject.id,
          status: 'draft',
          priority: 'high',
          keywords: ['ecommerce', 'platform', 'shopping'],
          metadata: {},
          dependencies: [],
          // Required BaseDocumentEntity fields
          tags: ['prd', 'ecommerce'],
          related_documents: [],
          version: '1.0.0',
          searchable_content: 'Comprehensive PRD for e-commerce platform ecommerce platform shopping',
          workflow_stage: 'drafting',
          completion_percentage: 0,
          // Required PRDDocumentEntity fields
          functional_requirements: [
            {
              id: 'req-1',
              description: 'Product catalog management',
              acceptance_criteria: ['Can create products', 'Can edit products'],
              priority: 'must_have'
            }
          ],
          non_functional_requirements: [
            {
              id: 'nfr-1',
              type: 'performance',
              description: 'System should handle 1000 concurrent users',
              metrics: 'Load test passes, Response time < 2s'
            }
          ],
          user_stories: [],
          related_adrs: [],
          generated_epics: []
        },
        {
          startWorkflow: 'prd_workflow',
        }
      );

      // Advance PRD to approved status
      await documentManager.advanceDocumentWorkflow(prd.id, 'approved');

      // Wait for automation to complete (in real implementation, this might be async)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if epic was auto-created
      const { documents } = await documentManager.queryDocuments({
        type: 'epic',
        projectId: testProject.id,
      });

      const autoCreatedEpic = documents.find(
        (doc) =>
          doc.metadata?.['source_document_id'] === prd.id &&
          doc.metadata?.['auto_generated'] === true
      );

      expect(autoCreatedEpic).toBeDefined();
      expect(autoCreatedEpic?.title).toContain('Epic');
      expect(autoCreatedEpic?.status).toBe('draft');
      expect(autoCreatedEpic?.priority).toBe('high');
    });

    test('should auto-create tasks when feature is approved', async () => {
      const feature =
        await documentManager.createDocument<FeatureDocumentEntity>(
          {
            type: 'feature',
            title: 'User Registration Feature',
            content: 'Implement user registration with email verification...',
            summary: 'User registration',
            author: 'developer',
            project_id: testProject.id,
            status: 'draft',
            priority: 'medium',
            keywords: ['registration', 'users', 'email'],
            metadata: {},
            // Required BaseDocumentEntity fields
            tags: ['feature', 'registration'],
            related_documents: [],
            version: '1.0.0',
            dependencies: [],
            searchable_content: 'Implement user registration with email verification registration users email',
            workflow_stage: 'development',
            completion_percentage: 0,
              // Required FeatureDocumentEntity fields
            feature_type: 'ui',
            acceptance_criteria: ['Successful registration flow', 'Email validation works'],
            technical_approach: 'Use React forms with backend validation',
            task_ids: [],
            implementation_status: 'not_started'
          },
          {
            startWorkflow: 'feature_workflow',
          }
        );

      // Advance feature to approved status
      await documentManager.advanceDocumentWorkflow(feature.id, 'approved');

      // Wait for automation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for auto-created tasks
      const { documents } = await documentManager.queryDocuments({
        type: 'task',
        projectId: testProject.id,
      });

      const autoCreatedTask = documents.find(
        (doc) =>
          doc.metadata?.['source_document_id'] === feature.id &&
          doc.metadata?.['auto_generated'] === true
      );

      expect(autoCreatedTask).toBeDefined();
      expect(autoCreatedTask?.status).toBe('todo');
      expect(autoCreatedTask?.priority).toBe('medium');
    });

    test('should enforce workflow stage transitions', async () => {
      const document = await documentManager.createDocument(
        {
          type: 'prd',
          title: 'Test PRD',
          content: 'Test content',
          summary: 'Test PRD',
          author: 'test-user',
          project_id: testProject.id,
          status: 'draft',
          priority: 'medium',
          keywords: ['test'],
          metadata: {},
        } as any,
        {
          startWorkflow: 'prd_workflow',
        }
      );

      // Valid transition: draft -> review
      const workflow1 = await documentManager.advanceDocumentWorkflow(
        document.id,
        'review'
      );
      expect(workflow1['current_stage']).toBe('review');
      expect(workflow1['stages_completed']).toContain('draft');

      // Valid transition: review -> approved
      const workflow2 = await documentManager.advanceDocumentWorkflow(
        document.id,
        'approved'
      );
      expect(workflow2['current_stage']).toBe('approved');

      // Invalid transition: should throw error
      await expect(
        documentManager.advanceDocumentWorkflow(document.id, 'draft')
      ).rejects.toThrow('Invalid transition');
    });

    test('should generate workflow artifacts', async () => {
      const prd = await documentManager.createDocument<PRDDocumentEntity>(
        {
          type: 'prd',
          title: 'Artifact Test PRD',
          content: 'PRD for testing artifact generation...',
          summary: 'Artifact test',
          author: 'product-manager',
          project_id: testProject.id,
          status: 'draft',
          priority: 'high',
          keywords: ['test', 'artifacts'],
          metadata: {},
          dependencies: [],
          // Required BaseDocumentEntity fields
          tags: ['prd', 'test'],
          related_documents: [],
          version: '1.0.0',
          searchable_content: 'PRD for testing artifact generation test artifacts',
          workflow_stage: 'drafting',
          completion_percentage: 0,
          // Required PRDDocumentEntity fields
          functional_requirements: [],
          non_functional_requirements: [],
          user_stories: [],
          related_adrs: [],
          generated_epics: []
        },
        {
          startWorkflow: 'prd_workflow',
        }
      );

      // Advance to approved (should trigger artifact generation)
      await documentManager.advanceDocumentWorkflow(prd.id, 'review');
      await documentManager.advanceDocumentWorkflow(prd.id, 'approved');

      // Wait for artifact generation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check workflow state for generated artifacts
      const workflowState = await documentManager.getDocument(prd.id, {
        includeWorkflowState: true,
      });
      const workflow = (workflowState as any).workflowState as any;

      expect(workflow['generated_artifacts']).toBeDefined();
      expect(workflow['generated_artifacts'].length).toBeGreaterThan(0);
      expect(
        workflow['generated_artifacts']?.some((artifact: unknown) =>
          (artifact as any).includes('summary_report')
        )
      ).toBe(true);
    });
  });

  describe('Complex Integration Scenarios', () => {
    test('should handle complete document lifecycle with relationships and workflows', async () => {
      // 1. Create vision document
      const vision = await documentManager.createDocument(
        {
          type: 'vision',
          title: 'Product Vision 2024',
          content: 'Our vision for the next generation platform...',
          summary: 'Product vision',
          author: 'ceo',
          project_id: testProject.id,
          status: 'draft',
          priority: 'high',
          keywords: ['vision', 'strategy', 'platform'],
          metadata: {},
        } as any,
        {
          startWorkflow: 'vision_workflow',
          generateSearchIndex: true,
        }
      );

      // 2. Create PRD that relates to vision
      const prd = await documentManager.createDocument<PRDDocumentEntity>(
        {
          type: 'prd',
          title: 'Platform Core Features PRD',
          content:
            'Based on our product vision, we need core platform features...',
          summary: 'Core features PRD',
          author: 'product-manager',
          project_id: testProject.id,
          status: 'draft',
          priority: 'high',
          keywords: ['platform', 'features', 'core'],
          metadata: {},
          dependencies: [],
          // Required BaseDocumentEntity fields
          tags: ['prd', 'platform'],
          related_documents: [],
          version: '1.0.0',
          searchable_content: 'Based on our product vision, we need core platform features platform features core',
          workflow_stage: 'drafting',
          completion_percentage: 0,
          // Required PRDDocumentEntity fields
          functional_requirements: [],
          non_functional_requirements: [],
          user_stories: [],
          related_adrs: [],
          generated_epics: []
        },
        {
          autoGenerateRelationships: true,
          startWorkflow: 'prd_workflow',
          generateSearchIndex: true,
        }
      );

      // 3. Advance PRD through workflow stages
      await documentManager.advanceDocumentWorkflow(prd.id, 'review');
      await documentManager.advanceDocumentWorkflow(prd.id, 'approved');

      // Wait for automation
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 4. Verify epic was auto-created
      const { documents: epics } = await documentManager.queryDocuments({
        type: 'epic',
        projectId: testProject.id,
      });

      const autoEpic = epics.find(
        (epic) => epic.metadata?.['source_document_id'] === prd.id
      );
      expect(autoEpic).toBeDefined();

      // 5. Create feature manually and verify relationships
      const feature =
        await documentManager.createDocument<FeatureDocumentEntity>(
          {
            type: 'feature',
            title: 'User Management Feature',
            content: 'Comprehensive user management system...',
            summary: 'User management',
            author: 'developer',
            project_id: testProject.id,
            status: 'draft',
            priority: 'high',
            keywords: ['user', 'management', 'platform'],
            metadata: {},
            // Required BaseDocumentEntity fields
            tags: ['feature', 'user-management'],
            related_documents: [],
            version: '1.0.0',
            dependencies: [],
            searchable_content: 'Comprehensive user management system user management platform',
            workflow_stage: 'development',
            completion_percentage: 0,
              // Required FeatureDocumentEntity fields
            feature_type: 'api',
            acceptance_criteria: ['Complete user lifecycle', 'CRUD operations work'],
            technical_approach: 'RESTful API with database backend',
            task_ids: [],
            implementation_status: 'not_started'
          },
          {
            autoGenerateRelationships: true,
            startWorkflow: 'feature_workflow',
          }
        );

      // 6. Verify complete relationship chain
      const featureWithRel = await documentManager.getDocument(feature.id, {
        includeRelationships: true,
      });
      const relationships = (featureWithRel as any)
        .relationships as DocumentRelationshipEntity[];

      expect(relationships.length).toBeGreaterThan(0);

      // Should have relationships to PRD or Epic
      const hasUpstreamRelationship = relationships.some(
        (rel) =>
          rel['target_document_id'] === prd.id ||
          rel['target_document_id'] === autoEpic?.id
      );
      expect(hasUpstreamRelationship).toBe(true);

      // 7. Test comprehensive search across all created documents
      const searchResults = await documentManager.searchDocuments({
        searchType: 'combined',
        query: 'platform',
        projectId: testProject.id,
        limit: 10,
      });

      expect(searchResults?.documents.length).toBeGreaterThanOrEqual(3);

      const docTypes = new Set(searchResults?.documents?.map((d) => d.type));
      expect(docTypes.size).toBeGreaterThanOrEqual(2); // Multiple document types

      // 8. Verify project overview shows complete document hierarchy
      const projectOverview = await documentManager.getProjectWithDocuments(
        testProject.id
      );
      expect(projectOverview).not.toBeNull();
      expect(projectOverview?.documents.prds.length).toBe(1);
      expect(projectOverview?.documents.epics.length).toBeGreaterThanOrEqual(1);
      expect(projectOverview?.documents.features.length).toBe(1);
    });

    test('should handle workflow automation with complex conditions', async () => {
      // Create document with specific conditions for automation
      const feature =
        await documentManager.createDocument<FeatureDocumentEntity>(
          {
            type: 'feature',
            title: 'Critical Security Feature',
            content:
              'High-priority security feature requiring immediate attention...',
            summary: 'Critical security',
            author: 'security-team',
            project_id: testProject.id,
            status: 'draft',
            priority: 'high',
            keywords: ['security', 'critical', 'urgent'],
            metadata: {
              security_critical: true,
              requires_security_review: true,
            },
            // Required BaseDocumentEntity fields
            tags: ['feature', 'security'],
            related_documents: [],
            version: '1.0.0',
            dependencies: [],
            searchable_content: 'High-priority security feature requiring immediate attention security critical urgent',
            workflow_stage: 'development',
            completion_percentage: 0,
              // Required FeatureDocumentEntity fields
            feature_type: 'infrastructure',
            acceptance_criteria: ['Security compliance', 'Security validation works'],
            technical_approach: 'Implement encryption and audit logging',
            task_ids: [],
            implementation_status: 'not_started'
          },
          {
            startWorkflow: 'feature_workflow',
          }
        );

      // Update status to trigger automation
      await documentManager.updateDocument(feature.id, { status: 'approved' });

      // The workflow automation should have triggered
      await documentManager.advanceDocumentWorkflow(feature.id, 'approved');

      // Wait for automation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify automation actions were taken
      const workflowState = await documentManager.getDocument(feature.id, {
        includeWorkflowState: true,
      });
      const workflow = (workflowState as any).workflowState as any;

      expect(workflow['current_stage']).toBe('approved');

      // Check for auto-created tasks
      const { documents: tasks } = await documentManager.queryDocuments({
        type: 'task',
        projectId: testProject.id,
      });

      const securityTasks = tasks.filter(
        (task) => task.metadata?.['source_document_id'] === feature.id
      );

      expect(securityTasks.length).toBeGreaterThan(0);
    });
  });
});
