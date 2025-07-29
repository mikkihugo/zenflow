/**
 * Critical Fixes Template - For Claude Flow Init
 * Includes timeout protection, GitHub CLI safety, and dynamic agent loading
 */

export const criticalFixesTemplate = `# Critical System Fixes Applied

This Claude Flow project includes critical upstream fixes that prevent common issues:

## 1. Hooks Timeout Protection 🛡️

**Problem Solved**: Hooks hanging indefinitely, especially \`npx claude-flow@alpha hooks pre-task\`

**Features Added**:
- 3-second timeout for ruv-swarm availability checks
- 10-second timeout for hook execution
- Force process exit with setTimeout to prevent hanging
- Proper database connection cleanup

**Usage**:
\`\`\`javascript
// Import timeout protection
import TimeoutProtection from './src/utils/timeout-protection.js';

// Use timeout-protected ruv-swarm check
const isAvailable = await TimeoutProtection.checkRuvSwarmAvailableWithTimeout();

// Execute hooks with timeout protection
const result = await TimeoutProtection.execRuvSwarmHookWithTimeout('pre-task', params);

// Setup safe exit handlers
TimeoutProtection.setupSafeExit();
\`\`\`

## 2. GitHub CLI Safety Utilities 🔐

**Problem Solved**: 2-minute timeouts with backticks and command substitution in GitHub CLI operations

**Features Added**:
- Safe handling of special characters (\`, $, ", newlines)
- Temporary file approach for complex content
- Command substitution sanitization
- Repository name validation

**Usage**:
\`\`\`javascript
// Import GitHub CLI safety utilities
import GitHubCliSafe from './src/utils/github-cli-safe.js';

// Create PR safely with special characters
const result = await GitHubCliSafe.createPullRequestSafe({
  title: 'My PR',
  body: 'Content with \`backticks\` and $variables',
  base: 'main',
  head: 'feature-branch'
});

// Execute any GitHub CLI command safely
const output = await GitHubCliSafe.execGhSafe(['repo', 'view'], {
  timeout: 30000
});
\`\`\`

## 3. Dynamic Agent Loading System 🤖

**Problem Solved**: "Agent type not found" errors when using legacy agent names

**Features Added**:
- Dynamic discovery of agent types
- Legacy agent mapping (analyst → code-analyzer, etc.)
- Runtime agent registration
- Built-in + dynamic + legacy agent support

**Usage**:
\`\`\`javascript
// Import agent loader
import { agentLoader } from './src/agents/agent-loader.js';

// Get agent type (handles legacy names)
const agentType = await agentLoader.getAgentType('analyst'); // Maps to 'code-analyzer'

// List all available agents
const allAgents = await agentLoader.getAgentTypes();

// Check agent statistics
const stats = await agentLoader.getStats();
console.log(\`Total: \${stats.total}, Built-in: \${stats.builtin}, Legacy: \${stats.legacy}\`);
\`\`\`

## 4. Template Files Included

The following utility files have been added to your project:

### \`src/utils/timeout-protection.js\`
- TimeoutProtection class with timeout wrappers
- Safe database cleanup
- Force exit functionality
- ruv-swarm availability checking with timeout

### \`src/utils/github-cli-safe.js\`
- GitHubCliSafe class for safe GitHub operations
- Special character escaping
- Temporary file handling
- Command substitution sanitization

### \`src/agents/agent-loader.js\`
- Dynamic agent type discovery
- Legacy mapping support
- Runtime agent registration
- Statistics and capability querying

### \`github-safe.js\` (Helper Template)
- Simplified GitHub safety utilities for your project
- Ready-to-use functions for common GitHub operations

## 5. Testing

A comprehensive test suite validates all fixes:

\`\`\`bash
# Run the test suite
node test-critical-fixes.js
\`\`\`

**Expected Results**:
- ✅ Timeout protection working correctly
- ✅ GitHub CLI safety utilities functioning
- ✅ Dynamic agent loading with legacy support
- ✅ Hook integration without hanging

## 6. Migration Guide

### For Existing Hooks
Replace direct ruv-swarm calls:
\`\`\`javascript
// OLD (can hang)
const isAvailable = await checkRuvSwarmAvailable();
const result = await execRuvSwarmHook('pre-task', params);

// NEW (timeout protected)
const isAvailable = await TimeoutProtection.checkRuvSwarmAvailableWithTimeout();
const result = await TimeoutProtection.execRuvSwarmHookWithTimeout('pre-task', params);
\`\`\`

### For GitHub Operations
Replace direct gh commands:
\`\`\`javascript
// OLD (vulnerable to injection)
const result = execSync(\`gh pr create --title "\${title}" --body "\${body}"\`);

// NEW (safe)
const result = await GitHubCliSafe.createPullRequestSafe({ title, body });
\`\`\`

### For Agent Management
Update agent spawning:
\`\`\`javascript
// OLD (can fail with "Agent type not found")
if (agentType === 'analyst') { /* spawn analyst */ }

// NEW (handles legacy mapping)
const agentTypeInfo = await agentLoader.getAgentType('analyst'); // Returns code-analyzer
if (agentTypeInfo) { /* spawn agent using agentTypeInfo */ }
\`\`\`

## 7. Backward Compatibility

All changes are backward compatible:
- Existing hook calls continue to work
- Legacy agent names are automatically mapped
- GitHub CLI operations are enhanced, not replaced
- No breaking changes to existing APIs

## 8. Performance Impact

- **Positive**: Prevents hanging processes that consume resources
- **Minimal**: Timeout checks add < 1ms overhead
- **Safe**: Force exit prevents zombie processes
- **Efficient**: Agent loading is cached after initialization

---

**🎯 These fixes address the critical upstream issues from commits:**
- 43ab723d + 3dfd2ee1: Hooks timeout protection
- 958f5910 + f4107494: GitHub CLI safety utilities  
- 00dd0094: Dynamic agent loading system

Your Claude Flow project is now protected against hanging processes and common injection vulnerabilities! 🚀
`;

export default criticalFixesTemplate;