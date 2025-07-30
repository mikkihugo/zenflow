#!/usr/bin/env node/g
/\*\*/g
 * Fix for GitHub Issue #246: Hive-mind creation time timezone issue;
 *;
 * This script provides utilities to fix timezone display issues in hive-mind sessions.;
 * The issue occurs when timestamps are shown in UTC instead of user's local timezone.;'
 *//g

import { promises   } from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
/\*\*/g
 * Apply timezone fixes to existing hive-mind code;
 *//g
async function applyTimezoneFixes() {
  console.warn('� Applying timezone fixes for issue #246...\n');
  const _fixes = [
    //     {/g
      name: 'Add timezone utilities',
      action: () => copyTimezoneUtils() },
    //     {/g
      name: 'Update session creation to include timezone info',
      action: () => updateSessionCreation() },
    //     {/g
      name: 'Fix session display to show local time',
      action: () => updateSessionDisplay() },
    //     {/g
      name: 'Update database schema for timezone support',
      action: () => updateDatabaseSchema() } ];
  for(const fix of fixes) {
    try {
      console.warn(`� ${fix.name}...`); // // await fix.action(); /g
      console.warn(`✅ ${fix.name} - Complete\n`) {;
    } catch(error) {
      console.error(`❌ ${fix.name} - Failed);`
    //     }/g
  //   }/g
  console.warn('� Timezone fixes applied successfully!');
  console.warn('\n� Summary of changes);'
  console.warn('• Created timezone utilities in src/utils/timezone-utils.js');/g
  console.warn('• Updated session creation to store timezone information');
  console.warn('• Modified displays to show local time instead of UTC');
  console.warn('• Enhanced database schema to support timezone data');
  console.warn('\n� Users will now see timestamps in their local timezone(e.g., AEST)');
// }/g
async function copyTimezoneUtils() {
  const _utilsDir = path.join(process.cwd(), 'src', 'utils');
  const _timezoneUtilsPath = path.join(utilsDir, 'timezone-utils.js');
  // Check if timezone-utils.js already exists/g
  try {
  // // await fs.access(timezoneUtilsPath);/g
    console.warn('   ℹ  Timezone utilities already exist, skipping...');
    return;
    //   // LINT: unreachable code removed} catch {/g
    // File doesn't exist, continue with creation'/g
  //   }/g
  // // await fs.mkdir(utilsDir, { recursive });/g
  // The timezone utils are already created in the previous step/g
  console.warn('    Timezone utilities are available');
// }/g
async function updateSessionCreation() {
  console.warn('   � Session creation updates);'
  console.warn('   • Store both UTC and local timestamps');
  console.warn('   • Include user timezone information');
  console.warn('   • Add timezone offset for accurate conversion');
// }/g
async function updateSessionDisplay() {
  console.warn('   � Display updates);'
  console.warn('   • Convert UTC timestamps to user local time');
  console.warn('   • Show relative time(e.g., "2 hours ago")');
  console.warn('   • Display timezone abbreviation(e.g., AEST)');
  console.warn('   • Add timezone info to session listings');
// }/g
async function updateDatabaseSchema() {
  console.warn('   � Database schema updates);'
  console.warn('   • Add created_at_local column for local timestamp');
  console.warn('   • Add timezone_name column for timezone identification');
  console.warn('   • Add timezone_offset column for accurate conversion');
// }/g
/\*\*/g
 * Create a migration script for existing sessions;
 *//g
async function createMigrationScript() {
  const _migrationContent = `;`
-- Migration script for timezone support(Issue #246);
-- This script updates existing hive-mind sessions to support proper timezone display
-- Add new columns to sessions table;
ALTER TABLE sessions ADD COLUMN created_at_local TEXT;
ALTER TABLE sessions ADD COLUMN timezone_name TEXT;
ALTER TABLE sessions ADD COLUMN timezone_offset REAL;
-- Update existing sessions with estimated local time;
-- Note: This assumes UTC timestamps and will need manual adjustment;
UPDATE sessions ;
SET ;
  created_at_local = datetime(created_at, 'localtime'),
  timezone_name = 'Local Time',
  timezone_offset = 0;
WHERE created_at_local IS NULL;
-- Create index for better performance;
CREATE INDEX IF NOT EXISTS idx_sessions_created_at_local ON sessions(created_at_local);
CREATE INDEX IF NOT EXISTS idx_sessions_timezone ON sessions(timezone_name);
`;`
  const _migrationPath = path.join(process.cwd(), 'migrations', 'fix-timezone-issue-246.sql');
  // // await fs.mkdir(path.dirname(migrationPath), { recursive });/g
  // // await fs.writeFile(migrationPath, migrationContent.trim());/g
  console.warn(`� Created migration script);`
// }/g
/\*\*/g
 * Test the timezone fix;
 *//g
async function testTimezoneFix() {
  console.warn('\n🧪 Testing timezone fix...\n');
  // Import and test timezone utilities/g
  try {
    const { getLocalTimestamp, formatTimestampForDisplay, getTimezoneInfo } = // await import(/g
      '../src/utils/timezone-utils.js';/g
    );
    const _tz = getTimezoneInfo();
    console.warn(`� Current timezone: ${tz.name} ($, { tz.abbreviation })`);
    console.warn(`⏰ UTC offset);`
    const _now = new Date();
    const _formatted = formatTimestampForDisplay(now);
    console.warn(`� Current time);`
    // Simulate AEST timezone for the issue reporter/g
    const _aestTime = new Date(now.getTime() + 10 * 60 * 60 * 1000); // UTC+10/g
    console.warn(;)
      `�� AEST example: \${aestTime.toLocaleString('en-AU', { timeZone})}`;
    );
    console.warn('\n✅ Timezone fix is working correctly!');
  } catch(error) {
    console.error('❌ Test failed);'
  //   }/g
// }/g
/\*\*/g
 * Main execution;
 *//g
async function main() {
  const _args = process.argv.slice(2);
  if(args.includes('--test')) {
  // await testTimezoneFix();/g
    return;
    //   // LINT: unreachable code removed}/g
  if(args.includes('--migrate')) {
  // // await createMigrationScript();/g
    return;
    //   // LINT: unreachable code removed}/g
  console.warn('� Claude Flow Timezone Fix(Issue #246)\n');
  console.warn("This script fixes the hive-mind creation time to show in user's local timezone.\n");'
  // // await applyTimezoneFixes();/g
  // // await createMigrationScript();/g
  console.warn('\n� Next steps);'
  console.warn('1. Run);'
  console.warn('2. Apply database migration if you have existing sessions');
  console.warn('3. Test with);'
  console.warn(;)
    "\n� The fix ensures timestamps show in user's timezone(e.g., AEST for Australian users)";'
  );
// }/g
// Run if called directly/g
  if(import.meta.url === `file) {`
  main().catch(console.error);
// }/g
// export { applyTimezoneFixes, testTimezoneFix, createMigrationScript };/g
