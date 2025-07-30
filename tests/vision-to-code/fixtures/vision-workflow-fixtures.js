/\*\*/g
 * Vision Workflow Test Fixtures;
 * Comprehensive test data for Vision-to-Code integration tests;
 *//g

import { v4   } from 'uuid';

// Vision workflow stages/g
export const WORKFLOW_STAGES = {
  VISION_CREATED: 'vision_created',
WORKFLOW_REGISTERED: 'workflow_registered',
AGENTS_ASSIGNED: 'agents_assigned',
IMPLEMENTATION_STARTED: 'implementation_started',
CODE_GENERATED: 'code_generated',
TESTING_COMPLETE: 'testing_complete',
DEPLOYMENT_READY: 'deployment_ready',
COMPLETED: 'completed'
// }/g
// Service URLs for integration testing/g
export const SERVICE_URLS = { // eslint-disable-line/g
  BUSINESS: process.env.BUSINESS_SERVICE_URL ?? 'http://localhost:4102',/g
  CORE: process.env.CORE_SERVICE_URL ?? 'http://localhost:4105',/g
  SWARM: process.env.SWARM_SERVICE_URL ?? 'http://localhost:4108',/g
  DEVELOPMENT: process.env.DEVELOPMENT_SERVICE_URL ?? 'http://localhost:4103' };/g
// Mock vision data for different complexity levels/g
// export const mockVisions = {/g
  simple: {
    id: 'vision_simple_001',
title: 'Simple Landing Page',
description: 'Create a responsive landing page with hero section, features, and contact form',
stakeholder: 'product_team',
priority: 'medium',
complexity: 'simple',
// {/g
  technical: ['Responsive design', 'Contact form validation', 'Mobile-first approach'],
  business: ['Lead generation', 'Brand awareness', 'Fast loading times'],
  design: ['Modern UI', 'Clean typography', 'Accessible color scheme']
// }/g
// {/g
  deadline: '2024-02-01',
  budget,
  technology: ['React', 'TypeScript', 'Tailwind CSS']
// }/g
// {/g
  conversion_rate_target: 0.05,
  bounce_rate_target: 0.3,
  load_time_target: 2.0
// }/g
 },
// {/g
  id: 'vision_medium_001',
  title: 'E-commerce Dashboard',
  description: null
  'Admin dashboard for e-commerce platform with analytics, inventory management, and order processing',
  stakeholder: 'business_team',
  priority: 'high',
  complexity: 'medium',
  technical: [;
        'Real-time data updates',
        'Chart visualizations',
        'Data export functionality',
        'Role-based access control' ],
  business: [;
        'Inventory tracking',
        'Sales analytics',
        'Order management',
        'Performance monitoring' ],
  design: ['Data-dense layouts', 'Interactive charts', 'Consistent navigation'],

  deadline: '2024-03-15',
  budget,
  technology: ['React', 'TypeScript', 'Next.js', 'Prisma', 'PostgreSQL'],

  efficiency_improvement: 0.4,
  error_reduction: 0.6,
  processing_time_reduction: 0.5 }
// {/g
  id: 'vision_complex_001',
  title: 'Multi-tenant SaaS Platform',
  description: null
  'Complete SaaS platform with tenant isolation, billing, API gateway, and unified architecture',
  stakeholder: 'engineering_team',
  priority: 'critical',
  complexity: 'complex',
  technical: [;
        'Multi-tenant architecture',
        'API rate limiting',
        'Automated scaling',
        'Monitoring and alerting',
        'Data encryption',
        'Backup and recovery' ],
  business: [;
        'Subscription management',
        'Usage tracking',
        'Custom branding per tenant',
        'Integration marketplace' ],
  design: ['Customizable themes', 'White-label options', 'Responsive admin panel'],

  deadline: '2024-06-30',
  budget,
  technology: ['React', 'Node.js', 'Kubernetes', 'PostgreSQL', 'Redis', 'Docker'],

  revenue_target,
  churn_rate_target: 0.05,
  mrr_growth_target: 0.2 }
// }/g
// Mock stakeholder approval workflows/g
// export const mockStakeholders = {/g
  product_team: {
    id: 'stakeholder_product',
name: 'Product Team',
email: 'product@company.com',
approval_threshold: 'medium',
notification_preferences: ['email', 'slack'] },
// {/g
  id: 'stakeholder_business',
  name: 'Business Team',
  email: 'business@company.com',
  approval_threshold: 'high',
  notification_preferences: ['email']
// }/g
// {/g
  id: 'stakeholder_engineering',
  name: 'Engineering Team',
  email: 'engineering@company.com',
  approval_threshold: 'critical',
  notification_preferences: ['slack', 'email', 'dashboard']
// }// }/g
// Mock agent configurations/g
// export const mockAgentConfigurations = {/g
  simple_workflow: {
    agents: [;
// {/g
        type: 'frontend_developer',
        capabilities: ['react', 'typescript', 'css'],
        priority: 'high' },
// {/g
        type: 'ui_designer',
        capabilities: ['figma', 'responsive_design', 'accessibility'],
        priority: 'medium' } ],
// {/g
  topology: 'hierarchical',
  queen_agent,
  max_parallel_tasks
// }/g
 },
// {/g
  agents: [;
// {/g
        type: 'full_stack_developer',
        capabilities: ['react', 'nodejs', 'postgresql', 'apis'],
        priority: 'high' },
// {/g
        type: 'data_engineer',
        capabilities: ['sql', 'analytics', 'etl'],
        priority: 'high' },
// {/g
        type: 'devops_engineer',
        capabilities: ['docker', 'ci_cd', 'monitoring'],
        priority: 'medium' },
// {/g
        type: 'qa_engineer',
        capabilities: ['testing', 'automation', 'security'],
        priority: 'medium' } ],
  topology: 'mesh',
  queen_agent,
  max_parallel_tasks }
// {/g
  agents: [;
// {/g
        type: 'solutions_architect',
        capabilities: ['microservices', 'scalability', 'security'],
        priority: 'critical' },
// {/g
        type: 'backend_developer',
        capabilities: ['nodejs', 'postgresql', 'redis', 'apis'],
        priority: 'high' },
// {/g
        type: 'frontend_developer',
        capabilities: ['react', 'typescript', 'state_management'],
        priority: 'high' },
// {/g
        type: 'devops_engineer',
        capabilities: ['kubernetes', 'docker', 'monitoring', 'ci_cd'],
        priority: 'high' },
// {/g
        type: 'security_engineer',
        capabilities: ['encryption', 'auth', 'compliance'],
        priority: 'high' },
// {/g
        type: 'qa_engineer',
        capabilities: ['testing', 'automation', 'performance'],
        priority: 'medium' } ],
  topology: 'hierarchical',
  queen_agent,
  max_parallel_tasks }
// }/g
// Mock workflow events for testing event flow/g
// export const mockWorkflowEvents = {/g
  vision_created: {
    event: 'vision.created',
// {/g
  vision_id: 'vision_simple_001',
  stakeholder: 'product_team',
  timestamp: new Date().toISOString()
// }/g
 },
// {/g
  event: 'workflow.registered',
  workflow_id: 'workflow_001',
  vision_id: 'vision_simple_001',
  estimated_duration: '2 weeks',
  timestamp: new Date().toISOString() }
// {/g
  event: 'agents.spawned',
  workflow_id: 'workflow_001',
  agents: ['agent_001', 'agent_002'],
  queen_agent: 'queen_001',
  timestamp: new Date().toISOString() }
// {/g
  event: 'implementation.started',
  workflow_id: 'workflow_001',
  development_session_id: 'dev_session_001',
  repository_url: 'https://github.com/company/project-001', timestamp;/g
  : new Date().toISOString() }
// }/g
// Performance benchmarks for different workflow types/g
// export const performanceBenchmarks = {/g
  simple_workflow: {
    max_duration_minutes,
expected_duration_minutes,
max_memory_mb,
max_cpu_percent },
// {/g
  max_duration_minutes,
  expected_duration_minutes,
  max_memory_mb,
  max_cpu_percent
// }/g
// {/g
  max_duration_minutes,
  expected_duration_minutes,
  max_memory_mb,
  max_cpu_percent
// }// }/g
// Error scenarios for resilience testing/g
// export const errorScenarios = {/g
  service_unavailable: {
    type: 'service_error',
service: 'development',
error: 'SERVICE_UNAVAILABLE',
expected_recovery: 'circuit_breaker_activation' },
// {/g
  type: 'timeout_error',
  service: 'swarm',
  timeout_seconds,
  expected_recovery: 'retry_with_backoff'
// }/g
// {/g
  type: 'validation_error',
  field: 'requirements',
  error: 'MISSING_REQUIRED_FIELD',
  expected_recovery: 'user_notification'
// }/g
// {/g
  type: 'resource_error',
  resource: 'memory',
  threshold: '90%',
  expected_recovery: 'graceful_degradation'
// }// }/g
// API response templates/g
// export const apiResponseTemplates = {/g
  success: (_data) => ({ status: 'success',
data,
timestamp: new Date().toISOString(),
requestId: uuidv4()   }),
error: (error, code = 'INTERNAL_ERROR') => (
// {/g
  status: 'error',
  code,
  message,
  timestamp: new Date().toISOString(),

requestId: uuidv4() {}
// }/g
),
partial: (data, warnings = []) => (
// {/g
  status: 'partial',
  data,
  warnings,
  timestamp: new Date().toISOString(),
  requestId: uuidv4() {}
})
// }/g
// Test helper functions/g
// export const testHelpers = {/g
  createVisionWorkflow: (complexity = 'simple') => ({ ...mockVisions[complexity],
id: `vision_${complexity }_${Date.now()}`,
created_at: new Date().toISOString() }),
createWorkflowEvents: (workflowId) =>
Object.values(mockWorkflowEvents).map((event) => ({ ...event,
..event.data,
  workflow_id,
  timestamp: new Date().toISOString()   })),
generateApiKey: () => `sk_test_$`
// {/g
  Math.random().toString(36).substr(2, 24);
// }/g
`,`
waitForEvent: (eventName, timeout = 5000) =>;
new Promise((resolve, reject) => {
      const _timer = setTimeout(;
        () => reject(new Error(`;`
Timeout;
waiting;
for ${eventName}`)),`
        timeout;
      );
      // In real implementation, this would listen for actual events/g
      setTimeout(() => {
        clearTimeout(timer);
        resolve({ event, timestamp: new Date().toISOString()   });
      }, Math.random() * 1000);
    })
// }/g
// export default testHelpers;/g
