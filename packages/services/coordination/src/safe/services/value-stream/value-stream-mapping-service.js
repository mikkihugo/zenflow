/**
 * @fileoverview Value Stream Mapping Service - SAFe value stream mapping and workflow integration.
 *
 * Provides specialized value stream mapping capabilities with workflow-to-value-stream conversion,
 * multi-level orchestration integration, and intelligent mapping optimization.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent mapping optimization
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for process coordination
 * - @claude-zen/agui: Human-in-loop approvals for critical mapping decisions
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
-added | non - value - added | 'necessary-non-value-added;;
// ============================================================================
// VALUE STREAM MAPPING SERVICE IMPLEMENTATION
// ============================================================================
/**
 * Value Stream Mapping Service - SAFe value stream mapping and workflow integration
 *
 * Provides comprehensive value stream mapping with intelligent workflow-to-value-stream conversion,
 * multi-level orchestration integration, and AI-powered mapping optimization.
 */
export class ValueStreamMappingService {
    logger;
    brainCoordinator;
    performanceTracker;
    workflowEngine;
    aguiService;
    initialized = false;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Initialize service with lazy-loaded dependencies
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Lazy load @claude-zen/brain for LoadBalancer - intelligent mapping optimization
            const { BrainCoordinator } = await import('@claude-zen/brain');
            ';
            this.brainCoordinator = new BrainCoordinator(enabled, true, learningRate, 0.1, adaptationThreshold, 0.7);
            await this.brainCoordinator.initialize();
            // Lazy load @claude-zen/foundation for performance tracking
            const { PerformanceTracker } = await import('@claude-zen/foundation');
            ';
            this.performanceTracker = new PerformanceTracker();
            // Lazy load @claude-zen/workflows for workflow integration
            const { WorkflowEngine } = await import('@claude-zen/workflows');
            ';
            this.workflowEngine = new WorkflowEngine(maxConcurrentWorkflows, 5, enableVisualization, true);
            await this.workflowEngine.initialize();
            // Lazy load @claude-zen/agui for mapping approvals
            const { AGUISystem } = await import('@claude-zen/agui');
            ';
            const aguiResult = await AGUISystem({
                aguiType: 'terminal',
                taskApprovalConfig: {
                    enableRichDisplay: true,
                    enableBatchMode: false,
                    requireRationale: true,
                },
            });
            this.aguiService = aguiResult.agui;
            this.initialized = true;
            this.logger.info('Value Stream Mapping Service initialized successfully');
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize Value Stream Mapping Service:', error);
            throw error;
        }
    }
    /**
     * Map product workflows to SAFe value streams with intelligent optimization
     */
    async mapWorkflowsToValueStreams(orchestrationManager) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('map_workflows_to_value_streams', ');
        try {
            this.logger.info('Starting intelligent workflow to value stream mapping');
            ';
            const valueStreams = new Map();
            // Get workflow data from orchestration manager
            const workflows = this.getWorkflowsFromOrchestration(orchestrationManager);
            // Use brain coordinator for intelligent mapping strategy
            const mappingStrategy = await this.brainCoordinator.optimizeMappingStrategy({
                workflows,
                organizationLevel: 'enterprise',
                optimizationGoals: [
                    'minimize_complexity',
                    'maximize_flow',
                    'align_business_value',
                ],
            });
            // Map program-level workflows to value streams
            const programValueStreams = this.mapProgramToValueStreams(workflows.program || [], mappingStrategy);
            for (const [id, stream] of programValueStreams) {
                valueStreams.set(id, stream);
            }
            // Map swarm-level workflows to value streams
            const swarmValueStreams = this.mapSwarmToValueStreams(workflows.swarm || [], mappingStrategy);
            for (const [id, stream] of swarmValueStreams) {
                valueStreams.set(id, stream);
            }
            // Map portfolio-level workflows to value streams
            const portfolioValueStreams = this.mapPortfolioToValueStreams(workflows.portfolio || [], mappingStrategy);
            for (const [id, stream] of portfolioValueStreams) {
                valueStreams.set(id, stream);
            }
            // Validate mappings with AI analysis
            this.validateMappingsWithAI(valueStreams, mappingStrategy);
            this.performanceTracker.endTimer('map_workflows_to_value_streams');
            ';
            this.logger.info('Workflow to value stream mapping completed', ', valueStreamCount, valueStreams.size, mappingStrategy, mappingStrategy.strategy || 'intelligent_auto', validationScore, mappingStrategy.validationScore || 0.8);
            return valueStreams;
        }
        catch (error) {
            this.performanceTracker.endTimer('map_workflows_to_value_streams');
            ';
            this.logger.error('Workflow to value stream mapping failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Create value stream from workflow context with AI optimization
     */
    async createValueStreamFromWorkflow(workflowId, context) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('create_value_stream');
        ';
        try {
            this.logger.info('Creating optimized value stream from workflow', { ': workflowId,
                complexity: context.complexity,
            });
            // Use brain coordinator for intelligent value stream design
            const streamDesign = await this.brainCoordinator.designValueStream({
                workflowId,
                context,
                designPrinciples: [
                    'customer_centricity',
                    'flow_optimization',
                    'continuous_improvement',
                ],
            });
            // Create value stream with intelligent configuration
            const valueStream = {
                id: `vs-${workflowId}-${Date.now()}`,
            } `
        name: streamDesign.name || `, Value, Stream;
            for ($; { workflowId } `,`; description)
                : streamDesign.description || 'AI-optimized value stream',
                    steps;
            this.createOptimizedFlowSteps(streamDesign, context),
                budget;
            streamDesign.estimatedBudget || 100000,
            ;
        }
        finally // Validate value stream design
         { }
        ;
        // Validate value stream design
        const validation = this.validateValueStreamDesign(valueStream, context);
        if (!validation.isValid && validation.approvalRequired) {
            // Create AGUI task for manual review
            const approval = await this.aguiService.createApprovalTask({
                taskType: 'value_stream_design_review',
                description: `Value stream design requires review: ${validation.issues.length} issues found`,
            } `
          context: { valueStream, validation },
          approvers: ['product-owner', 'solution-architect'],
          timeout: 1800000,
        });

        if (!approval.approved) {
          throw new Error(`, Value, stream, design, rejected, $, { approval, : .reason } `);`);
        }
    }
    // Store mapping for future reference
    mapping = {
        workflowId,
        valueStreamId: valueStream.id,
        mappingType: streamDesign.mappingType || 'direct',
        confidence: streamDesign.confidence || 0.8,
        mappingReason: streamDesign.reason || 'AI-optimized mapping',
        steps: this.createWorkflowStepMappings(workflowId, valueStream),
        validatedAt: new Date(),
    };
}
this.valueStreamMappings.set(workflowId, mapping);
this.validatedMappings.set(valueStream.id, validation);
this.performanceTracker.endTimer('create_value_stream');
';
this.logger.info('Value stream created successfully', { ': workflowId,
    valueStreamId: valueStream.id,
    stepCount: valueStream.steps?.length || 0,
    confidence: mapping.confidence,
});
return valueStream;
try { }
catch (error) {
    this.performanceTracker.endTimer('create_value_stream');
    ';
    this.logger.error('Value stream creation failed:', error);
    ';
    throw error;
}
/**
 * Get mapping insights and recommendations
 */
async;
getMappingInsights(workflowId ?  : string);
Promise < {
    totalMappings: number,
    validMappings: number,
    averageConfidence: number,
    commonMappingPatterns: string[],
    improvementRecommendations: string[],
    validationIssues: MappingValidationIssue[]
} > {
    : .initialized, await, this: .initialize(),
    const: timer = this.performanceTracker.startTimer('mapping_insights'), ': ,
    try: {
        let, mappings: WorkflowValueStreamMapping[],
        let, validations: MappingValidationResult[],
        if(workflowId) {
            const mapping = this.valueStreamMappings.get(workflowId);
            mappings = mapping ? [mapping] : [];
            const validation = this.validatedMappings.get(mapping?.valueStreamId || '', ');
            validations = validation ? [validation] : [];
        }, else: {
            mappings = Array.from(this.valueStreamMappings.values())(),
            validations = Array.from(this.validatedMappings.values())()
        }
        // Use brain coordinator for intelligent analysis
        ,
        // Use brain coordinator for intelligent analysis
        const: insights = await this.brainCoordinator.analyzeMappingInsights({
            mappings,
            validations,
            analysisDepth: 'comprehensive',
        }),
        const: result = {
            totalMappings: mappings.length,
            validMappings: validations.filter((v) => v.isValid).length,
            averageConfidence: insights.averageConfidence || this.calculateAverageConfidence(mappings),
            commonMappingPatterns: insights.patterns || [],
            improvementRecommendations: insights.recommendations || [],
            validationIssues: validations.flatMap((v) => v.issues),
        },
        this: .performanceTracker.endTimer('mapping_insights'), ': this.logger.info('Mapping insights generated', { ': totalMappings, result, : .totalMappings,
            validMappings: result.validMappings,
            averageConfidence: result.averageConfidence,
        }),
        return: result
    }, catch(error) {
        this.performanceTracker.endTimer('mapping_insights');
        ';
        this.logger.error('Failed to generate mapping insights:', error);
        ';
        throw error;
    }
};
/**
 * Shutdown service gracefully
 */
async;
shutdown();
Promise < void  > {
    : .brainCoordinator?.shutdown
};
{
    await this.brainCoordinator.shutdown();
}
if (this.workflowEngine?.shutdown) {
    await this.workflowEngine.shutdown();
}
if (this.aguiService?.shutdown) {
    await this.aguiService.shutdown();
}
this.initialized = false;
this.logger.info('Value Stream Mapping Service shutdown complete');
';
getWorkflowsFromOrchestration(orchestrationManager, MultiLevelOrchestrationManager);
any;
{
    // Extract workflows from orchestration manager
    return {
        program: [], // Would be populated from orchestrationManager
        swarm: [],
        portfolio: [],
    };
}
mapProgramToValueStreams(workflows, any[], strategy, any);
Map < string, ValueStream > {
    // Create program-level value streams
    return: new Map()
};
mapSwarmToValueStreams(workflows, any[], strategy, any);
Map < string, ValueStream > {
    // Create swarm-level value streams
    return: new Map()
};
mapPortfolioToValueStreams(workflows, any[], strategy, any);
Map < string, ValueStream > {
    // Create portfolio-level value streams
    return: new Map()
};
validateMappingsWithAI(valueStreams, (Map), strategy, any);
void {
    // Validate mappings using AI analysis
    this: .logger.debug('Validating value stream mappings with AI', { ': streamCount, valueStreams, : .size,
    })
};
createOptimizedFlowSteps(design, any, context, ValueStreamCreationContext);
any[];
{
    // Create optimized flow steps based on design and context
    return [];
}
createFlowMetrics(design, any, context, ValueStreamCreationContext);
any;
{
    // Create appropriate flow metrics for the value stream
    return {};
}
validateValueStreamDesign(valueStream, ValueStream, context, ValueStreamCreationContext);
MappingValidationResult;
{
    // Validate the value stream design
    return {
        isValid: true,
        validationScore: 0.9,
        issues: [],
        recommendations: [],
        approvalRequired: false,
        validatedAt: new Date(),
    };
}
createWorkflowStepMappings(workflowId, string, valueStream, ValueStream);
WorkflowStepMapping[];
{
    // Create mappings between workflow steps and value stream steps
    return [];
}
calculateAverageConfidence(mappings, WorkflowValueStreamMapping[]);
number;
{
    if (mappings.length === 0)
        return 0;
    const sum = mappings.reduce((acc, mapping) => acc + mapping.confidence, 0);
    return sum / mappings.length;
}
export default ValueStreamMappingService;
