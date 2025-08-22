/**
 * @file Agent type definitions for the agent management system
 * Comprehensive TypeScript definitions for agent-related types
 */

// ==========================================
// CORE AGENT TYPES
// ==========================================

export type AgentType = 'researcher | coder | analyst | optimizer | coordinator | architect | test'e''r | security | da't'a | ops | debug | queen | specialist// Performance optimization agents | cache-optimizer | memory-optimizer | latency-optimizer | bottleneck-analyzer  || performance-analyzer// Migration and planning agents | legacy-analyzer | modernization-agent | migration-coordinator | migration-plan | system-archite'c''t'// SPARC methodology agents | quality-gate-agent | validation-specialist'// UI/UX enhancement agents | ux-designer | ui-designer | accessibility-specialist  || user-guide-writer// Testing agents | unit-tester | integration-tester | e2e-tester | performance-tester | tdd-london-swarm | production-validator// Development agents | developer | fullstack-d'e''v | dev-backend-api | api-d'e'v'// Analysis agents | analyze-code-quality | security-analyzer  || refactoring-analyzer// Additional specialized agents | database-architect | devops-engineer | documentation-specialist// Gap analysis agents | reviewer | document'e''r | monitor | planner | requirements-engineer | design-architect | task-planner | steering-author | frontend-dev | arch-system-design | cloud-architect | security-architect | ops-cicd-github | infrastructure-ops | monitoring-ops | deployment-ops | docs-api-openapi | technical-writer | readme-writer | data-ml-model | etl-specialist | analytics-specialist | visualization-specialist | spec-mobile-react-native | embedded-specialist | blockchain-specialist | ai-ml-specialist | code-review-swarm | github-modes | issue-tracker | multi-repo-swarm | pr-manager | project-board-sync | release-manager | release-swarm | repo-architect | swarm-issue | swarm-pr | sync-coordinator | workflow-automation | github-pr-manager | adaptive-coordinator | hierarchical-coordinator | mesh-coordinator | coordinator-swarm-init | orchestrator-task | memory-coordinator | swarm-memory-manager | collective-intelligence-coordinator | byzantine-coordinator | consensus-builder | crdt-synchronizer | gossip-coordinator | performance-benchmarker | quorum-manager | raft-manager | security-manager | benchmark-sui't'e'// Additional gap analysis agent types | load-balancer | performance-monitor | resource-allocator | topology-optimizer  || specification || ' 'architecture | refinement | pseudocode | sparc-coordinator | implementer-sparc-coder | automation-smart-agent | base-template-generato'r'// Underscore variants  || requirements_analyst || ' 'design_architect | task_planne'r | implementation_coder  || quality_reviewer | steering_docume'n''t'e'r');

export type AgentStatus = 'idle' || busy || ' 'offline | error || ''initializing | terminated');

export type AgentId = 'string';

// ==========================================
// AGENT NTERFACES
// ==========================================

export interface AgentMetrics { tasksCompleted: number; averageExecutionTime: number; successRate: number; errorCount: number; lastActivity: Date; performance: number; // 0-1 scale
}

export interface AgentCapability { id: string; name: string; type: string; level: number; // 1-10 scale description?: string; requirements?: string[];
}

export interface AgentConfig { id: AgentId; name: string; type: AgentType; capabilities: AgentCapability[]; maxConcurrentTasks: number; timeout: number; retryCount: number; priority: number;
}

export interface Agent { id: AgentId; name: string; type: AgentType; status: AgentStatus; capabilities: AgentCapability[]; currentTasks: string[]; metrics: AgentMetrics; config: AgentConfig; created: Date; lastHeartbeat: Date; swarmId?: string;
}

// ==========================================
// TASK RELATED TYPES
// ==========================================

export interface TaskAssignment { taskId: string; agentId: AgentId; assignedAt: Date; priority: number; estimatedDuration?: number;
}

export interface AgentPool { agents: Agent[]; capacity: number; activeCount: number; availableCount: number;
}

// ==========================================
// EXPORT TYPES FOR COMPATIBILITY
// ==========================================

export type { AgentType, AgentStatus, AgentId, AgentMetrics, AgentCapability, AgentConfig, Agent, TaskAssignment, AgentPool,
};
