// session-command.js - Modern session management system with cross-session memory integration
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { EnhancedMemory } from '../../memory/enhanced-memory.js';

// Session storage paths
const SESSION_BASE_DIR = path.join(process.cwd(), '.claude-sessions');
const ACTIVE_SESSIONS_FILE = path.join(SESSION_BASE_DIR, 'active-sessions.json');
const SESSION_HISTORY_FILE = path.join(SESSION_BASE_DIR, 'session-history.json');

// Session states
const SESSION_STATES = {
  ACTIVE: 'active',
  PAUSED: 'paused', 
  COMPLETED: 'completed',
  FAILED: 'failed',
  ARCHIVED: 'archived'
};

// Memory integration
let memoryStore = null;

/**
 * Initialize session storage directories and memory store
 */
async function initializeSessionStorage() {
  try {
    if (!existsSync(SESSION_BASE_DIR)) {
      mkdirSync(SESSION_BASE_DIR, { recursive: true });
    }

    // Initialize memory store for cross-session persistence
    if (!memoryStore) {
      memoryStore = new EnhancedMemory({
        directory: SESSION_BASE_DIR,
        namespace: 'sessions'
      });
      await memoryStore.initialize();
    }
  } catch (error) {
    printWarning(`Failed to initialize session storage: ${error.message}`);
  }
}

/**
 * Load active sessions data
 */
async function loadActiveSessions() {
  try {
    if (existsSync(ACTIVE_SESSIONS_FILE)) {
      const content = await fs.readFile(ACTIVE_SESSIONS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    printWarning(`Failed to load active sessions: ${error.message}`);
  }
  return {};
}

/**
 * Save active sessions data
 */
async function saveActiveSessions(sessions) {
  try {
    await fs.writeFile(ACTIVE_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (error) {
    printError(`Failed to save active sessions: ${error.message}`);
  }
}

/**
 * Load session history
 */
async function loadSessionHistory() {
  try {
    if (existsSync(SESSION_HISTORY_FILE)) {
      const content = await fs.readFile(SESSION_HISTORY_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    printWarning(`Failed to load session history: ${error.message}`);
  }
  return [];
}

/**
 * Save session to history
 */
async function saveToHistory(sessionData) {
  try {
    const history = await loadSessionHistory();
    history.unshift(sessionData);
    
    // Keep only last 100 sessions in history
    if (history.length > 100) {
      history.splice(100);
    }
    
    await fs.writeFile(SESSION_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    printError(`Failed to save to history: ${error.message}`);
  }
}

/**
 * Generate unique session ID
 */
function generateSessionId(name) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `session-${safeName}-${timestamp}-${random}`;
}

/**
 * Get current session context
 */
async function getCurrentContext() {
  const context = {
    timestamp: Date.now(),
    workingDirectory: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      USER: process.env.USER || process.env.USERNAME,
      HOME: process.env.HOME || process.env.USERPROFILE
    }
  };

  // Try to get git branch if available
  try {
    const { spawn } = await import('child_process');
    const gitProcess = spawn('git', ['branch', '--show-current'], { cwd: process.cwd() });
    
    let gitBranch = '';
    gitProcess.stdout.on('data', (data) => {
      gitBranch += data.toString().trim();
    });
    
    await new Promise((resolve) => {
      gitProcess.on('close', () => resolve());
    });
    
    if (gitBranch) {
      context.gitBranch = gitBranch;
    }
  } catch (error) {
    // Git not available or not a git repo
  }

  return context;
}

/**
 * Create a new session
 */
async function createSession(args, flags) {
  await initializeSessionStorage();
  
  const sessionName = args[0];
  if (!sessionName) {
    printError('Usage: session create <name> [description]');
    return;
  }

  const description = args.slice(1).join(' ') || 'No description provided';
  const sessionId = generateSessionId(sessionName);
  
  try {
    const context = await getCurrentContext();
    const sessionData = {
      id: sessionId,
      name: sessionName,
      description: description,
      state: SESSION_STATES.ACTIVE,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      context: context,
      metadata: {
        flags: flags,
        createdBy: 'session-command',
        version: '1.0.0'
      },
      activities: [],
      checkpoints: [],
      memory: {}
    };

    // Save to active sessions
    const activeSessions = await loadActiveSessions();
    activeSessions[sessionId] = sessionData;
    await saveActiveSessions(activeSessions);

    // Store in memory for cross-session access
    if (memoryStore) {
      await memoryStore.saveSessionState(sessionId, {
        userId: context.environment.USER,
        projectPath: context.workingDirectory,
        activeBranch: context.gitBranch || 'unknown',
        state: SESSION_STATES.ACTIVE,
        context: context
      });
    }

    printSuccess(`✅ Session created successfully!`);
    console.log(`🆔 Session ID: ${sessionId}`);
    console.log(`📛 Name: ${sessionName}`);
    console.log(`📝 Description: ${description}`);
    console.log(`📍 Working Directory: ${context.workingDirectory}`);
    if (context.gitBranch) {
      console.log(`🌿 Git Branch: ${context.gitBranch}`);
    }
    console.log(`⏰ Created: ${sessionData.created}`);
    
  } catch (error) {
    printError(`Failed to create session: ${error.message}`);
  }
}

/**
 * List all sessions
 */
async function listSessions(args, flags) {
  await initializeSessionStorage();
  
  try {
    const activeSessions = await loadActiveSessions();
    const sessionIds = Object.keys(activeSessions);
    
    if (sessionIds.length === 0) {
      printInfo('No active sessions found.');
      return;
    }

    printSuccess(`📋 Found ${sessionIds.length} session(s):`);
    console.log();
    
    // Sort by creation date (newest first)
    const sortedSessions = sessionIds
      .map(id => activeSessions[id])
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    for (const session of sortedSessions) {
      const stateIcon = getStateIcon(session.state);
      const timeAgo = getTimeAgo(new Date(session.updated));
      
      console.log(`${stateIcon} ${session.name} (${session.id.substring(0, 16)}...)`);
      console.log(`   📝 ${session.description}`);
      console.log(`   📍 ${session.context.workingDirectory}`);
      if (session.context.gitBranch) {
        console.log(`   🌿 ${session.context.gitBranch}`);
      }
      console.log(`   ⏰ ${timeAgo} - ${session.state}`);
      console.log(`   📊 ${session.activities.length} activities, ${session.checkpoints.length} checkpoints`);
      console.log();
    }

    if (flags.verbose && memoryStore) {
      try {
        const memorySessions = await memoryStore.getActiveSessions();
        console.log(`💾 Memory store sessions: ${memorySessions.length}`);
      } catch (error) {
        // Memory store might not be available
      }
    }
    
  } catch (error) {
    printError(`Failed to list sessions: ${error.message}`);
  }
}

/**
 * Restore a previous session
 */
async function restoreSession(args, flags) {
  await initializeSessionStorage();
  
  const sessionId = args[0];
  if (!sessionId) {
    printError('Usage: session restore <session-id>');
    return;
  }

  try {
    const activeSessions = await loadActiveSessions();
    let sessionData = null;
    
    // Try exact match first
    if (activeSessions[sessionId]) {
      sessionData = activeSessions[sessionId];
    } else {
      // Try partial match
      const matchingIds = Object.keys(activeSessions).filter(id => 
        id.includes(sessionId) || activeSessions[id].name.includes(sessionId)
      );
      
      if (matchingIds.length === 0) {
        printError(`Session '${sessionId}' not found.`);
        printInfo('Use "session list" to see available sessions.');
        return;
      } else if (matchingIds.length > 1) {
        printError(`Multiple sessions match '${sessionId}'. Please be more specific:`);
        matchingIds.forEach(id => {
          console.log(`  - ${activeSessions[id].name} (${id.substring(0, 16)}...)`);
        });
        return;
      } else {
        sessionData = activeSessions[matchingIds[0]];
        sessionId = matchingIds[0];
      }
    }

    // Update session state
    sessionData.state = SESSION_STATES.ACTIVE;
    sessionData.updated = new Date().toISOString();
    sessionData.activities.push({
      type: 'session_restored',
      timestamp: new Date().toISOString(),
      details: { restoredBy: 'session-command' }
    });

    // Update active sessions
    activeSessions[sessionId] = sessionData;
    await saveActiveSessions(activeSessions);

    // Restore in memory store
    if (memoryStore) {
      const memorySession = await memoryStore.resumeSession(sessionId);
      if (memorySession) {
        printInfo('💾 Session state restored from memory store');
      }
    }

    printSuccess(`✅ Session restored successfully!`);
    console.log(`🆔 Session ID: ${sessionId}`);
    console.log(`📛 Name: ${sessionData.name}`);
    console.log(`📝 Description: ${sessionData.description}`);
    console.log(`📍 Working Directory: ${sessionData.context.workingDirectory}`);
    if (sessionData.context.gitBranch) {
      console.log(`🌿 Git Branch: ${sessionData.context.gitBranch}`);
    }
    console.log(`⏰ Last Updated: ${sessionData.updated}`);
    console.log(`📊 Activities: ${sessionData.activities.length}, Checkpoints: ${sessionData.checkpoints.length}`);
    
    if (flags.verbose) {
      console.log('\n📋 Recent activities:');
      const recentActivities = sessionData.activities.slice(-5);
      recentActivities.forEach(activity => {
        console.log(`   ${activity.timestamp} - ${activity.type}`);
      });
    }

  } catch (error) {
    printError(`Failed to restore session: ${error.message}`);
  }
}

/**
 * Save current session state
 */
async function saveSession(args, flags) {
  await initializeSessionStorage();
  
  const sessionId = args[0];
  if (!sessionId) {
    // Try to find active session in current directory
    const activeSessions = await loadActiveSessions();
    const currentDir = process.cwd();
    const matchingSessions = Object.values(activeSessions).filter(session => 
      session.context.workingDirectory === currentDir && session.state === SESSION_STATES.ACTIVE
    );
    
    if (matchingSessions.length === 0) {
      printError('No active session found in current directory.');
      printInfo('Usage: session save [session-id] or run from session directory');
      return;
    } else if (matchingSessions.length > 1) {
      printError('Multiple active sessions found. Please specify session ID:');
      matchingSessions.forEach(session => {
        console.log(`  - ${session.name} (${session.id.substring(0, 16)}...)`);
      });
      return;
    }
    
    sessionId = matchingSessions[0].id;
  }

  try {
    const activeSessions = await loadActiveSessions();
    const sessionData = activeSessions[sessionId];
    
    if (!sessionData) {
      printError(`Session '${sessionId}' not found.`);
      return;
    }

    // Create checkpoint
    const checkpoint = {
      id: `checkpoint-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      context: await getCurrentContext(),
      message: args.slice(1).join(' ') || 'Manual save checkpoint',
      type: 'manual'
    };

    sessionData.checkpoints.push(checkpoint);
    sessionData.updated = new Date().toISOString();
    sessionData.activities.push({
      type: 'checkpoint_created',
      timestamp: new Date().toISOString(),
      details: { checkpointId: checkpoint.id, message: checkpoint.message }
    });

    // Save to active sessions
    activeSessions[sessionId] = sessionData;
    await saveActiveSessions(activeSessions);

    // Save checkpoint in memory store
    if (memoryStore) {
      await memoryStore.store(`checkpoint:${checkpoint.id}`, checkpoint, {
        namespace: 'checkpoints',
        metadata: { sessionId: sessionId, type: 'checkpoint' }
      });
    }

    printSuccess(`✅ Session saved successfully!`);
    console.log(`🆔 Session: ${sessionData.name} (${sessionId.substring(0, 16)}...)`);
    console.log(`📌 Checkpoint: ${checkpoint.id.substring(0, 16)}...`);
    console.log(`💬 Message: ${checkpoint.message}`);
    console.log(`⏰ Saved: ${checkpoint.timestamp}`);
    console.log(`📊 Total checkpoints: ${sessionData.checkpoints.length}`);
    
  } catch (error) {
    printError(`Failed to save session: ${error.message}`);
  }
}

/**
 * Delete a session
 */
async function deleteSession(args, flags) {
  await initializeSessionStorage();
  
  const sessionId = args[0];
  if (!sessionId) {
    printError('Usage: session delete <session-id>');
    return;
  }

  try {
    const activeSessions = await loadActiveSessions();
    let sessionData = null;
    let actualSessionId = null;

    // Try exact match first
    if (activeSessions[sessionId]) {
      sessionData = activeSessions[sessionId];
      actualSessionId = sessionId;
    } else {
      // Try partial match
      const matchingIds = Object.keys(activeSessions).filter(id => 
        id.includes(sessionId) || activeSessions[id].name.includes(sessionId)
      );
      
      if (matchingIds.length === 0) {
        printError(`Session '${sessionId}' not found.`);
        return;
      } else if (matchingIds.length > 1) {
        printError(`Multiple sessions match '${sessionId}'. Please be more specific:`);
        matchingIds.forEach(id => {
          console.log(`  - ${activeSessions[id].name} (${id.substring(0, 16)}...)`);
        });
        return;
      } else {
        sessionData = activeSessions[matchingIds[0]];
        actualSessionId = matchingIds[0];
      }
    }

    // Confirm deletion unless force flag is provided
    if (!flags.force) {
      console.log(`⚠️  About to delete session:`);
      console.log(`   📛 Name: ${sessionData.name}`);
      console.log(`   📝 Description: ${sessionData.description}`);
      console.log(`   📊 ${sessionData.activities.length} activities, ${sessionData.checkpoints.length} checkpoints`);
      console.log(`   ⏰ Created: ${sessionData.created}`);
      console.log();
      console.log('Add --force flag to confirm deletion.');
      return;
    }

    // Move to history before deletion
    sessionData.state = SESSION_STATES.ARCHIVED;
    sessionData.deleted = new Date().toISOString();
    await saveToHistory(sessionData);

    // Remove from active sessions
    delete activeSessions[actualSessionId];
    await saveActiveSessions(activeSessions);

    // Clean up memory store
    if (memoryStore) {
      try {
        // Remove session-related data from memory
        await memoryStore.clear({ pattern: `session:${actualSessionId}*` });
        await memoryStore.clear({ pattern: `checkpoint:*`, metadata: { sessionId: actualSessionId } });
      } catch (error) {
        // Memory cleanup failed, but session is deleted
      }
    }

    printSuccess(`✅ Session deleted successfully!`);
    console.log(`🆔 Deleted: ${sessionData.name} (${actualSessionId.substring(0, 16)}...)`);
    console.log(`📚 Session moved to history for recovery if needed.`);
    
  } catch (error) {
    printError(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Show current session info
 */
async function showCurrentSession(args, flags) {
  await initializeSessionStorage();
  
  try {
    const activeSessions = await loadActiveSessions();
    const currentDir = process.cwd();
    
    // Find active sessions in current directory
    const matchingSessions = Object.values(activeSessions).filter(session => 
      session.context.workingDirectory === currentDir && session.state === SESSION_STATES.ACTIVE
    );
    
    if (matchingSessions.length === 0) {
      printInfo('No active session found in current directory.');
      console.log(`📍 Current directory: ${currentDir}`);
      console.log(`💡 Create a session with: session create <name>`);
      return;
    }

    // Show all matching sessions
    for (const session of matchingSessions) {
      const stateIcon = getStateIcon(session.state);
      
      console.log(`${stateIcon} Current Session`);
      console.log(`🆔 ID: ${session.id}`);
      console.log(`📛 Name: ${session.name}`);
      console.log(`📝 Description: ${session.description}`);
      console.log(`📍 Working Directory: ${session.context.workingDirectory}`);
      if (session.context.gitBranch) {
        console.log(`🌿 Git Branch: ${session.context.gitBranch}`);
      }
      console.log(`⏰ Created: ${session.created}`);
      console.log(`⏰ Updated: ${session.updated}`);
      console.log(`📊 Activities: ${session.activities.length}`);
      console.log(`📌 Checkpoints: ${session.checkpoints.length}`);
      console.log(`🔧 Node.js: ${session.context.nodeVersion}`);
      console.log(`💻 Platform: ${session.context.platform}/${session.context.arch}`);
      
      if (flags.verbose) {
        console.log('\n📋 Recent activities:');
        const recentActivities = session.activities.slice(-5);
        if (recentActivities.length === 0) {
          console.log('   No activities recorded yet.');
        } else {
          recentActivities.forEach(activity => {
            console.log(`   ${activity.timestamp} - ${activity.type}`);
            if (activity.details) {
              console.log(`      ${JSON.stringify(activity.details)}`);
            }
          });
        }

        console.log('\n📌 Recent checkpoints:');
        const recentCheckpoints = session.checkpoints.slice(-3);
        if (recentCheckpoints.length === 0) {
          console.log('   No checkpoints created yet.');
        } else {
          recentCheckpoints.forEach(checkpoint => {
            console.log(`   ${checkpoint.timestamp} - ${checkpoint.message}`);
            console.log(`      ID: ${checkpoint.id}`);
          });
        }
      }
      
      if (matchingSessions.length > 1) {
        console.log('---');
      }
    }

    // Memory store information
    if (flags.verbose && memoryStore) {
      try {
        const memorySessions = await memoryStore.getActiveSessions();
        console.log(`\n💾 Memory Store: ${memorySessions.length} active sessions tracked`);
      } catch (error) {
        // Memory store might not be available
      }
    }
    
  } catch (error) {
    printError(`Failed to show current session: ${error.message}`);
  }
}

/**
 * Get state icon for session
 */
function getStateIcon(state) {
  const icons = {
    [SESSION_STATES.ACTIVE]: '🟢',
    [SESSION_STATES.PAUSED]: '🟡',
    [SESSION_STATES.COMPLETED]: '✅',
    [SESSION_STATES.FAILED]: '❌',
    [SESSION_STATES.ARCHIVED]: '📦'
  };
  return icons[state] || '❓';
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/**
 * Show session command help
 */
function showSessionHelp() {
  console.log(`
🖥️  Session Management System

USAGE:
  session <command> [options]

COMMANDS:
  create <name> [description]    Create new session
  list                          List all sessions  
  restore <id>                  Restore previous session
  save [id] [message]           Save current session state
  delete <id> [--force]         Delete session (with confirmation)
  current                       Show current session info

OPTIONS:
  --verbose, -v                 Show detailed information
  --force, -f                   Skip confirmations (for delete)

EXAMPLES:
  session create "api-development" "Building REST API"
  session list --verbose
  session restore session-api-dev-1234
  session save "Completed user authentication"
  session delete session-old-1234 --force
  session current --verbose

FEATURES:
  ✅ Session state persistence across restarts
  ✅ Cross-session memory integration
  ✅ Automatic context capture (git branch, working directory)
  ✅ Checkpoint system for incremental saves
  ✅ Session history and recovery
  ✅ Activity tracking and logging

INTEGRATION:
  • Memory system: Persistent state across sessions
  • Git integration: Branch tracking and context
  • Cross-platform: Works on Windows, macOS, Linux
  • Process tracking: PID and environment capture
`);
}

/**
 * Main session command handler
 */
export async function sessionCommand(args, flags) {
  const subCommand = args[0];

  // Show help if no command or help flag
  if (!subCommand || flags.help || flags.h) {
    showSessionHelp();
    return;
  }

  try {
    switch (subCommand) {
      case 'create':
        await createSession(args.slice(1), flags);
        break;

      case 'list':
      case 'ls':
        await listSessions(args.slice(1), flags);
        break;

      case 'restore':
      case 'resume':
        await restoreSession(args.slice(1), flags);
        break;

      case 'save':
        await saveSession(args.slice(1), flags);
        break;

      case 'delete':
      case 'remove':
      case 'rm':
        await deleteSession(args.slice(1), flags);
        break;

      case 'current':
      case 'info':
      case 'status':
        await showCurrentSession(args.slice(1), flags);
        break;

      default:
        printError(`Unknown session command: ${subCommand}`);
        showSessionHelp();
    }
  } catch (error) {
    printError(`Session command failed: ${error.message}`);
    if (flags.verbose) {
      console.error('Stack trace:', error.stack);
    }
  }
}