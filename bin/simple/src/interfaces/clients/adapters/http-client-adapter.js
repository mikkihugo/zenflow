import { EventEmitter } from 'node:events';
import axios from 'axios';
import { AuthenticationError, ConnectionError, RetryExhaustedError, TimeoutError, } from '../core/interfaces.ts';
export class HTTPClientAdapter extends EventEmitter {
    config;
    name;
    http;
    connected = false;
    metrics;
    healthTimer;
    metricsTimer;
    requestCount = 0;
    successCount = 0;
    errorCount = 0;
    latencySum = 0;
    latencies = [];
    startTime = Date.now();
    constructor(config) {
        super();
        this.config = { ...config };
        this.name = config?.name;
        this.http = this.createHttpClient();
        this.metrics = this.initializeMetrics();
        if (config?.monitoring?.enabled) {
            this.startMonitoring();
        }
        if (config?.health) {
            this.startHealthChecks();
        }
    }
    createHttpClient() {
        const client = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...this.config.headers,
            },
            validateStatus: this.config.validateStatus ||
                ((status) => status >= 200 && status < 300),
            maxRedirects: this.config.maxRedirects || 5,
            decompress: this.config.compression !== false,
        });
        this.setupAuthentication(client);
        this.setupRetryLogic(client);
        this.setupErrorHandling(client);
        this.setupInterceptors(client);
        this.setupMetricsCollection(client);
        return client;
    }
    setupAuthentication(client) {
        const auth = this.config.authentication;
        if (!auth)
            return;
        switch (auth.type) {
            case 'bearer':
                if (auth.token) {
                    client.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
                }
                break;
            case 'apikey':
                if (auth.apiKey) {
                    const header = auth.apiKeyHeader || 'X-API-Key';
                    client.defaults.headers.common[header] = auth.apiKey;
                }
                break;
            case 'basic':
                if (auth.username && auth.password) {
                    const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
                    client.defaults.headers.common.Authorization = `Basic ${credentials}`;
                }
                break;
            case 'oauth':
                this.setupOAuthInterceptor(client);
                break;
            case 'custom':
                if (auth.customAuth) {
                    client.interceptors.request.use(auth.customAuth);
                }
                break;
        }
        if (auth.customHeaders) {
            Object.assign(client.defaults.headers.common, auth.customHeaders);
        }
    }
    setupOAuthInterceptor(client) {
        const auth = this.config.authentication;
        if (!auth?.credentials)
            return;
        client.interceptors.request.use(async (config) => {
            const token = await this.getValidOAuthToken(auth.credentials);
            if (token) {
                config.headers = config?.headers || {};
                config?.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }
    async getValidOAuthToken(credentials) {
        if (credentials.accessToken &&
            credentials.expiresAt &&
            credentials.expiresAt > new Date()) {
            return credentials.accessToken;
        }
        if (credentials.refreshToken) {
            try {
                const response = await axios.post(credentials.tokenUrl, {
                    grant_type: 'refresh_token',
                    refresh_token: credentials.refreshToken,
                    client_id: credentials.clientId,
                    client_secret: credentials.clientSecret,
                });
                credentials.accessToken = response?.data?.access_token;
                credentials.refreshToken =
                    response?.data?.refresh_token || credentials.refreshToken;
                credentials.expiresAt = new Date(Date.now() + response?.data?.expires_in * 1000);
                return credentials.accessToken;
            }
            catch (error) {
                this.emit('error', new AuthenticationError(this.name, error));
                return null;
            }
        }
        return null;
    }
    setupRetryLogic(client) {
        const retryConfig = this.config.retry;
        if (!retryConfig)
            return;
        client.interceptors.response.use((response) => response, async (error) => {
            const config = error.config;
            if (!config || config?.__retryCount >= retryConfig?.attempts) {
                this.emit('error', new RetryExhaustedError(this.name, retryConfig?.attempts, error));
                return Promise.reject(error);
            }
            config.__retryCount = (config?.__retryCount || 0) + 1;
            if (this.shouldRetry(error, retryConfig)) {
                const delay = this.calculateRetryDelay(config?.__retryCount, retryConfig);
                await new Promise((resolve) => setTimeout(resolve, delay));
                this.emit('retry', {
                    attempt: config?.__retryCount,
                    error: error.message,
                    delay,
                });
                return client(config);
            }
            return Promise.reject(error);
        });
    }
    shouldRetry(error, retryConfig) {
        if (retryConfig?.retryCondition) {
            return retryConfig?.retryCondition(error);
        }
        if (!error.response) {
            return true;
        }
        const status = error.response.status;
        const retryStatusCodes = retryConfig?.retryStatusCodes || [
            408, 429, 500, 502, 503, 504,
        ];
        return retryStatusCodes.includes(status);
    }
    calculateRetryDelay(attempt, retryConfig) {
        const baseDelay = retryConfig?.delay || 1000;
        const maxDelay = retryConfig?.maxDelay || 30000;
        let delay;
        switch (retryConfig?.backoff) {
            case 'exponential':
                delay = baseDelay * 2 ** (attempt - 1);
                break;
            case 'linear':
                delay = baseDelay * attempt;
                break;
            default:
                delay = baseDelay;
                break;
        }
        return Math.min(delay, maxDelay);
    }
    setupErrorHandling(client) {
        client.interceptors.response.use((response) => response, (error) => {
            let clientError;
            if (!error.response) {
                clientError = new ConnectionError(this.name, error);
            }
            else if (error.response.status === 401) {
                clientError = new AuthenticationError(this.name, error);
            }
            else if (error.code === 'ECONNABORTED') {
                clientError = new TimeoutError(this.name, this.config.timeout || 30000, error);
            }
            else {
                clientError = new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
                clientError.status = error.response.status;
                clientError.statusText = error.response.statusText;
                clientError.headers = error.response.headers;
                clientError.data = error.response.data;
            }
            this.emit('error', clientError);
            throw clientError;
        });
    }
    setupInterceptors(client) {
        if (this.config.requestInterceptors) {
            this.config.requestInterceptors.forEach((interceptor) => {
                client.interceptors.request.use(interceptor);
            });
        }
        if (this.config.responseInterceptors) {
            this.config.responseInterceptors.forEach((interceptor) => {
                client.interceptors.response.use(interceptor);
            });
        }
    }
    setupMetricsCollection(client) {
        client.interceptors.request.use((config) => {
            config.__startTime = Date.now();
            this.requestCount++;
            return config;
        });
        client.interceptors.response.use((response) => {
            this.recordSuccess(response?.config);
            return response;
        }, (error) => {
            this.recordError(error.config);
            throw error;
        });
    }
    recordSuccess(config) {
        this.successCount++;
        this.recordLatency(config);
    }
    recordError(config) {
        this.errorCount++;
        this.recordLatency(config);
    }
    recordLatency(config) {
        if (config?.__startTime) {
            const latency = Date.now() - config?.__startTime;
            this.latencySum += latency;
            this.latencies.push(latency);
            if (this.latencies.length > 1000) {
                this.latencies = this.latencies.slice(-1000);
            }
        }
    }
    initializeMetrics() {
        return {
            name: this.name,
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0,
            p95Latency: 0,
            p99Latency: 0,
            throughput: 0,
            timestamp: new Date(),
        };
    }
    startMonitoring() {
        const interval = this.config.monitoring?.metricsInterval || 60000;
        this.metricsTimer = setInterval(() => {
            this.updateMetrics();
        }, interval);
    }
    startHealthChecks() {
        const health = this.config.health;
        this.healthTimer = setInterval(async () => {
            try {
                await this.healthCheck();
            }
            catch (error) {
                this.emit('error', error);
            }
        }, health.interval);
    }
    updateMetrics() {
        const now = new Date();
        const elapsed = (now.getTime() - this.startTime) / 1000;
        this.metrics = {
            name: this.name,
            requestCount: this.requestCount,
            successCount: this.successCount,
            errorCount: this.errorCount,
            averageLatency: this.requestCount > 0 ? this.latencySum / this.requestCount : 0,
            p95Latency: this.calculatePercentile(0.95),
            p99Latency: this.calculatePercentile(0.99),
            throughput: elapsed > 0 ? this.requestCount / elapsed : 0,
            timestamp: now,
        };
    }
    calculatePercentile(percentile) {
        if (this.latencies.length === 0)
            return 0;
        const sorted = [...this.latencies].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile) - 1;
        return sorted[Math.max(0, index)];
    }
    async connect() {
        try {
            await this.http.get(this.config.health?.endpoint || '/health', {
                timeout: 5000,
            });
            this.connected = true;
            this.emit('connect');
        }
        catch (error) {
            this.connected = false;
            this.emit('error', new ConnectionError(this.name, error));
            throw error;
        }
    }
    async disconnect() {
        this.connected = false;
        if (this.healthTimer) {
            clearInterval(this.healthTimer);
            this.healthTimer = undefined;
        }
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
            this.metricsTimer = undefined;
        }
        this.emit('disconnect');
    }
    isConnected() {
        return this.connected;
    }
    async healthCheck() {
        const startTime = Date.now();
        try {
            const endpoint = this.config.health?.endpoint || '/health';
            const timeout = this.config.health?.timeout || 5000;
            await this.http.get(endpoint, { timeout });
            const responseTime = Date.now() - startTime;
            const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
            const uptime = (Date.now() - this.startTime) / 1000;
            return {
                name: this.name,
                status: errorRate > 0.1 ? 'degraded' : 'healthy',
                lastCheck: new Date(),
                responseTime,
                errorRate,
                uptime,
                metadata: {
                    requests: this.requestCount,
                    errors: this.errorCount,
                },
            };
        }
        catch (error) {
            return {
                name: this.name,
                status: 'unhealthy',
                lastCheck: new Date(),
                responseTime: Date.now() - startTime,
                errorRate: 1,
                uptime: (Date.now() - this.startTime) / 1000,
                metadata: {
                    error: error.message,
                },
            };
        }
    }
    async getMetrics() {
        this.updateMetrics();
        return { ...this.metrics };
    }
    async get(endpoint, options) {
        const config = this.buildAxiosConfig('GET', endpoint, undefined, options);
        const response = await this.http.get(endpoint, config);
        return this.transformResponse(response);
    }
    async post(endpoint, data, options) {
        const config = this.buildAxiosConfig('POST', endpoint, data, options);
        const response = await this.http.post(endpoint, data, config);
        return this.transformResponse(response);
    }
    async put(endpoint, data, options) {
        const config = this.buildAxiosConfig('PUT', endpoint, data, options);
        const response = await this.http.put(endpoint, data, config);
        return this.transformResponse(response);
    }
    async delete(endpoint, options) {
        const config = this.buildAxiosConfig('DELETE', endpoint, undefined, options);
        const response = await this.http.delete(endpoint, config);
        return this.transformResponse(response);
    }
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.http = this.createHttpClient();
    }
    async destroy() {
        await this.disconnect();
        this.removeAllListeners();
    }
    buildAxiosConfig(method, endpoint, data, options) {
        return {
            method: method,
            url: endpoint,
            data,
            timeout: options?.timeout,
            headers: options?.headers,
            metadata: options?.metadata,
        };
    }
    transformResponse(response) {
        return {
            data: response?.data,
            status: response?.status,
            statusText: response?.statusText,
            headers: response?.headers,
            config: response?.config,
            metadata: response?.config?.metadata,
        };
    }
    getCapabilities() {
        return {
            supportedMethods: [
                'GET',
                'POST',
                'PUT',
                'DELETE',
                'PATCH',
                'HEAD',
                'OPTIONS',
            ],
            supportsStreaming: true,
            supportsCompression: this.config.compression !== false,
            supportsHttp2: this.config.http2,
            supportsWebSockets: false,
            maxConcurrentRequests: 100,
            supportedAuthMethods: ['bearer', 'apikey', 'basic', 'oauth', 'custom'],
        };
    }
    getAxiosInstance() {
        return this.http;
    }
}
//# sourceMappingURL=http-client-adapter.js.map