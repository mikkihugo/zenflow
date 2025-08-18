/**
 * Task Approval System - Human-in-the-loop approval for generated swarm tasks
 *
 * Integrates with existing AGUI system to provide human approval workflow
 * for tasks generated from document scanning and code analysis.
 *
 * Uses the existing WorkflowAGUIAdapter and document entity system
 * for consistent user experience and audit trail.
 *
 * @file Task approval system with AGUI integration.
 */
import { EventEmitter } from 'eventemitter3';
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('TaskApprovalSystem');
/**
 * Task Approval System with AGUI integration
 */
export class TaskApprovalSystem extends EventEmitter {
    agui;
    config;
    approvalHistory = [];
    storage;
    statistics = {
        totalTasksProcessed: 0,
        approvalRate: 0,
        rejectionRate: 0,
        modificationRate: 0,
        averageProcessingTime: 0,
        topRejectionReasons: [],
        approvalsByType: {}
    };
    constructor(agui, config = {}) {
        super();
        this.agui = agui;
        // Use default configuration with overrides
        this.config = {
            enableRichDisplay: config.enableRichDisplay ?? true,
            enableBatchMode: config.enableBatchMode ?? true,
            batchSize: config.batchSize ?? 5,
            autoApproveLowSeverity: config.autoApproveLowSeverity ?? true,
            requireRationale: config.requireRationale ?? true,
            enableModification: config.enableModification ?? true,
            ...config
        };
        // Initialize storage for approval history persistence
        this.initializeStorage();
        logger.info('TaskApprovalSystem initialized', { config: this.config });
    }
    /**
     * Initialize storage for approval history persistence
     */
    async initializeStorage() {
        try {
            // For now, use memory-only storage
            // TODO: Integrate with database when available
            this.storage = null;
            logger.debug('Task approval system using memory-only storage');
        }
        catch (error) {
            logger.warn('Failed to initialize storage, using memory-only mode', { error });
            this.storage = null;
        }
    }
    /**
     * Review and approve tasks generated from document scanning
     */
    async reviewGeneratedTasks(scanResults) {
        const startTime = Date.now();
        logger.info(`Starting task approval process for ${scanResults.generatedTasks.length} tasks`);
        // Show scan summary first
        await this.showScanSummary(scanResults);
        // Process tasks in batches or individually based on config
        const decisions = [];
        const approvedTasks = [];
        if (this.config.enableBatchMode && scanResults.generatedTasks.length > this.config.batchSize) {
            // Process in batches
            for (let i = 0; i < scanResults.generatedTasks.length; i += this.config.batchSize) {
                const batch = scanResults.generatedTasks.slice(i, i + this.config.batchSize);
                const batchDecisions = await this.processBatch(batch);
                decisions.push(...batchDecisions);
                // Add approved tasks from this batch
                for (const decision of batchDecisions) {
                    if (decision.approved) {
                        const originalTask = batch.find(t => t.id === decision.taskId);
                        if (originalTask) {
                            approvedTasks.push(this.applyModifications(originalTask, decision));
                        }
                    }
                }
            }
        }
        else {
            // Process individually
            for (const task of scanResults.generatedTasks) {
                const decision = await this.reviewSingleTask(task);
                decisions.push(decision);
                if (decision.approved) {
                    approvedTasks.push(this.applyModifications(task, decision));
                }
            }
        }
        // Calculate results
        const results = {
            totalTasks: scanResults.generatedTasks.length,
            approved: decisions.filter(d => d.approved).length,
            rejected: decisions.filter(d => d.decision === 'reject').length,
            modified: decisions.filter(d => d.decision === 'modify').length,
            deferred: decisions.filter(d => d.decision === 'defer').length,
            decisions,
            processingTime: Date.now() - startTime,
            approvedTasks
        };
        // Update statistics
        this.updateStatistics(decisions, results.processingTime);
        // Store approval history
        this.approvalHistory.push(...decisions);
        // Show final summary
        await this.showApprovalSummary(results);
        logger.info('Task approval process completed', {
            totalTasks: results.totalTasks,
            approved: results.approved,
            rejected: results.rejected,
            processingTime: results.processingTime
        });
        this.emit('approval:completed', results);
        return results;
    }
    /**
     * Review a single task for approval
     */
    async reviewSingleTask(task) {
        const correlationId = `task-approval-${task.id}-${Date.now()}`;
        // Auto-approve low severity tasks if configured
        if (this.config.autoApproveLowSeverity &&
            task.sourceAnalysis.severity === 'low' &&
            task.priority === 'low') {
            logger.debug(`Auto-approving low severity task: ${task.id}`);
            return {
                taskId: task.id,
                approved: true,
                decision: 'approve',
                rationale: 'Auto-approved: Low severity task with low priority',
                decisionMaker: 'system',
                timestamp: new Date(),
                correlationId
            };
        }
        // Create validation question for AGUI
        const question = this.createTaskReviewQuestion(task, correlationId);
        // Display rich task information if enabled
        if (this.config.enableRichDisplay) {
            await this.displayTaskDetails(task);
        }
        // Get user decision through AGUI
        const response = await this.agui.askQuestion(question);
        // Parse decision
        const decision = this.parseApprovalResponse(response);
        // Get rationale if required
        let rationale = this.extractRationale(response);
        if (!rationale && (this.config.requireRationale || decision.decision === 'reject')) {
            rationale = await this.askForRationale(decision.decision);
        }
        // Get modifications if needed
        let modifications;
        if (decision.decision === 'modify' && this.config.enableModification) {
            modifications = await this.getTaskModifications(task);
        }
        const approvalDecision = {
            taskId: task.id,
            approved: decision.approved,
            decision: decision.decision,
            ...(modifications !== undefined && { modifications }),
            rationale: rationale || 'No rationale provided',
            decisionMaker: 'user', // In production, this would be actual user ID
            timestamp: new Date(),
            correlationId
        };
        this.emit('task:reviewed', { task, decision: approvalDecision });
        return approvalDecision;
    }
    /**
     * Process a batch of tasks for approval
     */
    async processBatch(tasks) {
        await this.agui.showMessage(`\n📋 Reviewing batch of ${tasks.length} tasks`, 'info');
        // Show batch summary
        await this.showBatchSummary(tasks);
        // Ask for batch decision
        const batchQuestion = {
            id: `batch-review-${Date.now()}`,
            type: 'review',
            question: 'How would you like to process this batch?',
            context: { taskCount: tasks.length },
            options: [
                'Approve all tasks',
                'Review each task individually',
                'Reject entire batch',
                'Apply bulk modifications'
            ],
            confidence: 0.8,
            priority: 'medium'
        };
        const batchResponse = await this.agui.askQuestion(batchQuestion);
        switch (batchResponse) {
            case 'Approve all tasks':
            case '1':
                return this.approveAllTasks(tasks, 'Bulk approval of entire batch');
            case 'Reject entire batch':
            case '3':
                return this.rejectAllTasks(tasks, 'Bulk rejection of entire batch');
            case 'Apply bulk modifications':
            case '4':
                return this.applyBulkModifications(tasks);
            default:
                // Review individually
                const decisions = [];
                for (const task of tasks) {
                    const decision = await this.reviewSingleTask(task);
                    decisions.push(decision);
                }
                return decisions;
        }
    }
    /**
     * Show scan summary to user
     */
    async showScanSummary(scanResults) {
        const summary = `
🔍 Document Scan Results Summary
================================
📁 Files Scanned: ${scanResults.scannedFiles}
🔍 Issues Found: ${scanResults.totalIssues}
📋 Tasks Generated: ${scanResults.generatedTasks.length}
⏱️  Scan Duration: ${Math.round(scanResults.scanDuration / 1000)}s

📊 Issue Severity Breakdown:
${Object.entries(scanResults.severityCounts)
            .map(([severity, count]) => `   ${severity}: ${count}`)
            .join('\n')}

📈 Issue Pattern Breakdown:
${Object.entries(scanResults.patternCounts)
            .map(([pattern, count]) => `   ${pattern}: ${count}`)
            .join('\n')}
`;
        await this.agui.showMessage(summary, 'info');
    }
    /**
     * Display detailed task information
     */
    async displayTaskDetails(task) {
        const details = `
🎯 Task Review: ${task.title}
${'='.repeat(60)}
📝 Description: ${task.description}
🏷️  Type: ${task.type}
⚡ Priority: ${task.priority} 
⏱️  Estimated Hours: ${task.estimatedHours}
🤖 Suggested Swarm: ${task.suggestedSwarmType}
👥 Required Agents: ${task.requiredAgentTypes.join(', ')}

📊 Source Analysis:
   • File: ${task.sourceAnalysis.filePath}
   • Line: ${task.sourceAnalysis.lineNumber || 'N/A'}
   • Type: ${task.sourceAnalysis.type}
   • Severity: ${task.sourceAnalysis.severity}
   • Code: ${task.sourceAnalysis.codeSnippet || 'N/A'}

✅ Acceptance Criteria:
${task.acceptanceCriteria.map(criterion => `   • ${criterion}`).join('\n')}

🏷️  Tags: ${task.sourceAnalysis.tags.join(', ')}
`;
        await this.agui.showMessage(details, 'info');
    }
    /**
     * Show batch summary
     */
    async showBatchSummary(tasks) {
        const summary = `
📦 Batch Summary (${tasks.length} tasks)
${'='.repeat(40)}
${tasks.map((task, index) => `${index + 1}. ${task.title} [${task.priority}] (${task.estimatedHours}h)`).join('\n')}
`;
        await this.agui.showMessage(summary, 'info');
    }
    /**
     * Show final approval summary
     */
    async showApprovalSummary(results) {
        const summary = `
✅ Task Approval Summary
========================
📋 Total Tasks: ${results.totalTasks}
✅ Approved: ${results.approved}
❌ Rejected: ${results.rejected}
📝 Modified: ${results.modified}
⏸️  Deferred: ${results.deferred}
⏱️  Processing Time: ${Math.round(results.processingTime / 1000)}s

${results.approved > 0 ?
            `\n🚀 ${results.approved} tasks approved and ready for swarm execution!` :
            '\n⚠️  No tasks were approved for execution.'}
`;
        await this.agui.showMessage(summary, 'success');
    }
    /**
     * Create validation question for task review
     */
    createTaskReviewQuestion(task, correlationId) {
        return {
            id: `task-review-${task.id}`,
            type: 'review',
            question: `Do you want to approve this ${task.type}? "${task.title}"`,
            context: {
                task,
                analysis: task.sourceAnalysis,
                correlationId
            },
            options: [
                'Approve - Add to swarm queue',
                'Modify - Make changes before approval',
                'Reject - Do not create this task',
                'Defer - Review later'
            ],
            allowCustom: true,
            confidence: 0.9,
            priority: task.priority,
            validationReason: `Task generated from ${task.sourceAnalysis.type} analysis`
        };
    }
    /**
     * Parse user response to approval question
     */
    parseApprovalResponse(response) {
        const lowerResponse = response.toLowerCase();
        if (lowerResponse.includes('approve') || lowerResponse === '1') {
            return { decision: 'approve', approved: true };
        }
        if (lowerResponse.includes('modify') || lowerResponse === '2') {
            return { decision: 'modify', approved: true };
        }
        if (lowerResponse.includes('reject') || lowerResponse === '3') {
            return { decision: 'reject', approved: false };
        }
        if (lowerResponse.includes('defer') || lowerResponse === '4') {
            return { decision: 'defer', approved: false };
        }
        // Default to approval for positive responses
        const positiveKeywords = ['yes', 'ok', 'sure', 'good', 'fine'];
        if (positiveKeywords.some(keyword => lowerResponse.includes(keyword))) {
            return { decision: 'approve', approved: true };
        }
        return { decision: 'reject', approved: false };
    }
    /**
     * Extract rationale from response
     */
    extractRationale(response) {
        const rationaleMarkers = ['because', 'since', 'reason:', 'rationale:', 'due to'];
        for (const marker of rationaleMarkers) {
            const index = response.toLowerCase().indexOf(marker);
            if (index >= 0) {
                return response.substring(index).trim();
            }
        }
        // If response is longer than a simple yes/no, treat it as rationale
        if (response.length > 10 && !['1', '2', '3', '4'].includes(response)) {
            return response;
        }
        return undefined;
    }
    /**
     * Ask for rationale for decision
     */
    async askForRationale(decision) {
        const rationaleQuestion = {
            id: `rationale-${Date.now()}`,
            type: 'review',
            question: `Please provide a rationale for your ${decision} decision:`,
            context: { decision },
            confidence: 1.0,
            priority: 'medium'
        };
        return await this.agui.askQuestion(rationaleQuestion);
    }
    /**
     * Get modifications for a task
     */
    async getTaskModifications(task) {
        const modifications = {};
        // Ask what to modify
        const modifyQuestion = {
            id: `modify-${task.id}`,
            type: 'review',
            question: 'What would you like to modify?',
            context: { task },
            options: [
                'Title',
                'Description',
                'Priority',
                'Estimated Hours',
                'Required Agent Types',
                'Acceptance Criteria',
                'Multiple items'
            ],
            confidence: 0.8
        };
        const modifyResponse = await this.agui.askQuestion(modifyQuestion);
        // Handle specific modifications based on response
        if (modifyResponse.includes('Title') || modifyResponse === '1') {
            modifications.title = await this.askForNewValue('title', task.title);
        }
        if (modifyResponse.includes('Description') || modifyResponse === '2') {
            modifications.description = await this.askForNewValue('description', task.description);
        }
        if (modifyResponse.includes('Priority') || modifyResponse === '3') {
            const priorityQuestion = {
                id: `priority-${task.id}`,
                type: 'review',
                question: 'Select new priority:',
                options: ['low', 'medium', 'high', 'critical'],
                context: { currentPriority: task.priority },
                confidence: 1.0
            };
            const newPriority = await this.agui.askQuestion(priorityQuestion);
            modifications.priority = newPriority;
        }
        if (modifyResponse.includes('Hours') || modifyResponse === '4') {
            const hoursStr = await this.askForNewValue('estimated hours', task.estimatedHours.toString());
            modifications.estimatedHours = Number.parseInt(hoursStr) || task.estimatedHours;
        }
        return modifications;
    }
    /**
     * Ask for new value for a field
     */
    async askForNewValue(fieldName, currentValue) {
        const question = {
            id: `new-${fieldName}-${Date.now()}`,
            type: 'review',
            question: `Enter new ${fieldName} (current: "${currentValue}"):`,
            context: { fieldName, currentValue },
            confidence: 1.0
        };
        return await this.agui.askQuestion(question);
    }
    /**
     * Apply modifications to a task
     */
    applyModifications(task, decision) {
        if (!decision.modifications) {
            return task;
        }
        return {
            ...task,
            title: decision.modifications.title || task.title,
            description: decision.modifications.description || task.description,
            priority: decision.modifications.priority || task.priority,
            estimatedHours: decision.modifications.estimatedHours || task.estimatedHours,
            requiredAgentTypes: decision.modifications.requiredAgentTypes || task.requiredAgentTypes,
            acceptanceCriteria: decision.modifications.acceptanceCriteria || task.acceptanceCriteria
        };
    }
    /**
     * Approve all tasks in a batch
     */
    approveAllTasks(tasks, rationale) {
        return tasks.map(task => ({
            taskId: task.id,
            approved: true,
            decision: 'approve',
            rationale,
            decisionMaker: 'user',
            timestamp: new Date(),
            correlationId: `batch-approve-${Date.now()}`
        }));
    }
    /**
     * Reject all tasks in a batch
     */
    rejectAllTasks(tasks, rationale) {
        return tasks.map(task => ({
            taskId: task.id,
            approved: false,
            decision: 'reject',
            rationale,
            decisionMaker: 'user',
            timestamp: new Date(),
            correlationId: `batch-reject-${Date.now()}`
        }));
    }
    /**
     * Apply bulk modifications to all tasks
     */
    async applyBulkModifications(tasks) {
        // Get bulk modifications
        const bulkModifications = await this.getBulkModifications();
        return tasks.map(task => ({
            taskId: task.id,
            approved: true,
            decision: 'modify',
            ...(bulkModifications !== undefined && { modifications: bulkModifications }),
            rationale: 'Bulk modifications applied to entire batch',
            decisionMaker: 'user',
            timestamp: new Date(),
            correlationId: `batch-modify-${Date.now()}`
        }));
    }
    /**
     * Get bulk modifications for batch processing
     */
    async getBulkModifications() {
        const question = {
            id: `bulk-modify-${Date.now()}`,
            type: 'review',
            question: 'What bulk modifications would you like to apply?',
            options: [
                'Lower all priorities',
                'Increase estimated hours by 50%',
                'Add specific agent type to all tasks',
                'Custom modifications'
            ],
            context: {},
            confidence: 0.8
        };
        const response = await this.agui.askQuestion(question);
        // Process bulk modification choice
        switch (response) {
            case '1':
            case 'Lower all priorities':
                return { priority: 'low' };
            case '2':
            case 'Increase estimated hours by 50%':
                return {}; // Would need to calculate per-task
            default:
                return {};
        }
    }
    /**
     * Update approval statistics
     */
    updateStatistics(decisions, processingTime) {
        this.statistics.totalTasksProcessed += decisions.length;
        const approved = decisions.filter(d => d.approved).length;
        const rejected = decisions.filter(d => d.decision === 'reject').length;
        const modified = decisions.filter(d => d.decision === 'modify').length;
        this.statistics.approvalRate = approved / decisions.length;
        this.statistics.rejectionRate = rejected / decisions.length;
        this.statistics.modificationRate = modified / decisions.length;
        // Update average processing time
        const currentAvg = this.statistics.averageProcessingTime;
        const newAvg = (currentAvg + processingTime) / 2;
        this.statistics.averageProcessingTime = newAvg;
        // Track rejection reasons
        for (const decision of decisions) {
            if (decision.decision === 'reject') {
                const existingReason = this.statistics.topRejectionReasons.find(r => r.reason === decision.rationale);
                if (existingReason) {
                    existingReason.count++;
                }
                else {
                    this.statistics.topRejectionReasons.push({
                        reason: decision.rationale,
                        count: 1
                    });
                }
            }
        }
        // Sort rejection reasons by count
        this.statistics.topRejectionReasons.sort((a, b) => b.count - a.count);
    }
    /**
     * Get approval statistics
     */
    getStatistics() {
        return { ...this.statistics };
    }
    /**
     * Get approval history
     */
    getApprovalHistory() {
        return [...this.approvalHistory];
    }
    /**
     * Export approval decisions for audit
     */
    exportDecisions(format = 'json') {
        if (format === 'csv') {
            const headers = ['Task ID', 'Decision', 'Approved', 'Rationale', 'Decision Maker', 'Timestamp'];
            const rows = this.approvalHistory.map(decision => [
                decision.taskId,
                decision.decision,
                decision.approved.toString(),
                decision.rationale,
                decision.decisionMaker,
                decision.timestamp.toISOString()
            ]);
            return [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');
        }
        return JSON.stringify(this.approvalHistory, null, 2);
    }
}
/**
 * Create task approval system with AGUI integration
 */
export function createTaskApprovalSystem(agui, config) {
    return new TaskApprovalSystem(agui, config);
}
