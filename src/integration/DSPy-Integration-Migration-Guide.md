# DSPy Integration Migration Guide

## 🚨 CRITICAL ISSUE IDENTIFIED

**Problem**: Claude-Zen's DSPy integration code expects a full DSPy framework API that doesn't exist in dspy.ts v0.1.3.

**Current State**: 
- ❌ `import { DSPy } from 'dspy.ts'` - **DSPy class doesn't exist**
- ❌ `new DSPy(config)` - **Constructor not available**
- ❌ `createProgram()`, `execute()`, `optimize()` - **Methods don't exist**

**Available API (dspy.ts v0.1.3)**:
- ✅ `LMDriver` interface - Language model abstraction
- ✅ `configureLM(lm)` / `getLM()` - Global LM configuration
- ✅ `DummyLM` - Mock implementation

## 🛠️ SOLUTION: Wrapper Architecture

The solution is a comprehensive wrapper that provides the expected DSPy interface using the available LMDriver functionality.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                   CLAUDE-ZEN DSPy INTEGRATION               │
├─────────────────────────────────────────────────────────────┤
│  DSPyIntegrationManager  │  DSPyEnhancedOperations         │
│  DSPySwarmIntelligence   │  DSPyEnhancedMCPTools           │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     DSPy WRAPPER LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  • DSPy class (mimics expected interface)                  │
│  • createProgram() → structured prompting                  │
│  • execute() → LM generation + parsing                     │
│  • optimize() → example-based improvement                  │
│  • addExamples() → training data collection                │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    ACTUAL DSPY.TS v0.1.3                   │
├─────────────────────────────────────────────────────────────┤
│  • LMDriver interface                                      │
│  • configureLM() / getLM()                                │
│  • ClaudeLMDriver (custom implementation)                  │
│  • DummyLM (fallback)                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📝 MIGRATION STEPS

### Step 1: Update Import Statements

**BEFORE (Broken)**:
```typescript
import { DSPy, type DSPyProgram } from 'dspy.ts';
```

**AFTER (Working)**:
```typescript
import { DSPy, type DSPyProgram } from '../integration/dspy-wrapper-architecture';
```

### Step 2: Update All DSPy Integration Files

#### Files to Update:
1. `/src/core/dspy-integration-manager.ts`
2. `/src/core/dspy-enhanced-operations.ts`
3. `/src/coordination/swarm/dspy-swarm-intelligence.ts`
4. `/src/interfaces/mcp/dspy-enhanced-tools.ts`
5. `/src/coordination/agents/dspy-agent-integration.ts`

#### Example Migration:

**File**: `src/core/dspy-enhanced-operations.ts`

```typescript
// OLD IMPORT (BROKEN)
import { DSPy, type DSPyProgram } from 'dspy.ts';

// NEW IMPORT (WORKING)
import { DSPy, type DSPyProgram } from '../integration/dspy-wrapper-architecture';

// Rest of the code stays EXACTLY the same!
// The wrapper provides the same interface that the code expects
```

### Step 3: Configuration Update

Update the DSPy configuration to use the wrapper:

```typescript
// In DSPyIntegrationManager constructor
constructor(config: DSPyConfiguration = {}) {
  this.config = {
    model: 'claude-3-5-sonnet-20241022', // Use actual Claude model
    temperature: 0.2,
    enableUnifiedLearning: true,
    learningInterval: 600000,
    maxHistorySize: 2000,
    ...config
  };

  this.initializeSystems();
  // ... rest stays the same
}
```

### Step 4: Enhanced Error Handling

Add error handling for the wrapper layer:

```typescript
// In any DSPy operation
try {
  const result = await this.dspy.execute(program, inputs);
  return result;
} catch (error) {
  if (error.message.includes('LM not configured')) {
    logger.warn('DSPy wrapper LM not properly configured, using fallback');
    // Initialize fallback LM driver
  }
  throw error;
}
```

## 🎯 WRAPPER FEATURES

The DSPy wrapper provides all expected functionality:

### 1. Program Creation
```typescript
const program = await dspy.createProgram(
  'code: string, task_type: string -> analysis: string, suggestions: string[], complexity: number',
  'Analyze code and provide intelligent insights'
);
```

### 2. Program Execution
```typescript
const result = await dspy.execute(program, {
  code: sourceCode,
  task_type: 'analysis'
});
// Returns: { analysis, suggestions, complexity, confidence, reasoning }
```

### 3. Example-Based Learning
```typescript
await dspy.addExamples(program, [
  { input: { code: 'sample', task_type: 'review' }, output: { analysis: 'good' } }
]);
```

### 4. Program Optimization
```typescript
await dspy.optimize(program, {
  strategy: 'auto',
  maxIterations: 5
});
```

## 🚀 IMPLEMENTATION BENEFITS

### Immediate Benefits
- ✅ **Zero Breaking Changes**: All existing code continues to work
- ✅ **Full API Compatibility**: Wrapper provides all expected methods
- ✅ **Claude Integration**: Direct integration with Claude API
- ✅ **Structured Responses**: JSON parsing and validation
- ✅ **Performance Metrics**: Execution time and success tracking

### Advanced Features
- 🧠 **Intelligent Prompting**: Signature-based prompt generation
- 📊 **Example Learning**: Builds better prompts from successful examples
- 🔄 **Continuous Optimization**: Improves performance over time
- 📈 **Analytics**: Comprehensive execution statistics
- 🛡️ **Error Recovery**: Graceful fallbacks and error handling

## 🔧 TESTING THE MIGRATION

### Test Script
Create a test file to verify the wrapper works:

```typescript
// test/dspy-wrapper-test.ts
import { DSPy } from '../src/integration/dspy-wrapper-architecture';

async function testDSPyWrapper() {
  const dspy = new DSPy({
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.1
  });

  // Test program creation
  const program = await dspy.createProgram(
    'input: string -> output: string, confidence: number',
    'Simple test program'
  );

  // Test execution
  const result = await dspy.execute(program, { input: 'test input' });
  console.log('Result:', result);

  // Test stats
  const stats = dspy.getStats();
  console.log('Stats:', stats);
}

testDSPyWrapper().catch(console.error);
```

## 📋 ROLLOUT PLAN

### Phase 1: Core Integration (Day 1)
1. Deploy wrapper architecture
2. Update import statements in all DSPy files
3. Test basic functionality

### Phase 2: Enhanced Features (Day 2-3)
1. Configure Claude API integration
2. Implement example-based learning
3. Add performance monitoring

### Phase 3: Optimization (Day 4-7)
1. Fine-tune prompt generation
2. Add advanced parsing logic
3. Implement caching and persistence

### Phase 4: Production Ready (Week 2)
1. Comprehensive error handling
2. Performance optimization
3. Integration with existing logging and metrics

## 🎯 EXPECTED OUTCOMES

After migration:
- ✅ All DSPy integration tests pass
- ✅ Code analysis, generation, and error diagnosis work
- ✅ Swarm intelligence and MCP tools function properly
- ✅ Performance metrics and learning are captured
- ✅ System is ready for production use

## 🚨 ROLLBACK PLAN

If issues occur:
1. Revert import statements to use dummy implementations
2. Disable DSPy-enhanced features temporarily
3. Fall back to basic Claude-Zen functionality
4. Debug and fix wrapper issues

## 📞 SUPPORT

For implementation questions:
- Review wrapper architecture code and comments
- Check logs for DSPy wrapper operations
- Test individual components in isolation
- Verify LM driver configuration and connectivity

---

**Status**: Ready for implementation  
**Priority**: High - Required for DSPy-enhanced features to work  
**Risk**: Low - Wrapper maintains full API compatibility