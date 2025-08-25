# @claude-zen/enterprise

**Strategic Enterprise Interface Delegation Package**

Provides unified access to all business process systems through runtime delegation patterns. Part of the Strategic Architecture v2.0.0 four-layer delegation system.

## Overview

The Enterprise package consolidates access to all business process and enterprise systems in the Claude Code Zen ecosystem through a strategic interface delegation pattern. Instead of importing multiple business process packages directly, applications can use this single package to access all enterprise functionality.

## Architecture

**Strategic Layer: Enterprise (Business Processes)**
- Position: Layer 3 of 4 in the strategic architecture
- Role: Unified business process system coordination
- Pattern: Runtime delegation with lazy loading

## Delegated Systems

### 🏢 SAFe Framework System (`@claude-zen/safe-framework`)
SAFe enterprise framework, portfolio management, and program increment coordination:
- `PortfolioManager` - Portfolio-level coordination
- `ProgramIncrementManager` - PI planning and management
- `EpicOwnerManager` - Epic lifecycle management
- `ArchitectureRunwayManager` - Architecture runway coordination
- `ValueStreamMapper` - Value stream optimization
- `ReleaseTrainEngineerManager` - Release train coordination

### 📋 SPARC Methodology System (`@claude-zen/sparc`)
SPARC methodology (Specification, Pseudocode, Architecture, Refinement, Completion):
- `SPARCCommander` - SPARC workflow coordination
- `SPARCWorkflow` - Standard SPARC workflow
- `SafeSPARCWorkflow` - SAFe-integrated SPARC workflow
- `SPARCMethodology` - Methodology management

### 🤝 Teamwork System (`@claude-zen/teamwork`)
Multi-agent teamwork, collaboration, and conversation management:
- `ConversationOrchestrator` - Multi-agent conversation coordination
- `ConversationManager` - Conversation lifecycle management
- `ConversationMemory` - Persistent conversation context
- `TeamworkBrain` - Intelligent teamwork coordination

### 🎯 AGUI System (`@claude-zen/agui`)
Advanced GUI systems, task approval workflows, and human-in-the-loop interfaces:
- `AGUISystem` - Advanced GUI framework
- `TaskApprovalSystem` - Task approval workflows
- `HumanInTheLoopInterface` - Human-in-the-loop coordination
- `ApprovalWorkflow` - Automated approval processes

### 📚 Knowledge Management System (`@claude-zen/knowledge`)
Knowledge management, semantic understanding, and document processing:
- `KnowledgeManager` - Knowledge lifecycle management
- `SemanticProcessor` - Semantic understanding and processing
- `DocumentImporter` - Document ingestion and processing
- `FactSystem` - Fact-based knowledge management
- `CoordinationAPI` - Knowledge coordination interface

### 📊 Kanban System (`@claude-zen/kanban`)
Professional workflow coordination engine and kanban management:
- `WorkflowCoordinationEngine` - Advanced workflow coordination
- `KanbanBoard` - Professional kanban board management
- `FlowManager` - Flow optimization and management
- `BottleneckDetector` - Workflow bottleneck detection
- `MetricsTracker` - Workflow metrics and analytics

## Usage

### Basic Usage

```typescript
import { enterpriseSystem } from '@claude-zen/enterprise';

// Access SAFe framework
const safeFramework = await enterpriseSystem.safeFramework();
const portfolioManager = await safeFramework.getPortfolioManager({
  portfolioLevel: true,
  piPlanningEnabled: true
});

// Access SPARC methodology
const sparc = await enterpriseSystem.sparc();
const sparcWorkflow = await sparc.getSPARCWorkflow({
  enableSpecification: true,
  enableRefinement: true,
  safeIntegration: true
});

// Access teamwork system
const teamwork = await enterpriseSystem.teamwork();
const orchestrator = await teamwork.getConversationOrchestrator({
  maxConcurrentConversations: 10,
  enableMemoryPersistence: true
});
```

### Unified Enterprise System

```typescript
import { EnterpriseSystem } from '@claude-zen/enterprise';

const enterprise = new EnterpriseSystem({
  safeFramework: {
    portfolioLevel: true,
    programLevel: true,
    piPlanningEnabled: true,
    valueStreamOptimization: true
  },
  sparc: {
    enableSpecification: true,
    enableArchitecture: true,
    enableRefinement: true,
    safeIntegration: true
  },
  teamwork: {
    enableConversationOrchestration: true,
    enableMemoryPersistence: true,
    maxConcurrentConversations: 20
  },
  agui: {
    enableTaskApproval: true,
    enableHumanInTheLoop: true,
    uiFramework: 'web'
  },
  knowledge: {
    enableSemanticProcessing: true,
    enableDocumentImport: true,
    enableFactSystem: true
  },
  kanban: {
    enableWorkflowCoordination: true,
    enableBottleneckDetection: true,
    maxWorkInProgress: 5
  }
});

await enterprise.initialize();

// Get system status
const status = await enterprise.getStatus();
console.log('Enterprise systems:', status);

// Get performance metrics
const metrics = await enterprise.getMetrics();
console.log('Performance metrics:', metrics);
```

### Individual System Access

```typescript
import {
  getPortfolioManager,
  getSPARCCommander,
  getConversationOrchestrator,
  getTaskApprovalSystem,
  getKnowledgeManager,
  getWorkflowCoordinationEngine
} from '@claude-zen/enterprise';

// Direct access to specific systems
const portfolio = await getPortfolioManager({ portfolioLevel: true });
const sparc = await getSPARCCommander({ enableSpecification: true });
const teamwork = await getConversationOrchestrator({ maxConcurrentConversations: 5 });
const agui = await getTaskApprovalSystem({ enableHumanInTheLoop: true });
const knowledge = await getKnowledgeManager({ enableSemanticProcessing: true });
const kanban = await getWorkflowCoordinationEngine({ enableBottleneckDetection: true });
```

## Configuration

### EnterpriseSystemConfig

```typescript
interface EnterpriseSystemConfig {
  safeFramework?: {
    portfolioLevel?: boolean;
    programLevel?: boolean;
    teamLevel?: boolean;
    piPlanningEnabled?: boolean;
    architectureRunway?: boolean;
    valueStreamOptimization?: boolean;
    releaseTrainCoordination?: boolean;
  };
  
  sparc?: {
    enableSpecification?: boolean;
    enablePseudocode?: boolean;
    enableArchitecture?: boolean;
    enableRefinement?: boolean;
    enableCompletion?: boolean;
    safeIntegration?: boolean;
    phaseValidation?: boolean;
    iterativeRefinement?: boolean;
  };
  
  teamwork?: {
    enableConversationOrchestration?: boolean;
    enableMemoryPersistence?: boolean;
    enableBrainIntegration?: boolean;
    maxConcurrentConversations?: number;
    conversationTimeout?: number;
    memoryRetention?: number;
  };
  
  agui?: {
    enableTaskApproval?: boolean;
    enableHumanInTheLoop?: boolean;
    enableWorkflowAutomation?: boolean;
    approvalTimeout?: number;
    maxConcurrentApprovals?: number;
    uiFramework?: 'web' | 'desktop' | 'mobile';
  };
  
  knowledge?: {
    enableSemanticProcessing?: boolean;
    enableDocumentImport?: boolean;
    enableFactSystem?: boolean;
    enableCoordinationAPI?: boolean;
    maxDocumentSize?: number;
    semanticThreshold?: number;
    knowledgeRetention?: number;
  };
  
  kanban?: {
    enableWorkflowCoordination?: boolean;
    enableBottleneckDetection?: boolean;
    enableMetricsTracking?: boolean;
    maxWorkInProgress?: number;
    flowOptimization?: boolean;
    workItemTypes?: string[];
  };
}
```

## Runtime Delegation

The Enterprise package uses runtime delegation to prevent circular dependencies and enable lazy loading:

- **Lazy Loading**: Systems are only loaded when first accessed
- **Runtime Imports**: Dynamic imports prevent build-time circular dependencies
- **Error Handling**: Graceful handling when optional systems are unavailable
- **Singleton Pattern**: Global access with consistent instances

## Performance

- **Lazy Loading**: Only load systems that are actually used
- **Runtime Delegation**: Avoid circular dependency build issues
- **Professional Caching**: Singleton pattern for efficient resource usage
- **Strategic Access**: Unified interface reduces complexity

## Dependencies

### Core Dependencies
- `@claude-zen/foundation` - Core utilities and logging

### Peer Dependencies (Optional)
- `@claude-zen/safe-framework` - SAFe enterprise framework (required)
- `@claude-zen/sparc` - SPARC methodology (required)
- `@claude-zen/teamwork` - Multi-agent collaboration (optional)
- `@claude-zen/agui` - Advanced GUI systems (optional)
- `@claude-zen/knowledge` - Knowledge management (optional)
- `@claude-zen/kanban` - Workflow coordination (optional)

## Integration

Part of the Strategic Architecture v2.0.0:

1. **Foundation** (`@claude-zen/foundation`) - Infrastructure
2. **Intelligence** (`@claude-zen/intelligence`) - AI/Neural/ML
3. **Enterprise** (`@claude-zen/enterprise`) - Business Processes ← **This Package**
4. **Operations** (`@claude-zen/operations`) - Monitoring/Performance

## Examples

See the `examples/` directory for complete usage examples including:
- SAFe portfolio management workflows
- SPARC methodology implementation
- Multi-agent teamwork coordination
- Human-in-the-loop approval systems
- Knowledge management integration
- Professional kanban workflows

## License

MIT - See LICENSE file for details

## Contributing

See CONTRIBUTING.md for development guidelines and architectural patterns.