/**
 * Batch Tools for Unified MCP Server.
 * Batch execution capabilities consolidated from coordination layer.
 */
/**
 * @file Coordination system: batch-tools.
 */
import type { MCPToolResult } from './types.ts';
export declare const batchExecuteTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            operations: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                        };
                        type: {
                            type: string;
                            enum: string[];
                        };
                        operation: {
                            type: string;
                        };
                        params: {
                            type: string;
                        };
                        dependencies: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                    required: string[];
                };
            };
            config: {
                type: string;
                properties: {
                    maxConcurrency: {
                        type: string;
                    };
                    trackPerformance: {
                        type: string;
                    };
                };
            };
        };
        required: string[];
    };
    handler(params: any): Promise<MCPToolResult>;
};
export declare const batchPerformanceTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            action: {
                type: string;
                enum: string[];
            };
            hours: {
                type: string;
            };
            metric: {
                type: string;
            };
        };
        required: string[];
    };
    handler(params: any): Promise<MCPToolResult>;
};
export declare const projectInitBatchTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            projectName: {
                type: string;
            };
            basePath: {
                type: string;
            };
            swarmConfig: {
                type: string;
                properties: {
                    topology: {
                        type: string;
                        enum: string[];
                    };
                    maxAgents: {
                        type: string;
                    };
                };
            };
            agentTypes: {
                type: string;
                items: {
                    type: string;
                };
            };
            fileStructure: {
                type: string;
            };
            packageJson: {
                type: string;
            };
        };
        required: string[];
    };
    handler(params: any): Promise<MCPToolResult>;
};
//# sourceMappingURL=batch-tools.d.ts.map