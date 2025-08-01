/**
 * GitHub Integration Plugin
 * Integrates with GitHub API for repository management and CI/CD workflows
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class GitHubIntegrationPlugin extends BasePlugin {
  private octokit: any = null;
  private repositories = new Map();
  private webhookHandlers = new Map();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('GitHub Integration Plugin initialized');
    await this.initializeGitHubClient();
    this.setupWebhookHandlers();
  }

  async onStart(): Promise<void> {
    this.context.logger.info('GitHub Integration Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('GitHub Integration Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    await this.cleanup();
  }

  private async initializeGitHubClient(): Promise<void> {
    const token = this.config.settings?.githubToken || process.env.GITHUB_TOKEN;
    
    if (!token) {
      this.context.logger.warn('No GitHub token provided, some features will be limited');
      return;
    }

    try {
      // Mock Octokit initialization (in real implementation, would use @octokit/rest)
      this.octokit = {
        rest: {
          repos: {
            get: async (params: any) => ({ data: { name: params.repo, owner: { login: params.owner } } }),
            listForAuthenticatedUser: async () => ({ data: [] }),
            createWebhook: async (params: any) => ({ data: { id: Math.random() } }),
            deleteWebhook: async (params: any) => ({ data: {} })
          },
          pulls: {
            list: async (params: any) => ({ data: [] }),
            create: async (params: any) => ({ data: { number: Math.random(), html_url: 'https://github.com/test/pr' } }),
            merge: async (params: any) => ({ data: {} })
          },
          issues: {
            list: async (params: any) => ({ data: [] }),
            create: async (params: any) => ({ data: { number: Math.random(), html_url: 'https://github.com/test/issue' } }),
            update: async (params: any) => ({ data: {} })
          },
          actions: {
            listWorkflowRuns: async (params: any) => ({ data: { workflow_runs: [] } }),
            cancelWorkflowRun: async (params: any) => ({ data: {} })
          }
        }
      };

      this.context.logger.info('GitHub client initialized successfully');
    } catch (error) {
      this.context.logger.error('Failed to initialize GitHub client', error);
      throw error;
    }
  }

  private setupWebhookHandlers(): void {
    this.webhookHandlers.set('push', this.handlePushEvent.bind(this));
    this.webhookHandlers.set('pull_request', this.handlePullRequestEvent.bind(this));
    this.webhookHandlers.set('issues', this.handleIssueEvent.bind(this));
    this.webhookHandlers.set('workflow_run', this.handleWorkflowRunEvent.bind(this));
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    const cacheKey = `${owner}/${repo}`;
    
    if (this.repositories.has(cacheKey)) {
      return this.repositories.get(cacheKey);
    }

    try {
      const response = await this.octokit.rest.repos.get({ owner, repo });
      const repoData = response.data;
      
      this.repositories.set(cacheKey, repoData);
      this.context.logger.info(`Repository data cached for ${cacheKey}`);
      
      return repoData;
    } catch (error) {
      this.context.logger.error(`Failed to get repository ${cacheKey}`, error);
      throw error;
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(owner: string, repo: string, options: {
    title: string;
    head: string;
    base: string;
    body?: string;
    draft?: boolean;
  }): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title: options.title,
        head: options.head,
        base: options.base,
        body: options.body || '',
        draft: options.draft || false
      });

      this.context.logger.info(`Pull request created: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      this.context.logger.error('Failed to create pull request', error);
      throw error;
    }
  }

  /**
   * Create an issue
   */
  async createIssue(owner: string, repo: string, options: {
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
  }): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.issues.create({
        owner,
        repo,
        title: options.title,
        body: options.body || '',
        labels: options.labels || [],
        assignees: options.assignees || []
      });

      this.context.logger.info(`Issue created: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      this.context.logger.error('Failed to create issue', error);
      throw error;
    }
  }

  /**
   * Get workflow runs
   */
  async getWorkflowRuns(owner: string, repo: string, workflowId?: string): Promise<any[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const params: any = { owner, repo };
      if (workflowId) {
        params.workflow_id = workflowId;
      }

      const response = await this.octokit.rest.actions.listWorkflowRuns(params);
      return response.data.workflow_runs;
    } catch (error) {
      this.context.logger.error('Failed to get workflow runs', error);
      throw error;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event: string, payload: any): Promise<void> {
    const handler = this.webhookHandlers.get(event);
    
    if (!handler) {
      this.context.logger.warn(`No handler found for webhook event: ${event}`);
      return;
    }

    try {
      await handler(payload);
      this.emit('webhook-handled', { event, payload });
    } catch (error) {
      this.context.logger.error(`Failed to handle webhook event ${event}`, error);
      this.emit('webhook-error', { event, payload, error });
    }
  }

  private async handlePushEvent(payload: any): Promise<void> {
    this.context.logger.info(`Push event received for ${payload.repository?.full_name}`);
    
    // Emit event for other plugins to handle
    this.emit('github-push', {
      repository: payload.repository,
      commits: payload.commits,
      ref: payload.ref,
      pusher: payload.pusher
    });
  }

  private async handlePullRequestEvent(payload: any): Promise<void> {
    this.context.logger.info(`Pull request ${payload.action} for ${payload.repository?.full_name}`);
    
    this.emit('github-pull-request', {
      action: payload.action,
      repository: payload.repository,
      pullRequest: payload.pull_request,
      sender: payload.sender
    });
  }

  private async handleIssueEvent(payload: any): Promise<void> {
    this.context.logger.info(`Issue ${payload.action} for ${payload.repository?.full_name}`);
    
    this.emit('github-issue', {
      action: payload.action,
      repository: payload.repository,
      issue: payload.issue,
      sender: payload.sender
    });
  }

  private async handleWorkflowRunEvent(payload: any): Promise<void> {
    this.context.logger.info(`Workflow run ${payload.action} for ${payload.repository?.full_name}`);
    
    this.emit('github-workflow-run', {
      action: payload.action,
      repository: payload.repository,
      workflowRun: payload.workflow_run,
      sender: payload.sender
    });
  }

  /**
   * Setup webhook for repository
   */
  async setupWebhook(owner: string, repo: string, webhookUrl: string, events: string[] = ['push', 'pull_request']): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: this.config.settings?.webhookSecret || ''
        },
        events
      });

      this.context.logger.info(`Webhook created for ${owner}/${repo}`);
      return response.data;
    } catch (error) {
      this.context.logger.error(`Failed to create webhook for ${owner}/${repo}`, error);
      throw error;
    }
  }

  /**
   * Get integration capabilities
   */
  getCapabilities(): any {
    return {
      features: [
        'repository-management',
        'pull-request-automation',
        'issue-tracking',
        'webhook-handling',
        'workflow-monitoring',
        'ci-cd-integration'
      ],
      events: Array.from(this.webhookHandlers.keys()),
      authenticated: !!this.octokit
    };
  }

  /**
   * Get integration statistics
   */
  getStats(): any {
    return {
      cachedRepositories: this.repositories.size,
      webhookHandlers: this.webhookHandlers.size,
      authenticated: !!this.octokit
    };
  }

  async cleanup(): Promise<void> {
    this.repositories.clear();
    this.webhookHandlers.clear();
    this.octokit = null;
    this.context.logger.info('GitHub Integration Plugin cleaned up');
  }
}

export default GitHubIntegrationPlugin;