#!/usr/bin/env node

/**
 * Parallel Intelligent Linter with Smart Retry Logic
 * 
 * Features:
 * - 3 concurrent workers for parallel processing
 * - Smart retry logic: continue if error count decreases, blacklist after 2+ failed attempts
 * - TypeScript error details passed to AI for targeted fixes
 * - Randomized file selection to prevent workers from getting stuck on same files
 * - Progress tracking and comprehensive logging
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { 
  getFileErrorCount, 
  recordAttempt, 
  getAttemptCount, 
  shouldBlacklistFile, 
  addToBlacklist, 
  fileMadeProgress, 
  resetAttemptsIfImproved,
  isBlacklisted 
} from './attempt-tracker.mjs';

const WORKER_COUNT = 3;
const FAILED_LOG = 'scripts/failed-files.log';
const workers = [];

/**
 * Get list of files with TypeScript errors (randomized, excluding blacklisted)
 */
function getErrorFiles() {
  console.log('📊 Running type-check to find files with errors...');
  
  try {
    const output = execSync(
      'cd apps/claude-code-zen-server && pnpm run type-check 2>&1',
      { encoding: 'utf8' }
    );
    
    // Extract unique file paths with errors
    const errorFiles = [...new Set(
      output.split('\\n')
        .filter(line => line.includes('error TS'))
        .map(line => {
          const match = line.match(/^src\\/(.+?)\\(/);
          return match ? `apps/claude-code-zen-server/src/${match[1]}` : null;
        })
        .filter(Boolean)
    )];
    
    // Filter out blacklisted files
    const availableFiles = errorFiles.filter(file => {
      if (isBlacklisted(file)) {
        console.log(`🚫 Skipping blacklisted file: ${file}`);
        return false;
      }
      return true;
    });
    
    // Randomize order to prevent workers from always picking same files
    return availableFiles.sort(() => Math.random() - 0.5);
    
  } catch (error) {
    console.error('Error getting error files:', error.message);
    return [];
  }
}

/**
 * Process a single file with intelligent linter
 */
async function processFile(filePath, workerId) {
  console.log(`🎯 Worker #${workerId} processing: ${filePath}`);
  
  // Check if file should be blacklisted
  if (shouldBlacklistFile(filePath, 0)) {
    console.log(`🚫 Worker #${workerId}: File ${filePath} should be blacklisted, skipping`);
    return;
  }
  
  // Get pre-fix error count
  const preErrors = getFileErrorCount(filePath);
  const attemptNum = getAttemptCount(filePath);
  
  console.log(`📈 Pre-fix error count for ${filePath}: ${preErrors} errors (attempt #${attemptNum})`);
  
  // Run intelligent linter
  const startTime = Date.now();
  
  try {
    execSync(
      `timeout 600 node scripts/intelligent-linter.mjs "${filePath}" --timeout 300 --best-effort`,
      { 
        stdio: 'inherit',
        cwd: process.cwd()
      }
    );
    
    // Get post-fix error count
    const postErrors = getFileErrorCount(filePath);
    const duration = Date.now() - startTime;
    
    console.log(`📊 Post-fix error count: ${postErrors} (was ${preErrors}) [${duration}ms]`);
    
    // Analyze results and record attempt
    if (postErrors < preErrors) {
      console.log(`✅ Worker #${workerId} SUCCESS: ${filePath} (reduced ${preErrors} → ${postErrors} errors)`);
      recordAttempt(filePath, preErrors, postErrors, 'SUCCESS');
      resetAttemptsIfImproved(filePath, preErrors, postErrors);
    } else if (postErrors === 0 && preErrors > 0) {
      console.log(`🎉 Worker #${workerId} PERFECT: ${filePath} (all errors fixed!)`);
      recordAttempt(filePath, preErrors, postErrors, 'PERFECT');
      resetAttemptsIfImproved(filePath, preErrors, postErrors);
    } else {
      console.log(`⚠️ Worker #${workerId} NO_IMPROVEMENT: ${filePath} (still ${postErrors} errors)`);
      recordAttempt(filePath, preErrors, postErrors, 'NO_IMPROVEMENT');
      
      // Check if should blacklist after 2+ failed attempts
      if (shouldBlacklistFile(filePath, postErrors)) {
        addToBlacklist(filePath, postErrors, 'no_improvement_after_2_attempts');
      }
    }
    
  } catch (error) {
    console.log(`⚠️ Worker #${workerId} timeout/error: ${filePath}`);
    recordAttempt(filePath, preErrors, preErrors, 'TIMEOUT_ERROR');
    
    // Check if should blacklist after 2+ failed attempts
    if (shouldBlacklistFile(filePath, preErrors)) {
      addToBlacklist(filePath, preErrors, 'timeout_error_after_2_attempts');
    }
  }
}

/**
 * Worker function that continuously processes files
 */
async function runWorker(workerId) {
  console.log(`🔧 Worker #${workerId} starting...`);
  
  while (true) {
    const errorFiles = getErrorFiles();
    
    if (errorFiles.length === 0) {
      console.log(`✅ Worker #${workerId}: No more files with errors found, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      continue;
    }
    
    // Use hash-based assignment with fallback to any available file
    let assignedFile = null;
    
    // First try: files assigned to this worker based on hash
    for (const file of errorFiles) {
      const hash = Buffer.from(file).toString('hex');
      const assignedWorker = parseInt(hash.slice(0, 8), 16) % WORKER_COUNT;
      if (assignedWorker === workerId) {
        assignedFile = file;
        break;
      }
    }
    
    // Second try: any available file
    if (!assignedFile && errorFiles.length > 0) {
      assignedFile = errorFiles[0];
    }
    
    if (assignedFile) {
      await processFile(assignedFile, workerId);
    } else {
      console.log(`🔄 Worker #${workerId}: No assigned files, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Brief pause between files
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Start all workers
 */
async function startWorkers() {
  console.log('🚀 Starting 3 parallel intelligent linter workers with smart retry logic...');
  
  // Start workers
  for (let i = 0; i < WORKER_COUNT; i++) {
    runWorker(i).catch(error => {
      console.error(`❌ Worker #${i} crashed:`, error.message);
      // Restart worker after crash
      setTimeout(() => startWorkers(), 5000);
    });
  }
  
  // Monitor progress every 30 seconds
  setInterval(() => {
    const errorFiles = getErrorFiles();
    console.log(`📈 ${new Date().toISOString()}: ${errorFiles.length} files remaining with errors`);
  }, 30000);
}

// Start the system
if (import.meta.url === `file://${process.argv[1]}`) {
  startWorkers();
}