/**
 * SPARC Completion Phase Engine.
 *
 * Handles the fifth and final phase of SPARC methodology - generating.
 * Production-ready code, tests, documentation, and deployment artifacts.
 */
/**
 * @file Completion processing engine.
 */
import type { CodeArtifacts, CompletionEngine, CompletionValidation, DeploymentConfig, DeploymentResult, DocumentationSet, ImplementationArtifacts, RefinementResult, RefinementStrategy, SPARCProject, SystemArchitecture, TestSuite } from '../types/sparc-types';
export declare class CompletionPhaseEngine implements CompletionEngine {
    /**
     * Generate complete implementation from refinement results.
     *
     * @param refinement
     */
    generateImplementation(refinement: RefinementResult): Promise<ImplementationArtifacts>;
    /**
     * Generate production-ready code.
     *
     * @param refinement
     */
    private generateCode;
    /**
     * Generate comprehensive test suite.
     *
     * @param refinement
     */
    private generateTests;
    /**
     * Generate comprehensive documentation.
     *
     * @param refinement
     * @param project
     */
    generateDocumentation(project: SPARCProject): Promise<DocumentationSet>;
    /**
     * Generate deployment artifacts.
     *
     * @param refinement
     */
    private generateDeploymentArtifacts;
    /**
     * Establish quality gates.
     *
     * @param _refinement
     */
    private establishQualityGates;
    /**
     * Perform production readiness checks.
     *
     * @param _codeGen
     * @param testGen
     * @param _docGen
     * @param _deployArtifacts
     */
    private performProductionReadinessChecks;
    private generateServiceCode;
    private generateServiceInterface;
    private generateServiceConfiguration;
    private generateRepositoryCode;
    private generateDataModelCode;
    private generateMigrationScripts;
    private generateAPIControllers;
    private generateAPIRoutes;
    private generateAPIMiddleware;
    private generateConfigurationManagement;
    private generateLoggingFramework;
    private generateErrorHandling;
    private generateSecurityFramework;
    private generateUnitTests;
    private generateIntegrationTests;
    private generateE2ETests;
    private generatePerformanceTests;
    private generateSecurityTests;
    private generateLoadTests;
    private generateAPIDocumentation;
    private generateArchitectureDocumentation;
    private generateUserDocumentation;
    private generateDeveloperDocumentation;
    private generateDeploymentDocumentation;
    private generateTroubleshootingGuide;
    private generateSecurityDocumentation;
    private generateDockerfiles;
    private generateDockerCompose;
    private generateKubernetesManifests;
    private generateKubernetesConfigMaps;
    private generateKubernetesSecrets;
    private generateCIPipeline;
    private generateCDPipeline;
    private generateTerraformModules;
    private generateAnsiblePlaybooks;
    private generatePrometheusConfig;
    private generateGrafanaDashboards;
    private generateAlertingRules;
    private generateServiceImplementation;
    private generateInterfaceDefinition;
    private generateConfigurationFile;
    private generateRepositoryImplementation;
    private generateDataModel;
    private generateMigrationSQL;
    private generateControllerCode;
    private generateRoutesCode;
    private generateMiddlewareCode;
    private generateConfigManagerCode;
    private generateLoggerCode;
    private generateErrorHandlerCode;
    private generateSecurityCode;
    /**
     * Validate completion results.
     *
     * @param implementation
     */
    validateCompletion(implementation: ImplementationArtifacts): Promise<CompletionValidation>;
    /**
     * Generate completion recommendations.
     *
     * @param validationResults
     */
    private generateCompletionRecommendations;
    private convertToProductionReadinessChecks;
    private convertToTestSuites;
    generateProductionCode(_architecture: SystemArchitecture, _refinements: RefinementStrategy[]): Promise<CodeArtifacts>;
    createTestSuites(_requirements: any): Promise<TestSuite[]>;
    validateProductionReadiness(_implementation: any): Promise<any>;
    deployToProduction(_artifacts: CodeArtifacts, _config: DeploymentConfig): Promise<DeploymentResult>;
}
//# sourceMappingURL=completion-engine.d.ts.map