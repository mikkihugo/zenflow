/**
 * @file Enhanced Database-Driven SPARC Architecture Phase Engine - Handles the third phase of SPARC methodology for designing system architecture, component relationships, and deployment strategies with database persistence.
 */
import type { AlgorithmPseudocode, ArchitecturalValidation, ArchitectureDesign, ArchitectureEngine, Component, ComponentDiagram, DataFlowDiagram, DeploymentPlan, DetailedSpecification, PseudocodeStructure, SystemArchitecture } from '../types/sparc-types';
/**
 * Enhanced Architecture Phase Engine with Database Integration.
 *
 * @example
 */
export declare class DatabaseDrivenArchitecturePhaseEngine implements ArchitectureEngine {
    private db;
    private logger?;
    private storageService;
    constructor(db: any, // DatabaseAdapter
    logger?: any | undefined);
    /**
     * Initialize the database-driven architecture engine.
     */
    initialize(): Promise<void>;
    /**
     * Design system architecture from pseudocode structure (Enhanced with database persistence).
     *
     * @param pseudocode
     */
    designArchitecture(pseudocode: PseudocodeStructure): Promise<ArchitectureDesign>;
    /**
     * Design system architecture with detailed specification input.
     *
     * @param spec
     * @param pseudocode
     */
    designSystemArchitecture(spec: DetailedSpecification, pseudocode: AlgorithmPseudocode[]): Promise<SystemArchitecture>;
    /**
     * Generate component diagrams with database persistence.
     *
     * @param architecture
     */
    generateComponentDiagrams(architecture: SystemArchitecture): Promise<ComponentDiagram[]>;
    /**
     * Design data flow with enhanced analysis.
     *
     * @param components
     */
    designDataFlow(components: Component[]): Promise<DataFlowDiagram>;
    /**
     * Plan deployment architecture with modern best practices.
     *
     * @param system
     */
    planDeploymentArchitecture(system: SystemArchitecture): Promise<DeploymentPlan>;
    /**
     * Validate architectural consistency with comprehensive checks.
     *
     * @param architecture
     */
    validateArchitecturalConsistency(architecture: SystemArchitecture): Promise<ArchitecturalValidation>;
    /**
     * Get architecture from database by ID.
     *
     * @param architectureId
     */
    getArchitectureById(architectureId: string): Promise<ArchitectureDesign | null>;
    /**
     * Search architectures with criteria.
     *
     * @param criteria
     * @param criteria.domain
     * @param criteria.tags
     * @param criteria.minScore
     * @param criteria.limit
     */
    searchArchitectures(criteria: {
        domain?: string;
        tags?: string[];
        minScore?: number;
        limit?: number;
    }): Promise<ArchitectureDesign[]>;
    /**
     * Get architecture statistics from database.
     */
    getArchitectureStatistics(): Promise<any>;
    /**
     * Update existing architecture design.
     *
     * @param architectureId
     * @param updates
     */
    updateArchitecture(architectureId: string, updates: Partial<ArchitectureDesign>): Promise<ArchitectureDesign>;
    /**
     * Identify system components from algorithms and data structures.
     *
     * @param pseudocode
     */
    private identifySystemComponents;
    /**
     * Create component from algorithm specification.
     *
     * @param algorithm
     */
    private createComponentFromAlgorithm;
    /**
     * Create component from data structure specification.
     *
     * @param dataStructure
     */
    private createComponentFromDataStructure;
    /**
     * Create infrastructure components based on system requirements.
     *
     * @param pseudocode
     */
    private createInfrastructureComponents;
    /**
     * Define relationships between components with enhanced analysis.
     *
     * @param components
     */
    private defineComponentRelationships;
    /**
     * Select appropriate architecture patterns based on system characteristics.
     *
     * @param pseudocode
     * @param components
     */
    private selectArchitecturePatterns;
    /**
     * Define data flows between components with enhanced analysis.
     *
     * @param components
     * @param relationships
     */
    private defineDataFlows;
    /**
     * Define component interfaces with comprehensive specifications.
     *
     * @param components
     */
    private defineComponentInterfaces;
    /**
     * Define quality attributes with measurable criteria.
     *
     * @param pseudocode
     */
    private defineQualityAttributes;
    /**
     * Define security requirements with implementation details.
     *
     * @param components
     */
    private defineSecurityRequirements;
    /**
     * Define scalability requirements with specific targets.
     *
     * @param pseudocode
     */
    private defineScalabilityRequirements;
    private validateInterfaces;
    private validateDataFlow;
    private validatePatternCompliance;
    private validateQualityAttributes;
    private extractArchitectureId;
    private extractComponentsFromSpecification;
    private extractComponentsFromPseudocode;
    private deduplicateComponents;
    private generateInterfaceDefinitions;
    private generateDataFlowConnections;
    private generateDeploymentUnits;
    private extractQualityAttributesFromSpec;
    private selectPatternsFromSpec;
    private selectTechnologyStack;
    private generateMethodsForComponent;
    private extractDependenciesFromAlgorithm;
    private extractAlgorithmDependencies;
    private selectTechnologiesForAlgorithm;
    private assessComponentScalability;
    private extractDataStructureDependencies;
    private selectTechnologiesForDataStructure;
    private assessDataStructureScalability;
    private getDataStructureLatency;
    private estimateMemoryUsage;
    private areComponentsRelated;
    private hasCoordinationComponents;
    private hasDataIntensiveComponents;
    private inferDataType;
    private estimateDataVolume;
    private estimateDataFrequency;
    private determineSecurityRequirements;
    private identifyDataTransformation;
    private determineInterfaceType;
    private generateInterfaceMethods;
    private selectProtocol;
    private determineAuthentication;
    private calculateRateLimit;
    private estimateFrequency;
    /**
     * Generate architecture recommendations based on validation results.
     *
     * @param validationResults
     */
    private generateArchitectureRecommendations;
}
//# sourceMappingURL=database-driven-architecture-engine.d.ts.map