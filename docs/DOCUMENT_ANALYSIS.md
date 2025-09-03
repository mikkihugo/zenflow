# Document Analysis & Code Scanning System

## 🎯 Overview

The Document Analysis System provides enhanced document scanning with **human-in-the-loop approval** via AGUI for generating swarm tasks from code analysis. This system extends the existing document processing capabilities with intelligent code analysis and task generation.

## 🚀 Key Features

- **📍 Enhanced Code Scanning** - Detects TODOs, FIXMEs, missing implementations, and code quality issues
- **🤖 AI-Powered Task Generation** - Automatically generates actionable swarm tasks from analysis
- **👥 Human-in-the-Loop Approval** - Uses existing AGUI system for task review and approval
- **📊 Integration with THE COLLECTIVE** - Creates proper document entities in the database
- **🐝 Swarm Integration** - Approved tasks are automatically added to the swarm queue

## 🏗️ Architecture

```
📁 Documents & Code
       ↓
🔍 Enhanced Document Scanner
   • Pattern detection (TODO, FIXME, etc.)
   • Code quality analysis
   • Missing implementation detection
       ↓
🤖 Task Generation Engine
   • Creates structured swarm tasks
   • Estimates effort and priority
   • Suggests agent types
       ↓
👥 AGUI Approval System
   • Human review workflow
   • Batch approval options
   • Task modification support
       ↓
📄 Document Entity Creation
   • THE COLLECTIVE integration
   • Proper entity relationships
   • Audit trail preservation
       ↓
🐝 Swarm Task Queue
   • Automatic task creation
   • Agent assignment
   • Execution tracking
```

## 📦 Components

### EnhancedDocumentScanner

- **File**: `src/core/enhanced-document-scanner.ts`
- **Purpose**: Scans markdown and code files for issues and improvement opportunities
- **Capabilities**:
  - Pattern-based analysis (TODO, FIXME, HACK, etc.)
  - Deep code analysis with AST parsing
  - Markdown documentation gap detection
  - Configurable analysis patterns and file filtering

### TaskApprovalSystem

- **File**: `src/core/task-approval-system.ts`
- **Purpose**: Human-in-the-loop approval workflow using existing AGUI
- **Capabilities**:
  - Rich task display with analysis context
  - Batch approval processing
  - Task modification workflow
  - Decision audit trail
  - Integration with WorkflowAGUIAdapter

### DocumentAnalysisWorkflow

- **File**: `src/core/document-analysis-workflow.ts`
- **Purpose**: Orchestrates the complete workflow from scanning to swarm execution
- **Capabilities**:
  - Progress tracking and status updates
  - Document entity creation
  - Swarm task integration
  - Error handling and recovery
  - Comprehensive result reporting

## 🚀 Quick Start

### 1. Interactive Workflow

```bash
# Run full interactive workflow with human approval
pnpm run scan:interactive

# Or use the example script directly
pnpm run example:doc-analysis
```

### 2. Quick Demo (Auto-Approve)

```bash
# Quick demo with auto-approval for testing
pnpm run scan:docs

# Or specify a custom path
pnpm dlx tsx src/examples/document-analysis-example.ts --path ./src/core
```

### 3. Programmatic Usage

```typescript
import { createCompleteWorkflow } from './src/core/document-analysis-workflow';
import { createAGUI } from './src/interfaces/agui/agui-adapter';

async function scanProject() {
  const agui = createAGUI('terminal');

  const workflow = await createCompleteWorkflow('./src', agui, {
    scanner: {
      enabledPatterns: ['todo', 'fixme', 'missing_implementation'],
      deepAnalysis: true,
    },
    approval: {
      enableRichDisplay: true,
      requireRationale: true,
    },
    enableSwarmIntegration: true,
  });

  const results = await workflow.executeWorkflow();
  console.log(`Generated ${results.swarmTasksCreated} swarm tasks`);
}
```

## 🎯 Analysis Patterns

The scanner detects various patterns in your code and documentation:

### Code Patterns

- **`TODO`** - Items marked for implementation
- **`FIXME`** - Known issues that need fixing
- **`HACK`** - Temporary solutions needing refactoring
- **`DEPRECATED`** - Outdated code needing updates
- **Empty Functions** - Functions without implementation
- **Missing Error Handling** - Async functions without try-catch

### Documentation Patterns

- **Empty Sections** - Markdown headers without content
- **Broken Links** - Internal links to missing files
- **Missing Documentation** - Functions without JSDoc

### Code Quality Issues

- **Performance Issues** - Potential performance bottlenecks
- **Security Concerns** - Security-related code issues
- **Refactoring Opportunities** - Code that needs restructuring

## 🔧 Configuration

### Scanner Configuration

```typescript
const scannerConfig = {
  rootPath: './src',
  includePatterns: ['**/*.md', '**/*.ts', '**/*.js'],
  excludePatterns: ['**/node_modules/**', '**/*.test.*'],
  enabledPatterns: ['todo', 'fixme', 'missing_implementation'],
  maxDepth: 10,
  deepAnalysis: true,
};
```

### Approval Configuration

```typescript
const approvalConfig = {
  enableRichDisplay: true, // Show detailed task information
  enableBatchMode: true, // Allow batch processing
  batchSize: 5, // Tasks per batch
  autoApproveLowSeverity: false, // Require manual approval for all
  requireRationale: true, // Require reason for rejections
  enableModification: true, // Allow task editing
};
```

## 📊 Integration with THE COLLECTIVE

The system integrates seamlessly with the existing document entity system:

### Document Entities Created

- **TaskDocumentEntity** - For implementation tasks
- **FeatureDocumentEntity** - For larger features
- **EpicDocumentEntity** - For major initiatives

### Entity Fields Populated

- Source analysis information
- File paths and line numbers
- Estimated effort and priority
- Acceptance criteria
- SPARC methodology integration (where applicable)

## 🤖 Swarm Integration

Approved tasks are automatically configured for swarm execution:

### Swarm Configuration

- **Agent Types**: Based on task type (coder, reviewer, tester, etc.)
- **Swarm Topology**: Determined by task complexity
- **Execution Strategy**: Single-agent, collaborative, or research-based

### Task Metadata

- **Duration Estimates** - Based on analysis complexity
- **Dependencies** - Extracted from code relationships
- **Acceptance Criteria** - Generated from analysis context

## 🎮 AGUI Integration

The system leverages the existing AGUI infrastructure:

### Features Used

- **Rich Prompts** - Contextual task display
- **Validation Questions** - Structured approval workflow
- **Batch Processing** - Efficient multi-task review
- **Decision Logging** - Complete audit trail
- **Timeout Handling** - Automatic escalation support

### User Experience

- Clear task summaries with code context
- Options for approve/reject/modify/defer
- Bulk operations for similar tasks
- Modification workflow for task refinement

## 📈 Statistics & Reporting

The system provides comprehensive analytics:

### Approval Statistics

- Approval rates by task type
- Average processing times
- Common rejection reasons
- Modification patterns

### Scan Results

- Issues found by severity
- Pattern distribution
- File coverage metrics
- Quality trends over time

## 🔍 Example Output

```
🔍 Document Scan Results Summary
================================
📁 Files Scanned: 42
🔍 Issues Found: 15
📋 Tasks Generated: 8
⏱️  Scan Duration: 3s

📊 Issue Severity Breakdown:
   high: 2
   medium: 8
   low: 5

✅ Task Approval Summary
========================
📋 Total Tasks: 8
✅ Approved: 6
❌ Rejected: 1
📝 Modified: 1
⏸️  Deferred: 0
⏱️  Processing Time: 45s

🚀 6 tasks approved and ready for swarm execution!
```

## 🛠️ Extending the System

### Adding New Analysis Patterns

```typescript
// Add custom pattern to enhanced-document-scanner.ts
patterns.set('custom_pattern', [
  /\/\/\s*CUSTOM[:\s](.*?)(?:\n|$)/gi,
  /\/\*\s*CUSTOM[:\s](.*?)(?:\*\/|$)/gi,
]);
```

### Custom Task Generation

```typescript
// Override task generation in createSwarmTask method
const customTemplate = {
  title: `Custom task for ${pattern}`,
  type: 'custom' as const,
  swarmType: 'specialized' as const,
  agents: ['custom_agent', 'reviewer'],
};
```

### AGUI Extensions

```typescript
// Add custom validation questions
const customQuestion: ValidationQuestion = {
  id: 'custom-review',
  type: 'custom',
  question: 'Custom review question',
  options: ['Option 1', 'Option 2'],
  confidence: 0.9,
};
```

## 🔗 Related Documentation

- **[AGUI System](../src/interfaces/agui/README.md)** - Human-in-the-loop interfaces
- **[Document Entities](../src/database/entities/README.md)** - THE COLLECTIVE integration
- **[Swarm System](../src/coordination/swarm/README.md)** - Task execution
- **[Workflow System](../src/workflows/README.md)** - Process orchestration

---

**Ready to scan your codebase and generate actionable swarm tasks with human approval! 🚀**
