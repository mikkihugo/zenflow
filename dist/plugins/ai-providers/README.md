# AI Providers Plugin

Pluggable AI/LLM provider system with automatic fallback, load balancing, and health monitoring for Claude Zen.

## Supported Providers

### 🎯 Claude Code (Primary)
- **Type**: `claude-code`
- **Description**: High-quality AI assistance via Claude Code integration
- **Features**: Tool use, code generation, complex reasoning
- **Configuration**: Model selection, turn limits, permission modes

### ⚡ Google Gemini (Secondary)  
- **Type**: `google-ai`
- **Description**: Google's Gemini models for fast AI generation
- **Features**: Multimodal, fast inference, good reasoning
- **Models**: `gemini-2.5-flash-latest`, `gemini-2.5-pro-latest`

### 🆓 OpenRouter (Free Alternative)
- **Type**: `openrouter`
- **Description**: Free access to multiple open-source models
- **Features**: Multiple model selection, no API key required for free models
- **Models**: `meta-llama/llama-3.1-8b-instruct:free`, and more

## Features

### 🔄 Automatic Failover
- Seamless fallback when primary provider fails
- Configurable fallback chain with priority ordering
- Provider health monitoring and automatic recovery

### ⚖️ Load Balancing
- Round-robin, least-loaded, or random distribution
- Provider performance tracking
- Automatic provider switching based on availability

### 🏥 Health Monitoring
- Real-time provider health checks
- Error rate tracking and circuit breaking
- Automatic provider recovery

### 🔧 Configuration Management
- JSON-based provider configuration
- Runtime provider switching
- Environment variable support

## Quick Start

```javascript
import { AIProviderPlugin } from './index.js';

const aiProviders = new AIProviderPlugin({
  defaultProvider: 'claude',
  fallbackEnabled: true
});

await aiProviders.initialize();

// Generate text with automatic fallback
const response = await aiProviders.generateText('Explain quantum computing');
console.log(response);

// Get provider statistics
const stats = await aiProviders.getProviderStats();
console.log('Active Provider:', stats.activeProvider);
```

## Configuration

### Default Configuration
```json
{
  "providers": {
    "claude": {
      "enabled": true,
      "priority": 1,
      "type": "claude-code",
      "config": {
        "modelId": "sonnet",
        "maxTurns": 5,
        "permissionMode": "default"
      }
    },
    "google": {
      "enabled": true,
      "priority": 3,
      "type": "google-ai",
      "config": {
        "model": "gemini-2.5-flash-latest",
        "safetySettings": "default"
      }
    },
    "openrouter": {
      "enabled": false,
      "priority": 2,
      "type": "openrouter",
      "config": {
        "baseUrl": "https://openrouter.ai/api/v1",
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "maxTokens": 4000,
        "temperature": 0.7
      }
    }
  },
  "defaultProvider": "claude",
  "fallbackEnabled": true
}
```

### Environment Variables
```bash
# Claude Code (automatically configured)
# No additional environment variables needed

# Google Gemini
GEMINI_API_KEY=your_google_ai_api_key

# OpenRouter (optional for free models)
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Provider Management

### Switch Active Provider
```javascript
await aiProviders.switchProvider('google');
console.log('Switched to Google Gemini');
```

### Enable/Disable Providers
```javascript
// Enable OpenRouter
await aiProviders.enableProvider('openrouter');

// Disable Google temporarily
await aiProviders.disableProvider('google');
```

### Health Checks
```javascript
const health = await aiProviders.runHealthChecks();
console.log('Provider Health:', health);
```

## API Methods

### Text Generation
```javascript
const response = await aiProviders.generateText(prompt, {
  maxTokens: 2000,
  temperature: 0.7,
  modelType: 'pro' // for Google: pro vs flash
});
```

### Embedding Generation
```javascript
const embedding = await aiProviders.generateEmbedding(text);
console.log('Embedding vector:', embedding);
```

### Provider Statistics
```javascript
const stats = await aiProviders.getProviderStats();
console.log({
  active: stats.activeProvider,
  totalProviders: stats.totalProviders,
  fallbackEnabled: stats.fallbackEnabled,
  providers: stats.providers
});
```

## OpenRouter Free Models

Popular free models available on OpenRouter:

### Language Models (Free)
- **Meta Llama 3.1 8B**: `meta-llama/llama-3.1-8b-instruct:free`
- **Mistral 7B**: `mistralai/mistral-7b-instruct:free`
- **Google Gemma 7B**: `google/gemma-7b-it:free`
- **Microsoft Phi-3**: `microsoft/phi-3-mini-128k-instruct:free`

### Usage Example
```javascript
// Switch to specific OpenRouter model
const openrouterProvider = aiProviders.providers.get('openrouter');
if (openrouterProvider) {
  // Get available free models
  const freeModels = await openrouterProvider.instance.getAvailableModels();
  console.log('Free models:', freeModels.map(m => m.id));
}
```

## Advanced Configuration

### Load Balancing
```javascript
const aiProviders = new AIProviderPlugin({
  loadBalancing: true,
  strategy: 'round-robin' // 'least-loaded', 'random'
});
```

### Custom Timeouts
```javascript
const response = await aiProviders.generateText(prompt, {
  timeout: 60000 // 60 seconds
});
```

### Provider-Specific Options
```javascript
// Google-specific model selection
const response = await aiProviders.generateText(prompt, {
  modelType: 'pro' // Uses gemini-2.5-pro-latest
});

// OpenRouter-specific model override  
const response = await aiProviders.generateText(prompt, {
  model: 'meta-llama/llama-3.1-70b-instruct:free'
});
```

## Error Handling

### Graceful Degradation
```javascript
try {
  const response = await aiProviders.generateText(prompt);
  console.log('Success:', response);
} catch (error) {
  if (error.message.includes('All providers failed')) {
    console.error('Complete AI system failure');
    // Implement offline fallback
  } else {
    console.error('Partial failure:', error.message);
    // Individual provider issue
  }
}
```

### Provider-Specific Error Handling
```javascript
// Monitor provider health
setInterval(async () => {
  const health = await aiProviders.runHealthChecks();
  
  for (const [provider, status] of Object.entries(health)) {
    if (!status.healthy) {
      console.warn(`Provider ${provider} is unhealthy:`, status.error);
      
      // Automatic recovery attempt
      if (status.errorCount > 5) {
        await aiProviders.disableProvider(provider);
        console.log(`Disabled unhealthy provider: ${provider}`);
      }
    }
  }
}, 60000); // Check every minute
```

## Integration with Existing Code

### Replacing Current AI Service
```javascript
// Old way (single provider)
import { generateText } from '../ai-service.js';

// New way (multi-provider with fallback)
import { AIProviderPlugin } from '../plugins/ai-providers/index.js';

const aiProviders = new AIProviderPlugin();
await aiProviders.initialize();

// Drop-in replacement
export const generateText = (prompt, options) => 
  aiProviders.generateText(prompt, options);
```

### Plugin Manager Integration
```javascript
// Register with plugin manager
const pluginManager = new PluginManager();
await pluginManager.loadPlugin('ai-providers', AIProviderPlugin);

// Use through plugin manager
const aiPlugin = pluginManager.getPlugin('ai-providers');
const response = await aiPlugin.generateText(prompt);
```

## Performance Optimization

### Caching Responses
```javascript
const cache = new Map();

async function cachedGeneration(prompt, options = {}) {
  const cacheKey = JSON.stringify({ prompt, ...options });
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await aiProviders.generateText(prompt, options);
  cache.set(cacheKey, response);
  
  return response;
}
```

### Concurrent Requests
```javascript
// Process multiple prompts concurrently
const prompts = ['prompt1', 'prompt2', 'prompt3'];
const responses = await Promise.all(
  prompts.map(prompt => aiProviders.generateText(prompt))
);
```

## Troubleshooting

### Common Issues

**Provider Not Available**
- Check environment variables are set correctly
- Verify network connectivity
- Check API key validity

**Fallback Not Working**
- Ensure `fallbackEnabled: true` in configuration
- Check provider priorities are set correctly
- Verify fallback providers are enabled

**High Latency**
- Consider using Google Gemini Flash for faster responses
- Implement request caching for repeated prompts
- Use shorter prompts when possible

**Rate Limiting**
- Implement request queuing
- Add delays between requests
- Use multiple providers for load distribution

## Best Practices

1. **Always Enable Fallback**: Never rely on a single provider
2. **Monitor Health**: Regularly check provider status
3. **Use Appropriate Models**: Flash for speed, Pro for quality
4. **Cache Responses**: Avoid redundant API calls
5. **Handle Errors Gracefully**: Provide fallback responses
6. **Respect Rate Limits**: Implement proper throttling
7. **Secure API Keys**: Use environment variables

## License

MIT License - see LICENSE file for details.