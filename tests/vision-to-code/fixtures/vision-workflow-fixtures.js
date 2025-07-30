/**
 * Vision Workflow Test Fixtures;
 * Comprehensive test data for Vision-to-Code integration tests;
 */

import { v4 as uuidv4 } from 'uuid';

// Vision workflow stages
export const WORKFLOW_STAGES = {
  VISION_CREATED: 'vision_created',;
WORKFLOW_REGISTERED: 'workflow_registered',;
AGENTS_ASSIGNED: 'agents_assigned',;
IMPLEMENTATION_STARTED: 'implementation_started',;
CODE_GENERATED: 'code_generated',;
TESTING_COMPLETE: 'testing_complete',;
DEPLOYMENT_READY: 'deployment_ready',;
COMPLETED: 'completed',;
}
// Service URLs for integration testing
export const SERVICE_URLS = {
  BUSINESS: process.env.BUSINESS_SERVICE_URL ?? 'http://localhost:4102',
  CORE: process.env.CORE_SERVICE_URL ?? 'http://localhost:4105',
  SWARM: process.env.SWARM_SERVICE_URL ?? 'http://localhost:4108',
  DEVELOPMENT: process.env.DEVELOPMENT_SERVICE_URL ?? 'http://localhost:4103',
};
// Mock vision data for different complexity levels
export const mockVisions = {
  simple: {
    id: 'vision_simple_001',;
title: 'Simple Landing Page',;
description: 'Create a responsive landing page with hero section, features, and contact form',;
stakeholder: 'product_team',;
priority: 'medium',;
complexity: 'simple',;
{
  technical: ['Responsive design', 'Contact form validation', 'Mobile-first approach'],;
  business: ['Lead generation', 'Brand awareness', 'Fast loading times'],;
  design: ['Modern UI', 'Clean typography', 'Accessible color scheme'],;
}
,
{
  deadline: '2024-02-01',;
  budget: 5000,;
  technology: ['React', 'TypeScript', 'Tailwind CSS'],;
}
,
{
  conversion_rate_target: 0.05,;
  bounce_rate_target: 0.3,;
  load_time_target: 2.0,;
}
,
},
{
  id: 'vision_medium_001',;
  title: 'E-commerce Dashboard',;
  description:;
  'Admin dashboard for e-commerce platform with analytics, inventory management, and order processing',;
  stakeholder: 'business_team',;
  priority: 'high',;
  complexity: 'medium',;
  technical: [;
        'Real-time data updates',;
        'Chart visualizations',;
        'Data export functionality',
        'Role-based access control',;
      ],;
  business: [;
        'Inventory tracking',;
        'Sales analytics',;
        'Order management',;
        'Performance monitoring',;
      ],;
  design: ['Data-dense layouts', 'Interactive charts', 'Consistent navigation'],;
  ,
  deadline: '2024-03-15',
  budget: 25000,
  technology: ['React', 'TypeScript', 'Next.js', 'Prisma', 'PostgreSQL'],
  ,
  efficiency_improvement: 0.4,
  error_reduction: 0.6,
  processing_time_reduction: 0.5,
  ,
}
,
{
  id: 'vision_complex_001',;
  title: 'Multi-tenant SaaS Platform',;
  description:;
  'Complete SaaS platform with tenant isolation, billing, API gateway, and unified architecture',;
  stakeholder: 'engineering_team',;
  priority: 'critical',;
  complexity: 'complex',;
  technical: [;
        'Multi-tenant architecture',;
        'API rate limiting',;
        'Automated scaling',;
        'Monitoring and alerting',;
        'Data encryption',;
        'Backup and recovery',;
      ],;
  business: [;
        'Subscription management',;
        'Usage tracking',;
        'Custom branding per tenant',;
        'Integration marketplace',;
      ],;
  design: ['Customizable themes', 'White-label options', 'Responsive admin panel'],;
  ,
  deadline: '2024-06-30',
  budget: 100000,
  technology: ['React', 'Node.js', 'Kubernetes', 'PostgreSQL', 'Redis', 'Docker'],
  ,
  revenue_target: 500000,
  churn_rate_target: 0.05,
  mrr_growth_target: 0.2,
  ,
}
,
}
// Mock stakeholder approval workflows
export const mockStakeholders = {
  product_team: {
    id: 'stakeholder_product',;
name: 'Product Team',;
email: 'product@company.com',;
approval_threshold: 'medium',;
notification_preferences: ['email', 'slack'],;
},
{
  id: 'stakeholder_business',;
  name: 'Business Team',;
  email: 'business@company.com',;
  approval_threshold: 'high',;
  notification_preferences: ['email'],;
}
,
{
  id: 'stakeholder_engineering',;
  name: 'Engineering Team',;
  email: 'engineering@company.com',;
  approval_threshold: 'critical',;
  notification_preferences: ['slack', 'email', 'dashboard'],;
}
,
}
// Mock agent configurations
export const mockAgentConfigurations = {
  simple_workflow: {
    agents: [;
      {
        type: 'frontend_developer',;
        capabilities: ['react', 'typescript', 'css'],;
        priority: 'high',;
      },;
      {
        type: 'ui_designer',;
        capabilities: ['figma', 'responsive_design', 'accessibility'],;
        priority: 'medium',;
      },;
    ],;
{
  topology: 'hierarchical',;
  queen_agent: true,;
  max_parallel_tasks: 3,;
}
,
},
{
  agents: [;
      {
        type: 'full_stack_developer',;
        capabilities: ['react', 'nodejs', 'postgresql', 'apis'],;
        priority: 'high',;
      },;
      {
        type: 'data_engineer',;
        capabilities: ['sql', 'analytics', 'etl'],;
        priority: 'high',;
      },;
      {
        type: 'devops_engineer',;
        capabilities: ['docker', 'ci_cd', 'monitoring'],;
        priority: 'medium',;
      },;
      {
        type: 'qa_engineer',;
        capabilities: ['testing', 'automation', 'security'],;
        priority: 'medium',;
      },;
    ],;
  topology: 'mesh',;
  queen_agent: true,;
  max_parallel_tasks: 6,;
  ,
}
,
{
  agents: [;
      {
        type: 'solutions_architect',;
        capabilities: ['microservices', 'scalability', 'security'],;
        priority: 'critical',;
      },;
      {
        type: 'backend_developer',;
        capabilities: ['nodejs', 'postgresql', 'redis', 'apis'],;
        priority: 'high',;
      },;
      {
        type: 'frontend_developer',;
        capabilities: ['react', 'typescript', 'state_management'],;
        priority: 'high',;
      },;
      {
        type: 'devops_engineer',;
        capabilities: ['kubernetes', 'docker', 'monitoring', 'ci_cd'],;
        priority: 'high',;
      },;
      {
        type: 'security_engineer',;
        capabilities: ['encryption', 'auth', 'compliance'],;
        priority: 'high',;
      },;
      {
        type: 'qa_engineer',;
        capabilities: ['testing', 'automation', 'performance'],;
        priority: 'medium',;
      },;
    ],;
  topology: 'hierarchical',;
  queen_agent: true,;
  max_parallel_tasks: 12,;
  ,
}
,
}
// Mock workflow events for testing event flow
export const mockWorkflowEvents = {
  vision_created: {
    event: 'vision.created',;
{
  vision_id: 'vision_simple_001',;
  stakeholder: 'product_team',;
  timestamp: new Date().toISOString(),;
}
,
},
{
  event: 'workflow.registered',;
  workflow_id: 'workflow_001',;
  vision_id: 'vision_simple_001',;
  estimated_duration: '2 weeks',;
  timestamp: new Date().toISOString(),;
  ,
}
,
{
  event: 'agents.spawned',;
  workflow_id: 'workflow_001',;
  agents: ['agent_001', 'agent_002'],;
  queen_agent: 'queen_001',;
  timestamp: new Date().toISOString(),;
  ,
}
,
{
  event: 'implementation.started',;
  workflow_id: 'workflow_001',;
  development_session_id: 'dev_session_001',;
  repository_url: 'https://github.com/company/project-001', timestamp;
  : new Date().toISOString(),
  ,
}
,
}
// Performance benchmarks for different workflow types
export const performanceBenchmarks = {
  simple_workflow: {
    max_duration_minutes: 30,;
expected_duration_minutes: 15,;
max_memory_mb: 512,;
max_cpu_percent: 70,;
},
{
  max_duration_minutes: 120,;
  expected_duration_minutes: 60,;
  max_memory_mb: 1024,;
  max_cpu_percent: 80,;
}
,
{
  max_duration_minutes: 480,;
  expected_duration_minutes: 240,;
  max_memory_mb: 2048,;
  max_cpu_percent: 85,;
}
,
}
// Error scenarios for resilience testing
export const errorScenarios = {
  service_unavailable: {
    type: 'service_error',;
service: 'development',;
error: 'SERVICE_UNAVAILABLE',;
expected_recovery: 'circuit_breaker_activation',;
},
{
  type: 'timeout_error',;
  service: 'swarm',;
  timeout_seconds: 30,;
  expected_recovery: 'retry_with_backoff',;
}
,
{
  type: 'validation_error',;
  field: 'requirements',;
  error: 'MISSING_REQUIRED_FIELD',;
  expected_recovery: 'user_notification',;
}
,
{
  type: 'resource_error',;
  resource: 'memory',;
  threshold: '90%',;
  expected_recovery: 'graceful_degradation',;
}
,
}
// API response templates
export const apiResponseTemplates = {
  success: (_data) => ({
    status: 'success',;
data,;
timestamp: new Date().toISOString(),;
requestId: uuidv4(),;
}),
error: (error, code = 'INTERNAL_ERROR') => (
{
  status: 'error',;
  code,;
  message: error,;
  timestamp: new Date().toISOString(),;
  ,
requestId: uuidv4(),
}
),
partial: (data, warnings = []) => (
{
  status: 'partial',;
  data,;
  warnings,;
  timestamp: new Date().toISOString(),;
  requestId: uuidv4(),;
}
),
}
// Test helper functions
export const testHelpers = {
  createVisionWorkflow: (complexity = 'simple') => ({
    ...mockVisions[complexity],;
id: `vision_${complexity}_${Date.now()}`,;
created_at: new Date().toISOString(),;
}),
createWorkflowEvents: (workflowId) =>
Object.values(mockWorkflowEvents).map((event) => (
{
  ...event,
  ...event.data,
  workflow_id: workflowId,
  timestamp: new Date().toISOString(),
  ,
}
)),
generateApiKey: () => `sk_test_$
{
  Math.random().toString(36).substr(2, 24);
}
`,
;
waitForEvent: (eventName, timeout = 5000) =>;
new Promise((resolve, reject) => {
      const _timer = setTimeout(;
        () => reject(new Error(`;
Timeout;
waiting;
for ${eventName}`)),;
        timeout;
      );
      // In real implementation, this would listen for actual events
      setTimeout(() => {
        clearTimeout(timer);
        resolve({ event: eventName, timestamp: new Date().toISOString() });
      }, Math.random() * 1000);
    }),;
}
export default testHelpers;
