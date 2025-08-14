import * as fs from 'fs';
import { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';
let memoryCoordinator = null;
export class AdvancedToolHandler {
    validateParams(params, schema) {
        if (schema.required) {
            for (const required of schema.required) {
                if (!(required in (params || {}))) {
                    throw new Error(`Missing required parameter: ${required}`);
                }
            }
        }
    }
    createResult(success, content, error, metadata) {
        return {
            success,
            content: Array.isArray(content)
                ? content
                : [{ type: 'text', text: JSON.stringify(content, null, 2) }],
            error,
            metadata: {
                executionTime: Date.now(),
                version: '2.0.0',
                ...metadata,
            },
        };
    }
}
export class AdvancedToolRegistry {
    tools = new Map();
    categoryIndex = new Map();
    tagIndex = new Map();
    registerTool(tool) {
        this.tools.set(tool.name, tool);
        if (!this.categoryIndex.has(tool.category)) {
            this.categoryIndex.set(tool.category, []);
        }
        this.categoryIndex.get(tool.category)?.push(tool.name);
        for (const tag of tool.metadata.tags) {
            if (!this.tagIndex.has(tag)) {
                this.tagIndex.set(tag, []);
            }
            this.tagIndex.get(tag)?.push(tool.name);
        }
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getToolsByCategory(category) {
        const toolNames = this.categoryIndex.get(category) || [];
        return toolNames.map((name) => this.tools.get(name)).filter(Boolean);
    }
    getToolsByTag(tag) {
        const toolNames = this.tagIndex.get(tag) || [];
        return toolNames.map((name) => this.tools.get(name)).filter(Boolean);
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    getToolCount() {
        return this.tools.size;
    }
    getCategorySummary() {
        const summary = {};
        for (const [category, tools] of this.categoryIndex.entries()) {
            summary[category] = tools.length;
        }
        return summary;
    }
}
export const advancedToolRegistry = new AdvancedToolRegistry();
class StoreDiscoveryPatternHandler extends AdvancedToolHandler {
    async execute(params) {
        this.validateParams(params, memoryStoreDiscoveryPatternTool.inputSchema);
        try {
            if (!memoryCoordinator) {
                memoryCoordinator = new MemoryCoordinator({
                    enabled: true,
                    consensus: { quorum: 0.5, timeout: 5000, strategy: 'majority' },
                    distributed: {
                        replication: 1,
                        consistency: 'strong',
                        partitioning: 'hash',
                    },
                    optimization: {
                        autoCompaction: true,
                        cacheEviction: 'lru',
                        memoryThreshold: 0.8,
                    },
                });
            }
            const { pattern } = params;
            const { domainName } = pattern;
            const coordinationParams = {
                type: 'write',
                sessionId: 'discovery_patterns',
                target: domainName,
                metadata: { data: pattern },
            };
            const decision = await memoryCoordinator.coordinate(coordinationParams);
            return this.createResult(true, {
                message: `Discovery pattern for domain '${domainName}' stored successfully.`,
                decision,
            });
        }
        catch (error) {
            return this.createResult(false, null, error.message);
        }
    }
}
export const memoryStoreDiscoveryPatternTool = {
    name: 'memory_store_discovery_pattern',
    description: 'Store a discovery pattern in memory for future use.',
    category: 'memory-neural',
    version: '1.0.0',
    permissions: [{ type: 'write', resource: 'memory:discovery_patterns' }],
    priority: 'medium',
    inputSchema: {
        type: 'object',
        properties: {
            pattern: {
                type: 'object',
                properties: {
                    domainName: { type: 'string' },
                    files: { type: 'array', items: { type: 'string' } },
                    dependencies: { type: 'array', items: { type: 'string' } },
                    confidenceScore: { type: 'number' },
                },
                required: ['domainName', 'files', 'dependencies', 'confidenceScore'],
            },
        },
        required: ['pattern'],
    },
    handler: new StoreDiscoveryPatternHandler(),
    metadata: {
        author: 'Gemini',
        tags: ['memory', 'discovery', 'learning'],
        examples: [
            {
                description: 'Store a discovery pattern for a new domain.',
                params: {
                    pattern: {
                        domainName: 'my-new-domain',
                        files: ['file1.ts', 'file2.ts'],
                        dependencies: ['dependency1', 'dependency2'],
                        confidenceScore: 0.8,
                    },
                },
            },
        ],
        related: ['memory_retrieve_discovery_pattern'],
        since: '2025-08-10',
    },
};
advancedToolRegistry.registerTool(memoryStoreDiscoveryPatternTool);
class RetrieveDiscoveryPatternHandler extends AdvancedToolHandler {
    async execute(params) {
        this.validateParams(params, memoryRetrieveDiscoveryPatternTool.inputSchema);
        try {
            if (!memoryCoordinator) {
                throw new Error('Memory coordinator not initialized. Run memory_init first.');
            }
            const { domainName } = params;
            const coordinationParams = {
                type: 'read',
                sessionId: 'discovery_patterns',
                target: domainName,
            };
            const result = await memoryCoordinator.coordinate(coordinationParams);
            return this.createResult(true, {
                message: `Discovery pattern for domain '${domainName}' retrieved successfully.`,
                pattern: result,
            });
        }
        catch (error) {
            return this.createResult(false, null, error.message);
        }
    }
}
export const memoryRetrieveDiscoveryPatternTool = {
    name: 'memory_retrieve_discovery_pattern',
    description: 'Retrieve a discovery pattern from memory.',
    category: 'memory-neural',
    version: '1.0.0',
    permissions: [{ type: 'read', resource: 'memory:discovery_patterns' }],
    priority: 'medium',
    inputSchema: {
        type: 'object',
        properties: {
            domainName: { type: 'string' },
        },
        required: ['domainName'],
    },
    handler: new RetrieveDiscoveryPatternHandler(),
    metadata: {
        author: 'Gemini',
        tags: ['memory', 'discovery', 'learning'],
        examples: [
            {
                description: 'Retrieve a discovery pattern for a domain.',
                params: {
                    domainName: 'my-new-domain',
                },
            },
        ],
        related: ['memory_store_discovery_pattern'],
        since: '2025-08-10',
    },
};
advancedToolRegistry.registerTool(memoryRetrieveDiscoveryPatternTool);
class FindSimilarDiscoveryPatternsHandler extends AdvancedToolHandler {
    async execute(params) {
        this.validateParams(params, memoryFindSimilarDiscoveryPatternsTool.inputSchema);
        try {
            if (!memoryCoordinator) {
                throw new Error('Memory coordinator not initialized. Run memory_init first.');
            }
            const { pattern, similarityThreshold } = params;
            const allPatternsRaw = await memoryCoordinator.coordinate({
                type: 'read',
                sessionId: 'discovery_patterns',
                target: '*',
            });
            const allPatterns = allPatternsRaw.metadata?.data || [];
            const similarPatterns = allPatterns.filter((p) => {
                const jaccardIndex = this.calculateJaccardIndex(pattern.files, p.files);
                return jaccardIndex >= similarityThreshold;
            });
            return this.createResult(true, {
                message: `Found ${similarPatterns.length} similar discovery patterns.`,
                patterns: similarPatterns,
            });
        }
        catch (error) {
            return this.createResult(false, null, error.message);
        }
    }
    calculateJaccardIndex(set1, set2) {
        const intersection = new Set(set1.filter((x) => new Set(set2).has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }
}
export const memoryFindSimilarDiscoveryPatternsTool = {
    name: 'memory_find_similar_discovery_patterns',
    description: 'Find similar discovery patterns in memory.',
    category: 'memory-neural',
    version: '1.0.0',
    permissions: [{ type: 'read', resource: 'memory:discovery_patterns' }],
    priority: 'medium',
    inputSchema: {
        type: 'object',
        properties: {
            pattern: {
                type: 'object',
                properties: {
                    domainName: { type: 'string' },
                    files: { type: 'array', items: { type: 'string' } },
                    dependencies: { type: 'array', items: { type: 'string' } },
                    confidenceScore: { type: 'number' },
                },
                required: ['domainName', 'files', 'dependencies', 'confidenceScore'],
            },
            similarityThreshold: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                default: 0.5,
            },
        },
        required: ['pattern'],
    },
    handler: new FindSimilarDiscoveryPatternsHandler(),
    metadata: {
        author: 'Gemini',
        tags: ['memory', 'discovery', 'learning', 'pattern-matching'],
        examples: [
            {
                description: 'Find similar discovery patterns for a new domain.',
                params: {
                    pattern: {
                        domainName: 'my-new-domain',
                        files: ['file1.ts', 'file2.ts'],
                        dependencies: ['dependency1', 'dependency2'],
                        confidenceScore: 0.8,
                    },
                    similarityThreshold: 0.7,
                },
            },
        ],
        related: [
            'memory_store_discovery_pattern',
            'memory_retrieve_discovery_pattern',
        ],
        since: '2025-08-10',
    },
};
advancedToolRegistry.registerTool(memoryFindSimilarDiscoveryPatternsTool);
class LogSwarmOperationHandler extends AdvancedToolHandler {
    async execute(params) {
        this.validateParams(params, memoryLogSwarmOperationTool.inputSchema);
        try {
            if (!memoryCoordinator) {
                throw new Error('Memory coordinator not initialized. Run memory_init first.');
            }
            const { operation } = params;
            const coordinationParams = {
                type: 'write',
                sessionId: 'swarm_operations',
                target: `${operation.domainName}-${Date.now()}`,
                metadata: { data: operation },
            };
            const decision = await memoryCoordinator.coordinate(coordinationParams);
            return this.createResult(true, {
                message: 'Swarm operation logged successfully.',
                decision,
            });
        }
        catch (error) {
            return this.createResult(false, null, error.message);
        }
    }
}
export const memoryLogSwarmOperationTool = {
    name: 'memory_log_swarm_operation',
    description: 'Log a swarm operation for continuous learning.',
    category: 'memory-neural',
    version: '1.0.0',
    permissions: [{ type: 'write', resource: 'memory:swarm_operations' }],
    priority: 'medium',
    inputSchema: {
        type: 'object',
        properties: {
            operation: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['bugfix', 'feature', 'refactor'] },
                    domainName: { type: 'string' },
                    filesModified: { type: 'array', items: { type: 'string' } },
                    outcome: { type: 'string', enum: ['success', 'failure'] },
                },
                required: ['type', 'domainName', 'filesModified', 'outcome'],
            },
        },
        required: ['operation'],
    },
    handler: new LogSwarmOperationHandler(),
    metadata: {
        author: 'Gemini',
        tags: ['memory', 'swarm', 'learning', 'logging'],
        examples: [
            {
                description: 'Log a successful bugfix operation.',
                params: {
                    operation: {
                        type: 'bugfix',
                        domainName: 'my-new-domain',
                        filesModified: ['file1.ts'],
                        outcome: 'success',
                    },
                },
            },
        ],
        related: ['memory_update_discovery_pattern_from_swarm_operation'],
        since: '2025-08-10',
    },
};
advancedToolRegistry.registerTool(memoryLogSwarmOperationTool);
class UpdateDiscoveryPatternFromSwarmOperationHandler extends AdvancedToolHandler {
    async execute(params) {
        this.validateParams(params, memoryUpdateDiscoveryPatternFromSwarmOperationTool.inputSchema);
        try {
            if (!memoryCoordinator) {
                throw new Error('Memory coordinator not initialized. Run memory_init first.');
            }
            const { operation } = params;
            const { domainName, filesModified, outcome } = operation;
            const existingPatternRaw = await memoryCoordinator.coordinate({
                type: 'read',
                sessionId: 'discovery_patterns',
                target: domainName,
            });
            const existingPattern = existingPatternRaw.metadata?.data;
            if (!existingPattern) {
                throw new Error(`Discovery pattern for domain '${domainName}' not found.`);
            }
            if (outcome === 'success') {
                existingPattern.confidenceScore = Math.min(1, existingPattern.confidenceScore + 0.1);
                existingPattern.files = [
                    ...new Set([...existingPattern.files, ...filesModified]),
                ];
            }
            else {
                existingPattern.confidenceScore = Math.max(0, existingPattern.confidenceScore - 0.1);
            }
            const coordinationParams = {
                type: 'write',
                sessionId: 'discovery_patterns',
                target: domainName,
                metadata: { data: existingPattern },
            };
            const decision = await memoryCoordinator.coordinate(coordinationParams);
            return this.createResult(true, {
                message: `Discovery pattern for domain '${domainName}' updated successfully.`,
                decision,
            });
        }
        catch (error) {
            return this.createResult(false, null, error.message);
        }
    }
}
export const memoryUpdateDiscoveryPatternFromSwarmOperationTool = {
    name: 'memory_update_discovery_pattern_from_swarm_operation',
    description: 'Update a discovery pattern based on a swarm operation.',
    category: 'memory-neural',
    version: '1.0.0',
    permissions: [{ type: 'write', resource: 'memory:discovery_patterns' }],
    priority: 'medium',
    inputSchema: {
        type: 'object',
        properties: {
            operation: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['bugfix', 'feature', 'refactor'] },
                    domainName: { type: 'string' },
                    filesModified: { type: 'array', items: { type: 'string' } },
                    outcome: { type: 'string', enum: ['success', 'failure'] },
                },
                required: ['type', 'domainName', 'filesModified', 'outcome'],
            },
        },
        required: ['operation'],
    },
    handler: new UpdateDiscoveryPatternFromSwarmOperationHandler(),
    metadata: {
        author: 'Gemini',
        tags: ['memory', 'swarm', 'learning', 'update'],
        examples: [
            {
                description: 'Update a discovery pattern after a successful bugfix.',
                params: {
                    operation: {
                        type: 'bugfix',
                        domainName: 'my-new-domain',
                        filesModified: ['file1.ts'],
                        outcome: 'success',
                    },
                },
            },
        ],
        related: ['memory_log_swarm_operation'],
        since: '2025-08-10',
    },
};
advancedToolRegistry.registerTool(memoryUpdateDiscoveryPatternFromSwarmOperationTool);
class ExportDiscoveryPatternsHandler extends AdvancedToolHandler {
    async execute(params) {
        this.validateParams(params, memoryExportDiscoveryPatternsTool.inputSchema);
        try {
            if (!memoryCoordinator) {
                throw new Error('Memory coordinator not initialized. Run memory_init first.');
            }
            const { filePath } = params;
            const allPatternsRaw = await memoryCoordinator.coordinate({
                type: 'read',
                sessionId: 'discovery_patterns',
                target: '*',
            });
            const allPatterns = allPatternsRaw.metadata?.data || [];
            fs.writeFileSync(filePath, JSON.stringify(allPatterns, null, 2));
            return this.createResult(true, {
                message: `Successfully exported ${allPatterns.length} discovery patterns to ${filePath}.`,
            });
        }
        catch (error) {
            return this.createResult(false, null, error.message);
        }
    }
}
export const memoryExportDiscoveryPatternsTool = {
    name: 'memory_export_discovery_patterns',
    description: 'Export all discovery patterns to a file.',
    category: 'memory-neural',
    version: '1.0.0',
    permissions: [
        { type: 'read', resource: 'memory:discovery_patterns' },
        { type: 'write', resource: 'filesystem' },
    ],
    priority: 'medium',
    inputSchema: {
        type: 'object',
        properties: {
            filePath: { type: 'string' },
        },
        required: ['filePath'],
    },
    handler: new ExportDiscoveryPatternsHandler(),
    metadata: {
        author: 'Gemini',
        tags: ['memory', 'discovery', 'learning', 'export'],
        examples: [
            {
                description: 'Export all discovery patterns to a JSON file.',
                params: {
                    filePath: 'discovery-patterns.json',
                },
            },
        ],
        related: ['memory_store_discovery_pattern'],
        since: '2025-08-10',
    },
};
advancedToolRegistry.registerTool(memoryExportDiscoveryPatternsTool);
export default advancedToolRegistry;
//# sourceMappingURL=mcp-tools.js.map