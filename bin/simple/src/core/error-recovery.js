import { getLogger } from '../config/logging-config.ts';
import { isRecoverableError } from './errors.ts';
const logger = getLogger('ErrorRecovery');
export var CircuitBreakerState;
(function (CircuitBreakerState) {
    CircuitBreakerState["CLOSED"] = "closed";
    CircuitBreakerState["OPEN"] = "open";
    CircuitBreakerState["HALF_OPEN"] = "half_open";
})(CircuitBreakerState || (CircuitBreakerState = {}));
export class CircuitBreaker {
    name;
    config;
    state = CircuitBreakerState['CLOSED'];
    failureCount = 0;
    successCount = 0;
    lastFailureTime = 0;
    lastSuccessTime = 0;
    totalCalls = 0;
    totalFailures = 0;
    responseTimes = [];
    nextAttemptTime = 0;
    failureHistory = [];
    callHistory = [];
    constructor(name, config) {
        this.name = name;
        this.config = config;
    }
    async execute(operation, fallback) {
        const startTime = Date.now();
        this.totalCalls++;
        if (this.state === CircuitBreakerState['OPEN']) {
            if (Date.now() < this.nextAttemptTime) {
                logger.warn(`Circuit breaker [${this.name}] is OPEN - failing fast`);
                if (fallback) {
                    logger.info(`Circuit breaker [${this.name}] executing fallback`);
                    return await fallback();
                }
                throw new Error(`Circuit breaker [${this.name}] is open`);
            }
            this.state = CircuitBreakerState['HALF_OPEN'];
            this.successCount = 0;
            logger.info(`Circuit breaker [${this.name}] transitioning to HALF_OPEN`);
        }
        try {
            const result = await operation();
            this.onSuccess(Date.now() - startTime);
            return result;
        }
        catch (error) {
            this.onFailure(Date.now() - startTime);
            if (fallback && isRecoverableError(error)) {
                try {
                    logger.info(`Circuit breaker [${this.name}] attempting fallback after error`);
                    return await fallback();
                }
                catch (fallbackError) {
                    logger.error(`Circuit breaker [${this.name}] fallback also failed`, fallbackError);
                    throw error;
                }
            }
            throw error;
        }
    }
    onSuccess(responseTime) {
        this.failureCount = 0;
        this.successCount++;
        this.lastSuccessTime = Date.now();
        this.responseTimes.push(responseTime);
        if (this.responseTimes.length > 100) {
            this.responseTimes = this.responseTimes.slice(-50);
        }
        if (this.state === CircuitBreakerState['HALF_OPEN']) {
            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitBreakerState['CLOSED'];
                logger.info(`Circuit breaker [${this.name}] recovered - state: CLOSED`);
            }
        }
    }
    onFailure(responseTime) {
        this.failureCount++;
        this.totalFailures++;
        this.lastFailureTime = Date.now();
        this.responseTimes.push(responseTime);
        if (this.state === CircuitBreakerState['CLOSED'] ||
            this.state === CircuitBreakerState['HALF_OPEN']) {
            if (this.shouldOpenCircuit()) {
                this.state = CircuitBreakerState['OPEN'];
                this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
                logger.warn(`Circuit breaker [${this.name}] opened due to failures - next attempt: ${new Date(this.nextAttemptTime).toISOString()}`);
            }
        }
    }
    shouldOpenCircuit() {
        if (this.failureCount >= this.config.failureThreshold) {
            return true;
        }
        const windowStart = Date.now() - this.config.monitoringWindow;
        const recentFailures = this.failureHistory.filter((timestamp) => timestamp >= windowStart).length;
        const recentCalls = this.callHistory.filter((timestamp) => timestamp >= windowStart).length;
        const failureRate = recentCalls > 0 ? recentFailures / recentCalls : 0;
        return failureRate > 0.5 && recentCalls >= 10;
    }
    getMetrics() {
        const avgResponseTime = this.responseTimes.length > 0
            ? this.responseTimes.reduce((a, b) => a + b, 0) /
                this.responseTimes.length
            : 0;
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
            lastSuccessTime: this.lastSuccessTime,
            totalCalls: this.totalCalls,
            totalFailures: this.totalFailures,
            averageResponseTime: avgResponseTime,
        };
    }
    reset() {
        this.state = CircuitBreakerState['CLOSED'];
        this.failureCount = 0;
        this.successCount = 0;
        this.totalCalls = 0;
        this.totalFailures = 0;
        this.responseTimes = [];
        logger.info(`Circuit breaker [${this.name}] reset`);
    }
}
export class RetryStrategy {
    config;
    constructor(config = {}) {
        this.config = {
            maxAttempts: 3,
            initialDelayMs: 1000,
            maxDelayMs: 30000,
            exponentialBase: 2,
            jitterEnabled: true,
            retryableErrors: [
                'NetworkError',
                'TimeoutError',
                'ServiceUnavailableError',
            ],
            ...config,
        };
    }
    async execute(operation, operationName = 'unknown') {
        let lastError = new Error(`No attempts made for ${operationName}`);
        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                const result = await operation();
                if (attempt > 1) {
                    logger.info(`Retry strategy succeeded on attempt ${attempt} for ${operationName}`);
                }
                return result;
            }
            catch (error) {
                lastError = error;
                logger.warn(`Retry strategy attempt ${attempt}/${this.config.maxAttempts} failed for ${operationName}:`, error);
                if (attempt === this.config.maxAttempts ||
                    !this.shouldRetryError(error)) {
                    break;
                }
                const delay = this.calculateDelay(attempt);
                logger.info(`Retry strategy waiting ${delay}ms before attempt ${attempt + 1} for ${operationName}`);
                await this.sleep(delay);
            }
        }
        logger.error(`Retry strategy exhausted all ${this.config.maxAttempts} attempts for ${operationName}`);
        throw lastError;
    }
    shouldRetryError(error) {
        if (!isRecoverableError(error)) {
            return false;
        }
        return this.config.retryableErrors.some((errorType) => error.constructor.name === errorType || error.name === errorType);
    }
    calculateDelay(attempt) {
        const exponentialDelay = this.config.initialDelayMs * this.config.exponentialBase ** (attempt - 1);
        let delay = Math.min(exponentialDelay, this.config.maxDelayMs);
        if (this.config.jitterEnabled) {
            delay = delay * (0.5 + Math.random() * 0.5);
        }
        return Math.floor(delay);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
export class FallbackManager {
    operationName;
    strategies = [];
    constructor(operationName) {
        this.operationName = operationName;
    }
    addStrategy(strategy) {
        this.strategies.push(strategy);
        this.strategies.sort((a, b) => a.priority - b.priority);
    }
    async executeWithFallbacks(_primaryOperation, error) {
        for (const strategy of this.strategies) {
            if (strategy.condition && !strategy.condition(error)) {
                continue;
            }
            try {
                logger.info(`Executing fallback strategy '${strategy.name}' for ${this.operationName}`);
                const result = await strategy.handler();
                logger.info(`Fallback strategy '${strategy.name}' succeeded for ${this.operationName}`);
                return result;
            }
            catch (fallbackError) {
                logger.warn(`Fallback strategy '${strategy.name}' failed for ${this.operationName}:`, fallbackError);
            }
        }
        logger.error(`All fallback strategies failed for ${this.operationName}`);
        throw error;
    }
}
export class GracefulDegradationManager {
    currentLevel = 0;
    levels = new Map();
    errorCounts = new Map();
    errorThresholds = new Map();
    constructor() {
        this.initializeDefaultLevels();
    }
    initializeDefaultLevels() {
        this.addDegradationLevel({
            level: 0,
            name: 'Full Functionality',
            description: 'All systems operational',
            enabledFeatures: [
                'fact_gather',
                'rag_search',
                'swarm_coordination',
                'neural_processing',
                'wasm_computation',
            ],
            disabledFeatures: [],
        });
        this.addDegradationLevel({
            level: 3,
            name: 'Reduced Performance',
            description: 'Non-critical features disabled',
            enabledFeatures: ['fact_gather', 'rag_search', 'swarm_coordination'],
            disabledFeatures: ['neural_processing', 'wasm_computation'],
        });
        this.addDegradationLevel({
            level: 6,
            name: 'Core Features Only',
            description: 'Only essential operations available',
            enabledFeatures: ['fact_gather', 'rag_search'],
            disabledFeatures: [
                'swarm_coordination',
                'neural_processing',
                'wasm_computation',
            ],
        });
        this.addDegradationLevel({
            level: 9,
            name: 'Emergency Mode',
            description: 'Basic functionality only',
            enabledFeatures: ['fact_query'],
            disabledFeatures: [
                'fact_gather',
                'rag_search',
                'swarm_coordination',
                'neural_processing',
                'wasm_computation',
            ],
        });
        this.errorThresholds.set('NetworkError', 5);
        this.errorThresholds.set('TimeoutError', 3);
        this.errorThresholds.set('WASMError', 2);
        this.errorThresholds.set('SwarmError', 4);
    }
    addDegradationLevel(level) {
        this.levels.set(level.level, level);
    }
    reportError(error) {
        const errorType = error.constructor.name;
        const currentCount = this.errorCounts.get(errorType) || 0;
        this.errorCounts.set(errorType, currentCount + 1);
        this.evaluateDegradation();
    }
    evaluateDegradation() {
        let requiredLevel = 0;
        for (const [errorType, count] of this.errorCounts.entries()) {
            const threshold = this.errorThresholds.get(errorType) || 10;
            if (count >= threshold) {
                if (errorType === 'WASMError' || errorType === 'SwarmError') {
                    requiredLevel = Math.max(requiredLevel, 6);
                }
                else if (errorType === 'NetworkError') {
                    requiredLevel = Math.max(requiredLevel, 3);
                }
                else if (errorType === 'TimeoutError') {
                    requiredLevel = Math.max(requiredLevel, 3);
                }
            }
        }
        if (requiredLevel > this.currentLevel) {
            this.setDegradationLevel(requiredLevel);
        }
    }
    setDegradationLevel(level) {
        const degradationLevel = this.levels.get(level);
        if (!degradationLevel) {
            logger.error(`Invalid degradation level: ${level}`);
            return;
        }
        const previousLevel = this.currentLevel;
        this.currentLevel = level;
        logger.warn(`Graceful degradation: ${degradationLevel.name} (level ${level}) - ${degradationLevel.description}`);
        logger.info(`Enabled features: ${degradationLevel.enabledFeatures.join(', ')}`);
        logger.info(`Disabled features: ${degradationLevel.disabledFeatures.join(', ')}`);
        if (level > previousLevel) {
            logger.warn('System functionality has been reduced due to errors');
        }
        else if (level < previousLevel) {
            logger.info('System functionality has been restored');
        }
    }
    isFeatureEnabled(feature) {
        const currentDegradationLevel = this.levels.get(this.currentLevel);
        return currentDegradationLevel?.enabledFeatures.includes(feature);
    }
    getCurrentLevel() {
        return this.levels.get(this.currentLevel);
    }
    resetErrorCounts() {
        this.errorCounts.clear();
        this.setDegradationLevel(0);
        logger.info('Error counts reset - returning to full functionality');
    }
    getErrorCounts() {
        return new Map(this.errorCounts);
    }
}
export class CircuitBreakerRegistry {
    static instance;
    breakers = new Map();
    static getInstance() {
        if (!CircuitBreakerRegistry.instance) {
            CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
        }
        return CircuitBreakerRegistry.instance;
    }
    getOrCreate(name, config) {
        if (!this.breakers.has(name)) {
            const defaultConfig = {
                failureThreshold: 5,
                recoveryTimeout: 60000,
                successThreshold: 3,
                monitoringWindow: 300000,
                maxRetries: 3,
            };
            const finalConfig = { ...defaultConfig, ...config };
            this.breakers.set(name, new CircuitBreaker(name, finalConfig));
        }
        return this.breakers.get(name);
    }
    getAllMetrics() {
        const metrics = new Map();
        for (const [name, breaker] of this.breakers.entries()) {
            metrics.set(name, breaker.getMetrics());
        }
        return metrics;
    }
    resetAll() {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
        logger.info('All circuit breakers reset');
    }
}
export class ErrorRecoveryOrchestrator {
    circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
    degradationManager = new GracefulDegradationManager();
    retryStrategies = new Map();
    fallbackManagers = new Map();
    async executeWithRecovery(operationName, operation, options = {}) {
        const circuitBreaker = this.circuitBreakerRegistry.getOrCreate(operationName, {
            failureThreshold: options?.['circuitBreakerThreshold'] || 5,
            maxRetries: options?.['maxRetries'] || 3,
        });
        const retryStrategy = this.getOrCreateRetryStrategy(operationName, options);
        try {
            return await circuitBreaker.execute(async () => {
                return await retryStrategy.execute(operation, operationName);
            });
        }
        catch (error) {
            this.degradationManager.reportError(error);
            if (options?.['fallbackEnabled']) {
                const fallbackManager = this.fallbackManagers.get(operationName);
                if (fallbackManager) {
                    return await fallbackManager.executeWithFallbacks(operation, error);
                }
            }
            throw error;
        }
    }
    getOrCreateRetryStrategy(operationName, options) {
        if (!this.retryStrategies.has(operationName)) {
            this.retryStrategies.set(operationName, new RetryStrategy({
                maxAttempts: options?.['maxRetries'] || 3,
                initialDelayMs: options?.['retryDelayMs'] || 1000,
                exponentialBase: options?.['exponentialBackoff'] ? 2 : 1,
            }));
        }
        return this.retryStrategies.get(operationName);
    }
    addFallbackStrategy(operationName, strategy) {
        if (!this.fallbackManagers.has(operationName)) {
            this.fallbackManagers.set(operationName, new FallbackManager(operationName));
        }
        this.fallbackManagers.get(operationName)?.addStrategy(strategy);
    }
    getSystemHealth() {
        return {
            degradationLevel: this.degradationManager.getCurrentLevel(),
            circuitBreakers: this.circuitBreakerRegistry.getAllMetrics(),
            errorCounts: this.degradationManager.getErrorCounts(),
        };
    }
    resetSystem() {
        this.circuitBreakerRegistry.resetAll();
        this.degradationManager.resetErrorCounts();
        logger.info('Error recovery system reset');
    }
    isFeatureEnabled(feature) {
        return this.degradationManager.isFeatureEnabled(feature);
    }
}
export const errorRecoveryOrchestrator = new ErrorRecoveryOrchestrator();
//# sourceMappingURL=error-recovery.js.map