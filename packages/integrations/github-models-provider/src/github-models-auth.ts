/**
 * GitHub Models Authentication
 * 
 * Handles authentication for GitHub Models API using standard GitHub OAuth tokens.
 * Unlike Copilot, Models API uses standard GitHub personal access tokens or OAuth tokens.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('github-models-auth');

export interface GitHubModelsAuthOptions {
  /**
   * GitHub personal access token or OAuth token
   * Should have appropriate scopes for accessing GitHub Models API
   */
  token?: string;
  
  /**
   * Custom GitHub API base URL (for enterprise)
   */
  githubApiBase?: string;
}

export class GitHubModelsAuth {
  private readonly githubApiBase: string;
  private token?: string;

  constructor(options: GitHubModelsAuthOptions = {}) {
    this.githubApiBase = options.githubApiBase ?? 'https://api.github.com';
    this.token = options.token;
  }

  /**
   * Set the GitHub token
   */
  setToken(token: string): void {
    this.token = token;
    logger.debug('GitHub Models token updated');
  }

  /**
   * Get the current token
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Validate the token by checking GitHub user info
   */
  async validateToken(): Promise<{ valid: boolean; user?: string; error?: string }> {
    if (!this.token) {
      return { valid: false, error: 'No token provided' };
    }

    try {
      logger.debug('Validating GitHub token');
      
      const response = await fetch(`${this.githubApiBase}/user`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Claude-Code-Zen/1.0.0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Token validation failed: ${response.status} ${errorText}`);
        return { 
          valid: false, 
          error: `Token validation failed: ${response.status}` 
        };
      }

      const user = await response.json();
      logger.debug(`Token valid for user: ${user.login}`);
      
      return { 
        valid: true, 
        user: user.login 
      };
    } catch (error) {
      logger.error('Token validation error:', error);
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user has access to GitHub Models API
   * Note: This is a placeholder - GitHub Models API access requirements may vary
   */
  async checkModelsAccess(): Promise<{ hasAccess: boolean; error?: string }> {
    if (!this.token) {
      return { hasAccess: false, error: 'No token provided' };
    }

    try {
      logger.debug('Checking GitHub Models API access');
      
      // Try to access the models endpoint
      const response = await fetch('https://models.github.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Claude-Code-Zen/1.0.0'
        }
      });

      if (response.ok) {
        logger.debug('User has access to GitHub Models API');
        return { hasAccess: true };
      } else if (response.status === 401) {
        return { hasAccess: false, error: 'Unauthorized - invalid token' };
      } else if (response.status === 403) {
        return { hasAccess: false, error: 'Forbidden - no access to GitHub Models API' };
      } else {
        return { hasAccess: false, error: `Access check failed: ${response.status}` };
      }
    } catch (error) {
      logger.error('Models access check error:', error);
      return { 
        hasAccess: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get authentication headers for GitHub Models API
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error('No GitHub token available');
    }

    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Claude-Code-Zen/1.0.0'
    };
  }
}

export default GitHubModelsAuth;