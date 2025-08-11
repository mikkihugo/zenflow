# Dead Code Detection Tools for Claude Zen

## 🚀 **Top Recommended NPM Packages**

### 1. **knip** (⭐️ Best Overall)
```bash
npm install -D knip
```
- **Features**: Finds unused files, dependencies, exports, types, and more
- **TypeScript Support**: Excellent
- **Configuration**: Zero-config for most projects
- **Performance**: Very fast
- **Usage**: `npx knip`

### 2. **ts-prune** (⭐️ Best for TypeScript exports)
```bash
npm install -D ts-prune
```
- **Features**: Finds unused exports in TypeScript projects
- **Usage**: `npx ts-prune`
- **Output**: Clean, actionable results

### 3. **unimported** (⭐️ Best for unused files)
```bash
npm install -D unimported
```
- **Features**: Finds unimported files and unused dependencies
- **Usage**: `npx unimported`

### 4. **depcheck** (⭐️ Best for unused dependencies)
```bash
npm install -D depcheck
```
- **Features**: Finds unused and missing dependencies
- **Usage**: `npx depcheck`

### 5. **eslint-plugin-unused-imports** (⭐️ Best for development)
```bash
npm install -D eslint-plugin-unused-imports
```
- **Features**: ESLint plugin to detect unused imports
- **Integration**: Works with existing ESLint setup

## 🔧 **Recommended Setup for Claude Zen**

### Package.json Scripts
```json
{
  "scripts": {
    "dead-code": "knip",
    "dead-code:exports": "ts-prune",
    "dead-code:files": "unimported",
    "dead-code:deps": "depcheck",
    "dead-code:full": "npm run dead-code && npm run dead-code:exports && npm run dead-code:files && npm run dead-code:deps"
  }
}
```

### ESLint Integration
```javascript
// eslint.config.js
export default [
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'warn'
    }
  }
];
```

## 🤖 **Automated Dead Code Detection in Claude Zen**

### Phase 1: Detection
- **Weekly scans**: Automated dead code detection
- **PR integration**: Check for new dead code in PRs
- **Metrics tracking**: Monitor dead code trends

### Phase 2: Analysis
- **Impact assessment**: Analyze what dead code affects
- **Safety scoring**: Rate removal safety (high/medium/low)
- **Dependency mapping**: Understand interconnections

### Phase 3: Human Decision Loop
- **Interactive prompts**: Ask user about each dead code item
- **Batch operations**: Group similar items for efficiency
- **Approval gates**: Require confirmation for risky removals

### Implementation Strategy
```typescript
class AutomatedDeadCodeManager {
  async scanForDeadCode() {
    // Use multiple tools for comprehensive detection
    const knipResults = await runKnip();
    const tsPruneResults = await runTsPrune();
    const unimportedResults = await runUnimported();
    
    // Merge and deduplicate results
    return this.mergeResults([knipResults, tsPruneResults, unimportedResults]);
  }
  
  async presentToHuman(deadCodeItems) {
    // Interactive CLI for decision making
    for (const item of deadCodeItems) {
      const decision = await this.askHuman({
        type: 'dead-code-action',
        item: item,
        options: ['remove', 'keep', 'investigate', 'skip'],
        context: this.analyzeContext(item)
      });
      
      await this.executeDecision(item, decision);
    }
  }
}
```