# Package Reorganization Plan: Remove Facades

## Current Issues
- Complex 3-tier facade system adds unnecessary complexity
- Facades abstract away direct package usage
- Multiple import paths for same functionality
- Hard to understand actual dependencies

## New Simplified Structure

### 1. `/packages/core/` - Essential Foundation
**Direct imports, no facades**
```
foundation/          (utilities, logging, types)
database/           (data storage)
memory/            (memory management) 
event-system/      (events)
```

### 2. `/packages/services/` - Business Logic
**Direct package imports**
```
brain/             (AI coordination)
knowledge/         (knowledge management)
taskmaster/        (task management)
safe-framework/    (safety)
workflows/         (workflow engine)
```

### 3. `/packages/tools/` - Development Utilities  
**Standalone packages**
```
code-analyzer/     (code analysis)
git-operations/    (git tools)
repo-analyzer/     (repository analysis)
```

### 4. `/packages/integrations/` - External Systems
**External service adapters**
```
llm-providers/     (LLM integrations)
otel-collector/    (telemetry)
```

## Migration Plan

### Phase 1: Remove Facade Layer
1. **Delete facade packages**: `public-api/`, facade directories
2. **Update imports**: Replace facade calls with direct package imports
3. **Simplify dependencies**: Direct package-to-package dependencies

### Phase 2: Reorganize Package Structure
1. **Move packages** to new directory structure
2. **Update package.json** files with new names
3. **Update import statements** throughout codebase
4. **Update workspace configuration**

### Phase 3: Clean Dependencies
1. **Remove unused packages**
2. **Consolidate related functionality**
3. **Optimize package interdependencies**

## Benefits
- **Clearer dependencies**: Direct imports show real dependencies
- **Easier navigation**: Logical grouping by function
- **Reduced complexity**: No facade abstraction layer
- **Better performance**: No facade overhead
- **Simpler maintenance**: Direct package relationships