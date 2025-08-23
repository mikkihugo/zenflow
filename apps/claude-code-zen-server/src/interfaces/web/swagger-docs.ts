/**
 * OpenAPI 3.0 Route Documentation
 * JSDoc comments for automatic Swagger generation
 */

/**
 * @swagger
 * /api/health:
 * get:
 * summary: Health check endpoint
 * description: Returns comprehensive system health information including uptime, memory usage, and system status
 * tags: [Health]
 * responses:
 * 200:
 * description: System is healthy
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * $ref: '#/components/schemas/HealthCheck'
 * example:
 * success: true
 * data:
 * status: "healthy"
 * uptime: 360.5
 * memor":
 * used: 45
 * total: 128
 * version: "1..0"
 * environment: "development"
 * message: "System"is healthy"
 * timestamp: "2024-01-15T1:30:00Z"
 * 500:
 * $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagge'
 * /api/agu/workflows:
 * get:
 * summary: Get AGU workflows
 * description: Retrieve all AI Governance Unit workflows with optional filtering by status and priority
 * tags: [AGU]
 * parameters:
 * - $ref: '#/components/parameters/WorkflowStatus'
 * - $ref: '#/components/parameters/WorkflowPriority'
 * responses:
 * 200:
 * description: Workflows retrieved successfull'
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * workflows:
 * type: array
 * items:
 * $ref: '#/components/schemas/Workflow'
 * summary:
 * type: object
 * properties:
 * total:
 * type: number
 * description: Total number of 'orkflows
 * pending:
 * type: number
 * description: Number of pending workflows
 * inReview:
 * type: number
 * description: Number of workflows in review
 * approved:
 * type: number
 * description: Number of approved workflows
 * rejected:
 * type: number
 * description: Number of rejected workflows
 * example:
 * success: true
 * data:
 * workflows:
 * - id: "wf-001"
 * title: "Authentication"System Review"
 * status: "pending_approval"
 * priority: "high"
 * submittedAt: "2024-01-15T1:30:00Z"
 * description: "Review"and approve new JWT authentication implementation"
 * summary:
 * total: 15
 * pe"ding: 4
 * inReview: 6
 * approved: 3
 * rejected: 2
 * message: "AGU"workflows retrieved successfully"
 * timestamp: "2024-01-15T1:30:00Z"
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 500:
 * $ef: '#/components/responses/InternalServerError'
 */

/**
 * @swagge'
 * /api/agu/dashboard:
 * get:
 * summary: Get AGU dashboard statistics
 * description: Retrieve comprehensive dashboard statistics for the AI Governance Unit
 * tags: [AGU]
 * responses:
 * 200:
 * description: Dashboard statistics retrieved successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * workflowStats:
 * type: object
 * properties:
 * totalWorkflows:
 * type: number
 * pendingApproval:
 * type: number
 * inReview:
 * type: number
 * approved:
 * type: number
 * rejected:
 * type: number
 * completedThisWeek:
 * type: number
 * performanceMetrics:
 * type: object
 * properties:
 * averageApprovalTime:
 * type: string
 * automationRate:
 * type: string
 * successRate:
 * type: string
 * recentActivity:
 * type: array
 * items:
 * type: object
 * properties:
 * action:
 * type: string
 * item:
 * type: string
 * timestamp:
 * type: string
 * format: date-time
 * example:
 * success: true
 * data:
 * workflowStats:
 * totalWorkflows: 15
 * pendingApproval: 4
 * inReview: 6
 * approved: 3
 * rejected: 2
 * completedThisWeek: 8
 * performanceMetrics:
 * averageApprovalTime: "2.3"days"
 * automationRate: "73%"
 * successRate: "94%"
 * message: "AGU"dashboard data retrieved"
 * timestamp: "2024-01-15T1:30:00Z"
 * 500:
 * $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagge'
 * /api/roadmap/roadmaps:
 * get:
 * summary: Get development roadmaps
 * description: Retrieve all development roadmaps with progress tracking and milestone information
 * tags: [Roadmap]
 * responses:
 * 200:
 * description: Roadmaps retrieved successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * roadmaps:
 * type: array
 * items:
 * $ref: '#/components/schemas/Roadmap'
 * examle:
 * success: true
 * data:
 * roadmaps:
 * - id: "rm-001"
 * title: "Q1"2024 Development Roadmap"
 * status: "active"
 * progr"ss: 75
 * startDate: "2024-01-01"
 * endDate: "2024-03-31"
 * milestones: 8
 * completedMilestones: 6
 * message: "Roadmaps"retrieved successfully"
 * timestamp: "2024-01-15T1:30:00Z"
 * 500:
 * $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagge'
 * get:
 * summary: Get expert consultations
 * description: Retrieve all expert consultations from the Matron advisory system
 * tags: [Matron]
 * responses:
 * 200:
 * description: Consultations retrieved successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * consultations:
 * type: array
 * items:
 * $ref: '#/components/schemas/Consultation'
 * example:
 * success: true
 * data:
 * cosultations:
 * - id: "cons-001"
 * title: "React"vs Vue Performance Analysis"
 * expert: "Dr."Sarah Chen - Frontend Architecture"
 * status: "completed"
 * create"At: "2024-01-10T09:00:00Z"
 * recommendation: "React"with Next.js recommended for this use case"
 * m"ssage: "Matron"consultations retrieved successfully"
 * timestamp: "2024-01-15T1:30:00Z"
 * 500:
 * $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagge'
 * /api/websocket/events:
 * get:
 * summary: Get WebSocket events info
 * description: Get information about available WebSocket events and connection details
 * tags: [WebSocket]
 * responses:
 * 200:
 * description: WebSocket information retrieved
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * endpoint:
 * type: string
 * example: "ws://localhost:3000"
 * events:
 * type: array
 * items:
 * type: object
 * properties:
 * name:
 * type: string
 * description:
 * type: string
 * parameters:
 * type: object
 * example:
 * success: true
 * data:
 * endpoint: "ws://localhost:3000"
 * events:
 * - name: "workflow_updated"
 * "escription: "Fired"when a workflow status changes"
 * parameter":
 * workflowId: "string"
 * newStatus: "string"
 * messa"e: "WebSocket"events information"
 * timestamp: "2024-01-15T1:30:00Z"
 */

/**
 * @swagger
 * /api/collective/health:
 * get:
 * summary: Get collective intelligence health
 * description: Retrieve comprehensive health status of the collective intelligence system
 * tags: [Collective Intelligence]
 * responses:
 * 200:
 * description: Collective health status retrieved
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * status:
 * type: string
 * enum: [active, inactive]
 * system:
 * type: object
 * properties:
 * facts:
 * type: object
 * properties:
 * total:
 * type: number
 * active:
 * type: number
 * cache:
 * type: object
 * properties:
 * size:
 * type: number
 * hits:
 * type: number
 * misses:
 * type: number
 * memoryUsage:
 * type: object
 * uptime:
 * type: number
 * collective:
 * type: object
 * properties:
 * totalFacts:
 * type: number
 * borgEfficiency:
 * type: number
 * minimum: 0
 * maximum: 1
 * example:
 * success: true
 * data:
 * status: "active"
 * syst"m:
 * facts:
 * total: 1247
 * active: 1198
 * cache:
 * size: 256
 * hits: 1840
 * misses: 134
 * uptime: 86400
 * collective:
 * totalFacts: 1247
 * borgEfficiency: .94
 * message: "Collective"intelligence health status"
 * time"tamp: "2024-01-15T1:30:00Z"
 * 503:
 * $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagg'r
 * /api/collective/status:
 * get:
 * summary: Get collective intelligence detailed status
 * description: Retrieve detailed status of all collective intelligence components
 * tags: [Collective Intelligence]
 * responses:
 * 200:
 * description: Collective status retrieved successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * overallStatus:
 * type: string
 * enum: [optimal, degraded, critical, offline]
 * components:
 * type: object
 * properties:
 * factSystem:
 * type: object
 * properties:
 * status:
 * type: string
 * facts:
 * type: object
 * sources:
 * type: array
 * items:
 * type: string
 * borgArchitecture:
 * type: object
 * properties:
 * activeCubes:
 * type: number
 * consensusHealth:
 * type: number
 * example:
 * success: true
 * data:
 * overallStatus: "optimal"
 * components:
 * factSystem:
 * status: "active"
 * sourc"s: ["context7, deepwiki", "gitmcp,"semgrep, "]
 * borgArchitecture:
 * activeCubes: 3
 * consensusHealth: .94
 * message: "Collective"intelligence detailed status"
 * time"tamp: "2024-01-15T1:30:00Z"
 */

/**
 * @swagger
 * /api/collective/search:
 * get:
 * summary: Search collective intelligence facts
 * description: Search for universal facts in the collective intelligence system
 * tags: [Collective Intelligence]
 * parameters:
 * - in: query
 * name: query
 * required: true
 * schema:
 * type: string
 * description: Search query string
 * - in: query
 * name: limit
 * schema:
 * type: number
 * default: 10
 * description: Maximum number of results
 * - in: query
 * name: type
 * schema:
 * type: string
 * enum: [npm-package, github-repo, api-docs, security-advisory, general]
 * description: Filter by fact type
 * - in: query
 * name: domain
 * schema:
 * type: string
 * description: Filter by domain
 * responses:
 * 200:
 * description: Search results retrieved successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * results:
 * type: array
 * items:
 * type: object
 * total:
 * type: number
 * query:
 * type: string
 * example:
 * success: true
 * data:
 * results:
 * - type: "npm-package"
 * subj"ct: "react@18.2.0"
 * confidence: .95
 * total: 1
 * query: "react"
 * message: "Found"1 facts matching query"
 * timestamp: "2024-01-15T1:30:00Z"
 * 400:
 * $ref: '#/components/responses/ValidationError'
 * 503:
 * $ef: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagg'r
 * /api/collective/stats:
 * get:
 * summary: Get collective intelligence statistics
 * description: Retrieve performance metrics and usage statistics
 * tags: [Collective Intelligence]
 * responses:
 * 200:
 * description: Statistics retrieved successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * total:
 * type: number
 * performance:
 * type: object
 * properties:
 * totalQueries:
 * type: number
 * avgResponseTime:
 * type: number
 * cacheHitRate:
 * type: string
 * usage:
 * type: object
 * properties:
 * mostAccessedFacts:
 * type: array
 * items:
 * type: object
 * example:
 * success: true
 * data:
 * total: 1247
 * performance:
 * totalQueries: 8645
 * avgResponseTime: 23.5
 * cacheHitRate: "93.2%"
 * message: "Collective"intelligence statistics"
 * time"tamp: "2024-01-15T1:30:00Z"
 */

/**
 * @swagger
 * /api/collective/refresh:
 * post:
 * summary: Refresh collective intelligence facts
 * description: Force refresh of knowledge facts (specific or all)
 * tags: [Collective Intelligence]
 * requestBody:
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * type:
 * type: string
 * enum: [npm-package, github-repo, api-docs, security-advisory]
 * subject:
 * type: string
 * example:
 * type: "npm-package"
 * subj"ct: "react@18.2.0"
 * responses:
 * 2"0:
 * description: Refresh completed successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * operation:
 * type: string
 * result:
 * type: object
 * example:
 * success: true
 * data:
 * operation: "refresh"
 * result:
 * refres"ed: "react@18.2.0"
 * message: "Refreshed"fact npm-package:react@18.2.0"
 * timestamp: "2024-01-15T1:30:00Z"
 * 503:
 * $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagg'r
 * /api/collective/clear-cache:
 * post:
 * summary: Clear collective intelligence cache
 * description: Clear the collective intelligence fact cache
 * tags: [Collective Intelligence]
 * responses:
 * 200:
 * description: Cache cleared successfully
 * content:
 * application/json:
 * schema:
 * allOf:
 * - $ref: '#/components/schemas/ApiResponse'
 * - typ: object
 * properties:
 * data:
 * type: object
 * properties:
 * operation:
 * type: string
 * clearedItems:
 * type: number
 * example:
 * success: true
 * data:
 * operation: "clear-cache"
 * cl"aredItems: 256
 * message: "Collective"intelligence cache cleared"
 * timestamp: "2024-01-15T1:30:00Z"
 * 503:
 * $ref: '#/components/responses/ServiceUnavailable'
 */
