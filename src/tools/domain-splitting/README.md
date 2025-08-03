# Domain Splitting System

A comprehensive system for analyzing and splitting large domains into focused, maintainable sub-domains with clear boundaries and dependency management.

## Overview

The domain splitting system provides tools to:
- Analyze domain complexity and file organization
- Identify optimal sub-domain boundaries
- Safely execute domain splits with rollback capability
- Validate split integrity and dependencies
- Generate migration guides and documentation

## Quick Start

### Analyze a Domain

```bash
npx tsx src/tools/domain-splitting/cli.ts analyze src/neural
```

### Split Neural Domain (Demo)

```bash
npx tsx src/tools/domain-splitting/cli.ts neural
```

### Validate Domain Structure

```bash
npx tsx src/tools/domain-splitting/cli.ts validate src/coordination
```

## Architecture

### Core Components

1. **Domain Analyzer** (`analyzers/domain-analyzer.ts`)
   - Scans domain files and analyzes complexity
   - Categorizes files by purpose and functionality
   - Builds dependency graphs
   - Generates splitting recommendations

2. **Domain Splitter** (`splitters/domain-splitter.ts`)
   - Executes safe file movement operations
   - Updates import paths automatically
   - Generates index files for public APIs
   - Provides rollback capability

3. **Dependency Validator** (`validators/dependency-validator.ts`)
   - Detects circular dependencies
   - Validates import resolution
   - Ensures build integrity
   - Checks API stability

4. **Orchestrator** (`orchestrator.ts`)
   - Coordinates complete splitting workflows
   - Manages component interactions
   - Provides high-level API

### File Categories

The system categorizes files into 15 categories:

- `core-algorithms` - Core functionality and algorithms
- `training-systems` - Training and optimization logic
- `network-architectures` - Different network types
- `data-processing` - Input/output processing
- `evaluation-metrics` - Performance measurement
- `visualization` - Charts and visual components
- `integration` - External integrations
- `agents` - Agent implementations
- `coordination` - Coordination protocols
- `utilities` - Helper functions
- `tests` - Test files
- `configuration` - Config files
- `bridge` - Bridge/adapter functionality
- `wasm` - WebAssembly integration
- `models` - Data models and presets

## Neural Domain Splitting Plan

The neural domain (34 files) is split into 6 focused sub-domains:

### 1. neural-core (6 files)
Core neural network algorithms and primitives
- `neural-core.ts` - Core neural functionality
- `network.ts` - Network base classes
- `neural-network.ts` - Neural network implementation
- etc.

### 2. neural-models (17 files)
Neural network models, architectures, and presets
- `cnn.js` - Convolutional Neural Networks
- `transformer.js` - Transformer architectures
- `lstm.js` - Long Short-Term Memory networks
- etc.

### 3. neural-agents (2 files)
Neural-specific agent implementations
- `neural-agent.js` - Neural agent implementation

### 4. neural-coordination (2 files)
Neural coordination protocols and systems
- `neural-coordination-protocol.js` - Coordination protocols

### 5. neural-wasm (5 files)
WASM integration and Rust computational core
- `wasm-loader.js` - WASM module loading
- `wasm-memory-optimizer.js` - Memory optimization
- `wasm-types.d.ts` - Type definitions

### 6. neural-bridge (2 files)
Bridge functionality and integration layers
- `neural-bridge.ts` - Integration bridge
- `index.ts` - Main exports

## Usage Examples

### Programmatic Usage

```typescript
import { DomainSplittingOrchestrator } from './tools/domain-splitting/orchestrator.js';

const orchestrator = new DomainSplittingOrchestrator();

// Analyze domain
const analysis = await orchestrator.analyzeDomain('src/neural');
console.log(`Complexity: ${analysis.analysis.complexityScore}`);

// Execute splitting
const result = await orchestrator.splitNeuralDomain();
console.log(`Created ${result.subDomainsCreated} sub-domains`);
```

### Custom Splitting Plan

```typescript
import { NEURAL_SPLITTING_PLAN } from './tools/domain-splitting/types/domain-types.js';

const customPlan = {
  sourceDomain: 'coordination',
  targetSubDomains: [
    {
      name: 'coordination-core',
      description: 'Core coordination functionality',
      estimatedFiles: 10,
      dependencies: ['utils']
    },
    {
      name: 'coordination-agents',
      description: 'Agent coordination systems', 
      estimatedFiles: 8,
      dependencies: ['coordination-core']
    }
  ]
};

const result = await orchestrator.executeDomainSplit('src/coordination', customPlan);
```

## Safety Features

### Backup and Rollback

- Automatic backup creation before any operations
- Complete rollback capability if splitting fails
- Validation of all operations before execution

### Validation Checks

- Circular dependency detection
- Import resolution verification
- Build integrity validation
- TypeScript compilation checks

### Progress Reporting

- Real-time progress updates during operations
- Detailed logging of all operations
- Error reporting with context

## File Operations

### Import Path Updates

The system automatically updates import paths when files are moved:

```typescript
// Before split
import { NeuralNetwork } from './core/neural-network';

// After split
import { NeuralNetwork } from '../neural-core/neural-network';
```

### Index File Generation

Each sub-domain gets an auto-generated index file:

```typescript
// neural-core/index.ts
export { NeuralNetwork } from './neural-network.js';
export { Network } from './network.js';
export { default as NeuralCore } from './neural-core.js';
```

## Testing

### Classical TDD Tests
Test actual file operations and analysis results:

```typescript
describe('Domain Analysis', () => {
  it('should analyze domain complexity correctly', async () => {
    const analysis = await analyzer.analyzeDomainComplexity('test-domain');
    expect(analysis.totalFiles).toBeGreaterThan(0);
    expect(analysis.complexityScore).toBeGreaterThan(0);
  });
});
```

### London TDD Tests
Test component interactions using mocks:

```typescript
describe('Domain Splitting Orchestration', () => {
  it('should execute complete workflow', async () => {
    mockAnalyzer.analyzeDomainComplexity.mockResolvedValue(mockAnalysis);
    mockSplitter.executeSplitting.mockResolvedValue(mockResult);
    
    const result = await orchestrator.executeDomainSplit('src/test');
    
    expect(mockAnalyzer.analyzeDomainComplexity).toHaveBeenCalled();
    expect(mockSplitter.executeSplitting).toHaveBeenCalled();
  });
});
```

## Configuration

### Analysis Configuration

```typescript
const config = {
  includeTests: true,
  includeConfig: true,
  maxComplexityThreshold: 10,
  minFilesForSplit: 15,
  coupling: {
    threshold: 0.7,
    algorithm: 'shared-dependencies'
  }
};
```

### Naming Convention

All sub-domains follow kebab-case naming:
- `neural-core` ✅
- `neural-models` ✅
- `neuralCore` ❌
- `Neural_Models` ❌

## Performance Metrics

The system tracks various metrics:

- **Complexity Reduction**: Estimated reduction in domain complexity
- **Maintainability Improvement**: Estimated improvement in maintainability
- **Build Time Impact**: Expected impact on build performance
- **Migration Effort**: Estimated effort required for migration

## Best Practices

### When to Split

Consider splitting when:
- Domain has >30 files
- Complexity score >7
- Multiple developers working on same domain
- Clear functional boundaries exist

### When NOT to Split

Avoid splitting when:
- Domain has <15 files
- Files are tightly coupled
- No clear boundaries exist
- Split would create many cross-dependencies

### Naming Guidelines

- Use kebab-case for all sub-domain names
- Include parent domain name as prefix
- Keep names descriptive but concise
- Avoid technical jargon in names

## Troubleshooting

### Common Issues

1. **Import Resolution Failures**
   - Check file extensions in import statements
   - Verify relative path calculations
   - Ensure target files exist

2. **Circular Dependencies**
   - Identify dependency cycles in graph
   - Extract shared interfaces or utilities
   - Consider dependency injection patterns

3. **Build Failures**
   - Run TypeScript compiler checks
   - Verify all imports are resolved
   - Check for syntax errors

### Debug Mode

Enable verbose logging for debugging:

```bash
npx tsx src/tools/domain-splitting/cli.ts analyze src/neural --verbose
```

## Future Enhancements

- Integration with CI/CD pipelines
- Automated refactoring suggestions
- Performance impact analysis
- Integration with code quality tools
- Support for JavaScript projects
- Visual dependency graphs
- Automated test generation for split domains

## Contributing

When contributing to the domain splitting system:

1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Consider backward compatibility
5. Test with real domain structures

## License

This domain splitting system is part of the claude-code-zen project and follows the same MIT license.