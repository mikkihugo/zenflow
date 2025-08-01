# Claude Flow Project

This project is configured for Claude Code integration.

## ⚠️ CRITICAL: DO NOT MODIFY .claude/ DIRECTORY

**🚨 NEVER TOUCH `.claude/` DIRECTORY** - This is for **THIS PROJECT'S DEVELOPMENT ONLY**:
- `.claude/settings.json` = Our development hooks and configuration
- `.claude/commands/` = Our development command documentation  
- `.claude/cache/` = Our development session data

**✅ MODIFY TEMPLATE INSTEAD**: 
- `templates/claude-zen/` = Template files that get copied to other projects
- `templates/claude-zen/settings.json` = Template hooks for new projects

**The Rule**: 
- Changes to `.claude/` = Affects this development project only
- Changes to `templates/claude-zen/` = Affects all new projects created with `claude-zen init`

## Getting Started

Run `claude-zen --help` to see available commands.

## Commands

- `claude-zen init` - Initialize project with Claude Code integration
- `claude-zen status` - Show project status  
- `claude-zen help` - Show help

## Development

This project uses:
- **Template system** for `claude-zen init` functionality
- **MCP integration** with ruv-swarm-zen for coordination
- **Plugin architecture** for extensible functionality

## MCP Tools

When using ruv-swarm MCP tools with Claude Code:

### Setup
```bash
# Add ruv-swarm-zen MCP server to Claude Code
claude mcp add ruv-swarm-zen npx ruv-swarm mcp start
```

### Key Tools
- `mcp__ruv-swarm-zen__swarm_init` - Initialize coordination
- `mcp__ruv-swarm-zen__agent_spawn` - Create specialized agents
- `mcp__ruv-swarm-zen__task_orchestrate` - Coordinate complex tasks

## 🧪 Testing Strategy for Claude-Zen

### **Hybrid TDD Approach: 70% London + 30% Classical**

Claude-Zen uses a hybrid testing approach optimized for distributed AI systems:

#### **Testing Philosophy**
- **TDD London (70%)**: For distributed components, protocols, and integration boundaries
- **Classical TDD (30%)**: For neural algorithms, WASM computations, and mathematical operations
- **Real-time Hybrid**: For WebSocket and swarm coordination testing

#### **Component-Based Testing Strategy**

```typescript
// TDD London (Mockist) - Use for these components:
const londonComponents = [
  'MCP Protocol Compliance',
  'WebSocket Real-time Communication', 
  'Swarm Coordination & Agent Messaging',
  'Inter-service Integration Boundaries',
  'CLI Command Processing',
  'Memory Store Operations',
  'External API Integration'
];

// Classical TDD (Detroit) - Use for these components:
const classicalComponents = [
  'Neural Network Algorithms (ruv-FANN)',
  'WASM Computation Kernels', 
  'Mathematical Operations & Transformations',
  'Data Structure Manipulations',
  'Pure Function Logic',
  'Performance-Critical Code Paths'
];
```

#### **Testing Structure**

```
src/__tests__/
├── unit/                    # 70% of tests
│   ├── london/             # Mockist tests (interactions)
│   │   ├── mcp-protocol/
│   │   ├── swarm-coordination/
│   │   └── integration-boundaries/
│   └── classical/          # Detroit tests (results)
│       ├── neural-algorithms/
│       ├── wasm-computations/
│       └── mathematical-operations/
├── integration/            # 25% of tests
│   ├── component-boundaries/
│   ├── protocol-compliance/
│   └── wasm-js-bridge/
└── e2e/                   # 5% of tests
    ├── full-system-workflows/
    └── performance-scenarios/
```

#### **TDD London Examples (Mockist)**

```typescript
// ✅ Use for MCP protocol, swarm coordination, CLI commands
describe('MCP Protocol Handler', () => {
  it('should validate and route tool calls correctly', async () => {
    // Inline mocks following TDD London
    const mockValidator = { validate: jest.fn().mockReturnValue(true) };
    const mockExecutor = { execute: jest.fn().mockResolvedValue({ success: true }) };
    
    const handler = new MCPHandler(mockValidator, mockExecutor);
    await handler.handleToolCall('swarm_init', { topology: 'mesh' });
    
    // Verify interactions, not state
    expect(mockValidator.validate).toHaveBeenCalledWith('swarm_init', { topology: 'mesh' });
    expect(mockExecutor.execute).toHaveBeenCalledWith('swarm_init', { topology: 'mesh' });
  });
});
```

#### **Classical TDD Examples (Detroit)**

```typescript
// ✅ Use for neural networks, WASM math, algorithms
describe('Neural Network Training', () => {
  it('should converge on XOR problem', () => {
    const network = new NeuralNetwork([2, 4, 1]);
    const xorData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ];
    
    const result = network.train(xorData, { epochs: 1000 });
    
    // Test actual results, not mocks
    expect(network.predict([0, 0])[0]).toBeCloseTo(0, 1);
    expect(network.predict([1, 1])[0]).toBeCloseTo(0, 1);
    expect(result.finalError).toBeLessThan(0.01);
  });
});
```

#### **Hybrid Testing for Real-time Systems**

```typescript
// 🔄 Combine both approaches for WebSocket/real-time
describe('Swarm Real-time Coordination', () => {
  it('should coordinate agents with <100ms latency', async () => {
    // Mock the protocol (London)
    const mockProtocol = { encode: jest.fn(), decode: jest.fn() };
    
    // Test real performance (Classical)
    const coordinator = new SwarmCoordinator(mockProtocol);
    const startTime = Date.now();
    
    await coordinator.broadcastMessage({ type: 'sync' });
    
    expect(Date.now() - startTime).toBeLessThan(100);
    expect(mockProtocol.encode).toHaveBeenCalled();
  });
});
```

#### **Best Practices**

1. **Mock Boundaries, Not Implementation**
   - Mock at integration points (APIs, protocols, I/O)
   - Don't mock internal logic or algorithms

2. **Test Behavior, Not State**
   - London: Verify method calls and interactions
   - Classical: Verify computation results and transformations

3. **Performance Testing**
   - Use Classical TDD for benchmarking
   - Test actual execution times and throughput

4. **WASM Testing Strategy**
   ```typescript
   // Mock the loading, test the computation
   const mockLoader = createMockWasmLoader();
   const realComputation = await wasmModule.compute(data);
   expect(realComputation.result).toBeCloseTo(expected, 0.001);
   ```

#### **When to Use Each Approach**

| Component Type | Testing Approach | Reason |
|---------------|------------------|---------|
| MCP Protocol | TDD London | Test message handling and routing |
| Neural Networks | Classical TDD | Verify mathematical correctness |
| WebSocket | Hybrid | Mock protocol, test latency |
| CLI Commands | TDD London | Test command parsing and dispatch |
| WASM Functions | Classical TDD | Verify computation accuracy |
| Swarm Coordination | TDD London | Test agent interactions |
| Data Transformations | Classical TDD | Verify output correctness |

#### **Migration from Pure London to Hybrid**

1. Keep existing London tests for distributed components
2. Add Classical tests for computational components
3. Use test helpers from `/test/helpers/` for consistency
4. Follow the 70/30 split guideline

#### **Test Quality Metrics**

- **Unit Test Coverage**: Minimum 80% (London + Classical)
- **Integration Coverage**: 100% for critical paths
- **Performance Benchmarks**: Must meet SLA targets
- **Mutation Testing**: Consider for critical algorithms

This hybrid approach gives Claude-Zen the best of both worlds: clean interaction testing for distributed components and rigorous result verification for computational cores.
- `mcp__ruv-swarm__swarm_status` - Monitor coordination

### Best Practices
- **Batch operations** - Combine multiple tool calls in single messages
- **Parallel execution** - Use swarms for complex multi-step tasks
- **Memory management** - Maintain context across sessions

## Support

- Documentation: https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm
- Issues: https://github.com/ruvnet/ruv-FANN/issues