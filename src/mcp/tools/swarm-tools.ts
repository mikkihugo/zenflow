/**
 * @fileoverview Claude-Zen MCP Swarm Tools
 * Implementation of swarm coordination tools for MCP integration
 */

import type { MCPTool, MCPToolResult } from '../types/mcp-types';
import { SwarmOrchestrator } from '../../maestro/maestro-swarm-coordinator';
import { createLogger } from '../../utils/logger';

const logger = createLogger({ prefix: 'MCP-Swarm' });

export interface SwarmInitParams {
  topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
  maxAgents?: number;
  strategy?: 'balanced' | 'specialized' | 'adaptive' | 'parallel';
}

export interface AgentSpawnParams {
  type: 'architect' | 'coder' | 'analyst' | 'tester' | 'researcher' | 'coordinator';
  name: string;
  specialization?: string;
}

export interface TaskOrchestrateParams {
  task: string;
  strategy?: 'sequential' | 'parallel' | 'adaptive';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Initialize swarm coordination system
 */
export const swarmInitTool: MCPTool = {
  name: 'swarm_init',
  description: 'Initialize swarm coordination topology for complex task management',
  inputSchema: {
    type: 'object',
    properties: {
      topology: {
        type: 'string',
        enum: ['mesh', 'hierarchical', 'ring', 'star'],
        description: 'Swarm coordination topology',
        default: 'hierarchical'
      },
      maxAgents: {
        type: 'number',
        description: 'Maximum number of agents in swarm',
        minimum: 1,
        maximum: 20,
        default: 8
      },
      strategy: {
        type: 'string',
        enum: ['balanced', 'specialized', 'adaptive', 'parallel'],
        description: 'Coordination strategy',
        default: 'parallel'
      }
    }
  },
  handler: async (params: SwarmInitParams): Promise<MCPToolResult> => {
    try {
      logger.info('Initializing swarm coordination:', params);
      
      const orchestrator = SwarmOrchestrator.getInstance();
      
      const swarmConfig = {
        topology: params.topology || 'hierarchical',
        maxAgents: params.maxAgents || 8,
        strategy: params.strategy || 'parallel'
      };
      
      // Initialize swarm with configuration
      const swarmId = await orchestrator.initializeSwarm(swarmConfig);
      
      logger.info(`Swarm initialized with ID: ${swarmId}`);
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `🐝 Swarm initialized successfully!
          
Swarm ID: ${swarmId}
Topology: ${swarmConfig.topology}
Max Agents: ${swarmConfig.maxAgents}
Strategy: ${swarmConfig.strategy}

Ready for agent spawning and task orchestration.`
        }]
      };
    } catch (error) {
      logger.error('Swarm initialization failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Swarm initialization failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Spawn specialized agent for swarm coordination
 */
export const agentSpawnTool: MCPTool = {
  name: 'agent_spawn',
  description: 'Spawn specialized agent for coordinated task execution',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['architect', 'coder', 'analyst', 'tester', 'researcher', 'coordinator'],
        description: 'Agent specialization type'
      },
      name: {
        type: 'string',
        description: 'Human-readable agent name'
      },
      specialization: {
        type: 'string',
        description: 'Specific area of expertise',
        optional: true
      }
    },
    required: ['type', 'name']
  },
  handler: async (params: AgentSpawnParams): Promise<MCPToolResult> => {
    try {
      logger.info('Spawning agent:', params);
      
      const orchestrator = SwarmOrchestrator.getInstance();
      
      const agentConfig = {
        type: params.type,
        name: params.name,
        specialization: params.specialization || `${params.type} agent`,
        capabilities: getAgentCapabilities(params.type)
      };
      
      const agentId = await orchestrator.spawnAgent(agentConfig);
      
      logger.info(`Agent spawned with ID: ${agentId}`);
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `🤖 Agent spawned successfully!

Agent ID: ${agentId}
Type: ${agentConfig.type}
Name: ${agentConfig.name}
Specialization: ${agentConfig.specialization}

Agent is ready for task assignment.`
        }]
      };
    } catch (error) {
      logger.error('Agent spawn failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Agent spawn failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Orchestrate task execution across swarm
 */
export const taskOrchestrateTool: MCPTool = {
  name: 'task_orchestrate',
  description: 'Orchestrate complex task execution across swarm agents',
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description: 'Task description to orchestrate'
      },
      strategy: {
        type: 'string',
        enum: ['sequential', 'parallel', 'adaptive'],
        description: 'Execution strategy',
        default: 'parallel'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Task priority level',
        default: 'medium'
      }
    },
    required: ['task']
  },
  handler: async (params: TaskOrchestrateParams): Promise<MCPToolResult> => {
    try {
      logger.info('Orchestrating task:', params);
      
      const orchestrator = SwarmOrchestrator.getInstance();
      
      const taskConfig = {
        description: params.task,
        strategy: params.strategy || 'parallel',
        priority: params.priority || 'medium',
        timestamp: Date.now()
      };
      
      const taskId = await orchestrator.orchestrateTask(taskConfig);
      
      logger.info(`Task orchestrated with ID: ${taskId}`);
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `🎯 Task orchestration started!

Task ID: ${taskId}
Description: ${taskConfig.description}
Strategy: ${taskConfig.strategy}
Priority: ${taskConfig.priority}

Swarm agents are coordinating task execution.`
        }]
      };
    } catch (error) {
      logger.error('Task orchestration failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Task orchestration failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Get swarm status and metrics
 */
export const swarmStatusTool: MCPTool = {
  name: 'swarm_status',
  description: 'Get current swarm status and coordination metrics',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  handler: async (): Promise<MCPToolResult> => {
    try {
      const orchestrator = SwarmOrchestrator.getInstance();
      const status = await orchestrator.getSwarmStatus();
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `🐝 Swarm Status Report

Active Swarms: ${status.activeSwarms}
Total Agents: ${status.totalAgents}
Active Tasks: ${status.activeTasks}
Completed Tasks: ${status.completedTasks}

Agent Distribution:
${status.agentsByType.map(({ type, count }) => `  ${type}: ${count}`).join('\n')}

Performance Metrics:
  Average Task Time: ${status.metrics.avgTaskTime}ms
  Success Rate: ${status.metrics.successRate}%
  Memory Usage: ${status.metrics.memoryUsage}MB`
        }]
      };
    } catch (error) {
      logger.error('Swarm status check failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Swarm status check failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Monitor swarm performance in real-time
 */
export const swarmMonitorTool: MCPTool = {
  name: 'swarm_monitor',
  description: 'Monitor swarm performance and coordination metrics',
  inputSchema: {
    type: 'object',
    properties: {
      duration: {
        type: 'number',
        description: 'Monitoring duration in seconds',
        default: 30
      }
    }
  },
  handler: async (params: { duration?: number }): Promise<MCPToolResult> => {
    try {
      const orchestrator = SwarmOrchestrator.getInstance();
      const monitoring = await orchestrator.startMonitoring(params.duration || 30);
      
      return {
        success: true,
        content: [{
          type: 'text',
          text: `📊 Swarm monitoring started

Duration: ${params.duration || 30} seconds
Monitoring ID: ${monitoring.id}

Real-time metrics will be collected and analyzed.
Use swarm_status to view current metrics.`
        }]
      };
    } catch (error) {
      logger.error('Swarm monitoring failed:', error);
      return {
        success: false,
        content: [{
          type: 'text',
          text: `❌ Swarm monitoring failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};

/**
 * Get agent capabilities based on type
 */
function getAgentCapabilities(type: string): string[] {
  const capabilities = {
    architect: ['system_design', 'architecture_planning', 'technical_documentation'],
    coder: ['code_implementation', 'debugging', 'code_review', 'testing'],
    analyst: ['data_analysis', 'performance_optimization', 'metrics_tracking'],
    tester: ['test_planning', 'qa_automation', 'bug_detection', 'quality_assurance'],
    researcher: ['information_gathering', 'analysis', 'documentation', 'best_practices'],
    coordinator: ['task_management', 'workflow_orchestration', 'team_coordination']
  };
  
  return capabilities[type as keyof typeof capabilities] || ['general_purpose'];
}

// Export all tools
export const swarmTools = {
  swarm_init: swarmInitTool,
  agent_spawn: agentSpawnTool,
  task_orchestrate: taskOrchestrateTool,
  swarm_status: swarmStatusTool,
  swarm_monitor: swarmMonitorTool
};