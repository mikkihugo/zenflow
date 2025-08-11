/**
 * MCP Tools for SPARC Architecture Management.
 *
 * Provides Model Context Protocol tools for managing SPARC architecture designs,
 * enabling external access to architecture generation and validation.
 */
/**
 * @file Coordination system: architecture-tools.
 */
import type { ArchitecturalValidation, ArchitectureDesign, DetailedSpecification, PseudocodeStructure } from '../types/sparc-types.ts';
/**
 * MCP Tool definitions for SPARC Architecture operations.
 */
export interface ArchitectureMCPTools {
    generateArchitecture: (params: {
        pseudocode: PseudocodeStructure;
        projectId?: string;
        domain?: string;
    }) => Promise<{
        success: boolean;
        architectureId: string;
        architecture: ArchitectureDesign;
        message: string;
    }>;
    generateArchitectureFromSpec: (params: {
        specification: DetailedSpecification;
        pseudocode: any[];
        projectId?: string;
    }) => Promise<{
        success: boolean;
        architectureId: string;
        architecture: ArchitectureDesign;
        message: string;
    }>;
    validateArchitecture: (params: {
        architectureId: string;
        validationType?: string;
    }) => Promise<{
        success: boolean;
        validation: ArchitecturalValidation;
        recommendations: string[];
        message: string;
    }>;
    getArchitecture: (params: {
        architectureId: string;
    }) => Promise<{
        success: boolean;
        architecture: ArchitectureDesign | null;
        message: string;
    }>;
    searchArchitectures: (params: {
        domain?: string;
        tags?: string[];
        minScore?: number;
        limit?: number;
    }) => Promise<{
        success: boolean;
        architectures: ArchitectureDesign[];
        count: number;
        message: string;
    }>;
    updateArchitecture: (params: {
        architectureId: string;
        updates: Partial<ArchitectureDesign>;
    }) => Promise<{
        success: boolean;
        architecture: ArchitectureDesign;
        message: string;
    }>;
    deleteArchitecture: (params: {
        architectureId: string;
    }) => Promise<{
        success: boolean;
        message: string;
    }>;
    getArchitectureStats: () => Promise<{
        success: boolean;
        stats: {
            totalArchitectures: number;
            byDomain: Record<string, number>;
            averageComponents: number;
            validationStats: {
                totalValidated: number;
                averageScore: number;
                passRate: number;
            };
        };
        message: string;
    }>;
    exportArchitecture: (params: {
        architectureId: string;
        format: 'json' | 'yaml' | 'mermaid';
    }) => Promise<{
        success: boolean;
        content: string;
        filename: string;
        message: string;
    }>;
    cloneArchitecture: (params: {
        sourceArchitectureId: string;
        targetProjectId?: string;
        modifications?: Partial<ArchitectureDesign>;
    }) => Promise<{
        success: boolean;
        newArchitectureId: string;
        architecture: ArchitectureDesign;
        message: string;
    }>;
}
/**
 * MCP Tool Schema definitions for external integration.
 */
export declare const ARCHITECTURE_MCP_TOOLS: {
    generateArchitecture: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                pseudocode: {
                    type: string;
                    description: string;
                    properties: {
                        id: {
                            type: string;
                        };
                        algorithms: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        dataStructures: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        controlFlows: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        optimizations: {
                            type: string;
                            items: {
                                type: string;
                            };
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
                projectId: {
                    type: string;
                    description: string;
                };
                domain: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
            required: string[];
        };
    };
    generateArchitectureFromSpec: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                specification: {
                    type: string;
                    description: string;
                    properties: {
                        functionalRequirements: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        nonFunctionalRequirements: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        constraints: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        assumptions: {
                            type: string;
                            items: {
                                type: string;
                            };
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
                pseudocode: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                projectId: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    validateArchitecture: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                architectureId: {
                    type: string;
                    description: string;
                };
                validationType: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
            required: string[];
        };
    };
    getArchitecture: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                architectureId: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    searchArchitectures: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                domain: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                tags: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                minScore: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                limit: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
            };
        };
    };
    updateArchitecture: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                architectureId: {
                    type: string;
                    description: string;
                };
                updates: {
                    type: string;
                    description: string;
                    properties: {
                        components: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        qualityAttributes: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        securityRequirements: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        scalabilityRequirements: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    deleteArchitecture: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                architectureId: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    getArchitectureStats: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {};
        };
    };
    exportArchitecture: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                architectureId: {
                    type: string;
                    description: string;
                };
                format: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
            required: string[];
        };
    };
    cloneArchitecture: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                sourceArchitectureId: {
                    type: string;
                    description: string;
                };
                targetProjectId: {
                    type: string;
                    description: string;
                };
                modifications: {
                    type: string;
                    description: string;
                    properties: {
                        components: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        qualityAttributes: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
};
/**
 * Implementation of Architecture MCP Tools.
 *
 * @example
 */
export declare class ArchitectureMCPToolsImpl implements ArchitectureMCPTools {
    private db;
    private logger?;
    private architectureEngine;
    private storageService;
    constructor(db: any, // DatabaseAdapter
    logger?: any | undefined);
    /**
     * Initialize the MCP tools and underlying services.
     */
    initialize(): Promise<void>;
    /**
     * Generate architecture from pseudocode structure.
     *
     * @param params
     * @param params.pseudocode
     * @param params.projectId
     * @param params.domain
     */
    generateArchitecture(params: {
        pseudocode: PseudocodeStructure;
        projectId?: string;
        domain?: string;
    }): Promise<{
        success: boolean;
        architectureId: string;
        architecture: ArchitectureDesign;
        message: string;
    }>;
    /**
     * Generate architecture from specification and pseudocode.
     *
     * @param params
     * @param params.specification
     * @param params.pseudocode
     * @param params.projectId
     */
    generateArchitectureFromSpec(params: {
        specification: DetailedSpecification;
        pseudocode: any[];
        projectId?: string;
    }): Promise<{
        success: boolean;
        architectureId: string;
        architecture: ArchitectureDesign;
        message: string;
    }>;
    /**
     * Validate architecture design.
     *
     * @param params
     * @param params.architectureId
     * @param params.validationType
     */
    validateArchitecture(params: {
        architectureId: string;
        validationType?: string;
    }): Promise<{
        success: boolean;
        validation: ArchitecturalValidation;
        recommendations: string[];
        message: string;
    }>;
    /**
     * Get architecture by ID.
     *
     * @param params
     * @param params.architectureId
     */
    getArchitecture(params: {
        architectureId: string;
    }): Promise<{
        success: boolean;
        architecture: ArchitectureDesign | null;
        message: string;
    }>;
    /**
     * Search architectures with criteria.
     *
     * @param params
     * @param params.domain
     * @param params.tags
     * @param params.minScore
     * @param params.limit
     */
    searchArchitectures(params: {
        domain?: string;
        tags?: string[];
        minScore?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        architectures: ArchitectureDesign[];
        count: number;
        message: string;
    }>;
    /**
     * Update architecture design.
     *
     * @param params
     * @param params.architectureId
     * @param params.updates
     */
    updateArchitecture(params: {
        architectureId: string;
        updates: Partial<ArchitectureDesign>;
    }): Promise<{
        success: boolean;
        architecture: ArchitectureDesign;
        message: string;
    }>;
    /**
     * Delete architecture design.
     *
     * @param params
     * @param params.architectureId
     */
    deleteArchitecture(params: {
        architectureId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get architecture statistics.
     */
    getArchitectureStats(): Promise<{
        success: boolean;
        stats: {
            totalArchitectures: number;
            byDomain: Record<string, number>;
            averageComponents: number;
            validationStats: {
                totalValidated: number;
                averageScore: number;
                passRate: number;
            };
        };
        message: string;
    }>;
    /**
     * Export architecture in various formats.
     *
     * @param params
     * @param params.architectureId
     * @param params.format
     */
    exportArchitecture(params: {
        architectureId: string;
        format: 'json' | 'yaml' | 'mermaid';
    }): Promise<{
        success: boolean;
        content: string;
        filename: string;
        message: string;
    }>;
    /**
     * Clone architecture with optional modifications.
     *
     * @param params
     * @param params.sourceArchitectureId
     * @param params.targetProjectId
     * @param params.modifications
     */
    cloneArchitecture(params: {
        sourceArchitectureId: string;
        targetProjectId?: string;
        modifications?: Partial<ArchitectureDesign>;
    }): Promise<{
        success: boolean;
        newArchitectureId: string;
        architecture: ArchitectureDesign;
        message: string;
    }>;
    private jsonToYaml;
    private architectureToMermaid;
}
/**
 * Factory function to create and initialize Architecture MCP Tools.
 *
 * @param db
 * @param logger
 * @example
 */
export declare function createArchitectureMCPTools(db: any, logger?: any): Promise<ArchitectureMCPToolsImpl>;
//# sourceMappingURL=architecture-tools.d.ts.map