# File-Aware AI Integration Plan

## Problem Statement
The removed `singularity-coder` package contained valuable **file-aware AI processing** capabilities that bridged code analysis with AI-driven code generation. These capabilities were lost during the migration to the current `coder` package.

## Solution Architecture

### 1. Two-Package Integration
- **`coder` (Rust)**: AI engine with LLM integration, tool execution, session management
- **`code-analyzer` (TypeScript)**: Static analysis, AST parsing, real-time monitoring

### 2. Bridge Components Created

#### A. Rust AI Engine (`packages/tools/coder/src/ai/`)
- **`file_aware_engine.rs`**: Main AI processing engine
- **Data types**: `FileAwareRequest`, `FileAwareResponse`, `AnalyzedContext`
- **Capabilities**: 
  - Process AI requests with file context
  - Generate code changes based on analysis
  - Bridge with TypeScript analysis via event bus

#### B. TypeScript Analysis Bridge (`packages/tools/code-analyzer/src/file-aware-bridge.ts`)
- **`FileAwareBridge`**: Analysis engine using ts-morph
- **Capabilities**:
  - AST-based code analysis
  - Dependency mapping
  - Symbol extraction
  - Complexity assessment
  - Context synthesis

### 3. Integration Flow

```
User Request
    ↓
Rust FileAwareEngine.process_request()
    ↓
[Event Bus / IPC] → TypeScript FileAwareBridge.analyzeContext()
    ↓                       ↓
[Analysis Results] ← AST Analysis, Dependencies, Symbols
    ↓
Rust LLM Integration (generate_changes)
    ↓
AI-Generated Code Changes
```

## Key Features Restored

### 1. File-Aware AI Processing
- **Context synthesis** from codebase analysis
- **Intelligent file discovery** based on relationships
- **Dependency-aware** code generation
- **Symbol-level** understanding for AI

### 2. Smart Code Analysis
- **AST parsing** with TypeScript/JavaScript support
- **Dependency relationship mapping**
- **Complexity assessment** (low/medium/high)
- **Multi-file context** understanding

### 3. AI-Driven Generation
- **Context-aware** code changes
- **File modification** suggestions
- **Creation/deletion** recommendations
- **Reasoning** for each change

## Implementation Status

### ✅ Completed
- [x] Created Rust `FileAwareEngine` with full type system
- [x] Created TypeScript `FileAwareBridge` with ts-morph integration
- [x] Added AI module to coder package exports
- [x] Added bridge exports to code-analyzer package
- [x] Type-safe interfaces matching between Rust and TypeScript

### 🔄 Next Steps
1. **Event Bus Integration**: Connect Rust ↔ TypeScript communication
2. **LLM Provider Integration**: Wire up actual AI generation in Rust
3. **Testing**: Create integration tests between packages
4. **Performance Optimization**: Optimize analysis for large codebases
5. **WebSocket/IPC**: Implement efficient communication channel

## Usage Examples

### Rust Side (coder package)
```rust
use code_mesh_core::ai::{FileAwareEngine, FileAwareRequest};

let engine = FileAwareEngine::new("/path/to/project".into(), None);
let request = FileAwareRequest {
    task: "Add error handling to API endpoints".to_string(),
    files: Some(vec!["src/api/routes.ts".to_string()]),
    context: None,
    options: None,
};

let response = engine.process_request(request).await?;
println!("Generated {} changes", response.changes.len());
```

### TypeScript Side (code-analyzer package)
```typescript
import { FileAwareBridge } from '@claude-zen/code-analyzer';

const bridge = new FileAwareBridge('/path/to/project');
const context = await bridge.analyzeContext(['src/api/routes.ts'], 50);

if (context.isOk()) {
  console.log(`Found ${context.value.symbols.length} symbols`);
  console.log(`Complexity: ${context.value.complexity}`);
}
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- **Rust**: High-performance AI processing, LLM integration
- **TypeScript**: Rich code analysis, AST manipulation

### 2. **Language Strengths**
- **Rust**: Memory safety, concurrency, performance
- **TypeScript**: Ecosystem integration, ts-morph AST tools

### 3. **Maintainability**
- Clear interfaces between components
- Independent development and testing
- Type safety across language boundaries

### 4. **Extensibility**
- Easy to add new analysis capabilities (TypeScript side)
- Easy to add new AI providers (Rust side)
- Event-driven architecture allows for loose coupling

## Next Phase: Event Bus Integration

The next critical step is implementing efficient communication between the Rust and TypeScript components via the platform's EventBus system, enabling the full file-aware AI processing pipeline.