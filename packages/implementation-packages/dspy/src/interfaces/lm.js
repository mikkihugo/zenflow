/**
 * @fileoverview DSPy Language Model Interface - Production Grade
 *
 * Core LM interface for all DSPy language model interactions.
 * 100% compatible with Stanford DSPy's LM interface.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * Base Language Model class with common functionality
 */
export class BaseLM {
    model;
    usage = {
        input_tokens: 0,
        output_tokens: 0,
        api_calls: 0,
        last_used: Date.now()
    };
    constructor(model) {
        this.model = model ?? 'unknown';
    }
    /**
     * Track usage statistics
     */
    trackUsage(inputTokens, outputTokens, cost) {
        this.usage.input_tokens += inputTokens;
        this.usage.output_tokens += outputTokens;
        this.usage.api_calls += 1;
        this.usage.last_used = Date.now();
        if (cost !== undefined) {
            this.usage.total_cost = (this.usage.total_cost || 0) + cost;
        }
        // Track daily usage
        const today = new Date().toISOString().split('T')[0];
        if (!today) {
            throw new Error('Failed to get today\'s date');
        }
        if (!this.usage.daily_usage) {
            this.usage.daily_usage = {};
        }
        if (!this.usage.daily_usage[today]) {
            this.usage.daily_usage[today] = {
                input_tokens: 0,
                output_tokens: 0,
                api_calls: 0,
                cost: 0
            };
        }
        const dayUsage = this.usage.daily_usage[today];
        if (dayUsage) {
            dayUsage.input_tokens += inputTokens;
            dayUsage.output_tokens += outputTokens;
            dayUsage.api_calls += 1;
            if (cost !== undefined) {
                dayUsage.cost = (dayUsage.cost || 0) + cost;
            }
        }
    }
    /**
     * Get usage statistics
     */
    getUsage() {
        return { ...this.usage };
    }
    /**
     * Reset usage statistics
     */
    resetUsage() {
        this.usage = {
            input_tokens: 0,
            output_tokens: 0,
            api_calls: 0,
            last_used: Date.now()
        };
    }
    /**
     * Get model info (override in subclasses)
     */
    getInfo() {
        return {
            name: this.model || 'unknown',
            provider: 'unknown'
        };
    }
    /**
     * Check if ready (default implementation)
     */
    isReady() {
        return true;
    }
    /**
     * Kill/cleanup (default implementation)
     */
    kill() {
        // Default: no-op
    }
    /**
     * Launch/initialize (default implementation)
     */
    launch() {
        // Default: no-op
    }
}
