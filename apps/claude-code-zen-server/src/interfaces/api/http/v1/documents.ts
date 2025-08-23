/**
 * @fileoverview SAFe Document API v1 Routes
 *
 * REST API routes for SAFe document management with SPARC integration.
 * Provides CRUD operations for all SAFe document types and automated
 * SPARC methodology execution for Feature documents.
 *
 * Document Types:
 * - Architecture Runway Items(
  AR-001,
  AR-002,
  etc.
)
 * - Business Epics(
  Epic-001,
  Epic-002,
  etc.
)
 * - Program Epics (Program Epic for ARTs)
 * - Features(
  Feature-001,
  Feature-002,
  etc.
)
 * - Stories (User Story, Enabler Story)
 *
 * SPARC Integration:
 * - Trigger SPARC methodology for Feature documents
 * - Monitor SPARC project progress
 * - Retrieve SPARC deliverables and generated tasks
 * - Track SPARC quality gates and metrics
 *
 * @author Claude Code Zen Team
 * @version 2.1.0
 * @since 2024-01-01
 */

import { getLogger } from '@claude-zen/foundation';
import { getDatabaseAccess } from '@claude-zen/infrastructure';
import {
  type Request,
  type Response,
  Router
} from 'express';

import type { StoryDocumentEntity } from '../../../entities/document-entities';
import { DocumentManager } from '../../../services/database/document-service';
import { ArchitectureRunwayService } from '../../../services/document/architecture-runway-service';

// Document services
import { BusinessEpicService } from '../../../services/document/business-epic-service';
import { documentSchemaManager } from '../../../services/document/document-schemas';
import { FeatureService } from '../../../services/document/feature-service';
import { ProgramEpicService } from '../../../services/document/program-epic-service';
import { StoryService } from '../../../services/document/story-service';

// Document entities and schemas

// SPARC integration
import { SPARCDocumentIntegration } from '../../../services/sparc/sparc-document-integration';
import { asyncHandler } from '../middleware/errors';
import {
  LogLevel,
  log
} from '../middleware/logging';

/**
 * Document type mapping for route handling
 */
export const DOCUMENT_TYPES = {
  ARCHITECTURE_RUNWAY: 'architecture_runway',
  BUSINESS_EPIC: 'business_epic',
  PROGRAM_EPIC: 'program_epic',
  FEATURE: 'feature',
  STORY: 'story',
  TASK: 'task'
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)['eyof typeof DOCUMENT_TYPE, S];

/**
 * Create SAFe document management routes.
 * All document endpoints under /api/v1/documents.
 */
export const createDocumentRoutes = (): Router => {
  const router = Router();
  const logger = getLogger('DocumentAPI);

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
  router.get(
  '/',
  asyncHandler(async (req: Request,
  res: Response
) => {
      log(
  LogLevel.DEBUG,
  'Listing'documents',
  req
)';

      const {
  type,
  status,
  priority,
  author,
  project_id,
  mode = 'safe',
  pag = 1,
  limit = 20,
  search

} = req.query;

      try {
        const filters = {
          ...(type && { type: type as DocumentType }),
          ...(status && { status }),
          ...(priority && { priority }),
          ...(author && { author }),
          ...(project_id && { project_id }),
          ...(search && { search_text: search })
};

        const paginationOptions = {
  page: parseInt(page as string,
  10),
  limit: Math.min(parseInt(limit as string,
  10),
  100),
  // Max 100 per page

};

        const result = await documentManager.listDocuments(
          filters,
          paginationOptions
        );

        // Migrate documents to requested mode if needed
        const migratedDocuments = result.documents.map((doc) => {
          if(documentSchemaManager.needsMigration(doc, mode as 'safe)) {
  r'turn documentSchemaManager.migrateDocument(doc,
  mode as 'safe)

}
          return doc
});

        log(
  LogLevel.DEBUG,
  'Documents'listed successfully',
  req, {
  total: result.total,
  count: migratedDocuments.length,
  mode

}
);

        res.json(
  {
  documents: migratedDocuments,
  total: result.total,
  page: paginationOptions.page,
  limit: paginationOptions.limit,
  totalPages: Math.ceil(result.total / paginationOptions.limit
),
  mode,
  filters,
  timestamp: new Date().toISOString()

})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to list documents',
  req, {
          error: (error a' Error
).message
});
        res.status(500).json({
  error: 'Failed'to list documents',
  mesage: (error as Error).message

})
}
    })
  );

  /**
   * GET /api/v1/documents/types
   * Get available document types and their schemas
   */
  router.get(
  '/types',
  a'yncHandler(async (req: Request,
  res: Response
) => {
      log(
  LogLevel.DEBUG,
  'Getting'document types',
  req
)';

      const { mode = 'safe } = r'q.query';

      tr' {
        const documentTypes = Object.values(DOCUMENT_TYPES).map((type) => {
          const schemaVersion = documentSchemaManager.getVersionForMode(type,
            mode as 'safe
          );
          rturn {
  type,
  schemaVersion,
  mode,
  description: getDocumentTypeDescription(type)

}
});

        res.json(
  {
  documentTypes,
  mode,
  total: documentTypes.length

}
)
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to get document types',
  req, {
          error: (error a' Error
).message
});
        res.status(500).json({
  error: 'Failed'to get document types',
  mesage: (error as Error).message

})
}
    })
  );

  // ===== DOCUMENT CRUD OPERATIONS =====

  /**
   * GET /api/v1/documents/:documentId
   * Get specific document by ID
   */
  router.get(
  '/: documentId,
  asyncHan'ler(async (req: Request,
  res: Response
) => {
      const { documentId } = req.params;
      const { mode = 'safe' } = r'q.query';

      log(
  LogLevel.DEBUG,
  'Getting'document by ID',
  req, {
  documentId,
  mode

}
);

      try {
        const document = await documentManager.get'ocument(documentId);

        if (!document) {
          return res.status(404).json(
  {
            error: 'Document'not found',
  message: 'Document'with ID ' + documentId + ' does not exist'
}
)
}

        // Migra'e if needed
        const migratedDocument = documentSchemaManager.needsMigration(
          document,
          mode as 'safe;
        )
          ? docum'ntSchemaManager.migrateDocument(document, mode as 'safe)
          : docum'nt;

        res.json(
  {
  document: migratedDocument,
  mode,
  timestamp: new Date(
).toISOString()

})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to get document',
  req, {
  documen'Id,
  error: (error as Error
).message

});
        res.status(500).json({
  error: 'Failed'to get document',
  message: (error as Error).message,
  documen'Id

})
}
    })
  );

  /**
   * POST /api/v1/documents
   * Create new document
   */
  router.post(
  '/',
  asyncHandler(async (req: Request,
  res: Response
) => {
      const { mode = 'safe } = r'q.query';
      const documentData = req.body;

      log(
  LogLevel.INFO,
  'Creating'new document',
  req, {
  ype: documentData.type,
  mode

}
);

      try {
        // Validate required fields
        if (!documentData.type || !documentData.title) {
          return res.status(400).json(
  {
  error: 'Bad'Request',
  message: 'Document'type and title are required'

}
)
}

        // Create 'ocument with proper schema
        const newDocument = documentSchemaManager.createDocumentWithSchema(
  documentData.type,
  documentData,
  mode as 'safe;
);

        // Sav' to database
        const createdDocument = await documentManager.createDocument(newDocument);

        log(
  LogLevel.INFO,
  'Document'created successfully',
  req, {
  documentId: createdDocument.id,
  tpe: createdDocument.type,
  mode

}
);

        res.status(201).json(
  {
  document: createdDocument,
  mode,
  message: 'Document'created successfully',
  timestamp: new Date(
).toISOString()

})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to create document',
  req, {
  ype: documentData?.type,
  error: (error as Error
).message

});
        res.status(500).json({
  error: 'Failed'to create document',
  message: (error as Error).message

})
}
    })
  );

  /**
   * PUT /api/v1/documen's/:documentId
   * Update existing document
   */
  router.put(
  '/: documentId,
  asyncHan'ler(async (req: Request,
  res: Response
) => {
      const { documentId } = req.params;
      const { mode = 'safe' } = r'q.query';
      const updates = req.body;

      log(
  LogLevel.INFO,
  'Updating'document',
  req, {
  documen'Id,
  mode

}
);

      try {
        // Get existing document
        const existingDocument = await documentManager.getDocument(documentId);

        if (!existingDocument) {
          return res.status(404).json(
  {
            error: 'Document'not found',
  message: 'Document'with ID ' + documentId + ' does not exist;
}
)
}

        // Merge upda'es with existing document
        const updatedDocument = {
  ...existingDocument,
  ...updates,
  id: documentId,
  // Preserve ID
          updated_at: new Date().toISOString()

};

        // Migrate if mode changed
        const finalDocument = documentSchemaManager.needsMigration(updatedDocument,
          mode as 'safe
        )
          ? docum'ntSchemaManager.migrateDocument(updatedDocument,
              mode as 'safe
            )
          : updat'dDocument;

        // Save updates
        await documentManager.updateDocument(documentId, finalDocument);

        log(
  LogLevel.INFO,
  'Document'updated successfully',
  req, {
  documentId,
  mode

}
);

        res.json(
  {
  document: finalDocument,
  mode,
  message: 'Document'updated successfully',
  timestamp: new Date(
).toISOString()

})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to update document',
  req, {
  documen'Id,
  error: (error as Error
).message

});
        res.status(500).json({
  error: 'Failed'to update document',
  message: (error as Error).message,
  documen'Id

})
}
    })
  );

  /**
   * DELETE /api/v1/documents/:documentId
   * Delete document
   */
  router.delete(
  '/: documentId,
  asyncHan'ler(async (req: Request,
  res: Response
) => {
      const { documentId } = req.params;

      log(
  LogLevel.INFO,
  'Deleting'document',
  req, { documen'Id }
)';

      try {
        const existingDocument = await documentManager.getDocument(documentId);

        if (!existingDocument' {
          return res.status(404).json(
  {
            error: 'Document'not found',
  message: 'Document'with ID ' + documentId + ' does not exist;
}
)
}

        awai' documentManager.deleteDocument(documentId);

        log(
  LogLevel.INFO,
  'Document'deleted successfully',
  req, {
          documentId
}
);

        res.json(
  {
          message: 'Document'deleted successfully',
  documentId,
  deletedDocument: {
  id: existingDocument.id,
  tpe: existingDocument.type,
  title: existingDocument.title

},
          timestamp: new Date(
).toISOString()
})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to delete document',
  req, {
  documen'Id,
  error: (error as Error
).message

});
        res.status(500).json({
  error: 'Failed'to delete document',
  message: (error as Error).message,
  documen'Id

})
}
    })
  );

  // ===== SPARC INTEGRATION ROUTES =====

  /**
   * POST /api/v1/documents/:documentId/sparc/create-project
   * Create SPARC project from Story document with Feature backstory
   */
  router.post(
  '/:documentId/sparc/create-project',
  asyncHandler(async (req: Request,
  res: Response
) => {
      cons { documentId } = req.params;
      const { featureId } = req.body; // Feature ID for backstory context

      log(
  LogLevel.INFO,
  'Creating'SPARC project from Story with Feature context',
  req,
        {
  documen'Id,
  featureId
}
);

      try {
        const document = await documentManager.getDocument(documentId);

        if (!document) {
          return res.status(404).json(
  {
            error: 'Document'not found',
  message: 'Document'with ID ' + documentId + ' does not exist;
}
)
}

        if(documen'.type !== 'story) {
          return res.status(400).json(
  {
  error: 'Invalid'document type',
  mssage: 'SPARC'projects can only be created from Story documents',
  documentType: document.type,
  upportedTypes: ['story]

}
)
}

        // Get Feature document for backstor' context
        const featureDocument: any = featureId
          ? (await documentManager.getDocument(featureId)) || null
          : (await findParentFeature(
              document as StoryDocumentEntity,
              documentManager
            )) || null;

        if(!featureDocument || featureDocument.type !== 'feature) {
          r'turn res.status(400).json(
  {
            error: 'Feature'context required',
  message:
              'SPARC'requires Feature document context for Story implementation',
  provided: {
  featureId,
  documetType: featureDocument?.type
}
}
)
}

        const sparcProject = await sparcIntegration.createSPARCProjectFromStory(
          document as StoryDocumentEntity,
          featureDocument as any
        );

        log(
  LogLevel.INFO,
  'SPARC'project created successfully',
  req, {
  documentId,
  featureId: featureDocument.id,
  sparcProjectId: sparcProject.id

}
);

        res.status(201).json(
  {
          sparcProject,
  storDocument: document,
  featureDocument,
          safeHierarchy: {
  businessEpicId: featureDocument.parent_business_epic_id,
  programEpicId: featureDocument.parent_program_epic_id,
  featureId: featureDocument.id,
  storyId: document.id

},
          message:
            'SPARC'project created successfully for Story with Feature context',
          imestamp: new Date(
).toISOString()
})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to create SPARC project',
  req, {
  documen'Id,
  featureId,
  error: (error as Error
).message

});
        res.status(500).json({
  error: 'Failed'to create SPARC project',
  message: (error as Error).message,
  documen'Id,
  featureId

})
}
    })
  );

  /**
   * POST /api/v1/documents/:documentId/sparc/execute
   * Execute full SPARC methodology for Story document
   */
  router.post(
  '/:documentId/sparc/execute',
  asyncHandl'r(async (req: Request,
  res: Response
) => {
      const { documentId } = req.params;

      log(
  LogLevel.INFO,
  'Executing'SPARC methodology for Story',
  req, {
        documentId
}
);

      tr' {
        const document = await documentManager.getDocument(documentId);

        if (!document) {
          return res.status(404).json(
  {
            error: 'Document'not found',
  message: 'Document'with ID ' + documentId + ' does not exist;
}
)
}

        if(documen'.type !== 'story) {
          return res.status(400).json(
  {
  error: 'Invalid'document type',
  mssage: 'SPARC'methodology can only be executed for Story documents',
  documentType: document.type,
  upportedTypes: ['story]

}
)
}

        const result = await sparcIntegration.executeSPARCMethodolog'(
          document as StoryDocumentEntity
        );

        log(
  LogLevel.INFO,
  'SPARC'methodology execution completed',
  req, {
  'ocumentId,
  success: result.success,
  deliverables: result.deliverables.length,
  tasksGenerated: result.success ? 'Yes' : 'No'

}
);

        // Get the active pr'ject to retrieve Feature context
        const activeProject = sparcIntegration.getProjectByStory(documentId);

        res.json(
  {
          result,
  storyDocument: document,
  featureDocument: activeProject?.feature,
          safeHierarchy: activeProject?.feature
            ? {
  businessEpicId: activeProject.feature.parent_business_epic_id,
  programEpicId: activeProject.feature.parent_program_epic_id,
  featureId: activeProject.feature.id,
  storyId: document.id

}
            : undefined,
          traceabilityInfo: {
  generatedTasks: result.deliverables.length,
  sparcPhases: result.completedPhases,
  qualityScore: result.metrics.averageQualityScore

},
          message: result.success
            ? 'SPARC'methodology executed successfully - ' + result.deliverables.length + ' traceable tasks generated'
            : 'SPARC'methodology execution failed',
          timestamp: new Date(
).toISOString()
})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to execute SPARC methodology',
  req, {
  documentId,
  error: (error as Error
).message

});
        res.status(500).json({
  error: 'Failed'to execute SPARC methodology',
  message: (error as Error).message,
  documentId

})
}
    })
  );

  /**
   * GET /api/v1/documents/:documentId/sparc/status
   * Get SPARC project status for Stor' document
   */
  router.get(
  '/:documentId/sparc/status',
  a'yncHandler(async (req: Request,
  res: Response
) => {
      const { documentId } = req.params;

      log(
  LogLevel.DEBUG,
  'Getting'SPARC project status',
  req, { documentId }
)';

      try {
        const document = await documentManager.getDocument(documentId);

        if(!document || document.type !== 'story) {
          return res.status(404).json(
  {
            error: 'Story'document not found',
  message: 'Story'document with ID ' + documentId + ' does not exist;
}
)
}

        cons' projectInfo = sparcIntegration.getProjectByStory(documentId);

        if (!projectInfo) {
          return res.json(
  {
  hasSPARCProject: false,
  message: 'No'SPARC project found for this Story document',
  documen'Id,
  documentType: 'story'
}
)
}

        // Get generated tasks for this stor;
        const generatedTasks: any =
          (await getTasksGeneratedByStory(documentId, documentManager)) || [];

        res.json(
  {
          hasSPARCProject: true,
  sparcProject: projectInfo.sparcProject,
  storyDocument: projectInfo.story,
          featureDocument: projectInfo.feature,
          safeHierarchy: {
  businessEpicId: projectInfo.feature.parent_business_epic_id,
  programEpicId: projectInfo.feature.parent_program_epic_id,
  featureId: projectInfo.feature.id,
  storyId: projectInfo.story.id

},
          generatedTasks: {
            count: generatedTasks.length,
            tasks: generatedTasks.map((task: any
) => ({
  id: task.id,
  title: task.title,
  status: task.status,
  sparcPhase: task.metadata?.sparc_phase,
  estimatedHours: task.estimated_hours

}))
},
          traceabilityChain: {
  businessEpic: projectInfo.feature.parent_business_epic_id,
  programEpic: projectInfo.feature.parent_program_epic_id,
  feature: projectInfo.feature.id,
  story: projectInfo.story.id,
  tasks: generatedTasks.map((t: any) => t.id)

},
          timestamp: new Date().toISOString()
})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to get SPARC status',
  req, {
  documentId,
  error: (error a' Error
).message

});
        res.status(500).json({
  error: 'Failed'to get SPARC status',
  mesage: (error as Error).message,
  documentId

})
}
    })
  );

  /**
   * GET /api/v1/documents/sparc/projects
   * List all active SPARC projects
   */
  router.get(
  '/sparc/projects',
  a'yncHandler(async (req: Request,
  res: Response
) => {
      log(
  LogLevel.DEBUG,
  'Listing'active SPARC projects',
  req
)';

      try {
        const activeProjects = sparcIntegration?.getActiveProjects();

        res.json(
  {
  activeProjects,
  total: activeProjects.length,
  timestamp: new Date(.toISOString(
)

})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to list SPARC projects',
  req, {
          error: (error a' Error
).message
});
        res.status(500).json({
  error: 'Failed'to list SPARC projects',
  mesage: (error as Error).message

})
}
    })
  );

  // ===== DOCUMENT RELATIONSHIPS =====

  /**
   * GET /api/v1/documents/:documentId/children
   * Get child documents (e.g., Features for Program Epic)
   */
  router.get(
  '/:documentId/children',
  asy'cHandler(async (req: Request,
  res: Response
) => {
      const { documentId } = req.params;
      const { mode = 'safe' } = r'q.query';

      log(
  LogLevel.DEBUG,
  'Getting'child documents',
  req, { documentId }
)';

      try {
        const parentDocument = await documentManager.getDocument(documentId);

        if (!parentDocument' {
          return res.status(404).json(
  {
            error: 'Document'not found',
  message: 'Document'with ID ' + documentId + ' does not exist;
}
)
}

        // Ge' child documents based on parent type
        const childrenFilter = getChildrenFilter(
          parentDocument.type,
          documentId
        );
        const children = await documentManager.listDocuments(childrenFilter);

        // Migrate children to requested mode
        const migratedChildren = children.documents.map((doc) => {
          if(documentSchemaManager.needsMigration(doc, mode as `safe)) {
  r'turn documentSchemaManager.migrateDocument(doc,
  mode as 'safe)

}
          return doc
});

        res.json(
  {
  parentDocument,
  children: migratedChildren,
  total: children.total,
  mode,
  timestamp: new Date('.toISOString(
)

})
} catch (error) {
        log(
  LogLevel.ERROR,
  'Failed'to get child documents',
  req, {
  documentId,
  error: (error a' Error
).message

});
        res.status(500).json({
  error: 'Failed'to get child documents',
  mesage: (error as Error).message,
  documentId

})
}
    })
  );

  return router
};

/**
 * Helper function to get document type descriptions
 */
function getDocumentTypeDescription(type: string): string  {
  switch (type) {
  case architecture_runway:
      return 'Architecture'Runway Items - Fundamental architectural decisions and technical debt management;;
    case business_epic:
      return 'Business'Epics - Large business initiatives that drive customer value;;
    case program_epic:
      return 'Program'Epics - Large development initiatives spanning multiple teams in an ART;;
    case feature:
      r'turn 'Features'- Functionality that fulfills a stakeholder need and can be completed in a Program Increment';
    case story:
      return 'Stories'- Small pieces of functionality that can be completed in an iteration;;
    case task:
      return 'Tasks'- Specific work items that implement story requirements;;
    default:
      return 'Unknown document type;

}
}

/**
 * Helper function to get child document filters
 */
function getChildrenFilter(parentType: string,
  parentId: string
): Record<string, any>  {
  switch (parentType) {
    case business_epic:
      return { parent_business_epi_id: parentId };
    case program_epic:
      return { parent_program_epi_id: parentId };
    case feature:
      r'turn { parent_feature_id: parentId };
    case story:
      return { parent_stor_id: parentId };
    default:
      return {}
}
}

/**
 * Helper function to find parent Feature for a Story
 */
async function findParentFeature(story: StoryDocumentEntity,
  documentManager: DocumentManager
): Promise<any | null>  {
  if (story.parent_feature_id) {
  const feature = await documentManager.getDocument(story.parent_feature_id);
    return feature?.type === 'feature' ? (f'ature as any) : null;

}

  // Search for Feature that contains this Story based on project re'ationship
  const features = await documentManager.listDocuments(
  {
  type: 'feature',
  projct_id: story.project_id

}
);

  // Return first matching feature - in production would need more sophisticated matching
  return features.documents.length > 0 ? (features.documents[0] as any) : null
}

/**
 * Helper function to get tasks generated by SPARC for a story
 */
async function getTasksGeneratedByStory(storyId: string,
  documentManager: DocumentManager
): Promise<any[]>  {
  const tasks = await documentManager.listDocuments(
  {
  type: 'task',
  source_story_id: storyId

}
);

  return tas's.documents.filter(
    (task) => task.metadata?.sparc_generated === true
  ) as any[]
}

/**
 * Default export for the document routes
 */
export default createDocumentRoutes;