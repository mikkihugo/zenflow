/**
 * @fileoverview Brain Service Layer - System Interface for DSPy Operations
 *
 * This is the main interface that systems should use. Brain orchestrates DSPy operations
 * internally and provides intelligent, optimized responses to system requests.
 *
 * Architecture:
 * System → Brain → DSPy → Foundation (LLM)
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 */
import { getDSPyService } from './service.js';
import { createDSPyEngine } from './dspy-engine.js';
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
    dspyEngine;
    optimizationCache = new Map();
    conversationContext = [];
    initialized = false;
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
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Ensure DSPy service is ready
            await getDSPyService();
            this.initialized = true;
            console.log('[Brain] Service initialized with DSPy optimization engine');
        }
        catch (error) {
            console.error('[Brain] Failed to initialize:', error);
            throw error;
        }
    }
    /**
     * Main analysis method - System interface for intelligent operations
     */
    async analyze(request) {
        if (!this.initialized) {
            await this.initialize();
        }
        const startTime = Date.now();
        // Add context to conversation history
        this.conversationContext.push(`Task: ${request.task}`);
        if (this.conversationContext.length > 10) {
            this.conversationContext = this.conversationContext.slice(-10); // Keep last 10
        }
        try {
            let result;
            let dspyOptimized = false;
            // Decide if DSPy optimization would be beneficial
            if (this.shouldOptimizePrompt(request)) {
                result = await this.executeWithOptimization(request);
                dspyOptimized = true;
            }
            else {
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
        }
        catch (error) {
            console.error('[Brain] Analysis failed:', error);
            throw new Error(`Brain analysis failed: ${error}`);
        }
    }
    /**
     * Optimize a prompt using DSPy - Internal brain operation
     */
    async optimizePrompt(request) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(request.prompt, request.domain);
            if (this.optimizationCache.has(cacheKey)) {
                const cached = this.optimizationCache.get(cacheKey);
                return {
                    originalPrompt: cached.originalPrompt,
                    optimizedPrompt: cached.optimizedPrompt,
                    improvement: cached.improvement,
                    examples: request.examples || [],
                };
            }
            // Create examples if not provided
            const examples = request.examples || this.generateExamplesFromContext(request.prompt);
            // Use DSPy for optimization
            const optimization = await this.dspyEngine.optimizePrompt(request.prompt, examples, request.prompt);
            // Cache the result
            this.optimizationCache.set(cacheKey, optimization);
            console.log(`[Brain] Optimized prompt with ${optimization.improvement.toFixed(3)} improvement`);
            return {
                originalPrompt: optimization.originalPrompt,
                optimizedPrompt: optimization.optimizedPrompt,
                improvement: optimization.improvement,
                examples,
            };
        }
        catch (error) {
            console.error('[Brain] Prompt optimization failed:', error);
            throw new Error(`Brain prompt optimization failed: ${error}`);
        }
    }
    /**
     * Get Brain service statistics
     */
    async getStats() {
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
    async clearMemory() {
        this.conversationContext = [];
        this.optimizationCache.clear();
        await this.dspyEngine.clear();
        console.log('[Brain] Memory and cache cleared');
    }
    /**
     * Private: Decide if prompt optimization would be beneficial
     */
    shouldOptimizePrompt(request) {
        // Optimize for complex tasks or when explicitly requested
        if (request.optimizePrompt === true)
            return true;
        if (request.optimizePrompt === false)
            return false;
        // Auto-decide based on complexity and role
        if (request.complexity === 'complex')
            return true;
        if (request.role === 'architect' || request.role === 'analyst')
            return true;
        if (request.task.length > 200)
            return true; // Long tasks benefit from optimization
        return false;
    }
    /**
     * Private: Execute with DSPy optimization
     */
    async executeWithOptimization(request) {
        const examples = this.generateExamplesFromContext(request.task);
        const optimization = await this.dspyEngine.optimizePrompt(request.task, examples, this.buildPromptFromRequest(request));
        // Execute the optimized prompt via DSPy service
        const dspyService = await getDSPyService();
        const result = await dspyService.executePrompt(optimization.optimizedPrompt, {
            temperature: 0.7,
            maxTokens: 2048,
            role: request.role || 'analyst', // Default to analyst for DSPy
        });
        console.log(`[Brain] Used DSPy optimization (${optimization.improvement.toFixed(3)} improvement)`);
        return result;
    }
    /**
     * Private: Execute directly without optimization
     */
    async executeDirectly(request) {
        const dspyService = await getDSPyService();
        const prompt = this.buildPromptFromRequest(request);
        return await dspyService.executePrompt(prompt, {
            temperature: 0.7,
            maxTokens: 2048,
            role: request.role || 'analyst', // Default to analyst for DSPy
        });
    }
    /**
     * Private: Build prompt from request
     */
    buildPromptFromRequest(request) {
        let prompt = request.task;
        if (request.context) {
            prompt = `Context: ${request.context}\n\nTask: ${prompt}`;
        }
        // Add conversation context if available
        if (this.conversationContext.length > 1) {
            const recentContext = this.conversationContext.slice(-3).join('\n');
            prompt = `Recent conversation:\n${recentContext}\n\nCurrent task: ${prompt}`;
        }
        return prompt;
    }
    /**
     * Private: Generate examples from conversation context
     */
    generateExamplesFromContext(_task) {
        const examples = [];
        // Simple example generation from context
        if (this.conversationContext.length > 0) {
            const recentTasks = this.conversationContext
                .filter((ctx) => ctx.startsWith('Task: '))
                .slice(-3);
            recentTasks.forEach((taskCtx, index) => {
                examples.push({
                    id: `context-${index}`,
                    input: taskCtx.replace('Task: ', ''),
                    output: `Analyzed and provided insights for: ${taskCtx.replace('Task: ', '')}`,
                    metadata: { createdAt: new Date(), source: 'conversation-context' },
                });
            });
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
     * Private: Calculate confidence based on optimization and complexity
     */
    calculateConfidence(request, optimized) {
        let confidence = 0.8; // Base confidence
        if (optimized)
            confidence += 0.1; // DSPy optimization boost
        if (request.context)
            confidence += 0.05; // Context helps
        if (this.conversationContext.length > 3)
            confidence += 0.05; // Conversation history helps
        return Math.min(confidence, 0.95); // Cap at 95%
    }
    /**
     * Private: Generate cache key for optimization results
     */
    generateCacheKey(prompt, domain) {
        const content = `${prompt}-${domain || 'general'}`;
        return Buffer.from(content).toString('base64').slice(0, 32);
    }
}
/**
 * Singleton Brain service instance
 */
let brainServiceInstance = null;
/**
 * Get the singleton Brain service instance - Main system interface
 */
export async function getBrainService() {
    if (!brainServiceInstance) {
        brainServiceInstance = new BrainService();
        await brainServiceInstance.initialize();
    }
    return brainServiceInstance;
}
/**
 * Initialize Brain service (call this early in your application)
 */
export async function initializeBrainService() {
    const service = await getBrainService();
    await service.initialize();
    return service;
}
// Export types already declared above
