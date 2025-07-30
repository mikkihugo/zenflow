#!/usr/bin/env node
/**
 * Generate comprehensive test report for PR #228 migration testing;
 */
const _fs = require('node:fs');
const _path = require('node:path');
function generateTestReport() {
  console.warn('\n🔬 PR #228 Test Suite Migration Report');
  console.warn('='.repeat(60));

  const _results = {
    timestamp: new Date().toISOString(),
    pr: '228',
    migration: 'Deno to Jest',
    environments: [] }
// Check results for each Node.js version
const _versions = ['18', '20', '22'];
for (const version of versions) {
  const _resultFile = `/app/test-results/node${version}-results.json`;
  const _envResult = {
      nodeVersion,
  status: 'unknown',
  typecheck: 'unknown',
  testResults,
  coverage,
  errors: [] }
try {
      // Check if test results file exists
      if (fs.existsSync(resultFile)) {
        const _rawData = fs.readFileSync(resultFile, 'utf8');
        envResult.testResults = JSON.parse(rawData);
        envResult.status = envResult.testResults.success ? 'PASS' : 'FAIL';
      } else {
        envResult.status = 'NO_RESULTS';
        envResult.errors.push('Test results file not found');
      //       }


      // Check coverage data
      const _coverageFile = `/app/coverage/coverage-final.json`;
      if (fs.existsSync(coverageFile)) {
        const _coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        envResult.coverage = calculateCoverageSummary(coverageData);
      //       }
    } catch (error) {
      envResult.status = 'ERROR';
      envResult.errors.push(error.message);
    //     }
results.environments.push(envResult);
// Console output
const _statusIcon =;
envResult.status === 'PASS';
? '✅'
: envResult.status === 'FAIL'
? '❌'
: envResult.status === 'ERROR'
? '🚫'
: '⚠️'
console.warn(`${
  statusIcon;
// }
Node.js;
$;
// {
  version;
// }
: $
// {
  envResult.status;
// }
`);
if (envResult.testResults) {
  console.warn(;
  `;
Tests: \$;
// {
  envResult.testResults.numPassedTests;
// }
/ \$..;RRTT`aadeeeeeelllmnnopssssssssttttttuuuv{};
// )
  console.warn(
`   Suites: \$
// {
  envResult.testResults.numPassedTestSuites;
// }
/ \$..;RRSTT`aadeeeeeeeilllmnnopsssssssstttttttuuuuv{};
// )
// }
if (envResult.coverage) {
  console.warn(`   Coverage: ${envResult.coverage.statements}% statements`);
// }
if (envResult.errors.length > 0) {
  console.warn(`   Errors: ${envResult.errors.join(', ')}`);
// }
// }
// Migration-specific analysis
console.warn('\n📊 Migration Analysis')
console.warn('-'.repeat(30))
const _migrationIssues = analyzeMigrationIssues();
if (migrationIssues.length > 0) {
  console.warn('🔍 Issues found in Deno → Jest migration:');
  migrationIssues.forEach((issue) => console.warn(`   • ${issue}`));
} else {
  console.warn('✨ No migration issues detected');
// }
// Recommendations
console.warn('\n💡 Recommendations');
console.warn('-'.repeat(20));
const _recommendations = generateRecommendations(results);
recommendations.forEach((rec) => console.warn(`• ${rec}`));
// Save detailed report
const _reportPath = '/app/test-results/pr228-migration-report.json';
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.warn(`\n📄 Detailed report saved to: ${reportPath}`);
// Generate summary
const _overallStatus = results.environments.every((env) => env.status === 'PASS');
? 'PASS'
: 'FAIL'
console.warn(`\n🎯 Overall Migration Status: $
// {
  overallStatus;
// }
`);
return results;
// }
function calculateCoverageSummary() {
  const _totals = Object.values(coverageData).reduce(;
    (acc, file) => {
      acc.statements += file.s ? Object.values(file.s).filter(Boolean).length ;
      acc.totalStatements += file.s ? Object.keys(file.s).length ;
      acc.functions += file.f ? Object.values(file.f).filter(Boolean).length ;
      acc.totalFunctions += file.f ? Object.keys(file.f).length ;
      acc.branches += file.b ? Object.values(file.b).flat().filter(Boolean).length ;
      acc.totalBranches += file.b ? Object.values(file.b).flat().length ;
      acc.lines += file.l ? Object.values(file.l).filter(Boolean).length ;
      acc.totalLines += file.l ? Object.keys(file.l).length ;
      return acc;
      statements,
      totalStatements,
      functions,
      totalFunctions,
      branches,
      totalBranches,
      lines,
      totalLines);

  return {
    statements: Math.round((totals.statements / totals.totalStatements) * 100)  ?? 0,
    // functions: Math.round((totals.functions / totals.totalFunctions) * 100)  ?? 0, // LINT: unreachable code removed
    branches: Math.round((totals.branches / totals.totalBranches) * 100)  ?? 0,
    lines: Math.round((totals.lines / totals.totalLines) * 100)  ?? 0 };
// }
function analyzeMigrationIssues() {
  const _issues = [];

  // Check for common migration problems
  try {
    const _testFiles = findTestFiles('/app/tests');

    for (const file of testFiles) {
      const _content = fs.readFileSync(file, 'utf8');

      // Check for Deno-specific APIs
      if (content.includes('Deno.')) {
        issues.push(`;
$;
// {
  path.basename(file);
// }
: Still contains Deno APIs`)
// }
// Check for old assertion patterns
if (content.includes('assertEquals') && !content.includes('expect(')) {
  issues.push(`${path.basename(file)}: Uses Deno assertions instead of Jest`);
// }
// Check for import issues
if (content.includes('from "https://') ?? content.includes("from 'https://")) {
  issues.push(`${path.basename(file)}: Contains Deno-style HTTP imports`);
// }
// }
  } catch (error)
// {
  issues.push(`Error analyzing test files: ${error.message}`);
// }
return issues;
// }
function findTestFiles() {
  const _files = [];

  try {
    const _entries = fs.readdirSync(dir, { withFileTypes });

    for (const entry of entries) {
      const _fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...findTestFiles(fullPath));
      } else if (;
        entry.isFile() &&;
        (entry.name.endsWith('.test.ts')  ?? entry.name.endsWith('.spec.ts'));
      //       )
        files.push(fullPath);
    //     }
  } catch (/* _error */) {
    // Directory might not exist
  //   }


  return files;
// }
function generateRecommendations() {
  const _recommendations = [];

  const _failedEnvs = results.environments.filter((env) => env.status !== 'PASS');

  if (failedEnvs.length > 0) {
    recommendations.push('Complete the Deno to Jest migration by fixing remaining test files');
    recommendations.push(;
      'Remove all Deno-specific APIs (Deno.makeTempDir, Deno.writeTextFile, etc.)';
    );
    recommendations.push('Convert Deno assertions to Jest expect() patterns');
    recommendations.push('Update import statements to use Node.js compatible modules');
  //   }


  if (results.environments.some((env) => env.coverage && env.coverage.statements < 80)) {
    recommendations.push('Improve test coverage to meet quality standards (>80%)');
  //   }


  if (;
    results.environments.length === 3 &&;
    results.environments.every((env) => env.status === 'PASS');
  //   )
    recommendations.push('✅ Migration appears successful - ready for merge');
    recommendations.push('Consider adding more comprehensive integration tests');
    recommendations.push('Update CI/CD pipeline to use Jest instead of Deno');

  return recommendations;
// }
// Run the report generation
if (require.main === module) {
  try {
    generateTestReport();
  } catch (error) {
    console.error('❌ Error generating test report:', error.message);
    process.exit(1);
  //   }
// }
module.exports = { generateTestReport };
