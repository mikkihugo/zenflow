/**
 * Domain Discovery Bridge - Connects Document Processing to Domain Analysis.
 *
 * This bridge connects the document-driven development workflow with domain discovery,
 * enabling automatic domain identification based on project documentation and code analysis.
 * It leverages neural networks for intelligent domain mapping and provides human-in-the-loop.
 * Validation through AGUI integration..
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
 * @file Coordination system: domain-discovery-bridge.
 */
import { EventEmitter } from 'node:events';
import type { Document, DocumentProcessor, DocumentType } from '../../core/document-processor.ts';
import type { IntelligenceCoordinationSystem } from '../../knowledge/intelligence-coordination-system.ts';
import type { ProjectContextAnalyzer } from '../../knowledge/project-context-analyzer.ts';
import type { DomainAnalysisEngine } from '../../tools/domain-splitting/analyzers/domain-analyzer.ts';
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
 * Workflow and automatic domain discovery. It analyzes documents for concepts,
 * maps them to code domains, and provides human validation touchpoints..
 *
 * @example
 */
export declare class DomainDiscoveryBridge extends EventEmitter {
    private docProcessor;
    private domainAnalyzer;
    private projectAnalyzer;
    private config;
    private discoveredDomains;
    private documentMappings;
    private conceptCache;
    private initialized;
    private neuralDomainMapper;
    /**
     * Creates a new Domain Discovery Bridge.
     *
     * @param docProcessor - Document processor for scanning and processing documents.
     * @param domainAnalyzer - Domain analyzer for code analysis and categorization.
     * @param projectAnalyzer - Project context analyzer with monorepo detection.
     * @param _intelligenceCoordinator - Intelligence system for cross-domain knowledge (reserved for future use).
     * @param config - Optional configuration settings.
     */
    constructor(docProcessor: DocumentProcessor, domainAnalyzer: DomainAnalysisEngine, projectAnalyzer: ProjectContextAnalyzer, _intelligenceCoordinator: IntelligenceCoordinationSystem, // xxx NEEDS_HUMAN: Parameter not used - confirm if needed for future features
    config?: DomainDiscoveryBridgeConfig);
    /**
     * Initialize the domain discovery bridge.
     *
     * Sets up event listeners and performs initial discovery if configured.
     */
    initialize(): Promise<void>;
    /**
     * Discover domains by analyzing documents and code.
     *
     * This is the main entry point for domain discovery. It combines document
     * analysis, code analysis, and human validation to identify domains.
     *
     * @returns Array of discovered domains with full metadata.
     */
    discoverDomains(): Promise<DiscoveredDomain[]>;
    /**
     * Ask human to validate document relevance for domain discovery.
     *
     * @param documents - All documents to evaluate.
     * @returns Documents marked as relevant by human.
     */
    askHumanRelevance(documents: Document[]): Promise<Document[]>;
    /**
     * Validate domain mappings with human approval.
     *
     * @param mappings - Proposed document-domain mappings.
     * @returns Human-validated mappings.
     */
    validateMappingsWithHuman(mappings: DocumentDomainMapping[]): Promise<DocumentDomainMapping[]>;
    /**
     * Extract concepts from document content using NLP and pattern matching.
     *
     * @param content - Document content to analyze.
     * @returns Array of extracted concepts.
     */
    private extractConcepts;
    /**
     * Calculate relevance score between concepts and a domain.
     *
     * @param concepts - Extracted concepts from document.
     * @param domain - Domain to compare against.
     * @returns Relevance score between 0 and 1.
     */
    private calculateRelevance;
    /**
     * Analyze a document to determine its relevance for domain discovery.
     *
     * @param document - Document to analyze.
     * @returns Relevance analysis with score and reasoning.
     */
    private analyzeDocumentRelevance;
    /**
     * Create mappings between documents and domains.
     *
     * @param documents - Relevant documents to map.
     * @param domainAnalysis - Code domain analysis results.
     * @returns Array of document-domain mappings.
     */
    private createDocumentDomainMappings;
    /**
     * Generate enriched domain objects from validated mappings.
     *
     * @param mappings - Validated document-domain mappings.
     * @param domainAnalysis - Code domain analysis.
     * @param monorepoInfo - Monorepo information.
     * @returns Array of enriched discovered domains.
     */
    private generateEnrichedDomains;
    /**
     * Enhance domains using GNN analysis with Bazel metadata integration.
     *
     * @param domains - Initial discovered domains.
     * @param domainAnalysis - Code domain analysis.
     * @param monorepoInfo - Monorepo information (potentially with Bazel metadata).
     * @returns Enhanced domains with neural relationship insights.
     */
    private enhanceDomainsWithNeuralAnalysis;
    /**
     * Extract dependencies for a domain from domain analysis.
     *
     * @param domain
     * @param domainAnalysis
     */
    private extractDomainDependencies;
    /**
     * Build dependency graph for neural analysis.
     *
     * @param domains
     * @param domainAnalysis
     */
    private buildDomainDependencyGraph;
    /**
     * Apply neural insights to enhance domain objects.
     *
     * @param domains
     * @param relationshipMap
     * @param bazelMetadata
     */
    private applyNeuralInsightsToDemons;
    /**
     * Create a domain object with full metadata.
     *
     * @param domainId - Domain identifier (category name).
     * @param domainAnalysis - Code analysis results.
     * @param monorepoInfo - Monorepo information.
     * @param _monorepoInfo
     * @returns Enriched domain object.
     */
    private createDomain;
    /**
     * Generate human-readable domain description.
     *
     * @param domainId - Domain identifier.
     * @param fileCount - Number of files in domain.
     * @returns Domain description.
     */
    private generateDomainDescription;
    /**
     * Suggest optimal swarm topology for a domain.
     *
     * @param domainId - Domain identifier.
     * @param fileCount - Number of files in domain.
     * @param analysis - Domain analysis results.
     * @returns Suggested topology type.
     */
    private suggestTopology;
    /**
     * Find related domains based on shared concepts.
     *
     * @param domain - Domain to find relations for.
     * @param allDomains - All discovered domains.
     * @returns Array of related domain IDs.
     */
    private findRelatedDomains;
    /**
     * Calculate category relevance for concept matching.
     *
     * @param concepts - Document concepts.
     * @param category - Domain category.
     * @param files - Files in the category.
     * @returns Relevance score (0-1).
     */
    private calculateCategoryRelevance;
    /**
     * Identify potential domains from concept list.
     *
     * @param concepts - Extracted concepts.
     * @returns Array of potential domain names.
     */
    private identifyPotentialDomains;
    /**
     * Get all documents from active workspaces.
     *
     * @returns Array of all documents across workspaces.
     */
    private getAllWorkspaceDocuments;
    /**
     * Group documents by type for analysis.
     *
     * @param documents - Documents to group.
     * @returns Grouped documents by type.
     */
    private groupDocumentsByType;
    /**
     * Group mappings by domain for validation.
     *
     * @param mappings - Mappings to group.
     * @returns Mappings grouped by domain.
     */
    private groupMappingsByDomain;
    /**
     * Calculate average confidence across mappings.
     *
     * @param mappings - Mappings to analyze.
     * @returns Average confidence score.
     */
    private calculateAverageConfidence;
    /**
     * Setup event listeners for document processing.
     */
    private setupEventListeners;
    /**
     * Handle document processed event.
     *
     * @param event - Document processed event.
     */
    private onDocumentProcessed;
    /**
     * Handle workspace loaded event.
     *
     * @param event - Workspace loaded event.
     */
    private onWorkspaceLoaded;
    /**
     * Get discovered domains.
     *
     * @returns Map of discovered domains.
     */
    getDiscoveredDomains(): Map<string, DiscoveredDomain>;
    /**
     * Get document mappings.
     *
     * @returns Map of document-domain mappings.
     */
    getDocumentMappings(): Map<string, DocumentDomainMapping>;
    /**
     * Clear all caches and reset state.
     */
    clearCache(): void;
    /**
     * Shutdown the bridge and clean up resources.
     */
    shutdown(): Promise<void>;
}
/**
 * Factory function to create a configured Domain Discovery Bridge.
 *
 * @param docProcessor - Document processor instance.
 * @param domainAnalyzer - Domain analyzer instance.
 * @param projectAnalyzer - Project analyzer instance.
 * @param intelligenceCoordinator - Intelligence coordinator instance.
 * @param config - Optional configuration.
 * @returns Configured DomainDiscoveryBridge instance.
 * @example
 */
export declare function createDomainDiscoveryBridge(docProcessor: DocumentProcessor, domainAnalyzer: DomainAnalysisEngine, projectAnalyzer: ProjectContextAnalyzer, intelligenceCoordinator: IntelligenceCoordinationSystem, config?: DomainDiscoveryBridgeConfig): DomainDiscoveryBridge;
//# sourceMappingURL=domain-discovery-bridge.d.ts.map