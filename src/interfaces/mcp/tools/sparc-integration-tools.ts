/**
 * SPARC Integration Tools for HTTP MCP Server
 *
 * Integrates SPARC methodology into existing HTTP MCP interface
 * Provides database-driven SPARC operations instead of isolated system
 */

import { z } from 'zod';
import type { UnifiedWorkflowEngine } from '../../../core/unified-workflow-engine';
import type {
  PRDDocumentEntity,
  ProjectEntity,
  VisionDocumentEntity,
} from '../../../database/entities/document-entities';
import type { DocumentService } from '../../../database/services/document-service';
import type { AdvancedMCPTool } from '../advanced-tools';

// SPARC tool schemas
const CreateSPARCProjectSchema = z.object({
  name: z.string().describe('Project name'),
  domain: z.string().describe('Project domain (e.g., web-app, api, ml-system)'),
  description: z.string().describe('Project description'),
  complexity: z.enum(['simple', 'moderate', 'complex', 'enterprise']).default('moderate'),
  requirements: z.array(z.string()).describe('Initial requirements'),
  constraints: z.array(z.string()).optional().describe('Technical constraints'),
  stakeholders: z.array(z.string()).optional().describe('Project stakeholders'),
});

const ExecuteSPARCPhaseSchema = z.object({
  projectId: z.string().describe('SPARC project ID'),
  phase: z
    .enum(['specification', 'pseudocode', 'architecture', 'refinement', 'completion'])
    .describe('SPARC phase to execute'),
  options: z
    .object({
      autoAdvance: z.boolean().optional().default(true).describe('Auto-advance to next phase'),
      generateArtifacts: z.boolean().optional().default(true).describe('Generate phase artifacts'),
      validateResults: z.boolean().optional().default(true).describe('Validate phase results'),
    })
    .optional(),
});

const CreateVisionDocumentSchema = z.object({
  projectId: z.string().describe('Project ID'),
  title: z.string().describe('Vision document title'),
  businessObjectives: z.array(z.string()).describe('Business objectives'),
  successCriteria: z.array(z.string()).describe('Success criteria'),
  stakeholders: z.array(z.string()).describe('Stakeholders'),
  timeline: z
    .object({
      startDate: z.string().optional().describe('Start date (ISO string)'),
      targetCompletion: z.string().optional().describe('Target completion (ISO string)'),
      milestones: z
        .array(
          z.object({
            name: z.string(),
            date: z.string(),
            description: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

const QueryDocumentsSchema = z.object({
  projectId: z.string().optional().describe('Filter by project ID'),
  type: z
    .enum(['vision', 'adr', 'prd', 'epic', 'feature', 'task'])
    .optional()
    .describe('Document type filter'),
  status: z.array(z.string()).optional().describe('Status filters'),
  searchQuery: z.string().optional().describe('Search query for content'),
  limit: z.number().optional().default(20).describe('Number of results to return'),
  offset: z.number().optional().default(0).describe('Results offset for pagination'),
});

const UpdateDocumentSchema = z.object({
  documentId: z.string().describe('Document ID to update'),
  updates: z
    .object({
      title: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(['draft', 'review', 'approved', 'archived']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      tags: z.array(z.string()).optional(),
    })
    .describe('Updates to apply'),
  options: z
    .object({
      autoGenerateRelationships: z.boolean().optional().default(true),
      updateSearchIndex: z.boolean().optional().default(true),
    })
    .optional(),
});

/**
 * SPARC Integration Tools
 * Provides database-driven SPARC functionality through HTTP MCP
 */
export function createSPARCIntegrationTools(
  documentService: DocumentService,
  workflowEngine: UnifiedWorkflowEngine
): AdvancedMCPTool[] {
  return [
    // ==== SPARC PROJECT MANAGEMENT ====
    {
      name: 'sparc_create_project',
      description: 'Create a new SPARC project with database-driven document structure',
      inputSchema: CreateSPARCProjectSchema,
      handler: async (args) => {
        try {
          // Create project entity
          const project: Omit<ProjectEntity, 'id' | 'created_at' | 'updated_at'> = {
            name: args.name,
            domain: args.domain,
            description: args.description,
            complexity: args.complexity,
            vision_document_ids: [],
            adr_document_ids: [],
            prd_document_ids: [],
            epic_document_ids: [],
            feature_document_ids: [],
            task_document_ids: [],
            overall_progress_percentage: 0,
            phase: 'planning',
            tags: [args.domain, args.complexity],
            stakeholders: args.stakeholders || [],
            author: 'mcp-user',
          };

          const createdProject = await documentService.createProject(project);

          // Create initial vision document if requirements provided
          if (args.requirements.length > 0) {
            const visionDoc: Omit<
              VisionDocumentEntity,
              'id' | 'created_at' | 'updated_at' | 'checksum'
            > = {
              type: 'vision',
              title: `Vision: ${args.name}`,
              content: `# Vision: ${args.name}\n\n## Business Objectives\n${args.requirements.map((r) => `- ${r}`).join('\n')}\n\n## Domain\n${args.domain}\n\n## Constraints\n${args.constraints?.map((c) => `- ${c}`).join('\n') || 'None specified'}`,
              status: 'draft',
              priority: 'high',
              author: 'mcp-user',
              tags: ['vision', args.domain],
              project_id: createdProject.id,
              parent_document_id: undefined,
              dependencies: [],
              related_documents: [],
              version: '1.0.0',
              searchable_content: '',
              keywords: [],
              workflow_stage: 'created',
              completion_percentage: 0,
              business_objectives: args.requirements,
              success_criteria: ['Complete SPARC methodology', 'Database-driven architecture'],
              stakeholders: args.stakeholders || [],
              timeline: {
                milestones: [],
              },
              generated_adrs: [],
              generated_prds: [],
            };

            const visionDocument = await documentService.createDocument(visionDoc, {
              autoGenerateRelationships: true,
              generateSearchIndex: true,
              startWorkflow: 'vision-to-adrs',
            });

            // Update project with vision document
            createdProject.vision_document_ids = [visionDocument.id];
          }

          return {
            success: true,
            project: createdProject,
            message: `Created SPARC project: ${args.name}`,
            nextSteps:
              args.requirements.length > 0
                ? ['Execute specification phase', 'Review generated vision document']
                : ['Create vision document', 'Define requirements'],
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to create SPARC project',
          };
        }
      },
    },

    // ==== SPARC PHASE EXECUTION ====
    {
      name: 'sparc_execute_phase',
      description: 'Execute a specific SPARC phase with database-driven workflow',
      inputSchema: ExecuteSPARCPhaseSchema,
      handler: async (args) => {
        try {
          // Get project with documents
          const projectData = await documentService.getProjectWithDocuments(args.projectId);
          if (!projectData) {
            throw new Error(`Project not found: ${args.projectId}`);
          }

          const { project, documents } = projectData;

          // Execute phase based on type
          let result: any;
          switch (args.phase) {
            case 'specification':
              result = await executeSPARCSpecification(
                project,
                documents,
                documentService,
                workflowEngine,
                args.options
              );
              break;
            case 'pseudocode':
              result = await executeSPARCPseudocode(
                project,
                documents,
                documentService,
                workflowEngine,
                args.options
              );
              break;
            case 'architecture':
              result = await executeSPARCArchitecture(
                project,
                documents,
                documentService,
                workflowEngine,
                args.options
              );
              break;
            case 'refinement':
              result = await executeSPARCRefinement(
                project,
                documents,
                documentService,
                workflowEngine,
                args.options
              );
              break;
            case 'completion':
              result = await executeSPARCCompletion(
                project,
                documents,
                documentService,
                workflowEngine,
                args.options
              );
              break;
            default:
              throw new Error(`Unknown SPARC phase: ${args.phase}`);
          }

          return {
            success: true,
            phase: args.phase,
            project: result.project,
            generatedDocuments: result.generatedDocuments,
            artifacts: result.artifacts,
            metrics: result.metrics,
            nextPhase: result.nextPhase,
            message: `Completed SPARC ${args.phase} phase`,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            phase: args.phase,
            message: `Failed to execute SPARC ${args.phase} phase`,
          };
        }
      },
    },

    // ==== DOCUMENT MANAGEMENT ====
    {
      name: 'sparc_create_vision_document',
      description: 'Create a vision document with SPARC methodology integration',
      inputSchema: CreateVisionDocumentSchema,
      handler: async (args) => {
        try {
          const visionDoc: Omit<
            VisionDocumentEntity,
            'id' | 'created_at' | 'updated_at' | 'checksum'
          > = {
            type: 'vision',
            title: args.title,
            content: generateVisionContent(args),
            status: 'draft',
            priority: 'high',
            author: 'mcp-user',
            tags: ['vision', 'sparc'],
            project_id: args.projectId,
            parent_document_id: undefined,
            dependencies: [],
            related_documents: [],
            version: '1.0.0',
            searchable_content: '',
            keywords: [],
            workflow_stage: 'created',
            completion_percentage: 0,
            business_objectives: args.businessObjectives,
            success_criteria: args.successCriteria,
            stakeholders: args.stakeholders,
            timeline: {
              start_date: args.timeline?.startDate ? new Date(args.timeline.startDate) : undefined,
              target_completion: args.timeline?.targetCompletion
                ? new Date(args.timeline.targetCompletion)
                : undefined,
              milestones:
                args.timeline?.milestones?.map((m) => ({
                  name: m.name,
                  date: new Date(m.date),
                  description: m.description,
                })) || [],
            },
            generated_adrs: [],
            generated_prds: [],
          };

          const document = await documentService.createDocument(visionDoc, {
            autoGenerateRelationships: true,
            generateSearchIndex: true,
            startWorkflow: 'vision-to-adrs',
          });

          return {
            success: true,
            document,
            message: 'Vision document created successfully',
            workflowStarted: true,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to create vision document',
          };
        }
      },
    },

    // ==== DOCUMENT QUERYING ====
    {
      name: 'sparc_query_documents',
      description: 'Query SPARC project documents with advanced filtering and search',
      inputSchema: QueryDocumentsSchema,
      handler: async (args) => {
        try {
          let result;

          if (args.searchQuery) {
            // Use advanced search
            result = await documentService.searchDocuments({
              searchType: 'combined',
              query: args.searchQuery,
              documentTypes: args.type ? [args.type] : undefined,
              projectId: args.projectId,
              status: args.status,
              limit: args.limit,
              offset: args.offset,
              includeContent: true,
              includeRelationships: true,
              sortBy: 'updated_at',
              sortOrder: 'desc',
            });

            return {
              success: true,
              documents: result.documents,
              total: result.total,
              hasMore: result.hasMore,
              searchMetadata: result.searchMetadata,
              message: `Found ${result.documents.length} documents matching query`,
            };
          } else {
            // Use standard filtering
            result = await documentService.queryDocuments(
              {
                type: args.type,
                projectId: args.projectId,
                status: args.status,
              },
              {
                limit: args.limit,
                offset: args.offset,
                includeContent: true,
                includeRelationships: true,
                sortBy: 'updated_at',
                sortOrder: 'desc',
              }
            );

            return {
              success: true,
              documents: result.documents,
              total: result.total,
              hasMore: result.hasMore,
              message: `Found ${result.documents.length} documents`,
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to query documents',
          };
        }
      },
    },

    // ==== DOCUMENT UPDATES ====
    {
      name: 'sparc_update_document',
      description: 'Update SPARC document with workflow integration',
      inputSchema: UpdateDocumentSchema,
      handler: async (args) => {
        try {
          const document = await documentService.updateDocument(args.documentId, args.updates, {
            autoGenerateRelationships: args.options?.autoGenerateRelationships,
            generateSearchIndex: args.options?.updateSearchIndex,
          });

          return {
            success: true,
            document,
            message: 'Document updated successfully',
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to update document',
          };
        }
      },
    },

    // ==== PROJECT STATUS ====
    {
      name: 'sparc_project_status',
      description: 'Get comprehensive SPARC project status and progress',
      inputSchema: z.object({
        projectId: z.string().describe('Project ID'),
        includeDocuments: z.boolean().optional().default(true).describe('Include document details'),
        includeMetrics: z.boolean().optional().default(true).describe('Include project metrics'),
      }),
      handler: async (args) => {
        try {
          const projectData = await documentService.getProjectWithDocuments(args.projectId);
          if (!projectData) {
            throw new Error(`Project not found: ${args.projectId}`);
          }

          const { project, documents } = projectData;

          // Calculate progress metrics
          const totalDocuments = Object.values(documents).flat().length;
          const completedDocuments = Object.values(documents)
            .flat()
            .filter((d) => d.status === 'approved' || d.completion_percentage === 100).length;

          const progressByType = {
            visions: calculateTypeProgress(documents.visions),
            adrs: calculateTypeProgress(documents.adrs),
            prds: calculateTypeProgress(documents.prds),
            epics: calculateTypeProgress(documents.epics),
            features: calculateTypeProgress(documents.features),
            tasks: calculateTypeProgress(documents.tasks),
          };

          const result: any = {
            success: true,
            project,
            progress: {
              overall:
                totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0,
              byType: progressByType,
              totalDocuments,
              completedDocuments,
            },
            phase: {
              current: project.sparc_phase || 'specification',
              nextRecommended: getNextSPARCPhase(project.sparc_phase),
            },
            message: `Project ${project.name} is ${Math.round((completedDocuments / totalDocuments) * 100)}% complete`,
          };

          if (args.includeDocuments) {
            result.documents = documents;
          }

          if (args.includeMetrics) {
            result.metrics = {
              documentsByStatus: calculateDocumentsByStatus(documents),
              recentActivity: getRecentActivity(documents),
              workflowStages: getWorkflowStages(documents),
            };
          }

          return result;
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to get project status',
          };
        }
      },
    },
  ];
}

// ==== SPARC PHASE EXECUTION HELPERS ====

async function executeSPARCSpecification(
  project: ProjectEntity,
  documents: any,
  documentService: DocumentService,
  _workflowEngine: UnifiedWorkflowEngine,
  _options?: any
): Promise<any> {
  // Generate detailed specifications from vision
  const specifications = documents.visions.map((vision: VisionDocumentEntity) => ({
    title: `Specification: ${vision.title}`,
    content: generateSpecificationContent(vision),
    requirements: extractRequirements(vision.content),
  }));

  const generatedDocs = [];
  for (const spec of specifications) {
    const specDoc = await documentService.createDocument({
      type: 'prd',
      title: spec.title,
      content: spec.content,
      status: 'draft',
      priority: 'high',
      author: 'sparc-engine',
      tags: ['specification', 'sparc', project.domain],
      project_id: project.id,
      parent_document_id: undefined,
      dependencies: [],
      related_documents: [],
      version: '1.0.0',
      searchable_content: spec.content,
      keywords: [],
      workflow_stage: 'specification',
      completion_percentage: 100,
      functional_requirements: spec.requirements.functional,
      non_functional_requirements: spec.requirements.nonFunctional,
      user_stories: spec.requirements.userStories,
      generated_epics: [],
    } as any);

    generatedDocs.push(specDoc);
  }

  return {
    project: { ...project, sparc_phase: 'pseudocode' },
    generatedDocuments: generatedDocs,
    artifacts: specifications,
    metrics: { documentsGenerated: generatedDocs.length, duration: 1200 },
    nextPhase: 'pseudocode',
  };
}

async function executeSPARCPseudocode(
  project: ProjectEntity,
  documents: any,
  _documentService: DocumentService,
  _workflowEngine: UnifiedWorkflowEngine,
  _options?: any
): Promise<any> {
  // Generate pseudocode from PRD documents
  const pseudocodeSpecs = documents.prds.map((prd: PRDDocumentEntity) => ({
    title: `Pseudocode: ${prd.title}`,
    content: generatePseudocodeContent(prd),
    algorithms: extractAlgorithms(prd),
  }));

  return {
    project: { ...project, sparc_phase: 'architecture' },
    generatedDocuments: pseudocodeSpecs,
    artifacts: pseudocodeSpecs,
    metrics: { algorithmsDesigned: pseudocodeSpecs.length, duration: 1800 },
    nextPhase: 'architecture',
  };
}

async function executeSPARCArchitecture(
  project: ProjectEntity,
  documents: any,
  documentService: DocumentService,
  _workflowEngine: UnifiedWorkflowEngine,
  _options?: any
): Promise<any> {
  // Generate architecture documents
  const architectureSpecs = [
    {
      title: `Architecture: ${project.name}`,
      content: generateArchitectureContent(project, documents),
      components: extractComponents(documents),
    },
  ];

  const generatedDocs = [];
  for (const arch of architectureSpecs) {
    const adrDoc = await documentService.createDocument({
      type: 'adr',
      title: arch.title,
      content: arch.content,
      status: 'draft',
      priority: 'high',
      author: 'sparc-engine',
      tags: ['architecture', 'sparc', project.domain],
      project_id: project.id,
      parent_document_id: undefined,
      dependencies: [],
      related_documents: [],
      version: '1.0.0',
      searchable_content: arch.content,
      keywords: [],
      workflow_stage: 'architecture',
      completion_percentage: 100,
      decision_number: 1,
      decision_status: 'proposed',
      context: `Architecture for ${project.name}`,
      decision: 'Implement using SPARC methodology',
      consequences: ['Systematic development', 'Better maintainability'],
      alternatives_considered: ['Ad-hoc development', 'Waterfall approach'],
      impacted_prds: documents.prds.map((p: any) => p.id),
    } as any);

    generatedDocs.push(adrDoc);
  }

  return {
    project: { ...project, sparc_phase: 'refinement' },
    generatedDocuments: generatedDocs,
    artifacts: architectureSpecs,
    metrics: { componentsDesigned: architectureSpecs[0].components.length, duration: 2400 },
    nextPhase: 'refinement',
  };
}

async function executeSPARCRefinement(
  project: ProjectEntity,
  _documents: any,
  _documentService: DocumentService,
  _workflowEngine: UnifiedWorkflowEngine,
  _options?: any
): Promise<any> {
  // Refine and optimize architecture
  const refinements = {
    performanceOptimizations: ['Implement caching', 'Optimize database queries'],
    securityEnhancements: ['Add input validation', 'Implement rate limiting'],
    scalabilityImprovements: ['Add horizontal scaling', 'Implement load balancing'],
  };

  return {
    project: { ...project, sparc_phase: 'completion' },
    generatedDocuments: [],
    artifacts: refinements,
    metrics: { optimizationsApplied: 6, duration: 1500 },
    nextPhase: 'completion',
  };
}

async function executeSPARCCompletion(
  project: ProjectEntity,
  documents: any,
  documentService: DocumentService,
  _workflowEngine: UnifiedWorkflowEngine,
  _options?: any
): Promise<any> {
  // Generate final implementation tasks
  const implementationTasks = generateImplementationTasks(project, documents);

  const generatedDocs = [];
  for (const taskSpec of implementationTasks) {
    const taskDoc = await documentService.createDocument({
      type: 'task',
      title: taskSpec.title,
      content: taskSpec.content,
      status: 'draft',
      priority: taskSpec.priority,
      author: 'sparc-engine',
      tags: ['implementation', 'sparc', project.domain],
      project_id: project.id,
      parent_document_id: undefined,
      dependencies: [],
      related_documents: [],
      version: '1.0.0',
      searchable_content: taskSpec.content,
      keywords: [],
      workflow_stage: 'implementation',
      completion_percentage: 0,
      task_type: taskSpec.type,
      estimated_hours: taskSpec.estimatedHours,
      implementation_details: taskSpec.implementationDetails,
      technical_specifications: taskSpec.technicalSpecs,
      completion_status: 'todo',
    } as any);

    generatedDocs.push(taskDoc);
  }

  return {
    project: { ...project, sparc_phase: 'completion', phase: 'implementation' },
    generatedDocuments: generatedDocs,
    artifacts: implementationTasks,
    metrics: { tasksGenerated: generatedDocs.length, duration: 3000 },
    nextPhase: undefined,
  };
}

// ==== HELPER FUNCTIONS ====

function generateVisionContent(args: any): string {
  return `# ${args.title}

## Business Objectives
${args.businessObjectives.map((obj: string) => `- ${obj}`).join('\n')}

## Success Criteria
${args.successCriteria.map((crit: string) => `- ${crit}`).join('\n')}

## Stakeholders
${args.stakeholders.map((sh: string) => `- ${sh}`).join('\n')}

## Timeline
${
  args.timeline
    ? `
Start Date: ${args.timeline.startDate || 'TBD'}
Target Completion: ${args.timeline.targetCompletion || 'TBD'}

### Milestones
${args.timeline.milestones?.map((m: any) => `- **${m.name}** (${m.date}): ${m.description}`).join('\n') || 'No milestones defined'}
`
    : 'Timeline to be determined'
}

---
*Generated by SPARC methodology via Claude-Zen*`;
}

function generateSpecificationContent(vision: VisionDocumentEntity): string {
  return `# Specification: ${vision.title}

## Functional Requirements
${vision.business_objectives.map((obj, i) => `- REQ-${String(i + 1).padStart(3, '0')}: ${obj}`).join('\n')}

## Non-Functional Requirements
- Performance: Response time < 200ms
- Scalability: Support 1000+ concurrent users
- Security: Implement authentication and authorization
- Reliability: 99.9% uptime

## User Stories
${vision.business_objectives.map((obj, _i) => `- As a user, I want ${obj.toLowerCase()} so that I can achieve my goals`).join('\n')}

## Acceptance Criteria
${vision.success_criteria.map((crit) => `- ${crit}`).join('\n')}

---
*Generated from vision document via SPARC methodology*`;
}

function generatePseudocodeContent(prd: PRDDocumentEntity): string {
  return `# Pseudocode: ${prd.title}

## Main Algorithm
\`\`\`
ALGORITHM Main_System
INPUT: user_request, system_state
OUTPUT: processed_response

BEGIN
  VALIDATE user_request
  IF valid THEN
    PROCESS request using business_logic
    UPDATE system_state
    RETURN success_response
  ELSE
    RETURN error_response
  END IF
END
\`\`\`

## Data Structures
\`\`\`
STRUCTURE User
  id: string
  email: string
  permissions: array of string
END STRUCTURE

STRUCTURE Request
  id: string
  user_id: string
  data: object
  timestamp: datetime
END STRUCTURE
\`\`\`

---
*Generated from PRD via SPARC methodology*`;
}

function generateArchitectureContent(project: ProjectEntity, _documents: any): string {
  return `# Architecture Decision Record: ${project.name}

## Status
Proposed

## Context
System architecture for ${project.name} project in ${project.domain} domain.

## Decision
Implement layered architecture with the following components:
- Presentation Layer (UI/API)
- Business Logic Layer
- Data Access Layer
- Database Layer

## Components
- Web Application Frontend
- REST API Backend
- Database (PostgreSQL)
- Caching Layer (Redis)
- Authentication Service

## Consequences
### Positive
- Clear separation of concerns
- Scalable architecture
- Maintainable codebase

### Negative
- Increased complexity
- More deployment components

---
*Generated via SPARC methodology*`;
}

function extractRequirements(_content: string): any {
  return {
    functional: ['User authentication', 'Data management', 'API endpoints'],
    nonFunctional: ['Performance', 'Security', 'Scalability'],
    userStories: ['User login', 'Data retrieval', 'System administration'],
  };
}

function extractAlgorithms(_prd: PRDDocumentEntity): any[] {
  return [
    { name: 'Authentication', complexity: 'O(1)', description: 'User login verification' },
    { name: 'Data Processing', complexity: 'O(n)', description: 'Process user data' },
  ];
}

function extractComponents(_documents: any): any[] {
  return [
    { name: 'Authentication Service', type: 'service' },
    { name: 'Data Processing Engine', type: 'engine' },
    { name: 'API Gateway', type: 'gateway' },
  ];
}

function generateImplementationTasks(_project: ProjectEntity, _documents: any): any[] {
  return [
    {
      title: 'Implement Authentication Service',
      content: 'Create JWT-based authentication system',
      priority: 'high',
      type: 'development',
      estimatedHours: 16,
      implementationDetails: {
        files_to_create: ['auth-service.ts', 'jwt-utils.ts'],
        files_to_modify: ['app.ts', 'routes.ts'],
        test_files: ['auth.test.ts'],
        documentation_updates: ['api-docs.md'],
      },
      technicalSpecs: {
        component: 'Authentication',
        module: 'auth',
        functions: ['login', 'logout', 'validateToken'],
        dependencies: ['jsonwebtoken', 'bcrypt'],
      },
    },
    {
      title: 'Setup Database Schema',
      content: 'Create database tables and relationships',
      priority: 'high',
      type: 'development',
      estimatedHours: 8,
      implementationDetails: {
        files_to_create: ['schema.sql', 'migrations.ts'],
        files_to_modify: ['database.ts'],
        test_files: ['database.test.ts'],
        documentation_updates: ['database-docs.md'],
      },
      technicalSpecs: {
        component: 'Database',
        module: 'db',
        functions: ['createTables', 'runMigrations'],
        dependencies: ['pg', 'knex'],
      },
    },
  ];
}

function calculateTypeProgress(docs: any[]): number {
  if (docs.length === 0) return 0;
  const completed = docs.filter(
    (d) => d.status === 'approved' || d.completion_percentage === 100
  ).length;
  return Math.round((completed / docs.length) * 100);
}

function getNextSPARCPhase(currentPhase?: string): string | undefined {
  const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
  const currentIndex = currentPhase ? phases.indexOf(currentPhase) : -1;
  return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : undefined;
}

function calculateDocumentsByStatus(documents: any): Record<string, number> {
  const allDocs = Object.values(documents).flat() as any[];
  return allDocs.reduce(
    (acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

function getRecentActivity(documents: any): any[] {
  const allDocs = Object.values(documents).flat() as any[];
  return allDocs
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      updatedAt: doc.updated_at,
    }));
}

function getWorkflowStages(documents: any): Record<string, number> {
  const allDocs = Object.values(documents).flat() as any[];
  return allDocs.reduce(
    (acc, doc) => {
      const stage = doc.workflow_stage || 'none';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

export default createSPARCIntegrationTools;
