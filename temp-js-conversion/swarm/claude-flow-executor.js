"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeFlowExecutor = void 0;
const logger_js_1 = require("../core/logger.js");
const node_child_process_1 = require("node:child_process");
const paths_js_1 = require("../utils/paths.js");
class ClaudeFlowExecutor {
    constructor(config = {}) {
        this.logger = config.logger || new logger_js_1.Logger({ level: 'info', format: 'text', destination: 'console' }, { component: 'ClaudeFlowExecutor' });
        this.claudeFlowPath = config.claudeFlowPath || (0, paths_js_1.getClaudeFlowBin)();
        this.enableSparc = config.enableSparc ?? true;
        this.verbose = config.verbose ?? false;
        this.timeoutMinutes = config.timeoutMinutes ?? 59;
    }
    async executeTask(task, agent, targetDir) {
        this.logger.info('Executing task with Claude Flow SPARC', {
            taskId: task.id.id,
            taskName: task.name,
            agentType: agent.type,
            targetDir
        });
        const startTime = Date.now();
        try {
            // Determine the SPARC mode based on task type and agent type
            const sparcMode = this.determineSparcMode(task, agent);
            // Build the command
            const command = this.buildSparcCommand(task, sparcMode, targetDir);
            this.logger.info('Executing SPARC command', {
                mode: sparcMode,
                command: command.join(' ')
            });
            // Execute the command
            const result = await this.executeCommand(command);
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            return {
                output: result.output,
                artifacts: result.artifacts || {},
                metadata: {
                    executionTime,
                    sparcMode,
                    command: command.join(' '),
                    exitCode: result.exitCode,
                    quality: 0.95,
                    completeness: 0.9
                },
                error: result.error
            };
        }
        catch (error) {
            this.logger.error('Failed to execute Claude Flow SPARC command', {
                error: (error instanceof Error ? error.message : String(error)),
                taskId: task.id.id
            });
            return {
                output: '',
                artifacts: {},
                metadata: {
                    executionTime: Date.now() - startTime,
                    quality: 0,
                    completeness: 0
                },
                error: (error instanceof Error ? error.message : String(error))
            };
        }
    }
    determineSparcMode(task, agent) {
        // Map task types and agent types to SPARC modes
        const modeMap = {
            // Task type mappings
            'coding': 'code',
            'testing': 'tdd',
            'analysis': 'spec-pseudocode',
            'documentation': 'docs-writer',
            'research': 'spec-pseudocode',
            'review': 'refinement-optimization-mode',
            'deployment': 'devops',
            'optimization': 'refinement-optimization-mode',
            'integration': 'integration',
            // Agent type overrides
            'coder': 'code',
            'tester': 'tdd',
            'analyst': 'spec-pseudocode',
            'documenter': 'docs-writer',
            'reviewer': 'refinement-optimization-mode',
            'researcher': 'spec-pseudocode',
            'coordinator': 'architect'
        };
        // Check for specific keywords in task description
        const description = task.description.toLowerCase();
        if (description.includes('architecture') || description.includes('design')) {
            return 'architect';
        }
        if (description.includes('security')) {
            return 'security-review';
        }
        if (description.includes('debug')) {
            return 'debug';
        }
        if (description.includes('test')) {
            return 'tdd';
        }
        if (description.includes('document')) {
            return 'docs-writer';
        }
        if (description.includes('integrate')) {
            return 'integration';
        }
        // Use agent type first, then task type
        return modeMap[agent.type] || modeMap[task.type] || 'code';
    }
    buildSparcCommand(task, mode, targetDir) {
        const command = [
            this.claudeFlowPath,
            'sparc',
            'run',
            mode,
            `"${this.formatTaskDescription(task)}"`
        ];
        // Add options
        if (targetDir) {
            command.push('--target-dir', targetDir);
        }
        if (this.verbose) {
            command.push('--verbose');
        }
        // Add non-interactive flag
        command.push('--non-interactive');
        // Add auto-confirm flag
        command.push('--yes');
        return command;
    }
    formatTaskDescription(task) {
        // Format the task description for SPARC command
        let description = task.description;
        // If the task has specific instructions, include them
        if (task.instructions && task.instructions !== task.description) {
            description = `${task.description}. ${task.instructions}`;
        }
        // Add context if available
        if (task.context?.targetDir) {
            description += ` in ${task.context.targetDir}`;
        }
        return description.replace(/"/g, '\\"');
    }
    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command;
            const proc = (0, node_child_process_1.spawn)(cmd, args, {
                shell: true,
                env: {
                    ...process.env,
                    CLAUDE_FLOW_NON_INTERACTIVE: 'true',
                    CLAUDE_FLOW_AUTO_CONFIRM: 'true'
                }
            });
            let stdout = '';
            let stderr = '';
            const artifacts = {};
            proc.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                // Parse artifacts from output
                const artifactMatch = chunk.match(/Created file: (.+)/g);
                if (artifactMatch) {
                    artifactMatch.forEach(match => {
                        const filePath = match.replace('Created file: ', '').trim();
                        artifacts[filePath] = true;
                    });
                }
            });
            proc.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            proc.on('close', (code) => {
                clearTimeout(timeoutId); // Clear timeout when process completes
                if (code === 0) {
                    resolve({
                        output: stdout,
                        artifacts,
                        exitCode: code,
                        error: null
                    });
                }
                else {
                    resolve({
                        output: stdout,
                        artifacts,
                        exitCode: code,
                        error: stderr || `Command exited with code ${code}`
                    });
                }
            });
            proc.on('error', (err) => {
                reject(err);
            });
            // Handle timeout - configurable for SPARC operations
            const timeoutMs = this.timeoutMinutes * 60 * 1000;
            const timeoutId = setTimeout(() => {
                proc.kill('SIGTERM');
                reject(new Error('Command execution timeout'));
            }, timeoutMs);
        });
    }
}
exports.ClaudeFlowExecutor = ClaudeFlowExecutor;
// Export for use in swarm coordinator
exports.default = ClaudeFlowExecutor;
