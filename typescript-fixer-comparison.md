# TypeScript Fixer: Raw CLI vs Foundation SDK

## Current Implementation (Raw Claude CLI)
```javascript
// Direct CLI spawning - NO prompt cleaning
const child = spawn('claude', [
  '--dangerously-skip-permissions',
  '--print',
  '--model', 'sonnet',
  '--add-dir', path.dirname(path.resolve(file)),
  prompt  // ❌ Raw prompt, no validation
], { shell: true });

// Manual stdout/stderr parsing - NO automatic filtering
let stdout = '';
child.stdout.on('data', (data) => {
  stdout += data.toString();
});
```

## If Updated to Use Foundation SDK
```javascript
// Import foundation SDK
import { executeClaudeTask } from '@claude-zen/foundation';

// SDK with built-in validation - ✅ AUTOMATIC prompt cleaning
const result = await executeClaudeTask(prompt, {
  model: 'sonnet',
  additionalDirectories: [path.dirname(path.resolve(file))],
  permissionMode: 'bypassPermissions'
});

// ✅ AUTOMATIC Claude output filtering happens inside SDK
// ✅ Better error handling and timeout management  
// ✅ All the prompt validation we verified
```

## Benefits of Foundation SDK Integration:

✅ **Automatic prompt validation** - prevents problematic prompts
✅ **Claude output filtering** - removes descriptive text from responses  
✅ **Better error handling** - structured error responses
✅ **Timeout management** - configurable timeouts with proper cleanup
✅ **Session management** - tracks tasks and performance
✅ **Retry logic** - automatic retry on transient failures

## Current Status:
- **Foundation SDK**: ✅ Has all the cleaning (verified with proof)
- **TypeScript Fixer**: ❌ Uses raw CLI, misses all the benefits

## Recommendation:
Update the TypeScript fixer to use Foundation SDK to get all the prompt cleaning and validation benefits we just implemented.