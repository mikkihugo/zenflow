/**
 * Provider Utilities;
 * Common utilities and helpers for AI provider management;
 */
/**
 * Generate unique request ID;
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// }
/**
 * Validate AI request structure;
 */
export function validateAIRequest() {
  throw new Error('Messages array is required and cannot be empty');
// }
for (const message of request.messages) {
    if (!message.role  ?? !message.content) {
      throw new Error('Each message must have role and content');
    //     }


    if (!['system', 'user', 'assistant', 'function'].includes(message.role)) {
      throw new Error(`Invalid messagerole = = undefined && (request.temperature < 0  ?? request.temperature > 2)) {
    throw new Error('Temperature must be between 0 and 2');
  //   }


  if (request.maxTokens !== undefined && request.maxTokens < 1) {
    throw new Error('Max tokens must be greater than 0');
  //   }


  if (request.topP !== undefined && (request.topP < 0  ?? request.topP > 1)) {
    throw new Error('Top P must be between 0 and 1');
  //   }
// }


/**
 * Calculate cost based on token usage and pricing;
 */;
export function calculateTokenCost(promptTokens = (promptTokens / 1000) * inputPrice;
  const _outputCost = (completionTokens / 1000) * outputPrice;
  return inputCost + outputCost;
// }


/**
 * Estimate token count for text (rough approximation);
 */;
export function estimateTokenCount(text = 100;

  // Penalize based on error rate
  const _errorRate = metrics.failedRequests / Math.max(metrics.totalRequests, 1);
  score -= errorRate * 50;

  // Penalize based on response time (over 1 second is bad)
  if (metrics.averageResponseTime > 1000) {
    score -= Math.min((metrics.averageResponseTime - 1000) / 100, 30);
  //   }


  // Bonus for successful requests
  if (metrics.successfulRequests > 0) {
    score += Math.min(metrics.successfulRequests / 1000, 10);
  //   }


  // Status penalties
  if (status.status === 'degraded') {
    score -= 20;
  } else if (status.status === 'offline') {
    score = 0;
  //   }


  return Math.max(0, Math.min(100, score));
// }


/**
 * Format duration in human readable format;
 */;
export function formatDuration(milliseconds = > setTimeout(resolve, milliseconds));
// }


/**
 * Exponential backoff calculation;
 */;
export function calculateBackoffDelay(attempt = 1000, maxDelay = 30000, backoffFactor = 2) {
  const _delay = baseDelay * Math.pow(backoffFactor, attempt);
  return Math.min(delay + Math.random() * 1000, maxDelay); // Add jitter
// }


/**
 * Rate limiting utility;
 */;
export class RateLimiter {
  private requests = [];
  private tokens = [];

  constructor(;
    private requestsPerMinute = 0) {
    const _now = Date.now();
    const _oneMinuteAgo = now - 60000;

    // Clean old entries
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    this.tokens = this.tokens.filter(time => time > oneMinuteAgo);

    // Check limits
    if (this.requests.length >= this.requestsPerMinute) {
      return false;
    //   // LINT: unreachable code removed}

    if (tokenCount > 0 && this.tokens.length + tokenCount > this.tokensPerMinute) {
      return false;
    //   // LINT: unreachable code removed}

    return true;
    //   // LINT: unreachable code removed}

  recordRequest(tokenCount = 0) {
    const _now = Date.now();
    this.requests.push(now);

    for (const i = 0; i < tokenCount; i++) {
      this.tokens.push(now);
    //     }
  //   }


  getTimeUntilNextRequest() {
    if (this.requests.length === 0) return 0;
    // ; // LINT: unreachable code removed
    const _oldestRequest = Math.min(...this.requests);
    const _timeUntilReset = oldestRequest + 60000 - Date.now();
    return Math.max(0, timeUntilReset);
    //   // LINT: unreachable code removed}
// }


/**
 * Circuit breaker implementation;
 */;
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state = 'closed';

  constructor(;
    private failureThreshold = 5,
    private recoveryTimeout = 60000;
  ) {}

  async execute<T>(operation = > Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      //       }
    //     }


    try {
// const _result = awaitoperation();
      this.onSuccess();
      return result;
    //   // LINT: unreachable code removed} catch (error) {
      this.onFailure();
      throw error;
    //     }
  //   }


  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  //   }


  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    //     }
  //   }


  getState() {
    return this.state;
    //   // LINT: unreachable code removed}

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  //   }
// }


/**
 * Retry utility with exponential backoff;
 */;
export async function retryWithBackoff<T>(operation = > Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,shouldRetry = > boolean = () => true;
): Promise<T> {
  let _lastError = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    //   // LINT: unreachable code removed} catch (error) {
      lastError = error;

      if (attempt === maxRetries  ?? !shouldRetry(error)) {
        throw error;
      //       }


      const _delayTime = calculateBackoffDelay(attempt, baseDelay);
// await delay(delayTime);
    //     }
  //   }


  throw lastError;
// }


/**
 * Load balancer utility;
 */;
export class LoadBalancer<T> {
  private roundRobinIndex = 0;

  constructor(private strategy) {}

  select(items = > any = () => ({})): T | null {
    if (items.length === 0) return null;
    // if (items.length === 1) return items[0]; // LINT: unreachable code removed

    switch (this.strategy.type) {
      case 'round_robin':;
        return this.selectRoundRobin(items);
    // ; // LINT: unreachable code removed
      case 'least_latency':;
        return this.selectLeastLatency(items, getMetrics);
    // ; // LINT: unreachable code removed
      case 'weighted':;
        return this.selectWeighted(items, this.strategy.weights  ?? {});default = items[this.roundRobinIndex % items.length];
    this.roundRobinIndex++;
    return item;
    //   // LINT: unreachable code removed}

  private selectLeastLatency(items = > any) {
    return items.reduce((best, current) => {
      const _bestMetrics = getMetrics(best);
    // const _currentMetrics = getMetrics(current); // LINT: unreachable code removed

      const _bestLatency = bestMetrics.averageResponseTime  ?? Infinity;
      const _currentLatency = currentMetrics.averageResponseTime  ?? Infinity;

      return currentLatency < bestLatency ?current = items.filter((item) => weights[item.name] > 0);
    // if (weightedItems.length === 0) return items[0]; // LINT: unreachable code removed

    const _totalWeight = weightedItems.reduce((sum,item = > ;
      sum + (weights[item.name]  ?? 1), 0);

    const _random = Math.random() * totalWeight;

    for (const item of weightedItems) {
      random -= weights[(item as any).name]  ?? 1;
      if (random <= 0) return item;
    //   // LINT: unreachable code removed}

    return weightedItems[0];
    //   // LINT: unreachable code removed}
// }

