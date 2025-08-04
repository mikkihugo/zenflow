/**
 * @fileoverview FACT Swarm Coordination MCP Tools
 * Advanced swarm coordination tools for distributed knowledge gathering missions
 */

import { createLogger } from '../../../core/logger';
import type { MCPTool, MCPToolResult } from '../types/mcp-types';
import { KnowledgeSwarm } from './fact-placeholders';

const logger = createLogger({ prefix: 'MCP-FACT-Swarm' });

export interface FACTSwarmSpawnParams {
  type: 'researcher' | 'analyzer' | 'gatherer' | 'coordinator' | 'specialist';
  name: string;
  specialization?: string;
  sources?: string[];
  capabilities?: string[];
}

export interface FACTSwarmMissionParams {
  mission: string;
  agents?: string[];
  strategy?: 'parallel' | 'sequential' | 'adaptive';
  timeLimit?: number; // seconds
  qualityThreshold?: number; // 0-1
  sources?: string[];
  complexity?: 'simple' | 'moderate' | 'complex' | 'expert';
}

export interface FACTSwarmMonitorParams {
  missionId?: string;
  duration?: number; // seconds
  metrics?: ('performance' | 'quality' | 'efficiency' | 'coverage')[];
}

/**
 * Spawn specialized knowledge gathering agent
 */
export const factSwarmSpawnTool: MCPTool = {
  name: 'fact_swarm_spawn',
  description: 'Spawn specialized knowledge gathering agent for coordinated research missions',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['researcher', 'analyzer', 'gatherer', 'coordinator', 'specialist'],
        description: 'Agent specialization type',
      },
      name: {
        type: 'string',
        description: 'Human-readable agent name',
      },
      specialization: {
        type: 'string',
        description: 'Specific area of expertise (e.g., "AI/ML Research", "API Documentation")',
        optional: true,
      },
      sources: {
        type: 'array',
        items: { type: 'string' },
        description: 'Preferred knowledge sources (web, docs, github, api, papers)',
        optional: true,
      },
      capabilities: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific capabilities (deep_analysis, rapid_scanning, quality_filtering)',
        optional: true,
      },
    },
    required: ['type', 'name'],
  },
  handler: async (params: FACTSwarmSpawnParams): Promise<MCPToolResult> => {
    try {
      logger.info('Spawning FACT knowledge agent:', params);

      // Get global knowledge swarm instance
      const swarm = KnowledgeSwarm.getInstance();
      if (!swarm) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const agentConfig = {
        type: params.type,
        name: params.name,
        specialization: params.specialization || `${params.type} specialist`,
        sources: params.sources || getDefaultSources(params.type),
        capabilities: params.capabilities || getDefaultCapabilities(params.type),
        createdAt: Date.now(),
      };

      const agentId = await swarm.spawnAgent(agentConfig);

      logger.info(`FACT agent spawned: ${agentId}`);

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🤖 FACT Knowledge Agent Spawned Successfully!

🆔 Agent ID: ${agentId}
🎯 Type: ${agentConfig.type}
👤 Name: ${agentConfig.name}
🧠 Specialization: ${agentConfig.specialization}

📊 Configuration:
  Sources: ${agentConfig.sources.join(', ')}
  Capabilities: ${agentConfig.capabilities.join(', ')}

🎬 Agent is ready for mission assignment!
Use fact_swarm_mission to assign research tasks.`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT agent spawn failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT agent spawn failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Create and assign knowledge gathering mission
 */
export const factSwarmMissionTool: MCPTool = {
  name: 'fact_swarm_mission',
  description: 'Create and assign comprehensive knowledge gathering mission to swarm agents',
  inputSchema: {
    type: 'object',
    properties: {
      mission: {
        type: 'string',
        description: 'Detailed mission description and objectives',
      },
      agents: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific agent IDs to assign (optional - auto-assigns if not provided)',
        optional: true,
      },
      strategy: {
        type: 'string',
        enum: ['parallel', 'sequential', 'adaptive'],
        description: 'Mission execution strategy',
        default: 'adaptive',
      },
      timeLimit: {
        type: 'number',
        description: 'Mission time limit in seconds',
        minimum: 60,
        maximum: 3600,
        default: 600,
      },
      qualityThreshold: {
        type: 'number',
        description: 'Minimum quality threshold (0-1)',
        minimum: 0.1,
        maximum: 1.0,
        default: 0.7,
      },
      sources: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['web', 'docs', 'github', 'api', 'papers', 'forums'],
        },
        description: 'Knowledge sources to search',
        optional: true,
      },
      complexity: {
        type: 'string',
        enum: ['simple', 'moderate', 'complex', 'expert'],
        description: 'Mission complexity level',
        default: 'moderate',
      },
    },
    required: ['mission'],
  },
  handler: async (params: FACTSwarmMissionParams): Promise<MCPToolResult> => {
    try {
      logger.info('Creating FACT knowledge gathering mission:', params);

      const swarm = KnowledgeSwarm.getInstance();
      if (!swarm) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const missionConfig = {
        description: params.mission,
        strategy: params.strategy || 'adaptive',
        timeLimit: params.timeLimit || 600,
        qualityThreshold: params.qualityThreshold || 0.7,
        sources: params.sources || ['web', 'docs', 'github'],
        complexity: params.complexity || 'moderate',
        assignedAgents: params.agents || [],
        createdAt: Date.now(),
      };

      const missionId = await swarm.createMission(missionConfig);

      // Auto-assign agents if none specified
      if (!params.agents || params.agents.length === 0) {
        const optimalAgents = await swarm.selectOptimalAgents(missionConfig);
        missionConfig.assignedAgents = optimalAgents;
      }

      // Start mission execution
      const executionResult = await swarm.executeMission(missionId);

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🎯 FACT Knowledge Mission Created & Initiated!

🆔 Mission ID: ${missionId}
📋 Description: ${params.mission}

⚙️ Configuration:
  Strategy: ${missionConfig.strategy}
  Time Limit: ${missionConfig.timeLimit} seconds
  Quality Threshold: ${missionConfig.qualityThreshold * 100}%
  Complexity: ${missionConfig.complexity}
  Sources: ${missionConfig.sources.join(', ')}

🤖 Agent Assignment:
  Assigned Agents: ${missionConfig.assignedAgents.length}
  Agent Selection: ${params.agents ? 'Manual' : 'Auto-optimized'}

🚀 Execution Status:
  Status: ${executionResult.status}
  Progress: ${executionResult.progress}%
  Estimated Completion: ${executionResult.estimatedCompletion}

Use fact_swarm_monitor to track mission progress in real-time.`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT mission creation failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT mission creation failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Monitor swarm mission execution
 */
export const factSwarmMonitorTool: MCPTool = {
  name: 'fact_swarm_monitor',
  description: 'Monitor FACT swarm mission execution and performance metrics',
  inputSchema: {
    type: 'object',
    properties: {
      missionId: {
        type: 'string',
        description: 'Specific mission ID to monitor (optional - monitors all if not provided)',
        optional: true,
      },
      duration: {
        type: 'number',
        description: 'Monitoring duration in seconds',
        minimum: 10,
        maximum: 3600,
        default: 60,
      },
      metrics: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['performance', 'quality', 'efficiency', 'coverage'],
        },
        description: 'Specific metrics to monitor',
        default: ['performance', 'quality'],
      },
    },
  },
  handler: async (params: FACTSwarmMonitorParams): Promise<MCPToolResult> => {
    try {
      logger.info('Starting FACT swarm monitoring:', params);

      const swarm = KnowledgeSwarm.getInstance();
      if (!swarm) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const monitoringConfig = {
        missionId: params.missionId,
        duration: params.duration || 60,
        metrics: params.metrics || ['performance', 'quality'],
        startTime: Date.now(),
      };

      const monitoringSession = await swarm.startMonitoring(monitoringConfig);

      // Wait for monitoring duration or mission completion
      const results = await swarm.waitForMonitoringResults(
        monitoringSession.id,
        monitoringConfig.duration * 1000
      );

      const performanceData = results.metrics.performance;
      const qualityData = results.metrics.quality;

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `📊 FACT Swarm Monitoring Results

🔍 Monitoring Session: ${monitoringSession.id}
⏱️  Duration: ${monitoringConfig.duration} seconds
${params.missionId ? `🎯 Mission: ${params.missionId}` : '🌐 All Missions'}

📈 Performance Metrics:
  Active Missions: ${results.activeMissions}
  Completed Tasks: ${results.completedTasks}
  Success Rate: ${performanceData.successRate}%
  Avg Response Time: ${performanceData.avgResponseTime}ms
  Throughput: ${performanceData.throughput} tasks/min

🏆 Quality Metrics:
  Average Quality Score: ${qualityData.avgScore}/10
  Quality Distribution:
    Excellent (9-10): ${qualityData.distribution.excellent}%
    Good (7-8): ${qualityData.distribution.good}%
    Fair (5-6): ${qualityData.distribution.fair}%
    Poor (0-4): ${qualityData.distribution.poor}%

🤖 Agent Performance:
${results.agentPerformance
  .map((agent) => `  ${agent.name}: ${agent.successRate}% success, ${agent.avgTime}ms avg`)
  .join('\n')}

💡 Insights:
${results.insights.map((insight) => `  • ${insight}`).join('\n')}

🔧 Optimization Suggestions:
${results.optimizations.map((opt) => `  • ${opt}`).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT swarm monitoring failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT swarm monitoring failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Collect and consolidate mission results
 */
export const factSwarmResultsTool: MCPTool = {
  name: 'fact_swarm_results',
  description: 'Collect and consolidate results from completed FACT knowledge gathering missions',
  inputSchema: {
    type: 'object',
    properties: {
      missionId: {
        type: 'string',
        description: 'Mission ID to get results for',
        optional: true,
      },
      format: {
        type: 'string',
        enum: ['summary', 'detailed', 'raw', 'structured'],
        description: 'Result format preference',
        default: 'summary',
      },
      includeMetrics: {
        type: 'boolean',
        description: 'Include performance metrics in results',
        default: true,
      },
      minQuality: {
        type: 'number',
        description: 'Minimum quality threshold for included results',
        minimum: 0,
        maximum: 1,
        default: 0.5,
      },
    },
  },
  handler: async (params: {
    missionId?: string;
    format?: string;
    includeMetrics?: boolean;
    minQuality?: number;
  }): Promise<MCPToolResult> => {
    try {
      logger.info('Collecting FACT mission results:', params);

      const swarm = KnowledgeSwarm.getInstance();
      if (!swarm) {
        throw new Error('FACT system not initialized. Use fact_init first.');
      }

      const results = await swarm.getMissionResults({
        missionId: params.missionId,
        format: params.format || 'summary',
        includeMetrics: params.includeMetrics !== false,
        minQuality: params.minQuality || 0.5,
      });

      if (results.missions.length === 0) {
        return {
          success: true,
          content: [
            {
              type: 'text',
              text: `🔍 No completed missions found.

${params.missionId ? `Mission ${params.missionId} may still be running or doesn't exist.` : 'No missions have completed yet.'}

Use fact_swarm_monitor to check mission status.`,
            },
          ],
        };
      }

      const missionSummaries = results.missions
        .map(
          (mission) =>
            `🎯 Mission: ${mission.id}
   Description: ${mission.description}
   Status: ${mission.status}
   Quality Score: ${mission.qualityScore}/10
   Knowledge Entries: ${mission.knowledgeCount}
   Execution Time: ${mission.executionTime}ms
   Agent Performance: ${mission.agentPerformance}`
        )
        .join('\n');

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `📋 FACT Mission Results Report

📊 Overview:
  Missions Retrieved: ${results.missions.length}
  Total Knowledge Entries: ${results.totalKnowledgeEntries}
  Average Quality Score: ${results.avgQualityScore}/10
  Total Execution Time: ${results.totalExecutionTime}ms

🎯 Mission Details:
${missionSummaries}

${
  params.includeMetrics
    ? `📈 Aggregate Metrics:
  Success Rate: ${results.metrics.successRate}%
  Knowledge Coverage: ${results.metrics.coverage}%
  Source Distribution: ${Object.entries(results.metrics.sourceDistribution)
    .map(([source, count]) => `${source}: ${count}`)
    .join(', ')}
  Quality Distribution:
    High (8-10): ${results.metrics.qualityDistribution.high}%
    Medium (5-7): ${results.metrics.qualityDistribution.medium}%
    Low (0-4): ${results.metrics.qualityDistribution.low}%`
    : ''
}

💡 Key Insights:
${results.insights.map((insight) => `  • ${insight}`).join('\n')}

🔗 Related Actions:
  • Use fact_query to search gathered knowledge
  • Use fact_status to see system-wide statistics
  • Use fact_cache_status to check storage performance`,
          },
        ],
      };
    } catch (error) {
      logger.error('FACT results collection failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ FACT results collection failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Helper functions for agent configuration
 */
function getDefaultSources(agentType: string): string[] {
  const sourceMap = {
    researcher: ['web', 'papers', 'docs', 'github'],
    analyzer: ['github', 'docs', 'api'],
    gatherer: ['web', 'forums', 'docs'],
    coordinator: ['api', 'docs'],
    specialist: ['papers', 'api', 'docs', 'github'],
  };

  return sourceMap[agentType as keyof typeof sourceMap] || ['web', 'docs'];
}

function getDefaultCapabilities(agentType: string): string[] {
  const capabilityMap = {
    researcher: ['deep_analysis', 'source_verification', 'synthesis'],
    analyzer: ['pattern_recognition', 'code_analysis', 'documentation_parsing'],
    gatherer: ['rapid_scanning', 'content_extraction', 'deduplication'],
    coordinator: ['task_management', 'quality_assessment', 'result_aggregation'],
    specialist: ['domain_expertise', 'advanced_filtering', 'expert_validation'],
  };

  return capabilityMap[agentType as keyof typeof capabilityMap] || ['general_purpose'];
}

// Export all swarm coordination tools
export const factSwarmTools = {
  fact_swarm_spawn: factSwarmSpawnTool,
  fact_swarm_mission: factSwarmMissionTool,
  fact_swarm_monitor: factSwarmMonitorTool,
  fact_swarm_results: factSwarmResultsTool,
};
