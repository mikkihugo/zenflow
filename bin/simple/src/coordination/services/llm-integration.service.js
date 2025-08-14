import { AzureKeyCredential } from '@azure/core-auth';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { getOptimalProvider, LLM_PROVIDER_CONFIG, } from '../../config/llm-providers.config.js';
const execAsync = promisify(spawn);
export class LLMIntegrationService {
    config;
    sessionId;
    rateLimitTracker = new Map();
    copilotProvider = null;
    geminiHandler = null;
    static JSON_SCHEMAS = {
        'domain-analysis': {
            name: 'Domain_Analysis_Schema',
            description: 'Analyzes software domain relationships and cohesion scores',
            strict: true,
            schema: {
                type: 'object',
                properties: {
                    domainAnalysis: {
                        type: 'object',
                        properties: {
                            enhancedRelationships: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        from: { type: 'string' },
                                        to: { type: 'string' },
                                        strength: { type: 'number', minimum: 0, maximum: 1 },
                                        type: { type: 'string' },
                                        reasoning: { type: 'string' },
                                    },
                                    required: ['from', 'to', 'strength', 'type', 'reasoning'],
                                },
                            },
                            cohesionScores: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        domain: { type: 'string' },
                                        score: { type: 'number', minimum: 0, maximum: 1 },
                                        factors: { type: 'array', items: { type: 'string' } },
                                    },
                                    required: ['domain', 'score', 'factors'],
                                },
                            },
                            crossDomainInsights: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        insight: { type: 'string' },
                                        impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                                        recommendation: { type: 'string' },
                                    },
                                    required: ['insight', 'impact', 'recommendation'],
                                },
                            },
                        },
                        required: [
                            'enhancedRelationships',
                            'cohesionScores',
                            'crossDomainInsights',
                        ],
                    },
                    architectureRecommendations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                area: { type: 'string' },
                                recommendation: { type: 'string' },
                                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                            },
                            required: ['area', 'recommendation', 'priority'],
                        },
                    },
                    summary: { type: 'string' },
                },
                required: ['domainAnalysis', 'architectureRecommendations', 'summary'],
            },
        },
        'typescript-error-analysis': {
            name: 'TypeScript_Error_Analysis_Schema',
            description: 'Analyzes and provides fixes for TypeScript compilation errors',
            strict: true,
            schema: {
                type: 'object',
                properties: {
                    errorAnalysis: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                file: { type: 'string' },
                                error: { type: 'string' },
                                rootCause: { type: 'string' },
                                severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                                fix: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        code: { type: 'string' },
                                        imports: { type: 'array', items: { type: 'string' } },
                                        explanation: { type: 'string' },
                                    },
                                    required: ['description', 'code', 'explanation'],
                                },
                            },
                            required: ['file', 'error', 'rootCause', 'severity', 'fix'],
                        },
                    },
                    preventionStrategies: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                strategy: { type: 'string' },
                                implementation: { type: 'string' },
                                benefit: { type: 'string' },
                            },
                            required: ['strategy', 'implementation', 'benefit'],
                        },
                    },
                    summary: { type: 'string' },
                },
                required: ['errorAnalysis', 'preventionStrategies', 'summary'],
            },
        },
    };
    constructor(config) {
        const defaultProvider = config.preferredProvider || 'github-models';
        this.config = {
            preferredProvider: defaultProvider,
            debug: false,
            model: this.getDefaultModel(defaultProvider),
            temperature: 0.1,
            maxTokens: defaultProvider === 'github-models' ? 128000 : 200000,
            rateLimitCooldown: 60 * 60 * 1000,
            githubToken: process.env.GITHUB_TOKEN,
            ...config,
        };
        this.sessionId = config.sessionId || uuidv4();
        if (this.config.githubToken) {
            try {
                this.copilotProvider = new CopilotApiProvider({
                    githubToken: this.config.githubToken,
                    accountType: 'enterprise',
                    verbose: this.config.debug,
                });
            }
            catch (error) {
                if (this.config.debug) {
                    console.log('⚠️ Copilot provider initialization failed:', error.message);
                }
            }
        }
        try {
            this.geminiHandler = new GeminiHandler({
                modelId: this.config.model?.includes('gemini')
                    ? this.config.model
                    : 'gemini-2.5-flash',
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                enableJson: false,
            });
            if (this.config.debug) {
                console.log('✅ Gemini handler initialized (Flash model for regular tasks)');
            }
        }
        catch (error) {
            if (this.config.debug) {
                console.log('⚠️ Gemini handler initialization failed:', error.message);
            }
        }
    }
    getDefaultModel(provider) {
        const config = LLM_PROVIDER_CONFIG[provider];
        return config?.defaultModel || 'sonnet';
    }
    async analyze(request) {
        const startTime = Date.now();
        try {
            const contextLength = (request.prompt || this.buildPrompt(request))
                .length;
            const optimalProviders = getOptimalProvider({
                contentLength: contextLength,
                requiresFileOps: request.requiresFileOperations,
                requiresCodebaseAware: request.task === 'domain-analysis' || request.task === 'code-review',
                requiresStructuredOutput: true,
                taskType: request.task === 'custom' ? 'custom' : 'analysis',
            });
            if (this.config.debug) {
                console.log(`🧪 Smart Routing Analysis:`);
                console.log(`  - Context size: ${contextLength} characters`);
                console.log(`  - Optimal providers: ${optimalProviders.join(' → ')}`);
                console.log(`  - Preferred provider: ${this.config.preferredProvider}`);
            }
            const providersToTry = this.config.preferredProvider &&
                optimalProviders.includes(this.config.preferredProvider)
                ? [
                    this.config.preferredProvider,
                    ...optimalProviders.filter((p) => p !== this.config.preferredProvider),
                ]
                : optimalProviders;
            for (const provider of providersToTry) {
                try {
                    let result;
                    switch (provider) {
                        case 'claude-code':
                            result = await this.analyzeWithClaudeCode(request);
                            break;
                        case 'github-models':
                            if (this.isInCooldown('github-models')) {
                                continue;
                            }
                            result = await this.analyzeWithGitHubModelsAPI(request);
                            break;
                        case 'copilot':
                            if (this.copilotProvider) {
                                result = await this.analyzeWithCopilot(request);
                            }
                            else {
                                continue;
                            }
                            break;
                        case 'gemini-direct':
                            if (this.geminiHandler && !this.isInCooldown('gemini-direct')) {
                                result = await this.analyzeWithGeminiDirect(request);
                            }
                            else {
                                continue;
                            }
                            break;
                        case 'gemini-pro':
                            if (this.geminiHandler && !this.isInCooldown('gemini-direct')) {
                                result = await this.analyzeWithGeminiPro(request);
                            }
                            else {
                                continue;
                            }
                            break;
                        case 'gemini':
                            result = await this.analyzeWithGemini(request);
                            break;
                        default:
                            continue;
                    }
                    return {
                        ...result,
                        provider: provider,
                        executionTime: Date.now() - startTime,
                    };
                }
                catch (error) {
                    if (this.config.debug) {
                        console.log(`⚠️ ${provider} failed, trying next provider:`, error.message);
                    }
                }
            }
            if (this.config.debug) {
                console.log('🔄 Smart routing exhausted, falling back to legacy selection');
            }
            if (this.config.preferredProvider === 'claude-code') {
                try {
                    const result = await this.analyzeWithClaudeCode(request);
                    return {
                        ...result,
                        provider: 'claude-code',
                        executionTime: Date.now() - startTime,
                    };
                }
                catch (error) {
                    if (this.config.debug) {
                        console.log('Claude Code unavailable, falling back to Gemini:', error);
                    }
                }
            }
            if (this.config.preferredProvider === 'github-models') {
                if (!this.isInCooldown('github-models')) {
                    try {
                        const result = await this.analyzeWithGitHubModelsAPI(request);
                        return {
                            ...result,
                            provider: 'github-models',
                            executionTime: Date.now() - startTime,
                        };
                    }
                    catch (error) {
                        if (this.config.debug) {
                            console.log('GitHub Models API unavailable, falling back to next provider:', error);
                        }
                    }
                }
                else if (this.config.debug) {
                    console.log(`GitHub Models API in cooldown for ${this.getCooldownRemaining('github-models')} minutes`);
                }
            }
            if (this.config.preferredProvider === 'copilot' && this.copilotProvider) {
                try {
                    const result = await this.analyzeWithCopilot(request);
                    return {
                        ...result,
                        provider: 'copilot',
                        executionTime: Date.now() - startTime,
                    };
                }
                catch (error) {
                    if (this.config.debug) {
                        console.log('GitHub Copilot API unavailable, falling back to Gemini:', error);
                    }
                }
            }
            try {
                const result = await this.analyzeWithGemini(request);
                return {
                    ...result,
                    provider: 'gemini',
                    executionTime: Date.now() - startTime,
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes('cooldown')) {
                    if (this.config.debug) {
                        console.log('Gemini in cooldown, trying fallback providers');
                    }
                    if (this.copilotProvider) {
                        try {
                            if (this.config.debug) {
                                console.log('Trying GitHub Copilot as fallback');
                            }
                            const result = await this.analyzeWithCopilot(request);
                            return {
                                ...result,
                                provider: 'copilot',
                                executionTime: Date.now() - startTime,
                            };
                        }
                        catch (copilotError) {
                            if (this.config.debug) {
                                console.log('Copilot fallback failed, trying GPT-5:', copilotError);
                            }
                        }
                    }
                    if (this.isInCooldown('github-models')) {
                        throw new Error(`All providers in cooldown. Gemini: ${this.getCooldownRemaining('gemini')}min, GitHub Models: ${this.getCooldownRemaining('github-models')}min`);
                    }
                    try {
                        const originalProvider = this.config.preferredProvider;
                        const originalModel = this.config.model;
                        this.config.preferredProvider = 'github-models';
                        this.config.model = 'openai/gpt-5';
                        const result = await this.analyzeWithGitHubModelsAPI(request);
                        this.config.preferredProvider = originalProvider;
                        this.config.model = originalModel;
                        return {
                            ...result,
                            provider: 'github-models',
                            executionTime: Date.now() - startTime,
                        };
                    }
                    catch (gpt5Error) {
                        throw new Error(`All providers failed. Gemini: ${errorMessage}, GPT-5: ${gpt5Error}`);
                    }
                }
                throw error;
            }
        }
        catch (error) {
            return {
                success: false,
                data: null,
                provider: this.config.preferredProvider || 'claude-code',
                executionTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async analyzeWithClaudeCode(request) {
        const prompt = `${this.buildPrompt(request)}

IMPORTANT: Respond with valid JSON format only. Do not include markdown code blocks or explanations outside the JSON.`;
        const args = [
            '--print',
            '--output-format',
            'json',
            '--model',
            this.config.model || 'sonnet',
            '--add-dir',
            this.config.projectPath,
            '--session-id',
            this.sessionId,
        ];
        if (request.requiresFileOperations) {
            args.push('--dangerously-skip-permissions');
        }
        if (this.config.debug) {
            args.push('--debug');
        }
        args.push(prompt);
        const result = await this.executeCommand('claude', args);
        let parsedData;
        try {
            parsedData = JSON.parse(result.stdout);
        }
        catch (jsonError) {
            const jsonMatch = result.stdout.match(/```json\n([\s\S]*?)\n```/) ||
                result.stdout.match(/```\n([\s\S]*?)\n```/) ||
                result.stdout.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                }
                catch {
                    if (this.config.debug) {
                        console.warn('Claude Code returned non-JSON response, falling back to text');
                    }
                    parsedData = {
                        rawResponse: result.stdout,
                        note: 'Response was not in requested JSON format',
                    };
                }
            }
            else {
                parsedData = {
                    rawResponse: result.stdout,
                    note: 'Response was not in requested JSON format',
                };
            }
        }
        return {
            success: result.exitCode === 0,
            data: parsedData,
            outputFile: request.outputPath,
        };
    }
    async analyzeWithGitHubModelsAPI(request) {
        if (!this.config.githubToken) {
            throw new Error('GitHub token required for GitHub Models API access. Set GITHUB_TOKEN environment variable.');
        }
        const systemPrompt = this.buildSystemPrompt(request);
        const userPrompt = this.buildPrompt(request);
        const model = this.config.model || 'openai/gpt-5';
        const client = ModelClient('https://models.github.ai/inference', new AzureKeyCredential(this.config.githubToken));
        try {
            const requestBody = {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                model: model,
                max_completion_tokens: this.config.maxTokens || 128000,
            };
            const jsonSchema = request.jsonSchema || LLMIntegrationService.JSON_SCHEMAS[request.task];
            if (jsonSchema && this.config.debug) {
                console.log('JSON schema available for task:', jsonSchema.name, '- using prompt-based JSON instead');
            }
            const response = await client.path('/chat/completions').post({
                body: requestBody,
            });
            if (isUnexpected(response)) {
                throw new Error(`GitHub Models API error: ${JSON.stringify(response.body.error)}`);
            }
            const content = response.body.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content received from GitHub Models API');
            }
            let parsedData;
            try {
                parsedData = JSON.parse(content);
            }
            catch (jsonError) {
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                    content.match(/```\n([\s\S]*?)\n```/) ||
                    content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                    }
                    catch {
                        if (this.config.debug) {
                            console.warn('GitHub Models returned non-JSON response despite request');
                        }
                        parsedData = {
                            rawResponse: content,
                            note: 'Response was not in requested JSON format',
                        };
                    }
                }
                else {
                    parsedData = {
                        rawResponse: content,
                        note: 'Response was not in requested JSON format',
                    };
                }
            }
            return {
                success: true,
                data: parsedData,
                outputFile: request.outputPath,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('429') ||
                errorMessage.includes('rate limit') ||
                errorMessage.includes('quota') ||
                errorMessage.includes('too many requests')) {
                this.rateLimitTracker.set('github-models', Date.now());
                if (this.config.debug) {
                    console.log('GitHub Models rate limit detected');
                }
                throw new Error('GitHub Models quota exceeded. Try again later.');
            }
            throw error;
        }
    }
    async analyzeWithCopilot(request) {
        if (!this.copilotProvider) {
            throw new Error('Copilot provider not initialized. Requires GitHub token.');
        }
        const systemPrompt = this.buildSystemPrompt(request);
        const userPrompt = request.prompt || this.buildPrompt(request);
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];
        if (this.config.debug) {
            console.log('🤖 Using GitHub Copilot API (Enterprise)...');
            console.log('  - Model:', this.config.model || 'gpt-4.1');
            console.log('  - Account Type: Enterprise');
            console.log('  - Context size:', userPrompt.length, 'characters');
        }
        try {
            const response = await this.copilotProvider.createChatCompletion({
                messages,
                model: this.config.model || 'gpt-4.1',
                max_tokens: this.config.maxTokens || 16000,
                temperature: this.config.temperature || 0.1,
            });
            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response from Copilot API');
            }
            let parsedData = content;
            try {
                const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                    content.match(/\{[\s\S]*\}/) || [null, content];
                if (jsonMatch && jsonMatch[1]) {
                    parsedData = JSON.parse(jsonMatch[1].trim());
                }
                else if (content.trim().startsWith('{') &&
                    content.trim().endsWith('}')) {
                    parsedData = JSON.parse(content.trim());
                }
            }
            catch (parseError) {
                if (this.config.debug) {
                    console.log('⚠️ Copilot response not valid JSON, using raw content');
                }
                parsedData = { analysis: content };
            }
            if (this.config.debug) {
                console.log('✅ Copilot analysis complete!');
                console.log('  - Response length:', content.length, 'characters');
                console.log('  - Parsed as JSON:', typeof parsedData === 'object');
            }
            return {
                success: true,
                data: parsedData,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (this.config.debug) {
                console.error('❌ Copilot API error:', errorMessage);
            }
            if (errorMessage.includes('401') || errorMessage.includes('403')) {
                throw new Error('Copilot authentication failed. Check GitHub token permissions.');
            }
            if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
                throw new Error('Copilot rate limit exceeded. Enterprise account should have high limits.');
            }
            throw error;
        }
    }
    async analyzeWithGemini(request) {
        const rateLimitKey = 'gemini';
        const lastRateLimit = this.rateLimitTracker.get(rateLimitKey);
        const cooldownPeriod = this.config.rateLimitCooldown || 60 * 60 * 1000;
        if (lastRateLimit && Date.now() - lastRateLimit < cooldownPeriod) {
            const remainingTime = Math.ceil((cooldownPeriod - (Date.now() - lastRateLimit)) / (60 * 1000));
            throw new Error(`Gemini in rate limit cooldown. Try again in ${remainingTime} minutes.`);
        }
        const prompt = `${this.buildPrompt(request)}

CRITICAL: Respond ONLY in valid JSON format. Do not use markdown, code blocks, or any text outside the JSON structure.`;
        const args = [
            '-p',
            prompt,
            '-m',
            this.config.model || 'gemini-pro',
            '--all-files',
            '--include-directories',
            this.config.projectPath,
        ];
        if (request.requiresFileOperations) {
            args.push('-y', '--yolo');
        }
        if (this.config.debug) {
            args.push('-d', '--debug');
        }
        try {
            const result = await this.executeCommand('gemini', args);
            if (result.exitCode === 0) {
                this.rateLimitTracker.delete(rateLimitKey);
            }
            let parsedData;
            try {
                parsedData = JSON.parse(result.stdout);
            }
            catch (jsonError) {
                const jsonMatch = result.stdout.match(/```json\n([\s\S]*?)\n```/) ||
                    result.stdout.match(/```\n([\s\S]*?)\n```/) ||
                    result.stdout.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                    }
                    catch {
                        if (this.config.debug) {
                            console.warn('Gemini returned non-JSON response despite request');
                        }
                        parsedData = {
                            rawResponse: result.stdout,
                            note: 'Response was not in requested JSON format',
                        };
                    }
                }
                else {
                    parsedData = {
                        rawResponse: result.stdout,
                        note: 'Response was not in requested JSON format',
                    };
                }
            }
            return {
                success: result.exitCode === 0,
                data: parsedData,
                outputFile: request.outputPath,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('quota') ||
                errorMessage.includes('rate limit') ||
                errorMessage.includes('429') ||
                errorMessage.includes('too many requests')) {
                this.rateLimitTracker.set(rateLimitKey, Date.now());
                if (this.config.debug) {
                    console.log(`Gemini rate limit detected, setting ${cooldownPeriod / (60 * 1000)} minute cooldown`);
                }
                throw new Error(`Gemini quota exceeded. Cooldown active for ${cooldownPeriod / (60 * 1000)} minutes.`);
            }
            throw error;
        }
    }
    async analyzeWithGeminiDirect(request) {
        if (!this.geminiHandler) {
            throw new Error('Gemini Direct handler not initialized');
        }
        const systemPrompt = this.buildSystemPrompt(request);
        const userPrompt = request.prompt || this.buildPrompt(request);
        const messages = [{ role: 'user', content: userPrompt }];
        if (this.config.debug) {
            console.log('🔮 Using Gemini Direct API...');
            console.log('  - Model:', this.geminiHandler.getModel().id);
            console.log('  - Using OAuth:', '~/.gemini/oauth_creds.json');
            console.log('  - Context size:', userPrompt.length, 'characters');
            console.log('  - Streaming:', true);
        }
        try {
            const stream = this.geminiHandler.createMessage(systemPrompt, messages);
            let fullResponse = '';
            let usage = { inputTokens: 0, outputTokens: 0 };
            for await (const chunk of stream) {
                if (chunk.type === 'text') {
                    fullResponse += chunk.text;
                    if (this.config.debug && chunk.text) {
                        process.stdout.write(chunk.text);
                    }
                }
                else if (chunk.type === 'usage') {
                    usage = {
                        inputTokens: chunk.inputTokens,
                        outputTokens: chunk.outputTokens,
                    };
                }
            }
            if (this.config.debug) {
                console.log('\n✅ Gemini Direct streaming complete!');
                console.log(`  - Response length: ${fullResponse.length} characters`);
                console.log(`  - Token usage: ${usage.inputTokens} in, ${usage.outputTokens} out`);
            }
            let parsedData;
            try {
                parsedData = JSON.parse(fullResponse);
            }
            catch (jsonError) {
                const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/) ||
                    fullResponse.match(/```\n([\s\S]*?)\n```/) ||
                    fullResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                    }
                    catch {
                        if (this.config.debug) {
                            console.warn('Gemini Direct returned non-JSON response despite request');
                        }
                        parsedData = {
                            rawResponse: fullResponse,
                            note: 'Response was not in requested JSON format',
                        };
                    }
                }
                else {
                    parsedData = {
                        rawResponse: fullResponse,
                        note: 'Response was not in requested JSON format',
                    };
                }
            }
            this.rateLimitTracker.delete('gemini-direct');
            return {
                success: true,
                data: parsedData,
                outputFile: request.outputPath,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (this.config.debug) {
                console.error('❌ Gemini Direct API error:', errorMessage);
            }
            if (errorMessage.includes('quota') ||
                errorMessage.includes('rate limit') ||
                errorMessage.includes('429') ||
                errorMessage.includes('too many requests')) {
                this.rateLimitTracker.set('gemini-direct', Date.now());
                if (this.config.debug) {
                    console.log('Gemini Direct rate limit detected, setting 30 minute cooldown');
                }
                throw new Error('Gemini Direct quota exceeded. Cooldown active for 30 minutes.');
            }
            if (errorMessage.includes('authentication') ||
                errorMessage.includes('API_KEY_INVALID')) {
                throw new Error('Gemini Direct authentication failed. Check OAuth credentials or API key.');
            }
            throw error;
        }
    }
    async analyzeWithGeminiPro(request) {
        if (!this.geminiHandler) {
            throw new Error('Gemini handler not initialized');
        }
        const proHandler = new GeminiHandler({
            modelId: 'gemini-2.5-pro',
            temperature: this.config.temperature || 0.1,
            maxTokens: this.config.maxTokens,
            enableJson: false,
        });
        const systemPrompt = this.buildSystemPrompt(request);
        const userPrompt = request.prompt || this.buildPrompt(request);
        const messages = [{ role: 'user', content: userPrompt }];
        if (this.config.debug) {
            console.log('🔮 Using Gemini 2.5 Pro (Complex Reasoning)...');
            console.log('  - Model: gemini-2.5-pro');
            console.log('  - Use case: High complexity tasks');
            console.log('  - Context size:', userPrompt.length, 'characters');
        }
        try {
            const stream = proHandler.createMessage(systemPrompt, messages);
            let fullResponse = '';
            let usage = { inputTokens: 0, outputTokens: 0 };
            for await (const chunk of stream) {
                if (chunk.type === 'text') {
                    fullResponse += chunk.text;
                    if (this.config.debug && chunk.text) {
                        process.stdout.write(chunk.text);
                    }
                }
                else if (chunk.type === 'usage') {
                    usage = {
                        inputTokens: chunk.inputTokens,
                        outputTokens: chunk.outputTokens,
                    };
                }
            }
            if (this.config.debug) {
                console.log('\n✅ Gemini Pro complex reasoning complete!');
                console.log(`  - Token usage: ${usage.inputTokens} in, ${usage.outputTokens} out`);
            }
            let parsedData;
            try {
                parsedData = JSON.parse(fullResponse);
            }
            catch (jsonError) {
                const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/) ||
                    fullResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                    }
                    catch {
                        parsedData = {
                            rawResponse: fullResponse,
                            note: 'Non-JSON response',
                        };
                    }
                }
                else {
                    parsedData = { rawResponse: fullResponse, note: 'Non-JSON response' };
                }
            }
            return {
                success: true,
                data: parsedData,
                outputFile: request.outputPath,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (this.config.debug) {
                console.error('❌ Gemini Pro error:', errorMessage);
            }
            throw error;
        }
    }
    buildSystemPrompt(request) {
        return `You are an expert software architect and AI assistant specializing in:
- Graph Neural Networks (GNN) and machine learning systems
- TypeScript/JavaScript analysis and error fixing
- Domain-driven design and software architecture
- Code quality and performance optimization

Context: You're analyzing a GNN-Kuzu integration system that combines neural networks with graph databases for intelligent code analysis.

IMPORTANT: Always respond in valid JSON format unless explicitly requested otherwise. Structure your responses as:
{
  "analysis": "your main analysis here",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "codeExamples": [{"description": "what this does", "code": "actual code"}],
  "summary": "brief summary of findings"
}

For error analysis, use:
{
  "errors": [{"file": "path", "issue": "description", "fix": "solution", "code": "fixed code"}],
  "summary": "overall assessment"
}

Provide detailed, actionable insights with specific code examples in the JSON structure.`;
    }
    buildPrompt(request) {
        if (request.prompt) {
            return request.prompt;
        }
        const baseContext = `Project: ${path.basename(this.config.projectPath)}\n`;
        switch (request.task) {
            case 'domain-analysis':
                return (baseContext +
                    `
Analyze the following domain relationships using your GNN-Kuzu integration expertise:

Domains: ${JSON.stringify(request.context.domains, null, 2)}
Dependencies: ${JSON.stringify(request.context.dependencies, null, 2)}

RESPOND IN JSON FORMAT:
{
  "domainAnalysis": {
    "enhancedRelationships": [
      {"from": "domain1", "to": "domain2", "strength": 0.8, "type": "dependency", "reasoning": "why this relationship exists"}
    ],
    "cohesionScores": [
      {"domain": "domain1", "score": 0.9, "factors": ["factor1", "factor2"]}
    ],
    "crossDomainInsights": [
      {"insight": "description", "impact": "high/medium/low", "recommendation": "what to do"}
    ]
  },
  "architectureRecommendations": [
    {"area": "domain boundaries", "recommendation": "specific advice", "priority": "high/medium/low"}
  ],
  "optimizations": [
    {"target": "cohesion calculation", "improvement": "description", "code": "implementation example"}
  ],
  "summary": "overall domain analysis summary"
}

${request.outputPath ? `Write results to: ${request.outputPath}` : ''}
`);
            case 'typescript-error-analysis':
                return (baseContext +
                    `
Analyze and fix the following TypeScript errors in the GNN-Kuzu integration system:

Files: ${request.context.files?.join(', ')}
Errors: ${JSON.stringify(request.context.errors, null, 2)}

RESPOND IN JSON FORMAT:
{
  "errorAnalysis": [
    {
      "file": "path/to/file",
      "error": "error description", 
      "rootCause": "why this error occurs",
      "severity": "high/medium/low",
      "fix": {
        "description": "what needs to be changed",
        "code": "corrected code snippet",
        "imports": ["any new imports needed"],
        "explanation": "why this fix works"
      }
    }
  ],
  "preventionStrategies": [
    {"strategy": "description", "implementation": "how to implement", "benefit": "what it prevents"}
  ],
  "architecturalImpact": {
    "changes": ["change 1", "change 2"],
    "risks": ["potential risk 1"],
    "benefits": ["benefit 1", "benefit 2"]
  },
  "summary": "overall assessment and next steps"
}

${request.requiresFileOperations ? 'Apply fixes directly to the files after providing the JSON analysis.' : ''}
`);
            case 'code-review':
                return (baseContext +
                    `
Perform a comprehensive code review of the GNN-Kuzu integration components:

Files: ${request.context.files?.join(', ')}

RESPOND IN JSON FORMAT:
{
  "codeReview": {
    "overallRating": "A/B/C/D/F",
    "strengths": ["strength 1", "strength 2"],
    "criticalIssues": [
      {"file": "path", "issue": "description", "severity": "high/medium/low", "recommendation": "fix"}
    ],
    "improvements": [
      {"category": "performance/architecture/style", "suggestion": "description", "example": "code example", "priority": "high/medium/low"}
    ]
  },
  "architectureAnalysis": {
    "patterns": ["pattern 1", "pattern 2"],
    "antiPatterns": ["issue 1", "issue 2"],
    "recommendations": ["rec 1", "rec 2"]
  },
  "performanceAnalysis": {
    "bottlenecks": ["bottleneck 1", "bottleneck 2"],
    "optimizations": [{"area": "description", "improvement": "suggestion", "impact": "expected benefit"}]
  },
  "integrationPoints": [
    {"component1": "name", "component2": "name", "coupling": "tight/loose", "recommendation": "advice"}
  ],
  "actionItems": [
    {"priority": "high/medium/low", "task": "description", "timeEstimate": "hours/days"}
  ],
  "summary": "overall assessment and next steps"
}
`);
            default:
                return (baseContext +
                    `
Perform custom analysis task: ${request.task}

Context: ${JSON.stringify(request.context, null, 2)}

RESPOND IN JSON FORMAT:
{
  "taskType": "${request.task}",
  "analysis": "detailed analysis of the provided context",
  "findings": [
    {"category": "category name", "finding": "description", "importance": "high/medium/low"}
  ],
  "recommendations": [
    {"recommendation": "specific advice", "reasoning": "why this helps", "priority": "high/medium/low"}
  ],
  "nextSteps": ["step 1", "step 2", "step 3"],
  "summary": "concise summary of analysis and key takeaways"
}
`);
        }
    }
    async executeCommand(command, args) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd: this.config.projectPath,
                env: process.env,
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                resolve({
                    stdout,
                    stderr,
                    exitCode: code || 0,
                });
            });
            child.on('error', (error) => {
                reject(error);
            });
            setTimeout(() => {
                child.kill();
                reject(new Error(`Command timeout: ${command} ${args.join(' ')}`));
            }, 60000);
        });
    }
    createSession() {
        this.sessionId = uuidv4();
        return this.sessionId;
    }
    getSessionId() {
        return this.sessionId;
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    isInCooldown(provider) {
        const lastRateLimit = this.rateLimitTracker.get(provider);
        if (!lastRateLimit)
            return false;
        const cooldownPeriod = this.config.rateLimitCooldown || 60 * 60 * 1000;
        return Date.now() - lastRateLimit < cooldownPeriod;
    }
    getCooldownRemaining(provider) {
        const lastRateLimit = this.rateLimitTracker.get(provider);
        if (!lastRateLimit)
            return 0;
        const cooldownPeriod = this.config.rateLimitCooldown || 60 * 60 * 1000;
        const remaining = cooldownPeriod - (Date.now() - lastRateLimit);
        return remaining > 0 ? Math.ceil(remaining / (60 * 1000)) : 0;
    }
    clearCooldown(provider) {
        this.rateLimitTracker.delete(provider);
    }
    async analyzeSmart(request) {
        const originalProvider = this.config.preferredProvider;
        if (request.requiresFileOperations) {
            this.config.preferredProvider = 'claude-code';
        }
        else {
            this.config.preferredProvider = 'github-models';
            this.config.model = 'openai/gpt-5';
            this.config.maxTokens = 100000;
        }
        try {
            const result = await this.analyze(request);
            return result;
        }
        finally {
            this.config.preferredProvider = originalProvider;
        }
    }
    async analyzeArchitectureAB(request) {
        const originalProvider = this.config.preferredProvider;
        const originalModel = this.config.model;
        try {
            this.config.preferredProvider = 'github-models';
            this.config.model = 'openai/gpt-5';
            this.config.maxTokens = 4000;
            const gpt5Result = await this.analyzeWithGitHubModelsAPI({
                ...request,
                prompt: `[GPT-5 API Analysis] ${request.prompt || this.buildPrompt(request)}`,
            });
            this.config.model = 'mistral-ai/codestral-2501';
            this.config.maxTokens = 4000;
            const codestralResult = await this.analyzeWithGitHubModelsAPI({
                ...request,
                prompt: `[Codestral API Analysis] ${request.prompt || this.buildPrompt(request)}`,
            });
            let recommendation = '';
            if (gpt5Result.success && codestralResult.success) {
                if (request.task?.includes('code') ||
                    request.task?.includes('typescript')) {
                    recommendation =
                        'Codestral specialized for coding but GPT-5 preferred due to no rate limits';
                }
                else {
                    recommendation =
                        'GPT-5 preferred - fully free with excellent analysis capabilities';
                }
            }
            else if (gpt5Result.success) {
                recommendation =
                    'GPT-5 succeeded while Codestral failed - stick with GPT-5';
            }
            else if (codestralResult.success) {
                recommendation =
                    'Codestral succeeded while GPT-5 failed - unusual, investigate';
            }
            else {
                recommendation = 'Both models failed - check network or API status';
            }
            return {
                gpt5: gpt5Result,
                comparison: codestralResult,
                recommendation: 'Recommendation: Use GPT-5 exclusively - it is fully free and excellent for all tasks',
            };
        }
        finally {
            this.config.preferredProvider = originalProvider;
            this.config.model = originalModel;
        }
    }
}
//# sourceMappingURL=llm-integration.service.js.map