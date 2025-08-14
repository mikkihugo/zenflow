var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { GoogleGenerativeAI, } from '@google/generative-ai';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
export const geminiModels = {
    'gemini-2.5-pro': {
        name: 'Gemini 2.5 Pro',
        contextWindow: 1000000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsJson: true,
    },
    'gemini-2.5-flash': {
        name: 'Gemini 2.5 Flash',
        contextWindow: 1000000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsJson: true,
    },
    'gemini-1.5-pro': {
        name: 'Gemini 1.5 Pro',
        contextWindow: 2000000,
        maxTokens: 8192,
        supportsStreaming: true,
        supportsJson: true,
    },
};
export const geminiDefaultModelId = 'gemini-2.5-flash';
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
                    const shouldRetry = error instanceof Error &&
                        (error.message.includes('429') ||
                            error.message.includes('5') ||
                            error.message.includes('quota'));
                    if (!shouldRetry) {
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
function convertMessagesToGemini(systemPrompt, messages) {
    const contents = [];
    if (systemPrompt.trim()) {
        contents.push({
            role: 'user',
            parts: [
                {
                    text: `System: ${systemPrompt}\n\nPlease follow the above system instructions for all responses.`,
                },
            ],
        });
        contents.push({
            role: 'model',
            parts: [
                { text: 'I understand. I will follow those system instructions.' },
            ],
        });
    }
    for (const message of messages) {
        const role = message.role === 'assistant' ? 'model' : 'user';
        let text = '';
        if (typeof message.content === 'string') {
            text = message.content;
        }
        else if (Array.isArray(message.content)) {
            text = message.content
                .filter((c) => c.type === 'text')
                .map((c) => c.text)
                .join('\n');
        }
        if (text.trim()) {
            contents.push({
                role,
                parts: [{ text }],
            });
        }
    }
    return contents;
}
export class GeminiHandler {
    genai = null;
    model = null;
    options;
    constructor(options = {}) {
        this.options = {
            modelId: options.modelId || geminiDefaultModelId,
            temperature: options.temperature || 0.1,
            maxTokens: options.maxTokens || 8192,
            enableJson: options.enableJson,
        };
    }
    async loadCredentials() {
        try {
            const credPath = join(homedir(), '.gemini', 'oauth_creds.json');
            const credData = await readFile(credPath, 'utf-8');
            return JSON.parse(credData);
        }
        catch (error) {
            throw new Error(`Failed to load Gemini credentials: ${error instanceof Error ? error.message : error}\n` +
                'Run "gemini" CLI first to authenticate with Google.');
        }
    }
    async initializeClient() {
        if (this.genai && this.model)
            return;
        let apiKey;
        if (this.options.apiKey) {
            apiKey = this.options.apiKey;
        }
        else if (process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY) {
            apiKey =
                process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '';
        }
        else if (process.env.GEMINI_API_KEY) {
            apiKey = process.env.GEMINI_API_KEY;
        }
        else {
            const creds = await this.loadCredentials();
            if (creds.expiry_date && Date.now() > creds.expiry_date) {
                throw new Error('Gemini OAuth token has expired. Run "gemini" CLI to refresh authentication.');
            }
            apiKey = creds.access_token;
        }
        this.genai = new GoogleGenerativeAI(apiKey);
        this.model = this.genai.getGenerativeModel({
            model: this.options.modelId || geminiDefaultModelId,
            generationConfig: {
                temperature: this.options.temperature,
                maxOutputTokens: this.options.maxTokens,
                ...(this.options.enableJson && {
                    responseMimeType: 'application/json',
                }),
            },
        });
    }
    async *createMessage(systemPrompt, messages) {
        await this.initializeClient();
        if (!this.model) {
            throw new Error('Failed to initialize Gemini model');
        }
        const contents = convertMessagesToGemini(systemPrompt, messages);
        try {
            const result = await this.model.generateContentStream({ contents });
            let fullText = '';
            let inputTokens = 0;
            let outputTokens = 0;
            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    fullText += text;
                    yield {
                        type: 'text',
                        text: text,
                    };
                }
            }
            const response = await result.response;
            inputTokens = Math.ceil(contents.reduce((acc, c) => acc + (c.parts[0].text?.length || 0), 0) / 4);
            outputTokens = Math.ceil(fullText.length / 4);
            yield {
                type: 'usage',
                inputTokens,
                outputTokens,
                totalCost: 0,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('API_KEY_INVALID')) {
                throw new Error('Gemini authentication failed. Run "gemini" CLI to re-authenticate.');
            }
            if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
                throw new Error('Gemini rate limit exceeded. Please wait a moment before retrying.');
            }
            if (errorMessage.includes('QUOTA_EXCEEDED')) {
                throw new Error('Gemini quota exceeded. You may have hit daily limits.');
            }
            throw new Error(`Gemini API error: ${errorMessage}`);
        }
    }
    getModel() {
        const modelId = this.options.modelId || geminiDefaultModelId;
        return {
            id: modelId,
            info: geminiModels[modelId],
        };
    }
    getModels() {
        return {
            object: 'list',
            data: Object.entries(geminiModels).map(([id, info]) => ({
                id,
                object: 'model',
                created: Math.floor(Date.now() / 1000),
                owned_by: 'google',
                name: info.name,
                context_window: info.contextWindow,
                max_tokens: info.maxTokens,
                supports_streaming: info.supportsStreaming,
                supports_json: info.supportsJson,
            })),
        };
    }
    async testConnection() {
        try {
            await this.initializeClient();
            if (!this.model)
                return false;
            const result = await this.model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: 'Say "test successful" and nothing else.' }],
                    },
                ],
            });
            const text = result.response.text();
            return text.toLowerCase().includes('test successful');
        }
        catch (error) {
            console.error('Gemini connection test failed:', error);
            return false;
        }
    }
}
__decorate([
    withRetry({
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Object)
], GeminiHandler.prototype, "createMessage", null);
//# sourceMappingURL=gemini-handler.js.map