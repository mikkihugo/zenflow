/**
 * @fileoverview API Provider Factory
 * Factory for creating API provider instances (not CLI providers)
 */

import { getLogger } from '@claude-zen/foundation';
import type { APIProvider } from '../types/api-providers';

const logger = getLogger('APIProviderFactory');

export type ApiProviderId =
  | 'github-models-api'
  | 'github-copilot-api'
  | 'anthropic-api'
  | 'openai-api';

interface BaseOptions {
  // Extend over time; keep unknowns generic-safe
  [key: string]: unknown;
}

/** Create an API provider instance */
export async function createAPIProvider(
  providerId: ApiProviderId,
  options: BaseOptions = {}
): Promise<APIProvider> {
  logger.info(`Creating API provider: ${providerId}`);

  switch (providerId) {
    case 'github-models-api': {
      const { GitHubModelsAPI: gitHubModelsApiCtor } = await import(
        '../api/github-models'
      );
      const token = process.env.GITHUB_TOKEN ?? '';
      // GitHubModelsAPI constructor accepts a config object
      return new gitHubModelsApiCtor({ token, ...options });
    }

    case 'github-copilot-api': {
      const { createGitHubCopilotProvider } = await import(
        '../api/github-copilot'
      );
      return createGitHubCopilotProvider(options);
    }

    case 'anthropic-api':
      throw new Error('Anthropic API provider not yet implemented');

    case 'openai-api':
      throw new Error('OpenAI API provider not yet implemented');

    default: {
      const neverId: never = providerId;
      throw new Error(`Unknown API provider: ${String(neverId)}`);
    }
  }
}

/** List available API providers */
export function listAPIProviders(): Array<{
  id: ApiProviderId;
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
