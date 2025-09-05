# Knowledge Package - Unique Semantic Context & Decision Memory

## Zero Overlap with Existing Packages

### What Other Packages Do
- **@claude-zen/code-analyzer**: Analyzes WHAT code exists (AST, metrics)
- **@claude-zen/language-parsers**: Parses syntax and structure  
- **@claude-zen/ai-linter**: Provides code quality insights

### What Knowledge Package Does (UNIQUE)
- **Decision Memory**: Records WHY decisions were made
- **Semantic Context**: Captures project intent and purpose
- **Methodology Compliance**: Tracks SAFe 6.0/SPARC adherence

## Real-World Usage Examples

### TaskMaster Using Decision Memory (Event-Driven)
```typescript
import { EventBus } from '@claude-zen/foundation';

// TaskMaster records architectural decision via events
const eventBus = EventBus.getInstance();

eventBus.emit('knowledge:record-decision', {
  decision: {
    decision: "Use EventBus pattern for cross-package communication",
    reasoning: "Decouples packages and enables async coordination without direct imports",
    alternatives: ["Direct imports", "Shared state", "Message queues"],
    context: "Enterprise architecture requiring loose coupling",
    domain: "inter-package-communication", 
    timestamp: Date.now(),
    decisionMaker: "TaskMaster-coordination",
    tags: ["architecture", "decoupling", "enterprise"],
    consequences: ["Cleaner package boundaries", "Async complexity", "Event debugging"],
    reviewDate: Date.now() + (6 * 30 * 24 * 60 * 60 * 1000) // 6 months
  }
});

// Later: TaskMaster finds similar decisions for new coordination challenge
const requestId = crypto.randomUUID();

// Listen for response
eventBus.once(`knowledge:similar-decisions:response:${requestId}`, (result) => {
  console.log('Previous similar decisions:', result.decisions);
  // Returns: Why EventBus was chosen, what alternatives were considered
});

// Request similar decisions
eventBus.emit('knowledge:find-similar-decisions', {
  domain: "inter-package-communication",
  context: "decoupling packages",
  requestId
});
```

### SPARC Using Project Semantics
```typescript
// SPARC Specification Phase - Store project semantics
await semanticProcessor.storeProjectSemantics('zenflow-refactor', {
  purpose: "Refactor zenflow architecture for enterprise scalability",
  businessValue: "Enable faster development cycles and reduce technical debt",
  stakeholders: ["Development Team", "Product Management", "Enterprise Architecture"],
  constraints: ["Must maintain backward compatibility", "Zero downtime deployment"],
  assumptions: ["Team has TypeScript expertise", "EventBus pattern is accepted"],
  risks: ["Migration complexity", "Performance impact during transition"],
  successCriteria: ["50% faster feature development", "90% test coverage maintained"],
  context: "Enterprise software development with SAFe 6.0 methodology"
});

// SPARC Architecture Phase - Get context for architectural decisions
const projectContext = await semanticProcessor.getProjectSemantics('zenflow-refactor');
console.log('Project purpose:', projectContext.purpose);
console.log('Key constraints:', projectContext.constraints);

// Use this context to guide architectural decisions
if (projectContext.constraints.includes('Zero downtime deployment')) {
  // Design for rolling deployments
}
```

### Methodology Compliance Tracking
```typescript
// Record SAFe 6.0 compliance during Program Increment
await semanticProcessor.recordComplianceCheck('zenflow-refactor', 'SAFe6.0', {
  methodology: 'SAFe6.0',
  currentPhase: 'Program Increment Planning',
  complianceScore: 85,
  violations: [
    "Missing epic acceptance criteria",
    "Insufficient story point estimation documentation"
  ],
  recommendations: [
    "Define clear acceptance criteria for all epics",
    "Document story point estimation rationale"
  ],
  nextSteps: [
    "Schedule epic refinement session",
    "Update estimation templates"
  ],
  timestamp: Date.now(),
  assessor: 'TaskMaster-SAFe-Monitor'
});

// Track compliance over time
const complianceHistory = await semanticProcessor.getComplianceHistory('zenflow-refactor', 'SAFe6.0');
console.log('Compliance trend:', complianceHistory.map(r => r.complianceScore));
// Shows improvement/degradation over time
```

## Integration with Coordination Packages

### TaskMaster Benefits
- **Decision Consistency**: "We chose X for Y reason before"
- **Context Awareness**: "This project has these constraints"  
- **Compliance Tracking**: "We're 85% SAFe compliant"

### SPARC Benefits  
- **Phase Context**: "What were the original requirements?"
- **Decision Traceability**: "Why did we choose this architecture?"
- **Methodology Adherence**: "Are we following SPARC correctly?"

## Why This is Valuable

✅ **Institutional Memory**: Preserves WHY decisions were made  
✅ **Context Continuity**: Maintains project intent across time  
✅ **Methodology Compliance**: Ensures enterprise framework adherence  
✅ **Decision Support**: Provides context for future decisions  
✅ **Zero Code Analysis**: Purely semantic - no syntax parsing  

This fills a **unique gap** that no other package addresses: the memory and context layer that makes coordination intelligent and context-aware.