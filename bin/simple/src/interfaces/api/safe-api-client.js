import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-api-safe-api-client');
import { extractErrorMessage, isAPIError, isAPISuccess, } from '../utils/type-guards';
export class SafeAPIClient {
    baseURL;
    defaultHeaders;
    timeout;
    constructor(baseURL, defaultHeaders = {}, timeout = 30000) {
        this.baseURL = baseURL.replace(/\/$/, '');
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...defaultHeaders,
        };
        this.timeout = timeout;
    }
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: data,
        });
    }
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body: data });
    }
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
    async request(endpoint, options) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        try {
            const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
            const headers = { ...this.defaultHeaders, ...options?.headers };
            const requestOptions = {
                method: options?.method,
                headers,
                signal: AbortSignal.timeout(options?.timeout ?? this.timeout),
            };
            if (options?.body && ['POST', 'PUT', 'PATCH'].includes(options?.method)) {
                requestOptions.body =
                    typeof options.body === 'string'
                        ? options?.body
                        : JSON.stringify(options?.body);
            }
            const maxRetries = options?.retries ?? 3;
            let lastError = null;
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const response = await fetch(url, requestOptions);
                    const duration = Date.now() - startTime;
                    const metadata = {
                        timestamp: new Date().toISOString(),
                        requestId,
                        version: '1.0.0',
                        duration,
                        retryCount: attempt,
                    };
                    if (response?.ok) {
                        const contentType = response?.headers?.get('content-type');
                        let data;
                        if (contentType?.includes('application/json')) {
                            data = (await response?.json());
                        }
                        else {
                            data = (await response?.text());
                        }
                        return {
                            success: true,
                            data,
                            metadata,
                        };
                    }
                    const errorData = await this.parseErrorResponse(response);
                    return {
                        success: false,
                        error: {
                            code: `HTTP_${response?.status}`,
                            message: errorData?.message || response?.statusText,
                            details: {
                                status: response?.status,
                                statusText: response?.statusText,
                                url,
                                method: options?.method,
                                ...errorData,
                            },
                        },
                        metadata,
                    };
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    if (this.isNonRetryableError(lastError)) {
                        break;
                    }
                    if (attempt < maxRetries) {
                        await this.delay(2 ** attempt * 1000);
                    }
                }
            }
            const duration = Date.now() - startTime;
            const metadata = {
                timestamp: new Date().toISOString(),
                requestId,
                version: '1.0.0',
                duration,
                retryCount: maxRetries,
            };
            return {
                success: false,
                error: {
                    code: 'REQUEST_FAILED',
                    message: lastError?.message || 'Request failed after all retries',
                    details: {
                        url,
                        method: options?.method,
                        maxRetries,
                        originalError: lastError?.message,
                    },
                    stack: lastError?.stack,
                },
                metadata,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const metadata = {
                timestamp: new Date().toISOString(),
                requestId,
                version: '1.0.0',
                duration,
            };
            return {
                success: false,
                error: {
                    code: 'UNEXPECTED_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred',
                    details: { endpoint, options },
                    stack: error instanceof Error ? error.stack : undefined,
                },
                metadata,
            };
        }
    }
    async parseErrorResponse(response) {
        try {
            const contentType = response?.headers?.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response?.json();
            }
            const text = await response?.text();
            return { message: text };
        }
        catch {
            return { message: 'Failed to parse error response' };
        }
    }
    isNonRetryableError(error) {
        const nonRetryablePatterns = [
            'abort',
            'timeout',
            'authentication',
            'authorization',
            'permission',
        ];
        const message = error.message.toLowerCase();
        return nonRetryablePatterns.some((pattern) => message.includes(pattern));
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
export class SafeAPIService {
    client;
    constructor(baseURL, apiKey) {
        const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
        this.client = new SafeAPIClient(baseURL, headers);
    }
    async createResource(endpoint, data) {
        return this.client.post(endpoint, data);
    }
    async getResource(endpoint, id) {
        return this.client.get(`${endpoint}/${id}`);
    }
    async listResources(endpoint, params) {
        const queryString = params
            ? `?${new URLSearchParams(params).toString()}`
            : '';
        return this.client.get(`${endpoint}${queryString}`);
    }
    async updateResource(endpoint, id, data) {
        return this.client.put(`${endpoint}/${id}`, data);
    }
    async deleteResource(endpoint, id) {
        return this.client.delete(`${endpoint}/${id}`);
    }
}
export async function safeAPIUsageExample() {
    const apiService = new SafeAPIService('https://api.example.com', 'your-api-key');
    const createData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
    };
    const createResult = await apiService.createResource('/users', createData);
    if (isAPISuccess(createResult)) {
        const getResult = await apiService.getResource('/users', createResult?.data?.id);
        if (isAPISuccess(getResult)) {
        }
        else if (isAPIError(getResult)) {
            logger.error('❌ Failed to retrieve user:', getResult?.error?.message);
            logger.error('Error code:', getResult?.error?.code);
        }
    }
    else if (isAPIError(createResult)) {
        logger.error('❌ Failed to create user:', createResult?.error?.message);
        logger.error('Error details:', createResult?.error?.details);
        switch (createResult?.error?.code) {
            case 'HTTP_409':
                logger.error('User already exists');
                break;
            case 'HTTP_422':
                logger.error('Invalid user data provided');
                break;
            default:
                logger.error('Unexpected error occurred');
        }
    }
    const listResult = await apiService.listResources('/users', {
        page: 1,
        limit: 10,
        sort: 'created_at',
    });
    if (isAPISuccess(listResult)) {
        listResult?.data?.items.forEach((_user) => { });
    }
    else if (isAPIError(listResult)) {
        logger.error('❌ Failed to list users:', extractErrorMessage(listResult));
    }
}
export async function safeConcurrentAPIExample() {
    const apiService = new SafeAPIService('https://api.example.com');
    const userIds = [1, 2, 3, 4, 5];
    const userRequests = userIds.map((id) => apiService.getResource('/users', id));
    const results = await Promise.all(userRequests);
    const successfulUsers = [];
    const errors = [];
    results?.forEach((result, index) => {
        if (isAPISuccess(result)) {
            successfulUsers.push(result?.data);
        }
        else if (isAPIError(result)) {
            errors.push(`User ${userIds[index]}: ${result?.error?.message}`);
        }
    });
    if (errors.length > 0) {
        logger.error('Errors:', errors);
    }
}
//# sourceMappingURL=safe-api-client.js.map