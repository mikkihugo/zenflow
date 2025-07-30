/**
 * Critical Fixes Template - For Claude Flow Init
 * Includes timeout protection, GitHub CLI safety, and dynamic agent loading
 */

export const criticalFixesTemplate = `# Critical System Fixes Applied

This Claude Flow project includes critical upstream fixes that prevent commonissues = await TimeoutProtection.checkRuvSwarmAvailableWithTimeout();

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
const result = await GitHubCliSafe.createPullRequestSafe({title = await GitHubCliSafe.execGhSafe(['repo', 'view'], {timeout = await agentLoader.getAgentType('analyst'); // Maps to 'code-analyzer'

// List all available agents

// Check agent statistics

console.warn(\`Total = await checkRuvSwarmAvailable();
const result = await execRuvSwarmHook('pre-task', params);

// NEW (timeout protected)

const result = await TimeoutProtection.execRuvSwarmHookWithTimeout('pre-task', params);
\`\`\`

### For GitHub Operations
Replace direct ghcommands = execSync(\`gh pr create --title "\${title}" --body "\${body}"\`);

// NEW (safe)
const result = await GitHubCliSafe.createPullRequestSafe({ title, body });
\`\`\`

### For Agent Management
Update agentspawning = == 'analyst') { /* spawn analyst */ }

// NEW (handles legacy mapping)
const agentTypeInfo = await agentLoader.getAgentType('analyst'); // Returns code-analyzer
if(agentTypeInfo) { /* spawn agent using agentTypeInfo */ }
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
