import Database from 'better-sqlite3';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getLogger } from '../../config/logging-config.ts';
import { createApprovalGate, GateEscalationLevel, } from '../workflows/workflow-gate-request.ts';
const logger = getLogger('workflow-gates');
export var WorkflowHumanGateType;
(function (WorkflowHumanGateType) {
    WorkflowHumanGateType["STRATEGIC"] = "strategic";
    WorkflowHumanGateType["ARCHITECTURAL"] = "architectural";
    WorkflowHumanGateType["QUALITY"] = "quality";
    WorkflowHumanGateType["BUSINESS"] = "business";
    WorkflowHumanGateType["ETHICAL"] = "ethical";
})(WorkflowHumanGateType || (WorkflowHumanGateType = {}));
export var WorkflowHumanGateStatus;
(function (WorkflowHumanGateStatus) {
    WorkflowHumanGateStatus["PENDING"] = "pending";
    WorkflowHumanGateStatus["TRIGGERED"] = "triggered";
    WorkflowHumanGateStatus["IN_REVIEW"] = "in_review";
    WorkflowHumanGateStatus["APPROVED"] = "approved";
    WorkflowHumanGateStatus["REJECTED"] = "rejected";
    WorkflowHumanGateStatus["CANCELLED"] = "cancelled";
    WorkflowHumanGateStatus["EXPIRED"] = "expired";
    WorkflowHumanGateStatus["ESCALATED"] = "escalated";
})(WorkflowHumanGateStatus || (WorkflowHumanGateStatus = {}));
export var WorkflowGatePriority;
(function (WorkflowGatePriority) {
    WorkflowGatePriority["LOW"] = "low";
    WorkflowGatePriority["MEDIUM"] = "medium";
    WorkflowGatePriority["HIGH"] = "high";
    WorkflowGatePriority["CRITICAL"] = "critical";
    WorkflowGatePriority["EMERGENCY"] = "emergency";
})(WorkflowGatePriority || (WorkflowGatePriority = {}));
export var GateTriggerUrgency;
(function (GateTriggerUrgency) {
    GateTriggerUrgency["IMMEDIATE"] = "immediate";
    GateTriggerUrgency["WITHIN_HOUR"] = "within-hour";
    GateTriggerUrgency["WITHIN_DAY"] = "within-day";
    GateTriggerUrgency["NEXT_REVIEW"] = "next-review";
})(GateTriggerUrgency || (GateTriggerUrgency = {}));
export class GatePersistenceManager {
    logger;
    db = null;
    dbPath;
    constructor(dbPath = './data/workflow-gates.db') {
        this.logger = getLogger('gate-persistence-manager');
        this.dbPath = dbPath;
    }
    async initialize() {
        try {
            await fs.mkdir(join(this.dbPath, '..'), { recursive: true });
            this.db = new Database(this.dbPath);
            await this.createTables();
            this.logger.info('Gate persistence manager initialized', {
                dbPath: this.dbPath,
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize gate persistence manager', {
                error,
            });
            throw error;
        }
    }
    async createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_gates (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        subtype TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        workflow_context TEXT NOT NULL,
        gate_data TEXT NOT NULL,
        triggers TEXT NOT NULL,
        priority TEXT NOT NULL,
        approval_config TEXT NOT NULL,
        timeout_config TEXT,
        resolution TEXT,
        metrics TEXT NOT NULL,
        workflow_gate_request TEXT
      )
    `);
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS gate_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gate_id TEXT NOT NULL,
        priority INTEGER NOT NULL,
        urgency TEXT NOT NULL,
        scheduled_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(gate_id) REFERENCES workflow_gates(id)
      )
    `);
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS gate_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gate_id TEXT NOT NULL,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        data TEXT,
        FOREIGN KEY(gate_id) REFERENCES workflow_gates(id)
      )
    `);
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_gates_status ON workflow_gates(status);
      CREATE INDEX IF NOT EXISTS idx_gates_type ON workflow_gates(type);
      CREATE INDEX IF NOT EXISTS idx_gates_created ON workflow_gates(created_at);
      CREATE INDEX IF NOT EXISTS idx_queue_priority ON gate_queue(priority, scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_queue_processed ON gate_queue(processed);
      CREATE INDEX IF NOT EXISTS idx_history_gate ON gate_history(gate_id);
    `);
        this.logger.debug('Database tables created successfully');
    }
    async saveGate(gate) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO workflow_gates 
      (id, type, subtype, title, description, status, created_at, updated_at,
       workflow_context, gate_data, triggers, priority, approval_config,
       timeout_config, resolution, metrics, workflow_gate_request)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(gate.id, gate.type, gate.subtype, gate.title, gate.description, gate.status, gate.createdAt.getTime(), gate.updatedAt.getTime(), JSON.stringify(gate.workflowContext), JSON.stringify(gate.gateData), JSON.stringify(gate.triggers), gate.priority, JSON.stringify(gate.approvalConfig), gate.timeoutConfig ? JSON.stringify(gate.timeoutConfig) : null, gate.resolution ? JSON.stringify(gate.resolution) : null, JSON.stringify(gate.metrics), gate.workflowGateRequest ? JSON.stringify(gate.workflowGateRequest) : null);
        this.logger.debug('Gate saved to database', {
            gateId: gate.id,
            status: gate.status,
        });
    }
    async getGate(gateId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM workflow_gates WHERE id = ?
    `);
        const row = stmt.get(gateId);
        if (!row)
            return null;
        return this.deserializeGate(row);
    }
    async getGatesByStatus(status) {
        if (!this.db)
            throw new Error('Database not initialized');
        const placeholders = status.map(() => '?').join(',');
        const stmt = this.db.prepare(`
      SELECT * FROM workflow_gates WHERE status IN (${placeholders})
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(...status);
        return rows.map((row) => this.deserializeGate(row));
    }
    async getGatesByType(type) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM workflow_gates WHERE type = ?
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(type);
        return rows.map((row) => this.deserializeGate(row));
    }
    async updateGateStatus(gateId, status, resolution) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      UPDATE workflow_gates 
      SET status = ?, updated_at = ?, resolution = ?
      WHERE id = ?
    `);
        stmt.run(status, Date.now(), resolution ? JSON.stringify(resolution) : null, gateId);
        this.logger.debug('Gate status updated', { gateId, status });
    }
    async addToQueue(gateId, priority, urgency, scheduledAt) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      INSERT INTO gate_queue (gate_id, priority, urgency, scheduled_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(gateId, priority, urgency, scheduledAt.getTime(), Date.now());
        this.logger.debug('Gate added to queue', { gateId, priority, urgency });
    }
    async getQueuedGates(limit = 50) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT 
        g.*,
        q.id as queue_id,
        q.priority as queue_priority,
        q.urgency as queue_urgency,
        q.scheduled_at as queue_scheduled_at
      FROM gate_queue q
      JOIN workflow_gates g ON q.gate_id = g.id
      WHERE q.processed = FALSE AND q.scheduled_at <= ?
      ORDER BY q.priority DESC, q.scheduled_at ASC
      LIMIT ?
    `);
        const rows = stmt.all(Date.now(), limit);
        return rows.map((row) => ({
            gate: this.deserializeGate(row),
            queueItem: {
                id: row.queue_id,
                priority: row.queue_priority,
                urgency: row.queue_urgency,
                scheduledAt: new Date(row.queue_scheduled_at),
            },
        }));
    }
    async markQueueItemProcessed(queueItemId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      UPDATE gate_queue SET processed = TRUE WHERE id = ?
    `);
        stmt.run(queueItemId);
    }
    async addHistoryEntry(gateId, action, actor, data) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      INSERT INTO gate_history (gate_id, action, actor, timestamp, data)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(gateId, action, actor, Date.now(), data ? JSON.stringify(data) : null);
    }
    async getGateHistory(gateId) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM gate_history WHERE gate_id = ?
      ORDER BY timestamp DESC
    `);
        const rows = stmt.all(gateId);
        return rows.map((row) => ({
            id: row.id,
            gateId: row.gate_id,
            action: row.action,
            actor: row.actor,
            timestamp: new Date(row.timestamp),
            data: row.data ? JSON.parse(row.data) : null,
        }));
    }
    async getMetrics(timeRange) {
        if (!this.db)
            throw new Error('Database not initialized');
        let whereClause = '';
        const params = [];
        if (timeRange) {
            whereClause = 'WHERE created_at BETWEEN ? AND ?';
            params.push(timeRange.from.getTime(), timeRange.to.getTime());
        }
        const totalStmt = this.db.prepare(`SELECT COUNT(*) as count FROM workflow_gates ${whereClause}`);
        const totalResult = totalStmt.get(...params);
        const statusStmt = this.db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM workflow_gates ${whereClause}
      GROUP BY status
    `);
        const statusResults = statusStmt.all(...params);
        const typeStmt = this.db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM workflow_gates ${whereClause}
      GROUP BY type
    `);
        const typeResults = typeStmt.all(...params);
        const resolutionTimeStmt = this.db.prepare(`
      SELECT AVG(
        json_extract(resolution, '$.resolvedAt') - created_at
      ) as avg_time
      FROM workflow_gates 
      WHERE resolution IS NOT NULL ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `);
        const resolutionTimeResult = resolutionTimeStmt.get(...params);
        return {
            totalGates: totalResult.count,
            gatesByStatus: statusResults.reduce((acc, row) => {
                acc[row.status] = row.count;
                return acc;
            }, {}),
            gatesByType: typeResults.reduce((acc, row) => {
                acc[row.type] = row.count;
                return acc;
            }, {}),
            averageResolutionTime: resolutionTimeResult.avg_time || 0,
            timeRange: timeRange || null,
        };
    }
    deserializeGate(row) {
        return {
            id: row.id,
            type: row.type,
            subtype: row.subtype,
            title: row.title,
            description: row.description,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            workflowContext: JSON.parse(row.workflow_context),
            gateData: JSON.parse(row.gate_data),
            triggers: JSON.parse(row.triggers),
            priority: row.priority,
            approvalConfig: JSON.parse(row.approval_config),
            timeoutConfig: row.timeout_config
                ? JSON.parse(row.timeout_config)
                : undefined,
            resolution: row.resolution ? JSON.parse(row.resolution) : undefined,
            metrics: JSON.parse(row.metrics),
            workflowGateRequest: row.workflow_gate_request
                ? JSON.parse(row.workflow_gate_request)
                : undefined,
        };
    }
    async shutdown() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.logger.info('Gate persistence manager shutdown');
        }
    }
}
export class WorkflowGatesManager extends EventEmitter {
    logger;
    persistence;
    eventBus;
    gateFactories = new Map();
    triggerEvaluators = new Map();
    queueProcessor = null;
    isInitialized = false;
    config;
    constructor(eventBus, config = {}) {
        super();
        this.logger = getLogger('workflow-gates-manager');
        this.eventBus = eventBus;
        this.config = {
            persistencePath: './data/workflow-gates.db',
            queueProcessingInterval: 30000,
            maxConcurrentGates: 100,
            enableMetrics: true,
            ...config,
        };
        this.persistence = new GatePersistenceManager(this.config.persistencePath);
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            await this.persistence.initialize();
            this.registerGateFactories();
            this.registerTriggerEvaluators();
            this.startQueueProcessor();
            this.isInitialized = true;
            this.logger.info('Workflow Gates Manager initialized');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize workflow gates manager', {
                error,
            });
            throw error;
        }
    }
    async shutdown() {
        if (this.queueProcessor) {
            clearInterval(this.queueProcessor);
            this.queueProcessor = null;
        }
        await this.persistence.shutdown();
        this.isInitialized = false;
        this.removeAllListeners();
        this.logger.info('Workflow Gates Manager shutdown');
    }
    async createGate(type, subtype, workflowContext, gateData, options = {}) {
        await this.ensureInitialized();
        const factory = this.gateFactories.get(type);
        if (!factory) {
            throw new Error(`No factory registered for gate type: ${type}`);
        }
        const gate = factory.createGate(subtype, workflowContext, gateData, options);
        await this.persistence.saveGate(gate);
        await this.persistence.addHistoryEntry(gate.id, 'created', 'system', {
            type,
            subtype,
            workflowId: workflowContext.gateWorkflowId,
        });
        await this.processTriggers(gate);
        this.logger.info('Gate created', {
            gateId: gate.id,
            type,
            subtype,
            workflowId: workflowContext.gateWorkflowId,
        });
        this.emit('gate-created', gate);
        return gate;
    }
    async updateGate(gateId, updates) {
        const gate = await this.persistence.getGate(gateId);
        if (!gate) {
            throw new Error(`Gate not found: ${gateId}`);
        }
        const updatedGate = {
            ...gate,
            ...updates,
            updatedAt: new Date(),
        };
        await this.persistence.saveGate(updatedGate);
        await this.persistence.addHistoryEntry(gateId, 'updated', 'system', updates);
        this.logger.info('Gate updated', { gateId, updates: Object.keys(updates) });
        this.emit('gate-updated', updatedGate);
    }
    async resolveGate(gateId, decision, resolvedBy, rationale, data) {
        const gate = await this.persistence.getGate(gateId);
        if (!gate) {
            throw new Error(`Gate not found: ${gateId}`);
        }
        const resolution = {
            resolvedAt: new Date(),
            decision,
            resolvedBy,
            rationale,
            data,
        };
        const newStatus = decision === 'approved'
            ? WorkflowHumanGateStatus.APPROVED
            : decision === 'rejected'
                ? WorkflowHumanGateStatus.REJECTED
                : WorkflowHumanGateStatus.PENDING;
        await this.persistence.updateGateStatus(gateId, newStatus, resolution);
        await this.persistence.addHistoryEntry(gateId, 'resolved', resolvedBy, {
            decision,
            rationale,
        });
        const updatedGate = await this.persistence.getGate(gateId);
        if (updatedGate) {
            updatedGate.metrics.timeToResolution =
                Date.now() - gate.createdAt.getTime();
            await this.persistence.saveGate(updatedGate);
        }
        this.logger.info('Gate resolved', { gateId, decision, resolvedBy });
        this.emit('gate-resolved', { gateId, decision, resolvedBy, resolution });
    }
    async cancelGate(gateId, reason, cancelledBy) {
        await this.persistence.updateGateStatus(gateId, WorkflowHumanGateStatus.CANCELLED);
        await this.persistence.addHistoryEntry(gateId, 'cancelled', cancelledBy, {
            reason,
        });
        this.logger.info('Gate cancelled', { gateId, reason, cancelledBy });
        this.emit('gate-cancelled', { gateId, reason, cancelledBy });
    }
    async addToQueue(gateId, priority, urgency, scheduledAt) {
        const scheduled = scheduledAt || new Date();
        await this.persistence.addToQueue(gateId, priority, urgency, scheduled);
        this.logger.debug('Gate added to queue', {
            gateId,
            priority,
            urgency,
            scheduledAt: scheduled,
        });
    }
    async getQueuedGates() {
        return this.persistence.getQueuedGates();
    }
    async getGate(gateId) {
        return this.persistence.getGate(gateId);
    }
    async getGatesByStatus(status) {
        return this.persistence.getGatesByStatus(status);
    }
    async getGatesByType(type) {
        return this.persistence.getGatesByType(type);
    }
    async getPendingGates() {
        return this.persistence.getGatesByStatus([
            WorkflowHumanGateStatus.PENDING,
            WorkflowHumanGateStatus.TRIGGERED,
            WorkflowHumanGateStatus.IN_REVIEW,
        ]);
    }
    async getGateHistory(gateId) {
        return this.persistence.getGateHistory(gateId);
    }
    async getMetrics(timeRange) {
        const persistenceMetrics = await this.persistence.getMetrics(timeRange);
        const queuedGates = await this.getQueuedGates();
        return {
            ...persistenceMetrics,
            queuedGatesCount: queuedGates.length,
            activeGatesCount: persistenceMetrics.gatesByStatus[WorkflowHumanGateStatus.TRIGGERED] ||
                0,
            completedGatesCount: (persistenceMetrics.gatesByStatus[WorkflowHumanGateStatus.APPROVED] ||
                0) +
                (persistenceMetrics.gatesByStatus[WorkflowHumanGateStatus.REJECTED] ||
                    0),
        };
    }
    async processTriggers(gate) {
        for (const trigger of gate.triggers) {
            try {
                const shouldTrigger = await trigger.condition(gate.workflowContext);
                if (shouldTrigger) {
                    await this.triggerGate(gate, trigger);
                }
            }
            catch (error) {
                this.logger.error('Trigger evaluation failed', {
                    gateId: gate.id,
                    triggerId: trigger.id,
                    error,
                });
            }
        }
    }
    async triggerGate(gate, trigger) {
        await this.persistence.updateGateStatus(gate.id, WorkflowHumanGateStatus.TRIGGERED);
        const priority = this.urgencyToPriority(trigger.urgency);
        const scheduledAt = this.calculateScheduledTime(trigger.urgency, trigger.delay);
        await this.addToQueue(gate.id, priority, trigger.urgency, scheduledAt);
        await this.persistence.addHistoryEntry(gate.id, 'triggered', 'system', {
            triggerId: trigger.id,
            urgency: trigger.urgency,
        });
        if (trigger.urgency === GateTriggerUrgency.IMMEDIATE) {
            await this.createWorkflowGateRequest(gate);
        }
        this.logger.info('Gate triggered', {
            gateId: gate.id,
            triggerId: trigger.id,
            urgency: trigger.urgency,
        });
        this.emit('gate-triggered', { gate, trigger });
    }
    async createWorkflowGateRequest(gate) {
        const workflowGateRequest = createApprovalGate(gate.workflowContext.gateWorkflowId, gate.workflowContext.phaseName, `${gate.title}\n\n${gate.description}`, gate.workflowContext.stakeholderGroups, {
            businessImpact: this.mapImpactToLevel(gate.workflowContext.impactAssessment.businessImpact),
            priority: this.mapGatePriorityToValidationPriority(gate.priority),
        });
        await this.updateGate(gate.id, { workflowGateRequest });
        return workflowGateRequest;
    }
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }
    registerGateFactories() {
        this.gateFactories.set(WorkflowHumanGateType.STRATEGIC, new StrategicGateFactory());
        this.gateFactories.set(WorkflowHumanGateType.ARCHITECTURAL, new ArchitecturalGateFactory());
        this.gateFactories.set(WorkflowHumanGateType.QUALITY, new QualityGateFactory());
        this.gateFactories.set(WorkflowHumanGateType.BUSINESS, new BusinessGateFactory());
        this.gateFactories.set(WorkflowHumanGateType.ETHICAL, new EthicalGateFactory());
        this.logger.debug('Gate factories registered');
    }
    registerTriggerEvaluators() {
        this.triggerEvaluators.set('prd-generated', async (context) => {
            return (context.phaseName === 'prd-generation' &&
                context.businessDomain === 'product');
        });
        this.triggerEvaluators.set('epic-created', async (context) => {
            return (context.phaseName === 'epic-creation' &&
                context.technicalDomain === 'development');
        });
        this.triggerEvaluators.set('feature-designed', async (context) => {
            return (context.phaseName === 'feature-design' &&
                context.impactAssessment.technicalImpact > 0.7);
        });
        this.triggerEvaluators.set('sparc-phase-complete', async (context) => {
            return (context.phaseName.includes('sparc') &&
                context.impactAssessment.businessImpact > 0.5);
        });
        this.logger.debug('Trigger evaluators registered');
    }
    startQueueProcessor() {
        this.queueProcessor = setInterval(async () => {
            try {
                await this.processQueue();
            }
            catch (error) {
                this.logger.error('Queue processing failed', { error });
            }
        }, this.config.queueProcessingInterval);
        this.logger.debug('Queue processor started', {
            interval: this.config.queueProcessingInterval,
        });
    }
    async processQueue() {
        const queuedItems = await this.getQueuedGates();
        if (queuedItems.length === 0) {
            return;
        }
        this.logger.debug('Processing queue', { itemCount: queuedItems.length });
        for (const { gate, queueItem } of queuedItems) {
            try {
                await this.processQueuedGate(gate, queueItem);
                await this.persistence.markQueueItemProcessed(queueItem.id);
            }
            catch (error) {
                this.logger.error('Failed to process queued gate', {
                    gateId: gate.id,
                    queueItemId: queueItem.id,
                    error,
                });
            }
        }
    }
    async processQueuedGate(gate, queueItem) {
        await this.persistence.updateGateStatus(gate.id, WorkflowHumanGateStatus.IN_REVIEW);
        if (!gate.workflowGateRequest) {
            await this.createWorkflowGateRequest(gate);
        }
        this.emit('gate-ready-for-review', { gate, queueItem });
        this.logger.info('Gate ready for review', {
            gateId: gate.id,
            priority: queueItem.priority,
        });
    }
    urgencyToPriority(urgency) {
        switch (urgency) {
            case GateTriggerUrgency.EMERGENCY:
                return 1;
            case GateTriggerUrgency.IMMEDIATE:
                return 2;
            case GateTriggerUrgency.WITHIN_HOUR:
                return 3;
            case GateTriggerUrgency.WITHIN_DAY:
                return 4;
            case GateTriggerUrgency.NEXT_REVIEW:
                return 5;
            default:
                return 5;
        }
    }
    calculateScheduledTime(urgency, delay) {
        const now = new Date();
        const baseDelay = delay || 0;
        switch (urgency) {
            case GateTriggerUrgency.IMMEDIATE:
                return new Date(now.getTime() + baseDelay);
            case GateTriggerUrgency.WITHIN_HOUR:
                return new Date(now.getTime() + Math.min(3600000, baseDelay + 1800000));
            case GateTriggerUrgency.WITHIN_DAY:
                return new Date(now.getTime() + Math.min(86400000, baseDelay + 7200000));
            case GateTriggerUrgency.NEXT_REVIEW:
                return new Date(now.getTime() + 86400000 + baseDelay);
            default:
                return new Date(now.getTime() + baseDelay);
        }
    }
    mapImpactToLevel(impact) {
        if (impact >= 0.9)
            return 'critical';
        if (impact >= 0.7)
            return 'high';
        if (impact >= 0.4)
            return 'medium';
        return 'low';
    }
    mapGatePriorityToValidationPriority(priority) {
        switch (priority) {
            case WorkflowGatePriority.EMERGENCY:
                return 'critical';
            case WorkflowGatePriority.CRITICAL:
                return 'critical';
            case WorkflowGatePriority.HIGH:
                return 'high';
            case WorkflowGatePriority.MEDIUM:
                return 'medium';
            case WorkflowGatePriority.LOW:
                return 'low';
            default:
                return 'medium';
        }
    }
}
export class StrategicGateFactory {
    createGate(subtype, workflowContext, gateData, options) {
        const gateId = `strategic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: gateId,
            type: WorkflowHumanGateType.STRATEGIC,
            subtype,
            title: options.title || `Strategic Decision: ${subtype}`,
            description: options.description ||
                `Strategic gate for ${subtype} in workflow ${workflowContext.gateWorkflowId}`,
            status: WorkflowHumanGateStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            workflowContext,
            gateData,
            triggers: options.triggers || this.createDefaultStrategicTriggers(subtype),
            priority: options.priority || WorkflowGatePriority.HIGH,
            approvalConfig: {
                approvers: options.approvers || ['product-director', 'cto'],
                requiredApprovals: 1,
                escalationChain: [
                    GateEscalationLevel.DIRECTOR,
                    GateEscalationLevel.EXECUTIVE,
                ],
            },
            timeoutConfig: options.timeoutConfig,
            metrics: this.createInitialMetrics(),
        };
    }
    createDefaultStrategicTriggers(subtype) {
        return [
            {
                id: `strategic-${subtype}-trigger`,
                event: 'prd-generated',
                condition: async (context) => {
                    return context.impactAssessment.businessImpact > 0.7;
                },
                urgency: GateTriggerUrgency.WITHIN_DAY,
                metadata: {
                    name: `Strategic ${subtype} trigger`,
                    description: `Triggers when strategic decision is needed for ${subtype}`,
                    phases: ['planning', 'design'],
                    stakeholders: ['product-director', 'business-stakeholder'],
                    category: 'strategic',
                    properties: {},
                },
            },
        ];
    }
    createInitialMetrics() {
        return {
            createdAt: new Date(),
            escalationCount: 0,
            modificationCount: 0,
            stakeholderInteractions: [],
            performance: {
                avgProcessingTime: 0,
                successRate: 0,
                escalationRate: 0,
                timeoutRate: 0,
                resourceUtilization: 0,
            },
            quality: {
                decisionAccuracy: 0,
                stakeholderSatisfaction: 0,
                processEfficiency: 0,
                outcomeQuality: 0,
                complianceScore: 0,
            },
        };
    }
}
export class ArchitecturalGateFactory {
    createGate(subtype, workflowContext, gateData, options) {
        const gateId = `arch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: gateId,
            type: WorkflowHumanGateType.ARCHITECTURAL,
            subtype,
            title: options.title || `Architecture Review: ${subtype}`,
            description: options.description || `Architectural gate for ${subtype} review`,
            status: WorkflowHumanGateStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            workflowContext,
            gateData,
            triggers: options.triggers || this.createDefaultArchitecturalTriggers(subtype),
            priority: options.priority || WorkflowGatePriority.HIGH,
            approvalConfig: {
                approvers: options.approvers || [
                    'lead-architect',
                    'engineering-director',
                ],
                requiredApprovals: 1,
                escalationChain: [
                    GateEscalationLevel.MANAGER,
                    GateEscalationLevel.DIRECTOR,
                ],
            },
            timeoutConfig: options.timeoutConfig,
            metrics: this.createInitialMetrics(),
        };
    }
    createDefaultArchitecturalTriggers(subtype) {
        return [
            {
                id: `arch-${subtype}-trigger`,
                event: 'architecture-defined',
                condition: async (context) => {
                    return (context.technicalDomain === 'architecture' &&
                        context.impactAssessment.technicalImpact > 0.6);
                },
                urgency: GateTriggerUrgency.WITHIN_HOUR,
                metadata: {
                    name: `Architectural ${subtype} trigger`,
                    description: `Triggers when architectural decision is needed for ${subtype}`,
                    phases: ['design', 'implementation'],
                    stakeholders: ['lead-architect', 'senior-engineer'],
                    category: 'architectural',
                    properties: {},
                },
            },
        ];
    }
    createInitialMetrics() {
        return {
            createdAt: new Date(),
            escalationCount: 0,
            modificationCount: 0,
            stakeholderInteractions: [],
            performance: {
                avgProcessingTime: 0,
                successRate: 0,
                escalationRate: 0,
                timeoutRate: 0,
                resourceUtilization: 0,
            },
            quality: {
                decisionAccuracy: 0,
                stakeholderSatisfaction: 0,
                processEfficiency: 0,
                outcomeQuality: 0,
                complianceScore: 0,
            },
        };
    }
}
export class QualityGateFactory {
    createGate(subtype, workflowContext, gateData, options) {
        const gateId = `quality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: gateId,
            type: WorkflowHumanGateType.QUALITY,
            subtype,
            title: options.title || `Quality Gate: ${subtype}`,
            description: options.description || `Quality assurance gate for ${subtype}`,
            status: WorkflowHumanGateStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            workflowContext,
            gateData,
            triggers: options.triggers || this.createDefaultQualityTriggers(subtype),
            priority: options.priority || WorkflowGatePriority.MEDIUM,
            approvalConfig: {
                approvers: options.approvers || ['qa-lead', 'security-engineer'],
                requiredApprovals: 1,
                escalationChain: [
                    GateEscalationLevel.TEAM_LEAD,
                    GateEscalationLevel.MANAGER,
                ],
            },
            timeoutConfig: options.timeoutConfig,
            metrics: this.createInitialMetrics(),
        };
    }
    createDefaultQualityTriggers(subtype) {
        return [
            {
                id: `quality-${subtype}-trigger`,
                event: subtype.includes('security')
                    ? 'security-scan-complete'
                    : 'performance-test-complete',
                condition: async (context) => {
                    return context.impactAssessment.riskImpact > 0.5;
                },
                urgency: GateTriggerUrgency.WITHIN_HOUR,
                metadata: {
                    name: `Quality ${subtype} trigger`,
                    description: `Triggers when quality review is needed for ${subtype}`,
                    phases: ['testing', 'deployment'],
                    stakeholders: ['qa-engineer', 'security-engineer'],
                    category: 'quality',
                    properties: {},
                },
            },
        ];
    }
    createInitialMetrics() {
        return {
            createdAt: new Date(),
            escalationCount: 0,
            modificationCount: 0,
            stakeholderInteractions: [],
            performance: {
                avgProcessingTime: 0,
                successRate: 0,
                escalationRate: 0,
                timeoutRate: 0,
                resourceUtilization: 0,
            },
            quality: {
                decisionAccuracy: 0,
                stakeholderSatisfaction: 0,
                processEfficiency: 0,
                outcomeQuality: 0,
                complianceScore: 0,
            },
        };
    }
}
export class BusinessGateFactory {
    createGate(subtype, workflowContext, gateData, options) {
        const gateId = `business-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: gateId,
            type: WorkflowHumanGateType.BUSINESS,
            subtype,
            title: options.title || `Business Review: ${subtype}`,
            description: options.description || `Business validation gate for ${subtype}`,
            status: WorkflowHumanGateStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            workflowContext,
            gateData,
            triggers: options.triggers || this.createDefaultBusinessTriggers(subtype),
            priority: options.priority || WorkflowGatePriority.MEDIUM,
            approvalConfig: {
                approvers: options.approvers || ['product-manager', 'business-analyst'],
                requiredApprovals: 1,
                escalationChain: [
                    GateEscalationLevel.MANAGER,
                    GateEscalationLevel.DIRECTOR,
                ],
            },
            timeoutConfig: options.timeoutConfig,
            metrics: this.createInitialMetrics(),
        };
    }
    createDefaultBusinessTriggers(subtype) {
        return [
            {
                id: `business-${subtype}-trigger`,
                event: 'metrics-threshold-reached',
                condition: async (context) => {
                    return (context.businessDomain === 'product' &&
                        context.impactAssessment.businessImpact > 0.6);
                },
                urgency: GateTriggerUrgency.WITHIN_DAY,
                metadata: {
                    name: `Business ${subtype} trigger`,
                    description: `Triggers when business review is needed for ${subtype}`,
                    phases: ['validation', 'launch'],
                    stakeholders: ['product-manager', 'business-stakeholder'],
                    category: 'business',
                    properties: {},
                },
            },
        ];
    }
    createInitialMetrics() {
        return {
            createdAt: new Date(),
            escalationCount: 0,
            modificationCount: 0,
            stakeholderInteractions: [],
            performance: {
                avgProcessingTime: 0,
                successRate: 0,
                escalationRate: 0,
                timeoutRate: 0,
                resourceUtilization: 0,
            },
            quality: {
                decisionAccuracy: 0,
                stakeholderSatisfaction: 0,
                processEfficiency: 0,
                outcomeQuality: 0,
                complianceScore: 0,
            },
        };
    }
}
export class EthicalGateFactory {
    createGate(subtype, workflowContext, gateData, options) {
        const gateId = `ethical-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: gateId,
            type: WorkflowHumanGateType.ETHICAL,
            subtype,
            title: options.title || `Ethics Review: ${subtype}`,
            description: options.description || `Ethical compliance gate for ${subtype}`,
            status: WorkflowHumanGateStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            workflowContext,
            gateData,
            triggers: options.triggers || this.createDefaultEthicalTriggers(subtype),
            priority: options.priority || WorkflowGatePriority.HIGH,
            approvalConfig: {
                approvers: options.approvers || ['ethics-officer', 'legal-counsel'],
                requiredApprovals: 1,
                escalationChain: [
                    GateEscalationLevel.DIRECTOR,
                    GateEscalationLevel.EXECUTIVE,
                ],
            },
            timeoutConfig: options.timeoutConfig,
            metrics: this.createInitialMetrics(),
        };
    }
    createDefaultEthicalTriggers(subtype) {
        return [
            {
                id: `ethical-${subtype}-trigger`,
                event: 'ethical-review-triggered',
                condition: async (context) => {
                    return context.impactAssessment.complianceImpact.riskLevel !== 'low';
                },
                urgency: GateTriggerUrgency.WITHIN_DAY,
                metadata: {
                    name: `Ethical ${subtype} trigger`,
                    description: `Triggers when ethical review is needed for ${subtype}`,
                    phases: ['design', 'deployment'],
                    stakeholders: ['ethics-officer', 'legal-counsel'],
                    category: 'ethical',
                    properties: {},
                },
            },
        ];
    }
    createInitialMetrics() {
        return {
            createdAt: new Date(),
            escalationCount: 0,
            modificationCount: 0,
            stakeholderInteractions: [],
            performance: {
                avgProcessingTime: 0,
                successRate: 0,
                escalationRate: 0,
                timeoutRate: 0,
                resourceUtilization: 0,
            },
            quality: {
                decisionAccuracy: 0,
                stakeholderSatisfaction: 0,
                processEfficiency: 0,
                outcomeQuality: 0,
                complianceScore: 0,
            },
        };
    }
}
export default WorkflowGatesManager;
//# sourceMappingURL=workflow-gates.js.map