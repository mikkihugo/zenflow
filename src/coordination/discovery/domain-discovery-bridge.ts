/**
 * Domain Discovery Bridge - Connects Document Processing to Domain Analysis.
 *
 * This bridge connects the document-driven development workflow with domain discovery,
 * enabling automatic domain identification based on project documentation and code analysis.
 * It leverages neural networks for intelligent domain mapping and provides human-in-the-loop.
 * validation through AGUI integration.
 *
 * @module coordination/discovery/domain-discovery-bridge
 *
 * Architecture:
 * - Listens to DocumentProcessor events for document changes
 * - Analyzes document content using NLP and concept extraction
 * - Maps documents to code domains using DomainAnalyzer
 * - Provides AGUI touchpoints for human validation
 * - Stores mappings in memory for continuous learning
 * @example
 * ```typescript
 * const bridge = new DomainDiscoveryBridge(
 *   documentProcessor,
 *   domainAnalyzer,
 *   projectAnalyzer,
 *   intelligenceCoordinator
 * );
 *
 * // Initialize and start discovery.
 * await bridge.initialize();
 * const domains = await bridge.discoverDomains();
 *
 * // Human validates relevant documents
 * const relevantDocs = await bridge.askHumanRelevance(documents);
 * ```
 */
/**
 * @file Coordination system: domain-discovery-bridge
 */



import { EventEmitter } from 'node:events';
import { basename } from 'node:path';
import type { Document, DocumentProcessor, DocumentType } from '../core/document-processor';
import { createLogger } from '../core/logger';
import type { IntelligenceCoordinationSystem } from '../knowledge/intelligence-coordination-system';
import type {
  MonorepoInfo,
  ProjectContextAnalyzer,
} from '../knowledge/project-context-analyzer';
import type {
  DomainAnalysis,
  DomainAnalysisEngine,
} from '../tools/domain-splitting/analyzers/domain-analyzer';

const logger = createLogger({ prefix: 'DomainDiscoveryBridge' });

/**
 * Represents a discovered domain with enriched metadata.
 *
 * @example
 */
export interface DiscoveredDomain {
  /** Unique domain identifier */
  id: string;
  /** Domain name derived from analysis */
  name: string;
  /** Domain description based on documents and code */
  description: string;
  /** Confidence score (0-1) of domain identification */
  confidence: number;
  /** Associated document paths */
  documents: string[];
  /** Associated code file paths */
  codeFiles: string[];
  /** Extracted concepts from documents */
  concepts: string[];
  /** Domain category (e.g., 'coordination', 'neural', 'memory') */
  category: string;
  /** Suggested swarm topology for this domain */
  suggestedTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  /** Related domains based on dependencies */
  relatedDomains: string[];
  /** Suggested agents for this domain */
  suggestedAgents: string[];
}

/**
 * Document relevance information for human validation.
 *
 * @example
 */
export interface DocumentRelevance {
  /** Document being evaluated */
  document: Document;
  /** Suggested relevance score (0-1) */
  suggestedRelevance: number;
  /** Extracted key concepts */
  concepts: string[];
  /** Potential domain matches */
  potentialDomains: string[];
  /** Reason for relevance suggestion */
  relevanceReason: string;
}

/**
 * Mapping between a document and discovered domains.
 *
 * @example
 */
export interface DocumentDomainMapping {
  /** Document path */
  documentPath: string;
  /** Document type (vision, adr, prd, etc.) */
  documentType: DocumentType;
  /** Mapped domain IDs */
  domainIds: string[];
  /** Mapping confidence scores */
  confidenceScores: number[];
  /** Matched concepts between document and domains */
  matchedConcepts: string[];
  /** Timestamp of mapping creation */
  timestamp: number;
}

/**
 * AGUI validation request structure.
 *
 * @example
 */
export interface AGUIValidationRequest {
  /** Type of validation being requested */
  type: 'document-relevance' | 'domain-mapping' | 'domain-boundaries';
  /** Human-readable question */
  question: string;
  /** Context information for the validation */
  context: Record<string, any>;
  /** Available options for selection */
  options?: Array<{
    id: string;
    label: string;
    preview?: string;
    metadata?: Record<string, any>;
  }>;
  /** Allow custom input beyond provided options */
  allowCustom?: boolean;
}

/**
 * Configuration for the Domain Discovery Bridge.
 *
 * @example
 */
export interface DomainDiscoveryBridgeConfig {
  /** Minimum confidence threshold for automatic domain creation */
  confidenceThreshold?: number;
  /** Enable automatic domain discovery on document changes */
  autoDiscovery?: boolean;
  /** Maximum domains to suggest per document */
  maxDomainsPerDocument?: number;
  /** Enable neural network analysis for concept extraction */
  useNeuralAnalysis?: boolean;
  /** Cache discovered domains for performance */
  enableCache?: boolean;
}

/**
 * Domain Discovery Bridge - Connects document processing with domain analysis.
 *
 * This class acts as the integration point between the document-driven development.
 * workflow and automatic domain discovery. It analyzes documents for concepts,
 * maps them to code domains, and provides human validation touchpoints.
 *
 * @example
 */
export class DomainDiscoveryBridge extends EventEmitter {
  private config: Required<DomainDiscoveryBridgeConfig>;
  private discoveredDomains: Map<string, DiscoveredDomain> = new Map();
  private documentMappings: Map<string, DocumentDomainMapping> = new Map();
  private conceptCache: Map<string, string[]> = new Map();
  private initialized = false;

  /**
   * Creates a new Domain Discovery Bridge.
   *
   * @param docProcessor - Document processor for scanning and processing documents
   * @param domainAnalyzer - Domain analyzer for code analysis and categorization
   * @param projectAnalyzer - Project context analyzer with monorepo detection
   * @param intelligenceCoordinator - Intelligence system for cross-domain knowledge
   * @param config - Optional configuration settings
   */
  constructor(
    private docProcessor: DocumentProcessor,
    private domainAnalyzer: DomainAnalysisEngine,
    private projectAnalyzer: ProjectContextAnalyzer,
    _intelligenceCoordinator: IntelligenceCoordinationSystem, // xxx NEEDS_HUMAN: Parameter not used - confirm if needed for future features
    config: DomainDiscoveryBridgeConfig = {}
  ) {
    super();
    this.config = {
      confidenceThreshold: config?.confidenceThreshold ?? 0.7,
      autoDiscovery: config?.autoDiscovery ?? true,
      maxDomainsPerDocument: config?.maxDomainsPerDocument ?? 3,
      useNeuralAnalysis: config?.useNeuralAnalysis ?? true,
      enableCache: config?.enableCache ?? true,
    };

    this.setupEventListeners();
  }

  /**
   * Initialize the domain discovery bridge.
   *
   * Sets up event listeners and performs initial discovery if configured.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('Initializing Domain Discovery Bridge');

    // Initialize project analyzer if not already done
    await this.projectAnalyzer.initialize();

    // Perform initial discovery if auto-discovery is enabled
    if (this.config.autoDiscovery) {
      const workspaces = this.docProcessor.getWorkspaces();
      if (workspaces.length > 0) {
        await this.discoverDomains();
      }
    }

    this.initialized = true;
    this.emit('initialized');
    logger.info('Domain Discovery Bridge ready');
  }

  /**
   * Discover domains by analyzing documents and code.
   *
   * This is the main entry point for domain discovery. It combines document
   * analysis, code analysis, and human validation to identify domains.
   *
   * @returns Array of discovered domains with full metadata
   */
  async discoverDomains(): Promise<DiscoveredDomain[]> {
    logger.info('Starting domain discovery process');

    // Step 1: Get monorepo information
    const monorepoInfo = this.projectAnalyzer.getMonorepoInfo();
    logger.debug('Monorepo info:', monorepoInfo);

    // Step 2: Get all documents from active workspaces
    const allDocuments = this.getAllWorkspaceDocuments();
    logger.info(`Found ${allDocuments.length} documents across all workspaces`);

    // Step 3: Ask human for document relevance
    const relevantDocs = await this.askHumanRelevance(allDocuments);
    logger.info(`Human selected ${relevantDocs.length} relevant documents`);

    // Step 4: Analyze code domains
    const projectRoot = monorepoInfo?.hasRootPackageJson ? process.cwd() : '.';
    const domainAnalysis = await this.domainAnalyzer.analyzeDomainComplexity(projectRoot);
    logger.info(`Identified ${Object.keys(domainAnalysis.categories).length} domain categories`);

    // Step 5: Create document-domain mappings
    const mappings = await this.createDocumentDomainMappings(relevantDocs, domainAnalysis);
    logger.debug(`Created ${mappings.length} document-domain mappings`);

    // Step 6: Validate mappings with human
    const validatedMappings = await this.validateMappingsWithHuman(mappings);
    logger.info(`Human validated ${validatedMappings.length} mappings`);

    // Step 7: Generate enriched domains
    const domains = await this.generateEnrichedDomains(
      validatedMappings,
      domainAnalysis,
      monorepoInfo
    );

    // Store discovered domains
    domains.forEach((domain) => {
      this.discoveredDomains.set(domain.id, domain);
    });

    // Emit discovery complete event
    this.emit('discovery:complete', {
      domainCount: domains.length,
      documentCount: relevantDocs.length,
      mappingCount: validatedMappings.length,
    });

    logger.info(`Domain discovery complete: ${domains.length} domains discovered`);
    return domains;
  }

  /**
   * Ask human to validate document relevance for domain discovery.
   *
   * @param documents - All documents to evaluate
   * @returns Documents marked as relevant by human
   */
  async askHumanRelevance(documents: Document[]): Promise<Document[]> {
    if (documents.length === 0) return [];

    // Group documents by type for better presentation
    const grouped = this.groupDocumentsByType(documents);

    // Analyze each document for relevance suggestions
    const relevanceAnalysis = await Promise.all(
      documents.map((doc) => this.analyzeDocumentRelevance(doc))
    );

    // Create AGUI validation request (for future implementation)
    // xxx NEEDS_HUMAN: Placeholder for future AGUI implementation
    const _validationRequest: AGUIValidationRequest = {
      type: 'document-relevance',
      question: `Found ${documents.length} documents. Which are relevant for domain discovery?`,
      context: {
        vision: grouped.vision?.length || 0,
        adrs: grouped.adr?.length || 0,
        prds: grouped.prd?.length || 0,
        epics: grouped.epic?.length || 0,
        features: grouped.feature?.length || 0,
        tasks: grouped.task?.length || 0,
        totalDocuments: documents.length,
      },
      options: relevanceAnalysis.map((analysis, index) => ({
        id: documents[index]?.path || '',
        label: `${documents[index]?.type?.toUpperCase() || 'UNKNOWN'}: ${basename(documents[index]?.path || '')}`,
        preview: (documents[index]?.content.substring(0, 200) ?? '') + '...',
        metadata: {
          suggestedRelevance: analysis.suggestedRelevance,
          concepts: analysis.concepts.slice(0, 5),
          reason: analysis.relevanceReason,
        },
      })),
    };

    // In a real implementation, this would call AGUI
    // For now, we'll simulate by selecting documents with high relevance
    const selected = documents.filter((_, index) => {
      const analysis = relevanceAnalysis[index];
      return analysis ? (analysis.suggestedRelevance ?? 0) > 0.6 : false;
    });

    logger.info(`Selected ${selected.length} relevant documents for domain discovery`);
    return selected;
  }

  /**
   * Validate domain mappings with human approval.
   *
   * @param mappings - Proposed document-domain mappings
   * @returns Human-validated mappings
   */
  async validateMappingsWithHuman(
    mappings: DocumentDomainMapping[]
  ): Promise<DocumentDomainMapping[]> {
    if (mappings.length === 0) return [];

    // Group mappings by domain for easier validation
    const domainGroups = this.groupMappingsByDomain(mappings);

    // Create validation request (for future implementation)
    // xxx NEEDS_HUMAN: Placeholder for future AGUI implementation
    const _validationRequest: AGUIValidationRequest = {
      type: 'domain-mapping',
      question: `Please validate ${mappings.length} document-domain mappings`,
      context: {
        totalMappings: mappings.length,
        uniqueDomains: Object.keys(domainGroups).length,
        averageConfidence: this.calculateAverageConfidence(mappings),
      },
      options: mappings.map((mapping) => ({
        id: `${mapping.documentPath}:${mapping.domainIds.join(',')}`,
        label: `${basename(mapping.documentPath)} → ${mapping.domainIds.join(', ')}`,
        preview: `Confidence: ${mapping.confidenceScores.map((s) => (s * 100).toFixed(0) + '%').join(', ')}`,
        metadata: {
          concepts: mapping.matchedConcepts,
          documentType: mapping.documentType,
        },
      })),
    };

    // Simulate human validation - in reality this would use AGUI
    const validated = mappings.filter(
      (mapping) => Math.max(...mapping.confidenceScores) > this.config.confidenceThreshold
    );

    logger.info(`Human validated ${validated.length} of ${mappings.length} mappings`);
    return validated;
  }

  /**
   * Extract concepts from document content using NLP and pattern matching.
   *
   * @param content - Document content to analyze
   * @returns Array of extracted concepts
   */
  private extractConcepts(content: string): string[] {
    if (!content) return [];

    // Check cache first
    const cacheKey = content.substring(0, 100); // Simple cache key
    if (this.config.enableCache && this.conceptCache.has(cacheKey)) {
      return this.conceptCache.get(cacheKey)!;
    }

    const concepts: Set<string> = new Set();

    // Technical patterns
    const patterns = [
      // Architecture patterns
      /\b(microservices?|monolith|event-driven|serverless|distributed|cloud-native)\b/gi,
      // AI/ML concepts
      /\b(neural network|machine learning|deep learning|ai|artificial intelligence|nlp|gnn|cnn|rnn|lstm)\b/gi,
      // Data patterns
      /\b(database|cache|storage|persistence|memory|redis|postgresql|mongodb|elasticsearch)\b/gi,
      // Framework/tech stack
      /\b(react|vue|angular|node|express|fastify|typescript|javascript|python|rust|go)\b/gi,
      // Domain concepts
      /\b(authentication|authorization|payment|messaging|notification|analytics|monitoring)\b/gi,
      // Architecture components
      /\b(api|rest|graphql|websocket|grpc|queue|broker|gateway|proxy|load balancer)\b/gi,
      // Development concepts
      /\b(agile|scrum|tdd|ci\/cd|devops|testing|deployment|docker|kubernetes)\b/gi,
    ];

    // Extract concepts using patterns
    patterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches?.forEach((match) => concepts.add(match?.toLowerCase()));
      }
    });

    // Extract from headers (# Header, ## Subheader)
    const headerMatches = content.match(/^#{1,3}\s+(.+)$/gm);
    if (headerMatches) {
      headerMatches?.forEach((header) => {
        const cleanHeader = header.replace(/^#+\s+/, '').toLowerCase();
        if (cleanHeader.length > 3 && cleanHeader.length < 50) {
          concepts.add(cleanHeader);
        }
      });
    }

    // Extract from bullet points focusing on key terms
    const bulletMatches = content.match(/^[\s-*]+\s*(.+)$/gm);
    if (bulletMatches) {
      bulletMatches?.forEach((bullet) => {
        const cleanBullet = bullet.replace(/^[\s-*]+/, '').toLowerCase();
        patterns.forEach((pattern) => {
          const matches = cleanBullet.match(pattern);
          if (matches) {
            matches?.forEach((match) => concepts.add(match?.toLowerCase()));
          }
        });
      });
    }

    const conceptArray = Array.from(concepts);

    // Cache the result
    if (this.config.enableCache) {
      this.conceptCache.set(cacheKey, conceptArray);
    }

    return conceptArray;
  }

  /**
   * Calculate relevance score between concepts and a domain.
   *
   * @param concepts - Extracted concepts from document
   * @param domain - Domain to compare against
   * @returns Relevance score between 0 and 1
   */
  private calculateRelevance(concepts: string[], domain: DomainAnalysis): number {
    if (concepts.length === 0) return 0;

    let relevanceScore = 0;
    let matchCount = 0;

    // Check category matches
    const categoryKeywords: Record<string, string[]> = {
      agents: ['agent', 'coordinator', 'orchestrator', 'swarm', 'multi-agent'],
      coordination: ['coordination', 'orchestration', 'workflow', 'synchronization'],
      neural: ['neural', 'network', 'ai', 'machine learning', 'deep learning'],
      memory: ['memory', 'storage', 'cache', 'persistence', 'database'],
      wasm: ['wasm', 'webassembly', 'binary', 'performance', 'acceleration'],
      bridge: ['bridge', 'integration', 'adapter', 'connector', 'interface'],
      models: ['model', 'schema', 'data structure', 'entity', 'preset'],
    };

    // Check each category
    Object.entries(domain.categories).forEach(([category, files]) => {
      if (files.length > 0 && categoryKeywords[category]) {
        const keywords = categoryKeywords[category];
        const categoryMatches = concepts.filter((concept) =>
          keywords.some((keyword) => concept.includes(keyword))
        ).length;

        if (categoryMatches > 0) {
          relevanceScore += (categoryMatches / keywords.length) * 0.3;
          matchCount += categoryMatches;
        }
      }
    });

    // Check file name matches
    const allFiles = Object.values(domain.categories).flat();
    const fileNameMatches = concepts.filter((concept) =>
      allFiles.some((file) => file.toLowerCase().includes(concept))
    ).length;

    if (fileNameMatches > 0) {
      relevanceScore += (fileNameMatches / concepts.length) * 0.3;
      matchCount += fileNameMatches;
    }

    // Complexity bonus - more complex domains might need more documentation
    if (domain.complexityScore > 50) {
      relevanceScore += 0.1;
    }

    // Coupling bonus - tightly coupled domains might be mentioned together
    if (domain.coupling.tightlyCoupledGroups.length > 0) {
      relevanceScore += 0.1;
    }

    // Overall match ratio
    const matchRatio = matchCount / concepts.length;
    relevanceScore += matchRatio * 0.2;

    // Normalize to 0-1 range
    return Math.min(1, Math.max(0, relevanceScore));
  }

  /**
   * Analyze a document to determine its relevance for domain discovery.
   *
   * @param document - Document to analyze
   * @returns Relevance analysis with score and reasoning
   */
  private async analyzeDocumentRelevance(document: Document): Promise<DocumentRelevance> {
    const concepts = this.extractConcepts(document.content || '');

    // Base relevance on document type
    let baseRelevance = 0;
    let relevanceReason = '';

    switch (document.type) {
      case 'vision':
        baseRelevance = 0.9;
        relevanceReason = 'Vision documents define overall system architecture';
        break;
      case 'adr':
        baseRelevance = 0.95;
        relevanceReason = 'ADRs contain critical architectural decisions';
        break;
      case 'prd':
        baseRelevance = 0.85;
        relevanceReason = 'PRDs describe product features and domains';
        break;
      case 'epic':
        baseRelevance = 0.7;
        relevanceReason = 'Epics group related features into domains';
        break;
      case 'feature':
        baseRelevance = 0.6;
        relevanceReason = 'Features may indicate domain boundaries';
        break;
      case 'task':
        baseRelevance = 0.4;
        relevanceReason = 'Tasks are too granular for domain discovery';
        break;
      default:
        baseRelevance = 0.5;
        relevanceReason = 'Unknown document type';
    }

    // Adjust based on concept richness
    const conceptScore = Math.min(1, concepts.length / 10);
    const finalRelevance = baseRelevance * 0.7 + conceptScore * 0.3;

    // Identify potential domains based on concepts
    const potentialDomains = this.identifyPotentialDomains(concepts);

    return {
      document,
      suggestedRelevance: finalRelevance,
      concepts: concepts.slice(0, 10), // Top 10 concepts
      potentialDomains,
      relevanceReason,
    };
  }

  /**
   * Create mappings between documents and domains.
   *
   * @param documents - Relevant documents to map
   * @param domainAnalysis - Code domain analysis results
   * @returns Array of document-domain mappings
   */
  private async createDocumentDomainMappings(
    documents: Document[],
    domainAnalysis: DomainAnalysis
  ): Promise<DocumentDomainMapping[]> {
    const mappings: DocumentDomainMapping[] = [];

    for (const doc of documents) {
      const concepts = this.extractConcepts(doc.content || '');
      const relevanceScore = this.calculateRelevance(concepts, domainAnalysis);

      if (relevanceScore > 0.3) {
        // Find best matching categories
        const categoryScores = new Map<string, number>();

        Object.entries(domainAnalysis.categories).forEach(([category, files]) => {
          if (files.length > 0) {
            const categoryRelevance = this.calculateCategoryRelevance(concepts, category, files);
            if (categoryRelevance > 0.3) {
              categoryScores.set(category, categoryRelevance);
            }
          }
        });

        // Sort by score and take top matches
        const topCategories = Array.from(categoryScores.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, this.config.maxDomainsPerDocument);

        if (topCategories.length > 0) {
          const mapping: DocumentDomainMapping = {
            documentPath: doc.path,
            documentType: doc.type,
            domainIds: topCategories.map(([cat]) => cat),
            confidenceScores: topCategories.map(([, score]) => score),
            matchedConcepts: concepts.filter((concept) =>
              topCategories.some(
                ([cat]) =>
                  cat.toLowerCase().includes(concept) || concept.includes(cat.toLowerCase())
              )
            ),
            timestamp: Date.now(),
          };

          mappings.push(mapping);
          this.documentMappings.set(doc.path, mapping);
        }
      }
    }

    return mappings;
  }

  /**
   * Generate enriched domain objects from validated mappings.
   *
   * @param mappings - Validated document-domain mappings
   * @param domainAnalysis - Code domain analysis
   * @param monorepoInfo - Monorepo information
   * @returns Array of enriched discovered domains
   */
  private async generateEnrichedDomains(
    mappings: DocumentDomainMapping[],
    domainAnalysis: DomainAnalysis,
    monorepoInfo: MonorepoInfo | null
  ): Promise<DiscoveredDomain[]> {
    const domains: Map<string, DiscoveredDomain> = new Map();

    // Create domains from mappings
    for (const mapping of mappings) {
      for (let i = 0; i < mapping.domainIds.length; i++) {
        const domainId = mapping.domainIds[i];
        const confidence = mapping.confidenceScores[i];

        if (!domainId) continue; // Skip if domainId is undefined
        if (confidence === undefined) continue; // Skip if confidence is undefined

        if (!domains.has(domainId)) {
          const domain = await this.createDomain(domainId, domainAnalysis, monorepoInfo);
          domains.set(domainId, domain);
        }

        // Add document to domain
        const domain = domains.get(domainId)!;
        if (!domain.documents.includes(mapping.documentPath)) {
          domain.documents.push(mapping.documentPath);
        }

        // Add concepts
        mapping.matchedConcepts.forEach((concept) => {
          if (!domain.concepts.includes(concept)) {
            domain.concepts.push(concept);
          }
        });

        // Update confidence (weighted average)
        const docCount = domain.documents.length;
        domain.confidence = (domain.confidence * (docCount - 1) + (confidence ?? 0)) / docCount;
      }
    }

    // Identify related domains based on shared concepts
    const domainArray = Array.from(domains.values());
    for (const domain of domainArray) {
      domain.relatedDomains = this.findRelatedDomains(domain, domainArray);
    }

    return domainArray;
  }

  /**
   * Create a domain object with full metadata.
   *
   * @param domainId - Domain identifier (category name)
   * @param domainAnalysis - Code analysis results
   * @param monorepoInfo - Monorepo information
   * @returns Enriched domain object
   */
  private async createDomain(
    domainId: string,
    domainAnalysis: DomainAnalysis,
    _monorepoInfo: MonorepoInfo | null
  ): Promise<DiscoveredDomain> {
    const category = (domainAnalysis.categories as any)[domainId] || [];
    const description = this.generateDomainDescription(domainId, category.length);
    const topology = this.suggestTopology(domainId, category.length, domainAnalysis);

    return {
      id: `domain-${domainId}-${Date.now()}`,
      name: domainId,
      description,
      confidence: 0.5, // Base confidence, will be updated
      documents: [],
      codeFiles: category,
      concepts: [],
      category: domainId,
      suggestedTopology: topology,
      relatedDomains: [],
      suggestedAgents: [], // Default empty array
    };
  }

  /**
   * Generate human-readable domain description.
   *
   * @param domainId - Domain identifier
   * @param fileCount - Number of files in domain
   * @returns Domain description
   */
  private generateDomainDescription(domainId: string, fileCount: number): string {
    const descriptions: Record<string, string> = {
      agents: `Agent coordination and orchestration domain with ${fileCount} files`,
      coordination: `System coordination and workflow management domain with ${fileCount} files`,
      neural: `Neural network and AI/ML capabilities domain with ${fileCount} files`,
      memory: `Memory management and persistence domain with ${fileCount} files`,
      wasm: `WebAssembly acceleration and performance domain with ${fileCount} files`,
      bridge: `Integration bridges and adapters domain with ${fileCount} files`,
      models: `Data models and neural network presets domain with ${fileCount} files`,
      'core-algorithms': `Core algorithmic implementations with ${fileCount} files`,
      utilities: `Utility functions and helpers with ${fileCount} files`,
    };

    return descriptions[domainId] || `${domainId} domain with ${fileCount} files`;
  }

  /**
   * Suggest optimal swarm topology for a domain.
   *
   * @param domainId - Domain identifier
   * @param fileCount - Number of files in domain
   * @param analysis - Domain analysis results
   * @returns Suggested topology type
   */
  private suggestTopology(
    domainId: string,
    fileCount: number,
    analysis: DomainAnalysis
  ): 'mesh' | 'hierarchical' | 'ring' | 'star' {
    // Large domains with many files benefit from hierarchical
    if (fileCount > 50) return 'hierarchical';

    // Highly coupled domains benefit from mesh
    const domainCoupling = analysis.coupling.tightlyCoupledGroups.filter((group) =>
      group.files.some((file) => (analysis.categories as any)[domainId]?.includes(file))
    );
    const firstCoupling = domainCoupling[0];
    if (domainCoupling.length > 0 && firstCoupling && firstCoupling.couplingScore > 0.7) {
      return 'mesh';
    }

    // Coordination domains work well with star topology
    if (domainId === 'coordination' || domainId === 'bridge') {
      return 'star';
    }

    // Sequential processing domains benefit from ring
    if (domainId === 'data-processing' || domainId === 'training-systems') {
      return 'ring';
    }

    // Default to hierarchical for good balance
    return 'hierarchical';
  }

  /**
   * Find related domains based on shared concepts.
   *
   * @param domain - Domain to find relations for
   * @param allDomains - All discovered domains
   * @returns Array of related domain IDs
   */
  private findRelatedDomains(domain: DiscoveredDomain, allDomains: DiscoveredDomain[]): string[] {
    const related: Array<{ id: string; score: number }> = [];

    for (const other of allDomains) {
      if (other.id === domain.id) continue;

      // Calculate shared concepts
      const sharedConcepts = domain.concepts.filter((concept) => other.concepts.includes(concept));

      // Calculate shared documents
      const sharedDocs = domain.documents.filter((doc) => other.documents.includes(doc));

      // Calculate relationship score
      const conceptScore = sharedConcepts.length / Math.max(domain.concepts.length, 1);
      const docScore = sharedDocs.length / Math.max(domain.documents.length, 1);
      const totalScore = conceptScore * 0.7 + docScore * 0.3;

      if (totalScore > 0.2) {
        related.push({ id: other.id, score: totalScore });
      }
    }

    // Sort by score and return top 3
    return related
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.id);
  }

  /**
   * Calculate category relevance for concept matching.
   *
   * @param concepts - Document concepts
   * @param category - Domain category
   * @param files - Files in the category
   * @returns Relevance score (0-1)
   */
  private calculateCategoryRelevance(
    concepts: string[],
    category: string,
    files: string[]
  ): number {
    let score = 0;

    // Check if category name appears in concepts
    if (concepts.some((c) => c.includes(category) || category.includes(c))) {
      score += 0.4;
    }

    // Check file name matches
    const fileMatches = files.filter((file) =>
      concepts.some((concept) => file.toLowerCase().includes(concept))
    ).length;

    score += Math.min(0.3, (fileMatches / files.length) * 0.3);

    // Category-specific bonuses
    const categoryBonuses: Record<string, string[]> = {
      neural: ['ai', 'ml', 'neural', 'network', 'deep learning'],
      agents: ['agent', 'swarm', 'coordinator', 'orchestrator'],
      memory: ['storage', 'cache', 'persistence', 'database'],
    };

    const bonusCategory = categoryBonuses[category];
    if (bonusCategory) {
      const bonusMatches = concepts.filter((c) =>
        bonusCategory.some((bonus) => c.includes(bonus))
      ).length;
      score += Math.min(0.3, (bonusMatches / bonusCategory.length) * 0.3);
    }

    return Math.min(1, score);
  }

  /**
   * Identify potential domains from concept list.
   *
   * @param concepts - Extracted concepts
   * @returns Array of potential domain names
   */
  private identifyPotentialDomains(concepts: string[]): string[] {
    const domains: Set<string> = new Set();

    const domainPatterns: Record<string, string[]> = {
      authentication: ['auth', 'login', 'jwt', 'oauth', 'security'],
      'neural-processing': ['neural', 'ai', 'ml', 'deep learning', 'network'],
      'data-storage': ['database', 'storage', 'persistence', 'cache', 'memory'],
      'api-gateway': ['api', 'rest', 'graphql', 'gateway', 'endpoint'],
      messaging: ['message', 'queue', 'broker', 'pubsub', 'event'],
      monitoring: ['monitor', 'metrics', 'logging', 'telemetry', 'observability'],
    };

    Object.entries(domainPatterns).forEach(([domain, keywords]) => {
      if (concepts.some((concept) => keywords.some((kw) => concept.includes(kw)))) {
        domains.add(domain);
      }
    });

    return Array.from(domains);
  }

  /**
   * Get all documents from active workspaces.
   *
   * @returns Array of all documents across workspaces
   */
  private getAllWorkspaceDocuments(): Document[] {
    const documents: Document[] = [];
    const workspaces = this.docProcessor.getWorkspaces();

    for (const workspaceId of workspaces) {
      const workspaceDocs = this.docProcessor.getWorkspaceDocuments(workspaceId);
      documents.push(...Array.from(workspaceDocs.values()));
    }

    return documents;
  }

  /**
   * Group documents by type for analysis.
   *
   * @param documents - Documents to group
   * @returns Grouped documents by type
   */
  private groupDocumentsByType(documents: Document[]): Record<DocumentType, Document[]> {
    const grouped: Partial<Record<DocumentType, Document[]>> = {};

    documents.forEach((doc) => {
      if (!grouped[doc.type]) {
        grouped[doc.type] = [];
      }
      grouped[doc.type]!.push(doc);
    });

    return grouped as Record<DocumentType, Document[]>;
  }

  /**
   * Group mappings by domain for validation.
   *
   * @param mappings - Mappings to group
   * @returns Mappings grouped by domain
   */
  private groupMappingsByDomain(
    mappings: DocumentDomainMapping[]
  ): Record<string, DocumentDomainMapping[]> {
    const grouped: Record<string, DocumentDomainMapping[]> = {};

    mappings.forEach((mapping) => {
      mapping.domainIds.forEach((domainId) => {
        if (!grouped[domainId]) {
          grouped[domainId] = [];
        }
        grouped[domainId]?.push(mapping);
      });
    });

    return grouped;
  }

  /**
   * Calculate average confidence across mappings.
   *
   * @param mappings - Mappings to analyze
   * @returns Average confidence score
   */
  private calculateAverageConfidence(mappings: DocumentDomainMapping[]): number {
    if (mappings.length === 0) return 0;

    const totalConfidence = mappings.reduce((sum, mapping) => {
      const avgMappingConfidence =
        mapping.confidenceScores.reduce((a, b) => a + b, 0) / mapping.confidenceScores.length;
      return sum + avgMappingConfidence;
    }, 0);

    return totalConfidence / mappings.length;
  }

  /**
   * Setup event listeners for document processing.
   */
  private setupEventListeners(): void {
    // Listen for document processing events
    this.docProcessor.on('document:processed', async (event) => {
      if (this.config.autoDiscovery) {
        logger.debug(`Document processed: ${event.document.path}`);
        await this.onDocumentProcessed(event);
      }
    });

    // Listen for workspace loading
    this.docProcessor.on('workspace:loaded', async (event) => {
      if (this.config.autoDiscovery) {
        logger.debug(`Workspace loaded: ${event.workspaceId}`);
        await this.onWorkspaceLoaded(event);
      }
    });
  }

  /**
   * Handle document processed event.
   *
   * @param event - Document processed event
   */
  private async onDocumentProcessed(event: any): Promise<void> {
    const { document } = event;

    // Analyze relevance
    const relevance = await this.analyzeDocumentRelevance(document);

    // If relevant enough, trigger domain discovery
    if (relevance.suggestedRelevance > this.config.confidenceThreshold) {
      logger.info(`Document ${document.path} is relevant for domain discovery`);
      this.emit('document:relevant', relevance);
    }
  }

  /**
   * Handle workspace loaded event.
   *
   * @param event - Workspace loaded event
   */
  private async onWorkspaceLoaded(event: any): Promise<void> {
    const { workspaceId, documentCount } = event;

    if (documentCount > 0) {
      logger.info(`Workspace ${workspaceId} loaded with ${documentCount} documents`);
      // Trigger discovery in background
      setImmediate(() =>
        this.discoverDomains().catch((err) =>
          logger.error('Background domain discovery failed:', err)
        )
      );
    }
  }

  /**
   * Get discovered domains.
   *
   * @returns Map of discovered domains
   */
  getDiscoveredDomains(): Map<string, DiscoveredDomain> {
    return new Map(this.discoveredDomains);
  }

  /**
   * Get document mappings.
   *
   * @returns Map of document-domain mappings
   */
  getDocumentMappings(): Map<string, DocumentDomainMapping> {
    return new Map(this.documentMappings);
  }

  /**
   * Clear all caches and reset state.
   */
  clearCache(): void {
    this.conceptCache.clear();
    logger.debug('Concept cache cleared');
  }

  /**
   * Shutdown the bridge and clean up resources.
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Domain Discovery Bridge...');
    this.removeAllListeners();
    this.clearCache();
    this.discoveredDomains.clear();
    this.documentMappings.clear();
    logger.info('Domain Discovery Bridge shutdown complete');
  }
}

/**
 * Factory function to create a configured Domain Discovery Bridge.
 *
 * @param docProcessor - Document processor instance
 * @param domainAnalyzer - Domain analyzer instance
 * @param projectAnalyzer - Project analyzer instance
 * @param intelligenceCoordinator - Intelligence coordinator instance
 * @param config - Optional configuration
 * @returns Configured DomainDiscoveryBridge instance
 */
export function createDomainDiscoveryBridge(
  docProcessor: DocumentProcessor,
  domainAnalyzer: DomainAnalysisEngine,
  projectAnalyzer: ProjectContextAnalyzer,
  intelligenceCoordinator: IntelligenceCoordinationSystem,
  config?: DomainDiscoveryBridgeConfig
): DomainDiscoveryBridge {
  return new DomainDiscoveryBridge(
    docProcessor,
    domainAnalyzer,
    projectAnalyzer,
    intelligenceCoordinator,
    config
  );
}
