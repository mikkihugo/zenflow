/**
 * @fileoverview API Provider Factory
 *
 * Factory for creating API provider instances (not CLI providers)
 * Handles GitHub Copilot, GitHub Models, OpenAI, Anthropic, etc.
 */

import { getLogger } from '@claude-zen/foundation/logging';

import type { APIProvider } from '../types/api-providers';

const logger = getLogger('APIProviderFactory');'

/**
 * Create an API provider instance
 */
export async function createAPIProvider(
  providerId: 
    | 'github-models-api''
    | 'github-copilot-api''
    | 'anthropic-api''
    | 'openai-api',
  options: Record<string, unknown> = {}
): Promise<APIProvider> {
  logger.info(`Creating API provider: ${providerId}`);`

  switch (providerId) {
    case 'github-models-api':'
      const { GitHubModelsAPI } = await import('../api/github-models');'
      return new GitHubModelsAPI({
        token: process.env.GITHUB_TOKEN || '',
        ...options,
      } as any);

    case 'github-copilot-api':'
      const { createGitHubCopilotProvider } = await import(
        '../api/github-copilot''
      );
      return createGitHubCopilotProvider(options as any);

    case 'anthropic-api':'
      throw new Error('Anthropic API provider not yet implemented');'

    case 'openai-api':'
      throw new Error('OpenAI API provider not yet implemented');'

    default:
      throw new Error(`Unknown API provider: ${providerId}`);`
  }
}

/**
 * List available API providers
 */
export function listAPIProviders(): Array<{
  id: string;
  name: string;
  available: boolean;
  description: string;
}> {
  return [
    {
      id: 'github-models-api',
      name: 'GitHub Models API',
      available: true,
      description: 'Access to GitHub Models marketplace',
    },
    {
      id: 'github-copilot-api',
      name: 'GitHub Copilot Chat API',
      available: true,
      description: 'GitHub Copilot conversational AI',
    },
    {
      id: 'anthropic-api',
      name: 'Anthropic API',
      available: false,
      description: 'Direct Anthropic Claude API',
    },
    {
      id: 'openai-api',
      name: 'OpenAI API',
      available: false,
      description: 'Direct OpenAI GPT API',
    },
  ];
}
