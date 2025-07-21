"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestQueue = exports.LoadBalancer = void 0;
const errors_js_1 = require("../utils/errors.js");
/**
 * Circuit breaker state
 */
var CircuitBreakerState;
(function (CircuitBreakerState) {
    CircuitBreakerState["CLOSED"] = "closed";
    CircuitBreakerState["OPEN"] = "open";
    CircuitBreakerState["HALF_OPEN"] = "half_open";
})(CircuitBreakerState || (CircuitBreakerState = {}));
/**
 * Rate limiter using token bucket algorithm
 */
class RateLimiter {
    constructor(maxTokens, refillRate) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
        this.tokens = maxTokens;
        this.lastRefill = Date.now();
    }
    tryConsume(tokens = 1) {
        this.refill();
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }
    refill() {
        const now = Date.now();
        const timePassed = (now - this.lastRefill) / 1000;
        const tokensToAdd = Math.floor(timePassed * this.refillRate);
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
            this.lastRefill = now;
        }
    }
    getTokens() {
        this.refill();
        return this.tokens;
    }
}
/**
 * Circuit breaker implementation
 */
class CircuitBreaker {
    constructor(failureThreshold, recoveryTimeout, // milliseconds
    halfOpenMaxRequests = 3) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeout = recoveryTimeout;
        this.halfOpenMaxRequests = halfOpenMaxRequests;
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.successCount = 0;
    }
    canExecute() {
        const now = Date.now();
        switch (this.state) {
            case CircuitBreakerState.CLOSED:
                return true;
            case CircuitBreakerState.OPEN:
                if (now - this.lastFailureTime >= this.recoveryTimeout) {
                    this.state = CircuitBreakerState.HALF_OPEN;
                    this.successCount = 0;
                    return true;
                }
                return false;
            case CircuitBreakerState.HALF_OPEN:
                return this.successCount < this.halfOpenMaxRequests;
            default:
                return false;
        }
    }
    recordSuccess() {
        if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.halfOpenMaxRequests) {
                this.state = CircuitBreakerState.CLOSED;
                this.failureCount = 0;
            }
        }
        else if (this.state === CircuitBreakerState.CLOSED) {
            this.failureCount = 0;
        }
    }
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.state = CircuitBreakerState.OPEN;
        }
        else if (this.state === CircuitBreakerState.CLOSED && this.failureCount >= this.failureThreshold) {
            this.state = CircuitBreakerState.OPEN;
        }
    }
    getState() {
        return this.state;
    }
    getMetrics() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
        };
    }
}
/**
 * Load balancer implementation
 */
class LoadBalancer {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.sessionRateLimiters = new Map();
        this.requestTimes = [];
        this.requestsInLastSecond = 0;
        this.lastSecondTimestamp = 0;
        this.rateLimiter = new RateLimiter(config.maxRequestsPerSecond, config.maxRequestsPerSecond);
        this.circuitBreaker = new CircuitBreaker(config.circuitBreakerThreshold, 30000);
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimitedRequests: 0,
            averageResponseTime: 0,
            requestsPerSecond: 0,
            circuitBreakerTrips: 0,
            lastReset: new Date(),
        };
        // Clean up old session rate limiters periodically
        setInterval(() => {
            this.cleanupSessionRateLimiters();
        }, 300000); // Every 5 minutes
    }
    async shouldAllowRequest(session, request) {
        if (!this.config.enabled) {
            return true;
        }
        // Check circuit breaker
        if (!this.circuitBreaker.canExecute()) {
            this.logger.warn('Request rejected by circuit breaker', {
                sessionId: session.id,
                method: request.method,
                circuitState: this.circuitBreaker.getState(),
            });
            this.metrics.circuitBreakerTrips++;
            return false;
        }
        // Check global rate limit
        if (!this.rateLimiter.tryConsume()) {
            this.logger.warn('Request rejected by global rate limiter', {
                sessionId: session.id,
                method: request.method,
                remainingTokens: this.rateLimiter.getTokens(),
            });
            this.metrics.rateLimitedRequests++;
            return false;
        }
        // Check per-session rate limit
        const sessionRateLimiter = this.getSessionRateLimiter(session.id);
        if (!sessionRateLimiter.tryConsume()) {
            this.logger.warn('Request rejected by session rate limiter', {
                sessionId: session.id,
                method: request.method,
                remainingTokens: sessionRateLimiter.getTokens(),
            });
            this.metrics.rateLimitedRequests++;
            return false;
        }
        return true;
    }
    recordRequestStart(session, request) {
        const requestMetrics = {
            requestId: request.id.toString(),
            sessionId: session.id,
            method: request.method,
            startTime: Date.now(),
        };
        this.metrics.totalRequests++;
        this.updateRequestsPerSecond();
        this.logger.debug('Request started', {
            requestId: requestMetrics.requestId,
            sessionId: session.id,
            method: request.method,
        });
        return requestMetrics;
    }
    recordRequestEnd(metrics, response, error) {
        metrics.endTime = Date.now();
        const duration = metrics.endTime - metrics.startTime;
        // Update response time tracking
        this.requestTimes.push(duration);
        if (this.requestTimes.length > 1000) {
            this.requestTimes.shift(); // Keep only last 1000 requests
        }
        const success = !error && (!response || !response.error);
        metrics.success = success;
        const errorMessage = error?.message || response?.error?.message;
        if (errorMessage) {
            metrics.error = errorMessage;
        }
        if (success) {
            this.metrics.successfulRequests++;
            this.circuitBreaker.recordSuccess();
        }
        else {
            this.metrics.failedRequests++;
            this.circuitBreaker.recordFailure();
        }
        // Update average response time
        this.metrics.averageResponseTime = this.calculateAverageResponseTime();
        this.logger.debug('Request completed', {
            requestId: metrics.requestId,
            sessionId: metrics.sessionId,
            method: metrics.method,
            duration,
            success,
            error: metrics.error,
        });
    }
    getMetrics() {
        return { ...this.metrics };
    }
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimitedRequests: 0,
            averageResponseTime: 0,
            requestsPerSecond: 0,
            circuitBreakerTrips: 0,
            lastReset: new Date(),
        };
        this.requestTimes = [];
        this.logger.info('Load balancer metrics reset');
    }
    isCircuitBreakerOpen() {
        return this.circuitBreaker.getState() === CircuitBreakerState.OPEN;
    }
    getDetailedMetrics() {
        return {
            loadBalancer: this.getMetrics(),
            circuitBreaker: this.circuitBreaker.getMetrics(),
            rateLimiter: {
                tokens: this.rateLimiter.getTokens(),
                maxTokens: this.config.maxRequestsPerSecond,
            },
            sessions: this.sessionRateLimiters.size,
        };
    }
    getSessionRateLimiter(sessionId) {
        let rateLimiter = this.sessionRateLimiters.get(sessionId);
        if (!rateLimiter) {
            // Create a per-session rate limiter (more restrictive than global)
            const sessionLimit = Math.max(1, Math.floor(this.config.maxRequestsPerSecond / 10));
            rateLimiter = new RateLimiter(sessionLimit, sessionLimit);
            this.sessionRateLimiters.set(sessionId, rateLimiter);
        }
        return rateLimiter;
    }
    calculateAverageResponseTime() {
        if (this.requestTimes.length === 0) {
            return 0;
        }
        const sum = this.requestTimes.reduce((acc, time) => acc + time, 0);
        return sum / this.requestTimes.length;
    }
    updateRequestsPerSecond() {
        const now = Math.floor(Date.now() / 1000);
        if (now !== this.lastSecondTimestamp) {
            this.metrics.requestsPerSecond = this.requestsInLastSecond;
            this.requestsInLastSecond = 1;
            this.lastSecondTimestamp = now;
        }
        else {
            this.requestsInLastSecond++;
        }
    }
    cleanupSessionRateLimiters() {
        // Remove rate limiters for sessions that haven't been used recently
        const cutoffTime = Date.now() - 300000; // 5 minutes ago
        let cleaned = 0;
        for (const [sessionId, rateLimiter] of this.sessionRateLimiters.entries()) {
            // If the rate limiter has full tokens, it hasn't been used recently
            if (rateLimiter.getTokens() === this.config.maxRequestsPerSecond) {
                this.sessionRateLimiters.delete(sessionId);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            this.logger.debug('Cleaned up session rate limiters', { count: cleaned });
        }
    }
}
exports.LoadBalancer = LoadBalancer;
/**
 * Request queue for handling backpressure
 */
class RequestQueue {
    constructor(maxQueueSize = 1000, requestTimeout = 30000, // 30 seconds
    logger) {
        this.logger = logger;
        this.queue = [];
        this.processing = false;
        this.maxQueueSize = maxQueueSize;
        this.requestTimeout = requestTimeout;
        // Clean up expired requests periodically
        setInterval(() => {
            this.cleanupExpiredRequests();
        }, 10000); // Every 10 seconds
    }
    async enqueue(session, request, processor) {
        if (this.queue.length >= this.maxQueueSize) {
            throw new errors_js_1.MCPError('Request queue is full');
        }
        return new Promise((resolve, reject) => {
            this.queue.push({
                session,
                request,
                resolve,
                reject,
                timestamp: Date.now(),
            });
            if (!this.processing) {
                this.processQueue(processor);
            }
        });
    }
    async processQueue(processor) {
        if (this.processing) {
            return;
        }
        this.processing = true;
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            // Check if request has expired
            if (Date.now() - item.timestamp > this.requestTimeout) {
                item.reject(new errors_js_1.MCPError('Request timeout'));
                continue;
            }
            try {
                const result = await processor(item.session, item.request);
                item.resolve(result);
            }
            catch (error) {
                item.reject(error instanceof Error ? error : new Error(String(error)));
            }
        }
        this.processing = false;
    }
    cleanupExpiredRequests() {
        const now = Date.now();
        let cleaned = 0;
        this.queue = this.queue.filter((item) => {
            if (now - item.timestamp > this.requestTimeout) {
                item.reject(new errors_js_1.MCPError('Request timeout'));
                cleaned++;
                return false;
            }
            return true;
        });
        if (cleaned > 0) {
            this.logger.warn('Cleaned up expired requests from queue', { count: cleaned });
        }
    }
    getQueueSize() {
        return this.queue.length;
    }
    isProcessing() {
        return this.processing;
    }
}
exports.RequestQueue = RequestQueue;
