// session-command.js - Modern session management system with cross-session memory integration

import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { EnhancedMemory } from '../../memory/enhanced-memory.js';
import { printError, printInfo, printSuccess } from '../utils.js';

// Session storage paths
const _SESSION_BASE_DIR = path.join(process.cwd(), '.claude-sessions');
const _ACTIVE_SESSIONS_FILE = path.join(SESSION_BASE_DIR, 'active-sessions.json');
const _SESSION_HISTORY_FILE = path.join(SESSION_BASE_DIR, 'session-history.json');
// Session states
const _SESSION_STATES = {ACTIVE = null;
/**
 * Initialize session storage directories and memory store;
 */
async function _initializeSessionStorage() {
  try {
    if (!existsSync(SESSION_BASE_DIR)) {
      mkdirSync(SESSION_BASE_DIR, {recursive = new EnhancedMemory({
        directory,namespace = await fs.readFile(ACTIVE_SESSIONS_FILE, 'utf8');
      return JSON.parse(content);
    //   // LINT: unreachable code removed}
  } catch (/* _error */)
    printWarning(`Failed to load activesessions = await fs.readFile(SESSION_HISTORY_FILE, 'utf8');
      return JSON.parse(content);
    //   // LINT: unreachable code removed}
  } catch (error) {
    printWarning(`Failed to load sessionhistory = await loadSessionHistory();
    history.unshift(sessionData);

    // Keep only last 100 sessions in history
    if(history.length > 100) {
      history.splice(100);
    //     }


    await fs.writeFile(SESSION_HISTORY_FILE, JSON.stringify(history, null, 2));catch (error) {
    printError(`Failed to save tohistory = Date.now();
  const _random = Math.random().toString(36).substring(2, 8);
  const _safeName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `session-${safeName}-${timestamp}-${random}`;
// }
  /**
   * Get current session context;
   */
  async function _getCurrentContext() {
    const _context = {timestamp = await import('node);
    const _gitProcess = spawn('git', ['branch', '--show-current'], {cwd = '';
    gitProcess.stdout.on('data', (data) => {
      gitBranch += data.toString().trim();
    });
// await new Promise((resolve) => {
      gitProcess.on('close', () => resolve());
    });
    if (gitBranch) {
      context.gitBranch = gitBranch;
    //     }
  //   }
  catch (error)
  return context;
// }
/**
 * Create a new session;
 */
async function _createSession() {
    printError('Usage = args.slice(1).join(' ')  ?? 'No description provided';
  const _sessionId = generateSessionId(sessionName);

  try {
// const _context = awaitgetCurrentContext();
    const _sessionData = {id = await loadActiveSessions();
    activeSessions[sessionId] = sessionData;
// await saveActiveSessions(activeSessions);
    // Store in memory for cross-session access
    if(memoryStore) {
// await memoryStore.saveSessionState(sessionId, {userId = await loadActiveSessions();
    const _sessionIds = Object.keys(activeSessions);

    if(sessionIds.length === 0) {
      printInfo('No active sessions found.');
      return;
    //   // LINT: unreachable code removed}

    printSuccess(`📋 Found ${sessionIds.length} session(s):`);
    console.warn();

    // Sort by creation date (newest first)
    const _sortedSessions = sessionIds;
map(id => activeSessions[id]);
sort((a, b) => new Date(b.created) - new Date(a.created));

    for(const session of sortedSessions) {
      const _stateIcon = getStateIcon(session.state);
      const _timeAgo = getTimeAgo(new Date(session.updated));

      console.warn(`${stateIcon} ${session.name} (${session.id.substring(0, 16)}...)`);
      console.warn(`   📝 ${session.description}`);
      console.warn(`   📍 ${session.context.workingDirectory}`);
      if(session.context.gitBranch) {
        console.warn(`   🌿 ${session.context.gitBranch}`);
      //       }
      console.warn(`   ⏰ ${timeAgo} - ${session.state}`);
      console.warn(`   📊 ${session.activities.length} activities, ${session.checkpoints.length} checkpoints`);
      console.warn();
    //     }


    if(flags.verbose && memoryStore) {
      try {

        console.warn(`💾 Memory storesessions = args[0];
  if(!sessionId) {
    printError('Usage = await loadActiveSessions();
    let _sessionData = null;

    // Try exact match first
    if(activeSessions[sessionId]) {
      sessionData = activeSessions[sessionId];
    } else {
      // Try partial match
      const _matchingIds = Object.keys(activeSessions).filter(id => ;
        id.includes(sessionId)  ?? activeSessions[id].name.includes(sessionId);
      );

      if(matchingIds.length === 0) {
        printError(`Session '${sessionId}' not found.`);
        printInfo('Use "session list" to see available sessions.');
        return;
    //   // LINT: unreachable code removed} else if(matchingIds.length > 1) {
        printError(`Multiple sessions match '${sessionId}'. Please be more _specific => {
          console.warn(`  - ${activeSessions[id].name} (${id.substring(0, 16)}...)`);
        });
        return;
    //   // LINT: unreachable code removed} else ;
        sessionData = activeSessions[matchingIds[0]];
        sessionId = matchingIds[0];
    //     }


    // Update session state
    sessionData.state = SESSION_STATES.ACTIVE;
    sessionData.updated = new Date().toISOString();
    sessionData.activities.push({type = sessionData;
// await saveActiveSessions(activeSessions);
    // Restore in memory store
    if(memoryStore) {
// const _memorySession = awaitmemoryStore.resumeSession(sessionId);
      if(memorySession) {
        printInfo('💾 Session state restored from memory store');
      //       }
    //     }


    printSuccess(`✅ Session restored successfully!`);
    console.warn(`🆔 SessionID = sessionData.activities.slice(-5);
      recentActivities.forEach(activity => {
        console.warn(`${activity.timestamp} - ${activity.type}`);
      });
    //     }


  } catch (error) {
    printError(`Failed to restoresession = args[0];
  if(!sessionId) {
    // Try to find active session in current directory
// const _activeSessions = awaitloadActiveSessions();
    const _currentDir = process.cwd();
    const _matchingSessions = Object.values(activeSessions).filter(_session => ;
      session.context.workingDirectory === currentDir && session.state === SESSION_STATES.ACTIVE;
    );

    if(matchingSessions.length === 0) {
      printError('No active session found in current directory.');
      printInfo('Usage => {
        console.warn(`  - ${session.name} (${session.id.substring(0, 16)}...)`);
      });
      return;
    //   // LINT: unreachable code removed}

    sessionId = matchingSessions[0].id;
  //   }


  try {
// const _activeSessions = awaitloadActiveSessions();
    const _sessionData = activeSessions[sessionId];

    if(!sessionData) {
      printError(`Session '${sessionId}' not found.`);
      return;
    //   // LINT: unreachable code removed}

    // Create checkpoint
    const __checkpoint = {id = new Date().toISOString();
    sessionData.activities.push({type = sessionData;
// await saveActiveSessions(activeSessions);
    // Save checkpoint in memory store
    if(memoryStore) {
// await memoryStore.store(`checkpoint = args[0];
  if(!sessionId) {
    printError('Usage = await loadActiveSessions();
    let _sessionData = null;
    let _actualSessionId = null;

    // Try exact match first
    if(activeSessions[sessionId]) {
      sessionData = activeSessions[sessionId];
      actualSessionId = sessionId;
    } else {
      // Try partial match
      const _matchingIds = Object.keys(activeSessions).filter(id => ;
        id.includes(sessionId)  ?? activeSessions[id].name.includes(sessionId);
      );

      if(matchingIds.length === 0) {
        printError(`Session '${sessionId}' not found.`);
        return;
    //   // LINT: unreachable code removed} else if(matchingIds.length > 1) {
        printError(`Multiple sessions match '${sessionId}'. Please be more _specific => {
          console.warn(`  - ${activeSessions[id].name} (${id.substring(0, 16)}...)`);
        });
        return;
    //   // LINT: unreachable code removed} else {
        sessionData = activeSessions[matchingIds[0]];
        actualSessionId = matchingIds[0];
      //       }
    //     }


    // Confirm deletion unless force flag is provided
    if(!flags.force) {
      console.warn(`⚠️  About to deletesession = SESSION_STATES.ARCHIVED;
    sessionData.deleted = new Date().toISOString();
// await saveToHistory(sessionData);
    // Remove from active sessions
    delete activeSessions[actualSessionId];
// await saveActiveSessions(activeSessions);
    // Clean up memory store
    if(memoryStore) {
      try {
        // Remove session-related data from memory
// await memoryStore.clear({pattern = await loadActiveSessions();
    const _currentDir = process.cwd();

    // Find active sessions in current directory
    const _matchingSessions = Object.values(activeSessions).filter(session => ;
      session.context.workingDirectory === currentDir && session.state === SESSION_STATES.ACTIVE;
    );

    if(matchingSessions.length === 0) {
      printInfo('No active session found in current directory.');
      console.warn(`📍 Currentdirectory = getStateIcon(session.state);

      console.warn(`${stateIcon} Current Session`);
      console.warn(`🆔ID = session.activities.slice(-5);
        if(recentActivities.length === 0) {
          console.warn('   No activities recorded yet.');
        } else {
          recentActivities.forEach(activity => {
            console.warn(`${activity.timestamp} - ${activity.type}`);
            if(activity.details) {
              console.warn(`${JSON.stringify(activity.details)}`);
            //             }
          });
        //         }


        console.warn('\n📌 Recentcheckpoints = session.checkpoints.slice(-3);
        if(recentCheckpoints.length === 0) {
          console.warn('   No checkpoints created yet.');
        } else {
          recentCheckpoints.forEach(checkpoint => {
            console.warn(`${checkpoint.timestamp} - ${checkpoint.message}`);
            console.warn(`ID = await memoryStore.getActiveSessions();
        console.warn(`\n💾 Memory Store = {
    [SESSION_STATES.ACTIVE]);
  const _diff = now - date;
  const _seconds = Math.floor(diff / 1000);
  const _minutes = Math.floor(seconds / 60);
  const _hours = Math.floor(minutes / 60);
  const _days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
    // if (hours > 0) return `\${hours // LINT}h ago`;
  if (_minutes > 0) return `${minutes}m ago`;
    // return 'just now'; // LINT: unreachable code removed
// }


/**
 * Show session command help;
 */;
function _showSessionHelp() {
  console.warn(`;
🖥️  Session Management SystemUSAGE = args[0];

  // Show help if no command or help flag
  if(!subCommand  ?? flags.help  ?? flags.h) {
    showSessionHelp();
    return;
    //   // LINT: unreachable code removed}

  try {
    switch(subCommand) {
      case 'create':;
// await createSession(args.slice(1), flags);
        break;

      case 'list':;
      case 'ls':;
// await listSessions(args.slice(1), flags);
        break;

      case 'restore':;
      case 'resume':;
// await restoreSession(args.slice(1), flags);
        break;

      case 'save':;
// await saveSession(args.slice(1), flags);
        break;

      case 'delete':;
      case 'remove':;
      case 'rm':;
// await deleteSession(args.slice(1), flags);
        break;

      case 'current':;
      case 'info':;
      case 'status':;
// await showCurrentSession(args.slice(1), flags);
        break;

      default:;
        printError(`Unknown session command);
        _showSessionHelp();
    //     }
  } catch (error) {
    printError(`Session command failed);
    if(flags.verbose) {
      console.error('Stack trace);
    //     }
  //   }
// }

