/**
 * @fileoverview File-Aware AI Engine
 *
 * Main orchestrator that combines codebase analysis with LLM routing
 * to provide intelligent, file-aware AI coding assistance.
 */

import { getLogger } from '@claude-zen/foundation';
import {
  getOptimalProvider,
  LLM_PROVIDER_CONFIG,
} from '@claude-zen/llm-routing';
import type {
  AnalyzedContext,
  FileAwareConfig,
  FileAwareRequest,
  FileAwareResponse,
  FileChange,
} from '../types/index.js';
import { CodebaseAnalyzer } from './codebase-analyzer.js';

const logger = getLogger('file-aware-ai:engine');'

export class FileAwareAIEngine {
  private analyzer: CodebaseAnalyzer;
  private readonly rootPath: string;
  private readonly config: FileAwareConfig;

  constructor(rootPath: string, config?: Partial<FileAwareConfig>) {
    this.rootPath = rootPath;
    this.config = this.mergeWithDefaults(config);
    this.analyzer = new CodebaseAnalyzer(rootPath, this.config);
  }

  /**
   * Initialize the file-aware AI engine
   */
  async initialize(): Promise<void> {
    logger.info('Initializing file-aware AI engine', {'
      rootPath: this.rootPath,
    });
    await this.analyzer.initialize();
    logger.info('File-aware AI engine ready');'
  }

  /**
   * Process a file-aware AI request
   */
  async processRequest(request: FileAwareRequest): Promise<FileAwareResponse> {
    const startTime = Date.now();
    logger.info('Processing file-aware request', {'
      task: request.task,
      files: request.files?.length||0,
      dryRun: request.options?.dryRun,
    });

    try {
      // 1. Analyze context and get relevant files
      const context = await this.analyzer.getRelevantContext(
        request.task,
        request.files,
        request.context?.maxFiles||this.config.context.maxContextSize
      );

      logger.debug('Context analyzed', {'
        relevantFiles: context.relevantFiles.length,
        dependencies: context.dependencies.length,
        complexity: context.complexity,
      });

      // 2. Select optimal LLM provider
      const provider = this.selectProvider(request, context);
      logger.debug('Selected LLM provider', { provider: provider.name });'

      // 3. Prepare context for AI
      const aiContext = await this.prepareAIContext(context, request);

      // 4. Call AI to generate changes
      const changes = await this.generateChanges(aiContext, request, provider);

      // 5. Apply changes if not dry run
      let appliedChanges: FileChange[] = [];
      if (!request.options?.dryRun) {
        appliedChanges = await this.applyChanges(changes, request.options);
      } else {
        appliedChanges = changes;
        logger.info('Dry run - changes not applied');'
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        changes: appliedChanges,
        context,
        metadata: {
          filesAnalyzed: context.relevantFiles.length,
          tokensUsed: 0, // TODO: Track actual token usage
          provider: provider.name,
          model: provider.defaultModel,
          executionTime,
        },
      };
    } catch (error) {
      logger.error('Error processing file-aware request', {'
        error: (error as Error).message,
        task: request.task,
      });

      return {
        success: false,
        changes: [],
        context: {
          relevantFiles: [],
          dependencies: [],
          symbols: [],
          summary: '',
          complexity: 'low',
        },
        metadata: {
          filesAnalyzed: 0,
          tokensUsed: 0,
          provider: 'none',
          model: 'none',
          executionTime: Date.now() - startTime,
        },
        error: (error as Error).message,
      };
    }
  }

  /**
   * Select the optimal LLM provider for the request
   */
  private selectProvider(request: FileAwareRequest, context: AnalyzedContext) {
    const contextLength =
      context.summary.length +
      context.relevantFiles.reduce((sum, file) => sum + file.length, 0);

    const providerNames = getOptimalProvider({
      contentLength: contextLength,
      requiresFileOps: true,
      requiresCodebaseAware: true,
      requiresStructuredOutput: true,
      taskType: 'generation',
    });

    const providerName = providerNames[0]||'copilot;
    const provider = LLM_PROVIDER_CONFIG[providerName];

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);`
    }

    return provider;
  }

  /**
   * Prepare context for AI consumption
   */
  private async prepareAIContext(
    context: AnalyzedContext,
    request: FileAwareRequest
  ): Promise<string> {
    let aiContext = `# Task\n$request.task\n\n`;`

    aiContext += `# Codebase Context\n$context.summary\n\n`;`

    aiContext += `# Relevant Files\n`;`
    for (const filePath of context.relevantFiles) {
      try {
        const fullPath = join(this.rootPath, filePath);
        const content = await fs.readFile(fullPath, 'utf8');'

        aiContext += `## $filePath\n`;`
        aiContext += '```' + this.getFileLanguage(filePath) + '\n';
        aiContext += content;
        aiContext += '\n```\n\n';
      } catch (error) 
        logger.warn('Could not read file for context', { filePath });'
    }

    if (_context._dependencies._length > 0) {
      aiContext += `# Dependencies\n`;`
      for (const dep of context.dependencies) {
        aiContext += `- $dep.from→ $dep.to($dep.type)\n`;`
      }
      aiContext += '\n';
    }

    aiContext += `# Instructions\n`;`
    aiContext += `Please analyze the codebase and implement the requested changes.\n`;`
    aiContext += `Return a JSON response with the following structure:\n`;`
    aiContext += `\n`;`
    aiContext += `  "changes": [\n`;`
    aiContext += `    \n`;`
    aiContext += `      "path": "relative/file/path.ts",\n`;`
    aiContext += `      "type": "modify"|"create"|"delete"|"rename",\n`;`
    aiContext += `      "newContent": "full file content after changes",\n`;`
    aiContext += `      "reasoning": "explanation of why this change was made"\n`;`
    aiContext += `    \n`;`
    aiContext += `  ]\n`;`
    aiContext += `\n`;`

    return aiContext;
  }

  /**
   * Generate changes using AI
   */
  private async generateChanges(
    aiContext: string,
    request: FileAwareRequest,
    provider: any
  ): Promise<FileChange[]> {
    // TODO: Implement actual AI call using the LLM routing system
    // For now, return a mock response
    logger.debug('Generating changes with AI', {'
      provider: provider.name,
      contextLength: aiContext.length,
    });

    // Mock implementation - replace with actual AI call
    const mockChanges: FileChange[] = [
      {
        path: 'example.ts',
        type: 'modify',
        oldContent: '// old content',
        newContent: '// new content based on AI analysis',
        diff: '+ // new content based on AI analysis\n- // old content',
        reasoning: 'Updated based on the requested task: ' + request.task,
      },
    ];

    return mockChanges;
  }

  /**
   * Apply changes to the filesystem
   */
  private async applyChanges(
    changes: FileChange[],
    options?: FileAwareRequest['options']'
  ): Promise<FileChange[]> {
    const appliedChanges: FileChange[] = [];

    logger.info('Applying changes', { count: changes.length });'

    // Create backup if requested
    if (options?.createBackup) {
      await this.createBackup(changes);
    }

    for (const change of changes) {
      try {
        const fullPath = join(this.rootPath, change.path);

        switch (change.type) {
          case 'create':'
          case 'modify':'
            // Ensure directory exists
            await fs.mkdir(dirname(fullPath), { recursive: true });

            // Read old content if file exists
            let oldContent = '';
            try {
              oldContent = await fs.readFile(fullPath, 'utf8');'
            } catch {
              // File doesn't exist - that's ok for create operations'
            }

            // Write new content
            if (change.newContent !== undefined) {
              await fs.writeFile(fullPath, change.newContent, 'utf8');'

              appliedChanges.push({
                ...change,
                oldContent,
              });

              logger.debug('Applied change', {'
                type: change.type,
                path: change.path,
              });
            }
            break;

          case 'delete':'
            await fs.unlink(fullPath);
            appliedChanges.push(change);
            logger.debug('Deleted file', { path: change.path });'
            break;

          case 'rename':'
            // TODO: Implement rename logic
            logger.warn('Rename operation not implemented yet');'
            break;
        }
      } catch (error) {
        logger.error('Error applying change', {'
          change: change.path,
          error: (error as Error).message,
        });
      }
    }

    // Auto-commit if requested
    if (options?.autoCommit) {
      await this.autoCommit(appliedChanges, options.branchName);
    }

    logger.info('Changes applied', { applied: appliedChanges.length });'
    return appliedChanges;
  }

  /**
   * Create backup of files that will be modified
   */
  private async createBackup(changes: FileChange[]): Promise<void> {
    const backupDir = join(
      this.rootPath,
      '.file-aware-ai-backups',
      Date.now().toString()
    );
    await fs.mkdir(backupDir, { recursive: true });

    for (const change of changes) {
      if (change.type === 'modify'||change.type ==='delete') {'
        try {
          const sourcePath = join(this.rootPath, change.path);
          const backupPath = join(backupDir, change.path);

          await fs.mkdir(dirname(backupPath), { recursive: true });
          await fs.copyFile(sourcePath, backupPath);

          logger.debug('Created backup', {'
            file: change.path,
            backup: backupPath,
          });
        } catch (error) {
          logger.warn('Could not create backup', {'
            file: change.path,
            error: (error as Error).message,
          });
        }
      }
    }
  }

  /**
   * Auto-commit changes to git
   */
  private async autoCommit(
    changes: FileChange[],
    branchName?: string
  ): Promise<void> {
    // TODO: Implement git integration
    logger.debug('Auto-commit not implemented yet', {'
      changes: changes.length,
      branchName,
    });
  }

  /**
   * Get programming language for a file path
   */
  private getFileLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();'
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      rs: 'rust',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      md: 'markdown',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      toml: 'toml',
      xml: 'xml',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
    };

    return languageMap[ext||']|||text;
  }

  /**
   * Merge user config with defaults
   */
  private mergeWithDefaults(
    config?: Partial<FileAwareConfig>
  ): FileAwareConfig {
    const defaults: FileAwareConfig = {
      indexing: {
        enabled: true,
        watchFiles: false,
        ignorePatterns: [
          'node_modules/**',
          'dist/**',
          'build/**',
          '.git/**',
          '**/*.log',
          '**/*.tmp',
        ],
        supportedLanguages: [
          'ts',
          'tsx',
          'js',
          'jsx',
          'py',
          'rs',
          'go',
          'java',
        ],
        maxFileSize: 1024 * 1024, // 1MB
      },
      context: {
        defaultStrategy: 'smart',
        maxContextSize: 50, // max files
        compressionEnabled: true,
        cacheEnabled: true,
      },
      safety: {
        requireConfirmation: true,
        createBackups: true,
        maxFilesPerOperation: 20,
        allowedOperations: ['create', 'modify', 'delete', 'rename'],
      },
      git: {
        autoCommit: false,
        createBranches: false,
        commitMessageTemplate: 'AI-generated changes: {{task}}',
      },
    };

    return {
      ...defaults,
      ...config,
      indexing: { ...defaults.indexing, ...config?.indexing },
      context: { ...defaults.context, ...config?.context },
      safety: { ...defaults.safety, ...config?.safety },
      git: { ...defaults.git, ...config?.git },
    };
  }
}
