/**
 * OpenAPI 3.0 + Swagger Configuration
 * Complete API documentation for Claude Code Zen
 */
export declare const swaggerOptions: {
    definition: {
        openapi: string;
        info: {
            title: string;
            version: string;
            description: string;
            contact: {
                name: string;
                url: string;
            };
            license: {
                name: string;
                url: string;
            };
        };
        servers: {
            url: string;
            description: string;
        }[];
        components: {
            schemas: {
                ApiResponse: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            description: string;
                        };
                        data: {
                            type: string;
                            description: string;
                        };
                        error: {
                            type: string;
                            description: string;
                        };
                        message: {
                            type: string;
                            description: string;
                        };
                        timestamp: {
                            type: string;
                            format: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                HealthCheck: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        uptime: {
                            type: string;
                            description: string;
                        };
                        memory: {
                            type: string;
                            properties: {
                                used: {
                                    type: string;
                                    description: string;
                                };
                                total: {
                                    type: string;
                                    description: string;
                                };
                            };
                        };
                        version: {
                            type: string;
                            description: string;
                        };
                        environment: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                    };
                    required: string[];
                };
                Workflow: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        title: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        description: {
                            type: string;
                            description: string;
                        };
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        priority: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        submittedAt: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        submittedBy: {
                            type: string;
                            description: string;
                        };
                        estimatedEffort: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        riskLevel: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        dependencies: {
                            type: string;
                            items: {
                                type: string;
                            };
                            description: string;
                        };
                    };
                    required: string[];
                };
                Roadmap: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        title: {
                            type: string;
                            description: string;
                        };
                        description: {
                            type: string;
                            description: string;
                        };
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        progress: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        startDate: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        endDate: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        owner: {
                            type: string;
                            description: string;
                        };
                        milestones: {
                            type: string;
                            description: string;
                        };
                        completedMilestones: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                Consultation: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        title: {
                            type: string;
                            description: string;
                        };
                        description: {
                            type: string;
                            description: string;
                        };
                        expert: {
                            type: string;
                            description: string;
                        };
                        expertise: {
                            type: string;
                            items: {
                                type: string;
                            };
                            description: string;
                        };
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        createdAt: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        completedAt: {
                            type: string;
                            format: string;
                            nullable: boolean;
                            description: string;
                        };
                        recommendation: {
                            type: string;
                            description: string;
                        };
                        confidence: {
                            type: string;
                            enum: string[];
                            nullable: boolean;
                            description: string;
                        };
                        followUpRequired: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                Error: {
                    type: string;
                    properties: {
                        success: {
                            type: string;
                            enum: boolean[];
                            description: string;
                        };
                        error: {
                            type: string;
                            description: string;
                        };
                        message: {
                            type: string;
                            description: string;
                        };
                        timestamp: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        details: {
                            type: string;
                            description: string;
                            additionalProperties: boolean;
                        };
                    };
                    required: string[];
                };
            };
            responses: {
                Success: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                NotFound: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                            example: {
                                success: boolean;
                                error: string;
                                message: string;
                                timestamp: string;
                            };
                        };
                    };
                };
                ValidationError: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                            example: {
                                success: boolean;
                                error: string;
                                message: string;
                                timestamp: string;
                            };
                        };
                    };
                };
                RateLimitExceeded: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                            example: {
                                success: boolean;
                                error: string;
                                message: string;
                                timestamp: string;
                            };
                        };
                    };
                };
                InternalServerError: {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                            example: {
                                success: boolean;
                                error: string;
                                message: string;
                                timestamp: string;
                            };
                        };
                    };
                };
            };
            parameters: {
                WorkflowStatus: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                        enum: string[];
                    };
                };
                WorkflowPriority: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                        enum: string[];
                    };
                };
            };
        };
        tags: {
            name: string;
            description: string;
        }[];
    };
    apis: string[];
};
export declare const swaggerUiOptions: {
    customSiteTitle: string;
    customfavIcon: string;
    customCss: string;
    swaggerOptions: {
        persistAuthorization: boolean;
        displayRequestDuration: boolean;
        filter: boolean;
        showExtensions: boolean;
        showCommonExtensions: boolean;
        tryItOutEnabled: boolean;
    };
};
//# sourceMappingURL=swagger-config.d.ts.map