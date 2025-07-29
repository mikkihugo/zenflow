#!/usr/bin/env node

/**
 * Infrastructure Test Runner Script
 * Runs comprehensive infrastructure tests and reports quality score
 */

import { runInfrastructureTests } from '../tests/e2e/infrastructure-test-runner.js';
import { Logger } from '../src/utils/logger.js';
import chalk from 'chalk';

const logger = new Logger('InfrastructureTestRunner');

async function main() {
    console.log(chalk.blue.bold('🚀 Claude Code Flow Infrastructure Test Suite'));
    console.log(chalk.gray('Testing critical infrastructure components for 92/100 quality score\n'));
    
    try {
        const startTime = Date.now();
        
        // Run the complete infrastructure test suite
        const results = await runInfrastructureTests();
        
        const duration = Date.now() - startTime;
        
        console.log('\n' + '='.repeat(80));
        console.log(chalk.bold.cyan('📊 INFRASTRUCTURE TEST RESULTS'));
        console.log('='.repeat(80));
        
        // Display component results
        console.log(chalk.bold('\n🧪 Component Test Results:'));
        
        for (const [component, result] of Object.entries(results.results)) {
            const status = result.passed ? chalk.green('✅ PASSED') : chalk.red('❌ FAILED');
            const details = result.passed ? 
                (result.mode ? `(${result.mode.toUpperCase()} mode)` : 
                 result.bindingType ? `(${result.bindingType.toUpperCase()} bindings)` : '') : 
                `(${result.error})`;
            
            console.log(`  ${component.toUpperCase().padEnd(20)} ${status} ${chalk.gray(details)}`);
        }
        
        // Display overall score
        console.log(chalk.bold('\n🎯 Overall Quality Score:'));
        const scoreColor = results.score >= 92 ? chalk.green.bold : 
                          results.score >= 80 ? chalk.yellow.bold : 
                          chalk.red.bold;
        console.log(`  ${scoreColor(results.score)}/100`);
        
        // Display success/failure status
        if (results.success) {
            console.log(chalk.green.bold('\n✅ SUCCESS: Infrastructure meets 92/100 quality threshold!'));
        } else {
            console.log(chalk.red.bold('\n❌ NEEDS IMPROVEMENT: Infrastructure below 92/100 threshold'));
        }
        
        // Display recommendations if any
        if (results.recommendations && results.recommendations.length > 0) {
            console.log(chalk.bold('\n📋 Recommendations for Improvement:'));
            
            for (const rec of results.recommendations) {
                const priorityColor = rec.priority === 'CRITICAL' ? chalk.red.bold :
                                    rec.priority === 'HIGH' ? chalk.red :
                                    rec.priority === 'MEDIUM' ? chalk.yellow :
                                    chalk.green;
                
                console.log(`\n  ${priorityColor(rec.priority)} - ${chalk.bold(rec.component)}`);
                console.log(`    Issue: ${rec.issue}`);
                console.log(`    Action: ${chalk.cyan(rec.action)}`);
            }
        }
        
        console.log(chalk.gray(`\n⏱️  Total test duration: ${duration}ms`));
        console.log('='.repeat(80));
        
        // Exit with appropriate code
        process.exit(results.success ? 0 : 1);
        
    } catch (error) {
        console.error(chalk.red.bold('\n❌ INFRASTRUCTURE TEST SUITE FAILED'));
        console.error(chalk.red(`Error: ${error.message}`));
        
        if (error.stack) {
            console.error(chalk.gray('\nStack trace:'));
            console.error(chalk.gray(error.stack));
        }
        
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n⚠️  Test suite interrupted by user'));
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('❌ Unhandled Rejection at:'), promise);
    console.error(chalk.red('Reason:'), reason);
    process.exit(1);
});

// Run the test suite
main().catch(error => {
    console.error(chalk.red.bold('❌ Fatal error in test runner:'));
    console.error(error);
    process.exit(1);
});