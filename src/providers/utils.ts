/**
 * Provider Utilities
 * Common utilities and helpers for AI provider management
 */

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate AI request structure
 */
export function validateAIRequest(_request = === 0) {
    throw new Error('Messages array is required and cannot be empty');
  }

for (const message of request.messages) {
    if (!message.role || !message.content) {
      throw new Error('Each message must have role and content');
    }
    
    if (!['system', 'user', 'assistant', 'function'].includes(message.role)) {
      throw new Error(`Invalid messagerole = = undefined && (request.temperature < 0 || request.temperature > 2)) {
    throw new Error('Temperature must be between 0 and 2');
  }
  
  if (request.maxTokens !== undefined && request.maxTokens < 1) {
    throw new Error('Max tokens must be greater than 0');
  }
  
  if (request.topP !== undefined && (request.topP < 0 || request.topP > 1)) {
    throw new Error('Top P must be between 0 and 1');
  }
}

/**
 * Calculate cost based on token usage and pricing
 */
export function calculateTokenCost(promptTokens = (promptTokens / 1000) * inputPrice;
  const outputCost = (completionTokens / 1000) * outputPrice;
  return inputCost + outputCost;
}

/**
 * Estimate token count for text (rough approximation)
 */
export function estimateTokenCount(text = 100;
  
  // Penalize based on error rate
  const errorRate = metrics.failedRequests / Math.max(metrics.totalRequests, 1);
  score -= errorRate * 50;
  
  // Penalize based on response time (over 1 second is bad)
  if (metrics.averageResponseTime > 1000) {
    score -= Math.min((metrics.averageResponseTime - 1000) / 100, 30);
  }
  
  // Bonus for successful requests
  if (metrics.successfulRequests > 0) {
    score += Math.min(metrics.successfulRequests / 1000, 10);
  }
  
  // Status penalties
  if (status.status === 'degraded') {
    score -= 20;
  } else if (status.status === 'offline') {
    score = 0;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Format duration in human readable format
 */
export function formatDuration(milliseconds = > setTimeout(resolve, milliseconds));
}

/**
 * Exponential backoff calculation
 */
export function calculateBackoffDelay(attempt = 1000,
  maxDelay = 30000,
  backoffFactor = 2
): number {
  const delay = baseDelay * Math.pow(backoffFactor, attempt);
  return Math.min(delay + Math.random() * 1000, maxDelay); // Add jitter
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests = [];
  private tokens = [];

  constructor(
    private requestsPerMinute = 0): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old entries
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    this.tokens = this.tokens.filter(time => time > oneMinuteAgo);

    // Check limits
    if (this.requests.length >= this.requestsPerMinute) {
      return false;
    }

    if (tokenCount > 0 && this.tokens.length + tokenCount > this.tokensPerMinute) {
      return false;
    }

    return true;
  }

  recordRequest(tokenCount = 0): void {
    const now = Date.now();
    this.requests.push(now);

    for (const i = 0; i < tokenCount; i++) {
      this.tokens.push(now);
    }
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length === 0) return 0;

    const oldestRequest = Math.min(...this.requests);
    const timeUntilReset = oldestRequest + 60000 - Date.now();
    return Math.max(0, timeUntilReset);
  }
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state = 'closed';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000
  ) {}

  async execute<T>(operation = > Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(operation = > Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,shouldRetry = > boolean = () => true
): Promise<T> {
  let lastError = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delayTime = calculateBackoffDelay(attempt, baseDelay);
      await delay(delayTime);
    }
  }

  throw lastError;
}

/**
 * Load balancer utility
 */
export class LoadBalancer<T> {
  private roundRobinIndex = 0;

  constructor(private strategy) {}

  select(items = > any = () => ({})): T | null {
    if (items.length === 0) return null;
    if (items.length === 1) return items[0];

    switch (this.strategy.type) {
      case 'round_robin':
        return this.selectRoundRobin(items);
      
      case 'least_latency':
        return this.selectLeastLatency(items, getMetrics);
      
      case 'weighted':
        return this.selectWeighted(items, this.strategy.weights || {});default = items[this.roundRobinIndex % items.length];
    this.roundRobinIndex++;
    return item;
  }

  private selectLeastLatency(items = > any): T {
    return items.reduce((best, current) => {
      const bestMetrics = getMetrics(best);
      const currentMetrics = getMetrics(current);
      
      const bestLatency = bestMetrics.averageResponseTime || Infinity;
      const currentLatency = currentMetrics.averageResponseTime || Infinity;
      
      return currentLatency < bestLatency ?current = items.filter((item) => weights[item.name] > 0);
    if (weightedItems.length === 0) return items[0];

    const totalWeight = weightedItems.reduce((sum,item = > 
      sum + (weights[item.name] || 1), 0);
    
    const random = Math.random() * totalWeight;

    for (const item of weightedItems) {
      random -= weights[(item as any).name] || 1;
      if (random <= 0) return item;
    }

    return weightedItems[0];
  }
}
