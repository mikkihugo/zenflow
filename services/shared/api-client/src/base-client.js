/**
 * Base API Client for Vision-to-Code Services
 * Provides common functionality for service-to-service communication
 */

const axios = require('axios');
const axiosRetry = require('axios-retry');
const { getJWTManager } = require('../../auth/src/jwt');
const { CircuitBreaker } = require('../../middleware/src/circuitBreaker');

class BaseApiClient {
  constructor(config = {}) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      circuitBreaker: {
        timeout: 30000,
        errorThreshold: 50,
        resetTimeout: 60000,
        ...config.circuitBreaker
      },
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      ...config
    };

    this.serviceId = config.serviceId;
    this.jwtManager = getJWTManager();
    this.circuitBreaker = new CircuitBreaker({
      ...this.config.circuitBreaker,
      name: `${this.serviceId}-client`
    });

    // Create axios instance
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers
    });

    // Set up retry logic
    axiosRetry(this.client, {
      retries: this.config.retries,
      retryDelay: (retryCount) => {
        return retryCount * this.config.retryDelay;
      },
      retryCondition: (error) => {
        // Retry on network errors or 5xx errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response && error.response.status >= 500);
      }
    });

    this.setupInterceptors();
  }

  /**
   * Set up request/response interceptors
   */
  setupInterceptors() {
    // Request interceptor - add authentication
    this.client.interceptors.request.use(
      async (config) => {
        // Add service token
        if (this.serviceId) {
          const token = this.jwtManager.createServiceToken(
            this.serviceId,
            [], // target services (will be set per request if needed)
            config.permissions || []
          );
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID if present
        if (config.requestId) {
          config.headers['X-Request-ID'] = config.requestId;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${this.serviceId}] ${config.method.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${this.serviceId}] Response ${response.status} from ${response.config.url}`);
        }
        return response;
      },
      async (error) => {
        // Extract error details
        const errorResponse = {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            method: error.config?.method,
            url: error.config?.url,
            baseURL: error.config?.baseURL
          }
        };

        // Log error
        console.error(`[${this.serviceId}] API Error:`, errorResponse);

        // Transform error for consistent handling
        if (error.response?.data?.error) {
          const apiError = new Error(error.response.data.error.message);
          apiError.code = error.response.data.error.code;
          apiError.status = error.response.status;
          apiError.details = error.response.data.error.details;
          return Promise.reject(apiError);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a request with circuit breaker protection
   */
  async request(config) {
    return this.circuitBreaker.protect(async () => {
      const response = await this.client.request(config);
      return response.data;
    })();
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.request({
      method: 'GET',
      url,
      ...config
    });
  }

  /**
   * POST request
   */
  async post(url, data, config = {}) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...config
    });
  }

  /**
   * PUT request
   */
  async put(url, data, config = {}) {
    return this.request({
      method: 'PUT',
      url,
      data,
      ...config
    });
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.request({
      method: 'DELETE',
      url,
      ...config
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data, config = {}) {
    return this.request({
      method: 'PATCH',
      url,
      data,
      ...config
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.get('/health', {
        timeout: 5000, // Shorter timeout for health checks
        retry: false // Don't retry health checks
      });
      return {
        healthy: true,
        ...response
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Get circuit breaker stats
   */
  getCircuitBreakerStats() {
    return this.circuitBreaker.getStats();
  }

  /**
   * Destroy client and clean up
   */
  destroy() {
    this.circuitBreaker.destroy();
  }
}

export default BaseApiClient;