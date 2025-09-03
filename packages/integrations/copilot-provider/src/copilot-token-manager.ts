/**
 * GitHub Copilot Token Manager
 * 
 * Handles the GitHub OAuth token -> Copilot token exchange process
 * based on the VS Code Copilot Chat implementation.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('copilot-token-manager');

interface CopilotTokenResponse {
  token: string;
  expires_at: number;
  refresh_in: number;
  organization_list?: string[];
  chat_enabled?: boolean;
  sku?: string;
  endpoints?: {
    api: string;
    telemetry: string;
    proxy: string;
  };
}

export interface CopilotToken {
  token: string;
  expires_at: number;
  chat_enabled: boolean;
  sku?: string | undefined;
  organizations: string[];
  endpoints?: {
    api: string;
    telemetry: string;
    proxy: string;
  } | undefined;
}

export class CopilotTokenManager {
  private copilotToken: CopilotToken | undefined = undefined;
  private readonly copilotApiUrl = 'https://api.github.com';

  /**
   * Exchange GitHub OAuth token for Copilot token
   */
  async getCopilotToken(githubToken: string, force = false): Promise<CopilotToken> {
    // Return cached token if valid and not forced
    if (!force && this.copilotToken && this.copilotToken.expires_at > Date.now() / 1000 + 300) {
      return this.copilotToken;
    }

    logger.info('Exchanging GitHub token for Copilot token');

    try {
      const response = await fetch(`${this.copilotApiUrl}/copilot_internal/v2/token`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/json',
          'User-Agent': 'GitHubCopilotChat/0.22.4 (claude-zen-compatible)',
          'Editor-Version': 'vscode/1.96.0',
          'Editor-Plugin-Version': 'copilot-chat/0.22.4',
          'Openai-Organization': 'github-copilot',
          'Openai-Intent': 'conversation-panel',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Copilot token exchange failed: ${response.status} ${errorText}`);
        
        if (response.status === 401) {
          throw new Error('GitHub token is invalid or expired');
        } else if (response.status === 403) {
          throw new Error('GitHub Copilot access denied. Please check your Copilot subscription.');
        } else {
          throw new Error(`Copilot token exchange failed: ${response.status}`);
        }
      }

      const tokenData: CopilotTokenResponse = await response.json();
      
      if (!tokenData.token) {
        throw new Error('No Copilot token returned from API');
      }

      // Parse and cache the token
      this.copilotToken = {
        token: tokenData.token,
        expires_at: tokenData.expires_at,
        chat_enabled: tokenData.chat_enabled ?? true,
        sku: tokenData.sku,
        organizations: tokenData.organization_list || [],
        endpoints: tokenData.endpoints
      };

      logger.info(`Successfully obtained Copilot token (expires: ${new Date(tokenData.expires_at * 1000).toISOString()})`);
      return this.copilotToken;

    } catch (error) {
      logger.error('Failed to exchange GitHub token for Copilot token:', error);
      throw error;
    }
  }

  /**
   * Reset the cached token (e.g., after 401 response)
   */
  resetCopilotToken(): void {
    this.copilotToken = undefined;
    logger.debug('Copilot token cache cleared');
  }

  /**
   * Check if we have a valid cached token
   */
  hasCachedToken(): boolean {
    return !!(this.copilotToken && this.copilotToken.expires_at > Date.now() / 1000 + 300);
  }

  /**
   * Get the current token (if cached and valid)
   */
  getCachedToken(): CopilotToken | undefined {
    if (this.hasCachedToken()) {
      return this.copilotToken;
    }
    return undefined;
  }
}