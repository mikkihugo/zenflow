/**
 * SPARC Architecture Phase Engine.
 *
 * Handles the third phase of SPARC methodology - designing system architecture,
 * component relationships, and deployment strategies.
 */
/**
 * @file Architecture processing engine.
 */
import type { AlgorithmPseudocode, ArchitecturalValidation, ArchitectureDesign, ArchitectureEngine, Component, ComponentDiagram, DataFlowDiagram, DeploymentPlan, DetailedSpecification, ImplementationPlan, SystemArchitecture, ValidationResult } from '../types/sparc-types';
export declare class ArchitecturePhaseEngine implements ArchitectureEngine {
    /**
     * Design system architecture from specification and pseudocode.
     *
     * @param spec
     * @param _spec
     * @param pseudocode
     */
    designSystemArchitecture(_spec: DetailedSpecification, pseudocode: AlgorithmPseudocode[]): Promise<SystemArchitecture>;
    /**
     * Convert SystemComponent to Component.
     *
     * @param systemComponent
     */
    private convertToComponent;
    /**
     * Design system architecture from pseudocode structure (internal method).
     *
     * @param pseudocode
     */
    private designArchitecture;
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
     * Create infrastructure components.
     *
     * @param _pseudocode
     */
    private createInfrastructureComponents;
    /**
     * Define relationships between components.
     *
     * @param components
     */
    private defineComponentRelationships;
    /**
     * Select appropriate architecture patterns.
     *
     * @param _pseudocode
     * @param components
     */
    private selectArchitecturePatterns;
    /**
     * Define data flows between components.
     *
     * @param components
     * @param relationships
     */
    private defineDataFlows;
    /**
     * Define component interfaces.
     *
     * @param components
     */
    private defineComponentInterfaces;
    /**
     * Define quality attributes.
     *
     * @param _pseudocode
     */
    private defineQualityAttributes;
    /**
     * Create deployment strategy (removed problematic method).
     */
    /**
     * Identify integration points (removed problematic method).
     */
    private inferDataTypeFromSystemComponents;
    private selectProtocolForSystemComponents;
    private estimateDataFrequencyFromSystemComponents;
    private inferDataTypeFromComponents;
    private selectProtocolForComponents;
    private estimateDataFrequencyFromComponents;
    private estimateComponentEffort;
    private groupTasksIntoPhases;
    private generateTimeline;
    private parseEffortToHours;
    private calculateResourceRequirements;
    private assessImplementationRisks;
    private extractAlgorithmDependencies;
    private selectTechnologiesForAlgorithm;
    private assessComponentScalability;
    private extractDataStructureDependencies;
    private selectTechnologiesForDataStructure;
    private assessDataStructureScalability;
    private getDataStructureLatency;
    private areComponentsRelated;
    private hasCoordinationComponents;
    private hasDataIntensiveComponents;
    private generateInterfaceMethods;
    private defineSecurityRequirements;
    private defineScalabilityRequirements;
    /**
     * Generate component diagrams from system architecture.
     *
     * @param architecture
     */
    generateComponentDiagrams(architecture: SystemArchitecture): Promise<ComponentDiagram[]>;
    /**
     * Design data flow from components.
     *
     * @param components
     */
    designDataFlow(components: Component[]): Promise<DataFlowDiagram>;
    /**
     * Plan deployment architecture for system.
     *
     * @param system
     */
    planDeploymentArchitecture(system: SystemArchitecture): Promise<DeploymentPlan>;
    /**
     * Validate architectural consistency.
     *
     * @param architecture
     */
    validateArchitecturalConsistency(architecture: SystemArchitecture): Promise<ArchitecturalValidation>;
    /**
     * Generate implementation plan from architecture design.
     *
     * @param architecture
     */
    generateImplementationPlan(architecture: ArchitectureDesign): Promise<ImplementationPlan>;
    /**
     * Validate architecture design.
     *
     * @param architecture
     */
    validateArchitecture(architecture: ArchitectureDesign): Promise<ValidationResult[]>;
}
//# sourceMappingURL=architecture-engine.d.ts.map