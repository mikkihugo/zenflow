/**
 * Mock Business Service for Integration Testing;
 * Provides realistic API responses for testing without real service;
 */
const _express = require('express');
const _cors = require('cors');
const {
  mockVisions,
mockStakeholders,
apiResponseTemplates } = require('../../fixtures/vision-workflow-fixtures')
const _app = express();
const _port = process.argv[2] ?? 4102;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended }));
// Mock data storage
const _mockData = {
  visions: new Map(),
approvals: new Map(),
// {
  total_visions,
  active_workflows,
  completed_projects,
  average_completion_time, // 30 minutes
    success_rate;
  : 0.92,
  total_roi_generated
// }// }
// Request logging middleware
app.use((req, _res, next) =>
// {
  console.warn(`[Mock Business] ${req.method} ${req.path}`);
  next();
})
// Health check endpoint
app.get('/api/health', (_req, res) =>
// {
  res.json(;
  apiResponseTemplates.success({
      service: 'business',
  status: 'healthy',
  version: '1.0.0-mock',
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
})
// )
})
// Authentication endpoints
app.post('/auth/login', (req, res) =>
// {
  const { email, password } = req.body;
  if (email && password) {
    res.json(;
    apiResponseTemplates.success({
        token: `mock_business_token_${Date.now()}`,
    id: 'mock_user_001',
    email,
    name: 'Mock User',
    role: 'admin',

    expires_in
})
  //   )
// }
else
// {
  res;
status(400)
json(apiResponseTemplates.error('Missing email or password', 'INVALID_CREDENTIALS'))
// }
})
app.post('/auth/service-token', (req, res) =>
// {
  const { service_name, permissions } = req.body;
  res.json(;
  apiResponseTemplates.success({
      token: `mock_service_token_${service_name}_${Date.now()}`,
  service_name,
  permissions: permissions  ?? ['read', 'write'],
  expires_in
})
// )
})
// Vision management endpoints
app.post('/api/visions', (req, res) =>
// {
  const _vision = { ...req.body,
  id: req.body.id  ?? `vision_mock_${Date.now() }`,
  status: 'pending_approval',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
// }
mockData.visions.set(vision.id, vision);
mockData.analytics.total_visions++;
// Simulate processing time
setTimeout(;
() => {
      res.status(201).json(apiResponseTemplates.success(vision));
    },
Math.random() * 100 + 50;
) // 50-150ms delay
})
app.get('/api/visions/) =>
// {
  const _vision = mockData.visions.get(req.params.id);
  if (vision) {
    res.json(apiResponseTemplates.success(vision));
  } else {
    res.status(404).json(apiResponseTemplates.error('Vision not found', 'VISION_NOT_FOUND'));
// }
})
app.get('/api/visions', (req, res) =>
// {
  const { page = 1, limit = 10, status, priority } = req.query;
  const _pageNum = parseInt(page);
  const _limitNum = parseInt(limit);
  const _visions = Array.from(mockData.visions.values());
  // Apply filters
  if (status) {
    visions = visions.filter((v) => v.status === status);
// }
  if (priority) {
    visions = visions.filter((v) => v.priority === priority);
// }
  // Pagination
  const _startIndex = (pageNum - 1) * limitNum;
  const _endIndex = startIndex + limitNum;
  const _paginatedVisions = visions.slice(startIndex, endIndex);
  res.json(;
  apiResponseTemplates.success({
      visions,
  page,
  limit,
  total: visions.length,
  totalPages: Math.ceil(visions.length / limitNum)
})
// )
})
app.patch('/api/visions/) =>
// {
  const _vision = mockData.visions.get(req.params.id);
  if (vision) {
    const _updatedVision = { ...vision,
..req.body,
    updated_at: new Date().toISOString()
// }
  mockData.visions.set(req.params.id, updatedVision);
  res.json(apiResponseTemplates.success(updatedVision));
// }
else
// {
  res.status(404).json(apiResponseTemplates.error('Vision not found', 'VISION_NOT_FOUND'));
// }
})
app.delete('/api/visions/) =>
// {
  if (mockData.visions.has(req.params.id)) {
    mockData.visions.delete(req.params.id);
    res.json(apiResponseTemplates.success({ deleted, id: req.params.id }));
  } else {
    res.status(404).json(apiResponseTemplates.error('Vision not found', 'VISION_NOT_FOUND'));
// }
})
// Stakeholder approval endpoints
app.post('/api/visions/) =>
// {
  const _vision = mockData.visions.get(req.params.id);
  if (vision) {
    const _approval = {
      vision_id: req.params.id,
    stakeholder_ids: req.body.stakeholder_ids  ?? [],
    approval_status: 'pending',
    pending_stakeholders: req.body.stakeholder_ids  ?? [],
    approval_deadline: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // 7 days
      submitted_at;
    : new Date().toISOString()
// }
  mockData.approvals.set(req.params.id, approval);
  res.json(apiResponseTemplates.success(approval));
// }
else
// {
  res.status(404).json(apiResponseTemplates.error('Vision not found', 'VISION_NOT_FOUND'));
// }
})
app.post('/api/visions/) =>
// {
  const _approval = mockData.approvals.get(req.params.id);
  const { stakeholder_id, decision, comments } = req.body;
  if (approval) {
    if (decision === 'approved') {
      approval.approval_status = 'approved';
      approval.approved_by = approval.approved_by ?? [];
      approval.approved_by.push(stakeholder_id);
      approval.approval_timestamp = new Date().toISOString();
    } else if (decision === 'rejected') {
      approval.approval_status = 'rejected';
      approval.rejection_reason = comments;
      approval.required_changes = req.body.required_changes ?? [];
// }
    approval.comments = approval.comments ?? [];
    approval.comments.push({
      stakeholder_id,
    decision,
    comments,
    timestamp: new Date().toISOString()
})
  res.json(apiResponseTemplates.success(approval))
// }
else
// {
  res;
status(404)
json(apiResponseTemplates.error('Approval request not found', 'APPROVAL_NOT_FOUND'))
// }
})
// ROI Analysis endpoints
app.post('/api/visions/) =>
// {
  const _vision = mockData.visions.get(req.params.id);
  if (vision) {
    // Mock ROI analysis with realistic values
    const _estimatedRevenue = Math.random() * 1000000 + 100000; // $100K - $1M
    const _implementationCost = Math.random() * 200000 + 50000; // $50K - $250K
    const _roi = ((estimatedRevenue - implementationCost) / implementationCost) * 100;
    const _roiAnalysis = {
      roi_analysis: {
        estimated_revenue: Math.round(estimatedRevenue),
    implementation_cost: Math.round(implementationCost),
    roi_percentage: Math.round(roi * 100) / 100,
    payback_period_months:;
    Math.round((implementationCost / (estimatedRevenue / 12)) * 100) / 100,
    risk_factors: [;
          'Market competition',
          'Technology adoption rate',
          'Implementation complexity' ]
// }
  confidence_score: Math.random() * 0.3 + 0.7, // 70-100%
// }
res.json(apiResponseTemplates.success(roiAnalysis));
} else
// {
  res.status(404).json(apiResponseTemplates.error('Vision not found', 'VISION_NOT_FOUND'));
// }
})
// Analytics endpoints
app.get('/api/analytics/portfolio-metrics', (_req, res) =>
// {
  res.json(apiResponseTemplates.success(mockData.analytics));
})
app.get('/api/visions/) =>
// {
  const _vision = mockData.visions.get(req.params.id);
  if (vision) {
    const _analytics = {
      progress_percentage: Math.random() * 100,
    time_elapsed: Math.random() *
      3600000, // Up to 1 hour
      estimated_completion;
    : new Date(Date.now() + Math.random() * 86400000).toISOString(), // Within 24 hours
      milestone_progress: [
    name: 'Requirements Analysis',
    status: 'completed',
    completion_date: new Date().toISOString(),

    name: 'Design Phase', status
    : 'in_progress', progress ,
    name: 'Implementation', status
    : 'pending' ,
    name: 'Testing', status
    : 'pending'  ],
    agents_assigned: Math.floor(Math.random() * 5) + 1,
    cpu_usage: Math.random() * 80,
    memory_usage: Math.random() * 60 }
  res.json(apiResponseTemplates.success(analytics));
// }
else
// {
  res.status(404).json(apiResponseTemplates.error('Vision not found', 'VISION_NOT_FOUND'));
// }
})
// AI integration endpoints
app.post('/api/ai/analyze-vision', (req, res) =>
// {
  const { vision, analysis_type, include_market_research } = req.body;
  const _aiAnalysis = {
    strategic_insights: [;
      'Market opportunity estimated at $2.5M over 3 years',
      'Competitive advantage through unique feature set',
      'Implementation complexity is moderate' ],
  market_size: '$15M',
  growth_rate: '12%',
  competition_level: 'medium',
  market_trends: ['AI adoption', 'Mobile-first approach'],

  risk_assessment: [
  risk: 'Technical complexity', severity
  : 'medium', mitigation: 'Use proven frameworks' ,
  risk: 'Market competition', severity
  : 'low', mitigation: 'Unique value proposition'  ],
  recommendations: [
  'Prioritize MVP features for faster time-to-market',
  'Consider phased rollout approach',
  'Invest in user experience research' ],
  confidence_score: Math.random() * 0.2 + 0.8, // 80-100%
// }
res.json(apiResponseTemplates.success(aiAnalysis));
})
app.post('/api/ai/generate-roadmap', (req, res) =>
// {
  const { vision, timeline_preferences } = req.body;
  const _roadmap = {
    roadmap: {
      phases: [;
// {
          name: 'Discovery & Planning',
          duration: '2 weeks',
          tasks: ['Requirements analysis', 'Technical architecture', 'Resource planning'] },
// {
          name: 'Development',
          duration: '6 weeks',
          tasks: ['Core implementation', 'Feature development', 'Integration testing'] },
// {
          name: 'Testing & Deployment',
          duration: '2 weeks',
          tasks: ['Quality assurance', 'Performance testing', 'Production deployment'] } ],
  milestones: [;
// {
          name: 'Architecture Complete',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'MVP Ready', date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString() },
// {
          name: 'Production Launch',
          date: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString() } ],
  critical_path: ['Requirements analysis', 'Core implementation', 'Integration testing'],
  estimated_duration: '10 weeks'
// }
alternative_approaches: [
'Agile sprints with 2-week iterations',
'Waterfall approach with detailed upfront planning' ]
// }
res.json(apiResponseTemplates.success(roadmap))
})
// Events endpoint
app.get('/api/events', (req, res) =>
// {
  const { entity_id, event_type, limit = 10 } = req.query;
  // Mock events for testing
  const _events = [
// {
      id: 'event_001',
      event_type: 'vision.created',
      entity_id: entity_id  ?? 'test_vision_001',
      timestamp: new Date().toISOString(),
      data: { vision_id, status: 'created' } },
// {
      id: 'event_002',
      event_type: 'vision.updated',
      entity_id: entity_id  ?? 'test_vision_001',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      data: { vision_id, status: 'updated' } } ];
  res.json(apiResponseTemplates.success({ events: events.slice(0, parseInt(limit)) }));
})
// Error handling middleware
app.use((error, _req, res, _next) =>
// {
  console.error('[Mock Business] Error);
  res.status(500).json(apiResponseTemplates.error('Internal server error', 'INTERNAL_ERROR'));
})
// 404 handler
app.use((_req, res) =>
// {
  res.status(404).json(apiResponseTemplates.error('Endpoint not found', 'NOT_FOUND'));
})
// Start server
app.listen(port, () =>
// {
  console.warn(`Mock Business Service running on port ${port}`);
})
module.exports = app;
