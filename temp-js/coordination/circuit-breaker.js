export var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "closed";
    CircuitState["OPEN"] = "open";
    CircuitState["HALF_OPEN"] = "half-open";
})(CircuitState || (CircuitState = {}));
/**
 * Circuit breaker for protecting against cascading failures
 */
export class CircuitBreaker {
    constructor(name, config, logger, eventBus) {
        this.name = name;
        this.config = config;
        this.logger = logger;
        this.eventBus = eventBus;
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.halfOpenRequests = 0;
        this.totalRequests = 0;
        this.rejectedRequests = 0;
    }
    /**
     * Execute a function with circuit breaker protection
     */
    async execute(fn) {
        this.totalRequests++;
        // Check if we should execute
        if (!this.canExecute()) {
            this.rejectedRequests++;
            const error = new Error(`Circuit breaker '${this.name}' is OPEN`);
            this.logStateChange('Request rejected');
            throw error;
        }
        try {
            // Execute the function
            const result = await fn();
            // Record success
            this.onSuccess();
            return result;
        }
        catch (error) {
            // Record failure
            this.onFailure();
            throw error;
        }
    }
    /**
     * Check if execution is allowed
     */
    canExecute() {
        switch (this.state) {
            case CircuitState.CLOSED:
                return true;
            case CircuitState.OPEN:
                // Check if we should transition to half-open
                if (this.nextAttempt && new Date() >= this.nextAttempt) {
                    this.transitionTo(CircuitState.HALF_OPEN);
                    return true;
                }
                return false;
            case CircuitState.HALF_OPEN:
                // Allow limited requests in half-open state
                return this.halfOpenRequests < this.config.halfOpenLimit;
            default:
                return false;
        }
    }
    /**
     * Handle successful execution
     */
    onSuccess() {
        this.lastSuccessTime = new Date();
        switch (this.state) {
            case CircuitState.CLOSED:
                this.failures = 0; // Reset failure count
                break;
            case CircuitState.HALF_OPEN:
                this.successes++;
                this.halfOpenRequests++;
                // Check if we should close the circuit
                if (this.successes >= this.config.successThreshold) {
                    this.transitionTo(CircuitState.CLOSED);
                }
                break;
            case CircuitState.OPEN:
                // Shouldn't happen, but handle gracefully
                this.transitionTo(CircuitState.HALF_OPEN);
                break;
        }
    }
    /**
     * Handle failed execution
     */
    onFailure() {
        this.lastFailureTime = new Date();
        switch (this.state) {
            case CircuitState.CLOSED:
                this.failures++;
                // Check if we should open the circuit
                if (this.failures >= this.config.failureThreshold) {
                    this.transitionTo(CircuitState.OPEN);
                }
                break;
            case CircuitState.HALF_OPEN:
                // Single failure in half-open state reopens the circuit
                this.transitionTo(CircuitState.OPEN);
                break;
            case CircuitState.OPEN:
                // Already open, update next attempt time
                this.nextAttempt = new Date(Date.now() + this.config.timeout);
                break;
        }
    }
    /**
     * Transition to a new state
     */
    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;
        this.logger.info(`Circuit breaker '${this.name}' state change`, {
            from: oldState,
            to: newState,
            failures: this.failures,
            successes: this.successes,
        });
        // Reset counters based on new state
        switch (newState) {
            case CircuitState.CLOSED:
                this.failures = 0;
                this.successes = 0;
                this.halfOpenRequests = 0;
                delete this.nextAttempt;
                break;
            case CircuitState.OPEN:
                this.successes = 0;
                this.halfOpenRequests = 0;
                this.nextAttempt = new Date(Date.now() + this.config.timeout);
                break;
            case CircuitState.HALF_OPEN:
                this.successes = 0;
                this.failures = 0;
                this.halfOpenRequests = 0;
                break;
        }
        // Emit state change event
        if (this.eventBus) {
            this.eventBus.emit('circuitbreaker:state-change', {
                name: this.name,
                from: oldState,
                to: newState,
                metrics: this.getMetrics(),
            });
        }
    }
    /**
     * Force the circuit to a specific state
     */
    forceState(state) {
        this.logger.warn(`Forcing circuit breaker '${this.name}' to state`, { state });
        this.transitionTo(state);
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Get circuit breaker metrics
     */
    getMetrics() {
        const metrics = {
            state: this.state,
            failures: this.failures,
            successes: this.successes,
            totalRequests: this.totalRequests,
            rejectedRequests: this.rejectedRequests,
            halfOpenRequests: this.halfOpenRequests,
        };
        if (this.lastFailureTime !== undefined) {
            metrics.lastFailureTime = this.lastFailureTime;
        }
        if (this.lastSuccessTime !== undefined) {
            metrics.lastSuccessTime = this.lastSuccessTime;
        }
        return metrics;
    }
    /**
     * Reset the circuit breaker
     */
    reset() {
        this.logger.info(`Resetting circuit breaker '${this.name}'`);
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        delete this.lastFailureTime;
        delete this.lastSuccessTime;
        delete this.nextAttempt;
        this.halfOpenRequests = 0;
        this.totalRequests = 0;
        this.rejectedRequests = 0;
    }
    /**
     * Log state change with consistent format
     */
    logStateChange(message) {
        this.logger.debug(`Circuit breaker '${this.name}': ${message}`, {
            state: this.state,
            failures: this.failures,
            successes: this.successes,
            nextAttempt: this.nextAttempt,
        });
    }
}
/**
 * Manager for multiple circuit breakers
 */
export class CircuitBreakerManager {
    constructor(defaultConfig, logger, eventBus) {
        this.defaultConfig = defaultConfig;
        this.logger = logger;
        this.eventBus = eventBus;
        this.breakers = new Map();
    }
    /**
     * Get or create a circuit breaker
     */
    getBreaker(name, config) {
        let breaker = this.breakers.get(name);
        if (!breaker) {
            const finalConfig = { ...this.defaultConfig, ...config };
            breaker = new CircuitBreaker(name, finalConfig, this.logger, this.eventBus);
            this.breakers.set(name, breaker);
        }
        return breaker;
    }
    /**
     * Execute with circuit breaker
     */
    async execute(name, fn, config) {
        const breaker = this.getBreaker(name, config);
        return breaker.execute(fn);
    }
    /**
     * Get all circuit breakers
     */
    getAllBreakers() {
        return new Map(this.breakers);
    }
    /**
     * Get metrics for all breakers
     */
    getAllMetrics() {
        const metrics = {};
        for (const [name, breaker] of this.breakers) {
            metrics[name] = breaker.getMetrics();
        }
        return metrics;
    }
    /**
     * Reset a specific breaker
     */
    resetBreaker(name) {
        const breaker = this.breakers.get(name);
        if (breaker) {
            breaker.reset();
        }
    }
    /**
     * Reset all breakers
     */
    resetAll() {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
    }
    /**
     * Force a breaker to a specific state
     */
    forceState(name, state) {
        const breaker = this.breakers.get(name);
        if (breaker) {
            breaker.forceState(state);
        }
    }
}
