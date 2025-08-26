/**
 * Module declarations for implementation packages to avoid "Cannot find module" errors
 * These are fallback declarations that enable compilation when packages aren't available
 */

declare module "@claude-zen/llm-providers" {
	export interface LLMProvider {
		realInstance: any;
		providerId: string;
		initializeProvider(): Promise<void>;
		execute(prompt: string, options?: any): Promise<any>;
		complete(prompt: string, options?: any): Promise<string>;
		chat(messages: any[], options?: any): Promise<any>;
		embeddings(text: string, options?: any): Promise<number[]>;
		listModels(): Promise<string[]>;
		getModelInfo(modelId: string): Promise<any>;
		setModel(modelId: string): Promise<void>;
		getTokenCount(text: string): Promise<number>;
		estimateTokens(text: string): number;
		isAvailable(): boolean;
		getCapabilities(): any;
		getConfig(): any;
		updateConfig(config: any): Promise<void>;
	}

	export class LLMProvider {
		realInstance: any;
		providerId: string;
		constructor(providerId?: string);
		initializeProvider(): Promise<void>;
		execute(prompt: any, options?: any): Promise<any>;
		complete(prompt: string, options?: any): Promise<string>;
		chat(messages: any[], options?: any): Promise<any>;
		embeddings(text: string, options?: any): Promise<number[]>;
		listModels(): Promise<string[]>;
		getModelInfo(modelId: string): Promise<any>;
		setModel(modelId: string): Promise<void>;
		getTokenCount(text: string): Promise<number>;
		estimateTokens(text: string): number;
		isAvailable(): boolean;
		getCapabilities(): any;
		getConfig(): any;
		updateConfig(config: any): Promise<void>;
		setRole(role: string): void;
		getRole(): any;
	}

	export interface LLMProviderInfo {
		id: string;
		name: string;
		models: string[];
		capabilities: string[];
		status: "available" | "unavailable";
	}

	export interface LLMProviderConfig {
		apiKey?: string;
		baseUrl?: string;
		model?: string;
		temperature?: number;
		maxTokens?: number;
		[key: string]: any;
	}

	export class ClaudeProvider implements LLMProvider {
		realInstance: any;
		providerId: string;
		constructor(config?: LLMProviderConfig);
		initializeProvider(): Promise<void>;
		execute(prompt: string, options?: any): Promise<any>;
		complete(prompt: string, options?: any): Promise<string>;
		chat(messages: any[], options?: any): Promise<any>;
		embeddings(text: string, options?: any): Promise<number[]>;
		listModels(): Promise<string[]>;
		getModelInfo(modelId: string): Promise<any>;
		setModel(modelId: string): Promise<void>;
		getTokenCount(text: string): Promise<number>;
		estimateTokens(text: string): number;
		isAvailable(): boolean;
		getCapabilities(): any;
		getConfig(): any;
		updateConfig(config: any): Promise<void>;
	}

	export class OpenAIProvider implements LLMProvider {
		realInstance: any;
		providerId: string;
		constructor(config?: LLMProviderConfig);
		initializeProvider(): Promise<void>;
		execute(prompt: string, options?: any): Promise<any>;
		complete(prompt: string, options?: any): Promise<string>;
		chat(messages: any[], options?: any): Promise<any>;
		embeddings(text: string, options?: any): Promise<number[]>;
		listModels(): Promise<string[]>;
		getModelInfo(modelId: string): Promise<any>;
		setModel(modelId: string): Promise<void>;
		getTokenCount(text: string): Promise<number>;
		estimateTokens(text: string): number;
		isAvailable(): boolean;
		getCapabilities(): any;
		getConfig(): any;
		updateConfig(config: any): Promise<void>;
	}

	export class AnthropicProvider implements LLMProvider {
		realInstance: any;
		providerId: string;
		constructor(config?: LLMProviderConfig);
		initializeProvider(): Promise<void>;
		execute(prompt: string, options?: any): Promise<any>;
		complete(prompt: string, options?: any): Promise<string>;
		chat(messages: any[], options?: any): Promise<any>;
		embeddings(text: string, options?: any): Promise<number[]>;
		listModels(): Promise<string[]>;
		getModelInfo(modelId: string): Promise<any>;
		setModel(modelId: string): Promise<void>;
		getTokenCount(text: string): Promise<number>;
		estimateTokens(text: string): number;
		isAvailable(): boolean;
		getCapabilities(): any;
		getConfig(): any;
		updateConfig(config: any): Promise<void>;
	}

	export function createLLMProvider(
		type: "claude" | "openai" | "anthropic" | string,
		config?: LLMProviderConfig,
	): LLMProvider;
	export function getLLMProviderByCapability(capability: string): LLMProvider;
	export function listLLMProviders(): LLMProviderInfo[];
	export function executeClaudeTask(
		prompt: string,
		options?: any,
	): Promise<string>;
	export function executeGitHubModelsTask(
		prompt: string,
		options?: any,
	): Promise<string>;
	export function executeSwarmCoordinationTask(
		task: string,
		options?: any,
	): Promise<string>;
	export function listAvailableProviders(): Promise<LLMProviderInfo[]>;
	export function getProviderById(id: string): Promise<LLMProvider | null>;
	export function configureProvider(
		id: string,
		config: LLMProviderConfig,
	): Promise<void>;
	export const DEFAULT_PROVIDERS: Record<string, LLMProviderConfig>;
}
