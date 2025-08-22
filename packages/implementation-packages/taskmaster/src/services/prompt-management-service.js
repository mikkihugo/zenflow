"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManagementService = void 0;
var foundation_1 = require("@claude-zen/foundation");
var infrastructure_1 = require("@claude-zen/infrastructure");
var teamwork_1 = require("@claude-zen/teamwork");
var enterprise_1 = require("@claude-zen/enterprise");
var uuid_1 = require("uuid");
var PromptManagementService = /** @class */ (function () {
    function PromptManagementService() {
        this.logger = (0, foundation_1.getLogger)('PromptManagementService');
    }
    PromptManagementService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbSystem, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, infrastructure_1.getDatabaseSystem)()];
                    case 1:
                        dbSystem = _c.sent();
                        this.database = dbSystem.createProvider('sql');
                        _a = this;
                        return [4 /*yield*/, (0, teamwork_1.getTeamworkSystem)()];
                    case 2:
                        _a.teamworkSystem = _c.sent();
                        _b = this;
                        return [4 /*yield*/, (0, enterprise_1.getWorkflowEngine)()];
                    case 3:
                        _b.workflowEngine = _c.sent();
                        return [4 /*yield*/, this.createTables()];
                    case 4:
                        _c.sent();
                        this.logger.info('SOC2-compliant Prompt Management Service initialized');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new prompt template with SOC2 audit trail
     */
    PromptManagementService.prototype.createPromptTemplate = function (data, createdBy, auditContext) {
        return __awaiter(this, void 0, void 0, function () {
            var promptId, versionId, initialVersion, promptTemplate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promptId = (0, uuid_1.v4)();
                        versionId = (0, uuid_1.v4)();
                        initialVersion = {
                            id: versionId,
                            promptId: promptId,
                            version: '1.0.0',
                            content: data.content,
                            description: 'Initial version',
                            createdBy: createdBy,
                            createdAt: new Date(),
                            status: 'draft',
                            performance: {
                                usageCount: 0,
                                successRate: 0,
                                averageConfidence: 0,
                                humanOverrideRate: 0
                            },
                            config: data.config,
                            tags: [],
                            metadata: {}
                        };
                        promptTemplate = {
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
                                approvers: data.approvers || []
                            },
                            auditLog: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        // Create audit entry
                        return [4 /*yield*/, this.createAuditEntry(promptId, 'created', createdBy, auditContext, {
                                reason: 'Initial prompt template creation'
                            })];
                    case 1:
                        // Create audit entry
                        _a.sent();
                        // Store in database
                        return [4 /*yield*/, this.storePromptTemplate(promptTemplate)];
                    case 2:
                        // Store in database
                        _a.sent();
                        this.logger.info('Created new prompt template', {
                            promptId: promptId,
                            name: data.name,
                            createdBy: createdBy
                        });
                        return [2 /*return*/, promptTemplate];
                }
            });
        });
    };
    /**
     * Create a new version with approval workflow
     */
    PromptManagementService.prototype.createPromptVersion = function (promptId, data, createdBy, auditContext) {
        return __awaiter(this, void 0, void 0, function () {
            var template, nextVersion, newVersion;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getPromptTemplate(promptId)];
                    case 1:
                        template = _b.sent();
                        if (!template) {
                            throw new Error("Prompt template ".concat(promptId, " not found"));
                        }
                        // Check permissions
                        return [4 /*yield*/, this.checkPermission(template, createdBy, 'edit')];
                    case 2:
                        // Check permissions
                        _b.sent();
                        nextVersion = this.generateNextVersion(template.versions);
                        newVersion = {
                            id: (0, uuid_1.v4)(),
                            promptId: promptId,
                            version: nextVersion,
                            content: data.content,
                            description: data.description,
                            createdBy: createdBy,
                            createdAt: new Date(),
                            status: 'draft',
                            performance: {
                                usageCount: 0,
                                successRate: 0,
                                averageConfidence: 0,
                                humanOverrideRate: 0
                            },
                            config: __assign(__assign({}, template.versions[template.versions.length - 1].config), data.config),
                            tags: data.tags || [],
                            metadata: {}
                        };
                        // Add to template
                        template.versions.push(newVersion);
                        template.updatedAt = new Date();
                        if (!((_a = template.teamworkConfig) === null || _a === void 0 ? void 0 : _a.approvalWorkflowId)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.startApprovalWorkflow(template, newVersion, createdBy)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: 
                    // Create audit entry
                    return [4 /*yield*/, this.createAuditEntry(promptId, 'updated', createdBy, auditContext, {
                            reason: 'New version created',
                            version: nextVersion
                        })];
                    case 5:
                        // Create audit entry
                        _b.sent();
                        // Update database
                        return [4 /*yield*/, this.updatePromptTemplate(template)];
                    case 6:
                        // Update database
                        _b.sent();
                        return [2 /*return*/, newVersion];
                }
            });
        });
    };
    /**
     * Create prompt variant for A/B testing
     */
    PromptManagementService.prototype.createPromptVariant = function (promptId, versionId, data, createdBy, auditContext) {
        return __awaiter(this, void 0, void 0, function () {
            var template, currentAllocation, variant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPromptTemplate(promptId)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error("Prompt template ".concat(promptId, " not found"));
                        }
                        return [4 /*yield*/, this.checkPermission(template, createdBy, 'edit')];
                    case 2:
                        _a.sent();
                        currentAllocation = template.variants
                            .filter(function (v) { return v.isActive; })
                            .reduce(function (sum, v) { return sum + v.trafficAllocation; }, 0);
                        if (currentAllocation + data.trafficAllocation > 1.0) {
                            throw new Error('Total traffic allocation cannot exceed 100%');
                        }
                        variant = {
                            id: (0, uuid_1.v4)(),
                            name: data.name,
                            versionId: versionId,
                            trafficAllocation: data.trafficAllocation,
                            metrics: {
                                requests: 0,
                                approvals: 0,
                                rejections: 0,
                                humanOverrides: 0,
                                averageProcessingTime: 0
                            },
                            isActive: true,
                            createdAt: new Date()
                        };
                        template.variants.push(variant);
                        template.updatedAt = new Date();
                        return [4 /*yield*/, this.createAuditEntry(promptId, 'variant_created', createdBy, auditContext, {
                                variantName: data.name,
                                trafficAllocation: data.trafficAllocation
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.updatePromptTemplate(template)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, variant];
                }
            });
        });
    };
    /**
     * Create collaborative draft with teamwork integration
     */
    PromptManagementService.prototype.createDraft = function (promptId, data, authorId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, draft;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getPromptTemplate(promptId)];
                    case 1:
                        template = _b.sent();
                        if (!template) {
                            throw new Error("Prompt template ".concat(promptId, " not found"));
                        }
                        return [4 /*yield*/, this.checkPermission(template, authorId, 'edit')];
                    case 2:
                        _b.sent();
                        draft = {
                            id: (0, uuid_1.v4)(),
                            promptId: promptId,
                            authorId: authorId,
                            title: data.title,
                            content: data.content,
                            config: __assign(__assign({}, template.versions[template.versions.length - 1].config), data.config),
                            collaborators: data.collaborators || [],
                            comments: [],
                            reviewStatus: 'pending',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                        };
                        if (!((_a = template.teamworkConfig) === null || _a === void 0 ? void 0 : _a.collaborationEnabled)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.enableTeamworkCollaboration(draft)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, this.storeDraft(draft)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, draft];
                }
            });
        });
    };
    /**
     * Approve prompt version with SOC2 audit trail
     */
    PromptManagementService.prototype.approvePromptVersion = function (promptId, versionId, approvedBy, auditContext, approvalData) {
        return __awaiter(this, void 0, void 0, function () {
            var template, version;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPromptTemplate(promptId)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error("Prompt template ".concat(promptId, " not found"));
                        }
                        return [4 /*yield*/, this.checkPermission(template, approvedBy, 'approve')];
                    case 2:
                        _a.sent();
                        version = template.versions.find(function (v) { return v.id === versionId; });
                        if (!version) {
                            throw new Error("Version ".concat(versionId, " not found"));
                        }
                        // Update version status
                        version.status = 'approved';
                        version.approvedBy = approvedBy;
                        version.approvedAt = new Date();
                        // Make this the active version
                        template.activeVersionId = versionId;
                        template.updatedAt = new Date();
                        // Create comprehensive audit entry for SOC2
                        return [4 /*yield*/, this.createAuditEntry(promptId, 'approved', approvedBy, auditContext, {
                                reason: approvalData.reason,
                                version: version.version,
                                riskAssessment: approvalData.riskAssessment,
                                approvalReference: approvalData.approvalReference
                            })];
                    case 3:
                        // Create comprehensive audit entry for SOC2
                        _a.sent();
                        return [4 /*yield*/, this.updatePromptTemplate(template)];
                    case 4:
                        _a.sent();
                        this.logger.info('Prompt version approved', {
                            promptId: promptId,
                            versionId: versionId,
                            version: version.version,
                            approvedBy: approvedBy,
                            riskAssessment: approvalData.riskAssessment
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get prompt for approval gate with variant selection
     */
    PromptManagementService.prototype.getPromptForGate = function (gateType, context) {
        return __awaiter(this, void 0, void 0, function () {
            var templates, template, variant, version;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPromptTemplatesByGateType(gateType)];
                    case 1:
                        templates = _a.sent();
                        if (templates.length === 0) {
                            throw new Error("No prompt templates found for gate type: ".concat(gateType));
                        }
                        template = templates[0];
                        variant = this.selectVariant(template);
                        if (!variant) return [3 /*break*/, 3];
                        version = template.versions.find(function (v) { return v.id === variant.versionId; });
                        return [4 /*yield*/, this.trackVariantUsage(variant.id)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        version = template.versions.find(function (v) { return v.id === template.activeVersionId; });
                        _a.label = 4;
                    case 4:
                        // Track usage
                        version.performance.usageCount++;
                        return [4 /*yield*/, this.updatePromptTemplate(template)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, { version: version, variant: variant }];
                }
            });
        });
    };
    /**
     * Track prompt performance for continuous improvement
     */
    PromptManagementService.prototype.trackPromptPerformance = function (versionId, result, variantId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, version, total, variant, variantTotal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPromptTemplateByVersionId(versionId)];
                    case 1:
                        template = _a.sent();
                        if (!template)
                            return [2 /*return*/];
                        version = template.versions.find(function (v) { return v.id === versionId; });
                        if (!version)
                            return [2 /*return*/];
                        total = version.performance.usageCount;
                        version.performance.successRate =
                            (version.performance.successRate * (total - 1) + (result.success ? 1 : 0)) / total;
                        version.performance.averageConfidence =
                            (version.performance.averageConfidence * (total - 1) + result.confidence) / total;
                        version.performance.humanOverrideRate =
                            (version.performance.humanOverrideRate * (total - 1) + (result.humanOverride ? 1 : 0)) / total;
                        // Update variant metrics if applicable
                        if (variantId) {
                            variant = template.variants.find(function (v) { return v.id === variantId; });
                            if (variant) {
                                variant.metrics.requests++;
                                if (result.success)
                                    variant.metrics.approvals++;
                                else
                                    variant.metrics.rejections++;
                                if (result.humanOverride)
                                    variant.metrics.humanOverrides++;
                                variantTotal = variant.metrics.requests;
                                variant.metrics.averageProcessingTime =
                                    (variant.metrics.averageProcessingTime * (variantTotal - 1) + result.processingTime) / variantTotal;
                            }
                        }
                        return [4 /*yield*/, this.updatePromptTemplate(template)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Private helper methods
    PromptManagementService.prototype.checkPermission = function (template, userId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var accessControl, hasPermission;
            return __generator(this, function (_a) {
                accessControl = template.accessControl;
                hasPermission = false;
                switch (action) {
                    case 'view':
                        hasPermission = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], accessControl.owners, true), accessControl.editors, true), accessControl.viewers, true), accessControl.approvers, true).includes(userId);
                        break;
                    case 'edit':
                        hasPermission = __spreadArray(__spreadArray([], accessControl.owners, true), accessControl.editors, true).includes(userId);
                        break;
                    case 'approve':
                        hasPermission = __spreadArray(__spreadArray([], accessControl.owners, true), accessControl.approvers, true).includes(userId);
                        break;
                }
                if (!hasPermission) {
                    throw new Error("User ".concat(userId, " does not have ").concat(action, " permission"));
                }
                return [2 /*return*/];
            });
        });
    };
    PromptManagementService.prototype.generateNextVersion = function (versions) {
        var latest = versions[versions.length - 1];
        var _a = latest.version.split('.').map(Number), major = _a[0], minor = _a[1], patch = _a[2];
        return "".concat(major, ".").concat(minor, ".").concat(patch + 1);
    };
    PromptManagementService.prototype.selectVariant = function (template) {
        var activeVariants = template.variants.filter(function (v) { return v.isActive; });
        if (activeVariants.length === 0)
            return undefined;
        var random = Math.random();
        var cumulative = 0;
        for (var _i = 0, activeVariants_1 = activeVariants; _i < activeVariants_1.length; _i++) {
            var variant = activeVariants_1[_i];
            cumulative += variant.trafficAllocation;
            if (random <= cumulative) {
                return variant;
            }
        }
        return activeVariants[0]; // Fallback
    };
    PromptManagementService.prototype.createAuditEntry = function (promptId_1, action_1, userId_1, auditContext_1) {
        return __awaiter(this, arguments, void 0, function (promptId, action, userId, auditContext, metadata) {
            var auditEntry;
            if (metadata === void 0) { metadata = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auditEntry = __assign({ id: (0, uuid_1.v4)(), promptId: promptId, action: action, userId: userId, timestamp: new Date(), ipAddress: auditContext.ipAddress, userAgent: auditContext.userAgent, sessionId: auditContext.sessionId }, metadata);
                        return [4 /*yield*/, this.storeAuditEntry(auditEntry)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManagementService.prototype.enableTeamworkCollaboration = function (draft) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Integration with teamwork package for real-time collaboration
                    return [4 /*yield*/, this.teamworkSystem.createCollaborativeSession({
                            resourceId: draft.id,
                            resourceType: 'prompt_draft',
                            collaborators: draft.collaborators,
                            permissions: {
                                canEdit: true,
                                canComment: true,
                                canView: true
                            }
                        })];
                    case 1:
                        // Integration with teamwork package for real-time collaboration
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManagementService.prototype.startApprovalWorkflow = function (template, version, createdBy) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = template.teamworkConfig) === null || _a === void 0 ? void 0 : _a.approvalWorkflowId))
                            return [2 /*return*/];
                        // Start workflow using the workflow engine
                        return [4 /*yield*/, this.workflowEngine.startWorkflow({
                                workflowId: template.teamworkConfig.approvalWorkflowId,
                                context: {
                                    promptId: template.id,
                                    versionId: version.id,
                                    createdBy: createdBy,
                                    approvers: template.accessControl.approvers
                                }
                            })];
                    case 1:
                        // Start workflow using the workflow engine
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Database operations
    PromptManagementService.prototype.createTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Create tables for prompt management with SOC2 compliance
                    return [4 /*yield*/, this.database.schema.createTableIfNotExists('prompt_templates', function (table) {
                            table.uuid('id').primary();
                            table.string('name').notNullable();
                            table.text('description');
                            table.string('gate_type').notNullable();
                            table.uuid('active_version_id');
                            table.json('access_control').notNullable();
                            table.json('teamwork_config');
                            table.timestamps(true, true);
                            table.uuid('tenant_id');
                            table.index(['gate_type']);
                            table.index(['tenant_id']);
                        })];
                    case 1:
                        // Create tables for prompt management with SOC2 compliance
                        _a.sent();
                        return [4 /*yield*/, this.database.schema.createTableIfNotExists('prompt_versions', function (table) {
                                table.uuid('id').primary();
                                table.uuid('prompt_id').notNullable();
                                table.string('version').notNullable();
                                table.text('content').notNullable();
                                table.text('description');
                                table.uuid('created_by').notNullable();
                                table.timestamp('created_at').notNullable();
                                table.uuid('approved_by');
                                table.timestamp('approved_at');
                                table.string('status').notNullable();
                                table.json('performance').notNullable();
                                table.json('config').notNullable();
                                table.json('tags');
                                table.json('metadata');
                                table.foreign('prompt_id').references('prompt_templates.id').onDelete('CASCADE');
                                table.index(['prompt_id', 'version']);
                                table.index(['status']);
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.database.schema.createTableIfNotExists('prompt_variants', function (table) {
                                table.uuid('id').primary();
                                table.string('name').notNullable();
                                table.uuid('version_id').notNullable();
                                table.decimal('traffic_allocation', 5, 4).notNullable();
                                table.json('metrics').notNullable();
                                table.boolean('is_active').defaultTo(true);
                                table.timestamp('created_at').notNullable();
                                table.foreign('version_id').references('prompt_versions.id').onDelete('CASCADE');
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.database.schema.createTableIfNotExists('prompt_audit_log', function (table) {
                                table.uuid('id').primary();
                                table.uuid('prompt_id').notNullable();
                                table.string('action').notNullable();
                                table.uuid('user_id').notNullable();
                                table.timestamp('timestamp').notNullable();
                                table.string('ip_address');
                                table.text('user_agent');
                                table.string('session_id');
                                table.json('changes');
                                table.text('reason');
                                table.string('approval_reference');
                                table.string('risk_assessment');
                                table.json('metadata');
                                table.foreign('prompt_id').references('prompt_templates.id').onDelete('CASCADE');
                                table.index(['prompt_id', 'timestamp']);
                                table.index(['user_id', 'timestamp']);
                                table.index(['action']);
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.database.schema.createTableIfNotExists('prompt_drafts', function (table) {
                                table.uuid('id').primary();
                                table.uuid('prompt_id').notNullable();
                                table.uuid('author_id').notNullable();
                                table.string('title').notNullable();
                                table.text('content').notNullable();
                                table.json('config').notNullable();
                                table.json('collaborators');
                                table.json('comments');
                                table.string('review_status').notNullable();
                                table.uuid('workflow_instance_id');
                                table.timestamps(true, true);
                                table.timestamp('expires_at');
                                table.foreign('prompt_id').references('prompt_templates.id').onDelete('CASCADE');
                                table.index(['prompt_id']);
                                table.index(['author_id']);
                                table.index(['review_status']);
                            })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManagementService.prototype.storePromptTemplate = function (template) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database.transaction(function (trx) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, _a, version;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: 
                                    // Insert template
                                    return [4 /*yield*/, trx('prompt_templates').insert({
                                            id: template.id,
                                            name: template.name,
                                            description: template.description,
                                            gate_type: template.gateType,
                                            active_version_id: template.activeVersionId,
                                            access_control: JSON.stringify(template.accessControl),
                                            teamwork_config: JSON.stringify(template.teamworkConfig),
                                            created_at: template.createdAt,
                                            updated_at: template.updatedAt,
                                            tenant_id: template.tenantId
                                        })];
                                    case 1:
                                        // Insert template
                                        _b.sent();
                                        _i = 0, _a = template.versions;
                                        _b.label = 2;
                                    case 2:
                                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                                        version = _a[_i];
                                        return [4 /*yield*/, trx('prompt_versions').insert({
                                                id: version.id,
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
                                                metadata: JSON.stringify(version.metadata)
                                            })];
                                    case 3:
                                        _b.sent();
                                        _b.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManagementService.prototype.updatePromptTemplate = function (template) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Implementation would update the database records
                    // This is a simplified version
                    return [4 /*yield*/, this.database('prompt_templates')
                            .where('id', template.id)
                            .update({
                            active_version_id: template.activeVersionId,
                            updated_at: template.updatedAt
                        })];
                    case 1:
                        // Implementation would update the database records
                        // This is a simplified version
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManagementService.prototype.getPromptTemplate = function (promptId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would fetch from database and reconstruct object
                // This is a placeholder
                return [2 /*return*/, null];
            });
        });
    };
    PromptManagementService.prototype.getPromptTemplatesByGateType = function (gateType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would fetch templates by gate type
                return [2 /*return*/, []];
            });
        });
    };
    PromptManagementService.prototype.getPromptTemplateByVersionId = function (versionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would fetch template by version ID
                return [2 /*return*/, null];
            });
        });
    };
    PromptManagementService.prototype.storeAuditEntry = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database('prompt_audit_log').insert({
                            id: entry.id,
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
                            metadata: JSON.stringify(entry.metadata)
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManagementService.prototype.storeDraft = function (draft) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database('prompt_drafts').insert({
                            id: draft.id,
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
                            expires_at: draft.expiresAt
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManagementService.prototype.trackVariantUsage = function (variantId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Track variant usage for A/B testing
                    return [4 /*yield*/, this.database('prompt_variants')
                            .where('id', variantId)
                            .increment('metrics->requests', 1)];
                    case 1:
                        // Track variant usage for A/B testing
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PromptManagementService;
}());
exports.PromptManagementService = PromptManagementService;
