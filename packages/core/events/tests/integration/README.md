# Event-Driven Architecture Integration Tests

This directory contains comprehensive integration tests for the unified event-driven architecture across brain, document intelligence, and coordination packages.

## Test Coverage

### `complete-workflow-test.ts`
**Comprehensive end-to-end workflow testing:**

- ✅ **External Document Import Workflow**: Tests complete saga from brain analysis → coordination approval → document intelligence processing → SAFe integration
- ✅ **Cross-Package Coordination**: Tests orchestration across multiple services with resource allocation and validation
- ✅ **Saga Compensation**: Tests rollback functionality when workflows fail
- ✅ **Correlation Tracking**: Verifies correlation IDs are maintained across the entire workflow lifecycle
- ✅ **Event Flow Verification**: Tests proper event sequencing and communication patterns
- ✅ **Metrics and Monitoring**: Validates saga metrics collection and reporting

## Running Tests

```bash
# Run all integration tests
pnpm test

# Run specific integration test
pnpm test tests/integration/complete-workflow-test.ts

# Run tests in watch mode
pnpm test:watch
```

## Test Architecture

The tests use a realistic event-driven approach with:

### Mocked Event Bus
- Events are captured and verified
- Event sequence validation
- Correlation tracking verification

### Saga Workflow Testing
- Complete workflow execution simulation
- Step-by-step validation
- Success and failure scenarios
- Compensation testing

### Cross-Package Integration
- Brain → Coordination → Document Intelligence event flows
- External document import workflows
- SAFe/SPARC integration points

## Expected Results

When tests pass, you should see:
- ✅ All workflow steps complete successfully
- ✅ Proper event sequencing maintained
- ✅ Correlation IDs tracked throughout
- ✅ Saga compensation works on failures
- ✅ Metrics accurately reflect workflow state

## Workflow Verification

The tests verify these critical workflow patterns:

### 1. External Document Import
```
External Document → Brain Analysis → Coordination Approval → 
Document Intelligence Processing → SAFe Integration → Completion
```

### 2. Cross-Package Coordination
```
Brain Request → Coordination Validation → Resource Allocation → 
Service Coordination → Result Integration
```

### 3. Error Handling & Compensation
```
Workflow Failure → Saga Compensation → Rollback Completed Steps → 
Clean State Restoration
```

## Integration Points Tested

- **Brain ↔ Coordination**: SAFe workflow support, SPARC phase transitions
- **Brain ↔ Document Intelligence**: Import requests, processing results
- **Document Intelligence ↔ Coordination**: Import completion, integration readiness
- **Foundation Event Registry**: Module registration, heartbeat management
- **Saga Management**: Distributed transaction coordination, compensation

These tests ensure the unified event-driven architecture works correctly across all packages and maintains data consistency, proper error handling, and complete audit trails.