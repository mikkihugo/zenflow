/**
 * @file Agent type definitions for the agent management system
 * Comprehensive TypeScript definitions for agent-related types
 */
export type AgentType = 'researcher' | 'coder' | 'analyst' | 'optimizer' | 'coordinator' | 'architect' | 'tester' | 'security' | 'data' | 'ops' | 'debug' | 'queen' | 'specialist' | 'cache-optimizer' | 'memory-optimizer' | 'latency-optimizer' | 'bottleneck-analyzer' | 'performance-analyzer' | 'legacy-analyzer' | 'modernization-agent' | 'migration-coordinator' | 'migration-plan' | 'system-architect' | 'quality-gate-agent' | 'validation-specialist' | 'ux-designer' | 'ui-designer' | 'accessibility-specialist' | 'user-guide-writer' | 'unit-tester' | 'integration-tester' | 'e2e-tester' | 'performance-tester' | 'tdd-london-swarm' | 'production-validator' | 'developer' | 'fullstack-dev' | 'dev-backend-api' | 'api-dev' | 'analyze-code-quality' | 'security-analyzer' | 'refactoring-analyzer' | 'database-architect' | 'devops-engineer' | 'documentation-specialist' | 'reviewer' | 'documenter' | 'monitor' | 'planner' | 'requirements-engineer' | 'design-architect' | 'task-planner' | 'steering-author' | 'frontend-dev' | 'arch-system-design' | 'cloud-architect' | 'security-architect' | 'ops-cicd-github' | 'infrastructure-ops' | 'monitoring-ops' | 'deployment-ops' | 'docs-api-openapi' | 'technical-writer' | 'readme-writer' | 'data-ml-model' | 'etl-specialist' | 'analytics-specialist' | 'visualization-specialist' | 'spec-mobile-react-native' | 'embedded-specialist' | 'blockchain-specialist' | 'ai-ml-specialist' | 'code-review-swarm' | 'github-modes' | 'issue-tracker' | 'multi-repo-swarm' | 'pr-manager' | 'project-board-sync' | 'release-manager' | 'release-swarm' | 'repo-architect' | 'swarm-issue' | 'swarm-pr' | 'sync-coordinator' | 'workflow-automation' | 'github-pr-manager' | 'adaptive-coordinator' | 'hierarchical-coordinator' | 'mesh-coordinator' | 'coordinator-swarm-init' | 'orchestrator-task' | 'memory-coordinator' | 'swarm-memory-manager' | 'collective-intelligence-coordinator' | 'byzantine-coordinator' | 'consensus-builder' | 'crdt-synchronizer' | 'gossip-coordinator' | 'performance-benchmarker' | 'quorum-manager' | 'raft-manager' | 'security-manager' | 'benchmark-suite' | 'load-balancer' | 'performance-monitor' | 'resource-allocator' | 'topology-optimizer' | 'specification' | 'architecture' | 'refinement' | 'pseudocode' | 'sparc-coordinator' | 'implementer-sparc-coder' | 'automation-smart-agent' | 'base-template-generator' | 'requirements_analyst' | 'design_architect' | 'task_planner' | 'implementation_coder' | 'quality_reviewer' | 'steering_documenter';
export type AgentStatus = 'idle' | 'busy' | 'offline' | 'error' | 'initializing' | 'terminated';
export type AgentId = string;
export interface AgentMetrics {
    tasksCompleted: number;
    averageExecutionTime: number;
    successRate: number;
    errorCount: number;
    lastActivity: Date;
    performance: number;
}
export interface AgentCapability {
    id: string;
    name: string;
    type: string;
    level: number;
    description?: string;
    requirements?: string[];
}
export interface AgentConfig {
    id: AgentId;
    name: string;
    type: AgentType;
    capabilities: AgentCapability[];
    maxConcurrentTasks: number;
    timeout: number;
    retryCount: number;
    priority: number;
}
export interface Agent {
    id: AgentId;
    name: string;
    type: AgentType;
    status: AgentStatus;
    capabilities: AgentCapability[];
    currentTasks: string[];
    metrics: AgentMetrics;
    config: AgentConfig;
    created: Date;
    lastHeartbeat: Date;
    swarmId?: string;
}
export interface TaskAssignment {
    taskId: string;
    agentId: AgentId;
    assignedAt: Date;
    priority: number;
    estimatedDuration?: number;
}
export interface AgentPool {
    agents: Agent[];
    capacity: number;
    activeCount: number;
    availableCount: number;
}
export type { AgentType, AgentStatus, AgentId, AgentMetrics, AgentCapability, AgentConfig, Agent, TaskAssignment, AgentPool, };
//# sourceMappingURL=agent-types.d.ts.map