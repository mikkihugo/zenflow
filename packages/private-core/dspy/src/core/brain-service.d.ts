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
import type { DSPyExample } from '../types/interfaces.js';
/**
 * Brain request types for different cognitive operations
 */
export interface BrainAnalysisRequest {
    task: string;
    context?: string;
    complexity?: 'simple|moderate|complex';
    role?: 'user|analyst|architect';
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
export declare class BrainService {
    private dspyEngine;
    private optimizationCache;
    private conversationContext;
    private initialized;
    constructor();
    /**
     * Initialize Brain service
     */
    initialize(): Promise<void>;
    /**
     * Main analysis method - System interface for intelligent operations
     */
    analyze(request: BrainAnalysisRequest): Promise<BrainResponse>;
    /**
     * Optimize a prompt using DSPy - Internal brain operation
     */
    optimizePrompt(request: BrainOptimizationRequest): Promise<{
        originalPrompt: string;
        optimizedPrompt: string;
        improvement: number;
        examples: DSPyExample[];
    }>;
    /**
     * Get Brain service statistics
     */
    getStats(): Promise<{
        conversationLength: number;
        optimizationCacheSize: number;
        dspyStats: any;
    }>;
    /**
     * Clear Brain memory and cache
     */
    clearMemory(): Promise<void>;
    /**
     * Private: Decide if prompt optimization would be beneficial
     */
    private shouldOptimizePrompt;
    /**
     * Private: Execute with DSPy optimization
     */
    private executeWithOptimization;
    /**
     * Private: Execute directly without optimization
     */
    private executeDirectly;
    /**
     * Private: Build prompt from request
     */
    private buildPromptFromRequest;
    /**
     * Private: Generate examples from conversation context
     */
    private generateExamplesFromContext;
    /**
     * Private: Calculate confidence based on optimization and complexity
     */
    private calculateConfidence;
    /**
     * Private: Generate cache key for optimization results
     */
    private generateCacheKey;
}
/**
 * Get the singleton Brain service instance - Main system interface
 */
export declare function getBrainService(): Promise<BrainService>;
/**
 * Initialize Brain service (call this early in your application)
 */
export declare function initializeBrainService(): Promise<BrainService>;
//# sourceMappingURL=brain-service.d.ts.map