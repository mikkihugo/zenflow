/**
 * SPARC REST API Template
 *
 * Pre-built template for REST API systems with authentication,
 * validation, rate limiting, and comprehensive error handling.
 */

import { nanoid } from 'nanoid';
import type {
  ArchitectureDesign,
  DetailedSpecification,
  ProjectSpecification,
  PseudocodeStructure,
  SPARCTemplate,
  TemplateMetadata,
} from '../types/sparc-types';

export const REST_API_TEMPLATE: SPARCTemplate = {
  id: 'rest-api-template',
  name: 'Enterprise REST API System',
  domain: 'rest-api',
  description: 'Comprehensive template for REST API systems with enterprise-grade features',
  version: '1.0.0',
  metadata: {
    author: 'SPARC REST API Template Generator',
    createdAt: new Date(),
    tags: ['rest-api', 'authentication', 'validation', 'enterprise'],
    complexity: 'moderate',
    estimatedDevelopmentTime: '4-8 weeks',
    targetPerformance: 'Sub-50ms response time, 10k+ requests/second',
  },

  specification: {
    id: nanoid(),
    name: 'Enterprise REST API System',
    domain: 'rest-api',
    description:
      'High-performance REST API with authentication, validation, rate limiting, and comprehensive monitoring',
    functionalRequirements: [
      {
        id: nanoid(),
        title: 'RESTful Resource Management',
        description: 'Complete CRUD operations for all resources with RESTful conventions',
        type: 'core',
        priority: 'HIGH',
        category: 'api',
        source: 'system',
        validation: 'All resources support GET, POST, PUT, DELETE operations',
        dependencies: ['Resource Controllers', 'Data Validation'],
        acceptanceCriteria: [
          'Consistent REST endpoint structure',
          'HTTP status codes follow standards',
          'Resource relationships properly modeled',
        ],
      },
      {
        id: nanoid(),
        title: 'Authentication and Authorization',
        description: 'Secure API access with JWT tokens and role-based access control',
        type: 'security',
        priority: 'HIGH',
        category: 'authentication',
        source: 'security',
        validation: 'All endpoints require valid authentication, RBAC enforced',
        dependencies: ['JWT Service', 'User Management', 'Role System'],
        acceptanceCriteria: [
          'JWT token-based authentication',
          'Role-based access control',
          'Token refresh mechanism',
        ],
      },
      {
        id: nanoid(),
        title: 'Request Validation and Sanitization',
        description: 'Comprehensive input validation and data sanitization',
        type: 'validation',
        priority: 'HIGH',
        category: 'security',
        source: 'security',
        validation: 'All inputs validated, sanitized, and type-checked',
        dependencies: ['Validation Engine', 'Schema Registry'],
        acceptanceCriteria: [
          'JSON schema validation',
          'Input sanitization',
          'Type checking and coercion',
        ],
      },
      {
        id: nanoid(),
        title: 'Rate Limiting and Throttling',
        description: 'Intelligent rate limiting to prevent abuse and ensure fair usage',
        type: 'performance',
        priority: 'MEDIUM',
        category: 'protection',
        source: 'reliability',
        validation: 'Rate limits enforced per user, endpoint, and global',
        dependencies: ['Rate Limiter', 'User Tracking'],
        acceptanceCriteria: [
          'Per-user rate limiting',
          'Per-endpoint rate limiting',
          'Adaptive throttling',
        ],
      },
      {
        id: nanoid(),
        title: 'API Documentation and Discovery',
        description: 'Auto-generated API documentation with interactive testing',
        type: 'documentation',
        priority: 'MEDIUM',
        category: 'usability',
        source: 'operational',
        validation: 'Complete API docs available with testing interface',
        dependencies: ['OpenAPI Generator', 'Documentation Server'],
        acceptanceCriteria: [
          'OpenAPI 3.0 specification',
          'Interactive documentation',
          'Code examples and SDKs',
        ],
      },
    ],
    nonFunctionalRequirements: [
      {
        id: nanoid(),
        title: 'Response Performance',
        description: 'Fast API responses with low latency',
        type: 'performance',
        priority: 'HIGH',
        category: 'latency',
        metric: 'response_time',
        target: '<50ms P95 response time',
        measurement: 'API response latency',
        rationale: 'Modern applications require fast API responses',
      },
      {
        id: nanoid(),
        title: 'High Throughput',
        description: 'Support high concurrent request volume',
        type: 'performance',
        priority: 'HIGH',
        category: 'throughput',
        metric: 'requests_per_second',
        target: '10,000 requests/second',
        measurement: 'Sustained request throughput',
        rationale: 'Support for high-traffic applications',
      },
      {
        id: nanoid(),
        title: 'API Reliability',
        description: 'High uptime and error recovery',
        type: 'reliability',
        priority: 'HIGH',
        category: 'availability',
        metric: 'uptime',
        target: '99.9% uptime',
        measurement: 'Service availability monitoring',
        rationale: 'APIs are critical infrastructure components',
      },
    ],
    systemConstraints: [
      {
        id: nanoid(),
        type: 'security',
        description: 'All API endpoints must require authentication except health checks',
        rationale: 'Prevent unauthorized access to system resources',
        impact: 'HIGH',
      },
      {
        id: nanoid(),
        type: 'compatibility',
        description: 'API must follow OpenAPI 3.0 specification',
        rationale: 'Ensure interoperability and documentation standards',
        impact: 'MEDIUM',
      },
      {
        id: nanoid(),
        type: 'performance',
        description: 'Response payloads must not exceed 10MB',
        rationale: 'Prevent network congestion and timeout issues',
        impact: 'MEDIUM',
      },
    ],
    projectAssumptions: [
      'HTTP/HTTPS protocol support available',
      'Database backend for data persistence',
      'Load balancer for high availability',
      'Monitoring and logging infrastructure',
    ],
    externalDependencies: [
      {
        id: nanoid(),
        name: 'Express.js',
        type: 'framework',
        description: 'Node.js web framework for API development',
        version: '4.18+',
        criticality: 'HIGH',
      },
      {
        id: nanoid(),
        name: 'JWT Library',
        type: 'authentication',
        description: 'JSON Web Token implementation',
        version: '9.0+',
        criticality: 'HIGH',
      },
      {
        id: nanoid(),
        name: 'Joi/Zod',
        type: 'validation',
        description: 'Schema validation library',
        version: 'Latest',
        criticality: 'HIGH',
      },
    ],
    riskAnalysis: {
      identifiedRisks: [
        {
          id: nanoid(),
          description: 'API abuse through automated attacks',
          probability: 'MEDIUM',
          impact: 'HIGH',
          category: 'security',
        },
        {
          id: nanoid(),
          description: 'Performance degradation under high load',
          probability: 'MEDIUM',
          impact: 'MEDIUM',
          category: 'performance',
        },
        {
          id: nanoid(),
          description: 'Breaking changes affecting client applications',
          probability: 'LOW',
          impact: 'HIGH',
          category: 'compatibility',
        },
      ],
      mitigationStrategies: [
        {
          riskId: 'api-abuse',
          strategy: 'Implement comprehensive rate limiting, IP blocking, and request analysis',
          effectiveness: 'HIGH',
        },
        {
          riskId: 'performance-degradation',
          strategy: 'Load testing, caching, and auto-scaling implementation',
          effectiveness: 'MEDIUM',
        },
        {
          riskId: 'breaking-changes',
          strategy: 'API versioning strategy and backward compatibility testing',
          effectiveness: 'HIGH',
        },
      ],
    },
    successMetrics: [
      {
        id: nanoid(),
        metric: 'response_time',
        target: '<50ms P95',
        measurement: 'Automated performance monitoring',
        frequency: 'Continuous',
      },
      {
        id: nanoid(),
        metric: 'error_rate',
        target: '<0.1% server errors',
        measurement: 'Error tracking and monitoring',
        frequency: 'Real-time',
      },
      {
        id: nanoid(),
        metric: 'api_adoption',
        target: '>95% endpoint usage',
        measurement: 'API analytics and usage tracking',
        frequency: 'Weekly',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  pseudocode: {
    id: nanoid(),
    specificationId: 'rest-api-spec',
    coreAlgorithms: [
      {
        id: nanoid(),
        name: 'RequestValidationPipeline',
        description: 'Comprehensive request validation and sanitization pipeline',
        pseudocode: `
ALGORITHM RequestValidationPipeline
INPUT: request, schema, sanitizationRules
OUTPUT: validatedRequest, validationErrors

BEGIN
  validationErrors ← []
  
  // Schema validation
  TRY
    schemaResult ← VALIDATE_SCHEMA(request.body, schema)
    IF NOT schemaResult.valid THEN
      validationErrors.ADD_ALL(schemaResult.errors)
    END IF
  CATCH validation_error
    validationErrors.ADD("Schema validation failed: " + validation_error.message)
  END TRY
  
  // Input sanitization
  sanitizedBody ← SANITIZE_INPUT(request.body, sanitizationRules)
  
  // Type coercion and transformation
  transformedBody ← TRANSFORM_TYPES(sanitizedBody, schema.types)
  
  // Business rule validation
  businessValidation ← VALIDATE_BUSINESS_RULES(transformedBody, request.context)
  IF NOT businessValidation.valid THEN
    validationErrors.ADD_ALL(businessValidation.errors)
  END IF
  
  // Security validation
  securityValidation ← VALIDATE_SECURITY_CONSTRAINTS(transformedBody, request.user)
  IF NOT securityValidation.valid THEN
    validationErrors.ADD_ALL(securityValidation.errors)
  END IF
  
  IF validationErrors.LENGTH > 0 THEN
    RETURN null, validationErrors
  END IF
  
  validatedRequest ← {
    ...request,
    body: transformedBody,
    validated: true,
    timestamp: CURRENT_TIME()
  }
  
  RETURN validatedRequest, []
END
        `.trim(),
        complexity: {
          time: 'O(n)' as const,
          space: 'O(n)' as const,
          explanation: 'Linear time and space complexity based on request size',
        },
        inputParameters: ['request', 'schema', 'sanitizationRules'],
        outputFormat: 'ValidationResult',
        preconditions: ['Request object is valid', 'Schema is properly defined'],
        postconditions: ['Request validated or errors returned'],
        invariants: ['Original request unchanged', 'Validation rules consistently applied'],
      },
      {
        id: nanoid(),
        name: 'AdaptiveRateLimiting',
        description: 'Intelligent rate limiting with adaptive thresholds',
        pseudocode: `
ALGORITHM AdaptiveRateLimiting
INPUT: request, user, endpoint, currentLoad
OUTPUT: allowed, rateLimitInfo

BEGIN
  userKey ← GENERATE_USER_KEY(user.id, request.ip)
  endpointKey ← GENERATE_ENDPOINT_KEY(endpoint.path, endpoint.method)
  
  // Get current usage
  userUsage ← RATE_LIMITER.GET_USAGE(userKey, TIME_WINDOW)
  endpointUsage ← RATE_LIMITER.GET_USAGE(endpointKey, TIME_WINDOW)
  globalUsage ← RATE_LIMITER.GET_GLOBAL_USAGE(TIME_WINDOW)
  
  // Calculate adaptive limits based on current load
  userLimit ← CALCULATE_USER_LIMIT(user.tier, currentLoad)
  endpointLimit ← CALCULATE_ENDPOINT_LIMIT(endpoint.priority, currentLoad)
  globalLimit ← CALCULATE_GLOBAL_LIMIT(currentLoad)
  
  // Check all rate limit levels
  IF userUsage >= userLimit THEN
    RETURN false, {
      type: "user_limit",
      limit: userLimit,
      usage: userUsage,
      resetTime: CALCULATE_RESET_TIME(userKey)
    }
  END IF
  
  IF endpointUsage >= endpointLimit THEN
    RETURN false, {
      type: "endpoint_limit",
      limit: endpointLimit,
      usage: endpointUsage,
      resetTime: CALCULATE_RESET_TIME(endpointKey)
    }
  END IF
  
  IF globalUsage >= globalLimit THEN
    RETURN false, {
      type: "global_limit",
      limit: globalLimit,
      usage: globalUsage,
      resetTime: CALCULATE_RESET_TIME("global")
    }
  END IF
  
  // Increment usage counters
  RATE_LIMITER.INCREMENT(userKey)
  RATE_LIMITER.INCREMENT(endpointKey)
  RATE_LIMITER.INCREMENT("global")
  
  RETURN true, {
    type: "allowed",
    userUsage: userUsage + 1,
    userLimit: userLimit,
    endpointUsage: endpointUsage + 1,
    endpointLimit: endpointLimit
  }
END
        `.trim(),
        complexity: {
          time: 'O(1)' as const,
          space: 'O(1)' as const,
          explanation: 'Constant time operations with cache lookups',
        },
        inputParameters: ['request', 'user', 'endpoint', 'currentLoad'],
        outputFormat: 'RateLimitResult',
        preconditions: ['Rate limiter initialized', 'User and endpoint valid'],
        postconditions: ['Rate limit decision made', 'Usage counters updated'],
        invariants: ['Rate limits consistently enforced', 'Usage tracking accurate'],
      },
      {
        id: nanoid(),
        name: 'JWTAuthenticationFlow',
        description: 'Secure JWT authentication with token refresh',
        pseudocode: `
ALGORITHM JWTAuthenticationFlow
INPUT: request, jwtSecret, refreshSecret
OUTPUT: authResult, userContext

BEGIN
  authHeader ← request.headers.authorization
  
  IF authHeader IS NULL OR NOT authHeader.STARTS_WITH("Bearer ") THEN
    RETURN UNAUTHORIZED_ERROR(), null
  END IF
  
  token ← authHeader.SUBSTRING(7) // Remove "Bearer "
  
  // Verify JWT token
  TRY
    payload ← JWT.VERIFY(token, jwtSecret)
    
    // Check token expiration
    IF payload.exp <= CURRENT_TIME() THEN
      RETURN TOKEN_EXPIRED_ERROR(), null
    END IF
    
    // Check token blacklist
    IF TOKEN_BLACKLIST.CONTAINS(payload.jti) THEN
      RETURN TOKEN_REVOKED_ERROR(), null
    END IF
    
    // Load user context
    user ← USER_SERVICE.GET_BY_ID(payload.sub)
    IF user IS NULL OR NOT user.active THEN
      RETURN USER_INACTIVE_ERROR(), null
    END IF
    
    // Check permissions for requested resource
    permissions ← PERMISSION_SERVICE.GET_USER_PERMISSIONS(user.id)
    requiredPermission ← DETERMINE_REQUIRED_PERMISSION(request.method, request.path)
    
    IF NOT permissions.CONTAINS(requiredPermission) THEN
      RETURN FORBIDDEN_ERROR(), null
    END IF
    
    userContext ← {
      id: user.id,
      username: user.username,
      roles: user.roles,
      permissions: permissions,
      tokenId: payload.jti,
      loginTime: payload.iat
    }
    
    RETURN SUCCESS(), userContext
    
  CATCH jwt_error
    IF jwt_error.name = "TokenExpiredError" THEN
      RETURN TOKEN_EXPIRED_ERROR(), null
    ELSE IF jwt_error.name = "JsonWebTokenError" THEN
      RETURN INVALID_TOKEN_ERROR(), null
    ELSE
      RETURN AUTHENTICATION_ERROR(), null
    END IF
  END TRY
END
        `.trim(),
        complexity: {
          time: 'O(1)' as const,
          space: 'O(1)' as const,
          explanation: 'Constant time JWT operations with database lookups',
        },
        inputParameters: ['request', 'jwtSecret', 'refreshSecret'],
        outputFormat: 'AuthenticationResult',
        preconditions: ['JWT secrets configured', 'User service available'],
        postconditions: ['Authentication result determined', 'User context loaded'],
        invariants: ['Security policies enforced', 'Token validation consistent'],
      },
    ],
    dataStructures: [
      {
        id: nanoid(),
        name: 'RequestCache',
        type: 'LRUCache',
        description: 'LRU cache for frequently accessed API responses',
        keyType: 'string',
        valueType: 'ResponseData',
        expectedSize: 10000,
        accessPatterns: ['get', 'set', 'invalidate', 'expire'],
        performance: {
          get: 'O(1)' as const,
          set: 'O(1)' as const,
          invalidate: 'O(1)' as const,
        },
      },
      {
        id: nanoid(),
        name: 'RateLimitStore',
        type: 'HashMap',
        description: 'Rate limiting counters with TTL support',
        keyType: 'string',
        valueType: 'RateLimitCounter',
        expectedSize: 100000,
        accessPatterns: ['increment', 'get', 'reset', 'expire'],
        performance: {
          increment: 'O(1)' as const,
          get: 'O(1)' as const,
          reset: 'O(1)' as const,
        },
      },
      {
        id: nanoid(),
        name: 'ValidationSchemaRegistry',
        type: 'HashMap',
        description: 'Registry of validation schemas for different endpoints',
        keyType: 'string',
        valueType: 'ValidationSchema',
        expectedSize: 1000,
        accessPatterns: ['register', 'lookup', 'update', 'validate'],
        performance: {
          register: 'O(1)' as const,
          lookup: 'O(1)' as const,
          update: 'O(1)' as const,
        },
      },
    ],
    processFlows: [
      {
        id: nanoid(),
        name: 'APIRequestPipeline',
        description: 'Complete API request processing pipeline',
        steps: [
          {
            id: nanoid(),
            name: 'RequestParsing',
            description: 'Parse and normalize incoming request',
            algorithm: 'RequestParsingAlgorithm',
            inputs: ['rawRequest'],
            outputs: ['parsedRequest'],
            duration: 1,
          },
          {
            id: nanoid(),
            name: 'Authentication',
            description: 'Authenticate and authorize request',
            algorithm: 'JWTAuthenticationFlow',
            inputs: ['parsedRequest', 'jwtSecret'],
            outputs: ['authResult', 'userContext'],
            duration: 5,
          },
          {
            id: nanoid(),
            name: 'RateLimiting',
            description: 'Check and enforce rate limits',
            algorithm: 'AdaptiveRateLimiting',
            inputs: ['parsedRequest', 'userContext'],
            outputs: ['rateLimitResult'],
            duration: 2,
          },
          {
            id: nanoid(),
            name: 'Validation',
            description: 'Validate request data',
            algorithm: 'RequestValidationPipeline',
            inputs: ['parsedRequest', 'validationSchema'],
            outputs: ['validatedRequest'],
            duration: 3,
          },
          {
            id: nanoid(),
            name: 'BusinessLogic',
            description: 'Execute business logic',
            algorithm: 'BusinessLogicProcessor',
            inputs: ['validatedRequest', 'userContext'],
            outputs: ['businessResult'],
            duration: 20,
          },
          {
            id: nanoid(),
            name: 'ResponseFormatting',
            description: 'Format and serialize response',
            algorithm: 'ResponseFormattingAlgorithm',
            inputs: ['businessResult'],
            outputs: ['formattedResponse'],
            duration: 2,
          },
        ],
        parallelizable: false,
        criticalPath: [
          'RequestParsing',
          'Authentication',
          'RateLimiting',
          'Validation',
          'BusinessLogic',
          'ResponseFormatting',
        ],
      },
    ],
    complexityAnalysis: {
      worstCase: 'O(n)' as const,
      averageCase: 'O(1)' as const,
      bestCase: 'O(1)' as const,
      spaceComplexity: 'O(n)' as const,
      scalabilityAnalysis: 'System scales horizontally with load balancing and caching',
      bottlenecks: [
        'Database queries for authentication and authorization',
        'Complex validation rules processing',
        'Business logic execution time',
      ],
    },
    optimizationOpportunities: [
      {
        id: nanoid(),
        type: 'caching',
        description: 'Implement response caching for read-only endpoints',
        impact: 'high',
        effort: 'low',
        estimatedImprovement: '500% improvement for cached responses',
      },
      {
        id: nanoid(),
        type: 'database',
        description: 'Add database connection pooling and query optimization',
        impact: 'medium',
        effort: 'medium',
        estimatedImprovement: '200% improvement in database operations',
      },
      {
        id: nanoid(),
        type: 'validation',
        description: 'Pre-compile validation schemas for better performance',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '150% improvement in validation speed',
      },
    ],
    estimatedPerformance: [
      {
        metric: 'response_time',
        target: '<50ms P95 for simple endpoints',
        measurement: 'milliseconds',
      },
      {
        metric: 'throughput',
        target: '10,000 requests/second',
        measurement: 'requests/second',
      },
      {
        metric: 'error_rate',
        target: '<0.1% server errors',
        measurement: 'percentage',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  architecture: {
    id: nanoid(),
    pseudocodeId: 'rest-api-pseudocode',
    components: [
      {
        id: nanoid(),
        name: 'APIGateway',
        type: 'gateway',
        description: 'Main entry point for all API requests with routing and middleware',
        responsibilities: [
          'Request routing and method handling',
          'Middleware pipeline execution',
          'Response formatting and headers',
          'CORS and security headers',
        ],
        interfaces: ['IAPIGateway'],
        dependencies: ['Router', 'MiddlewareManager', 'ResponseFormatter'],
        technologies: ['Express.js', 'TypeScript', 'Helmet'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '15000 requests/second',
          expectedLatency: '<10ms',
          memoryUsage: '128MB',
        },
      },
      {
        id: nanoid(),
        name: 'AuthenticationService',
        type: 'service',
        description: 'JWT-based authentication and authorization service',
        responsibilities: [
          'JWT token generation and validation',
          'User authentication and session management',
          'Role-based access control',
          'Token refresh and revocation',
        ],
        interfaces: ['IAuthenticationService'],
        dependencies: ['JWTLibrary', 'UserService', 'TokenBlacklist'],
        technologies: ['jsonwebtoken', 'bcrypt', 'Redis'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '50000 auth checks/second',
          expectedLatency: '<5ms',
          memoryUsage: '256MB',
        },
      },
      {
        id: nanoid(),
        name: 'ValidationService',
        type: 'service',
        description: 'Comprehensive request validation and sanitization',
        responsibilities: [
          'Schema-based validation',
          'Input sanitization and type coercion',
          'Business rule validation',
          'Security constraint checking',
        ],
        interfaces: ['IValidationService'],
        dependencies: ['SchemaRegistry', 'SanitizationEngine'],
        technologies: ['Joi', 'validator.js', 'TypeScript'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '100000 validations/second',
          expectedLatency: '<3ms',
          memoryUsage: '512MB',
        },
      },
      {
        id: nanoid(),
        name: 'RateLimitingService',
        type: 'service',
        description: 'Intelligent rate limiting and throttling service',
        responsibilities: [
          'Rate limit enforcement',
          'Usage tracking and analytics',
          'Adaptive threshold adjustment',
          'Abuse detection and blocking',
        ],
        interfaces: ['IRateLimitingService'],
        dependencies: ['RateLimitStore', 'AnalyticsEngine'],
        technologies: ['Redis', 'Express-rate-limit', 'TypeScript'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '200000 checks/second',
          expectedLatency: '<2ms',
          memoryUsage: '128MB',
        },
      },
      {
        id: nanoid(),
        name: 'ResponseCacheService',
        type: 'service',
        description: 'Intelligent response caching with TTL and invalidation',
        responsibilities: [
          'Response caching and retrieval',
          'Cache invalidation strategies',
          'Cache warming and preloading',
          'Performance optimization',
        ],
        interfaces: ['IResponseCacheService'],
        dependencies: ['CacheStore', 'InvalidationEngine'],
        technologies: ['Redis', 'LRU-Cache', 'TypeScript'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '500000 cache operations/second',
          expectedLatency: '<1ms',
          memoryUsage: '1GB',
        },
      },
      {
        id: nanoid(),
        name: 'APIDocumentationService',
        type: 'service',
        description: 'Auto-generated API documentation with OpenAPI specification',
        responsibilities: [
          'OpenAPI specification generation',
          'Interactive documentation interface',
          'Code example generation',
          'API testing interface',
        ],
        interfaces: ['IDocumentationService'],
        dependencies: ['SchemaRegistry', 'TemplateEngine'],
        technologies: ['Swagger', 'OpenAPI', 'Redoc'],
        scalability: 'vertical',
        performance: {
          expectedThroughput: '1000 doc requests/second',
          expectedLatency: '<20ms',
          memoryUsage: '256MB',
        },
      },
    ],
    relationships: [
      {
        id: nanoid(),
        sourceId: 'api-gateway',
        targetId: 'authentication-service',
        type: 'uses',
        description: 'Gateway uses auth service for request authentication',
        strength: 'strong',
        protocol: 'synchronous',
      },
      {
        id: nanoid(),
        sourceId: 'api-gateway',
        targetId: 'validation-service',
        type: 'uses',
        description: 'Gateway uses validation service for request validation',
        strength: 'strong',
        protocol: 'synchronous',
      },
      {
        id: nanoid(),
        sourceId: 'api-gateway',
        targetId: 'rate-limiting-service',
        type: 'uses',
        description: 'Gateway enforces rate limits through rate limiting service',
        strength: 'medium',
        protocol: 'synchronous',
      },
      {
        id: nanoid(),
        sourceId: 'api-gateway',
        targetId: 'response-cache-service',
        type: 'uses',
        description: 'Gateway uses cache service for response optimization',
        strength: 'medium',
        protocol: 'synchronous',
      },
    ],
    patterns: [
      {
        id: nanoid(),
        name: 'API Gateway Pattern',
        type: 'integration',
        description: 'Centralized entry point for all API requests',
        benefits: [
          'Centralized cross-cutting concerns',
          'Protocol translation',
          'Service aggregation',
          'Security enforcement',
        ],
        tradeoffs: ['Single point of failure', 'Performance bottleneck', 'Increased latency'],
        applicableComponents: ['api-gateway'],
      },
      {
        id: nanoid(),
        name: 'Middleware Pipeline Pattern',
        type: 'processing',
        description: 'Chain of responsibility for request processing',
        benefits: [
          'Modular processing',
          'Easy to extend',
          'Separation of concerns',
          'Reusable components',
        ],
        tradeoffs: ['Processing overhead', 'Complexity in debugging', 'Order dependency'],
        applicableComponents: ['api-gateway', 'authentication-service', 'validation-service'],
      },
      {
        id: nanoid(),
        name: 'Token-Based Authentication Pattern',
        type: 'security',
        description: 'Stateless authentication using JWT tokens',
        benefits: ['Stateless design', 'Scalability', 'Cross-domain support', 'Mobile-friendly'],
        tradeoffs: ['Token size overhead', 'Revocation complexity', 'Security considerations'],
        applicableComponents: ['authentication-service'],
      },
    ],
    interfaces: [
      {
        id: nanoid(),
        name: 'IAPIGateway',
        componentId: 'api-gateway',
        type: 'REST',
        methods: [
          { name: 'handleRequest', parameters: ['request'], returns: 'Promise<Response>' },
          { name: 'routeRequest', parameters: ['path', 'method'], returns: 'RouteHandler' },
          { name: 'applyMiddleware', parameters: ['middleware[]'], returns: 'void' },
          { name: 'getHealthStatus', parameters: [], returns: 'HealthStatus' },
        ],
        protocol: 'HTTP/REST',
        authentication: 'JWT',
        rateLimit: '10000/hour',
        documentation: 'Main API gateway interface for all endpoints',
      },
      {
        id: nanoid(),
        name: 'IAuthenticationService',
        componentId: 'authentication-service',
        type: 'Internal',
        methods: [
          { name: 'authenticate', parameters: ['credentials'], returns: 'Promise<AuthResult>' },
          { name: 'validateToken', parameters: ['token'], returns: 'Promise<TokenValidation>' },
          { name: 'refreshToken', parameters: ['refreshToken'], returns: 'Promise<NewTokens>' },
          { name: 'revokeToken', parameters: ['token'], returns: 'Promise<void>' },
        ],
        protocol: 'Internal',
        authentication: 'Internal',
        rateLimit: 'unlimited',
        documentation: 'Authentication and authorization service interface',
      },
    ],
    dataFlows: [
      {
        id: nanoid(),
        name: 'RequestFlow',
        sourceComponentId: 'api-gateway',
        targetComponentId: 'authentication-service',
        dataType: 'AuthenticationRequest',
        format: 'JSON',
        volume: 'High',
        frequency: 'High',
        security: 'High',
        transformation: 'JWT token extraction and validation',
      },
      {
        id: nanoid(),
        name: 'ValidationFlow',
        sourceComponentId: 'api-gateway',
        targetComponentId: 'validation-service',
        dataType: 'ValidationRequest',
        format: 'JSON',
        volume: 'High',
        frequency: 'High',
        security: 'Medium',
        transformation: 'Request payload validation and sanitization',
      },
    ],
    qualityAttributes: [
      {
        id: nanoid(),
        name: 'High Performance',
        type: 'performance',
        description: 'Fast response times and high throughput',
        criteria: [
          'P95 response time < 50ms',
          'Throughput > 10,000 requests/second',
          'Memory usage < 2GB per instance',
        ],
        measurement: 'Load testing and performance monitoring',
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        name: 'Security',
        type: 'security',
        description: 'Comprehensive security measures',
        criteria: [
          'All endpoints authenticated',
          'Input validation on all requests',
          'Rate limiting enforced',
        ],
        measurement: 'Security audits and penetration testing',
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        name: 'Scalability',
        type: 'scalability',
        description: 'Horizontal scaling capability',
        criteria: ['Stateless design', 'Load balancer compatible', 'Database connection pooling'],
        measurement: 'Load testing with multiple instances',
        priority: 'HIGH',
      },
    ],
    deploymentStrategy: {
      id: nanoid(),
      name: 'Containerized Microservices',
      type: 'microservices',
      description: 'Deploy as containerized services with load balancing',
      environments: [
        {
          name: 'development',
          configuration: {
            replicas: 1,
            resources: { cpu: '500m', memory: '1Gi' },
            database: 'sqlite',
            cache: 'memory',
          },
        },
        {
          name: 'production',
          configuration: {
            replicas: 3,
            resources: { cpu: '2', memory: '4Gi' },
            database: 'postgresql',
            cache: 'redis-cluster',
          },
        },
      ],
      infrastructure: ['Kubernetes', 'Docker', 'Load Balancer', 'Redis'],
      cicd: {
        buildPipeline: ['Test', 'Security Scan', 'Build', 'Deploy'],
        testStrategy: ['Unit Tests', 'Integration Tests', 'Load Tests'],
        deploymentStrategy: 'Rolling Update',
      },
    },
    integrationPoints: [
      {
        id: nanoid(),
        name: 'Database Integration',
        type: 'database',
        description: 'Integration with relational database for data persistence',
        protocol: 'SQL/TCP',
        security: 'Connection encryption and credential management',
        errorHandling: 'Connection pooling with retry logic',
        monitoring: 'Query performance and connection health',
      },
      {
        id: nanoid(),
        name: 'Cache Integration',
        type: 'cache',
        description: 'Integration with Redis for caching and session storage',
        protocol: 'Redis Protocol',
        security: 'Password authentication and TLS encryption',
        errorHandling: 'Graceful degradation when cache unavailable',
        monitoring: 'Cache hit rates and memory usage',
      },
    ],
    performanceRequirements: [
      {
        id: nanoid(),
        metric: 'response_time',
        target: '<50ms P95',
        measurement: 'milliseconds',
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        metric: 'throughput',
        target: '10,000 requests/second',
        measurement: 'requests/second',
        priority: 'HIGH',
      },
    ],
    securityRequirements: [
      {
        id: nanoid(),
        type: 'authentication',
        description: 'JWT-based authentication for all endpoints',
        implementation: 'Bearer token authentication with role-based access',
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        type: 'input-validation',
        description: 'Comprehensive input validation and sanitization',
        implementation: 'Schema-based validation with sanitization rules',
        priority: 'HIGH',
      },
    ],
    scalabilityRequirements: [
      {
        id: nanoid(),
        type: 'horizontal',
        description: 'Scale by adding more API server instances',
        target: 'Linear scaling up to 50 instances',
        implementation: 'Stateless design with load balancing',
        priority: 'HIGH',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  async applyTo(projectSpec: ProjectSpecification) {
    return {
      specification: this.customizeSpecification(projectSpec),
      pseudocode: this.customizePseudocode(projectSpec),
      architecture: this.customizeArchitecture(projectSpec),
    };
  },

  customizeSpecification(projectSpec: ProjectSpecification): DetailedSpecification {
    const customized = { ...this.specification };
    customized.name = projectSpec.name;
    customized.description = `${projectSpec.name} - ${this.specification.description}`;

    // Add project-specific requirements
    if (projectSpec.requirements) {
      for (const requirement of projectSpec.requirements) {
        customized.functionalRequirements.push({
          id: nanoid(),
          title: requirement,
          description: `Custom API requirement: ${requirement}`,
          type: 'custom',
          priority: 'MEDIUM',
          category: 'functional',
          source: 'project',
          validation: `API supports ${requirement}`,
          dependencies: [],
          acceptanceCriteria: [`Successfully implements ${requirement}`],
        });
      }
    }

    return customized;
  },

  customizePseudocode(projectSpec: ProjectSpecification): PseudocodeStructure {
    const customized = { ...this.pseudocode };

    // Adjust algorithms based on complexity
    if (projectSpec.complexity === 'simple') {
      // Simplify for basic APIs
      customized.coreAlgorithms = customized.coreAlgorithms.slice(0, 2);
    } else if (projectSpec.complexity === 'enterprise') {
      // Add enterprise features
      customized.coreAlgorithms.push({
        id: nanoid(),
        name: 'EnterpriseAuditLogging',
        description: 'Comprehensive audit logging for enterprise compliance',
        pseudocode: `
ALGORITHM EnterpriseAuditLogging
INPUT: request, response, user, action
OUTPUT: auditLogEntry

BEGIN
  auditEntry ← {
    timestamp: CURRENT_TIME(),
    user: user.id,
    action: action,
    resource: request.path,
    method: request.method,
    ip: request.ip,
    userAgent: request.userAgent,
    requestId: request.id,
    responseStatus: response.status,
    duration: response.duration
  }
  
  AUDIT_STORE.SAVE(auditEntry)
  RETURN auditEntry
END
        `.trim(),
        complexity: {
          time: 'O(1)' as const,
          space: 'O(1)' as const,
          explanation: 'Constant time logging operation',
        },
        inputParameters: ['request', 'response', 'user', 'action'],
        outputFormat: 'AuditLogEntry',
        preconditions: ['Audit store available'],
        postconditions: ['Audit entry recorded'],
        invariants: ['Audit trail integrity maintained'],
      });
    }

    return customized;
  },

  customizeArchitecture(projectSpec: ProjectSpecification): ArchitectureDesign {
    const customized = { ...this.architecture };

    // Adjust deployment based on complexity
    if (projectSpec.complexity === 'simple') {
      customized.deploymentStrategy.type = 'monolith';
      customized.deploymentStrategy.infrastructure = ['Docker', 'Nginx'];
    }

    return customized;
  },

  validateCompatibility(projectSpec: ProjectSpecification) {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const compatible = true;

    if (projectSpec.domain !== 'rest-api') {
      warnings.push('Project domain does not match template domain');
    }

    return { compatible, warnings, recommendations };
  },
};
