# @claude-zen/github-models-provider

Enterprise GitHub Models API integration provider for Claude Code Zen.

## Overview

This package provides complete integration with GitHub's Models API (models.github.ai), offering access to various AI models including GPT-4.1, GPT-5, Claude Sonnet 4, Gemini 2.5 Pro, and more through GitHub's official service.

## Features

- **🔐 Standard GitHub Authentication** - Uses regular GitHub OAuth tokens
- **📋 Model Listing** - List all available models from GitHub's catalog
- **💬 Chat Completions** - OpenAI-compatible chat interface (when available)
- **🧪 Connection Testing** - Validate access and test functionality
- **📊 Enterprise Ready** - Full logging and error handling

## Installation

```bash
pnpm add @claude-zen/github-models-provider
```

## Usage

### Basic Setup

```typescript
import { GitHubModelsProvider } from '@claude-zen/github-models-provider';

// Initialize with GitHub token
const provider = new GitHubModelsProvider({
  token: 'gho_your_github_token_here',
  autoInitialize: true
});

// Or manually initialize
const provider = new GitHubModelsProvider();
provider.setToken('gho_your_github_token_here');
await provider.initialize();
```

### List Available Models

```typescript
const models = await provider.listModels();
console.log('Available models:', models.map(m => m.id));

// Output: ['openai/gpt-4.1', 'openai/gpt-5', 'anthropic/claude-sonnet-4', ...]
```

### Test Connection

```typescript
const status = await provider.testConnection();
console.log('Auth valid:', status.auth.valid);
console.log('Models available:', status.models.success);
console.log('Inference working:', status.inference?.success);
```

### Chat Completions (when available)

```typescript
try {
  const response = await provider.createChatCompletion({
    model: 'openai/gpt-4.1',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 100
  });
  
  console.log(response.choices[0].message.content);
} catch (error) {
  // Currently returns 404 - endpoint not fully available yet
  console.log('Chat completions not available yet:', error.message);
}
```

## API Reference

### GitHubModelsProvider

Main provider class for GitHub Models integration.

#### Methods

- `initialize()` - Initialize the provider
- `setToken(token: string)` - Set GitHub OAuth token
- `listModels()` - Get available models
- `createChatCompletion(request)` - Create chat completion
- `createInference(request)` - Try inference endpoint
- `testConnection()` - Test all functionality

### GitHubModelsClient

Low-level client for direct API access.

### GitHubModelsAuth

Authentication management for GitHub tokens.

## Authentication

This provider uses standard GitHub OAuth tokens or personal access tokens. Unlike GitHub Copilot, no special authentication flow is required.

### Required Token Scopes

The exact scopes required for GitHub Models API access may vary. Standard `repo` and `read:user` scopes should be sufficient.

### Getting a Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with appropriate scopes
3. Use the token with this provider

## Current Limitations

- **Chat Completions**: The `/v1/chat/completions` endpoint currently returns 404
- **Inference Endpoint**: The `/inference` endpoint is also not available yet
- **Models Listing**: Only the models listing endpoint is fully functional

This suggests GitHub Models API is still in development/preview phase.

## Enterprise Features

- Full logging via `@claude-zen/foundation`
- TypeScript support with complete type definitions
- Error handling and recovery
- Connection validation and testing
- Configurable API endpoints for enterprise GitHub

## Examples

See the `examples/` directory for complete usage examples including:

- Basic model listing
- Connection testing
- Integration with aichat/aider
- Enterprise deployment patterns

## License

MIT