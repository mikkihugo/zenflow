var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { filterMessagesForClaudeCode, runClaudeCode, } from '../../../integrations/claude-code/index.js';
export const claudeCodeModels = {
    sonnet: {
        name: 'Claude Sonnet',
        contextWindow: 200000,
        maxTokens: 8192,
        supportsCaching: true,
        supportsThinking: true,
    },
    opus: {
        name: 'Claude Opus',
        contextWindow: 200000,
        maxTokens: 4096,
        supportsCaching: true,
        supportsThinking: false,
    },
};
export const claudeCodeDefaultModelId = 'sonnet';
export function withRetry(config) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function* (...args) {
            let lastError = null;
            for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
                try {
                    yield* originalMethod.apply(this, args);
                    return;
                }
                catch (error) {
                    lastError = error;
                    if (attempt === config.maxRetries) {
                        throw lastError;
                    }
                    const delay = Math.min(config.baseDelay * 2 ** attempt, config.maxDelay);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
            throw lastError;
        };
        return descriptor;
    };
}
export function filterMessagesForClaudeCode(messages) {
    return messages.map((message) => {
        if (Array.isArray(message.content)) {
            const textContent = message.content.filter((content) => content.type === 'text');
            return {
                ...message,
                content: textContent.length > 0
                    ? textContent
                    : [{ type: 'text', text: 'Empty message' }],
            };
        }
        return message;
    });
}
export class ClaudeCodeHandler {
    options;
    constructor(options) {
        this.options = options;
    }
    async *createMessage(systemPrompt, messages) {
        const filteredMessages = filterMessagesForClaudeCode(messages);
        const claudeProcess = runClaudeCode({
            systemPrompt,
            messages: filteredMessages,
            path: this.options.claudeCodePath,
            modelId: this.getModel().id,
            thinkingBudgetTokens: this.options.thinkingBudgetTokens,
            disableAllTools: !this.options.enableTools,
            allowedTools: this.options.allowedTools,
            disallowedTools: this.options.disallowedTools,
        });
        const usage = {
            type: 'usage',
            inputTokens: 0,
            outputTokens: 0,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
        };
        let isPaidUsage = true;
        for await (const chunk of claudeProcess) {
            if (typeof chunk === 'string') {
                yield {
                    type: 'text',
                    text: chunk,
                };
                continue;
            }
            if (chunk.type === 'system' && chunk.subtype === 'init') {
                isPaidUsage = chunk.apiKeySource !== 'none';
                continue;
            }
            if (chunk.type === 'assistant' && 'message' in chunk) {
                const message = chunk.message;
                if (message.stop_reason !== null) {
                    const content = 'text' in message.content[0] ? message.content[0] : undefined;
                    const isError = content && content.text.startsWith(`API Error`);
                    if (isError) {
                        const errorMessageStart = content.text.indexOf('{');
                        const errorMessage = content.text.slice(errorMessageStart);
                        const error = this.attemptParse(errorMessage);
                        if (!error) {
                            throw new Error(content.text);
                        }
                        if (error.error.message.includes('Invalid model name')) {
                            throw new Error(content.text +
                                `\n\nAPI keys and subscription plans allow different models. Make sure the selected model is included in your plan.`);
                        }
                        throw new Error(errorMessage);
                    }
                }
                for (const content of message.content) {
                    switch (content.type) {
                        case 'text':
                            yield {
                                type: 'text',
                                text: content.text,
                            };
                            break;
                        case 'thinking':
                            yield {
                                type: 'reasoning',
                                reasoning: content.thinking || '',
                            };
                            break;
                        case 'redacted_thinking':
                            yield {
                                type: 'reasoning',
                                reasoning: '[Redacted thinking block]',
                            };
                            break;
                        case 'tool_use':
                            console.error(`tool_use is not supported yet. Received: ${JSON.stringify(content)}`);
                            break;
                    }
                }
                usage.inputTokens += message.usage.input_tokens;
                usage.outputTokens += message.usage.output_tokens;
                usage.cacheReadTokens =
                    (usage.cacheReadTokens || 0) +
                        (message.usage.cache_read_input_tokens || 0);
                usage.cacheWriteTokens =
                    (usage.cacheWriteTokens || 0) +
                        (message.usage.cache_creation_input_tokens || 0);
                continue;
            }
            if (chunk.type === 'result' && 'result' in chunk) {
                usage.totalCost = isPaidUsage ? chunk.total_cost_usd : 0;
                yield usage;
            }
        }
    }
    attemptParse(str) {
        try {
            return JSON.parse(str);
        }
        catch (err) {
            return null;
        }
    }
    getModel() {
        const modelId = this.options.apiModelId;
        if (modelId && modelId in claudeCodeModels) {
            const id = modelId;
            return { id, info: claudeCodeModels[id] };
        }
        return {
            id: claudeCodeDefaultModelId,
            info: claudeCodeModels[claudeCodeDefaultModelId],
        };
    }
    getModels() {
        return {
            object: 'list',
            data: Object.entries(claudeCodeModels).map(([id, info]) => ({
                id,
                object: 'model',
                created: Math.floor(Date.now() / 1000),
                owned_by: 'anthropic',
                name: info.name,
                context_window: info.contextWindow,
                max_tokens: info.maxTokens,
                supports_caching: info.supportsCaching,
                supports_thinking: info.supportsThinking,
            })),
        };
    }
}
__decorate([
    withRetry({
        maxRetries: 4,
        baseDelay: 2000,
        maxDelay: 15000,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Object)
], ClaudeCodeHandler.prototype, "createMessage", null);
//# sourceMappingURL=claude-code-handler.js.map