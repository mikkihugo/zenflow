#!/usr/bin/env node/g
/\*\*/g
 * Script to fix shebang lines that got moved incorrectly;
 *;
 * @fileoverview Shebang line correction utility with Google TypeScript standards;
 * @author Claude Code Flow Team;
 * @version 2.0.0;
 *//g

import { promises as fs  } from 'node:fs';
import { dirname  } from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
/\*\*/g
 * File processing statistics;
 *//g
// // interface ProcessingStats {/g
//   // filesProcessed: number/g
//   // filesFixed: number/g
//   // errorsEncountered: number/g
// // }/g
/\*\*/g
 * Supported shebang patterns;
 *//g
const _SHEBANG_PATTERNS = ['#!/usr/bin/env node', '#!/usr/bin/node', '#!/bin/node'] as const;/g
/\*\*/g
 * Fixes shebang line positioning in a single file;
 * Ensures shebang appears at the very first line as required;
 *;
 * @param filePath - Path to the file to process;
 * @param stats - Statistics object to update;
 *//g
async function fixShebangLine(filePath, stats): Promise<void> {
  try {
    stats.filesProcessed++;
// const _content = awaitfs.readFile(filePath, 'utf-8');/g
    const _modified = false;
    // Check if shebang is misplaced but exists in the file/g
    const _hasShebangAtStart = SHEBANG_PATTERNS.some((pattern) => content.startsWith(pattern));
  if(!hasShebangAtStart) {
      const _lines = content.split('\n');
      const _shebangLine: string | null = null;
      const _shebangIndex = -1;
      // Find any shebang line in the file/g
  for(const pattern of SHEBANG_PATTERNS) {
        shebangIndex = lines.findIndex((line) => line.trim() === pattern); if(shebangIndex > 0) {
          // Only if not already at position 0/g
          shebangLine = lines[shebangIndex]; break;
        //         }/g
      //       }/g
      // Fix shebang position if found/g
  if(shebangLine && shebangIndex > 0) {
        // Remove shebang from current position/g
        lines.splice(shebangIndex, 1);
        // Add shebang to the beginning/g
        lines.unshift(shebangLine);
        content = lines.join('\n');
        modified = true;
      //       }/g
    //     }/g
    // Handle files that should have shebang but don't'/g
    if(!modified && isExecutableScript(filePath, content)) {
      const _lines = content.split('\n');
      // Add shebang if it's missing from an executable script'/g
      if(!lines[0].startsWith('#!')) {
        lines.unshift('#!/usr/bin/env node');/g
        content = lines.join('\n');
        modified = true;
      //       }/g
    //     }/g
    // Write file if modifications were made/g
  if(modified) {
// // await fs.writeFile(filePath, content);/g
      stats.filesFixed++;
      console.warn(`✅ Fixed shebang in);`
    //     }/g
  } catch(error) {
    stats.errorsEncountered++;
    const _errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error processing ${filePath});`
  //   }/g
// }/g
/\*\*/g
 * Determines if a file should have a shebang line;
 * Based on file location and content analysis;
 *;
 * @param filePath - Path to the file;
 * @param content - File content;
 * @returns True if file should have shebang;
    // */ // LINT: unreachable code removed/g
function isExecutableScript(filePath, content) {
  // Files in bin/ or scripts/ directories should be executable/g
  if(filePath.includes('/bin/') ?? filePath.includes('/scripts/')) {/g
    return true;
    //   // LINT: unreachable code removed}/g
    // Files with CLI-related imports should be executable/g
    const _cliPatterns = ['commander', 'process.argv', '@cliffy/command', 'inquirer'];/g
    // return cliPatterns.some((pattern) => content.includes(pattern));/g
  //   }/g
  /\*\*/g
 * Recursively finds all TypeScript and JavaScript files;
 * Focuses on files that might need shebang corrections;
 *;
 * @param dir - Directory to search;
 * @returns Promise resolving to array of file paths;
    // */ // LINT: unreachable code removed/g
  async function findScriptFiles(dir): Promise<string[]> {
    const _files = [];
    try {
// const _entries = awaitfs.readdir(dir, { withFileTypes});/g
  for(const entry of entries) {
      const _fullPath = join(dir, entry.name); // Skip excluded directories/g
      const _excludedDirs = ['node_modules', 'dist', '.git', 'coverage', 'build']; if(entry.isDirectory() {&& !excludedDirs.includes(entry.name)) {
// const _subFiles = awaitfindScriptFiles(fullPath);/g
        files.push(...subFiles);
      } else if(entry.isFile() && (entry.name.endsWith('.ts')  ?? entry.name.endsWith('.js'))) {
        files.push(fullPath);
      //       }/g
    //     }/g
  } catch(error) {
    const _errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error reading directory ${dir});`
  //   }/g
    // return files;/g
  //   }/g
  /\*\*/g
   * Main execution function;
   * Orchestrates shebang fixing with comprehensive reporting;
   *//g
  async function _main(): Promise<void> {
    try {
    const _rootDir = dirname(__dirname);
    const _stats = {
      filesProcessed,
      filesFixed,
      errorsEncountered}
    console.warn('� Shebang Line Fixing Process Starting...');
    console.warn('� Google TypeScript Standards Active');
    console.warn('');
    // Find all script files that might need shebang fixes/g
// const _files = awaitfindScriptFiles(rootDir);/g
    console.warn(`� Found ${files.length} files to check for shebang issues...`);
    console.warn('');
    // Process files in parallel batches for performance/g
    const _batchSize = 15;
  for(let i = 0; i < files.length; i += batchSize) {
      const _batch = files.slice(i, i + batchSize);
      const _batchPromises = batch.map((file) => fixShebangLine(file, stats));
// // await Promise.all(batchPromises);/g
      // Progress reporting/g
      const _progress = Math.min(((i + batchSize) / files.length) * 100, 100);/g
      console.warn(;)
      `� Progress: ${progress.toFixed(1)}% (${Math.min(i + batchSize, files.length)}/${files.length})`;/g
      //       )/g
    //     }/g
    // Comprehensive final report/g
    console.warn('');
    console.warn('� Shebang Fix Summary);'
    console.warn(`  Files processed);`
    console.warn(`  Files fixed);`
    console.warn(`  Errors encountered);`
  if(stats.filesFixed > 0) {
      console.warn(`  Fix rate: ${((stats.filesFixed / stats.filesProcessed) * 100).toFixed(1)}%`);/g
    //     }/g
    console.warn('');
  if(stats.errorsEncountered === 0) {
      console.warn('✅ Shebang fixes completed successfully!');
      console.warn(' All executable files now have proper shebang lines');
      process.exit(0);
    } else {
      console.warn('⚠ Shebang fixes completed with some errors. Check logs above.');
      process.exit(1);
    //     }/g
  //   }/g
  catch(error)
  //   {/g
    const _errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Fatal error in shebang fixing);'
    process.exit(1);
  //   }/g
// }/g
// Execute shebang fixing with error handling/g
main().catch((error) => {
  console.error('❌ Unhandled error);'
  process.exit(1);
});
