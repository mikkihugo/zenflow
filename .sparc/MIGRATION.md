# SPARC Configuration Migration Guide

## Overview

This guide helps you migrate from the legacy SPARC configuration to the new optimized v2.0 system with batchtools support.

## What's New in v2.0

### Major Enhancements
- **Batch Operations**: Full integration with BatchTools for parallel and orchestrated execution
- **Performance Optimization**: Connection pooling, caching, and async processing
- **Multi-Agent Coordination**: New swarm mode for complex distributed tasks
- **Enhanced Monitoring**: Real-time metrics and performance tracking
- **Improved Error Handling**: Configurable error handling strategies
- **Mode Grouping**: Logical organization of related modes

### New Features
- Intelligent caching with TTL
- Connection pooling for efficient API usage
- Async file operations
- Resource monitoring and limits
- Boomerang pattern support
- Dependency-aware task execution
- A/B testing capabilities
- Progressive enhancement workflows

## Migration Steps

### 1. Backup Current Configuration
```bash
# Backup existing configuration
cp .roomodes .roomodes.backup
cp -r .roo .roo.backup 2>/dev/null || echo "No .roo directory found"
```

### 2. Configuration Structure Changes

#### Old Structure (v1.x)
```json
{
  "customModes": [
    {
      "slug": "architect",
      "name": "🏗️ Architect",
      "roleDefinition": "...",
      "customInstructions": "...",
      "groups": ["read", "edit"],
      "source": "project"
    }
  ]
}
```

#### New Structure (v2.0)
```json
{
  "version": "2.0",
  "metadata": { /* optimization status */ },
  "globalConfig": { /* default settings */ },
  "modeGroups": { /* logical groupings */ },
  "customModes": [
    {
      "slug": "architect",
      "name": "🏗️ Architect",
      "roleDefinition": "...",
      "customInstructions": "...",
      "groups": ["read", "edit"],
      "source": "project",
      "optimization": { /* new optimization settings */ },
      "tools": { /* enhanced tool definitions */ },
      "batchOperations": { /* batch support */ },
      "tags": [ /* searchable tags */ ]
    }
  ],
  "executors": { /* execution engine configurations */ },
  "batchToolsIntegration": { /* BatchTools settings */ },
  "compatibilityLayer": { /* backward compatibility */ }
}
```

### 3. Mode Enhancements

All existing modes are enhanced with:

#### Optimization Settings
```json
{
  "optimization": {
    "batchable": true,
    "cacheable": true,
    "parallelizable": true,
    "priority": "high",
    "resourceLimits": {
      "maxTokens": 8192,
      "maxExecutionTime": 300000
    }
  }
}
```

#### Tool Definitions
```json
{
  "tools": {
    "required": ["read", "edit"],
    "optional": ["browser", "mcp"],
    "customTools": ["specific-tool-name"]
  }
}
```

#### Batch Operations (where applicable)
```json
{
  "batchOperations": {
    "supportedPatterns": ["parallel-files", "sequential-modules"],
    "maxBatchSize": 10,
    "errorHandling": "continue-on-error"
  }
}
```

### 4. New Modes Added

#### Swarm Coordinator
```json
{
  "slug": "swarm",
  "name": "🤖 Swarm Coordinator",
  "roleDefinition": "Multi-agent coordination for complex tasks",
  "swarmConfig": {
    "executionModes": ["parallel", "sequential", "adaptive"],
    "agentTypes": ["researcher", "developer", "analyzer"],
    "coordinationStrategies": ["capability-based", "load-balanced"]
  }
}
```

### 5. Executor Configuration

New execution engines available:

```json
{
  "executors": {
    "optimized": {
      "name": "Optimized Executor",
      "class": "OptimizedExecutor",
      "config": {
        "connectionPool": { "min": 2, "max": 10 },
        "concurrency": 10,
        "caching": { "enabled": true, "ttl": 3600000 }
      }
    }
  }
}
```

## Compatibility Notes

### Full Backward Compatibility
- All existing mode slugs remain unchanged
- Original functionality preserved
- Existing workflows continue to work
- No breaking changes to public APIs

### Enhanced Functionality
- Modes now support batch operations
- Performance optimizations are automatic
- Caching improves response times
- Monitoring provides better insights

## Testing Migration

### 1. Verify Configuration
```bash
# Test configuration validity
python3 -m json.tool .roomodes > /dev/null && echo "✅ Valid JSON"

# List available modes
npx claude-flow sparc modes

# Test specific mode
npx claude-flow sparc info architect
```

### 2. Test Batch Operations
```bash
# Test parallel execution
batchtool run --parallel \
  "npx claude-flow sparc run ask 'test query 1' --non-interactive" \
  "npx claude-flow sparc run ask 'test query 2' --non-interactive"

# Test boomerang pattern
batchtool orchestrate --boomerang \
  --phase1 "npx claude-flow sparc run spec-pseudocode 'simple test' --non-interactive" \
  --phase2 "npx claude-flow sparc run architect 'design test' --non-interactive"
```

### 3. Performance Testing
```bash
# Monitor performance
npx claude-flow metrics

# Check cache effectiveness
npx claude-flow cache stats

# View execution history
npx claude-flow history
```

## Common Migration Issues

### 1. JSON Syntax Errors
**Problem**: Invalid JSON structure
**Solution**: Use `python3 -m json.tool .roomodes` to validate

### 2. Missing Dependencies
**Problem**: BatchTools not available
**Solution**: Install BatchTools: `npm install -g batchtool`

### 3. Resource Limits
**Problem**: Execution timeouts or memory issues
**Solution**: Adjust resource limits in mode configurations

### 4. Cache Issues
**Problem**: Stale cached results
**Solution**: Clear cache: `npx claude-flow cache clear`

## Feature Adoption Strategy

### Phase 1: Basic Migration
1. Update to v2.0 configuration
2. Test existing workflows
3. Verify all modes work correctly

### Phase 2: Optimization Features
1. Enable caching for frequently used modes
2. Configure connection pooling
3. Set appropriate resource limits

### Phase 3: Batch Operations
1. Identify parallelizable workflows
2. Implement batch operations
3. Use boomerang pattern for iterative work

### Phase 4: Advanced Features
1. Deploy swarm mode for complex tasks
2. Implement monitoring dashboards
3. Optimize based on metrics

## Performance Improvements

Expected improvements after migration:

### Response Times
- **Caching**: 50-80% faster for repeated operations
- **Connection Pooling**: 20-40% faster API calls
- **Parallel Execution**: 60-90% faster for batch operations

### Resource Efficiency
- **Memory Usage**: 30-50% reduction through pooling
- **Network Overhead**: 40-60% reduction through caching
- **CPU Utilization**: Better distribution through async processing

### Reliability
- **Error Recovery**: Automatic retry with backoff
- **Failure Isolation**: Better error handling
- **Monitoring**: Real-time health checks

## Rollback Plan

If issues occur, rollback procedure:

```bash
# 1. Stop any running processes
pkill -f "claude-flow"

# 2. Restore backup
mv .roomodes.backup .roomodes
mv .roo.backup .roo 2>/dev/null || true

# 3. Clear cache
rm -rf .sparc/cache 2>/dev/null || true

# 4. Restart services
npx claude-flow restart
```

## Support and Troubleshooting

### Log Files
- Configuration logs: `.sparc/logs/config.log`
- Execution logs: `.sparc/logs/execution.log`
- Error logs: `.sparc/logs/error.log`

### Debug Commands
```bash
# Verbose mode information
npx claude-flow sparc info <mode> --verbose

# System diagnostics
npx claude-flow diagnose

# Performance analysis
npx claude-flow analyze performance

# Configuration validation
npx claude-flow validate config
```

### Getting Help
1. Check logs for error details
2. Verify configuration with validation tools
3. Test with minimal examples
4. Consult the main README.md
5. Submit issues with configuration details

## Post-Migration Checklist

- [ ] Configuration validates successfully
- [ ] All existing modes work correctly
- [ ] Batch operations functional
- [ ] Caching provides performance benefits
- [ ] Monitoring data is collected
- [ ] Error handling works as expected
- [ ] Rollback procedure tested
- [ ] Team trained on new features
- [ ] Documentation updated
- [ ] Performance benchmarks established

## Next Steps

After successful migration:

1. **Monitor Performance**: Track improvements and identify bottlenecks
2. **Optimize Workflows**: Convert suitable tasks to batch operations
3. **Explore New Features**: Experiment with swarm mode and advanced patterns
4. **Fine-tune Configuration**: Adjust based on usage patterns
5. **Train Team**: Ensure everyone understands new capabilities
6. **Plan Advanced Usage**: Design complex workflows using new features

The migration to v2.0 provides significant performance improvements and new capabilities while maintaining full backward compatibility with existing workflows.