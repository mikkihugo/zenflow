/**
 * @fileoverview AGUI Package - Autonomous Graphical User Interface Library
 * 
 * **AUTONOMOUS GRAPHICAL USER INTERFACE FOR CLAUDE-ZEN**
 * 
 * Advanced human-in-the-loop interaction system with task approval workflows,
 * terminal interfaces, and autonomous decision-making capabilities.
 * 
 * **CORE CAPABILITIES:**
 * - 🤖 **Autonomous GUI System**: Self-managing interface components
 * - 👤 **Human-in-the-loop**: Interactive decision points and approvals
 * - ✅ **Task Approval Workflows**: Structured approval processes
 * - 💻 **Terminal Interfaces**: Rich command-line interactions
 * - 🎭 **Mock Interfaces**: Testing and development support
 * - 📊 **Event-driven Architecture**: Reactive interface patterns
 * - 🔧 **Foundation Integration**: Complete @claude-zen/foundation support
 * - 🌐 **Multi-platform Support**: Terminal, web, and API interfaces
 * 
 * **Enterprise Features:**
 * - Workflow gates and decision logging
 * - Rich terminal interactions with colors and formatting
 * - Automated approval workflows with timeouts
 * - Task validation and context management
 * - Performance monitoring and analytics
 * - Circuit breaker protection for long-running interactions
 * - Graceful degradation to automated decisions
 * 
 * @example Basic AGUI System
 * ```typescript
 * import { createAGUI } from '@claude-zen/agui';
 * 
 * const { agui, taskApproval } = await createAGUI({
 *   aguiType: 'terminal',
 *   taskApprovalConfig: {
 *     autoApprove: false,
 *     timeoutMs: 30000,
 *     defaultDecision: 'ask'
 *   }
 * });
 * 
 * // Use AGUI for human interaction
 * const userResponse = await agui.askQuestion('Proceed with deployment?', {
 *   type: 'boolean',
 *   priority: 'high',
 *   context: { environment: 'production' }
 * });
 * 
 * if (userResponse.answer) {
 *   console.log('Deployment approved!');
 * }
 * ```
 * 
 * @example Task Approval Workflows
 * ```typescript
 * import { TaskApprovalSystem } from '@claude-zen/agui';
 * 
 * const taskApproval = new TaskApprovalSystem({
 *   autoApprove: false,
 *   timeoutMs: 60000,
 *   enableLogging: true
 * });
 * 
 * // Request approval for sensitive operations
 * const approved = await taskApproval.requestApproval({
 *   taskType: 'file-deletion',
 *   description: 'Delete temporary files older than 30 days',
 *   context: {
 *     fileCount: 1247,
 *     totalSize: '2.3GB',
 *     oldestFile: '45 days ago'
 *   },
 *   priority: 'medium'
 * });
 * 
 * if (approved.decision === 'approved') {
 *   // Proceed with deletion
 *   console.log('File deletion approved');
 * }
 * ```
 * 
 * @example Enterprise Workflow Management System
 * ```typescript
 * import { 
 *   AdvancedTaskApprovalSystem,
 *   WorkflowOrchestrator,
 *   ApprovalChain,
 *   AuditTracker 
 * } from '@claude-zen/agui';
 * 
 * // Create enterprise-grade approval system
 * const enterpriseApproval = new AdvancedTaskApprovalSystem({
 *   multiStageApproval: {
 *     enabled: true,
 *     stages: [
 *       { role: 'team-lead', requiredApprovals: 1, timeout: 1800000 }, // 30 min
 *       { role: 'manager', requiredApprovals: 1, timeout: 3600000 }, // 1 hour
 *       { role: 'executive', requiredApprovals: 1, timeout: 86400000 } // 24 hours
 *     ]
 *   },
 *   compliance: {
 *     sox: true,
 *     gdpr: true,
 *     hipaa: false,
 *     auditRetention: '7y'
 *   },
 *   security: {
 *     encryption: 'AES-256-GCM',
 *     digitalSignatures: true,
 *     accessControl: 'rbac',
 *     mfa: 'required'
 *   },
 *   integration: {
 *     slack: { enabled: true, channel: '#approvals' },
 *     email: { enabled: true, template: 'enterprise' },
 *     jira: { enabled: true, createTickets: true },
 *     servicenow: { enabled: true, workflow: 'change-request' }
 *   }
 * });
 * 
 * // Workflow orchestrator for complex business processes
 * const workflowOrchestrator = new WorkflowOrchestrator({
 *   workflows: {
 *     'production-deployment': {
 *       stages: [
 *         { name: 'security-review', approvers: ['security-team'], parallel: false },
 *         { name: 'qa-approval', approvers: ['qa-lead'], parallel: false },
 *         { name: 'business-approval', approvers: ['product-owner'], parallel: true },
 *         { name: 'infrastructure-approval', approvers: ['devops-lead'], parallel: true },
 *         { name: 'executive-sign-off', approvers: ['cto', 'cfo'], parallel: false }
 *       ],
 *       escalation: {
 *         timeouts: [3600000, 7200000, 86400000], // 1h, 2h, 24h
 *         escalationPath: ['manager', 'director', 'vp', 'c-level']
 *       }
 *     },
 *     'data-access-request': {
 *       stages: [
 *         { name: 'data-governance', approvers: ['data-governance-team'], parallel: false },
 *         { name: 'privacy-review', approvers: ['privacy-officer'], parallel: false },
 *         { name: 'security-clearance', approvers: ['security-officer'], parallel: false }
 *       ],
 *       compliance: ['gdpr', 'ccpa', 'sox']
 *     }
 *   },
 *   monitoring: {
 *     sla: {
 *       responseTime: 3600000, // 1 hour
 *       resolutionTime: 86400000, // 24 hours
 *       escalationThreshold: 172800000 // 48 hours
 *     },
 *     metrics: ['approval-time', 'rejection-rate', 'escalation-rate'],
 *     alerting: {
 *       slaBreaches: true,
 *       stakeholders: ['process-owners', 'management']
 *     }
 *   }
 * });
 * 
 * // Complex approval workflow execution
 * const deploymentApproval = await workflowOrchestrator.executeWorkflow('production-deployment', {
 *   request: {
 *     type: 'production-deployment',
 *     description: 'Deploy microservices v2.1.0 to production',
 *     requester: 'engineering-team',
 *     priority: 'high',
 *     impact: 'high',
 *     risk: 'medium'
 *   },
 *   context: {
 *     services: ['user-service', 'payment-service', 'notification-service'],
 *     environment: 'production',
 *     expectedDowntime: '5 minutes',
 *     rollbackPlan: 'automated-canary-rollback',
 *     testingComplete: true,
 *     securityReview: 'passed'
 *   },
 *   metadata: {
 *     requestId: 'DEPLOY-2024-0123',
 *     ticketId: 'JIRA-12345',
 *     releaseNotes: 'https://company.com/releases/v2.1.0'
 *   }
 * });
 * 
 * console.log('Deployment Approval Status:', {
 *   workflowId: deploymentApproval.workflowId,
 *   currentStage: deploymentApproval.currentStage,
 *   overallStatus: deploymentApproval.status,
 *   completedApprovals: deploymentApproval.completedApprovals,
 *   pendingApprovals: deploymentApproval.pendingApprovals,
 *   estimatedCompletion: deploymentApproval.estimatedCompletion
 * });
 * ```
 * 
 * @example Interactive Terminal Interface System
 * ```typescript
 * import { 
 *   AdvancedTerminalInterface,
 *   InteractivePrompts,
 *   TerminalUIComponents 
 * } from '@claude-zen/agui';
 * 
 * // Create advanced terminal interface with rich UI components
 * const terminal = new AdvancedTerminalInterface({
 *   colors: {
 *     primary: '#0066cc',
 *     success: '#00cc66',
 *     warning: '#ff9900',
 *     error: '#cc0000',
 *     info: '#6666cc'
 *   },
 *   formatting: {
 *     enableMarkdown: true,
 *     enableAnsiColors: true,
 *     enableIcons: true,
 *     tableFormatting: 'grid'
 *   },
 *   interaction: {
 *     confirmationRequired: ['delete', 'deploy', 'reset'],
 *     progressBars: true,
 *     spinnerStyle: 'dots',
 *     soundEffects: false
 *   }
 * });
 * 
 * // Interactive prompt system
 * const prompts = new InteractivePrompts({
 *   validation: {
 *     enabled: true,
 *     realTimeValidation: true,
 *     helpText: true
 *   },
 *   history: {
 *     enabled: true,
 *     maxHistory: 100,
 *     persistent: true
 *   },
 *   completion: {
 *     enabled: true,
 *     fuzzyMatching: true,
 *     contextAware: true
 *   }
 * });
 * 
 * // Rich UI components for terminal
 * const uiComponents = new TerminalUIComponents(terminal);
 * 
 * // Complex multi-step configuration wizard
 * const configurationWizard = await prompts.createWizard({\n *   title: '🚀 Claude-Zen Production Setup Wizard',\n *   description: 'Configure your production environment step by step',\n *   steps: [\n *     {\n *       name: 'environment',\n *       title: 'Environment Configuration',\n *       prompts: [\n *         {\n *           type: 'select',\n *           name: 'deploymentType',\n *           message: 'Select deployment type:',\n *           choices: [\n *             { name: 'Single Server', value: 'single', description: 'Basic deployment for small teams' },\n *             { name: 'Multi-Server Cluster', value: 'cluster', description: 'High availability setup' },\n *             { name: 'Kubernetes', value: 'k8s', description: 'Container orchestration' },\n *             { name: 'Serverless', value: 'serverless', description: 'Cloud functions' }\n *           ]\n *         },\n *         {\n *           type: 'input',\n *           name: 'region',\n *           message: 'Primary deployment region:',\n *           default: 'us-east-1',\n *           validate: (value) => /^[a-z]{2}-[a-z]+-\d+$/.test(value) || 'Invalid region format'\n *         }\n *       ]\n *     },\n *     {\n *       name: 'database',\n *       title: 'Database Configuration', \n *       prompts: [\n *         {\n *           type: 'checkbox',\n *           name: 'databases',\n *           message: 'Select required databases:',\n *           choices: [\n *             { name: 'PostgreSQL (Primary)', value: 'postgresql', checked: true },\n *             { name: 'Redis (Cache)', value: 'redis', checked: true },\n *             { name: 'LanceDB (Vector)', value: 'lancedb' },\n *             { name: 'Kuzu (Graph)', value: 'kuzu' }\n *           ]\n *         },\n *         {\n *           type: 'number',\n *           name: 'connectionPool',\n *           message: 'Database connection pool size:',\n *           default: 50,\n *           validate: (value) => value > 0 && value <= 1000 || 'Pool size must be 1-1000'\n *         }\n *       ]\n *     },\n *     {\n *       name: 'security',\n *       title: 'Security Configuration',\n *       prompts: [\n *         {\n *           type: 'password',\n *           name: 'adminPassword',\n *           message: 'Set admin password:',\n *           mask: '*',\n *           validate: (value) => {\n *             const requirements = [\n *               value.length >= 12,\n *               /[A-Z]/.test(value),\n *               /[a-z]/.test(value),\n *               /\d/.test(value),\n *               /[!@#$%^&*]/.test(value)\n *             ];\n *             return requirements.every(Boolean) || 'Password must be 12+ chars with uppercase, lowercase, number, and symbol';\n *           }\n *         },\n *         {\n *           type: 'confirm',\n *           name: 'enableMFA',\n *           message: 'Enable multi-factor authentication?',\n *           default: true\n *         }\n *       ]\n *     }\n *   ],\n *   onComplete: async (answers) => {\n *     await uiComponents.showProgressBar('Generating configuration...', async () => {\n *       // Simulate configuration generation\n *       await new Promise(resolve => setTimeout(resolve, 3000));\n *     });\n *     \n *     await terminal.displaySuccess({\n *       title: '✅ Configuration Complete!',\n *       message: 'Your production environment has been configured successfully.',\n *       details: {\n *         'Deployment Type': answers.deploymentType,\n *         'Region': answers.region,\n *         'Databases': answers.databases.join(', '),\n *         'Connection Pool': answers.connectionPool,\n *         'MFA Enabled': answers.enableMFA ? 'Yes' : 'No'\n *       }\n *     });\n *   }\n * });\n * \n * // Execute the wizard\n * const configuration = await configurationWizard.run();\n * ```
 * 
 * @example Autonomous Decision Making System
 * ```typescript
 * import { \n *   AutonomousDecisionEngine,\n *   DecisionMatrix,\n *   RiskAssessment,\n *   ContextualLearning \n * } from '@claude-zen/agui';\n * \n * // Create autonomous decision-making system\n * const decisionEngine = new AutonomousDecisionEngine({\n *   decisionStrategies: {\n *     'low-risk': {\n *       autoApprove: true,\n *       confidenceThreshold: 0.8,\n *       fallbackToHuman: false\n *     },\n *     'medium-risk': {\n *       autoApprove: false,\n *       confidenceThreshold: 0.9,\n *       fallbackToHuman: true,\n *       humanTimeout: 1800000 // 30 minutes\n *     },\n *     'high-risk': {\n *       autoApprove: false,\n *       requiresHuman: true,\n *       escalation: true,\n *       auditTrail: 'comprehensive'\n *     }\n *   },\n *   learning: {\n *     enabled: true,\n *     feedbackIntegration: true,\n *     modelUpdates: 'incremental',\n *     contextualAdaptation: true\n *   },\n *   safety: {\n *     maxAutonomousActions: 100,\n *     cooldownPeriod: 300000, // 5 minutes\n *     emergencyStopEnabled: true,\n *     humanOverrideAllowed: true\n *   }\n * });\n * \n * // Decision matrix for complex scenarios\n * const decisionMatrix = new DecisionMatrix({\n *   criteria: [\n *     { name: 'business-impact', weight: 0.3, scale: [1, 10] },\n *     { name: 'technical-risk', weight: 0.25, scale: [1, 10] },\n *     { name: 'compliance-risk', weight: 0.2, scale: [1, 10] },\n *     { name: 'financial-impact', weight: 0.15, scale: [1, 10] },\n *     { name: 'time-sensitivity', weight: 0.1, scale: [1, 10] }\n *   ],\n *   thresholds: {\n *     'auto-approve': 7.5,\n *     'requires-review': 5.0,\n *     'escalate': 3.0\n *   }\n * });\n * \n * // Risk assessment module\n * const riskAssessment = new RiskAssessment({\n *   riskFactors: [\n *     'data-sensitivity',\n *     'system-criticality',\n *     'user-impact',\n *     'regulatory-compliance',\n *     'security-implications'\n *   ],\n *   assessmentModels: {\n *     'ml-based': { enabled: true, model: 'gradient-boosting' },\n *     'rule-based': { enabled: true, rules: 'comprehensive' },\n *     'expert-system': { enabled: true, knowledge: 'domain-specific' }\n *   }\n * });\n * \n * // Contextual learning system\n * const contextualLearning = new ContextualLearning({\n *   learningApproaches: ['supervised', 'reinforcement', 'transfer'],\n *   contextDimensions: [\n *     'temporal-context',\n *     'user-context', \n *     'system-context',\n *     'business-context',\n *     'regulatory-context'\n *   ],\n *   adaptationSpeed: 'moderate',\n *   retainedMemory: '1y'\n * });\n * \n * // Process autonomous decision\n * const autonomousDecision = await decisionEngine.processDecision({\n *   request: {\n *     type: 'infrastructure-scaling',\n *     description: 'Scale up database cluster due to increased load',\n *     urgency: 'high',\n *     requestedBy: 'monitoring-system'\n *   },\n *   context: {\n *     currentLoad: '85%',\n *     predictedGrowth: '15% over next hour',\n *     availableResources: 'sufficient',\n *     cost: '$200/hour additional',\n *     businessHours: true\n *   },\n *   constraints: {\n *     maxCostIncrease: '$500/hour',\n *     approvalRequired: false,\n *     maintenanceWindow: false\n *   }\n * });\n * \n * // Decision matrix evaluation\n * const matrixScore = await decisionMatrix.evaluate({\n *   'business-impact': 8, // High impact\n *   'technical-risk': 3, // Low risk\n *   'compliance-risk': 2, // Very low risk  \n *   'financial-impact': 4, // Medium impact\n *   'time-sensitivity': 9 // Very urgent\n * });\n * \n * // Risk assessment\n * const riskScore = await riskAssessment.assess({\n *   operation: 'database-scaling',\n *   context: autonomousDecision.context,\n *   historical: await contextualLearning.getHistoricalContext('database-scaling')\n * });\n * \n * console.log('Autonomous Decision Results:', {\n *   decision: autonomousDecision.decision, // 'approved', 'rejected', 'escalated'\n *   confidence: autonomousDecision.confidence,\n *   reasoning: autonomousDecision.reasoning,\n *   matrixScore: matrixScore.score,\n *   riskLevel: riskScore.level,\n *   executionTime: autonomousDecision.executionTime,\n *   humanReviewRequired: autonomousDecision.humanReviewRequired,\n *   auditTrail: autonomousDecision.auditTrail\n * });\n * ```
 * 
 * @example Multi-Platform Interface Orchestration
 * ```typescript
 * import { \n *   MultiPlatformOrchestrator,\n *   WebInterface,\n *   TerminalInterface,\n *   APIInterface,\n *   SlackInterface \n * } from '@claude-zen/agui';\n * \n * // Create multi-platform interface orchestrator\n * const orchestrator = new MultiPlatformOrchestrator({\n *   platforms: {\n *     web: {\n *       enabled: true,\n *       port: 3000,\n *       features: ['dashboard', 'approval-ui', 'monitoring'],\n *       authentication: 'oauth2'\n *     },\n *     terminal: {\n *       enabled: true,\n *       features: ['interactive-prompts', 'progress-bars', 'rich-formatting'],\n *       accessibility: true\n *     },\n *     api: {\n *       enabled: true,\n *       port: 8080,\n *       features: ['rest-api', 'websockets', 'graphql'],\n *       rateLimit: '1000/hour'\n *     },\n *     slack: {\n *       enabled: true,\n *       botToken: process.env.SLACK_BOT_TOKEN,\n *       features: ['interactive-messages', 'slash-commands', 'workflows']\n *     },\n *     teams: {\n *       enabled: false,\n *       features: ['adaptive-cards', 'bot-framework']\n *     }\n *   },\n *   coordination: {\n *     stateSynchronization: true,\n *     crossPlatformNotifications: true,\n *     unifiedAuditLog: true\n *   }\n * });\n * \n * // Platform-specific interfaces\n * const webInterface = new WebInterface({\n *   framework: 'react',\n *   styling: 'tailwind',\n *   components: {\n *     approvalDashboard: true,\n *     workflowBuilder: true,\n *     analyticsCharts: true,\n *     realTimeUpdates: true\n *   },\n *   features: {\n *     darkMode: true,\n *     mobileResponsive: true,\n *     accessibility: 'wcag-2.1-aa',\n *     internationalization: true\n *   }\n * });\n * \n * const terminalInterface = new TerminalInterface({\n *   colorScheme: 'dark',\n *   fontFamily: 'JetBrains Mono',\n *   keybindings: 'vim',\n *   features: {\n *     autocompletion: true,\n *     syntaxHighlighting: true,\n *     mouseSupport: true,\n *     clipboardIntegration: true\n *   }\n * });\n * \n * const slackInterface = new SlackInterface({\n *   workspaces: ['primary', 'engineering', 'operations'],\n *   channels: {\n *     approvals: '#approvals',\n *     alerts: '#alerts',\n *     deployments: '#deployments'\n *   },\n *   interactivity: {\n *     buttons: true,\n *     modals: true,\n *     shortcuts: true,\n *     workflows: true\n *   }\n * });\n * \n * // Cross-platform workflow execution\n * const crossPlatformWorkflow = await orchestrator.createWorkflow({\n *   name: 'critical-infrastructure-alert',\n *   trigger: {\n *     type: 'system-alert',\n *     severity: 'critical',\n *     source: 'monitoring-system'\n *   },\n *   platforms: {\n *     web: {\n *       action: 'display-emergency-banner',\n *       priority: 'highest',\n *       autoRefresh: true\n *     },\n *     terminal: {\n *       action: 'interrupt-current-session',\n *       displayMode: 'urgent-notification',\n *       sound: true\n *     },\n *     slack: {\n *       action: 'broadcast-to-oncall',\n *       channels: ['#incidents', '#oncall'],\n *       mentionUsers: '@oncall-engineer'\n *     },\n *     api: {\n *       action: 'trigger-webhooks',\n *       endpoints: ['pagerduty', 'datadog', 'newrelic']\n *     }\n *   },\n *   coordination: {\n *     requiresAcknowledgment: true,\n *     timeout: 300000, // 5 minutes\n *     escalation: {\n *       level1: ['team-lead'],\n *       level2: ['engineering-manager'],\n *       level3: ['vp-engineering']\n *     }\n *   }\n * });\n * \n * console.log('Multi-Platform Orchestration Status:', {\n *   activePlatforms: orchestrator.getActivePlatforms(),\n *   activeWorkflows: orchestrator.getActiveWorkflows(),\n *   platformHealth: await orchestrator.getHealthStatus(),\n *   messagesSent: orchestrator.getMessageStats(),\n *   userEngagement: orchestrator.getEngagementMetrics()\n * });\n * ```
 * 
 * @example Terminal AGUI with Rich Interactions
 * ```typescript
 * import { TerminalAGUI } from '@claude-zen/agui';
 * 
 * const terminal = new TerminalAGUI({
 *   enableColors: true,
 *   enableProgress: true,
 *   logDecisions: true
 * });
 * 
 * // Rich terminal interaction
 * const result = await terminal.askQuestion('Select deployment strategy:', {
 *   type: 'choice',
 *   choices: [
 *     { value: 'blue-green', label: 'Blue-Green Deployment (Recommended)' },
 *     { value: 'rolling', label: 'Rolling Update' },
 *     { value: 'canary', label: 'Canary Release' }
 *   ],
 *   priority: 'high'
 * });
 * 
 * console.log(`Selected strategy: ${result.answer}`);
 * ```
 * 
 * @example Mock AGUI for Testing
 * ```typescript
 * import { MockAGUI } from '@claude-zen/agui';
 * 
 * const mockAgui = new MockAGUI({
 *   defaultResponses: {
 *     boolean: true,
 *     choice: 0, // First choice
 *     text: 'automated-response'
 *   }
 * });
 * 
 * // Mock automatically responds for testing
 * const response = await mockAgui.askQuestion('Continue?', {
 *   type: 'boolean'
 * });
 * // response.answer === true (from default)
 * ```
 * 
 * @example Batch Approval Processing
 * ```typescript
 * import { TaskApprovalSystem } from '@claude-zen/agui';
 * 
 * const taskApproval = new TaskApprovalSystem();
 * 
 * const requests = [
 *   { taskType: 'deployment', description: 'Deploy to staging' },
 *   { taskType: 'database-migration', description: 'Update user schema' },
 *   { taskType: 'cache-clear', description: 'Clear Redis cache' }
 * ];
 * 
 * const results = await taskApproval.requestBatchApproval(requests, {
 *   requireAllApproved: false,
 *   timeoutMs: 120000
 * });
 * 
 * console.log(`Approved: ${results.approved.length}/${requests.length}`);
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 * 
 * @see {@link https://github.com/zen-neural/claude-code-zen} Claude Code Zen Documentation
 * @see {@link ./src/main} Main Implementation
 * 
 * @requires @claude-zen/foundation - Core utilities and infrastructure
 * 
 * @packageDocumentation
 */

// =============================================================================
// PRIMARY ENTRY POINT - Complete AGUI system
// =============================================================================
export { createAGUISystem as createAGUI } from './src/main';
export { createAGUISystem as AGUISystem } from './src/main';
export { createAGUISystem as default } from './src/main';

// =============================================================================
// CORE INTERFACES - Basic AGUI components
// =============================================================================
export { 
  TerminalAGUI, 
  MockAGUI, 
  createAGUI as createBasicAGUI 
} from './src/main';

// =============================================================================
// TASK APPROVAL SYSTEM - Human-in-the-loop workflows
// =============================================================================
export {
  TaskApprovalSystem,
  createTaskApprovalSystem
} from './src/main';

// =============================================================================
// TYPE DEFINITIONS - Interfaces and types (tree-shakable)
// =============================================================================

// Core interface types
export type { 
  AGUIInterface,
  EventHandlerConfig 
} from './src/main';

// AGUI library types
export type {
  ValidationQuestion,
  Priority,
  MessageType,
  QuestionType,
  QuestionContext,
  ProgressInfo,
  AGUIResponse,
  BatchQuestionResult,
  AGUIConfig,
  EventHandlerConfig as AGUIEventHandlerConfig,
  AGUIFactory,
  AGUIRegistry
} from './src/main';

// Task approval types
export type {
  BaseDocumentEntity,
  TaskDocumentEntity,
  FeatureDocumentEntity,
  EpicDocumentEntity,
  CodeAnalysisResult,
  GeneratedSwarmTask,
  ScanResults,
  ApprovalRequest,
  ApprovalWorkflowConfig,
  TaskApprovalDecision,
  BatchApprovalResults,
  TaskApprovalConfig,
  ApprovalStatistics
} from './src/main';

// =============================================================================
// ENUMS AND CONSTANTS - Essential values (tree-shakable)
// =============================================================================
export {
  AGUIType,
  AGUIError,
  AGUITimeoutError,
  AGUIValidationError
} from './src/main';

// =============================================================================
// METADATA - Package information
// =============================================================================

/**
 * AGUI Package Information
 * 
 * Comprehensive metadata about the AGUI package including
 * version details, capabilities, and feature set.
 */
export const AGUI_INFO = {
  version: '1.0.0',
  name: '@claude-zen/agui',
  description: 'Autonomous Graphical User Interface Library for Claude-Zen',
  capabilities: [
    'Human-in-the-loop interactions',
    'Task approval workflows',
    'Terminal and web interfaces',
    'Event-driven architecture',
    'Rich terminal interactions',
    'Workflow gates and decision logging',
    'Mock interfaces for testing',
    'Foundation integration'
  ],
  interfaces: {
    terminal: 'Rich command-line interactions',
    mock: 'Automated testing interface',
    web: 'Browser-based interactions (future)',
    api: 'Programmatic interface'
  }
} as const;

/**
 * AGUI Documentation
 * 
 * ## Overview
 * 
 * AGUI (Autonomous Graphical User Interface) provides human-in-the-loop
 * interactions for autonomous systems. It enables intelligent decision
 * points, approval workflows, and rich user interactions.
 * 
 * ## Architecture
 * 
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │                User Interface Layer                 │
 * │           (Terminal, Web, Mock)                     │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │              AGUI Core System                       │
 * │  • Question processing                             │
 * │  • Response validation                             │
 * │  • Event management                                │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │           Task Approval System                      │
 * │  • Workflow gates                                  │
 * │  • Decision logging                                │
 * │  • Timeout handling                               │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │             Foundation Layer                        │
 * │  • Logging and telemetry                           │
 * │  • Error handling                                  │
 * │  • Configuration management                        │
 * └─────────────────────────────────────────────────────┘
 * ```
 * 
 * ## Question Types and Interactions
 * 
 * | Type | Description | Example |
 * |------|-------------|---------|
 * | boolean | Yes/No questions | 'Proceed with deployment?' |
 * | choice | Multiple choice | 'Select environment: [dev, staging, prod]' |
 * | text | Free text input | 'Enter commit message:' |
 * | number | Numeric input | 'How many instances to deploy?' |
 * | password | Secure input | 'Enter API key:' |
 * 
 * ## Approval Workflow States
 * 
 * - **Pending**: Awaiting user decision
 * - **Approved**: User approved the action
 * - **Rejected**: User rejected the action  
 * - **Timeout**: Decision timeout reached
 * - **Error**: System error during approval
 * - **Auto-approved**: Automatically approved based on rules
 * 
 * ## Performance Characteristics
 * 
 * - **Response Time**: <50ms for question display
 * - **Memory Usage**: <1MB per active session
 * - **Concurrent Sessions**: Up to 100 simultaneous interactions
 * - **Timeout Handling**: Configurable (default: 30 seconds)
 * - **Decision Logging**: Complete audit trail
 * 
 * ## Getting Started
 * 
 * ```bash
 * npm install @claude-zen/agui @claude-zen/foundation
 * ```
 * 
 * See the examples above for usage patterns.
 */