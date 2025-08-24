#!/usr/bin/env node

/**
 * Attempt Tracking System for Intelligent Linter
 * 
 * Tracks error count progression to implement smart retry logic:
 * - Continue if error count decreases (shows progress)
 * - Blacklist after 2 attempts with NO improvement
 * - Reset attempt count if file shows improvement
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { execSync } from 'child_process';

const ATTEMPT_LOG = 'scripts/attempt-tracker.log';
const FAILED_LOG = 'scripts/failed-files.log';

/**
 * Get current TypeScript error count for a specific file
 */
export function getFileErrorCount(filePath) {
  try {
    const filename = filePath.split('/').pop();
    const output = execSync(
      'cd apps/claude-code-zen-server && pnpm run type-check 2>&1',
      { encoding: 'utf8' }
    );
    
    const errorLines = output.split('\\n').filter(line => 
      line.includes(filename) && line.includes('error TS')
    );
    
    return errorLines.length;
  } catch (error) {
    console.error(`Error getting count for ${filePath}:`, error.message);
    return -1;
  }
}

/**
 * Record an attempt with error counts and result
 */
export function recordAttempt(filePath, preErrors, postErrors, result) {
  const timestamp = new Date().toISOString();
  const attemptCount = getAttemptCount(filePath);
  const entry = `${filePath}:${attemptCount}:${preErrors}:${postErrors}:${timestamp}:${result}\\n`;
  
  appendFileSync(ATTEMPT_LOG, entry);
  console.log(`📝 Recorded attempt #${attemptCount} for ${filePath}: ${preErrors}→${postErrors} (${result})`);
}

/**
 * Get current attempt count for a file
 */
export function getAttemptCount(filePath) {
  if (!existsSync(ATTEMPT_LOG)) {
    return 1;
  }
  
  try {
    const content = readFileSync(ATTEMPT_LOG, 'utf8');
    const lines = content.split('\\n').filter(line => line.startsWith(filePath + ':'));
    
    if (lines.length === 0) {
      return 1;
    }
    
    const lastAttempt = parseInt(lines[lines.length - 1].split(':')[1]) || 0;
    return lastAttempt + 1;
  } catch (error) {
    return 1;
  }
}

/**
 * Check if file should be blacklisted (2+ attempts with no improvement)
 */
export function shouldBlacklistFile(filePath, currentErrors) {
  if (!existsSync(ATTEMPT_LOG)) {
    return false;
  }
  
  try {
    const content = readFileSync(ATTEMPT_LOG, 'utf8');
    const fileAttempts = content.split('\\n')
      .filter(line => line.startsWith(filePath + ':'))
      .slice(-2); // Get last 2 attempts
    
    if (fileAttempts.length < 2) {
      return false;
    }
    
    let noImprovementCount = 0;
    
    for (const attempt of fileAttempts) {
      const [, , preErrors, postErrors, , result] = attempt.split(':');
      const pre = parseInt(preErrors) || 0;
      const post = parseInt(postErrors) || 0;
      
      if (post >= pre && !['SUCCESS', 'PERFECT'].includes(result)) {
        noImprovementCount++;
      }
    }
    
    return noImprovementCount >= 2;
  } catch (error) {
    console.error(`Error checking blacklist status for ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Add file to blacklist
 */
export function addToBlacklist(filePath, errorCount, reason) {
  const entry = `${filePath}:${errorCount}:${reason}\\n`;
  appendFileSync(FAILED_LOG, entry);
  console.log(`🚫 Added to blacklist: ${filePath} (${errorCount} errors, reason: ${reason})`);
}

/**
 * Check if file made progress (error count decreased)
 */
export function fileMadeProgress(preErrors, postErrors) {
  return postErrors < preErrors;
}

/**
 * Reset attempt count if file made progress
 */
export function resetAttemptsIfImproved(filePath, preErrors, postErrors) {
  if (fileMadeProgress(preErrors, postErrors)) {
    console.log(`✨ File ${filePath} made progress (${preErrors} → ${postErrors}), resetting attempt count`);
    
    if (existsSync(ATTEMPT_LOG)) {
      try {
        const content = readFileSync(ATTEMPT_LOG, 'utf8');
        const filteredLines = content.split('\\n')
          .filter(line => !line.startsWith(filePath + ':'))
          .join('\\n');
        
        writeFileSync(ATTEMPT_LOG, filteredLines);
      } catch (error) {
        console.error(`Error resetting attempts for ${filePath}:`, error.message);
      }
    }
  }
}

/**
 * Check if file is currently blacklisted
 */
export function isBlacklisted(filePath) {
  if (!existsSync(FAILED_LOG)) {
    return false;
  }
  
  try {
    const content = readFileSync(FAILED_LOG, 'utf8');
    return content.split('\\n').some(line => 
      line.startsWith(filePath + ':') && !line.startsWith('#')
    );
  } catch (error) {
    return false;
  }
}

// CLI interface when run directly
if (process.argv[2]) {
  const command = process.argv[2];
  const filePath = process.argv[3];
  
  switch (command) {
    case 'count':
      console.log(getFileErrorCount(filePath));
      break;
    case 'attempts':
      console.log(getAttemptCount(filePath));
      break;
    case 'blacklisted':
      console.log(isBlacklisted(filePath));
      break;
    case 'should-blacklist':
      console.log(shouldBlacklistFile(filePath, parseInt(process.argv[4]) || 0));
      break;
    default:
      console.log('Usage: node attempt-tracker.mjs <count|attempts|blacklisted|should-blacklist> <filePath> [errorCount]');
  }
}