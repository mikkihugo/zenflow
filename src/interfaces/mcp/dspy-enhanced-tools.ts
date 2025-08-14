/**
 * DSPy-Enhanced MCP Tools.
 *
 * Intelligent MCP tools powered by DSPy for:
 * - Smart project analysis and recommendations
 * - Intelligent code generation and fixes
 * - Automated workflow optimization
 * - Context-aware task orchestration.
 */
/**
 * @file Interface implementation: dspy-enhanced-tools.
 */

import { DSPy, type DSPyProgram } from 'dspy.ts';
import { getLogger } from '../../config/logging-config.ts';

const logger = getLogger('DSPyMCPTools');

export interface MCPToolRequest {
  toolName: string;
  parameters: unknown;
  context?: {
    projectPath?: string;
    userIntent?: string;
    previousActions?: string[];
  };
}

export interface MCPToolResponse {
  success: boolean;
  result: unknown;
  reasoning?: string;
  suggestions?: string[];
  confidence?: number;
  followupActions?: string[];
}

export class DSPyEnhancedMCPTools {
  private dspy: DSPy;
  private programs: Map<string, DSPyProgram> = new Map();
  private toolUsageHistory: Array<{
    tool: string;
    input: unknown;
    output: unknown;
    success: boolean;
    timestamp: Date;
  }> = [];

  constructor() {
    this.dspy = new DSPy({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 2000,
    });

    this.initializeMCPPrograms();
  }

  private async initializeMCPPrograms() {
    // Project Analysis Intelligence
    const projectAnalysisProgram = await this.dspy.createProgram(
      'project_structure: object, user_request: string, context: object -> analysis: string, recommendations: string[], priority_actions: string[], complexity_score: number',
      'Analyze project structure and provide intelligent recommendations based on user intent and context'
    );

    // Code Generation Intelligence
    const codeGenerationProgram = await this.dspy.createProgram(
      'requirements: string, existing_code: string, project_context: object -> generated_code: string, explanation: string, integration_steps: string[], testing_suggestions: string[]',
      'Generate high-quality code that integrates seamlessly with existing project structure'
    );

    // Error Resolution Intelligence
    const errorResolutionProgram = await this.dspy.createProgram(
      'error_details: object, code_context: string, project_info: object -> solution: string, fix_code: string, prevention_tips: string[], confidence: number',
      'Intelligently resolve errors with contextual understanding of the project'
    );

    // Workflow Optimization Intelligence
    const workflowOptimizationProgram = await this.dspy.createProgram(
      'current_workflow: object, user_goals: string, project_constraints: object -> optimized_workflow: object, improvement_suggestions: string[], automation_opportunities: string[]',
      'Optimize development workflows for maximum efficiency and user satisfaction'
    );

    // Task Orchestration Intelligence
    const taskOrchestrationProgram = await this.dspy.createProgram(
      'task_request: string, available_tools: string[], project_state: object -> task_plan: object, tool_sequence: string[], risk_assessment: object, success_prediction: number',
      'Intelligently orchestrate complex tasks using available MCP tools with risk assessment'
    );

    this.programs.set('project_analysis', projectAnalysisProgram);
    this.programs.set('code_generation', codeGenerationProgram);
    this.programs.set('error_resolution', errorResolutionProgram);
    this.programs.set('workflow_optimization', workflowOptimizationProgram);
    this.programs.set('task_orchestration', taskOrchestrationProgram);

    logger.info('DSPy MCP programs initialized successfully');
  }

  /**
   * Enhanced project analysis tool.
   *
   * @param request
   */
  async analyzeProject(request: MCPToolRequest): Promise<MCPToolResponse> {
    const program = this.programs.get('project_analysis');
    if (!program) {
      return this.createErrorResponse('Project analysis program not available');
    }

    try {
      const { projectPath, files, userRequest } = request.parameters;

      const result = await this.dspy.execute(program, {
        project_structure: { projectPath, files: files?.slice(0, 50) }, // Limit for token efficiency
        user_request: userRequest || 'General project analysis',
        context: request.context || {},
      });

      this.recordToolUsage(
        'project_analysis',
        request.parameters,
        result,
        true
      );

      return {
        success: true,
        result: {
          analysis: result?.analysis,
          recommendations: result?.recommendations || [],
          priorityActions: result?.priority_actions || [],
          complexityScore: result?.complexity_score || 50,
        },
        reasoning: result?.reasoning || 'DSPy project analysis applied',
        confidence: result?.confidence || 0.8,
        followupActions: this.generateFollowupActions(result?.priority_actions),
      };
    } catch (error) {
      logger.error('Project analysis failed:', error);
      this.recordToolUsage('project_analysis', request.parameters, null, false);
      return this.createErrorResponse('Project analysis failed', error);
    }
  }

  /**
   * Enhanced code generation tool.
   *
   * @param request
   */
  async generateCode(request: MCPToolRequest): Promise<MCPToolResponse> {
    const program = this.programs.get('code_generation');
    if (!program) {
      return this.createErrorResponse('Code generation program not available');
    }

    try {
      const { requirements, existingCode, fileType } = request.parameters;

      const result = await this.dspy.execute(program, {
        requirements,
        existing_code: existingCode || '',
        project_context: {
          fileType: fileType || 'typescript',
          ...request.context,
        },
      });

      this.recordToolUsage('code_generation', request.parameters, result, true);

      return {
        success: true,
        result: {
          generatedCode: result?.generated_code,
          explanation: result?.explanation,
          integrationSteps: result?.integration_steps || [],
          testingSuggestions: result?.testing_suggestions || [],
        },
        reasoning: 'DSPy intelligent code generation',
        confidence: result?.confidence || 0.85,
        suggestions: result?.optimization_tips || [],
      };
    } catch (error) {
      logger.error('Code generation failed:', error);
      this.recordToolUsage('code_generation', request.parameters, null, false);
      return this.createErrorResponse('Code generation failed', error);
    }
  }

  /**
   * Enhanced error resolution tool.
   *
   * @param request
   */
  async resolveError(request: MCPToolRequest): Promise<MCPToolResponse> {
    const program = this.programs.get('error_resolution');
    if (!program) {
      return this.createErrorResponse('Error resolution program not available');
    }

    try {
      const { errorMessage, fileName, lineNumber, codeContext } =
        request.parameters;

      const result = await this.dspy.execute(program, {
        error_details: {
          message: errorMessage,
          file: fileName,
          line: lineNumber,
          type: this.classifyErrorType(errorMessage),
        },
        code_context: codeContext || '',
        project_info: request.context || {},
      });

      this.recordToolUsage(
        'error_resolution',
        request.parameters,
        result,
        true
      );

      return {
        success: true,
        result: {
          solution: result?.solution,
          fixCode: result?.fix_code,
          preventionTips: result?.prevention_tips || [],
          severity: this.assessErrorSeverity(errorMessage),
        },
        reasoning: result?.explanation || 'DSPy error resolution applied',
        confidence: result?.confidence || 0.75,
        followupActions: ['test-fix', 'validate-solution'],
      };
    } catch (error) {
      logger.error('Error resolution failed:', error);
      this.recordToolUsage('error_resolution', request.parameters, null, false);
      return this.createErrorResponse('Error resolution failed', error);
    }
  }

  /**
   * Enhanced workflow optimization tool.
   *
   * @param request
   */
  async optimizeWorkflow(request: MCPToolRequest): Promise<MCPToolResponse> {
    const program = this.programs.get('workflow_optimization');
    if (!program) {
      return this.createErrorResponse(
        'Workflow optimization program not available'
      );
    }

    try {
      const { currentWorkflow, userGoals, constraints } = request.parameters;

      const result = await this.dspy.execute(program, {
        current_workflow: currentWorkflow || {},
        user_goals: userGoals || 'Improve development efficiency',
        project_constraints: constraints || {},
      });

      this.recordToolUsage(
        'workflow_optimization',
        request.parameters,
        result,
        true
      );

      return {
        success: true,
        result: {
          optimizedWorkflow: result?.optimized_workflow,
          improvementSuggestions: result?.improvement_suggestions || [],
          automationOpportunities: result?.automation_opportunities || [],
          estimatedTimeSaving: this.calculateTimeSaving(
            result?.optimized_workflow
          ),
        },
        reasoning: 'DSPy workflow optimization analysis',
        confidence: result?.confidence || 0.8,
        suggestions: result?.implementation_tips || [],
      };
    } catch (error) {
      logger.error('Workflow optimization failed:', error);
      this.recordToolUsage(
        'workflow_optimization',
        request.parameters,
        null,
        false
      );
      return this.createErrorResponse('Workflow optimization failed', error);
    }
  }

  /**
   * Enhanced task orchestration tool.
   *
   * @param request
   */
  async orchestrateTask(request: MCPToolRequest): Promise<MCPToolResponse> {
    const program = this.programs.get('task_orchestration');
    if (!program) {
      return this.createErrorResponse(
        'Task orchestration program not available'
      );
    }

    try {
      const { taskRequest, availableTools, projectState } = request.parameters;

      const result = await this.dspy.execute(program, {
        task_request: taskRequest,
        available_tools: (availableTools || []).join(', '),
        project_state: projectState || {},
      });

      this.recordToolUsage(
        'task_orchestration',
        request.parameters,
        result,
        true
      );

      return {
        success: true,
        result: {
          taskPlan: result?.task_plan,
          toolSequence: result?.tool_sequence || [],
          riskAssessment: result?.risk_assessment || {},
          successPrediction: result?.success_prediction || 0.7,
          estimatedDuration: this.estimateTaskDuration(
            result?.tool_sequence.length || 1
          ),
        },
        reasoning: 'DSPy task orchestration planning',
        confidence: result?.confidence || 0.8,
        followupActions: ['execute-plan', 'monitor-progress'],
      };
    } catch (error) {
      logger.error('Task orchestration failed:', error);
      this.recordToolUsage(
        'task_orchestration',
        request.parameters,
        null,
        false
      );
      return this.createErrorResponse('Task orchestration failed', error);
    }
  }

  /**
   * Get enhanced tool usage statistics.
   */
  getToolStats() {
    const recentUsage = this.toolUsageHistory.filter(
      (usage) => Date.now() - usage.timestamp.getTime() < 3600000 // Last hour
    );

    const successRate =
      recentUsage.length > 0
        ? recentUsage.filter((usage) => usage.success).length /
          recentUsage.length
        : 0;

    const toolUsageCounts = recentUsage.reduce(
      (acc, usage) => {
        acc[usage.tool] = (acc[usage.tool] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalTools: this.programs.size,
      availableTools: Array.from(this.programs.keys()),
      recentUsage: recentUsage.length,
      successRate: Math.round(successRate * 100),
      popularTools: Object.entries(toolUsageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tool, count]) => ({ tool, count })),
      totalUsageHistory: this.toolUsageHistory.length,
    };
  }

  /**
   * Learn from tool usage outcomes.
   *
   * @param toolName
   * @param parameters
   * @param success
   * @param actualResult
   */
  updateToolOutcome(
    toolName: string,
    parameters: unknown,
    success: boolean,
    actualResult?: unknown
  ) {
    const usage = this.toolUsageHistory.find(
      (u) =>
        u.tool === toolName &&
        JSON.stringify(u.input) === JSON.stringify(parameters) &&
        Date.now() - u.timestamp.getTime() < 300000 // Within last 5 minutes
    );

    if (usage) {
      usage.success = success;
      if (actualResult) {
        usage.output.actual_result = actualResult;
      }

      logger.debug(
        `Updated tool outcome: ${toolName} -> ${success ? 'success' : 'failure'}`
      );

      // Trigger learning update for the specific program
      this.trainProgramFromOutcome(toolName, usage);
    }
  }

  private recordToolUsage(
    tool: string,
    input: unknown,
    output: unknown,
    success: boolean
  ) {
    this.toolUsageHistory.push({
      tool,
      input,
      output,
      success,
      timestamp: new Date(),
    });

    // Keep only last 500 entries
    if (this.toolUsageHistory.length > 500) {
      this.toolUsageHistory = this.toolUsageHistory.slice(-500);
    }
  }

  private async trainProgramFromOutcome(programType: string, usage: unknown) {
    const program = this.programs.get(programType);
    if (program && usage.success) {
      try {
        await this.dspy.addExamples(program, [
          {
            input: usage.input,
            output: usage.output,
          },
        ]);

        await this.dspy.optimize(program, {
          strategy: 'auto',
          maxIterations: 2,
        });

        logger.debug(
          `Training applied to ${programType} from successful outcome`
        );
      } catch (error) {
        logger.warn(`Training failed for ${programType}:`, error);
      }
    }
  }

  private createErrorResponse(
    message: string,
    error?: unknown
  ): MCPToolResponse {
    return {
      success: false,
      result: { error: message, details: error?.message },
      confidence: 0,
      reasoning: 'Error occurred during DSPy tool execution',
    };
  }

  private classifyErrorType(errorMessage: string): string {
    if (errorMessage.includes('Cannot find module')) return 'import-error';
    if (
      errorMessage.includes('Type') &&
      errorMessage.includes('is not assignable')
    )
      return 'type-error';
    if (
      errorMessage.includes('Property') &&
      errorMessage.includes('does not exist')
    )
      return 'property-error';
    if (errorMessage.includes('Syntax')) return 'syntax-error';
    return 'general-error';
  }

  private assessErrorSeverity(
    errorMessage: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (
      errorMessage.includes('Cannot find module') ||
      errorMessage.includes('ReferenceError')
    )
      return 'high';
    if (
      errorMessage.includes('TypeError') ||
      errorMessage.includes('SyntaxError')
    )
      return 'medium';
    if (
      errorMessage.includes('Property') &&
      errorMessage.includes('does not exist')
    )
      return 'medium';
    return 'low';
  }

  private generateFollowupActions(priorityActions: string[]): string[] {
    const followups = ['review-recommendations'];

    if (priorityActions.some((action) => action.includes('test'))) {
      followups.push('run-tests');
    }
    if (priorityActions.some((action) => action.includes('refactor'))) {
      followups.push('plan-refactoring');
    }
    if (priorityActions.some((action) => action.includes('security'))) {
      followups.push('security-audit');
    }

    return followups;
  }

  private calculateTimeSaving(optimizedWorkflow: unknown): string {
    if (!optimizedWorkflow || typeof optimizedWorkflow !== 'object') {
      return 'Unknown';
    }

    const automationCount = optimizedWorkflow.automations?.length || 0;
    const timeSavingMinutes = automationCount * 15; // 15 minutes per automation

    if (timeSavingMinutes < 60) {
      return `${timeSavingMinutes} minutes`;
    }

    const hours = Math.floor(timeSavingMinutes / 60);
    const minutes = timeSavingMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  private estimateTaskDuration(toolCount: number): string {
    const minutes = Math.max(5, toolCount * 3); // 3 minutes per tool minimum

    if (minutes < 60) {
      return `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

export default DSPyEnhancedMCPTools;
