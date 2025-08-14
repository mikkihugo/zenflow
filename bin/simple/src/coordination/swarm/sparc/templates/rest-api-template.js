import { nanoid } from 'nanoid';
export const REST_API_TEMPLATE = {
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
        domain: 'rest-api',
        functionalRequirements: [
            {
                id: nanoid(),
                title: 'RESTful Resource Management',
                description: 'Complete CRUD operations for all resources with RESTful conventions',
                type: 'core',
                priority: 'HIGH',
                dependencies: ['Resource Controllers', 'Data Validation'],
                testCriteria: [
                    'All resources support GET, POST, PUT, DELETE operations',
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
                dependencies: ['JWT Service', 'User Management', 'Role System'],
                testCriteria: [
                    'All endpoints require valid authentication, RBAC enforced',
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
                dependencies: ['Validation Engine', 'Schema Registry'],
                testCriteria: [
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
                dependencies: ['Rate Limiter', 'User Tracking'],
                testCriteria: [
                    'Per-user rate limiting',
                    'Per-endpoint rate limiting',
                    'Adaptive throttling',
                    'Rate limits enforced per user, endpoint, and global',
                ],
            },
            {
                id: nanoid(),
                title: 'API Documentation and Discovery',
                description: 'Auto-generated API documentation with interactive testing',
                type: 'documentation',
                priority: 'MEDIUM',
                dependencies: ['OpenAPI Generator', 'Documentation Server'],
                testCriteria: [
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
                priority: 'HIGH',
                metrics: { response_time: '<50ms', throughput: '>10000 req/sec' },
            },
            {
                id: nanoid(),
                title: 'High Throughput',
                description: 'Support high concurrent request volume',
                priority: 'HIGH',
                metrics: { requests_per_second: '>10000', concurrent_users: '>1000' },
            },
            {
                id: nanoid(),
                title: 'API Reliability',
                description: 'High uptime and error recovery',
                priority: 'HIGH',
                metrics: { uptime: '>99.9%', error_rate: '<0.1%' },
            },
        ],
        constraints: [
            {
                id: nanoid(),
                type: 'technical',
                description: 'All API endpoints must require authentication except health checks',
                impact: 'high',
            },
            {
                id: nanoid(),
                type: 'technical',
                description: 'API must follow OpenAPI 3.0 specification',
                impact: 'medium',
            },
            {
                id: nanoid(),
                type: 'performance',
                description: 'Response payloads must not exceed 10MB',
                impact: 'medium',
            },
        ],
        assumptions: [
            {
                id: nanoid(),
                description: 'HTTP/HTTPS protocol support available',
                confidence: 'high',
                riskIfIncorrect: 'HIGH',
            },
            {
                id: nanoid(),
                description: 'Database backend for data persistence',
                confidence: 'high',
                riskIfIncorrect: 'CRITICAL',
            },
            {
                id: nanoid(),
                description: 'Load balancer for high availability',
                confidence: 'medium',
                riskIfIncorrect: 'MEDIUM',
            },
            {
                id: nanoid(),
                description: 'Monitoring and logging infrastructure',
                confidence: 'high',
                riskIfIncorrect: 'MEDIUM',
            },
        ],
        dependencies: [
            {
                id: nanoid(),
                name: 'Express.js',
                type: 'library',
                version: '4.18+',
                critical: true,
            },
            {
                id: nanoid(),
                name: 'JWT Library',
                type: 'library',
                version: '9.0+',
                critical: true,
            },
            {
                id: nanoid(),
                name: 'Joi/Zod',
                type: 'library',
                version: 'Latest',
                critical: true,
            },
        ],
        riskAssessment: {
            risks: [
                {
                    id: nanoid(),
                    description: 'API abuse through automated attacks',
                    probability: 'medium',
                    impact: 'high',
                    category: 'technical',
                },
                {
                    id: nanoid(),
                    description: 'Performance degradation under high load',
                    probability: 'medium',
                    impact: 'medium',
                    category: 'operational',
                },
                {
                    id: nanoid(),
                    description: 'Breaking changes affecting client applications',
                    probability: 'low',
                    impact: 'high',
                    category: 'business',
                },
            ],
            mitigationStrategies: [
                {
                    riskId: 'api-abuse',
                    strategy: 'Implement comprehensive rate limiting, IP blocking, and request analysis',
                    priority: 'HIGH',
                    effort: 'medium',
                },
                {
                    riskId: 'performance-degradation',
                    strategy: 'Load testing, caching, and auto-scaling implementation',
                    priority: 'MEDIUM',
                    effort: 'high',
                },
                {
                    riskId: 'breaking-changes',
                    strategy: 'API versioning strategy and backward compatibility testing',
                    priority: 'HIGH',
                    effort: 'low',
                },
            ],
            overallRisk: 'MEDIUM',
        },
        successMetrics: [
            {
                id: nanoid(),
                name: 'Response Performance',
                description: 'API response time performance',
                target: '<50ms P95',
                measurement: 'Automated performance monitoring',
            },
            {
                id: nanoid(),
                name: 'Error Rate',
                description: 'Server error rate tracking',
                target: '<0.1% server errors',
                measurement: 'Error tracking and monitoring',
            },
            {
                id: nanoid(),
                name: 'Endpoint Utilization',
                description: 'API endpoint usage analytics',
                target: '>95% endpoint usage',
                measurement: 'API analytics and usage tracking',
            },
        ],
        acceptanceCriteria: [
            {
                id: nanoid(),
                requirement: 'All API endpoints respond correctly',
                testMethod: 'automated',
                criteria: [
                    'HTTP status codes correct',
                    'Response format valid',
                    'Performance targets met',
                ],
            },
        ],
    },
    pseudocode: {
        id: nanoid(),
        algorithms: [],
        coreAlgorithms: [
            {
                name: 'RequestValidationPipeline',
                purpose: 'Comprehensive request validation and sanitization pipeline',
                steps: [
                    {
                        stepNumber: 1,
                        description: 'Schema validation',
                        pseudocode: 'VALIDATE_SCHEMA(request.body, schema)',
                        complexity: 'O(n)',
                    },
                    {
                        stepNumber: 2,
                        description: 'Input sanitization',
                        pseudocode: 'SANITIZE_INPUT(request.body, sanitizationRules)',
                        complexity: 'O(n)',
                    },
                    {
                        stepNumber: 3,
                        description: 'Business rule validation',
                        pseudocode: 'VALIDATE_BUSINESS_RULES(transformedBody, request.context)',
                        complexity: 'O(1)',
                    },
                ],
                inputs: [
                    {
                        name: 'request',
                        type: 'object',
                        description: 'HTTP request object',
                    },
                    { name: 'schema', type: 'object', description: 'Validation schema' },
                ],
                outputs: [
                    {
                        name: 'validatedRequest',
                        type: 'object',
                        description: 'Validated request',
                    },
                    {
                        name: 'validationErrors',
                        type: 'array',
                        description: 'Array of validation errors',
                    },
                ],
                complexity: {
                    timeComplexity: 'O(n)',
                    spaceComplexity: 'O(n)',
                    scalability: 'Linear time and space complexity based on request size',
                    worstCase: 'O(n)',
                },
                optimizations: [],
            },
            {
                name: 'AdaptiveRateLimiting',
                purpose: 'Intelligent rate limiting with adaptive thresholds',
                steps: [
                    {
                        stepNumber: 1,
                        description: 'Generate user key',
                        pseudocode: 'userKey ← GENERATE_USER_KEY(user.id, request.ip)',
                        complexity: 'O(1)',
                    },
                    {
                        stepNumber: 2,
                        description: 'Get current usage',
                        pseudocode: 'userUsage ← RATE_LIMITER.GET_USAGE(userKey, TIME_WINDOW)',
                        complexity: 'O(1)',
                    },
                    {
                        stepNumber: 3,
                        description: 'Check rate limits',
                        pseudocode: 'IF userUsage >= userLimit THEN RETURN false',
                        complexity: 'O(1)',
                    },
                ],
                inputs: [
                    { name: 'request', type: 'object', description: 'HTTP request' },
                    { name: 'user', type: 'object', description: 'User context' },
                ],
                outputs: [
                    {
                        name: 'allowed',
                        type: 'boolean',
                        description: 'Rate limit decision',
                    },
                    {
                        name: 'rateLimitInfo',
                        type: 'object',
                        description: 'Rate limit information',
                    },
                ],
                complexity: {
                    timeComplexity: 'O(1)',
                    spaceComplexity: 'O(1)',
                    scalability: 'Constant time operations with cache lookups',
                    worstCase: 'O(1)',
                },
                optimizations: [],
            },
            {
                name: 'JWTAuthenticationFlow',
                purpose: 'Secure JWT authentication with token refresh',
                steps: [
                    {
                        stepNumber: 1,
                        description: 'Extract JWT token',
                        pseudocode: 'token ← authHeader.SUBSTRING(7)',
                        complexity: 'O(1)',
                    },
                    {
                        stepNumber: 2,
                        description: 'Verify JWT token',
                        pseudocode: 'payload ← JWT.VERIFY(token, jwtSecret)',
                        complexity: 'O(1)',
                    },
                    {
                        stepNumber: 3,
                        description: 'Load user context',
                        pseudocode: 'user ← USER_SERVICE.GET_BY_ID(payload.sub)',
                        complexity: 'O(1)',
                    },
                ],
                inputs: [
                    {
                        name: 'request',
                        type: 'object',
                        description: 'HTTP request with auth header',
                    },
                    {
                        name: 'jwtSecret',
                        type: 'string',
                        description: 'JWT signing secret',
                    },
                ],
                outputs: [
                    {
                        name: 'authResult',
                        type: 'object',
                        description: 'Authentication result',
                    },
                    {
                        name: 'userContext',
                        type: 'object',
                        description: 'User context object',
                    },
                ],
                complexity: {
                    timeComplexity: 'O(1)',
                    spaceComplexity: 'O(1)',
                    scalability: 'Constant time JWT operations with database lookups',
                    worstCase: 'O(1)',
                },
                optimizations: [],
            },
        ],
        dataStructures: [
            {
                name: 'RequestCache',
                type: 'class',
                properties: [
                    {
                        name: 'cache',
                        type: 'Map<string, any>',
                        visibility: 'private',
                        description: 'In-memory cache storage',
                    },
                    {
                        name: 'maxSize',
                        type: 'number',
                        visibility: 'private',
                        description: 'Maximum cache size',
                    },
                ],
                methods: [
                    {
                        name: 'get',
                        parameters: [
                            { name: 'key', type: 'string', description: 'Cache key' },
                        ],
                        returnType: 'any',
                        visibility: 'public',
                        description: 'Get cached value',
                    },
                    {
                        name: 'set',
                        parameters: [
                            { name: 'key', type: 'string', description: 'Cache key' },
                            { name: 'value', type: 'any', description: 'Value to cache' },
                        ],
                        returnType: 'void',
                        visibility: 'public',
                        description: 'Set cached value',
                    },
                ],
                relationships: [
                    {
                        type: 'uses',
                        target: 'CacheEntry',
                        description: 'Stores cache entry objects',
                    },
                ],
            },
            {
                name: 'RateLimitStore',
                type: 'class',
                properties: [
                    {
                        name: 'counters',
                        type: 'Map<string, number>',
                        visibility: 'private',
                        description: 'Rate limit counters',
                    },
                    {
                        name: 'ttl',
                        type: 'Map<string, number>',
                        visibility: 'private',
                        description: 'Time to live for counters',
                    },
                ],
                methods: [
                    {
                        name: 'increment',
                        parameters: [
                            { name: 'key', type: 'string', description: 'Counter key' },
                        ],
                        returnType: 'number',
                        visibility: 'public',
                        description: 'Increment counter',
                    },
                    {
                        name: 'get',
                        parameters: [
                            { name: 'key', type: 'string', description: 'Counter key' },
                        ],
                        returnType: 'number',
                        visibility: 'public',
                        description: 'Get counter value',
                    },
                ],
                relationships: [
                    {
                        type: 'uses',
                        target: 'RateLimitCounter',
                        description: 'Uses rate limit counter objects',
                    },
                ],
            },
            {
                name: 'ValidationSchemaRegistry',
                type: 'class',
                properties: [
                    {
                        name: 'schemas',
                        type: 'Map<string, Schema>',
                        visibility: 'private',
                        description: 'Validation schemas',
                    },
                    {
                        name: 'compiled',
                        type: 'Map<string, Function>',
                        visibility: 'private',
                        description: 'Compiled validation functions',
                    },
                ],
                methods: [
                    {
                        name: 'register',
                        parameters: [
                            { name: 'key', type: 'string', description: 'Schema key' },
                            {
                                name: 'schema',
                                type: 'Schema',
                                description: 'Validation schema',
                            },
                        ],
                        returnType: 'void',
                        visibility: 'public',
                        description: 'Register schema',
                    },
                    {
                        name: 'lookup',
                        parameters: [
                            { name: 'key', type: 'string', description: 'Schema key' },
                        ],
                        returnType: 'Schema',
                        visibility: 'public',
                        description: 'Lookup schema',
                    },
                ],
                relationships: [
                    {
                        type: 'uses',
                        target: 'ValidationSchema',
                        description: 'Manages validation schema objects',
                    },
                ],
            },
        ],
        complexityAnalysis: {
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            scalability: 'System scales horizontally with load balancing and caching',
            worstCase: 'O(n)',
            averageCase: 'O(1)',
            bestCase: 'O(1)',
            bottlenecks: [
                'Database queries for authentication and authorization',
                'Complex validation rules processing',
                'Business logic execution time',
            ],
        },
        controlFlows: [],
        optimizations: [],
        dependencies: [],
    },
    architecture: {
        id: nanoid(),
        systemArchitecture: {
            components: [],
            interfaces: [],
            dataFlow: [],
            deploymentUnits: [],
            qualityAttributes: [],
            architecturalPatterns: [],
            technologyStack: [],
        },
        componentDiagrams: [],
        deploymentPlan: [],
        validationResults: {
            overall: true,
            score: 0.95,
            results: [],
            recommendations: [],
        },
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
                qualityAttributes: { scalability: 'horizontal', performance: 'high' },
                performance: {
                    expectedLatency: '<10ms',
                    optimizations: ['15000 requests/second', '128MB memory usage'],
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
                qualityAttributes: { scalability: 'horizontal', performance: 'high' },
                performance: {
                    expectedLatency: '<5ms',
                    optimizations: ['50000 auth checks/second', '256MB memory usage'],
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
                qualityAttributes: { scalability: 'horizontal', performance: 'high' },
                performance: {
                    expectedLatency: '<3ms',
                    optimizations: ['100000 validations/second', '512MB memory usage'],
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
                qualityAttributes: { scalability: 'horizontal', performance: 'high' },
                performance: {
                    expectedLatency: '<2ms',
                    optimizations: ['200000 checks/second', '128MB memory usage'],
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
                qualityAttributes: { scalability: 'horizontal', performance: 'high' },
                performance: {
                    expectedLatency: '<1ms',
                    optimizations: ['500000 cache operations/second', '1GB memory usage'],
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
                qualityAttributes: { scalability: 'vertical', performance: 'medium' },
                performance: {
                    expectedLatency: '<20ms',
                    optimizations: ['1000 doc requests/second', '256MB memory usage'],
                },
            },
        ],
        relationships: [
            {
                id: nanoid(),
                source: 'api-gateway',
                target: 'authentication-service',
                type: 'uses',
                description: 'Gateway uses auth service for request authentication',
                strength: 'strong',
                protocol: 'synchronous',
            },
            {
                id: nanoid(),
                source: 'api-gateway',
                target: 'validation-service',
                type: 'uses',
                description: 'Gateway uses validation service for request validation',
                strength: 'strong',
                protocol: 'synchronous',
            },
            {
                id: nanoid(),
                source: 'api-gateway',
                target: 'rate-limiting-service',
                type: 'uses',
                description: 'Gateway enforces rate limits through rate limiting service',
                strength: 'medium',
                protocol: 'synchronous',
            },
            {
                id: nanoid(),
                source: 'api-gateway',
                target: 'response-cache-service',
                type: 'uses',
                description: 'Gateway uses cache service for response optimization',
                strength: 'medium',
                protocol: 'synchronous',
            },
        ],
        patterns: [
            {
                name: 'API Gateway Pattern',
                description: 'Centralized entry point for all API requests',
                benefits: [
                    'Centralized cross-cutting concerns',
                    'Protocol translation',
                    'Service aggregation',
                    'Security enforcement',
                ],
                tradeoffs: [
                    'Single point of failure',
                    'Performance bottleneck',
                    'Increased latency',
                ],
                applicability: [
                    'High-traffic APIs',
                    'Microservices architecture',
                    'Cross-cutting concerns',
                ],
            },
            {
                name: 'Middleware Pipeline Pattern',
                description: 'Chain of responsibility for request processing',
                benefits: [
                    'Modular processing',
                    'Easy to extend',
                    'Separation of concerns',
                    'Reusable components',
                ],
                tradeoffs: [
                    'Processing overhead',
                    'Complexity in debugging',
                    'Order dependency',
                ],
                applicability: [
                    'Request processing',
                    'Cross-cutting concerns',
                    'Modular architecture',
                ],
            },
            {
                name: 'Token-Based Authentication Pattern',
                description: 'Stateless authentication using JWT tokens',
                benefits: [
                    'Stateless design',
                    'Scalability',
                    'Cross-domain support',
                    'Mobile-friendly',
                ],
                tradeoffs: [
                    'Token size overhead',
                    'Revocation complexity',
                    'Security considerations',
                ],
                applicability: [
                    'Stateless systems',
                    'Distributed authentication',
                    'Mobile applications',
                ],
            },
        ],
        dataFlow: [
            {
                from: 'api-gateway',
                to: 'authentication-service',
                data: 'AuthenticationRequest',
                protocol: 'JSON',
            },
            {
                from: 'api-gateway',
                to: 'validation-service',
                data: 'ValidationRequest',
                protocol: 'JSON',
            },
        ],
        qualityAttributes: [
            {
                name: 'High Performance',
                target: 'P95 response time < 50ms',
                measurement: 'Load testing and performance monitoring',
                priority: 'HIGH',
                criteria: [
                    'P95 response time < 50ms',
                    'Throughput > 10,000 requests/second',
                    'Memory usage < 2GB per instance',
                ],
            },
            {
                name: 'Security',
                target: 'All endpoints secured',
                measurement: 'Security audits and penetration testing',
                priority: 'HIGH',
                criteria: [
                    'All endpoints authenticated',
                    'Input validation on all requests',
                    'Rate limiting enforced',
                ],
            },
            {
                name: 'Scalability',
                target: 'Horizontal scaling support',
                measurement: 'Load testing with multiple instances',
                priority: 'HIGH',
                criteria: [
                    'Stateless design',
                    'Load balancer compatible',
                    'Database connection pooling',
                ],
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
    async applyTo(projectSpec) {
        return {
            specification: this.customizeSpecification(projectSpec),
            pseudocode: this.customizePseudocode(projectSpec),
            architecture: this.customizeArchitecture(projectSpec),
        };
    },
    customizeSpecification(projectSpec) {
        const customized = { ...this.specification };
        customized.name = projectSpec.name;
        customized.description = `${projectSpec.name} - REST API system with enterprise-grade features`;
        if (projectSpec.requirements) {
            for (const requirement of projectSpec.requirements) {
                customized.functionalRequirements.push({
                    id: nanoid(),
                    title: requirement,
                    description: `Custom API requirement: ${requirement}`,
                    type: 'custom',
                    priority: 'MEDIUM',
                    dependencies: [],
                    testCriteria: [
                        `API supports ${requirement}`,
                        `Successfully implements ${requirement}`,
                    ],
                });
            }
        }
        return customized;
    },
    customizePseudocode(projectSpec) {
        const customized = { ...this.pseudocode };
        if (projectSpec.complexity === 'simple') {
            customized.coreAlgorithms = customized.coreAlgorithms.slice(0, 2);
        }
        else if (projectSpec.complexity === 'enterprise') {
            customized.coreAlgorithms.push({
                id: nanoid(),
                name: 'EnterpriseAuditLogging',
                purpose: 'Comprehensive audit logging for enterprise compliance',
                inputs: [
                    {
                        name: 'request',
                        type: 'object',
                        description: 'HTTP request object',
                    },
                    {
                        name: 'response',
                        type: 'object',
                        description: 'HTTP response object',
                    },
                    { name: 'user', type: 'object', description: 'User context object' },
                    {
                        name: 'action',
                        type: 'string',
                        description: 'Action being performed',
                    },
                ],
                outputs: [
                    {
                        name: 'auditLogEntry',
                        type: 'AuditLogEntry',
                        description: 'Created audit log entry',
                    },
                ],
                steps: [
                    {
                        stepNumber: 1,
                        description: 'Create audit entry object',
                        pseudocode: 'auditEntry ← { timestamp: CURRENT_TIME(), user: user.id, action: action, resource: request.path, method: request.method, ip: request.ip, userAgent: request.userAgent, requestId: request.id, responseStatus: response.status, duration: response.duration }',
                        complexity: 'O(1)',
                    },
                    {
                        stepNumber: 2,
                        description: 'Save audit entry',
                        pseudocode: 'AUDIT_STORE.SAVE(auditEntry)',
                        complexity: 'O(1)',
                    },
                    {
                        stepNumber: 3,
                        description: 'Return audit entry',
                        pseudocode: 'RETURN auditEntry',
                        complexity: 'O(1)',
                    },
                ],
                complexity: {
                    timeComplexity: 'O(1)',
                    spaceComplexity: 'O(1)',
                    scalability: 'Constant time logging operation',
                    worstCase: 'O(1)',
                },
                optimizations: [],
            });
        }
        return customized;
    },
    customizeArchitecture(projectSpec) {
        const customized = { ...this.architecture };
        if (projectSpec.complexity === 'simple') {
            customized.deploymentStrategy = {
                type: 'monolith',
                infrastructure: ['Docker', 'Nginx'],
                scalingApproach: 'vertical',
                containerization: true,
                orchestration: 'docker-compose',
            };
        }
        else if (projectSpec.complexity === 'enterprise') {
            customized.deploymentStrategy = {
                type: 'microservices',
                infrastructure: ['Kubernetes', 'Docker', 'Nginx', 'Load Balancer'],
                scalingApproach: 'horizontal',
                containerization: true,
                orchestration: 'kubernetes',
            };
        }
        else {
            customized.deploymentStrategy = {
                type: 'hybrid',
                infrastructure: ['Docker', 'Nginx', 'Load Balancer'],
                scalingApproach: 'auto',
                containerization: true,
                orchestration: 'docker-swarm',
            };
        }
        return customized;
    },
    validateCompatibility(projectSpec) {
        const warnings = [];
        const recommendations = [];
        const compatible = true;
        if (projectSpec.domain !== 'rest-api') {
            warnings.push('Project domain does not match template domain');
        }
        return { compatible, warnings, recommendations };
    },
};
//# sourceMappingURL=rest-api-template.js.map