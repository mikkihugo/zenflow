/**
 * @fileoverview Claude Code SDK v1.0.82 Features Demonstration
 * 
 * This file demonstrates all the enhanced features added to support Claude Code v1.0.82:
 * - Request cancellation support
 * - Additional directories for custom path searching
 * - Improved slash command processing
 * - Session support and permission denial tracking
 * - Enhanced task management
 * 
 * @author Claude Code Zen Team
 * @version 1.0.82
 */

import {
  ClaudeTaskManager,
  SlashCommandProcessor,
  DirectorySearchHelper,
  SessionManager,
  globalClaudeTaskManager,
  globalSlashCommandProcessor,
  globalDirectorySearchHelper,
  globalSessionManager,
  type ClaudeSDKOptions,
} from '../src/integrations/claude-code/sdk-integration';

// Example 1: Request Cancellation Support
async function demonstrateCancellation() {
  console.log('🛑 Demonstration: Request Cancellation Support');
  
  // Create an AbortController for cancellation
  const abortController = new AbortController();
  let wasCancelled = false;
  
  const options: ClaudeSDKOptions = {
    abortController,
    timeoutMs: 5000, // 5 second timeout
    onCancel: () => {
      wasCancelled = true;
      console.log('✅ Task was successfully cancelled');
    },
    sessionId: 'demo-session-1',
  };
  
  // Simulate cancelling after 1 second
  setTimeout(() => {
    console.log('⏰ Triggering cancellation...');
    abortController.abort();
  }, 1000);
  
  console.log('Options configured:', {
    hasAbortController: !!options.abortController,
    timeoutMs: options.timeoutMs,
    sessionId: options.sessionId,
  });
}

// Example 2: Additional Directories Support
function demonstrateAdditionalDirectories() {
  console.log('\n📁 Demonstration: Additional Directories Support');
  
  const helper = new DirectorySearchHelper([
    '/project/src',
    '/project/libs'
  ]);
  
  // Add more search directories
  helper.addDirectory('/project/tests');
  helper.addDirectory('/project/docs');
  
  console.log('✅ Search paths configured:', helper.getSearchPaths());
  
  // Demonstrate expanding search scope
  const baseSearchPaths = ['/home/user/code'];
  const expandedPaths = helper.expandSearchScope(baseSearchPaths);
  
  console.log('✅ Expanded search scope:', expandedPaths);
  
  // Configure for Claude Code SDK
  const options: ClaudeSDKOptions = {
    additionalDirectories: helper.getSearchPaths(),
    sessionId: 'demo-session-2',
  };
  
  console.log('✅ SDK options with additional directories:', {
    additionalDirectories: options.additionalDirectories?.length,
    paths: options.additionalDirectories,
  });
}

// Example 3: Enhanced Slash Command Processing
function demonstrateSlashCommands() {
  console.log('\n⚡ Demonstration: Enhanced Slash Command Processing');
  
  const processor = new SlashCommandProcessor({
    'build': 'npm run build && npm run lint',
    'test': 'npm test -- --coverage',
    'deploy': 'npm run build && npm run deploy:prod',
  });
  
  // Add custom commands dynamically
  processor.addCustomCommand('dev', 'npm run dev');
  processor.addCustomCommand('clean', 'rm -rf dist/ && rm -rf node_modules/');
  
  console.log('✅ Available slash commands:', processor.getAvailableCommands());
  
  // Process a prompt with slash commands
  const prompt = 'Please /clean the project, then /build it and /test everything';
  const processedPrompt = processor.processSlashCommands(prompt);
  
  console.log('✅ Original prompt:', prompt);
  console.log('✅ Processed prompt:', processedPrompt);
  
  // Demonstrate @-mention support
  const promptWithMentions = 'Process @src/index.ts and @tests/unit.test.js files';
  const processedMentions = processor.processSlashCommands(promptWithMentions);
  
  console.log('✅ @-mention processing:', {
    original: promptWithMentions,
    processed: processedMentions,
  });
}

// Example 4: Session Support and Permission Tracking
function demonstrateSessionManagement() {
  console.log('\n🎬 Demonstration: Session Support and Permission Tracking');
  
  const sessionManager = new SessionManager();
  
  // Create sessions
  const session1 = sessionManager.createSession('manual-session-id');
  const session2 = sessionManager.createSession(); // Auto-generated ID
  
  console.log('✅ Created sessions:', [session1, session2]);
  
  // Update session activity
  sessionManager.updateSessionActivity(session1);
  sessionManager.updateSessionActivity(session1);
  sessionManager.trackPermissionDenial(session1);
  
  sessionManager.updateSessionActivity(session2);
  
  console.log('✅ Session 1 info:', sessionManager.getSession(session1));
  console.log('✅ Session 2 info:', sessionManager.getSession(session2));
  
  // Demonstrate cleanup
  console.log('✅ All sessions before cleanup:', sessionManager.getAllSessions().length);
  
  // Clean up one session
  sessionManager.endSession(session2);
  console.log('✅ All sessions after cleanup:', sessionManager.getAllSessions().length);
  
  return session1; // Return for task manager demo
}

// Example 5: Enhanced Task Manager
async function demonstrateTaskManager(sessionId: string) {
  console.log('\n🚀 Demonstration: Enhanced Task Manager');
  
  const taskManager = new ClaudeTaskManager();
  
  // Track permission denials
  taskManager.trackPermissionDenial(sessionId);
  taskManager.trackPermissionDenial(sessionId);
  taskManager.trackPermissionDenial('other-session');
  
  console.log('✅ Permission denials for session:', taskManager.getPermissionDenials(sessionId));
  console.log('✅ All permission denials:', Array.from(taskManager.getPermissionDenials() as Map<string, number>));
  
  // Demonstrate task metrics
  console.log('✅ Task metrics before any tasks:', taskManager.getTaskMetrics());
  
  // Check active tasks
  console.log('✅ Active tasks:', taskManager.getActiveTasks());
  
  // Demonstrate session cleanup
  taskManager.clearSession('other-session');
  console.log('✅ Permission denials after session cleanup:', Array.from(taskManager.getPermissionDenials() as Map<string, number>));
}

// Example 6: Global Instances Integration
function demonstrateGlobalInstances() {
  console.log('\n🌍 Demonstration: Global Instances Integration');
  
  // Configure global slash command processor
  globalSlashCommandProcessor.addCustomCommand('status', 'git status && npm run lint');
  globalSlashCommandProcessor.addCustomCommand('push', 'git add . && git commit -m "Auto commit" && git push');
  
  console.log('✅ Global slash commands:', globalSlashCommandProcessor.getAvailableCommands());
  
  // Configure global directory helper
  globalDirectorySearchHelper.addDirectory('/global/shared/libs');
  globalDirectorySearchHelper.addDirectory('/global/shared/utils');
  
  console.log('✅ Global search directories:', globalDirectorySearchHelper.getSearchPaths());
  
  // Create a global session
  const globalSession = globalSessionManager.createSession('global-demo-session');
  console.log('✅ Global session created:', globalSession);
  
  // Get global task manager status
  const globalMetrics = globalClaudeTaskManager.getTaskMetrics();
  console.log('✅ Global task manager metrics:', globalMetrics);
  
  return globalSession;
}

// Example 7: Complete SDK Options Configuration
function demonstrateCompleteSDKOptions(sessionId: string) {
  console.log('\n⚙️ Demonstration: Complete SDK Options Configuration');
  
  const abortController = new AbortController();
  const streamCancellationToken = new AbortController();
  
  const options: ClaudeSDKOptions = {
    // v1.0.82 New Features
    additionalDirectories: globalDirectorySearchHelper.getSearchPaths(),
    onCancel: () => console.log('Task cancelled by user'),
    timeoutMs: 30000, // 30 seconds
    sessionId,
    trackPermissionDenials: true,
    enableSlashCommands: true,
    customSlashCommands: {
      'deploy': 'npm run build && npm run deploy',
      'test': 'npm test -- --coverage --watch',
    },
    streamCancellationToken,
    
    // Existing Claude Code SDK Options
    maxTurns: 10,
    workingDir: process.cwd(),
    abortController,
    customSystemPrompt: 'You are Claude Code with v1.0.82 enhancements.',
    appendSystemPrompt: 'Use the new cancellation and directory features.',
    allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'MultiEdit'],
    disallowedTools: ['WebFetch'],
    permissionMode: 'default',
    canUseTool: async (toolName: string, input: Record<string, unknown>) => {
      console.log(`🔧 Permission check for tool: ${toolName}`);
      return toolName !== 'WebFetch'; // Deny WebFetch, allow others
    },
    model: 'sonnet',
    fallbackModel: 'haiku',
    maxThinkingTokens: 10000,
    continue: false,
    resume: undefined,
    mcpServers: {},
    executable: 'node',
    executableArgs: ['--max-old-space-size=4096'],
    stderr: (data: string) => {
      console.log(`📡 SDK stderr: ${data.substring(0, 100)}...`);
    },
  };
  
  console.log('✅ Complete SDK options configured:', {
    hasNewFeatures: !!(
      options.additionalDirectories &&
      options.onCancel &&
      options.timeoutMs &&
      options.sessionId &&
      options.trackPermissionDenials
    ),
    additionalDirectoriesCount: options.additionalDirectories?.length || 0,
    timeoutMs: options.timeoutMs,
    sessionId: options.sessionId,
    customSlashCommandsCount: Object.keys(options.customSlashCommands || {}).length,
  });
  
  return options;
}

// Main demonstration function
async function runClaudeSDK_v1082_Demo() {
  console.log('🎯 Claude Code SDK v1.0.82 Features Demonstration\n');
  console.log('=' .repeat(60));
  
  try {
    // Run all demonstrations
    await demonstrateCancellation();
    demonstrateAdditionalDirectories();
    demonstrateSlashCommands();
    const sessionId = demonstrateSessionManagement();
    await demonstrateTaskManager(sessionId);
    const globalSessionId = demonstrateGlobalInstances();
    const completeOptions = demonstrateCompleteSDKOptions(globalSessionId);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All v1.0.82 features demonstrated successfully!');
    console.log('\nKey improvements:');
    console.log('✅ Request cancellation with timeout and AbortController');
    console.log('✅ Additional directories for expanded file search');
    console.log('✅ Enhanced slash command processing with @-mentions');
    console.log('✅ Session support with permission denial tracking');
    console.log('✅ Enhanced task management with metrics and cleanup');
    console.log('✅ Global instances for application-wide coordination');
    console.log('✅ Complete SDK options integration');
    
    console.log('\n📝 Next steps:');
    console.log('- Integrate with actual Claude Code v1.0.82 when available');
    console.log('- Add more sophisticated file path resolution for @-mentions');
    console.log('- Implement advanced permission policies');
    console.log('- Add telemetry and analytics integration');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up demo resources...');
    globalClaudeTaskManager.abortAllTasks('Demo cleanup');
    globalSessionManager.cleanupInactiveSessions(0); // Clean all
    
    console.log('✅ Demo cleanup completed');
  }
}

// Export for use in other files
export {
  runClaudeSDK_v1082_Demo,
  demonstrateCancellation,
  demonstrateAdditionalDirectories,
  demonstrateSlashCommands,
  demonstrateSessionManagement,
  demonstrateTaskManager,
  demonstrateGlobalInstances,
  demonstrateCompleteSDKOptions,
};

// Run demo if this file is executed directly
if (require.main === module) {
  runClaudeSDK_v1082_Demo().catch(console.error);
}