import { CopilotAuth, CopilotChatClient } from '@claude-zen/copilot-provider';
import { GitHubModelsProvider } from '@claude-zen/github-models-provider';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('github-models-setup');

export class GithubModelsSetup {
  private copilotClient?: CopilotChatClient;
  private modelsProvider?: GitHubModelsProvider;
  private githubToken?: string;

  constructor(githubToken?: string) {
    this.githubToken = githubToken;
  }

  /**
   * Initialize GitHub Copilot and Models API clients
   */
  async initialize(): Promise<void> {
    if (!this.githubToken) {
      logger.info('No GitHub token provided, initiating OAuth flow...');
      const auth = new CopilotAuth();
      this.githubToken = await auth.authenticate();
    }

    // Initialize Copilot client (for Copilot-specific features)
    this.copilotClient = new CopilotChatClient(this.githubToken);
    
    // Initialize GitHub Models provider (for models.github.ai)
    this.modelsProvider = new GitHubModelsProvider({
      token: this.githubToken,
      autoInitialize: true
    });
    
    logger.info('GitHub providers initialized successfully');
  }

  /**
   * Get the Copilot client instance
   */
  getCopilotClient(): CopilotChatClient {
    if (!this.copilotClient) {
      throw new Error('GitHub providers not initialized. Call initialize() first.');
    }
    return this.copilotClient;
  }

  /**
   * Get the GitHub Models provider instance
   */
  getModelsProvider(): GitHubModelsProvider {
    if (!this.modelsProvider) {
      throw new Error('GitHub providers not initialized. Call initialize() first.');
    }
    return this.modelsProvider;
  }

  /**
   * Test connection to both Copilot and GitHub Models APIs
   */
  async testConnection(): Promise<{
    copilot: { success: boolean; error?: string };
    models: { success: boolean; models?: string[]; error?: string };
  }> {
    const results = {
      copilot: { success: false, error: undefined as string | undefined },
      models: { success: false, models: undefined as string[] | undefined, error: undefined as string | undefined }
    };

    // Test Copilot
    if (this.copilotClient) {
      try {
        const response = await this.copilotClient.createChatCompletion({
          messages: [{ role: 'user', content: 'Test connection' }],
          max_tokens: 10
        });
        results.copilot.success = !!response.choices[0]?.message?.content;
      } catch (error) {
        results.copilot.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Test GitHub Models
    if (this.modelsProvider) {
      const testResult = await this.modelsProvider.testConnection();
      results.models = testResult.models;
    }

    return results;
  }

  async execute(): Promise<void> {
    await this.initialize();
    
    const testResults = await this.testConnection();
    logger.info('Connection test results:', testResults);
    
    if (!testResults.copilot.success && !testResults.models.success) {
      throw new Error('Failed to connect to both Copilot and GitHub Models APIs');
    }
  }
}
