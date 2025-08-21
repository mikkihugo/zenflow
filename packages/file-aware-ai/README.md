# File-Aware AI Integration

This package integrates **CodeMesh** - a sophisticated TypeScript + Rust hybrid system that provides enterprise-grade file-aware AI capabilities for claude-code-zen.

## Architecture

CodeMesh provides the perfect foundation for file-aware AI by combining:

### 🦀 **Rust Core** (`rust-core/`)
- **High-Performance Engine**: Rust-based core for maximum performance
- **Multi-LLM Support**: GitHub Copilot, Anthropic Claude, OpenAI GPT, Google Gemini
- **Tool System**: 15+ built-in tools (read, write, edit, grep, bash, etc.)
- **Session Management**: SQLite-backed persistent conversations
- **Security**: OAuth 2.0 + PKCE, encrypted credential storage, permission system

### 🔧 **TypeScript Core** (`typescript-core/`)
- **OpenCode Compatibility**: Direct integration with existing TypeScript tooling
- **Rich CLI/TUI**: Terminal user interface with syntax highlighting
- **Tool Implementations**: Comprehensive file operations and web tools
- **Session Persistence**: Advanced context management

## Integration with claude-code-zen

### LLM Provider Integration
```typescript
// CodeMesh providers integrate directly with our LLM routing
import { GitHubCopilotProvider } from '@code-mesh/core';
import { LLM_PROVIDER_CONFIG } from '@claude-zen/llm-routing';

// Enhanced provider with file-aware capabilities
LLM_PROVIDER_CONFIG.codeMeshCopilot = {
  provider: new GitHubCopilotProvider({
    apiKey: process.env.GITHUB_TOKEN,
    baseUrl: 'https://api.githubcopilot.com'
  }),
  capabilities: ['fileAware', 'toolCalling', 'codebaseContext'],
  models: ['gpt-5', 'o3', 'o4-mini', 'claude-opus-4']
};
```

### File-Aware Engine
```typescript
// Use CodeMesh's sophisticated file analysis
import { FileAwareAIEngine, CodebaseAnalyzer } from '@code-mesh/core';

const engine = new FileAwareAIEngine(process.cwd(), {
  indexing: { 
    enabled: true,
    supportedLanguages: ['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go']
  },
  context: {
    defaultStrategy: 'smart',
    maxContextSize: 50
  }
});

// Intelligent codebase analysis with dependency mapping
await engine.initialize();
const result = await engine.processRequest({
  task: "Add error handling to authentication system",
  files: ["src/auth/*.ts"],
  options: { dryRun: false }
});
```

### Tool Integration
```typescript
// Rich tool ecosystem for file operations
import { ToolRegistry } from '@code-mesh/core';

const tools = new ToolRegistry();
tools.register('read', new ReadTool());
tools.register('write', new WriteTool());
tools.register('edit', new EditTool());
tools.register('grep', new GrepTool());
tools.register('bash', new BashTool());

// AI agents can use tools for codebase manipulation
const context = new ToolContext({ workingDirectory: process.cwd() });
const fileContent = await tools.execute('read', { filePath: 'src/main.ts' }, context);
```

## Benefits Over Building From Scratch

1. **Production Ready**: Comprehensive tool implementations, error handling, security
2. **Performance Optimized**: Rust core with WebAssembly compilation
3. **Enterprise Security**: AES-256 encryption, OAuth flows, permission system
4. **Extensible**: Clear plugin architecture for custom tools
5. **Battle Tested**: Based on proven OpenCode architecture

## Usage

### Basic File-Aware AI Request
```typescript
import { createFileAwareAI } from '@claude-zen/file-aware-ai';

const ai = await createFileAwareAI({
  provider: 'codeMeshCopilot',
  model: 'gpt-5',
  rootPath: process.cwd()
});

const result = await ai.processRequest({
  task: "Refactor the authentication system to use modern patterns",
  context: { maxFiles: 20 }
});

console.log(`Modified ${result.changes.length} files`);
result.changes.forEach(change => {
  console.log(`${change.type}: ${change.path}`);
  console.log(`Reasoning: ${change.reasoning}`);
});
```

### Advanced Context Management
```typescript
// Intelligent file selection based on task analysis
const context = await ai.analyzer.getRelevantContext(
  "Add unit tests for payment processing",
  ["src/payments/*.ts"],
  25 // max files
);

console.log(`Found ${context.relevantFiles.length} relevant files`);
console.log(`Dependencies: ${context.dependencies.length}`);
console.log(`Complexity: ${context.complexity}`);
```

## Next Steps

1. **Integration Bridge**: Connect CodeMesh to claude-code-zen LLM routing
2. **TypeScript Bindings**: Create seamless TypeScript integration layer
3. **Tool Extensions**: Add claude-code-zen specific tools
4. **Testing**: Comprehensive integration testing with GitHub Copilot GPT-5

This integration provides enterprise-grade file-aware AI capabilities immediately, rather than spending months building from scratch.