/**
 * @fileoverview SOC2-Compliant Prompt Management Service
 *
 * Enterprise-grade prompt versioning and management with:
 * - Database-backed prompt storage with full audit trails
 * - SOC2 compliance features (access control, audit logging)
 * - Prompt versioning, variants, drafts, and history
 * - Integration with teamwork package for collaborative editing
 * - Integration with workflow package for approval workflows
 * - A/B testing and performance tracking
 */
import { getWorkflowEngine } from '@claude-zen/enterprise';
import { generateUUID, getLogger } from '@claude-zen/foundation';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
export class PromptManagementService {
    logger = getLogger('PromptManagementService');
    ';
    database;
    teamworkSystem;
    workflowEngine;
    async initialize() {
        const dbSystem = await getDatabaseSystem();
        this.database = dbSystem.createProvider('sql');
        ';
        this.teamworkSystem = await getTeamworkSystem();
        this.workflowEngine = await getWorkflowEngine();
        await this.createTables();
        this.logger.info('SOC2-compliant Prompt Management Service initialized');
        ';
    }
    /**
     * Create a new prompt template with SOC2 audit trail
     */
    async createPromptTemplate(data, createdBy, auditContext) {
        const promptId = generateUUID();
        const versionId = generateUUID();
        // Create initial version
        const initialVersion = {
            id: versionId,
            promptId,
            version: '1.0.0',
            content: data.content,
            description: 'Initial version',
            createdBy,
            createdAt: new Date(),
            status: 'draft',
            performance: {
                usageCount: 0,
                successRate: 0,
                averageConfidence: 0,
                humanOverrideRate: 0,
            },
            config: data.config,
            tags: [],
            metadata: {},
        };
        // Create prompt template
        const promptTemplate = {
            id: promptId,
            name: data.name,
            description: data.description,
            gateType: data.gateType,
            activeVersionId: versionId,
            versions: [initialVersion],
            variants: [],
            accessControl: {
                owners: data.owners,
                editors: data.editors || [],
                viewers: data.viewers || [],
                approvers: data.approvers || [],
            },
            auditLog: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Create audit entry
        await this.createAuditEntry(promptId, 'created', createdBy, auditContext, { ': reason, 'Initial prompt template creation': ,
        });
        // Store in database
        await this.storePromptTemplate(promptTemplate);
        this.logger.info('Created new prompt template', { ': promptId,
            name: data.name,
            createdBy,
        });
        return promptTemplate;
    }
    /**
     * Create a new version with approval workflow
     */
    async createPromptVersion(promptId, data, createdBy, auditContext) {
        const template = await this.getPromptTemplate(promptId);
        if (!template) {
            throw new Error(`Prompt template ${promptId} not found`);
            `
    }

    // Check permissions
    await this.checkPermission(template, createdBy, 'edit');'

    // Generate next version number
    const nextVersion = this.generateNextVersion(template.versions);

    const newVersion: PromptVersion = {
      id: generateUUID(),
      promptId,
      version: nextVersion,
      content: data.content,
      description: data.description,
      createdBy,
      createdAt: new Date(),
      status: 'draft',
      performance: {
        usageCount: 0,
        successRate: 0,
        averageConfidence: 0,
        humanOverrideRate: 0,
      },
      config: {
        ...template.versions[template.versions.length - 1].config,
        ...data.config,
      },
      tags: data.tags||[],
      metadata: {},
    };

    // Add to template
    template.versions.push(newVersion);
    template.updatedAt = new Date();

    // Start approval workflow if configured
    if (template.teamworkConfig?.approvalWorkflowId) {
      await this.startApprovalWorkflow(template, newVersion, createdBy);
    }

    // Create audit entry
    await this.createAuditEntry(promptId,'updated', createdBy, auditContext, {'
      reason: 'New version created',
      version: nextVersion,
    });

    // Update database
    await this.updatePromptTemplate(template);

    return newVersion;
  }

  /**
   * Create prompt variant for A/B testing
   */
  async createPromptVariant(
    promptId: string,
    versionId: string,
    data: {
      name: string;
      trafficAllocation: number;
    },
    createdBy: string,
    auditContext: any
  ): Promise<PromptVariant> {
    const template = await this.getPromptTemplate(promptId);
    if (!template) {
      throw new Error(`;
            Prompt;
            template;
            $promptIdnot;
            found `);`;
        }
        await this.checkPermission(template, createdBy, 'edit');
        ';
        // Validate traffic allocation
        const currentAllocation = template.variants
            .filter((v) => v.isActive)
            .reduce((sum, v) => sum + v.trafficAllocation, 0);
        if (currentAllocation + data.trafficAllocation > 1.0) {
            throw new Error('Total traffic allocation cannot exceed 100%');
            ';
        }
        const variant = {
            id: generateUUID(),
            name: data.name,
            versionId,
            trafficAllocation: data.trafficAllocation,
            metrics: {
                requests: 0,
                approvals: 0,
                rejections: 0,
                humanOverrides: 0,
                averageProcessingTime: 0,
            },
            isActive: true,
            createdAt: new Date(),
        };
        template.variants.push(variant);
        template.updatedAt = new Date();
        await this.createAuditEntry(promptId, 'variant_created', createdBy, auditContext, {
            variantName: data.name,
            trafficAllocation: data.trafficAllocation,
        });
        await this.updatePromptTemplate(template);
        return variant;
    }
    /**
     * Create collaborative draft with teamwork integration
     */
    async createDraft(promptId, _data, _authorId) {
        const _template = await this.getPromptTemplate(promptId);
        if (!template) {
            throw new Error(`Prompt template ${promptId} not found`);
            `
    }

    await this.checkPermission(template, authorId, 'edit');'

    const draft: PromptDraft = {
      id: generateUUID(),
      promptId,
      authorId,
      title: data.title,
      content: data.content,
      config: {
        ...template.versions[template.versions.length - 1].config,
        ...data.config,
      },
      collaborators: data.collaborators||[],
      comments: [],
      reviewStatus:'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    // Enable teamwork collaboration if configured
    if (template.teamworkConfig?.collaborationEnabled) {
      await this.enableTeamworkCollaboration(draft);
    }

    await this.storeDraft(draft);

    return draft;
  }

  /**
   * Approve prompt version with SOC2 audit trail
   */
  async approvePromptVersion(
    promptId: string,
    versionId: string,
    approvedBy: string,
    auditContext: any,
    approvalData: {
      reason: string;
      riskAssessment: 'low' | 'medium' | 'high';
      approvalReference?: string;
    }
  ): Promise<void> {
    const template = await this.getPromptTemplate(promptId);
    if (!template) {
      throw new Error(`;
            Prompt;
            _template;
            $promptIdnot;
            found `);`;
        }
        await this.checkPermission(template, approvedBy, 'approve');
        ';
        const version = template.versions.find((v) => v.id === versionId);
        if (!version) {
            throw new Error(`Version ${versionId} not found`);
            `
    }

    // Update version status
    version.status = 'approved';
    version.approvedBy = approvedBy;
    version.approvedAt = new Date();

    // Make this the active version
    template.activeVersionId = versionId;
    template.updatedAt = new Date();

    // Create comprehensive audit entry for SOC2
    await this.createAuditEntry(
      promptId,
      'approved',
      approvedBy,
      auditContext,
      {
        reason: approvalData.reason,
        version: version.version,
        riskAssessment: approvalData.riskAssessment,
        approvalReference: approvalData.approvalReference,
      }
    );

    await this.updatePromptTemplate(template);

    this.logger.info('Prompt version approved', {'
      promptId,
      versionId,
      version: version.version,
      approvedBy,
      riskAssessment: approvalData.riskAssessment,
    });
  }

  /**
   * Get prompt for approval gate with variant selection
   */
  async getPromptForGate(
    gateType: string,
    context: any
  ): Promise<{ version: PromptVersion; variant?: PromptVariant }> {
    // Find templates for this gate type
    const templates = await this.getPromptTemplatesByGateType(gateType);

    if (templates.length === 0) {
      throw new Error(`;
            No;
            prompt;
            templates;
            found;
            for (gate; type; )
                : $gateType `);`;
        }
        // For now, use the first template (could be more sophisticated)
        const template = templates[0];
        // Select variant based on A/B testing
        const variant = this.selectVariant(template);
        let version;
        if (variant) {
            version = template.versions.find((v) => v.id === variant.versionId);
            await this.trackVariantUsage(variant.id);
        }
        else {
            version = template.versions.find((v) => v.id === template.activeVersionId);
        }
        // Track usage
        version.performance.usageCount++;
        await this.updatePromptTemplate(template);
        return { version, variant };
    }
    /**
     * Track prompt performance for continuous improvement
     */
    async trackPromptPerformance(versionId, result, variantId) {
        // Update version performance
        const template = await this.getPromptTemplateByVersionId(versionId);
        if (!template)
            return;
        const version = template.versions.find((v) => v.id === versionId);
        if (!version)
            return;
        // Update metrics
        const total = version.performance.usageCount;
        version.performance.successRate =
            (version.performance.successRate * (total - 1) +
                (result.success ? 1 : 0)) /
                total;
        version.performance.averageConfidence =
            (version.performance.averageConfidence * (total - 1) +
                result.confidence) /
                total;
        version.performance.humanOverrideRate =
            (version.performance.humanOverrideRate * (total - 1) +
                (result.humanOverride ? 1 : 0)) /
                total;
        // Update variant metrics if applicable
        if (variantId) {
            const variant = template.variants.find((v) => v.id === variantId);
            if (variant) {
                variant.metrics.requests++;
                if (result.success)
                    variant.metrics.approvals++;
                else
                    variant.metrics.rejections++;
                if (result.humanOverride)
                    variant.metrics.humanOverrides++;
                const variantTotal = variant.metrics.requests;
                variant.metrics.averageProcessingTime =
                    (variant.metrics.averageProcessingTime * (variantTotal - 1) +
                        result.processingTime) /
                        variantTotal;
            }
        }
        await this.updatePromptTemplate(template);
    }
    // Private helper methods
    async checkPermission(template, userId, action, ) {
        const { accessControl } = template;
        const hasPermission = false;
        switch (action) {
            case 'view':
                ';
                hasPermission = [
                    ...accessControl.owners,
                    ...accessControl.editors,
                    ...accessControl.viewers,
                    ...accessControl.approvers,
                ].includes(userId);
                break;
            case 'edit':
                ';
                hasPermission = [
                    ...accessControl.owners,
                    ...accessControl.editors,
                ].includes(userId);
                break;
            case 'approve':
                ';
                hasPermission = [
                    ...accessControl.owners,
                    ...accessControl.approvers,
                ].includes(userId);
                break;
        }
        if (!hasPermission) {
            throw new Error(`User ${userId} does not have ${action} permission`);
            `
    }
  }

  private generateNextVersion(versions: PromptVersion[]): string {
    const latest = versions[versions.length - 1];
    const [major, minor, patch] = latest.version.split('.').map(Number);'
    return `;
            $major.$minor.$patch + 1 `;`;
        }
    }
    selectVariant(template) {
        const activeVariants = template.variants.filter((v) => v.isActive);
        if (activeVariants.length === 0)
            return undefined;
        const random = Math.random();
        let cumulative = 0;
        for (const variant of activeVariants) {
            cumulative += variant.trafficAllocation;
            if (random <= cumulative) {
                return variant;
            }
        }
        return activeVariants[0]; // Fallback
    }
    async createAuditEntry(promptId, action, userId, auditContext, metadata = {}) {
        const auditEntry = {
            id: generateUUID(),
            promptId,
            action,
            userId,
            timestamp: new Date(),
            ipAddress: auditContext.ipAddress,
            userAgent: auditContext.userAgent,
            sessionId: auditContext.sessionId,
            ...metadata,
        };
        await this.storeAuditEntry(auditEntry);
    }
}
// Integration with teamwork package for real-time collaboration
await this.teamworkSystem.createCollaborativeSession({
    resourceId: draft.id,
    resourceType: 'prompt_draft',
    collaborators: draft.collaborators,
    permissions: {
        canEdit: true,
        canComment: true,
        canView: true,
    },
});
async;
startApprovalWorkflow(template, PromptTemplate, version, PromptVersion, createdBy, string);
Promise;
if (!template.teamworkConfig?.approvalWorkflowId)
    return;
// Start workflow using the workflow engine
await this.workflowEngine.startWorkflow({
    workflowId: template.teamworkConfig.approvalWorkflowId,
    context: {
        promptId: template.id,
        versionId: version.id,
        createdBy,
        approvers: template.accessControl.approvers,
    },
});
async;
createTables();
Promise;
// Create tables for prompt management with SOC2 compliance
await this.database.schema.createTableIfNotExists('prompt_templates', (table) => {
    table.uuid('id').primary();
    ';
    table.string('name').notNullable();
    ';
    table.text('description');
    ';
    table.string('gate_type').notNullable();
    ';
    table.uuid('active_version_id');
    ';
    table.json('access_control').notNullable();
    ';
    table.json('teamwork_config');
    ';
    table.timestamps(true, true);
    table.uuid('tenant_id');
    ';
    table.index(['gate_type']);
    ';
    table.index(['tenant_id']);
    ';
});
await this.database.schema.createTableIfNotExists('prompt_versions', (table) => {
    table.uuid('id').primary();
    ';
    table.uuid('prompt_id').notNullable();
    ';
    table.string('version').notNullable();
    ';
    table.text('content').notNullable();
    ';
    table.text('description');
    ';
    table.uuid('created_by').notNullable();
    ';
    table.timestamp('created_at').notNullable();
    ';
    table.uuid('approved_by');
    ';
    table.timestamp('approved_at');
    ';
    table.string('status').notNullable();
    ';
    table.json('performance').notNullable();
    ';
    table.json('config').notNullable();
    ';
    table.json('tags');
    ';
    table.json('metadata');
    ';
    table
        .foreign('prompt_id');
    '
        .references('prompt_templates.id');
    '
        .onDelete('CASCADE');
    ';
    table.index(['prompt_id', 'version']);
    ';
    table.index(['status']);
    ';
});
await this.database.schema.createTableIfNotExists('prompt_variants', (table) => {
    table.uuid('id').primary();
    ';
    table.string('name').notNullable();
    ';
    table.uuid('version_id').notNullable();
    ';
    table.decimal('traffic_allocation', 5, 4).notNullable();
    ';
    table.json('metrics').notNullable();
    ';
    table.boolean('is_active').defaultTo(true);
    ';
    table.timestamp('created_at').notNullable();
    ';
    table
        .foreign('version_id');
    '
        .references('prompt_versions.id');
    '
        .onDelete('CASCADE');
    ';
});
await this.database.schema.createTableIfNotExists('prompt_audit_log', (table) => {
    table.uuid('id').primary();
    ';
    table.uuid('prompt_id').notNullable();
    ';
    table.string('action').notNullable();
    ';
    table.uuid('user_id').notNullable();
    ';
    table.timestamp('timestamp').notNullable();
    ';
    table.string('ip_address');
    ';
    table.text('user_agent');
    ';
    table.string('session_id');
    ';
    table.json('changes');
    ';
    table.text('reason');
    ';
    table.string('approval_reference');
    ';
    table.string('risk_assessment');
    ';
    table.json('metadata');
    ';
    table
        .foreign('prompt_id');
    '
        .references('prompt_templates.id');
    '
        .onDelete('CASCADE');
    ';
    table.index(['prompt_id', 'timestamp']);
    ';
    table.index(['user_id', 'timestamp']);
    ';
    table.index(['action']);
    ';
});
await this.database.schema.createTableIfNotExists('prompt_drafts', (table) => {
    table.uuid('id').primary();
    ';
    table.uuid('prompt_id').notNullable();
    ';
    table.uuid('author_id').notNullable();
    ';
    table.string('title').notNullable();
    ';
    table.text('content').notNullable();
    ';
    table.json('config').notNullable();
    ';
    table.json('collaborators');
    ';
    table.json('comments');
    ';
    table.string('review_status').notNullable();
    ';
    table.uuid('workflow_instance_id');
    ';
    table.timestamps(true, true);
    table.timestamp('expires_at');
    ';
    table
        .foreign('prompt_id');
    '
        .references('prompt_templates.id');
    '
        .onDelete('CASCADE');
    ';
    table.index(['prompt_id']);
    ';
    table.index(['author_id']);
    ';
    table.index(['review_status']);
    ';
});
async;
storePromptTemplate(template, PromptTemplate);
Promise;
await this.database.transaction(async (trx) => {
    // Insert template
    await trx('prompt_templates').insert({ ': id, template, : .id,
        name: template.name,
        description: template.description,
        gate_type: template.gateType,
        active_version_id: template.activeVersionId,
        access_control: JSON.stringify(template.accessControl),
        teamwork_config: JSON.stringify(template.teamworkConfig),
        created_at: template.createdAt,
        updated_at: template.updatedAt,
        tenant_id: template.tenantId,
    });
    // Insert versions
    for (const version of template.versions) {
        await trx('prompt_versions').insert({ ': id, version, : .id,
            prompt_id: version.promptId,
            version: version.version,
            content: version.content,
            description: version.description,
            created_by: version.createdBy,
            created_at: version.createdAt,
            approved_by: version.approvedBy,
            approved_at: version.approvedAt,
            status: version.status,
            performance: JSON.stringify(version.performance),
            config: JSON.stringify(version.config),
            tags: JSON.stringify(version.tags),
            metadata: JSON.stringify(version.metadata),
        });
    }
});
async;
updatePromptTemplate(template, PromptTemplate);
Promise;
// Implementation would update the database records
// This is a simplified version
await this.database('prompt_templates').where('id', template.id).update({ ': active_version_id, template, : .activeVersionId,
    updated_at: template.updatedAt,
});
async;
getPromptTemplate(promptId, string);
Promise;
// Implementation would fetch from database and reconstruct object
// This is a placeholder
return null;
async;
getPromptTemplatesByGateType(gateType, string);
Promise;
// Implementation would fetch templates by gate type
return [];
async;
getPromptTemplateByVersionId(versionId, string);
Promise;
// Implementation would fetch template by version ID
return null;
async;
storeAuditEntry(entry, PromptAuditEntry);
Promise;
await this.database('prompt_audit_log').insert({ ': id, entry, : .id,
    prompt_id: entry.promptId,
    action: entry.action,
    user_id: entry.userId,
    timestamp: entry.timestamp,
    ip_address: entry.ipAddress,
    user_agent: entry.userAgent,
    session_id: entry.sessionId,
    changes: JSON.stringify(entry.changes),
    reason: entry.reason,
    approval_reference: entry.approvalReference,
    risk_assessment: entry.riskAssessment,
    metadata: JSON.stringify(entry.metadata),
});
async;
storeDraft(draft, PromptDraft);
Promise;
await this.database('prompt_drafts').insert({ ': id, draft, : .id,
    prompt_id: draft.promptId,
    author_id: draft.authorId,
    title: draft.title,
    content: draft.content,
    config: JSON.stringify(draft.config),
    collaborators: JSON.stringify(draft.collaborators),
    comments: JSON.stringify(draft.comments),
    review_status: draft.reviewStatus,
    workflow_instance_id: draft.workflowInstanceId,
    created_at: draft.createdAt,
    updated_at: draft.updatedAt,
    expires_at: draft.expiresAt,
});
async;
trackVariantUsage(variantId, string);
Promise;
// Track variant usage for A/B testing
await this.database('prompt_variants');
'
    .where('id', variantId);
'
    .increment('metrics->requests', 1);
';
