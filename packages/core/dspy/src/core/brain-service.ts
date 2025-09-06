/**
* @fileoverview Brain Service Layer - System Interface for DSPy Operations
*
* This is the main interface that systems should use. Brain orchestrates DSPy operations
* internally and provides intelligent, optimized responses to system requests.
*
* Architecture:
* System Brain DSPy Foundation (LLM)
*
* @author Claude Code Zen Team
* @version 2.0.0
*/

import type {
DSPyExample,
DSPyOptimizationResult,
} from '../types/interfaces.js';
import { createDSPyEngine, type DSPyEngine } from './dspy-engine.js';
import { getDSPyService } from './service.js';

/**
* Brain request types for different cognitive operations
*/
export interface BrainAnalysisRequest {
task: string;
context?: string;
complexity?: 'simple' | 'moderate' | 'complex';
role?: 'user' | 'analyst' | 'architect';
optimizePrompt?: boolean;
}

export interface BrainOptimizationRequest {
prompt: string;
examples?: DSPyExample[];
domain?: string;
targetMetrics?: string[];
}

export interface BrainResponse {
result: string;
confidence: number;
optimizationUsed: boolean;
metadata: {
processingTime: number;
dspyOptimized?: boolean;
role: string;
timestamp: string;
};
}

/**
* Brain Service - Intelligent System Interface
*
* The Brain service is the main entry point for systems. It:
* - Decides when to use DSPy optimization
* - Manages conversation context and memory
* - Provides intelligent responses with optimization when beneficial
* - Acts as a proxy between system and DSPy/Foundation
*/
export class BrainService {
private dspyEngine: DSPyEngine;
private optimizationCache = new Map<string, DSPyOptimizationResult>();
private conversationContext: string[] = [];
private initialized = false;

constructor() {
// Initialize DSPy engine for internal optimization
this.dspyEngine = createDSPyEngine({
maxIterations: 3,
fewShotExamples: 2,
temperature: 0.1,
model: 'claude-3-sonnet',
});
}

/**
* Initialize Brain service
*/
async initialize(): Promise<void> {
if (this.initialized) return;

try {
// Ensure DSPy service is ready
await getDSPyService();
this.initialized = true;
logger.info('[Brain] Service initialized with DSPy optimization engine');
} catch (error) {
logger.error('[Brain] Failed to initialize:', error);
throw error;
}
}

/**
* Main analysis method - System interface for intelligent operations
*/
async analyze(request: BrainAnalysisRequest): Promise<BrainResponse> {
if (!this.initialized) {
await this.initialize();
}

const startTime = Date.now();

// Add context to conversation history
this.conversationContext.push('Task:' + request.task);
if (this.conversationContext.length > 10) {
this.conversationContext = this.conversationContext.slice(-10); // Keep last 10
}

try {
let result: string;
let dspyOptimized = false;

// Decide if DSPy optimization would be beneficial
if (this.shouldOptimizePrompt(request)) {
result = await this.executeWithOptimization(request);
dspyOptimized = true;
} else {
result = await this.executeDirectly(request);
}

const processingTime = Date.now() - startTime;

return {
result,
confidence: this.calculateConfidence(request, dspyOptimized),
optimizationUsed: dspyOptimized,
metadata: {
processingTime,
dspyOptimized,
role: request.role || 'user',
timestamp: new Date().toISOString(),
},
};
} catch (error) {
logger.error('[Brain] Analysis failed:', error);
throw new Error('Brain analysis failed:' + error);
}
}

/**
* Optimize a prompt using DSPy - Internal brain operation
*/
async optimizePrompt(request: BrainOptimizationRequest): Promise<{
originalPrompt: string;
optimizedPrompt: string;
improvement: number;
examples: DSPyExample[];
}> {
if (!this.initialized) {
await this.initialize();
}

try {
// Check cache first
const cacheKey = this.generateCacheKey(request.prompt, request.domain);
if (this.optimizationCache.has(cacheKey)) {
const cached = this.optimizationCache.get(cacheKey)!;
return {
originalPrompt: cached.originalPrompt,
optimizedPrompt: cached.optimizedPrompt,
improvement: cached.improvement,
examples: request.examples || [],
};
}

// Create examples if not provided
const examples =
request.examples || this.generateExamplesFromContext(request.prompt);

// Use DSPy for optimization
const optimization = await this.dspyEngine.optimizePrompt(
request.prompt,
examples,
request.prompt
);

// Cache the result
this.optimizationCache.set(cacheKey, optimization);

logger.info(
'[Brain] Optimized prompt with ' + optimization.improvement.toFixed(3) + ' improvement'
);

return {
originalPrompt: optimization.originalPrompt,
optimizedPrompt: optimization.optimizedPrompt,
improvement: optimization.improvement,
examples,
};
} catch (error) {
logger.error('[Brain] Prompt optimization failed:', error);
throw new Error('Brain prompt optimization failed:' + error);
}
}

/**
* Get Brain service statistics
*/
async getStats(): Promise<{
conversationLength: number;
optimizationCacheSize: number;
dspyStats: any;
}> {
const dspyStats = await this.dspyEngine.getStats();

return {
conversationLength: this.conversationContext.length,
optimizationCacheSize: this.optimizationCache.size,
dspyStats,
};
}

/**
* Clear Brain memory and cache
*/
async clearMemory(): Promise<void> {
this.conversationContext = [];
this.optimizationCache.clear();
await this.dspyEngine.clear();
logger.info('[Brain] Memory and cache cleared');
}

/**
* Private:Decide if prompt optimization would be beneficial
*/
private shouldOptimizePrompt(request: BrainAnalysisRequest): boolean {
// Optimize for complex tasks or when explicitly requested
if (request.optimizePrompt === true) return true;
if (request.optimizePrompt === false) return false;

// Auto-decide based on complexity and role
if (request.complexity === 'complex') return true;
if (request.role === 'architect' || request.role === 'analyst') return true;
if (request.task.length > 200) return true; // Long tasks benefit from optimization

return false;
}

/**
* Private:Execute with DSPy optimization
*/
private async executeWithOptimization(
request: BrainAnalysisRequest
): Promise<string> {
const examples = this.generateExamplesFromContext(request.task);

const optimization = await this.dspyEngine.optimizePrompt(
request.task,
examples,
this.buildPromptFromRequest(request)
);

// Execute the optimized prompt via DSPy service
const dspyService = await getDSPyService();
const result = await dspyService.executePrompt(
optimization.optimizedPrompt,
{
temperature: 0.7,
maxTokens: 2048,
role: (request.role as 'user' | 'analyst' | 'architect') || 'analyst', // Default to analyst for DSPy
}
);

logger.info(
'[Brain] Used DSPy optimization (' + optimization.improvement.toFixed(3) + ' improvement)'
);
return result;
}

/**
* Private:Execute directly without optimization
*/
private async executeDirectly(
request: BrainAnalysisRequest
): Promise<string> {
const dspyService = await getDSPyService();
const prompt = this.buildPromptFromRequest(request);

return await dspyService.executePrompt(prompt, {
temperature: 0.7,
maxTokens: 2048,
role: (request.role as 'user' | 'analyst' | 'architect') || 'analyst', // Default to analyst for DSPy
});
}

/**
* Private:Build prompt from request
*/
private buildPromptFromRequest(request: BrainAnalysisRequest): string {
let prompt = request.task;

if (request.context) {
prompt = 'Context:' + (request.context) + '\n\nTask:' + prompt;
}

// Add conversation context if available
if (this.conversationContext.length > 1) {
const recentContext = this.conversationContext.slice(-3).join('\n');
prompt = 'Recent conversation:\n' + (recentContext) + '\n\nCurrent task:' + prompt;
}

return prompt;
}

/**
* Private:Generate examples from conversation context
*/
private generateExamplesFromContext(_task: string): DSPyExample[] {
const examples: DSPyExample[] = [];

// Simple example generation from context
if (this.conversationContext.length > 0) {
const recentTasks = this.conversationContext
.filter((ctx) => ctx.startsWith('Task:'))
.slice(-3);

for (const [index, taskCtx] of recentTasks.entries()) {
examples.push({
id: 'context-' + index,
input: taskCtx.replace('Task: ', ''),
output: 'Analyzed and provided insights for: ' + taskCtx.replace('Task: ', ''),
metadata: { createdAt: new Date(), source: 'conversation-context' },
});
}
}

// Always have at least one example
if (examples.length === 0) {
examples.push({
id: 'default',
input: 'Analyze this request',
output: 'Provided comprehensive analysis with actionable insights',
metadata: { createdAt: new Date(), source: 'default-example' },
});
}

return examples;
}

/**
* Private:Calculate confidence based on optimization and complexity
*/
private calculateConfidence(
request: BrainAnalysisRequest,
optimized: boolean
): number {
let confidence = 0.8; // Base confidence

if (optimized) confidence += 0.1; // DSPy optimization boost
if (request.context) confidence += 0.05; // Context helps
if (this.conversationContext.length > 3) confidence += 0.05; // Conversation history helps

return Math.min(confidence, 0.95); // Cap at 95%
}

/**
* Private:Generate cache key for optimization results
*/
private generateCacheKey(prompt: string, domain?: string): string {
const content = (prompt) + '-' + domain || 'general';
return Buffer.from(content).toString('base64').slice(0, 32);
}
}

/**
* Singleton Brain service instance
*/
let brainServiceInstance: BrainService | null = null;

/**
* Get the singleton Brain service instance - Main system interface
*/
export async function getBrainService(): Promise<BrainService> {
if (!brainServiceInstance) {
brainServiceInstance = new BrainService();
await brainServiceInstance.initialize();
}
return brainServiceInstance;
}

/**
* Initialize Brain service (call this early in your application)
*/
export async function initializeBrainService(): Promise<BrainService> {
const service = await getBrainService();
await service.initialize();
return service;
}

// Export types already declared above
