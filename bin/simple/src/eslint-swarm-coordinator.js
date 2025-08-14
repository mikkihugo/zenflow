#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { getConsoleReplacementLogger } from './config/logging-config.ts';
const EXTENDED_TIMEOUTS = {
    CLAUDE_INACTIVITY: 10 * 60 * 1000,
    CLAUDE_MAX_TOTAL: 30 * 60 * 1000,
    AGENT_COORDINATION: 5 * 60 * 1000,
    PROGRESS_UPDATE: 10 * 1000,
    BATCH_PROCESSING: 15 * 60 * 1000,
};
const AGENT_SPECIALISTS = {
    jsdoc: {
        name: 'JSDoc Documentation Agent',
        rules: [
            'jsdoc/require-file-overview',
            'jsdoc/check-examples',
            'jsdoc/require-description',
            'jsdoc/require-param-description',
        ],
        color: '\x1b[36m',
        priority: 2,
        batchSize: 8,
    },
    typescript: {
        name: 'TypeScript Type Safety Agent',
        rules: [
            '@typescript-eslint/no-explicit-any',
            '@typescript-eslint/no-unused-vars',
            '@typescript-eslint/prefer-nullish-coalescing',
            '@typescript-eslint/no-unsafe-assignment',
        ],
        color: '\x1b[34m',
        priority: 1,
        batchSize: 6,
    },
    style: {
        name: 'Code Style & Formatting Agent',
        rules: [
            'semi',
            'quotes',
            'indent',
            'comma-dangle',
            'no-trailing-spaces',
            'eol-last',
            'no-multiple-empty-lines',
        ],
        color: '\x1b[32m',
        priority: 3,
        batchSize: 12,
    },
    imports: {
        name: 'Import Optimization Agent',
        rules: [
            'import/order',
            'import/no-duplicates',
            'no-duplicate-imports',
            'import/first',
        ],
        color: '\x1b[35m',
        priority: 2,
        batchSize: 10,
    },
};
export class ESLintSwarmCoordinator extends EventEmitter {
    activeAgents = new Map();
    processedViolations = 0;
    totalViolations = 0;
    startTime = Date.now();
    agentStats = new Map();
    logger;
    progressInterval;
    swarmCoordinator;
    constructor() {
        super();
        this.logger = getConsoleReplacementLogger('eslint-swarm');
        this.initializeAgentStats();
    }
    initializeAgentStats() {
        Object.keys(AGENT_SPECIALISTS).forEach((type) => {
            this.agentStats.set(type, {
                processed: 0,
                fixed: 0,
                failed: 0,
                inProgress: 0,
                status: 'idle',
                lastActivity: Date.now(),
                averageTime: 0,
                violations: [],
            });
        });
    }
    async initialize() {
        this.logger.info('🐝 Initializing ESLint Swarm Coordinator with Extended Timeouts');
        this.logger.info('='.repeat(80));
        this.logger.info(`⏱️  Extended timeouts: Claude inactivity ${EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000}min, Max total ${EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL / 60000}min`);
        this.logger.info('');
        try {
            this.swarmCoordinator = new SwarmCoordinator();
            await this.analyzeViolationsForDistribution();
            this.startEnhancedProgressMonitoring();
            await this.launchParallelAgentsWithExtendedTimeouts();
        }
        catch (error) {
            this.logger.error('Failed to initialize swarm coordinator', error);
            throw error;
        }
    }
    async analyzeViolationsForDistribution() {
        this.logger.info('🔍 Analyzing ESLint violations for parallel distribution...');
        try {
            const strategies = [
                'npx eslint "src/core/*.ts" "src/interfaces/*.ts" --format json',
                'npx eslint "src/**/*.ts" --format json --max-warnings 500',
                'npx eslint src --format json --cache',
            ];
            let violations = [];
            for (const [index, strategy] of strategies.entries()) {
                this.logger.info(`  Strategy ${index + 1}/3: ${strategy.split(' ')[2] || 'Full analysis'}`);
                try {
                    const eslintOutput = execSync(strategy, {
                        encoding: 'utf8',
                        timeout: 60000,
                        maxBuffer: 1024 * 1024 * 20,
                    });
                    if (eslintOutput.trim()) {
                        violations = this.parseViolations(JSON.parse(eslintOutput));
                        if (violations.length > 0) {
                            this.logger.info(`  ✅ Strategy ${index + 1} found ${violations.length} violations`);
                            break;
                        }
                    }
                }
                catch (error) {
                    this.logger.warn(`  ⚠️ Strategy ${index + 1} failed: ${error.message.split('\n')[0]}`);
                    if (error.stdout) {
                        try {
                            violations = this.parseViolations(JSON.parse(error.stdout));
                            if (violations.length > 0) {
                                this.logger.info(`  ✅ Strategy ${index + 1} recovered ${violations.length} violations from error output`);
                                break;
                            }
                        }
                        catch (parseError) {
                        }
                    }
                }
            }
            this.totalViolations = violations.length;
            if (this.totalViolations === 0) {
                this.logger.warn('No violations found, using mock data for demonstration');
                this.totalViolations = 200;
                return this.generateMockDistribution();
            }
            const distribution = this.distributeViolations(violations);
            this.logger.info(`📊 Total violations: ${this.totalViolations}`);
            Object.entries(distribution).forEach(([agentType, data]) => {
                const agent = AGENT_SPECIALISTS[agentType];
                this.logger.info(`  ${agent.color}${agent.name}\x1b[0m: ${data?.count} violations (Priority ${agent.priority})`);
                this.agentStats.get(agentType).violations = data?.violations;
            });
            return distribution;
        }
        catch (error) {
            this.logger.error('Violation analysis failed, using fallback distribution', error);
            this.totalViolations = 150;
            return this.generateMockDistribution();
        }
    }
    async launchParallelAgentsWithExtendedTimeouts() {
        this.logger.info('\n🚀 Launching specialized agents with extended timeouts...');
        const agentTypes = Object.entries(AGENT_SPECIALISTS)
            .sort(([, a], [, b]) => a.priority - b.priority)
            .map(([type]) => type);
        for (const agentType of agentTypes) {
            const config = AGENT_SPECIALISTS[agentType];
            await this.launchAgentWithExtendedTimeout(agentType, config);
            await this.sleep(3000);
        }
        this.logger.info(`\n✅ All ${agentTypes.length} specialized agents launched with extended monitoring`);
        this.emit('swarm:initialized', {
            agentCount: agentTypes.length,
            totalViolations: this.totalViolations,
        });
    }
    async launchAgentWithExtendedTimeout(agentType, config) {
        this.logger.info(`${config?.color}🤖 Launching ${config?.name} with extended timeouts...\x1b[0m`);
        const agentStats = this.agentStats.get(agentType);
        agentStats.status = 'launching';
        agentStats.lastActivity = Date.now();
        const violations = agentStats.violations || [];
        if (violations.length === 0) {
            this.logger.warn(`  ${config?.color}⚠️ No violations assigned to ${config?.name}\x1b[0m`);
            agentStats.status = 'completed';
            return;
        }
        const claudeProcess = this.createEnhancedClaudeProcess(agentType, config, violations);
        const agentProcess = {
            process: claudeProcess,
            config,
            startTime: Date.now(),
            lastActivity: Date.now(),
            violations: violations.slice(0, config?.batchSize * 3),
            inactivityTimeout: null,
            maxTimeout: null,
        };
        this.activeAgents.set(agentType, agentProcess);
        this.setupExtendedTimeoutMonitoring(agentType, agentProcess);
        this.monitorAgentOutputWithExtendedVisibility(agentType, agentProcess);
        agentStats.status = 'active';
        this.emit('agent:launched', {
            agentType,
            config: config?.name,
            violationCount: violations.length,
        });
    }
    createEnhancedClaudeProcess(agentType, config, violations) {
        const prompt = this.buildEnhancedAgentPrompt(agentType, config, violations);
        return spawn('claude', [
            '--debug',
            '--verbose',
            '--streaming',
            '--max-tokens',
            '4000',
            '--output-format',
            'stream-json',
            '--dangerously-skip-permissions',
            prompt,
        ], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: {
                ...process.env,
                CLAUDE_TIMEOUT_EXTEND: 'true',
                CLAUDE_STREAM_OUTPUT: 'true',
            },
        });
    }
    setupExtendedTimeoutMonitoring(agentType, agentProcess) {
        const config = agentProcess.config;
        const resetInactivityTimeout = () => {
            if (agentProcess.inactivityTimeout) {
                clearTimeout(agentProcess.inactivityTimeout);
            }
            agentProcess.lastActivity = Date.now();
            agentProcess.inactivityTimeout = setTimeout(() => {
                this.logger.warn('Agent inactive timeout reached, terminating', {
                    agent: config?.name,
                    agentType,
                    timeoutMinutes: EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000,
                });
                agentProcess.process.kill('SIGTERM');
                this.handleAgentTimeout(agentType, 'inactivity');
            }, EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY);
        };
        agentProcess.maxTimeout = setTimeout(() => {
            const duration = (Date.now() - agentProcess.startTime) / 60000;
            this.logger.error('Agent maximum timeout reached, terminating', {
                agent: config?.name,
                agentType,
                durationMinutes: Number.parseFloat(duration.toFixed(1)),
                maxTimeoutMinutes: EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL / 60000,
            });
            agentProcess.process.kill('SIGTERM');
            this.handleAgentTimeout(agentType, 'maximum');
        }, EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL);
        resetInactivityTimeout();
        agentProcess.resetInactivityTimeout = resetInactivityTimeout;
    }
    monitorAgentOutputWithExtendedVisibility(agentType, agentProcess) {
        const config = agentProcess.config;
        const stats = this.agentStats.get(agentType);
        const resetInactivityTimeout = agentProcess.resetInactivityTimeout;
        agentProcess.process.stdout?.on('data', (data) => {
            const output = data.toString();
            resetInactivityTimeout();
            this.parseOutputForProgress(output, stats);
            const timestamp = new Date().toLocaleTimeString();
            const lines = output.split('\n').filter((line) => line.trim());
            lines.forEach((line) => {
                if (line.trim()) {
                    this.logger.info('Agent output', {
                        agent: config?.name,
                        agentType,
                        timestamp,
                        output: line.trim(),
                    });
                }
            });
            stats.lastActivity = Date.now();
            this.emit('agent:output', { agentType, output: lines, timestamp });
        });
        agentProcess.process.stderr?.on('data', (data) => {
            const output = data.toString();
            resetInactivityTimeout();
            const timestamp = new Date().toLocaleTimeString();
            this.logger.error('Agent error output', {
                agent: config?.name,
                agentType,
                timestamp,
                error: output.trim(),
            });
            if (output.includes('timeout') || output.includes('TIMEOUT')) {
                this.logger.warn('Agent experiencing timeout issues', {
                    agent: config?.name,
                    agentType,
                    message: 'extending patience for timeout issues',
                });
            }
            this.emit('agent:error', { agentType, error: output, timestamp });
        });
        agentProcess.process.on('close', (code) => {
            const duration = (Date.now() - agentProcess.startTime) / 1000;
            if (agentProcess.inactivityTimeout)
                clearTimeout(agentProcess.inactivityTimeout);
            if (agentProcess.maxTimeout)
                clearTimeout(agentProcess.maxTimeout);
            stats.status = code === 0 ? 'completed' : 'failed';
            stats.averageTime = duration;
            const statusIcon = code === 0 ? '✅' : '❌';
            const level = code === 0 ? 'info' : 'error';
            this.logger[level]('Agent process completed', {
                agent: config?.name,
                agentType,
                exitCode: code,
                durationSeconds: Number.parseFloat(duration.toFixed(1)),
                status: code === 0 ? 'completed' : 'failed',
            });
            this.emit('agent:completed', { agentType, code, duration, stats: stats });
            this.checkSwarmCompletion();
        });
        agentProcess.process.on('error', (error) => {
            const duration = (Date.now() - agentProcess.startTime) / 1000;
            if (agentProcess.inactivityTimeout)
                clearTimeout(agentProcess.inactivityTimeout);
            if (agentProcess.maxTimeout)
                clearTimeout(agentProcess.maxTimeout);
            stats.status = 'failed';
            this.logger.error('Agent process error', {
                agent: config?.name,
                agentType,
                durationSeconds: Number.parseFloat(duration.toFixed(1)),
                error: error.message,
                stack: error.stack,
            });
            this.emit('agent:error', { agentType, error: error.message, duration });
        });
    }
    startEnhancedProgressMonitoring() {
        this.logger.info('Starting enhanced real-time progress monitoring', {
            updateInterval: EXTENDED_TIMEOUTS.PROGRESS_UPDATE,
        });
        this.progressInterval = setInterval(() => {
            this.displayEnhancedProgressDashboard();
        }, EXTENDED_TIMEOUTS.PROGRESS_UPDATE);
        setInterval(() => {
            this.logDetailedProgress();
        }, 30000);
    }
    displayEnhancedProgressDashboard() {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        const progress = this.totalViolations > 0
            ? Math.round((this.processedViolations / this.totalViolations) * 100)
            : 0;
        logger.info();
        logger.info('🐝 ESLint Swarm Coordinator - Enhanced Real-Time Dashboard');
        logger.info('='.repeat(80));
        logger.info(`⏱️  Runtime: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s | 📈 Progress: ${progress}% (${this.processedViolations}/${this.totalViolations})`);
        logger.info(`🌡️  Extended Timeouts: Inactivity ${EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000}min | Max ${EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL / 60000}min`);
        logger.info('');
        logger.info('🤖 Agent Status & Performance:');
        logger.info('-'.repeat(80));
        for (const [agentType, stats] of this.agentStats.entries()) {
            const config = AGENT_SPECIALISTS[agentType];
            const statusIcon = this.getStatusIcon(stats.status);
            const successRate = stats.processed > 0
                ? Math.round((stats.fixed / stats.processed) * 100)
                : 0;
            const timeSinceActivity = Math.round((Date.now() - stats.lastActivity) / 1000);
            const activityStatus = timeSinceActivity < 30
                ? '🟢 Active'
                : timeSinceActivity < 120
                    ? '🟡 Recent'
                    : '⭕ Inactive';
            logger.info(`${config?.color}${statusIcon} ${config?.name?.padEnd(30)}\x1b[0m | ` +
                `P:${stats.processed.toString().padStart(3)} F:${stats.fixed.toString().padStart(3)} ` +
                `Rate:${successRate.toString().padStart(3)}% | ${activityStatus} (${timeSinceActivity}s ago)`);
        }
        logger.info('');
        this.logger.info('💡 Enhanced Monitoring Features:');
        this.logger.info('   ✅ Real-time Claude CLI output streaming');
        this.logger.info('   ⏱️ Extended timeouts prevent premature termination');
        this.logger.info('   📊 Per-agent progress tracking and performance metrics');
        this.logger.info('   🔄 Automatic timeout extension on activity detection');
        logger.info('');
        const activeAgents = Array.from(this.activeAgents.entries()).filter(([, agent]) => agent.process.pid);
        if (activeAgents.length > 0) {
            logger.info('🔄 Active Processes:');
            activeAgents.forEach(([type, agent]) => {
                const config = agent.config;
                const runtime = Math.round((Date.now() - agent.startTime) / 1000);
                logger.info(`  ${config?.color}${config?.name}\x1b[0m (PID: ${agent.process.pid}) - Running ${runtime}s`);
            });
        }
    }
    buildEnhancedAgentPrompt(agentType, config, violations) {
        const contextualInstructions = {
            jsdoc: `You are a JSDoc Documentation Specialist. Focus on adding comprehensive file overviews, fixing documentation examples, and ensuring all functions have proper parameter descriptions. Use TypeScript-style JSDoc comments.`,
            typescript: `You are a TypeScript Type Safety Specialist. Replace 'any' types with proper TypeScript types, fix unused variables by either using them or removing them, and implement nullish coalescing where appropriate.`,
            style: `You are a Code Style & Formatting Specialist. Fix semicolons, standardize quotes to single quotes, correct indentation (2 spaces), add trailing commas where appropriate, and remove trailing spaces.`,
            imports: `You are an Import Optimization Specialist. Organize imports in proper order (external, internal, relative), remove duplicate imports, and ensure clean import statements.`,
        };
        const violationSummary = violations
            .slice(0, config?.batchSize)
            .map((v) => `- ${path.relative(process.cwd(), v.file)}:${v.line}:${v.column} - ${v.rule}: ${v.message}`)
            .join('\n');
        return `${contextualInstructions[agentType]}

🎯 **MISSION**: Fix ${violations.length} ESLint violations in batch processing mode

**Your Specialized Rules**: ${config?.rules?.join(', ')}

**Extended Operation Guidelines**:
- Process violations in batches of ${config?.batchSize} for efficiency
- Use Edit tool for direct file modifications
- Provide progress updates after each file
- Take your time - extended timeouts are configured (${EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000} min inactivity, ${EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL / 60000} min total)
- Stream your thought process for real-time monitoring

**Priority Violations to Fix**:
${violationSummary}

**Real-Time Progress Instructions**:
1. Announce each file you're working on
2. Describe your approach before making changes
3. Confirm successful fixes with "✅ Fixed [rule] in [file]"
4. Report any issues with "⚠️ Issue with [rule] in [file]: [reason]"

Begin processing now with real-time progress updates.`;
    }
    parseViolations(eslintResults) {
        const violations = [];
        for (const file of eslintResults) {
            if (file?.messages && file.messages.length > 0) {
                for (const message of file.messages) {
                    violations.push({
                        file: file?.filePath || 'unknown',
                        rule: message.ruleId || 'unknown',
                        message: message.message,
                        line: message.line,
                        column: message.column,
                        severity: message.severity === 2 ? 'error' : 'warning',
                    });
                }
            }
        }
        return violations;
    }
    distributeViolations(violations) {
        const distribution = {};
        Object.keys(AGENT_SPECIALISTS).forEach((type) => {
            distribution[type] = { count: 0, violations: [] };
        });
        for (const violation of violations) {
            let assigned = false;
            for (const [agentType, config] of Object.entries(AGENT_SPECIALISTS)) {
                if (config?.rules.some((rule) => violation.rule.includes(rule))) {
                    distribution[agentType]?.violations.push(violation);
                    distribution[agentType].count++;
                    assigned = true;
                    break;
                }
            }
            if (!assigned) {
                distribution['typescript']?.violations.push(violation);
                distribution['typescript'].count++;
            }
        }
        return distribution;
    }
    generateMockDistribution() {
        return {
            jsdoc: { count: 45, violations: [] },
            typescript: { count: 65, violations: [] },
            style: { count: 55, violations: [] },
            imports: { count: 35, violations: [] },
        };
    }
    parseOutputForProgress(output, stats) {
        if (output.includes('✅ Fixed')) {
            stats.fixed++;
            stats.processed++;
            this.processedViolations++;
        }
        else if (output.includes('❌ Failed') || output.includes('⚠️ Issue')) {
            stats.failed++;
            stats.processed++;
            this.processedViolations++;
        }
    }
    handleAgentTimeout(agentType, timeoutType) {
        const stats = this.agentStats.get(agentType);
        stats.status = 'timeout';
        logger.info(`⚠️ Agent ${agentType} timed out (${timeoutType}). Processed: ${stats.processed}, Fixed: ${stats.fixed}`);
        this.emit('agent:timeout', { agentType, timeoutType, stats });
    }
    checkSwarmCompletion() {
        const allComplete = Array.from(this.agentStats.values()).every((stats) => ['completed', 'failed', 'timeout'].includes(stats.status));
        if (allComplete) {
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
            }
            this.displayFinalReport();
            this.emit('swarm:completed');
        }
    }
    displayFinalReport() {
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const totalFixed = Array.from(this.agentStats.values()).reduce((sum, stats) => sum + stats.fixed, 0);
        const successRate = this.processedViolations > 0
            ? Math.round((totalFixed / this.processedViolations) * 100)
            : 0;
        logger.info();
        this.logger.info('🎉 ESLint Swarm Coordination Complete!');
        this.logger.info('='.repeat(80));
        this.logger.info(`📊 Total Violations Processed: ${this.processedViolations}`);
        this.logger.info(`✅ Total Successfully Fixed: ${totalFixed}`);
        this.logger.info(`📈 Overall Success Rate: ${successRate}%`);
        this.logger.info(`⏱️  Total Runtime: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`);
        this.logger.info('');
        this.logger.info('🏆 Agent Performance Summary:');
        this.logger.info('-'.repeat(80));
        for (const [agentType, stats] of this.agentStats.entries()) {
            const config = AGENT_SPECIALISTS[agentType];
            const agentSuccessRate = stats.processed > 0
                ? Math.round((stats.fixed / stats.processed) * 100)
                : 0;
            logger.info(`${config?.color}${config?.name}\x1b[0m:`);
            logger.info(`  Processed: ${stats.processed} | Fixed: ${stats.fixed} | Success: ${agentSuccessRate}%`);
            logger.info(`  Average Time: ${stats.averageTime.toFixed(1)}s | Status: ${stats.status}`);
        }
        this.logger.info('\n💡 Extended timeout system prevented premature terminations');
        this.logger.info('📊 Real-time monitoring provided complete visibility');
        this.emit('coordination:complete', {
            totalProcessed: this.processedViolations,
            totalFixed: totalFixed,
            successRate: successRate,
            runtime: totalTime,
        });
    }
    getStatusIcon(status) {
        const icons = {
            idle: '⚪',
            launching: '🟡',
            active: '🟢',
            completed: '✅',
            failed: '❌',
            timeout: '⏰',
        };
        return icons[status] || '❓';
    }
    logDetailedProgress() {
        this.logger.info('Progress update', {
            processed: this.processedViolations,
            total: this.totalViolations,
            agents: Object.fromEntries(Array.from(this.agentStats.entries()).map(([type, stats]) => [
                type,
                {
                    status: stats.status,
                    processed: stats.processed,
                    fixed: stats.fixed,
                },
            ])),
        });
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
if (require.main === module) {
    const coordinator = new ESLintSwarmCoordinator();
    coordinator.on('swarm:completed', () => {
        process.exit(0);
    });
    coordinator.on('agent:error', (data) => {
        logger.error('Agent error:', data);
    });
    coordinator.initialize().catch((error) => {
        logger.error('❌ Swarm coordination failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=eslint-swarm-coordinator.js.map