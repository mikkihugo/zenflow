import { getLogger } from '@claude-zen/foundation';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import { getBrainSystem } from '@claude-zen/intelligence';

export interface LLMIntegrationConfig {
  projectPath: string;
  agentRole: string;
  enableOptimization?: boolean;
}

export interface AnalysisRequest {
  task: string;
  context: {
    files: string[];
    errors?: any[];
  };
  requiresFileOperations: boolean;
}

export interface AnalysisResult {
  analysis: string;
  recommendations: string[];
  optimizedPrompt?: string;
  confidence: number;
}

export class LLMIntegrationService {
  private logger = getLogger('LLMIntegrationService');
  private config: LLMIntegrationConfig;
  private brainSystem?: any;
  private databaseSystem?: any;

  constructor(config: LLMIntegrationConfig) {
    this.config = {
      enableOptimization: true,
      ...config,
    };
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.brainSystem = await getBrainSystem();
      this.databaseSystem = await getDatabaseSystem();
      this.logger.info('LLM Integration Service initialized');
    } catch (error) {
      this.logger.warn(
        'Failed to initialize advanced systems, using fallback mode',
        error
      );
    }
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      this.logger.info('Starting analysis', { task: request.task });

      // Use brain system for optimization if available
      let optimizedPrompt: string | undefined;
      if (this.brainSystem && this.config.enableOptimization) {
        const coordinator = this.brainSystem.createCoordinator();
        const optimization = await coordinator.optimizePrompt({
          task: request.task,
          basePrompt: this.buildBasePrompt(request),
          context: { priority: 'high', timeLimit: 30000 },
          qualityRequirement: 0.9,
        });
        optimizedPrompt = optimization.optimizedPrompt;
      }

      // Perform analysis
      const analysis = await this.performAnalysis(request, optimizedPrompt);

      // Store results if database available
      if (this.databaseSystem) {
        await this.storeAnalysisResult(request, analysis);
      }

      return analysis;
    } catch (error) {
      this.logger.error('Analysis failed', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  private buildBasePrompt(request: AnalysisRequest): string {
    return `Analyze ${request.task} for files: ${request.context.files.join(', ')}`;
  }

  private async performAnalysis(
    request: AnalysisRequest,
    optimizedPrompt?: string
  ): Promise<AnalysisResult> {
    // Simulate analysis logic
    const analysis = `Analysis for ${request.task} completed`;
    const recommendations = [
      'Fix TypeScript syntax errors',
      'Update import statements',
      'Validate configuration',
    ];

    return {
      analysis,
      recommendations,
      optimizedPrompt,
      confidence: 0.85,
    };
  }

  private async storeAnalysisResult(
    request: AnalysisRequest,
    result: AnalysisResult
  ): Promise<void> {
    try {
      // Store analysis results in database
      this.logger.debug('Storing analysis result', { task: request.task });
    } catch (error) {
      this.logger.warn('Failed to store analysis result', error);
    }
  }
}

/**
 * Example usage:
 * const llmService = new LLMIntegrationService({
 *   projectPath: process?.cwd(),
 *   agentRole: 'coder'
 * });
 *
 * const result = await llmService.analyze({
 *   task: 'typescript-error-analysis',
 *   context: {
 *     files: ['src/neural/gnn'],
 *     errors: [...]
 *   },
 *   requiresFileOperations: true
 * });
 * // Prompts are automatically optimized using Brain package
 */
