/**
 * MCP Tools for SPARC Architecture Management
 *
 * Provides Model Context Protocol tools for managing SPARC architecture designs,
 * enabling external access to architecture generation and validation.
 */

import { nanoid } from 'nanoid';
import { ArchitectureStorageService } from '../database/architecture-storage';
import { DatabaseDrivenArchitecturePhaseEngine } from '../phases/architecture/database-driven-architecture-engine';
import type {
  ArchitecturalValidation,
  ArchitectureDesign,
  DetailedSpecification,
  PseudocodeStructure,
} from '../types/sparc-types';

/**
 * MCP Tool definitions for SPARC Architecture operations
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

  validateArchitecture: (params: { architectureId: string; validationType?: string }) => Promise<{
    success: boolean;
    validation: ArchitecturalValidation;
    recommendations: string[];
    message: string;
  }>;

  getArchitecture: (params: { architectureId: string }) => Promise<{
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

  deleteArchitecture: (params: { architectureId: string }) => Promise<{
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
 * MCP Tool Schema definitions for external integration
 */
export const ARCHITECTURE_MCP_TOOLS = {
  generateArchitecture: {
    name: 'sparc_generate_architecture',
    description: 'Generate system architecture from pseudocode structure using SPARC methodology',
    inputSchema: {
      type: 'object',
      properties: {
        pseudocode: {
          type: 'object',
          description: 'Pseudocode structure from Phase 2',
          properties: {
            id: { type: 'string' },
            algorithms: { type: 'array', items: { type: 'object' } },
            dataStructures: { type: 'array', items: { type: 'object' } },
            controlFlows: { type: 'array', items: { type: 'object' } },
            optimizations: { type: 'array', items: { type: 'object' } },
            dependencies: { type: 'array', items: { type: 'object' } },
          },
          required: ['algorithms', 'dataStructures'],
        },
        projectId: { type: 'string', description: 'Optional project identifier' },
        domain: {
          type: 'string',
          enum: [
            'swarm-coordination',
            'neural-networks',
            'wasm-integration',
            'rest-api',
            'memory-systems',
            'interfaces',
            'general',
          ],
          description: 'Target domain for architecture',
        },
      },
      required: ['pseudocode'],
    },
  },

  generateArchitectureFromSpec: {
    name: 'sparc_generate_architecture_from_spec',
    description: 'Generate system architecture from detailed specification and pseudocode',
    inputSchema: {
      type: 'object',
      properties: {
        specification: {
          type: 'object',
          description: 'Detailed specification from Phase 1',
          properties: {
            functionalRequirements: { type: 'array', items: { type: 'object' } },
            nonFunctionalRequirements: { type: 'array', items: { type: 'object' } },
            constraints: { type: 'array', items: { type: 'object' } },
            assumptions: { type: 'array', items: { type: 'object' } },
            dependencies: { type: 'array', items: { type: 'object' } },
          },
          required: ['functionalRequirements'],
        },
        pseudocode: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of algorithm pseudocode',
        },
        projectId: { type: 'string', description: 'Optional project identifier' },
      },
      required: ['specification', 'pseudocode'],
    },
  },

  validateArchitecture: {
    name: 'sparc_validate_architecture',
    description: 'Validate architecture design for consistency and quality',
    inputSchema: {
      type: 'object',
      properties: {
        architectureId: { type: 'string', description: 'Architecture ID to validate' },
        validationType: {
          type: 'string',
          enum: ['consistency', 'performance', 'security', 'scalability', 'general'],
          description: 'Type of validation to perform',
        },
      },
      required: ['architectureId'],
    },
  },

  getArchitecture: {
    name: 'sparc_get_architecture',
    description: 'Retrieve architecture design by ID',
    inputSchema: {
      type: 'object',
      properties: {
        architectureId: { type: 'string', description: 'Architecture ID to retrieve' },
      },
      required: ['architectureId'],
    },
  },

  searchArchitectures: {
    name: 'sparc_search_architectures',
    description: 'Search architecture designs with criteria',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          enum: [
            'swarm-coordination',
            'neural-networks',
            'wasm-integration',
            'rest-api',
            'memory-systems',
            'interfaces',
            'general',
          ],
          description: 'Filter by domain',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags',
        },
        minScore: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Minimum validation score',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Maximum number of results',
        },
      },
    },
  },

  updateArchitecture: {
    name: 'sparc_update_architecture',
    description: 'Update existing architecture design',
    inputSchema: {
      type: 'object',
      properties: {
        architectureId: { type: 'string', description: 'Architecture ID to update' },
        updates: {
          type: 'object',
          description: 'Partial architecture updates',
          properties: {
            components: { type: 'array', items: { type: 'object' } },
            qualityAttributes: { type: 'array', items: { type: 'object' } },
            securityRequirements: { type: 'array', items: { type: 'object' } },
            scalabilityRequirements: { type: 'array', items: { type: 'object' } },
          },
        },
      },
      required: ['architectureId', 'updates'],
    },
  },

  deleteArchitecture: {
    name: 'sparc_delete_architecture',
    description: 'Delete architecture design',
    inputSchema: {
      type: 'object',
      properties: {
        architectureId: { type: 'string', description: 'Architecture ID to delete' },
      },
      required: ['architectureId'],
    },
  },

  getArchitectureStats: {
    name: 'sparc_get_architecture_stats',
    description: 'Get architecture statistics and metrics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  exportArchitecture: {
    name: 'sparc_export_architecture',
    description: 'Export architecture design in various formats',
    inputSchema: {
      type: 'object',
      properties: {
        architectureId: { type: 'string', description: 'Architecture ID to export' },
        format: {
          type: 'string',
          enum: ['json', 'yaml', 'mermaid'],
          description: 'Export format',
        },
      },
      required: ['architectureId', 'format'],
    },
  },

  cloneArchitecture: {
    name: 'sparc_clone_architecture',
    description: 'Clone existing architecture with optional modifications',
    inputSchema: {
      type: 'object',
      properties: {
        sourceArchitectureId: { type: 'string', description: 'Source architecture ID to clone' },
        targetProjectId: {
          type: 'string',
          description: 'Target project ID for cloned architecture',
        },
        modifications: {
          type: 'object',
          description: 'Optional modifications to apply during cloning',
          properties: {
            components: { type: 'array', items: { type: 'object' } },
            qualityAttributes: { type: 'array', items: { type: 'object' } },
          },
        },
      },
      required: ['sourceArchitectureId'],
    },
  },
};

/**
 * Implementation of Architecture MCP Tools
 *
 * @example
 */
export class ArchitectureMCPToolsImpl implements ArchitectureMCPTools {
  private architectureEngine: DatabaseDrivenArchitecturePhaseEngine;
  private storageService: ArchitectureStorageService;

  constructor(
    private db: any, // DatabaseAdapter
    private logger?: any // Logger interface
  ) {
    this.architectureEngine = new DatabaseDrivenArchitecturePhaseEngine(db, logger);
    this.storageService = new ArchitectureStorageService(db);
  }

  /**
   * Initialize the MCP tools and underlying services
   */
  async initialize(): Promise<void> {
    await this.architectureEngine.initialize();
    this.logger?.info('Architecture MCP Tools initialized');
  }

  /**
   * Generate architecture from pseudocode structure
   *
   * @param params
   * @param params.pseudocode
   * @param params.projectId
   * @param params.domain
   */
  async generateArchitecture(params: {
    pseudocode: PseudocodeStructure;
    projectId?: string;
    domain?: string;
  }): Promise<{
    success: boolean;
    architectureId: string;
    architecture: ArchitectureDesign;
    message: string;
  }> {
    try {
      this.logger?.info(`Generating architecture for domain: ${params.domain || 'general'}`);

      // Validate pseudocode structure
      if (!params.pseudocode.algorithms || params.pseudocode.algorithms.length === 0) {
        throw new Error('Pseudocode structure must contain at least one algorithm');
      }

      // Generate architecture using the enhanced engine
      const architecture = await this.architectureEngine.designArchitecture(params.pseudocode);

      // Save with project association if provided
      const architectureId = await this.storageService.saveArchitecture(
        architecture,
        params.projectId
      );

      return {
        success: true,
        architectureId,
        architecture: { ...architecture, id: architectureId },
        message: `Architecture generated successfully with ${architecture.components?.length || 0} components`,
      };
    } catch (error) {
      this.logger?.error('Failed to generate architecture:', error);
      return {
        success: false,
        architectureId: '',
        architecture: {} as ArchitectureDesign,
        message: `Architecture generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate architecture from specification and pseudocode
   *
   * @param params
   * @param params.specification
   * @param params.pseudocode
   * @param params.projectId
   */
  async generateArchitectureFromSpec(params: {
    specification: DetailedSpecification;
    pseudocode: any[];
    projectId?: string;
  }): Promise<{
    success: boolean;
    architectureId: string;
    architecture: ArchitectureDesign;
    message: string;
  }> {
    try {
      this.logger?.info(
        `Generating architecture from specification with ${params.pseudocode.length} algorithms`
      );

      // Generate system architecture from specification and pseudocode
      const systemArchitecture = await this.architectureEngine.designSystemArchitecture(
        params.specification,
        params.pseudocode
      );

      // Create full architecture design
      const architecture: ArchitectureDesign = {
        id: nanoid(),
        systemArchitecture,
        componentDiagrams:
          await this.architectureEngine.generateComponentDiagrams(systemArchitecture),
        dataFlow: await this.architectureEngine.designDataFlow(systemArchitecture.components),
        deploymentPlan:
          await this.architectureEngine.planDeploymentArchitecture(systemArchitecture),
        validationResults:
          await this.architectureEngine.validateArchitecturalConsistency(systemArchitecture),
        components: systemArchitecture.components,
        relationships: [], // Component relationships
        patterns: [], // Architectural patterns
        securityRequirements: [], // Will be populated by the engine
        scalabilityRequirements: [], // Will be populated by the engine
        qualityAttributes: systemArchitecture.qualityAttributes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the architecture
      const architectureId = await this.storageService.saveArchitecture(
        architecture,
        params.projectId
      );

      return {
        success: true,
        architectureId,
        architecture: { ...architecture, id: architectureId },
        message: `Architecture generated from specification with ${architecture.components.length} components`,
      };
    } catch (error) {
      this.logger?.error('Failed to generate architecture from specification:', error);
      return {
        success: false,
        architectureId: '',
        architecture: {} as ArchitectureDesign,
        message: `Architecture generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate architecture design
   *
   * @param params
   * @param params.architectureId
   * @param params.validationType
   */
  async validateArchitecture(params: { architectureId: string; validationType?: string }): Promise<{
    success: boolean;
    validation: ArchitecturalValidation;
    recommendations: string[];
    message: string;
  }> {
    try {
      this.logger?.info(`Validating architecture: ${params.architectureId}`);

      // Get architecture from database
      const architecture = await this.storageService.getArchitectureById(params.architectureId);
      if (!architecture) {
        throw new Error(`Architecture not found: ${params.architectureId}`);
      }

      // Perform validation
      const validation = await this.architectureEngine.validateArchitecturalConsistency(
        architecture.systemArchitecture
      );

      // Save validation results
      await this.storageService.saveValidation(
        params.architectureId,
        validation,
        params.validationType || 'general'
      );

      return {
        success: true,
        validation,
        recommendations: validation.recommendations,
        message: `Architecture validation completed with score: ${validation.overallScore.toFixed(2)}`,
      };
    } catch (error) {
      this.logger?.error('Failed to validate architecture:', error);
      return {
        success: false,
        validation: {
          overall: false,
          approved: false,
          score: 0,
          overallScore: 0,
          results: [],
          validationResults: [],
          recommendations: [],
        },
        recommendations: [],
        message: `Architecture validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get architecture by ID
   *
   * @param params
   * @param params.architectureId
   */
  async getArchitecture(params: { architectureId: string }): Promise<{
    success: boolean;
    architecture: ArchitectureDesign | null;
    message: string;
  }> {
    try {
      this.logger?.info(`Retrieving architecture: ${params.architectureId}`);

      const architecture = await this.storageService.getArchitectureById(params.architectureId);

      return {
        success: true,
        architecture,
        message: architecture
          ? `Architecture retrieved successfully`
          : `Architecture not found: ${params.architectureId}`,
      };
    } catch (error) {
      this.logger?.error('Failed to get architecture:', error);
      return {
        success: false,
        architecture: null,
        message: `Failed to retrieve architecture: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Search architectures with criteria
   *
   * @param params
   * @param params.domain
   * @param params.tags
   * @param params.minScore
   * @param params.limit
   */
  async searchArchitectures(params: {
    domain?: string;
    tags?: string[];
    minScore?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    architectures: ArchitectureDesign[];
    count: number;
    message: string;
  }> {
    try {
      this.logger?.info(`Searching architectures with criteria:`, params);

      const architectures = await this.storageService.searchArchitectures(params);

      return {
        success: true,
        architectures,
        count: architectures.length,
        message: `Found ${architectures.length} architectures matching criteria`,
      };
    } catch (error) {
      this.logger?.error('Failed to search architectures:', error);
      return {
        success: false,
        architectures: [],
        count: 0,
        message: `Architecture search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update architecture design
   *
   * @param params
   * @param params.architectureId
   * @param params.updates
   */
  async updateArchitecture(params: {
    architectureId: string;
    updates: Partial<ArchitectureDesign>;
  }): Promise<{
    success: boolean;
    architecture: ArchitectureDesign;
    message: string;
  }> {
    try {
      this.logger?.info(`Updating architecture: ${params.architectureId}`);

      const updatedArchitecture = await this.architectureEngine.updateArchitecture(
        params.architectureId,
        params.updates
      );

      return {
        success: true,
        architecture: updatedArchitecture,
        message: 'Architecture updated successfully',
      };
    } catch (error) {
      this.logger?.error('Failed to update architecture:', error);
      return {
        success: false,
        architecture: {} as ArchitectureDesign,
        message: `Architecture update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete architecture design
   *
   * @param params
   * @param params.architectureId
   */
  async deleteArchitecture(params: { architectureId: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      this.logger?.info(`Deleting architecture: ${params.architectureId}`);

      await this.storageService.deleteArchitecture(params.architectureId);

      return {
        success: true,
        message: 'Architecture deleted successfully',
      };
    } catch (error) {
      this.logger?.error('Failed to delete architecture:', error);
      return {
        success: false,
        message: `Architecture deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get architecture statistics
   */
  async getArchitectureStats(): Promise<{
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
  }> {
    try {
      this.logger?.info('Retrieving architecture statistics');

      const stats = await this.storageService.getArchitectureStats();

      return {
        success: true,
        stats,
        message: 'Architecture statistics retrieved successfully',
      };
    } catch (error) {
      this.logger?.error('Failed to get architecture statistics:', error);
      return {
        success: false,
        stats: {
          totalArchitectures: 0,
          byDomain: {},
          averageComponents: 0,
          validationStats: {
            totalValidated: 0,
            averageScore: 0,
            passRate: 0,
          },
        },
        message: `Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Export architecture in various formats
   *
   * @param params
   * @param params.architectureId
   * @param params.format
   */
  async exportArchitecture(params: {
    architectureId: string;
    format: 'json' | 'yaml' | 'mermaid';
  }): Promise<{
    success: boolean;
    content: string;
    filename: string;
    message: string;
  }> {
    try {
      this.logger?.info(`Exporting architecture ${params.architectureId} as ${params.format}`);

      const architecture = await this.storageService.getArchitectureById(params.architectureId);
      if (!architecture) {
        throw new Error(`Architecture not found: ${params.architectureId}`);
      }

      let content: string;
      let filename: string;

      switch (params.format) {
        case 'json':
          content = JSON.stringify(architecture, null, 2);
          filename = `architecture-${params.architectureId}.json`;
          break;

        case 'yaml':
          // Simple YAML conversion (would use a proper YAML library in production)
          content = this.jsonToYaml(architecture);
          filename = `architecture-${params.architectureId}.yaml`;
          break;

        case 'mermaid':
          content = this.architectureToMermaid(architecture);
          filename = `architecture-${params.architectureId}.mmd`;
          break;

        default:
          throw new Error(`Unsupported export format: ${params.format}`);
      }

      return {
        success: true,
        content,
        filename,
        message: `Architecture exported successfully as ${params.format}`,
      };
    } catch (error) {
      this.logger?.error('Failed to export architecture:', error);
      return {
        success: false,
        content: '',
        filename: '',
        message: `Architecture export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Clone architecture with optional modifications
   *
   * @param params
   * @param params.sourceArchitectureId
   * @param params.targetProjectId
   * @param params.modifications
   */
  async cloneArchitecture(params: {
    sourceArchitectureId: string;
    targetProjectId?: string;
    modifications?: Partial<ArchitectureDesign>;
  }): Promise<{
    success: boolean;
    newArchitectureId: string;
    architecture: ArchitectureDesign;
    message: string;
  }> {
    try {
      this.logger?.info(`Cloning architecture: ${params.sourceArchitectureId}`);

      // Get source architecture
      const sourceArchitecture = await this.storageService.getArchitectureById(
        params.sourceArchitectureId
      );
      if (!sourceArchitecture) {
        throw new Error(`Source architecture not found: ${params.sourceArchitectureId}`);
      }

      // Create cloned architecture with modifications
      const clonedArchitecture: ArchitectureDesign = {
        ...sourceArchitecture,
        ...params.modifications,
        id: nanoid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save cloned architecture
      const newArchitectureId = await this.storageService.saveArchitecture(
        clonedArchitecture,
        params.targetProjectId
      );

      return {
        success: true,
        newArchitectureId,
        architecture: { ...clonedArchitecture, id: newArchitectureId },
        message: `Architecture cloned successfully as ${newArchitectureId}`,
      };
    } catch (error) {
      this.logger?.error('Failed to clone architecture:', error);
      return {
        success: false,
        newArchitectureId: '',
        architecture: {} as ArchitectureDesign,
        message: `Architecture cloning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Helper methods for export functionality

  private jsonToYaml(obj: any): string {
    // Simple JSON to YAML conversion (basic implementation)
    const yamlify = (obj: any, depth: number = 0): string => {
      const indent = '  '.repeat(depth);
      if (typeof obj !== 'object' || obj === null) {
        return JSON.stringify(obj);
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => `${indent}- ${yamlify(item, depth + 1)}`).join('\n');
      }

      return Object.entries(obj)
        .map(([key, value]) => `${indent}${key}: ${yamlify(value, depth + 1)}`)
        .join('\n');
    };

    return yamlify(obj);
  }

  private architectureToMermaid(architecture: ArchitectureDesign): string {
    const components = architecture.components || [];
    const dataFlow = architecture.dataFlow || [];

    let mermaid = 'graph TD\n';

    // Add components
    components.forEach((component) => {
      const nodeId = component.name.replace(/\s+/g, '');
      const nodeLabel = `${component.name}[${component.type}]`;
      mermaid += `    ${nodeId}${nodeLabel}\n`;
    });

    // Add data flows
    dataFlow.forEach((flow) => {
      const fromId = flow.from.replace(/\s+/g, '');
      const toId = flow.to.replace(/\s+/g, '');
      mermaid += `    ${fromId} --> ${toId}\n`;
    });

    return mermaid;
  }
}

/**
 * Factory function to create and initialize Architecture MCP Tools
 *
 * @param db
 * @param logger
 */
export async function createArchitectureMCPTools(
  db: any,
  logger?: any
): Promise<ArchitectureMCPToolsImpl> {
  const tools = new ArchitectureMCPToolsImpl(db, logger);
  await tools.initialize();
  return tools;
}
