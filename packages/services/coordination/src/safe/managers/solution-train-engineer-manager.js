/**
 * @fileoverview Solution Train Engineer Manager - Large Solution SAFe Configuration
 *
 * Solution Train Engineer management for SAFe Large Solution configuration.
 * Coordinates multiple Agile Release Trains (ARTs) to deliver complex solutions
 * requiring coordination across multiple development value streams.
 *
 * Delegates to:
 * - Multi-ART Coordination Service for cross-ART synchronization and dependency management
 * - Solution Planning Service for solution-level PI planning and coordination activities
 * - Solution Architecture Management Service for architectural runway and governance
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { getLogger } from '../config/logging-config';
/**
 * Solution Train Engineer Manager for SAFe Large Solution coordination
 */
export class SolutionTrainEngineerManager extends EventBus {
    logger;
    multiARTCoordinationService;
    solutionPlanningService;
    solutionArchitectureManagementService;
    initialized = false;
    constructor(_config) {
        super();
        this.logger = getLogger('SolutionTrainEngineerManager');
        ';
        this.config = config || null;
    }
    /**
     * Initialize with service delegation
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Delegate to Multi-ART Coordination Service
            const { MultiARTCoordinationService } = await import('../services/solution-train/multi-art-coordination-service', ');
            this.multiARTCoordinationService = new MultiARTCoordinationService(this.logger);
            // Delegate to Solution Planning Service
            const { SolutionPlanningService } = await import('../services/solution-train/solution-planning-service', ');
            this.solutionPlanningService = new SolutionPlanningService(this.logger);
            // Delegate to Solution Architecture Management Service
            const { SolutionArchitectureManagementService } = await import('../services/solution-train/solution-architecture-management-service', ');
            this.solutionArchitectureManagementService =
                new SolutionArchitectureManagementService(this.logger);
            this.initialized = true;
            this.logger.info('SolutionTrainEngineerManager initialized successfully');
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize SolutionTrainEngineerManager:', error);
            throw error;
        }
    }
    /**
     * Configure solution train engineer
     */
    async configure(config) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Configuring Solution Train Engineer', { ': steId, config, : .steId,
            solutionName: config.solutionContext.solutionName,
            artCount: config.solutionContext.artCount,
        });
        this.config = config;
        this.emit('solution-train-configured', { steId: config.steId });
        ';
    }
    /**
     * Coordinate multiple ARTs - Delegates to Multi-ART Coordination Service
     */
    async coordinateARTs(coordinationConfig) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Coordinating solution train ARTs');
        ';
        try {
            // Configure multi-ART coordination
            await this.multiARTCoordinationService.configureCoordination(coordinationConfig);
            // Execute coordination
            const result = await this.multiARTCoordinationService.coordinateARTs(coordinationConfig.coordinationId);
            this.emit('arts-coordinated', { ': success, true: ,
                participatingARTs: result.participatingARTs.length,
                effectivenessScore: result.effectiveness.overallScore,
            });
            return {
                coordinationId: result.coordinationId,
                participatingARTs: result.participatingARTs,
                success: true,
                coordinationActivities: result.coordinationActivities,
                dependenciesManaged: result.dependenciesManaged,
                effectiveness: result.effectiveness,
            };
        }
        catch (error) {
            this.logger.error('ART coordination failed:', error);
            ';
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred;;
            this.emit('coordination-failed', { error: errorMessage });
            ';
            throw error;
        }
    }
    /**
     * Facilitate solution PI planning - Delegates to Solution Planning Service
     */
    async facilitateSolutionPlanning(planningConfig) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Facilitating solution PI planning');
        ';
        try {
            // Configure solution planning
            await this.solutionPlanningService.configurePlanning(planningConfig);
            // Execute planning
            const result = await this.solutionPlanningService.executePlanning(planningConfig.planningId, 'PI_PLANNING', ');
            this.emit('solution-planning-completed', { ': success, result, : .success,
                commitmentCount: result.commitments.length,
                riskCount: result.risks.length,
            });
            return {
                planningId: result.planningId,
                success: result.success,
                commitments: result.commitments,
                risks: result.risks,
                dependencies: result.dependencies,
                nextSteps: result.nextSteps,
            };
        }
        catch (error) {
            this.logger.error('Solution planning failed:', error);
            ';
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred;;
            this.emit('planning-failed', { error: errorMessage });
            ';
            throw error;
        }
    }
    /**
     * Manage solution architecture - Delegates to Solution Architecture Management Service
     */
    async manageSolutionArchitecture(architectureConfig) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Managing solution architecture');
        ';
        try {
            // Configure architecture management
            await this.solutionArchitectureManagementService.configureArchitecture(architectureConfig);
            // Assess compliance
            const complianceReport = await this.solutionArchitectureManagementService.assessCompliance(architectureConfig.configId);
            this.emit('architecture-managed', { ': success, true: ,
                complianceScore: complianceReport.overallCompliance,
                violationCount: complianceReport.violations.length,
            });
            return {
                configId: architectureConfig.configId,
                complianceReport,
                runwayComponents: this.solutionArchitectureManagementService.getAllRunwayComponents(),
                architecturalDecisions: this.solutionArchitectureManagementService.getAllArchitecturalDecisions(),
            };
        }
        catch (error) {
            this.logger.error('Solution architecture management failed:', error);
            ';
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred;;
            this.emit('architecture-failed', { error: errorMessage });
            ';
            throw error;
        }
    }
    /**
     * Track cross-ART dependencies - Delegates to Multi-ART Coordination Service
     */
    async trackDependency(dependency) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Tracking cross-ART dependency', { ': fromART, dependency, : .fromART,
            toART: dependency.toART,
            type: dependency.type,
        });
        try {
            const trackedDependency = await this.multiARTCoordinationService.trackDependency(dependency);
            this.emit('dependency-tracked', { ': dependencyId, trackedDependency, : .dependencyId,
                criticality: trackedDependency.criticality,
            });
            return trackedDependency;
        }
        catch (error) {
            this.logger.error('Dependency tracking failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Update dependency status - Delegates to Multi-ART Coordination Service
     */
    async updateDependencyStatus(dependencyId, status, actualDeliveryDate) {
        if (!this.initialized)
            await this.initialize();
        try {
            const updatedDependency = await this.multiARTCoordinationService.updateDependencyStatus(dependencyId, status, actualDeliveryDate);
            this.emit('dependency-updated', { ': dependencyId,
                newStatus: status,
            });
            return updatedDependency;
        }
        catch (error) {
            this.logger.error('Dependency status update failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Make architectural decision - Delegates to Solution Architecture Management Service
     */
    async makeArchitecturalDecision(decision) {
        if (!this.initialized)
            await this.initialize();
        try {
            const architecturalDecision = await this.solutionArchitectureManagementService.makeArchitecturalDecision(decision);
            this.emit('architectural-decision-made', { ': decisionId, architecturalDecision, : .decisionId,
                selectedAlternative: architecturalDecision.selectedAlternative.name,
            });
            return architecturalDecision;
        }
        catch (error) {
            this.logger.error('Architectural decision failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Get solution train metrics
     */
    async getSolutionMetrics() {
        if (!this.initialized)
            await this.initialize();
        return {
            solutionId: this.config?.solutionContext.solutionId,
            artCount: this.config?.solutionContext.artCount,
            teamCount: this.config?.solutionContext.teamCount,
            dependencies: this.multiARTCoordinationService?.getAllDependencies?.() || [],
            commitments: this.solutionPlanningService?.getAllCommitments?.() || [],
            risks: this.solutionPlanningService?.getAllRisks?.() || [],
            architecturalDecisions: this.solutionArchitectureManagementService?.getAllArchitecturalDecisions?.() || [],
            runwayComponents: this.solutionArchitectureManagementService?.getAllRunwayComponents?.() || [],
        };
    }
    /**
     * Get solution train status
     */
    getSolutionTrainStatus() {
        return {
            steId: this.config?.steId,
            solutionName: this.config?.solutionContext.solutionName,
            artCount: this.config?.solutionContext.artCount,
            teamCount: this.config?.solutionContext.teamCount,
            complexity: this.config?.solutionContext.complexity,
            strategicImportance: this.config?.solutionContext.strategicImportance,
            initialized: this.initialized,
            capabilities: this.config?.capabilities,
        };
    }
    /**
     * Shutdown solution train engineer
     */
    shutdown() {
        this.logger.info('Shutting down Solution Train Engineer Manager');
        ';
        this.removeAllListeners();
        this.initialized = false;
    }
}
export default SolutionTrainEngineerManager;
