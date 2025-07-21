/**
 * Claude API client for Claude-Flow
 * Provides direct integration with Claude's API including temperature and model selection
 */
import { EventEmitter } from 'events';
import { getErrorMessage } from '../utils/error-handler.js';
export class ClaudeAPIClient extends EventEmitter {
    constructor(logger, configManager, config) {
        super();
        this.defaultModel = 'claude-3-sonnet-20240229';
        this.defaultTemperature = 0.7;
        this.defaultMaxTokens = 4096;
        this.logger = logger;
        this.configManager = configManager;
        // Load config from environment and merge with provided config
        this.config = this.loadConfiguration(config);
    }
    /**
     * Load configuration from various sources
     */
    loadConfiguration(overrides) {
        // Start with defaults
        const config = {
            apiKey: '',
            apiUrl: 'https://api.anthropic.com/v1/messages',
            model: this.defaultModel,
            temperature: this.defaultTemperature,
            maxTokens: this.defaultMaxTokens,
            topP: 1,
            topK: undefined,
            systemPrompt: undefined,
            timeout: 60000, // 60 seconds
            retryAttempts: 3,
            retryDelay: 1000,
        };
        // Load from environment variables
        if (process.env.ANTHROPIC_API_KEY) {
            config.apiKey = process.env.ANTHROPIC_API_KEY;
        }
        if (process.env.CLAUDE_API_URL) {
            config.apiUrl = process.env.CLAUDE_API_URL;
        }
        if (process.env.CLAUDE_MODEL) {
            config.model = process.env.CLAUDE_MODEL;
        }
        if (process.env.CLAUDE_TEMPERATURE) {
            config.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE);
        }
        if (process.env.CLAUDE_MAX_TOKENS) {
            config.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS, 10);
        }
        // Load from config manager if available
        const claudeConfig = this.configManager.get('claude');
        if (claudeConfig) {
            Object.assign(config, claudeConfig);
        }
        // Apply overrides
        if (overrides) {
            Object.assign(config, overrides);
        }
        // Validate configuration
        this.validateConfiguration(config);
        return config;
    }
    /**
     * Validate configuration settings
     */
    validateConfiguration(config) {
        if (!config.apiKey) {
            throw new Error('Claude API key is required. Set ANTHROPIC_API_KEY environment variable.');
        }
        if (config.temperature !== undefined) {
            if (config.temperature < 0 || config.temperature > 1) {
                throw new Error('Temperature must be between 0 and 1');
            }
        }
        if (config.topP !== undefined) {
            if (config.topP < 0 || config.topP > 1) {
                throw new Error('Top-p must be between 0 and 1');
            }
        }
        if (config.maxTokens !== undefined && (config.maxTokens < 1 || config.maxTokens > 100000)) {
            throw new Error('Max tokens must be between 1 and 100000');
        }
    }
    /**
     * Update configuration dynamically
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.validateConfiguration(this.config);
        this.logger.info('Claude API configuration updated', {
            model: this.config.model,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens
        });
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Send a message to Claude API
     */
    async sendMessage(messages, options) {
        const request = {
            model: options?.model || this.config.model,
            messages,
            system: options?.systemPrompt || this.config.systemPrompt,
            max_tokens: options?.maxTokens || this.config.maxTokens,
            temperature: options?.temperature ?? this.config.temperature,
            top_p: this.config.topP,
            top_k: this.config.topK,
            stream: options?.stream || false,
        };
        this.logger.debug('Sending Claude API request', {
            model: request.model,
            temperature: request.temperature,
            maxTokens: request.max_tokens,
            messageCount: messages.length,
            stream: request.stream,
        });
        if (request.stream) {
            return this.streamRequest(request);
        }
        else {
            return this.sendRequest(request);
        }
    }
    /**
     * Send a non-streaming request
     */
    async sendRequest(request) {
        let lastError;
        for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), this.config.timeout);
                const response = await fetch(this.config.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01',
                        'x-api-key': this.config.apiKey,
                    },
                    body: JSON.stringify(request),
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`Claude API error (${response.status}): ${error}`);
                }
                const data = await response.json();
                this.logger.info('Claude API response received', {
                    model: data.model,
                    inputTokens: data.usage.input_tokens,
                    outputTokens: data.usage.output_tokens,
                    stopReason: data.stop_reason,
                });
                this.emit('response', data);
                return data;
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Claude API request failed (attempt ${attempt + 1}/${this.config.retryAttempts})`, {
                    error: getErrorMessage(error),
                });
                if (attempt < this.config.retryAttempts - 1) {
                    await this.delay(this.config.retryDelay * Math.pow(2, attempt));
                }
            }
        }
        this.emit('error', lastError);
        throw lastError;
    }
    /**
     * Send a streaming request
     */
    async *streamRequest(request) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeout * 2); // Double timeout for streaming
        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01',
                    'x-api-key': this.config.apiKey,
                },
                body: JSON.stringify({ ...request, stream: true }),
                signal: controller.signal,
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Claude API error (${response.status}): ${error}`);
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]')
                            continue;
                        try {
                            const event = JSON.parse(data);
                            this.emit('stream_event', event);
                            yield event;
                        }
                        catch (e) {
                            this.logger.warn('Failed to parse stream event', { data, error: e });
                        }
                    }
                }
            }
        }
        finally {
            clearTimeout(timeout);
        }
    }
    /**
     * Helper method for simple completions
     */
    async complete(prompt, options) {
        const messages = [{ role: 'user', content: prompt }];
        const response = await this.sendMessage(messages, options);
        return response.content[0].text;
    }
    /**
     * Helper method for streaming completions
     */
    async *streamComplete(prompt, options) {
        const messages = [{ role: 'user', content: prompt }];
        const stream = await this.sendMessage(messages, { ...options, stream: true });
        for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta?.text) {
                yield event.delta.text;
            }
        }
    }
    /**
     * Get available models
     */
    getAvailableModels() {
        return [
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            'claude-2.1',
            'claude-2.0',
            'claude-instant-1.2',
        ];
    }
    /**
     * Get model information
     */
    getModelInfo(model) {
        const modelInfo = {
            'claude-3-opus-20240229': {
                name: 'Claude 3 Opus',
                contextWindow: 200000,
                description: 'Most capable model, best for complex tasks',
            },
            'claude-3-sonnet-20240229': {
                name: 'Claude 3 Sonnet',
                contextWindow: 200000,
                description: 'Balanced performance and speed',
            },
            'claude-3-haiku-20240307': {
                name: 'Claude 3 Haiku',
                contextWindow: 200000,
                description: 'Fastest model, best for simple tasks',
            },
            'claude-2.1': {
                name: 'Claude 2.1',
                contextWindow: 200000,
                description: 'Previous generation, enhanced capabilities',
            },
            'claude-2.0': {
                name: 'Claude 2.0',
                contextWindow: 100000,
                description: 'Previous generation model',
            },
            'claude-instant-1.2': {
                name: 'Claude Instant 1.2',
                contextWindow: 100000,
                description: 'Fast, cost-effective model',
            },
        };
        return modelInfo[model] || {
            name: model,
            contextWindow: 100000,
            description: 'Unknown model',
        };
    }
    /**
     * Delay helper for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
