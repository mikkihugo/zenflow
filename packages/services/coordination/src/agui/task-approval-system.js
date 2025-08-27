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
import { createAgentMonitor, createCircuitBreaker, createMLMonitor, createPerformanceTracker, EnhancedError, getLogger, recordEvent, recordHistogram, 
// 🔬 Enterprise Telemetry & Monitoring Systems
recordMetric, setTraceAttributes, withAsyncTrace, } from '@claude-zen/foundation';
const _logger = getLogger('TaskApprovalSystem');
';
/**
 * Task Approval System with AGUI integration
 */
export class TaskApprovalSystem extends EventBus {
    agui;
    config;
    logger;
    storageCircuitBreaker;
    aguiCircuitBreaker;
    constructor(agui, config = {}) {
        super();
        this.agui = agui;
        this.logger = getLogger('TaskApprovalSystem');
        ';
        // 🏥 Initialize Foundation monitoring systems
        this.systemMonitor = createSystemMonitor(intervalMs, 5000);
        this.performanceTracker = createPerformanceTracker();
        this.agentMonitor = createAgentMonitor();
        this.mlMonitor = createMLMonitor();
        // 🛡️ Initialize circuit breakers for external dependencies
        this.approvalCircuitBreaker = createCircuitBreaker(() => Promise.resolve())();
        this.storageCircuitBreaker = createCircuitBreaker(() => Promise.resolve())();
        this.aguiCircuitBreaker = createCircuitBreaker(() => Promise.resolve())();
        // Use default configuration with overrides
        this.config = {
            enableRichDisplay: config.enableRichDisplay ?? true,
            enableBatchMode: config.enableBatchMode ?? true,
            batchSize: config.batchSize ?? 5,
            autoApproveLowSeverity: config.autoApproveLowSeverity ?? true,
            requireRationale: config.requireRationale ?? true,
            enableModification: config.enableModification ?? true,
            ...config,
        };
        // 📊 Record initialization metrics
        recordEvent('task_approval_system_initializing', { ': config, JSON, : .stringify(this.config),
            timestamp: Date.now(),
        });
        // Initialize storage for approval history persistence
        this.initializeStorage();
        this.logger.info('TaskApprovalSystem initialized with Foundation monitoring', {
            config: this.config,
            monitoringEnabled: true,
            circuitBreakersEnabled: true,
        });
        // 🎯 Mark as initialized and record metrics
        this.isInitialized = true;
        recordMetric('task_approval_system_initialized', 1);
        ';
        recordEvent('task_approval_system_ready', ', config, JSON.stringify(this.config), timestamp, Date.now());
    }
    /**
     * Initialize storage for approval history persistence
     */
    async initializeStorage() {
        return withAsyncTrace('task-approval-storage-init', async (_span) => {
            ';
            const storageInitStartTime = Date.now();
            try {
                setTraceAttributes({
                    'storage.type': 'memory-only',
                    'storage.initialization': 'starting',
                });
                recordEvent('task_approval_storage_initialization_started', { ': storageType, 'memory-only': ,
                    timestamp: Date.now(),
                });
                // 🛡️ Use circuit breaker protection for storage initialization
                await this.storageCircuitBreaker.execute(async () => {
                    // For now, use memory-only storage
                    // TODO: Integrate with database when available
                    this.storage = null;
                    // 📊 Record successful storage initialization
                    const initDuration = Date.now() - storageInitStartTime;
                    recordHistogram('task_approval_storage_init_duration', initDuration);
                    ';
                    recordMetric('task_approval_storage_initialized', 1);
                    ';
                    setTraceAttributes('storage.initialization', 'completed', 'storage.init_duration_ms', initDuration);
                    this.logger.debug('Task approval system using memory-only storage', { ': initDuration,
                        storageType: 'memory-only',
                    });
                    recordEvent('task_approval_storage_initialization_completed', { ': storageType, 'memory-only': ,
                        duration: initDuration,
                        success: true,
                    });
                });
            }
            catch (error) {
                const initDuration = Date.now() - storageInitStartTime;
                recordMetric('task_approval_storage_init_failed', 1);
                ';
                recordHistogram('task_approval_storage_init_error_duration', initDuration);
                setTraceAttributes({
                    'storage.initialization': 'failed',
                    'storage.error': ',
                    error, instanceof: Error ? error.message : String(error),
                    'storage.init_duration_ms': initDuration,
                });
                this.logger.warn('Failed to initialize storage, using memory-only mode', {
                    error: error instanceof Error ? error.message : String(error),
                    duration: initDuration,
                });
                recordEvent('task_approval_storage_initialization_failed', { ': error, error, instanceof: Error ? error.message : String(error),
                    duration: initDuration,
                    fallbackMode: 'memory-only',
                });
                this.storage = null; // Fallback to memory-only mode
            }
        });
    }
    /**
     * Review and approve tasks generated from document scanning
     */
    async reviewGeneratedTasks(scanResults) {
        return withAsyncTrace('task-approval-review-process', async (_span) => {
            ';
            const startTime = Date.now();
            setTraceAttributes({
                'tasks.total_count': scanResults.generatedTasks.length,
                'tasks.batch_mode': this.config.enableBatchMode,
                'tasks.batch_size': this.config.batchSize,
                'tasks.scan_duration': scanResults.scanDuration,
            });
            recordEvent('task_approval_review_started', { ': totalTasks, scanResults, : .generatedTasks.length,
                batchMode: this.config.enableBatchMode,
                batchSize: this.config.batchSize,
                timestamp: Date.now(),
            });
            this.logger.info(`Starting task approval process for ${scanResults.generatedTasks.length} tasks`, `
        {
          totalTasks: scanResults.generatedTasks.length,
          batchMode: this.config.enableBatchMode,
          batchSize: this.config.batchSize,
        }
      );

      try {
        // 🛡️ Use circuit breaker protection for approval processing
        return await this.approvalCircuitBreaker.execute(async () => {
          // Show scan summary first
          await this.showScanSummary(scanResults);

          // Process tasks in batches or individually based on config
          const decisions: TaskApprovalDecision[] = [];
          const approvedTasks: GeneratedSwarmTask[] = [];

          if (
            this.config.enableBatchMode &&
            scanResults.generatedTasks.length > this.config.batchSize
          ) {
            // 📦 Process in batches with comprehensive telemetry
            const totalBatches = Math.ceil(
              scanResults.generatedTasks.length / this.config.batchSize
            );
            recordGauge('task_approval_batch_count', totalBatches);'

            for (
              let i = 0;
              i < scanResults.generatedTasks.length;
              i += this.config.batchSize
            ) {
              const batchIndex = Math.floor(i / this.config.batchSize);
              const batch = scanResults.generatedTasks.slice(
                i,
                i + this.config.batchSize
              );

              recordEvent('task_approval_batch_processing_started', {'
                batchIndex,
                batchSize: batch.length,
                totalBatches,
              });

              const batchStartTime = Date.now();
              const batchDecisions = await this.processBatch(batch);
              const batchDuration = Date.now() - batchStartTime;

              recordHistogram(
                'task_approval_batch_processing_duration',
                batchDuration,
                {
                  batchIndex: batchIndex.toString(),
                  batchSize: batch.length.toString(),
                }
              );

              decisions.push(...batchDecisions);

              // Add approved tasks from this batch with metrics
              let batchApprovedCount = 0;
              for (const decision of batchDecisions) {
                if (decision.approved) {
                  const originalTask = batch.find(
                    (t) => t.id === decision.taskId
                  );
                  if (originalTask) {
                    approvedTasks.push(
                      this.applyModifications(originalTask, decision)
                    );
                    batchApprovedCount++;
                  }
                }
              }

              recordEvent('task_approval_batch_processing_completed', {'
                batchIndex,
                batchSize: batch.length,
                approved: batchApprovedCount,
                duration: batchDuration,
              });
            }
          } else {
            // 🔄 Process individually with comprehensive telemetry
            recordEvent('task_approval_individual_processing_started', {'
              totalTasks: scanResults.generatedTasks.length,
            });

            for (
              let taskIndex = 0;
              taskIndex < scanResults.generatedTasks.length;
              taskIndex++
            ) {
              const task = scanResults.generatedTasks[taskIndex]!;
              const taskStartTime = Date.now();

              const decision = await this.reviewSingleTask(task);
              const taskDuration = Date.now() - taskStartTime;

              recordHistogram(
                'task_approval_individual_processing_duration',
                taskDuration,
                {
                  taskType: task.type,
                  priority: task.priority,
                  severity: task.sourceAnalysis.severity,
                }
              );

              decisions.push(decision);

              if (decision.approved) {
                approvedTasks.push(this.applyModifications(task, decision));
              }

              recordEvent('task_approval_individual_task_processed', {'
                taskId: task.id,
                taskType: task.type,
                approved: decision.approved,
                decision: decision.decision,
                duration: taskDuration,
              });
            }
          }

          // 📊 Calculate comprehensive results with detailed metrics
          const results: BatchApprovalResults = {
            totalTasks: scanResults.generatedTasks.length,
            approved: decisions.filter((d) => d.approved).length,
            rejected: decisions.filter((d) => d.decision === 'reject').length,
            modified: decisions.filter((d) => d.decision === 'modify').length,
            deferred: decisions.filter((d) => d.decision === 'defer').length,
            decisions,
            processingTime: Date.now() - startTime,
            approvedTasks,
          };

          // 📈 Record comprehensive metrics
          recordGauge('task_approval_total_processed', results.totalTasks);'
          recordGauge('task_approval_approved_count', results.approved);'
          recordGauge('task_approval_rejected_count', results.rejected);'
          recordGauge('task_approval_modified_count', results.modified);'
          recordGauge('task_approval_deferred_count', results.deferred);'
          recordHistogram(
            'task_approval_total_processing_duration',
            results.processingTime
          );

          const approvalRate =
            results.totalTasks > 0 ? results.approved / results.totalTasks : 0;
          recordGauge('task_approval_approval_rate', approvalRate);'

          setTraceAttributes({
            'tasks.results.total': results.totalTasks,
            'tasks.results.approved': results.approved,
            'tasks.results.rejected': results.rejected,
            'tasks.results.modified': results.modified,
            'tasks.results.deferred': results.deferred,
            'tasks.results.approval_rate': approvalRate,
            'tasks.results.processing_time_ms': results.processingTime,
          });

          // Update statistics
          this.updateStatistics(decisions, results.processingTime);

          // Store approval history
          this.approvalHistory.push(...decisions);

          // Show final summary
          await this.showApprovalSummary(results);

          this.logger.info('Task approval process completed successfully', {'
            totalTasks: results.totalTasks,
            approved: results.approved,
            rejected: results.rejected,
            modified: results.modified,
            deferred: results.deferred,
            approvalRate,
            processingTime: results.processingTime,
          });

          recordEvent('task_approval_review_completed', {'
            totalTasks: results.totalTasks,
            approved: results.approved,
            rejected: results.rejected,
            modified: results.modified,
            deferred: results.deferred,
            approvalRate,
            processingTime: results.processingTime,
            success: true,
          });

          this.emit('approval:completed', results);'
          return results;
        });
      } catch (error) {
        const processingDuration = Date.now() - startTime;
        recordMetric('task_approval_review_failed', 1);'
        recordHistogram(
          'task_approval_review_error_duration',
          processingDuration
        );

        setTraceAttributes({
          'tasks.processing.failed': true,
          'tasks.processing.error':'
            error instanceof Error ? error.message : String(error),
          'tasks.processing.duration_ms': processingDuration,
        });

        this.logger.error('Task approval process failed', {'
          error: error instanceof Error ? error.message : String(error),
          totalTasks: scanResults.generatedTasks.length,
          duration: processingDuration,
        });

        recordEvent('task_approval_review_failed', {'
          error: error instanceof Error ? error.message : String(error),
          totalTasks: scanResults.generatedTasks.length,
          duration: processingDuration,
        });

        throw new EnhancedError('Task approval process failed', {'
          cause: error,
          totalTasks: scanResults.generatedTasks.length,
          duration: processingDuration,
        });
      }
    });
  }

  /**
   * Review a single task for approval
   */
  async reviewSingleTask(
    task: GeneratedSwarmTask
  ): Promise<TaskApprovalDecision> {
    return withAsyncTrace('single-task-review', async (span) => {'
      const startTime = Date.now();
      const correlationId = `, task - approval - $, { task, : .id } - $, { Date, : .now() } `;`, setTraceAttributes({
                'task.id': task.id,
                'task.type': task.type,
                'task.priority': task.priority,
                'task.severity': task.sourceAnalysis.severity,
                'task.estimated_hours': task.estimatedHours,
                'task.correlation_id': correlationId,
            }));
            recordEvent('single_task_review_started', { ': taskId, task, : .id,
                taskType: task.type,
                priority: task.priority,
                severity: task.sourceAnalysis.severity,
                correlationId,
            });
            try {
                // 🛡️ Use circuit breaker protection for AGUI operations
                return await this.aguiCircuitBreaker.execute(async () => {
                    // Auto-approve low severity tasks if configured
                    if (this.config.autoApproveLowSeverity &&
                        task.sourceAnalysis.severity === 'low' && ')
                        task.priority === 'low';
                    ';
                });
                {
                    recordEvent('task_auto_approved', { ': taskId, task, : .id,
                        reason: 'low-severity-auto-approval',
                        correlationId,
                    });
                    this.logger.debug(`Auto-approving low severity task: ${task.id}`, {} `
              taskType: task.type,
              priority: task.priority,
              severity: task.sourceAnalysis.severity,
            });

            const autoDecision: TaskApprovalDecision = {
              taskId: task.id,
              approved: true,
              decision: 'approve',
              rationale: 'Auto-approved: Low severity task with low priority',
              decisionMaker: 'system',
              timestamp: new Date(),
              correlationId,
            };

            const reviewDuration = Date.now() - startTime;
            recordHistogram('single_task_review_duration', reviewDuration, {'
              approval_type: 'auto-approved',
              task_type: task.type,
              priority: task.priority,
            });

            setTraceAttributes({
              'task.auto_approved': true,
              'task.review_duration_ms': reviewDuration,
              'task.decision': 'approve',
            });

            return autoDecision;
          }

          // 📝 Create validation question for AGUI with telemetry
          const _questionStartTime = Date.now();
          const question = this.createTaskReviewQuestion(task, correlationId);
          const questionCreationDuration = Date.now() - questionStartTime;

          recordHistogram(
            'task_question_creation_duration',
            questionCreationDuration
          );

          // 🎨 Display rich task information if enabled
          if (this.config.enableRichDisplay) {
            const displayStartTime = Date.now();
            await this.displayTaskDetails(task);
            const displayDuration = Date.now() - displayStartTime;

            recordHistogram('task_details_display_duration', displayDuration);'
            recordEvent('task_details_displayed', '
              taskId: task.id,
              displayDuration,
              correlationId,);
          }

          // 💬 Get user decision through AGUI with telemetry
          const aguiStartTime = Date.now();
          const response = await this.agui.askQuestion(question);
          const aguiDuration = Date.now() - aguiStartTime;

          recordHistogram('agui_question_response_duration', aguiDuration);'
          recordEvent('agui_response_received', '
            taskId: task.id,
            responseLength: response.length,
            aguiDuration,
            correlationId,);

          // 🧠 Parse decision with telemetry
          const parseStartTime = Date.now();
          const decision = this.parseApprovalResponse(response);
          const parseDuration = Date.now() - parseStartTime;

          recordHistogram('decision_parsing_duration', parseDuration);'

          // 📝 Get rationale if required
          let rationale = this.extractRationale(response);
          if (
            !rationale &&
            (this.config.requireRationale||decision.decision ==='reject')'
          ) {
            const rationaleStartTime = Date.now();
            rationale = await this.askForRationale(decision.decision);
            const rationaleDuration = Date.now() - rationaleStartTime;

            recordHistogram('rationale_collection_duration', rationaleDuration);'
            recordEvent('rationale_collected', '
              taskId: task.id,
              decision: decision.decision,
              rationaleLength: rationale.length,
              duration: rationaleDuration,
              correlationId,);
          }

          // 🔧 Get modifications if needed
          let modifications;
          if (
            decision.decision === 'modify' &&'
            this.config.enableModification
          ) {
            const modStartTime = Date.now();
            modifications = await this.getTaskModifications(task);
            const modDuration = Date.now() - modStartTime;

            recordHistogram(
              'task_modifications_collection_duration',
              modDuration
            );
            recordEvent('task_modifications_collected', {'
              taskId: task.id,
              modificationsCount: modifications
                ? Object.keys(modifications).length
                : 0,
              duration: modDuration,
              correlationId,
            });
          }

          // ✅ Create final approval decision
          const _approvalDecision: TaskApprovalDecision = {
            taskId: task.id,
            approved: decision.approved,
            decision: decision.decision,
            ...(modifications !== undefined && { modifications }),
            rationale: rationale||'No rationale provided',
            decisionMaker: 'user', // In production, this would be actual user ID'
            timestamp: new Date(),
            correlationId,
          };

          // 📊 Record comprehensive completion metrics
          const totalReviewDuration = Date.now() - startTime;
          recordHistogram('single_task_review_duration', totalReviewDuration, {'
            approval_type: 'manual',
            task_type: task.type,
            priority: task.priority,
            decision: decision.decision,
            severity: task.sourceAnalysis.severity,
          });

          recordMetric(`, task_$, { decision, : .decision }, _count `, 1);`, recordGauge('task_review_completion_rate', 1.0));
                    ';
                    setTraceAttributes({
                        'task.manual_review': true,
                        'task.review_duration_ms': totalReviewDuration,
                        'task.decision': decision.decision,
                        'task.approved': decision.approved,
                        'task.has_modifications': !!modifications,
                        'task.rationale_provided': !!rationale,
                    });
                    recordEvent('single_task_review_completed', { ': taskId, task, : .id,
                        decision: decision.decision,
                        approved: decision.approved,
                        totalDuration: totalReviewDuration,
                        hasModifications: !!modifications,
                        rationaleProvided: !!rationale,
                        correlationId,
                        success: true,
                    });
                    this.emit('task:reviewed', { task, decision: approvalDecision });
                    ';
                    this.logger.info('Single task review completed successfully', { ': taskId, task, : .id,
                        decision: decision.decision,
                        approved: decision.approved,
                        duration: totalReviewDuration,
                        correlationId,
                    });
                    return approvalDecision;
                }
            }
            finally { }
        });
    }
    catch(error) {
        const reviewDuration = Date.now() - startTime;
        recordMetric('single_task_review_failed', 1);
        ';
        recordHistogram('single_task_review_error_duration', reviewDuration);
        ';
        setTraceAttributes({
            'task.review_failed': true,
            'task.error': error instanceof Error ? error.message : String(error),
            'task.review_duration_ms': reviewDuration,
        });
        this.logger.error('Single task review failed', { ': taskId, task, : .id,
            error: error instanceof Error ? error.message : String(error),
            duration: reviewDuration,
            correlationId,
        });
        recordEvent('single_task_review_failed', { ': taskId, task, : .id,
            error: error instanceof Error ? error.message : String(error),
            duration: reviewDuration,
            correlationId,
        });
        throw new EnhancedError('Single task review failed', { ': cause, error,
            taskId: task.id,
            duration: reviewDuration,
            correlationId,
        });
    }
}
;
async;
processBatch(tasks, GeneratedSwarmTask[]);
Promise < TaskApprovalDecision[] > {
    return: withAsyncTrace('batch-processing', async (span) => {
        ';
        const startTime = Date.now();
        setTraceAttributes({
            'batch.size': tasks.length,
            'batch.processing_mode': 'batch',
        });
        recordEvent('batch_processing_started', { ': batchSize, tasks, : .length,
            timestamp: Date.now(),
        });
        try {
            // 🛡️ Use circuit breaker protection for AGUI operations
            return await this.aguiCircuitBreaker.execute(async () => {
                await this.agui.showMessage(`\n📋 Reviewing batch of $tasks.lengthtasks`, `
            'info''
          );

          // Show batch summary with telemetry
          const summaryStartTime = Date.now();
          await this.showBatchSummary(tasks);
          const summaryDuration = Date.now() - summaryStartTime;

          recordHistogram('batch_summary_display_duration', summaryDuration);'

          // Ask for batch decision with telemetry
          const batchQuestion: ValidationQuestion = {
            id: `, batch - review - $, { Date, : .now() } `,`, type, 'review', question, 'How would you like to process this batch?', context, { taskCount: tasks.length }, options, [
                    'Approve all tasks',
                    'Review each task individually',
                    'Reject entire batch',
                    'Apply bulk modifications',
                ], confidence, 0.8, priority, 'medium');
            });
            const questionStartTime = Date.now();
            const batchResponse = await this.agui.askQuestion(batchQuestion);
            const questionDuration = Date.now() - questionStartTime;
            recordHistogram('batch_decision_response_duration', questionDuration);
            ';
            recordEvent('batch_decision_received', ', batchSize, tasks.length, decision, batchResponse, questionDuration);
            let result;
            const processingStartTime = Date.now();
            switch (batchResponse) {
                case 'Approve all tasks': ';
                case '1':
                    ';
                    recordEvent('batch_bulk_approval_started', { ': batchSize, tasks, : .length,
                    });
                    result = this.approveAllTasks(tasks, 'Bulk approval of entire batch', ');
                    recordMetric('batch_bulk_approvals', 1);
                    ';
                    break;
                case 'Reject entire batch': ';
                case '3':
                    ';
                    recordEvent('batch_bulk_rejection_started', { ': batchSize, tasks, : .length,
                    });
                    result = this.rejectAllTasks(tasks, 'Bulk rejection of entire batch', ');
                    recordMetric('batch_bulk_rejections', 1);
                    ';
                    break;
                case 'Apply bulk modifications': ';
                case '4':
                    ';
                    recordEvent('batch_bulk_modifications_started', { ': batchSize, tasks, : .length,
                    });
                    result = await this.applyBulkModifications(tasks);
                    recordMetric('batch_bulk_modifications', 1);
                    ';
                    break;
                default: {
                    // Review individually with comprehensive telemetry
                    recordEvent('batch_individual_review_started', { ': batchSize, tasks, : .length,
                    });
                    const decisions = [];
                    for (let i = 0; i < tasks.length; i++) {
                        const task = tasks[i];
                        const taskStartTime = Date.now();
                        const decision = await this.reviewSingleTask(task);
                        const taskDuration = Date.now() - taskStartTime;
                        recordHistogram('batch_individual_task_duration', taskDuration, {
                            task_index: i.toString(),
                            task_type: task.type,
                            priority: task.priority,
                        });
                        decisions.push(decision);
                    }
                    recordMetric('batch_individual_reviews', 1);
                    ';
                    result = decisions;
                    break;
                }
            }
            const processingDuration = Date.now() - processingStartTime;
            const totalDuration = Date.now() - startTime;
            recordHistogram('batch_processing_duration', totalDuration, { ': batch_size, tasks, : .length.toString(),
                decision_type: batchResponse,
            });
            setTraceAttributes({
                'batch.decision_type': batchResponse,
                'batch.processing_duration_ms': processingDuration,
                'batch.total_duration_ms': totalDuration,
                'batch.decisions_count': result.length,
            });
            recordEvent('batch_processing_completed', { ': batchSize, tasks, : .length,
                decisionType: batchResponse,
                decisionsCount: result.length,
                processingDuration,
                totalDuration,
                success: true,
            });
            this.logger.info('Batch processing completed successfully', { ': batchSize, tasks, : .length,
                decisionType: batchResponse,
                decisionsCount: result.length,
                totalDuration,
            });
            return result;
        }
        finally { }
    })
};
try { }
catch (error) {
    const duration = Date.now() - startTime;
    recordMetric('batch_processing_failed', 1);
    ';
    recordHistogram('batch_processing_error_duration', duration);
    ';
    setTraceAttributes('batch.failed', true, 'batch.error', error instanceof Error ? error.message : String(error), 'batch.duration_ms', duration);
    this.logger.error('Batch processing failed', { ': batchSize, tasks, : .length,
        error: error instanceof Error ? error.message : String(error),
        duration,
    });
    recordEvent('batch_processing_failed', { ': batchSize, tasks, : .length,
        error: error instanceof Error ? error.message : String(error),
        duration,
    });
    throw new EnhancedError('Batch processing failed', { ': cause, error,
        batchSize: tasks.length,
        duration,
    });
}
;
/**
 * Create task approval system with AGUI integration
 */
export function createTaskApprovalSystem(agui, config) {
    return new TaskApprovalSystem(agui, config);
}
