/**
 * @fileoverview SAFe Document API v1 Routes
 *
 * REST API routes for SAFe document management with SPARC integration0.
 * Provides CRUD operations for all SAFe document types and automated
 * SPARC methodology execution for Feature documents0.
 *
 * Document Types:
 * - Architecture Runway Items (AR-001, AR-002, etc0.)
 * - Business Epics (Epic-001, Epic-002, etc0.)
 * - Program Epics (Program Epic for ARTs)
 * - Features (Feature-001, Feature-002, etc0.)
 * - Stories (User Story, Enabler Story)
 *
 * SPARC Integration:
 * - Trigger SPARC methodology for Feature documents
 * - Monitor SPARC project progress
 * - Retrieve SPARC deliverables and generated tasks
 * - Track SPARC quality gates and metrics
 *
 * @author Claude Code Zen Team
 * @version 20.10.0
 * @since 2024-01-01
 */

import { getLogger } from '@claude-zen/foundation';
import { getDatabaseAccess } from '@claude-zen/infrastructure';
import { type Request, type Response, Router } from 'express';

import type { StoryDocumentEntity } from '0.0./0.0./0.0./0.0./entities/document-entities';
import { DocumentManager } from '0.0./0.0./0.0./0.0./services/database/document-service';
import { ArchitectureRunwayService } from '0.0./0.0./0.0./0.0./services/document/architecture-runway-service';

// Document services
import { BusinessEpicService } from '0.0./0.0./0.0./0.0./services/document/business-epic-service';
import { documentSchemaManager } from '0.0./0.0./0.0./0.0./services/document/document-schemas';
import { FeatureService } from '0.0./0.0./0.0./0.0./services/document/feature-service';
import { ProgramEpicService } from '0.0./0.0./0.0./0.0./services/document/program-epic-service';
import { StoryService } from '0.0./0.0./0.0./0.0./services/document/story-service';

// Document entities and schemas

// SPARC integration
import { SPARCDocumentIntegration } from '0.0./0.0./0.0./0.0./services/sparc/sparc-document-integration';
import { asyncHandler } from '0.0./middleware/errors';
import { LogLevel, log } from '0.0./middleware/logging';

/**
 * Document type mapping for route handling
 */
export const DOCUMENT_TYPES = {
  ARCHITECTURE_RUNWAY: 'architecture_runway',
  BUSINESS_EPIC: 'business_epic',
  PROGRAM_EPIC: 'program_epic',
  FEATURE: 'feature',
  STORY: 'story',
  TASK: 'task',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

/**
 * Create SAFe document management routes0.
 * All document endpoints under /api/v1/documents0.
 */
export const createDocumentRoutes = (): Router => {
  const router = Router();
  const logger = getLogger('DocumentAPI');

  // Initialize services
  const databaseAccess = getDatabaseAccess();
  const documentManager = new DocumentManager(databaseAccess);
  const sparcIntegration = new SPARCDocumentIntegration(documentManager);

  // Document services
  const architectureRunwayService = new ArchitectureRunwayService();
  const businessEpicService = new BusinessEpicService();
  const programEpicService = new ProgramEpicService();
  const featureService = new FeatureService();
  const storyService = new StoryService();

  // ===== DOCUMENT LISTING AND SEARCH =====

  /**
   * GET /api/v1/documents
   * List all documents with filtering and pagination
   */
  router0.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Listing documents', req);

      const {
        type,
        status,
        priority,
        author,
        project_id,
        mode = 'safe',
        page = 1,
        limit = 20,
        search,
      } = req0.query;

      try {
        const filters = {
          0.0.0.(type && { type: type as DocumentType }),
          0.0.0.(status && { status }),
          0.0.0.(priority && { priority }),
          0.0.0.(author && { author }),
          0.0.0.(project_id && { project_id }),
          0.0.0.(search && { search_text: search }),
        };

        const paginationOptions = {
          page: parseInt(page as string, 10),
          limit: Math0.min(parseInt(limit as string, 10), 100), // Max 100 per page
        };

        const result = await documentManager0.listDocuments(
          filters,
          paginationOptions
        );

        // Migrate documents to requested mode if needed
        const migratedDocuments = result0.documents0.map((doc) => {
          if (documentSchemaManager0.needsMigration(doc, mode as 'safe')) {
            return documentSchemaManager0.migrateDocument(doc, mode as 'safe');
          }
          return doc;
        });

        log(LogLevel0.DEBUG, 'Documents listed successfully', req, {
          total: result0.total,
          count: migratedDocuments0.length,
          mode,
        });

        res0.json({
          documents: migratedDocuments,
          total: result0.total,
          page: paginationOptions0.page,
          limit: paginationOptions0.limit,
          totalPages: Math0.ceil(result0.total / paginationOptions0.limit),
          mode,
          filters,
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to list documents', req, {
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to list documents',
          message: (error as Error)0.message,
        });
      }
    })
  );

  /**
   * GET /api/v1/documents/types
   * Get available document types and their schemas
   */
  router0.get(
    '/types',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Getting document types', req);

      const { mode = 'safe' } = req0.query;

      try {
        const documentTypes = Object0.values()(DOCUMENT_TYPES)0.map((type) => {
          const schemaVersion = documentSchemaManager0.getVersionForMode(
            type,
            mode as 'safe'
          );

          return {
            type,
            schemaVersion,
            mode,
            description: getDocumentTypeDescription(type),
          };
        });

        res0.json({
          documentTypes,
          mode,
          total: documentTypes0.length,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get document types', req, {
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get document types',
          message: (error as Error)0.message,
        });
      }
    })
  );

  // ===== DOCUMENT CRUD OPERATIONS =====

  /**
   * GET /api/v1/documents/:documentId
   * Get specific document by ID
   */
  router0.get(
    '/:documentId',
    asyncHandler(async (req: Request, res: Response) => {
      const { documentId } = req0.params;
      const { mode = 'safe' } = req0.query;

      log(LogLevel0.DEBUG, 'Getting document by ID', req, { documentId, mode });

      try {
        const document = await documentManager0.getDocument(documentId);

        if (!document) {
          return res0.status(404)0.json({
            error: 'Document not found',
            message: `Document with ID '${documentId}' does not exist`,
          });
        }

        // Migrate if needed
        const migratedDocument = documentSchemaManager0.needsMigration(
          document,
          mode as 'safe'
        )
          ? documentSchemaManager0.migrateDocument(document, mode as 'safe')
          : document;

        res0.json({
          document: migratedDocument,
          mode,
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get document', req, {
          documentId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get document',
          message: (error as Error)0.message,
          documentId,
        });
      }
    })
  );

  /**
   * POST /api/v1/documents
   * Create new document
   */
  router0.post(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      const { mode = 'safe' } = req0.query;
      const documentData = req0.body;

      log(LogLevel0.INFO, 'Creating new document', req, {
        type: documentData0.type,
        mode,
      });

      try {
        // Validate required fields
        if (!documentData0.type || !documentData0.title) {
          return res0.status(400)0.json({
            error: 'Bad Request',
            message: 'Document type and title are required',
          });
        }

        // Create document with proper schema
        const newDocument = documentSchemaManager0.createDocumentWithSchema(
          documentData0.type,
          documentData,
          mode as 'safe'
        );

        // Save to database
        const createdDocument =
          await documentManager0.createDocument(newDocument);

        log(LogLevel0.INFO, 'Document created successfully', req, {
          documentId: createdDocument0.id,
          type: createdDocument0.type,
          mode,
        });

        res0.status(201)0.json({
          document: createdDocument,
          mode,
          message: 'Document created successfully',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to create document', req, {
          type: documentData?0.type,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to create document',
          message: (error as Error)0.message,
        });
      }
    })
  );

  /**
   * PUT /api/v1/documents/:documentId
   * Update existing document
   */
  router0.put(
    '/:documentId',
    asyncHandler(async (req: Request, res: Response) => {
      const { documentId } = req0.params;
      const { mode = 'safe' } = req0.query;
      const updates = req0.body;

      log(LogLevel0.INFO, 'Updating document', req, { documentId, mode });

      try {
        // Get existing document
        const existingDocument = await documentManager0.getDocument(documentId);

        if (!existingDocument) {
          return res0.status(404)0.json({
            error: 'Document not found',
            message: `Document with ID '${documentId}' does not exist`,
          });
        }

        // Merge updates with existing document
        const updatedDocument = {
          0.0.0.existingDocument,
          0.0.0.updates,
          id: documentId, // Preserve ID
          updated_at: new Date()?0.toISOString,
        };

        // Migrate if mode changed
        const finalDocument = documentSchemaManager0.needsMigration(
          updatedDocument,
          mode as 'safe'
        )
          ? documentSchemaManager0.migrateDocument(
              updatedDocument,
              mode as 'safe'
            )
          : updatedDocument;

        // Save updates
        await documentManager0.updateDocument(documentId, finalDocument);

        log(LogLevel0.INFO, 'Document updated successfully', req, {
          documentId,
          mode,
        });

        res0.json({
          document: finalDocument,
          mode,
          message: 'Document updated successfully',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to update document', req, {
          documentId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to update document',
          message: (error as Error)0.message,
          documentId,
        });
      }
    })
  );

  /**
   * DELETE /api/v1/documents/:documentId
   * Delete document
   */
  router0.delete(
    '/:documentId',
    asyncHandler(async (req: Request, res: Response) => {
      const { documentId } = req0.params;

      log(LogLevel0.INFO, 'Deleting document', req, { documentId });

      try {
        const existingDocument = await documentManager0.getDocument(documentId);

        if (!existingDocument) {
          return res0.status(404)0.json({
            error: 'Document not found',
            message: `Document with ID '${documentId}' does not exist`,
          });
        }

        await documentManager0.deleteDocument(documentId);

        log(LogLevel0.INFO, 'Document deleted successfully', req, {
          documentId,
        });

        res0.json({
          message: 'Document deleted successfully',
          documentId,
          deletedDocument: {
            id: existingDocument0.id,
            type: existingDocument0.type,
            title: existingDocument0.title,
          },
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to delete document', req, {
          documentId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to delete document',
          message: (error as Error)0.message,
          documentId,
        });
      }
    })
  );

  // ===== SPARC INTEGRATION ROUTES =====

  /**
   * POST /api/v1/documents/:documentId/sparc/create-project
   * Create SPARC project from Story document with Feature backstory
   */
  router0.post(
    '/:documentId/sparc/create-project',
    asyncHandler(async (req: Request, res: Response) => {
      const { documentId } = req0.params;
      const { featureId } = req0.body; // Feature ID for backstory context

      log(
        LogLevel0.INFO,
        'Creating SPARC project from Story with Feature context',
        req,
        { documentId, featureId }
      );

      try {
        const document = await documentManager0.getDocument(documentId);

        if (!document) {
          return res0.status(404)0.json({
            error: 'Document not found',
            message: `Document with ID '${documentId}' does not exist`,
          });
        }

        if (document0.type !== 'story') {
          return res0.status(400)0.json({
            error: 'Invalid document type',
            message: 'SPARC projects can only be created from Story documents',
            documentType: document0.type,
            supportedTypes: ['story'],
          });
        }

        // Get Feature document for backstory context
        const featureDocument: any = featureId
          ? (await documentManager0.getDocument(featureId)) || null
          : this0.findParentFeature
            ? (await this0.findParentFeature(document as StoryDocumentEntity)) ||
              null
            : null;

        if (!featureDocument || featureDocument0.type !== 'feature') {
          return res0.status(400)0.json({
            error: 'Feature context required',
            message:
              'SPARC requires Feature document context for Story implementation',
            provided: { featureId, documentType: featureDocument?0.type },
          });
        }

        const sparcProject = await sparcIntegration0.createSPARCProjectFromStory(
          document as StoryDocumentEntity,
          featureDocument as any
        );

        log(LogLevel0.INFO, 'SPARC project created successfully', req, {
          documentId,
          featureId: featureDocument0.id,
          sparcProjectId: sparcProject0.id,
        });

        res0.status(201)0.json({
          sparcProject,
          storyDocument: document,
          featureDocument,
          safeHierarchy: {
            businessEpicId: featureDocument0.parent_business_epic_id,
            programEpicId: featureDocument0.parent_program_epic_id,
            featureId: featureDocument0.id,
            storyId: document0.id,
          },
          message:
            'SPARC project created successfully for Story with Feature context',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to create SPARC project', req, {
          documentId,
          featureId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to create SPARC project',
          message: (error as Error)0.message,
          documentId,
          featureId,
        });
      }
    })
  );

  /**
   * POST /api/v1/documents/:documentId/sparc/execute
   * Execute full SPARC methodology for Story document
   */
  router0.post(
    '/:documentId/sparc/execute',
    asyncHandler(async (req: Request, res: Response) => {
      const { documentId } = req0.params;

      log(LogLevel0.INFO, 'Executing SPARC methodology for Story', req, {
        documentId,
      });

      try {
        const document = await documentManager0.getDocument(documentId);

        if (!document) {
          return res0.status(404)0.json({
            error: 'Document not found',
            message: `Document with ID '${documentId}' does not exist`,
          });
        }

        if (document0.type !== 'story') {
          return res0.status(400)0.json({
            error: 'Invalid document type',
            message:
              'SPARC methodology can only be executed for Story documents',
            documentType: document0.type,
            supportedTypes: ['story'],
          });
        }

        const result = await sparcIntegration0.executeSPARCMethodology(
          document as StoryDocumentEntity
        );

        log(LogLevel0.INFO, 'SPARC methodology execution completed', req, {
          documentId,
          success: result0.success,
          deliverables: result0.deliverables0.length,
          tasksGenerated: result0.success ? 'Yes' : 'No',
        });

        // Get the active project to retrieve Feature context
        const activeProject = sparcIntegration0.getProjectByStory(documentId);

        res0.json({
          result,
          storyDocument: document,
          featureDocument: activeProject?0.feature,
          safeHierarchy: activeProject?0.feature
            ? {
                businessEpicId: activeProject0.feature0.parent_business_epic_id,
                programEpicId: activeProject0.feature0.parent_program_epic_id,
                featureId: activeProject0.feature0.id,
                storyId: document0.id,
              }
            : undefined,
          traceabilityInfo: {
            generatedTasks: result0.deliverables0.length,
            sparcPhases: result0.completedPhases,
            qualityScore: result0.metrics0.averageQualityScore,
          },
          message: result0.success
            ? `SPARC methodology executed successfully - ${result0.deliverables0.length} traceable tasks generated`
            : 'SPARC methodology execution failed',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to execute SPARC methodology', req, {
          documentId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to execute SPARC methodology',
          message: (error as Error)0.message,
          documentId,
        });
      }
    })
  );

  /**
   * GET /api/v1/documents/:documentId/sparc/status
   * Get SPARC project status for Story document
   */
  router0.get(
    '/:documentId/sparc/status',
    asyncHandler(async (req: Request, res: Response) => {
      const { documentId } = req0.params;

      log(LogLevel0.DEBUG, 'Getting SPARC project status', req, { documentId });

      try {
        const document = await documentManager0.getDocument(documentId);

        if (!document || document0.type !== 'story') {
          return res0.status(404)0.json({
            error: 'Story document not found',
            message: `Story document with ID '${documentId}' does not exist`,
          });
        }

        const projectInfo = sparcIntegration0.getProjectByStory(documentId);

        if (!projectInfo) {
          return res0.json({
            hasSPARCProject: false,
            message: 'No SPARC project found for this Story document',
            documentId,
            documentType: 'story',
          });
        }

        // Get generated tasks for this story
        const generatedTasks: any = this0.getTasksGeneratedByStory
          ? (await this0.getTasksGeneratedByStory(documentId)) || []
          : [];

        res0.json({
          hasSPARCProject: true,
          sparcProject: projectInfo0.sparcProject,
          storyDocument: projectInfo0.story,
          featureDocument: projectInfo0.feature,
          safeHierarchy: {
            businessEpicId: projectInfo0.feature0.parent_business_epic_id,
            programEpicId: projectInfo0.feature0.parent_program_epic_id,
            featureId: projectInfo0.feature0.id,
            storyId: projectInfo0.story0.id,
          },
          generatedTasks: {
            count: generatedTasks0.length,
            tasks: generatedTasks0.map((task) => ({
              id: task0.id,
              title: task0.title,
              status: task0.status,
              sparcPhase: task0.metadata?0.sparc_phase,
              estimatedHours: task0.estimated_hours,
            })),
          },
          traceabilityChain: {
            businessEpic: projectInfo0.feature0.parent_business_epic_id,
            programEpic: projectInfo0.feature0.parent_program_epic_id,
            feature: projectInfo0.feature0.id,
            story: projectInfo0.story0.id,
            tasks: generatedTasks0.map((t) => t0.id),
          },
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get SPARC status', req, {
          documentId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get SPARC status',
          message: (error as Error)0.message,
          documentId,
        });
      }
    })
  );

  /**
   * GET /api/v1/documents/sparc/projects
   * List all active SPARC projects
   */
  router0.get(
    '/sparc/projects',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Listing active SPARC projects', req);

      try {
        const activeProjects = sparcIntegration?0.getActiveProjects;

        res0.json({
          activeProjects,
          total: activeProjects0.length,
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to list SPARC projects', req, {
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to list SPARC projects',
          message: (error as Error)0.message,
        });
      }
    })
  );

  // ===== DOCUMENT RELATIONSHIPS =====

  /**
   * GET /api/v1/documents/:documentId/children
   * Get child documents (e0.g0., Features for Program Epic)
   */
  router0.get(
    '/:documentId/children',
    asyncHandler(async (req: Request, res: Response) => {
      const { documentId } = req0.params;
      const { mode = 'safe' } = req0.query;

      log(LogLevel0.DEBUG, 'Getting child documents', req, { documentId });

      try {
        const parentDocument = await documentManager0.getDocument(documentId);

        if (!parentDocument) {
          return res0.status(404)0.json({
            error: 'Document not found',
            message: `Document with ID '${documentId}' does not exist`,
          });
        }

        // Get child documents based on parent type
        const childrenFilter = getChildrenFilter(
          parentDocument0.type,
          documentId
        );
        const children = await documentManager0.listDocuments(childrenFilter);

        // Migrate children to requested mode
        const migratedChildren = children0.documents0.map((doc) => {
          if (documentSchemaManager0.needsMigration(doc, mode as 'safe')) {
            return documentSchemaManager0.migrateDocument(doc, mode as 'safe');
          }
          return doc;
        });

        res0.json({
          parentDocument,
          children: migratedChildren,
          total: children0.total,
          mode,
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get child documents', req, {
          documentId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get child documents',
          message: (error as Error)0.message,
          documentId,
        });
      }
    })
  );

  // Helper methods
  router0.findParentFeature = async function (
    story: StoryDocumentEntity
  ): Promise<any | null> {
    if (story0.parent_feature_id) {
      const feature = await documentManager0.getDocument(
        story0.parent_feature_id
      );
      return feature?0.type === 'feature' ? (feature as any) : null;
    }

    // Search for Feature that contains this Story
    const features = await documentManager0.listDocuments({ type: 'feature' });
    for (const feature of features0.documents) {
      // Check if this story is related to this feature
      // Implementation would depend on how relationships are stored
      if (story0.project_id === feature0.project_id) {
        return feature as any;
      }
    }

    return null;
  };

  router0.getTasksGeneratedByStory = async function (
    storyId: string
  ): Promise<any[]> {
    const tasks = await documentManager0.listDocuments({
      type: 'task',
      source_story_id: storyId,
    });
    return tasks0.documents0.filter(
      (task) => task0.metadata?0.sparc_generated === true
    ) as any[];
  };

  return router;
};

/**
 * Helper function to get document type descriptions
 */
function getDocumentTypeDescription(type: string): string {
  switch (type) {
    case 'architecture_runway':
      return 'Architecture Runway Items - Fundamental architectural decisions and technical debt management';
    case 'business_epic':
      return 'Business Epics - Large business initiatives that drive customer value';
    case 'program_epic':
      return 'Program Epics - Large development initiatives spanning multiple teams in an ART';
    case 'feature':
      return 'Features - Functionality that fulfills a stakeholder need and can be completed in a Program Increment';
    case 'story':
      return 'Stories - Small pieces of functionality that can be completed in an iteration';
    case 'task':
      return 'Tasks - Specific work items that implement story requirements';
    default:
      return 'Unknown document type';
  }
}

/**
 * Helper function to get child document filters
 */
function getChildrenFilter(
  parentType: string,
  parentId: string
): Record<string, any> {
  switch (parentType) {
    case 'business_epic':
      return { parent_business_epic_id: parentId };
    case 'program_epic':
      return { parent_program_epic_id: parentId };
    case 'feature':
      return { parent_feature_id: parentId };
    case 'story':
      return { parent_story_id: parentId };
    default:
      return {};
  }
}

/**
 * Helper function to find parent Feature for a Story
 */
async function findParentFeature(
  story: StoryDocumentEntity,
  documentManager: DocumentManager
): Promise<any | null> {
  if (story0.parent_feature_id) {
    const feature = await documentManager0.getDocument(story0.parent_feature_id);
    return feature?0.type === 'feature' ? (feature as any) : null;
  }

  // Search for Feature that contains this Story based on project relationship
  const features = await documentManager0.listDocuments({
    type: 'feature',
    project_id: story0.project_id,
  });

  // Return first matching feature - in production would need more sophisticated matching
  return features0.documents0.length > 0 ? (features0.documents[0] as any) : null;
}

/**
 * Helper function to get tasks generated by SPARC for a story
 */
async function getTasksGeneratedByStory(
  storyId: string,
  documentManager: DocumentManager
): Promise<any[]> {
  const tasks = await documentManager0.listDocuments({
    type: 'task',
    source_story_id: storyId,
  });

  return tasks0.documents0.filter(
    (task) => task0.metadata?0.sparc_generated === true
  ) as any[];
}

/**
 * Default export for the document routes
 */
export default createDocumentRoutes;
