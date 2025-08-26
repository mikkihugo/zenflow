# Naming Conventions

This repository follows consistent naming conventions to maintain code quality and readability.

## File and Directory Naming

All files and directories use **kebab-case**:

```
✅ Correct:
advanced-cli-engine.ts
web-socket-manager.ts
command-execution-renderer.tsx

❌ Incorrect:
AdvancedCLIEngine.ts
WebSocketManager.ts
CommandExecutionRenderer.tsx
```

## TypeScript Naming Conventions

Following Google TypeScript Style Guide:

- **Interfaces**: PascalCase (`interface SwarmCoordinator {}`)
- **Classes**: PascalCase (`class LoadBalancingEngine {}`)
- **Functions/Methods**: camelCase (`coordinateSwarm()`)
- **Variables**: camelCase (`const swarmManager = ...`)
- **Constants**: SCREAMING_SNAKE_CASE (`const MAX_AGENTS = 1000`)
- **Types**: PascalCase (`type Strategy = ...`)

## Recent Changes

All non-compliant files have been renamed to kebab-case:

- 25 files renamed from PascalCase to kebab-case
- 60 import paths updated automatically
- All TypeScript files now follow consistent naming

The codebase now maintains 100% compliance with kebab-case file naming conventions.
