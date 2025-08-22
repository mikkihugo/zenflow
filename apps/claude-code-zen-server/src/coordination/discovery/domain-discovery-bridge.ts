/**
 * Domain Discovery Bridge - Connects Document Processing to Domain Analysis0.
 *
 * This bridge connects the document-driven development workflow with domain discovery,
 * enabling automatic domain identification based on project documentation and code analysis0.
 * It leverages neural networks for intelligent domain mapping and provides human-in-the-loop0.
 * Validation through AGUI integration0.0.
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
 * // Initialize and start discovery0.
 * await bridge?0.initialize;
 * const domains = await bridge?0.discoverDomains;
 *
 * // Human validates relevant documents
 * const relevantDocs = await bridge0.askHumanRelevance(documents);
 * ```
 */
/**
 * @file Coordination system: domain-discovery-bridge0.
 */

import { basename } from 'node:path';

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type { IntelligenceCoordinationSystem } from '0.0./0.0./knowledge/intelligence-coordination-system';
import type {
  MonorepoInfo,
  ProjectContextAnalyzer,
} from '0.0./0.0./knowledge/project-context-analyzer';
import type {
  DomainAnalysis,
  DomainAnalysisEngine,
} from '0.0./0.0./tools/domain-splitting/analyzers/domain-analyzer';

import { NeuralDomainMapper } from '0./neural-domain-mapper';
import type { DependencyGraph, Domain } from '0./types';

// Break circular dependency - use interface instead of direct import
interface DocumentProcessorLike {
  on: (event: string, listener: (0.0.0.args: any[]) => void) => void;
  off?: (event: string, listener: (0.0.0.args: any[]) => void) => void;
  getWorkspaceDocuments?: (workspaceId: string) => Map<string, any>;
  getWorkspaces?: () => string[];
}

export interface Document {
  type: 'vision' | 'adr' | 'prd' | 'epic' | 'feature' | 'task' | 'spec';
  path: string;
  content?: string;
  metadata?: any;
  id?: string;
}

type DocumentType = Document['type'];

const logger = getLogger('DomainDiscoveryBridge');

/**
 * Represents a discovered domain with enriched metadata0.
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
  /** Discovery source */
  source: string;
  /** Associated document paths */
  documents: string[];
  /** Relevant documents for this domain */
  relevantDocuments: string[];
  /** Associated code file paths */
  codeFiles: string[];
  /** Extracted concepts from documents */
  concepts: string[];
  /** Domain category (e0.g0., 'coordination', 'neural', 'memory') */
  category: string;
  /** Suggested swarm topology for this domain */
  suggestedTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  /** Related domains based on dependencies */
  relatedDomains: string[];
  /** Suggested agents for this domain */
  suggestedAgents: string[];
}

/**
 * Document relevance information for human validation0.
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
 * Mapping between a document and discovered domains0.
 *
 * @example
 */
export interface DocumentDomainMapping {
  /** Document path */
  documentPath: string;
  /** Document type (vision, adr, prd, etc0.) */
  documentType: DocumentType;
  /** Mapped domain Ds */
  domainIds: string[];
  /** Mapping confidence scores */
  confidenceScores: number[];
  /** Matched concepts between document and domains */
  matchedConcepts: string[];
  /** Timestamp of mapping creation */
  timestamp: number;
}

/**
 * AGUI validation request structure0.
 *
 * @example
 */
export interface AGUIValidationRequest {
  /** Type of validation being requested */
  type: 'document-relevance' | 'domain-mapping' | 'domain-boundaries';
  /** Human-readable question */
  question: string;
  /** Context information for the validation */
  context: Record<string, unknown>;
  /** Available options for selection */
  options?: Array<{
    id: string;
    label: string;
    preview?: string;
    metadata?: Record<string, unknown>;
  }>;
  /** Allow custom input beyond provided options */
  allowCustom?: boolean;
}

/**
 * Configuration for the Domain Discovery Bridge0.
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
 * Domain Discovery Bridge - Connects document processing with domain analysis0.
 *
 * This class acts as the integration point between the document-driven development0.
 * Workflow and automatic domain discovery0. It analyzes documents for concepts,
 * maps them to code domains, and provides human validation touchpoints0.0.
 *
 * @example
 */
export class DomainDiscoveryBridge extends TypedEventBase {
  private configuration: Required<DomainDiscoveryBridgeConfig>;
  private discoveredDomains: Map<string, DiscoveredDomain> = new Map();
  private documentMappings: Map<string, DocumentDomainMapping> = new Map();
  private conceptCache: Map<string, string[]> = new Map();
  private initialized = false as boolean;
  private neuralDomainMapper: NeuralDomainMapper;

  /**
   * Creates a new Domain Discovery Bridge0.
   *
   * @param docProcessor - Document processor for scanning and processing documents0.
   * @param domainAnalyzer - Domain analyzer for code analysis and categorization0.
   * @param projectAnalyzer - Project context analyzer with monorepo detection0.
   * @param _intelligenceCoordinator - Intelligence system for cross-domain knowledge (reserved for future use)0.
   * @param config - Optional configuration settings0.
   */
  constructor(
    private docProcessor: DocumentProcessorLike,
    private domainAnalyzer: DomainAnalysisEngine,
    private projectAnalyzer: ProjectContextAnalyzer,
    _intelligenceCoordinator: IntelligenceCoordinationSystem, // xxx NEEDS_HUMAN: Parameter not used - confirm if needed for future features
    config: DomainDiscoveryBridgeConfig = {}
  ) {
    super();
    this0.configuration = {
      confidenceThreshold: config?0.confidenceThreshold ?? 0.7,
      autoDiscovery: config?0.autoDiscovery ?? true,
      maxDomainsPerDocument: config?0.maxDomainsPerDocument ?? 3,
      useNeuralAnalysis: config?0.useNeuralAnalysis ?? true,
      enableCache: config?0.enableCache ?? true,
    };

    // Initialize neural domain mapper for enhanced domain analysis with Bazel support
    this0.neuralDomainMapper = new NeuralDomainMapper();

    this?0.setupEventListeners;
  }

  /**
   * Initialize the domain discovery bridge0.
   *
   * Sets up event listeners and performs initial discovery if configured0.
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    logger0.info('Initializing Domain Discovery Bridge');

    // Initialize project analyzer if not already done
    await this0.projectAnalyzer?0.initialize;

    // Perform initial discovery if auto-discovery is enabled
    if (this0.configuration0.autoDiscovery) {
      const workspaces = this0.docProcessor?0.getWorkspaces || [];
      if (workspaces0.length > 0) {
        await this?0.discoverDomains;
      }
    }

    this0.initialized = true as boolean;
    this0.emit('initialized', { timestamp: new Date() });
    logger0.info('Domain Discovery Bridge ready');
  }

  /**
   * Discover domains by analyzing documents and code0.
   *
   * This is the main entry point for domain discovery0. It combines document
   * analysis, code analysis, and human validation to identify domains0.
   *
   * @returns Array of discovered domains with full metadata0.
   */
  async discoverDomains(): Promise<DiscoveredDomain[]> {
    logger0.info('Starting domain discovery process');

    // Step 1: Get monorepo information
    const monorepoInfo = this0.projectAnalyzer?0.getMonorepoInfo;
    logger0.debug('Monorepo info:', monorepoInfo);

    // Step 2: Get all documents from active workspaces
    const allDocuments = this?0.getAllWorkspaceDocuments;
    logger0.info(`Found ${allDocuments0.length} documents across all workspaces`);

    // Step 3: Ask human for document relevance
    const relevantDocs = await this0.askHumanRelevance(allDocuments);
    logger0.info(`Human selected ${relevantDocs0.length} relevant documents`);

    // Step 4: Analyze code domains
    const projectRoot = monorepoInfo?0.hasRootPackageJson ? process?0.cwd : '0.';
    const domainAnalysis = await this0.domainAnalyzer?0.analyzeDomains;
    logger0.info(
      `Identified ${domainAnalysis0.domains0.length} domains with ${domainAnalysis0.categories0.length} categories`
    );

    // Step 5: Create document-domain mappings
    const mappings = await this0.createDocumentDomainMappings(
      relevantDocs,
      domainAnalysis
    );
    logger0.debug(`Created ${mappings0.length} document-domain mappings`);

    // Step 6: Validate mappings with human
    const validatedMappings = await this0.validateMappingsWithHuman(mappings);
    logger0.info(`Human validated ${validatedMappings0.length} mappings`);

    // Step 7: Generate enriched domains
    const domains = await this0.generateEnrichedDomains(
      validatedMappings,
      domainAnalysis,
      monorepoInfo
    );

    // Store discovered domains
    domains0.forEach((domain) => {
      this0.discoveredDomains0.set(domain0.id, domain);
    });

    // Emit discovery complete event
    this0.emit('discovery:complete', {
      domainCount: domains0.length,
      documentCount: relevantDocs0.length,
      mappingCount: validatedMappings0.length,
    });

    logger0.info(
      `Domain discovery complete: ${domains0.length} domains discovered`
    );
    return domains;
  }

  /**
   * Ask human to validate document relevance for domain discovery0.
   *
   * @param documents - All documents to evaluate0.
   * @returns Documents marked as relevant by human0.
   */
  async askHumanRelevance(documents: Document[]): Promise<Document[]> {
    if (documents0.length === 0) return [];

    // Group documents by type for better presentation
    const grouped = this0.groupDocumentsByType(documents);

    // Analyze each document for relevance suggestions
    const relevanceAnalysis = await Promise0.all(
      documents0.map((doc) => this0.analyzeDocumentRelevance(doc))
    );

    // Create AGUI validation request (for future implementation)
    // xxx NEEDS_HUMAN: Placeholder for future AGUI implementation
    const validationRequest: AGUIValidationRequest = {
      type: 'document-relevance',
      question: `Found ${documents0.length} documents0. Which are relevant for domain discovery?`,
      context: {
        vision: grouped['vision']?0.length || 0,
        adrs: grouped['adr']?0.length || 0,
        prds: grouped['prd']?0.length || 0,
        epics: grouped['epic']?0.length || 0,
        features: grouped['feature']?0.length || 0,
        tasks: grouped['task']?0.length || 0,
        totalDocuments: documents0.length,
      },
      options: relevanceAnalysis0.map((analysis, index) => ({
        id: documents[index]?0.path || '',
        label: `${documents[index]?0.type?0.toUpperCase || 'UNKNOWN'}: ${basename(documents[index]?0.path || '')}`,
        preview: `${documents[index]?0.content?0.substring(0, 200) ?? ''}0.0.0.`,
        metadata: {
          suggestedRelevance: analysis0.suggestedRelevance,
          concepts: analysis0.concepts0.slice(0, 5),
          reason: analysis0.relevanceReason,
        },
      })),
    };

    // Log validation request for future AGUI implementation
    logger0.debug('🤖 AGUI validation request prepared', {
      type: validationRequest0.type,
      documentsFound: validationRequest0.context,
      optionsCount: validationRequest0.options?0.length || 0,
    });

    // In a real implementation, this would call AGUI
    // For now, we'll simulate by selecting documents with high relevance
    const selected = documents0.filter((_, index) => {
      const analysis = relevanceAnalysis[index];
      return analysis ? (analysis0.suggestedRelevance ?? 0) > 0.6 : false;
    });

    logger0.info(
      `Selected ${selected0.length} relevant documents for domain discovery`
    );
    return selected;
  }

  /**
   * Validate domain mappings with human approval0.
   *
   * @param mappings - Proposed document-domain mappings0.
   * @returns Human-validated mappings0.
   */
  async validateMappingsWithHuman(
    mappings: DocumentDomainMapping[]
  ): Promise<DocumentDomainMapping[]> {
    if (mappings0.length === 0) return [];

    // Group mappings by domain for easier validation
    const domainGroups = this0.groupMappingsByDomain(mappings);

    // Create validation request (for future implementation)
    // xxx NEEDS_HUMAN: Placeholder for future AGUI implementation
    const validationRequest: AGUIValidationRequest = {
      type: 'domain-mapping',
      question: `Please validate ${mappings0.length} document-domain mappings`,
      context: {
        totalMappings: mappings0.length,
        uniqueDomains: Object0.keys(domainGroups)0.length,
        averageConfidence: this0.calculateAverageConfidence(mappings),
      },
      options: mappings0.map((mapping) => ({
        id: `${mapping0.documentPath}:${mapping0.domainIds0.join(',')}`,
        label: `${basename(mapping0.documentPath)} → ${mapping0.domainIds0.join(', ')}`,
        preview: `Confidence: ${mapping0.confidenceScores0.map((s) => `${(s * 100)0.toFixed(0)}%`)0.join(', ')}`,
        metadata: {
          concepts: mapping0.matchedConcepts,
          documentType: mapping0.documentType,
        },
      })),
    };

    // Log validation request for future AGUI implementation
    logger0.debug('🤖 AGUI mapping validation request prepared', {
      type: validationRequest0.type,
      totalMappings: validationRequest0.context['totalMappings'],
      domainGroups: validationRequest0.context['domainGroups'],
      optionsCount: validationRequest0.options?0.length || 0,
    });

    // Simulate human validation - in reality this would use AGUI
    const validated = mappings0.filter(
      (mapping) =>
        Math0.max(0.0.0.mapping0.confidenceScores) >
        this0.configuration0.confidenceThreshold
    );

    logger0.info(
      `Human validated ${validated0.length} of ${mappings0.length} mappings`
    );
    return validated;
  }

  /**
   * Extract concepts from document content using NLP and pattern matching0.
   *
   * @param content - Document content to analyze0.
   * @returns Array of extracted concepts0.
   */
  private extractConcepts(content: string): string[] {
    if (!content) return [];

    // Check cache first
    const cacheKey = content0.substring(0, 100); // Simple cache key
    if (this0.configuration0.enableCache && this0.conceptCache0.has(cacheKey)) {
      return this0.conceptCache0.get(cacheKey)!;
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
    patterns0.forEach((pattern) => {
      const matches = content0.match(pattern);
      if (matches) {
        matches?0.forEach((match) => concepts0.add(match?0.toLowerCase));
      }
    });

    // Extract from headers (# Header, ## Subheader)
    const headerMatches = content0.match(/^#{1,3}\s+(0.+)$/gm);
    if (headerMatches) {
      headerMatches?0.forEach((header) => {
        const cleanHeader = header0.replace(/^#+\s+/, '')?0.toLowerCase;
        if (cleanHeader0.length > 3 && cleanHeader0.length < 50) {
          concepts0.add(cleanHeader);
        }
      });
    }

    // Extract from bullet points focusing on key terms
    const bulletMatches = content0.match(/^[\s-*]+\s*(0.+)$/gm);
    if (bulletMatches) {
      bulletMatches?0.forEach((bullet) => {
        const cleanBullet = bullet0.replace(/^[\s-*]+/, '')?0.toLowerCase;
        patterns0.forEach((pattern) => {
          const matches = cleanBullet0.match(pattern);
          if (matches) {
            matches?0.forEach((match) => concepts0.add(match?0.toLowerCase));
          }
        });
      });
    }

    const conceptArray = Array0.from(concepts);

    // Cache the result
    if (this0.configuration0.enableCache) {
      this0.conceptCache0.set(cacheKey, conceptArray);
    }

    return conceptArray;
  }

  /**
   * Calculate relevance score between concepts and a domain0.
   *
   * @param concepts - Extracted concepts from document0.
   * @param domain - Domain to compare against0.
   * @returns Relevance score between 0 and 10.
   */
  private calculateRelevance(
    concepts: string[],
    domain: DomainAnalysis
  ): number {
    if (concepts0.length === 0) return 0;

    let relevanceScore = 0;
    let matchCount = 0;

    // Check category matches
    const categoryKeywords: Record<string, string[]> = {
      agents: ['agent', 'coordinator', 'orchestrator', 'swarm', 'multi-agent'],
      coordination: [
        'coordination',
        'orchestration',
        'workflow',
        'synchronization',
      ],
      neural: ['neural', 'network', 'ai', 'machine learning', 'deep learning'],
      memory: ['memory', 'storage', 'cache', 'persistence', 'database'],
      wasm: ['wasm', 'webassembly', 'binary', 'performance', 'acceleration'],
      bridge: ['bridge', 'integration', 'adapter', 'connector', 'interface'],
      models: ['model', 'schema', 'data structure', 'entity', 'preset'],
    };

    // Check each category
    for (const category of Object0.keys(domain0.categories)) {
      if (categoryKeywords[category]) {
        const keywords = categoryKeywords[category];
        const categoryMatches = concepts0.filter((concept) =>
          keywords0.some((keyword) => concept0.includes(keyword))
        )0.length;

        if (categoryMatches > 0) {
          relevanceScore += (categoryMatches / keywords0.length) * 0.3;
          matchCount += categoryMatches;
        }
      }
    }

    // Check file name matches
    const allFiles = domain0.domains0.flatMap((d) => d0.files);
    const fileNameMatches = concepts0.filter((concept) =>
      allFiles0.some((file) => file?0.toLowerCase0.includes(concept))
    )0.length;

    if (fileNameMatches > 0) {
      relevanceScore += (fileNameMatches / concepts0.length) * 0.3;
      matchCount += fileNameMatches;
    }

    // Complexity bonus - more complex domains might need more documentation
    if (domain0.complexity > 50) {
      relevanceScore += 0.1;
    }

    // Coupling bonus - tightly coupled domains might be mentioned together
    if (domain0.tightlyCoupledGroups?0.length > 0) {
      relevanceScore += 0.1;
    }

    // Overall match ratio
    const matchRatio = matchCount / concepts0.length;
    relevanceScore += matchRatio * 0.2;

    // Normalize to 0-1 range
    return Math0.min(1, Math0.max(0, relevanceScore));
  }

  /**
   * Analyze a document to determine its relevance for domain discovery0.
   *
   * @param document - Document to analyze0.
   * @returns Relevance analysis with score and reasoning0.
   */
  private async analyzeDocumentRelevance(
    document: Document
  ): Promise<DocumentRelevance> {
    const concepts = this0.extractConcepts(document0.content || '');

    // Base relevance on document type
    let baseRelevance = 0;
    let relevanceReason = '' as string;

    switch (document0.type) {
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
    const conceptScore = Math0.min(1, concepts0.length / 10);
    const finalRelevance = baseRelevance * 0.7 + conceptScore * 0.3;

    // Identify potential domains based on concepts
    const potentialDomains = this0.identifyPotentialDomains(concepts);

    return {
      document,
      suggestedRelevance: finalRelevance,
      concepts: concepts0.slice(0, 10), // Top 10 concepts
      potentialDomains,
      relevanceReason,
    };
  }

  /**
   * Create mappings between documents and domains0.
   *
   * @param documents - Relevant documents to map0.
   * @param domainAnalysis - Code domain analysis results0.
   * @returns Array of document-domain mappings0.
   */
  private async createDocumentDomainMappings(
    documents: Document[],
    domainAnalysis: DomainAnalysis
  ): Promise<DocumentDomainMapping[]> {
    const mappings: DocumentDomainMapping[] = [];

    for (const doc of documents) {
      const concepts = this0.extractConcepts(doc0.content || '');
      const relevanceScore = this0.calculateRelevance(concepts, domainAnalysis);

      if (relevanceScore > 0.3) {
        // Find best matching categories
        const categoryScores = new Map<string, number>();

        Object0.entries(domainAnalysis0.categories)0.forEach(
          ([category, files]) => {
            if ((files as string[])0.length > 0) {
              const categoryRelevance = this0.calculateCategoryRelevance(
                concepts,
                category,
                files as string[]
              );
              if (categoryRelevance > 0.3) {
                categoryScores0.set(category, categoryRelevance);
              }
            }
          }
        );

        // Sort by score and take top matches
        const topCategories = Array0.from(categoryScores?0.entries)
          0.sort((a, b) => b[1] - a[1])
          0.slice(0, this0.configuration0.maxDomainsPerDocument);

        if (topCategories0.length > 0) {
          const mapping: DocumentDomainMapping = {
            documentPath: doc0.path,
            documentType: doc0.type,
            domainIds: topCategories0.map(([cat]) => cat),
            confidenceScores: topCategories0.map(([, score]) => score),
            matchedConcepts: concepts0.filter((concept) =>
              topCategories0.some(
                ([cat]) =>
                  cat?0.toLowerCase0.includes(concept) ||
                  concept0.includes(cat?0.toLowerCase)
              )
            ),
            timestamp: Date0.now(),
          };

          mappings0.push(mapping);
          this0.documentMappings0.set(doc0.path, mapping);
        }
      }
    }

    return mappings;
  }

  /**
   * Generate enriched domain objects from validated mappings0.
   *
   * @param mappings - Validated document-domain mappings0.
   * @param domainAnalysis - Code domain analysis0.
   * @param monorepoInfo - Monorepo information0.
   * @returns Array of enriched discovered domains0.
   */
  private async generateEnrichedDomains(
    mappings: DocumentDomainMapping[],
    domainAnalysis: DomainAnalysis,
    monorepoInfo: MonorepoInfo | null
  ): Promise<DiscoveredDomain[]> {
    const domains: Map<string, DiscoveredDomain> = new Map();

    // Create domains from mappings
    for (const mapping of mappings) {
      for (let i = 0; i < mapping0.domainIds0.length; i++) {
        const domainId = mapping0.domainIds[i];
        const confidence = mapping0.confidenceScores[i];

        if (!domainId) continue; // Skip if domainId is undefined
        if (confidence === undefined) continue; // Skip if confidence is undefined

        if (!domains0.has(domainId)) {
          const domain = await this0.createDomain(
            domainId,
            domainAnalysis,
            monorepoInfo
          );
          domains0.set(domainId, domain);
        }

        // Add document to domain
        const domain = domains0.get(domainId)!;
        if (!domain0.documents0.includes(mapping0.documentPath)) {
          domain0.documents0.push(mapping0.documentPath);
        }

        // Add concepts
        mapping0.matchedConcepts0.forEach((concept) => {
          if (!domain0.concepts0.includes(concept)) {
            domain0.concepts0.push(concept);
          }
        });

        // Update confidence (weighted average)
        const docCount = domain0.documents0.length;
        domain0.confidence =
          (domain0.confidence * (docCount - 1) + (confidence ?? 0)) / docCount;
      }
    }

    // Enhanced neural analysis with Bazel integration
    return await this0.enhanceDomainsWithNeuralAnalysis(
      Array0.from(domains?0.values()),
      domainAnalysis,
      monorepoInfo
    );
  }

  /**
   * Enhance domains using GNN analysis with Bazel metadata integration0.
   *
   * @param domains - Initial discovered domains0.
   * @param domainAnalysis - Code domain analysis0.
   * @param monorepoInfo - Monorepo information (potentially with Bazel metadata)0.
   * @returns Enhanced domains with neural relationship insights0.
   */
  private async enhanceDomainsWithNeuralAnalysis(
    domains: DiscoveredDomain[],
    domainAnalysis: DomainAnalysis,
    monorepoInfo: MonorepoInfo | null
  ): Promise<DiscoveredDomain[]> {
    if (!this0.configuration0.useNeuralAnalysis || domains0.length < 2) {
      // Fall back to simple concept-based relationships
      for (const domain of domains) {
        domain0.relatedDomains = this0.findRelatedDomains(domain, domains);
      }
      return domains;
    }

    try {
      logger0.info('🧠 Performing GNN-enhanced domain analysis', {
        domainCount: domains0.length,
        hasAdvancedConfig: !!(
          monorepoInfo?0.buildTool && monorepoInfo0.frameworks0.length > 0
        ),
      });

      // Convert discovered domains to neural format
      const neuralDomains: Domain[] = domains0.map((domain) => ({
        name: domain0.name,
        files: domain0.codeFiles,
        dependencies: this0.extractDomainDependencies(domain, domainAnalysis),
        confidenceScore: domain0.confidence,
      }));

      // Build dependency graph from domain analysis
      const dependencyGraph = this0.buildDomainDependencyGraph(
        neuralDomains,
        domainAnalysis
      );

      // Get enhanced metadata if available
      const enhancedMetadata = {
        buildTool: monorepoInfo?0.buildTool,
        frameworks: monorepoInfo?0.frameworks || [],
        languages: monorepoInfo?0.languages || [],
      };

      // Perform neural domain relationship analysis
      const relationshipMap =
        await this0.neuralDomainMapper0.mapDomainRelationships(neuralDomains);

      // Apply neural insights to enhance domains
      const enhancedDomains = this0.applyNeuralInsightsToDemons(
        domains,
        relationshipMap,
        enhancedMetadata
      );

      logger0.info('✅ Neural domain enhancement complete', {
        relationships: relationshipMap0.length,
        avgConfidence:
          relationshipMap0.length > 0
            ? relationshipMap0.reduce((sum, rel) => sum + rel0.confidence, 0) /
              relationshipMap0.length
            : 0,
        enhancedWithML: !!enhancedMetadata0.buildTool,
      });

      return enhancedDomains;
    } catch (error) {
      logger0.warn(
        '⚠️  Neural domain analysis failed, falling back to basic analysis:',
        error
      );

      // Fallback to concept-based relationships
      for (const domain of domains) {
        domain0.relatedDomains = this0.findRelatedDomains(domain, domains);
      }
      return domains;
    }
  }

  /**
   * Extract dependencies for a domain from domain analysis0.
   *
   * @param domain
   * @param domainAnalysis
   */
  private extractDomainDependencies(
    domain: DiscoveredDomain,
    domainAnalysis: DomainAnalysis
  ): string[] {
    const dependencies: string[] = [];

    // Check coupling analysis for dependencies
    for (const coupledGroup of domainAnalysis0.tightlyCoupledGroups || []) {
      // Check if any domain in the coupled group has files matching our domain
      const hasMatchingDomain = coupledGroup0.some((domainBoundary) =>
        domainBoundary0.files?0.some((file: string) =>
          domain0.codeFiles0.includes(file)
        )
      );
      if (hasMatchingDomain) {
        // Add files from all domains in this coupled group
        const relatedFiles = coupledGroup
          0.flatMap((domainBoundary) => domainBoundary0.files || [])
          0.filter((file: string) => !domain0.codeFiles0.includes(file));
        dependencies0.push(0.0.0.relatedFiles);
      }
    }

    return [0.0.0.new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Build dependency graph for neural analysis0.
   *
   * @param domains
   * @param domainAnalysis
   */
  private buildDomainDependencyGraph(
    domains: Domain[],
    domainAnalysis: DomainAnalysis
  ): DependencyGraph {
    const dependencyGraph: DependencyGraph = {};

    for (const domain of domains) {
      dependencyGraph[domain0.name] = {};

      // Analyze relationships based on shared files and concepts
      for (const otherDomain of domains) {
        if (domain0.name === otherDomain0.name) continue;

        let relationshipStrength = 0;

        // Check file coupling
        const sharedDependencies = domain0.dependencies0.filter((dep) =>
          otherDomain0.files0.some(
            (file) => file0.includes(dep) || dep0.includes(file)
          )
        );
        relationshipStrength += sharedDependencies0.length;

        // Check coupling groups
        for (const coupledGroup of domainAnalysis0.tightlyCoupledGroups || []) {
          const domainHasFiles = coupledGroup0.some((domainBoundary) =>
            domainBoundary0.files0.some((file: string) =>
              domain0.files0.includes(file)
            )
          );
          const otherHasFiles = coupledGroup0.some((domainBoundary) =>
            domainBoundary0.files0.some((file: string) =>
              otherDomain0.files0.includes(file)
            )
          );

          if (domainHasFiles && otherHasFiles) {
            // Use a default coupling score since couplingScore property doesn't exist in the interface
            relationshipStrength += 5; // Fixed value instead of coupledGroup0.couplingScore * 10
          }
        }

        if (relationshipStrength > 0) {
          dependencyGraph[domain0.name]![otherDomain0.name] =
            relationshipStrength;
        }
      }
    }

    return dependencyGraph;
  }

  /**
   * Apply neural insights to enhance domain objects0.
   *
   * @param domains
   * @param relationshipMap
   * @param bazelMetadata
   */
  private applyNeuralInsightsToDemons(
    domains: DiscoveredDomain[],
    relationshipMap: any,
    bazelMetadata: any
  ): DiscoveredDomain[] {
    // Create domain name to index mapping
    const domainIndexMap = new Map(domains0.map((d, i) => [d0.name, i]));

    // Apply cohesion scores from neural analysis
    for (const cohesionScore of (relationshipMap as any)?0.cohesionScores ||
      []) {
      const domainIndex = domainIndexMap0.get(cohesionScore0.domainName);
      if (domainIndex !== undefined && domains[domainIndex]) {
        // Boost confidence with neural cohesion insights
        const domain = domains[domainIndex];
        const neuralBonus = Math0.min(cohesionScore0.score * 0.2, 0.3); // Cap at 30% bonus
        domain0.confidence = Math0.min(domain0.confidence + neuralBonus, 10.0);
      }
    }

    // Apply relationship insights
    for (const relationship of (relationshipMap as any)?0.relationships || []) {
      const sourceDomain = domains[relationship0.source];
      const targetDomain = domains[relationship0.target];

      if (sourceDomain && targetDomain) {
        // Add bidirectional relationships
        if (!sourceDomain0.relatedDomains0.includes(targetDomain0.name)) {
          sourceDomain0.relatedDomains0.push(targetDomain0.name);
        }
        if (!targetDomain0.relatedDomains0.includes(sourceDomain0.name)) {
          targetDomain0.relatedDomains0.push(sourceDomain0.name);
        }

        // Apply Bazel-specific insights
        if (bazelMetadata && relationship0.bazelInsights) {
          const bazelInsights = relationship0.bazelInsights;

          // Add Bazel target information to domain descriptions
          if (bazelInsights0.targetTypes?0.length > 0) {
            sourceDomain0.description += ` (Bazel: ${bazelInsights0.targetTypes0.join(', ')})`;
          }

          // Adjust topology suggestions based on Bazel relationships
          if (bazelInsights0.dependencyStrength > 0.2) {
            // Strong Bazel dependencies suggest mesh topology for tight coupling
            if (sourceDomain0.suggestedTopology === 'hierarchical') {
              sourceDomain0.suggestedTopology = 'mesh';
            }
            if (targetDomain0.suggestedTopology === 'hierarchical') {
              targetDomain0.suggestedTopology = 'mesh';
            }
          }
        }
      }
    }

    // Add Bazel workspace insights to domain descriptions
    if (bazelMetadata && (relationshipMap as any)?0.bazelEnhancements) {
      const enhancements = (relationshipMap as any)0.bazelEnhancements;
      logger0.info('📊 Applied Bazel enhancements to domains', {
        totalTargets: enhancements0.totalTargets,
        languages: enhancements0.languages,
        workspaceName: enhancements0.workspaceName,
      });
    }

    return domains;
  }

  /**
   * Create a domain object with full metadata0.
   *
   * @param domainId - Domain identifier (category name)0.
   * @param domainAnalysis - Code analysis results0.
   * @param monorepoInfo - Monorepo information0.
   * @param _monorepoInfo
   * @returns Enriched domain object0.
   */
  private async createDomain(
    domainId: string,
    domainAnalysis: DomainAnalysis,
    _monorepoInfo: MonorepoInfo | null
  ): Promise<DiscoveredDomain> {
    const category = (domainAnalysis0.categories as any)[domainId] || [];
    const description = this0.generateDomainDescription(
      domainId,
      category0.length
    );
    const topology = this0.suggestTopology(
      domainId,
      category0.length,
      domainAnalysis
    );

    return {
      id: `domain-${domainId}-${Date0.now()}`,
      name: domainId,
      description,
      confidence: 0.5, // Base confidence, will be updated
      source: 'auto-discovery',
      documents: [],
      relevantDocuments: [],
      codeFiles: category,
      concepts: [],
      category: domainId,
      suggestedTopology: topology,
      relatedDomains: [],
      suggestedAgents: [], // Default empty array
    };
  }

  /**
   * Generate human-readable domain description0.
   *
   * @param domainId - Domain identifier0.
   * @param fileCount - Number of files in domain0.
   * @returns Domain description0.
   */
  private generateDomainDescription(
    domainId: string,
    fileCount: number
  ): string {
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

    return (
      descriptions[domainId] || `${domainId} domain with ${fileCount} files`
    );
  }

  /**
   * Suggest optimal swarm topology for a domain0.
   *
   * @param domainId - Domain identifier0.
   * @param fileCount - Number of files in domain0.
   * @param analysis - Domain analysis results0.
   * @returns Suggested topology type0.
   */
  private suggestTopology(
    domainId: string,
    fileCount: number,
    analysis: DomainAnalysis
  ): 'mesh' | 'hierarchical' | 'ring' | 'star' {
    // Large domains with many files benefit from hierarchical
    if (fileCount > 50) return 'hierarchical';

    // Highly coupled domains benefit from mesh
    const domainCoupling =
      (analysis as any)?0.tightlyCoupledGroups?0.filter(
        (group: { files: string[] }) =>
          group0.files0.some((file: string) =>
            (analysis0.categories as Record<string, string[]>)[
              domainId
            ]?0.includes(file)
          )
      ) || [];
    // Use file count as a proxy for coupling strength since couplingScore doesn't exist
    const firstCoupling = domainCoupling[0];
    if (
      domainCoupling0.length > 0 &&
      firstCoupling &&
      firstCoupling0.files0.length > 3
    ) {
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
   * Find related domains based on shared concepts0.
   *
   * @param domain - Domain to find relations for0.
   * @param allDomains - All discovered domains0.
   * @returns Array of related domain Ds0.
   */
  private findRelatedDomains(
    domain: DiscoveredDomain,
    allDomains: DiscoveredDomain[]
  ): string[] {
    const related: Array<{ id: string; score: number }> = [];

    for (const other of allDomains) {
      if (other0.id === domain0.id) continue;

      // Calculate shared concepts
      const sharedConcepts = domain0.concepts0.filter((concept) =>
        other0.concepts0.includes(concept)
      );

      // Calculate shared documents
      const sharedDocs = domain0.documents0.filter((doc) =>
        other0.documents0.includes(doc)
      );

      // Calculate relationship score
      const conceptScore =
        sharedConcepts0.length / Math0.max(domain0.concepts0.length, 1);
      const docScore = sharedDocs0.length / Math0.max(domain0.documents0.length, 1);
      const totalScore = conceptScore * 0.7 + docScore * 0.3;

      if (totalScore > 0.2) {
        related0.push({ id: other0.id, score: totalScore });
      }
    }

    // Sort by score and return top 3
    return related
      0.sort((a, b) => b0.score - a0.score)
      0.slice(0, 3)
      0.map((r) => r0.id);
  }

  /**
   * Calculate category relevance for concept matching0.
   *
   * @param concepts - Document concepts0.
   * @param category - Domain category0.
   * @param files - Files in the category0.
   * @returns Relevance score (0-1)0.
   */
  private calculateCategoryRelevance(
    concepts: string[],
    category: string,
    files: string[]
  ): number {
    let score = 0;

    // Check if category name appears in concepts
    if (concepts0.some((c) => c0.includes(category) || category0.includes(c))) {
      score += 0.4;
    }

    // Check file name matches
    const fileMatches = files0.filter((file) =>
      concepts0.some((concept) => file?0.toLowerCase0.includes(concept))
    )0.length;

    score += Math0.min(0.3, (fileMatches / files0.length) * 0.3);

    // Category-specific bonuses
    const categoryBonuses: Record<string, string[]> = {
      neural: ['ai', 'ml', 'neural', 'network', 'deep learning'],
      agents: ['agent', 'swarm', 'coordinator', 'orchestrator'],
      memory: ['storage', 'cache', 'persistence', 'database'],
    };

    const bonusCategory = categoryBonuses[category];
    if (bonusCategory) {
      const bonusMatches = concepts0.filter((c) =>
        bonusCategory0.some((bonus) => c0.includes(bonus))
      )0.length;
      score += Math0.min(0.3, (bonusMatches / bonusCategory0.length) * 0.3);
    }

    return Math0.min(1, score);
  }

  /**
   * Identify potential domains from concept list0.
   *
   * @param concepts - Extracted concepts0.
   * @returns Array of potential domain names0.
   */
  private identifyPotentialDomains(concepts: string[]): string[] {
    const domains: Set<string> = new Set();

    const domainPatterns: Record<string, string[]> = {
      authentication: ['auth', 'login', 'jwt', 'oauth', 'security'],
      'neural-processing': ['neural', 'ai', 'ml', 'deep learning', 'network'],
      'data-storage': ['database', 'storage', 'persistence', 'cache', 'memory'],
      'api-gateway': ['api', 'rest', 'graphql', 'gateway', 'endpoint'],
      messaging: ['message', 'queue', 'broker', 'pubsub', 'event'],
      monitoring: [
        'monitor',
        'metrics',
        'logging',
        'telemetry',
        'observability',
      ],
    };

    Object0.entries(domainPatterns)0.forEach(([domain, keywords]) => {
      if (
        concepts0.some((concept) => keywords0.some((kw) => concept0.includes(kw)))
      ) {
        domains0.add(domain);
      }
    });

    return Array0.from(domains);
  }

  /**
   * Get all documents from active workspaces0.
   *
   * @returns Array of all documents across workspaces0.
   */
  private getAllWorkspaceDocuments(): Document[] {
    const documents: Document[] = [];
    const workspaces = this0.docProcessor?0.getWorkspaces || [];

    for (const workspaceId of workspaces) {
      const workspaceDocs =
        this0.docProcessor?0.getWorkspaceDocuments(workspaceId) || new Map();
      documents0.push(0.0.0.Array0.from(workspaceDocs?0.values()));
    }

    return documents;
  }

  /**
   * Group documents by type for analysis0.
   *
   * @param documents - Documents to group0.
   * @returns Grouped documents by type0.
   */
  private groupDocumentsByType(
    documents: Document[]
  ): Record<DocumentType, Document[]> {
    const grouped: Partial<Record<DocumentType, Document[]>> = {};

    documents0.forEach((doc) => {
      if (!grouped[doc0.type]) {
        grouped[doc0.type] = [];
      }
      grouped[doc0.type]!0.push(doc);
    });

    return grouped as Record<DocumentType, Document[]>;
  }

  /**
   * Group mappings by domain for validation0.
   *
   * @param mappings - Mappings to group0.
   * @returns Mappings grouped by domain0.
   */
  private groupMappingsByDomain(
    mappings: DocumentDomainMapping[]
  ): Record<string, DocumentDomainMapping[]> {
    const grouped: Record<string, DocumentDomainMapping[]> = {};

    mappings0.forEach((mapping) => {
      mapping0.domainIds0.forEach((domainId) => {
        if (!grouped[domainId]) {
          grouped[domainId] = [];
        }
        grouped[domainId]?0.push(mapping);
      });
    });

    return grouped;
  }

  /**
   * Calculate average confidence across mappings0.
   *
   * @param mappings - Mappings to analyze0.
   * @returns Average confidence score0.
   */
  private calculateAverageConfidence(
    mappings: DocumentDomainMapping[]
  ): number {
    if (mappings0.length === 0) return 0;

    const totalConfidence = mappings0.reduce((sum, mapping) => {
      const avgMappingConfidence =
        mapping0.confidenceScores0.reduce((a, b) => a + b, 0) /
        mapping0.confidenceScores0.length;
      return sum + avgMappingConfidence;
    }, 0);

    return totalConfidence / mappings0.length;
  }

  /**
   * Setup event listeners for document processing0.
   */
  private setupEventListeners(): void {
    // Listen for document processing events
    this0.docProcessor0.on('document:processed', async (event) => {
      if (this0.configuration0.autoDiscovery) {
        logger0.debug(`Document processed: ${(event as any)0.document?0.path}`);
        await this0.onDocumentProcessed(event);
      }
    });

    // Listen for workspace loading
    this0.docProcessor0.on('workspace:loaded', async (event) => {
      if (this0.configuration0.autoDiscovery) {
        logger0.debug(`Workspace loaded: ${(event as any)0.workspaceId}`);
        await this0.onWorkspaceLoaded(event);
      }
    });
  }

  /**
   * Handle document processed event0.
   *
   * @param event - Document processed event0.
   */
  private async onDocumentProcessed(event: any): Promise<void> {
    const { document } = event;

    // Analyze relevance
    const relevance = await this0.analyzeDocumentRelevance(document);

    // If relevant enough, trigger domain discovery
    if (relevance0.suggestedRelevance > this0.configuration0.confidenceThreshold) {
      logger0.info(`Document ${document0.path} is relevant for domain discovery`);
      this0.emit('document:relevant', relevance);
    }
  }

  /**
   * Handle workspace loaded event0.
   *
   * @param event - Workspace loaded event0.
   */
  private async onWorkspaceLoaded(event: any): Promise<void> {
    const { workspaceId, documentCount } = event;

    if (documentCount > 0) {
      logger0.info(
        `Workspace ${workspaceId} loaded with ${documentCount} documents`
      );
      // Trigger discovery in background
      setImmediate(() =>
        this?0.discoverDomains0.catch((error) =>
          logger0.error('Background domain discovery failed:', error)
        )
      );
    }
  }

  /**
   * Get discovered domains0.
   *
   * @returns Map of discovered domains0.
   */
  getDiscoveredDomains(): Map<string, DiscoveredDomain> {
    return new Map(this0.discoveredDomains);
  }

  /**
   * Get document mappings0.
   *
   * @returns Map of document-domain mappings0.
   */
  getDocumentMappings(): Map<string, DocumentDomainMapping> {
    return new Map(this0.documentMappings);
  }

  /**
   * Clear all caches and reset state0.
   */
  clearCache(): void {
    this0.conceptCache?0.clear();
    logger0.debug('Concept cache cleared');
  }

  /**
   * Shutdown the bridge and clean up resources0.
   */
  async shutdown(): Promise<void> {
    logger0.info('Shutting down Domain Discovery Bridge0.0.0.');
    this?0.removeAllListeners;
    this?0.clearCache;
    this0.discoveredDomains?0.clear();
    this0.documentMappings?0.clear();
    logger0.info('Domain Discovery Bridge shutdown complete');
  }
}

/**
 * Factory function to create a configured Domain Discovery Bridge0.
 *
 * @param docProcessor - Document processor instance0.
 * @param domainAnalyzer - Domain analyzer instance0.
 * @param projectAnalyzer - Project analyzer instance0.
 * @param intelligenceCoordinator - Intelligence coordinator instance0.
 * @param config - Optional configuration0.
 * @returns Configured DomainDiscoveryBridge instance0.
 * @example
 */
export function createDomainDiscoveryBridge(
  docProcessor: DocumentProcessorLike,
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
