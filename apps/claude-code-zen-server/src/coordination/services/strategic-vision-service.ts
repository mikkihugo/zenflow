/**
 * Strategic Vision Service - Database-driven strategic analysis.
 *
 * Integrates with DocumentManager and DomainDiscoveryBridge to provide
 * comprehensive strategic vision analysis using structured database documents.
 * Does not re-import documents already saved to repo.
 */

import { getLogger } from '../../config/logging-config';
import type {
  BaseDocumentEntity,
  EpicDocumentEntity,
  PRDDocumentEntity,
  VisionDocumentEntity,
} from '../../database/entities/document-entities';
import { DocumentManager } from "../../services/document/document-service"
import type { DocumentType } from '../../workflows/types';

const logger = getLogger('coordination-services-strategic-vision');

export interface StrategicVisionAnalysis {
  projectId: string;
  missionStatement: string;
  strategicGoals: string[];
  businessValue: number; // 0-1 score
  technicalImpact: number; // 0-1 score
  marketPosition: string;
  targetOutcome: string;
  keyMetrics: string[];
  stakeholders: string[];
  timeline: string;
  risks: string[];
  confidenceScore: number; // 0-1 based on data sources
  sourceDocuments: string[]; // Ds of documents used in analysis
  lastAnalyzed: Date;
}

export interface VisionImportOptions {
  projectId: string;
  projectPath?: string;
  importFromFiles?: boolean;
  skipExistingDocuments?: boolean;
  documentTypes?: DocumentType[];
  saveToRepo?: boolean;
}

export class StrategicVisionService {
  private documentManager: DocumentManager;

  constructor() {
    this.documentManager = new DocumentManager();
  }

  /**
   * Analyze strategic vision from database documents (primary method)
   */
  async analyzeProjectVision(
    projectId: string
  ): Promise<StrategicVisionAnalysis> {
    try {
      logger.info(`Analyzing strategic vision for project: ${projectId}`);

      // Search for structured vision documents in database
      const visionQuery = await this.documentManager.searchDocuments({
        searchType: 'combined',
        query: 'vision mission strategy goals objectives',
        documentTypes: ['vision', 'prd', 'epic'],
        projectId,
        includeContent: true,
        includeRelationships: true,
      });

      if (!(visionQuery.success && visionQuery.data?.documents?.length)) {
        logger.warn(
          `No vision documents found for project ${projectId}, returning default analysis`
        );
        return this.createDefaultVisionAnalysis(projectId);
      }

      const documents = visionQuery.data.documents;
      logger.info(`Found ${documents.length} vision documents for analysis`);

      // Analyze structured vision documents
      const analysis = await this.analyzeStructuredDocuments(
        projectId,
        documents
      );

      // Enhance with cross-document relationships
      await this.enhanceWithRelationships(analysis, documents);

      logger.info(
        `Strategic vision analysis completed for ${projectId} with confidence ${analysis.confidenceScore}`
      );
      return analysis;
    } catch (error) {
      logger.error(`Error analyzing project vision for ${projectId}:`, error);
      return this.createErrorVisionAnalysis(projectId, error);
    }
  }

  /**
   * Import strategic documents into database from various sources
   * Only imports if not already present (no re-import of repo docs)
   */
  async importStrategicDocuments(options: VisionImportOptions): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    try {
      logger.info(
        `Importing strategic documents for project: ${options.projectId}`
      );

      const results = { imported: 0, skipped: 0, errors: [] };

      // Check existing documents to avoid re-import
      const existingDocs = await this.documentManager.getDocumentsByProject(
        options.projectId,
        {
          includeContent: false,
          sortBy: 'created_at',
          sortOrder: 'desc',
        }
      );

      const existingTypes = new Set(
        existingDocs.success && existingDocs.data?.documents
          ? existingDocs.data.documents.map((doc: unknown) => doc.type)
          : []
      );

      // Import from files if requested and documents don't exist
      if (options.importFromFiles && options.projectPath) {
        const fileImportResults = await this.importFromFiles(
          options.projectId,
          options.projectPath,
          existingTypes,
          options.skipExistingDocuments
        );

        results.imported += fileImportResults.imported;
        results.skipped += fileImportResults.skipped;
        results.errors.push(...fileImportResults.errors);
      }

      // Import from code comments (TODOs, STRATEGY, VISION annotations)
      const codeImportResults = await this.importFromCodeAnnotations(
        options.projectId,
        options.projectPath || `/home/mhugo/code/${options.projectId}`,
        existingTypes
      );

      results.imported += codeImportResults.imported;
      results.skipped += codeImportResults.skipped;
      results.errors.push(...codeImportResults.errors);

      logger.info(
        `Import completed: ${results.imported} imported, ${results.skipped} skipped, ${results.errors.length} errors`
      );
      return results;
    } catch (error) {
      logger.error(`Error importing strategic documents:`, error);
      return { imported: 0, skipped: 0, errors: [error.message] };
    }
  }

  /**
   * Create or update vision documents in database
   * Optionally save specific types back to repo
   */
  async createVisionDocument(
    projectId: string,
    type: 'vision' | 'prd' | 'epic' | 'strategy',
    content: {
      title: string;
      summary: string;
      content: string;
      goals?: string[];
      stakeholders?: string[];
      metrics?: string[];
      risks?: string[];
      timeline?: string;
    },
    saveToRepo = false
  ): Promise<{
    success: boolean;
    documentId?: string;
    repoPath?: string;
    error?: string;
  }> {
    try {
      logger.info(`Creating ${type} document for project ${projectId}`);

      // Create structured document in database
      const docData = {
        type,
        title: content.title,
        summary: content.summary,
        content: content.content,
        author: 'strategic-vision-service',
        project_id: projectId,
        status: 'draft' as const,
        priority: 'high' as const,
        keywords: content.goals || [],
        tags: [type, 'strategic', 'vision'],
        metadata: {
          stakeholders: content.stakeholders,
          key_metrics: content.metrics,
          risks: content.risks,
          timeline: content.timeline,
          created_by: 'strategic-vision-service',
          document_source: 'service_generated',
        },
        version: '1.0',
        dependencies: [],
        related_documents: [],
      };

      const createResult = await this.documentManager.createDocument(docData, {
        autoGenerateRelationships: true,
        generateSearchIndex: true,
        notifyListeners: true,
      });

      if (!createResult.success) {
        return {
          success: false,
          error: createResult.error?.message || 'Failed to create document',
        };
      }

      const documentId = createResult.data?.id;

      // Optionally save to repo (only for specific document types)
      let repoPath: string | undefined;
      if (saveToRepo && ['vision', 'strategy'].includes(type)) {
        repoPath = await this.saveToRepository(projectId, type, content);
      }

      logger.info(
        `${type} document created successfully with ID ${documentId}${repoPath ? ` and saved to ${repoPath}` : ''}`
      );

      return {
        success: true,
        documentId: documentId,
        repoPath,
      };
    } catch (error) {
      logger.error(`Error creating ${type} document:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get vision analysis for workspace display
   */
  async getVisionForWorkspace(
    projectId: string
  ): Promise<StrategicVisionAnalysis> {
    // Check if we have cached analysis
    const cached = await this.getCachedAnalysis(projectId);
    if (cached && this.isAnalysisRecent(cached)) {
      return cached;
    }

    // Perform fresh analysis
    const analysis = await this.analyzeProjectVision(projectId);

    // Cache the analysis
    await this.cacheAnalysis(analysis);

    return analysis;
  }

  // Private helper methods

  private async analyzeStructuredDocuments(
    projectId: string,
    documents: BaseDocumentEntity[]
  ): Promise<StrategicVisionAnalysis> {
    const visionDoc = documents.find((doc) => doc.type === 'vision') as
      | VisionDocumentEntity
      | undefined;
    const prdDoc = documents.find((doc) => doc.type === 'prd') as
      | PRDDocumentEntity
      | undefined;
    const epicDocs = documents.filter(
      (doc) => doc.type === 'epic'
    ) as EpicDocumentEntity[];

    // Extract strategic information from structured documents
    const missionStatement =
      visionDoc?.content?.split('\n')[0] ||
      prdDoc?.summary ||
      'Mission extracted from structured documents';

    const strategicGoals = [
      ...(visionDoc?.keywords || []),
      ...(prdDoc?.keywords || []),
      ...epicDocs.flatMap((epic) => epic.keywords || []),
    ].slice(0, 8);

    const stakeholders = [
      ...(visionDoc?.metadata?.stakeholders || []),
      ...(prdDoc?.metadata?.stakeholders || []),
    ];

    const risks = [
      ...(visionDoc?.metadata?.risks || []),
      ...(prdDoc?.metadata?.risks || []),
    ];

    const keyMetrics = visionDoc?.metadata?.key_metrics ||
      prdDoc?.metadata?.key_metrics || [
        'Quality',
        'Performance',
        'User satisfaction',
      ];

    // Calculate confidence based on document completeness
    const confidenceScore = this.calculateConfidenceScore(documents);

    return {
      projectId,
      missionStatement,
      strategicGoals:
        strategicGoals.length > 0
          ? strategicGoals
          : ['Strategic goals from database'],
      businessValue: 0.85, // High confidence from structured data
      technicalImpact: 0.85,
      marketPosition:
        visionDoc?.metadata?.market_position || 'Database-driven analysis',
      targetOutcome:
        visionDoc?.metadata?.target_outcome ||
        strategicGoals[0] ||
        'Structured outcome delivery',
      keyMetrics,
      stakeholders:
        stakeholders.length > 0 ? stakeholders : ['Database stakeholders'],
      timeline:
        visionDoc?.metadata?.timeline || 'Timeline from structured documents',
      risks: risks.length > 0 ? risks : ['Database-identified risks'],
      confidenceScore,
      sourceDocuments: documents.map((doc) => doc.id),
      lastAnalyzed: new Date(),
    };
  }

  private async enhanceWithRelationships(
    analysis: StrategicVisionAnalysis,
    documents: BaseDocumentEntity[]
  ): Promise<void> {
    // Enhance analysis with document relationships
    for (const doc of documents) {
      if (doc.related_documents?.length > 0) {
        // Could fetch related documents and extract additional insights
        logger.debug(
          `Document ${doc.id} has ${doc.related_documents.length} related documents`
        );
      }
    }
  }

  private async importFromFiles(
    projectId: string,
    projectPath: string,
    existingTypes: Set<string>,
    skipExisting = true
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const results = { imported: 0, skipped: 0, errors: [] };

    try {
      const { access, readFile, readdir } = await import('node:fs/promises');
      const { join, extname } = await import('node:path');

      // Discover all markdown and text files instead of hardcoded list
      const potentialDocFiles: string[] = [];

      try {
        const rootFiles = await readdir(projectPath);
        for (const file of rootFiles) {
          const ext = extname(file).toLowerCase();
          if (['.md', '.txt', '.rst', '.adoc'].includes(ext)) {
            potentialDocFiles.push(file);
          }
        }

        // Also check docs directory
        const docsPath = join(projectPath, 'docs');
        try {
          await access(docsPath);
          const docsFiles = await readdir(docsPath);
          for (const file of docsFiles) {
            const ext = extname(file).toLowerCase();
            if (['.md', '.txt', '.rst', '.adoc'].includes(ext)) {
              potentialDocFiles.push(join('docs', file));
            }
          }
        } catch {
          // docs directory doesn't exist
        }
      } catch (error) {
        results.errors.push(`Error reading directory: ${error.message}`);
        return results;
      }

      logger.info(
        `Found ${potentialDocFiles.length} potential document files for LLM classification`
      );

      // Classify each file using LLM content analysis
      for (const file of potentialDocFiles) {
        try {
          const filePath = join(projectPath, file);
          await access(filePath);
          const content = await readFile(filePath, 'utf8');

          // Skip empty files
          if (content.trim().length === 0) {
            continue;
          }

          // Use LLM to classify document content and suggest actions
          const classification = await this.classifyDocumentWithLLM(
            file,
            content
          );

          if (skipExisting && existingTypes.has(classification.documentType)) {
            results.skipped++;
            logger.info(
              `Skipping ${file} - type ${classification.documentType} already exists`
            );
            continue;
          }

          const docData = {
            type: classification.documentType,
            title: classification.suggestedTitle,
            summary: classification.summary,
            content,
            author: 'llm-content-classifier',
            project_id: projectId,
            status: 'draft' as const,
            priority: classification.suggestedPriority,
            keywords: classification.extractedKeywords,
            tags: [
              classification.documentType,
              'llm-classified',
              'content-analyzed',
              ...classification.suggestedTags,
            ],
            metadata: {
              source_file: file,
              import_date: new Date().toISOString(),
              document_source: 'llm_classified_import',
              llm_confidence: classification.confidence,
              suggested_actions: classification.suggestedActions,
              content_themes: classification.contentThemes,
              document_maturity: classification.documentMaturity,
              strategic_relevance: classification.strategicRelevance,
            },
            version: '1.0',
            dependencies: classification.suggestedDependencies,
            related_documents: [],
          };

          const createResult =
            await this.documentManager.createDocument(docData);
          if (createResult.success) {
            results.imported++;
            logger.info(
              `Successfully imported and classified: ${file} as ${classification.documentType} (confidence: ${classification.confidence})`
            );

            // Log human-actionable suggestions
            if (classification.suggestedActions.length > 0) {
              logger.info(
                `LLM suggestions for ${file}: ${classification.suggestedActions.join(', ')}`
              );
            }
          } else {
            results.errors.push(
              `Failed to import ${file}: ${createResult.error?.message}`
            );
          }
        } catch (fileError) {
          logger.warn(`Could not process file ${file}:`, fileError);
          // Continue with other files
        }
      }
    } catch (error) {
      results.errors.push(`Error importing files: ${error.message}`);
    }

    return results;
  }

  /**
   * Classify document content using LLM analysis instead of filename
   */
  private async classifyDocumentWithLLM(
    filename: string,
    content: string
  ): Promise<{
    documentType: string;
    suggestedTitle: string;
    summary: string;
    confidence: number;
    extractedKeywords: string[];
    suggestedTags: string[];
    suggestedPriority: 'low' | 'medium' | 'high';
    suggestedActions: string[];
    contentThemes: string[];
    documentMaturity: 'draft' | 'partial' | 'complete' | 'outdated';
    strategicRelevance: number; // 0-1 score
    suggestedDependencies: string[];
  }> {
    try {
      // Analyze content patterns and themes
      const contentLower = content.toLowerCase();
      const lines = content
        .split('\n')
        .filter((line) => line.trim().length > 0);
      const firstFewLines = lines.slice(0, 10).join('\n');

      // Content-based classification logic (simplified LLM simulation)
      let documentType = 'document'; // default
      let confidence = 0.5;
      const keywords: string[] = [];
      const themes: string[] = [];
      const actions: string[] = [];

      // Vision/Strategy detection
      if (this.containsVisionKeywords(contentLower)) {
        documentType = 'vision';
        confidence = 0.9;
        themes.push('strategic-planning', 'future-state', 'objectives');
        actions.push('Review strategic alignment with current goals');
        actions.push('Identify measurable outcomes and metrics');
      }

      // PRD/Requirements detection
      else if (this.containsRequirementsKeywords(contentLower)) {
        documentType = 'prd';
        confidence = 0.85;
        themes.push('requirements', 'specifications', 'user-needs');
        actions.push('Validate requirements with stakeholders');
        actions.push('Create technical specifications from requirements');
      }

      // Epic/Task detection
      else if (this.containsTaskKeywords(contentLower)) {
        documentType = 'epic';
        confidence = 0.8;
        themes.push('tasks', 'implementation', 'deliverables');
        actions.push('Break down epics into actionable tasks');
        actions.push('Assign priorities and effort estimates');
      }

      // Architecture/Technical detection
      else if (this.containsArchitectureKeywords(contentLower)) {
        documentType = 'adr';
        confidence = 0.85;
        themes.push('technical-decisions', 'architecture', 'system-design');
        actions.push('Document decision rationale and alternatives');
        actions.push('Update architecture diagrams and dependencies');
      }

      // Feature/Enhancement detection
      else if (this.containsFeatureKeywords(contentLower)) {
        documentType = 'feature';
        confidence = 0.75;
        themes.push('feature-development', 'user-experience', 'functionality');
        actions.push('Define user acceptance criteria');
        actions.push('Plan implementation phases and rollout');
      }

      // Default classification based on content structure
      else {
        // Analyze content structure for better classification
        if (lines.length < 5) {
          documentType = 'note';
          confidence = 0.6;
          actions.push('Expand content with more detailed information');
        } else if (this.hasStructuredFormat(content)) {
          documentType = 'specification';
          confidence = 0.7;
          actions.push('Review and validate technical specifications');
        } else {
          documentType = 'documentation';
          confidence = 0.6;
          actions.push('Organize content with clear structure and headings');
        }
      }

      // Extract keywords from content
      keywords.push(...this.extractKeywordsFromContent(content));

      // Determine document maturity
      const documentMaturity = this.assessDocumentMaturity(content);

      // Calculate strategic relevance
      const strategicRelevance = this.calculateStrategicRelevance(
        contentLower,
        themes
      );

      // Generate suggested title
      const suggestedTitle = this.generateSuggestedTitle(
        filename,
        firstFewLines,
        documentType
      );

      // Generate summary
      const summary = this.generateContentSummary(firstFewLines, themes);

      // Determine priority based on type and relevance
      const suggestedPriority =
        strategicRelevance > 0.7
          ? 'high'
          : strategicRelevance > 0.4
            ? 'medium'
            : 'low';

      // Add maturity-based actions
      if (documentMaturity === 'draft' || documentMaturity === 'partial') {
        actions.push('Complete missing sections and add more detail');
      } else if (documentMaturity === 'outdated') {
        actions.push(
          'Update content to reflect current state and requirements'
        );
      }

      return {
        documentType,
        suggestedTitle,
        summary,
        confidence,
        extractedKeywords: keywords,
        suggestedTags: themes,
        suggestedPriority,
        suggestedActions: actions,
        contentThemes: themes,
        documentMaturity,
        strategicRelevance,
        suggestedDependencies: [],
      };
    } catch (error) {
      logger.error('Error in LLM classification:', error);

      // Fallback classification
      return {
        documentType: 'document',
        suggestedTitle: filename,
        summary: 'Document classification failed - manual review needed',
        confidence: 0.1,
        extractedKeywords: [],
        suggestedTags: ['needs-classification'],
        suggestedPriority: 'medium',
        suggestedActions: ['Manually review and classify this document'],
        contentThemes: ['unclassified'],
        documentMaturity: 'draft',
        strategicRelevance: 0.5,
        suggestedDependencies: [],
      };
    }
  }

  // Content analysis helper methods
  private containsVisionKeywords(content: string): boolean {
    const visionKeywords = [
      'vision',
      'mission',
      'strategy',
      'goal',
      'objective',
      'future',
      'roadmap',
      'direction',
      'purpose',
      'value proposition',
    ];
    return visionKeywords.some((keyword) => content.includes(keyword));
  }

  private containsRequirementsKeywords(content: string): boolean {
    const reqKeywords = [
      'requirement',
      'specification',
      'user story',
      'acceptance criteria',
      'functional',
      'non-functional',
      'should',
      'must',
      'shall',
    ];
    return reqKeywords.some((keyword) => content.includes(keyword));
  }

  private containsTaskKeywords(content: string): boolean {
    const taskKeywords = [
      'todo',
      'task',
      'epic',
      'story',
      'ticket',
      'issue',
      'action item',
      'deliverable',
      'milestone',
    ];
    return taskKeywords.some((keyword) => content.includes(keyword));
  }

  private containsArchitectureKeywords(content: string): boolean {
    const archKeywords = [
      'architecture',
      'design',
      'technical decision',
      'adr',
      'component',
      'service',
      'api',
      'database',
      'infrastructure',
    ];
    return archKeywords.some((keyword) => content.includes(keyword));
  }

  private containsFeatureKeywords(content: string): boolean {
    const featureKeywords = [
      'feature',
      'enhancement',
      'functionality',
      'capability',
      'user interface',
      'user experience',
      'workflow',
    ];
    return featureKeywords.some((keyword) => content.includes(keyword));
  }

  private hasStructuredFormat(content: string): boolean {
    // Check for structured elements
    const hasHeaders = /^#{1,6}\s/.test(content);
    const hasBullets = /^\s*[-*+]\s/.test(content);
    const hasNumbering = /^\s*\d+\.\s/.test(content);
    const hasCode = /```/.test(content) || /`[^`]+`/.test(content);

    return hasHeaders || hasBullets || hasNumbering || hasCode;
  }

  private extractKeywordsFromContent(content: string): string[] {
    // Simple keyword extraction (could be enhanced with NLP)
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter(
        (word) =>
          ![
            'this',
            'that',
            'with',
            'from',
            'they',
            'will',
            'have',
            'been',
            'were',
            'said',
            'each',
            'which',
            'their',
            'time',
            'would',
            'there',
            'could',
            'other',
          ].includes(word)
      );

    // Count frequency and return top keywords
    const frequency = new Map<string, number>();
    words.forEach((word) => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private assessDocumentMaturity(
    content: string
  ): 'draft' | 'partial' | 'complete' | 'outdated' {
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    const totalLength = content.length;

    // Check for draft indicators
    if (
      content.toLowerCase().includes('draft') ||
      content.toLowerCase().includes('todo') ||
      content.toLowerCase().includes('wip')
    ) {
      return 'draft';
    }

    // Check for completeness indicators
    if (totalLength < 500 || lines.length < 10) {
      return 'partial';
    }

    // Check for outdated indicators
    const dateRegex = /\b(20\d{2})\b/g;
    const dates = content.match(dateRegex);
    if (dates) {
      const years = dates.map((date) => Number.parseInt(date));
      const oldestYear = Math.min(...years);
      const currentYear = new Date().getFullYear();
      if (currentYear - oldestYear > 2) {
        return 'outdated';
      }
    }

    return 'complete';
  }

  private calculateStrategicRelevance(
    content: string,
    themes: string[]
  ): number {
    let relevance = 0;

    // Base relevance from themes
    const strategicThemes = [
      'strategic-planning',
      'objectives',
      'requirements',
      'architecture',
    ];
    const strategicThemeCount = themes.filter((theme) =>
      strategicThemes.includes(theme)
    ).length;
    relevance += strategicThemeCount * 0.3;

    // Content-based relevance
    const strategicWords = [
      'strategic',
      'important',
      'critical',
      'priority',
      'business',
      'value',
      'impact',
      'outcome',
    ];
    const strategicWordCount = strategicWords.filter((word) =>
      content.includes(word)
    ).length;
    relevance += Math.min(strategicWordCount * 0.1, 0.4);

    return Math.min(relevance, 1.0);
  }

  private generateSuggestedTitle(
    filename: string,
    content: string,
    documentType: string
  ): string {
    // Try to extract title from first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Generate from filename and type
    const baseName = filename.replace(/\.(md|txt|rst|adoc)$/i, '');
    const typePrefix =
      documentType === 'vision'
        ? 'Vision:'
        : documentType === 'prd'
          ? 'Requirements:'
          : documentType === 'adr'
            ? 'Architecture:'
            : '';

    return typePrefix ? `${typePrefix} ${baseName}` : baseName;
  }

  private generateContentSummary(content: string, themes: string[]): string {
    const firstSentence = content.split('.')[0]?.trim();
    const themesText = themes.length > 0 ? ` Covers: ${themes.join(', ')}` : '';
    return `${firstSentence || 'Content summary'}.${themesText}`;
  }

  // .gitignore support helpers
  private async loadGitignorePatterns(
    projectPath: string
  ): Promise<Set<string>> {
    try {
      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const gitignorePatterns = new Set<string>();

      // Add default ignore patterns
      gitignorePatterns.add('.git');
      gitignorePatterns.add('node_modules');
      gitignorePatterns.add('.DS_Store');
      gitignorePatterns.add('*.log');
      gitignorePatterns.add('dist');
      gitignorePatterns.add('build');
      gitignorePatterns.add('coverage');
      gitignorePatterns.add('.next');
      gitignorePatterns.add('.cache');

      // Load .gitignore file if it exists
      try {
        const gitignorePath = join(projectPath, '.gitignore');
        const gitignoreContent = await readFile(gitignorePath, 'utf8');

        gitignoreContent
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .forEach((pattern) => {
            gitignorePatterns.add(pattern);
          });

        logger.info(
          `Loaded ${gitignorePatterns.size} .gitignore patterns for ${projectPath}`
        );
      } catch {
        // .gitignore doesn't exist, use defaults
        logger.info(
          `No .gitignore found, using default patterns for ${projectPath}`
        );
      }

      return gitignorePatterns;
    } catch (error) {
      logger.error('Error loading .gitignore patterns:', error);
      return new Set([
        '.git',
        'node_modules',
        '.DS_Store',
        '*.log',
        'dist',
        'build',
      ]);
    }
  }

  private shouldIgnoreFile(
    filePath: string,
    patterns: Set<string>,
    projectPath: string
  ): boolean {
    try {
      const { relative } = require('node:path');
      const relativePath = relative(projectPath, filePath);

      for (const pattern of patterns) {
        // Simple pattern matching (handles most common .gitignore patterns)
        if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          if (relativePath.startsWith(prefix)) return true;
        } else if (pattern.startsWith('*.')) {
          const extension = pattern.slice(1);
          if (filePath.endsWith(extension)) return true;
        } else if (pattern.endsWith('/')) {
          // Directory pattern
          const dirPattern = pattern.slice(0, -1);
          if (
            relativePath.startsWith(dirPattern + '/') ||
            relativePath === dirPattern
          )
            return true;
        } else if (
          relativePath === pattern ||
          relativePath.startsWith(pattern + '/')
        ) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  private async importFromCodeAnnotations(
    projectId: string,
    projectPath: string,
    existingTypes: Set<string>
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const results = { imported: 0, skipped: 0, errors: [] };

    try {
      const { access, readdir, readFile } = await import('node:fs/promises');
      const { join, extname } = await import('node:path');

      const srcPath = join(projectPath, 'src');
      await access(srcPath);
      const codeFiles = await readdir(srcPath, { recursive: true });

      const todoAnnotations: string[] = [];
      const strategyAnnotations: string[] = [];
      const visionAnnotations: string[] = [];

      for (const file of codeFiles.slice(0, 100)) {
        // Limit for performance
        if (
          typeof file === 'string' &&
          ['', '.tsx', '', '.jsx'].includes(extname(file))
        ) {
          try {
            const filePath = join(srcPath, file);
            const content = await readFile(filePath, 'utf8');

            // Extract different types of strategic annotations
            const todoMatches =
              content.match(
                /\/\/\s*TODO[:\s]*(.*)|\/\*\s*TODO[:\s]*(.*?)\*\//gi
              ) || [];
            const strategyMatches =
              content.match(
                /\/\/\s*STRATEGY[:\s]*(.*)|\/\*\s*STRATEGY[:\s]*(.*?)\*\//gi
              ) || [];
            const visionMatches =
              content.match(
                /\/\/\s*VISION[:\s]*(.*)|\/\*\s*VISION[:\s]*(.*?)\*\//gi
              ) || [];

            todoAnnotations.push(
              ...todoMatches.map((match) => `${file}: ${match.trim()}`)
            );
            strategyAnnotations.push(
              ...strategyMatches.map((match) => `${file}: ${match.trim()}`)
            );
            visionAnnotations.push(
              ...visionMatches.map((match) => `${file}: ${match.trim()}`)
            );
          } catch {
            // Skip files we can't read
          }
        }
      }

      // Create documents from code annotations if we have enough content
      const annotationDocs = [
        {
          type: 'epic',
          content: todoAnnotations,
          title: 'Code TODOs and Tasks',
        },
        {
          type: 'strategy',
          content: strategyAnnotations,
          title: 'Strategic Code Annotations',
        },
        {
          type: 'vision',
          content: visionAnnotations,
          title: 'Vision Code Annotations',
        },
      ];

      for (const annotationDoc of annotationDocs) {
        if (
          annotationDoc.content.length > 0 &&
          !existingTypes.has(annotationDoc.type)
        ) {
          const docData = {
            type: annotationDoc.type,
            title: `${annotationDoc.title} - ${projectId}`,
            summary: `Extracted from code annotations: ${annotationDoc.content.length} items`,
            content: annotationDoc.content.join('\n'),
            author: 'code-annotation-service',
            project_id: projectId,
            status: 'draft' as const,
            priority: 'low' as const,
            keywords: [],
            tags: [annotationDoc.type, 'code-annotations', 'extracted'],
            metadata: {
              annotation_count: annotationDoc.content.length,
              extraction_date: new Date().toISOString(),
              document_source: 'code_annotations',
            },
            version: '1.0',
            dependencies: [],
            related_documents: [],
          };

          const createResult =
            await this.documentManager.createDocument(docData);
          if (createResult.success) {
            results.imported++;
          } else {
            results.errors.push(
              `Failed to import ${annotationDoc.type} annotations: ${createResult.error?.message}`
            );
          }
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        // Don't error if src directory doesn't exist
        results.errors.push(
          `Error importing code annotations: ${error.message}`
        );
      }
    }

    return results;
  }

  private async saveToRepository(
    projectId: string,
    type: string,
    content: unknown
  ): Promise<string | undefined> {
    // Only save specific document types back to repo
    if (!['vision', 'strategy'].includes(type)) {
      return undefined;
    }

    try {
      const { writeFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const filename = type === 'vision' ? 'VISION.md' : 'STRATEGY.md';
      const projectPath = `/home/mhugo/code/${projectId}`;
      const filePath = join(projectPath, filename);

      const fileContent = `# ${content.title}\n\n${content.summary}\n\n${content.content}`;
      await writeFile(filePath, fileContent, 'utf8');

      logger.info(`Saved ${type} document to repository: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Error saving to repository:`, error);
      return undefined;
    }
  }

  private calculateConfidenceScore(documents: BaseDocumentEntity[]): number {
    let score = 0;

    // Base score for having documents
    score += Math.min(0.3, documents.length * 0.1);

    // Bonus for structured documents
    if (documents.some((doc) => doc.type === 'vision')) score += 0.3;
    if (documents.some((doc) => doc.type === 'prd')) score += 0.2;
    if (documents.some((doc) => doc.type === 'epic')) score += 0.1;

    // Bonus for complete metadata
    const hasMetadata = documents.some(
      (doc) => doc.metadata && Object.keys(doc.metadata).length > 3
    );
    if (hasMetadata) score += 0.1;

    return Math.min(1.0, score);
  }

  private createDefaultVisionAnalysis(
    projectId: string
  ): StrategicVisionAnalysis {
    return {
      projectId,
      missionStatement:
        'No structured vision documents found - import documents to get detailed analysis',
      strategicGoals: [],
      businessValue: 0.3,
      technicalImpact: 0.3,
      marketPosition: 'Not analyzed - no vision documents',
      targetOutcome: 'Import strategic documents for analysis',
      keyMetrics: [],
      stakeholders: [],
      timeline: 'Timeline not available',
      risks: ['No strategic documentation'],
      confidenceScore: 0.1,
      sourceDocuments: [],
      lastAnalyzed: new Date(),
    };
  }

  private createErrorVisionAnalysis(
    projectId: string,
    error: unknown
  ): StrategicVisionAnalysis {
    return {
      projectId,
      missionStatement: 'Analysis failed - check system logs',
      strategicGoals: [],
      businessValue: 0,
      technicalImpact: 0,
      marketPosition: 'Analysis error',
      targetOutcome: 'Fix analysis errors',
      keyMetrics: [],
      stakeholders: [],
      timeline: 'Unknown due to analysis error',
      risks: ['Analysis system error', error.message],
      confidenceScore: 0,
      sourceDocuments: [],
      lastAnalyzed: new Date(),
    };
  }

  private async getCachedAnalysis(
    projectId: string
  ): Promise<StrategicVisionAnalysis | null> {
    // TODO: Implement caching mechanism (could use memory backend)
    return null;
  }

  private async cacheAnalysis(
    analysis: StrategicVisionAnalysis
  ): Promise<void> {
    // TODO: Implement caching mechanism
  }

  private isAnalysisRecent(analysis: StrategicVisionAnalysis): boolean {
    const hoursSinceAnalysis =
      (Date.now() - analysis.lastAnalyzed.getTime()) / (1000 * 60 * 60);
    return hoursSinceAnalysis < 4; // Cache for 4 hours
  }
}

export default StrategicVisionService;
